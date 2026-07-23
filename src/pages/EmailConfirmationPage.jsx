import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => {
            setStatus(error ? "error" : "success");
          });
      } else {
        setStatus("error");
      }
    } else {
      setStatus("error");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-text-primary">Confirming your email...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">Email Confirmed</h1>
            <p className="text-text-secondary mb-6">Your account has been verified. You can now sign in.</p>
            <Link
              to="/login"
              className="inline-block bg-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">Confirmation Failed</h1>
            <p className="text-text-secondary mb-6">The link is invalid or has expired.</p>
            <Link
              to="/register"
              className="inline-block bg-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}