// src/app/tv/page.tsx
//
// Página otimizada para TV do StreamVault.  Acesse em: /tv
//
// Controle remoto:
//   ← → ↑ ↓  navegam (inclui busca e menu lateral)
//   OK/Enter abre o item
//   Voltar   fecha busca / sai do menu / volta ao topo

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTVMoviesByCategory, getTVFeatured } from "@/lib/tv-movies";
import TVPageClient from "./TVPageClient";

export default async function TVPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [featured, moviesByCategory] = await Promise.all([
    getTVFeatured(),
    getTVMoviesByCategory(),
  ]);

  // Só o que a TV usa vai para o cliente (antes o objeto User inteiro era serializado)
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  return (
    <TVPageClient
      user={{ email: user.email ?? "", name }}
      featured={featured}
      moviesByCategory={moviesByCategory}
    />
  );
}
