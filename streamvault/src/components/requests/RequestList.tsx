"use client";
import { useState } from "react";
import { Film, Tv, Sword, BookOpen, Trophy, Video, Clock, CheckCircle, XCircle, Plus, ChevronDown, Shield, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Request {
  id: string;
  user_id: string;
  title: string;
  type: string;
  description?: string;
  admin_note?: string;
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
  pending:  { style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Pendente",     icon: <Clock size={9} /> },
  approved: { style: "bg-green-500/10 text-green-400 border-green-500/20",   label: "Aprovado",     icon: <CheckCircle size={9} /> },
  rejected: { style: "bg-red-500/10 text-red-400 border-red-500/20",         label: "Negado",       icon: <XCircle size={9} /> },
  done:     { style: "bg-blue-500/10 text-blue-400 border-blue-500/20",       label: "Adicionado ✓", icon: <Plus size={9} /> },
};

const STATUSES = ["pending", "approved", "rejected", "done"] as const;
const FILTERS  = ["all", "movie", "series", "anime", "book", "sport", "documentary"] as const;

// ── Painel admin inline ──────────────────────────────────────────────
function AdminPanel({ req, onUpdated }: { req: Request; onUpdated: (updated: Request) => void }) {
  const supabase = createClient();
  const [open, setOpen]     = useState(false);
  const [status, setStatus] = useState(req.status);
  const [note, setNote]     = useState(req.admin_note ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);

  const save = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .update({ status, admin_note: note || null })
      .eq("id", req.id)
      .select()
      .single();

    if (!error && data) {
      onUpdated(data as Request);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[10px] text-[var(--color-red)] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        <Shield size={11} />
        Painel Admin
        <ChevronDown size={11} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Status buttons */}
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={
                      "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all " +
                      (status === s
                        ? cfg.style + " scale-105"
                        : "bg-white/3 text-white/25 border-white/8 hover:border-white/20 hover:text-white/50")
                    }
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Nota para o usuário (opcional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Já está na fila para ser adicionado..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/20 resize-none focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[var(--color-red)] hover:bg-red-600 text-white transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            {saved ? "✓ Salvo!" : loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card de pedido ───────────────────────────────────────────────────
function RequestCard({
  req,
  myUserId,
  isAdmin,
}: {
  req: Request;
  myUserId: string;
  isAdmin: boolean;
}) {
  const [current, setCurrent] = useState(req);
  const statusCfg = STATUS_CONFIG[current.status] || STATUS_CONFIG.pending;
  const ismine = current.user_id === myUserId;

  return (
    <div
      className={
        "relative bg-[var(--color-card)] rounded-xl p-4 border transition-all hover:border-white/10 " +
        (ismine ? "border-[var(--color-red)]/25 hover:border-[var(--color-red)]/40" : "border-white/[0.06]")
      }
    >
      {ismine && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[var(--color-red)]/60 rounded-full" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type + badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-white/25 flex items-center">{TYPE_ICONS[current.type]}</span>
            <span className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">
              {TYPE_LABELS[current.type] || current.type}
            </span>
            {ismine && (
              <span className="text-[9px] text-[var(--color-red)] bg-[var(--color-red)]/10 px-1.5 py-0.5 rounded font-bold border border-[var(--color-red)]/20">
                Meu pedido
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white text-sm font-semibold leading-tight">{current.title}</h3>

          {/* Description */}
          {current.description && (
            <p className="text-white/25 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {current.description}
            </p>
          )}

          {/* Admin note visível para todos */}
          {current.admin_note && (
            <div className="mt-2 flex items-start gap-1.5 bg-white/[0.03] border border-white/8 rounded-lg px-2.5 py-2">
              <Shield size={10} className="text-[var(--color-red)] mt-0.5 flex-shrink-0" />
              <p className="text-white/50 text-[11px] leading-relaxed">{current.admin_note}</p>
            </div>
          )}

          {/* Date */}
          <p className="text-white/15 text-[10px] mt-2">
            {new Date(current.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0 mt-0.5">
          <span className={"flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border " + statusCfg.style}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Admin panel */}
      {isAdmin && <AdminPanel req={current} onUpdated={setCurrent} />}
    </div>
  );
}

// ── Lista principal ──────────────────────────────────────────────────
export default function RequestList({
  requests,
  myUserId,
  isAdmin = false,
}: {
  requests: Request[];
  myUserId: string;
  isAdmin?: boolean;
}) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? requests : requests.filter((r) => r.type === filter);

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
        {FILTERS.filter((f) => f === "all" || requests.some((r) => r.type === f)).map((f) => {
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
              <span className={"text-[9px] px-1 py-0.5 rounded-full " + (filter === f ? "bg-white/20 text-white" : "bg-white/5 text-white/25")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-white/20 text-sm text-center py-8">Nenhum pedido nessa categoria.</p>
        ) : (
          filtered.map((req) => (
            <RequestCard key={req.id} req={req} myUserId={myUserId} isAdmin={isAdmin} />
          ))
        )}
      </div>
    </div>
  );
}