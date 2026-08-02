import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername, getUserReviews } from "@/lib/profiles";
import { getUserFavorites } from "@/lib/movies";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Star } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [reviews, favorites] = await Promise.all([
    getUserReviews(profile.id),
    getUserFavorites(profile.id),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 40px) 80px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "26px", color: "var(--text)" }}>
          {profile.display_name || profile.username}
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "13px", marginTop: "2px" }}>@{profile.username}</p>
        {profile.bio && <p style={{ color: "var(--text-2)", fontSize: "13.5px", marginTop: "10px", maxWidth: "560px", lineHeight: 1.5 }}>{profile.bio}</p>}

        <section style={{ marginTop: "36px" }}>
          <h2 style={sectionTitle}>Filmes Favoritos</h2>
          {favorites.length === 0 ? (
            <p style={emptyText}>Nenhum favorito ainda.</p>
          ) : (
            <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "6px" }}>
              {favorites.map((m) => (
                <Link key={m.id} href={"/movie/" + m.id} style={{ flexShrink: 0, width: "120px", textDecoration: "none" }}>
                  <div style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "2/3", background: "var(--bg-3)" }}>
                    <img src={m.thumbnail} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <p style={{ color: "var(--text)", fontSize: "12px", marginTop: "6px", fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: "36px" }}>
          <h2 style={sectionTitle}>Avaliações</h2>
          {reviews.length === 0 ? (
            <p style={emptyText}>Nenhuma avaliação ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: "14px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px" }}>
                  {r.movies && (
                    <Link href={"/movie/" + r.movies.id} style={{ flexShrink: 0, width: "56px" }}>
                      <img src={r.movies.thumbnail} alt={r.movies.title} style={{ width: "56px", height: "80px", objectFit: "cover", borderRadius: "6px" }} />
                    </Link>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "13.5px", fontFamily: "var(--font-body)" }}>{r.movies?.title ?? "Filme removido"}</p>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "var(--text-2)" }}>
                        <Star size={11} fill="#F5C518" color="#F5C518" /> {r.rating}/10
                      </span>
                    </div>
                    {r.body && <p style={{ color: "var(--text-2)", fontSize: "13px", lineHeight: 1.5 }}>{r.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "16px",
};
const emptyText: React.CSSProperties = { color: "var(--text-3)", fontSize: "13px", fontFamily: "var(--font-body)" };
