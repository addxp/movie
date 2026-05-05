"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Heart } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface HeroBannerProps { movie: Movie; userId: string; }

export default function HeroBanner({ movie, userId }: HeroBannerProps) {
  const { isFavorited, toggleFavorite, loading } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);

  const bgSrc = movie.backdrop || movie.thumbnail;
  const bgImage = !imgError && bgSrc ? bgSrc : null;

  // Subtle parallax on mouse move
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * -18;
  const parallaxY = (mousePos.y - 0.5) * -10;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: "92vh", minHeight: "600px" }}
    >
      {/* ── Background image with parallax ── */}
      {bgImage && (
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.06)`,
            transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <img
            src={bgImage}
            alt={movie.title}
            onLoad={() => setLoaded(true)}
            onError={() => { setImgError(false); setLoaded(true); }}
            className="w-full h-full object-cover"
            style={{
              opacity: 1,
              transition: "opacity 1.2s ease",
            }}
          />
        </div>
      )}

      {/* ── Cinematic gradient layers ── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(105deg, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.85) 30%, rgba(8,8,8,0.45) 55%, rgba(8,8,8,0.1) 75%, transparent 90%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 15%, rgba(8,8,8,0.2) 35%, transparent 55%)"
      }} />
      {/* Vignette edges */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.6) 100%)"
      }} />

      {/* ── Scan lines for cinematic texture ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        opacity: 0.4,
      }} />

      {/* ── Content ── */}
      <div className="absolute inset-0 flex items-end pb-28 px-8 lg:px-16">
        <div className="max-w-2xl" style={{
          animation: "heroIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          opacity: 0,
        }}>

          {/* Category badges */}
          <div className="flex items-center gap-2 mb-5" style={{ animationDelay: "0.1s" }}>
            <span style={{
              background: "var(--color-red)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "3px",
            }}>
              {movie.category}
            </span>
            {movie.type === "series" && (
              <span style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "3px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                Série
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(52px, 8vw, 96px)",
              lineHeight: 0.92,
              color: "#fff",
              letterSpacing: "0.01em",
              marginBottom: "20px",
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            {movie.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-5" style={{ fontSize: "13px" }}>
            {movie.rating && (
              <span style={{
                color: "#f5c518",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "14px",
              }}>
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
            {movie.release_year && (
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                {movie.release_year}
              </span>
            )}
            {movie.duration && (
              <span style={{
                color: "rgba(255,255,255,0.45)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <span style={{
                  display: "inline-block",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                }} />
                {movie.duration} min
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            lineHeight: 1.7,
            maxWidth: "420px",
            marginBottom: "32px",
            fontWeight: 300,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {movie.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {/* Primary — Assistir */}
            <Link href={"/movie/" + movie.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff",
              color: "#000",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 28px",
              borderRadius: "6px",
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.88)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <Play size={15} fill="black" />
              Assistir
            </Link>

            {/* Secondary — Mais Info */}
            <Link href={"/movie/" + movie.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "6px",
              letterSpacing: "0.02em",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
              }}
            >
              <Info size={15} />
              Mais Info
            </Link>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(movie.id)}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: isFavorited(movie.id) ? "var(--color-red)" : "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                padding: "12px 22px",
                borderRadius: "6px",
                border: isFavorited(movie.id) ? "1px solid transparent" : "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Heart size={15} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
              {isFavorited(movie.id) ? "Salvo" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Progress bar decoration ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "2px" }}>
        <div style={{
          height: "100%",
          width: "35%",
          background: "linear-gradient(to right, var(--color-red), rgba(229,9,20,0.3))",
        }} />
      </div>

      {/* ── keyframes ── */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}