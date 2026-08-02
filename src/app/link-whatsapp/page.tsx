"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LinkWhatsAppPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/whatsapp/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Não deu certo."); setStatus("error"); return; }
      setStatus("done");
      setTimeout(() => router.push("/profile"), 1800);
    } catch {
      setError("Não deu certo. Tenta de novo.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #050505)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: "380px", background: "var(--bg-3, #111)",
        border: "1px solid var(--border-2, rgba(255,255,255,0.1))", borderRadius: "var(--radius, 20px)", padding: "32px",
      }}>
        <h1 style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: "20px", color: "#fff", marginBottom: "8px" }}>
          Vincular WhatsApp
        </h1>

        {status === "done" ? (
          <p style={{ color: "#4ade80", fontSize: "14px" }}>Conta vinculada! Redirecionando...</p>
        ) : (
          <>
            <p style={{ fontSize: "13px", color: "var(--text-2, #999)", marginBottom: "22px", lineHeight: 1.5 }}>
              Manda &quot;vincular&quot; pro bot no WhatsApp, pegue o código de 6 dígitos que ele te mandar, e cole aqui.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-2, rgba(255,255,255,0.1))",
                borderRadius: "10px", padding: "13px 14px", color: "#fff", fontSize: "20px", textAlign: "center",
                letterSpacing: "0.3em", outline: "none",
              }}
            />
            {error && <p style={{ color: "var(--red, #E50914)", fontSize: "12.5px", marginTop: "12px" }}>{error}</p>}
            <button type="submit" disabled={status === "loading" || code.length < 6} style={{
              width: "100%", marginTop: "20px", background: "var(--red, #E50914)", color: "#fff", border: "none",
              borderRadius: "10px", padding: "13px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
              opacity: status === "loading" ? 0.6 : 1,
            }}>
              {status === "loading" ? "Vinculando..." : "Vincular"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
