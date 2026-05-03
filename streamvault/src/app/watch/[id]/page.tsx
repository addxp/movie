import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import VideoPlayer from "@/components/movie/VideoPlayer";
import Navbar from "@/components/layout/Navbar";

interface Props { params: Promise<{ id: string }>; }

export default async function WatchEpisodePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: episode } = await supabase
    .from("episodes")
    .select("*, movies(id, title)")
    .eq("id", id)
    .single();

  if (!episode) notFound();

  const movie = episode.movies as { id: string; title: string };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-12">
        <Link href={`/movie/${movie.id}`} className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Voltar para {movie.title}
        </Link>
        <div className="mb-6">
          <p className="text-[var(--color-muted)] text-sm mb-1">{movie.title}</p>
          <h1 className="text-3xl text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>
            T{episode.season}E{episode.episode} — {episode.title}
          </h1>
          {episode.description && <p className="text-[var(--color-muted)] mt-2">{episode.description}</p>}
        </div>
        <VideoPlayer
          videoUrl={episode.video_url}
          title={episode.title}
          thumbnail={episode.thumbnail}
          movieId={movie.id}
          userId={user.id}
          duration={episode.duration}
        />
      </div>
    </div>
  );
}