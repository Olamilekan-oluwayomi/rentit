/**
 * StarRatingInput — Interactive star rating with keyboard-navigation support.
 *
 * @value     Current rating (0–5; supports half-stars for read-only display)
 * @onChange  Called with the new rating value on click or Enter/Space
 * @readOnly  Display-only mode with half-star support
 * @size      "sm" | "md" | "lg"
 *
 * Usage:
 *   <StarRatingInput value={rating} onChange={setRating} />
 *   <StarRatingInput value={4} readOnly />
 *
 * Accessibility:
 *   - role="radiogroup" in interactive mode, role="img" in read-only
 *   - Keyboard navigation: ArrowLeft / ArrowRight to adjust value
 *   - Each star is a radio button with aria-label and aria-checked
 *   - aria-label on the group describes current rating
 */

import { useState, useCallback, useId } from "react";

// ==== Star SVG path ====

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarIcon({ fill, className = "" }) {
  return (
    <svg
      className={["w-5 h-5 shrink-0", className].join(" ")}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill !== "none" ? "none" : "var(--color-border)"}
      strokeWidth={fill !== "none" ? 0 : 1.5}
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export function StarRatingInput({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className = "",
}) {
  const [hovered, setHovered] = useState(0);
  const id = useId();

  const displayValue = readOnly ? value : (hovered || value);
  const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  const handleKeyDown = useCallback(
    (e) => {
      if (readOnly || !onChange) return;
      let newVal = hovered || value;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        newVal = Math.min(5, newVal + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        newVal = Math.max(1, newVal - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(newVal);
        return;
      } else {
        return;
      }
      setHovered(newVal);
    },
    [readOnly, onChange, hovered, value]
  );

  const handleBlur = useCallback(() => {
    setHovered(0);
  }, []);

  const getStarFill = (starIndex) => {
    if (readOnly) {
      const diff = displayValue - starIndex + 1;
      if (diff >= 1) return "var(--color-accent)";
      if (diff >= 0.5) return "partial";
      return "none";
    }
    if (starIndex <= displayValue) return "var(--color-accent)";
    return "none";
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-0.5",
        readOnly ? "" : "cursor-pointer",
        className,
      ].join(" ")}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={
        readOnly
          ? `${value} out of 5 stars`
          : `Rating: ${hovered || value} out of 5 stars. Use arrow keys to adjust.`
      }
      aria-roledescription={readOnly ? undefined : "star rating"}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getStarFill(star);

        if (fill === "partial") {
          return (
            <span key={star} className={starSize}>
              <svg className={["w-full h-full", starSize].join(" ")} viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <clipPath id={`${id}-half-${star}`}>
                    <rect x="0" y="0" width="12" height="24" />
                  </clipPath>
                </defs>
                <path d={STAR_PATH} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
                <path d={STAR_PATH} fill="var(--color-accent)" clipPath={`url(#${id}-half-${star})`} />
              </svg>
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={[
              starSize,
              "flex items-center justify-center p-0 border-0 bg-transparent",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform duration-fast ease",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
            ].join(" ")}
            role={readOnly ? undefined : "radio"}
            aria-label={readOnly ? undefined : `${star} star${star > 1 ? "s" : ""}`}
            aria-checked={readOnly ? undefined : star === value}
            tabIndex={readOnly ? -1 : -1}
          >
            <StarIcon fill={fill} className={starSize} />
          </button>
        );
      })}
    </div>
  );
}

export { StarRatingInput as default };
