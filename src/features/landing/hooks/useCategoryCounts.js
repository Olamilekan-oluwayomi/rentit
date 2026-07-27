import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { CATEGORIES } from "../../../shared/lib/constants";

export function useCategoryCounts() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = {};
      for (const cat of CATEGORIES) {
        const { count, error } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("category", cat);

        if (!error) results[cat] = count;
      }

      if (!cancelled) {
        setCounts(results);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { counts, loading };
}
