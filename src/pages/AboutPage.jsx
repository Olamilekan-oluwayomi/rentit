/*
|--------------------------------------------------------------------------
| AboutPage.jsx
|--------------------------------------------------------------------------
|
| About page for RentIt — explains what the platform is, how it works,
| and why it matters. Uses real categories from the app and existing
| design system components only.
|
| Route: /about (public, under PublicLayout)
| Responsibilities: Brand story, value proposition, CTA to browse/host
| Dependencies: Button, Container from design system, lucide-react icons,
|               React Router Link
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { Search, List, CalendarCheck, Banknote, Wrench, Monitor, Camera, Gamepad2, Music, Mountain, Car, PartyPopper } from "lucide-react";
import { Button, Container } from "../design";
import FadeInSection from "../shared/components/FadeInSection";

const CATEGORY_INFO = [
  { icon: Wrench, label: "Tools" },
  { icon: Camera, label: "Cameras & Photography" },
  { icon: Monitor, label: "Electronics" },
  { icon: Music, label: "Musical Instruments" },
  { icon: Mountain, label: "Sports & Outdoors" },
  { icon: Car, label: "Vehicles" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: PartyPopper, label: "Party & Events" },
];

const STEPS = [
  {
    icon: List,
    title: "List your items",
    description: "Upload photos, write a description, set your daily price and availability. It takes minutes to get started.",
  },
  {
    icon: Search,
    title: "Browse and book",
    description: "Find what you need by category, location, or search. Send a booking request to the owner.",
  },
  {
    icon: CalendarCheck,
    title: "Coordinate and use",
    description: "Once approved, arrange pickup or delivery. Use the item for the duration of your booking.",
  },
  {
    icon: Banknote,
    title: "Return and earn",
    description: "Renters return the item on time. Hosts get paid for every day their item is rented.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-14 lg:pt-24 pb-16 lg:pb-24">
        <Container className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-[1.05] tracking-tight mb-6">
            Most items sit unused.
            <br />
            <span className="text-accent">RentIt changes that.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            RentIt is a peer-to-peer rental marketplace where people list the items they own
            and others browse, book, and rent them. The drill in your garage, the camera you
            use twice a year, the bike gathering dust — they can all earn money instead of
            taking up space.
          </p>
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <FadeInSection>
        <section className="py-16 lg:py-20 bg-surface-secondary/30">
          <Container>
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary text-center max-w-md mx-auto mb-14">
              From listing to earning, from searching to using — four steps, no middlemen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/5 border-2 border-accent/20 flex items-center justify-center mx-auto mb-5">
                      <span className="text-lg font-heading font-bold text-accent leading-none">{i + 1}</span>
                    </div>
                    <h3 className="text-base font-heading font-semibold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* ── What you can rent ─────────────────────────────────────── */}
      <FadeInSection>
        <section className="py-16 lg:py-20">
          <Container>
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-4">
              What You Can Rent
            </h2>
            <p className="text-text-secondary text-center max-w-lg mx-auto mb-12">
              RentIt covers the categories where ownership is expensive but usage is occasional.
              If you only need it sometimes, why buy it?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {CATEGORY_INFO.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-surface border border-border rounded-lg p-5 flex flex-col items-center text-center gap-3"
                >
                  <Icon size={22} className="text-sage" />
                  <span className="text-sm font-medium text-text-primary">{label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* ── Why it matters ────────────────────────────────────────── */}
      <FadeInSection>
        <section className="py-16 lg:py-20 bg-surface-secondary/30">
          <Container className="max-w-3xl">
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-12">
              Why It Matters
            </h2>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-heading font-semibold text-text-primary mb-1">Save money on things you rarely use</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    A power drill costs $150 to buy but might cost $12/day to rent. A DSLR camera, a kayak, a
                    trailer — accessing gear when you need it shouldn't require a major purchase.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-heading font-semibold text-text-primary mb-1">Reduce waste by sharing what you own</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    The average power drill is used for 13 minutes in its entire lifetime. When items are shared
                    instead of individually owned, fewer products get manufactured and less ends up in landfills.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-heading font-semibold text-text-primary mb-1">Earn from what you already own</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Your idle tools, cameras, and vehicles can generate income every day. List them on RentIt,
                    set your own price and availability, and get paid for every day someone rents them.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <FadeInSection>
        <section className="py-16 lg:py-20">
          <Container className="max-w-2xl text-center">
            <h2 className="text-3xl font-heading font-bold text-text-primary mb-4">
              Ready to get started?
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Browse thousands of items available for rent in your area, or list your own and start earning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button size="lg">Browse Listings</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Become a Host</Button>
              </Link>
            </div>
          </Container>
        </section>
      </FadeInSection>
    </div>
  );
}
