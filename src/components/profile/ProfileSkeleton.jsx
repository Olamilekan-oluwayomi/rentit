export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar skeleton */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="mt-4 w-32 h-4 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="mt-2 w-24 h-3 bg-gray-200 dark:bg-white/10 rounded" />
        </div>

        {/* Form skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-4 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="w-full h-11 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="w-20 h-4 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="w-full h-11 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="w-20 h-4 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="w-full h-24 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
