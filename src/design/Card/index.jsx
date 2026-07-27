/**
 * Card — Content container with composable header/body/footer sub-components.
 *
 * Variants  | default | outlined | interactive | elevated
 *
 * Usage:
 *   <Card variant="interactive" onClick={handleClick}>
 *     <CardHeader>Title</CardHeader>
 *     <CardBody>Content</CardBody>
 *     <CardFooter>Actions</CardFooter>
 *   </Card>
 *
 * Accessibility:
 *   - Interactive variant adds cursor-pointer and hover/active transforms
 *   - Semantic div container; use heading elements inside for structure
 */

// ==== Variants ====

const VARIANTS = {
  default:
    "bg-surface border border-border",
  outlined:
    "bg-surface border-2 border-border",
  interactive:
    "bg-surface border border-border hover:border-accent/30 hover:-translate-y-[2px] active:scale-[0.99] cursor-pointer transition-all duration-normal ease",
  elevated:
    "bg-surface border border-border",
};

function Card({ variant = "default", className = "", children, ...props }) {
  return (
    <div
      className={[
        "rounded-xl",
        VARIANTS[variant] || VARIANTS.default,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={["px-6 pt-6 pb-0", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children, ...props }) {
  return (
    <div
      className={["px-6 py-6", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "px-6 pb-6 pt-0 flex items-center gap-3",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
