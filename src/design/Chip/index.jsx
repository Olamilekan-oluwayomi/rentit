import { X } from "lucide-react";

function Chip({
  selected = false,
  onRemove,
  onClick,
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-fast ease select-none";
  const appearance = selected
    ? "bg-accent text-white shadow-sm ring-1 ring-accent/30"
    : "bg-sage/10 text-sage hover:bg-sage/20 hover:shadow-xs active:bg-sage/30 ring-1 ring-transparent hover:ring-sage/20";
  const interactive = onClick || onRemove ? "cursor-pointer" : "";

  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      className={[
        base,
        appearance,
        interactive,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
      {onRemove && (
        <X
          size={13}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}

export { Chip };
