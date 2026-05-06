import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Star, Tv } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMovieById, getEpisodesBySeries, groupEpisodesBySeason } from "@/lib/movies";
import VideoPlayer from "@/components/movie/VideoPlayer";
import FavoriteButton from "@/components/movie/FavoriteButton";
import CommentSection from "@/components/movie/CommentSection";
import Navbar from "@/components/layout/Navbar";

interface Props { params: Promise<{ id: string }>; }

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const movie = await getMovieById(id);
  if (!movie) notFound();

  const isSeries = movie.type === "series";
  const episodes = isSeries ? await getEpisodesBySeries(id) : [];
  const seasons  = isSeries ? groupEpisodesBySeason(episodes) : {};

  // Busca comentários com perfil
  const { data: comments } = await supabase
    .from("comments")
    .select("id, user_id, content, created_at, profiles(username)")
    .eq("movie_id", id)
    .order("created_at", { ascending: false });

  // Rating do usuário logado
  const { data: myRatingRow } = await supabase
    .from("ratings")
    .select("score")
    .eq("movie_id", id)
    .eq("user_id", user.id)
    .single();

  // Média de ratings
  const { data: allRatings } = await supabase
    .from("ratings")
    .select("score")
    .eq("movie_id", id);

  const avgRating =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length
      : null;

  const bgImage = movie.backdrop || movie.thumbnail;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      {/* Background com blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bgImage && (
          <>
            <img src={bgImage} alt="" className="w-full h-full object-cover object-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[var(--color-bg)]/80 to-[var(--color-bg)]" />
          </>
        )}
      </div>

      <div className="relative z-10 pt-24 pb-16 max-w-6xl mx-auto px-6 lg:px-8">
        <Link href="/browse" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>

        {/* Hero */}
        {bgImage && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img src={bgImage} alt={movie.title} className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[var(--color-red)] text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded">
                  {movie.category}
                </span>
                {isSeries && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/80 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded">
                    <Tv size={12} /> SÉRIE
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl text-white leading-none drop-shadow-2xl" style={{ fontFamily: "var(--font-display)" }}>
                {movie.title}
              </h1>
            </div>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">

          {/* Poster */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <p className="text-white/75 text-base leading-relaxed mb-8 max-w-2xl">{movie.description}</p>
            <div className="flex items-center gap-3 mb-10">
              {!isSeries && (
                <a href="#player" className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition-all">
                  ▶ Assistir Agora
                </a>
              )}
              {isSeries && episodes.length > 0 && (
                <Link href={`/watch/${episodes[0].id}`} className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition-all">
                  ▶ Assistir T1E1
                </Link>
              )}
              <FavoriteButton movieId={movie.id} userId={user.id} />
            </div>
          </div>

          {/* Detalhes */}
          <div>
            {!bgImage && (
              <h1 className="text-4xl md:text-6xl text-white leading-none mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {movie.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              {movie.rating && (
                <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <Star size={14} fill="currentColor" /> {movie.rating.toFixed(1)}
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1.5 text-yellow-300/80 font-semibold text-xs">
                  ★ {avgRating.toFixed(1)}
                  <span className="text-white/25 font-normal">comunidade</span>
                </span>
              )}
              {movie.release_year && (
                <span className="flex items-center gap-1.5 text-white/60">
                  <Calendar size={14} /> {movie.release_year}
                </span>
              )}
              {!isSeries && movie.duration && (
                <span className="flex items-center gap-1.5 text-white/60">
                  <Clock size={14} /> {movie.duration} min
                </span>
              )}
              {isSeries && (
                <span className="text-blue-400">{episodes.length} episódios</span>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Sinopse</h2>
              <p className="text-white/80 text-base leading-relaxed">{movie.description}</p>
            </div>

            <div id="player">
              {isSeries ? (
                <div className="space-y-6">
                  <h2 className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    EPISÓDIOS
                  </h2>
                  {Object.keys(seasons).length === 0 ? (
                    <p className="text-[var(--color-muted)]">Nenhum episódio cadastrado ainda.</p>
                  ) : (
                    Object.entries(seasons).map(([season, eps]) => (
                      <div key={season} className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <span className="bg-[var(--color-red)] text-white text-xs px-2 py-0.5 rounded">T{season}</span>
                          Temporada {season}
                        </h3>
                        <div className="space-y-2">
                          {eps.map((ep) => (
                            <Link
                              key={ep.id}
                              href={`/watch/${ep.id}`}
                              className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group"
                            >
                              {ep.thumbnail ? (
                                <div className="w-24 h-14 flex-shrink-0 rounded overflow-hidden">
                                  <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-24 h-14 flex-shrink-0 rounded bg-white/5 flex items-center justify-center">
                                  <span className="text-[var(--color-muted)] text-xs">E{ep.episode}</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium group-hover:text-[var(--color-red)] transition-colors">
                                  {ep.episode}. {ep.title}
                                </p>
                                {ep.description && (
                                  <p className="text-[var(--color-muted)] text-xs line-clamp-1 mt-0.5">{ep.description}</p>
                                )}
                              </div>
                              {ep.duration && (
                                <span className="text-[var(--color-muted)] text-xs flex-shrink-0">{ep.duration}m</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                movie.video_url ? (
                  <VideoPlayer
                    videoUrl={movie.video_url}
                    title={movie.title}
                    thumbnail={movie.thumbnail}
                    movieId={movie.id}
                    userId={user.id}
                    duration={movie.duration}
                  />
                ) : (
                  <div className="w-full aspect-video bg-black/30 rounded-xl flex items-center justify-center border border-white/5">
                    <p className="text-[var(--color-muted)]">Vídeo não disponível</p>
                  </div>
                )
              )}
            </div>

            {/* ── Comentários e Avaliação ── */}
            <CommentSection
              movieId={movie.id}
              userId={user.id}
              initialComments={(comments as any) || []}
              initialRating={myRatingRow?.score ?? null}
              avgRating={avgRating}
              totalRatings={allRatings?.length ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}