"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useWatchProgress(userId: string, movieId: string) {
  const supabase = createClient();
  const savedRef = useRef(false);

  const saveProgress = async (progress: number, duration: number, completed = false) => {
    if (!userId || !movieId) return;
    await supabase.from("watch_history").upsert({
      user_id: userId,
      movie_id: movieId,
      progress,
      duration,
      completed,
      watched_at: new Date().toISOString(),
    }, { onConflict: "user_id,movie_id" });
  };

  return { saveProgress };
}