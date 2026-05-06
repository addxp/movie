"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Loader2, Check, User, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser]         = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio]           = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSaving(true);

    const { error: err } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      }, { onConflict: "id" });

    if (err) {
      setError(err.message.includes("unique") ? "Esse nome de usuário já está em uso." : err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const initials = (username || user?.email || "U").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={24} className="text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto">

        <Link
          href={user ? `/profile/${user.id}` : "/browse"}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Meu perfil
        </Link>

        <h1
          className="text-4xl font-black text-white mb-8"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
        >
          EDITAR PERFIL
        </h1>

        {/* Preview do avatar */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-white/[0.03] border border-white/8 rounded-2xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[var(--color-red)]/20 border border-[var(--color-red)]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--color-red)] text-xl font-black" style={{ fontFamily: "var(--font-display)" }}>
                {initials}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">{username || "Sem nome de usuário"}</p>
            <p className="text-white/30 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Campos */}
        <div className="space-y-5">

          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">
              <User size={12} />
              Nome de usuário
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: joaofilmes"
              maxLength={30}
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
            />
            <p className="text-white/15 text-[11px] mt-1.5">Só letras, números e underline. Máx. 30 caracteres.</p>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">
              <FileText size={12} />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Fale um pouco sobre você..."
              rows={3}
              maxLength={160}
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors resize-none"
            />
            <p className="text-white/15 text-[11px] mt-1.5">{bio.length}/160 caracteres</p>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">
              <LinkIcon size={12} />
              URL do avatar (opcional)
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
            />
            <p className="text-white/15 text-[11px] mt-1.5">Cole o link de uma imagem da internet.</p>
          </div>

          {/* Erro */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Botão salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-red)] hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {saving  ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> :
             saved   ? <><Check size={15} /> Salvo com sucesso!</> :
             "Salvar alterações"}
          </button>

          {/* Ver perfil */}
          <Link
            href={`/profile/${user?.id}`}
            className="block text-center text-white/30 hover:text-white text-sm transition-colors py-2"
          >
            Ver meu perfil público →
          </Link>
        </div>
      </div>
    </div>
  );
}