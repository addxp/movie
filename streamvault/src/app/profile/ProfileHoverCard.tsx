"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { mockProfiles } from "@/lib/profile-types";
import type { UserProfile } from "@/lib/profile-types";

interface ProfileHoverCardProps {
  username: string;
  children: React.ReactNode;
}

export default function ProfileHoverCard({
  username,
  children,
}: ProfileHoverCardProps) {
  const [visible, setVisible] = useState(false);
  const [following, setFollowing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = mockProfiles.find((p) => p.username === username);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 200);
  };

  if (!profile) return <>{children}</>;

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}

      {visible && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-4"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{ animation: "fadeInUp 0.15s ease-out" }}
        >
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-xl font-black">
                {profile.avatar}
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {profile.displayName}
                </p>
                <p className="text-white/40 text-xs">@{profile.username}</p>
              </div>
            </div>
            {!profile.isOwnProfile && (
              <button
                onClick={() => setFollowing(!following)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  following || profile.isFollowing
                    ? "bg-white/10 text-white/60"
                    : "bg-[#e63946] text-white hover:bg-[#c1121f]"
                }`}
              >
                {following || profile.isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>

          {/* Bio */}
          <p className="text-white/50 text-xs mb-3 leading-relaxed line-clamp-2">
            {profile.bio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Assistidos", value: profile.stats.watched },
              { label: "Reviews", value: profile.stats.reviews },
              { label: "Seguidores", value: profile.stats.followers },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center bg-white/5 rounded-xl py-2"
              >
                <p className="text-white font-black text-sm">{s.value}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.favoriteGenres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full bg-[#e63946]/10 text-[#e63946] text-[10px] font-semibold"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Link */}
          <Link
            href={
              profile.isOwnProfile ? "/profile" : `/profile/${profile.username}`
            }
            className="block text-center text-xs text-white/40 hover:text-white/70 transition-colors py-1"
          >
            Ver perfil completo →
          </Link>
        </div>
      )}
    </div>
  );
}