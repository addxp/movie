"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

interface ImageUploaderProps {
  userId: string;
  kind: "avatar" | "cover";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

export default function ImageUploader({ userId, kind, currentUrl, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Escolha um arquivo de imagem."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Imagem muito grande (máx. 5MB)."); return; }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${kind}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data } = supabase.storage.from("profile-images").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`; // cache-bust após upsert

    const column = kind === "avatar" ? "avatar_url" : "cover_url";
    const { error: dbErr } = await supabase.from("profiles").update({ [column]: url }).eq("id", userId);
    setUploading(false);
    if (dbErr) { setError(dbErr.message); return; }
    onUploaded(url);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.18)", color: "#fff",
          borderRadius: "10px", padding: kind === "avatar" ? "8px" : "8px 14px",
          fontSize: "12px", fontWeight: 600, cursor: "pointer",
        }}
        title={kind === "avatar" ? "Trocar foto de perfil" : "Trocar capa"}
      >
        <Camera size={13} />
        {kind === "cover" && (uploading ? "Enviando..." : currentUrl ? "Trocar capa" : "Adicionar capa")}
      </button>
      {error && <p style={{ color: "var(--red)", fontSize: "11.5px", marginTop: "6px" }}>{error}</p>}
    </>
  );
}
