export default function AutoGrid({
  minWidth = "240px",
  gap = "1.5rem",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={[className].join(" ")}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
