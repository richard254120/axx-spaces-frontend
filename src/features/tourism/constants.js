/** Shared tourism labels, filters, and offline fallback data */

export const API_SORT = {
  Recommended: "recommended",
  "Price: Low to High": "price-asc",
  "Price: High to Low": "price-desc",
  "Highest Rated": "rating-desc",
  "Most Reviewed": "reviews-desc",
};

export const CATEGORY_OPTIONS = [
  "All",
  "Beach Resort",
  "City Hotel",
  "Mountain Lodge",
  "Safari Camp",
  "Camping Grounds",
  "Boutique Hotel",
  "Eco Lodge",
];

export const SORT_OPTIONS = Object.keys(API_SORT);

export const CATEGORY_ICONS = {
  "Beach Resort": "🏖️",
  "City Hotel": "🏨",
  "Mountain Lodge": "⛰️",
  "Safari Camp": "🦁",
  "Camping Grounds": "🏕️",
  "Boutique Hotel": "🌿",
  "Eco Lodge": "🌱",
  All: "🌍",
};

export const DEFAULT_STATS = [
  { val: "200+", label: "Properties Listed" },
  { val: "47", label: "Counties Covered" },
  { val: "18K+", label: "Monthly Visitors" },
  { val: "4.8★", label: "Avg. Rating" },
];

export const DEFAULT_CATEGORIES = [
  { name: "Beach Resorts", emoji: "🏖️", count: 34 },
  { name: "Safari Camps", emoji: "🦁", count: 28 },
  { name: "Mountain Lodges", emoji: "⛰️", count: 19 },
  { name: "City Hotels", emoji: "🏨", count: 41 },
];

export const ADVERTISING_PACKAGES = [
  { name: "Starter", duration: "1 Month", price: 2500, color: "#6b7280", desc: "1 listing, basic analytics, email support", popular: false },
  { name: "Growth", duration: "3 Months", price: 6000, color: "#0ea5e9", desc: "Up to 3 listings, full analytics, priority support, featured placement", popular: true },
  { name: "Premium", duration: "6 Months", price: 10000, color: "#fbbf24", desc: "Unlimited listings, homepage slot, dedicated account manager", popular: false },
];

export const PROPERTY_CATEGORIES = [
  "Hotel", "Beach Resort", "Mountain Lodge", "Safari Camp", "Camping Grounds",
  "Boutique Hotel", "Restaurant", "Eco Lodge", "Spa & Wellness Centre",
];

export const KENYA_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Laikipia", "Kajiado",
  "Narok", "Kwale", "Kilifi", "Lamu", "Nyeri", "Samburu", "Machakos",
];

export const AMENITIES_LIST = [
  "Swimming Pool", "WiFi", "Restaurant", "Spa", "Gym", "Parking", "Bar",
  "Game Drives", "Beach Access", "Kids Club", "Airport Transfer", "Room Service",
];

export const REGISTER_STEPS = ["Account", "Property", "Location", "Amenities", "Pricing & Booking", "Review"];

export const INITIAL_REGISTER_FORM = {
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  password: "",
  selectedPackage: "",
  name: "",
  category: "",
  description: "",
  county: "",
  town: "",
  address: "",
  mapLink: "",
  amenities: [],
  basePrice: "",
  weekendPrice: "",
  peakPrice: "",
  roomTypes: [{ name: "", price: "", guests: "" }],
  checkIn: "14:00",
  checkOut: "11:00",
  cancellation: "48",
  bookingUrl: "",
  managerName: "",
  phone: "",
  email: "",
  whatsapp: "",
  agreeTerms: false,
};

export const STATUS_LABELS = {
  pending: { label: "Under review", color: "#f59e0b", bg: "#fffbeb" },
  approved: { label: "Live", color: "#16a34a", bg: "#f0fdf4" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

/** Used when API is unavailable */
export const FALLBACK_PROPERTIES = [
  { id: 1, name: "Serena Beach Resort & Spa", location: "Nyali, Mombasa", county: "Mombasa", category: "Beach Resort", price: 12500, rating: 4.8, reviews: 312, color: "#0ea5e9", amenities: ["Pool", "WiFi", "Spa"], tag: "Top Rated", emoji: "🏖️", bookingUrl: "https://www.serenahotels.com/mombasa" },
  { id: 2, name: "Fairmont Mount Kenya Safari Club", location: "Nanyuki, Laikipia", county: "Laikipia", category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", amenities: ["Safari", "Pool"], tag: "Luxury", emoji: "⛰️", bookingUrl: "https://www.fairmont.com/mount-kenya-safari-club" },
  { id: 3, name: "Nairobi Serena Hotel", location: "Nairobi CBD", county: "Nairobi", category: "City Hotel", price: 9500, rating: 4.7, reviews: 541, color: "#f59e0b", amenities: ["Pool", "WiFi"], tag: "Most Booked", emoji: "🏨", bookingUrl: "https://www.serenahotels.com/nairobi" },
  { id: 4, name: "Ol Pejeta Bush Camp", location: "Laikipia Conservancy", county: "Laikipia", category: "Safari Camp", price: 18000, rating: 4.9, reviews: 87, color: "#a855f7", amenities: ["Safari", "Meals"], tag: "Hidden Gem", emoji: "🦁", bookingUrl: "https://www.olpejetabushcamp.com" },
  { id: 5, name: "Diani Reef Beach Resort", location: "Diani Beach, Kwale", county: "Kwale", category: "Beach Resort", price: 15000, rating: 4.6, reviews: 189, color: "#06b6d4", amenities: ["Beach", "Pool"], emoji: "🤿", bookingUrl: "https://www.dianireef.com" },
  { id: 6, name: "Hemingways Nairobi", location: "Karen, Nairobi", county: "Nairobi", category: "Boutique Hotel", price: 32000, rating: 4.8, reviews: 134, color: "#f97316", amenities: ["Pool", "Spa"], tag: "Premium", emoji: "🌿", bookingUrl: "https://www.hemingways-collection.com/nairobi" },
];

export function filterPropertiesLocal(list, { category, maxPrice, minRating, search }) {
  return list
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price <= maxPrice)
    .filter((p) => p.rating >= minRating)
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.county || "").toLowerCase().includes(q)
      );
    });
}
