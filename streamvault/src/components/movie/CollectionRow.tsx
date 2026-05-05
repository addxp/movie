"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Heart, Film } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  collection: string;
  movies: Movie[];
  userId: string;
}

const COLLECTION_STYLES: Record<
  string,
  { accent: string; badge: string; dot: string; border: string }
> = {
  Marvel: {
    accent: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-500",
    border: "border-red-500/30",
  },
  DC: {
    accent: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
    border: "border-blue-500/30",
  },
  Disney: {
    accent: "text-sky-300",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    dot: "bg-sky-400",
    border: "border-sky-400/30",
  },
  Pixar: {
    accent: "text-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    border: "border-yellow-500/30",
  },
  "Star Wars": {
    accent: "text-yellow-300",
    badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    dot: "bg-yellow-300",
    border: "border-yellow-300/30",
  },
  "Harry Potter": {
    accent: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
    border: "border-purple-500/30",
  },
  Avatar: {
    accent: "text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    dot: "bg-cyan-400",
    border: "border-cyan-500/30",
  },
  Transformers: {
    accent: "text-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    border: "border-yellow-500/30",
  },
};

const DEFAULT_STYLE = {
  accent: "text-white",
  badge: "bg-white/5 text-white/50 border-white/10",
  dot: "bg-white",
  border: "border-white/10",
};

function CollectionCard({ movie, userId, index }: { movie: Movie; userId: string; index: number }) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const isNewest = index === 0;

  return (
    <Link
      href={"/movie/" + movie.id}
      className="group relative flex-shrink-0 block"
      style={{ width: "150px" }}
    >
      {/* Poster */}
      <div
        className="relative rounded-2xl overflow-hidden bg-[#181818]"
        style={{ aspectRatio: "2/3" }}
      >
        {!imgError ? (
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c]">
            <Film size={28} className="opacity-20 text-white" />
          </div>
        )}

        {/* Gradient overlay always visible at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* "NOVO" badge for newest */}
        {isNewest && (
          <div className="absolute top-2.5 left-2.5 bg-[var(--color-red)] text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-lg">
            NOVO
          </div>
        )}

        {/* Rating */}
        {movie.rating && (
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1">
            <span className="text-yellow-400 text-[10px]">★</span>
            <span className="text-white text-[10px] font-semibold">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play size={18} fill="black" stroke="none" className="ml-0.5" />
          </div>
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(movie.id);
          }}
          className={
            "absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 " +
            (isFavorited(movie.id)
              ? "bg-[var(--color-red)] text-white scale-100"
              : "bg-black/60 text-white/70 hover:bg-[var(--color-red)] hover:text-white")
          }
        >
          <Heart size={11} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info below poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-[var(--color-red)] transition-colors leading-tight">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[var(--color-muted)] text-[10px]">{movie.release_year}</span>
          {movie.duration && (
            <>
              <span className="text-white/15 text-[10px]">·</span>
              <span className="text-[var(--color-muted)] text-[10px]">{movie.duration}m</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CollectionRow({ collection, movies, userId }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const style = COLLECTION_STYLES[collection] || DEFAULT_STYLE;

  // Mais novo → mais antigo
  const sorted = [...movies].sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0));

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -560 : 560, behavior: "smooth" });
  };

  if (movies.length < 2) return null;

  return (
    <section className="relative mb-8 group/section">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="flex items-center gap-3">
          {/* Dot indicator */}
          <span className={"w-2 h-2 rounded-full flex-shrink-0 " + style.dot} />

          {/* Title */}
          <h2
            className={"text-base font-bold tracking-widest uppercase " + style.accent}
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
          >
            {collection}
          </h2>

          {/* Count badge */}
          <span
            className={
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border " + style.badge
            }
          >
            {movies.length} filmes
          </span>
        </div>

        {/* Ver tudo */}
        <Link
          href={"/collection/" + encodeURIComponent(collection)}
          className={
            "text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-opacity opacity-40 hover:opacity-100 " +
            style.accent
          }
        >
          Ver tudo
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Divider */}
      <div className={"h-px w-full mb-4 bg-gradient-to-r from-transparent via-white/8 to-transparent"} />

      {/* Row with scroll */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-8 z-20 w-9 h-16 rounded-r-xl bg-black/80 hover:bg-black text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 -translate-x-full group-hover/section:translate-x-0"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Cards */}
        <div
          ref={rowRef}
          className="scroll-row flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {sorted.map((movie, i) => (
            <CollectionCard key={movie.id} movie={movie} userId={userId} index={i} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-8 z-20 w-9 h-16 rounded-l-xl bg-black/80 hover:bg-black text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 translate-x-full group-hover/section:translate-x-0"
          aria-label="Rolar para direita"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}