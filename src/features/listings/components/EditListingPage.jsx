/*
|--------------------------------------------------------------------------
| EditListingPage.jsx
|--------------------------------------------------------------------------
|
| Form for editing an existing rental listing. Loads the listing by ID,
| verifies ownership, and allows the owner to modify details and manage
| images. Enforces a minimum of one image. Non-owners are redirected.
|
| Route: /listings/:id/edit
| Responsibilities: Handle listing update flow with image add/remove
| Dependencies: useListing, useAuth, useToast, supabase, compressImage,
|               ListingForm, ListingSkeleton, MAX_LISTING_IMAGES
| Notes: Ownership verified client-side with redirect. Image removal is
|        deferred until save to allow undo. Storage cleanup failures
|        are non-fatal to prevent blocking the listing update.
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useListing } from "../hooks/useListing";
import { supabase } from "../../../shared/lib/supabase";
import { MAX_LISTING_IMAGES } from "../../../shared/lib/constants";
import { compressImage } from "../../../utils/imageCompression";
import ListingForm from "./ListingForm";
import ListingSkeleton from "./ListingSkeleton";
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

  const handleExistingRemove = (path) => {
    setRemovedImages((prev) => [...prev, path]);
  };

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
      // Delete removed images from Supabase Storage first.
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

      const newImagePaths = [...keptExisting];

      for (let i = 0; i < data.images.length && newImagePaths.length < MAX_LISTING_IMAGES; i++) {
        const file = data.images[i];

        let compressed;
        try {
          compressed = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.8,
          });
        } catch (err) {
          addToast(`Failed to process ${file.name}: ${err.message}`, "error");
          continue;
        }

        const filePath = `${user.id}/${listing.id}/${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, compressed);

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

      // Update the listing row with new metadata and image paths.
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
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
        Edit Listing
      </h1>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
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
