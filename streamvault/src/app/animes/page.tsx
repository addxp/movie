import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const POR_PAGINA = 48;

export default async function AnimesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.page || "1"));
  const from = (pagina - 1) * POR_PAGINA;
  const to = from + POR_PAGINA - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: animes, count } = await supabase
    .from("movies")
    .select("*", { count: "exact" })
    .eq("type", "series")
    .eq("category", "Animacao")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPaginas = Math.ceil((count || 0) / POR_PAGINA);

  const gerarPaginas = () => {
    const paginas: (number | "...")[] = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      if (pagina > 3) paginas.push("...");
      for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPaginas - 1, pagina + 1); i++) paginas.push(i);
      if (pagina < totalPaginas - 2) paginas.push("...");
      paginas.push(totalPaginas);
    }
    return paginas;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 px-8 lg:px-16 pb-16">
        <div className="mb-8">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Catálogo</p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            ANIMES
            <span className="text-[#555] text-sm font-normal ml-3">{count || 0} títulos</span>
          </h1>
        </div>

        {!animes || animes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎌</p>
            <p className="text-[#555]">Nenhum anime cadastrado ainda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {animes.map((a) => (
                <Link key={a.id} href={"/movie/" + a.id} className="group block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                    <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <Play size={14} fill="black" className="ml-0.5" />
                      </div>
                    </div>
                    {a.rating && (
                      <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ★ {a.rating.toFixed(1)}
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-pink-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      anime
                    </div>
                  </div>
                  <h3 className="text-white/90 text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">{a.title}</h3>
                  <p className="text-[#555] text-[11px]">{a.release_year}</p>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Link
                  href={`/animes?page=${pagina - 1}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    pagina === 1 ? "opacity-30 pointer-events-none bg-white/5" : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <ChevronLeft size={16} />
                </Link>

                {gerarPaginas().map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="text-[#555] text-sm px-1">...</span>
                  ) : (
                    <Link
                      key={i}
                      href={`/animes?page=${p}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors ${
                        p === pagina
                          ? "bg-[var(--color-red)] text-white font-bold"
                          : "bg-white/5 hover:bg-white/10 text-white/70"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

                <Link
                  href={`/animes?page=${pagina + 1}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    pagina === totalPaginas ? "opacity-30 pointer-events-none bg-white/5" : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}

            <p className="text-center text-[#555] text-xs mt-4">
              Página {pagina} de {totalPaginas}
            </p>
          </>
        )}
      </div>
    </div>
  );
}