/*
|--------------------------------------------------------------------------
| useCategoryCounts.js
|--------------------------------------------------------------------------
|
| Fetches active listing counts per category for the landing page.
|
| Purpose: Drives the category section on the landing page showing "X items" per category.
| Inputs: (none)
| Outputs: { counts (Record<string,number>), loading (boolean) }
| Side effects: Sequential Supabase count queries per category
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { CATEGORIES } from "../../../shared/lib/constants";

export function useCategoryCounts() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Sequential per-category queries avoid overloading the DB with a single
  // complex query; the result set is small so round-trips are negligible.
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
