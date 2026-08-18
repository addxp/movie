"use client";
import { useState, useEffect, useRef } from "react";
import { Play, AlertCircle, Maximize, ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SourceKey =
  | "vidsrc"
  | "vidsrc.sbs"
  | "vidnest"
  | "embed"
  | "superflix"
  | "autoembed"
  | "megaembed";

// Fontes de player disponíveis. `noAds` é só um indicativo (baseado no que
// cada provedor divulga/costuma entregar) — não é uma garantia, provedores
// gratuitos mudam de comportamento sem aviso.
const SOURCES: {
  key: SourceKey;
  label: string;
  noAds?: boolean;
  seriesSupported: boolean;
}[] = [
  { key: "vidsrc", label: "VidSrc", noAds: true, seriesSupported: true },
  { key: "vidsrc.sbs", label: "VidSrc.sbs", noAds: true, seriesSupported: true },
  { key: "vidnest", label: "VidNest", noAds: true, seriesSupported: false },
  { key: "embed", label: "EmbedPlay", seriesSupported: true },
  { key: "superflix", label: "SuperFlix", seriesSupported: true },
  { key: "autoembed", label: "AutoEmbed", seriesSupported: false },
  { key: "megaembed", label: "MegaEmbed", seriesSupported: true },
];

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  movieId: string;
  userId: string;
  duration?: number;
}

export default function VideoPlayer({
  videoUrl,
  title,
  thumbnail,
  movieId,
  userId,
  duration,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<SourceKey>("vidsrc");
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
    setLoading(true);
    startTracking();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getYouTubeEmbed = (url: string) => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/,
    ];
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

  const getTmdbId = (url: string) => {
    const match = url.match(/(?:embed|filme|serie)\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const isHLS = (url: string) => url.includes(".m3u8");

  const isEmbedPlay = (url: string) =>
    url.includes("embedplayapi.site") || url.includes("embedplay.one");

  const isSerieUrl = (url: string) =>
    url.includes("/serie/") || url.includes("/tv/");

  const embedSrc = getYouTubeEmbed(videoUrl) || getVimeoEmbed(videoUrl);
  const tmdbId = getTmdbId(videoUrl);

  const getSrc = () => {
    if (embedSrc) return embedSrc;

    const serie = isSerieUrl(videoUrl);

    if (tmdbId) {
      switch (source) {
        case "vidsrc":
          return serie
            ? `https://vidsrc.wiki/embed/tv/${tmdbId}/1/1`
            : `https://vidsrc.wiki/embed/movie/${tmdbId}`;
        case "vidsrc.sbs":
          return serie
            ? `https://vidsrc.sbs/embed/tv/${tmdbId}/1/1`
            : `https://vidsrc.sbs/embed/movie/${tmdbId}`;
        case "vidnest":
          // VidNest só divulgou o padrão de filme; séries caem no fallback abaixo.
          return serie ? videoUrl : `https://vidnest.fun/movie/${tmdbId}`;
        case "autoembed":
          // AutoEmbed só divulgou o padrão de filme; séries caem no fallback abaixo.
          return serie ? videoUrl : `https://player.autoembed.app/embed/movie/${tmdbId}`;
        case "superflix":
          return serie
            ? `https://superflixapi.pro/serie/${tmdbId}`
            : `https://superflixapi.pro/filme/${tmdbId}`;
          case "superflix":
          return serie
            ? `https://superflixapi.pro/serie/${tmdbId}`
            : `;
        default:
          break;
      }
    }

    return videoUrl;
  };

  const handleFullscreen = () => {
    const iframe = containerRef.current?.querySelector("iframe");
    if (iframe) {
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if (
        (iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void })
          .webkitRequestFullscreen
      ) {
        (
          iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }
        ).webkitRequestFullscreen?.();
      }
    } else if (containerRef.current) {
      if (containerRef.current.requestFullscreen)
        containerRef.current.requestFullscreen();
    }
  };

  const openExternal = () => window.open(getSrc(), "_blank");

  useEffect(() => {
    if (!playing || !isHLS(videoUrl) || !videoRef.current) return;
    const video = videoRef.current;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.play();
      setLoading(false);
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        const proxyUrl = "/api/proxy?url=" + encodeURIComponent(videoUrl);
        hls.loadSource(proxyUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => setError(true));
        });
        hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
          if (data.fatal) {
            setError(true);
            setLoading(false);
          }
        });
      } else {
        setError(true);
        setLoading(false);
      }
    });
  }, [playing, videoUrl]);

  // Atalhos de teclado/controle remoto — estilo Netflix.
  // Espaço: play/pause · ← →: pula 10s · Esc: sai do fullscreen
  useEffect(() => {
    if (!playing) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      const video = videoRef.current;
      if (!video || !isHLS(videoUrl)) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        video.paused ? video.play() : video.pause();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 10, video.duration || Infinity);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playing, videoUrl]);

  if (!playing) {
    return (
      <button
        type="button"
        data-tv-item
        autoFocus
        onClick={handlePlay}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group block text-left
                   focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={
          thumbnail
            ? {
                backgroundImage: "url(" + thumbnail + ")",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 group-focus-visible:bg-black/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/95 group-hover:bg-white group-focus-visible:bg-white group-focus-visible:scale-110 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl">
            <Play size={32} fill="black" className="ml-1" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="text-white/70 text-sm">{title}</span>
          <span className="text-white/50 text-xs">Pressione Enter ou clique para assistir</span>
        </div>
      </button>
    );
  }

  if (isHLS(videoUrl)) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden focus:outline-none"
      >
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 size={40} className="animate-spin text-[var(--color-red)]" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
            <AlertCircle size={40} />
            <p>Não foi possível carregar</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
            >
              Abrir externamente
            </a>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full"
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        )}
      </div>
    );
  }

  const currentSrc = getSrc();
  const hasAlternateSources = (isEmbedPlay(videoUrl) || !!tmdbId) && !embedSrc;
  const serie = isSerieUrl(videoUrl);
  const availableSources = SOURCES.filter((s) => serie ? s.seriesSupported : true);

  return (
    <div className="space-y-3">
      {hasAlternateSources && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#555] text-xs">Fonte:</span>
          {availableSources.map((s) => (
            <button
              key={s.key}
              data-tv-item
              onClick={() => setSource(s.key)}
              className={
                "px-3 py-1 rounded text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] " +
                (source === s.key
                  ? "bg-[var(--color-red)] text-white"
                  : "bg-white/5 text-[#555] hover:text-white")
              }
            >
              {s.label}
              {s.noAds && <span className="ml-1 opacity-70">· sem anúncios</span>}
            </button>
          ))}
        </div>
      )}

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
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          data-tv-item
          onClick={handleFullscreen}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          <Maximize size={12} /> Tela Cheia
        </button>
        <button
          data-tv-item
          onClick={openExternal}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          <ExternalLink size={12} /> Abrir em nova aba
        </button>
        {hasAlternateSources && (
          <span className="text-[#555] text-xs ml-auto">
            Se um player não funcionar, tente outro
          </span>
        )}
      </div>
    </div>
  );
}
