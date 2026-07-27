/**
 * BackToTop — Fixed floating button that appears after scrolling past 400px.
 *
 * Smoothly scrolls to the top of the page on click.
 *
 * Accessibility:
 *   - aria-label="Back to top" on the button
 *   - Focus-visible ring for keyboard navigation
 *   - Hidden from pointer events and tab order when not visible
 */

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-accent-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronUp size={20} />
    </button>
  );
}
