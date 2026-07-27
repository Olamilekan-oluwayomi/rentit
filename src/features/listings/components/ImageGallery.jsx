/**
 * ImageGallery.jsx
 * -----------------
 * Full-featured image gallery with a hero image, thumbnail strip, and lightbox.
 * Supports keyboard navigation (arrow keys + Escape) and prevents body scroll
 * when the lightbox is open. Used on listing detail pages to showcase item images.
 *
 * Route: Listing detail page ("/listings/:id")
 * Responsibilities: Displays images with hero + thumbnail navigation, full-screen lightbox
 *   overlay with keyboard nav, image counter, and responsive empty state.
 * Dependencies: lucide-react icons, storage/getListingImageUrl.
 * Important notes: Uses useCallback for navigation functions to avoid unnecessary
 *   re-renders of the keyboard event listener. Body scroll is locked while lightbox is open.
 */
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getListingImageUrl } from "../../../utils/storage";

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const urls = images.map(getListingImageUrl).filter(Boolean);
  const hasImages = urls.length > 0;

  // ── Navigation Callbacks ──────────────────────────────────────────
  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % urls.length);
  }, [urls.length]);

  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + urls.length) % urls.length);
  }, [urls.length]);

  // ── Keyboard Navigation ───────────────────────────────────────────
  // Only active while lightbox is open to avoid interfering with page-level shortcuts.
  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % urls.length);
      else if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + urls.length) % urls.length);
      else if (e.key === "Escape") setLightbox(false);
    },
    [urls.length]
  );

  // Lock body scroll while lightbox is open to prevent background scrolling underneath the overlay.
  useEffect(() => {
    if (lightbox) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, handleKey]);

  if (!hasImages) {
    return (
      <div className="aspect-video bg-surface-secondary rounded-2xl flex items-center justify-center">
        <p className="text-sm text-text-secondary">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Main Gallery ─────────────────────────────────────── */}
      <div className="space-y-3">
        {/* ── Hero Image ───────────────────────────────────── */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in bg-surface-secondary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          aria-label="Open image viewer"
          onKeyDown={(e) => e.key === "Enter" && setLightbox(true)}
        >
          <img
            src={urls[active]}
            alt={`Listing image ${active + 1}`}
            className="w-full h-full object-cover"
            // First image is eager-loaded for LCP; others are lazy-loaded for performance.
            loading={active === 0 ? "eager" : "lazy"}
          />

          {/* stopPropagation prevents the click from also opening the lightbox */}
          {urls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  // stopPropagation prevents the click from also opening the lightbox.
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {active + 1} / {urls.length}
          </div>
        </div>

        {/* ── Thumbnail Strip ─────────────────────────────────── */}
        {urls.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  i === active
                    ? "border-accent ring-1 ring-accent"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox Overlay ──────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          role="dialog"
          aria-label="Image viewer"
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Close viewer"
          >
            <X size={20} />
          </button>
          <img
            src={urls[active]}
            alt={`Listing image ${active + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />

          {urls.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
            {active + 1} / {urls.length}
          </div>
        </div>
      )}
    </>
  );
}
