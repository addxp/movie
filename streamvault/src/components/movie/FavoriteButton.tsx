// components/movie/FavoriteButton.tsx — Botão de favorito (client)
"use client";

import { Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  movieId: string;
  userId: string;
}

export default function FavoriteButton({ movieId, userId }: Props) {
  const { isFavorited, toggleFavorite, loading } = useFavorites(userId);
  const fav = isFavorited(movieId);

  return (
    <button
      onClick={() => toggleFavorite(movieId)}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border transition-all duration-200 ${
        fav
          ? "bg-[var(--color-red)] text-white border-[var(--color-red)]"
          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
      }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart size={16} fill={fav ? "currentColor" : "none"} />
      )}
      {fav ? "Favoritado" : "Favoritar"}
    </button>
  );
}