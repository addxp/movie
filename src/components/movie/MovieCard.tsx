"use client";
import { useState } from "react";
import Link from "next/link";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface MovieCardProps { movie: Movie; userId: string; }

const CATEGORY_COLORS: Record<string, string> = {
  Acao:     "#D62839",
  Ficcao:   "#3b82f6",
  Terror:   "#a855f7",
  Comedia:  "#f59e0b",
  Romance:  "#ec4899",
  Animacao: "#10b981",
  Drama:    "#06b6d4",
  Outros:   "#6b7280",
};

const W = 168;
const H = 252; // pôster vertical, 2:3

export default function MovieCard({ movie, userId }: MovieCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const accent  = CATEGORY_COLORS[movie.category ?? ""] ?? "#D62839";
  const isSaved = isFavorited(movie.id);

  return (
    <>
      <style>{`
        .mc { flex-shrink: 0; width: ${W}px; cursor: pointer; }

        .mc-thumb {
          position: relative;
          width: ${W}px;
          height: ${H}px;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1414;
          border: 1px solid var(--border-2);
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .mc:hover .mc-thumb {
          border-color: var(--red-border);
          transform: translateY(-4px);
          box-shadow: 0 16px 30px rgba(0,0,0,0.55);
        }

        .mc-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
          display: block;
          transition: transform 0.4s ease;
        }
        .mc:hover .mc-img { transform: scale(1.05); }

        .mc-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          transition: background 0.2s ease;
        }
        .mc:hover .mc-overlay { background: rgba(12,10,10,0.45); }

        .mc-play {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--red);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.6);
          transition: opacity 0.15s ease, transform 0.2s ease;
          box-shadow: 0 4px 16px var(--red-glow);
        }
        .mc:hover .mc-play { opacity: 1; transform: scale(1); }

        .mc-rating {
          position: absolute; top: 7px; left: 7px;
          font-family: var(--font-mono);
          background: rgba(12,10,10,0.78);
          color: var(--red-2);
          font-size: 10px; font-weight: 600;
          padding: 2.5px 6px; border-radius: 4px;
          display: flex; align-items: center; gap: 2px;
          border: 1px solid var(--red-border);
          backdrop-filter: blur(6px);
        }

        .mc-save {
          position: absolute; top: 7px; right: 7px;
          width: 26px; height: 26px; border-radius: 5px;
          background: rgba(12,10,10,0.75);
          border: 1px solid var(--border-2);
          color: rgba(243,234,218,0.45);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0;
          transition: opacity 0.15s, background 0.15s, color 0.15s;
          backdrop-filter: blur(6px);
        }
        .mc:hover .mc-save { opacity: 1; }
        .mc-save.saved {
          opacity: 1;
          background: var(--red-dim-2);
          border-color: var(--red-border);
          color: var(--red-2);
        }

        .mc-series {
          position: absolute; bottom: 7px; left: 7px;
          background: var(--red);
          color: #fff; font-size: 8px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 2px 6px; border-radius: 3px;
        }

        .mc-meta { margin-top: 9px; padding: 0 1px; }

        .mc-title {
          color: rgba(243,234,218,0.92);
          font-size: 12px; font-weight: 500;
          line-height: 1.35; margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mc-sub { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); flex-wrap: wrap; }
        .mc-year { color: rgba(243,234,218,0.32); font-size: 10px; }
        .mc-dur  { color: rgba(243,234,218,0.24); font-size: 10px; }
        .mc-dot  { width: 2px; height: 2px; border-radius: 50%; background: rgba(243,234,218,0.2); flex-shrink: 0; }
        .mc-cat  {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.03em; text-transform: uppercase;
          padding: 1px 5px; border-radius: 3px;
        }
      `}</style>

      <div className="mc">
        <div className="mc-thumb">
          {!imgError ? (
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="mc-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"32px", opacity:0.06 }}>🎬</span>
            </div>
          )}

          <div className="mc-overlay">
            <Link href={`/movie/${movie.id}`} style={{ textDecoration:"none" }}>
              <div className="mc-play">
                <Play size={13} fill="#fff" strokeWidth={0} style={{ marginLeft:"2px" }} />
              </div>
            </Link>
          </div>

          {movie.rating && (
            <div className="mc-rating">★ {movie.rating.toFixed(1)}</div>
          )}

          <button
            className={`mc-save${isSaved ? " saved" : ""}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
            aria-label={isSaved ? "Remover" : "Salvar"}
          >
            {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
          </button>

          {movie.type === "series" && <div className="mc-series">Série</div>}
        </div>

        <div className="mc-meta">
          <h3 className="mc-title">{movie.title}</h3>
          <div className="mc-sub">
            {movie.release_year && <span className="mc-year">{movie.release_year}</span>}
            {movie.duration && (
              <>
                <span className="mc-dot" />
                <span className="mc-dur">{movie.duration}m</span>
              </>
            )}
            {movie.category && (
              <span className="mc-cat" style={{ color: accent, background: accent + "18" }}>
                {movie.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}