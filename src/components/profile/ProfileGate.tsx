"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileActions } from "@/hooks/useProfileActions";

export default function ProfileGate() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setDisplayName] = useState("");
  const { saveProfile, loading, error } = useProfileActions();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setChecked(true); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("username, full_name, claimed").eq("id", user.id).maybeSingle();
      setNeedsProfile(!profile || !profile.claimed);
      if (profile && !profile.claimed) {
        setUsername(profile.username ?? "");
        setDisplayName(profile.full_name ?? "");
      }
      setChecked(true);
    });
  }, []);

  if (!checked || !needsProfile || !userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) return;
    const { error: err } = await saveProfile(userId, { username: clean, full_name: fullName.trim() || clean, claimed: true });
    if (!err) setNeedsProfile(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: "400px", background: "var(--bg-3, #111)",
        border: "1px solid var(--border-2, rgba(255,255,255,0.1))", borderRadius: "var(--radius, 20px)",
        padding: "32px",
      }}>
        <h2 style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: "20px", color: "#fff", marginBottom: "8px" }}>
          Escolha seu nome de usuário
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-2, #999)", marginBottom: "22px", lineHeight: 1.5 }}>
          Pra avaliar filmes, favoritar títulos e aparecer na busca de perfis com um nome seu (em vez de um gerado automaticamente).
        </p>

        <label style={{ fontSize: "12px", color: "var(--text-2, #999)", display: "block", marginBottom: "6px" }}>Nome de usuário</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ex: joaosilva"
          required
          minLength={3}
          style={inputStyle}
        />

        <label style={{ fontSize: "12px", color: "var(--text-2, #999)", display: "block", margin: "16px 0 6px" }}>Nome de exibição</label>
        <input
          value={fullName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="ex: João Silva"
          style={inputStyle}
        />

        {error && <p style={{ color: "var(--red, #E50914)", fontSize: "12.5px", marginTop: "12px" }}>{error}</p>}

        <button type="submit" disabled={loading || username.trim().length < 3} style={{
          width: "100%", marginTop: "22px", background: "var(--red, #E50914)", color: "#fff", border: "none",
          borderRadius: "var(--radius-sm, 12px)", padding: "13px", fontWeight: 700, fontSize: "14px",
          cursor: "pointer", opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "Salvando..." : "Confirmar"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-2, rgba(255,255,255,0.1))",
  borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none",
};
