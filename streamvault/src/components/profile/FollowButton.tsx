"use client";
import { useFollow } from "@/hooks/useFollow";

export default function FollowButton({ viewerId, targetId, initialFollowing }: { viewerId: string | null; targetId: string; initialFollowing: boolean }) {
  const { isFollowing, toggle, loading } = useFollow(viewerId, targetId);
  const following = isFollowing || initialFollowing;

  if (!viewerId || viewerId === targetId) return null;

  return (
    <button onClick={toggle} disabled={loading} style={{
      background: following ? "rgba(255,255,255,0.06)" : "var(--red)",
      border: following ? "1px solid var(--border-3)" : "none",
      color: "#fff", borderRadius: "10px", padding: "10px 20px",
      fontWeight: 700, fontSize: "13px", cursor: "pointer",
      opacity: loading ? 0.6 : 1,
    }}>
      {following ? "Seguindo" : "Seguir"}
    </button>
  );
}
