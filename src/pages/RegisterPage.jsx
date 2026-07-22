import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8">
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">Check your email</h1>
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
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
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
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
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
    </div>
  );
}