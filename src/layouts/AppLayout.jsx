/*
|--------------------------------------------------------------------------
| AppLayout.jsx
|--------------------------------------------------------------------------
|
| Primary application layout wrapping authenticated (non-dashboard) pages.
| Renders Navbar, main content, and Footer. Shows ProfileCompletionOverlay
| when triggered. Used as a React Router v6 layout route — renders child
| routes via Outlet.
|
| Route: /profile, /listings/new, /listings/:id/edit, /inbox, /booking/:id
| Responsibilities: Provide global Navbar/Footer chrome; profile completion gate
| Dependencies: React Router Outlet, ProfileContext, Navbar, Footer, ProfileCompletionOverlay
| Notes: Dashboard routes are NOT wrapped by this layout — DashboardShell
|        handles its own chrome. Public routes use PublicLayout instead,
|        keeping profile-completion logic off the landing page.
|
|--------------------------------------------------------------------------
*/

import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useProfileContext } from "../features/profile/context/ProfileContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProfileCompletionOverlay from "../features/profile/components/ProfileCompletionOverlay";
import TermsAcceptanceOverlay from "../features/profile/components/TermsAcceptanceOverlay";

const NO_FOOTER_PATHS = ["/inbox"];

function hasNoFooter(pathname) {
  if (NO_FOOTER_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/booking/")) return true;
  return false;
}

export default function AppLayout() {
  const location = useLocation();
  const noFooter = hasNoFooter(location.pathname);
  const { completionVisible, termsOverlayVisible } = useProfileContext();

  return (
    <div className={`${noFooter ? "h-screen" : "min-h-screen"} flex flex-col bg-background text-text-primary`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <Navbar />
      <main className="flex-1 min-h-0" id="main-content">
        <Outlet />
      </main>
      {!noFooter && <Footer />}
      {termsOverlayVisible && <TermsAcceptanceOverlay />}
      {completionVisible && <ProfileCompletionOverlay />}
    </div>
  );
}
