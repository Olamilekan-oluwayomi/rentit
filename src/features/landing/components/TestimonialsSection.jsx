/**
 * TestimonialsSection — Fetches and displays recent reviews as community testimonials.
 *
 * Route: Landing page ("/")
 * Responsibilities: Loads up to 6 reviews with comments from Supabase on mount.
 *   Renders each as a card with avatar, rating, and quote. Respects prefers-reduced-motion.
 * Dependencies: supabase (reviews table with reviewer join), design/Avatar + StarRatingInput,
 *   motion for staggered fade-in animations, storage/getAvatarUrl.
 * Important notes: Returns null during loading or when no testimonials available.
 *   Uses a cancelled flag to prevent state updates after unmount.
 */

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { supabase } from "../../../shared/lib/supabase";
import { StarRatingInput, Avatar } from "../../../design";
import { getAvatarUrl } from "../../../utils/storage";

export default function TestimonialsSection() {
  // ── State ────────────────────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, comment, created_at, reviewer:reviewer_id(full_name, avatar_url)")
        .not("comment", "is", null)
        .not("comment", "eq", "")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data && data.length > 0 && !cancelled) {
        setTestimonials(data);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading || testimonials.length === 0) return null;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-6">
          What our community says
        </h2>
        <p className="text-text-secondary text-center max-w-lg mx-auto mb-12">
          Real reviews from people who rent and host on RentIt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const reviewer = t.reviewer;
            const avatarSrc = reviewer?.avatar_url ? getAvatarUrl(reviewer.avatar_url, { width: 40, height: 40 }) : null;

            return (
              <motion.div
                key={t.id}
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                className="bg-surface border border-border rounded-xl p-6 flex flex-col transition-all duration-normal hover:-translate-y-[2px] hover:border-accent/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={avatarSrc} name={reviewer?.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-heading font-semibold text-text-primary">
                      {reviewer?.full_name || "Anonymous"}
                    </p>
                  </div>
                </div>
                <StarRatingInput value={t.rating} readOnly size="sm" className="mb-3" />
                {t.comment && (
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
