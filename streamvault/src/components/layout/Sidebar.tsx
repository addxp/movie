'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Tv2, Sword, BookOpen, Radio, TrendingUp,
  Heart, FolderOpen, Download, Shield,
} from 'lucide-react'

const NAV = [
  { icon: Home,       href: '/browse',         label: 'Início' },
  { icon: Tv2,        href: '/series',         label: 'Séries' },
  { icon: Sword,      href: '/animes',         label: 'Animes' },
  { icon: TrendingUp, href: '/top',            label: 'Top 10' },
  { icon: Heart,      href: '/favorites',      label: 'Favoritos' },
  { icon: FolderOpen, href: '/collections',    label: 'Coleções' },
  { icon: Radio,      href: '/live',           label: 'Ao Vivo' },
  { icon: Download,   href: '/downloads',      label: 'Downloads' },
  { icon: Shield,     href: '/admin',          label: 'Admin' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <>
      <style>{`
        .sv2-sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: var(--side-w);
          background: var(--bg-2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 300;
          padding: 14px 0 20px;
          gap: 2px;
        }

        .sv2-side-logo {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #F5A623 0%, #E8394A 100%);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 0 22px rgba(245,166,35,0.28);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          transition: box-shadow 0.2s;
        }
        .sv2-side-logo:hover {
          box-shadow: 0 0 30px rgba(245,166,35,0.42);
        }
        .sv2-side-logo::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(140deg, rgba(255,255,255,0.22) 0%, transparent 55%);
        }

        .sv2-side-item {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-3);
          text-decoration: none;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .sv2-side-item:hover {
          background: rgba(255,255,255,0.055);
          color: var(--text);
          border-color: var(--border);
        }
        .sv2-side-item.active {
          background: var(--gold-dim);
          color: var(--gold);
          border-color: var(--gold-border);
        }
        .sv2-side-item.active::before {
          content: '';
          position: absolute;
          left: -1px; top: 9px; bottom: 9px;
          width: 2.5px;
          background: var(--gold);
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px var(--gold-glow);
        }

        /* Tooltip */
        .sv2-side-item::after {
          content: attr(data-label);
          position: absolute;
          left: calc(100% + 14px);
          top: 50%; transform: translateY(-50%);
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 500;
          padding: 5px 11px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.14s, transform 0.14s;
          z-index: 999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          transform: translateY(-50%) translateX(-4px);
        }
        .sv2-side-item:hover::after {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .sv2-side-divider {
          width: 24px; height: 1px;
          background: var(--border);
          margin: 5px 0;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sv2-sidebar { display: none; }
        }
      `}</style>

      <aside className="sv2-sidebar">
        <Link href="/browse" className="sv2-side-logo">
          <svg width="15" height="15" viewBox="0 0 13 13" fill="none" style={{ position: "relative", zIndex: 1 }}>
            <polygon points="6.5,1 8.5,5 13,5.5 9.5,8.8 10.5,13 6.5,10.8 2.5,13 3.5,8.8 0,5.5 4.5,5" fill="#fff"/>
          </svg>
        </Link>

        {NAV.map(({ icon: Icon, href, label }, i) => {
          const active = path === href || path?.startsWith(href + '/')
          if (i === 4) return (
            <div key="div" style={{ display: 'contents' }}>
              <div className="sv2-side-divider" />
              <Link href={href} className={`sv2-side-item${active ? ' active' : ''}`} data-label={label}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.6} />
              </Link>
            </div>
          )
          return (
            <Link key={href} href={href} className={`sv2-side-item${active ? ' active' : ''}`} data-label={label}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.6} />
            </Link>
          )
        })}
      </aside>
    </>
  )
}