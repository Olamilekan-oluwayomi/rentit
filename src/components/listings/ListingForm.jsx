import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPinned } from "lucide-react";
import { listingFormSchema, listingEditFormSchema } from "../../lib/validations";
import { CATEGORIES } from "../../lib/constants";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { useToast } from "../../contexts/ToastContext";
import ImageUpload from "./ImageUpload";

/**
 * Reusable listing form (create + edit).
 * @param {{ defaultValues, existingImages, isEdit, onSubmit, onExistingRemove, submitting, submitLabel }}
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
  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const titleValue = watch("title") || "";
  const descValue = watch("description") || "";

  const { getCurrentLocation, loading: locationLoading } = useCurrentLocation();
  const { addToast } = useToast();

  const handleDetectLocation = async () => {
    const { location: detected, error } = await getCurrentLocation();
    if (error) {
      addToast(error, "error");
      return;
    }
    setValue("location", detected, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Title
        </label>
        <input
          id="title"
          {...register("title")}
          maxLength={100}
          placeholder="e.g. Professional DSLR Camera"
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.title ? (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-text-secondary">{titleValue.length}/100</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          maxLength={1000}
          rows={4}
          placeholder="Describe your item, its condition, and any accessories included..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm resize-none"
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

      {/* Category + Price row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
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

        <div>
          <label
            htmlFor="daily_price"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Daily Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
              $
            </span>
            <input
              id="daily_price"
              type="number"
              step="0.01"
              min="0.01"
              {...register("daily_price")}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          {errors.daily_price && (
            <p className="text-xs text-red-500 mt-1">
              {errors.daily_price.message}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
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
            {...register("location")}
            maxLength={100}
            placeholder="City, Country"
            className="w-full px-4 py-2.5 pr-11 border border-gray-300 dark:border-white/15 rounded-lg bg-transparent text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
          />
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locationLoading || submitting}
            title="Use current location"
            aria-label="Use current location"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:pointer-events-none transition-all"
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

      {/* Images (via Controller for react-hook-form integration) */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-accent text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {submitting && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}