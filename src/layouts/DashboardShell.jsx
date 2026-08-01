/*
|--------------------------------------------------------------------------
| DashboardShell.jsx
|--------------------------------------------------------------------------
|
| Full dashboard layout with sidebar navigation, mobile bottom nav,
| and a top header showing the current page title. Handles tab parameter
| redirects (e.g. ?tab=listings → /dashboard/listings). Shows unread
| message badge on the Messages nav item.
|
| Route: /dashboard/*
| Responsibilities: Render sidebar, mobile nav, header, and nested routes via Outlet
| Dependencies: React Router, AuthContext, ProfileContext, useUnreadCount, lucide-react
| Notes: Uses Suspense with DashboardFallback for lazy-loaded sub-routes.
|        Sidebar shows user avatar, name, email, and logout button.
|
|--------------------------------------------------------------------------
*/

import { useState, Suspense, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Home, BarChart3, List, CalendarDays, MessageSquare, Bell, Settings, Menu, X, LogOut, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { useProfileContext } from "../features/profile/context/ProfileContext";
import { useUnreadCount } from "../features/messages/hooks/useUnreadCount";
import { useTheme } from "../shared/contexts/ThemeContext";
import { getAvatarUrl } from "../utils/storage";
import { IconButton } from "../design";
import Logo from "../components/layout/Logo";
import PushOptInBanner from "../features/notifications/components/PushOptInBanner";

const NAV_ITEMS = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/listings", icon: List, label: "My Listings" },
  { to: "/dashboard/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/listings": "My Listings",
  "/dashboard/bookings": "Bookings",
  "/dashboard/messages": "Messages",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
};

const MOBILE_NAV = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/dashboard/listings", icon: List, label: "Listings" },
  { to: "/dashboard/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { to: "/dashboard/settings", icon: Settings, label: "More" },
];

function NavLinkItem({ item, onClick }) {
  const { count: unreadCount } = useUnreadCount();
  const showBadge = item.to === "/dashboard/messages" && unreadCount > 0;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]",
          isActive
            ? "bg-accent/5 text-accent border-l-2 border-accent -ml-px"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-l-2 border-transparent -ml-px",
        ].join(" ")
      }
    >
      <item.icon size={18} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {showBadge && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[9px] font-bold leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfileContext();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigateFn = useNavigate();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      const map = {
        listings: "/dashboard/listings",
        rentals: "/dashboard/bookings",
        requests: "/dashboard/bookings",
        "rented-out": "/dashboard/bookings",
      };
      const target = map[tab];
      if (target) {
        navigateFn(target, { replace: true });
      }
    }
  }, [searchParams, navigateFn]);

  const currentTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path))
  )?.[1] || "Dashboard";

  const avatarSrc = getAvatarUrl(profile?.avatar_url, { width: 40, height: 40 });
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary">
      <header className="shrink-0 flex items-center justify-between h-16 px-4 border-b border-border bg-surface lg:hidden">
        <Logo />
        <IconButton icon={sidebarOpen ? X : Menu} label={sidebarOpen ? "Close menu" : "Open menu"} onClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside aria-label="Dashboard navigation" className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border flex flex-col shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <Logo />
              <IconButton icon={X} label="Close menu" onClick={() => setSidebarOpen(false)} />
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all duration-fast border-l-2 border-transparent -ml-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                <ArrowLeft size={18} className="shrink-0" />
                Back to Browse
              </Link>
              <div className="border-t border-border my-2" />
              {NAV_ITEMS.map((item) => (
                <NavLinkItem key={item.to} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
              <button
                onClick={() => { toggleTheme(); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                  {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]">
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <aside aria-label="Dashboard navigation" className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 bg-surface border-r border-border">
          <div className="flex items-center h-16 px-5 border-b border-border">
            <Logo />
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem key={item.to} item={item} />
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <div className="flex items-center gap-3">
              <NavLink to="/dashboard/settings" className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                  {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
              </NavLink>
            </div>
          </div>
        </aside>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="shrink-0 hidden lg:flex items-center justify-between h-16 px-6 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
              >
                <ArrowLeft size={15} />
                Browse
              </Link>
              <span className="text-text-muted/30">|</span>
              <h1 className="text-lg font-heading font-bold text-text-primary">{currentTitle}</h1>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
              <PushOptInBanner />
              <Suspense fallback={<DashboardFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      <nav className="shrink-0 lg:hidden flex items-center justify-around h-16 border-t border-border bg-surface" aria-label="Dashboard navigation">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
               className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97] ${
                  isActive ? "text-accent" : "text-text-muted"
                }`
              }
            >
              <Icon size={20} />
              <span className="truncate max-w-full">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface-tertiary/60 rounded w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-tertiary/40 rounded-lg" />
        ))}
      </div>
      <div className="h-48 bg-surface-tertiary/40 rounded-lg" />
    </div>
  );
}
