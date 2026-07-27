/**
 * FadeInSection — Scroll-triggered fade-in + vertical slide animation wrapper.
 *
 * Disables animation for users who prefer reduced motion.
 *
 * Usage:
 *   <FadeInSection>Animated content</FadeInSection>
 *
 * Accessibility:
 *   - Respects prefers-reduced-motion via useReducedMotion()
 *   - Falls back to a plain <div> when reduced motion is preferred
 */

import { motion, useReducedMotion } from "motion/react";

export default function FadeInSection({ children, className = "" }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
