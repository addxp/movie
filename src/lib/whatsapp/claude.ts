interface ExtractedIntent {
  title: string | null;
  reply: string | null; // set when Claude wants to answer directly (greeting, unclear message) instead of searching
}

/**
 * Sends the user's WhatsApp message to Claude and asks it to pull out the
 * movie/series title being asked about. Falls back to treating the raw
 * message as the title if the model call fails, so the bot degrades to a
 * plain-text search instead of going silent.
 */
export async function extractMovieQuery(message: string): Promise<ExtractedIntent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { title: message, reply: null };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 200,
        system:
          "Você é o assistente de WhatsApp do StreamVault, um site pessoal de streaming. " +
          "O dono do site manda mensagens perguntando sobre filmes ou séries que quer assistir. " +
          "Responda APENAS com um JSON, sem texto antes ou depois, no formato: " +
          '{"title": "<nome do filme/série mencionado, ou null se a mensagem não pedir um título>", ' +
          '"reply": "<uma resposta curta e direta se a mensagem for uma saudação, agradecimento, ou não pedir busca; null caso contrário>"}',
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) return { title: message, reply: null };

    const data = await res.json();
    const text = (data.content || []).map((b: { text?: string }) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { title: parsed.title ?? null, reply: parsed.reply ?? null };
  } catch {
    return { title: message, reply: null };
  }
}
