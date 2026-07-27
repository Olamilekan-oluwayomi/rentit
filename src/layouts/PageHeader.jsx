export default function PageHeader({
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={["mb-8 lg:mb-12", className].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
