"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, AlertCircle } from "lucide-react";

interface EmbedWatchPlayerProps {
  src: string;
  title: string;
  isHost: boolean;
  onLocalPlaybackChange: (type: "play" | "pause" | "seek" | "manual-ping" | "countdown" | "pause-notice", position: number) => void;
  registerPlaybackHandler: (handler: (event: { type: string; position: number; senderId: string; at: number }) => void) => void;
}

const COUNTDOWN_SECONDS = 3;

export default function EmbedWatchPlayer({ src, title, isHost, onLocalPlaybackChange, registerPlaybackHandler }: EmbedWatchPlayerProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pauseNotice, setPauseNotice] = useState(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((targetTime: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    const tick = () => {
      const remaining = Math.ceil((targetTime - Date.now()) / 1000);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(0); // mostra "Play!" por um instante antes de sumir
        setTimeout(() => setCountdown(null), 1200);
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 200);
  }, []);

  useEffect(() => {
    registerPlaybackHandler((event) => {
      if (event.type === "countdown") startCountdown(event.at + event.position * 1000);
      if (event.type === "pause-notice") {
        setPauseNotice(true);
        setTimeout(() => setPauseNotice(false), 4000);
      }
    });
  }, [registerPlaybackHandler, startCountdown]);

  useEffect(() => () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); }, []);

  const triggerPlayCountdown = () => {
    const at = Date.now();
    onLocalPlaybackChange("countdown", COUNTDOWN_SECONDS);
    startCountdown(at + COUNTDOWN_SECONDS * 1000);
  };

  const triggerPauseNotice = () => {
    onLocalPlaybackChange("pause-notice", 0);
    setPauseNotice(true);
    setTimeout(() => setPauseNotice(false), 4000);
  };

  return (
    <div className="space-y-2">
      <div className="bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
        <AlertCircle size={13} className="shrink-0" />
        Esse vídeo é de um player de terceiro — não dá pra sincronizar o play/pause automaticamente. Use os avisos abaixo pra combinar o momento com a sala.
      </div>

      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe src={src} title={title} allow="autoplay; fullscreen" allowFullScreen className="w-full h-full" />

        {countdown !== null && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
            <span className="text-white font-black leading-none" style={{ fontSize: "96px" }}>{countdown > 0 ? countdown : "▶"}</span>
            <span className="text-white/70 text-sm font-medium">{countdown > 0 ? "Dá o play quando chegar em 0!" : "Play!"}</span>
          </div>
        )}

        {pauseNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/15 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2">
            <Pause size={12} /> O host pausou — pausa aí também
          </div>
        )}
      </div>

      {isHost && (
        <div className="flex items-center gap-2">
          <button
            onClick={triggerPlayCountdown}
            disabled={countdown !== null}
            className="flex items-center gap-1.5 bg-[var(--color-red)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg"
          >
            <Play size={12} fill="#fff" /> Iniciar contagem pra dar play
          </button>
          <button
            onClick={triggerPauseNotice}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-2 rounded-lg"
          >
            <Pause size={12} /> Avisar que pausei
          </button>
        </div>
      )}
    </div>
  );
}
