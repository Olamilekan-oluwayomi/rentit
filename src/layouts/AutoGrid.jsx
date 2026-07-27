/*
|--------------------------------------------------------------------------
| AutoGrid.jsx
|--------------------------------------------------------------------------
|
| CSS Grid layout component that auto-fills columns based on a minimum
| item width. Responsive by nature without media queries.
|
| Route: N/A (presentational component)
| Responsibilities: Create responsive grid layouts with configurable min-width and gap
| Dependencies: None
| Notes: Uses `auto-fill, minmax()` pattern. MinWidth defaults to 240px, gap to 1.5rem.
|
|--------------------------------------------------------------------------
*/

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
