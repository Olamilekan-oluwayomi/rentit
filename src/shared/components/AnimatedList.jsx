/**
 * AnimatedList — Staggered entrance animation wrapper for lists.
 *
 * Wraps children in a Motion container that fades and slides each
 * child in with a slight stagger delay. Respects prefers-reduced-motion
 * by disabling animations for users who have that OS setting enabled.
 */

import { motion, useReducedMotion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

/**
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function AnimatedList({ children, className = "" }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedListItem — Individual item wrapper for use inside AnimatedList.
 * Must be a direct child of AnimatedList for stagger to work.
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function AnimatedListItem({ children, className = "" }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
