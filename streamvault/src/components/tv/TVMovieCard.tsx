"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Play, Heart } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

const CATEGORY_COLORS: Record<string, string> = {
  Acao:     "#e84545",
  Ficcao:   "#5b8dee",
  Terror:   "#9b59b6",
  Comedia:  "#f39c12",
  Romance:  "#e91e8c",
  Animacao: "#00bcd4",
  Drama:    "#2ecc71",
  Outros:   "#78909c",
};

interface TVMovieCardProps {
  movie: Movie;
  userId: string;
  "data-tv-item"?: string;
}

export default function TVMovieCard({ movie, userId, ...rest }: TVMovieCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const accent = CATEGORY_COLORS[movie.category ?? ""] ?? "#e50914";

  return (
    <Link
      href={`/movie/${movie.id}`}
      // ✅ FIX 1: tabIndex={0} em vez de -1 — permite foco pelo D-pad e Tab
      tabIndex={0}
      {...(rest as Record<string, unknown>)}
      className="tv-card group"
      style={{
        display: "block",
        // ✅ FIX 2: outline none aqui, mas o foco é mostrado via :focus-visible no CSS abaixo
        outline: "none",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#161616",
        flexShrink: 0,
        width: "var(--tv-card-w, 200px)",
        position: "relative",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Poster */}
      <div style={{ position: "relative", aspectRatio: "2/3", background: "#111", overflow: "hidden" }}>
        {!imgError ? (
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            fill
            className="object-cover"
            style={{ transition: "transform 0.4s ease" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "36px", opacity: 0.1 }}>🎬</span>
          </div>
        )}

        {/* Overlay escuro ao focar */}
        <div className="tv-card-overlay" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
          opacity: 0,
          transition: "opacity 0.25s",
        }} />

        {/* Play central */}
        <div className="tv-card-play" style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
          }}>
            <Play size={20} fill="black" style={{ marginLeft: 3 }} />
          </div>
        </div>

        {/* Rating */}
        {movie.rating && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(0,0,0,0.75)", color: "#f5c518",
            fontSize: 12, fontWeight: 700, padding: "3px 7px",
            borderRadius: 4,
          }}>
            ★ {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Serie badge */}
        {movie.type === "series" && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(229,9,20,0.9)", color: "#fff",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "3px 7px", borderRadius: 3,
          }}>
            Série
          </div>
        )}
      </div>

      {/* Info */}
      <div className="tv-card-info" style={{
        padding: "10px 12px 14px",
        opacity: 0,
        transform: "translateY(4px)",
        transition: "opacity 0.2s, transform 0.2s",
      }}>
        <p style={{
          color: "#fff", fontSize: 13, fontWeight: 600,
          lineHeight: 1.3, marginBottom: 5,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {movie.title}
        </p>

        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
          {movie.release_year && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{movie.release_year}</span>
          )}
          {movie.duration && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{movie.duration}m</span>
          )}
        </div>

        {movie.category && (
          <div style={{
            display: "inline-flex", padding: "2px 8px", borderRadius: 3, marginBottom: 10,
            background: accent + "22", border: `1px solid ${accent}40`,
          }}>
            <span style={{ color: accent, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {movie.category}
            </span>
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
          // ✅ FIX 3: tabIndex={-1} no botão interno — o D-pad não precisa focar
          // o botão filho, só o card. Salvar via Enter no card já funciona pelo Link.
          tabIndex={-1}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 5,
            background: isFavorited(movie.id) ? "var(--color-red)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${isFavorited(movie.id) ? "transparent" : "rgba(255,255,255,0.1)"}`,
            color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Heart size={11} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
          {isFavorited(movie.id) ? "Salvo" : "Salvar"}
        </button>
      </div>

      {/*
        ✅ FIX 4: ID único no seletor CSS para não vazar para outros componentes.
        Usa :focus e :focus-visible para cobrir tanto TV (que usa .focus())
        quanto teclado/mouse.
      */}
      <style>{`
        .tv-card:focus,
        .tv-card:focus-visible {
          transform: scale(1.08);
          box-shadow: 0 0 0 3px #e50914, 0 20px 60px rgba(0,0,0,0.9);
          z-index: 20;
        }
        .tv-card:focus .tv-card-overlay,
        .tv-card:focus-visible .tv-card-overlay {
          opacity: 1;
        }
        .tv-card:focus .tv-card-play,
        .tv-card:focus-visible .tv-card-play {
          opacity: 1;
        }
        .tv-card:focus .tv-card-info,
        .tv-card:focus-visible .tv-card-info {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </Link>
  );
}