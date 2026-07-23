/**
 * Zod validation schemas for listing forms.
 *
 * Defines reusable schemas for create, edit, and image-only validation.
 * Error messages are user-facing strings shown inline on form fields.
 */

import { z } from "zod";
import { CATEGORIES } from "./constants";

// ── Local image constraints (mirrors src/lib/constants.js) ──────────
const MAX_LISTING_IMAGES = 5;
const MIN_LISTING_IMAGES = 1;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Zod custom schema for a single image File object. */
const imageFileSchema = z
  .custom()
  .refine((file) => file instanceof File, "Must be a file")
  .refine((file) => ALLOWED_TYPES.includes(file.type), "Only JPEG, PNG, or WEBP allowed")
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be 5MB or less");

// ── Listing text fields ─────────────────────────────────────────────

/** Shared schema for listing text/metadata fields (title, description, etc.). */
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

// ── Image array schemas ─────────────────────────────────────────────

/** Images array for new listings — at least 1 image required. */
export const listingImagesSchema = z
  .array(imageFileSchema)
  .min(MIN_LISTING_IMAGES, "At least 1 image is required")
  .max(MAX_LISTING_IMAGES, `Maximum ${MAX_LISTING_IMAGES} images allowed`);

/** Images array for editing — images are optional but capped at 5. */
export const listingEditImagesSchema = z
  .array(imageFileSchema)
  .max(MAX_LISTING_IMAGES, `Maximum ${MAX_LISTING_IMAGES} images allowed`);

// ── Combined form schemas ───────────────────────────────────────────

/** Full form schema for creating a new listing (text fields + images). */
export const listingFormSchema = listingSchema.extend({
  images: listingImagesSchema,
});

/** Full form schema for editing an existing listing (text fields + optional images). */
export const listingEditFormSchema = listingSchema.extend({
  images: listingEditImagesSchema,
});
