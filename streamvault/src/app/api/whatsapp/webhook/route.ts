import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractMovieQuery } from "@/lib/whatsapp/claude";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://movieon-addxpht.vercel.app";

/** Handshake exigido pela Meta ao configurar o webhook no painel do app. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function escapeForIlike(q: string) {
  return q
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message || message.type !== "text") {
      return NextResponse.json({ ok: true }); // status update, não é mensagem de texto — ignora
    }

    const from = message.from as string; // número do remetente, formato internacional sem "+"
    const text = message.text.body as string;

    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;
    if (ownerPhone && from !== ownerPhone) {
      // Bot pessoal — só responde ao número do dono do StreamVault.
      return NextResponse.json({ ok: true });
    }

    const { title, reply } = await extractMovieQuery(text);

    if (reply) {
      await sendWhatsAppText(from, reply);
      return NextResponse.json({ ok: true });
    }

    if (!title) {
      await sendWhatsAppText(from, "Me diz o nome do filme ou série que você quer assistir 🎬");
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, type, release_year")
      .ilike("title", `%${escapeForIlike(title)}%`)
      .limit(3);

    if (!movies || movies.length === 0) {
      await sendWhatsAppText(from, `Não encontrei "${title}" no catálogo do StreamVault 😕`);
      return NextResponse.json({ ok: true });
    }

    const lines = movies.map(
      (m) => `🎬 *${m.title}* (${m.release_year ?? "—"})\n${SITE_URL}/movie/${m.id}`
    );
    await sendWhatsAppText(from, lines.join("\n\n"));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ ok: true }); // sempre 200 para a Meta não desativar o webhook
  }
}
