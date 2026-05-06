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
    .select("id, title, thumbnail, collection, rating, release_year")
    .not("collection", "is", null)
    .order("collection");

  const collections: Record<string, typeof movies> = {};
  movies?.forEach((m) => {
    if (!m.collection) return;
    if (!collections[m.collection]) collections[m.collection] = [];
    collections[m.collection]!.push(m);
  });

  const entries = Object.entries(collections).filter(
    ([, ms]) => ms && ms.length >= 1
  );

  const ACCENTS: Record<string, { color: string; dim: string }> = {
    Marvel:          { color: "#e53935", dim: "rgba(229,57,53,0.08)" },
    DC:              { color: "#1e88e5", dim: "rgba(30,136,229,0.08)" },
    Disney:          { color: "#42a5f5", dim: "rgba(66,165,245,0.07)" },
    Pixar:           { color: "#fdd835", dim: "rgba(253,216,53,0.07)" },
    "Star Wars":     { color: "#ffe082", dim: "rgba(255,224,130,0.07)" },
    "Harry Potter":  { color: "#ab47bc", dim: "rgba(171,71,188,0.08)" },
    Avatar:          { color: "#26c6da", dim: "rgba(38,198,218,0.08)" },
    DreamWorks:      { color: "#29b6f6", dim: "rgba(41,182,246,0.07)" },
    Transformers:    { color: "#ffd600", dim: "rgba(255,214,0,0.07)" },
    "007":           { color: "#d4af37", dim: "rgba(212,175,55,0.08)" },
  };
  const DEFAULT_ACCENT = { color: "#ef4444", dim: "rgba(239,68,68,0.07)" };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      <div className="pt-24 pb-20 px-6 lg:px-14 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-4">
            <Layers size={24} className="text-[var(--color-red)] mb-1" />
            <h1
              className="text-5xl lg:text-6xl font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
            >
              COLEÇÕES
            </h1>
          </div>
          <span className="text-white/20 text-sm mb-1">{entries.length} coleções</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-32">
            <Layers size={56} className="text-white/8 mx-auto mb-4" />
            <p className="text-white/30 text-sm">Nenhuma coleção cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {entries.map(([collection, ms]) => {
              const accent = ACCENTS[collection] || DEFAULT_ACCENT;
              // pega até 5 capas
              const covers = ms?.slice(0, 5) ?? [];
              const count = ms?.length ?? 0;

              return (
                <Link
                  key={collection}
                  href={"/collections/" + encodeURIComponent(collection)}
                  className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: `linear-gradient(145deg, ${accent.dim}, transparent)` }}
                >
                  {/* Poster mosaic */}
                  <div className="relative h-44 overflow-hidden">
                    {covers.length === 1 && (
                      <Image
                        src={covers[0]!.thumbnail}
                        alt={collection}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105 brightness-75"
                      />
                    )}

                    {covers.length === 2 && (
                      <div className="flex h-full gap-0.5">
                        {covers.map((m) => (
                          <div key={m.id} className="relative flex-1">
                            <Image src={m.thumbnail} alt={m.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-75" />
                          </div>
                        ))}
                      </div>
                    )}

                    {covers.length >= 3 && (
                      <div className="flex h-full gap-0.5">
                        {/* destaque esquerdo */}
                        <div className="relative w-[52%]">
                          <Image src={covers[0]!.thumbnail} alt={covers[0]!.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-75" />
                        </div>
                        {/* coluna direita */}
                        <div className="flex flex-col gap-0.5 flex-1">
                          {covers.slice(1, 5).map((m) => (
                            <div key={m.id} className="relative flex-1">
                              <Image src={m.thumbnail} alt={m.title} fill className="object-cover brightness-75" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/30 to-transparent" />

                    {/* Accent bar top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
                      style={{ background: accent.color }}
                    />
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2
                        className="text-white text-base font-bold tracking-wide truncate group-hover:text-white transition-colors"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
                      >
                        {collection.toUpperCase()}
                      </h2>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 transition-opacity"
                        style={{
                          color: accent.color,
                          background: accent.dim,
                          border: `1px solid ${accent.color}30`,
                        }}
                      >
                        {count} {count === 1 ? "filme" : "filmes"}
                      </span>
                    </div>

                    {/* Mini preview títulos */}
                    <p className="text-white/25 text-[11px] mt-1 truncate">
                      {covers
                        .slice(0, 3)
                        .map((m) => m.title)
                        .join(", ")}
                      {count > 3 ? ` +${count - 3}` : ""}
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