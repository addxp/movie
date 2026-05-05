"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Heart, LogOut, X, Menu, Home, Tv, Sword, Trophy,
  BookOpen, Star, FolderOpen, Radio, ShieldCheck, Download,
  LayoutGrid, Monitor, MessageSquarePlus
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps { user: User; }

const ALL_LINKS = [
  { href: "/browse",      label: "Início",    Icon: Home },
  { href: "/series",      label: "Séries",    Icon: Tv },
  { href: "/animes",      label: "Animes",    Icon: Sword },
  { href: "/esportes",    label: "Esportes",  Icon: Trophy },
  { href: "/top",         label: "Top 10",    Icon: Trophy },
  { href: "/requests",    label: "Pedidos",   Icon: MessageSquarePlus },
  { href: "/leitura",     label: "Leitura",   Icon: BookOpen },
  { href: "/favorites",   label: "Favoritos", Icon: Star },
  { href: "/collections", label: "Coleções",  Icon: FolderOpen },
  { href: "/live",        label: "Ao Vivo",   Icon: Radio, live: true },
  { href: "/downloads",   label: "Downloads", Icon: Download },
  { href: "/admin",       label: "Admin",     Icon: ShieldCheck },
];

const BOTTOM_LINKS = ["/browse", "/series", "/animes", "/downloads"];
const LAYOUT_KEY = "streamvault_layout";

function Logo({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "sm"
    ? "text-[18px] tracking-[0.06em]"
    : "text-[20px] tracking-[0.06em]";
  return (
    <Link href="/browse" className="flex items-center select-none">
      <span className={`text-white font-bold ${cls}`} style={{ fontFamily: "var(--font-display)" }}>
        STREAM<span style={{ color: "var(--color-red)" }}>VAULT</span>
      </span>
    </Link>
  );
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    setMobileLayout(saved !== "classic");
    setLayoutReady(true);
  }, []);

  const toggleLayout = () => {
    const next = !mobileLayout;
    setMobileLayout(next);
    localStorage.setItem(LAYOUT_KEY, next ? "mobile" : "classic");
    setDrawerOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
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

  if (!layoutReady) return null;

  // ─── CLASSIC DESKTOP LAYOUT ──────────────────────────────────
  if (!mobileLayout) return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[var(--color-bg)]/96 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_1px_40px_rgba(0,0,0,0.6)]"
        : "bg-gradient-to-b from-black/60 to-transparent"
    }`}>
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-12">

          <Logo size="sm" />

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {ALL_LINKS.filter(l => !["/admin", "/requests"].includes(l.href)).slice(0, 9).map(({ href, label, live }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`relative text-[12px] font-medium tracking-wide transition-colors duration-200 flex items-center gap-1.5 ${
                    active ? "text-white" : "text-[var(--color-muted)] hover:text-white/80"
                  }`}
                >
                  {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  {label}
                  {active && (
                    <span className="absolute -bottom-[13px] left-0 right-0 h-[1.5px] rounded-full bg-[var(--color-red)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-0.5">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 mr-1">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="input-glow bg-white/[0.05] border border-white/10 rounded-md px-3 py-1.5 text-white placeholder:text-[var(--color-muted)] text-[12px] w-48 transition-all"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="text-[var(--color-muted)] hover:text-white p-1 transition-colors">
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                className="text-[var(--color-muted)] hover:text-white p-2 rounded-md hover:bg-white/[0.04] transition-all">
                <Search size={15} />
              </button>
            )}

            <Link href="/favorites"
              className="text-[var(--color-muted)] hover:text-white p-2 rounded-md hover:bg-white/[0.04] transition-all">
              <Heart size={15} />
            </Link>

            <button onClick={toggleLayout} title="Layout mobile"
              className="text-[var(--color-muted)] hover:text-white p-2 rounded-md hover:bg-white/[0.04] transition-all">
              <LayoutGrid size={15} />
            </button>

            {/* User */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/[0.07]">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                style={{ background: "var(--color-red)" }}
              >
                {initials}
              </div>
              <button onClick={handleSignOut}
                className="text-[var(--color-muted)] hover:text-white p-1.5 rounded-md hover:bg-white/[0.04] transition-all"
                title="Sair">
                <LogOut size={13} />
              </button>
            </div>
          </div>

          {/* Mobile search toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setSearchOpen(v => !v)}>
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar filmes..."
                className="input-glow flex-1 bg-white/[0.05] border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-[var(--color-muted)] text-sm"
              />
              <button type="submit"
                className="px-3 rounded-md text-white text-sm"
                style={{ background: "var(--color-red)" }}>
                <Search size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );

  // ─── MOBILE LAYOUT (bottom nav + drawer) ────────────────────
  return (
    <>
      {/* Top bar — logo + search only */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--color-bg)]/96 backdrop-blur-2xl border-b border-white/[0.04]"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}>
        <div className="max-w-[1800px] mx-auto px-5">
          <div className="flex items-center justify-between h-12">
            <Logo size="sm" />
            <div className="flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="input-glow bg-white/[0.06] border border-white/10 rounded-md px-3 py-1.5 text-white placeholder:text-[var(--color-muted)] text-sm w-48"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}
                    className="text-[var(--color-muted)] hover:text-white p-1">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-white p-2">
                  <Search size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Side drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-60 flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#0e0e0e", borderLeft: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-12 px-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Logo size="sm" />
          <button onClick={() => setDrawerOpen(false)}
            className="text-white/30 hover:text-white/70 p-1 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Drawer search */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 rounded-md px-3 py-2 text-white text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button type="submit"
              className="px-3 rounded-md text-white"
              style={{ background: "var(--color-red)" }}>
              <Search size={13} />
            </button>
          </form>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-4 pt-3 pb-1.5 text-[9px] tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}>Navegar</p>
          {ALL_LINKS.map(({ href, label, Icon, live }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] relative transition-colors"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  background: active ? "rgba(229,9,20,0.07)" : "transparent"
                }}>
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
                    style={{ background: "var(--color-red)" }} />
                )}
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: active ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.05)" }}>
                  <Icon size={12} />
                </div>
                <span className="flex-1 font-medium">{label}</span>
                {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </Link>
            );
          })}

          <p className="px-4 pt-4 pb-1.5 text-[9px] tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}>Preferências</p>
          <button onClick={toggleLayout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <Monitor size={12} />
            </div>
            Layout clássico
          </button>

          <p className="px-4 pt-4 pb-1.5 text-[9px] tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}>Conta</p>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <LogOut size={12} />
            </div>
            Sair
          </button>
        </nav>

        {/* Drawer user footer */}
        <div className="px-4 py-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: "var(--color-red)" }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] text-white font-medium truncate leading-tight">
                {user.user_metadata?.full_name || "Usuário"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-14 pb-safe"
        style={{ background: "rgba(8,8,8,0.97)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {ALL_LINKS.filter(l => BOTTOM_LINKS.includes(l.href)).map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative">
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-b-full"
                  style={{ background: "var(--color-red)" }} />
              )}
              <Icon size={18} color={active ? "var(--color-red)" : "rgba(255,255,255,0.3)"} />
              <span className="text-[10px] font-medium"
                style={{ color: active ? "var(--color-red)" : "rgba(255,255,255,0.3)" }}>
                {label}
              </span>
            </Link>
          );
        })}
        <button onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
          <Menu size={18} color="rgba(255,255,255,0.3)" />
          <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Menu</span>
        </button>
      </nav>

      <div className="h-12" />
    </>
  );
}