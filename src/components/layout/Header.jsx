import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive
      ? "text-accent"
      : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
  }`;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user } = useAuth();
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
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Logo />

              <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                <NavLink to="/" end className={navLinkClass}>
                  Browse
                </NavLink>
              </nav>
            </div>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-md mx-8"
              role="search"
            >
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search rentals..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <NavLink
                    to="/listings/new"
                    className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Listing
                  </NavLink>

                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors relative"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>

                  <UserMenu />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <NavLink
                    to="/login"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
