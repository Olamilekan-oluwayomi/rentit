/*
|--------------------------------------------------------------------------
| DashboardLayout.jsx
|--------------------------------------------------------------------------
|
| Simple content wrapper for dashboard sub-pages. Adds max-width container
| with responsive padding.
|
| Route: not a /dashboard sub-page — consumed by features/profile/ProfilePage,
|        which needs the same constrained width for /profile.
| Responsibilities: Contain page content within a constrained width
| Dependencies: None
| Notes: This is NOT the dashboard shell — that is DashboardShell.jsx, which
|        renders /dashboard routes directly and does not use this wrapper.
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
