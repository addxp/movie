// app/filme/[id]/page.jsx  (ou pages/filme/[id].jsx no Pages Router)
import VideoPlayer from "@/components/VideoPlayer";
import "@/styles/player.css";

// Busca detalhes do filme via TMDB (Server Component)
async function getMovie(tmdbId) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=pt-BR`,
    { next: { revalidate: 3600 } }
  );
  return res.json();
}

export default async function FilmePage({ params }) {
  const movie = await getMovie(params.id);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <h1>{movie.title}</h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>{movie.overview}</p>

      {/* 
        tmdbId  → ID do TMDB (params.id)
        mediaType → "movie" para filmes, "tv" para séries
      */}
      <VideoPlayer tmdbId={params.id} mediaType="movie" />
    </main>
  );
}
