/*
|--------------------------------------------------------------------------
| ListingLayout.jsx
|--------------------------------------------------------------------------
|
| Content wrapper for listing-related pages (detail, create, edit).
| Adds max-width container with responsive padding.
|
| Route: /listings/:id, /listings/new, /listings/:id/edit
| Responsibilities: Contain listing page content within a constrained width
| Dependencies: None
| Notes: Minimal wrapper — does not add chrome, just spacing.
|
|--------------------------------------------------------------------------
*/

export default function ListingLayout({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {children}
    </div>
  );
}
