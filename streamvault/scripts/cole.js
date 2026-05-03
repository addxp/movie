const SUPABASE_URL = "https://qbphqysjgwwfvusrcsdl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGhxeXNqZ3d3ZnZ1c3Jjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjI5ODAsImV4cCI6MjA5MjczODk4MH0.0OXppIP0GkNVYmEajqcUoIzsCoDgE-OAeOAS1Gc_458";

// ============================================================
// REGRAS DE DETECÇÃO — adicione suas próprias aqui!
// ============================================================
const COLLECTION_RULES = [
  // Marvel
  {
    collection: "Marvel",
    keywords: ["avenger", "iron man", "thor", "captain america", "spider-man", "spider man",
      "black panther", "doctor strange", "ant-man", "ant man", "guardians of the galaxy",
      "guardians da galaxia", "guardioes", "capitao america", "homem de ferro", "homem aranha",
      "pantera negra", "doutor estranho", "vingadores", "hulk", "eternos", "eternals",
      "black widow", "viuva negra", "shang-chi", "wakanda", "moonknight", "she-hulk",
      "ms marvel", "hawkeye", "wandavision", "loki", "falcon", "winter soldier", "werewolf",
      "thor", "nova", "blade", "deadpool", "wolverine", "x-men", "x men", "fantásticos",
      "fantastic four", "quarteto", "incrivel hulk"]
  },
  // DC
  {
    collection: "DC",
    keywords: ["batman", "superman", "wonder woman", "mulher maravilha", "aquaman",
      "flash", "shazam", "suicide squad", "esquadrao suicida", "justice league",
      "liga da justica", "green lantern", "lanterna verde", "black adam", "adao negro",
      "joker", "coringa", "harley quinn", "zatanna", "blue beetle", "besouro azul",
      "supergirl", "supermulher", "swamp thing", "constantine", "sandman", "cyborg",
      "robin", "nightwing", "batgirl", "catwoman", "mulher gato", "watchmen", "v for vendetta"]
  },
  // Avatar
  {
    collection: "Avatar",
    keywords: ["avatar", "pandora", "na'vi"]
  },
  // Transformers
  {
    collection: "Transformers",
    keywords: ["transformers", "optimus", "bumblebee", "autobots", "decepticons"]
  },
  // Harry Potter
  {
    collection: "Harry Potter",
    keywords: ["harry potter", "fantastic beasts", "animais fantasticos", "hogwarts",
      "wizarding world", "dumbledore", "grindelwald", "newt scamander"]
  },
  // Star Wars
  {
    collection: "Star Wars",
    keywords: ["star wars", "guerra nas estrelas", "jedi", "sith", "skywalker",
      "mandalorian", "clone wars", "rogue one", "solo", "obi-wan", "andor"]
  },
  // Disney
  {
    collection: "Disney",
    keywords: ["disney", "zootopia", "moana", "frozen", "toy story", "buzz lightyear",
      "cars", "ratatouille", "up", "wall-e", "inside out", "divertida mente",
      "coco", "soul", "onward", "turning red", "encanto", "brave", "valente",
      "tangled", "enrolados", "lion king", "rei leao", "jungle book", "cinderela",
      "cinderella", "mulan", "aladdin", "tarzan", "hercules", "bambi"]
  },
  // Pixar
  {
    collection: "Pixar",
    keywords: ["pixar", "toy story", "buzz lightyear", "cars", "ratatouille",
      "wall-e", "up", "inside out", "divertida mente", "coco", "soul",
      "onward", "turning red", "brave", "valente", "monsters", "monstros",
      "finding nemo", "procurando nemo", "finding dory", "procurando dory",
      "incredibles", "incriveis", "a bug's life", "vida de inseto"]
  },
  // Fast & Furious
  {
    collection: "Velocidade Furiosa",
    keywords: ["fast", "furious", "velozes", "furiosos", "fast & furious",
      "hobbs", "shaw", "dominic toretto", "vin diesel"]
  },
  // John Wick
  {
    collection: "John Wick",
    keywords: ["john wick", "baba yaga", "continental"]
  },
  // Pirates of the Caribbean
  {
    collection: "Piratas do Caribe",
    keywords: ["pirates of the caribbean", "piratas do caribe", "jack sparrow",
      "davy jones", "perola negra"]
  },
  // James Bond
  {
    collection: "James Bond",
    keywords: ["james bond", "007", "bond", "spectre", "skyfall", "casino royale",
      "quantum of solace", "goldfinger", "thunderball"]
  },
  // Matrix
  {
    collection: "Matrix",
    keywords: ["matrix", "neo", "morpheus", "trinity", "agent smith"]
  },
  // Lord of the Rings
  {
    collection: "Senhor dos Aneis",
    keywords: ["lord of the rings", "senhor dos aneis", "hobbit", "fellowship",
      "two towers", "return of the king", "frodo", "gandalf", "tolkien",
      "rings of power", "aneis de poder"]
  },
  // Mission Impossible
  {
    collection: "Missao Impossivel",
    keywords: ["mission impossible", "missao impossivel", "ethan hunt", "tom cruise imf"]
  },
  // Jurassic Park
  {
    collection: "Jurassic",
    keywords: ["jurassic park", "jurassic world", "dinosaur", "dinossauro",
      "jurassic", "dominion"]
  },
  // Planet of the Apes
  {
    collection: "Planeta dos Macacos",
    keywords: ["planet of the apes", "planeta dos macacos", "caesar", "cesar macacos"]
  },
  // Godzilla / MonsterVerse
  {
    collection: "MonsterVerse",
    keywords: ["godzilla", "king kong", "kong", "monsterverse", "kaiju", "godzilla x kong"]
  },
];

// ============================================================
// BUSCA COM PAGINAÇÃO REAL — corrige o limite de 100 registros
// ============================================================
async function fetchAllMovies() {
  const PAGE_SIZE = 1000;
  let all = [];
  let from = 0;

  console.log("Buscando filmes em páginas de " + PAGE_SIZE + "...");

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const res = await fetch(
      SUPABASE_URL + "/rest/v1/movies?select=id,title,collection",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Range-Unit": "items",
          "Range": from + "-" + to,
          "Prefer": "count=none",
        },
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("❌ Erro ao buscar filmes — status " + res.status + ": " + errBody);
      break;
    }

    const page = await res.json();

    if (!Array.isArray(page) || page.length === 0) break;

    all = all.concat(page);
    console.log("  ✔ Página " + (Math.floor(from / PAGE_SIZE) + 1) + ": " + page.length + " filmes (total parcial: " + all.length + ")");

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

// ============================================================
// ATUALIZAÇÃO COM LOG DETALHADO DE ERROS
// ============================================================
async function updateCollection(id, collection) {
  const res = await fetch(
    SUPABASE_URL + "/rest/v1/movies?id=eq." + id,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ collection }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error("❌ PATCH falhou — id=" + id + " | status=" + res.status + " | body=" + errBody);
  }

  return res.ok;
}

// ============================================================
// DETECÇÃO DE COLEÇÃO POR KEYWORDS
// ============================================================
function detectCollection(title) {
  const lower = title.toLowerCase();
  for (const rule of COLLECTION_RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return rule.collection;
      }
    }
  }
  return null;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("\n🎬 AUTO-COLLECTION — StreamVault\n");

  const movies = await fetchAllMovies();

  if (!movies || movies.length === 0) {
    console.log("❌ Nenhum filme encontrado!");
    return;
  }

  console.log("\n📦 " + movies.length + " filmes encontrados no total\n");
  console.log("━".repeat(50));

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  const byCollection = {};
  const errors = [];

  for (const movie of movies) {
    const detected = detectCollection(movie.title);

    if (!detected) {
      notFound++;
      continue;
    }

    if (movie.collection === detected) {
      skipped++;
      continue;
    }

    if (!byCollection[detected]) byCollection[detected] = [];
    byCollection[detected].push(movie.title);

    const ok = await updateCollection(movie.id, detected);
    if (ok) {
      updated++;
      console.log("✅ " + movie.title + " → " + detected);
    } else {
      errors.push(movie.title);
    }
  }

  console.log("\n" + "━".repeat(50));
  console.log("\n📊 RESUMO:");
  console.log("✅ Atualizados:  " + updated);
  console.log("⏭️  Já corretos: " + skipped);
  console.log("❓ Sem coleção:  " + notFound);

  if (errors.length > 0) {
    console.log("❌ Erros ao atualizar (" + errors.length + "):");
    errors.forEach(t => console.log("    - " + t));
  }

  if (Object.keys(byCollection).length > 0) {
    console.log("\n🗂️  COLEÇÕES DETECTADAS:");
    for (const [col, titles] of Object.entries(byCollection)) {
      console.log("\n  " + col + " (" + titles.length + " filmes):");
      titles.forEach(t => console.log("    - " + t));
    }
  }

  console.log("\n✨ Concluído!\n");
}

main().catch(console.error);