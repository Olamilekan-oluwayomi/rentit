/**
 * ConfirmDialog — Modal confirmation dialog with loading state and danger variant.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={showDelete}
 *     title="Delete listing?"
 *     message="This cannot be undone."
 *     danger
 *     loading={deleting}
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowDelete(false)}
 *   />
 *
 * Accessibility:
 *   - role="dialog" with aria-modal="true" and aria-label
 *   - Overlay dismiss via backdrop click
 *   - Buttons disabled while loading to prevent double-submit
 */

import { Button } from "../../design";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-in">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
