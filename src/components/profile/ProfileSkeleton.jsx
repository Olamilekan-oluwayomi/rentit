/**
 * ProfileSkeleton — Pulse-animated placeholder shown while profile data loads.
 *
 * Mirrors the exact layout of ProfileHeader (avatar + form fields)
 * so there's no layout shift when the real content replaces it.
 * Uses Tailwind's `animate-pulse` on gray/white blocks.
 *
 * @returns {JSX.Element} A skeleton loader matching the profile page layout.
 */
export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar skeleton — circular block matching the avatar dimensions */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="mt-4 w-32 h-4 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="mt-2 w-24 h-3 bg-gray-200 dark:bg-white/10 rounded" />
        </div>

        {/* Form skeleton — mimics three input fields and a submit button */}
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
