"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Sparkles, Zap, Clapperboard, Ghost, Drama, Swords, Laugh } from "lucide-react";
import type { Movie } from "@/types";
import { createClient } from "@/lib/supabase/client";

/* ── Popular Movies — top 5 with large ranking numbers ── */
export function SidebarPopular({ movies }: { movies: Movie[] }) {
  const top5 = movies.slice(0, 5);
  if (top5.length === 0) return null;
  return (
    <SidebarCard title="Populares">
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {top5.map((movie, i) => (
          <Link key={movie.id} href={"/movie/" + movie.id} className="sp-item" style={{
            display: "flex", alignItems: "center", gap: "14px", textDecoration: "none",
            padding: "8px 4px", borderRadius: "10px", position: "relative", overflow: "hidden",
          }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "34px",
              lineHeight: 1, color: "transparent", WebkitTextStroke: "1.3px var(--border-3)",
              flexShrink: 0, width: "34px", textAlign: "center",
            }}>
              {i + 1}
            </span>
            <div style={{ width: "40px", height: "56px", borderRadius: "7px", overflow: "hidden", flexShrink: 0, background: "var(--bg-4)" }}>
              <img src={movie.thumbnail} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--text)", fontSize: "12.5px", fontWeight: 600, fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {movie.title}
              </p>
              <p style={{ color: "var(--text-3)", fontSize: "11px", fontFamily: "var(--font-body)", marginTop: "1px" }}>
                {movie.category}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <style>{`.sp-item:hover { background: rgba(255,255,255,0.04); }`}</style>
    </SidebarCard>
  );
}

/* ── Premium banner: black + red gradient CTA ── */
export function PremiumBanner() {
  return (
    <div style={{
      position: "relative", borderRadius: "var(--radius)", overflow: "hidden",
      padding: "26px 24px", background: "linear-gradient(155deg, #1a0407 0%, #050505 55%, #050505 100%)",
      border: "1px solid var(--red-border)",
    }}>
      <div style={{ position: "absolute", top: "-40%", right: "-30%", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, var(--red-dim-2) 0%, transparent 70%)" }} />
      <div style={{ position: "relative" }}>
        <Sparkles size={18} color="var(--red)" style={{ marginBottom: "14px" }} />
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px", color: "#fff", lineHeight: 1.2, marginBottom: "16px" }}>
          Assista sem limites.
        </h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {["4K Ultra HD", "Dolby Atmos", "Dispositivos ilimitados", "Sem anúncios"].map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "12.5px", color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
              <Zap size={12} color="var(--red)" /> {f}
            </li>
          ))}
        </ul>
        <button className="pb-cta" style={{
          width: "100%", background: "var(--red)", color: "#fff", border: "none",
          borderRadius: "var(--radius-sm)", padding: "12px", fontFamily: "var(--font-body)",
          fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}>
          Fazer upgrade
        </button>
        <style>{`.pb-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 26px var(--red-glow); }`}</style>
      </div>
    </div>
  );
}

/* ── Genres — square icon tiles ── */
const GENRES = [
  { label: "Ação",     Icon: Swords },
  { label: "Drama",    Icon: Drama },
  { label: "Ficção",   Icon: Sparkles },
  { label: "Comédia",  Icon: Laugh },
  { label: "Terror",   Icon: Ghost },
  { label: "Animação", Icon: Clapperboard },
];

export function GenresGrid() {
  return (
    <SidebarCard title="Gêneros">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {GENRES.map(({ label, Icon }) => (
          <Link key={label} href={"/category/" + encodeURIComponent(label)} className="gg-tile" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
            aspectRatio: "1", borderRadius: "var(--radius-sm)", background: "var(--bg-3)",
            border: "1px solid var(--border)", textDecoration: "none", transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
          }}>
            <Icon size={17} color="var(--text-2)" />
            <span style={{ fontSize: "10.5px", color: "var(--text-2)", fontFamily: "var(--font-body)", fontWeight: 500 }}>{label}</span>
          </Link>
        ))}
      </div>
      <style>{`.gg-tile:hover { background: var(--bg-4); border-color: var(--border-2); transform: translateY(-2px); }`}</style>
    </SidebarCard>
  );
}

/* ── Continue Watching — compact sidebar version ── */
interface WatchItem { id: string; progress: number; duration: number; movies: { id: string; title: string; thumbnail: string } }

export function SidebarContinueWatching({ userId }: { userId: string }) {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("watch_history")
        .select("id, progress, duration, movies(id, title, thumbnail)")
        .eq("user_id", userId).eq("completed", false)
        .order("watched_at", { ascending: false }).limit(4);
      if (data) setItems(data as unknown as WatchItem[]);
      setLoading(false);
    })();
  }, [userId]);

  if (loading || items.length === 0) return null;

  return (
    <SidebarCard title="Continuar Assistindo">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item) => {
          const pct = item.duration > 0 ? Math.min((item.progress / item.duration) * 100, 100) : 20;
          return (
            <Link key={item.id} href={"/movie/" + item.movies.id} className="scw-item" style={{ display: "flex", gap: "12px", textDecoration: "none", alignItems: "center" }}>
              <div style={{ position: "relative", width: "68px", height: "44px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "var(--bg-4)" }}>
                <img src={item.movies.thumbnail} alt={item.movies.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={11} fill="#fff" strokeWidth={0} />
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.2)" }}>
                  <div style={{ height: "100%", width: pct + "%", background: "var(--red)" }} />
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "var(--text)", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.movies.title}
                </p>
                <p style={{ color: "var(--text-3)", fontSize: "10.5px", fontFamily: "var(--font-body)", marginTop: "1px" }}>{Math.round(pct)}% assistido</p>
              </div>
            </Link>
          );
        })}
      </div>
      <style>{`.scw-item:hover p:first-of-type { color: var(--red); }`}</style>
    </SidebarCard>
  );
}

/* ── AI recommendation card ── */
export function AIRecommendationCard() {
  return (
    <div style={{
      borderRadius: "var(--radius)", padding: "24px", textAlign: "center",
      background: "var(--bg-3)", border: "1px solid var(--border-2)", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto 16px",
        background: "linear-gradient(135deg, var(--red) 0%, #4a0209 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 24px var(--red-dim-2)",
      }}>
        <Sparkles size={19} color="#fff" />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15.5px", color: "#fff", marginBottom: "6px" }}>
        Não sabe o que assistir?
      </h3>
      <p style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--font-body)", marginBottom: "18px", lineHeight: 1.5 }}>
        Deixe a IA sugerir algo com base no seu gosto.
      </p>
      <button className="ai-cta" style={{
        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-3)",
        color: "#fff", borderRadius: "var(--radius-sm)", padding: "11px", fontFamily: "var(--font-body)",
        fontWeight: 600, fontSize: "12.5px", cursor: "pointer", transition: "background 0.2s ease, border-color 0.2s ease",
      }}>
        Descobrir com IA
      </button>
      <style>{`.ai-cta:hover { background: var(--red-dim); border-color: var(--red-border); }`}</style>
    </div>
  );
}

/* ── Shared card shell ── */
function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "var(--radius)", background: "var(--bg-3)", border: "1px solid var(--border-2)", padding: "20px" }}>
      <h3 style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "14px" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
