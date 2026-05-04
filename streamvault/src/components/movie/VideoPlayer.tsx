"use client";
import { useState, useEffect, useRef } from "react";
import { Play, AlertCircle, Maximize, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  movieId: string;
  userId: string;
  duration?: number;
  imdbId?: string; // ← novo: imdb_id vindo do banco ou do TMDB
}

type Source = "embed" | "proxy" | "superflix";

export default function VideoPlayer({ videoUrl, title, thumbnail, movieId, userId, duration, imdbId }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<Source>("proxy"); // proxy como padrão
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  const totalDuration = duration ? duration * 60 : 7200;

  const saveProgress = async (progress: number) => {
    const completed = progress >= totalDuration * 0.9;
    await supabase
      .from("watch_history")
      .upsert(
        {
          user_id: userId,
          movie_id: movieId,
          progress: Math.floor(progress),
          duration: totalDuration,
          completed,
          watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id" }
      );
  };

  const startTracking = () => {
    saveProgress(0);
    intervalRef.current = setInterval(() => {
      progressRef.current += 30;
      saveProgress(progressRef.current);
    }, 30000);
  };

  const handlePlay = () => {
    setPlaying(true);
    startTracking();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ─── Helpers de URL ───────────────────────────────────────────────────────

  const getYouTubeEmbed = (url: string) => {
    const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) return "https://www.youtube.com/embed/" + match[1] + "?autoplay=1&rel=0";
    }
    return null;
  };

  const getVimeoEmbed = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? "https://player.vimeo.com/video/" + match[1] + "?autoplay=1" : null;
  };

  const getTmdbIdFromUrl = (url: string) => {
    const match = url.match(/embed\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const isHLS = (url: string) => url.includes(".m3u8");
  const isEmbedPlay = (url: string) => url.includes("embedplayapi.site") || url.includes("embedplay");

  const embedSrc = getYouTubeEmbed(videoUrl) || getVimeoEmbed(videoUrl);
  const tmdbIdFromUrl = getTmdbIdFromUrl(videoUrl);

  // Usa imdbId prop (do banco) ou extrai da URL
  const resolvedImdbId = imdbId || tmdbIdFromUrl;

  // URL do proxy reverso do EmbedPlay (variável de ambiente)
  const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || "";

  const getProxyUrl = () => {
    if (!resolvedImdbId || !PROXY_URL) return null;
    return `${PROXY_URL}/filme/${resolvedImdbId}`;
  };

  const getSrc = (): string => {
    if (embedSrc) return embedSrc;

    switch (source) {
      case "proxy":
        return getProxyUrl() || videoUrl;
      case "superflix":
        return resolvedImdbId
          ? `https://superflixapi.online/filme/${resolvedImdbId}`
          : videoUrl;
      case "embed":
      default:
        return videoUrl;
    }
  };

  const handleFullscreen = () => {
    const iframe = containerRef.current?.querySelector("iframe");
    if (iframe) {
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if ((iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      }
    } else if (containerRef.current) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    }
  };

  const openExternal = () => window.open(getSrc(), "_blank");

  // ─── HLS ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing || !isHLS(videoUrl) || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.play();
      return;
    }
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        const proxyUrl = "/api/proxy?url=" + encodeURIComponent(videoUrl);
        hls.loadSource(proxyUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => setError(true)));
        hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
          if (data.fatal) setError(true);
        });
      } else {
        setError(true);
      }
    });
  }, [playing, videoUrl]);

  // ─── Thumbnail / Play button ───────────────────────────────────────────────
  if (!playing) {
    return (
      <div
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group"
        onClick={handlePlay}
        style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/95 hover:bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl">
            <Play size={32} fill="black" className="ml-1" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="text-white/70 text-sm">{title}</span>
          <span className="text-white/50 text-xs">Clique para assistir</span>
        </div>
      </div>
    );
  }

  // ─── HLS player ───────────────────────────────────────────────────────────
  if (isHLS(videoUrl)) {
    return (
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
            <AlertCircle size={40} />
            <p>Não foi possível carregar</p>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-sm">Abrir externamente</a>
          </div>
        ) : (
          <video ref={videoRef} controls autoPlay className="w-full h-full" onError={() => setError(true)} />
        )}
      </div>
    );
  }

  // ─── Iframe player ────────────────────────────────────────────────────────
  const currentSrc = getSrc();
  const hasMultipleSources = (isEmbedPlay(videoUrl) || resolvedImdbId) && !embedSrc;
  const proxyAvailable = !!getProxyUrl();

  return (
    <div className="space-y-3">
      {/* Seletor de fonte */}
      {hasMultipleSources && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#555] text-xs">Fonte:</span>

          {proxyAvailable && (
            <button
              onClick={() => setSource("proxy")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                source === "proxy"
                  ? "bg-[var(--color-red)] text-white"
                  : "bg-white/5 text-[#555] hover:text-white"
              }`}
            >
              EmbedPlay (sem anúncios)
            </button>
          )}

          <button
            onClick={() => setSource("embed")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              source === "embed"
                ? "bg-[var(--color-red)] text-white"
                : "bg-white/5 text-[#555] hover:text-white"
            }`}
          >
            EmbedPlay (original)
          </button>

          <button
            onClick={() => setSource("superflix")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              source === "superflix"
                ? "bg-[var(--color-red)] text-white"
                : "bg-white/5 text-[#555] hover:text-white"
            }`}
          >
            SuperFlix
          </button>
        </div>
      )}

      {/* Player */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        <iframe
          key={currentSrc + source}
          src={currentSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-white/10"
        >
          <Maximize size={12} /> Tela Cheia
        </button>
        <button
          onClick={openExternal}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-white/10"
        >
          <ExternalLink size={12} /> Abrir em nova aba
        </button>
        {hasMultipleSources && (
          <span className="text-[#555] text-xs ml-auto">
            Se um player não funcionar, tente outro
          </span>
        )}
      </div>
    </div>
  );
}