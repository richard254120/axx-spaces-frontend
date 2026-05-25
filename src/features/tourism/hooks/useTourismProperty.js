import { useState, useEffect } from "react";
import { fetchTourismById, recordTourismView } from "../../../api/tourism";
import { FALLBACK_PROPERTIES } from "../constants";

const FALLBACK_DETAILS = {
  1: {
    ...FALLBACK_PROPERTIES[0],
    description: "Coastal getaway on Nyali shores with Swahili hospitality.",
    roomTypes: [{ name: "Standard Room", price: 12500, guests: 2, desc: "Garden view" }],
    reviewList: [{ name: "Amina K.", rating: 5, date: "March 2026", comment: "Stunning resort!" }],
    manager: { name: "Reservations", phone: "+254 700 000 001", email: "info@example.co.ke" },
    policies: { checkin: "2:00 PM", checkout: "11:00 AM", cancellation: "48 hours", payment: "M-Pesa, Visa" },
  },
};

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

      if (/^\d+$/.test(id)) {
        const fallback = FALLBACK_DETAILS[id] || { ...FALLBACK_PROPERTIES[0], id };
        if (!cancelled) {
          setProperty(fallback);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchTourismById(id);
        if (!cancelled) {
          setProperty(data);
          recordTourismView(id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setProperty(FALLBACK_DETAILS[1] || FALLBACK_PROPERTIES[0]);
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
