"use client";
import { useState } from "react";
import Image from "next/image";
import { Play, Tv, Radio } from "lucide-react";
import LivePlayer from "./LivePlayer";

interface Channel {
  id: string;
  name: string;
  logo: string;
  stream_url: string;
  category: string;
  description?: string;
}

const CATEGORIES = ["Todos", "Esportes", "Noticias", "Entretenimento", "Filmes", "Infantil", "Outros"];

export default function LiveChannels({ channels }: { channels: Channel[] }) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = activeCategory === "Todos"
    ? channels
    : channels.filter(c => c.category === activeCategory);

  const availableCategories = CATEGORIES.filter(cat =>
    cat === "Todos" || channels.some(c => c.category === cat)
  );

  if (channels.length === 0) {
    return (
      <div className="text-center py-24">
        <Radio size={64} className="text-white/10 mx-auto mb-6" />
        <p className="text-xl text-[var(--color-muted)] mb-2">Nenhum canal cadastrado ainda</p>
        <a href="/admin" className="text-[var(--color-red)] hover:underline text-sm">
          Adicionar canais no painel admin
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
      <div className="bg-[var(--color-card)] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={"text-xs px-3 py-1.5 rounded-full font-medium transition-all " + (activeCategory === cat ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[var(--color-muted)] hover:text-white hover:bg-white/10")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {filtered.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={"w-full flex items-center gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-all text-left " + (selectedChannel?.id === channel.id ? "bg-white/10 border-l-2 border-l-[var(--color-red)]" : "")}
            >
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                {channel.logo ? (
                  <Image src={channel.logo} alt={channel.name} fill className="object-contain p-1" unoptimized />
                ) : (
                  <Tv size={20} className="text-[var(--color-muted)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{channel.name}</p>
                <p className="text-[var(--color-muted)] text-xs">{channel.category}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">AO VIVO</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-24">
        {selectedChannel ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              {selectedChannel.logo && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40">
                  <Image src={selectedChannel.logo} alt={selectedChannel.name} fill className="object-contain p-1" unoptimized />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg">{selectedChannel.name}</h2>
                {selectedChannel.description && (
                  <p className="text-[var(--color-muted)] text-sm">{selectedChannel.description}</p>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/30 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                AO VIVO
              </span>
            </div>
            <LivePlayer streamUrl={selectedChannel.stream_url} title={selectedChannel.name} />
          </div>
        ) : (
          <div className="w-full aspect-video bg-[var(--color-card)] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Play size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-[var(--color-muted)] text-sm">Selecione um canal para assistir</p>
          </div>
        )}
      </div>
    </div>
  );
}