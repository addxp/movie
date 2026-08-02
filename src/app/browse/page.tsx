import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMoviesByCategory, getFeaturedMovie, searchMovies } from "@/lib/movies";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import PremiumHero from "@/components/movie/PremiumHero";
import PremiumMovieRow from "@/components/movie/PremiumMovieRow";
import { SidebarPopular, PremiumBanner, GenresGrid, SidebarContinueWatching, AIRecommendationCard } from "@/components/movie/PremiumSidebar";
import type { Movie } from "@/types";
import { Play } from "lucide-react";

interface BrowsePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const query  = params.q;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  /* ── Search results view ── */
  if (query) {
    const results = await searchMovies(query);

    return (
      <div className="zone-noir" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar user={user} />

        <div style={{
          paddingTop: "96px",
          paddingLeft: "clamp(20px, 5vw, 64px)",
          paddingRight: "clamp(20px, 5vw, 64px)",
          paddingBottom: "80px",
        }}>

          {/* Search header */}
          <div style={{ marginBottom: "36px" }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px", letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-4)", marginBottom: "8px",
            }}>
              Resultados da busca
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 700, letterSpacing: "0.04em",
              color: "var(--text)",
              display: "flex", alignItems: "baseline", gap: "14px",
            }}>
              <span style={{ color: "var(--red)" }}>&ldquo;{query}&rdquo;</span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px", fontWeight: 400,
                color: "var(--text-3)", letterSpacing: "0",
              }}>
                {results.length} título{results.length !== 1 ? "s" : ""}
              </span>
            </h1>
            {/* Red accent line */}
            <div style={{
              width: "36px", height: "2px",
              background: "var(--red)",
              borderRadius: "1px", marginTop: "12px",
              boxShadow: "0 0 10px var(--red-glow)",
            }} />
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "var(--bg-3)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: "28px",
              }}>🎬</div>
              <p style={{ color: "var(--text-3)", fontSize: "14px", fontFamily: "var(--font-body)" }}>
                Nenhum resultado para{" "}
                <span style={{ color: "var(--text-2)" }}>&ldquo;{query}&rdquo;</span>
              </p>
            </div>
          ) : (
            <>
              <style>{`
                .sv-search-card { transition: transform 0.28s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease; border: 1.5px solid transparent; }
                .sv-search-card:hover { transform: translateY(-5px); box-shadow: 0 18px 42px rgba(0,0,0,0.75); border-color: var(--red-border); }
                .sv-search-overlay { opacity: 0; transition: opacity 0.2s ease; }
                .sv-search-card:hover .sv-search-overlay { opacity: 1; }
              `}</style>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))",
                gap: "16px",
              }}>
                {results.map((movie) => (
                  <a key={movie.id} href={"/movie/" + movie.id} style={{ textDecoration: "none" }}>
                    <div
                      className="sv-search-card"
                      style={{
                        position: "relative", borderRadius: "8px", overflow: "hidden",
                        background: "var(--bg-3)", aspectRatio: "2/3",
                      }}
                    >
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                      />

                      {/* Hover overlay */}
                      <div
                        className="sv-search-overlay"
                        style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(to top, rgba(10,10,10,0.94) 0%, transparent 55%)",
                          display: "flex", flexDirection: "column",
                          justifyContent: "flex-end", padding: "12px",
                        }}
                      >
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "var(--red)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 4px 16px var(--red-glow)",
                          margin: "0 auto 8px",
                        }}>
                          <Play size={13} fill="#fff" strokeWidth={0} style={{ marginLeft: "2px" }} />
                        </div>
                      </div>

                      {/* Rating badge */}
                      {movie.rating && (
                        <div style={{
                          position: "absolute", top: "7px", left: "7px",
                          background: "rgba(0,0,0,0.78)",
                          color: "var(--red)",
                          fontSize: "9px", fontWeight: 700,
                          padding: "2.5px 6px", borderRadius: "4px",
                          display: "flex", alignItems: "center", gap: "2px",
                          border: "1px solid var(--red-border)",
                          backdropFilter: "blur(6px)",
                          fontFamily: "var(--font-body)",
                        }}>
                          ★ {movie.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Title below */}
                    <div style={{ marginTop: "8px" }}>
                      <h3 style={{
                        color: "var(--text-2)",
                        fontSize: "11px", fontWeight: 500,
                        lineHeight: 1.3,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                        fontFamily: "var(--font-body)",
                      }}>
                        {movie.title}
                      </h3>
                      <p style={{ color: "var(--text-4)", fontSize: "10px", marginTop: "1px", fontFamily: "var(--font-body)" }}>
                        {movie.release_year}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Main browse view — premium luxury layout ── */
  const [featuredMovie, moviesByCategory] = await Promise.all([
    getFeaturedMovie(),
    getMoviesByCategory(),
  ]);

  const categoryEntries = Object.entries(moviesByCategory).filter(([, list]) => list.length > 0);
  const allMovies: Movie[] = categoryEntries.flatMap(([, list]) => list);

  const ROW_LABELS = ["Em Alta Agora", "Lançamentos", "Populares Hoje", "Mais Bem Avaliados", "Premiados"];
  const rows = categoryEntries.slice(0, 5).map(([category, list], i) => ({
    title: ROW_LABELS[i] ?? category,
    movies: list,
  }));

  const heroSource = featuredMovie ? [featuredMovie, ...allMovies.filter((m) => m.id !== featuredMovie.id)] : allMovies;
  const popular = [...allMovies].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />

      {heroSource.length > 0 ? (
        <PremiumHero movies={heroSource} userId={user.id} />
      ) : (
        <div style={{
          height: "60vh",
          background: "linear-gradient(to bottom, var(--bg-2), var(--bg))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Nenhum filme em destaque</p>
        </div>
      )}

      <style>{`
        .sv-premium-grid {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(280px, 1fr);
          gap: 40px;
        }
        @media (max-width: 900px) {
          .sv-premium-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>

      <div className="sv-premium-grid" style={{
        position: "relative", zIndex: 10,
        padding: "40px clamp(16px, 5vw, 72px) 0",
        maxWidth: "1680px", margin: "0 auto",
      }}>
        {/* Left 75% — carousels */}
        <div style={{ minWidth: 0 }}>
          {rows.map((row) => (
            <PremiumMovieRow key={row.title} title={row.title} movies={row.movies} />
          ))}
        </div>

        {/* Right 25% — sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <SidebarPopular movies={popular} />
          <PremiumBanner />
          <GenresGrid />
          <SidebarContinueWatching userId={user.id} />
          <AIRecommendationCard />
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}