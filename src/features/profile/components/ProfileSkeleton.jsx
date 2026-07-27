import { Skeleton, AvatarSkeleton } from "../../../design";

export default function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="flex flex-col items-center lg:items-start gap-4">
        <AvatarSkeleton size="2xl" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-24 h-3" />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-full h-11 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-full h-11 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>
    </div>
  );
}
