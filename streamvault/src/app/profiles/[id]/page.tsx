import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Star, Film, Calendar } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Busca perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  // Busca email do auth (só funciona pro próprio usuário ou admin)
  const isOwn = user.id === id;

  // Busca favoritos com dados do filme
  const { data: favorites } = await supabase
    .from("favorites")
    .select("movie_id, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const movieIds = favorites?.map((f) => f.movie_id) ?? [];

  let favMovies: any[] = [];
  if (movieIds.length > 0) {
    const { data } = await supabase
      .from("movies")
      .select("id, title, thumbnail, rating, release_year, type")
      .in("id", movieIds);
    // Mantém ordem dos favoritos
    favMovies = movieIds
      .map((mid) => data?.find((m) => m.id === mid))
      .filter(Boolean);
  }

  // Busca ratings do usuário
  const { data: ratings } = await supabase
    .from("ratings")
    .select("movie_id, score")
    .eq("user_id", id);

  const avgScore =
    ratings && ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
      : null;

  const displayName = profile?.username || `Usuário ${id.slice(0, 6)}`;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      <div className="pt-24 pb-20 px-6 lg:px-14 max-w-5xl mx-auto">

        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </Link>

        {/* ── Header do perfil ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-white/5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile?.avatar_url ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/10">
                <Image src={profile.avatar_url} alt={displayName} width={80} height={80} className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-red)]/20 border border-[var(--color-red)]/30 flex items-center justify-center">
                <span className="text-[var(--color-red)] text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-3xl font-black text-white"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
              >
                {displayName.toUpperCase()}
              </h1>
              {isOwn && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
                  Você
                </span>
              )}
            </div>
            {profile?.bio && (
              <p className="text-white/40 text-sm mt-1.5 leading-relaxed max-w-lg">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Heart size={13} className="text-[var(--color-red)]" />
                <span className="text-white font-bold text-sm">{favMovies.length}</span>
                <span className="text-white/30 text-sm">favoritos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={13} className="text-yellow-400" />
                <span className="text-white font-bold text-sm">{ratings?.length ?? 0}</span>
                <span className="text-white/30 text-sm">avaliações</span>
              </div>
              {avgScore && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold text-sm">★ {avgScore}</span>
                  <span className="text-white/30 text-sm">média</span>
                </div>
              )}
            </div>
          </div>

          {/* Editar perfil (só dono) */}
          {isOwn && (
            <Link
              href="/profile/edit"
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all"
            >
              Editar perfil
            </Link>
          )}
        </div>

        {/* ── Favoritos ── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Heart size={16} className="text-[var(--color-red)]" />
            <h2 className="text-white font-bold text-lg">Favoritos</h2>
            <span className="text-[10px] font-bold bg-white/5 text-white/30 px-2 py-0.5 rounded-full border border-white/8">
              {favMovies.length}
            </span>
          </div>

          {favMovies.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                <Heart size={22} className="text-white/10" />
              </div>
              <p className="text-white/25 text-sm">
                {isOwn ? "Você ainda não favoritou nenhum filme." : "Nenhum favorito ainda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {favMovies.map((movie) => {
                const userRating = ratings?.find((r) => r.movie_id === movie.id);
                return (
                  <Link
                    key={movie.id}
                    href={"/movie/" + movie.id}
                    className="group relative block"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] mb-2">
                      {movie.thumbnail && (
                        <Image
                          src={movie.thumbnail}
                          alt={movie.title}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Rating do usuário */}
                      {userRating && (
                        <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                          <Star size={9} className="text-yellow-400" fill="currentColor" />
                          <span className="text-white text-[10px] font-bold">{userRating.score}</span>
                        </div>
                      )}

                      {/* Heart */}
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-red)]/80 flex items-center justify-center">
                        <Heart size={10} fill="white" className="text-white" />
                      </div>

                      {/* Play hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-200">
                          <Film size={14} fill="black" stroke="none" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-white/25 text-[10px] mt-0.5">{movie.release_year}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}