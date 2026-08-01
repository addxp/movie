import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import AddMovieForm from "@/components/admin/AddMovieForm";
import AdminMovieList from "@/components/admin/AdminMovieList";
import AddChannelForm from "@/components/admin/AddChannelForm";
import AdminChannelList from "@/components/admin/AdminChannelList";
import { Shield } from "lucide-react";
import type { Movie } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: adminData } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!adminData) redirect("/browse");

  const [{ data: movies, count }, { data: channels }] = await Promise.all([
    supabase
      .from("movies")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, 99),
    supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-8 lg:px-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={28} className="text-[var(--color-red)]" />
          <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Painel Admin
          </h1>
        </div>

        {/* Filmes e Series */}
        <div className="mb-12">
          <h2 className="text-2xl text-white font-bold mb-6 pb-2 border-b border-white/10" style={{ fontFamily: "var(--font-display)" }}>
            FILMES E SERIES
          </h2>
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            <div>
              <p className="text-[var(--color-muted)] text-sm mb-4">{count || 0} itens cadastrados</p>
              <AdminMovieList movies={(movies as Movie[]) || []} totalCount={count || 0} />
            </div>
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Adicionar Filme/Serie</h3>
              <AddMovieForm />
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="mb-12">
          <h2 className="text-2xl text-white font-bold mb-6 pb-2 border-b border-white/10" style={{ fontFamily: "var(--font-display)" }}>
            CANAIS AO VIVO
          </h2>
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            <div>
              <p className="text-[var(--color-muted)] text-sm mb-4">{channels?.length || 0} canais cadastrados</p>
              <AdminChannelList channels={channels || []} />
            </div>
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Adicionar Canal</h3>
              <AddChannelForm />
            </div>
          </div>
        </div>

        {/* Leitura */}
        <div>
          <h2 className="text-2xl text-white font-bold mb-6 pb-2 border-b border-white/10" style={{ fontFamily: "var(--font-display)" }}>
            LEITURA
          </h2>
          <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-xl border border-white/5">
            <div>
              <p className="text-white font-medium mb-1">Mangás, Quadrinhos e Livros</p>
              <p className="text-[var(--color-muted)] text-sm">Adicione títulos e faça upload de capítulos em ZIP</p>
            </div>
            <a
              href="/admin/leitura"
              className="flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Gerenciar
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}