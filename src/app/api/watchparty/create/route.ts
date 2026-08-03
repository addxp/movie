import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRoom } from "@/lib/watchparty/room";

export async function POST(req: NextRequest) {
  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: "movieId é obrigatório." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const { data: movie } = await supabase.from("movies").select("id, title, video_url").eq("id", movieId).maybeSingle();
  if (!movie || !movie.video_url) {
    return NextResponse.json({ error: "Esse título não tem um vídeo próprio pra sincronizar em sala." }, { status: 400 });
  }

  const room = await createRoom(supabase, { hostId: user.id, movieId: movie.id, title: movie.title, videoUrl: movie.video_url });
  if (!room) return NextResponse.json({ error: "Não consegui criar a sala. Tenta de novo." }, { status: 500 });

  return NextResponse.json({ code: room.code });
}
