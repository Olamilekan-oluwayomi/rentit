/**
 * ListingGallery — Responsive image gallery for listing detail pages with lightbox.
 *
 * Route: Listing detail page ("/listings/:id") — hero image area.
 * Responsibilities: Provides responsive layouts: desktop shows a grid of 1-5+ images
 *   (1, 2, 3, or 4+ layout variants), mobile shows a swipeable single-image viewer.
 *   Both views open a full-screen lightbox with keyboard navigation (arrows + Escape).
 * Dependencies: lucide-react icons, storage/getListingImageUrl.
 * Important notes: Desktop layout adapts based on image count (1, 2, 3, or 4+).
 *   Shows "+N more" overlay on the 5th slot when count exceeds 5.
 *   Body scroll locked while lightbox is open via useEffect.
 */

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getListingImageUrl } from "../../../utils/storage";

export default function ListingGallery({ images = [] }) {
  // ── State ────────────────────────────────────────────────────────────
  const urls = images.map((p) => getListingImageUrl(p, { width: 960, height: 540 })).filter(Boolean);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const goNext = useCallback(() => setActive((i) => (i + 1) % urls.length), [urls.length]);
  const goPrev = useCallback(() => setActive((i) => (i - 1 + urls.length) % urls.length), [urls.length]);

  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setLightbox(false);
    },
    [goNext, goPrev]
  );

  // ── Effects ──────────────────────────────────────────────────────────
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

  if (urls.length === 0) {
    return (
      <div className="aspect-[4/3] bg-surface-tertiary/40 rounded-2xl flex items-center justify-center">
        <p className="text-sm text-text-muted">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DesktopGallery urls={urls} onImageClick={(i) => { setActive(i); setLightbox(true); }} />
      </div>

      <div className="md:hidden">
        <MobileGallery urls={urls} active={active} onPrev={goPrev} onNext={goNext} onOpen={() => setLightbox(true)} />
      </div>

      {lightbox && (
        <Lightbox urls={urls} active={active} onClose={() => setLightbox(false)} onPrev={goPrev} onNext={goNext} />
      )}
    </>
  );
}

function DesktopGallery({ urls, onImageClick }) {
  const count = urls.length;

  if (count === 1) {
    return (
      <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => onImageClick(0)}>
        <img src={urls[0]} alt="Listing" className="w-full aspect-[16/9] object-cover" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        <div className="cursor-pointer overflow-hidden" onClick={() => onImageClick(0)}>
          <img src={urls[0]} alt="Listing" className="w-full h-full object-cover" />
        </div>
        <div className="cursor-pointer overflow-hidden" onClick={() => onImageClick(1)}>
          <img src={urls[1]} alt="Listing" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[420px] lg:h-[500px]">
        <div className="cursor-pointer overflow-hidden row-span-2" onClick={() => onImageClick(0)}>
          <img src={urls[0]} alt="Listing" className="w-full h-full object-cover" />
        </div>
        <div className="cursor-pointer overflow-hidden" onClick={() => onImageClick(1)}>
          <img src={urls[1]} alt="Listing" className="w-full h-full object-cover" />
        </div>
        <div className="cursor-pointer overflow-hidden" onClick={() => onImageClick(2)}>
          <img src={urls[2]} alt="Listing" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] lg:h-[500px]">
      <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden relative group" onClick={() => onImageClick(0)}>
        <img src={urls[0]} alt="Listing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      {urls.slice(1, Math.min(5, count)).map((url, i) => (
        <div key={i} className="cursor-pointer overflow-hidden relative group" onClick={() => onImageClick(i + 1)}>
          <img src={url} alt={`Listing ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          {i === 3 && count > 5 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer" onClick={() => onImageClick(4)}>
              <span className="text-white text-sm font-medium">+{count - 5} more</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MobileGallery({ urls, active, onPrev, onNext, onOpen }) {
  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-tertiary/40" onClick={onOpen}>
      <img
        src={urls[active]}
        alt={`Listing ${active + 1}`}
        className="w-full h-full object-cover"
        loading={active === 0 ? "eager" : "lazy"}
      />

      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {active + 1} / {urls.length}
          </div>
        </>
      )}
    </div>
  );
}

function Lightbox({ urls, active, onClose, onPrev, onNext }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" role="dialog" aria-label="Image viewer">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
        aria-label="Close viewer"
      >
        <X size={20} />
      </button>

      <img
        src={urls[active]}
        alt={`Listing ${active + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain"
      />

      {urls.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
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
  );
}
