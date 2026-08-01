"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/profile-types";

export interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  rating?: number;
  likes: number;
  liked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    userId: "2",
    username: "cinephile_br",
    displayName: "Marina Costa",
    avatar: "M",
    content:
      "Clássico absoluto! Assistia toda semana quando criança. A Pixar estava no seu auge criativo.",
    rating: 9,
    likes: 34,
    liked: false,
    createdAt: "3 horas atrás",
    replies: [
      {
        id: "c1r1",
        userId: "3",
        username: "filmefanatico",
        displayName: "Lucas Ferreira",
        avatar: "L",
        content: "Concordo! A animação era incrível pro ano de 1998.",
        likes: 8,
        liked: false,
        createdAt: "2 horas atrás",
      },
    ],
  },
  {
    id: "c2",
    userId: "3",
    username: "filmefanatico",
    displayName: "Lucas Ferreira",
    avatar: "L",
    content:
      "Os gafanhotos são vilões subestimados. Hopper é genuinamente ameaçador!",
    rating: 8,
    likes: 19,
    liked: true,
    createdAt: "1 dia atrás",
    replies: [],
  },
];

interface MovieCommentsProps {
  movieId: string;
  movieTitle: string;
}

export default function MovieComments({
  movieId,
  movieTitle,
}: MovieCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const comment: Comment = {
        id: `c${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        content: newComment,
        rating: newRating || undefined,
        likes: 0,
        liked: false,
        createdAt: "Agora mesmo",
        replies: [],
      };
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      setNewRating(0);
      setIsSubmitting(false);
    }, 300);
  };

  const handleLike = (commentId: string, isReply = false, parentId?: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: c.replies?.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    liked: !r.liked,
                    likes: r.liked ? r.likes - 1 : r.likes + 1,
                  }
                : r
            ),
          };
        }
        if (c.id === commentId) {
          return {
            ...c,
            liked: !c.liked,
            likes: c.liked ? c.likes - 1 : c.likes + 1,
          };
        }
        return c;
      })
    );
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: `r${Date.now()}`,
                  userId: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName,
                  avatar: currentUser.avatar,
                  content: replyText,
                  likes: 0,
                  liked: false,
                  createdAt: "Agora mesmo",
                },
              ],
            }
          : c
      )
    );
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black">
          Comentários{" "}
          <span className="text-white/30 font-normal text-lg">
            ({comments.length})
          </span>
        </h2>
      </div>

      {/* Write Comment */}
      <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-sm font-black flex-shrink-0">
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold">{currentUser.displayName}</span>
              {/* Star rating */}
              <div className="flex items-center gap-0.5 ml-2">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() =>
                      setNewRating(newRating === i + 1 ? 0 : i + 1)
                    }
                    className={`text-sm transition-colors ${
                      i < (hoverRating || newRating)
                        ? "text-yellow-400"
                        : "text-white/15 hover:text-white/40"
                    }`}
                  >
                    ★
                  </button>
                ))}
                {(hoverRating || newRating) > 0 && (
                  <span className="text-xs text-white/40 ml-1">
                    {hoverRating || newRating}/10
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Sua opinião sobre ${movieTitle}...`}
              rows={3}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e63946]/40 resize-none transition-colors"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#e63946] text-sm font-bold hover:bg-[#c1121f] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#e63946]/20"
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors">
              <div className="flex gap-3">
                <Link href={`/profile/${comment.username}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-sm font-black flex-shrink-0 hover:scale-105 transition-transform cursor-pointer">
                    {comment.avatar}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Link
                      href={`/profile/${comment.username}`}
                      className="font-semibold text-sm hover:text-[#e63946] transition-colors"
                    >
                      {comment.displayName}
                    </Link>
                    <span className="text-white/30 text-xs">@{comment.username}</span>
                    {comment.rating && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(comment.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">
                            ★
                          </span>
                        ))}
                        <span className="text-white/30 text-xs ml-0.5">
                          {comment.rating}/10
                        </span>
                      </div>
                    )}
                    <span className="text-white/25 text-xs ml-auto">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        comment.liked
                          ? "text-[#e63946]"
                          : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      <span>{comment.liked ? "♥" : "♡"}</span>
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      Responder
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreva uma resposta..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleReply(comment.id);
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#e63946]/40"
                      />
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="px-3 py-2 rounded-xl bg-[#e63946] text-xs font-bold hover:bg-[#c1121f] transition-colors"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 mt-2 space-y-2">
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex gap-3">
                      <Link href={`/profile/${reply.username}`}>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e63946]/70 to-[#c1121f]/70 flex items-center justify-center text-xs font-black flex-shrink-0">
                          {reply.avatar}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${reply.username}`}
                            className="font-semibold text-xs hover:text-[#e63946] transition-colors"
                          >
                            {reply.displayName}
                          </Link>
                          <span className="text-white/25 text-xs">
                            {reply.createdAt}
                          </span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed">
                          {reply.content}
                        </p>
                        <button
                          onClick={() =>
                            handleLike(reply.id, true, comment.id)
                          }
                          className={`flex items-center gap-1 text-xs mt-2 transition-colors ${
                            reply.liked
                              ? "text-[#e63946]"
                              : "text-white/25 hover:text-white/50"
                          }`}
                        >
                          <span>{reply.liked ? "♥" : "♡"}</span>
                          <span>{reply.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}