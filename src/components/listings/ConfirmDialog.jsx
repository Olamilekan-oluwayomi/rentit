/**
 * ConfirmDialog.jsx
 * ------------------
 * Modal confirmation dialog with backdrop overlay. Used for destructive actions
 * (e.g., deleting a listing) where the user must explicitly confirm.
 * Supports a `danger` mode that styles the confirm button red, a loading state
 * that disables interactions during async operations, and customizable labels.
 * Returns null when `open` is false (unmounts from DOM entirely).
 */

/**
 * Modal confirmation dialog with backdrop overlay.
 * Renders nothing when `open` is false. Clicking the backdrop calls onCancel
 * for a quick dismiss gesture. All interactive elements are disabled during loading.
 * @param {{ open: boolean, title: string, message: string, confirmLabel: string, cancelLabel: string, danger: boolean, loading: boolean, onConfirm: () => void, onCancel: () => void }} props
 */
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
  // Early return — no DOM elements created when dialog is closed.
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop overlay — clicking dismisses the dialog */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog panel — positioned above the backdrop */}
      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-in">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>

        <div className="flex items-center gap-3 justify-end">
          {/* Cancel button — disabled during loading to prevent double-action */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          {/* Confirm button — uses red styling for dangerous actions (delete, etc.) */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50 flex items-center gap-2 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-accent hover:opacity-90"
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
