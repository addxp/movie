import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Play } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false });

  if (!movies || movies.length === 0) notFound();

  return (
    <div className="zone-noir min-h-screen bg-[var(--bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-8 lg:px-16">
        <div className="mb-8">
          <Link href="/browse" className="inline-flex items-center gap-2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Voltar
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl text-[var(--text)] font-bold uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>{category}</h1>
            <span className="text-[var(--text-3)] text-sm font-mono">{movies.length} titulos</span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2">
          {movies.map((movie) => (
            <Link key={movie.id} href={"/movie/" + movie.id} className="group block">
              <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-[var(--bg-4)] mb-1.5 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                <Image
                  src={movie.thumbnail}
                  alt={movie.title}
                  fill
                  className="object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <div className="w-9 h-9 bg-[var(--red)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-[0_4px_16px_var(--red-glow)]">
                    <Play size={13} fill="#fff" className="ml-0.5" />
                  </div>
                </div>
                {movie.rating && (
                  <div className="absolute top-1.5 left-1.5 bg-black/85 text-[var(--red-2)] text-[9px] font-mono font-bold px-1 py-0.5 rounded border border-[var(--red-border)]">
                    ★ {movie.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <h3 className="text-[var(--text-2)] text-[11px] font-medium line-clamp-1 group-hover:text-[var(--red)] transition-colors">{movie.title}</h3>
              <p className="text-[var(--text-4)] text-[10px] font-mono">{movie.release_year}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}