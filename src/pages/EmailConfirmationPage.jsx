import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function EmailConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
        setStatus(error ? "error" : "success");
      });
    } else {
      setStatus("error");
    }
  }, [searchParams]);

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