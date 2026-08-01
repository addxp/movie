"use client";
import { useEffect, useRef, useCallback } from "react";

export type TVNavOptions = {
  rowSelector?: string;
  itemSelector?: string;
  onSelect?: (el: HTMLElement) => void;
  onBack?: () => void;
};

/**
 * Hook de navegação por controle remoto / teclado direcional para TV.
 *
 * Teclas suportadas:
 *   ArrowLeft / ArrowRight → move dentro da linha
 *   ArrowUp / ArrowDown    → troca de linha
 *   Enter / Space          → seleciona o item focado
 *   Backspace / Escape     → chama onBack
 *
 * Como usar:
 *   const containerRef = useTVNavigation({ onSelect: (el) => el.click() });
 *   <div ref={containerRef}>...</div>
 *
 * Marque as linhas com data-tv-row e os itens com data-tv-item.
 */
export function useTVNavigation(opts: TVNavOptions = {}) {
  const {
    rowSelector = "[data-tv-row]",
    itemSelector = "[data-tv-item]",
    onSelect,
    onBack,
  } = opts;

  const containerRef = useRef<HTMLDivElement>(null);
  // [rowIndex, colIndex]
  const pos = useRef<[number, number]>([0, 0]);

  const getRows = useCallback((): HTMLElement[][] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(rowSelector)
    ).map((row) =>
      Array.from(row.querySelectorAll<HTMLElement>(itemSelector))
    ).filter((items) => items.length > 0);
  }, [rowSelector, itemSelector]);

  const focus = useCallback((row: number, col: number, rows?: HTMLElement[][]) => {
    const r = rows ?? getRows();
    if (!r[row]) return;
    const clampedCol = Math.min(col, r[row].length - 1);
    pos.current = [row, clampedCol];
    const el = r[row][clampedCol];
    if (el) {
      el.focus({ preventScroll: false });
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [getRows]);

  // Focus inicial ao montar
  useEffect(() => {
    const rows = getRows();
    if (rows.length > 0 && rows[0].length > 0) {
      // pequeno delay para o DOM estar pronto
      setTimeout(() => focus(0, 0, rows), 120);
    }
  }, [focus, getRows]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const rows = getRows();
      if (!rows.length) return;
      const [row, col] = pos.current;

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          const nextCol = col + 1;
          if (nextCol < rows[row].length) focus(row, nextCol, rows);
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const prevCol = col - 1;
          if (prevCol >= 0) focus(row, prevCol, rows);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const nextRow = row + 1;
          if (nextRow < rows.length) focus(nextRow, col, rows);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevRow = row - 1;
          if (prevRow >= 0) focus(prevRow, col, rows);
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          const el = rows[row]?.[col];
          if (el) {
            if (onSelect) onSelect(el);
            else el.click();
          }
          break;
        }
        case "Backspace":
        case "Escape": {
          e.preventDefault();
          if (onBack) onBack();
          break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focus, getRows, onSelect, onBack]);

  return containerRef;
}