 
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("movie_id")
        .eq("user_id", userId);
      if (data) {
        setFavorites(new Set(data.map((f: { movie_id: string }) => f.movie_id)));
      }
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = useCallback(
    async (movieId: string) => {
      if (!userId) return;
      setLoading(true);
      const isFav = favorites.has(movieId);
      if (isFav) {
        await supabase.from("favorites").delete()
          .eq("user_id", userId).eq("movie_id", movieId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
      } else {
        await supabase.from("favorites").insert({ user_id: userId, movie_id: movieId });
        setFavorites((prev) => new Set([...prev, movieId]));
      }
      setLoading(false);
    },
    [userId, favorites, supabase]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorited: (movieId: string) => favorites.has(movieId),
    loading,
  };
}