"use client";
// src/app/tv/TVPageClient.tsx

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play, Info, Home, Tv, Sword, Trophy, BookOpen,
  Star, Radio, Search, LogOut, X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Movie } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useTVNavigation } from "@/hooks/useTVNavigation";
import TVMovieCard from "@/components/tv/TVMovieCard";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TVPageClientProps {
  user: User;
  featuredMovie: Movie | null;
  moviesByCategory: Record<string, Movie[]>;
}

// ─── Sidebar links ────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/browse",    label: "Início",    Icon: Home },
  { href: "/series",    label: "Séries",    Icon: Tv },
  { href: "/animes",    label: "Animes",    Icon: Sword },
  { href: "/esportes",  label: "Esportes",  Icon: Trophy },
  { href: "/leitura",   label: "Leitura",   Icon: BookOpen },
  { href: "/favorites", label: "Favoritos", Icon: Star },
  { href: "/live",      label: "Ao Vivo",   Icon: Radio, live: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    fmt();
    const id = setInterval(fmt, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 500 }}>{time}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TVPageClient({ user, featuredMovie, moviesByCategory }: TVPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Hook de navegação D-pad — abrange toda a área de conteúdo
  const contentRef = useTVNavigation({
    onBack: () => {
      if (sidebarOpen) setSidebarOpen(false);
      else if (searchOpen) setSearchOpen(false);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  // Quando abre busca, foca o input
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push("/browse?q=" + encodeURIComponent(searchQuery.trim()));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const initials = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();
  const rows = Object.entries(moviesByCategory).filter(([, m]) => m.length > 0);

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#fff",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflowX: "hidden",
    }}>

      {/* ── CSS global TV ───────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --color-red: #e50914;
          --tv-sidebar-w: 72px;
          --tv-sidebar-expanded: 240px;
          --tv-card-w: 180px;
          --tv-card-gap: 18px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* scrollbar invisível nas rows */
        .tv-row-scroll::-webkit-scrollbar { display: none; }
        .tv-row-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* foco global para TV */
        *:focus { outline: none; }
        .tv-nav-btn:focus {
          background: rgba(229,9,20,0.15) !important;
          color: #fff !important;
        }
        .tv-search-btn:focus {
          box-shadow: 0 0 0 2px #e50914;
          border-radius: 8px;
        }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: sidebarOpen ? "var(--tv-sidebar-expanded)" : "var(--tv-sidebar-w)",
        background: sidebarOpen ? "rgba(8,8,16,0.98)" : "transparent",
        backdropFilter: sidebarOpen ? "blur(20px)" : "none",
        borderRight: sidebarOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          height: 72, display: "flex", alignItems: "center",
          padding: "0 20px", flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          {sidebarOpen ? (
            <span style={{
              fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap",
            }}>
              STREAM<span style={{ color: "var(--color-red)" }}>VAULT</span>
            </span>
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-red)" }}>S</span>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV_LINKS.map(({ href, label, Icon, live }) => (
            <Link
              key={href}
              href={href}
              className="tv-nav-btn"
              style={{
                display: "flex", alignItems: "center",
                gap: 14, padding: "13px 20px",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && live && (
                <span style={{
                  marginLeft: "auto", width: 7, height: 7,
                  borderRadius: "50%", background: "#e50914",
                  animation: "pulse 2s infinite",
                }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Rodapé sidebar */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--color-red)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14,
          }}>
            {initials}
          </div>
          {sidebarOpen && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.user_metadata?.full_name || "Usuário"}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  background: "none", border: "none",
                  color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4,
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Conteúdo principal ──────────────────────────────────────────────── */}
      <main
        ref={contentRef}
        style={{
          marginLeft: "var(--tv-sidebar-w)",
          minHeight: "100vh",
          transition: "margin-left 0.3s",
        }}
      >

        {/* Top bar */}
        <header style={{
          position: "fixed",
          top: 0,
          left: "var(--tv-sidebar-w)",
          right: 0,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          background: "linear-gradient(to bottom, rgba(8,8,16,0.95) 0%, transparent 100%)",
          zIndex: 50,
          transition: "left 0.3s",
        }}>
          {/* Botão menu */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="tv-search-btn"
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", width: 44, height: 44, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s",
            }}
          >
            {sidebarOpen ? <X size={18} /> : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <rect width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="6" width="12" height="2" rx="1" fill="currentColor"/>
                <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
              </svg>
            )}
          </button>

          {/* Busca */}
          <div style={{ flex: 1, maxWidth: 520, margin: "0 32px" }}>
            {searchOpen ? (
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes e séries..."
                  style={{
                    flex: 1, height: 44,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, padding: "0 18px",
                    color: "#fff", fontSize: 15,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: 44, padding: "0 20px", borderRadius: 10,
                    background: "var(--color-red)", border: "none",
                    color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    height: 44, width: 44, borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="tv-search-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  height: 44, width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "0 18px",
                  color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <Search size={16} />
                <span>Buscar filmes e séries...</span>
                <span style={{
                  marginLeft: "auto",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 5, padding: "2px 7px", fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                }}>
                  ↵ Enter
                </span>
              </button>
            )}
          </div>

          {/* Relógio */}
          <Clock />
        </header>

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        {featuredMovie && (
          <section
            data-tv-row
            style={{ position: "relative", height: "62vh", minHeight: 420, overflow: "hidden" }}
          >
            {/* Backdrop */}
            {featuredMovie.backdrop && (
              <Image
                src={featuredMovie.backdrop}
                alt={featuredMovie.title}
                fill
                priority
                className="object-cover"
                style={{ filter: "brightness(0.45)" }}
              />
            )}

            {/* Gradientes */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.5) 40%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(to top, #080810 0%, transparent 100%)",
            }} />

            {/* Conteúdo hero */}
            <div style={{
              position: "absolute", bottom: "14%", left: 60,
              maxWidth: 560,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.35)",
                borderRadius: 4, padding: "4px 10px", marginBottom: 16,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e50914" }} />
                <span style={{ color: "#e50914", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Em Destaque
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(28px, 3.5vw, 52px)",
                fontWeight: 700, lineHeight: 1.1,
                marginBottom: 14, letterSpacing: "-0.01em",
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}>
                {featuredMovie.title}
              </h1>

              {featuredMovie.description && (
                <p style={{
                  fontSize: 15, color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6, marginBottom: 28,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                }}>
                  {featuredMovie.description}
                </p>
              )}

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link
                  href={`/movie/${featuredMovie.id}`}
                  data-tv-item
                  tabIndex={-1}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 32px", borderRadius: 10,
                    background: "#fff", color: "#000",
                    fontSize: 16, fontWeight: 700,
                    textDecoration: "none",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px #e50914, 0 12px 40px rgba(0,0,0,0.6)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <Play size={18} fill="black" />
                  Assistir
                </Link>

                <Link
                  href={`/movie/${featuredMovie.id}`}
                  data-tv-item
                  tabIndex={-1}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 28px", borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#fff", fontSize: 16, fontWeight: 600,
                    textDecoration: "none",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px #e50914";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <Info size={18} />
                  Mais info
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Linhas de categorias ─────────────────────────────────────────── */}
        <section style={{ padding: "20px 0 60px", marginTop: featuredMovie ? 0 : 80 }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
              <p>Nenhum conteúdo cadastrado ainda.</p>
            </div>
          ) : rows.map(([category, movies]) => (
            <div
              key={category}
              onFocus={() => setFocusedCategory(category)}
              style={{ marginBottom: 40 }}
            >
              {/* Título da linha */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "0 40px 14px",
              }}>
                <div style={{
                  width: 3, height: 20, borderRadius: 2,
                  background: focusedCategory === category ? "var(--color-red)" : "rgba(255,255,255,0.15)",
                  transition: "background 0.3s",
                  flexShrink: 0,
                }} />
                <h2 style={{
                  fontSize: 18, fontWeight: 600,
                  color: focusedCategory === category ? "#fff" : "rgba(255,255,255,0.7)",
                  transition: "color 0.3s",
                  letterSpacing: "0.01em",
                }}>
                  {category}
                </h2>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.25)",
                  marginLeft: 2,
                }}>
                  {movies.length} títulos
                </span>
              </div>

              {/* Scroll horizontal */}
              <div
                data-tv-row
                className="tv-row-scroll"
                style={{
                  display: "flex",
                  gap: "var(--tv-card-gap)",
                  padding: "8px 40px 20px",
                  overflowX: "auto",
                }}
              >
                {movies.map((movie) => (
                  <TVMovieCard
                    key={movie.id}
                    movie={movie}
                    userId={user.id}
                    data-tv-item=""
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Dica de controle */}
        <div style={{
          position: "fixed", bottom: 24, right: 32,
          display: "flex", gap: 10, alignItems: "center",
          background: "rgba(8,8,16,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, padding: "10px 16px",
          fontSize: 12, color: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
        }}>
          {["↑↓", "←→", "↵"].map((k, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 4, padding: "2px 6px",
                fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.5)",
              }}>
                {k}
              </kbd>
              <span>{["linha", "item", "abrir"][i]}</span>
            </span>
          ))}
        </div>

      </main>
    </div>
  );
}