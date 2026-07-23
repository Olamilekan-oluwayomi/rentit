import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { getListingImageUrl } from "../../utils/storage";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = { "image/jpeg": [], "image/png": [], "image/webp": [] };

/**
 * Drag-and-drop image upload with preview thumbnails.
 * @param {{ images: File[], existingImages: string[], onImagesChange, onExistingRemove, maxImages, uploading }}
 */
export default function ImageUpload({
  images = [],
  existingImages = [],
  onImagesChange,
  onExistingRemove,
  maxImages = MAX_FILES,
  uploading = false,
}) {
  const totalSlots = maxImages - existingImages.length;
  const canAddMore = images.length < totalSlots;

  // Create object URLs once per images array change, and revoke old ones on cleanup.
  const previews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const remaining = totalSlots - images.length;
      if (remaining <= 0) return;
      const toAdd = acceptedFiles.slice(0, remaining);
      onImagesChange([...images, ...toAdd]);
    },
    [images, totalSlots, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
      maxFiles: Math.max(totalSlots, 0),
      disabled: uploading || !canAddMore,
    });

  const removeNew = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
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
          <p className="text-xs text-text-secondary">
            JPEG, PNG, WEBP up to 5MB ({existingImages.length + images.length}/{maxImages})
          </p>
        </div>
      </div>

      {/* Validation errors */}
      {fileRejections.length > 0 && (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name} className="text-xs text-red-500">
              {file.name}: {errors.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* Existing image previews */}
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

      {/* New image previews */}
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