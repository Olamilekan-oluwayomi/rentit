/*
|--------------------------------------------------------------------------
| Navbar.jsx
|--------------------------------------------------------------------------
|
| Sticky top navigation bar. Logo, desktop search form, theme toggle,
| user menu / auth buttons, and "New Listing" CTA. Renders MobileNav
| drawer for small screens. Search navigates to /?q=<query>.
|
| Route: Rendered on all pages using AppLayout or PublicLayout
| Responsibilities: Global navigation, search, auth controls, theme toggle
| Dependencies: React Router, AuthContext, ThemeContext, useUnreadCount, UserMenu, MobileNav
| Notes: Sticky with backdrop-blur. Unread count badge on inbox bell.
|
|--------------------------------------------------------------------------
*/

import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { Search, Sun, Moon, Bell, Plus, Menu } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useTheme } from "../shared/contexts/ThemeContext";
import { useUnreadCount } from "../features/messages/hooks/useUnreadCount";
import { Input, IconButton, Button } from "../design";
import Logo from "../components/layout/Logo";
import UserMenu from "../components/layout/UserMenu";
import MobileNav from "./MobileNav";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive
      ? "text-accent"
      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
  }`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: unreadCount } = useUnreadCount();
  const navigate = useNavigate();

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
      <header className="shrink-0 sticky top-0 z-40 bg-background/85 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center gap-10">
              <Logo />
              <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                <NavLink to="/" end className={navLinkClass}>
                  Browse
                </NavLink>
              </nav>
            </div>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-sm mx-10"
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

            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/listings/new">
                    <Button leftIcon={Plus} size="sm">
                      New Listing
                    </Button>
                  </Link>
                  <IconButton
                    icon={theme === "dark" ? Sun : Moon}
                    label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
                  />
                  <Link to="/inbox" aria-label={`Inbox${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`} className="relative">
                    <IconButton icon={Bell} label="Inbox" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <IconButton
                    icon={theme === "dark" ? Sun : Moon}
                    label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
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
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
