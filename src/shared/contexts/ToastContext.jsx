/**
 * ToastContext — Lightweight toast notification system.
 *
 * Provides an addToast() function that pushes a temporary notification
 * to the UI. Toasts auto-dismiss after 3 seconds and can also be closed
 * manually.
 */

import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

/**
 * ToastProvider — React context provider that renders toast notifications.
 *
 * Also renders the toast container overlay (fixed top-right) so consumers
 * only need to wrap once.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Push a new toast onto the stack.
   * It will be automatically removed after 3 seconds.
   *
   * @param {string} message  - Text to display.
   * @param {"success" | "error" | "info"} [type="success"] - Visual style.
   */
  const addToast = useCallback((message, type = "success") => {
    // Use timestamp as a simple unique ID — sufficient for a small app
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /** Manually dismiss a toast by its ID. */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — fixed position, above all other UI */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-white"
            }`}
          >
            {/* Success icon */}
            {toast.type === "success" && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {/* Error icon */}
            {toast.type === "error" && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
            {/* Manual dismiss button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 shrink-0 opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the addToast function.
 *
 * Must be used inside a <ToastProvider>.
 *
 * @returns {{ addToast: (message: string, type?: "success" | "error" | "info") => void }}
 * @throws {Error} If used outside a ToastProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
