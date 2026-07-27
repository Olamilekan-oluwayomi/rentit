import { forwardRef } from "react";

const SIZES = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    size = "md",
    active = false,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={[
        "inline-flex items-center justify-center rounded-lg transition-all duration-fast ease",
        "text-text-secondary hover:bg-surface-secondary hover:text-text-primary active:bg-surface-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        "disabled:opacity-40 disabled:pointer-events-none",
        SIZES[size] || SIZES.md,
        active ? "bg-surface-secondary text-accent" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : size === "lg" ? 22 : 18} />}
    </button>
  );
});

export { IconButton };
