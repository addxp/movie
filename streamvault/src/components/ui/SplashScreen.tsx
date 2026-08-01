'use client'

import { useEffect, useState, useRef } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase]     = useState<'enter' | 'logo' | 'exit'>('enter')
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const canvasRef             = useRef<HTMLCanvasElement>(null)

  // Particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x:number; y:number; vx:number; vy:number; r:number; color:string; alpha:number }[] = []
    const colors = ['#e5162a','#ff2d43','#7b2fff','#b78bff','rgba(229,22,42,0.4)']

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.05,
      })
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 400)
    const t2 = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => { setVisible(false); onDone() }, 500)
    }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  // Progress bar
  useEffect(() => {
    if (phase !== 'logo') return
    setProgress(0)
    const start = Date.now()
    const duration = 2400
    const tick = () => {
      const pct = Math.min((Date.now() - start) / duration, 1)
      setProgress(Math.round(pct * 100))
      if (pct < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [phase])

  if (!visible) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Mono:wght@700&display=swap');
        @keyframes sv2-splash-in {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sv2-fade-out {
          to { opacity: 0; transform: scale(1.03); }
        }
        @keyframes sv2-bar {
          from { transform: scaleX(0); }
        }
        .sv2-splash-wrap {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 0;
          animation: ${phase === 'exit' ? 'sv2-fade-out 0.5s ease forwards' : 'none'};
        }
        .sv2-splash-content {
          display: flex; flex-direction: column; align-items: center;
          animation: sv2-splash-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
        }
        .sv2-splash-icon {
          width: 72px; height: 72px;
          border-radius: 20px;
          background: var(--red);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 0 60px var(--red-glow), 0 0 120px rgba(229,22,42,0.2);
          position: relative;
          overflow: hidden;
        }
        .sv2-splash-icon::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
        }
        .sv2-splash-logo {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 8vw, 52px);
          font-weight: 800;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 8px;
        }
        .sv2-splash-logo span { color: var(--red); }
        .sv2-splash-tagline {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 40px;
        }
        .sv2-splash-bar-wrap {
          width: min(280px, 60vw);
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 1px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .sv2-splash-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--red), var(--accent));
          border-radius: 1px;
          transition: width 0.05s linear;
          box-shadow: 0 0 12px var(--red-glow);
        }
        .sv2-splash-pct {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--text-4);
          letter-spacing: 2px;
        }
        .sv2-splash-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(229,22,42,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(229,22,42,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      <div className="sv2-splash-wrap">
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div className="sv2-splash-grid" />

        <div className="sv2-splash-content">
          <div className="sv2-splash-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          <div className="sv2-splash-logo">
            STREAM<span>VAULT</span>
          </div>

          <div className="sv2-splash-tagline">Cinema sem limites</div>

          <div className="sv2-splash-bar-wrap">
            <div className="sv2-splash-bar-fill" style={{ width: progress + '%' }} />
          </div>
          <div className="sv2-splash-pct">{progress}%</div>
        </div>
      </div>
    </>
  )
}
