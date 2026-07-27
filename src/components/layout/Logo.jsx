/**
 * Logo — Renders the RentIt brand mark as a link back to the home page.
 *
 * Consists of an accent-colored icon box and the "RentIt" wordmark.
 * Accepts an optional className for layout flexibility when used in
 * different contexts (header, footer).
 *
 * @param {Object} props
 * @param {string} [props.className=""] - Additional CSS classes to apply to the link wrapper.
 * @returns {JSX.Element} The branded logo link.
 */

import { Link } from "react-router-dom";

/**
 * @param {{ className?: string }} props
 * @returns {JSX.Element} The RentIt logo linking to the home page.
 */
export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="RentIt Home">
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <span className="font-heading font-bold text-2xl text-text-primary">
        Rent<span className="text-accent">It</span>
      </span>
    </Link>
  );
}
