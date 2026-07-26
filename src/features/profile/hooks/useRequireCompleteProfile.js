/**
 * useRequireCompleteProfile — Action-gated profile completion.
 *
 * Returns a `requireProfile` function that callers wrap around any
 * mutating action (booking, messaging, listing creation). If the user's
 * profile is complete, the action fires immediately. If not, the
 * ProfileCompletionOverlay opens and the action fires only after the
 * user completes their profile.
 */

import { useCallback } from "react";
import { useProfileContext } from "../context/ProfileContext";

export function useRequireCompleteProfile() {
  const { isProfileComplete, waitForCompletion } = useProfileContext();

  /**
   * Gates an action behind profile completion.
   * @param {() => void} onProceed - The action to run after (or if) the profile is complete.
   */
  const requireProfile = useCallback(
    (onProceed) => {
      if (isProfileComplete) {
        onProceed();
      } else {
        waitForCompletion().then(() => {
          onProceed();
        });
      }
    },
    [isProfileComplete, waitForCompletion]
  );

  return { requireProfile };
}
