/*
|--------------------------------------------------------------------------
| RegisterPage.jsx
|--------------------------------------------------------------------------
|
| New user account creation page. Email/password registration with
| Supabase Auth. Shows a "check your email" confirmation screen
| after successful sign-up. Inline error display for failed sign-ups.
|
| Route: /register (wrapped in GuestRoute → AuthLayout)
| Responsibilities: Register new users via email/password
| Dependencies: useAuth, AuthLayout, FadeInSection, Framer Motion, lucide-react
| Notes: Password confirmation match checked client-side before submit.
|        Shows password visibility toggle for both fields.
|
|--------------------------------------------------------------------------
*/

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../../../layouts";
import FadeInSection from "../../../shared/components/FadeInSection";
import { TERMS_VERSION, PRIVACY_VERSION } from "../../../shared/lib/constants";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName, {
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
      privacy_accepted_at: new Date().toISOString(),
      privacy_version: PRIVACY_VERSION,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError(null);
  };

  return (
    <AuthLayout>
      <FadeInSection>
      <div className="w-full bg-surface rounded-2xl shadow-lg p-8">
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-6 text-text-primary">Check your email</h1>
            <p className="text-text-secondary mb-6">
              We sent a confirmation link to <span className="font-medium">{email}</span>. Click the link to activate your account.
            </p>
            <Link
              to="/login"
              className="text-accent hover:underline font-medium text-sm"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-heading font-bold text-center mb-6 text-text-primary">Create Account</h1>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded active:scale-[0.97]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded active:scale-[0.97]"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (error) setError(null);
                  }}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
                />
                <span className="text-sm text-text-secondary leading-snug">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <motion.button
                type="submit"
                disabled={loading || !acceptedTerms}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
      </FadeInSection>
    </AuthLayout>
  );
}