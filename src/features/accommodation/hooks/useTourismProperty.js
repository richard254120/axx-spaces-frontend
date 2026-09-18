import { useState, useEffect } from "react";
import { fetchAccommodationById, recordAccommodationView } from "../../../api/accommodation";

export function useTourismProperty(id) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAccommodationById(id);
        if (!cancelled) {
          setProperty(data);
          recordAccommodationView(id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setProperty(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const roomTypes = property?.roomTypes?.length
    ? property.roomTypes
    : property
      ? [{ name: "Standard Room", price: property.price, guests: 2, desc: "" }]
      : [];

  return { property, roomTypes, loading, error };
}
