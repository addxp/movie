"use client";
import { useEffect } from "react";

const TRIGGER = "terminal";
const STORAGE_KEY = "sv-theme-terminal";

/**
 * Modo secreto: digite "terminal" em qualquer tela (sem estar num campo de
 * texto) pra alternar entre o tema normal e o tema Terminal/Hacker.
 * A preferência fica salva no localStorage.
 *
 * Não existe página de configurações no projeto ainda — quando houver,
 * um switch ali pode chamar a mesma lógica (toggleTerminalTheme, exportada
 * abaixo) em vez de depender só do atalho de teclado.
 */
export function applyStoredTerminalTheme() {
  if (typeof window === "undefined") return;
  const on = window.localStorage.getItem(STORAGE_KEY) === "1";
  document.documentElement.classList.toggle("theme-terminal", on);
}

export function toggleTerminalTheme() {
  const root = document.documentElement;
  const next = !root.classList.contains("theme-terminal");
  root.classList.toggle("theme-terminal", next);
  window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
}

export default function TerminalEasterEgg() {
  useEffect(() => {
    applyStoredTerminalTheme();

    let buffer = "";
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;

      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length);
        if (buffer === TRIGGER) {
          toggleTerminalTheme();
          buffer = "";
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}