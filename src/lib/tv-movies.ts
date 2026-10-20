// src/lib/tv-movies.ts
//
// Consultas enxutas para a página /tv.
// Antes: select("*") em 8 categorias × 50 linhas (descrição, video_url, etc.)
// serializado inteiro para o cliente. Agora só as colunas que a TV desenha.

import { createClient } from "@/lib/supabase/server";

export interface TVMovie {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  type?: "movie" | "series";
  rating?: number;
  release_year?: number;
}

export interface TVFeatured {
  id: string;
  title: string;
  description?: string;
  backdrop: string;
}

const CATEGORIES = ["Acao", "Ficcao", "Terror", "Comedia", "Romance", "Animacao", "Drama", "Outros"];
const POOL_SIZE = 50; // últimos títulos considerados por categoria
const PER_ROW = 24;   // quantos vão para a linha (embaralhados)

// Fisher-Yates (o sort(() => Math.random() - 0.5) antigo embaralha de forma enviesada)
function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export async function getTVMoviesByCategory(): Promise<Record<string, TVMovie[]>> {
  const supabase = await createClient();

  const results = await Promise.all(
    CATEGORIES.map((cat) =>
      supabase
        .from("movies")
        .select("id,title,thumbnail,category,type,rating,release_year")
        .eq("category", cat)
        .order("created_at", { ascending: false })
        .limit(POOL_SIZE)
    )
  );

  const byCategory: Record<string, TVMovie[]> = {};
  results.forEach((res, i) => {
    if (res.data && res.data.length > 0) {
      byCategory[CATEGORIES[i]] = shuffle(res.data as TVMovie[]).slice(0, PER_ROW);
    }
  });
  return byCategory;
}

export async function getTVFeatured(): Promise<TVFeatured | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movies")
    .select("id,title,description,backdrop")
    .not("backdrop", "is", null)
    .not("backdrop", "eq", "")
    .eq("type", "movie")
    .order("created_at", { ascending: false })
    .limit(POOL_SIZE);

  if (!data || data.length === 0) return null;

  const pick = data[Math.floor(Math.random() * data.length)] as TVFeatured;
  return {
    ...pick,
    description: pick.description ? pick.description.slice(0, 240) : undefined,
  };
}
