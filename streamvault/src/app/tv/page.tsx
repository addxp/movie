// src/app/tv/page.tsx
//
// Página otimizada para TV do StreamVault.
// Acesse em: /tv
//
// Navegação:
//   ← → : move dentro da linha
//   ↑ ↓ : troca de linha / seção
//   Enter: abre o título
//   Backspace/Esc: volta ao início (row 0)
//
// Dependências adicionadas:
//   src/hooks/useTVNavigation.ts   ← hook de D-pad
//   src/components/tv/TVMovieCard.tsx ← card TV

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMoviesByCategory, getFeaturedMovie } from "@/lib/movies";
import TVPageClient from "./TVPageClient";

export default async function TVPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [featuredMovie, moviesByCategory] = await Promise.all([
    getFeaturedMovie(),
    getMoviesByCategory(),
  ]);

  return (
    <TVPageClient
      user={user}
      featuredMovie={featuredMovie}
      moviesByCategory={moviesByCategory}
    />
  );
}