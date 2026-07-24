/**
 * MobileMenu — Slide-out navigation drawer for mobile and tablet viewports.
 *
 * Opens from the right side when the hamburger icon in Header is tapped.
 * Includes user avatar/name (when logged in), navigation links, and
 * auth actions (login/signup or logout).
 *
 * Two side-effects are managed:
 *   - Body scroll is locked while the menu is open.
 *   - The Escape key closes the menu for keyboard accessibility.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the menu is currently visible.
 * @param {() => void} props.onClose - Callback to close the menu.
 * @returns {JSX.Element} The overlay + slide-out panel.
 */

import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useProfileContext } from "../../features/profile/context/ProfileContext";
import { getAvatarUrl } from "../../utils/storage";
import Logo from "./Logo";

/** Tailwind classes for mobile nav links, with active state highlighting. */
const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent/10 text-accent"
      : "text-text-primary hover:bg-gray-100 dark:hover:bg-white/10"
  }`;

/**
 * @param {{ open: boolean, onClose: () => void }} props
 * @returns {JSX.Element} The mobile menu overlay and panel.
 */
export default function MobileMenu({ open, onClose }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfileContext();
  const navigate = useNavigate();
  const avatarSrc = getAvatarUrl(profile?.avatar_url);

  // Lock body scroll when the menu is open so the background doesn't scroll.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key for keyboard accessibility.
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  /** Signs the user out, closes the menu, and redirects to home. */
  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  /** Closes the menu when any nav link is clicked. */
  const handleNavClick = () => onClose();

  return (
    <>
      {/* Semi-transparent backdrop — fades in/out, only visible on screens < lg */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-surface z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Panel header with logo and close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <Logo />
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info section — only visible when logged in */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`${profile?.full_name || user?.user_metadata?.full_name || "User"}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Fall back to initials when no avatar is set */
                  profile?.full_name || user?.user_metadata?.full_name
                    ? (profile?.full_name || user.user_metadata.full_name)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : user?.email?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          <NavLink to="/" end className={navLinkClass} onClick={handleNavClick}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NavLink>

          {user && (
            <NavLink
              to="/profile"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/listings/new"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Listing
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Bottom-pinned auth actions (logout or login/signup) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-white/10">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          ) : (
            <div className="space-y-2">
              <NavLink
                to="/login"
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/20 text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                onClick={handleNavClick}
              >
                Log In
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
                onClick={handleNavClick}
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
