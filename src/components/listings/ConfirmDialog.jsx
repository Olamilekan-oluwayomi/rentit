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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-in">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-white/15 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
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
