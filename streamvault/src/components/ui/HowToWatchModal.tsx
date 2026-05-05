"use client";
import { useState } from "react";
import { Smartphone, X, ExternalLink } from "lucide-react";

export default function HowToWatchModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10"
      >
        <Smartphone size={16} />
        Como assistir no celular?
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#141414] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Smartphone size={18} className="text-[var(--color-red)]" />
                Como assistir no celular
              </h2>
              <button onClick={() => setOpen(false)} className="text-[#555] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Android */}
              <div>
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">A</span>
                  Android
                </h3>
                <ol className="space-y-2">
                  {[
                    "Abra o Chrome no Android",
                    "Acesse o site normalmente",
                    "O player carrega automaticamente",
                    "Para tela cheia: gire o celular ou toque no ícone",
                    "Instale como app: menu → Adicionar à tela inicial",
                  ].map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-white/70">
                      <span className="text-[var(--color-red)] font-bold flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              {/* iOS */}
              <div>
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">i</span>
                  iPhone / iPad
                </h3>
                <ol className="space-y-2">
                  {[
                    "Abra o Safari",
                    "Acesse o site",
                    "Quando aparecer a tela de servidor, clique no meio e role pra baixo.",
                    "Para tela cheia: toque no ícone de expansão",
                    "Instale como app: compartilhar → Adicionar à Tela de Início",
                  <a href="https://imgur.com/a/6dCLjk1">Ver tutorial em video</a>   
                
                ].map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-white/70">
                      <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Dica */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-yellow-400 text-xs font-bold mb-1">💡 Dica importante</p>
                <p className="text-yellow-400/70 text-xs">
                  Use o navegador <strong>Brave</strong> para bloquear anúncios automaticamente em todos os dispositivos.
                </p>
              </div>

              <a
                href="https://brave.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-4 py-2.5 rounded-xl text-sm transition-all font-medium"
                >
                <ExternalLink size={14} />
                Baixar Brave Browser
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}