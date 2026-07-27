import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { StarRatingInput, Avatar } from "../../../design";
import { getAvatarUrl } from "../../../utils/storage";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {testimonials.map((t) => {
            const reviewer = t.reviewer;
            const avatarSrc = reviewer?.avatar_url ? getAvatarUrl(reviewer.avatar_url) : null;

            return (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-xl p-6 flex flex-col"
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
