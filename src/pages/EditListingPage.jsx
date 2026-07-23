import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
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

const MAX_IMAGES = 5;

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchListing = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
      setFetching(false);
      return;
    }

    if (data.owner_id !== user.id) {
      navigate(`/listings/${id}`);
      return;
    }

    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.daily_price.toString());
    setCategory(data.category);
    setLocation(data.location);
    setExistingImages(data.images || []);
    setFetching(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchListing();
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;

    if (total > MAX_IMAGES) {
      setError(`You can have up to ${MAX_IMAGES} images total.`);
      return;
    }

    setError(null);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setRemovedImages((prev) => [...prev, existingImages[index]]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    for (const url of removedImages) {
      const parts = url.split("/listing-images/");
      if (parts[1]) {
        await supabase.storage.from("listing-images").remove([parts[1]]);
      }
    }

    let allImageUrls = [...existingImages];

    if (newImages.length > 0) {
      const uploadedUrls = await Promise.all(
        newImages.map(async (file) => {
          const filePath = `${user.id}/${id}/${file.name}`;
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

      allImageUrls = [...allImageUrls, ...uploadedUrls];
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title,
        description,
        daily_price: parseFloat(price),
        category,
        location,
        images: allImageUrls,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      navigate(`/listings/${id}`);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-heading font-bold text-center mb-6 text-text-primary">
          Edit Listing
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
              Images ({existingImages.length + newImages.length}/{MAX_IMAGES})
            </label>

            {existingImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {newImages.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {existingImages.length + newImages.length < MAX_IMAGES && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImageChange}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:opacity-90 file:cursor-pointer"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Saving changes..." : "Save Changes"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          <Link
            to={`/listings/${id}`}
            className="text-accent hover:underline font-medium"
          >
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}
