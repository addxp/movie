import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Users, Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProfilesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Busca perfis
  let query = supabase
    .from("profiles")
    .select("id, username, bio, avatar_url")
    .order("username");

  if (q && q.trim()) {
    query = query.ilike("username", `%${q.trim()}%`);
  } else {
    query = query.limit(40);
  }

  const { data: profiles } = await query;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      <div className="pt-24 pb-20 px-6 lg:px-14 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Users size={22} className="text-[var(--color-red)]" />
          <h1
            className="text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
          >
            PERFIS
          </h1>
        </div>

        {/* Search */}
        <form method="GET" className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome de usuário..."
            className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
          />
        </form>

        {/* Results */}
        {!profiles || profiles.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
              <Users size={22} className="text-white/10" />
            </div>
            <p className="text-white/25 text-sm">
              {q ? `Nenhum perfil encontrado para "${q}"` : "Nenhum perfil cadastrado ainda."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {profiles.map((profile) => {
              const isOwn = profile.id === user.id;
              const displayName = profile.username || `Usuário ${profile.id.slice(0, 6)}`;
              const initials = displayName.slice(0, 2).toUpperCase();

              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className="flex items-center gap-4 bg-[var(--color-card)] border border-white/[0.06] hover:border-white/15 rounded-2xl p-4 transition-all hover:-translate-y-0.5 group"
                >
                  {/* Avatar */}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/15 border border-[var(--color-red)]/25 flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--color-red)] text-sm font-black" style={{ fontFamily: "var(--font-display)" }}>
                        {initials}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm group-hover:text-[var(--color-red)] transition-colors truncate">
                        {displayName}
                      </p>
                      {isOwn && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8 flex-shrink-0">
                          Você
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{profile.bio}</p>
                    )}
                  </div>

                  <span className="text-white/15 text-xs flex-shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}