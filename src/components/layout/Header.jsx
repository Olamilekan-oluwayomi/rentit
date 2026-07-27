/**
 * Header — Site-wide sticky header with navigation, search, and user actions.
 *
 * Renders differently based on auth state:
 *   - Logged out: theme toggle, Log In, Sign Up.
 *   - Logged in: theme toggle, notifications, new listing button, UserMenu.
 *
 * On mobile (< md), nav links collapse into the MobileMenu slide-out panel.
 * The search form navigates to the home page with a ?q= query param.
 */

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Sun, Moon, MessageSquare, Plus, Menu } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useUnreadCount } from "../../features/messages/hooks/useUnreadCount";
import { Input, IconButton, Button } from "../../design";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive
      ? "text-accent"
      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
  }`;

/**
 * @returns {JSX.Element} The sticky site header and the MobileMenu overlay.
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: unreadCount } = useUnreadCount();
  const navigate = useNavigate();

  /**
   * Redirects to the home page with the search query in the URL.
   * Empty queries navigate to the bare "/" to clear any previous search.
   * @param {React.FormEvent} e
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <header className="shrink-0 sticky top-0 z-40 bg-surface/80 dark:bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: logo + desktop nav links */}
            <div className="flex items-center gap-8">
              <Logo />

              <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                <NavLink to="/" end className={`${navLinkClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}>
                  Browse
                </NavLink>
              </nav>
            </div>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-md mx-8"
              role="search"
            >
              <Input
                leadingIcon={Search}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search rentals..."
                className="rounded-full"
              />
            </form>

            {/* Right: auth-dependent actions + hamburger */}
            <div className="flex items-center gap-2">
              {user ? (
                /* Logged-in user actions (desktop) */
                <div className="hidden md:flex items-center gap-2">
                  <NavLink to="/listings/new">
                    <Button leftIcon={Plus} size="sm">
                      New Listing
                    </Button>
                  </NavLink>

                  <IconButton
                    icon={theme === "dark" ? Sun : Moon}
                    label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
                    className="animate-spin-in"
                  />

                  <NavLink
                    to="/inbox"
                    aria-label={`Inbox${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                    className="relative"
                  >
                    <IconButton icon={MessageSquare} label="Inbox" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </NavLink>

                  <UserMenu />
                </div>
              ) : (
                /* Logged-out user actions (desktop) */
                <div className="hidden md:flex items-center gap-2">
                  <IconButton
                    icon={theme === "dark" ? Sun : Moon}
                    label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
                    className="animate-spin-in"
                  />
                  <NavLink to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </NavLink>
                  <NavLink to="/register">
                    <Button size="sm">Sign Up</Button>
                  </NavLink>
                </div>
              )}

              <IconButton
                icon={Menu}
                label="Open menu"
                onClick={() => setMobileOpen(true)}
                className="md:hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
