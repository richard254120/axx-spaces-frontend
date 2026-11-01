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
  "Airbnb",
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

/* ================================================================
 * CATEGORY-AWARE LISTING PROFILES
 * Every PROPERTY_CATEGORIES label maps to a listing "family". The
 * registration & edit forms use the family profile to tailor labels,
 * pricing language, unit wording, check-in defaults, curated amenity
 * chips and category-specific detail fields (stored as extraDetails),
 * because guests comparing a hostel need different information than
 * guests comparing a city hotel or an all-inclusive beach resort.
 * ================================================================ */

export const CATEGORY_PROFILES = {
  hotel: {
    label: "Hotel-Grade Listing",
    tagline: "You're listing a hotel — the form now asks for what hotel guests compare on: star rating, reception hours, on-site dining and conference capacity.",
    namePlaceholder: "e.g. Panorama Heights City Hotel",
    descPlaceholder: "Describe the hotel: star rating, rooms and suites, restaurants & bars, conference/event capacity, location strengths (CBD, airport, attractions) and what makes guests choose you...",
    unitWord: "room", unitWordPlural: "Rooms",
    roomCountLabel: "Total Guest Rooms *", roomCountPlaceholder: "e.g. 45",
    guestCountLabel: "Max Guests per Room *", guestCountPlaceholder: "e.g. 2",
    priceLabel: "Base Price / Room / Night (KSh) *",
    pricePlaceholder: "e.g. 8500",
    priceHint: "Quote your lowest standard-room nightly rate — hotel guests expect per-room pricing. Add suites and premium categories as Room Types below.",
    checkIn: "14:00", checkOut: "11:00",
    roomTypesTitle: "Room & Suite Categories (recommended)",
    roomTypePlaceholder: "e.g. Deluxe Double / Executive Suite",
    detailsTitle: "Hotel Operational Details",
    amenities: ["WiFi", "24/7 Front Desk", "Restaurant", "Bar / Lounge", "Room Service", "Daily Housekeeping", "Gym", "Conference / Events Hall", "Free Parking", "Airport Transfer", "Power Backup", "Lift / Elevator", "Air Conditioning", "Flat-screen TV"],
    extraFields: [
      { key: "star_rating", label: "Star Rating", type: "select", options: ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"] },
      { key: "reception", label: "Reception", type: "select", options: ["24/7 front desk", "Timed reception (e.g. 6am–10pm)", "Self check-in kiosks"] },
      { key: "dining", label: "Dining On-Site", type: "select", options: ["In-house restaurant", "Restaurant & bar", "Café only", "Breakfast only"] },
      { key: "events", label: "Conference / Event Capacity", type: "text", placeholder: "e.g. 2 halls, up to 300 pax + boardroom" },
    ],
  },
  resort: {
    label: "Resort & Retreat Listing",
    tagline: "Resort guests book experiences, not just rooms — the form now highlights meal plans, waterfront access, and the signature experiences that sell your resort.",
    namePlaceholder: "e.g. Diani Sunset Beach Resort & Spa",
    descPlaceholder: "Describe the resort: setting (beach/lake/forest), meal plan, villas and room categories, pools, spa, water sports, kids facilities and the experiences guests come for...",
    unitWord: "room", unitWordPlural: "Rooms / Villas",
    roomCountLabel: "Total Rooms / Villas *", roomCountPlaceholder: "e.g. 24",
    guestCountLabel: "Max Guests per Room *", guestCountPlaceholder: "e.g. 4",
    priceLabel: "Base Price / Room / Night (KSh) *",
    pricePlaceholder: "e.g. 18000",
    priceHint: "Quote the start rate for a standard room. If you operate half/full board or all-inclusive, say so here and in meal-plan details below — guests filter resorts by it.",
    checkIn: "15:00", checkOut: "10:00",
    roomTypesTitle: "Room, Suite & Villa Categories (recommended)",
    roomTypePlaceholder: "e.g. Ocean View Room / Private Pool Villa",
    detailsTitle: "Resort Experience Details",
    amenities: ["Swimming Pool", "Private Beach Access", "Spa & Wellness", "Kids Club", "Restaurant", "Pool Bar", "All-Inclusive Dining", "Water Sports", "Sunset Deck", "Live Entertainment", "Free Parking", "Game Drives", "Tennis / Golf"],
    extraFields: [
      { key: "meal_plan", label: "Meal Plan", type: "select", options: ["All-inclusive", "Half board (H/B)", "Bed & breakfast", "Self-catering"] },
      { key: "waterfront", label: "Waterfront / Beach Access", type: "select", options: ["Direct private beach / beachfront", "Short walk to the beach", "Lake / river waterfront", "Not waterfront"] },
      { key: "age_policy", label: "Age Policy", type: "select", options: ["All ages — kids club available", "Family-focused", "Adults only (16+)"] },
      { key: "experiences", label: "Signature Experiences", type: "text", placeholder: "e.g. snorkelling, spa rituals, sunset cruises, dhow dinners" },
    ],
  },
  lodge: {
    label: "Lodge & Safari Listing",
    tagline: "Lodge and safari guests book per person, with meals and game viewing in mind — the form now asks for board basis, park proximity and transfers.",
    namePlaceholder: "e.g. Mara Ridge Safari Lodge",
    descPlaceholder: "Describe the lodge: landscape and wildlife, chalets/tents, meal inclusion, game drive and walking schedules, views (waterhole, park) and how guests arrive...",
    unitWord: "unit", unitWordPlural: "Rooms / Chalets / Tents",
    roomCountLabel: "Total Rooms / Chalets / Tents *", roomCountPlaceholder: "e.g. 12",
    guestCountLabel: "Max Guests per Unit *", guestCountPlaceholder: "e.g. 2",
    priceLabel: "Base Price / Person / Night — PPPN (KSh) *",
    pricePlaceholder: "e.g. 12000",
    priceHint: "Safari lodges normally price per person per night including meals. If you price per unit instead, state that in your description.",
    checkIn: "14:00", checkOut: "10:00",
    roomTypesTitle: "Accommodation Units (recommended)",
    roomTypePlaceholder: "e.g. Safari Tent / River-facing Chalet",
    detailsTitle: "Safari & Lodge Operations",
    amenities: ["Restaurant", "Bar", "Fire Place", "Game Drives", "Guided Bush Walks", "Wildlife Viewing Deck", "All Meals Included", "Solar / Eco Power", "Garden Grounds", "Free Parking", "Charging Points", "Sundeck"],
    extraFields: [
      { key: "meals", label: "Included Meals", type: "select", options: ["Full board (all meals)", "Half board", "Bed & breakfast", "Self-catering"] },
      { key: "game", label: "Game Viewing", type: "select", options: ["Game drives included", "Guided walks included", "Park fees separate", "Self-drive access"] },
      { key: "park", label: "Nearest Park / Reserve", type: "text", placeholder: "e.g. 12 km from Masai Mara Main Gate" },
      { key: "transfers", label: "Guest Transfers", type: "select", options: ["Air transfer included", "Road shuttle included", "Guests self-arrange"] },
    ],
  },
  bnb: {
    label: "Holiday Home & Rental Listing",
    tagline: "Airbnb-style guests book whole spaces and care about bedrooms, bathrooms and check-in ease — the form now asks exactly that.",
    namePlaceholder: "e.g. Modern 3-Bed Apartment near Westlands",
    descPlaceholder: "Describe the space guests get: layout, bedrooms and bathrooms, what the neighbourhood offers, what's on the kitchen and self check-in process...",
    unitWord: "unit", unitWordPlural: "Listed Units",
    roomCountLabel: "Total Self-Contained Units *", roomCountPlaceholder: "e.g. 3",
    guestCountLabel: "Max Guests per Unit *", guestCountPlaceholder: "e.g. 4",
    priceLabel: "Base Price / Unit / Night (KSh) *",
    pricePlaceholder: "e.g. 6500",
    priceHint: "Quote the nightly rate for the entire unit (self-catering). Weekly and monthly discounts go in the long-stay field below.",
    checkIn: "15:00", checkOut: "11:00",
    roomTypesTitle: "Units & Layouts (recommended)",
    roomTypePlaceholder: "e.g. Entire 2-Bedroom Apartment / Studio",
    detailsTitle: "Space & Check-in Details",
    amenities: ["WiFi", "Fully Equipped Kitchen", "Washer", "Air Conditioning", "Free Parking", "Hot Water", "Dedicated Workspace", "TV", "Self Check-in", "Family / Kid Friendly", "Long-stay Friendly", "Balcony / Patio"],
    extraFields: [
      { key: "space_type", label: "Space Type", type: "select", options: ["Entire place", "Private room", "Private unit in a shared house"] },
      { key: "bedrooms", label: "Bedrooms", type: "number", placeholder: "e.g. 2" },
      { key: "bathrooms", label: "Bathrooms", type: "number", placeholder: "e.g. 1.5" },
      { key: "checkin_method", label: "Check-in Method", type: "select", options: ["Smart lock — self check-in", "Lockbox / key safe", "Host meets guests in person"] },
      { key: "long_stay", label: "Long-stay Discount", type: "text", placeholder: "e.g. 20% off weekly stays, monthly rate negotiable" },
    ],
  },
  hostel: {
    label: "Hostel & Backpacker Listing",
    tagline: "Hostel guests book beds, not rooms — the form now prices per bed and asks about dorm style, security and 24/7 access.",
    namePlaceholder: "e.g. Nairobi Backpackers Hostel",
    descPlaceholder: "Describe the hostel: dorm layouts, secure lockers, shared kitchen, common room vibe, location for backpackers/students and what's included...",
    unitWord: "bed", unitWordPlural: "Beds",
    roomCountLabel: "Total Beds Available *", roomCountPlaceholder: "e.g. 40",
    guestCountLabel: "Max Guests per Dorm Room *", guestCountPlaceholder: "e.g. 8",
    priceLabel: "Base Price / Bed / Night (KSh) *",
    pricePlaceholder: "e.g. 1200",
    priceHint: "Hostel rates are quoted per bed, per night. Add private rooms as Room Types below with their own per-room price.",
    checkIn: "12:00", checkOut: "10:00",
    roomTypesTitle: "Dorms & Private Rooms (recommended)",
    roomTypePlaceholder: "e.g. 8-Bed Mixed Dorm / Female-only Dorm / Private Single",
    detailsTitle: "Hostel Facilities & Access",
    amenities: ["Free WiFi", "Shared Kitchen", "Lockers", "Common Room", "Laundry", "24/7 Security", "Travel / Tours Desk", "Bedside Power Points", "Hot Showers", "Luggage Storage", "Breakfast Option"],
    extraFields: [
      { key: "dorm_style", label: "Dorm Style", type: "select", options: ["Mixed dorms", "Female-only dorms", "Dorms + private rooms", "Private rooms only"] },
      { key: "beds_per_dorm", label: "Beds per Dorm", type: "number", placeholder: "e.g. 8" },
      { key: "lockers", label: "Lockers & Security", type: "select", options: ["Lockers provided (bring own lock)", "Lockers + padlocks for sale", "24/7 security guard"] },
      { key: "access", label: "Access / Curfew", type: "select", options: ["24/7 key access", "Curfew from 23:00", "Reception hours apply"] },
      { key: "kitchen", label: "Kitchen & Meals", type: "select", options: ["Self-catering kitchen", "BBQ area only", "Meal plan available"] },
    ],
  },
  guesthouse: {
    label: "Guest House & B&B Listing",
    tagline: "Guest house travellers care about en-suite bathrooms, breakfast and host presence — the form now asks those questions.",
    namePlaceholder: "e.g. Nyali Garden Guest House",
    descPlaceholder: "Describe the guest house: number of rooms, en-suite options, breakfast style, how guests enter, parking and whether a host is on-site...",
    unitWord: "room", unitWordPlural: "Rooms",
    roomCountLabel: "Total Guest Rooms *", roomCountPlaceholder: "e.g. 6",
    guestCountLabel: "Max Guests per Room *", guestCountPlaceholder: "e.g. 2",
    priceLabel: "Base Price / Room / Night (KSh) *",
    pricePlaceholder: "e.g. 3500",
    priceHint: "Quote the standard room nightly rate. Mention in your description if breakfast is included — it's a top filter for guest house bookings.",
    checkIn: "13:00", checkOut: "10:00",
    roomTypesTitle: "Room Options (recommended)",
    roomTypePlaceholder: "e.g. Standard Twin / En-suite Double",
    detailsTitle: "Hosting Arrangements",
    amenities: ["Hot Water", "TV Lounge", "Breakfast Option", "Kitchenette", "Quiet Residential Area", "Free Parking", "Separate Entrance", "Daily Housekeeping", "Garden", "WiFi", "Self-catering Option"],
    extraFields: [
      { key: "breakfast", label: "Breakfast", type: "select", options: ["Full breakfast included", "Continental breakfast", "Not included"] },
      { key: "ensuite", label: "En-suite Rooms", type: "text", placeholder: "e.g. 4 of 6 rooms have private bathrooms" },
      { key: "entrance", label: "Guest Entrance", type: "select", options: ["Separate guest entrance", "Shared family entrance", "Self-contained wings"] },
      { key: "host", label: "Host On-site", type: "select", options: ["Host lives on the property", "House manager on-site", "Unattended stays (cleaner only)"] },
    ],
  },
  camping: {
    label: "Camping & Glamping Listing",
    tagline: "Campers book pitches and check ablutions first — the form now prices per pitch and asks about power, washrooms and tent rental.",
    namePlaceholder: "e.g. Lake Nakuru Serene Campsite",
    descPlaceholder: "Describe the camp: pitch sizes and terrain, shade, ablution block distance, power access, security fencing, and whether tents/beds are provided...",
    unitWord: "pitch", unitWordPlural: "Pitches / Sites",
    roomCountLabel: "Total Pitches / Sites *", roomCountPlaceholder: "e.g. 20",
    guestCountLabel: "Max Guests per Pitch *", guestCountPlaceholder: "e.g. 6",
    priceLabel: "Base Price / Pitch / Night (KSh) *",
    pricePlaceholder: "e.g. 1000",
    priceHint: "Campsite rates are per pitch, per night (not per person). Glamping rates with tents included go as Room Types below.",
    checkIn: "12:00", checkOut: "10:00",
    roomTypesTitle: "Pitches & Glamping Options (recommended)",
    roomTypePlaceholder: "e.g. Standard Pitch 4x4m / Safari Tent with Beds",
    detailsTitle: "Camp Infrastructure",
    amenities: ["Secure Fenced Camp", "Shared Washrooms", "Hot Showers", "Cooking / Fire Pits", "Picnic Tables", "Shaded Pitches", "Camp Warden / Security", "Equipment Rental", "Bonfire Evenings", "Water Point", "Toilet Blocks"],
    extraFields: [
      { key: "site_size", label: "Site Sizes", type: "text", placeholder: "e.g. 4x4 m and 6x6 m pitches" },
      { key: "tent_rental", label: "Tent Rental", type: "select", options: ["Tents & beds provided", "Tents only", "Bring your own"] },
      { key: "ablutions", label: "Ablutions", type: "text", placeholder: "e.g. flush toilets + hot showers every 20 metres" },
      { key: "power", label: "Power", type: "select", options: ["Powered sites available", "Solar charging points", "No power"] },
    ],
  },
};

/* label → [family, backend Accommodation type enum] */
export const CATEGORY_PROFILE_INDEX = {
  "Hotel": ["hotel", "hotel"],
  "City Hotel": ["hotel", "city-hotel"],
  "Boutique Hotel": ["hotel", "boutique-hotel"],
  "Airport Hotel": ["hotel", "airport-hotel"],
  "Business Hotel": ["hotel", "business-hotel"],
  "Conference Hotel": ["hotel", "conference-hotel"],
  "Budget Hotel": ["hotel", "hotel"],
  "Motel": ["hotel", "hotel"],
  "Transit Hotel": ["hotel", "hotel"],
  "Capsule Hotel": ["hotel", "hotel"],
  "Heritage Hotel": ["hotel", "hotel"],
  "Historic Inn": ["hotel", "hotel"],
  "Roadside Lodge": ["hotel", "hotel"],
  "Cave Hotel": ["hotel", "hotel"],
  "Ice Hotel": ["hotel", "hotel"],
  "Underwater Hotel": ["hotel", "hotel"],
  "Beach Resort": ["resort", "beach-resort"],
  "Beach Hotel": ["resort", "beach-hotel"],
  "Resort Hotel": ["resort", "resort-hotel"],
  "All-Inclusive Resort": ["resort", "all-inclusive-resort"],
  "Family Resort": ["resort", "family-resort"],
  "Adults Only Resort": ["resort", "adults-only-resort"],
  "Lake Resort": ["resort", "lake-resort"],
  "Island Resort": ["resort", "beach-resort"],
  "Private Island": ["resort", "beach-resort"],
  "Exclusive Retreat": ["resort", "all-inclusive-resort"],
  "Wellness Retreat": ["resort", "all-inclusive-resort"],
  "Spiritual Retreat": ["resort", "all-inclusive-resort"],
  "Mountain Lodge": ["lodge", "mountain-lodge"],
  "Safari Lodge": ["lodge", "safari-lodge"],
  "Game Lodge": ["lodge", "game-lodge"],
  "River Lodge": ["lodge", "river-lodge"],
  "Forest Lodge": ["lodge", "forest-lodge"],
  "Hill Station": ["lodge", "hill-station"],
  "Eco Lodge": ["lodge", "eco-lodge"],
  "Safari Camp": ["lodge", "safari-camp"],
  "Luxury Tented Camp": ["lodge", "luxury-tented-camp"],
  "Bush Camp": ["lodge", "bush-camp"],
  "Luxury Safari": ["lodge", "safari-lodge"],
  "Airbnb": ["bnb", "bnb"],
  "Vacation Rental": ["bnb", "bnb"],
  "Apartment": ["bnb", "apartment"],
  "Serviced Apartment": ["bnb", "apartment"],
  "Studio": ["bnb", "apartment"],
  "Condo": ["bnb", "apartment"],
  "Villa": ["bnb", "villa"],
  "Penthouse": ["bnb", "villa"],
  "Holiday Home": ["bnb", "holiday-home"],
  "Timeshare": ["bnb", "holiday-home"],
  "Cottage": ["bnb", "cottage"],
  "Treehouse": ["bnb", "treehouse"],
  "Treehouse Lodge": ["bnb", "treehouse"],
  "Guest House": ["guesthouse", "guesthouse"],
  "Bed & Breakfast": ["guesthouse", "bnb"],
  "Farm Stay": ["guesthouse", "guesthouse"],
  "Homestay": ["guesthouse", "guesthouse"],
  "Hostel": ["hostel", "hostel"],
  "Backpackers Hostel": ["hostel", "hostel"],
  "Youth Hostel": ["hostel", "hostel"],
  "Camping Grounds": ["camping", "camping-grounds"],
  "Glamping Site": ["camping", "glamping-site"],
  "Desert Camp": ["camping", "safari-camp"],
};

/* Neutral fallback used before a category is chosen / for unknown labels */
export const GENERIC_PROFILE = {
  label: "Accommodation Listing",
  tagline: "",
  namePlaceholder: "e.g. Sunrise Beach Resort",
  descPlaceholder: "Describe your property, unique features, nearby attractions, experiences offered...",
  unitWord: "room", unitWordPlural: "Rooms",
  roomCountLabel: "Total Rooms *", roomCountPlaceholder: "e.g. 10",
  guestCountLabel: "Max Guests per Room *", guestCountPlaceholder: "e.g. 2",
  priceLabel: "Base Price / Night (KSh) *",
  pricePlaceholder: "e.g. 8500",
  priceHint: "",
  checkIn: "14:00", checkOut: "11:00",
  roomTypesTitle: "Room Types (optional)",
  roomTypePlaceholder: "Room type name (e.g. Deluxe Suite)",
  detailsTitle: "",
  amenities: AMENITIES_LIST,
  extraFields: [],
};

/** Resolve a profile from a PROPERTY_CATEGORIES label (never throws) */
export function getCategoryProfile(label) {
  const entry = label ? CATEGORY_PROFILE_INDEX[label] : null;
  if (!entry) return { ...GENERIC_PROFILE, family: "general", type: "hotel" };
  const [family, type] = entry;
  return { ...GENERIC_PROFILE, ...(CATEGORY_PROFILES[family] || {}), family, type };
}

/** Resolve a profile from a backend accommodation `type` enum value */
export function getProfileForType(type) {
  if (!type) return { ...GENERIC_PROFILE, family: "general", type: "hotel" };
  const match = Object.values(CATEGORY_PROFILE_INDEX).find(([, t]) => t === type);
  if (!match) return { ...GENERIC_PROFILE, family: "general", type };
  const family = match[0];
  return { ...GENERIC_PROFILE, ...(CATEGORY_PROFILES[family] || {}), family, type };
}

export const REGISTER_STEPS = ["Property", "Location", "Media Upload", "Amenities", "Pricing & Booking", "Review"];

export const INITIAL_REGISTER_FORM = {
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
  totalRooms: "",
  maxGuests: "",
  extraDetails: {},
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
  pending: { label: "Under review", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  pending_review: { label: "Under review", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  approved: { label: "Live", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  active: { label: "Live", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  rejected: { label: "Needs Revision", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  inactive: { label: "Inactive", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
};

/** Used when API is unavailable - now empty to only show approved backend data */
export const FALLBACK_PROPERTIES = [];

export function filterPropertiesLocal(list, { category, maxPrice, minRating, search }) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => {
      if (!category || category === "All") return true;
      const catNorm = category.toLowerCase().replace(/[\s-_]+/g, "");
      const pCat = (p.category || "").toLowerCase().replace(/[\s-_]+/g, "");
      const pType = (p.type || "").toLowerCase().replace(/[\s-_]+/g, "");
      return pCat === catNorm || pType === catNorm || pCat.includes(catNorm) || catNorm.includes(pCat) || pType.includes(catNorm) || catNorm.includes(pType);
    })
    .filter((p) => {
      const price = Number(p.basePrice ?? p.price ?? 0);
      return !maxPrice || price <= maxPrice;
    })
    .filter((p) => {
      if (!minRating) return true;
      const rating = Number(p.rating ?? 0);
      return rating >= minRating;
    })
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const loc = typeof p.location === "object" ? (p.address || "") : (p.location || p.address || "");
      return (
        (p.name || "").toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q) ||
        (p.county || "").toLowerCase().includes(q) ||
        (p.type || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
}
