/**
 * Avatar — User profile image with fallback initials and optional status indicator.
 *
 * Sizes   | sm | md | lg | xl | 2xl
 * Status  | online | away | busy | offline
 *
 * Usage:
 *   <Avatar src={url} alt="User" status="online" size="lg" />
 *   <Avatar name="Jane Doe" />
 *
 * Accessibility:
 *   - Falls back to initials computed from name or alt when no image src
 *   - Status dot has an aria-label describing the status
 *   - Image renders with alt or name as descriptive text
 */

// ==== Sizes ====

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const STATUS_SIZES = {
  sm: "w-2 h-2 right-0 bottom-0",
  md: "w-2.5 h-2.5 right-0 bottom-0",
  lg: "w-3 h-3 right-0 bottom-0",
  xl: "w-3.5 h-3.5 right-0 bottom-0.5",
  "2xl": "w-4 h-4 right-0.5 bottom-0.5",
};

const STATUS_COLORS = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-surface-tertiary",
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  status,
  className = "",
  ...props
}) {
  const initials = getInitials(name || alt);

  return (
    <div
      className={[
        "relative inline-flex shrink-0",
        className,
      ].join(" ")}
      {...props}
    >
      <div
        className={[
          "rounded-full overflow-hidden bg-accent/10 flex items-center justify-center font-heading font-bold text-accent",
          SIZES[size] || SIZES.md,
        ].join(" ")}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="select-none">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={[
            "absolute rounded-full border-2 border-surface",
            STATUS_COLORS[status] || STATUS_COLORS.offline,
            STATUS_SIZES[size] || STATUS_SIZES.md,
          ].join(" ")}
          aria-label={`${status}`}
        />
      )}
    </div>
  );
}

export { Avatar };
