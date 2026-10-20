"use client";
import Link from "next/link";
import { memo } from "react";
import type { TVMovie } from "@/lib/tv-movies";
import { tvPoster } from "@/lib/tv-image";

interface TVMovieCardProps {
  movie: TVMovie;
  category: string;
  rowIdx: number;
  colIdx: number;
  total: number;
  onFocusCard: (rowIdx: number, colIdx: number, category: string, total: number) => void;
}

/**
 * Card leve para TV.
 *
 * Mudanças em relação à versão anterior:
 *  - sem useFavorites por card (eram ~190 consultas ao Supabase na abertura);
 *    favoritar fica na página do título;
 *  - sem <style> repetido em cada card: o CSS está em tv.css, uma vez só;
 *  - <img> simples com poster menor (w342) + lazy, em vez de next/image fill;
 *  - sem sombra de 60px de blur, sem botão extra, sem círculo de play;
 *  - React.memo: mudar de linha/foco não re-renderiza os cards;
 *  - prefetch desligado: o Next não dispara dezenas de pré-carregamentos de rota.
 */
function TVMovieCard({ movie, category, rowIdx, colIdx, total, onFocusCard }: TVMovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      prefetch={false}
      className="tv-card"
      data-tv-item=""
      onFocus={() => onFocusCard(rowIdx, colIdx, category, total)}
    >
      <div className="tv-poster">
        {movie.thumbnail && (
          <img
            src={tvPoster(movie.thumbnail)}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        )}

        {movie.rating ? <span className="tv-badge tv-badge-rating">★ {movie.rating.toFixed(1)}</span> : null}
        {movie.type === "series" ? <span className="tv-badge tv-badge-series">Série</span> : null}

        <div className="tv-card-info">
          <p className="tv-card-title">{movie.title}</p>
          {movie.release_year ? <span className="tv-card-meta">{movie.release_year}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default memo(TVMovieCard);
