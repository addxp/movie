"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, LogOut, X, Menu, Home, Tv, Sword, Trophy,
  BookOpen, Star, FolderOpen, Radio, ShieldCheck, Download,
  Monitor, UserCircle, Bell, Heart, ChevronRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps { user: User; }

const TOP_LINKS = [
  { href: "/browse",     label: "Início" },
  { href: "/series",     label: "Séries" },
  { href: "/animes",     label: "Animes" },
  { href: "/esportes",   label: "Esportes" },
  { href: "/live",       label: "Ao Vivo", live: true },
  { href: "/top",        label: "Top 10" },
  { href: "/favorites",  label: "Favoritos" },
];

const NAV_GROUPS = [
  {
    label: "Navegar",
    items: [
      { href: "/browse",      label: "Início",    Icon: Home },
      { href: "/series",      label: "Séries",    Icon: Tv },
      { href: "/animes",      label: "Animes",    Icon: Sword },
      { href: "/esportes",    label: "Esportes",  Icon: Trophy },
      { href: "/live",        label: "Ao Vivo",   Icon: Radio, live: true },
    ],
  },
  {
    label: "Biblioteca",
    items: [
      { href: "/leitura",     label: "Leitura",   Icon: BookOpen },
      { href: "/favorites",   label: "Favoritos", Icon: Star },
      { href: "/collections", label: "Coleções",  Icon: FolderOpen },
      { href: "/downloads",   label: "Downloads", Icon: Download },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin",       label: "Admin",     Icon: ShieldCheck },
    ],
  },
];

const ALL_LINKS = NAV_GROUPS.flatMap((g) => g.items);
const BOTTOM_LINKS = ["/browse", "/series", "/animes", "/downloads"];
const LAYOUT_KEY = "streamvault_layout";

export default function Navbar({ user }: NavbarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [scrolled,     setScrolled]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [layoutReady,  setLayoutReady]  = useState(false);

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
      setSearchOpen(false); setSearchQuery(""); setDrawerOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const initials    = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();
  const displayName = user.user_metadata?.full_name || "Usuário";
  const avatarUrl   = user.user_metadata?.avatar_url as string | undefined;

  const Avatar = ({ size = 28 }: { size?: number }) =>
    avatarUrl ? (
      <img
        src={avatarUrl} alt={displayName}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--red-border)" }}
      />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--red) 0%, #9b0e27 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: size * 0.38,
        fontFamily: "var(--font-display)", letterSpacing: "0.04em", flexShrink: 0,
        border: "2px solid var(--red-border)",
        boxShadow: "0 0 12px var(--red-glow)",
      }}>
        {initials}
      </div>
    );

  if (!layoutReady) return null;

  /* ─── DESKTOP NAV ─── */
  if (!mobileLayout) return (
    <>
      <style>{`
        .sv4-nav {
          position: fixed; top: 5px; left: 0; right: 0; z-index: 50;
          height: var(--nav-h);
          transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s;
        }
        .sv4-nav.scrolled {
          background: rgba(12,10,10,0.95);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px) saturate(1.5);
        }
        .sv4-nav:not(.scrolled) {
          background: linear-gradient(to bottom, rgba(12,10,10,0.85) 0%, transparent 100%);
          border-bottom: 1px solid transparent;
        }
        .sv4-nav-inner {
          max-width: 1600px; margin: 0 auto;
          padding: 0 28px; height: 100%;
          display: flex; align-items: center; gap: 0;
        }
        .sv4-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0; margin-right: 32px;
        }
        .sv4-logo-mark {
          width: 22px; height: 22px; border-radius: 5px;
          background: var(--red);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 14px var(--red-glow);
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .sv4-logo-mark::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: rgba(255,255,255,0.12);
        }
        .sv4-logo-text {
          font-family: var(--font-body); font-size: 13px; font-weight: 700;
          letter-spacing: 0.18em; color: var(--text); line-height: 1; text-transform: uppercase;
        }
        .sv4-logo-text span { color: var(--red); }
        .sv4-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .sv4-link {
          font-family: var(--font-body); font-size: 12px; font-weight: 500;
          color: var(--text-3); padding: 6px 11px; border-radius: 6px;
          text-decoration: none; transition: color 0.14s, background 0.14s;
          white-space: nowrap; position: relative;
          display: flex; align-items: center; gap: 5px;
        }
        .sv4-link:hover { color: var(--text); background: rgba(255,255,255,0.04); }
        .sv4-link.active { color: var(--text); background: rgba(214,40,57,0.08); }
        .sv4-link.active::after {
          content: ''; position: absolute; bottom: 2px; left: 11px; right: 11px;
          height: 1.5px; background: var(--red); border-radius: 1px;
        }
        .sv4-live-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--red);
          animation: sv4-pip 1.6s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes sv4-pip { 0%,100%{opacity:1} 50%{opacity:0.12} }
        .sv4-actions { display: flex; align-items: center; gap: 2px; margin-left: 16px; }
        .sv4-icon-btn {
          width: 32px; height: 32px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-3); transition: background 0.13s, color 0.13s;
          cursor: pointer; border: none; background: none;
        }
        .sv4-icon-btn:hover { background: rgba(255,255,255,0.06); color: var(--text); }
        .sv4-search-bar {
          background: var(--bg-3); border: 1px solid var(--border-2); border-radius: 7px;
          padding: 5px 13px; color: var(--text); font-family: var(--font-body);
          font-size: 12px; width: 210px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .sv4-search-bar:focus { border-color: var(--red-border); box-shadow: 0 0 0 3px var(--red-dim); }
        .sv4-search-bar::placeholder { color: var(--text-3); }
        .sv4-sep { width: 1px; height: 18px; background: var(--border-2); margin: 0 6px; }
      `}</style>

      <div className="sv4-bulb-strip" />
      <nav className={`sv4-nav${scrolled ? " scrolled" : ""}`}>
        <div className="sv4-nav-inner">
          <Link href="/browse" className="sv4-logo">
            <div className="sv4-logo-mark">
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                <polygon points="6.5,1 8.5,5 13,5.5 9.5,8.8 10.5,13 6.5,10.8 2.5,13 3.5,8.8 0,5.5 4.5,5" fill="#fff"/>
              </svg>
            </div>
            <span className="sv4-logo-text">STREAM<span>VAULT</span></span>
          </Link>

          <div className="sv4-links">
            {TOP_LINKS.map(({ href, label, live }) => (
              <Link key={href} href={href}
                className={`sv4-link${pathname === href || pathname?.startsWith(href + "/") ? " active" : ""}`}
              >
                {live && <span className="sv4-live-dot" />}
                {label}
              </Link>
            ))}
          </div>

          <div className="sv4-actions">
            {searchOpen ? (
              <form onSubmit={handleSearch} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <input autoFocus type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filmes, séries..."
                  className="sv4-search-bar"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="sv4-icon-btn">
                  <X size={13} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="sv4-icon-btn" aria-label="Buscar">
                <Search size={14} />
              </button>
            )}
            <Link href="/favorites" className="sv4-icon-btn" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Heart size={14} />
            </Link>
            <button className="sv4-icon-btn" aria-label="Notificações">
              <Bell size={14} />
            </button>
            <button onClick={toggleLayout} className="sv4-icon-btn" aria-label="Toggle layout">
              <Monitor size={14} />
            </button>
            <div className="sv4-sep" />
            <Link href="/profile" style={{ display:"flex" }}>
              <Avatar size={27} />
            </Link>
            <button onClick={handleSignOut} className="sv4-icon-btn" aria-label="Sair">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );

  /* ─── MOBILE ─── */
  return (
    <>
      <style>{`
        .sv4-live-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: var(--red); animation: sv4-pip 1.6s ease-in-out infinite; flex-shrink: 0;
          box-shadow: 0 0 6px var(--red-glow);
        }
        @keyframes sv4-pip { 0%,100%{opacity:1} 50%{opacity:0.15} }

        /* ── Drawer links ── */
        .sv4-dr-link {
          display: flex; align-items: center; gap: 13px;
          padding: 9px 18px; cursor: pointer;
          position: relative; transition: background 0.12s;
          text-decoration: none; border-radius: 0;
        }
        .sv4-dr-link:hover { background: rgba(255,255,255,0.03); }
        .sv4-dr-link.active {
          background: rgba(214,40,57,0.07);
        }
        .sv4-dr-link.active::before {
          content: '';
          position: absolute; left: 0; top: 6px; bottom: 6px;
          width: 3px; background: var(--red); border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px var(--red-glow);
        }

        /* icon circle */
        .sv4-dr-icon {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.12s, border-color 0.12s;
        }
        .sv4-dr-link:hover .sv4-dr-icon:not(.active-icon) {
          background: rgba(255,255,255,0.06) !important;
        }

        /* link label */
        .sv4-dr-label {
          font-size: 13px; font-family: var(--font-body);
          flex: 1; transition: color 0.12s;
          letter-spacing: 0.01em;
        }

        /* chevron hint */
        .sv4-dr-chevron {
          opacity: 0; transition: opacity 0.12s, transform 0.12s;
          transform: translateX(-4px);
        }
        .sv4-dr-link:hover .sv4-dr-chevron {
          opacity: 1; transform: translateX(0);
        }

        /* section header */
        .sv4-dr-section {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-4); padding: 14px 18px 5px;
          font-family: var(--font-body); font-weight: 700;
          display: flex; align-items: center; gap: 8px;
        }
        .sv4-dr-section::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        /* bottom nav */
        .sv4-bot-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 3px; padding: 5px 0;
          text-decoration: none; background: none;
          border: none; cursor: pointer; position: relative;
          transition: opacity 0.1s;
        }
        .sv4-bot-item:active { opacity: 0.7; }

        /* search input mobile */
        .sv4-mob-search {
          background: transparent; border: none; outline: none;
          color: var(--text); font-family: var(--font-body);
          font-size: 13px; flex: 1;
        }
        .sv4-mob-search::placeholder { color: var(--text-3); }

        /* drawer search wrapper */
        .sv4-dr-search {
          display: flex; align-items: center; gap: 9px;
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          border-radius: 10px; padding: 9px 13px;
          margin: 12px 14px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .sv4-dr-search:focus-within {
          border-color: var(--red-border);
          box-shadow: 0 0 0 3px var(--red-dim);
        }

        /* user card at bottom */
        .sv4-dr-user {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          border-top: 1px solid var(--border);
          text-decoration: none;
          transition: background 0.12s;
        }
        .sv4-dr-user:hover { background: rgba(255,255,255,0.025); }
        .sv4-dr-user-info { overflow: hidden; flex: 1; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="sv4-bulb-strip" />
      <nav style={{
        position: "fixed", top: 5, left: 0, right: 0, zIndex: 50,
        height: "var(--nav-h)",
        background: scrolled ? "rgba(12,10,10,0.97)" : "linear-gradient(to bottom, rgba(12,10,10,0.9) 0%, transparent 100%)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{ maxWidth:"1600px", margin:"0 auto", padding:"0 18px", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/browse" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"22px", height:"22px", borderRadius:"5px", background:"var(--red)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 12px var(--red-glow)", flexShrink:0 }}>
              <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                <polygon points="6.5,1 8.5,5 13,5.5 9.5,8.8 10.5,13 6.5,10.8 2.5,13 3.5,8.8 0,5.5 4.5,5" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontFamily:"var(--font-body)", fontSize:"13px", fontWeight:700, letterSpacing:"0.16em", color:"var(--text)", lineHeight:1, textTransform:"uppercase" }}>
              STREAM<span style={{ color:"var(--red)" }}>VAULT</span>
            </span>
          </Link>

          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {searchOpen ? (
              <form onSubmit={handleSearch} style={{ display:"flex", alignItems:"center", gap:"8px", background:"var(--bg-3)", border:"1px solid var(--border-2)", borderRadius:"9px", padding:"7px 12px" }}>
                <Search size={13} color="var(--text-3)" />
                <input autoFocus type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..." className="sv4-mob-search" style={{ width:"140px" }}
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  style={{ background:"none", border:"none", color:"var(--text-3)", cursor:"pointer", padding:0, display:"flex" }}>
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text-2)", cursor:"pointer", padding:"6px", display:"flex" }}>
                <Search size={16} />
              </button>
            )}
            <Link href="/profile" style={{ display:"flex" }}>
              <Avatar size={30} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", transition:"opacity 0.25s" }}
        />
      )}

      {/* ── Drawer ── */}
      <aside style={{
        position:"fixed", top:0, right:0, bottom:0, zIndex:50,
        width:"270px",
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        background: "var(--bg-2)",
        borderLeft: "1px solid var(--border)",
        display:"flex", flexDirection:"column",
        boxShadow: drawerOpen ? "-20px 0 60px rgba(0,0,0,0.6)" : "none",
      }}>

        {/* Header */}
        <div style={{ height:"var(--nav-h)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
            <div style={{ width:"22px", height:"22px", borderRadius:"5px", background:"var(--red)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 10px var(--red-glow)" }}>
              <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                <polygon points="6.5,1 8.5,5 13,5.5 9.5,8.8 10.5,13 6.5,10.8 2.5,13 3.5,8.8 0,5.5 4.5,5" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontFamily:"var(--font-body)", fontSize:"13px", fontWeight:700, letterSpacing:"0.16em", color:"var(--text)", textTransform:"uppercase" }}>
              STREAM<span style={{ color:"var(--red)" }}>VAULT</span>
            </span>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ width:"28px", height:"28px", borderRadius:"7px", background:"var(--bg-3)", border:"1px solid var(--border)", color:"var(--text-2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <X size={13} />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="sv4-dr-search">
          <Search size={13} color="var(--text-3)" style={{ flexShrink:0 }} />
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar filmes, séries..."
            className="sv4-mob-search"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}
              style={{ background:"none", border:"none", color:"var(--text-4)", cursor:"pointer", display:"flex", padding:0 }}>
              <X size={12} />
            </button>
          )}
        </form>

        {/* Nav groups */}
        <nav style={{ flex:1, overflowY:"auto", paddingBottom:"8px" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="sv4-dr-section">{group.label}</p>
              {group.items.map(({ href, label, Icon, live }) => {
                const active = pathname === href || pathname?.startsWith(href + "/");
                return (
                  <Link key={href} href={href} className={`sv4-dr-link${active ? " active" : ""}`}>
                    <div
                      className={`sv4-dr-icon${active ? " active-icon" : ""}`}
                      style={{
                        background: active ? "var(--red-dim)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "var(--red-border)" : "var(--border)"}`,
                        color: active ? "var(--red)" : "var(--text-3)",
                      }}
                    >
                      <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
                    </div>
                    <span
                      className="sv4-dr-label"
                      style={{ fontWeight: active ? 600 : 400, color: active ? "var(--text)" : "var(--text-2)" }}
                    >
                      {label}
                    </span>
                    {live
                      ? <span className="sv4-live-dot" />
                      : <span className="sv4-dr-chevron"><ChevronRight size={13} color="var(--text-4)" /></span>
                    }
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Preferências */}
          <p className="sv4-dr-section">Preferências</p>
          <button
            onClick={toggleLayout}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"13px", padding:"9px 18px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
          >
            <div className="sv4-dr-icon" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", color:"var(--text-3)" }}>
              <Monitor size={15} strokeWidth={1.7} />
            </div>
            <span className="sv4-dr-label" style={{ fontWeight:400, color:"var(--text-2)" }}>Layout clássico</span>
            <span className="sv4-dr-chevron"><ChevronRight size={13} color="var(--text-4)" /></span>
          </button>

          {/* Conta */}
          <p className="sv4-dr-section">Conta</p>
          <Link href="/profile" className={`sv4-dr-link${pathname === "/profile" ? " active" : ""}`}>
            <div className="sv4-dr-icon" style={{ background: pathname==="/profile" ? "var(--red-dim)" : "rgba(255,255,255,0.04)", border:`1px solid ${pathname==="/profile" ? "var(--red-border)" : "var(--border)"}`, color: pathname==="/profile" ? "var(--red)" : "var(--text-3)" }}>
              <UserCircle size={15} strokeWidth={1.7} />
            </div>
            <span className="sv4-dr-label" style={{ fontWeight: pathname==="/profile" ? 600 : 400, color: pathname==="/profile" ? "var(--text)" : "var(--text-2)" }}>Meu perfil</span>
            <span className="sv4-dr-chevron"><ChevronRight size={13} color="var(--text-4)" /></span>
          </Link>
          <button
            onClick={handleSignOut}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"13px", padding:"9px 18px", background:"none", border:"none", cursor:"pointer" }}
          >
            <div className="sv4-dr-icon" style={{ background:"rgba(214,40,57,0.06)", border:"1px solid rgba(214,40,57,0.18)", color:"var(--red)" }}>
              <LogOut size={15} strokeWidth={1.7} />
            </div>
            <span className="sv4-dr-label" style={{ fontWeight:400, color:"var(--text-2)" }}>Sair</span>
          </button>
        </nav>

        {/* User footer */}
        <Link href="/profile" className="sv4-dr-user">
          <Avatar size={36} />
          <div className="sv4-dr-user-info">
            <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.3 }}>
              {displayName}
            </p>
            <p style={{ fontSize:"11px", color:"var(--text-3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:"2px" }}>
              {user.email}
            </p>
          </div>
          <ChevronRight size={14} color="var(--text-4)" style={{ flexShrink:0 }} />
        </Link>
      </aside>

      {/* ── Bottom nav ── */}
      <nav style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:40, display:"flex", alignItems:"center", height:"56px", background:"rgba(12,10,10,0.98)", borderTop:"1px solid var(--border)", backdropFilter:"blur(20px)" }}>
        {ALL_LINKS.filter((l) => BOTTOM_LINKS.includes(l.href)).map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="sv4-bot-item">
              <div style={{ position:"relative" }}>
                <Icon size={18} color={active ? "var(--red)" : "rgba(255,255,255,0.22)"} strokeWidth={active ? 2.2 : 1.6} />
                {active && (
                  <span style={{ position:"absolute", bottom:"-5px", left:"50%", transform:"translateX(-50%)", width:"3px", height:"3px", borderRadius:"50%", background:"var(--red)", boxShadow:"0 0 6px var(--red-glow)" }} />
                )}
              </div>
              <span style={{ fontSize:"9px", fontWeight: active ? 600 : 400, color: active ? "var(--red)" : "rgba(255,255,255,0.22)", letterSpacing:"0.03em", fontFamily:"var(--font-body)", marginTop:"3px" }}>
                {label}
              </span>
            </Link>
          );
        })}
        <button onClick={() => setDrawerOpen(true)} className="sv4-bot-item">
          <div style={{
            width:"32px", height:"32px", borderRadius:"9px",
            background: drawerOpen ? "var(--red-dim)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${drawerOpen ? "var(--red-border)" : "var(--border)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.15s, border-color 0.15s",
          }}>
            <Menu size={15} color={drawerOpen ? "var(--red)" : "rgba(255,255,255,0.3)"} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize:"9px", fontWeight:400, color:"rgba(255,255,255,0.22)", fontFamily:"var(--font-body)", marginTop:"1px" }}>Menu</span>
        </button>
      </nav>

      <div style={{ height:"56px" }} />
    </>
  );
}