/**
 * useDownload
 * Hook para adicionar conteúdo à fila de downloads da página /downloads.
 *
 * Uso:
 *   const { addDownload, isDownloaded } = useDownload();
 *   addDownload({ id: movie.id, title: movie.title, videoUrl: movie.videoUrl, ... });
 */

import { useCallback } from "react";

const STORAGE_KEY = "streamvault_downloads";

export interface DownloadPayload {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  type: "filme" | "serie" | "anime";
  duration: string;
}

function loadDownloads() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useDownload() {
  const addDownload = useCallback((payload: DownloadPayload) => {
    const current = loadDownloads();
    const exists = current.find((d: { id: string }) => d.id === payload.id);
    if (exists) return; // já está na lista

    const newItem = {
      ...payload,
      progress: 0,
      status: "pending",
      addedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, newItem]));
  }, []);

  const isDownloaded = useCallback((id: string): boolean => {
    const current = loadDownloads();
    return current.some((d: { id: string; status: string }) => d.id === id && d.status === "done");
  }, []);

  const isInQueue = useCallback((id: string): boolean => {
    const current = loadDownloads();
    return current.some((d: { id: string }) => d.id === id);
  }, []);

  return { addDownload, isDownloaded, isInQueue };
}