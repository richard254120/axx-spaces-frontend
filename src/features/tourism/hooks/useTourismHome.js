import { useState, useEffect } from "react";
import { fetchFeaturedTourism, fetchTourismStats } from "../../../api/tourism";
import { DEFAULT_STATS, FALLBACK_PROPERTIES } from "../constants";

export function useTourismHome() {
  const [featured, setFeatured] = useState(FALLBACK_PROPERTIES.slice(0, 6));
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [featuredData, statsData] = await Promise.all([
          fetchFeaturedTourism(6),
          fetchTourismStats(),
        ]);
        if (!cancelled) {
          if (featuredData.length) setFeatured(featuredData);
          if (statsData) {
            setStats([
              { val: `${statsData.propertiesListed || 0}+`, label: "Properties Listed" },
              { val: String(statsData.countiesCovered || 0), label: "Counties Covered" },
              { val: statsData.monthlyVisitors || "18K+", label: "Monthly Visitors" },
              { val: statsData.avgRating || "4.8★", label: "Avg. Rating" },
            ]);
          }
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { featured, stats, loading };
}
