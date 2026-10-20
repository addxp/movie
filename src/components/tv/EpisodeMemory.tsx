"use client";
// Guarda qual episódio foi aberto por último, para a página da série focar o próximo.

import { useEffect } from "react";

export default function EpisodeMemory({ movieId, episodeId }: { movieId: string; episodeId: string }) {
  useEffect(() => {
    try { window.localStorage.setItem("sv-last-ep:" + movieId, episodeId); } catch { /* ignore */ }
  }, [movieId, episodeId]);
  return null;
}
