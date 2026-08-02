import type { ProfileStats } from "@/lib/profiles";
import { Star } from "lucide-react";
import Link from "next/link";

export default function StatsRow({ stats, username }: { stats: ProfileStats; username: string }) {
  const items = [
    { label: "Avaliações", value: stats.reviewCount, href: null },
    { label: "Favoritos", value: stats.favoriteCount, href: null },
    { label: "Seguidores", value: stats.followerCount, href: `/profile/${username}/followers` },
    { label: "Seguindo", value: stats.followingCount, href: `/profile/${username}/following` },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "26px", flexWrap: "wrap", padding: "18px 20px 0" }}>
      {items.map((it) => {
        const content = (
          <div style={{ textAlign: "center" as const }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--text)" }}>{it.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{it.label}</p>
          </div>
        );
        return it.href ? (
          <Link key={it.label} href={it.href} style={{ textDecoration: "none" }}>{content}</Link>
        ) : (
          <div key={it.label}>{content}</div>
        );
      })}
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
