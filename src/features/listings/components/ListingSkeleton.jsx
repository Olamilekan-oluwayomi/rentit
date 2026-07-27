/**
 * ListingSkeleton — Placeholder grid shown while listings are loading.
 *
 * Route: Listings page ("/listings") — shown inside ListingGrid during data fetch.
 * Responsibilities: Renders a configurable number of skeleton cards matching the grid layout.
 * Dependencies: design/GridSkeleton.
 * Important notes: Thin wrapper around the shared GridSkeleton component. Default count of 8
 *   matches the typical page size for listing queries.
 */

import { GridSkeleton } from "../../../design";

export default function ListingSkeleton({ count = 8 }) {
  return <GridSkeleton count={count} />;
}
