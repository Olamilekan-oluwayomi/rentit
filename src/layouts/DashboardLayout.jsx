/*
|--------------------------------------------------------------------------
| DashboardLayout.jsx
|--------------------------------------------------------------------------
|
| Simple content wrapper for dashboard sub-pages. Adds max-width container
| with responsive padding.
|
| Route: /dashboard (used inside DashboardShell via Outlet)
| Responsibilities: Contain dashboard page content within a constrained width
| Dependencies: None
| Notes: This is NOT the sidebar shell — that is DashboardShell.jsx. This is
|        the inner content area wrapper used within dashboard routes.
|
|--------------------------------------------------------------------------
*/

export default function DashboardLayout({ children }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      {children}
    </div>
  );
}
