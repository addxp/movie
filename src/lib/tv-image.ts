// src/lib/tv-image.ts
//
// Troca o tamanho de imagens do TMDB por versões menores na TV.
// TV tem pouca RAM/GPU: decodificar posters "original" (2000px+) para cards
// de ~230px é um dos maiores motivos de travamento.
// URLs que não forem do TMDB passam direto, sem alteração.

const TMDB = /(image\.tmdb\.org\/t\/p\/)(?:w\d+|h\d+|original)(\/)/;

function resize(url: string | null | undefined, size: string): string {
  if (!url) return "";
  return url.replace(TMDB, "$1" + size + "$2");
}

export const tvPoster = (url?: string | null) => resize(url, "w342");
export const tvBackdrop = (url?: string | null) => resize(url, "w1280");
