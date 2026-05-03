"use client";
import { useState } from "react";
import Link from "next/link";
import { Play, Info, Heart } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface HeroBannerProps { movie: Movie; userId: string; }

export default function HeroBanner({ movie, userId }: HeroBannerProps) {
  const { isFavorited, toggleFavorite, loading } = useFavorites(userId);
  const [imgError, setImgError] = useState(false);
  const bgImage = !imgError && (movie.backdrop || movie.thumbnail) ? movie.backdrop || movie.thumbnail : null;

  return (
    <section className="relative h-[88vh] min-h-[580px] w-full overflow-hidden">
      {bgImage ? (
<img
  src={movie.thumbnail}
  alt={movie.title}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  onError={() => setImgError(true)}
/>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}

      {/* Gradientes */}
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent opacity-60" />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex items-end pb-24 px-8 lg:px-16">
        <div className="max-w-xl">
          {/* Badge categoria */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--color-red)] text-white text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-sm">
              {movie.category}
            </span>
            {movie.type === "series" && (
              <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-sm border border-white/20">
                SÉRIE
              </span>
            )}
          </div>

          {/* Título */}
          <h1
            className="text-6xl md:text-8xl text-white leading-none mb-4 drop-shadow-2xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            {movie.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5 text-sm">
            {movie.rating && (
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
            {movie.release_year && <span className="text-white/50">{movie.release_year}</span>}
            {movie.duration && <span className="text-white/50">{movie.duration} min</span>}
          </div>

          {/* Descrição */}
          <p className="text-white/70 text-sm leading-relaxed mb-8 line-clamp-2 max-w-md font-light">
            {movie.description}
          </p>

          {/* Botões */}
          <div className="flex items-center gap-3">
            <Link
              href={"/movie/" + movie.id}
              className="flex items-center gap-2 bg-white text-black font-bold px-7 py-3 rounded-lg hover:bg-white/90 transition-all text-sm shadow-xl hover:shadow-white/20 hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="black" /> Assistir
            </Link>

            <Link
              href={"/movie/" + movie.id}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-all text-sm border border-white/15"
            >
              <Info size={16} /> Mais Info
            </Link>

            <button
              onClick={() => toggleFavorite(movie.id)}
              disabled={loading}
              className={"flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all border " + (isFavorited(movie.id) ? "bg-[var(--color-red)] text-white border-transparent" : "bg-white/10 backdrop-blur-sm text-white border-white/15 hover:bg-white/20")}
            >
              <Heart size={16} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
              {isFavorited(movie.id) ? "Salvo" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}