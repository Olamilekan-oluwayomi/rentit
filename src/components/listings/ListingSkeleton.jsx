export default function ListingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-pulse"
        >
          <div className="aspect-4/3 bg-gray-200 dark:bg-white/5" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-full w-16" />
              <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
