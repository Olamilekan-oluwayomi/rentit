import { Badge } from "../../../design";

const STATUS_MAP = {
  pending: "warning",
  approved: "success",
  declined: "danger",
  completed: "accent",
  cancelled: "neutral",
};

export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status];
  if (!variant) return null;

  return <Badge variant={variant}>{status}</Badge>;
}
