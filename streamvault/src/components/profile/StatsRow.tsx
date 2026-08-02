import type { ProfileStats } from "@/lib/profiles";
import { Star } from "lucide-react";

export default function StatsRow({ stats }: { stats: ProfileStats }) {
  const items = [
    { label: "Avaliações", value: stats.reviewCount },
    { label: "Favoritos", value: stats.favoriteCount },
    { label: "Seguidores", value: stats.followerCount },
    { label: "Seguindo", value: stats.followingCount },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "26px", flexWrap: "wrap", padding: "18px 20px 0" }}>
      {items.map((it) => (
        <div key={it.label} style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--text)" }}>{it.value}</p>
          <p style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{it.label}</p>
        </div>
      ))}
      {stats.avgRating != null && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--text)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
            <Star size={14} fill="#F5C518" color="#F5C518" /> {stats.avgRating.toFixed(1)}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nota média</p>
        </div>
      )}
    </div>
  );
}
