"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Heart } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  collection: string;
  movies: Movie[];
  userId: string;
}

const COLLECTION_STYLES: Record<string, { bg: string; text: string; glow: string }> = {
  Marvel: { bg: "from-red-950/40 to-transparent", text: "text-red-400", glow: "shadow-red-500/20" },
  DC: { bg: "from-blue-950/40 to-transparent", text: "text-blue-400", glow: "shadow-blue-500/20" },
  Disney: { bg: "from-blue-950/30 to-transparent", text: "text-blue-300", glow: "shadow-blue-400/20" },
  Pixar: { bg: "from-yellow-950/30 to-transparent", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  "Star Wars": { bg: "from-yellow-950/30 to-transparent", text: "text-yellow-300", glow: "shadow-yellow-400/20" },
  "Harry Potter": { bg: "from-purple-950/40 to-transparent", text: "text-purple-400", glow: "shadow-purple-500/20" },
  Avatar: { bg: "from-cyan-950/40 to-transparent", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
  Transformers: { bg: "from-yellow-950/30 to-transparent", text: "text-yellow-400", glow: "shadow-yellow-400/20" },
};

const DEFAULT_STYLE = { bg: "from-gray-900/40 to-transparent", text: "text-white", glow: "shadow-white/10" };

function CollectionCard({ movie, userId }: { movie: Movie; userId: string }) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={"/movie/" + movie.id} className="group relative flex-shrink-0 block" style={{ width: "160px" }}>
      <div className="relative rounded-xl overflow-hidden mb-2 bg-[#1c1c1c]" style={{ aspectRatio: "2/3" }}>
        {!imgError ? (
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl opacity-20">🎬</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={16} fill="black" className="ml-0.5" />
          </div>
        </div>

        {movie.rating && (
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            ★ {movie.rating.toFixed(1)}
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
          className={"absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 " + (isFavorited(movie.id) ? "bg-[var(--color-red)] text-white" : "bg-black/60 text-white hover:bg-[var(--color-red)]")}
        >
          <Heart size={11} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="text-white text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">
        {movie.title}
      </h3>
      <p className="text-[var(--color-muted)] text-[11px] mt-0.5">
        {movie.release_year}{movie.duration ? " · " + movie.duration + "m" : ""}
      </p>
    </Link>
  );
}

export default function CollectionRow({ collection, movies, userId }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const style = COLLECTION_STYLES[collection] || DEFAULT_STYLE;

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  if (movies.length < 2) return null;

  return (
    <section className={"relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-r " + style.bg + " border border-white/5"}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={"w-1 h-6 rounded-full bg-current " + style.text} />
          <h2 className={"text-xl font-bold tracking-wide " + style.text} style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
            {collection.toUpperCase()}
          </h2>
          <span className="text-[var(--color-muted)] text-xs bg-white/5 px-2 py-0.5 rounded-full">
            {movies.length} filmes
          </span>
        </div>
        <Link
          href={"/collection/" + encodeURIComponent(collection)}
          className="text-[var(--color-muted)] hover:text-white text-xs flex items-center gap-1 transition-colors"
        >
          Ver tudo →
        </Link>
      </div>

      {/* Scroll */}
      <div className="relative group/row pb-5">
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-[40%] -translate-y-1/2 z-20 w-8 h-14 bg-black/80 hover:bg-black text-white rounded-r-lg flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200"
        >
          <ChevronLeft size={16} />
        </button>

        <div ref={rowRef} className="scroll-row flex gap-3 px-6">
          {[...movies].sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0)).map((movie) => (
            <CollectionCard key={movie.id} movie={movie} userId={userId} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-[40%] -translate-y-1/2 z-20 w-8 h-14 bg-black/80 hover:bg-black text-white rounded-l-lg flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}