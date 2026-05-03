"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Episode } from "@/types";

interface Props {
  movieId: string;
  movieTitle: string;
}

export default function EpisodeManager({ movieId, movieTitle }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", video_url: "", thumbnail: "",
    season: 1, episode: 1, duration: ""
  });

  const loadEpisodes = useCallback(async () => {
    const { data } = await supabase
      .from("episodes")
      .select("*")
      .eq("movie_id", movieId)
      .order("season", { ascending: true })
      .order("episode", { ascending: true });
    if (data) setEpisodes(data);
  }, [movieId, supabase]);

  useEffect(() => { loadEpisodes(); }, [loadEpisodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("episodes").insert({
      movie_id: movieId,
      ...form,
      duration: form.duration ? parseInt(form.duration) : null,
    });
    if (!error) {
      setForm({ title: "", description: "", video_url: "", thumbnail: "", season: 1, episode: 1, duration: "" });
      loadEpisodes();
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este episódio?")) return;
    setDeleting(id);
    await supabase.from("episodes").delete().eq("id", id);
    loadEpisodes();
    setDeleting(null);
  };

  const cls = "input-glow w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-[var(--color-muted)] text-sm";

  return (
    <div className="bg-[var(--color-card)] rounded-xl p-6 border border-white/5">
      <h3 className="text-white font-semibold mb-4">Episódios — {movieTitle}</h3>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={form.season} onChange={e => setForm(p => ({...p, season: parseInt(e.target.value)}))} placeholder="Temporada" min="1" required className={cls} />
          <input type="number" value={form.episode} onChange={e => setForm(p => ({...p, episode: parseInt(e.target.value)}))} placeholder="Episódio" min="1" required className={cls} />
        </div>
        <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Título do episódio *" required className={cls} />
        <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Descrição" rows={2} className={cls + " resize-none"} />
        <input value={form.video_url} onChange={e => setForm(p => ({...p, video_url: e.target.value}))} placeholder="URL do vídeo *" required className={cls} />
        <input value={form.thumbnail} onChange={e => setForm(p => ({...p, thumbnail: e.target.value}))} placeholder="URL da thumbnail (opcional)" className={cls} />
        <input type="number" value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} placeholder="Duração (min)" className={cls} />
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all text-sm disabled:opacity-60">
          {loading ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : <><Plus size={14} />Adicionar Episódio</>}
        </button>
      </form>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <p className="text-[var(--color-muted)] text-xs mb-2">{episodes.length} episódios cadastrados</p>
        {episodes.map((ep) => (
          <div key={ep.id} className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-white/5 group">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">T{ep.season}E{ep.episode} — {ep.title}</p>
              <p className="text-[var(--color-muted)] text-xs truncate">{ep.description || "Sem descrição"}</p>
            </div>
            <button onClick={() => handleDelete(ep.id)} disabled={deleting === ep.id} className="text-[var(--color-muted)] hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all">
              {deleting === ep.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}