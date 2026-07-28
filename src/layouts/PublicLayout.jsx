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
| Notes: No profile completion overlay — safe for unauthenticated visitors.
|
|--------------------------------------------------------------------------
*/

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
