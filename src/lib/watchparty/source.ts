export type PlaybackKind = "direct" | "embed";

function getYouTubeEmbed(url: string): string | null {
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return "https://www.youtube.com/embed/" + match[1] + "?rel=0";
  }
  return null;
}

function getVimeoEmbed(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? "https://player.vimeo.com/video/" + match[1] : null;
}

function getTmdbId(url: string): string | null {
  const match = url.match(/(?:embed|filme|serie)\/([^/?]+)/);
  return match ? match[1] : null;
}

function isHLS(url: string) {
  return url.includes(".m3u8") || url.includes(".mp4");
}

function isEmbedPlay(url: string) {
  return url.includes("embedplayapi.site") || url.includes("embedplay.one");
}

function isSerieUrl(url: string) {
  return url.includes("/serie/") || url.includes("/tv/");
}

/**
 * Descobre se o video_url do filme é um arquivo que dá pra controlar via
 * <video> (HLS/mp4 direto) ou uma página de embed de terceiro (YouTube,
 * Vimeo, EmbedPlay, SuperFlix) — nesse segundo caso não dá pra sincronizar
 * o play/pause de verdade, só avisar por cima.
 */
export function resolvePlaybackSource(videoUrl: string): { kind: PlaybackKind; src: string } {
  const youtube = getYouTubeEmbed(videoUrl);
  if (youtube) return { kind: "embed", src: youtube };

  const vimeo = getVimeoEmbed(videoUrl);
  if (vimeo) return { kind: "embed", src: vimeo };

  const tmdbId = getTmdbId(videoUrl);
  if (isEmbedPlay(videoUrl) || tmdbId) {
    if (tmdbId) {
      const src = isSerieUrl(videoUrl) ? `https://superflixapi.pro/serie/${tmdbId}` : `https://superflixapi.pro/filme/${tmdbId}`;
      return { kind: "embed", src };
    }
    return { kind: "embed", src: videoUrl };
  }

  if (isHLS(videoUrl)) return { kind: "direct", src: videoUrl };

  // URL não reconhecida — trata como embed por segurança (evita <video src> quebrado).
  return { kind: "embed", src: videoUrl };
}
