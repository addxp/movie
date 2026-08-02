interface BotTurn {
  reply: string;
  movieQuery: string | null; // título que a pessoa quer assistir, se houver
  tastesMentioned: string[]; // gêneros/gostos citados na mensagem, se houver
}

/**
 * Usa a Groq (API gratuita, compatível com o formato da OpenAI) pra manter
 * a conversa e, na mesma resposta, extrair (a) um título de filme/série que
 * a pessoa queira assistir e (b) gostos/gêneros mencionados, pra ir
 * aprendendo o perfil dela ao longo das conversas.
 */
export async function chatTurn(history: { role: "user" | "assistant"; content: string }[], knownTastes: string[]): Promise<BotTurn> {
  const apiKey = process.env.GROQ_API_KEY;
  const fallback: BotTurn = { reply: "Desculpa, tive um problema aqui. Pode repetir?", movieQuery: null, tastesMentioned: [] };
  if (!apiKey) return fallback;

  const system =
    "Você é o assistente de WhatsApp do StreamVault, um site pessoal de streaming. " +
    "Converse de forma curta, natural e simpática em português. Seu trabalho é: " +
    "(1) ajudar a pessoa a achar o que assistir, (2) ir conhecendo o gosto dela pelo que ela conta. " +
    (knownTastes.length ? `Você já sabe que essa pessoa gosta de: ${knownTastes.join(", ")}. ` : "") +
    "Responda APENAS um JSON, sem texto antes/depois, no formato: " +
    '{"reply": "<sua resposta curta pro WhatsApp>", ' +
    '"movie_query": "<título de filme/série que ela quer assistir agora, ou null>", ' +
    '"tastes_mentioned": ["<gêneros ou gostos novos que ela citou, ou lista vazia>"]}';

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 300,
        messages: [{ role: "system", content: system }, ...history],
      }),
    });
    if (!res.ok) return fallback;

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      reply: parsed.reply ?? fallback.reply,
      movieQuery: parsed.movie_query ?? null,
      tastesMentioned: Array.isArray(parsed.tastes_mentioned) ? parsed.tastes_mentioned : [],
    };
  } catch {
    return fallback;
  }
}
