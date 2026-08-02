import { createClient } from "@/lib/supabase/server";
import { searchProfiles } from "@/lib/profiles";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function ProfileSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const results = q ? await searchProfiles(q) : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 40px) 80px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--text)", marginBottom: "20px" }}>
          Buscar Perfis
        </h1>

        <form method="GET" style={{ position: "relative", marginBottom: "28px" }}>
          <Search size={16} color="var(--text-3)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome de usuário ou nome de exibição..."
            style={{
              width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-2)",
              borderRadius: "12px", padding: "13px 14px 13px 40px", color: "#fff", fontSize: "14px", outline: "none",
            }}
          />
        </form>

        {q && results.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Nenhum perfil encontrado para &quot;{q}&quot;.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {results.map((p) => (
            <Link key={p.id} href={"/profile/" + p.username} style={{
              display: "flex", alignItems: "center", gap: "14px", textDecoration: "none",
              padding: "12px", borderRadius: "12px", border: "1px solid var(--border)",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%", background: "var(--red)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "16px", flexShrink: 0,
              }}>
                {(p.full_name || p.username)[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "13.5px" }}>{p.full_name || p.username}</p>
                <p style={{ color: "var(--text-3)", fontSize: "12px" }}>@{p.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
