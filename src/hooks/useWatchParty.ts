"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface PlaybackEvent {
  type: "play" | "pause" | "seek" | "manual-ping";
  position: number;
  senderId: string;
  at: number; // Date.now() de quando foi emitido, pra compensar atraso de rede
}

export interface ChatEvent {
  userId: string;
  username: string;
  body: string;
  at: number;
}

export interface Participant {
  userId: string;
  username: string;
  isHost: boolean;
}

interface UseWatchPartyOptions {
  supabase: SupabaseClient;
  roomId: string;
  roomCode: string;
  userId: string;
  username: string;
  isHost: boolean;
  onPlaybackEvent: (event: PlaybackEvent) => void;
}

export function useWatchParty({
  supabase,
  roomId,
  roomCode,
  userId,
  username,
  isHost,
  onPlaybackEvent,
}: UseWatchPartyOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatEvent[]>([]);
  const onPlaybackEventRef = useRef(onPlaybackEvent);
  onPlaybackEventRef.current = onPlaybackEvent;

  // Carrega as últimas mensagens salvas, pra quem entra atrasado ver o histórico.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("watch_room_messages")
      .select("user_id, username, body, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setMessages(
          data.map((m) => ({
            userId: m.user_id,
            username: m.username,
            body: m.body,
            at: new Date(m.created_at).getTime(),
          }))
        );
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, roomId]);

  useEffect(() => {
    const channel = supabase.channel(`watchparty:${roomCode}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "playback" }, ({ payload }) => {
        onPlaybackEventRef.current(payload as PlaybackEvent);
      })
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev.slice(-49), payload as ChatEvent]);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ username: string; isHost: boolean }>();
        const list: Participant[] = Object.entries(state).map(([key, entries]) => ({
          userId: key,
          username: entries[0]?.username ?? "Alguém",
          isHost: entries[0]?.isHost ?? false,
        }));
        setParticipants(list);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ username, isHost });
        }
      });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, userId]);

  const sendPlayback = useCallback(
    (type: PlaybackEvent["type"], position: number) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "playback",
        payload: { type, position, senderId: userId, at: Date.now() } as PlaybackEvent,
      });
    },
    [userId]
  );

  const sendChat = useCallback(
    (body: string) => {
      const event: ChatEvent = { userId, username, body, at: Date.now() };
      setMessages((prev) => [...prev.slice(-49), event]);
      channelRef.current?.send({ type: "broadcast", event: "chat", payload: event });
      supabase.from("watch_room_messages").insert({ room_id: roomId, user_id: userId, username, body }).then();
    },
    [userId, username, supabase, roomId]
  );

  return { participants, messages, sendPlayback, sendChat };
}
