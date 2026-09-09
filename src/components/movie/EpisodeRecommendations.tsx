import Link from "next/link";
import { Play, Tv } from "lucide-react";
import type { Episode } from "@/types";

interface Props {
  seriesTitle: string;
  next: Episode | null;
  others: Episode[];
}

function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link href={`/watch/${episode.id}`} className="group flex-shrink-0 block" style={{ width: "220px" }}>
      <div
        className="relative rounded-xl overflow-hidden bg-[#181818] ring-1 ring-white/5 group-hover:ring-[var(--color-red)]/40 transition-all"
        style={{ aspectRatio: "16/9" }}
      >
        {episode.thumbnail ? (
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv size={22} className="text-white/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/0 group-hover:bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
            <Play size={14} fill="black" stroke="none" className="ml-0.5" />
          </div>
        </div>
        <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
          T{episode.season}E{episode.episode}
        </span>
      </div>
      <p className="mt-2 text-white text-xs font-medium line-clamp-1 group-hover:text-[var(--color-red)] transition-colors">
        {episode.title}
      </p>
    </Link>
  );
}

export default function EpisodeRecommendations({ seriesTitle, next, others }: Props) {
  if (!next && others.length === 0) return null;

  return (
    <section className="mt-10">
      {next && (
        <div className="mb-8">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-widest font-semibold mb-3">
            A seguir
          </p>
          <Link
            href={`/watch/${next.id}`}
            className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors"
          >
            <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-[#181818]" style={{ width: "140px", aspectRatio: "16/9" }}>
              {next.thumbnail ? (
                <img src={next.thumbnail} alt={next.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tv size={20} className="text-white/15" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center">
                  <Play size={14} fill="black" stroke="none" className="ml-0.5" />
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm group-hover:text-[var(--color-red)] transition-colors">
                T{next.season}E{next.episode} — {next.title}
              </p>
              {next.description && (
                <p className="text-[var(--color-muted)] text-xs line-clamp-2 mt-1">{next.description}</p>
              )}
            </div>
          </Link>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-widest font-semibold mb-3">
            Mais episódios de {seriesTitle}
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {others.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
