"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, LogOut, X, Home, BookMarked, ShieldCheck, Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps { user: User; }

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha drawer ao navegar
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const userInitial = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();

  const navLinks = [
    { href: "/browse",     label: "Início",    Icon: Home },
    { href: "/favorites",  label: "Favoritos", Icon: Heart },
    { href: "/admin",      label: "Admin",     Icon: ShieldCheck },
  ];

  return (
    <>
      {/* ── NAVBAR DESKTOP + TOPO MOBILE ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-white/5"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/browse">
              <span className="text-3xl text-white tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
                STREAM<span className="text-[var(--color-red)]">VAULT</span>
              </span>
            </Link>

            {/* Links desktop */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={pathname === href ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white transition-colors"}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Ações desktop */}
            <div className="hidden md:flex items-center gap-3">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input autoFocus type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar filmes..."
                    className="input-glow bg-black/60 border border-white/20 rounded-lg px-4 py-1.5 text-white placeholder:text-[var(--color-muted)] text-sm w-56" />
                  <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-[var(--color-muted)] hover:text-white">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-[var(--color-muted)] hover:text-white transition-colors p-2">
                  <Search size={18} />
                </button>
              )}
              <Link href="/favorites" className="text-[var(--color-muted)] hover:text-white transition-colors p-2">
                <Heart size={18} />
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 text-[var(--color-muted)] hover:text-white transition-colors text-sm p-2">
                <div className="w-7 h-7 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white text-xs font-bold">
                  {userInitial}
                </div>
                <LogOut size={15} />
              </button>
            </div>

            {/* Botão busca mobile (topo direito) */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
            >
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </button>
          </div>

          {/* Barra de busca mobile (expansível) */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input autoFocus type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes..."
                  className="input-glow flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-muted)] text-sm" />
                <button type="submit" className="bg-[var(--color-red)] text-white px-4 py-2 rounded-lg">
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* ── OVERLAY DO DRAWER ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── DRAWER LATERAL MOBILE ── */}
      <aside className={`
        fixed top-0 right-0 bottom-0 z-50 w-64
        bg-[#111] border-l border-white/8
        flex flex-col
        transition-transform duration-300 ease-in-out
        md:hidden
        ${drawerOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/6">
          <span className="text-base text-white font-bold tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
            STREAM<span className="text-[var(--color-red)]">VAULT</span>
          </span>
          <button onClick={() => setDrawerOpen(false)} className="text-white/50 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Links do drawer */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="px-5 pt-3 pb-1 text-[10px] tracking-widest text-white/25 uppercase">Navegar</p>

          {navLinks.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-5 py-3 text-sm relative transition-colors
                ${pathname === href
                  ? "text-white bg-[var(--color-red)]/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[var(--color-red)] before:rounded-r"
                  : "text-white/60 hover:text-white hover:bg-white/4"
                }`}>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center
                ${pathname === href ? "bg-[var(--color-red)]/20" : "bg-white/6"}`}>
                <Icon size={14} />
              </div>
              {label}
            </Link>
          ))}

          <p className="px-5 pt-5 pb-1 text-[10px] tracking-widest text-white/25 uppercase">Conta</p>

          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-white/60 hover:text-white hover:bg-white/4 transition-colors">
            <div className="w-7 h-7 rounded-md bg-white/6 flex items-center justify-center">
              <LogOut size={14} />
            </div>
            Sair
          </button>
        </nav>

        {/* Rodapé com usuário */}
        <div className="px-5 py-4 border-t border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white font-medium truncate">
                {user.user_metadata?.full_name || "Usuário"}
              </p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden
        bg-[#0d0d0d]/98 border-t border-white/8
        flex items-center justify-around
        h-16 pb-1">

        {navLinks.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 flex-1 py-2">
              <Icon size={21} color={active ? "var(--color-red)" : "rgba(255,255,255,0.35)"} />
              <span className={`text-[10px] ${active ? "text-[var(--color-red)]" : "text-white/35"}`}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[var(--color-red)] -mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* Botão menu no bottom nav */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 py-2">
          <Menu size={21} color="rgba(255,255,255,0.35)" />
          <span className="text-[10px] text-white/35">Menu</span>
        </button>
      </nav>

      {/* Espaço para o bottom nav não cobrir conteúdo */}
      <div className="md:hidden h-16" />
    </>
  );
}