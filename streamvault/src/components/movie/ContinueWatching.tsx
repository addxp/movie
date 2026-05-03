"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WatchItem {
  id: string;
  movie_id: string;
  progress: number;
  duration: number;
  watched_at: string;
  movies: {
    id: string;
    title: string;
    thumbnail: string;
    type: string;
  };
}

export default function ContinueWatching({ userId }: { userId: string }) {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("watch_history")
        .select("*, movies(id, title, thumbnail, type)")
        .eq("user_id", userId)
        .eq("completed", false)
        .order("watched_at", { ascending: false })
        .limit(12);
      if (data) setItems(data as WatchItem[]);
      setLoading(false);
    };
    load();
  }, [userId]);

  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("watch_history").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="mb-8 pt-6">
      <div className="flex items-center gap-2 px-8 lg:px-16 mb-3">
        <Clock size={13} className="text-[var(--color-red)]" />
        <h2 className="text-white text-sm font-semibold">Continuar Assistindo</h2>
        <span className="text-[#555] text-xs">{items.length}</span>
      </div>

      <div className="scroll-row flex gap-2 px-8 lg:px-16 pb-1">
        {items.map((item) => {
          const percent = item.duration > 0 ? Math.min((item.progress / item.duration) * 100, 100) : 30;
          return (
            <Link
              key={item.id}
              href={"/movie/" + item.movies.id}
              className="relative flex-shrink-0 group/card block"
              style={{ width: "130px" }}
            >
              <div className="relative rounded-md overflow-hidden bg-[#1a1a1a] mb-1.5" style={{ aspectRatio: "2/3" }}>
                <Image src={item.movies.thumbnail} alt={item.movies.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/50 transition-all flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all">
                    <Play size={14} fill="black" className="ml-0.5" />
                  </div>
                </div>
                {/* Barra de progresso */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                  <div className="h-full bg-[var(--color-red)]" style={{ width: percent + "%" }} />
                </div>
                {/* Botão remover */}
                <button
                  onClick={(e) => removeItem(e, item.id)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red-500"
                >
                  <X size={9} className="text-white" />
                </button>
              </div>
              <h3 className="text-white/90 text-[11px] font-medium line-clamp-1">{item.movies.title}</h3>
              <p className="text-[#555] text-[10px] mt-0.5">{Math.round(percent)}% assistido</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}