/*
|--------------------------------------------------------------------------
| PublicLayout.jsx
|--------------------------------------------------------------------------
|
| Layout for unauthenticated public pages like the landing page.
| Renders Navbar, content, and Footer in a full-height flex column.
|
| Route: / (LandingPage), /how-it-works, /pricing, etc.
| Responsibilities: Provide consistent chrome for public/marketing pages
| Dependencies: Navbar, Footer
| Notes: Less feature-rich than AppLayout — no profile completion overlay.
|
|--------------------------------------------------------------------------
*/

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
