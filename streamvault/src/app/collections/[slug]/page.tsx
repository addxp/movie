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
      <div className="pt-24 pb-16 px-8 lg:px-16 max-w-[1800px] mx-auto">
        <div className="mb-8">
          <Link href="/browse" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft size={15} /> Voltar
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl text-white" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
              {collection}
            </h1>
            <span className="text-[var(--color-muted)] text-sm bg-white/5 px-3 py-1 rounded-full">
              {movies.length} filmes
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {movies.map((movie) => (
            <Link key={movie.id} href={"/movie/" + movie.id} className="group relative block">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1c1c1c] mb-2">
                <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Play size={14} fill="black" className="ml-0.5" />
                  </div>
                </div>
                {movie.rating && (
                  <div className="absolute top-1.5 left-1.5 bg-black/75 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ★ {movie.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <h3 className="text-white text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">{movie.title}</h3>
              <p className="text-[var(--color-muted)] text-[11px]">{movie.release_year}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}