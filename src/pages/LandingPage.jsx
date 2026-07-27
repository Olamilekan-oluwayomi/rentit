/*
|--------------------------------------------------------------------------
| LandingPage.jsx
|--------------------------------------------------------------------------
|
| Marketing/public landing page shown to unauthenticated visitors.
| Sections: Hero with search, Trust Bar stats, Popular Categories,
| Featured Rentals, How It Works, Why Rent, Become a Host,
| Testimonials, FAQ, Final CTA. Most CTAs point to /register.
|
| Route: / (when user is not authenticated, typically via PublicLayout)
| Responsibilities: Convert visitors into registered users
| Dependencies: useLandingStats, useCategoryCounts, supabase direct queries, Framer Motion
| Notes: Hero and featured listings fetched directly via supabase (not useListings).
|        All browse/host CTAs lead to registration.
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Wrench, Monitor, Camera, Gamepad2, Music, Mountain, Car } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { supabase } from "../shared/lib/supabase";
import { useLandingStats } from "../features/landing/hooks/useLandingStats";
import { useCategoryCounts } from "../features/landing/hooks/useCategoryCounts";
import { CATEGORIES } from "../shared/lib/constants";
import { Button, Badge, Avatar, StarRatingInput } from "../design";
import { getListingImageUrl, getAvatarUrl } from "../utils/storage";
import FadeInSection from "../shared/components/FadeInSection";
import TestimonialsSection from "../features/landing/components/TestimonialsSection";
import FAQSection from "../features/landing/components/FAQSection";

const CATEGORY_ICONS = {
  Tools: Wrench,
  Electronics: Monitor,
  "Cameras & Photography": Camera,
  Gaming: Gamepad2,
  "Musical Instruments": Music,
  "Sports & Outdoors": Mountain,
  Vehicles: Car,
};

const CATEGORY_BLURBS = {
  Tools: "Power tools, hand tools, and equipment for any project.",
  Electronics: "Gadgets, laptops, and home entertainment.",
  "Cameras & Photography": "Cameras, lenses, and lighting gear.",
  Gaming: "Consoles, games, and accessories.",
  "Musical Instruments": "Guitars, keyboards, PA systems, and more.",
  "Sports & Outdoors": "Camping gear, bikes, kayaks, and sports equipment.",
  Vehicles: "Cars, trucks, vans, and trailers.",
};

export default function LandingPage() {
  const prefersReduced = useReducedMotion();
  const { stats } = useLandingStats();
  const { counts } = useCategoryCounts();
  const [heroListing, setHeroListing] = useState(null);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, owner:owner_id(id, full_name, avatar_url)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!cancelled && data) {
        if (data.length > 0) setHeroListing(data[0]);
        setFeaturedListings(data);
        setFeaturedLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/register?q=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <div className="bg-background">
      <section className="pt-14 lg:pt-20 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-text-primary leading-[1.05] tracking-tight mb-6">
              Rent almost anything.{" "}
              <span className="text-accent">Earn from what you already own.</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
              The peer-to-peer marketplace where you can rent the gear you need and make money from your unused items.
            </p>

            {/* Search bar — squared, matching marketplace style */}
            <form onSubmit={handleSearch} className="mt-10 bg-white border border-border rounded-lg p-1.5 flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="flex-[2] px-4 py-2.5 flex items-center gap-2">
                <Search size={16} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  autoComplete="off"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search rentals..."
                  className="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted/60 focus:outline-none"
                  aria-label="Search rentals"
                />
              </div>
              <div className="flex-1 px-4 py-2.5 flex items-center gap-2">
                <MapPin size={16} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Location"
                  className="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted/60 focus:outline-none"
                  aria-label="Location"
                />
              </div>
              <div className="p-1 flex items-stretch">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-accent text-white rounded-md px-7 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  aria-label="Search"
                >
                  <Search size={17} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>

            {/* Category quick-links — underlined tabs */}
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["Tools", "Electronics", "Cameras & Photography", "Gaming", "Music", "Sports", "Vehicles"].map((cat) => (
                <Link
                  key={cat}
                  to="/register"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 decoration-transparent hover:decoration-accent decoration-2"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Hero listing card — tag-style, real data */}
          {heroListing && (
            <FadeInSection className="mt-14 max-w-md mx-auto">
              <Link
                to={`/listings/${heroListing.id}`}
                className="group block bg-surface border border-border rounded-lg overflow-hidden transition-all duration-normal hover:-translate-y-[2px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary/40">
                  {heroListing.images?.[0] ? (
                    <img
                      src={getListingImageUrl(heroListing.images[0], { width: 600, height: 450 })}
                      alt={heroListing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                  )}

                  {/* Category badge — sage-filled */}
                  <Badge variant="sage-filled" className="absolute top-3 left-3">
                    {heroListing.category}
                  </Badge>

                  {/* Price tag — attached to card edge */}
                  <div className="absolute -top-[1px] right-6">
                    <div className="relative bg-accent text-white px-3 py-1 text-sm font-mono font-bold rounded-b-sm">
                      ${heroListing.daily_price}
                      <span className="text-[10px] font-body font-normal ml-0.5">/day</span>
                      <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-accent" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-heading font-semibold text-text-primary line-clamp-1">
                    {heroListing.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-1 mt-2">
                    {heroListing.description}
                  </p>
                  {heroListing.owner && (
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar
                        src={heroListing.owner.avatar_url ? getAvatarUrl(heroListing.owner.avatar_url, { width: 32, height: 32 }) : null}
                        name={heroListing.owner.full_name}
                        size="sm"
                      />
                      <span className="text-xs text-text-muted">{heroListing.owner.full_name}</span>
                    </div>
                  )}
                </div>
              </Link>
            </FadeInSection>
          )}

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Browse Rentals</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Become a Host</Button>
            </Link>
          </div>
        </div>
      </section>

      <FadeInSection>
        <div className="bg-neutral-950 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {[
                { label: "Active Listings", value: stats?.activeListings },
                { label: "Cities Served", value: stats?.citiesServed },
                { label: "Trusted Hosts", value: stats?.trustedHosts },
                ...(stats?.avgRating ? [{ label: "Average Rating", value: stats.avgRating }] : []),
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="block font-mono text-2xl font-bold text-white">
                    {stat.value ?? "—"}
                  </span>
                  <span className="block text-sm text-white/60 mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-6">
              Popular Categories
            </h2>
            <p className="text-text-secondary text-center max-w-md mx-auto mb-12">
              Find exactly what you need, from tools and electronics to outdoor gear and more.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {["Tools", "Electronics", "Cameras & Photography", "Gaming", "Musical Instruments", "Sports & Outdoors", "Vehicles"].map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const count = counts[cat];
                const hasItems = count > 0;

                return (
                  <Link
                    key={cat}
                    to="/register"
                    className="group bg-surface border border-border rounded-lg p-5 flex flex-col h-full transition-all duration-normal hover:-translate-y-[2px] hover:border-accent/30"
                  >
                    {Icon && (
                      <Icon size={22} className="text-text-secondary group-hover:text-accent transition-colors mb-3" />
                    )}
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">
                      {cat}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">
                      {CATEGORY_BLURBS[cat]}
                    </p>
                    <span className="text-xs font-mono text-accent mt-auto">
                      {count !== undefined
                        ? `${count} ${count === 1 ? "item" : "items"}`
                        : "—"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {featuredListings.length > 0 && (
        <FadeInSection>
          <section className="py-16 lg:py-20 bg-surface-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
                    Featured Rentals
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Hand-picked items available to rent right now
                  </p>
                </div>
                <Link
                  to="/register"
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors underline underline-offset-4 decoration-accent/30 hover:decoration-accent"
                >
                  View All Rentals
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                {featuredListings.slice(0, 4).map((listing, i) => {
                  const imageUrl = getListingImageUrl(listing.images?.[0], { width: 400, height: 400 });
                  const ownerAvatar = listing.owner?.avatar_url ? getAvatarUrl(listing.owner.avatar_url, { width: 24, height: 24 }) : null;
                  const ownerName = listing.owner?.full_name || "Owner";

                  return (
                    <motion.div
                      key={listing.id}
                      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                      whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                    >
                      <Link
                        to={`/listings/${listing.id}`}
                        className="group block bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-normal hover:-translate-y-[3px]"
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-surface-tertiary/40">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <Badge variant="sage-filled">{listing.category}</Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-heading font-semibold text-text-primary line-clamp-1 mb-2">
                            {listing.title}
                          </h3>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-lg font-mono font-bold text-text-primary">
                              ${listing.daily_price}
                            </span>
                            <span className="text-xs text-text-muted font-body">/ day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar src={ownerAvatar} name={ownerName} size="sm" />
                            <span className="text-xs text-text-secondary truncate">{ownerName}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeInSection>
      )}

      <FadeInSection>
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-6">
              How It Works
            </h2>
            <p className="text-text-secondary text-center max-w-lg mx-auto mb-14">
              Two simple tracks — one for renters, one for hosts.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* For Renters */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-8 text-center lg:text-left">
                  For Renters
                </h3>
                <div className="space-y-0">
                  {[
                    { num: "01", title: "Search", desc: "Browse items by category, location, or search for exactly what you need." },
                    { num: "02", title: "Book", desc: "Send a booking request to the owner. Once approved, coordinate pickup or delivery." },
                    { num: "03", title: "Return", desc: "Enjoy your rental and return it at the end of your booking period." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5 pb-8 relative">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-accent/5 border-2 border-accent/20 flex items-center justify-center">
                          <span className="text-base font-heading font-bold text-accent leading-none">{step.num}</span>
                        </div>
                      </div>
                      <div className="pt-2.5">
                        <h4 className="text-base font-heading font-semibold text-text-primary mb-2">{step.title}</h4>
                        <p className="text-sm text-text-secondary">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* For Hosts */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-8 text-center lg:text-left">
                  For Hosts
                </h3>
                <div className="space-y-0">
                  {[
                    { num: "01", title: "List", desc: "Create a listing with photos, a description, and your daily price." },
                    { num: "02", title: "Approve", desc: "Review incoming booking requests and approve renters you trust." },
                    { num: "03", title: "Earn", desc: "Get paid for every day your item is rented out to someone in your community." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5 pb-8 relative">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-accent/5 border-2 border-accent/20 flex items-center justify-center">
                          <span className="text-base font-heading font-bold text-accent leading-none">{step.num}</span>
                        </div>
                      </div>
                      <div className="pt-2.5">
                        <h4 className="text-base font-heading font-semibold text-text-primary mb-2">{step.title}</h4>
                        <p className="text-sm text-text-secondary">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="py-16 lg:py-20 bg-surface-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-heading font-bold text-text-primary text-center mb-12">
              Why Rent Instead of Buy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "piggy", title: "Save Money", desc: "Access expensive gear for a fraction of the purchase price. Only pay for what you need, when you need it." },
                { icon: "recycle", title: "Reduce Waste", desc: "Sharing items means fewer products manufactured and less waste. Renting is better for the planet." },
                { icon: "zap", title: "Access Premium Gear", desc: "Use high-end tools, cameras, and equipment that would be too costly to buy for occasional use." },
                { icon: "dollar", title: "Earn Passive Income", desc: "Your idle tools, gear, and vehicles can earn money every day. Turn your belongings into an income stream." },
              ].map((benefit) => (
                <div key={benefit.title} className="bg-surface border border-border rounded-lg p-6">
                  <div className="w-9 h-9 rounded-md bg-sage/10 flex items-center justify-center mb-4">
                    {benefit.icon === "piggy" && (
                      <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {benefit.icon === "recycle" && (
                      <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                    )}
                    {benefit.icon === "zap" && (
                      <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    )}
                    {benefit.icon === "dollar" && (
                      <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-base font-heading font-semibold text-text-primary mb-2">{benefit.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="py-16 lg:py-20" style={{ backgroundColor: "rgba(107, 122, 94, 0.08)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
                  Earn from what you already own
                </h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  That drill gathering dust in your garage? Your camera you only use twice a year?
                  Turn your idle items into a source of income. It takes minutes to get started.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Upload photos and describe your item",
                    "Set your own daily price and availability",
                    "Review renters and approve bookings",
                    "Get paid for every day your item is rented",
                  ].map((step) => (
                    <div key={step} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-sage shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm text-text-secondary">{step}</span>
                    </div>
                  ))}
                </div>

                <Link to="/register">
                  <Button variant="primary" size="lg">Start Hosting</Button>
                </Link>
              </div>

              <div className="bg-surface border border-border rounded-lg p-8 lg:p-10">
                <p className="text-sm font-mono text-sage mb-2">Potential earnings</p>
                <p className="text-4xl font-heading font-bold text-text-primary">
                  $150<span className="text-lg font-body font-normal text-text-muted">/mo</span>
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Average earnings per listing on RentIt
                </p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-text-muted">
                    No upfront costs. No storage fees. You stay in control of your items and schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <TestimonialsSection />

      <FAQSection />

      <FadeInSection>
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
              Ready to start renting?
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Join thousands of people already renting and earning on RentIt.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg">Browse Rentals</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Become a Host</Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

    </div>
  );
}
