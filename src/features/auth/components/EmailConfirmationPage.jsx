/*
|--------------------------------------------------------------------------
| EmailConfirmationPage.jsx
|--------------------------------------------------------------------------
|
| Handles the email verification callback. Extracts access/refresh tokens
| from the URL hash, establishes the Supabase session, strips tokens from
| the URL, then auto-redirects to login after 2 seconds. Shows loading,
| success, or error states.
|
| Route: /confirm (reached via email verification link)
| Responsibilities: Verify email by processing Supabase auth tokens
| Dependencies: supabase client, AuthLayout, FadeInSection, React Router
| Notes: Auto-redirects to /login after 2s on success.
|        Strips tokens from URL via history.replaceState.
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabase";
import { AuthLayout } from "../../../layouts";
import FadeInSection from "../../../shared/components/FadeInSection";

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  /**
   * On mount, extracts tokens from the URL hash, establishes
   * the Supabase session, and strips tokens from the URL.
   */
  useEffect(() => {
    const confirmEmail = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes("access_token")) {
        setStatus("error");
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        setStatus("error");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        setStatus("error");
        return;
      }

      // Remove the access token from the URL
      window.history.replaceState({}, document.title, "/confirm");

      setStatus("success");
    };

    confirmEmail();
  }, []);

  /** Auto-redirect to home 2s after successful confirmation. */
  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <AuthLayout>
      <FadeInSection>
      <div className="w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
              Confirming your email...
            </h1>
            <p className="text-text-secondary">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">
              Email Confirmed
            </h1>

            <p className="text-text-secondary mb-6">
              Your account has been verified successfully. Redirecting you to
              the home page...
            </p>

            <Link
              to="/"
              className="inline-block bg-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              Go to Home Now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">
              Confirmation Failed
            </h1>

            <p className="text-text-secondary mb-6">
              This confirmation link is invalid or has expired.
            </p>

            <Link
              to="/register"
              className="inline-block bg-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
      </FadeInSection>
    </AuthLayout>
  );
}