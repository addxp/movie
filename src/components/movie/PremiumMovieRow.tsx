"use client";
import { useRef } from "react";
import Link from "next/link";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/types";

interface PremiumMovieRowProps {
  title: string;
  movies: Movie[];
}

export default function PremiumMovieRow({ title, movies }: PremiumMovieRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (!movies || movies.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  };

  return (
    <section className="pmr-row" style={{ marginBottom: "40px" }}>
      <style>{`
        .pmr-card { transition: transform 0.3s cubic-bezier(.22,1,.36,1); }
        .pmr-card:hover { transform: translateY(-6px); }
        .pmr-card:hover .pmr-poster { box-shadow: 0 20px 46px rgba(0,0,0,0.7), 0 0 0 1px var(--border-3), 0 0 34px var(--red-dim-2); }
        .pmr-card:hover .pmr-overlay { opacity: 1; }
        .pmr-card:hover img { transform: scale(1.06); filter: brightness(0.62); }
        .pmr-nav { opacity: 0; transition: opacity 0.2s ease, background 0.2s ease; }
        .pmr-row:hover .pmr-nav { opacity: 1; }
        .pmr-nav:hover { background: rgba(255,255,255,0.14); }
      `}</style>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="pmr-nav" onClick={() => scrollBy(-1)} style={navBtnStyle}><ChevronLeft size={15} color="#fff" /></button>
          <button className="pmr-nav" onClick={() => scrollBy(1)} style={navBtnStyle}><ChevronRight size={15} color="#fff" /></button>
        </div>
      </div>

      <div ref={trackRef} className="scroll-row" style={{ display: "flex", gap: "16px", overflowX: "auto" }}>
        {movies.map((movie) => (
          <Link key={movie.id} href={"/movie/" + movie.id} className="pmr-card" style={{ flexShrink: 0, width: "192px", textDecoration: "none" }}>
            <div className="pmr-poster" style={{
              position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden",
              background: "var(--bg-3)", aspectRatio: "2/3", marginBottom: "10px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.4)", transition: "box-shadow 0.3s ease",
            }}>
              <img src={movie.thumbnail} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.45s ease, filter 0.45s ease" }} />

              <div className="pmr-overlay" style={{
                position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.3s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.15)",
              }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Play size={15} fill="#050505" strokeWidth={0} style={{ marginLeft: "2px" }} />
                </div>
              </div>

              <div style={{
                position: "absolute", top: "9px", left: "9px",
                background: "rgba(5,5,5,0.7)", backdropFilter: "blur(6px)",
                border: "1px solid var(--border-2)", borderRadius: "5px",
                padding: "2px 6px", fontSize: "9.5px", fontWeight: 700,
                letterSpacing: "0.05em", color: "var(--text)", fontFamily: "var(--font-mono)",
              }}>
                {movie.type === "series" ? "4K" : "HD"}
              </div>

              {movie.rating != null && (
                <div style={{
                  position: "absolute", top: "9px", right: "9px",
                  display: "flex", alignItems: "center", gap: "3px",
                  background: "rgba(5,5,5,0.7)", backdropFilter: "blur(6px)",
                  border: "1px solid var(--border-2)", borderRadius: "5px",
                  padding: "2px 6px", fontSize: "10px", fontWeight: 600, color: "var(--text)",
                }}>
                  <Star size={9} fill="#F5C518" color="#F5C518" /> {movie.rating.toFixed(1)}
                </div>
              )}
            </div>

            <h3 style={{
              color: "var(--text)", fontSize: "13px", fontWeight: 600, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "var(--font-body)", marginBottom: "2px",
            }}>
              {movie.title}
            </h3>
            <p style={{ color: "var(--text-3)", fontSize: "11.5px", fontFamily: "var(--font-body)" }}>
              {movie.release_year}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: "30px", height: "30px", borderRadius: "50%",
  background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
