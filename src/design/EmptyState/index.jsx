function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
  ...props
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      ].join(" ")}
      {...props}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
          <Icon size={24} className="text-text-muted" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
