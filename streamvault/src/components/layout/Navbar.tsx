"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, LogOut, X, Menu } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push("/browse?q=" + encodeURIComponent(searchQuery.trim()));
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navLink = (href: string, label: string, extra?: React.ReactNode) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={"flex items-center gap-1.5 text-sm transition-all duration-200 " + (active ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white")}
      >
        {extra}{label}
      </Link>
    );
  };

  const initials = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();

  return (
    <>
      <nav className={"fixed top-0 left-0 right-0 z-50 transition-all duration-500 " + (scrolled ? "bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-white/[0.04] shadow-2xl" : "bg-gradient-to-b from-black/70 to-transparent")}>
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/browse" className="flex items-center">
              <span className="text-[28px] text-white tracking-wider font-display" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                STREAM<span style={{ color: "var(--color-red)" }}>VAULT</span>
              </span>
            </Link>

            {/* Links — desktop */}
            <div className="hidden md:flex items-center gap-7">
              {navLink("/browse", "Início")}
              {navLink("/series", "Séries")}
              {navLink("/animes", "Animes")}
              {navLink("/leitura", "Leitura")}
              {navLink("/favorites", "Favoritos")}
              {navLink("/collections", "Colecoes")}
              {navLink("/live", "Ao Vivo", <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />)}
              {navLink("/admin", "Admin")}
            </div>

            {/* Ações — desktop */}
            <div className="hidden md:flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="input-glow bg-white/[0.06] border border-white/10 rounded-lg px-4 py-1.5 text-white placeholder:text-[var(--color-muted)] text-sm w-52 transition-all"
                  />
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
                <div className="w-8 h-8 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-[var(--color-muted)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
                  title="Sair"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Mobile */}
            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/[0.06] space-y-4 animate-fade-in">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes..."
                  className="input-glow flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-muted)] text-sm"
                />
                <button type="submit" className="bg-[var(--color-red)] text-white px-4 rounded-lg">
                  <Search size={16} />
                </button>
              </form>
              <div className="flex flex-col gap-1">
                {[
                  { href: "/browse", label: "Início" },
                  { href: "/series", label: "Séries" },
                  { href: "/animes", label: "Animes" },
                  { href: "/leitura", label: "Leitura" },
                  { href: "/favorites", label: "Favoritos" },
                  { href: "/collections", label: "Colecoes" },
                  { href: "/live", label: "Ao Vivo" },
                  { href: "/admin", label: "Admin" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[var(--color-muted)] hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5 text-sm transition-all"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="text-left text-[var(--color-muted)] hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5 text-sm transition-all flex items-center gap-2"
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}