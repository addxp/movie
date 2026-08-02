import { createClient } from "@/lib/supabase/server";
import { searchProfiles, listProfiles } from "@/lib/profiles";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function ProfileSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const results = q ? await searchProfiles(q) : await listProfiles();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 40px) 80px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "28px", color: "var(--text)", marginBottom: "6px" }}>
          {q ? "Buscar Perfis" : "Descobrir Perfis"}
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "13px", marginBottom: "26px" }}>
          {q ? "Encontre outros usuários do StreamVault." : "Todo mundo que já criou conta no StreamVault."}
        </p>

        <form method="GET" style={{ position: "relative", marginBottom: "32px" }}>
          <Search size={16} color="var(--text-3)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome de usuário ou nome de exibição..."
            style={{
              width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-2)",
              borderRadius: "var(--radius-sm)", padding: "15px 16px 15px 44px", color: "#fff", fontSize: "14.5px", outline: "none",
            }}
          />
        </form>

        {q && results.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Nenhum perfil encontrado para &quot;{q}&quot;.</p>
        )}
        {!q && results.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Ainda ninguém criou um perfil.</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
          {results.map((p) => (
            <Link key={p.id} href={"/profile/" + p.username} className="ps-card" style={{
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              textDecoration: "none", padding: "26px 16px", borderRadius: "var(--radius)",
              background: "var(--bg-3)", border: "1px solid var(--border-2)",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: p.avatar_url ? "var(--bg-3)" : "var(--red)",
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "22px", fontFamily: "var(--font-display)",
                marginBottom: "12px",
              }}>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                ) : (
                  (p.full_name || p.username)[0]?.toUpperCase()
                )}
              </div>
              <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "14px" }}>{p.full_name || p.username}</p>
              <p style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "2px" }}>@{p.username}</p>
            </Link>
          ))}
        </div>

        <style>{`.ps-card:hover { transform: translateY(-4px); border-color: var(--border-3); }`}</style>
      </div>
    </div>
  );
}
