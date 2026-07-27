import { GridSkeleton } from "../../../design";

export default function ListingSkeleton({ count = 8 }) {
  return <GridSkeleton count={count} />;
}
