/**
 * ListingForm.jsx
 * ----------------
 * Reusable form component for creating and editing rental listings.
 * Handles all listing fields (title, description, category, price, location)
 * with Zod validation, geolocation detection, and image upload integration.
 * Dynamically switches between create/edit validation schemas via `isEdit`.
 */
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPinned } from "lucide-react";
import { listingFormSchema, listingEditFormSchema } from "../../../shared/lib/validations";
import { CATEGORIES } from "../../../shared/lib/constants";
import { useCurrentLocation } from "../../../shared/hooks/useCurrentLocation";
import { useToast } from "../../../shared/contexts/ToastContext";
import ImageUpload from "./ImageUpload";

/**
 * Reusable listing form (create + edit).
 * Uses react-hook-form + Zod for validation. When `isEdit` is true, the edit
 * schema is used which allows partial field updates and treats images as optional.
 * @param {{ defaultValues: object, existingImages: string[], isEdit: boolean, onSubmit: (data: any) => void, onExistingRemove: (path: string) => void, submitting: boolean, submitLabel: string }} props
 */
export default function ListingForm({
  defaultValues = {},
  existingImages = [],
  isEdit = false,
  onSubmit,
  onExistingRemove,
  submitting = false,
  submitLabel = "Publish Listing",
}) {
  // react-hook-form setup — selects the correct Zod schema based on create vs. edit mode.
  // Edit mode uses a less strict schema (e.g., images are optional when editing).
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? listingEditFormSchema : listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      daily_price: "",
      location: "",
      ...defaultValues,
    },
  });

  // useWatch is React Compiler-safe (unlike watch() which triggers
  // the incompatible-library lint warning).
  const titleValue = useWatch({ control, name: "title" }) || "";
  const descValue = useWatch({ control, name: "description" }) || "";

  // Geolocation hook — provides browser-based location detection.
  const { getCurrentLocation, loading: locationLoading } = useCurrentLocation();
  const { addToast } = useToast();

  /**
   * Triggers browser geolocation and populates the location field.
   * Displays a toast on failure so the user knows to enter it manually.
   */
  const handleDetectLocation = async () => {
    const { location: detected, error } = await getCurrentLocation();
    if (error) {
      addToast(error, "error");
      return;
    }
    // shouldValidate triggers Zod validation on the populated value.
    setValue("location", detected, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Title Field ──────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Title
        </label>
        <input
          id="title"
          autoComplete="off"
          {...register("title")}
          maxLength={100}
          placeholder="e.g. Professional DSLR Camera"
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
        />
        <div className="flex items-center justify-between mt-1">
          {/* Show validation error or empty span to keep layout stable */}
          {errors.title ? (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-text-secondary">{titleValue.length}/100</p>
        </div>
      </div>

      {/* ── Description Field ────────────────────────────────────── */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          autoComplete="off"
          {...register("description")}
          maxLength={1000}
          rows={4}
          placeholder="Describe your item, its condition, and any accessories included..."
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-text-secondary">
            {descValue.length}/1000
          </p>
        </div>
      </div>

      {/* ── Category + Price Row (side-by-side on larger screens) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Category dropdown */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Daily price input with dollar prefix */}
        <div>
          <label
            htmlFor="daily_price"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Daily Price
          </label>
          <div className="relative">
            {/* Dollar sign prefix — positioned absolutely to allow numeric input padding */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
              $
            </span>
            <input
              id="daily_price"
              type="number"
              autoComplete="off"
              step="0.01"
              min="0.01"
              {...register("daily_price")}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 border border-border rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          {errors.daily_price && (
            <p className="text-xs text-red-500 mt-1">
              {errors.daily_price.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Location Field with Auto-detect ─────────────────────── */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Location
        </label>
        <div className="relative">
          <input
            id="location"
            autoComplete="address-level2"
            {...register("location")}
            maxLength={100}
            placeholder="City, Country"
            className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
          />
          {/* Geolocation button — uses browser API to auto-fill the location field */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locationLoading || submitting}
            title="Use current location"
            aria-label="Use current location"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.97]"
          >
            {locationLoading ? (
              <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <MapPinned size={18} strokeWidth={2} />
            )}
          </button>
        </div>
        {errors.location && (
          <p className="text-xs text-red-500 mt-1">
            {errors.location.message}
          </p>
        )}
      </div>

      {/* ── Image Upload (uses Controller to bridge react-hook-form with ImageUpload) ── */}
      <Controller
        name="images"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Images
            </label>
            <ImageUpload
              images={field.value}
              existingImages={existingImages}
              onImagesChange={field.onChange}
              onExistingRemove={onExistingRemove}
              maxImages={5}
              uploading={submitting}
            />
            {errors.images && (
              <p className="text-xs text-red-500 mt-1">
                {errors.images.message}
              </p>
            )}
          </div>
        )}
      />

      {/* ── Submit Button ────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-accent text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {submitting && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
