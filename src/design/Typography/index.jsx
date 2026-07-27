const HEADING_TAGS = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

const HEADING_SIZES = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl sm:text-3xl",
  h3: "text-xl sm:text-2xl",
  h4: "text-lg sm:text-xl",
  h5: "text-base sm:text-lg",
  h6: "text-sm sm:text-base",
};

function Heading({ as = "h2", className = "", children, ...props }) {
  const Tag = HEADING_TAGS[as] || "h2";

  return (
    <Tag
      className={[
        "font-heading font-bold text-text-primary",
        HEADING_SIZES[as] || HEADING_SIZES.h2,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}

function Text({
  variant = "body",
  mono = false,
  className = "",
  children,
  ...props
}) {
  const variantStyles = {
    body: "text-text-primary text-sm",
    secondary: "text-text-secondary text-sm",
    muted: "text-text-muted text-xs",
    caption: "text-text-muted text-xs",
  };

  return (
    <p
      className={[
        variantStyles[variant] || variantStyles.body,
        mono ? "font-mono" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </p>
  );
}

export { Heading, Text };
