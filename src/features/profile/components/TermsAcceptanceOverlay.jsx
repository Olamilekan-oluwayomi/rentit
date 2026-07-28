/**
 * TermsAcceptanceOverlay — Non-dismissable overlay that forces returning
 * OAuth users (who skipped the RegisterPage ToS checkbox) to accept the
 * Terms of Service and Privacy Policy before using the app.
 *
 * Route: Any protected page — conditionally rendered by ProfileContext when
 *        the profile is missing terms_accepted_at.
 * Responsibilities: Shows a blocking overlay with links to /terms and /privacy.
 *   Updates the profile with acceptance timestamps and version strings on agree.
 * Dependencies: ProfileContext (profile, hideTermsAcceptance), supabase client,
 *   TERMS_VERSION / PRIVACY_VERSION constants.
 * Important notes: Cannot be dismissed by the user (no close button, no backdrop
 *   click, no escape key). Only users without terms_accepted_at ever see this.
 */

import { useState } from "react";
import { useProfileContext } from "../context/ProfileContext";
import { supabase } from "../../../shared/lib/supabase";
import { TERMS_VERSION, PRIVACY_VERSION } from "../../../shared/lib/constants";

export default function TermsAcceptanceOverlay() {
  const { profile, hideTermsAcceptance } = useProfileContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAgree = async () => {
    setSubmitting(true);
    setError(null);

    const now = new Date().toISOString();
    const termsPayload = {
      id: profile.id,
      terms_accepted_at: now,
      terms_version: TERMS_VERSION,
      privacy_accepted_at: now,
      privacy_version: PRIVACY_VERSION,
    };
    console.log("TermsAcceptanceOverlay payload:", termsPayload);
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(termsPayload, { onConflict: "id" });

    setSubmitting(false);

    if (updateError) {
      console.error("TermsAcceptanceOverlay upsert error:", updateError, "payload:", termsPayload);
      setError(updateError.message);
      return;
    }

    hideTermsAcceptance();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-heading font-bold text-text-primary text-center mb-2">
          Accept Terms of Service
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
          To continue using RentIt, please review and accept our{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Privacy Policy
          </a>.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAgree}
            disabled={submitting}
            className="w-full bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Saving..." : "I Agree"}
          </button>

          <p className="text-xs text-text-muted text-center leading-relaxed">
            By clicking &ldquo;I Agree&rdquo;, you confirm that you have read
            and agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}