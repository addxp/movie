"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useProfileActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const saveProfile = async (userId: string, fields: { username: string; full_name?: string; bio?: string }) => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from("profiles").upsert({ id: userId, ...fields });
    setLoading(false);
    if (err) setError(err.code === "23505" ? "Esse nome de usuário já está em uso." : err.message);
    return { error: err ? (err.code === "23505" ? "Esse nome de usuário já está em uso." : err.message) : null };
  };

  const submitReview = async (userId: string, movieId: string, rating: number, body: string) => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase
      .from("reviews")
      .upsert({ user_id: userId, movie_id: movieId, rating, body }, { onConflict: "user_id,movie_id" });
    setLoading(false);
    if (err) setError(err.message);
    return { error: err?.message ?? null };
  };

  const deleteReview = async (reviewId: string) => {
    const { error: err } = await supabase.from("reviews").delete().eq("id", reviewId);
    return { error: err?.message ?? null };
  };

  return { saveProfile, submitReview, deleteReview, loading, error };
}
