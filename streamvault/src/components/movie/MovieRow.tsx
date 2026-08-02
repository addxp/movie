"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  userId: string;
  category?: string;
}

export default function MovieRow({ title, movies, userId, category }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -520 : 520, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <>
      <style>{`
        .row-wrap { margin-bottom: 36px; }

        .row-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px 14px;
        }

        .row-head-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .row-accent {
          width: 3px; height: 16px;
          border-radius: 2px;
          background: #D62839;
          flex-shrink: 0;
        }

        .row-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
        }

        .row-count {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.04);
          padding: 2px 8px;
          border-radius: 20px;
        }

        .row-see-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.15s;
        }
        .row-see-all:hover { color: rgba(255,255,255,0.75); }

        /* container com overflow controlado */
        .row-outer {
          position: relative;
        }

        /* o scroll acontece aqui */
        .row-scroller {
          display: flex;
          gap: 8px;
          padding: 4px 32px 12px;
          overflow-x: auto;
          overflow-y: visible;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .row-scroller::-webkit-scrollbar { display: none; }

        /* fades laterais */
        .row-fade {
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          z-index: 10;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .row-wrap:hover .row-fade { opacity: 1; }
        .row-fade.left  {
          left: 0;
          background: linear-gradient(to right, var(--bg, #080c10) 30%, transparent);
        }
        .row-fade.right {
          right: 0;
          background: linear-gradient(to left, var(--bg, #080c10) 30%, transparent);
        }

        /* botões de scroll */
        .row-btn {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          z-index: 20;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, background 0.15s, transform 0.15s;
          backdrop-filter: blur(8px);
          pointer-events: none;
        }
        .row-wrap:hover .row-btn {
          opacity: 1;
          pointer-events: auto;
        }
        .row-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-50%) scale(1.1);
        }
        .row-btn.left  { left:  40px; }
        .row-btn.right { right: 40px; }
      `}</style>

      <section className="row-wrap">
        {/* Cabeçalho */}
        <div className="row-head">
          <div className="row-head-left">
            <div className="row-accent" />
            <span className="row-title">{title}</span>
            <span className="row-count">{movies.length}</span>
          </div>
          {category && (
            <Link href={`/category/${encodeURIComponent(category)}`} className="row-see-all">
              Ver tudo <ArrowRight size={10} />
            </Link>
          )}
        </div>

        {/* Área de scroll */}
        <div className="row-outer">
          <div className="row-fade left" />

          <div ref={rowRef} className="row-scroller">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} userId={userId} />
            ))}
          </div>

          <div className="row-fade right" />

          <button className="row-btn left"  onClick={() => scroll("left")}>
            <ChevronLeft  size={14} />
          </button>
          <button className="row-btn right" onClick={() => scroll("right")}>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>
    </>
  );
}