/**
 * Geocoding and location-formatting utilities.
 *
 * Uses OpenStreetMap's free Nominatim API for reverse geocoding
 * (coords → address). No API key is required but usage must
 * comply with Nominatim's acceptable-use policy (max 1 req/sec).
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";

/**
 * Reverse-geocodes a latitude/longitude pair into a structured address.
 * The `Accept-Language: en` header ensures English place names are
 * returned even when the device locale differs.
 *
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lon - Longitude in decimal degrees
 * @returns {Promise<object>} The `address` object from Nominatim's response
 * @throws {Error} On network failure or missing address data
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
  });

  const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { "Accept-Language": "en" },
  });

  if (!res.ok) throw new Error("Reverse geocoding request failed");

  const data = await res.json();
  if (!data?.address) throw new Error("No address data returned");

  return data.address;
}

/**
 * Picks the most meaningful city-level field from a Nominatim address.
 * Nominatim uses different keys depending on settlement type (city,
 * town, village, etc.), so we check several in order of specificity.
 *
 * @param {object} address - The `address` object from reverseGeocode()
 * @returns {string|null} A "City, Country" string, or null if neither is available
 */
export function formatLocation(address) {
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    address.municipality;

  const country = address.country;

  if (!city && !country) return null;

  if (city && country) return `${city}, ${country}`;
  return city || country;
}
