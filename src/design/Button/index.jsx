import { forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover shadow-xs",
  secondary:
    "bg-sage text-white hover:bg-sage-hover active:bg-sage-hover shadow-xs",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary active:bg-surface-tertiary",
  outline:
    "border border-border bg-transparent text-text-primary hover:bg-surface-secondary active:bg-surface-tertiary",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 shadow-xs",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-sm",
  md: "px-5 py-2.5 text-sm gap-2 rounded-md",
  lg: "px-7 py-3 text-base gap-2.5 rounded-md",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    className = "",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-fast ease whitespace-nowrap select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-40 disabled:pointer-events-none",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && LeftIcon && (
        <LeftIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      )}
      {children}
      {!loading && RightIcon && (
        <RightIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      )}
    </button>
  );
});

export { Button };
