import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  created_at: string;
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

export async function searchProfiles(query: string): Promise<Profile[]> {
  const clean = query.trim();
  if (!clean) return [];
  const safe = escapeForIlike(clean);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
    .limit(24);
  return data || [];
}
