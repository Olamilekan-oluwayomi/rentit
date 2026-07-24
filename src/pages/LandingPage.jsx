/**
 * LandingPage — Marketing landing page shown to logged-out visitors.
 *
 * Displays a hero section with a call-to-action and a brief
 * "how it works" feature overview. Auth-aware routing in App.jsx
 * decides whether to show this page or the browse listings HomePage
 * at the root "/" route.
 */

import { Link } from "react-router-dom";
import { Search, Package, CalendarDays, LayoutDashboard } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "List Your Items",
    description:
      "Own something others could use? List it in minutes with photos, pricing, and availability.",
  },
  {
    icon: Search,
    title: "Browse & Book",
    description:
      "Find exactly what you need — search by category, location, or price and request to book instantly.",
  },
  {
    icon: CalendarDays,
    title: "Manage Availability",
    description:
      "Set your schedule, block dates, and approve or decline booking requests on your terms.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard at a Glance",
    description:
      "Track rentals, earnings, and pending requests all in one place.",
  },
];

/**
 * @returns {JSX.Element} The landing page for logged-out visitors.
 */
export default function LandingPage() {
  return (
    <div className="bg-background">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
            Rent what you need.
            <br />
            <span className="text-accent">Earn from what you own.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-body">
            RentIt is a peer-to-peer marketplace where people list items they
            own and others browse, book, and rent them — all managed from one
            simple dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Get Started — It's Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-white/90 hover:text-white px-8 py-3 rounded-lg font-medium text-lg border border-white/20 hover:border-white/40 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary text-center mb-4">
          How It Works
        </h2>
        <p className="text-text-secondary text-center max-w-lg mx-auto mb-12">
          Four simple steps from sign-up to your first rental.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="bg-surface border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div className="text-xs font-medium text-text-secondary mb-2">
                Step {i + 1}
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="bg-surface border-t border-gray-100 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-4">
            Ready to start renting?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Create a free account in seconds and list your first item or browse
            what's available near you.
          </p>
          <Link
            to="/register"
            className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
