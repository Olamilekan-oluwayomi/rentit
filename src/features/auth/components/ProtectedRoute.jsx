/*
|--------------------------------------------------------------------------
| ProtectedRoute.jsx
|--------------------------------------------------------------------------
|
| Auth gate that restricts access to authenticated users. Shows a spinner
| while auth state is resolving to prevent a flash redirect. Redirects
| unauthenticated users to /login with history replacement.
|
| Route: Wraps protected pages (e.g. /dashboard/*, /listings/new, /profile)
| Responsibilities: Guard pages behind authentication
| Dependencies: useAuth (AuthContext), React Router Navigate
| Notes: Uses Navigate with `replace` to prevent protected page from
|        appearing in browser history after redirect.
|
|--------------------------------------------------------------------------
*/

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // `replace` prevents the protected page from being added to browser history.
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
