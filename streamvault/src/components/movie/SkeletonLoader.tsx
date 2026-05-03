// components/movie/SkeletonLoader.tsx — Skeleton de carregamento
export function HeroSkeleton() {
  return (
    <div className="h-[85vh] min-h-[600px] skeleton rounded-none" />
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-10 px-8 lg:px-16">
      <div className="skeleton h-7 w-40 rounded mb-4" />
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-44 md:w-52">
            <div className="skeleton aspect-[2/3] rounded-lg" />
            <div className="mt-2 space-y-1">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}