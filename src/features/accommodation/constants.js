/** Shared accommodation labels, filters, and offline fallback data */

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
  "Beach Resort": "",
  "City Hotel": "",
  "Mountain Lodge": "",
  "Safari Camp": "",
  "Camping Grounds": "",
  "Boutique Hotel": "",
  "Eco Lodge": "",
  All: "",
};

export const DEFAULT_STATS = [
  { val: "200+", label: "Properties Listed" },
  { val: "47", label: "Counties Covered" },
  { val: "18K+", label: "Monthly Visitors" },
  { val: "4.8★", label: "Avg. Rating" },
];

export const DEFAULT_CATEGORIES = [
  { name: "Beach Resorts", emoji: "", count: 34 },
  { name: "Safari Camps", emoji: "", count: 28 },
  { name: "Mountain Lodges", emoji: "", count: 19 },
  { name: "City Hotels", emoji: "", count: 41 },
];

export const ADVERTISING_PACKAGES = [
  { name: "Starter", duration: "1 Month", price: 2500, color: "#6b7280", desc: "1 listing, basic analytics, email support", popular: false },
  { name: "Growth", duration: "3 Months", price: 6000, color: "#0ea5e9", desc: "Up to 3 listings, full analytics, priority support, featured placement", popular: true },
  { name: "Premium", duration: "6 Months", price: 10000, color: "#fbbf24", desc: "Unlimited listings, homepage slot, dedicated account manager", popular: false },
];

export const PROPERTY_CATEGORIES = [
  // Accommodation Types
  "Hotel",
  "Beach Resort",
  "Mountain Lodge",
  "Safari Camp",
  "Camping Grounds",
  "Boutique Hotel",
  "Eco Lodge",
  "Guest House",
  "Bed & Breakfast",
  "Hostel",
  "Apartment",
  "Villa",
  "Holiday Home",
  "Cottage",
  "Treehouse",
  "Glamping Site",
  "Luxury Tented Camp",
  "Safari Lodge",
  "Game Lodge",
  "Bush Camp",
  "City Hotel",
  "Airport Hotel",
  "Business Hotel",
  "Conference Hotel",
  "Resort Hotel",
  "All-Inclusive Resort",
  "Family Resort",
  "Adults Only Resort",
  "Beach Hotel",
  "Lake Resort",
  "River Lodge",
  "Forest Lodge",
  "Hill Station",
  "Heritage Hotel",
  "Historic Inn",
  "Farm Stay",
  "Homestay",
  "Serviced Apartment",
  "Penthouse",
  "Studio",
  "Condo",
  "Timeshare",
  "Vacation Rental",
  "Backpackers Hostel",
  "Youth Hostel",
  "Budget Hotel",
  "Motel",
  "Roadside Lodge",
  "Transit Hotel",
  "Capsule Hotel",

  // Unique Experiences
  "Treehouse Lodge",
  "Cave Hotel",
  "Ice Hotel",
  "Underwater Hotel",
  "Desert Camp",
  "Island Resort",
  "Private Island",
  "Luxury Safari",
  "Exclusive Retreat",
  "Wellness Retreat",
  "Spiritual Retreat",
];

export const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export const AMENITIES_LIST = [
  "Swimming Pool", "WiFi", "Restaurant", "Spa", "Gym", "Parking", "Bar",
  "Game Drives", "Beach Access", "Kids Club", "Airport Transfer", "Room Service",
];

export const REGISTER_STEPS = ["Account", "Property", "Location", "Media Upload", "Amenities", "Pricing & Booking", "Review"];

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
  lat: "",
  lng: "",
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

/** Used when API is unavailable - now empty to only show approved backend data */
export const FALLBACK_PROPERTIES = [];

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
