/**
 * Divider — Visual separator between sections (horizontal or vertical).
 *
 * Usage:
 *   <Divider />
 *   <Divider orientation="vertical" className="h-10" />
 *
 * Accessibility:
 *   - Uses role="separator" with aria-orientation
 *   - Renders a native <hr> element
 */

function Divider({
  orientation = "horizontal",
  className = "",
  ...props
}) {
  return (
    <hr
      className={[
        "border-border",
        orientation === "vertical"
          ? "h-full w-px border-l"
          : "w-full border-t",
        className,
      ].join(" ")}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}

export { Divider };
