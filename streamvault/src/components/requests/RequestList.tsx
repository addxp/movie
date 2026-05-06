"use client";
import { useState } from "react";
import { Film, Tv, Sword, BookOpen, Trophy, Video, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

interface Request {
  id: string;
  user_id: string;
  title: string;
  type: string;
  description?: string;
  status: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  movie:       <Film size={11} />,
  series:      <Tv size={11} />,
  anime:       <Sword size={11} />,
  book:        <BookOpen size={11} />,
  sport:       <Trophy size={11} />,
  documentary: <Video size={11} />,
};

const TYPE_LABELS: Record<string, string> = {
  movie:       "Filme",
  series:      "Série",
  anime:       "Anime",
  book:        "Livro",
  sport:       "Esporte",
  documentary: "Documentário",
};

const STATUS_CONFIG: Record<string, { style: string; label: string; icon: React.ReactNode }> = {
  pending:  {
    style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    label: "Pendente",
    icon: <Clock size={9} />,
  },
  approved: {
    style: "bg-green-500/10 text-green-400 border-green-500/20",
    label: "Aprovado",
    icon: <CheckCircle size={9} />,
  },
  rejected: {
    style: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Negado",
    icon: <XCircle size={9} />,
  },
  done: {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "Adicionado ✓",
    icon: <Plus size={9} />,
  },
};

const FILTERS = ["all", "movie", "series", "anime", "book", "sport", "documentary"] as const;

export default function RequestList({
  requests,
  myUserId,
}: {
  requests: Request[];
  myUserId: string;
}) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.type === filter);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
          <Film size={22} className="text-white/15" />
        </div>
        <p className="text-white/30 text-sm font-medium">Nenhum pedido ainda.</p>
        <p className="text-white/15 text-xs mt-1">Seja o primeiro a sugerir!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.filter((f) => {
          if (f === "all") return true;
          return requests.some((r) => r.type === f);
        }).map((f) => {
          const count = f === "all" ? requests.length : requests.filter((r) => r.type === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all border " +
                (filter === f
                  ? "bg-[var(--color-red)] text-white border-[var(--color-red)]"
                  : "bg-white/[0.03] text-white/30 border-white/8 hover:text-white/60 hover:border-white/15")
              }
            >
              {f === "all" ? "Todos" : TYPE_LABELS[f]}
              <span
                className={
                  "text-[9px] px-1 py-0.5 rounded-full " +
                  (filter === f ? "bg-white/20 text-white" : "bg-white/5 text-white/25")
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-white/20 text-sm text-center py-8">
            Nenhum pedido nessa categoria.
          </p>
        ) : (
          filtered.map((req) => {
            const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            const ismine = req.user_id === myUserId;

            return (
              <div
                key={req.id}
                className={
                  "group relative bg-[var(--color-card)] rounded-xl p-4 border transition-all hover:border-white/10 " +
                  (ismine
                    ? "border-[var(--color-red)]/25 hover:border-[var(--color-red)]/40"
                    : "border-white/[0.06]")
                }
              >
                {/* Red left accent for own requests */}
                {ismine && (
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[var(--color-red)]/60 rounded-full" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Type + mine badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-white/25 flex items-center">
                        {TYPE_ICONS[req.type]}
                      </span>
                      <span className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">
                        {TYPE_LABELS[req.type] || req.type}
                      </span>
                      {ismine && (
                        <span className="text-[9px] text-[var(--color-red)] bg-[var(--color-red)]/10 px-1.5 py-0.5 rounded font-bold border border-[var(--color-red)]/20">
                          Meu pedido
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-sm font-semibold leading-tight">
                      {req.title}
                    </h3>

                    {/* Description */}
                    {req.description && (
                      <p className="text-white/25 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {req.description}
                      </p>
                    )}

                    {/* Date */}
                    <p className="text-white/15 text-[10px] mt-2">
                      {new Date(req.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span
                      className={
                        "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border " +
                        statusCfg.style
                      }
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}