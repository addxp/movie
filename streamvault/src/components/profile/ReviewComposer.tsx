"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileActions } from "@/hooks/useProfileActions";
import type { Movie } from "@/types";

export default function ReviewComposer({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [rating, setRating] = useState(8);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const { submitReview, loading, error } = useProfileActions();

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelected(null);
    if (value.trim().length < 2) { setResults([]); return; }
    const supabase = createClient();
    const safe = value.trim().replace(/[%,()]/g, "");
    const { data } = await supabase.from("movies").select("id, title, thumbnail, release_year").ilike("title", `%${safe}%`).limit(6);
    setResults((data as Movie[]) || []);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    const { error: err } = await submitReview(userId, selected.id, rating, body.trim());
    if (!err) {
      setSent(true);
      setSelected(null); setQuery(""); setBody(""); setRating(8);
      setTimeout(() => setSent(false), 2500);
    }
  };

  return (
    <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", padding: "22px" }}>
      {!selected ? (
        <>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Busque um filme ou série pra avaliar..."
            style={inputStyle}
          />
          {results.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {results.map((m) => (
                <button key={m.id} onClick={() => { setSelected(m); setResults([]); setQuery(m.title); }} style={resultRow}>
                  <img src={m.thumbnail} alt="" style={{ width: "30px", height: "42px", objectFit: "cover", borderRadius: "4px" }} />
                  <span style={{ fontSize: "13px", color: "var(--text)" }}>{m.title} {m.release_year ? `(${m.release_year})` : ""}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <p style={{ color: "var(--text)", fontSize: "13.5px", fontWeight: 600, marginBottom: "12px" }}>Avaliando: {selected.title}</p>
          <label style={{ fontSize: "12px", color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Nota: {rating}/10</label>
          <input type="range" min={0} max={10} step={1} value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: "100%", marginBottom: "14px", accentColor: "var(--red)" }} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Seu comentário (opcional)" style={{ ...inputStyle, resize: "vertical" as const, marginBottom: "14px" }} />
          {error && <p style={{ color: "var(--red)", fontSize: "12.5px", marginBottom: "10px" }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} disabled={loading} style={primaryBtn}>{loading ? "Enviando..." : "Publicar avaliação"}</button>
            <button onClick={() => { setSelected(null); setQuery(""); }} style={secondaryBtn}>Trocar filme</button>
          </div>
        </div>
      )}
      {sent && <p style={{ color: "#4ade80", fontSize: "12.5px", marginTop: "12px" }}>Avaliação publicada!</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-2)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13.5px", outline: "none", fontFamily: "var(--font-body)" };
const resultRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", padding: "6px", borderRadius: "8px", cursor: "pointer", textAlign: "left" };
const primaryBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-2)", color: "#fff", borderRadius: "10px", padding: "10px 16px", fontWeight: 600, fontSize: "13px", cursor: "pointer" };
