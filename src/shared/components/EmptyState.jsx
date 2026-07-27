import { Link } from "react-router-dom";
import { EmptyState as DesignEmptyState } from "../../design";
import { Button } from "../../design";

export default function EmptyState({ message, actionLabel, actionTo }) {
  return (
    <DesignEmptyState
      description={message}
      action={
        actionLabel &&
        actionTo && (
          <Link to={actionTo}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        )
      }
    />
  );
}
