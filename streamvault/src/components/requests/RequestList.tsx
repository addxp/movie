 
"use client";
import { useState } from "react";
import { ThumbsUp, Film, Tv, Sword, BookOpen, Trophy, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  movie: <Film size={12} />,
  series: <Tv size={12} />,
  anime: <Sword size={12} />,
  book: <BookOpen size={12} />,
  sport: <Trophy size={12} />,
  documentary: <Video size={12} />,
};

const TYPE_LABELS: Record<string, string> = {
  movie: "Filme",
  series: "Série",
  anime: "Anime",
  book: "Livro",
  sport: "Esporte",
  documentary: "Documentário",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  done: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Negado",
  done: "Adicionado ✓",
};

export default function RequestList({ requests, myUserId }: { requests: Request[]; myUserId: string }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? requests
    : requests.filter(r => r.type === filter);

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-[#555]">
        <p>Nenhum pedido ainda. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "movie", "series", "anime", "book", "sport"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={"text-xs px-3 py-1.5 rounded-full font-medium transition-all " + (
              filter === f
                ? "bg-[var(--color-red)] text-white"
                : "bg-white/5 text-[#555] hover:text-white hover:bg-white/10"
            )}
          >
            {f === "all" ? "Todos" : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((req) => (
          <div
            key={req.id}
            className={"bg-[var(--color-card)] rounded-xl p-4 border transition-all " + (
              req.user_id === myUserId ? "border-[var(--color-red)]/20" : "border-white/5"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#555]">{TYPE_ICONS[req.type]}</span>
                  <span className="text-[#555] text-[10px] uppercase tracking-wider">
                    {TYPE_LABELS[req.type] || req.type}
                  </span>
                  {req.user_id === myUserId && (
                    <span className="text-[9px] text-[var(--color-red)] bg-[var(--color-red)]/10 px-1.5 py-0.5 rounded">
                      Meu pedido
                    </span>
                  )}
                </div>
                <h3 className="text-white text-sm font-semibold">{req.title}</h3>
                {req.description && (
                  <p className="text-[#555] text-xs mt-1 line-clamp-2">{req.description}</p>
                )}
                <p className="text-[#333] text-[10px] mt-2">
                  {new Date(req.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="flex-shrink-0">
                <span className={"text-[10px] font-bold px-2 py-1 rounded-lg border " + (STATUS_STYLES[req.status] || STATUS_STYLES.pending)}>
                  {STATUS_LABELS[req.status] || "Pendente"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}