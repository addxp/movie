"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockProfiles } from "@/lib/profile-types";
import type { UserProfile } from "@/lib/profile-types";

export default function ProfileSearchPage() {
  const [query, setQuery] = useState("");
  const [followingFilter, setFollowingFilter] = useState<"all" | "following">(
    "all"
  );

  const results = useMemo(() => {
    if (!query.trim() && followingFilter === "all") return mockProfiles;

    return mockProfiles.filter((p) => {
      const matchesQuery =
        !query.trim() ||
        p.username.toLowerCase().includes(query.toLowerCase()) ||
        p.displayName.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        followingFilter === "all" || p.isFollowing;

      return matchesQuery && matchesFilter;
    });
  }, [query, followingFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#e63946] rounded flex items-center justify-center">
            <span className="text-white text-xs font-black">★</span>
          </div>
          <span className="font-black text-sm tracking-widest uppercase text-white">
            Stream<span className="text-[#e63946]">Vault</span>
          </span>
        </Link>
        <Link href="/profile">
          <div className="w-8 h-8 bg-[#e63946] rounded-full flex items-center justify-center font-bold text-sm">
            E
          </div>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2">Buscar Perfis</h1>
          <p className="text-white/40">
            Encontre e siga outros cinéfilos do StreamVault
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/25 focus:outline-none focus:border-[#e63946]/50 text-base transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {(["all", "following"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFollowingFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                followingFilter === filter
                  ? "bg-[#e63946] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {filter === "all" ? "Todos" : "Seguindo"}
            </button>
          ))}
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white/40 text-lg">
              Nenhum perfil encontrado para "{query}"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {query && (
              <p className="text-white/30 text-sm mb-4">
                {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
                encontrado{results.length !== 1 ? "s" : ""}
              </p>
            )}
            {results.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}

        {/* Suggestions when empty query */}
        {!query && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              Sugestões para você
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockProfiles
                .filter((p) => !p.isOwnProfile)
                .map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} compact />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({
  profile,
  compact = false,
}: {
  profile: UserProfile;
  compact?: boolean;
}) {
  const [following, setFollowing] = useState(profile.isFollowing || false);

  return (
    <Link
      href={profile.isOwnProfile ? "/profile" : `/profile/${profile.username}`}
    >
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/12 hover:bg-white/[0.05] transition-all cursor-pointer group">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-xl font-black flex-shrink-0 shadow-lg shadow-[#e63946]/20">
          {profile.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white group-hover:text-white transition-colors">
              {profile.displayName}
            </span>
            {profile.isOwnProfile && (
              <span className="text-xs bg-[#e63946]/20 text-[#e63946] px-2 py-0.5 rounded-full font-semibold">
                Você
              </span>
            )}
            {profile.isFollowing && !profile.isOwnProfile && (
              <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                Seguindo
              </span>
            )}
          </div>
          <p className="text-white/40 text-sm">@{profile.username}</p>
          {!compact && (
            <p className="text-white/50 text-xs mt-1 truncate">{profile.bio}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/25">
            <span>{profile.stats.watched} assistidos</span>
            <span>·</span>
            <span>{profile.stats.reviews} reviews</span>
            <span>·</span>
            <span>{profile.stats.followers.toLocaleString()} seguidores</span>
          </div>
        </div>

        {/* Follow Button */}
        {!profile.isOwnProfile && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setFollowing(!following);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
              following
                ? "bg-white/10 text-white/70 hover:bg-white/15"
                : "bg-[#e63946]/90 text-white hover:bg-[#e63946]"
            }`}
          >
            {following ? "Seguindo" : "Seguir"}
          </button>
        )}
      </div>
    </Link>
  );
}