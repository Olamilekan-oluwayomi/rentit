/**
 * Layout — Wrapper component that provides the persistent site shell.
 *
 * Renders the Header at the top, the main content area (which flex-grows
 * to fill available space), and the Footer at the bottom. Every page
 * route is rendered inside this layout via App.jsx.
 *
 * On messaging routes (/booking/:id, /inbox) the Header and Footer are
 * not rendered at all so the chat can occupy the full viewport without
 * fighting against fixed-height chrome.
 */

import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const FULLSCREEN_PATHS = ["/inbox"];

function isFullScreenRoute(pathname) {
  if (FULLSCREEN_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/booking/")) return true;
  return false;
}

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Full-page layout with Header, main content, and Footer.
 */
export default function Layout({ children }) {
  const location = useLocation();
  const fullScreen = isFullScreenRoute(location.pathname);

  if (fullScreen) {
    return (
      <div className="h-screen flex flex-col bg-background text-text-primary overflow-hidden">
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
