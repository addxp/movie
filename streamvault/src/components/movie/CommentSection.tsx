"use client";
import { useState, useTransition } from "react";
import { Star, Send, Trash2, Loader2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string | null } | null;
}

interface Props {
  movieId: string;
  userId: string;
  initialComments: Comment[];
  initialRating: number | null;
  avgRating: number | null;
  totalRatings: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={"transition-transform " + (!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default")}
        >
          <Star
            size={size}
            className={"transition-colors " + (s <= display ? "text-yellow-400" : "text-white/15")}
            fill={s <= display ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export default function CommentSection({
  movieId,
  userId,
  initialComments,
  initialRating,
  avgRating,
  totalRatings,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [comments, setComments]       = useState<Comment[]>(initialComments);
  const [myRating, setMyRating]       = useState(initialRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText]               = useState("");
  const [sending, setSending]         = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingDone, setRatingDone]   = useState(false);

  const initials = (comment: Comment) => {
    const name = comment.profiles?.username || "U";
    return name.slice(0, 2).toUpperCase();
  };

  // Salva avaliação
  const handleRating = async (score: number) => {
    setMyRating(score);
    setSavingRating(true);
    await supabase.from("ratings").upsert(
      { user_id: userId, movie_id: movieId, score },
      { onConflict: "user_id,movie_id" }
    );
    setSavingRating(false);
    setRatingDone(true);
    setTimeout(() => setRatingDone(false), 2000);
    startTransition(() => router.refresh());
  };

  // Envia comentário
  const handleComment = async () => {
    if (!text.trim()) return;
    setSending(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: userId, movie_id: movieId, content: text.trim() })
      .select("id, user_id, content, created_at")
      .single();

    if (!error && data) {
      setComments((prev) => [
        { ...data, profiles: { username: null } },
        ...prev,
      ]);
      setText("");
    }
    setSending(false);
  };

  // Deleta comentário
  const handleDelete = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const displayRating = hoverRating || myRating;

  return (
    <div className="mt-12 border-t border-white/5 pt-10">

      {/* ── Avaliação ── */}
      <div className="mb-10">
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Star size={16} className="text-yellow-400" fill="currentColor" />
          Avaliação
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          {/* Média geral */}
          {avgRating && (
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4">
              <span className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {avgRating.toFixed(1)}
              </span>
              <div>
                <StarRating value={Math.round(avgRating)} readonly size={14} />
                <p className="text-white/25 text-[11px] mt-1">{totalRatings} avaliação{totalRatings !== 1 ? "ões" : ""}</p>
              </div>
            </div>
          )}

          {/* Avaliação do usuário */}
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Sua avaliação</p>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-0.5"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={"transition-colors " + (s <= displayRating ? "text-yellow-400" : "text-white/15")}
                      fill={s <= displayRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              {savingRating && <Loader2 size={14} className="text-white/30 animate-spin" />}
              {ratingDone && <span className="text-green-400 text-xs font-semibold">✓ Salvo!</span>}
            </div>
            {displayRating > 0 && (
              <p className="text-white/25 text-xs">
                {["", "Muito ruim", "Ruim", "Ok", "Bom", "Excelente"][displayRating]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Comentários ── */}
      <div>
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2.5">
          <MessageCircle size={16} className="text-white/40" />
          Comentários
          {comments.length > 0 && (
            <span className="text-[10px] font-bold bg-white/5 text-white/30 px-2 py-0.5 rounded-full border border-white/8">
              {comments.length}
            </span>
          )}
        </h2>

        {/* Input */}
        <div className="flex gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-[var(--color-red)]/20 border border-[var(--color-red)]/30 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-[var(--color-red)] text-[10px] font-black">EU</span>
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que você achou?"
              rows={3}
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 resize-none focus:outline-none transition-colors leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleComment();
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-white/15 text-[11px]">Ctrl+Enter para enviar</p>
              <button
                onClick={handleComment}
                disabled={sending || !text.trim()}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[var(--color-red)] hover:bg-red-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Comentar
              </button>
            </div>
          </div>
        </div>

        {/* Lista */}
        {comments.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MessageCircle size={32} className="text-white/8 mb-3" />
            <p className="text-white/20 text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white/40 text-[10px] font-bold">{initials(comment)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60 text-xs font-semibold">
                      {comment.profiles?.username || `Usuário ${comment.user_id.slice(0, 6)}`}
                    </span>
                    <span className="text-white/15 text-[10px]">
                      {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{comment.content}</p>
                </div>

                {/* Delete (só dono) */}
                {comment.user_id === userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 flex-shrink-0 mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}