"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

export default function CreateWatchPartyButton({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchparty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Não deu certo."); setLoading(false); return; }
      router.push(`/room/${data.code}`);
    } catch {
      setError("Não deu certo. Tenta de novo.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        <Users size={16} />
        {loading ? "Criando sala..." : "Assistir em Grupo"}
      </button>
      {error && <p className="text-[var(--color-red)] text-xs mt-2">{error}</p>}
    </div>
  );
}
