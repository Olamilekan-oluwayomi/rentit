/**
 * StatusBadge — Color-coded pill for booking status indicators.
 *
 * Uses Tailwind's semantic colors (not brand theme tokens) since these
 * are status indicators, not brand elements.
 *
 * @param {{ status: "pending" | "approved" | "declined" | "completed" | "cancelled" }} props
 */

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  declined: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
};

/**
 * @param {{ status: string }} props
 * @returns {JSX.Element|null}
 */
export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status];
  if (!styles) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
