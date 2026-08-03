import type { SupabaseClient } from "@supabase/supabase-js";

export interface WatchRoom {
  id: string;
  code: string;
  host_id: string;
  movie_id: string | null;
  title: string;
  video_url: string;
  is_playing: boolean;
  position: number; // segundos, na última atualização
  updated_at: string;
}

/** Gera um código curto e fácil de digitar (sem caracteres ambíguos como 0/O, 1/I). */
function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export async function createRoom(
  supabase: SupabaseClient,
  { hostId, movieId, title, videoUrl }: { hostId: string; movieId: string | null; title: string; videoUrl: string }
): Promise<WatchRoom | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from("watch_rooms")
      .insert({ code, host_id: hostId, movie_id: movieId, title, video_url: videoUrl, is_playing: false, position: 0 })
      .select("*")
      .single();
    if (!error) return data as WatchRoom;
    if (error.code !== "23505") break; // erro que não é "código duplicado" — desiste
  }
  return null;
}

export async function getRoomByCode(supabase: SupabaseClient, code: string): Promise<WatchRoom | null> {
  const { data } = await supabase.from("watch_rooms").select("*").eq("code", code.toUpperCase()).maybeSingle();
  return data as WatchRoom | null;
}

export async function updateRoomPlaybackState(
  supabase: SupabaseClient,
  roomId: string,
  { isPlaying, position }: { isPlaying: boolean; position: number }
) {
  await supabase.from("watch_rooms").update({ is_playing: isPlaying, position, updated_at: new Date().toISOString() }).eq("id", roomId);
}

/** Estima onde o vídeo está AGORA, projetando o tempo que passou desde a última atualização salva. */
export function projectCurrentPosition(room: WatchRoom): number {
  if (!room.is_playing) return room.position;
  const elapsed = (Date.now() - new Date(room.updated_at).getTime()) / 1000;
  return room.position + Math.max(0, elapsed);
}
