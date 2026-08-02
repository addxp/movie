"use client";
import { useState, useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export interface FilterState {
  genre: string;
  yearMin: number;
  yearMax: number;
  sort: "rating" | "year-desc" | "year-asc" | "title";
}

interface FilterBarProps {
  onChange: (filters: FilterState) => void;
}

const GENRES = ["Acao", "Ficcao", "Animacao", "Terror", "Comedia", "Romance", "Drama", "Outros"];

const YEAR_MIN = 1970;
const YEAR_MAX = new Date().getFullYear();

const DEFAULT: FilterState = {
  genre: "todos",
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  sort: "rating",
};

export default function FilterBar({ onChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT);
  const [open, setOpen] = useState(false);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        onChange(next);
        return next;
      });
    },
    [onChange]
  );

  const clearAll = () => {
    setFilters(DEFAULT);
    onChange(DEFAULT);
  };

  const hasActive =
    filters.genre !== "todos" ||
    filters.yearMin !== YEAR_MIN ||
    filters.yearMax !== YEAR_MAX;

  return (
    <div className="px-8 lg:px-16 mb-6">
      {/* Trigger row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
          style={{
            background: open ? "var(--color-red)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${open ? "var(--color-red)" : "rgba(255,255,255,0.1)"}`,
            color: open ? "#fff" : "rgba(255,255,255,0.55)",
          }}
        >
          <SlidersHorizontal size={13} />
          Filtros
          {hasActive && (
            <span
              className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
              style={{ background: open ? "rgba(255,255,255,0.25)" : "var(--color-red)", color: "#fff" }}
            >
              !
            </span>
          )}
        </button>

        {/* Sort — always visible */}
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as FilterState["sort"] })}
          className="text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <option value="rating">Melhor avaliados</option>
          <option value="year-desc">Mais recentes</option>
          <option value="year-asc">Mais antigos</option>
          <option value="title">A – Z</option>
        </select>

        {/* Active tags */}
        {filters.genre !== "todos" && (
          <Tag
            label={filters.genre}
            onRemove={() => update({ genre: "todos" })}
          />
        )}
        {(filters.yearMin !== YEAR_MIN || filters.yearMax !== YEAR_MAX) && (
          <Tag
            label={`${filters.yearMin} – ${filters.yearMax}`}
            onRemove={() => update({ yearMin: YEAR_MIN, yearMax: YEAR_MAX })}
          />
        )}
        {hasActive && (
          <button
            onClick={clearAll}
            className="text-[11px] transition-colors"
            style={{ color: "var(--color-red)" }}
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {open && (
        <div
          className="mt-3 p-4 rounded-xl flex flex-wrap gap-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Genre pills */}
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Gênero
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill
                label="Todos"
                active={filters.genre === "todos"}
                onClick={() => update({ genre: "todos" })}
              />
              {GENRES.map((g) => (
                <Pill
                  key={g}
                  label={g}
                  active={filters.genre === g}
                  onClick={() => update({ genre: g })}
                />
              ))}
            </div>
          </div>

          {/* Year range */}
          <div className="min-w-[220px]">
            <p className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Período
            </p>
            <div className="flex flex-col gap-3">
              <RangeRow
                label="De"
                min={YEAR_MIN}
                max={YEAR_MAX}
                value={filters.yearMin}
                onChange={(v) => update({ yearMin: Math.min(v, filters.yearMax) })}
              />
              <RangeRow
                label="Até"
                min={YEAR_MIN}
                max={YEAR_MAX}
                value={filters.yearMax}
                onChange={(v) => update({ yearMax: Math.max(v, filters.yearMin) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1 rounded-full transition-all duration-150"
      style={{
        background: active ? "var(--color-red)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "var(--color-red)" : "rgba(255,255,255,0.1)"}`,
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
      style={{
        background: "rgba(229,9,20,0.12)",
        border: "1px solid rgba(229,9,20,0.25)",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      {label}
      <X size={11} className="cursor-pointer hover:opacity-80" onClick={onRemove} />
    </span>
  );
}

function RangeRow({
  label, min, max, value, onChange,
}: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] w-6" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-[var(--color-red)] cursor-pointer"
        style={{ accentColor: "var(--color-red)" }}
      />
      <span
        className="text-xs font-medium w-10 text-right"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {value}
      </span>
    </div>
  );
}