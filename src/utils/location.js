const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";

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
