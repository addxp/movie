 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TYPES = [
  { value: "movie", label: "Filme", emoji: "🎬" },
  { value: "series", label: "Série", emoji: "📺" },
  { value: "anime", label: "Anime", emoji: "⚔️" },
  { value: "book", label: "Livro", emoji: "📚" },
  { value: "documentary", label: "Documentário", emoji: "🎥" },
  { value: "sport", label: "Esporte", emoji: "🏆" },
];

export default function RequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ title: "", type: "movie", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("requests").insert({
      user_id: userId,
      title: form.title,
      type: form.type,
      description: form.description || null,
      status: "pending",
    });

    if (!error) {
      setSuccess(true);
      setForm({ title: "", type: "movie", description: "" });
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    }
    setLoading(false);
  };

  const cls = "input-glow w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-[#555] text-sm transition-all hover:border-white/20";

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-2xl p-6 border border-white/5 space-y-4">

      {/* Tipo */}
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map(({ value, label, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => setForm(p => ({ ...p, type: value }))}
            className={"py-2 px-2 rounded-xl text-xs font-medium transition-all border " + (
              form.type === value
                ? "bg-[var(--color-red)] text-white border-[var(--color-red)]"
                : "bg-white/5 text-[#555] border-white/5 hover:text-white hover:border-white/20"
            )}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      <input
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        placeholder="Nome do filme, série, anime..."
        required
        className={cls}
      />

      <textarea
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        placeholder="Detalhes adicionais (opcional)"
        rows={3}
        className={cls + " resize-none"}
      />

      {success && (
        <p className="text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded text-center">
          ✓ Pedido enviado com sucesso!
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" />Enviando...</> : <><Send size={16} />Enviar Pedido</>}
      </button>
    </form>
  );
}