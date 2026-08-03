"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check, Play, Pause } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWatchParty, type PlaybackEvent } from "@/hooks/useWatchParty";
import { updateRoomPlaybackState, projectCurrentPosition, type WatchRoom } from "@/lib/watchparty/room";
import { resolvePlaybackSource } from "@/lib/watchparty/source";
import GroupWatchPlayer from "./GroupWatchPlayer";
import EmbedWatchPlayer from "./EmbedWatchPlayer";
import ChatPanel from "./ChatPanel";

interface Toast {
  id: number;
  text: string;
  icon: "play" | "pause" | "info";
}

let toastSeq = 0;

interface GroupWatchRoomProps {
  room: WatchRoom;
  userId: string;
  username: string;
  siteUrl: string;
}

export default function GroupWatchRoom({ room, userId, username, siteUrl }: GroupWatchRoomProps) {
  const supabase = createClient();
  const isHost = userId === room.host_id;
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const playbackHandlerRef = useRef<((event: PlaybackEvent) => void) | null>(null);
  const source = resolvePlaybackSource(room.video_url);

  const pushToast = useCallback((text: string, icon: Toast["icon"] = "info", duration = 4500) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev.slice(-3), { id, text, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const handleIncomingPlayback = useCallback(
    (event: PlaybackEvent) => {
      if (event.type === "manual-ping") {
        pushToast("O host deu play — dá o play aí também 🍿", "play", 5000);
        return;
      }
      // Pra vídeo próprio (direto), play/pause já sincroniza sozinho no player — mas avisa
      // mesmo assim, porque nem sempre dá pra perceber a mudança só olhando o vídeo.
      if (source.kind === "direct") {
        if (event.type === "play") pushToast("▶ O host retomou o vídeo", "play");
        if (event.type === "pause") pushToast("⏸ O host pausou o vídeo", "pause");
      }
      playbackHandlerRef.current?.(event);
    },
    [pushToast, source.kind]
  );

  const { participants, messages, sendPlayback, sendChat } = useWatchParty({
    supabase,
    roomId: room.id,
    roomCode: room.code,
    userId,
    username,
    isHost,
    onPlaybackEvent: handleIncomingPlayback,
  });

  const handleLocalPlaybackChange = useCallback(
    (type: "play" | "pause" | "seek" | "manual-ping" | "countdown" | "pause-notice", position: number) => {
      sendPlayback(type, position);
      if (isHost && type !== "manual-ping" && type !== "countdown" && type !== "pause-notice") {
        updateRoomPlaybackState(supabase, room.id, {
          isPlaying: type !== "pause",
          position,
        });
      }
    },
    [sendPlayback, isHost, supabase, room.id]
  );

  const copyLink = () => {
    navigator.clipboard.writeText(`${siteUrl}/room/${room.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Avisa quem entrou na sala se o host ainda não deu play (evita confusão de "tela preta").
  useEffect(() => {
    if (!isHost && !room.is_playing) {
      pushToast("A sala está pausada — espera o host começar 🍿", "info", 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl text-white font-bold">{room.title}</h1>
            <p className="text-[#888] text-sm">
              {isHost ? "Você é o host desta sala" : "Assistindo em grupo"}
            </p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm px-3 py-2 rounded-lg transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            Código: <strong className="tracking-widest">{room.code}</strong>
          </button>
        </div>

        {toasts.length > 0 && (
          <div className="space-y-1.5">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 bg-[var(--color-red)]/15 border border-[var(--color-red)]/40 text-white text-sm px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-1"
              >
                {t.icon === "play" && <Play size={14} className="shrink-0" />}
                {t.icon === "pause" && <Pause size={14} className="shrink-0" />}
                {t.text}
              </div>
            ))}
          </div>
        )}

        {source.kind === "direct" ? (
          <GroupWatchPlayer
            videoUrl={source.src}
            title={room.title}
            isHost={isHost}
            initialPosition={projectCurrentPosition(room)}
            initialIsPlaying={room.is_playing}
            onLocalPlaybackChange={handleLocalPlaybackChange}
            registerPlaybackHandler={(handler) => (playbackHandlerRef.current = handler)}
          />
        ) : (
          <EmbedWatchPlayer
            src={source.src}
            title={room.title}
            isHost={isHost}
            onLocalPlaybackChange={handleLocalPlaybackChange}
            registerPlaybackHandler={(handler) => (playbackHandlerRef.current = handler)}
          />
        )}
      </div>

      <div className="h-[500px] lg:h-auto">
        <ChatPanel messages={messages} participants={participants} onSend={sendChat} />
      </div>
    </div>
  );
}
