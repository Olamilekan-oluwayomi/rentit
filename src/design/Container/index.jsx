/**
 * Container — Max-width centred wrapper with responsive horizontal padding.
 *
 * Usage:
 *   <Container>Page content</Container>
 *
 * Accessibility:
 *   - Renders a plain <div> with no semantic impact
 *   - Does not constrain text max-width (layout only)
 */

function Container({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container };
