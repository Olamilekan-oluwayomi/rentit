import { forwardRef, useId } from "react";

const INPUT_CLASSES =
  "w-full bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-md px-4 py-2.5 text-sm transition-all duration-fast ease focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface-secondary";

const TEXTAREA_CLASSES =
  "w-full bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-md px-4 py-2.5 text-sm transition-all duration-fast ease focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface-secondary resize-y min-h-[80px]";

const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    type = "text",
    className = "",
    id: externalId,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const isTextarea = type === "textarea";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {LeadingIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <LeadingIcon size={16} />
          </div>
        )}

        {isTextarea ? (
          <textarea
            ref={ref}
            id={inputId}
            className={[
              TEXTAREA_CLASSES,
              LeadingIcon ? "pl-10" : "",
              TrailingIcon ? "pr-10" : "",
              error ? "border-danger focus:ring-danger/40 focus:border-danger" : "",
              className,
            ].join(" ")}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={[
              INPUT_CLASSES,
              LeadingIcon ? "pl-10" : "",
              TrailingIcon ? "pr-10" : "",
              error ? "border-danger focus:ring-danger/40 focus:border-danger" : "",
              className,
            ].join(" ")}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        )}

        {TrailingIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <TrailingIcon size={16} />
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

export { Input };
