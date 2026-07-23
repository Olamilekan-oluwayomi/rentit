import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import ListingCard from "../components/listings/ListingCard";

const CATEGORIES = [
  "All",
  "Tools",
  "Cameras & Photography",
  "Sports & Outdoors",
  "Electronics",
  "Musical Instruments",
  "Party & Events",
  "Vehicles",
  "Gaming",
  "Other",
];

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setListings(data);
    setLoading(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchListings();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filtered = listings.filter((listing) => {
    const matchesSearch =
      search === "" ||
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || listing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-text-primary">
              RentIt
            </h1>
            <p className="text-text-secondary mt-1">
              Find anything you need to rent
            </p>
          </div>
          {user ? (
            <Link
              to="/listings/new"
              className="bg-accent text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              + New Listing
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-accent text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
              No listings found
            </h2>
            <p className="text-text-secondary">
              {search || activeCategory !== "All"
                ? "Try adjusting your search or filters."
                : "Be the first to create a listing!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
