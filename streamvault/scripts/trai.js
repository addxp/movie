// scripts/fetch-trailers.mjs
// Uso: node scripts/fetch-trailers.mjs
//
// Variáveis necessárias (crie um .env.local ou exporte antes de rodar):
//   TMDB_API_KEY=sua_chave_aqui
//   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const TMDB_KEY    = process.env.TMDB_API_KEY;
const SUPA_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!TMDB_KEY || !SUPA_URL || !SUPA_KEY) {
  console.error("❌ Faltam variáveis de ambiente. Verifique .env.local");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_KEY);

// Busca trailer no TMDB pelo tmdb_id
async function fetchTrailer(tmdbId, type = "movie") {
  const endpoint = type === "series"
    ? `https://api.themoviedb.org/3/tv/${tmdbId}/videos`
    : `https://api.themoviedb.org/3/movie/${tmdbId}/videos`;

  const res = await fetch(`${endpoint}?api_key=${TMDB_KEY}&language=pt-BR`);
  const data = await res.json();

  // Tenta trailer em português primeiro, depois inglês
  let trailer = data.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  // Se não achou em pt-BR, tenta em inglês
  if (!trailer) {
    const resEn = await fetch(`${endpoint}?api_key=${TMDB_KEY}&language=en-US`);
    const dataEn = await resEn.json();
    trailer = dataEn.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
    
    // Se não tiver trailer, pega qualquer vídeo do YouTube
    if (!trailer) {
      trailer = dataEn.results?.find(v => v.site === "YouTube");
    }
  }

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

async function main() {
  console.log("🎬 Buscando filmes sem trailer_url...\n");

  // Busca filmes que têm tmdb_id mas não têm trailer_url
  const { data: movies, error } = await supabase
    .from("movies")
    .select("id, title, tmdb_id, type, trailer_url")
    .not("tmdb_id", "is", null)
    .or("trailer_url.is.null,trailer_url.eq.NULL");

  if (error) {
    console.error("❌ Erro ao buscar filmes:", error.message);
    process.exit(1);
  }

  console.log(`📋 ${movies.length} filmes para processar\n`);

  let updated = 0;
  let failed  = 0;
  let skipped = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const progress = `[${i + 1}/${movies.length}]`;

    // Rate limit: TMDB permite ~40 req/s, mas vamos conservar
    if (i > 0 && i % 40 === 0) {
      console.log("⏳ Aguardando 1s (rate limit)...");
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const trailerUrl = await fetchTrailer(movie.tmdb_id, movie.type);

      if (!trailerUrl) {
        console.log(`${progress} ⚠️  Sem trailer: ${movie.title}`);
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase
        .from("movies")
        .update({ trailer_url: trailerUrl })
        .eq("id", movie.id);

      if (updateError) {
        console.error(`${progress} ❌ Erro ao salvar ${movie.title}:`, updateError.message);
        failed++;
      } else {
        console.log(`${progress} ✅ ${movie.title} → ${trailerUrl}`);
        updated++;
      }
    } catch (err) {
      console.error(`${progress} ❌ Falha em ${movie.title}:`, err.message);
      failed++;
    }
  }

  console.log("\n═══════════════════════════════");
  console.log(`✅ Atualizados : ${updated}`);
  console.log(`⚠️  Sem trailer : ${skipped}`);
  console.log(`❌ Erros       : ${failed}`);
  console.log("═══════════════════════════════\n");
}

main();
