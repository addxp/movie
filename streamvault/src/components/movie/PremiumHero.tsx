"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, Plus, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface PremiumHeroProps {
  movies: Movie[];
  userId: string;
}

export default function PremiumHero({ movies, userId }: PremiumHeroProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const slides = movies.slice(0, 5);
  const movie = slides[index];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setVisible(false); const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t); }, [index]);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!movie) return null;
  const saved = isFavorited(movie.id);
  const backdrop = movie.backdrop || movie.thumbnail;

  return (
    <section className="ph-hero-section" style={{ position: "relative", height: "86vh", minHeight: "560px", overflow: "hidden" }}>
      <style>{`
        @keyframes ph-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .ph-btn-watch { transition: transform 0.25s cubic-bezier(.34,1.3,.64,1), box-shadow 0.25s ease, background 0.2s ease; }
        .ph-btn-watch:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px var(--red-glow); }
        .ph-btn-list { transition: transform 0.25s ease, background 0.2s ease, border-color 0.2s ease; }
        .ph-btn-list:hover { transform: translateY(-2px); background: rgba(255,255,255,0.12); border-color: var(--border-3); }
        .ph-arrow { transition: background 0.2s ease, opacity 0.2s ease; opacity: 0; }
        .ph-hero-wrap:hover .ph-arrow { opacity: 1; }
        .ph-arrow:hover { background: rgba(255,255,255,0.14); }
        .ph-dot { transition: width 0.3s ease, background 0.3s ease; cursor: pointer; }
        @media (max-width: 640px) {
          .ph-hero-section { height: 78vh !important; min-height: 480px !important; }
          .ph-arrow { display: none; }
        }
      `}</style>

      <div className="ph-hero-wrap" style={{ position: "absolute", inset: 0 }}>
        {/* Backdrop */}
        <div
          key={movie.id}
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${backdrop})`,
            backgroundSize: "cover", backgroundPosition: "center 20%",
            transform: visible ? "scale(1)" : "scale(1.06)",
            transition: "transform 6s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {/* Overlays — blend cinematically into the black page */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.15) 30%, rgba(5,5,5,0.55) 68%, var(--bg) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 38%, transparent 72%)" }} />

        {/* Side arrows */}
        {slides.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={prev} className="ph-arrow" style={arrowStyle("left")}><ChevronLeft size={20} color="#fff" /></button>
            <button aria-label="Próximo" onClick={next} className="ph-arrow" style={arrowStyle("right")}><ChevronRight size={20} color="#fff" /></button>
          </>
        )}

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 5, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "0 clamp(24px, 5vw, 72px) 88px",
          maxWidth: "680px",
        }}>
          <div style={{ opacity: visible ? 1 : 0, animation: visible ? "ph-in 0.7s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "18px", height: "1px", background: "var(--red)" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", color: "var(--red)", textTransform: "uppercase" }}>
                Destaque
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(34px, 5.2vw, 68px)", lineHeight: 1.02,
              letterSpacing: "-0.02em", color: "var(--text)", marginBottom: "18px",
            }}>
              {movie.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px", fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)" }}>
              {movie.rating && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text)", fontWeight: 600 }}>
                  <Star size={13} fill="#F5C518" color="#F5C518" /> {movie.rating.toFixed(1)}
                </span>
              )}
              <Dot />
              <span style={{ border: "1px solid var(--border-3)", borderRadius: "4px", padding: "1px 6px", fontSize: "11px", color: "var(--text-2)" }}>16</span>
              <Dot />
              <span>{movie.release_year}</span>
              <Dot />
              <span>{movie.category}</span>
              {movie.duration ? (<><Dot /><span>{Math.floor(movie.duration / 60)}h{String(movie.duration % 60).padStart(2, "0")}</span></>) : null}
            </div>

            <p style={{
              fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.65,
              color: "var(--text-2)", marginBottom: "32px",
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              maxWidth: "560px",
            }}>
              {movie.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <Link href={"/movie/" + movie.id + "#player"} className="ph-btn-watch" style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "var(--red)", color: "#fff", textDecoration: "none",
                padding: "14px 28px", borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                boxShadow: "0 8px 24px var(--red-dim-2)",
              }}>
                <Play size={16} fill="#fff" strokeWidth={0} /> Assistir Agora
              </Link>
              <button onClick={() => toggleFavorite(movie.id)} className="ph-btn-list" style={{
                display: "flex", alignItems: "center", gap: "9px",
                background: "rgba(255,255,255,0.07)", border: "1px solid var(--glass-border)",
                backdropFilter: "blur(12px)", color: "#fff", cursor: "pointer",
                padding: "14px 24px", borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
              }}>
                {saved ? <Check size={16} /> : <Plus size={16} />} Minha Lista
              </button>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {slides.length > 1 && (
          <div style={{ position: "absolute", zIndex: 5, right: "clamp(24px, 5vw, 72px)", bottom: "36px", display: "flex", gap: "7px" }}>
            {slides.map((s, i) => (
              <span
                key={s.id}
                onClick={() => setIndex(i)}
                className="ph-dot"
                style={{
                  width: i === index ? "22px" : "7px", height: "7px", borderRadius: "4px",
                  background: i === index ? "var(--red)" : "rgba(255,255,255,0.28)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Dot() {
  return <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--text-4)" }} />;
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", [side]: "18px", transform: "translateY(-50%)",
    zIndex: 6, width: "44px", height: "44px", borderRadius: "50%",
    background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)",
    backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  };
}
