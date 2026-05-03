"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  streamUrl: string;
  title: string;
}

export default function LivePlayer({ streamUrl, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const hlsRef = useRef<unknown>(null);

  useEffect(() => {
    setError(false);
    setLoading(true);
    const video = videoRef.current;
    if (!video) return;

    const isM3U8 = streamUrl.includes(".m3u8") || streamUrl.includes("m3u8");

    if (video.canPlayType("application/vnd.apple.mpegurl") && isM3U8) {
      video.src = streamUrl;
      video.play().catch(() => setError(true));
      setLoading(false);
      return;
    }

    if (isM3U8) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          if (hlsRef.current) (hlsRef.current as { destroy: () => void }).destroy();
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsRef.current = hls;
          const proxyUrl = "/api/proxy?url=" + encodeURIComponent(streamUrl);
          hls.loadSource(proxyUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            video.play().catch(() => setError(true));
          });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
            if (data.fatal) { setError(true); setLoading(false); }
          });
        } else {
          setError(true);
          setLoading(false);
        }
      });
    } else {
      video.src = streamUrl;
      video.play().catch(() => setError(true));
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) (hlsRef.current as { destroy: () => void }).destroy();
    };
  }, [streamUrl]);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => setError(true));
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[var(--color-red)] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Carregando {title}...</p>
          </div>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--color-card)]">
          <AlertCircle size={48} className="text-red-400" />
          <p className="text-white font-medium">Canal indisponivel</p>
          <p className="text-[var(--color-muted)] text-sm text-center max-w-xs">
            O canal pode estar offline ou indisponivel no momento
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg transition-all text-sm font-medium"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          onError={() => { setError(true); setLoading(false); }}
          onPlaying={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
        />
      )}
    </div>
  );
}