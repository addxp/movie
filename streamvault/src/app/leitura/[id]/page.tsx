import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function LeituraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: comic } = await supabase.from("comics").select("*").eq("id", id).single();
  if (!comic) redirect("/leitura");

  const { data: chapters } = await supabase
    .from("comic_chapters")
    .select("*")
    .eq("comic_id", id)
    .order("chapter_number", { ascending: true });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      {comic.cover_url && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={comic.cover_url} alt="" className="w-full h-full object-cover opacity-10 blur-2xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-bg)]/90 to-[var(--color-bg)]" />
        </div>
      )}

      <div className="relative z-10 pt-24 pb-16 max-w-6xl mx-auto px-6 lg:px-8">
        <Link href="/leitura" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10">
          <div className="flex flex-col gap-4">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {comic.cover_url ? (
                <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                  <BookOpen size={40} className="text-white/20" />
                </div>
              )}
            </div>
            {chapters && chapters.length > 0 && (
              <Link
                href={`/leitura/${id}/ler/${chapters[0].id}`}
                className="flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity w-full"
              >
                <BookOpen size={16} /> Ler agora
              </Link>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-white text-xs font-bold px-2 py-0.5 rounded uppercase ${
                comic.type === "manga" ? "bg-pink-600" : comic.type === "comic" ? "bg-yellow-600" : "bg-blue-600"
              }`}>
                {comic.type === "manga" ? "Mangá" : comic.type === "comic" ? "HQ" : "Livro"}
              </span>
              {comic.status === "completed" && (
                <span className="text-white text-xs font-bold px-2 py-0.5 rounded uppercase bg-green-600">Completo</span>
              )}
              {comic.category && (
                <span className="text-[#888] text-xs px-2 py-0.5 rounded border border-white/10">{comic.category}</span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl text-white leading-none mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {comic.title}
            </h1>

            {comic.author && (
              <p className="text-[#888] text-sm mb-4">por <span className="text-white/80">{comic.author}</span></p>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm text-white/60">
              <span><BookOpen size={14} className="inline mr-1" />{chapters?.length || 0} capítulos</span>
            </div>

            {comic.description && (
              <div className="mb-8">
                <h2 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Sinopse</h2>
                <p className="text-white/75 text-sm leading-relaxed">{comic.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-white font-bold text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>CAPÍTULOS</h2>
              {!chapters || chapters.length === 0 ? (
                <p className="text-[#555]">Nenhum capítulo ainda.</p>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                  {chapters.map((ch) => (
                    <Link
                      key={ch.id}
                      href={`/leitura/${id}/ler/${ch.id}`}
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--color-red)] text-xs font-bold w-10">#{ch.chapter_number}</span>
                        <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                          {ch.title || `Capítulo ${ch.chapter_number}`}
                        </span>
                        {ch.pdf_url && <span className="text-blue-400 text-[10px] uppercase">PDF</span>}
                      </div>
                      <span className="text-[#555] text-xs">{ch.pdf_url ? "PDF" : (ch.pages?.length || 0) + " págs"}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}