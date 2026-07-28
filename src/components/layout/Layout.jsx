/**
 * Layout — Wrapper component that provides the persistent site shell.
 *
 * Renders the Header at the top, the main content area (which flex-grows
 * to fill available space), and the Footer at the bottom. Every page
 * route is rendered inside this layout via App.jsx.
 *
 * On messaging routes (/booking/:id, /inbox) the Footer is omitted so
 * the chat can occupy the full viewport height. The Header stays for
 * navigation.
 */

import { useLocation } from "react-router-dom";
import { useProfileContext } from "../../features/profile/context/ProfileContext";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "../../shared/components/BackToTop";
import ProfileCompletionOverlay from "../../features/profile/components/ProfileCompletionOverlay";
import TermsAcceptanceOverlay from "../../features/profile/components/TermsAcceptanceOverlay";

const NO_FOOTER_PATHS = ["/inbox"];

function hasNoFooter(pathname) {
  if (NO_FOOTER_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/booking/")) return true;
  return false;
}

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Full-page layout with Header, main content, and Footer.
 */
export default function Layout({ children }) {
  const location = useLocation();
  const noFooter = hasNoFooter(location.pathname);
  const { completionVisible, termsOverlayVisible } = useProfileContext();

  return (
    <div className={`${noFooter ? "h-screen" : "min-h-screen"} flex flex-col bg-background text-text-primary`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 min-h-0">{children}</main>
      {!noFooter && <Footer />}
      {completionVisible && <ProfileCompletionOverlay />}
      {termsOverlayVisible && <TermsAcceptanceOverlay />}
      {!noFooter && <BackToTop />}
    </div>
  );
}
