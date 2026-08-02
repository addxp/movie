"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Acao","Drama","Comedia","Terror","Ficcao Cientifica","Animacao","Documentario","Romance","Thriller","Aventura"];

interface FormState {
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  video_url: string;
  category: string;
  type: string;
  collection: string;
  release_year: number;
  rating: string;
  duration: string;
}

const INITIAL_FORM: FormState = {
  title: "", description: "", thumbnail: "", backdrop: "", video_url: "",
  category: "Acao", type: "movie", collection: "",
  release_year: new Date().getFullYear(), rating: "", duration: ""
};

export default function AddMovieForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tmdbId, setTmdbId] = useState("");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const generateEmbedUrl = (id: string) => {
    if (!id.trim()) return;
    setForm((prev) => ({ ...prev, video_url: "https://embedplayapi.site/embed/" + id.trim() }));
    setTmdbId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("movies").insert({
      title: form.title,
      description: form.description,
      thumbnail: form.thumbnail,
      backdrop: form.backdrop,
      video_url: form.type === "series" ? "" : form.video_url,
      category: form.category,
      type: form.type,
      collection: form.collection || null,
      release_year: parseInt(String(form.release_year)),
      rating: form.rating ? parseFloat(form.rating) : null,
      duration: form.duration ? parseInt(form.duration) : null,
    });
    if (error) { setError("Erro: " + error.message); setLoading(false); return; }
    setSuccess(true);
    setForm(INITIAL_FORM);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
    setLoading(false);
  };

  const cls = "input-glow w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-muted)] text-sm transition-all hover:border-white/20";

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-xl p-6 border border-white/5 space-y-4">
      <select name="type" value={form.type} onChange={handleChange} className={cls}>
        <option value="movie">Filme</option>
        <option value="series">Serie</option>
      </select>

      <input name="title" value={form.title} onChange={handleChange} placeholder="Titulo *" required className={cls} />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descricao *" required rows={3} className={cls + " resize-none"} />
      <input name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="URL da capa *" required className={cls} />
      <input name="backdrop" value={form.backdrop} onChange={handleChange} placeholder="URL do banner (opcional)" className={cls} />
      <input name="collection" value={form.collection} onChange={handleChange} placeholder="Colecao (ex: Marvel, DC, Disney)" className={cls} />

      {form.type === "movie" && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">
            Gerar link por TMDB/IMDB ID
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="Ex: 157336 ou tt0816692"
              className="input-glow flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-[var(--color-muted)] text-sm"
            />
            <button
              type="button"
              onClick={() => generateEmbedUrl(tmdbId)}
              disabled={!tmdbId.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              Gerar
            </button>
          </div>
          <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="URL do video *" required className={cls} />
          <p className="text-blue-400/50 text-xs">embedplayapi.site/embed/ID</p>
        </div>
      )}

      <select name="category" value={form.category} onChange={handleChange} className={cls}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <div className="grid grid-cols-3 gap-3">
        <input name="release_year" type="number" value={form.release_year} onChange={handleChange} placeholder="Ano" className={cls} />
        <input name="rating" type="number" step="0.1" min="0" max="10" value={form.rating} onChange={handleChange} placeholder="Nota" className={cls} />
        {form.type === "movie" && (
          <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="Min" className={cls} />
        )}
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded">Adicionado!</p>}

      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60">
        {loading ? <><Loader2 size={16} className="animate-spin" />Salvando...</> : <><Plus size={16} />Adicionar {form.type === "movie" ? "Filme" : "Serie"}</>}
      </button>
    </form>
  );
}