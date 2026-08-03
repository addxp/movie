"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) return;
    router.push(`/room/${clean}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-8">
        <h1 className="text-white text-xl font-bold mb-2">Entrar numa Sala</h1>
        <p className="text-white/50 text-sm mb-6">Digite o código que a pessoa te mandou.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABC123"
          maxLength={6}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-lg tracking-widest outline-none mb-4"
        />
        <button
          type="submit"
          disabled={code.trim().length < 4}
          className="w-full bg-[var(--color-red)] text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
