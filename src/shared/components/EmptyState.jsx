import { Link } from "react-router-dom";

export default function EmptyState({ message, actionLabel, actionTo }) {
  return (
    <div className="bg-surface rounded-2xl border border-gray-100 dark:border-white/10 p-10 text-center space-y-3">
      <p className="text-text-secondary">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
