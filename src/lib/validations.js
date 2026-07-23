import { z } from "zod";
import { CATEGORIES } from "./constants";

const MAX_LISTING_IMAGES = 5;
const MIN_LISTING_IMAGES = 1;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageFileSchema = z
  .custom()
  .refine((file) => file instanceof File, "Must be a file")
  .refine((file) => ALLOWED_TYPES.includes(file.type), "Only JPEG, PNG, or WEBP allowed")
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be 5MB or less");

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be 1000 characters or fewer"),
  category: z
    .string()
    .min(1, "Category is required")
    .refine((val) => CATEGORIES.includes(val), "Invalid category"),
  daily_price: z
    .coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(100000, "Price seems too high"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be 100 characters or fewer"),
});

export const listingImagesSchema = z
  .array(imageFileSchema)
  .min(MIN_LISTING_IMAGES, "At least 1 image is required")
  .max(MAX_LISTING_IMAGES, `Maximum ${MAX_LISTING_IMAGES} images allowed`);

export const listingEditImagesSchema = z
  .array(imageFileSchema)
  .max(MAX_LISTING_IMAGES, `Maximum ${MAX_LISTING_IMAGES} images allowed`);

export const listingFormSchema = listingSchema.extend({
  images: listingImagesSchema,
});

export const listingEditFormSchema = listingSchema.extend({
  images: listingEditImagesSchema,
});