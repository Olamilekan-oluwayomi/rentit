/*
|--------------------------------------------------------------------------
| MobileNav.jsx
|--------------------------------------------------------------------------
|
| Slide-in navigation drawer for mobile viewports. Triggered by hamburger
| menu in Navbar. Shows user info, navigation links (Home, Profile,
| New Listing, Dashboard, My Listings, Messages), and login/logout area.
| Locks body scroll while open and supports Escape key dismissal.
|
| Route: N/A (overlay rendered inside Navbar)
| Responsibilities: Provide mobile-friendly navigation; prevent body scroll while open
| Dependencies: React Router, AuthContext, ProfileContext, useUnreadCount
| Notes: Visible at lg breakpoint and below. Uses slide-in from right.
|
|--------------------------------------------------------------------------
*/

import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, Home, User, Plus, LayoutDashboard, Mail, Heart, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useProfileContext } from "../features/profile/context/ProfileContext";
import { useUnreadCount } from "../features/messages/hooks/useUnreadCount";
import { useTheme } from "../shared/contexts/ThemeContext";
import { getAvatarUrl } from "../utils/storage";
import { Button, IconButton } from "../design";
import Logo from "../components/layout/Logo";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent/10 text-accent"
      : "text-text-primary hover:bg-surface-secondary"
  }`;

export default function MobileNav({ open, onClose }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfileContext();
  const { count: unreadCount } = useUnreadCount();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const avatarSrc = getAvatarUrl(profile?.avatar_url, { width: 32, height: 32 });

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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  const handleNavClick = () => onClose();

  const initials = (profile?.full_name || user?.user_metadata?.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-normal lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-surface z-50 shadow-xl transform transition-transform duration-normal ease lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo />
          <IconButton icon={X} label="Close menu" onClick={onClose} />
        </div>

        {user && (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1">
          <NavLink to="/" end className={navLinkClass} onClick={handleNavClick}>
            <Home size={20} />
            Home
          </NavLink>
          {user && (
            <NavLink to="/profile" className={navLinkClass} onClick={handleNavClick}>
              <User size={20} />
              My Profile
            </NavLink>
          )}
          {user && (
            <NavLink to="/listings/new" className={navLinkClass} onClick={handleNavClick}>
              <Plus size={20} />
              New Listing
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard" end className={navLinkClass} onClick={handleNavClick}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard/listings" className={navLinkClass} onClick={handleNavClick}>
              <LayoutDashboard size={20} />
              My Listings
            </NavLink>
          )}
          {user && (
            <NavLink to="/inbox" className={navLinkClass} onClick={handleNavClick}>
              <Mail size={20} />
              Messages
            </NavLink>
          )}
          {user && (
            <NavLink to="/favorites" className={navLinkClass} onClick={handleNavClick}>
              <Heart size={20} />
              Saved
            </NavLink>
          )}
        </nav>

        <div className="px-4 pb-2">
          <button
            onClick={() => { toggleTheme(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-text-primary hover:bg-surface-secondary"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          {user ? (
            <Button
              variant="danger"
              leftIcon={LogOut}
              onClick={handleLogout}
              fullWidth
            >
              Log Out
            </Button>
          ) : (
            <div className="space-y-2">
              <NavLink to="/login" onClick={handleNavClick}>
                <Button variant="outline" fullWidth>Log In</Button>
              </NavLink>
              <NavLink to="/register" onClick={handleNavClick}>
                <Button fullWidth>Sign Up</Button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
