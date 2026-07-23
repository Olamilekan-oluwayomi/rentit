/**
 * GuestRoute — Auth gate that restricts access to unauthenticated visitors.
 *
 * This is the inverse of ProtectedRoute: it redirects already-logged-in
 * users away from pages like /login and /register. A spinner is shown
 * while the auth session resolves to prevent a redirect flash.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The guest-only page content to render.
 * @returns {JSX.Element} Either the children, a loading spinner, or a redirect to /.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Guest-only content or redirect.
 */
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
