"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  pages: string[];
  comicId: string;
  chapterId: string;
  chapterNum: number;
  chapterTitle?: string;
  prevChapterId: string | null;
  nextChapterId: string | null;
}

export default function LeitorPage({ pages, comicId, chapterNum, chapterTitle, prevChapterId, nextChapterId }: Props) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [showUI, setShowUI] = useState(true);
  const [uiTimer, setUiTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => { if (current < pages.length - 1) setCurrent(c => c + 1); }, [current, pages.length]);
  const goPrev = useCallback(() => { if (current > 0) setCurrent(c => c - 1); }, [current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const resetUI = useCallback(() => {
    setShowUI(true);
    if (uiTimer) clearTimeout(uiTimer);
    const t = setTimeout(() => setShowUI(false), 3000);
    setUiTimer(t);
  }, [uiTimer]);

  useEffect(() => { resetUI(); }, [current]);

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">📭</p>
        <p className="text-white/50">Nenhuma página disponível.</p>
        <Link href={`/leitura/${comicId}`} className="text-[var(--color-red)] hover:underline text-sm">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative select-none" onMouseMove={resetUI} onClick={resetUI}>

      {/* UI topo */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}`}>
        <div className="bg-gradient-to-b from-black/95 to-transparent px-6 py-4 flex items-center justify-between">
          <Link href={`/leitura/${comicId}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <X size={16} /> Fechar
          </Link>
          <div className="text-center">
            <p className="text-white text-sm font-medium">
              {chapterTitle || `Capítulo ${chapterNum}`}
            </p>
          </div>
          <span className="text-white/60 text-sm">{current + 1} / {pages.length}</span>
        </div>
      </div>

      {/* Imagem */}
      <div className="flex-1 flex items-center justify-center w-full min-h-screen relative">
        <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-w-resize" />
        <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-e-resize" />

        <div className="relative flex items-center justify-center max-h-screen">
          {!loaded[current] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          )}
          <img
            key={current}
            src={pages[current]}
            alt={`Página ${current + 1}`}
            className={`max-h-screen max-w-full object-contain transition-opacity duration-200 ${loaded[current] ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(prev => ({ ...prev, [current]: true }))}
            draggable={false}
          />
        </div>

        {/* Pré-carrega próxima */}
        {pages[current + 1] && (
          <img key={"pre-" + (current + 1)} src={pages[current + 1]} alt="" className="hidden"
            onLoad={() => setLoaded(prev => ({ ...prev, [current + 1]: true }))} />
        )}
      </div>

      {/* UI base */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`}>
        <div className="bg-gradient-to-t from-black/95 to-transparent px-6 py-4">
          {/* Barra de progresso */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[var(--color-red)] rounded-full transition-all duration-300" style={{ width: `${((current + 1) / pages.length) * 100}%` }} />
          </div>

          <div className="flex items-center justify-between">
            {prevChapterId ? (
              <Link href={`/leitura/${comicId}/ler/${prevChapterId}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Cap. anterior
              </Link>
            ) : <span className="text-white/20 text-sm">Primeiro</span>}

            <div className="flex items-center gap-3">
              <button onClick={goPrev} disabled={current === 0} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors">
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className="text-white text-sm font-medium min-w-[80px] text-center">{current + 1} / {pages.length}</span>
              <button onClick={goNext} disabled={current === pages.length - 1} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors">
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>

            {nextChapterId ? (
              <Link href={`/leitura/${comicId}/ler/${nextChapterId}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                Próx. capítulo <ArrowRight size={16} />
              </Link>
            ) : <span className="text-white/20 text-sm">Último</span>}
          </div>
        </div>
      </div>
    </div>
  );
}