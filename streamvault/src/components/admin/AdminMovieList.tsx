"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Trash2, Loader2, Film, Tv, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Movie } from "@/types";
import EpisodeManager from "./EpisodeManager";
import EditMovieModal from "./EditMovieModal";

const CATEGORIES = ["Acao","Drama","Comedia","Terror","Ficcao Cientifica","Animacao","Documentario","Romance","Thriller","Aventura"];
const PAGE_SIZE = 50;

interface Props {
  movies: Movie[];
  totalCount: number;
}

export default function AdminMovieList({ movies: initialMovies, totalCount }: Props) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [total, setTotal] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Movie | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchPage = useCallback(async (pageNum: number, searchTerm: string) => {
    setSearching(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("movies")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (searchTerm.trim()) {
      query = query.ilike("title", "%" + searchTerm + "%");
    }

    const { data, count } = await query.range(from, to);

    setMovies(data as Movie[] || []);
    setTotal(count || 0);
    setSearching(false);
  }, [supabase]);

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchPage(0, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPage(newPage, search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    setDeleting(id);
    await supabase.from("movies").delete().eq("id", id);
    setMovies(prev => prev.filter(m => m.id !== id));
    setTotal(prev => prev - 1);
    setDeleting(null);
  };

  const handleCategoryChange = async (movieId: string, category: string) => {
    setSavingCategory(movieId);
    await supabase.from("movies").update({ category }).eq("id", movieId);
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, category } : m));
    setSavingCategory(null);
    setEditingCategory(null);
  };

  const handleCollectionChange = async (movieId: string, collection: string) => {
    await supabase.from("movies").update({ collection: collection || null }).eq("id", movieId);
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, collection: collection || undefined } : m));
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (selectedSeries) {
    return (
      <div>
        <button onClick={() => setSelectedSeries(null)} className="text-[var(--color-red)] hover:underline text-sm mb-4 block">
          ← Voltar para lista
        </button>
        <EpisodeManager movieId={selectedSeries.id} movieTitle={selectedSeries.title} />
      </div>
    );
  }

  return (
    <>
      {editingMovie && (
        <EditMovieModal movie={editingMovie} onClose={() => setEditingMovie(null)} />
      )}

      {/* Busca */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar filme ou serie..."
          className="input-glow w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-[var(--color-muted)] text-sm"
        />
        {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] animate-spin" />}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[var(--color-muted)] text-xs">
          {searching ? "Buscando..." : total + " itens" + (search ? " encontrados" : "")}
        </p>
        {totalPages > 1 && (
          <p className="text-[var(--color-muted)] text-xs">
            Página {page + 1} de {totalPages}
          </p>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {movies.length === 0 && !searching && (
          <p className="text-center text-[var(--color-muted)] text-sm py-8">
            {search ? "Nenhum resultado encontrado" : "Nenhum item cadastrado"}
          </p>
        )}

        {movies.map((movie) => (
          <div key={movie.id} className="bg-[var(--color-card)] rounded-lg border border-white/5 hover:border-white/10 transition-colors group overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="relative w-8 h-12 flex-shrink-0 rounded overflow-hidden bg-[#1a1a1a]">
                {movie.thumbnail && (
                  <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover" unoptimized />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {movie.type === "series"
                    ? <Tv size={11} className="text-blue-400 flex-shrink-0" />
                    : <Film size={11} className="text-green-400 flex-shrink-0" />}
                  <p className="text-white text-xs font-medium truncate">{movie.title}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {editingCategory === movie.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        defaultValue={movie.category}
                        onChange={(e) => handleCategoryChange(movie.id, e.target.value)}
                        className="bg-[var(--color-bg)] border border-white/20 rounded px-2 py-0.5 text-white text-[10px]"
                        autoFocus
                        onBlur={() => setEditingCategory(null)}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {savingCategory === movie.id && <Loader2 size={10} className="animate-spin text-white" />}
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingCategory(movie.id)}
                      className="text-[#444] hover:text-white text-[10px] flex items-center gap-0.5 transition-colors"
                    >
                      {movie.category} <Pencil size={8} />
                    </button>
                  )}

                  <span className="text-[#333] text-[10px]">·</span>
                  <input
                    defaultValue={movie.collection || ""}
                    placeholder="+ colecao"
                    onBlur={(e) => {
                      if (e.target.value !== (movie.collection || "")) {
                        handleCollectionChange(movie.id, e.target.value);
                      }
                    }}
                    className="bg-transparent text-[10px] text-[#444] hover:text-white placeholder:text-[#333] focus:outline-none focus:text-white w-24 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingMovie(movie)}
                  className="text-[var(--color-muted)] hover:text-blue-400 transition-colors p-1.5 rounded"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                {movie.type === "series" && (
                  <button
                    onClick={() => setSelectedSeries(movie)}
                    className="text-blue-400 hover:text-blue-300 text-[10px] px-2 py-1 rounded bg-blue-500/10 whitespace-nowrap"
                  >
                    Ep.
                  </button>
                )}
                <button
                  onClick={() => handleDelete(movie.id)}
                  disabled={deleting === movie.id}
                  className="text-[var(--color-muted)] hover:text-red-400 transition-colors p-1.5 rounded"
                >
                  {deleting === movie.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum = i;
            if (totalPages > 7) {
              if (page < 4) pageNum = i;
              else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
              else pageNum = page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={"w-7 h-7 rounded text-xs font-medium transition-all " + (pageNum === page ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10 hover:text-white")}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}