import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { MAX_LISTING_IMAGES } from "../lib/constants";
import ListingForm from "../components/listings/ListingForm";

export default function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!user) return;
    setSubmitting(true);

    try {
      // 1. Insert listing row
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

      // 2. Upload images to storage
      const imagePaths = [];
      for (let i = 0; i < data.images.length && i < MAX_LISTING_IMAGES; i++) {
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

        imagePaths.push(filePath);
      }

      // 3. Update listing with image paths
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
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-8">
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
