/*
|--------------------------------------------------------------------------
| useRequireCompleteProfile.js
|--------------------------------------------------------------------------
|
| Action-gated profile completion.
|
| Purpose: Wraps actions so they only proceed after the user completes their profile.
| Inputs: (none — uses useProfileContext internally)
| Outputs: { requireProfile }
| Side effects: Triggers ProfileCompletionOverlay if profile is incomplete
|
|--------------------------------------------------------------------------
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
