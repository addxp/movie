"use client";
// Navegação por controle remoto (D-pad) para páginas comuns — filme, série, player.
// Só liga em "modo TV" (ver lib/tv-mode.ts); no desktop não mexe nas setas.
//
// Algoritmo: a partir do elemento focado, escolhe o focável mais próximo na direção
// da seta (distância no eixo + 2× o desvio lateral). Funciona em qualquer layout.

import "@/styles/tv-nav.css";
import { useEffect } from "react";
import { detectTVMode, revealInView } from "@/lib/tv-mode";
import { readAction, isTyping } from "@/hooks/useTVNavigation";

type Dir = "left" | "right" | "up" | "down";

const FOCUSABLE =
  "a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
const REPEAT_MS = 85;

function focusables(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && !el.closest("[aria-hidden='true']") && !el.hasAttribute("data-tv-skip")
  );
}

function pick(cur: HTMLElement, dir: Dir): HTMLElement | null {
  const c = cur.getBoundingClientRect();
  const ccx = c.left + c.width / 2;
  const ccy = c.top + c.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  const list = focusables();
  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    if (el === cur || cur.contains(el) || el.contains(cur)) continue;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let ok = false;
    let axis = 0;
    let perp = 0;
    if (dir === "right")      { ok = cx > ccx + 1 && r.right > c.right; axis = Math.max(0, r.left - c.right); perp = Math.abs(cy - ccy); }
    else if (dir === "left")  { ok = cx < ccx - 1 && r.left < c.left;   axis = Math.max(0, c.left - r.right); perp = Math.abs(cy - ccy); }
    else if (dir === "down")  { ok = cy > ccy + 1 && r.bottom > c.bottom; axis = Math.max(0, r.top - c.bottom); perp = Math.abs(cx - ccx); }
    else                      { ok = cy < ccy - 1 && r.top < c.top;     axis = Math.max(0, c.top - r.bottom); perp = Math.abs(cx - ccx); }
    if (!ok) continue;
    const score = axis + perp * 2;
    if (score < bestScore) { bestScore = score; best = el; }
  }
  return best;
}

function firstInView(): HTMLElement | null {
  const primary = document.querySelector<HTMLElement>("[data-tv-primary]");
  if (primary) return primary;
  const list = focusables();
  for (let i = 0; i < list.length; i++) {
    const r = list[i].getBoundingClientRect();
    if (r.top >= 80 && r.bottom <= window.innerHeight) return list[i];
  }
  return list[0] ?? null;
}

export default function TVSpatialNav() {
  useEffect(() => {
    if (!detectTVMode()) return;
    document.documentElement.classList.add("tv-nav");

    let lastMove = 0;

    const focusEl = (el: HTMLElement) => {
      el.focus({ preventScroll: true });
      revealInView(el);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const action = readAction(e);
      if (!action) return;

      const cur = document.activeElement as HTMLElement | null;
      const typing = isTyping(cur);

      if (typing) {
        // textarea/campo: setas, espaço e backspace são do campo; só ↑/↓ saem de campo de uma linha
        const isArea = cur!.tagName === "TEXTAREA";
        if (isArea || (action !== "up" && action !== "down")) {
          if (action !== "back" || e.key === "Backspace" || e.keyCode === 8) return;
        }
      }

      if (action === "enter") return; // Enter nativo já clica em link/botão

      if (action === "back") {
        if (document.fullscreenElement) return; // Voltar sai da tela cheia
        if (window.history.length > 1) {
          e.preventDefault();
          window.history.back();
        }
        return;
      }

      const now = Date.now();
      if (e.repeat && now - lastMove < REPEAT_MS) { e.preventDefault(); return; }
      lastMove = now;

      const noFocus = !cur || cur === document.body || cur === document.documentElement;
      const target = noFocus ? firstInView() : pick(cur as HTMLElement, action as Dir);
      if (target) {
        e.preventDefault();
        focusEl(target);
      } else if (!noFocus) {
        e.preventDefault(); // sem vizinho: não deixa a seta rolar a página
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const init = window.setTimeout(() => {
      const a = document.activeElement;
      if (!a || a === document.body) {
        const t = document.querySelector<HTMLElement>("[data-tv-primary]");
        if (t) focusEl(t);
      }
    }, 150);

    return () => {
      window.clearTimeout(init);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("tv-nav");
    };
  }, []);

  return null;
}
