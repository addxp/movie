"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Loader2 } from "lucide-react";
import type { Movie } from "@/types";

interface Props {
  onClose: () => void;
}

type Status = "idle" | "loading" | "done" | "error";

export default function AIRecommendationModal({ onClose }: Props) {
  const [mood, setMood] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ movie: Movie; reason: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Não consegui gerar uma sugestão agora.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch {
      setErrorMsg("Erro de conexão. Tenta de novo.");
      setStatus("error");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "420px", background: "var(--bg-3)",
          border: "1px solid var(--border-2)", borderRadius: "var(--radius)",
          padding: "28px", position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: "absolute", top: "16px", right: "16px", background: "transparent",
            border: "none", color: "var(--text-3)", cursor: "pointer", padding: "4px",
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto 16px",
          background: "linear-gradient(135deg, var(--red) 0%, #4a0209 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px var(--red-dim-2)",
        }}>
          <Sparkles size={19} color="#fff" />
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", color: "#fff", textAlign: "center", marginBottom: "6px" }}>
          Descobrir com IA
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-3)", textAlign: "center", marginBottom: "20px", lineHeight: 1.5 }}>
          Conta o que você tem vontade de assistir hoje.
        </p>

        {status !== "done" && (
          <form onSubmit={handleSubmit}>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Ex: algo leve pra rir, terror psicológico..."
              disabled={status === "loading"}
              style={{
                width: "100%", background: "var(--bg-4)", border: "1px solid var(--border-3)",
                borderRadius: "var(--radius-sm)", padding: "12px 14px", color: "#fff",
                fontSize: "13px", fontFamily: "var(--font-body)", marginBottom: "14px", outline: "none",
              }}
            />
            {status === "error" && (
              <p style={{ color: "var(--red)", fontSize: "12px", marginBottom: "12px" }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%", background: "var(--red)", color: "#fff", border: "none",
                borderRadius: "var(--radius-sm)", padding: "12px", fontWeight: 700, fontSize: "13px",
                cursor: status === "loading" ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                opacity: status === "loading" ? 0.7 : 1,
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={15} className="ai-spin" /> Pensando...
                </>
              ) : (
                "Sugerir algo"
              )}
            </button>
          </form>
        )}

        {status === "done" && result && (
          <div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "64px", height: "90px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "var(--bg-4)" }}>
                <img src={result.movie.thumbnail} alt={result.movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>{result.movie.title}</p>
                <p style={{ color: "var(--text-3)", fontSize: "12px", lineHeight: 1.5 }}>{result.reason}</p>
              </div>
            </div>
            <Link
              href={"/movie/" + result.movie.id}
              onClick={onClose}
              style={{
                display: "block", textAlign: "center", width: "100%", background: "var(--red)",
                color: "#fff", borderRadius: "var(--radius-sm)", padding: "12px",
                fontWeight: 700, fontSize: "13px", textDecoration: "none", marginBottom: "10px",
              }}
            >
              Ver título
            </Link>
            <button
              onClick={() => { setStatus("idle"); setResult(null); setMood(""); }}
              style={{
                width: "100%", background: "transparent", border: "1px solid var(--border-3)",
                color: "var(--text-2)", borderRadius: "var(--radius-sm)", padding: "11px",
                fontSize: "12.5px", cursor: "pointer",
              }}
            >
              Tentar outra sugestão
            </button>
          </div>
        )}
      </div>
      <style>{`
        .ai-spin { animation: ai-spin-anim 0.8s linear infinite; }
        @keyframes ai-spin-anim { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
