import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMoviesByCategory, getFeaturedMovie, searchMovies } from "@/lib/movies";
import HeroBanner from "@/components/movie/HeroBanner";
import MovieRow from "@/components/movie/MovieRow";
import ContinueWatching from "@/components/movie/ContinueWatching";
import Navbar from "@/components/layout/Navbar";
import { Play } from "lucide-react";

interface BrowsePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const query = params.q;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  if (query) {
    const results = await searchMovies(query);
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Navbar user={user} />
        <div className="pt-24 px-8 lg:px-16 pb-16">
          <div className="mb-6">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Resultados</p>
            <h1 className="text-2xl font-bold text-white">
              &quot;{query}&quot;
              <span className="text-[#555] text-sm font-normal ml-3">
                {results.length} titulo{results.length !== 1 ? "s" : ""}
              </span>
            </h1>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🎬</p>
              <p className="text-[#555]">Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {results.map((movie) => (
                <a key={movie.id} href={"/movie/" + movie.id} className="group block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <Play size={14} fill="black" className="ml-0.5" />
                      </div>
                    </div>
                    {movie.rating && (
                      <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ★ {movie.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white/90 text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-[#555] text-[11px]">{movie.release_year}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const [featuredMovie, moviesByCategory] = await Promise.all([
    getFeaturedMovie(),
    getMoviesByCategory(),
  ]);

  const allRows = Object.entries(moviesByCategory).filter(([, movies]) => movies.length > 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      {featuredMovie ? (
        <HeroBanner movie={featuredMovie} userId={user.id} />
      ) : (
        <div className="h-[88vh] bg-gradient-to-b from-gray-900 to-[var(--color-bg)] flex items-center justify-center">
          <p className="text-[#555]">Nenhum filme em destaque</p>
        </div>
      )}

      <div className="relative z-10 -mt-16 pb-20">
        <ContinueWatching userId={user.id} />
        {allRows.map(([category, movies]) => (
          <MovieRow key={category} title={category} movies={movies} userId={user.id} category={category} />
        ))}
        {allRows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#555] mb-2">Nenhum conteudo cadastrado.</p>
            <a href="/admin" className="text-[var(--color-red)] text-sm hover:underline">Ir para o admin</a>
          </div>
        )}
      </div>
    </div>
  );
}