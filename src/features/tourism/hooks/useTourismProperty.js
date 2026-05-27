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
  2: {
    ...FALLBACK_PROPERTIES[1],
    description: "Perched on the equator at 7,000 feet, combining colonial elegance with modern luxury.",
    roomTypes: [{ name: "Classic Room", price: 28000, guests: 2, desc: "Mountain view with fireplace" }],
    reviewList: [{ name: "Peter N.", rating: 5, date: "April 2026", comment: "Magical Mount Kenya views!" }],
    manager: { name: "Carol Wanjiku", phone: "+254 722 987 654", email: "reservations@fairmont-mkenya.co.ke" },
    policies: { checkin: "3:00 PM", checkout: "12:00 PM", cancellation: "72 hours", payment: "M-Pesa, Visa, Mastercard" },
  },
  3: {
    ...FALLBACK_PROPERTIES[2],
    description: "Heart of Nairobi. Business & leisure, fine dining, rooftop pool.",
    roomTypes: [{ name: "Deluxe Room", price: 9500, guests: 2, desc: "City view" }],
    reviewList: [{ name: "James M.", rating: 5, date: "March 2026", comment: "Perfect location in Nairobi CBD!" }],
    manager: { name: "Front Desk", phone: "+254 720 123 456", email: "reservations@serena-hotels.com" },
    policies: { checkin: "2:00 PM", checkout: "11:00 AM", cancellation: "24 hours", payment: "M-Pesa, Visa, Mastercard" },
  },
  4: {
    ...FALLBACK_PROPERTIES[3],
    description: "Home of the last northern white rhinos. Immersive Big Five experience.",
    roomTypes: [{ name: "Tented Suite", price: 18000, guests: 2, desc: "En-suite tent with bush views" }],
    reviewList: [{ name: "James L.", rating: 5, date: "April 2026", comment: "Meeting the rhinos was life-changing!" }],
    manager: { name: "Moses Kipchoge", phone: "+254 733 456 789", email: "bookings@olpejetacamp.co.ke" },
    policies: { checkin: "2:00 PM", checkout: "10:00 AM", cancellation: "7 days", payment: "M-Pesa, Visa, USD" },
  },
  5: {
    ...FALLBACK_PROPERTIES[4],
    description: "Award-winning coral reef, watersports paradise & white sand beaches.",
    roomTypes: [{ name: "Ocean View Room", price: 15000, guests: 2, desc: "Beachfront view" }],
    reviewList: [{ name: "Sarah W.", rating: 5, date: "February 2026", comment: "Best beach resort in Kenya!" }],
    manager: { name: "Reservations", phone: "+254 733 111 222", email: "info@dianireef.co.ke" },
    policies: { checkin: "2:00 PM", checkout: "11:00 AM", cancellation: "48 hours", payment: "M-Pesa, Visa" },
  },
  6: {
    ...FALLBACK_PROPERTIES[5],
    description: "Karen Blixen country. Award-winning spa, colonial architecture, safari access.",
    roomTypes: [{ name: "Superior Room", price: 32000, guests: 2, desc: "Garden view with terrace" }],
    reviewList: [{ name: "David K.", rating: 5, date: "March 2026", comment: "Luxury at its finest!" }],
    manager: { name: "Concierge", phone: "+254 722 333 444", email: "reservations@hemingways-nairobi.com" },
    policies: { checkin: "3:00 PM", checkout: "12:00 PM", cancellation: "72 hours", payment: "M-Pesa, Visa, Mastercard" },
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
