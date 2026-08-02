import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Trophy, Play, TrendingUp, Eye } from "lucide-react";

export default async function TopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: topRated }, { data: mostViewed }] = await Promise.all([
    supabase
      .from("movies")
      .select("*")
      .eq("type", "movie")
      .not("rating", "is", null)
      .order("rating", { ascending: false })
      .limit(10),
    supabase
      .from("movies")
      .select("*")
      .eq("type", "movie")
      .order("views", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-20 px-8 lg:px-16 max-w-6xl mx-auto">

        <div className="flex items-center gap-3 mb-10">
          <Trophy size={28} className="text-yellow-400" />
          <h1 className="text-4xl text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>
            TOP FILMES
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Top 10 mais bem avaliados */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-yellow-400" />
              <h2 className="text-white font-bold text-lg">Mais Bem Avaliados</h2>
            </div>
            <div className="space-y-3">
              {topRated?.map((movie, i) => (
                <Link
                  key={movie.id}
                  href={"/movie/" + movie.id}
                  className="flex items-center gap-4 bg-[var(--color-card)] rounded-xl p-3 border border-white/5 hover:border-white/15 transition-all group"
                >
                  {/* Número */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400 text-black" :
                    i === 1 ? "bg-gray-300 text-black" :
                    i === 2 ? "bg-amber-600 text-white" :
                    "bg-white/5 text-[#555]"
                  }`}>
                    {i + 1}
                  </div>

                  {/* Thumb */}
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover" unoptimized />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate group-hover:text-[var(--color-red)] transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-[#555] text-xs">{movie.release_year} · {movie.category}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-yellow-400 text-sm font-bold">★ {movie.rating?.toFixed(1)}</span>
                  </div>

                  <Play size={14} className="text-[#333] group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Top 10 mais assistidos */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-[var(--color-red)]" />
              <h2 className="text-white font-bold text-lg">Mais Assistidos</h2>
            </div>
            <div className="space-y-3">
              {mostViewed?.map((movie, i) => (
                <Link
                  key={movie.id}
                  href={"/movie/" + movie.id}
                  className="flex items-center gap-4 bg-[var(--color-card)] rounded-xl p-3 border border-white/5 hover:border-white/15 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    i === 0 ? "bg-[var(--color-red)] text-white" :
                    i === 1 ? "bg-red-800 text-white" :
                    i === 2 ? "bg-red-900 text-white" :
                    "bg-white/5 text-[#555]"
                  }`}>
                    {i + 1}
                  </div>

                  <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover" unoptimized />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate group-hover:text-[var(--color-red)] transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-[#555] text-xs">{movie.release_year} · {movie.category}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Eye size={12} className="text-[#555]" />
                    <span className="text-[#555] text-xs">{(movie.views || 0).toLocaleString()}</span>
                  </div>

                  <Play size={14} className="text-[#333] group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}