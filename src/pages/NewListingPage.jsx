import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  'Tools',
  'Cameras & Photography',
  'Sports & Outdoors',
  'Electronics',
  'Musical Instruments',
  'Party & Events',
  'Vehicles',
  'Gaming',
  'Other',
];

const MAX_IMAGES = 5;

export default function NewListingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images only.`);
      setImages(files.slice(0, MAX_IMAGES));
      return;
    }

    setError(null);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        title,
        description,
        daily_price: parseFloat(price),
        category,
        location,
        owner_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (images.length > 0) {
      try {
        const uploadedUrls = await Promise.all(
          images.map(async (file) => {
            const filePath = `${user.id}/${listing.id}/${file.name}`;

            const { error: uploadError } = await supabase.storage
              .from("listing-images")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("listing-images")
              .getPublicUrl(filePath);

            return urlData.publicUrl;
          })
        );

        await supabase
          .from("listings")
          .update({ images: uploadedUrls })
          .eq("id", listing.id);
      } catch (uploadErr) {
        setError(uploadErr.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">
            Listing Created
          </h1>
          <p className="text-text-secondary mb-6">
            Your item <span className="font-medium">{title}</span> has been
            listed successfully.
          </p>
          <Link
            to="/"
            className="text-accent hover:underline font-medium text-sm"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-heading font-bold text-center mb-6 text-text-primary">
          New Listing
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Price per day ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:opacity-90 file:cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating listing..." : "Create Listing"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          <Link to="/" className="text-accent hover:underline font-medium">
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}