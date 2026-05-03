import { createClient } from "@/lib/supabase/server";
import type { Movie, Episode } from "@/types";

export async function getMoviesByCategory(): Promise<Record<string, Movie[]>> {
  const supabase = await createClient();
  const categorias = ["Acao", "Ficcao", "Terror", "Comedia", "Romance", "Animacao", "Drama", "Outros"];

  const resultados = await Promise.all(
    categorias.map(cat =>
      supabase
        .from("movies")
        .select("*")
        .eq("category", cat)
        .order("created_at", { ascending: false })
        .limit(50)
    )
  );

  const acc: Record<string, Movie[]> = {};
  resultados.forEach((res, i) => {
    if (res.data && res.data.length > 0) {
      const embaralhado = res.data.sort(() => Math.random() - 0.5).slice(0, 24);
      acc[categorias[i]] = embaralhado;
    }
  });

  return acc;
}

export async function getMoviesByCollection(): Promise<Record<string, Movie[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .not("collection", "is", null)
    .order("release_year", { ascending: true })
    .limit(200);

  if (error || !data) return {};

  return data.reduce((acc: Record<string, Movie[]>, movie: Movie) => {
    const col = movie.collection!;
    if (!acc[col]) acc[col] = [];
    acc[col].push(movie);
    return acc;
  }, {});
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20);

  if (error) return [];
  return data || [];
}

export async function getFeaturedMovie(): Promise<Movie | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movies")
    .select("*")
    .not("backdrop", "is", null)
    .not("backdrop", "eq", "")
    .order("created_at", { ascending: false })
    .limit(50);

  if (data && data.length > 0) {
    return data[Math.floor(Math.random() * data.length)];
  }

  return null;
}

export async function getUserFavorites(userId: string): Promise<Movie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("movie_id, movies(*)")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data
    .map((f: { movie_id: string; movies: Movie | Movie[] }) =>
      Array.isArray(f.movies) ? f.movies[0] : f.movies
    )
    .filter(Boolean) as Movie[];
}

export async function isFavorited(userId: string, movieId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .single();

  return !!data;
}

export async function getEpisodesBySeries(movieId: string): Promise<Episode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("movie_id", movieId)
    .order("season", { ascending: true })
    .order("episode", { ascending: true });

  if (error || !data) return [];
  return data;
}

export function groupEpisodesBySeason(episodes: Episode[]): Record<number, Episode[]> {
  return episodes.reduce((acc, ep) => {
    if (!acc[ep.season]) acc[ep.season] = [];
    acc[ep.season].push(ep);
    return acc;
  }, {} as Record<number, Episode[]>);
}