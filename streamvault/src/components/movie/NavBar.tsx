"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, LogOut, X, Menu, Home, Tv, Sword, Trophy, BookOpen, Star, FolderOpen, Radio, ShieldCheck, Download } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps { user: User; }

const ALL_LINKS = [
  { href: "/browse",      label: "Início",    Icon: Home },
  { href: "/series",      label: "Séries",    Icon: Tv },
  { href: "/animes",      label: "Animes",    Icon: Sword },
  { href: "/esportes",    label: "Esportes",  Icon: Trophy },
  { href: "/leitura",     label: "Leitura",   Icon: BookOpen },
  { href: "/favorites",   label: "Favoritos", Icon: Star },
  { href: "/collections", label: "Coleções",  Icon: FolderOpen },
  { href: "/live",        label: "Ao Vivo",   Icon: Radio, live: true },
  { href: "/downloads",   label: "Downloads", Icon: Download },
  { href: "/admin",       label: "Admin",     Icon: ShieldCheck },
];

// Início, Séries, Animes + Downloads (substituiu Favoritos)
const BOTTOM_LINKS = ["/browse", "/series", "/animes", "/downloads"];

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push("/browse?q=" + encodeURIComponent(searchQuery.trim()));
      setSearchOpen(false);
      setSearchQuery("");
      setDrawerOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const initials = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();

  const navLink = (href: string, label: string, extra?: React.ReactNode) => {
    const active = pathname === href;
    return (
      <Link href={href} className={"flex items-center gap-1.5 text-sm transition-all duration-200 " + (active ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white")}>
        {extra}{label}
      </Link>
    );
  };

  return (
    <>
      {/* ── NAVBAR TOPO ── */}
      <nav className={"fixed top-0 left-0 right-0 z-50 transition-all duration-500 " + (scrolled ? "bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-white/[0.04] shadow-2xl" : "bg-gradient-to-b from-black/70 to-transparent")}>
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            <Link href="/browse" className="flex items-center">
              <span className="text-[28px] text-white tracking-wider font-display" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                STREAM<span style={{ color: "var(--color-red)" }}>VAULT</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navLink("/browse", "Início")}
              {navLink("/series", "Séries")}
              {navLink("/animes", "Animes")}
              {navLink("/esportes", "Esportes")}
              {navLink("/leitura", "Leitura")}
              {navLink("/favorites", "Favoritos")}
              {navLink("/collections", "Coleções")}
              {navLink("/live", "Ao Vivo", <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />)}
              {navLink("/downloads", "Downloads")}
              {navLink("/admin", "Admin")}
            </div>

            <div className="hidden md:flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="input-glow bg-white/[0.06] border border-white/10 rounded-lg px-4 py-1.5 text-white placeholder:text-[var(--color-muted)] text-sm w-52 transition-all" />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-[var(--color-muted)] hover:text-white p-1.5 transition-colors">
                    <X size={15} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-[var(--color-muted)] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
                  <Search size={17} />
                </button>
              )}
              <Link href="/favorites" className="text-[var(--color-muted)] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
                <Heart size={17} />
              </Link>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ background: "var(--color-red)" }}>
                  {initials}
                </div>
                <button onClick={handleSignOut} className="text-[var(--color-muted)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all" title="Sair">
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Botão busca mobile */}
            <button className="md:hidden text-white p-2" onClick={() => setSearchOpen((v) => !v)} aria-label="Buscar">
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </button>
          </div>

          {searchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes..."
                  className="input-glow flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-muted)] text-sm" />
                <button type="submit" className="bg-[var(--color-red)] text-white px-4 rounded-lg">
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* ── OVERLAY ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── DRAWER LATERAL ── */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#111", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between h-16 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-base text-white font-bold tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
            STREAM<span style={{ color: "var(--color-red)" }}>VAULT</span>
          </span>
          <button onClick={() => setDrawerOpen(false)} className="text-white/40 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 rounded-lg px-3 py-2 text-white text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <button type="submit" className="px-3 rounded-lg text-white" style={{ background: "var(--color-red)" }}>
              <Search size={14} />
            </button>
          </form>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-5 pt-3 pb-1 text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Navegar</p>

          {ALL_LINKS.map(({ href, label, Icon, live }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-5 py-3 text-sm relative transition-colors"
                style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)", background: active ? "rgba(220,38,38,0.08)" : "transparent" }}>
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r" style={{ background: "var(--color-red)" }} />}
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: active ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.06)" }}>
                  <Icon size={14} />
                </div>
                <span className="flex-1">{label}</span>
                {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </Link>
            );
          })}

          <p className="px-5 pt-5 pb-1 text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Conta</p>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <LogOut size={14} />
            </div>
            Sair
          </button>
        </nav>

        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "var(--color-red)" }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white font-medium truncate">{user.user_metadata?.full_name || "Usuário"}</p>
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around h-16 pb-1"
        style={{ background: "rgba(13,13,13,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {ALL_LINKS.filter((l) => BOTTOM_LINKS.includes(l.href)).map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 flex-1 py-2">
              <Icon size={20} color={active ? "var(--color-red)" : "rgba(255,255,255,0.35)"} />
              <span className="text-[10px]" style={{ color: active ? "var(--color-red)" : "rgba(255,255,255,0.35)" }}>{label}</span>
              {active && <span className="w-1 h-1 rounded-full" style={{ background: "var(--color-red)", marginTop: "-2px" }} />}
            </Link>
          );
        })}

        <button onClick={() => setDrawerOpen(true)} className="flex flex-col items-center gap-1 flex-1 py-2">
          <Menu size={20} color="rgba(255,255,255,0.35)" />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Menu</span>
        </button>
      </nav>

      <div className="md:hidden h-16" />
    </>
  );
}