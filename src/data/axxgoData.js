export const COUNTIES = [
  "Nairobi City", "Kiambu", "Mombasa", "Nakuru", "Uasin Gishu", "Machakos",
  "Kisumu", "Kajiado", "Kilifi", "Nyeri", "Meru", "Embu", "Murang'a",
  "Kirinyaga", "Nyandarua", "Laikipia", "Kericho", "Bomet", "Kakamega",
  "Bungoma", "Busia", "Vihiga", "Siaya", "Homa Bay", "Migori", "Kisii",
  "Nyamira", "Trans Nzoia", "Nandi", "Baringo", "Elgeyo Marakwet", "Narok",
  "Makueni", "Kitui", "Tharaka Nithi", "Isiolo", "Marsabit", "Samburu",
  "Turkana", "West Pokot", "Taita Taveta", "Kwale", "Tana River", "Lamu",
  "Garissa", "Wajir", "Mandera"
];

export const CATEGORIES = [
  {
    id: "Rentals",
    label: "Rentals",
    icon: "🏠",
    tagline: "Apartments, bedsitters, houses & commercial spaces",
    color: "#3b82f6", // Blue
    badgeBg: "rgba(59, 130, 246, 0.15)",
    badgeBorder: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "Accommodation",
    label: "Accommodation",
    icon: "🛏️",
    tagline: "Hostels, Airbnbs, guest rooms & hotels",
    color: "#a855f7", // Purple
    badgeBg: "rgba(168, 85, 247, 0.15)",
    badgeBorder: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "AxxBiashara",
    label: "AxxBiashara",
    icon: "💼",
    tagline: "Businesses, services, local shops & promotions",
    color: "#f59e0b", // Amber
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeBorder: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "Quick Sales",
    label: "Quick Sales",
    icon: "🏷️",
    tagline: "Electronics, furniture, vehicles & deals",
    color: "#10b981", // Emerald
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeBorder: "rgba(16, 185, 129, 0.4)",
  },
];

export const PROPERTY_TYPES = [
  "Bedsitter",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4+ Bedroom",
  "Single Room",
  "Maisonette",
  "Bungalow",
  "Commercial / Office",
  "Shop Space",
  "Warehouse",
  "Other",
];

export const ACCOMMODATION_TYPES = [
  "Student Hostel",
  "Airbnb / Vacation Rental",
  "Hotel / Lodge",
  "Private Room",
  "Shared Room",
  "Studio Apartment",
];

export const ACCOMMODATION_AMENITIES = [
  "WiFi",
  "Clean Water",
  "24/7 Security",
  "Hot Shower",
  "Free Parking",
  "Backup Generator",
  "Swimming Pool",
  "Gym",
  "Meals Included",
  "Study Room",
  "CCTV Surveillance",
  "Laundry Facilities",
];

export const BUSINESS_TYPES = [
  "Services & Artisans",
  "Retail & Online Shop",
  "Professional Services",
  "Food, Bakery & Restaurant",
  "Tech & Electronics",
  "Health & Beauty",
  "Transport & Logistics",
  "Event & Entertainment",
  "Agriculture & Fresh Produce",
  "Special Promotions & Deals",
  "Other",
];

export const ITEM_CONDITIONS = [
  "Brand New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
  "For Parts / Repair",
];

export function formatPrice(price, priceType, pricePeriod) {
  if (priceType === "contact_for_price") return "Contact for Price";
  if (!price || price === 0) return "Contact for Price";

  const numFormatted = Number(price).toLocaleString("en-KE");
  let periodSuffix = "";
  if (pricePeriod === "per-month") periodSuffix = " / mo";
  if (pricePeriod === "per-night") periodSuffix = " / night";

  let base = `KES ${numFormatted}${periodSuffix}`;
  if (priceType === "negotiable") {
    return `${base} (Neg)`;
  }
  return base;
}

export function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

