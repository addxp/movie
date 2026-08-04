import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Modelo gratuito e rápido da Groq. Veja outras opções em https://console.groq.com/docs/models
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  const { mood } = await req.json().catch(() => ({ mood: "" }));

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  // Busca um catálogo enxuto pra não estourar o contexto do modelo.
  const supabase = await createClient();
  const { data: movies, error } = await supabase
    .from("movies")
    .select("id, title, description, category, genre, release_year, rating")
    .order("created_at", { ascending: false })
    .limit(150);

  if (error || !movies || movies.length === 0) {
    return NextResponse.json(
      { error: "Não consegui carregar o catálogo de filmes." },
      { status: 500 }
    );
  }

  // Lista compacta pra economizar tokens.
  const catalog = movies
    .map((m) => `${m.id}|${m.title}|${m.category ?? ""}|${(m.genre ?? []).join(",")}|${m.release_year ?? ""}|${m.description?.slice(0, 120) ?? ""}`)
    .join("\n");

  const userMood = (mood || "").toString().trim().slice(0, 300) || "Qualquer coisa boa, estou aberto a sugestões.";

  const systemPrompt =
    "Você é um curador de filmes e séries de um site de streaming. " +
    "Vai receber um catálogo no formato id|titulo|categoria|generos|ano|descricao (um por linha) e o que o usuário tem vontade de assistir. " +
    "Escolha APENAS UM item do catálogo que combine melhor. " +
    "Responda SOMENTE com um JSON válido, sem markdown, sem texto extra, no formato exato: " +
    '{"id": "<id exatamente como está no catálogo>", "reason": "<motivo curto, 1-2 frases, em português do Brasil>"}';

  const userPrompt = `Catálogo:\n${catalog}\n\nO usuário quer assistir: "${userMood}"\n\nEscolha o melhor item e responda no formato JSON pedido.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Erro Groq:", errText);
      return NextResponse.json({ error: "Falha ao consultar a IA." }, { status: 502 });
    }

    const data = await groqRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    let parsed: { id?: string; reason?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "A IA respondeu em um formato inesperado." }, { status: 502 });
    }

    const picked = movies.find((m) => m.id === parsed.id);
    if (!picked) {
      return NextResponse.json({ error: "A IA sugeriu um item fora do catálogo." }, { status: 502 });
    }

    return NextResponse.json({
      movie: picked,
      reason: parsed.reason || "Combina com o que você procura.",
    });
  } catch (err) {
    console.error("Erro na recomendação de IA:", err);
    return NextResponse.json({ error: "Erro inesperado ao gerar recomendação." }, { status: 500 });
  }
}
