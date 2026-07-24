export default function BookingListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-white/5 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}
