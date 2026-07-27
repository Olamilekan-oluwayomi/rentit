/*
|--------------------------------------------------------------------------
| GuestRoute.jsx
|--------------------------------------------------------------------------
|
| Auth gate that restricts access to unauthenticated visitors. Inverse of
| ProtectedRoute: redirects already-logged-in users away from pages like
| /login and /register. Shows a spinner while auth state resolves.
|
| Route: Wraps guest-only pages (/login, /register, /forgot-password, etc.)
| Responsibilities: Guard pages from authenticated users
| Dependencies: useAuth (AuthContext), React Router Navigate
| Notes: Uses Navigate with `replace` to prevent redirect from appearing
|        in browser history.
|
|--------------------------------------------------------------------------
*/

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a spinner while auth state resolves to avoid a flash redirect.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged-in users are sent home — they have no reason to visit login/register.
  if (user) return <Navigate to="/" replace />;

  return children;
}
