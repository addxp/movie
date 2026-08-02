import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername, getFollowers } from "@/lib/profiles";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const followers = await getFollowers(profile.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 40px) 80px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "22px", color: "var(--text)", marginBottom: "4px" }}>
          Seguidores de @{profile.username}
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "13px", marginBottom: "28px" }}>{followers.length} {followers.length === 1 ? "pessoa" : "pessoas"}</p>

        {followers.length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Ninguém segue esse perfil ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {followers.map((p) => (
              <Link key={p.id} href={"/profile/" + p.username} style={{
                display: "flex", alignItems: "center", gap: "14px", textDecoration: "none",
                padding: "12px", borderRadius: "12px", border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  background: p.avatar_url ? "var(--bg-3)" : "var(--red)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "16px",
                }}>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                  ) : (
                    (p.full_name || p.username)[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "13.5px" }}>{p.full_name || p.username}</p>
                  <p style={{ color: "var(--text-3)", fontSize: "12px" }}>@{p.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
