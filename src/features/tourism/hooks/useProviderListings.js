import { useState, useEffect, useCallback } from "react";
import { fetchMyTourismListings } from "../../../api/tourism";
import { getTourismToken } from "../auth";

export function useProviderListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = getTourismToken();
    if (!token) {
      setError("Please sign in or register a property to view your dashboard.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyTourismListings(token);
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: listings.length,
    live: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    views: listings.reduce((s, l) => s + (l.views || 0), 0),
  };

  return { listings, loading, error, stats, reload: load };
}
