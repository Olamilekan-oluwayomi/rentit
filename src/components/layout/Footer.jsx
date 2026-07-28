/**
 * Footer — Site-wide footer with navigation links.
 *
 * Organized into three columns on desktop: branding, marketplace links,
 * and company links. Collapses to a stacked layout on mobile.
 *
 * Note: Marketplace and Company links point to routes that are planned
 * but not yet built (/how-it-works, /pricing, /about, /contact, /privacy,
 * /terms). They're intentionally kept as forward-looking placeholders
 * rather than removed, since these pages are on the roadmap. Once each
 * route exists, this file doesn't need to change, only the route itself
 * needs to be added in App.jsx.
 *
 * Social links were removed entirely (previously GitHub/Twitter/LinkedIn/
 * email, all pointing to generic non-real URLs). A peer-to-peer rental
 * marketplace shouldn't link out to a personal developer profile, that
 * undercuts the product's own identity. Add real product-owned channels
 * here later if RentIt gets its own social presence.
 */

import { Link } from "react-router-dom";
import Logo from "./Logo";

/** Marketplace-related navigation links. */
const marketplaceLinks = [
  { label: "Browse Listings", to: "/" },
  { label: "Categories", to: "/?category=All" },
  { label: "How it Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
];

/** Company information links. */
const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

/**
 * @returns {JSX.Element} The site-wide footer.
 */
export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          {/* Branding / tagline */}
          <div>
            <Logo className="mb-6" />
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              RentIt helps people rent tools, electronics, vehicles and more safely within their community.
            </p>
          </div>

          {/* Marketplace navigation */}
          <div>
            <h3 id="footer-marketplace-heading" className="font-heading font-semibold text-text-primary mb-6">
              Marketplace
            </h3>
            <ul className="space-y-3" aria-labelledby="footer-marketplace-heading">
              {marketplaceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company navigation */}
          <div>
            <h3 id="footer-company-heading" className="font-heading font-semibold text-text-primary mb-6">
              Company
            </h3>
            <ul className="space-y-3" aria-labelledby="footer-company-heading">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-sm text-text-secondary text-center">
            &copy; 2026 RentIt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}