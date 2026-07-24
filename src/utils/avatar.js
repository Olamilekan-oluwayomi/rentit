/**
 * Avatar-related utility functions.
 *
 * Pure helpers for validating avatar uploads, deriving display
 * initials from a name, and formatting file sizes for UI labels.
 * No side effects — all functions are stateless.
 */

/** MIME types accepted for avatar uploads */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
/** 10 MB — files above this are rejected before compression */
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates an avatar file before upload.
 * Checks MIME type and file size against the constants above.
 *
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAvatar(file) {
  if (!file) return { valid: false, error: "No file selected." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG and PNG images are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Image must be smaller than 10MB." };
  }
  return { valid: true };
}

/**
 * Extracts initials from a full name (max 2 characters).
 * Used as a fallback when no avatar image is available.
 * Handles multi-word names and collapses to at most two letters.
 *
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formats bytes into a human-readable file size string.
 * Uses base-1024 binary units (KB, MB, GB).
 *
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  // Find the largest unit that doesn't produce a value < 1
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
