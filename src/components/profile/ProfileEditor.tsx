"use client";
import { useState } from "react";
import { useProfileActions } from "@/hooks/useProfileActions";
import type { Profile } from "@/lib/profiles";
import { Pencil } from "lucide-react";

export default function ProfileEditor({ userId, profile }: { userId: string; profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [fullName, setDisplayName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const { saveProfile, loading, error } = useProfileActions();

  const handleSave = async () => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) return;
    const { error: err } = await saveProfile(userId, { username: clean, full_name: fullName.trim(), bio: bio.trim() });
    if (!err) { setEditing(false); }
  };

  if (editing) {
    return (
      <div style={cardStyle}>
        <Field label="Nome de usuário">
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Nome de exibição">
          <input value={fullName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Bio">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" as const }} />
        </Field>
        {error && <p style={{ color: "var(--red)", fontSize: "12.5px", marginBottom: "10px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSave} disabled={loading} style={primaryBtn}>{loading ? "Salvando..." : "Salvar"}</button>
          <button onClick={() => setEditing(false)} style={secondaryBtn}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "26px", color: "var(--text)" }}>
          {profile?.full_name || profile?.username || "Seu Perfil"}
        </h1>
        {profile?.username && <p style={{ color: "var(--text-3)", fontSize: "13px", marginTop: "2px" }}>@{profile.username}</p>}
        {profile?.bio && <p style={{ color: "var(--text-2)", fontSize: "13.5px", marginTop: "10px", maxWidth: "560px", lineHeight: 1.5 }}>{profile.bio}</p>}
      </div>
      <button onClick={() => setEditing(true)} style={secondaryBtn}>
        <Pencil size={13} style={{ marginRight: "6px" }} /> Editar
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12px", color: "var(--text-2)", display: "block", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", padding: "22px" };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-2)", borderRadius: "10px", padding: "10px 13px", color: "#fff", fontSize: "13.5px", outline: "none", fontFamily: "var(--font-body)" };
const primaryBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-2)", color: "#fff", borderRadius: "10px", padding: "10px 16px", fontWeight: 600, fontSize: "13px", cursor: "pointer" };
