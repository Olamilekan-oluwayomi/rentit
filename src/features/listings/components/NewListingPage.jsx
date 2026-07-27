/**
 * NewListingPage — Form page for creating a new rental listing.
 *
 * Handles a three-step process:
 *   1. Insert a listing row into Supabase (without images).
 *   2. Upload each selected image to Supabase Storage.
 *   3. Update the listing row with the uploaded image paths.
 *
 * This ordering guarantees a listing always has a valid row before any
 * storage references are written, preventing orphaned files.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useRequireCompleteProfile } from "../../profile/hooks/useRequireCompleteProfile";
import { supabase } from "../../../shared/lib/supabase";
import { MAX_LISTING_IMAGES } from "../../../shared/lib/constants";
import { compressImage } from "../../../utils/imageCompression";
import ListingForm from "./ListingForm";

/**
 * @returns {JSX.Element} The new-listing creation page.
 */
export default function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { requireProfile } = useRequireCompleteProfile();
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles the full listing creation flow: DB insert → image uploads → DB update.
   * Gated behind profile completion.
   * @param {Object} data - Validated form data from ListingForm.
   */
  const onSubmit = async (data) => {
    if (!user) return;
    requireProfile(async () => {
      setSubmitting(true);

    try {
      // Step 1: Insert a placeholder row so we have a listing.id for storage paths.
      const { data: listing, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          daily_price: data.daily_price,
          location: data.location,
          owner_id: user.id,
          images: [],
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        addToast(insertError.message, "error");
        setSubmitting(false);
        return;
      }

      if (!listing) {
        addToast("Failed to create listing. Please try again.", "error");
        setSubmitting(false);
        return;
      }

      // Step 2: Compress and upload each image to Supabase Storage, capped by MAX_LISTING_IMAGES.
      const imagePaths = [];
      for (let i = 0; i < data.images.length && i < MAX_LISTING_IMAGES; i++) {
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

        // Path format: userId/listingId/timestamp-index.jpg for uniqueness and organization.
        const filePath = `${user.id}/${listing.id}/${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, compressed);

        if (uploadError) {
          addToast(`Failed to upload ${file.name}: ${uploadError.message}`, "error");
          continue;
        }

        imagePaths.push(filePath);
      }

      // Step 3: Backfill the listing row with the final image paths.
      if (imagePaths.length > 0) {
        const { error: updateError } = await supabase
          .from("listings")
          .update({ images: imagePaths })
          .eq("id", listing.id);

        if (updateError) {
          addToast(updateError.message, "error");
          setSubmitting(false);
          return;
        }
      }

      addToast("Listing published!");
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      addToast(err?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
    }); // end requireProfile
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
        New Listing
      </h1>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8">
        <ListingForm
          onSubmit={onSubmit}
          submitting={submitting}
          submitLabel="Publish Listing"
        />
      </div>
    </div>
  );
}
