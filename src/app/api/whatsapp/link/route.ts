import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const admin = createAdminClient();
  const { data: otp } = await admin.from("whatsapp_otp").select("*").eq("code", code.trim()).maybeSingle();

  if (!otp) return NextResponse.json({ error: "Código não encontrado." }, { status: 404 });
  if (new Date(otp.expires_at) < new Date()) return NextResponse.json({ error: "Código expirado. Peça um novo pelo WhatsApp." }, { status: 410 });

  await admin.from("whatsapp_links").upsert({ phone: otp.phone, user_id: user.id });
  await admin.from("whatsapp_otp").delete().eq("phone", otp.phone);

  return NextResponse.json({ ok: true });
}
