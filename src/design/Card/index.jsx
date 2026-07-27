const VARIANTS = {
  default:
    "bg-surface border border-border shadow-sm",
  outlined:
    "bg-surface border-2 border-border",
  interactive:
    "bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-normal ease",
  elevated:
    "bg-surface border border-border shadow-md",
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
