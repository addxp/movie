import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, thumbnail, collection, rating")
    .not("collection", "is", null)
    .order("collection");

  // Agrupa por collection
  const collections: Record<string, typeof movies> = {};
  movies?.forEach(m => {
    if (!m.collection) return;
    if (!collections[m.collection]) collections[m.collection] = [];
    collections[m.collection]!.push(m);
  });

  const entries = Object.entries(collections).filter(([, movies]) => movies && movies.length >= 1);

  const COLLECTION_COLORS: Record<string, string> = {
    Marvel: "from-red-900/60 to-red-950/30 border-red-500/20",
    DC: "from-blue-900/60 to-blue-950/30 border-blue-500/20",
    Disney: "from-blue-800/40 to-blue-950/30 border-blue-400/20",
    Pixar: "from-yellow-900/40 to-yellow-950/30 border-yellow-500/20",
    "Star Wars": "from-yellow-900/40 to-gray-950/30 border-yellow-400/20",
    "Harry Potter": "from-purple-900/50 to-purple-950/30 border-purple-500/20",
    Avatar: "from-cyan-900/50 to-cyan-950/30 border-cyan-500/20",
    Transformers: "from-yellow-900/40 to-gray-950/30 border-yellow-400/20",
  };

  const DEFAULT_COLOR = "from-gray-900/60 to-gray-950/30 border-white/10";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Layers size={28} className="text-[var(--color-red)]" />
          <h1 className="text-5xl text-white" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
            COLECOES
          </h1>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24">
            <Layers size={64} className="text-white/10 mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">Nenhuma colecao cadastrada ainda.</p>
            <p className="text-[var(--color-muted)] text-sm mt-2">Adicione filmes com o campo Colecao no admin.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map(([collection, movies]) => {
              const colorClass = COLLECTION_COLORS[collection] || DEFAULT_COLOR;
              return (
                <Link
                  key={collection}
                  href={"/collections/" + encodeURIComponent(collection)} // ✅ corrigido: era /collection/
                  className={"group relative rounded-2xl overflow-hidden border bg-gradient-to-br " + colorClass + " hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl"}
                >
                  {/* Grid de capas */}
                  <div className="grid grid-cols-4 gap-0.5 p-4 pb-0">
                    {movies?.slice(0, 4).map((m, i) => (
                      <div key={m.id} className={"relative aspect-[2/3] rounded-lg overflow-hidden " + (i === 0 ? "col-span-2 row-span-2" : "")}>
                        <Image src={m.thumbnail} alt={m.title} fill className="object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-3">
                    <h2 className="text-white text-xl font-bold group-hover:text-[var(--color-red)] transition-colors" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                      {collection.toUpperCase()}
                    </h2>
                    <p className="text-[var(--color-muted)] text-sm">
                      {movies?.length} {movies?.length === 1 ? "filme" : "filmes"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}