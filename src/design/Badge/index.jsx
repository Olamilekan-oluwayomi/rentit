const VARIANTS = {
  success:
    "bg-success/10 text-success",
  warning:
    "bg-warning/10 text-warning",
  danger:
    "bg-danger/10 text-danger",
  neutral:
    "bg-surface-tertiary text-text-secondary",
  accent:
    "bg-accent/10 text-accent",
  sage:
    "bg-sage/10 text-sage",
  "sage-filled":
    "bg-sage text-white",
  "accent-filled":
    "bg-accent text-white",
  "success-filled":
    "bg-success text-white",
};

function Badge({ variant = "neutral", className = "", children, ...props }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
