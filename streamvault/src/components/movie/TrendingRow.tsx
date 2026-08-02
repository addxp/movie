"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Movie } from "@/types";

interface TrendingRowProps {
  movies: Movie[];
}

export default function TrendingRow({ movies }: TrendingRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <section className="section-wrap mb-12">
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-accent" />
          <h2 className="section-title">Tendências</h2>
        </div>
      </div>

      <div className="relative group/trendrow">
        <div className="absolute left-0 top-0 bottom-0 z-20 w-16 flex items-center justify-start opacity-0 group-hover/trendrow:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(to right, var(--color-bg) 40%, transparent)" }}>
          <button onClick={() => scroll("left")}
            style={{
              marginLeft: 52, width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
            <ChevronLeft size={14} color="rgba(255,255,255,0.8)" />
          </button>
        </div>

        <div ref={rowRef} className="trending-row">
          {movies.slice(0, 10).map((movie, i) => (
            <Link key={movie.id} href={"/movie/" + movie.id} className="trending-item"
              style={{ textDecoration: "none" }}>
              {/* Big number */}
              <span className="trending-number">{i + 1}</span>

              {/* Poster card */}
              <div className="trending-card">
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                />

                {/* Hover overlay with play + title */}
                <div className="trending-overlay">
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: "#fff", fontSize: 11, fontWeight: 700,
                      fontFamily: "var(--font-display)", letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {movie.title}
                    </p>
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    <Play size={13} fill="black" style={{ marginLeft: 1 }} />
                  </div>
                </div>

                {/* Rating badge */}
                {movie.rating && (
                  <div style={{
                    position: "absolute", top: 8, left: 8,
                    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
                    color: "#f5c518", fontSize: 10, fontWeight: 700,
                    padding: "3px 7px", borderRadius: 4,
                    border: "1px solid rgba(245,197,24,0.2)",
                  }}>
                    ★ {movie.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Title below */}
              <p style={{
                marginTop: 10, paddingLeft: 30,
                color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 500,
                fontFamily: "var(--font-display)", letterSpacing: "0.04em",
                textTransform: "uppercase",
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
              }}>
                {movie.title}
              </p>
            </Link>
          ))}
        </div>

        <div className="absolute right-0 top-0 bottom-0 z-20 w-16 flex items-center justify-end opacity-0 group-hover/trendrow:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(to left, var(--color-bg) 40%, transparent)" }}>
          <button onClick={() => scroll("right")}
            style={{
              marginRight: 52, width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
            <ChevronRight size={14} color="rgba(255,255,255,0.8)" />
          </button>
        </div>
      </div>
    </section>
  );
}
