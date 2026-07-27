/**
 * LoginPage — Email/password and Google OAuth sign-in page.
 *
 * Provides email + password authentication via Supabase Auth,
 * plus a Google OAuth button. On successful sign-in the user is
 * redirected to the home page. Includes a link to the forgot
 * password flow for password recovery.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { AuthLayout } from "../../../layouts";
import FadeInSection from "../../../shared/components/FadeInSection";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithOAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  /**
   * Validates email and password, then calls signIn.
   * On success, shows a welcome toast and navigates to home.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      addToast("Welcome back!");
      navigate("/");
    }
  };

  /**
   * Initiates OAuth sign-in for the given provider (e.g. "google").
   * @param {string} provider - The OAuth provider identifier.
   */
  const handleOAuth = async (provider) => {
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) setError(error.message);
  };

  return (
    <AuthLayout>
      <FadeInSection>
      <div className="w-full bg-surface rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-heading font-bold text-center mb-6 text-text-primary">Welcome Back</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Log In"}
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-secondary">or continue with</span>
          </div>
        </div>

        <button
          onClick={() => handleOAuth("google")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-secondary transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
        >
          Google
        </button>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Sign up
        </Link>
          </p>
        </div>
      </FadeInSection>
    </AuthLayout>
  );
}