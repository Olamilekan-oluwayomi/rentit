/*
|--------------------------------------------------------------------------
| AppLayout.jsx
|--------------------------------------------------------------------------
|
| Primary application layout wrapping most authenticated pages. Renders Navbar,
| main content, and Footer. Suppresses Footer on /inbox and /booking/:id routes.
| Passes through dashboard routes unwrapped (DashboardShell handles its own chrome).
| Shows ProfileCompletionOverlay when triggered.
|
| Route: All pages except /login, /register, /dashboard/*
| Responsibilities: Provide global Navbar/Footer chrome; profile completion gate
| Dependencies: React Router, ProfileContext, Navbar, Footer, ProfileCompletionOverlay
| Notes: Dashboard routes short-circuit to render children directly.
|
|--------------------------------------------------------------------------
*/

import { useLocation } from "react-router-dom";
import { useProfileContext } from "../features/profile/context/ProfileContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProfileCompletionOverlay from "../features/profile/components/ProfileCompletionOverlay";

const NO_FOOTER_PATHS = ["/inbox"];

function hasNoFooter(pathname) {
  if (NO_FOOTER_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/booking/")) return true;
  return false;
}

function isDashboardRoute(pathname) {
  return pathname.startsWith("/dashboard");
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const noFooter = hasNoFooter(location.pathname);
  const dashboard = isDashboardRoute(location.pathname);
  const { completionVisible } = useProfileContext();

  if (dashboard) {
    return <>{children}</>;
  }

  return (
    <div className={`${noFooter ? "h-screen" : "min-h-screen"} flex flex-col bg-background text-text-primary`}>
      <Navbar />
      <main className="flex-1 min-h-0" id="main-content">
        {children}
      </main>
      {!noFooter && <Footer />}
      {completionVisible && <ProfileCompletionOverlay />}
    </div>
  );
}
