/**
 * Hook for resolving the user's current geographic location.
 *
 * Uses the browser Geolocation API to get coordinates, then reverse-
 * geocodes them into a human-readable string (e.g. "Paris, France")
 * via OpenStreetMap's Nominatim service. Maps all Geolocation error
 * codes to friendly messages.
 */

import { useCallback, useState } from "react";
import { reverseGeocode, formatLocation } from "../utils/location";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Requests the device's current position and returns a formatted
   * location string. Handles browser support checks, permission
   * denial, timeouts, and geocoding failures gracefully.
   *
   * @returns {Promise<{location: string|null, error: string|null}>}
   */
  const getCurrentLocation = useCallback(async () => {
    // Fail fast on browsers without geolocation support
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by your browser.";
      setError(msg);
      setLoading(false);
      return { location: null, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      // Wrapping the callback-based API in a Promise for async/await usage.
      // enableHighAccuracy: false — uses GPS/network less aggressively to
      // save battery; 5-min cache avoids hammering the sensor.
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      const formatted = formatLocation(address);

      if (!formatted) {
        const msg = "Could not retrieve your city.";
        setError(msg);
        setLoading(false);
        return { location: null, error: msg };
      }

      setLoading(false);
      return { location: formatted, error: null };
    } catch (err) {
      // Map GeolocationPositionError codes to user-friendly messages
      let msg;

      if (err.code === 1) {
        msg = "Location permission denied.";
      } else if (err.code === 2) {
        msg = "Unable to determine your location.";
      } else if (err.code === 3) {
        msg = "Location request timed out.";
      } else {
        msg = "Could not retrieve your city.";
      }

      setError(msg);
      setLoading(false);
      return { location: null, error: msg };
    }
  }, []);

  return { getCurrentLocation, loading, error };
}
