const FAQS = [
  {
    q: "How does renting work?",
    a: "Browse available items in your area, send a booking request to the owner, and once approved you can coordinate pickup or delivery. After your rental period ends, return the item and the booking is complete.",
  },
  {
    q: "How do I list an item?",
    a: "Create an account, click 'Create Listing', add photos and a description, set your daily price, and publish. Once your listing is live, renters can find it and send you booking requests. You choose whether to approve each request.",
  },
  {
    q: "What if an item is damaged?",
    a: "RentIt does not currently offer damage protection or insurance. Hosts and renters are responsible for resolving damage claims directly. We recommend taking photos of the item before and during the checkout process to document its condition.",
  },
  {
    q: "How do payments work?",
    a: "When a booking request is approved, the system tracks the rental period. Payment processing and payout details are handled separately — the platform manages the booking flow but does not currently hold funds in escrow.",
  },
  {
    q: "Can I cancel a booking?",
    a: "If your booking is still pending, you can cancel it at any time. Once a booking has been approved, cancellations are at the owner's discretion. Contact the owner directly through the booking chat to arrange any changes.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-border">
            {FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between py-5 cursor-pointer list-none text-text-primary hover:text-accent transition-colors">
                  <span className="text-base font-heading font-semibold pr-4">
                    {faq.q}
                  </span>
                  <span className="shrink-0 text-text-muted group-open:rotate-180 transition-transform duration-fast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-5">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
