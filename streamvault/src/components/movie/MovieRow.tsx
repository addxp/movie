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
    <section className="mb-10 group/row">
      {/* Row header */}
      <div className="flex items-center justify-between px-8 lg:px-16 mb-4">
        <div className="flex items-center gap-3">
          {/* Accent line */}
          <span className="w-[3px] h-4 rounded-full shrink-0" style={{ background: "var(--color-red)" }} />
          <h2 className="section-title">{title}</h2>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)" }}>
            {movies.length}
          </span>
        </div>

        {category && (
          <Link
            href={"/category/" + encodeURIComponent(category)}
            className="flex items-center gap-1 text-[11px] font-medium tracking-wide transition-all duration-200 opacity-0 group-hover/row:opacity-100"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            VER TUDO <ArrowRight size={10} />
          </Link>
        )}
      </div>

      {/* Scroll area */}
      <div className="relative">
        {/* Left fade + button */}
        <div className="absolute left-0 top-0 bottom-0 z-20 w-14 flex items-center justify-start opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, var(--color-bg) 40%, transparent)" }}>
          <button
            onClick={() => scroll("left")}
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)"
            }}
          >
            <ChevronLeft size={14} color="rgba(255,255,255,0.8)" />
          </button>
        </div>

        <div ref={rowRef} className="scroll-row flex gap-2 px-8 lg:px-16">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} userId={userId} />
          ))}
        </div>

        {/* Right fade + button */}
        <div className="absolute right-0 top-0 bottom-0 z-20 w-14 flex items-center justify-end opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, var(--color-bg) 40%, transparent)" }}>
          <button
            onClick={() => scroll("right")}
            className="mr-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)"
            }}
          >
            <ChevronRight size={14} color="rgba(255,255,255,0.8)" />
          </button>
        </div>
      </div>
    </section>
  );
}