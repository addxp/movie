"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, BookmarkPlus, BookmarkCheck, Info, Star, Clock, Calendar, ChevronDown } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface HeroBannerProps { movie: Movie; userId: string; }

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  Acao:     { label: "Ação",      color: "#D62839" },
  Ficcao:   { label: "Ficção",    color: "#3b82f6" },
  Terror:   { label: "Terror",    color: "#a855f7" },
  Comedia:  { label: "Comédia",   color: "#f59e0b" },
  Romance:  { label: "Romance",   color: "#ec4899" },
  Animacao: { label: "Animação",  color: "#10b981" },
  Drama:    { label: "Drama",     color: "#06b6d4" },
  Outros:   { label: "Outros",    color: "#6b7280" },
};

export default function HeroBanner({ movie, userId }: HeroBannerProps) {
  const { isFavorited, toggleFavorite, loading } = useFavorites(userId);
  const [imgError, setImgError]   = useState(false);
  const [posterErr, setPosterErr] = useState(false);
  const [visible, setVisible]     = useState(false);
  const isSaved  = isFavorited(movie.id);
  const catInfo  = CATEGORY_LABELS[movie.category ?? ""] ?? { label: movie.category ?? "", color: "#6b7280" };
  const backdrop = movie.backdrop || movie.thumbnail;
  const poster   = movie.thumbnail;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes sv4h-fade {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv4h-bg {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes sv4h-poster {
          from { opacity: 0; transform: translateX(-24px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        .sv4h-root {
          position: relative;
          width: 100%;
          /* altura total menos a navbar */
          height: calc(100vh - var(--nav-h));
          min-height: 520px;
          max-height: 780px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }

        /* ── Backdrop full-bleed ── */
        .sv4h-bg {
          position: absolute; inset: 0; z-index: 0;
          animation: sv4h-bg 1.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .sv4h-bg img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
        }
        /* gradientes sobre o backdrop */
        .sv4h-bg::after {
          content: '';
          position: absolute; inset: 0;
          background:
            linear-gradient(to top,   var(--bg) 0%, rgba(12,10,10,0.85) 30%, rgba(12,10,10,0.35) 60%, transparent 100%),
            linear-gradient(to right, rgba(12,10,10,0.92) 0%, rgba(12,10,10,0.55) 40%, transparent 75%);
        }

        /* ── Inner layout ── */
        .sv4h-inner {
          position: relative; z-index: 1;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(24px, 6vw, 96px) clamp(40px, 5vw, 72px);
          display: flex;
          align-items: flex-end;
          gap: clamp(24px, 4vw, 56px);
        }

        /* ── Poster ── */
        .sv4h-poster {
          flex-shrink: 0;
          width: clamp(120px, 13vw, 200px);
          aspect-ratio: 2/3;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-shadow:
            0 32px 64px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,255,255,0.1);
          animation: sv4h-poster 0.9s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.1s;
          /* alinha a base do poster com a base do texto */
          align-self: flex-end;
          margin-bottom: 4px;
        }
        .sv4h-poster img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .sv4h-poster::after {
          content: '';
          position: absolute; inset: 0; border-radius: 12px;
          background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 50%);
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
        }

        /* ── Info block ── */
        .sv4h-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
          min-width: 0;
        }

        .sv4h-eyebrow {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
          animation: sv4h-fade 0.7s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.2s;
        }
        .sv4h-cat {
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 20px;
          font-family: var(--font-body);
        }
        .sv4h-type {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-2);
          color: var(--text-3);
          font-family: var(--font-body);
        }

        .sv4h-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 4.5vw, 64px);
          font-weight: 700; font-style: italic;
          line-height: 1.02;
          color: #fff;
          margin-bottom: 16px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          /* trunca em 2 linhas se muito longo */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          animation: sv4h-fade 0.75s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.25s;
        }

        .sv4h-stats {
          display: flex; align-items: center;
          flex-wrap: wrap; gap: 6px;
          margin-bottom: 18px;
          animation: sv4h-fade 0.75s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.3s;
        }
        .sv4h-stat {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500;
          font-family: var(--font-body);
          color: var(--text-2);
          padding: 5px 11px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 6px;
          backdrop-filter: blur(8px);
        }
        .sv4h-stat.star {
          background: var(--red-dim);
          border-color: var(--red-border);
          color: var(--red-2);
          font-weight: 700;
        }

        .sv4h-desc {
          font-size: clamp(12px, 1.2vw, 14px);
          font-weight: 300; line-height: 1.75;
          color: rgba(255,255,255,0.5);
          max-width: 540px;
          margin-bottom: 28px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: var(--font-body);
          animation: sv4h-fade 0.75s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.35s;
        }

        .sv4h-actions {
          display: flex; align-items: center;
          gap: 10px; flex-wrap: wrap;
          animation: sv4h-fade 0.75s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.4s;
        }

        .sv4h-btn-play {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--red); color: #fff;
          font-family: var(--font-body);
          font-size: 13px; font-weight: 600;
          padding: 13px 28px; border-radius: 8px;
          border: none; cursor: pointer;
          letter-spacing: 0.03em; text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden; white-space: nowrap;
        }
        .sv4h-btn-play::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: rgba(255,255,255,0.1); pointer-events: none;
        }
        .sv4h-btn-play:hover {
          background: #ff1f47;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(214,40,57,0.45);
        }
        .sv4h-btn-play:active { transform: none; }

        .sv4h-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.75);
          font-family: var(--font-body);
          font-size: 13px; font-weight: 500;
          padding: 13px 22px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; text-decoration: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          backdrop-filter: blur(8px);
        }
        .sv4h-btn-ghost:hover {
          background: rgba(255,255,255,0.14);
          color: #fff;
          border-color: rgba(255,255,255,0.22);
        }

        .sv4h-btn-icon {
          width: 46px; height: 46px; border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.15s;
          backdrop-filter: blur(8px);
        }
        .sv4h-btn-icon:hover {
          background: rgba(255,255,255,0.14);
          color: #fff;
        }
        .sv4h-btn-icon.saved {
          background: var(--red-dim);
          border-color: var(--red-border);
          color: var(--red-2);
        }

        /* scroll hint */
        .sv4h-scroll-hint {
          position: absolute; bottom: 18px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          z-index: 2; opacity: 0.3;
          animation: sv4h-fade 1s ease both;
          animation-delay: 1s;
        }
        .sv4h-scroll-hint span {
          font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
          color: #fff; font-family: var(--font-body);
        }

        @media (max-width: 560px) {
          .sv4h-poster { display: none; }
          .sv4h-title { font-size: clamp(24px, 8vw, 36px); }
          .sv4h-desc { -webkit-line-clamp: 2; }
        }
      `}</style>

      <section className="sv4h-root">
        {/* Full-bleed backdrop */}
        <div className="sv4h-bg">
          {backdrop && !imgError && (
            <img
              src={backdrop}
              alt=""
              aria-hidden
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* Furos de rolo de filme — assinatura visual, não é decoração sutil */}
        <div className="film-sprockets" style={{ left: 0 }}>
          {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="film-sprockets" style={{ right: 0 }}>
          {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
        </div>

        {/* Fita diagonal de ingresso */}
        <div className="hero-ribbon">Em cartaz</div>

        {/* Content */}
        <div className="sv4h-inner">
          {/* Poster — vertical, alinhado à base */}
          {poster && !posterErr && (
            <div className="sv4h-poster">
              <img
                src={poster}
                alt={movie.title}
                onError={() => setPosterErr(true)}
              />
            </div>
          )}

          {/* Info */}
          <div className="sv4h-info">
            {/* Category + type */}
            <div className="sv4h-eyebrow">
              {movie.category && (
                <span className="sv4h-cat" style={{
                  background: catInfo.color + "1a",
                  border: `1px solid ${catInfo.color}33`,
                  color: catInfo.color,
                }}>
                  {catInfo.label}
                </span>
              )}
              {movie.type === "series" && <span className="sv4h-type">Série</span>}
            </div>

            {/* Title */}
            <h1 className="sv4h-title">{movie.title}</h1>

            {/* Stats row */}
            <div className="sv4h-stats">
              {movie.rating && (
                <span className="sv4h-stat star">
                  <Star size={11} fill="currentColor" strokeWidth={0} />
                  {movie.rating.toFixed(1)}
                </span>
              )}
              {movie.release_year && (
                <span className="sv4h-stat">
                  <Calendar size={11} />
                  {movie.release_year}
                </span>
              )}
              {movie.duration && (
                <span className="sv4h-stat">
                  <Clock size={11} />
                  {movie.duration} min
                </span>
              )}
            </div>

            {/* Description */}
            {movie.description && (
              <p className="sv4h-desc">{movie.description}</p>
            )}

            {/* Actions */}
            <div className="sv4h-actions">
              <Link href={`/movie/${movie.id}`} className="sv4h-btn-play">
                <Play size={15} fill="#fff" strokeWidth={0} />
                Assistir agora
              </Link>
              <Link href={`/movie/${movie.id}`} className="sv4h-btn-ghost">
                <Info size={14} />
                Mais detalhes
              </Link>
              <button
                onClick={() => toggleFavorite(movie.id)}
                disabled={loading}
                className={`sv4h-btn-icon${isSaved ? " saved" : ""}`}
                aria-label={isSaved ? "Remover dos favoritos" : "Salvar nos favoritos"}
              >
                {isSaved ? <BookmarkCheck size={17} /> : <BookmarkPlus size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="sv4h-scroll-hint" aria-hidden>
          <span>rolar</span>
          <ChevronDown size={14} color="#fff" />
        </div>
      </section>
    </>
  );
}