"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFollow(viewerId: string | null, targetId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refresh = async () => {
    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", targetId),
    ]);
    setFollowers(followersCount ?? 0);
    setFollowing(followingCount ?? 0);

    if (viewerId && viewerId !== targetId) {
      const { data } = await supabase.from("follows").select("*").eq("follower_id", viewerId).eq("following_id", targetId).maybeSingle();
      setIsFollowing(!!data);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [viewerId, targetId]);

  const toggle = async () => {
    if (!viewerId || loading) return;
    setLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", viewerId).eq("following_id", targetId);
      setIsFollowing(false);
      setFollowers((n) => Math.max(0, n - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: viewerId, following_id: targetId });
      setIsFollowing(true);
      setFollowers((n) => n + 1);
    }
    setLoading(false);
  };

  return { isFollowing, followers, following, toggle, loading };
}
