"use client";
import { useCallback, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWatchParty, type PlaybackEvent } from "@/hooks/useWatchParty";
import { updateRoomPlaybackState, projectCurrentPosition, type WatchRoom } from "@/lib/watchparty/room";
import GroupWatchPlayer from "./GroupWatchPlayer";
import ChatPanel from "./ChatPanel";

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
  const [ping, setPing] = useState<string | null>(null);
  const playbackHandlerRef = useRef<((event: PlaybackEvent) => void) | null>(null);

  const handleIncomingPlayback = useCallback(
    (event: PlaybackEvent) => {
      if (event.type === "manual-ping") {
        setPing("O host deu play — dá o play aí também 🍿");
        setTimeout(() => setPing(null), 5000);
        return;
      }
      playbackHandlerRef.current?.(event);
    },
    []
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
    (type: "play" | "pause" | "seek" | "manual-ping", position: number) => {
      sendPlayback(type, position);
      if (isHost && type !== "manual-ping") {
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

        {ping && (
          <div className="bg-[var(--color-red)]/15 border border-[var(--color-red)]/40 text-white text-sm px-4 py-2 rounded-lg">
            {ping}
          </div>
        )}

        <GroupWatchPlayer
          videoUrl={room.video_url}
          title={room.title}
          isHost={isHost}
          initialPosition={projectCurrentPosition(room)}
          initialIsPlaying={room.is_playing}
          onLocalPlaybackChange={handleLocalPlaybackChange}
          registerPlaybackHandler={(handler) => (playbackHandlerRef.current = handler)}
        />
      </div>

      <div className="h-[500px] lg:h-auto">
        <ChatPanel messages={messages} participants={participants} onSend={sendChat} />
      </div>
    </div>
  );
}
