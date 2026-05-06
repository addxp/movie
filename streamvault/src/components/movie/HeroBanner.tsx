"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Heart, VolumeX, Volume2 } from "lucide-react";
import type { Movie } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface HeroBannerProps { movie: Movie; userId: string; }

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function HeroBanner({ movie, userId }: HeroBannerProps) {
  const { isFavorited, toggleFavorite, loading } = useFavorites(userId);
  const [imgError, setImgError]       = useState(false);
  const [mousePos, setMousePos]       = useState({ x: 0.5, y: 0.5 });
  const [videoReady, setVideoReady]   = useState(false);
  const [muted, setMuted]             = useState(true);
  const [showVideo, setShowVideo]     = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef  = useRef<HTMLIFrameElement>(null);

  const bgSrc    = movie.backdrop || movie.thumbnail;
  const bgImage  = !imgError && bgSrc ? bgSrc : null;
  const ytId     = extractYouTubeId((movie as any).trailer_url || "");

  // Delay antes de mostrar o vídeo (deixa a imagem aparecer primeiro)
  useEffect(() => {
    if (!ytId) return;
    const t = setTimeout(() => setShowVideo(true), 1800);
    return () => clearTimeout(t);
  }, [ytId]);

  // Parallax
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * -18;
  const parallaxY = (mousePos.y - 0.5) * -10;

  // URL do iframe YouTube
  const ytSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`
    : null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: "92vh", minHeight: "600px" }}
    >
      {/* ── Imagem de fundo (sempre presente como fallback) ── */}
      {bgImage && (
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.06)`,
            transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            opacity: videoReady ? 0 : 1,
            transitionProperty: "transform, opacity",
            transitionDuration: "0.8s, 1.5s",
          }}
        >
          <img
            src={bgImage}
            alt={movie.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ── YouTube iframe background ── */}
      {ytSrc && showVideo && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            opacity: videoReady ? 1 : 0,
            transition: "opacity 1.5s ease",
          }}
        >
          <iframe
            ref={iframeRef}
            src={ytSrc}
            allow="autoplay; encrypted-media"
            className="absolute"
            onLoad={() => setTimeout(() => setVideoReady(true), 1000)}
            style={{
              // Escala para cobrir toda a área sem mostrar bordas do player
              top: "50%",
              left: "50%",
              width: "calc(100% + 400px)",
              height: "calc(100% + 300px)",
              transform: "translate(-50%, -50%)",
              border: "none",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* ── Gradientes cinematográficos ── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(105deg, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.82) 28%, rgba(8,8,8,0.35) 55%, rgba(8,8,8,0.05) 75%, transparent 90%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.65) 12%, rgba(8,8,8,0.15) 30%, transparent 50%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(8,8,8,0.55) 100%)"
      }} />

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        opacity: 0.4,
      }} />

      {/* ── Botão mute (só aparece se tiver trailer) ── */}
      {ytId && videoReady && (
        <button
          onClick={() => {
            setMuted((m) => !m);
            // Recarrega o iframe com mute toggleado
            if (iframeRef.current) {
              const base = ytSrc!.replace("&mute=1", "");
              iframeRef.current.src = muted
                ? base  // unmute: sem mute=1
                : ytSrc!; // mute: com mute=1
            }
          }}
          className="absolute bottom-24 right-8 z-30 w-10 h-10 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all"
          title={muted ? "Ativar som" : "Silenciar"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* ── Conteúdo ── */}
      <div className="absolute inset-0 flex items-end pb-28 px-8 lg:px-16">
        <div
          className="max-w-2xl"
          style={{
            animation: "heroIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            opacity: 0,
          }}
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-5">
            <span style={{
              background: "var(--color-red)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "3px",
            }}>
              {movie.category}
            </span>
            {movie.type === "series" && (
              <span style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "3px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                Série
              </span>
            )}
            {/* Indicador de trailer */}
            {ytId && videoReady && (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "3px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
                Trailer
              </span>
            )}
          </div>

          {/* Título */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 7.5vw, 92px)",
            lineHeight: 0.92,
            color: "#fff",
            letterSpacing: "0.01em",
            marginBottom: "20px",
            textShadow: "0 4px 40px rgba(0,0,0,0.6)",
          }}>
            {movie.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5" style={{ fontSize: "13px" }}>
            {movie.rating && (
              <span style={{ color: "#f5c518", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
            {movie.release_year && (
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{movie.release_year}</span>
            )}
            {movie.duration && (
              <span style={{ color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                {movie.duration} min
              </span>
            )}
          </div>

          {/* Descrição */}
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            lineHeight: 1.7,
            maxWidth: "420px",
            marginBottom: "32px",
            fontWeight: 300,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {movie.description}
          </p>

          {/* Botões */}
          <div className="flex items-center gap-3">
            <Link
              href={"/movie/" + movie.id}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000",
                fontWeight: 700, fontSize: "14px",
                padding: "12px 28px", borderRadius: "6px",
                letterSpacing: "0.02em", textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.88)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <Play size={15} fill="black" /> Assistir
            </Link>

            <Link
              href={"/movie/" + movie.id}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
                color: "#fff", fontWeight: 600, fontSize: "14px",
                padding: "12px 24px", borderRadius: "6px",
                letterSpacing: "0.02em", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            >
              <Info size={15} /> Mais Info
            </Link>

            <button
              onClick={() => toggleFavorite(movie.id)}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: isFavorited(movie.id) ? "var(--color-red)" : "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)", color: "#fff",
                fontWeight: 600, fontSize: "14px",
                padding: "12px 22px", borderRadius: "6px",
                border: isFavorited(movie.id) ? "1px solid transparent" : "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <Heart size={15} fill={isFavorited(movie.id) ? "currentColor" : "none"} />
              {isFavorited(movie.id) ? "Salvo" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* Barra decorativa */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "2px" }}>
        <div style={{
          height: "100%", width: "35%",
          background: "linear-gradient(to right, var(--color-red), rgba(229,9,20,0.3))",
        }} />
      </div>

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}