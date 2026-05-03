// 👉 Se estiver usando Node < 18, descomenta:
// const fetch = require("node-fetch");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://qbphqysjgwwfvusrcsdl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGhxeXNqZ3d3ZnZ1c3Jjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjI5ODAsImV4cCI6MjA5MjczODk4MH0.0OXppIP0GkNVYmEajqcUoIzsCoDgE-OAeOAS1Gc_458"
)
async function test() {
  const { data, error } = await supabase
    .from("movies")
    .select("title, collection");

  if (error) {
    console.log("❌ ERRO:", error);
  } else {
    console.log("✅ DADOS:", data);
  }
}

test();

const SUPABASE_URL = "https://qbphqysjgwwfvusrcsdl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGhxeXNqZ3d3ZnZ1c3Jjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjI5ODAsImV4cCI6MjA5MjczODk4MH0.0OXppIP0GkNVYmEajqcUoIzsCoDgE-OAeOAS1Gc_458";

// 🔥 Remove acentos + deixa minúsculo
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ============================================================
// REGRAS
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
// BUSCAR FILMES
// ============================================================
async function fetchAllMovies() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/movies?select=id,title,collection`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ ERRO AO BUSCAR:", res.status, text);
    return [];
  }

  const data = await res.json();
  console.log(`📦 ${data.length} filmes carregados`);
  return data;
}

// ============================================================
// ATUALIZAR
// ============================================================
async function updateCollection(id, collection) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/movies?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ collection }),
    }
  );

  const text = await res.text();

  if (!res.ok) {
    console.log(`❌ ERRO UPDATE (${id}):`, text);
    return false;
  }

  return true;
}

// ============================================================
// DETECTAR COLEÇÃO
// ============================================================
function detectCollection(title) {
  const normalizedTitle = normalize(title);

  for (const rule of COLLECTION_RULES) {
    for (const keyword of rule.keywords) {
      if (normalizedTitle.includes(normalize(keyword))) {
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
  console.log("\n🎬 AUTO-COLLECTION INICIANDO...\n");

  const movies = await fetchAllMovies();

  if (!movies.length) {
    console.log("❌ Nenhum filme encontrado!");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

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

    const ok = await updateCollection(movie.id, detected);

    if (ok) {
      updated++;
      console.log(`✅ ${movie.title} → ${detected}`);
    }
  }

  console.log("\n📊 RESULTADO:");
  console.log("✅ Atualizados:", updated);
  console.log("⏭️ Já corretos:", skipped);
  console.log("❓ Sem coleção:", notFound);

  console.log("\n✨ FINALIZADO\n");
}

main().catch(console.error);