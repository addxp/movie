"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/profile-types";
import type { UserProfile, Review } from "@/lib/profile-types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [activeTab, setActiveTab] = useState<
    "activity" | "reviews" | "watchlist"
  >("activity");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    bio: user.bio,
  });
  const [reviews, setReviews] = useState(user.reviews);

  const handleSaveEdit = () => {
    setUser((prev) => ({
      ...prev,
      displayName: editForm.displayName,
      bio: editForm.bio,
    }));
    setIsEditing(false);
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
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
            href="/search"
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          </Link>
          <div className="w-8 h-8 bg-[#e63946] rounded-full flex items-center justify-center font-bold text-sm cursor-pointer">
            {user.avatar}
          </div>
        </div>
      </nav>

      {/* Hero / Profile Header */}
      <div className="relative pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 h-72 bg-gradient-to-b from-[#e63946]/10 via-[#1a1a1a] to-[#0a0a0a]" />
        <div
          className="absolute inset-0 h-72 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #e63946 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-0">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-4xl font-black shadow-2xl shadow-[#e63946]/30">
                {user.avatar}
              </div>
              {user.isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight">
                  {user.displayName}
                </h1>
                {user.isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/30 hover:text-white/70 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-white/40 text-sm mb-2">@{user.username}</p>
              <p className="text-white/60 text-sm max-w-md mb-4">{user.bio}</p>
              <div className="flex items-center gap-1 text-white/30 text-xs">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Membro desde {user.joinedAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {user.isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button className="px-5 py-2.5 rounded-xl bg-[#e63946] text-sm font-bold hover:bg-[#c1121f] transition-colors shadow-lg shadow-[#e63946]/20">
                    {user.isFollowing ? "Seguindo" : "Seguir"}
                  </button>
                  <button className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors">
                    Mensagem
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-5 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { label: "Assistidos", value: user.stats.watched },
              { label: "Watchlist", value: user.stats.watchlist },
              { label: "Reviews", value: user.stats.reviews },
              { label: "Seguidores", value: user.stats.followers },
              { label: "Seguindo", value: user.stats.following },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#111] py-5 text-center hover:bg-[#161616] transition-colors cursor-pointer"
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
            {user.favoriteGenres.map((genre) => (
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
              className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
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

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "activity" && (
            <ActivityFeed activities={user.recentActivity} />
          )}
          {activeTab === "reviews" && (
            <ReviewsList
              reviews={reviews}
              onLike={handleLikeReview}
              isOwn={!!user.isOwnProfile}
            />
          )}
          {activeTab === "watchlist" && (
            <WatchlistGrid items={user.watchlist} isOwn={!!user.isOwnProfile} />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditModal
          form={editForm}
          onChange={setEditForm}
          onSave={handleSaveEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// Activity Feed
function ActivityFeed({
  activities,
}: {
  activities: UserProfile["recentActivity"];
}) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <div className="text-5xl mb-4">🎬</div>
        <p>Nenhuma atividade ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
        >
          {activity.poster && (
            <img
              src={activity.poster}
              alt=""
              className="w-12 h-18 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-[#e63946] font-semibold uppercase tracking-wider">
                  {activity.type === "watched"
                    ? "Assistiu"
                    : activity.type === "reviewed"
                    ? "Avaliou"
                    : activity.type === "added_watchlist"
                    ? "Adicionou à Watchlist"
                    : "Passou a seguir"}
                </span>
                {activity.title && (
                  <p className="text-white font-semibold mt-0.5">
                    {activity.title}
                  </p>
                )}
                {activity.targetUser && (
                  <p className="text-white/70 text-sm mt-0.5">
                    @{activity.targetUser}
                  </p>
                )}
                {activity.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white/70 text-sm font-medium">
                      {activity.rating}/10
                    </span>
                  </div>
                )}
                {activity.comment && (
                  <p className="text-white/50 text-sm mt-1 italic">
                    "{activity.comment}"
                  </p>
                )}
              </div>
              <span className="text-xs text-white/25 flex-shrink-0">
                {activity.createdAt}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Reviews List
function ReviewsList({
  reviews,
  onLike,
  isOwn,
}: {
  reviews: Review[];
  onLike: (id: string) => void;
  isOwn: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <div className="text-5xl mb-4">✍️</div>
        <p>Nenhuma review ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
        >
          <div className="flex gap-4">
            <img
              src={review.moviePoster}
              alt={review.movieTitle}
              className="w-12 h-18 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white">{review.movieTitle}</h3>
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
                    <span className="text-white/50 text-xs ml-1">
                      {review.rating}/10
                    </span>
                  </div>
                </div>
                <span className="text-xs text-white/25 flex-shrink-0">
                  {review.createdAt}
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                {review.content}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => onLike(review.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    review.liked
                      ? "text-[#e63946]"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill={review.liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{review.likes}</span>
                </button>
                {isOwn && (
                  <button className="text-xs text-white/20 hover:text-white/50 transition-colors">
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Watchlist Grid
function WatchlistGrid({
  items,
  isOwn,
}: {
  items: UserProfile["watchlist"];
  isOwn: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <div className="text-5xl mb-4">🔖</div>
        <p>Watchlist vazia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2">
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {isOwn && (
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <button className="p-2 bg-[#e63946] rounded-full">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-white/80 truncate">
            {item.title}
          </p>
          <p className="text-xs text-white/30">
            {item.year} · {item.genre}
          </p>
        </div>
      ))}
    </div>
  );
}

// Edit Modal
function EditModal({
  form,
  onChange,
  onSave,
  onClose,
}: {
  form: { displayName: string; bio: string };
  onChange: (form: { displayName: string; bio: string }) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#111] rounded-3xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-xl font-black mb-6">Editar Perfil</h2>

        <div className="space-y-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center text-2xl font-black">
              {form.displayName.charAt(0).toUpperCase()}
            </div>
            <button className="px-4 py-2 rounded-xl border border-white/15 text-sm hover:bg-white/5 transition-colors">
              Trocar Avatar
            </button>
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
              Nome de exibição
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) =>
                onChange({ ...form, displayName: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e63946]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => onChange({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e63946]/50 transition-colors resize-none"
            />
            <p className="text-xs text-white/25 mt-1 text-right">
              {form.bio.length}/150
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3 rounded-xl bg-[#e63946] text-sm font-bold hover:bg-[#c1121f] transition-colors shadow-lg shadow-[#e63946]/20"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}