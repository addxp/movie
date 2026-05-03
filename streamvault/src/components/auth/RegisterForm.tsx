"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setError("Erro ao criar conta. Tente novamente."); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Conta criada!</h2>
        <p className="text-[var(--color-muted)] mb-6">Verifique seu email para confirmar a conta.</p>
        <Link href="/auth/login" className="inline-block bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all">Ir para o Login</Link>
      </div>
    );
  }

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
      <h1 className="text-3xl font-bold text-white mb-2">Criar conta</h1>
      <p className="text-[var(--color-muted)] mb-6">Junte-se ao StreamVault gratuitamente</p>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" required className="input-glow w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[var(--color-muted)] transition-all hover:border-white/20" />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-glow w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[var(--color-muted)] transition-all hover:border-white/20" />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="input-glow w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white placeholder:text-[var(--color-muted)] transition-all hover:border-white/20" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-white">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Criando conta...</> : "Criar conta"}
        </button>
      </form>
      <p className="mt-6 text-center text-[var(--color-muted)] text-sm">
        Já tem uma conta? <Link href="/auth/login" className="text-white hover:text-[var(--color-red)] transition-colors font-medium">Entrar</Link>
      </p>
    </div>
  );
}