import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  claimed?: boolean;
  created_at: string;
}

export interface ProfileStats {
  reviewCount: number;
  favoriteCount: number;
  avgRating: number | null;
  followerCount: number;
  followingCount: number;
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient();
  const [{ count: reviewCount, data: ratings }, { count: favoriteCount }, { count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from("reviews").select("rating", { count: "exact" }).eq("user_id", userId),
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);

  const nums = (ratings || []).map((r: { rating: number }) => r.rating);
  const avgRating = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

  return {
    reviewCount: reviewCount ?? 0,
    favoriteCount: favoriteCount ?? 0,
    avgRating,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
  };
}

export async function isFollowing(viewerId: string, targetId: string): Promise<boolean> {
  if (viewerId === targetId) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("follows").select("follower_id").match({ follower_id: viewerId, following_id: targetId }).maybeSingle();
  return !!data;
}

export async function getFollowers(userId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("follows").select("follower_id").eq("following_id", userId);
  const ids = (rows || []).map((r) => r.follower_id);
  if (ids.length === 0) return [];
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return data || [];
}

export async function getFollowing(userId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
  const ids = (rows || []).map((r) => r.following_id);
  if (ids.length === 0) return [];
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return data || [];
}

export interface ReviewWithMovie {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  movies: { id: string; title: string; thumbnail: string; release_year?: number } | null;
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  return data;
}

export async function getUserReviews(userId: string): Promise<ReviewWithMovie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, movies(id, title, thumbnail, release_year)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as unknown as ReviewWithMovie[]) || [];
}

function escapeForIlike(q: string) {
  return q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/,/g, "\\,").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export async function listProfiles(limit = 40): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const clean = query.trim();
  if (!clean) return [];
  const safe = escapeForIlike(clean);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${safe}%,full_name.ilike.%${safe}%`)
    .limit(24);
  return data || [];
}
