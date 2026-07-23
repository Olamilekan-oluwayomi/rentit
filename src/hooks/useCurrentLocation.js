import { useCallback, useState } from "react";
import { reverseGeocode, formatLocation } from "../utils/location";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by your browser.";
      setError(msg);
      setLoading(false);
      return { location: null, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
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
