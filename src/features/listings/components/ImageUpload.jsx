/**
 * ImageUpload.jsx
 * ----------------
 * Drag-and-drop image upload component with preview thumbnails.
 * Supports both newly selected images (as File objects) and existing images
 * (as Supabase storage paths). Handles file validation (type + size limits),
 * object URL lifecycle management, and slot-based max image enforcement.
 */
import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { getListingImageUrl } from "../../../utils/storage";

// ── Upload Constraints ─────────────────────────────────────────────
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file — matches Supabase storage limits
const ACCEPT = { "image/jpeg": [], "image/png": [], "image/webp": [] };

/**
 * Drag-and-drop image upload with preview thumbnails.
 * Manages two separate image sets: existing (stored remotely) and new (local Files).
 * The `maxImages` prop enforces a total cap across both sets.
 * @param {{ images: File[], existingImages: string[], onImagesChange: (files: File[]) => void, onExistingRemove: (path: string) => void, maxImages: number, uploading: boolean }} props
 */
export default function ImageUpload({
  images = [],
  existingImages = [],
  onImagesChange,
  onExistingRemove,
  maxImages = MAX_FILES,
  uploading = false,
}) {
  // Calculate how many new images can still be added (maxImages minus already-used slots).
  const totalSlots = maxImages - existingImages.length;
  const canAddMore = images.length < totalSlots;

  // Memoize object URLs so we only create new ones when the File array changes.
  // This prevents re-creating URLs on every render, which would be wasteful.
  const previews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  // Revoke object URLs on cleanup to prevent memory leaks.
  // Without this, each File's blob URL would persist in memory even after removal.
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Callback for react-dropzone — slices accepted files to fit remaining slots.
  // Prevents exceeding the image cap even if dropzone allows more files.
  const onDrop = useCallback(
    (acceptedFiles) => {
      const remaining = totalSlots - images.length;
      if (remaining <= 0) return;
      const toAdd = acceptedFiles.slice(0, remaining);
      onImagesChange([...images, ...toAdd]);
    },
    [images, totalSlots, onImagesChange]
  );

  // Configure dropzone with type/size constraints and slot awareness.
  // Disabling when uploading prevents adding files mid-submission.
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
      maxFiles: Math.max(totalSlots, 0),
      disabled: uploading || !canAddMore,
    });

  /** Removes a newly-selected image by index from the local array. */
  const removeNew = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* ── Drop Zone ─────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-accent bg-accent/5"
            : "border-gray-300 dark:border-white/15 hover:border-accent/50"
        } ${uploading || !canAddMore ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
          <p className="text-sm text-text-secondary">
            {isDragActive
              ? "Drop images here..."
              : "Drag & drop images, or click to browse"}
          </p>
          {/* Shows current usage: existing + new out of max */}
          <p className="text-xs text-text-secondary">
            JPEG, PNG, WEBP up to 5MB ({existingImages.length + images.length}/{maxImages})
          </p>
        </div>
      </div>

      {/* ── File Rejection Errors ─────────────────────────────── */}
      {fileRejections.length > 0 && (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name} className="text-xs text-red-500">
              {file.name}: {errors.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* ── Existing Image Thumbnails (from Supabase storage) ──── */}
      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {existingImages.map((path, i) => (
            <div
              key={`existing-${i}`}
              className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10"
            >
              <img
                src={getListingImageUrl(path)}
                alt={`Existing ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Remove button — visible on hover for desktop, always accessible */}
              <button
                type="button"
                onClick={() => onExistingRemove(path)}
                disabled={uploading}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── New Image Thumbnails (locally selected Files) ──────── */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((file, i) => (
            <div
              key={`new-${i}-${file.name}`}
              className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10"
            >
              <img
                src={previews[i]}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                disabled={uploading}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
