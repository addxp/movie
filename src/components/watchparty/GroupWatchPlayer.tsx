"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";

function isHLS(url: string) {
  return url.includes(".m3u8");
}

interface GroupWatchPlayerProps {
  videoUrl: string;
  title: string;
  isHost: boolean;
  initialPosition: number;
  initialIsPlaying: boolean;
  onLocalPlaybackChange: (type: "play" | "pause" | "seek" | "manual-ping" | "countdown", position: number) => void;
  registerPlaybackHandler: (handler: (event: { type: string; position: number; senderId: string; at: number }) => void) => void;
}

const COUNTDOWN_SECONDS = 3;

export default function GroupWatchPlayer({
  videoUrl, title, isHost, initialPosition, initialIsPlaying,
  onLocalPlaybackChange, registerPlaybackHandler,
}: GroupWatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const applyingRemoteRef = useRef(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdownThenPlay = useCallback((targetTime: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    const tick = () => {
      const remaining = Math.ceil((targetTime - Date.now()) / 1000);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        applyingRemoteRef.current = true;
        videoRef.current?.play().catch(() => {});
        setTimeout(() => { applyingRemoteRef.current = false; }, 300);
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 200);
  }, []);

  // Carrega a fonte (HLS via proxy, igual ao player principal do site, ou mp4 direto).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isHLS(videoUrl)) {
      video.src = videoUrl;
      setReady(true);
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      setReady(true);
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (!Hls.isSupported()) { setError(true); return; }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource("/api/proxy?url=" + encodeURIComponent(videoUrl));
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setReady(true));
      hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => { if (data.fatal) setError(true); });
    });
  }, [videoUrl]);

  // Assim que carrega, posiciona no ponto certo da sala (e dá play se já estava tocando).
  useEffect(() => {
    if (!ready || !videoRef.current) return;
    const video = videoRef.current;
    applyingRemoteRef.current = true;
    video.currentTime = initialPosition;
    if (initialIsPlaying) video.play().catch(() => {});
    setTimeout(() => { applyingRemoteRef.current = false; }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Registra o handler que aplica eventos vindos de outras pessoas da sala.
  useEffect(() => {
    registerPlaybackHandler((event) => {
      const video = videoRef.current;
      if (!video) return;
      if (event.type === "countdown") {
        startCountdownThenPlay(event.at + event.position * 1000);
        return;
      }
      applyingRemoteRef.current = true;
      if (event.type === "seek") video.currentTime = event.position;
      if (event.type === "play") { video.currentTime = event.position; video.play().catch(() => {}); }
      if (event.type === "pause") { video.currentTime = event.position; video.pause(); }
      setTimeout(() => { applyingRemoteRef.current = false; }, 300);
    });
  }, [registerPlaybackHandler, startCountdownThenPlay]);

  useEffect(() => () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); }, []);

  const emit = useCallback(
    (type: "play" | "pause" | "seek") => {
      if (applyingRemoteRef.current || !videoRef.current) return;

      if (type === "play" && countdown === null) {
        // Não toca na hora: pausa de novo, avisa a sala, e só toca de verdade
        // quando a contagem regressiva (sincronizada) chegar a zero.
        const video = videoRef.current;
        applyingRemoteRef.current = true;
        video.pause();
        setTimeout(() => { applyingRemoteRef.current = false; }, 100);
        const at = Date.now();
        onLocalPlaybackChange("countdown", COUNTDOWN_SECONDS);
        startCountdownThenPlay(at + COUNTDOWN_SECONDS * 1000);
        return;
      }

      onLocalPlaybackChange(type, videoRef.current.currentTime);
    },
    [onLocalPlaybackChange, countdown, startCountdownThenPlay]
  );

  const nudgeGuests = () => onLocalPlaybackChange("manual-ping", videoRef.current?.currentTime ?? 0);

  if (error) {
    return (
      <div className="aspect-video bg-[#111] rounded-xl flex items-center justify-center text-white/50 text-sm">
        Não consegui carregar o vídeo dessa sala.
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        onPlay={() => emit("play")}
        onPause={() => emit("pause")}
        onSeeked={() => emit("seek")}
        title={title}
      />
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span className="text-white font-black leading-none" style={{ fontSize: "96px" }}>{countdown}</span>
          <span className="text-white/70 text-sm font-medium">Vai começar pra todo mundo...</span>
        </div>
      )}
      {isHost && (
        <button
          onClick={nudgeGuests}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 hover:bg-black/85 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/15"
        >
          <Play size={11} fill="#fff" /> Avisar a sala
        </button>
      )}
      {!isHost && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur text-white/70 text-[11px] px-2.5 py-1 rounded-md">
          <Pause size={10} /> O host controla a reprodução
        </div>
      )}
    </div>
  );
}
