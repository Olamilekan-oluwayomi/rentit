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
