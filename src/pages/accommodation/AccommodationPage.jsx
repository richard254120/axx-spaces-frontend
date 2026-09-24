import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  useAccommodationHome,
  DEFAULT_CATEGORIES,
  ADVERTISING_PACKAGES,
} from "../../features/accommodation";
import SocialMediaLinks from "../../components/SocialMediaLinks";

// Popular Kenyan destinations for quick filter & suggestions
const POPULAR_DESTINATIONS = [
  { name: "Nairobi", county: "Nairobi County", type: "City & Skyline", icon: "🏙️" },
  { name: "Diani Beach", county: "Kwale County", type: "Beach & Coast", icon: "🏖️" },
  { name: "Mombasa", county: "Mombasa County", type: "Coastal Heritage", icon: "🌊" },
  { name: "Maasai Mara", county: "Narok County", type: "Wildlife Safari", icon: "🦁" },
  { name: "Naivasha", county: "Nakuru County", type: "Lakes & Geothermal", icon: "🦩" },
  { name: "Watamu", county: "Kilifi County", type: "Marine Reserve & Coral", icon: "🐠" },
  { name: "Nanyuki", county: "Laikipia County", type: "Mount Kenya & Wildlife", icon: "⛰️" },
  { name: "Lamu", county: "Lamu County", type: "Swahili Cultural Island", icon: "⛵" },
  { name: "Amboseli", county: "Kajiado County", type: "Kilimanjaro Views", icon: "🐘" },
  { name: "Nakuru", county: "Nakuru County", type: "National Park & Rift", icon: "🌿" },
  { name: "Malindi", county: "Kilifi County", type: "Tropical Ocean & Cuisine", icon: "🌴" },
  { name: "Kisumu", county: "Kisumu County", type: "Lake Victoria Sunsets", icon: "⛵" },
];

const DESTINATION_NAMES = POPULAR_DESTINATIONS.map((d) => d.name);

// Curated stay categories with high-definition imagery and stay counts
const STAY_CATEGORIES = [
  {
    id: "beach-resorts",
    name: "Beach Resorts & Villas",
    filterName: "Beach Resort",
    count: "68+ Stays",
    tag: "Coastal Luxury",
    desc: "Indian Ocean shores, private infinity pools & Swahili hospitality",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    color: "#06b6d4",
  },
  {
    id: "safari-camps",
    name: "Safari Camps & Game Lodges",
    filterName: "Safari Camp",
    count: "54+ Stays",
    tag: "Big Five Wildlife",
    desc: "Luxury tented camps in Maasai Mara, Amboseli & Samburu",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    color: "#16a34a",
  },
  {
    id: "mountain-lodges",
    name: "Mountain Lodges & Cabins",
    filterName: "Mountain Lodge",
    count: "32+ Stays",
    tag: "Highland Retreats",
    desc: "Cozy timber fireplaces under Mount Kenya & the Aberdares",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    color: "#8b5cf6",
  },
  {
    id: "city-hotels",
    name: "City Hotels & Penthouses",
    filterName: "City Hotel",
    count: "95+ Stays",
    tag: "Metropolitan",
    desc: "Sleek suites, high-speed WiFi & skyline views in Nairobi & Mombasa",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    color: "#f59e0b",
  },
  {
    id: "eco-lodges",
    name: "Eco-Lodges & Glamping",
    filterName: "Eco Lodge",
    count: "29+ Stays",
    tag: "Nature Escapes",
    desc: "Off-grid serenity and geothermal spas around Lake Naivasha & Elementaita",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    color: "#059669",
  },
  {
    id: "boutique-villas",
    name: "Boutique Villas & Airbnb",
    filterName: "Boutique Hotel",
    count: "110+ Stays",
    tag: "Private Getaways",
    desc: "Entire homes, serviced holiday rentals and private chef villas",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    color: "#ec4899",
  },
];

// Rich fallback properties for Kenya when API is warming up or empty
const CURATED_KENYA_PROPERTIES = [
  {
    _id: "1",
    id: "1",
    name: "Serena Beach Resort & Spa",
    category: "Beach Resort",
    type: "Beach Resort",
    location: "Nyali Beach, Mombasa",
    county: "Mombasa County",
    price: 12500,
    basePrice: 12500,
    rating: 4.8,
    reviews: 312,
    tag: "Top Rated",
    badge: "Verified Host",
    amenities: ["Ocean View", "Pool", "Free WiFi", "Spa", "Breakfast"],
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254700123456",
    color: "#0284c7",
    categoryTab: "beach",
    description: "Swahili-styled coastal architecture fringed with coconut palms along Nyali's white sands.",
  },
  {
    _id: "2",
    id: "2",
    name: "Fairmont Mount Kenya Safari Club",
    category: "Mountain Lodge",
    type: "Mountain Lodge",
    location: "Nanyuki, Equator",
    county: "Laikipia County",
    price: 28000,
    basePrice: 28000,
    rating: 4.9,
    reviews: 198,
    tag: "Luxury",
    badge: "Premier Stay",
    amenities: ["Equator Walk", "Heated Pool", "Fireplace", "Game Drives", "Fine Dining"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254722987654",
    color: "#16a34a",
    categoryTab: "mountain",
    description: "Perched 7,000 feet on the equator with manicured grounds facing snow-capped Mount Kenya peaks.",
  },
  {
    _id: "4",
    id: "4",
    name: "Ol Pejeta Bush Camp",
    category: "Safari Camp",
    type: "Safari Camp",
    location: "Ol Pejeta Conservancy",
    county: "Laikipia County",
    price: 18000,
    basePrice: 18000,
    rating: 4.9,
    reviews: 87,
    tag: "Wildlife Haven",
    badge: "Eco-Certified",
    amenities: ["Big Five Safaris", "Rhino Sanctuary", "Bush Dinners", "Solar Power", "Guide Included"],
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254711554433",
    color: "#d97706",
    categoryTab: "safari",
    description: "Intimate eco-camp along the Ewaso Nyiro River with access to Africa's largest black rhino sanctuary.",
  },
  {
    _id: "5",
    id: "5",
    name: "Diani Palm Breeze Private Villa",
    category: "Beach Resort",
    type: "Beach Villa",
    location: "Diani Beach",
    county: "Kwale County",
    price: 15500,
    basePrice: 15500,
    rating: 4.9,
    reviews: 142,
    tag: "Best Value",
    badge: "Superhost",
    amenities: ["Private Chef", "Private Pool", "Beach Walk 2min", "High-speed WiFi", "AC"],
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254745689773",
    color: "#06b6d4",
    categoryTab: "beach",
    description: "A private 3-bedroom Swahili sanctuary with swimming pool, sun loungers and personal chef service.",
  },
  {
    _id: "6",
    id: "6",
    name: "Enashipai Resort & Geothermal Spa",
    category: "Eco Lodge",
    type: "Lakeside Resort",
    location: "Moi South Lake Rd, Naivasha",
    county: "Nakuru County",
    price: 17200,
    basePrice: 17200,
    rating: 4.7,
    reviews: 264,
    tag: "Weekend Favorite",
    badge: "Verified Host",
    amenities: ["Lake Boat Trips", "Siyara Spa", "Night Club", "Tennis Court", "Kids Play Area"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254705345678",
    color: "#059669",
    categoryTab: "mountain",
    description: "Lakeside luxury surrounded by lush gardens, flamingo waters and Kenya's premier geothermal spa.",
  },
  {
    _id: "7",
    id: "7",
    name: "Tribe Luxury Suites & Residences",
    category: "City Hotel",
    type: "Boutique City Hotel",
    location: "Gigiri, Diplomatic Blue Zone",
    county: "Nairobi County",
    price: 24000,
    basePrice: 24000,
    rating: 4.9,
    reviews: 410,
    tag: "Diplomatic Choice",
    badge: "5-Star Standard",
    amenities: ["Rooftop Bar", "High Security", "Heated Pool", "Jomo Gourmet", "Fast Fiber WiFi"],
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    whatsapp: "254733998877",
    color: "#6366f1",
    categoryTab: "city",
    description: "Award-winning boutique design hotel adjacent to the Village Market with handcrafted African art.",
  },
];

// Verified Guest Testimonials
const GUEST_TESTIMONIALS = [
  {
    name: "Wanjiru Mwangi",
    location: "Nairobi, Kenya",
    stay: "Stayed at Serena Beach Resort, Mombasa",
    text: "Booking directly with the resort via AXXSpace saved us over KSh 8,000 in agency fees! The host responded on WhatsApp within two minutes. Check-in was flawless and the ocean views were breathtaking.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    verified: true,
  },
  {
    name: "Dr. Kevin Ochieng",
    location: "Kisumu, Kenya",
    stay: "Stayed at Ol Pejeta Bush Camp, Nanyuki",
    text: "The direct communication with the lodge manager gave us real-time road updates during the rainy season. Seeing the northern white rhinos was a spiritual experience. AXXSpace is our go-to for safari bookings!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    verified: true,
  },
  {
    name: "Elena & Marcus Becker",
    location: "Berlin, Germany",
    stay: "Stayed at Diani Palm Breeze Villa",
    text: "We wanted a verified private villa for 10 days in Diani. The photos matched 100%, the private chef cooked mouth-watering Swahili fish curry, and M-Pesa payment was secure and simple. 10/10 experience!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    verified: true,
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: "How does booking through AXXSpace Accommodation work?",
    a: "AXXSpace connects you directly with verified property owners, managers, and hospitality providers in Kenya. You can browse stays, review room types and amenities, and contact the host directly via WhatsApp or phone call with 0% middleman commission. You negotiate and pay directly to the verified accommodation!",
  },
  {
    q: "Are the properties and hosts physically verified?",
    a: "Yes. Every property listed under AXXSpace undergoes verification by our Kenyan field agents. We verify physical location, real photo accuracy, host identity, and valid hospitality operating permits before listings go live.",
  },
  {
    q: "Can I pay using M-Pesa or Card?",
    a: "Absolutely! Most Kenyan properties support direct Lipa na M-Pesa (Buy Goods Till / Paybill) as well as Visa, Mastercard, and bank wire transfers. Because you deal directly with the host, you receive immediate official payment receipts.",
  },
  {
    q: "How can I list my hotel, villa, or Airbnb on AXXSpace?",
    a: "Listing takes only 3 minutes! Click 'List Your Property' at the top, create your host profile, upload high-resolution photos, set your room rates, and provide your WhatsApp contact number. Our team reviews and activates your listing within 24 hours.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Each property publishes its own transparent cancellation policy on its detail page (typically free cancellation up to 48 or 72 hours before check-in). Since you are in direct contact with the host on WhatsApp, rescheduling dates is flexible and hassle-free.",
  },
  {
    q: "Do guests pay any service charges or hidden fees?",
    a: "No! Unlike foreign booking portals that add 15% to 20% in guest service fees at checkout, AXXSpace charges guests ZERO commission. The price you agree with the host is the exact price you pay.",
  },
];

// Helper: Count up animation on scroll
function AnimatedCounter({ value, duration = 1600 }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);

  useEffect(() => {
    const rawStr = String(value);
    const match = rawStr.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(rawStr);
      return;
    }
    const target = parseFloat(match[1]);
    const suffix = match[2] || "";
    const decimals = (match[1].split(".")[1] || "").length;

    let startTime = null;
    let frameId = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const step = (time) => {
          if (!startTime) startTime = time;
          const progress = Math.min((time - startTime) / duration, 1);
          // Ease out cubic
          const current = target * (1 - Math.pow(1 - progress, 3));
          setDisplay(current.toFixed(decimals) + suffix);
          if (progress < 1) {
            frameId = requestAnimationFrame(step);
          } else {
            setDisplay(target.toFixed(decimals) + suffix);
          }
        };
        frameId = requestAnimationFrame(step);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { featured: backendFeatured, stats: heroStats } = useAccommodationHome();

  // Search Bar State
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState({ adults: 2, children: 0, rooms: 1 });
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Filter & Nav State
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [howItWorksTab, setHowItWorksTab] = useState("guests"); // "guests" | "hosts"
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Wishlist / Favorites State
  const [favs, setFavs] = useState(() => {
    try {
      const stored = localStorage.getItem("axx_accommodation_favs");
      return stored ? JSON.parse(stored) : ["1", "4"];
    } catch {
      return ["1", "4"];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Marquee pause & drag state
  const [marqueePaused, setMarqueePaused] = useState(false);
  const marqueeRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Budget Planner State
  const [plannerDestination, setPlannerDestination] = useState("Coast (Diani / Mombasa)");
  const [plannerNights, setPlannerNights] = useState(3);
  const [plannerStyle, setPlannerStyle] = useState("comfort"); // "budget" | "comfort" | "luxury"

  // Merge backend properties with high-definition curated properties
  const allProperties = useMemo(() => {
    if (backendFeatured && backendFeatured.length > 0) {
      // Map backend properties and fill any missing fields with defaults
      const mappedBackend = backendFeatured.map((p, idx) => ({
        _id: p._id || p.id || `backend-${idx}`,
        id: p._id || p.id || `backend-${idx}`,
        name: p.name || "Kenyan Stay",
        category: p.category || p.type || "Accommodation",
        type: p.type || p.category || "Hotel",
        location: typeof p.location === "object" ? p.address || p.county : p.location || p.address || "Kenya",
        county: p.county || "Kenya",
        price: p.basePrice || p.price || 8500,
        basePrice: p.basePrice || p.price || 8500,
        rating: p.rating || 4.8,
        reviews: p.reviews || 24,
        tag: p.tag || "Verified",
        badge: "Verified Host",
        amenities: p.amenities && p.amenities.length > 0 ? p.amenities.slice(0, 5) : ["WiFi", "Pool", "Parking"],
        image: p.images && p.images[0]?.imageUrl ? p.images[0].imageUrl : (typeof p.images?.[0] === 'string' ? p.images[0] : (p.image || CURATED_KENYA_PROPERTIES[idx % CURATED_KENYA_PROPERTIES.length].image)),
        whatsapp: p.whatsapp || p.phone || "254745689773",
        color: p.color || "#4f46e5",
        categoryTab: (p.category || p.type || "")?.toLowerCase().includes("beach") ? "beach" : (p.category || p.type || "")?.toLowerCase().includes("safari") ? "safari" : (p.category || p.type || "")?.toLowerCase().includes("mountain") || (p.category || p.type || "")?.toLowerCase().includes("lake") ? "mountain" : "city",
        description: p.description || "Comfortable stay with verified Kenyan hospitality.",
      }));

      // If backend has fewer than 4 properties, supplement with curated stays for rich visuals
      if (mappedBackend.length < 4) {
        return [...mappedBackend, ...CURATED_KENYA_PROPERTIES.slice(mappedBackend.length)];
      }
      return mappedBackend;
    }
    return CURATED_KENYA_PROPERTIES;
  }, [backendFeatured]);

  // Filtered properties based on in-place category tab
  const displayedProperties = useMemo(() => {
    if (activeCategoryTab === "all") return allProperties;
    if (activeCategoryTab === "beach") {
      return allProperties.filter(
        (p) =>
          p.categoryTab === "beach" ||
          p.category?.toLowerCase().includes("beach") ||
          p.location?.toLowerCase().includes("mombasa") ||
          p.location?.toLowerCase().includes("diani") ||
          p.location?.toLowerCase().includes("watamu")
      );
    }
    if (activeCategoryTab === "safari") {
      return allProperties.filter(
        (p) =>
          p.categoryTab === "safari" ||
          p.category?.toLowerCase().includes("safari") ||
          p.category?.toLowerCase().includes("camp") ||
          p.location?.toLowerCase().includes("mara") ||
          p.location?.toLowerCase().includes("laikipia")
      );
    }
    if (activeCategoryTab === "mountain") {
      return allProperties.filter(
        (p) =>
          p.categoryTab === "mountain" ||
          p.category?.toLowerCase().includes("mountain") ||
          p.category?.toLowerCase().includes("lake") ||
          p.location?.toLowerCase().includes("naivasha") ||
          p.location?.toLowerCase().includes("nanyuki")
      );
    }
    if (activeCategoryTab === "city") {
      return allProperties.filter(
        (p) =>
          p.categoryTab === "city" ||
          p.category?.toLowerCase().includes("city") ||
          p.location?.toLowerCase().includes("nairobi")
      );
    }
    return allProperties;
  }, [allProperties, activeCategoryTab]);

  // Wishlist items detailed list
  const wishlistProperties = useMemo(() => {
    return allProperties.filter((p) => favs.includes(p._id || p.id));
  }, [allProperties, favs]);

  // Handle Scroll Progress, Header Shadow & Reveal Animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollY > 20);
      setShowTopBtn(scrollY > 400);
      setScrollProgress(totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for .reveal animations
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [displayedProperties, activeCategoryTab]);

  // Close search popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDestDropdown(false);
        setShowGuestsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Wishlist toggle with toast
  const toggleFavorite = (e, id, name) => {
    e.stopPropagation();
    let updated;
    if (favs.includes(id)) {
      updated = favs.filter((x) => x !== id);
      showToast(`Removed from your wishlist`);
    } else {
      updated = [...favs, id];
      showToast(`Saved "${name || 'Property'}" to wishlist ❤️`);
    }
    setFavs(updated);
    try {
      localStorage.setItem("axx_accommodation_favs", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  // Perform search & navigate to listings with parameters
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams();
    if (destination.trim()) query.set("search", destination.trim());
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    const totalGuests = guestsCount.adults + guestsCount.children;
    if (totalGuests > 0) query.set("guests", totalGuests);

    setShowDestDropdown(false);
    setShowGuestsDropdown(false);
    navigate(`/accommodation/listings?${query.toString()}`);
  };

  // Destination Pill click
  const handleDestinationSelect = (destName) => {
    setDestination(destName);
    setShowDestDropdown(false);
    navigate(`/accommodation/listings?area=${encodeURIComponent(destName)}&search=${encodeURIComponent(destName)}`);
  };

  // Category Card click
  const handleCategorySelect = (categoryOption) => {
    navigate(`/accommodation/listings?category=${encodeURIComponent(categoryOption.filterName || categoryOption.name)}`);
  };

  // Direct WhatsApp contact with pre-filled message
  const handleWhatsAppContact = (e, prop) => {
    e.stopPropagation();
    const cleanPhone = (prop.whatsapp || "254745689773").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hi! I saw ${prop.name} on AXXSpace Accommodation. I would like to inquire about booking availability and rates.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  // Format guests label
  const guestsLabel = `${guestsCount.adults + guestsCount.children} guest${
    guestsCount.adults + guestsCount.children > 1 ? "s" : ""
  }, ${guestsCount.rooms} room${guestsCount.rooms > 1 ? "s" : ""}`;

  // Budget Planner Calculation
  const estimatedNightlyRate =
    plannerStyle === "budget" ? 4500 : plannerStyle === "comfort" ? 12000 : 28000;
  const totalEstimatedStay = estimatedNightlyRate * plannerNights;

  return (
    <div className="accommodation-root" style={s.root}>
      <style>{customStyles}</style>

      {/* ── TOP SCROLL PROGRESS BAR ── */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP NAVIGATION ── */}
      <header className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div style={s.navInner}>
          {/* Logo */}
          <div style={s.logoWrapper} onClick={() => navigate("/accommodation")}>
            <img
              src="/tourism.png"
              alt="AXX Tourism"
              style={s.logoImg}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div style={s.logoTextGroup}>
              <div style={s.logoTitle}>
                <span style={s.logoAxx}>AXX</span>
                <span style={s.logoSpace}>SPACE</span>
              </div>
              <span style={s.logoSubline}>Accommodation</span>
            </div>
            <span className="county-badge">Kenya · 47 Counties</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-links">
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => navigate("/accommodation/listings")}
            >
              Explore Stays
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                const el = document.getElementById("categories-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Experiences
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                const el = document.getElementById("budget-planner");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Budget Planner
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                const el = document.getElementById("packages-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              For Hosts
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                const el = document.getElementById("faq-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div style={s.navRightGroup}>
            {/* Wishlist Button with Counter */}
            <button
              type="button"
              className="wishlist-trigger-btn"
              onClick={() => setWishlistDrawerOpen(true)}
              title="Saved Stays"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill={favs.length > 0 ? "#e11d48" : "none"} stroke={favs.length > 0 ? "#e11d48" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="wishlist-badge-count">{favs.length}</span>
            </button>

            {user ? (
              <div style={s.userGroup}>
                <button
                  type="button"
                  style={s.dashboardBtn}
                  onClick={() => navigate("/accommodation/dashboard")}
                >
                  Dashboard
                </button>
                <div style={s.userAvatar} title={user.name || "User"}>
                  {(user.name || "U")[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="sign-in-btn"
                  onClick={() => navigate("/accommodation/login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="list-property-btn"
                  onClick={() => navigate("/accommodation/register-property")}
                >
                  <span>List Your Property</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.2" fill="none">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            <button type="button" onClick={() => { navigate("/accommodation/listings"); setMobileMenuOpen(false); }}>
              Explore All Stays
            </button>
            <button type="button" onClick={() => { document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>
              Categories & Escapes
            </button>
            <button type="button" onClick={() => { document.getElementById("budget-planner")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>
              Kenya Stay Budget Estimator
            </button>
            <button type="button" onClick={() => { document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>
              Host Pricing & Plans
            </button>
            <button type="button" onClick={() => { document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>
              Help & FAQ
            </button>
            <div style={{ height: "1px", background: "#e2e8f0", margin: "8px 0" }} />
            {user ? (
              <button type="button" className="mobile-action-highlight" onClick={() => { navigate("/accommodation/dashboard"); setMobileMenuOpen(false); }}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button type="button" onClick={() => { navigate("/accommodation/login"); setMobileMenuOpen(false); }}>
                  Sign In
                </button>
                <button type="button" className="mobile-action-highlight" onClick={() => { navigate("/accommodation/register-property"); setMobileMenuOpen(false); }}>
                  List Your Property (Host)
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section style={s.heroSection}>
        {/* Dynamic ambient mesh gradients */}
        <div className="hero-glow-blob blob-top-left" />
        <div className="hero-glow-blob blob-bottom-right" />
        <div className="hero-glow-blob blob-center" />

        <div style={s.heroContainer}>
          {/* Trust Floating Tag */}
          <div className="hero-in i1" style={{ display: "inline-flex", justifyContent: "center" }}>
            <div style={s.heroBadgePill}>
              <span style={{ fontSize: "14px" }}>🇰🇪</span>
              <span>Direct Bookings · Verified Kenyan Hosts · 0% Hidden Commission</span>
            </div>
          </div>

          {/* Majestic Hero Headline */}
          <h1 className="hero-in i2" style={s.heroHeading}>
            Discover Kenya's <br />
            <span className="shimmering-gradient-text">Finest Stays & Hidden Escapes</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-in i3" style={s.heroSubtitle}>
            From sun-kissed Diani beachfront villas and Great Rift Valley safari lodges to chic Nairobi skyline penthouses. Connect directly with verified owners on WhatsApp with zero middleman markups.
          </p>

          {/* ── MULTI-SEGMENT SEARCH ENGINE ── */}
          <div ref={searchContainerRef} className="search-bar-shell hero-in i4">
            <form onSubmit={handleSearchSubmit} style={s.searchBarInner}>
              {/* Segment 1: Destination */}
              <div
                className="search-segment-box"
                onClick={() => {
                  setShowDestDropdown(!showDestDropdown);
                  setShowGuestsDropdown(false);
                }}
              >
                <div style={s.segmentIconHolder}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.segmentLabel}>WHERE TO?</div>
                  <input
                    type="text"
                    placeholder="Search city, beach, or safari park…"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={s.segmentInputField}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setShowDestDropdown(true)}
                  />
                </div>
                {destination && (
                  <button
                    type="button"
                    style={s.clearInputBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestination("");
                    }}
                  >
                    ✕
                  </button>
                )}

                {/* Destination Suggestions Popover */}
                {showDestDropdown && (
                  <div className="dest-dropdown-popover">
                    <div style={s.destDropdownHeader}>
                      <span>🔥 POPULAR KENYAN DESTINATIONS</span>
                    </div>
                    <div style={s.destDropdownList}>
                      {POPULAR_DESTINATIONS.filter(
                        (d) =>
                          !destination ||
                          d.name.toLowerCase().includes(destination.toLowerCase()) ||
                          d.county.toLowerCase().includes(destination.toLowerCase())
                      ).map((dest) => (
                        <div
                          key={dest.name}
                          className="dest-dropdown-item"
                          onClick={() => {
                            setDestination(dest.name);
                            setShowDestDropdown(false);
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{dest.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{dest.name}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{dest.county} · {dest.type}</div>
                          </div>
                          <span style={{ fontSize: "11px", color: "#4f46e5", fontWeight: 700 }}>Select →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Segment 2: Check-In */}
              <div className="search-segment-box">
                <div style={s.segmentIconHolder}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.segmentLabel}>CHECK-IN</div>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={s.segmentInputField}
                  />
                </div>
              </div>

              {/* Segment 3: Check-Out */}
              <div className="search-segment-box">
                <div style={s.segmentIconHolder}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M12 14l2 2 4-4" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.segmentLabel}>CHECK-OUT</div>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={s.segmentInputField}
                  />
                </div>
              </div>

              {/* Segment 4: Guests & Rooms */}
              <div
                className="search-segment-box"
                onClick={() => {
                  setShowGuestsDropdown(!showGuestsDropdown);
                  setShowDestDropdown(false);
                }}
              >
                <div style={s.segmentIconHolder}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.segmentLabel}>GUESTS & ROOMS</div>
                  <div style={{ ...s.segmentInputField, display: "flex", alignItems: "center" }}>
                    {guestsLabel}
                  </div>
                </div>

                {/* Guests Popover Stepper */}
                {showGuestsDropdown && (
                  <div className="guests-dropdown-popover" onClick={(e) => e.stopPropagation()}>
                    <div style={s.guestStepperRow}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Adults</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Age 13 or above</div>
                      </div>
                      <div style={s.stepperControls}>
                        <button
                          type="button"
                          disabled={guestsCount.adults <= 1}
                          onClick={() => setGuestsCount((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                          style={s.stepperBtn}
                        >
                          -
                        </button>
                        <span style={s.stepperNum}>{guestsCount.adults}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, adults: g.adults + 1 }))}
                          style={s.stepperBtn}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={s.guestStepperRow}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Children</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Ages 0 - 12</div>
                      </div>
                      <div style={s.stepperControls}>
                        <button
                          type="button"
                          disabled={guestsCount.children <= 0}
                          onClick={() => setGuestsCount((g) => ({ ...g, children: Math.max(0, g.children - 1) }))}
                          style={s.stepperBtn}
                        >
                          -
                        </button>
                        <span style={s.stepperNum}>{guestsCount.children}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, children: g.children + 1 }))}
                          style={s.stepperBtn}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={s.guestStepperRow}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Rooms</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Bedrooms / Suites</div>
                      </div>
                      <div style={s.stepperControls}>
                        <button
                          type="button"
                          disabled={guestsCount.rooms <= 1}
                          onClick={() => setGuestsCount((g) => ({ ...g, rooms: Math.max(1, g.rooms - 1) }))}
                          style={s.stepperBtn}
                        >
                          -
                        </button>
                        <span style={s.stepperNum}>{guestsCount.rooms}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, rooms: g.rooms + 1 }))}
                          style={s.stepperBtn}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={s.guestsDoneBtn}
                      onClick={() => setShowGuestsDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Search Button */}
              <button type="submit" className="hero-search-submit-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search Stays</span>
              </button>
            </form>
          </div>

          {/* Quick Search Tag Pills under Search */}
          <div className="hero-quick-tags hero-in i4">
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>Quick Hotspots:</span>
            {["Diani Beach", "Maasai Mara", "Naivasha", "Nairobi Suites", "Watamu", "Nanyuki"].map((h) => (
              <button
                key={h}
                type="button"
                className="quick-hotspot-pill"
                onClick={() => handleDestinationSelect(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS TICKER / MARQUEE ── */}
      <section
        className="destinations-marquee-section"
        ref={marqueeRef}
        onMouseEnter={() => setMarqueePaused(true)}
        onMouseLeave={() => setMarqueePaused(false)}
      >
        <div className="marquee-outer-container">
          <div className="marquee-label-chip">POPULAR ACROSS KENYA</div>
          <div
            className="marquee-track-scroll"
            style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
          >
            {[...POPULAR_DESTINATIONS, ...POPULAR_DESTINATIONS].map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                type="button"
                className="marquee-pill-btn"
                onClick={() => handleDestinationSelect(item.name)}
              >
                <span style={{ marginRight: "6px" }}>{item.icon}</span>
                <span style={{ fontWeight: 700 }}>{item.name}</span>
                <span className="marquee-county-tag">{item.county.replace(" County", "")}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR (ANIMATED COUNTERS) ── */}
      <section style={s.statsBarSection}>
        <div style={s.statsGrid}>
          <div className="stat-card-item reveal">
            <div style={{ ...s.statIconBox, background: "#e0e7ff", color: "#4f46e5" }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M7 21V3h10v18M11 7h2M11 11h2M11 15h2" />
              </svg>
            </div>
            <div>
              <div style={s.statValueNumber}>
                <AnimatedCounter value="500+" />
              </div>
              <div style={s.statLabelText}>Properties Listed</div>
              <div style={s.statSubText}>Hotels, lodges & holiday homes</div>
            </div>
          </div>

          <div className="stat-card-item reveal">
            <div style={{ ...s.statIconBox, background: "#dcfce7", color: "#16a34a" }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>
            <div>
              <div style={s.statValueNumber}>
                <AnimatedCounter value="47" />
              </div>
              <div style={s.statLabelText}>Counties Covered</div>
              <div style={s.statSubText}>Coast to Rift Valley & Highlands</div>
            </div>
          </div>

          <div className="stat-card-item reveal">
            <div style={{ ...s.statIconBox, background: "#fef3c7", color: "#d97706" }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={s.statValueNumber}>
                <AnimatedCounter value="28K+" />
              </div>
              <div style={s.statLabelText}>Monthly Travelers</div>
              <div style={s.statSubText}>Direct inquiry connections</div>
            </div>
          </div>

          <div className="stat-card-item reveal">
            <div style={{ ...s.statIconBox, background: "#fee2e2", color: "#e11d48" }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <div style={s.statValueNumber}>
                <AnimatedCounter value="4.9" />★
              </div>
              <div style={s.statLabelText}>Average Host Rating</div>
              <div style={s.statSubText}>Verified guest reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES SHOWCASE SECTION ── */}
      <section id="categories-section" style={s.section}>
        <div style={s.sectionInner}>
          <div className="section-head-split reveal">
            <div>
              <span className="section-eyebrow">CURATED BY TRAVEL EXPERIENCE</span>
              <h2 style={s.sectionHeading}>Browse Stays by Stay Type & Vibe</h2>
              <p style={s.sectionSubheading}>
                Whether you crave powdery Indian Ocean sand, Big Five safari dawns, or a serene mountain cabin with a fireplace.
              </p>
            </div>
            <button
              type="button"
              className="view-all-pill-btn"
              onClick={() => navigate("/accommodation/listings")}
            >
              Explore All Categories →
            </button>
          </div>

          <div className="category-cards-grid">
            {STAY_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.id}
                className="stay-cat-card reveal"
                style={{ animationDelay: `${idx * 0.08}s` }}
                onClick={() => handleCategorySelect(cat)}
              >
                <div className="stay-cat-img-wrapper">
                  <img src={cat.image} alt={cat.name} className="stay-cat-bg-img" loading="lazy" />
                  <div className="stay-cat-gradient-overlay" />
                  <div className="stay-cat-tag-pill" style={{ background: cat.color }}>
                    {cat.tag}
                  </div>
                  <div className="stay-cat-count-badge">{cat.count}</div>
                </div>
                <div className="stay-cat-info">
                  <h3 style={s.catCardTitle}>{cat.name}</h3>
                  <p style={s.catCardDesc}>{cat.desc}</p>
                  <div className="cat-explore-link">
                    <span>View properties</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ACCOMMODATIONS WITH IN-PLACE TABS ── */}
      <section id="featured-section" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <div className="section-head-split reveal">
            <div>
              <span className="section-eyebrow">HANDPICKED FOR EXCELLENCE</span>
              <h2 style={s.sectionHeading}>Featured Kenyan Accommodations</h2>
              <p style={s.sectionSubheading}>
                Top-rated properties with verified host status, direct WhatsApp contact, and glowing guest ratings.
              </p>
            </div>

            {/* In-Place Category Filter Tabs */}
            <div className="featured-category-filter-tabs">
              {[
                { id: "all", label: "All Stays" },
                { id: "beach", label: "🏖️ Beachfront" },
                { id: "safari", label: "🦁 Safari & Bush" },
                { id: "mountain", label: "⛰️ Lakes & Mountains" },
                { id: "city", label: "🏙️ City Luxury" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`filter-tab-pill ${activeCategoryTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveCategoryTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className="properties-listing-grid">
            {displayedProperties.map((prop, idx) => {
              const isFav = favs.includes(prop._id || prop.id);
              return (
                <div
                  key={prop._id || prop.id || idx}
                  className="property-card-deluxe reveal"
                  style={{ animationDelay: `${(idx % 3) * 0.12}s` }}
                  onClick={() => navigate(`/accommodation/${prop._id || prop.id}`)}
                >
                  {/* Card Image Banner */}
                  <div className="prop-image-frame">
                    <img
                      src={prop.image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                      alt={prop.name}
                      className="prop-main-photo"
                      loading="lazy"
                    />
                    <div className="prop-badge-strip">
                      <span className="prop-category-tag">{prop.type || prop.category}</span>
                      {prop.tag && <span className="prop-highlight-tag">{prop.tag}</span>}
                      {prop.videos && prop.videos.length > 0 && (
                        <span className="prop-video-tag" style={{ background: "rgba(15, 23, 42, 0.85)", color: "#38bdf8", fontWeight: 800 }}>
                          🎬 Video Tour
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      className={`prop-fav-button ${isFav ? "active" : ""}`}
                      onClick={(e) => toggleFavorite(e, prop._id || prop.id, prop.name)}
                      aria-label="Save to Wishlist"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill={isFav ? "#e11d48" : "none"} stroke={isFav ? "#e11d48" : "currentColor"} strokeWidth="2.4">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div style={s.propCardBody}>
                    <div style={s.propLocationRow}>
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="#4f46e5" strokeWidth="2.5" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={s.propLocationText}>{prop.location}</span>
                    </div>

                    <h3 style={s.propCardName}>{prop.name}</h3>

                    {/* Amenity tags */}
                    <div style={s.propAmenitiesWrap}>
                      {(prop.amenities || ["WiFi", "Pool", "Parking"]).slice(0, 3).map((am) => (
                        <span key={am} style={s.amenityChip}>
                          ✓ {am}
                        </span>
                      ))}
                      {prop.amenities && prop.amenities.length > 3 && (
                        <span style={s.amenityChipMore}>+{prop.amenities.length - 3} more</span>
                      )}
                    </div>

                    <div style={s.propCardDivider} />

                    {/* Price and Rating row */}
                    <div style={s.propPriceRatingRow}>
                      <div>
                        <span style={s.propPriceText}>KSh {(prop.price || prop.basePrice || 0).toLocaleString()}</span>
                        <span style={s.propPerNight}>/ night</span>
                      </div>
                      <div style={s.propRatingBadge}>
                        <span style={{ color: "#f59e0b", fontSize: "14px" }}>★</span>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>{prop.rating || "4.8"}</span>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>({prop.reviews || "24"})</span>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div style={s.cardActionsRow}>
                      <button
                        type="button"
                        className="card-primary-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/accommodation/${prop._id || prop.id}`);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="card-whatsapp-direct-btn"
                        title="Inquire directly on WhatsApp"
                        onClick={(e) => handleWhatsAppContact(e, prop)}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.72 1.33-1.37 1.57-.45.17-.98.24-3.16-.62-2.34-.92-3.83-3.32-3.95-3.48-.12-.16-.95-1.26-.95-2.4 0-1.14.6-1.7.81-1.93.21-.23.46-.29.62-.29.15 0 .31 0 .44.01.14.01.32-.05.5.38.18.44.62 1.51.68 1.62.06.12.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.91.81 1.67 1.06 1.91 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.19 1.3z" />
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "44px" }}>
            <button
              type="button"
              className="view-all-stays-cta"
              onClick={() => navigate("/accommodation/listings")}
            >
              <span>Explore All 500+ Verified Stays in Kenya</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── SPECIAL DEALS & FLASH OFFERS BANNER ── */}
      <section style={{ ...s.section, paddingTop: 0, paddingBottom: "60px" }}>
        <div style={s.sectionInner}>
          <div className="flash-deal-banner-card reveal">
            <div className="flash-deal-left">
              <div className="deal-badge-pill">⚡ LIMITED WEEKEND ESCAPES</div>
              <h2 className="deal-title">Save Up to 25% on Direct Bookings This Month</h2>
              <p className="deal-desc">
                Exclusive direct host specials in Diani Beach, Naivasha, and the Maasai Mara. Connect directly, avoid third-party agency surcharges, and enjoy complimentary breakfast or sunset game drives.
              </p>
              <div className="deal-cta-row">
                <button
                  type="button"
                  className="deal-claim-btn"
                  onClick={() => navigate("/accommodation/listings?sort=Price:+Low+to+High")}
                >
                  Browse Discounted Stays →
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fef3c7", fontSize: "13px" }}>
                  <span>⏱️ Verified direct rates</span>
                  <span>•</span>
                  <span>Direct WhatsApp contact</span>
                </div>
              </div>
            </div>
            <div className="flash-deal-right">
              <div className="deal-floating-mini-card">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "28px" }}>🏖️</span>
                  <div>
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>Diani Coastal Villa</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>3 Nights · Oceanfront</div>
                  </div>
                </div>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#e11d48", fontWeight: 800, fontSize: "16px" }}>Save KSh 9,000</span>
                  <span style={{ fontSize: "12px", background: "#fef2f2", color: "#e11d48", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>25% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE KENYA STAY BUDGET ESTIMATOR ── */}
      <section id="budget-planner" style={{ ...s.section, background: "#ffffff" }}>
        <div style={s.sectionInner}>
          <div className="planner-container-box reveal">
            <div className="planner-header">
              <span className="section-eyebrow" style={{ color: "#4f46e5" }}>TRIP PLANNER</span>
              <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "8px" }}>
                Kenya Stay Budget Estimator
              </h2>
              <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
                Select your destination region, duration, and comfort preference to see realistic accommodation rates.
              </p>
            </div>

            <div className="planner-controls-grid">
              {/* Region Selector */}
              <div className="planner-card-input">
                <label className="planner-input-label">Destination Region</label>
                <select
                  value={plannerDestination}
                  onChange={(e) => setPlannerDestination(e.target.value)}
                  className="planner-select"
                >
                  <option value="Coast (Diani / Mombasa)">Coast (Diani, Mombasa, Watamu)</option>
                  <option value="Rift Valley & Safari (Mara / Naivasha)">Safari & Rift (Mara, Naivasha, Nakuru)</option>
                  <option value="Mount Kenya (Nanyuki / Aberdares)">Mount Kenya & Highlands (Nanyuki)</option>
                  <option value="Nairobi Capital & Metropolis">Nairobi Metropolitan</option>
                  <option value="Western & Lake Victoria">Western Kenya (Kisumu)</option>
                </select>
              </div>

              {/* Nights Stepper */}
              <div className="planner-card-input">
                <label className="planner-input-label">Duration of Stay</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={plannerNights}
                    onChange={(e) => setPlannerNights(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#4f46e5" }}
                  />
                  <span style={{ fontWeight: 800, color: "#0f172a", minWidth: "75px" }}>
                    {plannerNights} {plannerNights === 1 ? "Night" : "Nights"}
                  </span>
                </div>
              </div>

              {/* Travel Style */}
              <div className="planner-card-input">
                <label className="planner-input-label">Travel Style</label>
                <div className="planner-style-buttons">
                  <button
                    type="button"
                    className={`style-btn ${plannerStyle === "budget" ? "selected" : ""}`}
                    onClick={() => setPlannerStyle("budget")}
                  >
                    Budget Saver
                  </button>
                  <button
                    type="button"
                    className={`style-btn ${plannerStyle === "comfort" ? "selected" : ""}`}
                    onClick={() => setPlannerStyle("comfort")}
                  >
                    Comfort Stay
                  </button>
                  <button
                    type="button"
                    className={`style-btn ${plannerStyle === "luxury" ? "selected" : ""}`}
                    onClick={() => setPlannerStyle("luxury")}
                  >
                    Luxury Safari
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="planner-result-banner">
              <div className="planner-result-left">
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                  Estimated Accommodation Cost
                </div>
                <div className="planner-total-cost">
                  KSh {totalEstimatedStay.toLocaleString()}
                  <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
                    {" "}(~KSh {estimatedNightlyRate.toLocaleString()}/night)
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "4px" }}>
                  ✓ Direct host pricing · 0% AXXSpace booking surcharge
                </div>
              </div>
              <button
                type="button"
                className="planner-find-btn"
                onClick={() => {
                  const areaQuery = plannerDestination.includes("Coast")
                    ? "Diani Beach"
                    : plannerDestination.includes("Safari")
                    ? "Maasai Mara"
                    : plannerDestination.includes("Nairobi")
                    ? "Nairobi"
                    : "Nanyuki";
                  navigate(`/accommodation/listings?area=${encodeURIComponent(areaQuery)}&maxPrice=${estimatedNightlyRate * 1.3}`);
                }}
              >
                Find Stays in {plannerDestination.split(" ")[0]} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: DUAL VIEW (GUESTS VS HOSTS) ── */}
      <section style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "40px" }} className="reveal">
            <span className="section-eyebrow">SIMPLE & TRANSPARENT</span>
            <h2 style={s.sectionHeading}>How AXXSpace Works</h2>
            <p style={s.sectionSubheading}>
              Connecting holiday travelers and Kenyan hospitality hosts with direct ease.
            </p>

            {/* Dual Mode Switch */}
            <div className="how-it-works-toggle-pill">
              <button
                type="button"
                className={`how-toggle-btn ${howItWorksTab === "guests" ? "active" : ""}`}
                onClick={() => setHowItWorksTab("guests")}
              >
                🏖️ For Travelers & Guests
              </button>
              <button
                type="button"
                className={`how-toggle-btn ${howItWorksTab === "hosts" ? "active" : ""}`}
                onClick={() => setHowItWorksTab("hosts")}
              >
                🏢 For Property Owners & Hosts
              </button>
            </div>
          </div>

          {howItWorksTab === "guests" ? (
            <div className="how-steps-grid">
              {[
                {
                  step: "01",
                  title: "Discover Your Stay",
                  desc: "Filter through verified beach resorts, safari camps, holiday villas and city penthouses across Kenya.",
                  icon: "🔍",
                },
                {
                  step: "02",
                  title: "Compare & View Photos",
                  desc: "Check real high-res room photos, exact nightly prices, guest amenities and verified physical location.",
                  icon: "📸",
                },
                {
                  step: "03",
                  title: "Direct WhatsApp Contact",
                  desc: "Connect directly with property managers or villa owners with one tap. Ask questions and confirm dates.",
                  icon: "💬",
                },
                {
                  step: "04",
                  title: "Pay Direct & Enjoy",
                  desc: "Zero hidden commission or third-party booking surcharges. Pay securely via M-Pesa or card directly to the host.",
                  icon: "🌴",
                },
              ].map((stepItem, idx) => (
                <div key={stepItem.step} className="how-step-card reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="how-step-badge">{stepItem.step}</div>
                  <div className="how-step-icon">{stepItem.icon}</div>
                  <h3 style={s.howStepTitle}>{stepItem.title}</h3>
                  <p style={s.howStepDesc}>{stepItem.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="how-steps-grid">
              {[
                {
                  step: "01",
                  title: "Register Your Property",
                  desc: "Sign up in 3 minutes as a hotelier, Airbnb host, or property manager. No lengthy onboarding paperwork.",
                  icon: "📝",
                },
                {
                  step: "02",
                  title: "Add Photos & Pricing",
                  desc: "Upload high-res photos, set room types, seasonal rates, amenities, and your direct WhatsApp contact number.",
                  icon: "🏨",
                },
                {
                  step: "03",
                  title: "Get Verified Fast",
                  desc: "Our Kenyan inspection team verifies your listing details within 24 hours to award you the Verified Host Badge.",
                  icon: "✅",
                },
                {
                  step: "04",
                  title: "Receive Direct Bookings",
                  desc: "Travelers reach you directly on your phone. You retain 100% of your earnings with zero middleman deductions.",
                  icon: "💰",
                },
              ].map((stepItem, idx) => (
                <div key={stepItem.step} className="how-step-card reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="how-step-badge" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    {stepItem.step}
                  </div>
                  <div className="how-step-icon">{stepItem.icon}</div>
                  <h3 style={s.howStepTitle}>{stepItem.title}</h3>
                  <p style={s.howStepDesc}>{stepItem.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE AXXSPACE TRUST MATRIX ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "48px" }} className="reveal">
            <span className="section-eyebrow">THE AXXSPACE ADVANTAGE</span>
            <h2 style={s.sectionHeading}>Why Kenya Chooses AXXSpace Accommodation</h2>
            <p style={s.sectionSubheading}>
              Crafted specifically for the East African travel landscape — direct, local, and transparent.
            </p>
          </div>

          <div className="why-features-matrix">
            <div className="why-matrix-card reveal">
              <div className="why-icon-bubble" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
                💰
              </div>
              <h3 style={s.whyCardTitle}>0% Middleman Commission</h3>
              <p style={s.whyCardDesc}>
                Foreign booking agencies charge guests up to 20% in hidden booking fees. On AXXSpace, you connect and book directly with the host, ensuring the best rates in Kenya.
              </p>
            </div>

            <div className="why-matrix-card reveal">
              <div className="why-icon-bubble" style={{ background: "#dcfce7", color: "#16a34a" }}>
                💬
              </div>
              <h3 style={s.whyCardTitle}>Instant WhatsApp Host Chat</h3>
              <p style={s.whyCardDesc}>
                Don't wait hours for automated email confirmations. Chat directly with the villa manager or lodge concierge on WhatsApp to arrange special requests, diet preferences, or airport pick-up.
              </p>
            </div>

            <div className="why-matrix-card reveal">
              <div className="why-icon-bubble" style={{ background: "#fef3c7", color: "#d97706" }}>
                🛡️
              </div>
              <h3 style={s.whyCardTitle}>Physically Verified Properties</h3>
              <p style={s.whyCardDesc}>
                No catfishing or ghost listings. Our boots-on-the-ground field team verifies physical locations, real amenities, and ownership credentials before any property is featured.
              </p>
            </div>

            <div className="why-matrix-card reveal">
              <div className="why-icon-bubble" style={{ background: "#fee2e2", color: "#e11d48" }}>
                🇰🇪
              </div>
              <h3 style={s.whyCardTitle}>Local M-Pesa & Card Ease</h3>
              <p style={s.whyCardDesc}>
                Direct payment to the host via official Lipa na M-Pesa Till/Paybill numbers or bank cards. Receive immediate SMS transaction confirmations with zero currency conversion losses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR PROPERTY HOSTS / ADVERTISING PACKAGES ── */}
      <section id="packages-section" style={{ ...s.section, background: "#0f172a", color: "#ffffff" }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "48px" }} className="reveal">
            <span className="section-eyebrow" style={{ color: "#38bdf8" }}>FOR PROPERTY OWNERS & MANAGERS</span>
            <h2 style={{ ...s.sectionHeading, color: "#ffffff" }}>List Your Property & Reach Thousands of Travelers</h2>
            <p style={{ ...s.sectionSubheading, color: "#94a3b8" }}>
              Join 300+ hotels, safari camps, and holiday homes already scaling their direct guest bookings with AXXSpace.
            </p>
          </div>

          <div className="pricing-packages-grid">
            {ADVERTISING_PACKAGES.map((pkg, idx) => (
              <div
                key={pkg.name}
                className={`pricing-package-card reveal ${pkg.popular ? "popular-card" : ""}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {pkg.popular && <div className="popular-badge-ribbon">MOST POPULAR</div>}
                <div style={{ fontSize: "20px", fontWeight: 800, color: pkg.popular ? "#38bdf8" : "#ffffff", marginBottom: "6px" }}>
                  {pkg.name} Plan
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>{pkg.desc}</div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 900, color: "#ffffff" }}>
                    KSh {pkg.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>/ {pkg.duration}</span>
                </div>

                <ul className="package-features-list">
                  <li>✓ Direct WhatsApp inquiry link</li>
                  <li>✓ Verified Host trust badge</li>
                  <li>✓ Full photo gallery & amenities</li>
                  {pkg.popular && <li>✓ Priority search ranking placement</li>}
                  {pkg.popular && <li>✓ Homepage featured carousel spotlight</li>}
                  {pkg.name === "Premium" && <li>✓ Dedicated account manager & social media push</li>}
                  {pkg.name === "Premium" && <li>✓ Unlimited listing updates & lead analytics</li>}
                </ul>

                <button
                  type="button"
                  className={`package-action-btn ${pkg.popular ? "btn-popular" : "btn-standard"}`}
                  onClick={() => navigate("/accommodation/register-property")}
                >
                  Get Started with {pkg.name}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "36px", color: "#94a3b8", fontSize: "14px" }}>
            Need a custom corporate or multi-chain hotel package?{" "}
            <a href="https://wa.me/254745689773" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
              Speak with our Host Relations Team on WhatsApp →
            </a>
          </div>
        </div>
      </section>

      {/* ── VERIFIED GUEST REVIEWS / TESTIMONIALS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "48px" }} className="reveal">
            <span className="section-eyebrow">AUTHENTIC TRAVELER EXPERIENCES</span>
            <h2 style={s.sectionHeading}>Loved by Guests Across Kenya & Beyond</h2>
            <p style={s.sectionSubheading}>
              See what travelers say about discovering stays and connecting with hosts directly through AXXSpace.
            </p>
          </div>

          <div className="guest-reviews-grid">
            {GUEST_TESTIMONIALS.map((review, idx) => (
              <div key={review.name} className="guest-review-card reveal" style={{ animationDelay: `${idx * 0.12}s` }}>
                <div style={{ display: "flex", gap: "2px", color: "#f59e0b", fontSize: "16px", marginBottom: "16px" }}>
                  {"★".repeat(review.rating)}
                </div>
                <p style={s.reviewText}>"{review.text}"</p>
                <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 700, marginBottom: "16px" }}>
                  📍 {review.stay}
                </div>
                <div style={s.reviewAuthorRow}>
                  <img src={review.avatar} alt={review.name} style={s.reviewerAvatar} />
                  <div>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>{review.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{review.location} · Verified Guest ✓</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (ACCORDION) ── */}
      <section id="faq-section" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={{ ...s.sectionInner, maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }} className="reveal">
            <span className="section-eyebrow">HELP & CLARITY</span>
            <h2 style={s.sectionHeading}>Frequently Asked Questions</h2>
            <p style={s.sectionSubheading}>
              Everything you need to know about booking stays or listing your property on AXXSpace.
            </p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.q} className="faq-accordion-item reveal">
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span style={{ fontWeight: 700, fontSize: "16px", color: isOpen ? "#4f46e5" : "#0f172a", textAlign: "left" }}>
                      {faq.q}
                    </span>
                    <span className={`faq-chevron ${isOpen ? "open" : ""}`}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "14px" }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HIGH-CONVERTING BOTTOM CALL TO ACTION ── */}
      <section style={s.bottomCtaSection}>
        <div style={s.ctaContainer}>
          <h2 style={s.ctaHeading}>Ready for Your Next Kenyan Getaway?</h2>
          <p style={s.ctaSubtext}>
            Join thousands of travelers exploring Kenya with verified stays, direct host negotiation, and 0% booking fees.
          </p>
          <div style={s.ctaButtonsGroup}>
            <button
              type="button"
              className="cta-primary-btn"
              onClick={() => navigate("/accommodation/listings")}
            >
              Explore 500+ Properties Now
            </button>
            <button
              type="button"
              className="cta-secondary-btn"
              onClick={() => navigate("/accommodation/register-property")}
            >
              List Your Property as a Host
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrandCol}>
            <div style={s.logoWrapper}>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>AXX</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff" }}>SPACE</span>
              <span style={{ color: "#475569", margin: "0 6px" }}>|</span>
              <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 700 }}>Accommodation</span>
            </div>
            <p style={s.footerBio}>
              Kenya's premier direct-to-host accommodation directory. Connecting travelers to verified hotels, safari camps, coastal villas, and homestays across all 47 counties.
            </p>
            <div style={{ marginTop: "16px" }}>
              <SocialMediaLinks iconSize={20} />
            </div>
          </div>

          <div style={s.footerLinksGrid}>
            <div>
              <div style={s.footerHeading}>Explore Escapes</div>
              <ul style={s.footerUl}>
                {["Beach Resorts in Diani", "Maasai Mara Safari Camps", "Naivasha Lakeside Lodges", "Nairobi Luxury Suites", "Watamu Ocean Villas", "Mount Kenya Cabins"].map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      style={s.footerTextBtn}
                      onClick={() => navigate(`/accommodation/listings?search=${encodeURIComponent(item.split(" in ")[1] || item)}`)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={s.footerHeading}>For Hosts</div>
              <ul style={s.footerUl}>
                <li>
                  <button type="button" style={s.footerTextBtn} onClick={() => navigate("/accommodation/register-property")}>
                    List Your Property
                  </button>
                </li>
                <li>
                  <button type="button" style={s.footerTextBtn} onClick={() => navigate("/accommodation/dashboard")}>
                    Host Dashboard
                  </button>
                </li>
                <li>
                  <button type="button" style={s.footerTextBtn} onClick={() => navigate("/accommodation/login")}>
                    Host Login
                  </button>
                </li>
                <li>
                  <button type="button" style={s.footerTextBtn} onClick={() => { document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                    Advertising Packages
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div style={s.footerHeading}>Direct Contact</div>
              <div style={s.footerContactItem}>
                <span style={{ color: "#38bdf8" }}>✉️</span> accommodationaxxspace@gmail.com
              </div>
              <div style={s.footerContactItem}>
                <span style={{ color: "#38bdf8" }}>📞</span> +254 745 689 773
              </div>
              <div style={s.footerContactItem}>
                <span style={{ color: "#22c55e" }}>💬</span> WhatsApp Official Concierge
              </div>
              <div style={s.footerContactItem}>
                <span style={{ color: "#fbbf24" }}>📍</span> Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>

        <div style={s.footerBottomBar}>
          <div>© {new Date().getFullYear()} AXXSpace Accommodation. All rights reserved.</div>
          <div style={{ display: "flex", gap: "18px" }}>
            <span style={{ color: "#64748b" }}>Privacy Policy</span>
            <span style={{ color: "#64748b" }}>•</span>
            <span style={{ color: "#64748b" }}>Terms of Service</span>
            <span style={{ color: "#64748b" }}>•</span>
            <span style={{ color: "#64748b" }}>Verified Safe Stays Kenya</span>
          </div>
        </div>
      </footer>

      {/* ── WISHLIST SLIDE-OVER DRAWER ── */}
      {wishlistDrawerOpen && (
        <div className="wishlist-overlay" onClick={() => setWishlistDrawerOpen(false)}>
          <div className="wishlist-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="wishlist-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#e11d48" stroke="#e11d48" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Your Saved Stays ({favs.length})</h3>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setWishlistDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="wishlist-drawer-body">
              {wishlistProperties.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>No saved stays yet</div>
                  <p style={{ fontSize: "14px", lineHeight: 1.5 }}>Click the heart icon on any accommodation card to save it for quick comparison.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {wishlistProperties.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="wishlist-item-row"
                      onClick={() => {
                        setWishlistDrawerOpen(false);
                        navigate(`/accommodation/${p._id || p.id}`);
                      }}
                    >
                      <img src={p.image} alt={p.name} className="wishlist-item-thumbnail" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{p.location}</div>
                        <div style={{ fontWeight: 800, color: "#4f46e5", fontSize: "13px", marginTop: "4px" }}>
                          KSh {(p.price || p.basePrice || 0).toLocaleString()} / night
                        </div>
                      </div>
                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        title="Remove from saved"
                        onClick={(e) => toggleFavorite(e, p._id || p.id, p.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {wishlistProperties.length > 0 && (
              <div className="wishlist-drawer-footer">
                <button
                  type="button"
                  className="drawer-browse-all-btn"
                  onClick={() => {
                    setWishlistDrawerOpen(false);
                    navigate("/accommodation/listings");
                  }}
                >
                  Compare All in Listings
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FLOATING WHATSAPP CONCIERGE & SCROLL TO TOP ── */}
      <a
        className="wa-floating-concierge"
        href="https://wa.me/254745689773?text=Hi!%20I%20need%20assistance%20finding%20an%20accommodation%20in%20Kenya%20on%20AXXSpace."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Concierge"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.72 1.33-1.37 1.57-.45.17-.98.24-3.16-.62-2.34-.92-3.83-3.32-3.95-3.48-.12-.16-.95-1.26-.95-2.4 0-1.14.6-1.7.81-1.93.21-.23.46-.29.62-.29.15 0 .31 0 .44.01.14.01.32-.05.5.38.18.44.62 1.51.68 1.62.06.12.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.91.81 1.67 1.06 1.91 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.19 1.3z" />
        </svg>
        <span className="wa-tooltip-label">Chat Concierge</span>
      </a>

      <button
        type="button"
        className={`scroll-to-top-button ${showTopBtn ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}

// ── INLINE STYLES FOR CORE SKELETON ──
const s = {
  root: {
    fontFamily: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif",
    background: "#ffffff",
    color: "#0f172a",
    overflowX: "hidden",
    minHeight: "100vh",
  },
  navInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    userSelect: "none",
  },
  logoImg: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(79, 70, 229, 0.2)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  logoTextGroup: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  logoTitle: {
    display: "flex",
    alignItems: "center",
  },
  logoAxx: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#fbbf24",
    letterSpacing: "-0.5px",
  },
  logoSpace: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  logoSubline: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  navRightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dashboardBtn: {
    background: "#f1f5f9",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
  },

  // Hero Section
  heroSection: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #090e1a 0%, #1e1b4b 45%, #2e1065 100%)",
    padding: "80px 20px 90px",
    minHeight: "680px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  heroBadgePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "999px",
    padding: "8px 18px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    marginBottom: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  heroHeading: {
    fontSize: "clamp(34px, 5.5vw, 62px)",
    fontWeight: 900,
    color: "#ffffff",
    lineHeight: 1.15,
    marginBottom: "20px",
    letterSpacing: "-1.5px",
  },
  heroSubtitle: {
    fontSize: "clamp(15px, 2vw, 18px)",
    color: "rgba(255, 255, 255, 0.85)",
    maxWidth: "760px",
    margin: "0 auto 42px",
    lineHeight: 1.7,
    fontWeight: 400,
  },
  searchBarInner: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "100%",
    flexWrap: "nowrap",
  },
  segmentIconHolder: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  segmentLabel: {
    fontSize: "10px",
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "0.08em",
    marginBottom: "2px",
    textAlign: "left",
  },
  segmentInputField: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "inherit",
    padding: 0,
    cursor: "pointer",
  },
  clearInputBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    color: "#64748b",
    cursor: "pointer",
  },
  destDropdownHeader: {
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#64748b",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
  },
  destDropdownList: {
    maxHeight: "280px",
    overflowY: "auto",
  },
  guestStepperRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  stepperControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  stepperBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperNum: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0f172a",
    minWidth: "18px",
    textAlign: "center",
  },
  guestsDoneBtn: {
    width: "100%",
    marginTop: "14px",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
  },

  // Stats Bar
  statsBarSection: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "36px 20px",
  },
  statsGrid: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  statIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValueNumber: {
    fontSize: "32px",
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.1,
  },
  statLabelText: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#334155",
    marginTop: "2px",
  },
  statSubText: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },

  // Generic Section
  section: {
    padding: "90px 20px",
  },
  sectionInner: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sectionHeading: {
    fontSize: "clamp(26px, 3.5vw, 38px)",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.5px",
    marginTop: "6px",
    marginBottom: "10px",
  },
  sectionSubheading: {
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "680px",
    lineHeight: 1.6,
  },

  // Category Cards
  catCardTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "6px",
  },
  catCardDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: "14px",
  },

  // Property Card Body
  propCardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  propLocationRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  propLocationText: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 600,
  },
  propCardName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
    marginBottom: "12px",
    minHeight: "46px",
  },
  propAmenitiesWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  amenityChip: {
    fontSize: "11px",
    fontWeight: 600,
    background: "#f1f5f9",
    color: "#475569",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  amenityChipMore: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
  },
  propCardDivider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "4px 0 14px",
  },
  propPriceRatingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  propPriceText: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#4f46e5",
  },
  propPerNight: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 600,
    marginLeft: "4px",
  },
  propRatingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#fef3c7",
    padding: "4px 8px",
    borderRadius: "8px",
  },
  cardActionsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "auto",
  },

  // How it works
  howStepTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "8px",
  },
  howStepDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
  },

  // Why choose us
  whyCardTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "10px",
  },
  whyCardDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.65,
  },

  // Testimonials
  reviewText: {
    fontSize: "15px",
    color: "#334155",
    lineHeight: 1.7,
    fontStyle: "italic",
    marginBottom: "14px",
    flex: 1,
  },
  reviewAuthorRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "14px",
  },
  reviewerAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  // Bottom CTA
  bottomCtaSection: {
    background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)",
    padding: "80px 20px",
    textAlign: "center",
    color: "#ffffff",
  },
  ctaContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaHeading: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    color: "#ffffff",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
  },
  ctaSubtext: {
    fontSize: "17px",
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: 1.7,
    marginBottom: "36px",
  },
  ctaButtonsGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  // Footer
  footer: {
    background: "#090d16",
    color: "#94a3b8",
    padding: "70px 20px 30px",
  },
  footerInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "60px",
    marginBottom: "50px",
  },
  footerBrandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBio: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#94a3b8",
  },
  footerLinksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "36px",
  },
  footerHeading: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  footerUl: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  footerTextBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    textAlign: "left",
    transition: "color 0.2s",
  },
  footerContactItem: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerBottomBar: {
    maxWidth: "1400px",
    margin: "0 auto",
    borderTop: "1px solid #1e293b",
    paddingTop: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#64748b",
    flexWrap: "wrap",
    gap: "12px",
  },
};

// ── CUSTOM CSS FOR ANIMATIONS, RESPONSIVENESS & MICRO-INTERACTIONS ──
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  /* Global baseline */
  .accommodation-root * {
    box-sizing: border-box;
  }

  /* Scroll Progress */
  .scroll-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3.5px;
    background: linear-gradient(90deg, #4f46e5 0%, #ec4899 50%, #fbbf24 100%);
    z-index: 9999;
    transition: width 0.1s linear;
  }

  /* Sticky Navigation */
  .main-nav {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 500;
    transition: all 0.3s ease;
  }
  .main-nav.scrolled {
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
  }

  .county-badge {
    background: #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
  }

  .desktop-nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .nav-link-btn {
    background: transparent;
    border: none;
    color: #334155;
    font-size: 13.5px;
    font-weight: 700;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  .nav-link-btn:hover {
    color: #4f46e5;
    background: #f8fafc;
  }

  .wishlist-trigger-btn {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e11d48;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.2s;
  }
  .wishlist-trigger-btn:hover {
    transform: scale(1.05);
  }
  .wishlist-badge-count {
    font-size: 12px;
    font-weight: 800;
    background: #e11d48;
    color: #ffffff;
    border-radius: 999px;
    padding: 1px 7px;
  }

  .sign-in-btn {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .sign-in-btn:hover {
    border-color: #4f46e5;
    color: #4f46e5;
  }

  .list-property-btn {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    transition: all 0.25s ease;
  }
  .list-property-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.45);
  }

  .mobile-toggle-btn {
    display: none;
    background: transparent;
    border: none;
    color: #0f172a;
    cursor: pointer;
    padding: 6px;
  }

  .mobile-dropdown-menu {
    display: none;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
  .mobile-dropdown-menu button {
    background: transparent;
    border: none;
    text-align: left;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    padding: 8px 0;
    cursor: pointer;
    font-family: inherit;
  }
  .mobile-action-highlight {
    background: #4f46e5 !important;
    color: #ffffff !important;
    padding: 12px !important;
    border-radius: 10px !important;
    text-align: center !important;
  }

  /* Hero Animations & Elements */
  .hero-glow-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
  }
  .blob-top-left {
    width: 450px;
    height: 450px;
    background: #6366f1;
    top: -100px;
    left: -100px;
    animation: pulseBlob 9s infinite alternate;
  }
  .blob-bottom-right {
    width: 480px;
    height: 480px;
    background: #ec4899;
    bottom: -120px;
    right: -100px;
    animation: pulseBlob 12s infinite alternate-reverse;
  }
  .blob-center {
    width: 380px;
    height: 380px;
    background: #fbbf24;
    top: 30%;
    left: 45%;
    opacity: 0.15;
  }
  @keyframes pulseBlob {
    0% { transform: scale(1) translate(0, 0); }
    100% { transform: scale(1.2) translate(40px, 30px); }
  }

  .shimmering-gradient-text {
    background: linear-gradient(90deg, #fbbf24 0%, #ffffff 35%, #fbbf24 70%, #ec4899 100%);
    background-size: 250% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textShimmer 6s linear infinite;
  }
  @keyframes textShimmer {
    to { background-position: -250% 0; }
  }

  .hero-in {
    animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .hero-in.i1 { animation-delay: 0.1s; }
  .hero-in.i2 { animation-delay: 0.25s; }
  .hero-in.i3 { animation-delay: 0.4s; }
  .hero-in.i4 { animation-delay: 0.55s; }

  @keyframes heroFadeUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Segmented Search Engine Box */
  .search-bar-shell {
    background: #ffffff;
    border-radius: 20px;
    padding: 8px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
    margin: 0 auto;
    max-width: 1060px;
    position: relative;
    z-index: 30;
  }
  .search-segment-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
  }
  .search-segment-box:hover,
  .search-segment-box:focus-within {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .dest-dropdown-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 360px;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
    z-index: 100;
    overflow: hidden;
    animation: popoverFade 0.2s ease;
  }
  .dest-dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f8fafc;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }
  .dest-dropdown-item:hover {
    background: #f1f5f9;
  }

  .guests-dropdown-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 310px;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
    padding: 18px;
    z-index: 100;
    animation: popoverFade 0.2s ease;
  }
  @keyframes popoverFade {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-search-submit-btn {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%);
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 16px 28px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }
  .hero-search-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(79, 70, 229, 0.55);
  }

  .hero-quick-tags {
    margin-top: 24px;
    display: flex;
    align-items: center;
    justifyContent: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .quick-hotspot-pill {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    backdrop-filter: blur(6px);
    transition: all 0.2s;
  }
  .quick-hotspot-pill:hover {
    background: #fbbf24;
    color: #0f172a;
    border-color: #fbbf24;
    transform: translateY(-2px);
  }

  /* Marquee ticker */
  .destinations-marquee-section {
    background: #0f172a;
    padding: 14px 0;
    border-bottom: 1px solid #1e293b;
    overflow: hidden;
  }
  .marquee-outer-container {
    display: flex;
    align-items: center;
  }
  .marquee-label-chip {
    background: #1e293b;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 16px;
    border-radius: 0 20px 20px 0;
    white-space: nowrap;
    margin-right: 16px;
    letter-spacing: "0.08em";
    z-index: 10;
  }
  .marquee-track-scroll {
    display: flex;
    gap: 12px;
    width: max-content;
    animation: scrollMarquee 40s linear infinite;
  }
  @keyframes scrollMarquee {
    to { transform: translateX(-50%); }
  }
  .marquee-pill-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e2e8f0;
    border-radius: 999px;
    padding: 7px 16px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
  }
  .marquee-pill-btn:hover {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
    transform: translateY(-2px);
  }
  .marquee-county-tag {
    font-size: 11px;
    color: #94a3b8;
    margin-left: 6px;
  }

  /* Stats Section Items */
  .stat-card-item {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    transition: all 0.25s ease;
  }
  .stat-card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.06);
    background: #ffffff;
  }

  /* Section Headings */
  .section-eyebrow {
    font-size: 12px;
    font-weight: 800;
    color: #4f46e5;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }
  .section-head-split {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 20px;
  }
  .view-all-pill-btn {
    background: transparent;
    border: 1.5px solid #4f46e5;
    color: #4f46e5;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .view-all-pill-btn:hover {
    background: #4f46e5;
    color: #ffffff;
    transform: translateY(-2px);
  }

  /* Stay Category Cards */
  .category-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .stay-cat-card {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }
  .stay-cat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #cbd5e1;
  }
  .stay-cat-img-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  .stay-cat-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  .stay-cat-card:hover .stay-cat-bg-img {
    transform: scale(1.08);
  }
  .stay-cat-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  }
  .stay-cat-tag-pill {
    position: absolute;
    top: 14px;
    left: 14px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .stay-cat-count-badge {
    position: absolute;
    bottom: 14px;
    right: 14px;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
  }
  .stay-cat-info {
    padding: 20px;
  }
  .cat-explore-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4f46e5;
    font-size: 13px;
    font-weight: 800;
    transition: gap 0.2s;
  }
  .stay-cat-card:hover .cat-explore-link {
    gap: 10px;
  }

  /* Featured Stays Category Tabs */
  .featured-category-filter-tabs {
    display: flex;
    gap: 8px;
    background: #ffffff;
    padding: 6px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }
  .filter-tab-pill {
    background: transparent;
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .filter-tab-pill.active {
    background: #4f46e5;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  /* Property Listing Grid */
  .properties-listing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
  }
  .property-card-deluxe {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  .property-card-deluxe:hover {
    transform: translateY(-7px);
    box-shadow: 0 24px 45px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
  .prop-image-frame {
    position: relative;
    height: 230px;
    overflow: hidden;
  }
  .prop-main-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  .property-card-deluxe:hover .prop-main-photo {
    transform: scale(1.06);
  }
  .prop-badge-strip {
    position: absolute;
    top: 14px;
    left: 14px;
    display: flex;
    gap: 6px;
  }
  .prop-category-tag {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .prop-highlight-tag {
    background: #fbbf24;
    color: #0f172a;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .prop-fav-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.92);
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }
  .prop-fav-button:hover {
    transform: scale(1.15);
  }
  .prop-fav-button.active {
    animation: heartBounce 0.4s ease;
  }
  @keyframes heartBounce {
    40% { transform: scale(1.35); }
    100% { transform: scale(1); }
  }

  .card-primary-view-btn {
    background: #f1f5f9;
    color: #0f172a;
    border: none;
    border-radius: 10px;
    padding: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .card-primary-view-btn:hover {
    background: #e2e8f0;
    color: #000000;
  }
  .card-whatsapp-direct-btn {
    background: #25d366;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 10px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .card-whatsapp-direct-btn:hover {
    background: #20bd5a;
    transform: translateY(-1px);
  }

  .view-all-stays-cta {
    background: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 16px 36px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.25s ease;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
  }
  .view-all-stays-cta:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(79, 70, 229, 0.4);
  }

  /* Flash Deal Banner */
  .flash-deal-banner-card {
    background: linear-gradient(135deg, #831843 0%, #be185d 50%, #db2777 100%);
    border-radius: 24px;
    padding: 48px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 36px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(190, 24, 93, 0.25);
  }
  .deal-badge-pill {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
    display: inline-block;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 16px;
  }
  .deal-title {
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 900;
    line-height: 1.2;
    margin-bottom: 14px;
  }
  .deal-desc {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .deal-cta-row {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .deal-claim-btn {
    background: #ffffff;
    color: #be185d;
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .deal-claim-btn:hover {
    background: #fdf2f8;
    transform: translateY(-2px);
  }
  .deal-floating-mini-card {
    background: #ffffff;
    border-radius: 18px;
    padding: 24px;
    width: 290px;
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.25);
  }

  /* Trip Budget Planner */
  .planner-container-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  }
  .planner-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .planner-controls-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }
  .planner-card-input {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px;
  }
  .planner-input-label {
    font-size: 12px;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
  }
  .planner-select {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    font-family: inherit;
    outline: none;
    background: #ffffff;
  }
  .planner-style-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .style-btn {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 4px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .style-btn.selected {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
  }
  .planner-result-banner {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 18px;
    padding: 24px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  .planner-total-cost {
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.2;
    margin-top: 4px;
  }
  .planner-find-btn {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 15px 28px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .planner-find-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
  }

  /* How it works toggle pill */
  .how-it-works-toggle-pill {
    display: inline-flex;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 5px;
    margin-top: 14px;
  }
  .how-toggle-btn {
    background: transparent;
    border: none;
    padding: 10px 24px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 800;
    color: #64748b;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .how-toggle-btn.active {
    background: #0f172a;
    color: #ffffff;
  }
  .how-steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .how-step-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 30px 24px;
    text-align: center;
    position: relative;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }
  .how-step-badge {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    font-size: 12px;
    font-weight: 900;
    padding: 4px 14px;
    border-radius: 20px;
  }
  .how-step-icon {
    font-size: 38px;
    margin: 10px auto 16px;
  }

  /* Why choose us matrix */
  .why-features-matrix {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .why-matrix-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 32px 24px;
    transition: all 0.25s ease;
  }
  .why-matrix-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
  }
  .why-icon-bubble {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 20px;
  }

  /* Pricing Packages */
  .pricing-packages-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    max-width: 1100px;
    margin: 0 auto;
    align-items: stretch;
  }
  .pricing-package-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 24px;
    padding: 36px 30px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.25s ease;
  }
  .pricing-package-card.popular-card {
    background: #0f172a;
    border: 2px solid #38bdf8;
    box-shadow: 0 20px 45px rgba(56, 189, 248, 0.2);
    transform: scale(1.03);
  }
  .popular-badge-ribbon {
    position: absolute;
    top: -12px;
    right: 24px;
    background: #38bdf8;
    color: #0f172a;
    font-size: 11px;
    font-weight: 900;
    padding: 4px 12px;
    border-radius: 999px;
    letter-spacing: 0.05em;
  }
  .package-features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    color: #cbd5e1;
    flex: 1;
  }
  .package-action-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    border: none;
  }
  .btn-popular {
    background: #38bdf8;
    color: #0f172a;
  }
  .btn-popular:hover {
    background: #7dd3fc;
  }
  .btn-standard {
    background: #334155;
    color: #ffffff;
  }
  .btn-standard:hover {
    background: #475569;
  }

  /* Testimonials */
  .guest-reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .guest-review-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  /* FAQ Accordion */
  .faq-accordion-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .faq-accordion-item {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-question-btn {
    width: 100%;
    background: transparent;
    border: none;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    font-family: inherit;
  }
  .faq-chevron {
    color: #64748b;
    transition: transform 0.25s ease;
  }
  .faq-chevron.open {
    transform: rotate(180deg);
    color: #4f46e5;
  }
  .faq-answer-pane {
    padding: 0 24px 22px;
    border-top: 1px solid #f8fafc;
  }

  /* Bottom CTA */
  .cta-primary-btn {
    background: #ffffff;
    color: #312e81;
    border: none;
    border-radius: 14px;
    padding: 16px 32px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  .cta-primary-btn:hover {
    background: #f8fafc;
    transform: translateY(-2px);
  }
  .cta-secondary-btn {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    border-radius: 14px;
    padding: 16px 32px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .cta-secondary-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Floating WhatsApp */
  .wa-floating-concierge {
    position: fixed;
    right: 20px;
    bottom: 24px;
    background: #25d366;
    color: #ffffff;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 30px rgba(37, 211, 102, 0.5);
    z-index: 400;
    text-decoration: none;
    transition: all 0.25s ease;
    animation: waPulse 2.4s infinite;
  }
  .wa-floating-concierge:hover {
    transform: scale(1.1);
  }
  .wa-tooltip-label {
    position: absolute;
    right: 70px;
    background: #0f172a;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .wa-floating-concierge:hover .wa-tooltip-label {
    opacity: 1;
  }
  @keyframes waPulse {
    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55); }
    70% { box-shadow: 0 0 0 16px rgba(37, 211, 102, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
  }

  /* Scroll To Top */
  .scroll-to-top-button {
    position: fixed;
    right: 28px;
    bottom: 96px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #0f172a;
    color: #ffffff;
    border: none;
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 400;
    opacity: 0;
    transform: translateY(14px);
    pointer-events: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  .scroll-to-top-button.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .scroll-to-top-button:hover {
    background: #4f46e5;
  }

  /* Wishlist Drawer */
  .wishlist-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
  }
  .wishlist-drawer-content {
    background: #ffffff;
    width: 100%;
    max-width: 420px;
    height: 100%;
    display: flex;
    flex-direction: column;
    animation: drawerSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes drawerSlide {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .wishlist-drawer-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .drawer-close-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 14px;
    color: #64748b;
  }
  .wishlist-drawer-body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  .wishlist-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 10px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .wishlist-item-row:hover {
    background: #f1f5f9;
  }
  .wishlist-item-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
  }
  .wishlist-remove-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 16px;
    padding: 6px;
    cursor: pointer;
  }
  .wishlist-remove-btn:hover {
    color: #e11d48;
  }
  .wishlist-drawer-footer {
    padding: 20px;
    border-top: 1px solid #e2e8f0;
  }
  .drawer-browse-all-btn {
    width: 100%;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  /* Toast notification */
  .toast-notification {
    position: fixed;
    top: 75px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    animation: toastPop 0.3s ease;
  }
  @keyframes toastPop {
    from { opacity: 0; transform: translate(-50%, -10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  /* Reveal Animations */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.in {
    opacity: 1;
    transform: translateY(0);
  }

  /* Responsive Rules */
  @media (max-width: 1100px) {
    .category-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .properties-listing-grid { grid-template-columns: repeat(2, 1fr); }
    .statsGrid { grid-template-columns: repeat(2, 1fr); }
    .how-steps-grid { grid-template-columns: repeat(2, 1fr); }
    .why-features-matrix { grid-template-columns: repeat(2, 1fr); }
    .pricing-packages-grid { grid-template-columns: 1fr; max-width: 500px; }
    .pricing-package-card.popular-card { transform: none; }
    .guest-reviews-grid { grid-template-columns: 1fr; }
    .footerInner { grid-template-columns: 1fr; gap: 40px; }
  }

  @media (max-width: 900px) {
    .desktop-nav-links { display: none; }
    .mobile-toggle-btn { display: block; }
    .mobile-dropdown-menu { display: flex; }
    .searchBarInner { flex-direction: column; gap: 8px; }
    .search-segment-box { width: 100%; }
    .hero-search-submit-btn { width: 100%; justify-content: center; }
    .dest-dropdown-popover { width: 100%; }
    .guests-dropdown-popover { width: 100%; right: auto; left: 0; }
    .flash-deal-banner-card { flex-direction: column; padding: 32px 24px; }
    .flash-deal-right { width: 100%; }
    .deal-floating-mini-card { width: 100%; }
    .planner-controls-grid { grid-template-columns: 1fr; }
    .planner-result-banner { flex-direction: column; align-items: flex-start; }
    .planner-find-btn { width: 100%; text-align: center; }
  }

  @media (max-width: 640px) {
    .category-cards-grid { grid-template-columns: 1fr; }
    .properties-listing-grid { grid-template-columns: 1fr; }
    .statsGrid { grid-template-columns: 1fr; }
    .how-steps-grid { grid-template-columns: 1fr; }
    .why-features-matrix { grid-template-columns: 1fr; }
    .footerLinksGrid { grid-template-columns: 1fr; }
    .county-badge { display: none; }
    .featured-category-filter-tabs { width: 100%; overflow-x: auto; flex-wrap: nowrap; }
  }
`;