"use client";
// src/app/tv/TVPageClient.tsx

import "./tv.css";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play, Info, Home, Tv, Sword, Trophy, BookOpen,
  Star, Radio, Search, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTVNavigation } from "@/hooks/useTVNavigation";
import { tvBackdrop } from "@/lib/tv-image";
import type { TVMovie, TVFeatured } from "@/lib/tv-movies";
import TVMovieCard from "@/components/tv/TVMovieCard";

interface TVPageClientProps {
  user: { email: string; name: string };
  featured: TVFeatured | null;
  moviesByCategory: Record<string, TVMovie[]>;
}

const NAV_LINKS = [
  { href: "/browse",    label: "Início",    Icon: Home },
  { href: "/series",    label: "Séries",    Icon: Tv },
  { href: "/animes",    label: "Animes",    Icon: Sword },
  { href: "/esportes",  label: "Esportes",  Icon: Trophy },
  { href: "/leitura",   label: "Leitura",   Icon: BookOpen },
  { href: "/favorites", label: "Favoritos", Icon: Star },
  { href: "/live",      label: "Ao Vivo",   Icon: Radio, live: true },
];

// Nomes no banco não têm acento; aqui só para exibição
const CATEGORY_LABELS: Record<string, string> = {
  Acao: "Ação",
  Ficcao: "Ficção",
  Comedia: "Comédia",
  Animacao: "Animação",
};

// Renderização progressiva: menos DOM e menos imagens na abertura
const INITIAL_ROWS = 3;
const ROWS_STEP = 2;
const INITIAL_ITEMS = 12;
const ITEMS_STEP = 8;

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tv-clock">{time}</span>;
}

export default function TVPageClient({ user, featured, moviesByCategory }: TVPageClientProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const searchWasOpen = useRef(false);

  const rootRef = useTVNavigation({
    onBack: () => {
      if (searchOpen) {
        setSearchOpen(false);
        return true;
      }
      return false;
    },
  });

  // Liga/desliga os ajustes de CSS do modo TV só enquanto esta página está aberta
  useEffect(() => {
    document.documentElement.classList.add("tv-mode");
    document.body.classList.add("tv-mode");
    return () => {
      document.documentElement.classList.remove("tv-mode");
      document.body.classList.remove("tv-mode");
    };
  }, []);

  // Foco: abre busca → campo; fecha busca → volta ao botão
  useEffect(() => {
    if (searchOpen) {
      searchWasOpen.current = true;
      searchRef.current?.focus();
    } else if (searchWasOpen.current) {
      searchWasOpen.current = false;
      searchBtnRef.current?.focus({ preventScroll: true });
    }
  }, [searchOpen]);

  const rows = useMemo(
    () => Object.entries(moviesByCategory).filter(([, m]) => m.length > 0),
    [moviesByCategory]
  );

  // Chamado quando um card recebe foco: libera mais linhas/itens perto do fim.
  // Retorna o mesmo estado quando nada muda, então não causa re-render à toa.
  const onCardFocus = useCallback(
    (rowIdx: number, colIdx: number, category: string, total: number) => {
      setVisibleRows((v) => (rowIdx >= v - 1 ? v + ROWS_STEP : v));
      setLimits((prev) => {
        const cur = prev[category] ?? INITIAL_ITEMS;
        if (cur < total && colIdx >= cur - 3) {
          return { ...prev, [category]: Math.min(total, cur + ITEMS_STEP) };
        }
        return prev;
      });
    },
    []
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push("/browse?q=" + encodeURIComponent(q));
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/auth/login");
  };

  const initials = (user.name || user.email || "U")[0].toUpperCase();

  return (
    <div className="tv-root" ref={rootRef}>
      {/* ── Menu lateral: expande quando recebe foco (→ ← no controle) ───── */}
      <aside className="tv-side">
        <div className="tv-side-logo">
          <span className="tv-short"><b>S</b></span>
          <span className="tv-full">STREAM<b>VAULT</b></span>
        </div>

        <nav className="tv-side-nav" data-tv-col>
          {NAV_LINKS.map(({ href, label, Icon, live }) => (
            <Link key={href} href={href} prefetch={false} className="tv-side-link" data-tv-item="">
              <Icon size={22} />
              <span className="tv-side-label">{label}</span>
              {live ? <span className="tv-live-dot" /> : null}
            </Link>
          ))}
          <button type="button" className="tv-side-link" data-tv-item="" onClick={handleSignOut}>
            <LogOut size={22} />
            <span className="tv-side-label">Sair</span>
          </button>
        </nav>

        <div className="tv-side-user">
          <div className="tv-avatar">{initials}</div>
          <div className="tv-user-text">
            <p className="tv-user-name">{user.name || "Usuário"}</p>
            <p className="tv-user-mail">{user.email}</p>
          </div>
        </div>
      </aside>

      <main className="tv-main">
        {/* ── Topo: busca + relógio ─────────────────────────────────────── */}
        <header className="tv-header" data-tv-row data-tv-header>
          {searchOpen ? (
            <form className="tv-search-form" onSubmit={handleSearch}>
              <input
                ref={searchRef}
                className="tv-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite e aperte OK para buscar (Voltar fecha)"
              />
              <button type="submit" className="tv-search-submit">Buscar</button>
            </form>
          ) : (
            <button
              ref={searchBtnRef}
              type="button"
              className="tv-search-btn"
              data-tv-item=""
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
              <span>Buscar filmes e séries</span>
            </button>
          )}
          <Clock />
        </header>

        {/* ── Destaque ──────────────────────────────────────────────────── */}
        {featured && (
          <section className="tv-hero" data-tv-row>
            <img className="tv-hero-img" src={tvBackdrop(featured.backdrop)} alt="" decoding="async" />
            <div className="tv-hero-shade" />
            <div className="tv-hero-fade" />

            <div className="tv-hero-body">
              <span className="tv-tag">Em Destaque</span>
              <h1 className="tv-hero-title">{featured.title}</h1>
              {featured.description ? <p className="tv-hero-desc">{featured.description}</p> : null}

              <div className="tv-hero-actions">
                <Link href={`/movie/${featured.id}`} prefetch={false} className="tv-btn tv-btn-primary" data-tv-item="">
                  <Play size={20} fill="currentColor" />
                  Assistir
                </Link>
                <Link href={`/movie/${featured.id}`} prefetch={false} className="tv-btn tv-btn-secondary" data-tv-item="">
                  <Info size={20} />
                  Mais info
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Linhas de categorias ──────────────────────────────────────── */}
        <section className={featured ? "tv-rows" : "tv-rows tv-rows-nohero"}>
          {rows.length === 0 ? (
            <div className="tv-empty">Nenhum conteúdo cadastrado ainda.</div>
          ) : (
            rows.slice(0, visibleRows).map(([category, movies], rowIdx) => {
              const limit = limits[category] ?? INITIAL_ITEMS;
              return (
                <div className="tv-rowwrap" data-tv-group key={category}>
                  <div className="tv-rowhead">
                    <span className="tv-rowbar" />
                    <h2 className="tv-rowtitle">{CATEGORY_LABELS[category] ?? category}</h2>
                    <span className="tv-rowcount">{movies.length} títulos</span>
                  </div>

                  <div className="tv-row" data-tv-row>
                    {movies.slice(0, limit).map((movie, colIdx) => (
                      <TVMovieCard
                        key={movie.id}
                        movie={movie}
                        category={category}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                        total={movies.length}
                        onFocusCard={onCardFocus}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>

        <div className="tv-hint" aria-hidden="true">
          <span><kbd>▲▼◀▶</kbd>navegar</span>
          <span><kbd>OK</kbd>abrir</span>
          <span><kbd>Voltar</kbd>topo</span>
        </div>
      </main>
    </div>
  );
}
