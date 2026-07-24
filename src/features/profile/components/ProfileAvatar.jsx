/**
 * ProfileAvatar — Uploadable user avatar with hover overlay and fallback initials.
 *
 * Displays the user's avatar image or their initials as a fallback.
 * On hover, a camera overlay appears that triggers a hidden file input.
 * Supports upload and delete actions, with inline loading and error states.
 *
 * @param {Object} props
 * @param {string|null} props.avatarUrl - The storage path of the current avatar image.
 * @param {boolean} props.uploading - Whether an upload is currently in progress.
 * @param {(file: File|null, error?: string) => void} props.onUpload - Callback to handle file upload or validation error.
 * @param {() => void} props.onDelete - Callback to remove the current avatar.
 * @param {string|null} props.error - Validation/server error message to display.
 * @returns {JSX.Element} The avatar circle with overlay and action buttons.
 */

import { useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { getAvatarUrl } from "../../../utils/storage";
import { getInitials, validateAvatar } from "../../../utils/avatar";

/**
 * @param {{ avatarUrl: string|null, uploading: boolean, onUpload: (file: File|null, error?: string) => void, onDelete: () => void, error: string|null }} props
 * @returns {JSX.Element} The profile avatar component.
 */
export default function ProfileAvatar({
  avatarUrl,
  uploading,
  onUpload,
  onDelete,
  error,
}) {
  const { user } = useAuth();
  const inputRef = useRef(null);

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = getInitials(displayName);
  const avatarSrc = getAvatarUrl(avatarUrl);

  /**
   * Validates the selected file client-side before passing it to the parent.
   * If invalid, the error is bubbled up via onUpload(null, error).
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatar(file);
    if (!validation.valid) {
      onUpload(null, validation.error);
      return;
    }

    onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center lg:items-start">
      {/* Avatar circle with hover-to-upload overlay */}
      <div className="relative group">
        <div className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full overflow-hidden bg-accent/10 flex items-center justify-center border-4 border-surface shadow-lg">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${displayName}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-accent font-heading font-bold text-3xl lg:text-4xl select-none">
              {initials}
            </span>
          )}
        </div>

        {/* Hover overlay — triggers the hidden file input on click */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
          aria-label="Change photo"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hidden file input — triggered programmatically by the overlay and action buttons */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Text-based action buttons below the avatar */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-accent hover:underline font-medium disabled:opacity-50"
        >
          {avatarSrc ? "Change Photo" : "Upload Photo"}
        </button>

        {avatarSrc && (
          <button
            onClick={onDelete}
            disabled={uploading}
            className="text-sm text-red-500 hover:underline font-medium disabled:opacity-50"
          >
            Remove Photo
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-xs text-text-secondary mt-2">Uploading...</p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
