import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useListing } from "../hooks/useListing";
import { supabase } from "../lib/supabase";
import { MAX_LISTING_IMAGES } from "../lib/constants";
import ListingForm from "../components/listings/ListingForm";
import ListingSkeleton from "../components/listings/ListingSkeleton";

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { listing, loading, error } = useListing(id);
  const [submitting, setSubmitting] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);

  // Redirect non-owners
  useEffect(() => {
    if (!loading && listing && user && listing.owner_id !== user.id) {
      navigate(`/listings/${id}`);
    }
  }, [loading, listing, user, id, navigate]);

  const handleExistingRemove = (path) => {
    setRemovedImages((prev) => [...prev, path]);
  };

  const onSubmit = async (data) => {
    if (!user || !listing) return;

    // Guard: don't allow saving a listing with zero images.
    const keptExisting = listing.images.filter(
      (img) => !removedImages.includes(img)
    );
    const willHaveImages = keptExisting.length + data.images.length;

    if (willHaveImages === 0) {
      addToast("A listing needs at least 1 image. Please keep or add one before saving.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Remove deleted images from storage
      let removalFailed = false;
      if (removedImages.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("listing-images")
          .remove(removedImages);

        if (removeError) {
          removalFailed = true;
        }
      }

      // 2. Upload new images
      const newImagePaths = [...keptExisting];

      for (let i = 0; i < data.images.length && newImagePaths.length < MAX_LISTING_IMAGES; i++) {
        const file = data.images[i];
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${listing.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file);

        if (uploadError) {
          addToast(`Failed to upload ${file.name}: ${uploadError.message}`, "error");
          continue;
        }

        newImagePaths.push(filePath);
      }

      // Guard again post-upload: if all uploads failed and no existing images remain, abort before saving.
      if (newImagePaths.length === 0) {
        addToast("A listing needs at least 1 image. Save cancelled.", "error");
        setSubmitting(false);
        return;
      }

      // 3. Update listing
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          daily_price: data.daily_price,
          location: data.location,
          images: newImagePaths,
        })
        .eq("id", listing.id);

      if (updateError) {
        addToast(updateError.message, "error");
        setSubmitting(false);
        return;
      }

      if (removalFailed) {
        addToast(
          "Listing updated, but some old images couldn't be deleted from storage.",
          "error"
        );
      } else {
        addToast("Listing updated!");
      }

      navigate(`/listings/${listing.id}`);
    } catch (err) {
      addToast(err?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <ListingSkeleton count={1} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16 text-center">
        <p className="text-text-secondary">
          {error || "Listing not found."}
        </p>
      </div>
    );
  }

  const existingImages = listing.images?.filter(
    (img) => !removedImages.includes(img)
  ) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-8">
        Edit Listing
      </h1>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8">
        <ListingForm
          defaultValues={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            daily_price: listing.daily_price,
            location: listing.location,
          }}
          existingImages={existingImages}
          isEdit
          onSubmit={onSubmit}
          onExistingRemove={handleExistingRemove}
          submitting={submitting}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}