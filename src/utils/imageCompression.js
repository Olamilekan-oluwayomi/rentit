/**
 * Image compression and resizing utilities.
 *
 * Pure, reusable functions for reducing image file size before upload.
 * Uses the browser's native Canvas API — no external dependencies.
 */

/**
 * Compresses and resizes an image file using the Canvas API.
 *
 * Scales the image to fit within the target dimensions while maintaining
 * aspect ratio, then re-encodes as JPEG at the specified quality.
 * Useful for avatars, thumbnails, and any upload where the original
 * resolution exceeds what the UI actually needs.
 *
 * @param {File} file - The raw image file selected by the user.
 * @param {object} [options] - Compression options.
 * @param {number} [options.maxWidth=512] - Maximum output width in pixels.
 * @param {number} [options.maxHeight=512] - Maximum output height in pixels.
 * @param {number} [options.quality=0.8] - JPEG quality (0–1).
 * @param {string} [options.outputType="image/jpeg"] - MIME type of the output.
 * @returns {Promise<Blob>} A compressed image Blob ready for upload.
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.8,
    outputType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions that fit within the max bounds
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}
