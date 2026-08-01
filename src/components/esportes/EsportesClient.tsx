"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Clock, Tv, ExternalLink, RefreshCw } from "lucide-react";

interface Embed {
  provider: string;
  quality: string;
  slug: string;
  embed_url: string;
}

interface Evento {
  id: string;
  title: string;
  description: string;
  poster: string;
  time1: string;
  time2: string;
  start_time: string;
  status: string;
  category: string;
  competition: string;
  embeds: Embed[];
}

interface Props {
  eventos: Evento[];
}

export default function EsportesClient({ eventos }: Props) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [eventoAtivo, setEventoAtivo] = useState<Evento | null>(null);
  const [embedAtivo, setEmbedAtivo] = useState<Embed | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categorias = ["todos", ...Array.from(new Set(eventos.map(e => e.category).filter(Boolean)))];

  const eventosFiltrados = eventos.filter(e => {
    const matchFiltro = filtro === "todos" || e.category === filtro;
    const matchBusca = !busca || e.title.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const aoVivo = eventosFiltrados.filter(e => e.status === "live");
  const proximos = eventosFiltrados.filter(e => e.status !== "live");

  const abrirEvento = (evento: Evento) => {
    setEventoAtivo(evento);
    setEmbedAtivo(evento.embeds?.[0] || null);
    setIframeError(false);
    setIframeKey(k => k + 1);
  };

  const fecharEvento = () => {
    setEventoAtivo(null);
    setEmbedAtivo(null);
    setIframeError(false);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
  };

  const trocarEmbed = (embed: Embed) => {
    setEmbedAtivo(embed);
    setIframeError(false);
    setIframeKey(k => k + 1);
  };

  // ✅ Detecta iframe bloqueado: se após 8s não carregou nada, mostra erro
  useEffect(() => {
    if (!embedAtivo) return;
    setIframeError(false);

    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    // Tenta detectar via onLoad: se o iframe carregou mas está vazio (bloqueado),
    // o timer de 8s aciona o fallback
    errorTimerRef.current = setTimeout(() => {
      // Checa se o iframe está inacessível (cross-origin bloqueado)
      try {
        const doc = iframeRef.current?.contentDocument;
        // Se chegou aqui sem erro e doc é null ou vazio = bloqueado
        if (!doc || doc.body?.innerHTML === "") {
          setIframeError(true);
        }
      } catch {
        // SecurityError = cross-origin = provavelmente carregou (normal)
        // Não marca como erro
      }
    }, 8000);

    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [embedAtivo, iframeKey]);

  const abrirExterno = () => {
    if (embedAtivo) window.open(embedAtivo.embed_url, "_blank", "noopener,noreferrer");
  };

  // Próximo embed disponível para fallback automático
  const proximoEmbed = eventoAtivo?.embeds?.find(e => e !== embedAtivo);

  const formatarHora = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  return (
    <>
      {/* Modal do player */}
      {eventoAtivo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-white font-bold text-lg">{eventoAtivo.title}</h2>
              <p className="text-[#888] text-sm">{eventoAtivo.competition}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Abrir em nova aba — sempre funciona mesmo se o iframe bloquear */}
              <button
                onClick={abrirExterno}
                className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                title="Abrir em nova aba"
              >
                <ExternalLink size={14} /> <span className="hidden sm:inline">Nova aba</span>
              </button>
              <button
                onClick={fecharEvento}
                className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black relative">
            {embedAtivo ? (
              <>
                <iframe
                  ref={iframeRef}
                  key={iframeKey}
                  src={embedAtivo.embed_url}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />

                {/* ✅ Overlay de erro — aparece se o iframe for bloqueado */}
                {iframeError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 gap-4">
                    <p className="text-white/60 text-sm text-center px-8">
                      Este canal bloqueou a reprodução incorporada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Tenta o próximo embed automaticamente */}
                      {proximoEmbed && (
                        <button
                          onClick={() => trocarEmbed(proximoEmbed)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                          <RefreshCw size={14} /> Tentar outro canal
                        </button>
                      )}
                      {/* Abre em nova aba — sempre funciona */}
                      <button
                        onClick={abrirExterno}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-red)] hover:bg-red-700 text-white text-sm transition-colors"
                      >
                        <ExternalLink size={14} /> Abrir em nova aba
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/40">Nenhum player disponível</p>
              </div>
            )}
          </div>

          {/* Seletor de embeds */}
          {eventoAtivo.embeds && eventoAtivo.embeds.length > 1 && (
            <div className="flex gap-2 px-6 py-3 border-t border-white/10 overflow-x-auto">
              {eventoAtivo.embeds.map((embed, i) => (
                <button
                  key={i}
                  onClick={() => trocarEmbed(embed)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    embedAtivo === embed
                      ? "bg-[var(--color-red)] text-white"
                      : "bg-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <Tv size={12} className="inline mr-1" />
                  {embed.provider} {embed.quality}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pt-24 px-8 lg:px-16 pb-16">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Ao vivo e próximos</p>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              ESPORTES
            </h1>
          </div>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar evento..."
            className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[#555] text-sm w-52 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filtro === cat ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"
              }`}
            >
              {cat === "todos" ? "Todos" : cat}
            </button>
          ))}
        </div>

        {/* Ao vivo */}
        {aoVivo.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-white font-bold text-lg">Ao Vivo</h2>
              <span className="text-[#555] text-sm">({aoVivo.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {aoVivo.map(evento => (
                <EventoCard key={evento.id} evento={evento} aoVivo onClick={() => abrirEvento(evento)} formatarHora={formatarHora} />
              ))}
            </div>
          </div>
        )}

        {/* Próximos */}
        {proximos.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Próximos Jogos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {proximos.map(evento => (
                <EventoCard key={evento.id} evento={evento} aoVivo={false} onClick={() => abrirEvento(evento)} formatarHora={formatarHora} />
              ))}
            </div>
          </div>
        )}

        {eventosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚽</p>
            <p className="text-[#555]">Nenhum evento encontrado.</p>
          </div>
        )}
      </div>
    </>
  );
}

function EventoCard({ evento, aoVivo, onClick, formatarHora }: {
  evento: Evento;
  aoVivo: boolean;
  onClick: () => void;
  formatarHora: (s: string) => string;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white/[0.03] border border-white/5 hover:border-white/15 rounded-xl overflow-hidden transition-all hover:bg-white/[0.06]"
    >
      <div className="relative aspect-video bg-[#111] overflow-hidden">
        {evento.poster ? (
          <img src={evento.poster} alt={evento.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">⚽</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {evento.time1 && (
            <img src={evento.time1} alt="" className="w-10 h-10 object-contain" onError={e => (e.currentTarget.style.display = "none")} />
          )}
          <div className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">
            {aoVivo ? <span className="text-red-400">● AO VIVO</span> : formatarHora(evento.start_time)}
          </div>
          {evento.time2 && (
            <img src={evento.time2} alt="" className="w-10 h-10 object-contain" onError={e => (e.currentTarget.style.display = "none")} />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Play size={18} fill="black" className="ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">
          {evento.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[#555] text-xs line-clamp-1">{evento.competition}</p>
          {evento.embeds?.length > 0 && (
            <span className="text-[#555] text-[10px] flex items-center gap-1">
              <Tv size={10} /> {evento.embeds.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}