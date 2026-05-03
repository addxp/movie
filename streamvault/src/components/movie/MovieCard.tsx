"use client";
import { useState } from "react";
import Link from "next/link";
import { Play, Heart } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface MovieCardProps { movie: Movie; userId: string; }

export default function MovieCard({ movie, userId }: MovieCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={"/movie/" + movie.id}
      className="movie-card relative flex-shrink-0 block group"
      style={{ width: "155px" }}
    >
      {/* Poster */}
      <div
        className="relative rounded-xl overflow-hidden bg-[#1a1a1a] mb-2 shadow-lg group-hover:shadow-2xl group-hover:shadow-black/60 transition-shadow duration-300"
        style={{ aspectRatio: "2/3" }}
      >
        {!imgError ? (
<img
  src={movie.thumbnail}
  alt={movie.title}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  onError={() => setImgError(true)}
/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <span className="text-3xl opacity-20">🎬</span>
          </div>
        )}

        {/* Overlay escuro no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Botão play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={18} fill="black" className="ml-0.5" />
          </div>
        </div>

        {/* Rating */}
        {movie.rating && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            ★ {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            isFavorited(movie.id)
              ? "bg-[var(--color-red)] opacity-100"
              : "bg-black/60 hover:bg-[var(--color-red)]"
          }`}
        >
          <Heart size={11} fill={isFavorited(movie.id) ? "currentColor" : "none"} className="text-white" />
        </button>

        {/* Badge série */}
        {movie.type === "series" && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            série
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="text-white/90 text-xs font-semibold line-clamp-1 group-hover:text-[var(--color-red)] transition-colors duration-200">
          {movie.title}
        </h3>
        <p className="text-[#555] text-[11px] mt-0.5">
          {movie.release_year}{movie.duration ? " · " + movie.duration + "m" : ""}
        </p>
      </div>
    </Link>
  );
}