/**
 * Section — Page section wrapper with optional heading, subtitle, and action slot.
 *
 * Usage:
 *   <Section
 *     title="Featured Items"
 *     subtitle="Popular rentals near you"
 *     action={<Button>View All</Button>}
 *   >
 *     <ListingGrid />
 *   </Section>
 *
 * Accessibility:
 *   - Renders a semantic <section> element
 *   - Title renders as <h2> for heading hierarchy
 */

function Section({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}) {
  return (
    <section
      className={["space-y-6", className].join(" ")}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-heading font-bold text-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export { Section };
