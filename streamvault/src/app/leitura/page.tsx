import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default async function LeituraPage({ searchParams }: { searchParams: Promise<{ q?: string; tipo?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let query = supabase.from("comics").select("*").order("created_at", { ascending: false });
  if (params.q) query = query.ilike("title", `%${params.q}%`);
  if (params.tipo) query = query.eq("type", params.tipo);

  const { data: comics } = await query;

  const tipos = [
    { value: "", label: "Todos" },
    { value: "manga", label: "Mangá" },
    { value: "comic", label: "Quadrinho" },
    { value: "book", label: "Livro" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 px-8 lg:px-16 pb-16">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Biblioteca</p>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              LEITURA
              <span className="text-[#555] text-sm font-normal ml-3">{comics?.length || 0} títulos</span>
            </h1>
          </div>
          <form method="GET" className="flex gap-2 flex-wrap">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Buscar título..."
              className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[#555] text-sm w-52 focus:outline-none focus:border-white/30 transition-colors"
            />
            <select
              name="tipo"
              defaultValue={params.tipo}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
            >
              {tipos.map(t => <option key={t.value} value={t.value} className="bg-[#111]">{t.label}</option>)}
            </select>
            <button type="submit" className="bg-[var(--color-red)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Buscar
            </button>
            {(params.q || params.tipo) && (
              <a href="/leitura" className="px-4 py-2 rounded-lg text-sm text-[#555] hover:text-white border border-white/10 transition-colors">
                Limpar
              </a>
            )}
          </form>
        </div>

        {!comics || comics.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-[#555] mb-4">Nenhum título cadastrado ainda.</p>
            <Link href="/admin/leitura" className="text-[var(--color-red)] text-sm hover:underline">
              Adicionar conteúdo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {comics.map((comic) => (
              <Link key={comic.id} href={"/leitura/" + comic.id} className="group block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] mb-2 shadow-lg">
                  {comic.cover_url ? (
                    <img
                      src={comic.cover_url}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-20">📖</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={`absolute top-2 left-2 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    comic.type === "manga" ? "bg-pink-600" :
                    comic.type === "comic" ? "bg-yellow-600" :
                    "bg-blue-600"
                  }`}>
                    {comic.type === "manga" ? "Mangá" : comic.type === "comic" ? "HQ" : "Livro"}
                  </div>
                  {comic.status === "completed" && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Completo
                    </div>
                  )}
                </div>
                <h3 className="text-white/90 text-xs font-medium line-clamp-2 group-hover:text-[var(--color-red)] transition-colors leading-tight">
                  {comic.title}
                </h3>
                {comic.author && <p className="text-[#555] text-[11px] mt-0.5">{comic.author}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}