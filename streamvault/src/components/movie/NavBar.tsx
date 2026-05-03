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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/browse">
            <span className="text-3xl text-white tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
              STREAM<span className="text-[var(--color-red)]">VAULT</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/browse" className={pathname === "/browse" ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white transition-colors"}>Início</Link>
            <Link href="/favorites" className={pathname === "/favorites" ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white transition-colors"}>Favoritos</Link>
            <Link href="/admin" className={pathname === "/admin" ? "text-white font-medium" : "text-[var(--color-muted)] hover:text-white transition-colors"}>Admin</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar filmes..." className="input-glow bg-black/60 border border-white/20 rounded-lg px-4 py-1.5 text-white placeholder:text-[var(--color-muted)] text-sm w-56" />
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-[var(--color-muted)] hover:text-white"><X size={16} /></button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-[var(--color-muted)] hover:text-white transition-colors p-2"><Search size={18} /></button>
            )}
            <Link href="/favorites" className="text-[var(--color-muted)] hover:text-white transition-colors p-2"><Heart size={18} /></Link>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-[var(--color-muted)] hover:text-white transition-colors text-sm p-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white text-xs font-bold">
                {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
              </div>
              <LogOut size={15} />
            </button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar filmes..." className="input-glow flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-[var(--color-muted)] text-sm" />
              <button type="submit" className="bg-[var(--color-red)] text-white px-4 py-2 rounded-lg"><Search size={16} /></button>
            </form>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/browse" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-muted)] hover:text-white py-2">Início</Link>
              <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-muted)] hover:text-white py-2">Favoritos</Link>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-muted)] hover:text-white py-2">Admin</Link>
              <button onClick={handleSignOut} className="text-left text-[var(--color-muted)] hover:text-white py-2 flex items-center gap-2"><LogOut size={15} /> Sair</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}