"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, Info } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface MovieCardProps { movie: Movie; userId: string; }

export default function MovieCard({ movie, userId }: MovieCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={"/movie/" + movie.id}
      className="group relative flex-shrink-0 block movie-card"
      style={{ width: "152px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Poster ── */}
      <div
        className="relative rounded-xl overflow-hidden mb-2.5"
        style={{
          aspectRatio: "2/3",
          background: "#111",
          boxShadow: hovered
            ? "0 20px 50px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)"
            : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.35s ease",
        }}
      >
        {!imgError ? (
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <span style={{ fontSize: "28px", opacity: 0.15 }}>🎬</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Play button */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: hovered ? "scale(1)" : "scale(0.7)",
              transition: "transform 0.35s cubic-bezier(0.34,1.5,0.64,1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <Play size={14} fill="black" style={{ marginLeft: "2px" }} />
          </div>
        </div>

        {/* Rating badge */}
        {movie.rating && (
          <div
            className="absolute top-2 left-2"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              color: "#f5c518",
              fontSize: "10px",
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              border: "1px solid rgba(245,197,24,0.15)",
            }}
          >
            ★ {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Type badge for series */}
        {movie.type === "series" && (
          <div
            className="absolute top-2 right-2"
            style={{
              background: "rgba(229,9,20,0.85)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "2px 6px",
              borderRadius: "3px",
              textTransform: "uppercase",
            }}
          >
            Série
          </div>
        )}

        {/* Bottom info on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Favorite button */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: isFavorited(movie.id) ? "var(--color-red)" : "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Heart size={11} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
            </button>

            <Link
              href={"/movie/" + movie.id}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <Info size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Text info ── */}
      <div>
        <h3
          style={{
            color: hovered ? "#fff" : "rgba(255,255,255,0.82)",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            transition: "color 0.2s",
            marginBottom: "3px",
          }}
        >
          {movie.title}
        </h3>
        <p style={{
          color: "rgba(255,255,255,0.28)",
          fontSize: "11px",
          fontWeight: 400,
        }}>
          {movie.release_year}
          {movie.duration ? ` · ${movie.duration}m` : ""}
        </p>
      </div>
    </Link>
  );
}