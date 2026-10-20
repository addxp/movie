"use client";
import { useEffect, useRef } from "react";

export type TVNavOptions = {
  /**
   * Chamado ao apertar Voltar. Retorne true se você tratou o evento
   * (ex.: fechou a busca) — assim o "voltar" padrão do navegador é bloqueado.
   */
  onBack?: () => boolean | void;
};

/**
 * Navegação por controle remoto / D-pad para TV.
 *
 * Marcação no HTML:
 *   data-tv-row     → linha horizontal de itens (←/→ andam dentro dela, ↑/↓ trocam de linha)
 *   data-tv-header  → (junto de data-tv-row) linha do topo; não conta como "conteúdo"
 *   data-tv-col     → coluna vertical (menu lateral): ↑/↓ andam, → volta ao conteúdo
 *   data-tv-item    → item focável
 *   data-tv-group   → (opcional) wrapper da linha; recebe data-tv-active quando a linha tem foco
 *
 * O container também recebe data-tv-zone="side" | "main" para o CSS expandir o menu.
 *
 * Por que é mais leve que a versão anterior:
 *  - a posição vem do foco real do DOM (não de um ref que dessincroniza);
 *  - só consulta os itens da linha atual, não a página inteira, a cada tecla;
 *  - sem scrollIntoView({behavior:"smooth"}) empilhando animações;
 *  - tecla segurada é limitada (~12 movimentos/s) em vez de enfileirar trabalho;
 *  - destaque da linha/menu é feito por atributo no DOM, sem re-render do React.
 */

const ROW = "[data-tv-row]";
const COL = "[data-tv-col]";
const ITEM = "[data-tv-item]";
const GROUP = "[data-tv-group]";

const REPEAT_MS = 85;   // intervalo mínimo entre movimentos com tecla segurada
const SCROLL_MS = 130;  // duração do scroll vertical entre linhas
const ROW_ANCHOR = 0.2; // linha focada fica a 20% do topo da tela

export type Action = "left" | "right" | "up" | "down" | "enter" | "back";

// e.key + keyCode: muitos navegadores de TV (Tizen, webOS, Fire TV) não mandam e.key confiável
export function readAction(e: KeyboardEvent): Action | null {
  const k = e.key;
  const c = e.keyCode;
  if (k === "ArrowLeft" || c === 37) return "left";
  if (k === "ArrowUp" || c === 38) return "up";
  if (k === "ArrowRight" || c === 39) return "right";
  if (k === "ArrowDown" || c === 40) return "down";
  if (k === "Enter" || c === 13) return "enter";
  if (
    k === "Escape" || k === "Backspace" || k === "BrowserBack" || k === "GoBack" || k === "XF86Back" ||
    c === 27 || c === 8 || c === 10009 /* Tizen */ || c === 461 /* webOS */
  ) return "back";
  return null;
}

export function isTyping(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return ["button", "submit", "checkbox", "radio", "reset"].indexOf(type) === -1;
  }
  return (el as HTMLElement).isContentEditable === true;
}

function centerX(el: Element): number {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
}

function closestByX(list: HTMLElement[], x: number): HTMLElement {
  let best = list[0];
  let bestDist = Infinity;
  for (let i = 0; i < list.length; i++) {
    const d = Math.abs(centerX(list[i]) - x);
    if (d < bestDist) { bestDist = d; best = list[i]; }
  }
  return best;
}

export function useTVNavigation(opts: TVNavOptions = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<TVNavOptions["onBack"]>(opts.onBack);

  // mantém o callback mais recente sem recriar os listeners
  useEffect(() => { backRef.current = opts.onBack; });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let lastContent: HTMLElement | null = null; // último item do conteúdo com foco
    let lastSide: HTMLElement | null = null;    // último item do menu com foco
    let activeGroup: Element | null = null;
    let lastMove = 0;
    let raf = 0;

    root.setAttribute("data-tv-zone", "main");

    const all = (sel: string, scope: ParentNode = root) =>
      Array.from(scope.querySelectorAll<HTMLElement>(sel));

    // linhas (incluindo a do topo) que têm ao menos um item
    const navRows = () => all(ROW).filter((r) => !r.closest(COL) && r.querySelector(ITEM));
    // linhas de conteúdo (sem a do topo)
    const bodyRows = () => navRows().filter((r) => !r.hasAttribute("data-tv-header"));

    const scrollWindow = (y: number, animate: boolean) => {
      cancelAnimationFrame(raf);
      const start = window.pageYOffset;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = Math.min(max, Math.max(0, y));
      const dist = target - start;
      if (!animate || Math.abs(dist) < 6) { window.scrollTo(0, target); return; }
      const t0 = Date.now();
      const step = () => {
        const p = Math.min(1, (Date.now() - t0) / SCROLL_MS);
        const eased = 1 - Math.pow(1 - p, 3);
        window.scrollTo(0, start + dist * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const focusItem = (el: HTMLElement, animate: boolean) => {
      el.focus({ preventScroll: true });
      if (el.closest(COL)) return;
      const row = el.closest(ROW) as HTMLElement | null;
      if (!row) return;

      // horizontal: rola o mínimo necessário para o item ficar visível (com "espiada" do vizinho)
      if (row.scrollWidth > row.clientWidth + 1) {
        const er = el.getBoundingClientRect();
        const rr = row.getBoundingClientRect();
        const pad = er.width * 0.35;
        if (er.right > rr.right - pad) row.scrollLeft += er.right - (rr.right - pad);
        else if (er.left < rr.left + pad) row.scrollLeft -= rr.left + pad - er.left;
      }

      // vertical: a linha focada vai para uma posição fixa na tela
      if (row.hasAttribute("data-tv-header")) return;
      const first = bodyRows()[0];
      if (first === row) {
        scrollWindow(0, animate);
      } else {
        const box = (row.closest(GROUP) || row) as HTMLElement;
        scrollWindow(window.pageYOffset + box.getBoundingClientRect().top - window.innerHeight * ROW_ANCHOR, animate);
      }
    };

    const focusEntry = (useLast: boolean, animate: boolean) => {
      let target: HTMLElement | null = null;
      if (useLast && lastContent && root.contains(lastContent)) {
        target = lastContent;
      } else {
        const first = bodyRows()[0];
        target = first ? all(ITEM, first)[0] : null;
      }
      if (target) focusItem(target, animate);
    };

    // devolve true se tratou a tecla
    const go = (dir: Action, cur: HTMLElement | null, animate: boolean): boolean => {
      const inItem = !!cur && root.contains(cur) && cur.matches(ITEM);

      if (!inItem) {
        // nada focado, ou foco num campo (ex.: busca) → ↓ entra no conteúdo
        if (!cur || cur === document.body || dir === "down") {
          focusEntry(false, animate);
          return true;
        }
        return false;
      }
      const item = cur as HTMLElement;

      // Menu lateral (coluna)
      const col = item.closest(COL);
      if (col) {
        const list = all(ITEM, col);
        const i = list.indexOf(item);
        if (dir === "down" && i < list.length - 1) focusItem(list[i + 1], animate);
        else if (dir === "up" && i > 0) focusItem(list[i - 1], animate);
        else if (dir === "right") focusEntry(true, animate);
        return true;
      }

      const row = item.closest(ROW) as HTMLElement | null;
      if (!row) return false;

      if (dir === "left" || dir === "right") {
        const list = all(ITEM, row);
        const i = list.indexOf(item);
        if (dir === "right") {
          if (i < list.length - 1) focusItem(list[i + 1], animate);
        } else if (i > 0) {
          focusItem(list[i - 1], animate);
        } else {
          // borda esquerda → entra no menu lateral
          const side = root.querySelector(COL);
          const sideItems = side ? all(ITEM, side) : [];
          const target = lastSide && root.contains(lastSide) ? lastSide : sideItems[0];
          if (target) focusItem(target, animate);
        }
        return true;
      }

      // ↑ ↓ → linha vizinha, item mais próximo na horizontal
      const rows = navRows();
      const next = rows[rows.indexOf(row) + (dir === "down" ? 1 : -1)];
      if (next) focusItem(closestByX(all(ITEM, next), centerX(item)), animate);
      return true;
    };

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.closest) return;
      const inSide = !!t.closest(COL);
      root.setAttribute("data-tv-zone", inSide ? "side" : "main");
      if (t.matches(ITEM)) {
        if (inSide) lastSide = t; else lastContent = t;
      }
      const row = t.closest(ROW);
      const group = row ? (row.closest(GROUP) || row) : null;
      if (group !== activeGroup) {
        if (activeGroup) activeGroup.removeAttribute("data-tv-active");
        if (group) group.setAttribute("data-tv-active", "");
        activeGroup = group;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const action = readAction(e);
      if (!action) return;

      const cur = document.activeElement as HTMLElement | null;
      const typing = isTyping(cur);

      // Digitando: setas/espaço/enter/backspace são do campo. Só ↑/↓ saem dele e Esc/Voltar fecha.
      if (typing) {
        const isBackspace = e.key === "Backspace" || e.keyCode === 8;
        if (action === "back" && isBackspace && (cur as HTMLInputElement).value) return;
        if (action !== "up" && action !== "down" && action !== "back") return;
      }

      if (action === "enter") {
        if (cur && cur.matches(ITEM) && !typing) {
          e.preventDefault();
          cur.click();
        }
        return;
      }

      if (action === "back") {
        if (cur && cur.closest(COL)) {
          e.preventDefault();
          focusEntry(true, true);
          return;
        }
        if (backRef.current && backRef.current() === true) {
          e.preventDefault();
          return;
        }
        const first = bodyRows()[0];
        const firstItem = first ? all(ITEM, first)[0] : null;
        if (firstItem && cur !== firstItem) {
          e.preventDefault();
          focusItem(firstItem, true);
        }
        // já no topo: deixa o navegador/TV tratar o "voltar"
        return;
      }

      // setas — limita tecla segurada para não travar a TV
      const now = Date.now();
      if (e.repeat && now - lastMove < REPEAT_MS) {
        e.preventDefault();
        return;
      }
      lastMove = now;

      if (go(action, cur, !e.repeat)) e.preventDefault();
    };

    root.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKeyDown);

    // foco inicial no primeiro item do conteúdo
    const init = window.setTimeout(() => {
      const a = document.activeElement;
      if (!a || a === document.body || !root.contains(a)) focusEntry(false, false);
    }, 80);

    return () => {
      window.clearTimeout(init);
      cancelAnimationFrame(raf);
      root.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return rootRef;
}
