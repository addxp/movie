 import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Play } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = decodeURIComponent(slug);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .eq("collection", collection)
    .order("release_year", { ascending: true });

  if (!movies || movies.length === 0) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-8 lg:px-16">
        <div className="mb-8">
          <Link href="/collections" className="inline-flex items-center gap-2 text-[#555] hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Voltar para Colecoes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl text-white font-bold">{collection}</h1>
            <span className="text-[#555] text-sm">{movies.length} filmes</span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3">
          {movies.map((movie) => (
            <Link key={movie.id} href={"/movie/" + movie.id} className="group block">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                <Image
                  src={movie.thumbnail}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
