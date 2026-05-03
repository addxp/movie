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
    rowRef.current.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <section className="mb-8 group/row">
      <div className="flex items-center justify-between px-8 lg:px-16 mb-3">
        <h2 className="text-white text-sm font-semibold tracking-wide">{title}</h2>
        {category && (
          <Link
            href={"/category/" + encodeURIComponent(category)}
            className="flex items-center gap-1 text-[#555] hover:text-white text-xs transition-colors opacity-0 group-hover/row:opacity-100"
          >
            Ver tudo <ArrowRight size={11} />
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-r from-[var(--color-bg)] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-7 h-7 bg-black/80 rounded-full flex items-center justify-center border border-white/10">
            <ChevronLeft size={14} />
          </div>
        </button>

        <div ref={rowRef} className="scroll-row flex gap-2 px-8 lg:px-16">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} userId={userId} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-7 h-7 bg-black/80 rounded-full flex items-center justify-center border border-white/10">
            <ChevronRight size={14} />
          </div>
        </button>
      </div>
    </section>
  );
}