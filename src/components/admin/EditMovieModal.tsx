"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/types";

interface Props {
  movie: Movie;
  onClose: () => void;
}

const CATEGORIES = ["Ação","Drama","Comédia","Terror","Ficção Científica","Animação","Documentário","Romance","Thriller","Aventura"];

export default function EditMovieModal({ movie, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: movie.title || "",
    description: movie.description || "",
    thumbnail: movie.thumbnail || "",
    backdrop: movie.backdrop || "",
    video_url: movie.video_url || "",
    category: movie.category || "Ação",
    release_year: movie.release_year || new Date().getFullYear(),
    rating: movie.rating?.toString() || "",
    duration: movie.duration?.toString() || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("movies").update({
      ...form,
      rating: form.rating ? parseFloat(form.rating) : null,
      duration: form.duration ? parseInt(form.duration) : null,
      release_year: parseInt(String(form.release_year)),
    }).eq("id", movie.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    }
    setLoading(false);
  };

  const cls = "input-glow w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-muted)] text-sm transition-all hover:border-white/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
          <h2 className="text-white font-bold text-lg">Editar — {movie.title}</h2>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block">Título</label>
            <input name="title" value={form.title} onChange={handleChange} required className={cls} />
          </div>
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block">Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={cls + " resize-none"} />
          </div>
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block">URL da Capa</label>
            <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className={cls} />
          </div>
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block">URL do Banner (backdrop)</label>
            <input name="backdrop" value={form.backdrop} onChange={handleChange} className={cls} />
          </div>
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block font-medium text-[var(--color-red)]">
              🔗 URL do Vídeo
            </label>
            <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="YouTube, m3u8, mp4..." className={cls + " border-[var(--color-red)]/30"} />
          </div>
          <div>
            <label className="text-[var(--color-muted)] text-xs mb-1 block">Categoria</label>
            <select name="category" value={form.category} onChange={handleChange} className={cls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[var(--color-muted)] text-xs mb-1 block">Ano</label>
              <input name="release_year" type="number" value={form.release_year} onChange={handleChange} className={cls} />
            </div>
            <div>
              <label className="text-[var(--color-muted)] text-xs mb-1 block">Nota</label>
              <input name="rating" type="number" step="0.1" min="0" max="10" value={form.rating} onChange={handleChange} className={cls} />
            </div>
            <div>
              <label className="text-[var(--color-muted)] text-xs mb-1 block">Min</label>
              <input name="duration" type="number" value={form.duration} onChange={handleChange} className={cls} />
            </div>
          </div>

          {success && (
            <p className="text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded text-center">
              ✓ Salvo com sucesso!
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Salvando...</> : <><Save size={16} />Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}