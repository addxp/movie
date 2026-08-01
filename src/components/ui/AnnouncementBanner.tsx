"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <p className="text-yellow-400/90 text-xs text-center flex-1">
          ⚠️ Peço desculpas pelo site apresentar anúncios no player. Use o navegador{" "}
          <a href="https://brave.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-yellow-300">
            Brave
          </a>{" "}
          ou um <span className="font-bold">Ad Blocker</span> para contornar os anúncios.
        </p>
        <button
          onClick={() => setVisible(false)}
          className="text-yellow-400/70 hover:text-yellow-400 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}