/**
 * EditListingPage — Form page for editing an existing rental listing.
 *
 * Loads the listing by ID, verifies ownership, and allows the owner to
 * modify details and manage images. Image handling accounts for both
 * existing (kept) and newly uploaded images while enforcing a minimum
 * of one image per listing.
 *
 * Non-owners are immediately redirected to the listing detail page.
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useListing } from "../hooks/useListing";
import { supabase } from "../lib/supabase";
import { MAX_LISTING_IMAGES } from "../lib/constants";
import ListingForm from "../components/listings/ListingForm";
import ListingSkeleton from "../components/listings/ListingSkeleton";

/**
 * @returns {JSX.Element} The edit-listing page, or a skeleton/error state while loading.
 */
export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { listing, loading, error } = useListing(id);
  const [submitting, setSubmitting] = useState(false);
  // Tracks existing image paths the user has chosen to remove.
  const [removedImages, setRemovedImages] = useState([]);

  // Prevent non-owners from accessing the edit page.
  useEffect(() => {
    if (!loading && listing && user && listing.owner_id !== user.id) {
      navigate(`/listings/${id}`);
    }
  }, [loading, listing, user, id, navigate]);

  /**
   * Marks an existing image path for removal (deferred until save).
   * @param {string} path - The storage path of the image to remove.
   */
  const handleExistingRemove = (path) => {
    setRemovedImages((prev) => [...prev, path]);
  };

  /**
   * Handles the full listing update flow: remove old images → upload new → update DB.
   * @param {Object} data - Validated form data from ListingForm.
   */
  const onSubmit = async (data) => {
    if (!user || !listing) return;

    // Guard: a listing must always have at least one image.
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
      // Step 1: Delete removed images from Supabase Storage.
      let removalFailed = false;
      if (removedImages.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("listing-images")
          .remove(removedImages);

        if (removeError) {
          // Non-fatal: storage cleanup failure shouldn't block the listing update.
          removalFailed = true;
        }
      }

      // Step 2: Upload new images, starting from the kept existing ones.
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

      // Second guard: if all uploads failed and no existing images remain, abort.
      if (newImagePaths.length === 0) {
        addToast("A listing needs at least 1 image. Save cancelled.", "error");
        setSubmitting(false);
        return;
      }

      // Step 3: Update the listing row with new metadata and image paths.
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

  // Loading state: show a skeleton placeholder that mirrors the form layout.
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <ListingSkeleton count={1} />
      </div>
    );
  }

  // Error / not-found state.
  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16 text-center">
        <p className="text-text-secondary">
          {error || "Listing not found."}
        </p>
      </div>
    );
  }

  // Compute which existing images are still visible (not removed).
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
