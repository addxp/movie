import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chatTurn } from "@/lib/whatsapp/groq";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://movieon-addxpht.vercel.app";

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
  return q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/,/g, "\\,").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

async function getOrCreateLink(supabase: ReturnType<typeof createAdminClient>, phone: string) {
  const { data } = await supabase.from("whatsapp_links").select("user_id").eq("phone", phone).maybeSingle();
  return data?.user_id as string | undefined;
}

async function generateOtp(supabase: ReturnType<typeof createAdminClient>, phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from("whatsapp_otp").upsert({ phone, code, expires_at });
  return code;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message || message.type !== "text") return NextResponse.json({ ok: true });

    const from = message.from as string;
    const text = (message.text.body as string).trim();

    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;
    if (ownerPhone && from !== ownerPhone) return NextResponse.json({ ok: true }); // bot pessoal por enquanto

    const supabase = createAdminClient();
    let userId = await getOrCreateLink(supabase, from);

    // Comando explícito pra gerar/mostrar o código de vínculo.
    if (!userId && /^(vincular|conectar|login|entrar)/i.test(text)) {
      const code = await generateOtp(supabase, from);
      await sendWhatsAppText(from, `Vai em ${SITE_URL}/link-whatsapp (logado no site) e digita esse código: *${code}*\n\nEle expira em 10 minutos.`);
      return NextResponse.json({ ok: true });
    }

    // Salva a mensagem do usuário no histórico.
    await supabase.from("whatsapp_messages").insert({ phone: from, role: "user", content: text });

    // Pega as últimas mensagens pra dar contexto ao Groq.
    const { data: historyRows } = await supabase
      .from("whatsapp_messages")
      .select("role, content")
      .eq("phone", from)
      .order("created_at", { ascending: false })
      .limit(12);
    const history = (historyRows || []).reverse().map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));

    // Gostos já conhecidos (se a conta estiver vinculada).
    let knownTastes: string[] = [];
    if (userId) {
      const { data: profile } = await supabase.from("profiles").select("favorite_genres").eq("id", userId).maybeSingle();
      knownTastes = profile?.favorite_genres || [];
    }

    const { reply, movieQuery, tastesMentioned } = await chatTurn(history, knownTastes);

    // Aprende gostos novos, se a conta estiver vinculada.
    if (userId && tastesMentioned.length > 0) {
      const merged = Array.from(new Set([...knownTastes, ...tastesMentioned]));
      await supabase.from("profiles").update({ favorite_genres: merged }).eq("id", userId);
    }

    let finalReply = reply;

    // Se ela pediu um filme/série específico, busca no catálogo e anexa o link.
    if (movieQuery) {
      const safe = escapeForIlike(movieQuery);
      const { data: movies } = await supabase.from("movies").select("id, title, release_year").ilike("title", `%${safe}%`).limit(3);
      if (movies && movies.length > 0) {
        const links = movies.map((m) => `🎬 *${m.title}* (${m.release_year ?? "—"})\n${SITE_URL}/movie/${m.id}`).join("\n\n");
        finalReply = `${reply}\n\n${links}`;
      } else {
        finalReply = `${reply}\n\n(Não achei "${movieQuery}" no catálogo do StreamVault.)`;
      }
    }

    // Convite pra vincular a conta, se ainda não tiver.
    if (!userId) {
      finalReply += `\n\n_Ainda não conheço seu perfil no site — manda "vincular" que eu te dou um código pra conectar sua conta._`;
    }

    await supabase.from("whatsapp_messages").insert({ phone: from, role: "assistant", content: finalReply });
    await sendWhatsAppText(from, finalReply);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
