"use client";
import { useState, useCallback, useMemo } from "react";
import FilterBar, { type FilterState } from "@/components/movie/FilterBar";
import MovieRow from "@/components/movie/MovieRow";
import type { Movie } from "@/types";

interface BrowseClientProps {
  moviesByCategory: Record<string, Movie[]>;
  userId: string;
}

const YEAR_MIN = 1970;
const YEAR_MAX = new Date().getFullYear();

const DEFAULT_FILTERS: FilterState = {
  genre: "todos",
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  sort: "rating",
};

function sortMovies(movies: Movie[], sort: FilterState["sort"]): Movie[] {
  const copy = [...movies];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "year-desc":
      return copy.sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0));
    case "year-asc":
      return copy.sort((a, b) => (a.release_year ?? 0) - (b.release_year ?? 0));
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
}

export default function BrowseClient({ moviesByCategory, userId }: BrowseClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
  }, []);

  const filteredRows = useMemo(() => {
    const isFiltering =
      filters.genre !== "todos" ||
      filters.yearMin !== YEAR_MIN ||
      filters.yearMax !== YEAR_MAX;

    // If genre filter active, show only that category
    const entries = filters.genre !== "todos"
      ? Object.entries(moviesByCategory).filter(
          ([cat]) => cat.toLowerCase() === filters.genre.toLowerCase()
        )
      : Object.entries(moviesByCategory);

    return entries
      .map(([category, movies]) => {
        let list = movies;

        if (isFiltering) {
          list = list.filter((m) => {
            const year = m.release_year ?? 0;
            return year >= filters.yearMin && year <= filters.yearMax;
          });
        }

        list = sortMovies(list, filters.sort);

        return { category, movies: list };
      })
      .filter(({ movies }) => movies.length > 0);
  }, [moviesByCategory, filters]);

  const totalTitles = useMemo(
    () => filteredRows.reduce((acc, { movies }) => acc + movies.length, 0),
    [filteredRows]
  );

  const isFiltering =
    filters.genre !== "todos" ||
    filters.yearMin !== YEAR_MIN ||
    filters.yearMax !== YEAR_MAX;

  return (
    <>
      <FilterBar onChange={handleFiltersChange} />

      {isFiltering && (
        <div className="px-8 lg:px-16 mb-4">
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            {totalTitles} título{totalTitles !== 1 ? "s" : ""} encontrado{totalTitles !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎬</p>
          <p style={{ color: "rgba(255,255,255,0.25)" }}>
            Nenhum título encontrado com esses filtros.
          </p>
        </div>
      ) : (
        filteredRows.map(({ category, movies }) => (
          <MovieRow
            key={category}
            title={category}
            movies={movies}
            userId={userId}
            category={category}
          />
        ))
      )}
    </>
  );
}