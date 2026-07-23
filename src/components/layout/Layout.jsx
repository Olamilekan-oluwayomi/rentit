/**
 * Layout — Wrapper component that provides the persistent site shell.
 *
 * Renders the Header at the top, the main content area (which flex-grows
 * to fill available space), and the Footer at the bottom. Every page
 * route is rendered inside this layout via App.jsx.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render between Header and Footer.
 * @returns {JSX.Element} The full-page layout shell.
 */

import Header from "./Header";
import Footer from "./Footer";

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Full-page layout with Header, main content, and Footer.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
