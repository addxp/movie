"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockProfiles } from "@/lib/profile-types";
import type { UserProfile, Review } from "@/lib/profile-types";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const profileData = mockProfiles.find((p) => p.username === username);

  const [profile, setProfile] = useState<UserProfile | null>(
    profileData || null
  );
  const [activeTab, setActiveTab] = useState<
    "activity" | "reviews" | "watchlist"
  >("activity");
  const [reviews, setReviews] = useState<Review[]>(profile?.reviews || []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">👤</div>
        <h1 className="text-3xl font-black">Perfil não encontrado</h1>
        <p className="text-white/40">@{username} não existe ou foi removido</p>
        <Link
          href="/profile/search"
          className="px-6 py-3 rounded-xl bg-[#e63946] font-semibold hover:bg-[#c1121f] transition-colors"
        >
          Buscar Perfis
        </Link>
      </div>
    );
  }

  const handleFollow = () => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !prev.isFollowing,
            stats: {
              ...prev.stats,
              followers: prev.isFollowing
                ? prev.stats.followers - 1
                : prev.stats.followers + 1,
            },
          }
        : prev
    );
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              liked: !r.liked,
              likes: r.liked ? r.likes - 1 : r.likes + 1,
            }
          : r
      )
    );
  };

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
        <div className="flex items-center gap-4">
          <Link
            href="/profile/search"
            className="text-white/50 hover:text-white transition-colors text-sm"
          >
            Buscar perfis
          </Link>
          <Link href="/profile">
            <div className="w-8 h-8 bg-[#e63946] rounded-full flex items-center justify-center font-bold text-sm">
              E
            </div>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="relative pt-16">
        <div className="absolute inset-0 h-72 bg-gradient-to-b from-[#e63946]/8 via-[#1a1a1a] to-[#0a0a0a]" />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-0">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-4xl font-black shadow-2xl shadow-[#e63946]/20">
              {profile.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight">
                {profile.displayName}
              </h1>
              <p className="text-white/40 text-sm mb-2">@{profile.username}</p>
              <p className="text-white/60 text-sm max-w-md mb-3">{profile.bio}</p>
              <p className="text-white/25 text-xs">
                Membro desde {profile.joinedAt}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleFollow}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  profile.isFollowing
                    ? "bg-white/10 hover:bg-white/15 border border-white/15"
                    : "bg-[#e63946] hover:bg-[#c1121f] shadow-lg shadow-[#e63946]/20"
                }`}
              >
                {profile.isFollowing ? "Seguindo ✓" : "Seguir"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-5 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { label: "Assistidos", value: profile.stats.watched },
              { label: "Watchlist", value: profile.stats.watchlist },
              { label: "Reviews", value: profile.stats.reviews },
              { label: "Seguidores", value: profile.stats.followers },
              { label: "Seguindo", value: profile.stats.following },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#111] py-5 text-center"
              >
                <div className="text-2xl font-black text-white">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-white/40 mt-1 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Genres */}
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full bg-[#e63946]/10 text-[#e63946] text-xs font-semibold border border-[#e63946]/20"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex gap-0 border-b border-white/10">
          {(["activity", "reviews", "watchlist"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#e63946] text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "activity"
                ? "Atividade"
                : tab === "reviews"
                ? "Reviews"
                : "Watchlist"}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "activity" && (
            <div className="space-y-4">
              {profile.recentActivity.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                  <div className="text-5xl mb-4">🎬</div>
                  <p>Nenhuma atividade ainda</p>
                </div>
              ) : (
                profile.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    {activity.poster && (
                      <img
                        src={activity.poster}
                        alt=""
                        className="w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <span className="text-xs text-[#e63946] font-semibold uppercase tracking-wider">
                        {activity.type === "watched"
                          ? "Assistiu"
                          : activity.type === "reviewed"
                          ? "Avaliou"
                          : "Adicionou"}
                      </span>
                      {activity.title && (
                        <p className="text-white font-semibold mt-0.5">
                          {activity.title}
                        </p>
                      )}
                      {activity.rating && (
                        <span className="text-yellow-400 text-sm">
                          {"★".repeat(Math.round(activity.rating / 2))}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/25">
                      {activity.createdAt}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-5">
              {reviews.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                  <div className="text-5xl mb-4">✍️</div>
                  <p>Nenhuma review ainda</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="flex gap-4">
                      <img
                        src={review.moviePoster}
                        alt={review.movieTitle}
                        className="w-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-white">
                              {review.movieTitle}
                            </h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[...Array(10)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-white/15"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-white/25">
                            {review.createdAt}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{review.content}</p>
                        <button
                          onClick={() => handleLikeReview(review.id)}
                          className={`flex items-center gap-1.5 text-xs mt-3 transition-colors ${
                            review.liked
                              ? "text-[#e63946]"
                              : "text-white/30 hover:text-white/60"
                          }`}
                        >
                          <span>{review.liked ? "♥" : "♡"}</span>
                          <span>{review.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {profile.watchlist.length === 0 ? (
                <div className="col-span-full text-center py-20 text-white/30">
                  <div className="text-5xl mb-4">🔖</div>
                  <p>Watchlist vazia</p>
                </div>
              ) : (
                profile.watchlist.map((item) => (
                  <div key={item.id}>
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-1">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white/70 truncate">
                      {item.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}