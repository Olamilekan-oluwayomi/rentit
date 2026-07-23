import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setListing(data);
    }
    setLoading(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchListing();
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(true);
    setError(null);

    if (listing.images && listing.images.length > 0) {
      const filePaths = listing.images.map((url) => {
        const parts = url.split("/listing-images/");
        return parts[1] || url;
      });

      await supabase.storage.from("listing-images").remove(filePaths);
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Listing not found
          </h1>
          <p className="text-text-secondary mb-4">{error}</p>
          <Link to="/" className="text-accent hover:underline font-medium">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === listing.owner_id;
  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImage === idx
                        ? "border-accent"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${listing.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-heading font-bold text-text-primary">
                {listing.title}
              </h1>
              <span className="text-accent text-2xl font-bold whitespace-nowrap">
                ${listing.daily_price}
                <span className="text-sm font-normal text-text-secondary">/day</span>
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="bg-gray-100 text-text-secondary px-3 py-1 rounded-full text-sm">
                {listing.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-heading font-semibold text-text-primary mb-2">
                Description
              </h2>
              <p className="text-text-secondary whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {isOwner ? (
                <>
                  <Link
                    to={`/listings/${listing.id}/edit`}
                    className="flex-1 text-center bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              ) : (
                <button className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Contact Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
