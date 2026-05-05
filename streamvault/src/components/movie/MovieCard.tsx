"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, ChevronDown } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface MovieCardProps { movie: Movie; userId: string; }

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

export default function MovieCard({ movie, userId }: MovieCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const accentColor = CATEGORY_COLORS[movie.category ?? ""] ?? "#e50914";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: "152px", zIndex: hovered ? 30 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card — absolute when hovered so it floats above row */}
      <div
        style={{
          position: hovered ? "absolute" : "relative",
          top: hovered ? "-8px" : "0",
          left: hovered ? "-20px" : "0",
          width: hovered ? "192px" : "152px",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#161616",
          boxShadow: hovered
            ? "0 30px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07)"
            : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.3s ease, width 0.3s cubic-bezier(0.34,1.2,0.64,1)",
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
              style={{
                transform: hovered ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px", opacity: 0.12 }}>🎬</span>
            </div>
          )}

          {/* Hover gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(22,22,22,1) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }} />

          {/* Rating badge */}
          {movie.rating && (
            <div style={{
              position: "absolute", top: "8px", left: "8px",
              background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
              color: "#f5c518", fontSize: "10px", fontWeight: 700,
              padding: "3px 6px", borderRadius: "4px",
              display: "flex", alignItems: "center", gap: "3px",
              border: "1px solid rgba(245,197,24,0.2)",
            }}>
              ★ {movie.rating.toFixed(1)}
            </div>
          )}

          {/* Series badge */}
          {movie.type === "series" && (
            <div style={{
              position: "absolute", top: "8px", right: "8px",
              background: "rgba(229,9,20,0.9)", color: "#fff",
              fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "2px 6px", borderRadius: "3px",
            }}>
              Série
            </div>
          )}

          {/* Play button */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            pointerEvents: hovered ? "auto" : "none",
          }}>
            <Link href={"/movie/" + movie.id} style={{
              width: "46px", height: "46px", borderRadius: "50%",
              background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
              transform: hovered ? "scale(1)" : "scale(0.6)",
              transition: "transform 0.35s cubic-bezier(0.34,1.5,0.64,1)",
              textDecoration: "none",
            }}>
              <Play size={16} fill="black" style={{ marginLeft: "2px" }} />
            </Link>
          </div>
        </div>

        {/* Expanded info panel */}
        <div style={{
          padding: "10px 12px 12px",
          opacity: hovered ? 1 : 0,
          maxHeight: hovered ? "200px" : "0",
          overflow: "hidden",
          transition: "opacity 0.25s ease 0.05s, max-height 0.3s ease",
        }}>
          <p style={{
            color: "#fff", fontSize: "12px", fontWeight: 600,
            lineHeight: 1.3, marginBottom: "5px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {movie.title}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            {movie.release_year && (
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "10px", fontWeight: 500 }}>
                {movie.release_year}
              </span>
            )}
            {movie.duration && (
              <>
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "8px" }}>●</span>
                <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "10px" }}>{movie.duration}m</span>
              </>
            )}
          </div>

          {movie.category && (
            <div style={{
              display: "inline-flex", alignItems: "center",
              padding: "2px 7px", borderRadius: "3px", marginBottom: "10px",
              background: accentColor + "20",
              border: `1px solid ${accentColor}35`,
            }}>
              <span style={{
                color: accentColor, fontSize: "9px", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {movie.category}
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                padding: "7px 0", borderRadius: "5px",
                background: isFavorited(movie.id) ? "var(--color-red)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${isFavorited(movie.id) ? "transparent" : "rgba(255,255,255,0.1)"}`,
                color: "#fff", fontSize: "10px", fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <Heart size={10} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
              {isFavorited(movie.id) ? "Salvo" : "Salvar"}
            </button>

            <Link
              href={"/movie/" + movie.id}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "31px", height: "31px", borderRadius: "5px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", textDecoration: "none",
              }}
            >
              <ChevronDown size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Text below card (only visible when not hovered — avoids layout shift) */}
      <div style={{
        marginTop: "8px",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.2s ease",
        pointerEvents: "none",
      }}>
        <h3 style={{
          color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 500,
          lineHeight: 1.3, marginBottom: "2px",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
        }}>
          {movie.title}
        </h3>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
          {movie.release_year}{movie.duration ? ` · ${movie.duration}m` : ""}
        </p>
      </div>
    </div>
  );
}