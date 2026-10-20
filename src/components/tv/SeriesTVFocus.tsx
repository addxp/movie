"use client";
// Na TV, ao abrir uma série o foco já vai para o episódio certo:
// o seguinte ao último que você abriu (ou o botão "Assistir" na primeira vez).

import { useEffect } from "react";
import { detectTVMode, revealInView } from "@/lib/tv-mode";

export default function SeriesTVFocus({ movieId }: { movieId: string }) {
  useEffect(() => {
    if (!detectTVMode()) return;
    const t = window.setTimeout(() => {
      let last: string | null = null;
      try { last = window.localStorage.getItem("sv-last-ep:" + movieId); } catch { /* ignore */ }

      let target: HTMLElement | null = null;
      if (last) {
        const eps = Array.from(document.querySelectorAll<HTMLElement>("[data-ep-id]"));
        const i = eps.findIndex((el) => el.getAttribute("data-ep-id") === last);
        if (i >= 0) target = eps[Math.min(i + 1, eps.length - 1)];
      }
      if (!target) target = document.querySelector<HTMLElement>("[data-tv-primary]");
      if (target) {
        target.focus({ preventScroll: true });
        revealInView(target);
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [movieId]);

  return null;
}
