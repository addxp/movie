"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Esportes", "Noticias", "Entretenimento", "Filmes", "Infantil", "Outros"];

export default function AddChannelForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", logo: "", stream_url: "", category: "Esportes", description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("channels").insert(form);
    if (error) { setError("Erro: " + error.message); setLoading(false); return; }
    setSuccess(true);
    setForm({ name: "", logo: "", stream_url: "", category: "Esportes", description: "" });
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
    setLoading(false);
  };

  const cls = "input-glow w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-muted)] text-sm transition-all hover:border-white/20";

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-xl p-6 border border-white/5 space-y-4">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Nome do canal *" required className={cls} />
      <input name="logo" value={form.logo} onChange={handleChange} placeholder="URL do logo" className={cls} />
      <input name="stream_url" value={form.stream_url} onChange={handleChange} placeholder="URL do stream (.m3u8) *" required className={cls} />
      <select name="category" value={form.category} onChange={handleChange} className={cls}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descricao (opcional)" rows={2} className={cls + " resize-none"} />
      {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded">Canal adicionado!</p>}
      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60">
        {loading ? <><Loader2 size={16} className="animate-spin" />Salvando...</> : <><Plus size={16} />Adicionar Canal</>}
      </button>
    </form>
  );
}