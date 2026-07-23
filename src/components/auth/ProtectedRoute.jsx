/**
 * ProtectedRoute — Auth gate that restricts access to authenticated users.
 *
 * While auth state is loading, a spinner is shown to avoid a flash redirect.
 * If no user is present after loading completes, the user is redirected to
 * /login with history replacement (so the protected page isn't in the back button).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page content to render.
 * @returns {JSX.Element} Either the children, a loading spinner, or a redirect to /login.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Protected content or redirect.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Avoid flickering a redirect while the auth session is still resolving.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if unauthenticated. `replace` prevents the
  // protected page from being added to browser history.
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
