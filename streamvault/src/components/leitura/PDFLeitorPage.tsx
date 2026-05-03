"use client";
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Link from "next/link";
import { X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
  comicId: string;
  chapterNum: number;
  chapterTitle?: string;
  prevChapterId: string | null;
  nextChapterId: string | null;
}

export default function PDFLeitorPage({ pdfUrl, comicId, chapterNum, chapterTitle, prevChapterId, nextChapterId }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [showUI, setShowUI] = useState(true);
  const [uiTimer, setUiTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => { if (current < numPages) setCurrent(c => c + 1); }, [current, numPages]);
  const goPrev = useCallback(() => { if (current > 1) setCurrent(c => c - 1); }, [current]);

  const resetUI = useCallback(() => {
    setShowUI(true);
    if (uiTimer) clearTimeout(uiTimer);
    const t = setTimeout(() => setShowUI(false), 3000);
    setUiTimer(t);
  }, [uiTimer]);

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center relative select-none"
      onMouseMove={resetUI}
      onClick={resetUI}
    >
      {/* UI topo */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}`}>
        <div className="bg-gradient-to-b from-black/95 to-transparent px-6 py-4 flex items-center justify-between">
          <Link href={`/leitura/${comicId}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <X size={16} /> Fechar
          </Link>
          <p className="text-white text-sm font-medium">{chapterTitle || `Capítulo ${chapterNum}`}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ZoomOut size={14} className="text-white" />
            </button>
            <span className="text-white/60 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, parseFloat((z + 0.1).toFixed(1))))}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ZoomIn size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Página */}
      <div className="flex-1 flex items-center justify-center w-full min-h-screen relative">
        {/* Clique esquerda */}
        <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-w-resize" />
        {/* Clique direita */}
        <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-e-resize" />

        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center h-screen">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={current}
            scale={zoom}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="shadow-2xl"
          />
        </Document>
      </div>

      {/* UI base */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`}>
        <div className="bg-gradient-to-t from-black/95 to-transparent px-6 py-4">
          {/* Barra de progresso */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[var(--color-red)] rounded-full transition-all duration-300"
              style={{ width: numPages ? `${(current / numPages) * 100}%` : "0%" }} />
          </div>

          <div className="flex items-center justify-between">
            {prevChapterId ? (
              <Link href={`/leitura/${comicId}/ler/${prevChapterId}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Cap. anterior
              </Link>
            ) : <span className="text-white/20 text-sm">Primeiro</span>}

            <div className="flex items-center gap-3">
              <button onClick={goPrev} disabled={current === 1}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors">
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className="text-white text-sm font-medium min-w-[80px] text-center">
                {current} / {numPages || "..."}
              </span>
              <button onClick={goNext} disabled={current === numPages}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors">
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