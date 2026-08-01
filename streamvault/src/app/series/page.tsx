import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Play } from "lucide-react";
import HowToWatchModal from "@/components/ui/HowToWatchModal";

export default async function SeriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: series } = await supabase
    .from("movies")
    .select("*")
    .eq("type", "series")
    .neq("category", "Animacao")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 px-8 lg:px-16 pb-16">
        <div className="mb-8">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Catálogo</p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            SÉRIES
          </h1>
          <HowToWatchModal />
        </div>

        {!series || series.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📺</p>
            <p className="text-[#555]">Nenhuma série cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
            {series.map((s) => (
              <Link key={s.id} href={"/movie/" + s.id} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                  <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <Play size={14} fill="black" className="ml-0.5" />
                    </div>
                  </div>
                  {s.rating && (
                    <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ★ {s.rating.toFixed(1)}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    série
                  </div>
                </div>
                <h3 className="text-white/90 text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">{s.title}</h3>
                <p className="text-[#555] text-[11px]">{s.release_year}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}