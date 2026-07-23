const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Validates an avatar file before upload.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAvatar(file) {
  if (!file) return { valid: false, error: "No file selected." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG and PNG images are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Image must be smaller than 2MB." };
  }
  return { valid: true };
}

/**
 * Extracts initials from a full name (max 2 characters).
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
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
