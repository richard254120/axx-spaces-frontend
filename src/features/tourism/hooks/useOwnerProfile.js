import { useState, useEffect, useCallback } from "react";
import { fetchOwnerProfile } from "../../../api/tourism";
import { getTourismToken } from "../auth";

export function useOwnerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = getTourismToken();
    if (!token) {
      setError("Please sign in to view your profile.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchOwnerProfile(token);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { profile, loading, error, reload: load };
}
