/*
|--------------------------------------------------------------------------
| PublicLayout.jsx
|--------------------------------------------------------------------------
|
| Layout for unauthenticated public pages like the landing page.
| Renders Navbar, content, and Footer in a full-height flex column.
| Used as a React Router v6 layout route — renders child routes via Outlet.
|
| Route: / (LandingPage), /about, /contact, /pricing, etc.
| Responsibilities: Provide consistent chrome for public/marketing pages
| Dependencies: Navbar, Footer, React Router Outlet
| Notes: Injects the skip-to-content link for the <main id="main-content">
|   target. Profile completion / terms overlays appear for signed-in users
|   whose profile is incomplete; both self-gate on auth state, so this layout
|   is also used for the catch-all 404 route.
|
|--------------------------------------------------------------------------
*/

import { Outlet } from "react-router-dom";
import { useProfileContext } from "../features/profile/context/ProfileContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProfileCompletionOverlay from "../features/profile/components/ProfileCompletionOverlay";
import TermsAcceptanceOverlay from "../features/profile/components/TermsAcceptanceOverlay";

export default function PublicLayout() {
  const { completionVisible, termsOverlayVisible } = useProfileContext();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <Navbar />
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
      {completionVisible && <ProfileCompletionOverlay />}
      {termsOverlayVisible && <TermsAcceptanceOverlay />}
    </div>
  );
}
