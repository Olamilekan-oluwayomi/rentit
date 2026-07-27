/*
|--------------------------------------------------------------------------
| SectionHeader.jsx
|--------------------------------------------------------------------------
|
| Reusable section heading component with optional subtitle and action slot.
| Smaller than PageHeader — intended for sub-sections within a page.
|
| Route: N/A (presentational component)
| Responsibilities: Render consistent section titles with context and optional CTA
| Dependencies: None
| Notes: The `action` prop accepts a React node rendered on the right side.
|
|--------------------------------------------------------------------------
*/

export default function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}) {
  return (
    <div className={["mb-6", className].join(" ")}>
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
    </div>
  );
}
