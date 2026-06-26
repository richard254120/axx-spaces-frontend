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

  // Tourism & Attractions
  "National Park",
  "Wildlife Sanctuary",
  "Conservancy",
  "Game Reserve",
  "Marine Park",
  "Bird Sanctuary",
  "Nature Reserve",
  "Forest Reserve",
  "Botanical Garden",
  "Zoo",
  "Aquarium",
  "Wildlife Orphanage",
  "Animal Sanctuary",

  // Adventure & Activities
  "Adventure Park",
  "Water Park",
  "Theme Park",
  "Safari Operator",
  "Tour Operator",
  "Travel Agency",
  "Car Rental",
  "Bike Rental",
  "Boat Rental",
  "Equipment Rental",
  "Hiking Trail",
  "Mountain Climbing",
  "Rock Climbing",
  "Zip Lining",
  "Bungee Jumping",
  "Skydiving",
  "Hot Air Balloon",
  "Paragliding",
  "Scuba Diving",
  "Snorkeling",
  "Surfing",
  "Fishing",
  "Deep Sea Fishing",
  "Sport Fishing",
  "Bird Watching",
  "Photography Tours",
  "Cultural Tours",
  "Historical Tours",
  "City Tours",
  "Walking Tours",
  "Bicycle Tours",
  "Motorcycle Tours",
  "4x4 Adventures",
  "Off-Roading",
  "Camping Site",
  "RV Park",
  "Caravan Park",

  // Dining & Entertainment
  "Restaurant",
  "Fine Dining Restaurant",
  "Casual Dining",
  "Fast Food",
  "Cafe",
  "Coffee Shop",
  "Bakery",
  "Bar",
  "Pub",
  "Nightclub",
  "Lounge",
  "Wine Bar",
  "Sports Bar",
  "Karaoke Bar",
  "Live Music Venue",
  "Comedy Club",
  "Theater",
  "Cinema",
  "Casino",
  "Discotheque",

  // Wellness & Spa
  "Spa & Wellness Centre",
  "Day Spa",
  "Destination Spa",
  "Medical Spa",
  "Thermal Spa",
  "Hot Springs",
  "Yoga Retreat",
  "Meditation Center",
  "Wellness Resort",
  "Fitness Center",
  "Gym",
  "Health Club",
  "Massage Therapy",
  "Ayurveda Center",
  "Traditional Healing",

  // Events & Venues
  "Conference Center",
  "Event Venue",
  "Wedding Venue",
  "Meeting Facility",
  "Exhibition Center",
  "Convention Center",
  "Banquet Hall",
  "Outdoor Event Space",
  "Garden Venue",
  "Beach Venue",
  "Rooftop Venue",

  // Shopping & Services
  "Shopping Mall",
  "Market",
  "Craft Market",
  "Souvenir Shop",
  "Gift Shop",
  "Art Gallery",
  "Museum",
  "Cultural Center",
  "Heritage Site",
  "Historical Site",

  // Transport & Logistics
  "Airport Transfer",
  "Shuttle Service",
  "Taxi Service",
  "Tour Bus",
  "Charter Service",
  "Ferry Service",
  "Boat Tour",
  "Cruise",
  "Helicopter Tour",
  "Light Aircraft",

  // Special Interest
  "Golf Course",
  "Golf Resort",
  "Tennis Club",
  "Sports Complex",
  "Stadium",
  "Racetrack",
  "Equestrian Center",
  "Horse Riding",
  "Camel Safari",
  "Donkey Trek",

  // Cultural & Community
  "Cultural Village",
  "Community Tourism",
  "Homestay Program",
  "Volunteer Tourism",
  "Eco-Tourism",
  "Sustainable Tourism",
  "Responsible Tourism",

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
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Laikipia", "Kajiado",
  "Narok", "Kwale", "Kilifi", "Lamu", "Nyeri", "Samburu", "Machakos",
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
