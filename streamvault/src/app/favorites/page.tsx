import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserFavorites } from "@/lib/movies";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Heart, Play } from "lucide-react";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const favorites = await getUserFavorites(user.id);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-8 lg:px-16">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={28} className="text-[var(--color-red)]" fill="currentColor" />
          <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>Meus Favoritos</h1>
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={64} className="text-white/10 mx-auto mb-6" />
            <p className="text-xl text-[var(--color-muted)] mb-4">Você ainda não tem favoritos</p>
            <Link href="/browse" className="text-[var(--color-red)] hover:underline">Explorar filmes →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`} className="group relative rounded-lg overflow-hidden bg-[var(--color-card)] hover:ring-2 hover:ring-[var(--color-red)] transition-all duration-300">
                <div className="relative aspect-[2/3]">
                  <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={24} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-medium line-clamp-1">{movie.title}</p>
                  <p className="text-[var(--color-muted)] text-xs">{movie.category}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}