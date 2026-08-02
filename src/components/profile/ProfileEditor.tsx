"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/hooks/useProfileActions";
import type { Profile } from "@/lib/profiles";
import ImageUploader from "@/components/profile/ImageUploader";
import { Pencil } from "lucide-react";

export default function ProfileEditor({ userId, profile }: { userId: string; profile: Profile | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const { saveProfile, loading, error } = useProfileActions();

  const handleSave = async () => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) return;
    const { error: err } = await saveProfile(userId, { username: clean, full_name: fullName.trim(), bio: bio.trim() });
    if (!err) { setEditing(false); router.refresh(); }
  };

  return (
    <div>
      {/* Capa */}
      <div style={{
        position: "relative", height: "180px", borderRadius: "var(--radius)", overflow: "hidden",
        background: profile?.cover_url ? undefined : "linear-gradient(135deg, #1a0407 0%, var(--bg-3) 70%)",
        backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : undefined,
        backgroundSize: "cover", backgroundPosition: "center",
        border: "1px solid var(--border-2)",
      }}>
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <ImageUploader userId={userId} kind="cover" currentUrl={profile?.cover_url ?? null} onUploaded={() => router.refresh()} />
        </div>
      </div>

      {/* Avatar sobreposto + nome */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-46px", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "92px", height: "92px", borderRadius: "50%", border: "4px solid var(--bg)",
              background: profile?.avatar_url ? undefined : "var(--red)",
              backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : undefined,
              backgroundSize: "cover", backgroundPosition: "center",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "32px", fontFamily: "var(--font-display)",
            }}>
              {!profile?.avatar_url && (profile?.full_name || profile?.username || "?")[0]?.toUpperCase()}
            </div>
            <div style={{ position: "absolute", bottom: "0", right: "0" }}>
              <ImageUploader userId={userId} kind="avatar" currentUrl={profile?.avatar_url ?? null} onUploaded={() => router.refresh()} />
            </div>
          </div>
          {!editing && (
            <div style={{ paddingBottom: "6px" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--text)" }}>
                {profile?.full_name || profile?.username || "Seu Perfil"}
              </h1>
              {profile?.username && <p style={{ color: "var(--text-3)", fontSize: "13px" }}>@{profile.username}</p>}
            </div>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={secondaryBtn}>
            <Pencil size={13} style={{ marginRight: "6px" }} /> Editar
          </button>
        )}
      </div>

      {!editing && profile?.bio && (
        <p style={{ color: "var(--text-2)", fontSize: "13.5px", marginTop: "14px", padding: "0 20px", maxWidth: "560px", lineHeight: 1.5 }}>{profile.bio}</p>
      )}

      {editing && (
        <div style={{ ...cardStyle, marginTop: "20px" }}>
          <Field label="Nome de usuário">
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Nome de exibição">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
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
      )}
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

const cardStyle: React.CSSProperties = { background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", padding: "22px", marginLeft: "20px", marginRight: "20px" };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-2)", borderRadius: "10px", padding: "10px 13px", color: "#fff", fontSize: "13.5px", outline: "none", fontFamily: "var(--font-body)" };
const primaryBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-2)", color: "#fff", borderRadius: "10px", padding: "10px 16px", fontWeight: 600, fontSize: "13px", cursor: "pointer" };
