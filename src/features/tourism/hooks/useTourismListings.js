import { useState, useEffect, useMemo } from "react";
import { fetchTourismListings } from "../../../api/tourism";
import { API_SORT, FALLBACK_PROPERTIES, filterPropertiesLocal } from "../constants";

export function useTourismListings(filters) {
  const { category, sort, maxPrice, minRating, search } = filters;
  const [properties, setProperties] = useState(FALLBACK_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTourismListings({
          category: category === "All" ? undefined : category,
          maxPrice,
          minRating: minRating || undefined,
          search: search || undefined,
          sort: API_SORT[sort] || "recommended",
        });
        if (!cancelled) {
          setProperties(data.length ? data : []);
          setOffline(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setOffline(true);
          setProperties(
            filterPropertiesLocal(FALLBACK_PROPERTIES, { category, maxPrice, minRating, search })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [category, sort, maxPrice, minRating, search]);

  const filtered = useMemo(
    () => filterPropertiesLocal(properties, { category, maxPrice, minRating, search }),
    [properties, category, maxPrice, minRating, search]
  );

  return { properties: filtered, loading, offline, error, total: filtered.length };
}
