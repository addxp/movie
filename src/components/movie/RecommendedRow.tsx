import type { Movie } from "@/types";
import MovieCard from "@/components/movie/MovieCard";

interface Props {
  title: string;
  movies: Movie[];
  userId: string;
}

export default function RecommendedRow({ title, movies, userId }: Props) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="mt-10 mb-6">
      <h2
        className="text-xl md:text-2xl text-white font-bold mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} userId={userId} />
        ))}
      </div>
    </section>
  );
}
