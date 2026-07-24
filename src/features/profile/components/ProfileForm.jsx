/**
 * ProfileForm — Editable form for the user's profile fields (name, location, bio).
 *
 * Includes client-side validation with character limits, a geolocation-based
 * "detect my location" button, and inline error messages. Form state is
 * local; the parent calls onSave with the validated payload.
 *
 * @param {Object} props
 * @param {Object} props.profile - The current profile data to populate defaults from.
 * @param {boolean} props.saving - Whether a save operation is in progress.
 * @param {(updates: { full_name: string, location: string, bio: string }) => void} props.onSave - Callback to persist the form data.
 * @returns {JSX.Element} The profile edit form.
 */

import { useState } from "react";
import { MapPinned } from "lucide-react";
import { useCurrentLocation } from "../../../shared/hooks/useCurrentLocation";
import { useToast } from "../../../shared/contexts/ToastContext";

/** Character length limits for each profile field. */
const LIMITS = {
  full_name: { min: 2, max: 60 },
  location: { max: 80 },
  bio: { max: 300 },
};

/**
 * @param {{ profile: Object, saving: boolean, onSave: (updates: Object) => void }} props
 * @returns {JSX.Element} The profile form with validation and location detection.
 */
export default function ProfileForm({ profile, saving, onSave }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [errors, setErrors] = useState({});

  const { getCurrentLocation, loading: locationLoading } = useCurrentLocation();
  const { addToast } = useToast();

  /**
   * Uses the browser Geolocation API to auto-fill the location field.
   * Converts coordinates to a human-readable string via the useCurrentLocation hook.
   */
  const handleDetectLocation = async () => {
    const { location: detected, error } = await getCurrentLocation();

    if (error) {
      addToast(error, "error");
      return;
    }

    setLocation(detected);
  };

  /**
   * Validates all fields against LIMITS and populates the errors state.
   * @returns {boolean} True if the form is valid.
   */
  const validate = () => {
    const errs = {};
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      errs.full_name = "Full name is required.";
    } else if (trimmedName.length < LIMITS.full_name.min) {
      errs.full_name = `Must be at least ${LIMITS.full_name.min} characters.`;
    } else if (trimmedName.length > LIMITS.full_name.max) {
      errs.full_name = `Must be ${LIMITS.full_name.max} characters or fewer.`;
    }

    if (location.length > LIMITS.location.max) {
      errs.location = `Must be ${LIMITS.location.max} characters or fewer.`;
    }

    if (bio.length > LIMITS.bio.max) {
      errs.bio = `Must be ${LIMITS.bio.max} characters or fewer.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /**
   * Validates then passes the cleaned form data to the parent's onSave callback.
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      full_name: fullName,
      location,
      bio,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name field */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={LIMITS.full_name.max}
          required
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
        />
        {errors.full_name && (
          <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* Location field with geolocation detect button */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Location
        </label>
        <div className="relative">
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={LIMITS.location.max}
            placeholder="City, Country"
            className="w-full px-4 py-2.5 pr-11 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
          />
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locationLoading}
            title="Use current location"
            aria-label="Use current location"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {locationLoading ? (
              <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <MapPinned size={18} strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1">
          {errors.location ? (
            <p className="text-xs text-red-500">{errors.location}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-text-secondary">
            {location.length}/{LIMITS.location.max}
          </p>
        </div>
      </div>

      {/* Bio textarea */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={LIMITS.bio.max}
          rows={4}
          placeholder="Tell others about yourself..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.bio ? (
            <p className="text-xs text-red-500">{errors.bio}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-text-secondary">
            {bio.length}/{LIMITS.bio.max}
          </p>
        </div>
      </div>

      {/* Submit button with loading spinner */}
      <button
        type="submit"
        disabled={saving}
        className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
      >
        {saving && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
