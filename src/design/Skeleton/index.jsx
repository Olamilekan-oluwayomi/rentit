function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={[
        "animate-pulse bg-surface-tertiary/60 rounded-md",
        className,
      ].join(" ")}
      aria-hidden="true"
      {...props}
    />
  );
}

function CardSkeleton({ className = "", ...props }) {
  return (
    <div
      className={[
        "bg-surface border border-border rounded-2xl overflow-hidden",
        className,
      ].join(" ")}
      aria-hidden="true"
      {...props}
    >
      <div className="aspect-4/3 bg-surface-tertiary/40" />
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function AvatarSkeleton({ size = "md", className = "", ...props }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  };

  return (
    <div
      className={[
        "rounded-full bg-surface-tertiary/60 animate-pulse",
        sizeMap[size] || sizeMap.md,
        className,
      ].join(" ")}
      aria-hidden="true"
      {...props}
    />
  );
}

function TextSkeleton({ lines = 3, className = "", ...props }) {
  return (
    <div className={["space-y-2", className].join(" ")} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

function GridSkeleton({
  count = 8,
  className = "",
  ...props
}) {
  return (
    <div
      className={[
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-6",
        className,
      ].join(" ")}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton, CardSkeleton, AvatarSkeleton, TextSkeleton, GridSkeleton };
