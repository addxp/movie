// src/lib/tv-mode.ts
//
// Detecta se o site está sendo usado numa TV e traz um helper de foco.
// "Modo TV" liga quando:
//   - a aba passou por /tv (sessionStorage), ou
//   - o usuário abriu qualquer página com ?tv=1 (fica salvo; ?tv=0 desliga), ou
//   - o user agent é de Smart TV / Fire TV / Android TV / Chromecast.

export const TV_SESSION_KEY = "sv-tv";
export const TV_PERSIST_KEY = "sv-tv";

const TV_UA =
  /SMART-TV|SmartTV|Tizen|Web0S|WebOS|HbbTV|NetCast|BRAVIA|Viera|Roku|GoogleTV|CrKey|AFT[A-Z]|Android.*\bTV\b/i;

export function markTVSession() {
  try { window.sessionStorage.setItem(TV_SESSION_KEY, "1"); } catch { /* ignore */ }
}

export function detectTVMode(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get("tv");
    if (q === "1") window.localStorage.setItem(TV_PERSIST_KEY, "1");
    if (q === "0") {
      window.localStorage.removeItem(TV_PERSIST_KEY);
      window.sessionStorage.removeItem(TV_SESSION_KEY);
      return false;
    }
    if (window.sessionStorage.getItem(TV_SESSION_KEY) === "1") return true;
    if (window.localStorage.getItem(TV_PERSIST_KEY) === "1") return true;
  } catch { /* storage bloqueado */ }
  return TV_UA.test(window.navigator.userAgent);
}

/** Deixa o elemento visível: rola faixas horizontais e a página (sem animação, sem travar). */
export function revealInView(el: HTMLElement) {
  let fixed = false;
  let p: HTMLElement | null = el;
  while (p && p !== document.body) {
    if (window.getComputedStyle(p).position === "fixed") fixed = true;
    if (p !== el && p.scrollWidth > p.clientWidth + 1) {
      const ox = window.getComputedStyle(p).overflowX;
      if (ox === "auto" || ox === "scroll") {
        const er = el.getBoundingClientRect();
        const pr = p.getBoundingClientRect();
        const pad = 40;
        if (er.right > pr.right - pad) p.scrollLeft += er.right - (pr.right - pad);
        else if (er.left < pr.left + pad) p.scrollLeft -= pr.left + pad - er.left;
      }
    }
    p = p.parentElement;
  }
  if (fixed) return;

  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top >= 110 && r.bottom <= vh - 60) return;
  const y = r.height > vh * 0.7
    ? window.pageYOffset + r.top - 120
    : window.pageYOffset + r.top + r.height / 2 - vh / 2;
  window.scrollTo(0, Math.max(0, y));
}
