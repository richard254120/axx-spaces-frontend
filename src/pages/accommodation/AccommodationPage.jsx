import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  useAccommodationHome,
  ADVERTISING_PACKAGES,
} from "../../features/accommodation";
import SocialMediaLinks from "../../components/SocialMediaLinks";

// Popular Kenyan destinations for quick filter & suggestions (No emojis)
const POPULAR_DESTINATIONS = [
  { name: "Diani Beach", county: "Kwale County", type: "Beach & Coast" },
  { name: "Maasai Mara", county: "Narok County", type: "Safari & Bush" },
  { name: "Naivasha", county: "Nakuru County", type: "Lakes & Escapes" },
  { name: "Nairobi", county: "Nairobi County", type: "City & Skyline" },
  { name: "Watamu", county: "Kilifi County", type: "Marine & Beach" },
  { name: "Nanyuki", county: "Laikipia County", type: "Mt. Kenya Escapes" },
  { name: "Amboseli", county: "Kajiado County", type: "Kilimanjaro Views" },
  { name: "Lamu Island", county: "Lamu County", type: "Historical Coast" },
];

// Curated stay categories with high-definition imagery and stay counts
const STAY_CATEGORIES = [
  { name: "Beachfront Villas", filterName: "beach", count: 42, desc: "Private pools & direct ocean access in Diani & Watamu" },
  { name: "Safari Lodges", filterName: "safari", count: 35, desc: "Game drives & luxury bush camps in Mara & Amboseli" },
  { name: "Lake & Rift Retreats", filterName: "mountain", count: 28, desc: "Serene lakeside cottages in Naivasha & Elementaita" },
  { name: "City Skyline Suites", filterName: "city", count: 64, desc: "High-floor penthouses in Westlands, Kilimani & CBD" },
];

// Verified Guest Testimonials
const GUEST_TESTIMONIALS = [
  {
    name: "Brian Odhiambo",
    role: "Tech Lead, Nairobi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    stay: "Ocean Villa in Diani Beach",
    text: "Directly chatting with the host on WhatsApp made check-in seamless. Zero middleman fees and the beach villa looked exactly like the photos.",
  },
  {
    name: "Wanjiku Mwangi",
    role: "Photographer & Traveler",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    stay: "Naivasha Lakeview Lodge",
    text: "We booked a weekend getaway in Naivasha for our family. Fast response, verified host, and completely transparent rates without hidden surprises.",
  },
  {
    name: "Kevin Kiprop",
    role: "Business Consultant",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    stay: "Westlands Luxury Penthouse",
    text: "AxxSpace Accommodation is now my go-to for staycations and work retreats in Kenya. Clean, reliable, and premium quality throughout.",
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: "How do I book an accommodation on AxxSpace?",
    a: "Simply browse our verified Kenyan stays, select your dates and number of guests, and click 'View Details' or 'WhatsApp' to connect directly with the verified host. There are zero agency commissions.",
  },
  {
    q: "Are the property owners and hosts verified?",
    a: "Yes. Every accommodation listing undergoes identity, physical location, and quality verification before receiving the Emerald Verified Host badge.",
  },
  {
    q: "Can I inspect the stay or chat before making any payment?",
    a: "Absolutely. We encourage direct communication via WhatsApp and video tours so you can confirm all amenities, check-in instructions, and cancellation policies directly with the host.",
  },
  {
    q: "How do I list my hotel, villa, or Airbnb as a host?",
    a: "Click 'List Property (Host)' at the top of the page, sign up for a host account, and submit your property photos, amenities, and nightly rates. Our moderation team reviews and approves listings promptly.",
  },
  {
    q: "What payment methods are supported?",
    a: "Direct booking arrangements are agreed between you and the host, typically via M-Pesa or bank transfer directly with no platform surcharges.",
  },
];

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isHostUser = Boolean(user && (user.role === "host" || user.role === "admin"));
  const { featured: backendFeatured } = useAccommodationHome();

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
  const [sortBy, setSortBy] = useState("recommended");
  const [howItWorksTab, setHowItWorksTab] = useState("guests"); // "guests" | "hosts"
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Wishlist / Favorites State
  const [favs, setFavs] = useState(() => {
    try {
      const stored = localStorage.getItem("axx_accommodation_favs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const searchContainerRef = useRef(null);

  // Budget Planner State
  const [plannerDestination, setPlannerDestination] = useState("Coast (Diani / Mombasa)");
  const [plannerNights, setPlannerNights] = useState(3);
  const [plannerStyle, setPlannerStyle] = useState("comfort"); // "budget" | "comfort" | "luxury"

  // Only show real backend properties
  const allProperties = useMemo(() => {
    if (backendFeatured && backendFeatured.length > 0) {
      return backendFeatured.map((p) => ({
        _id: p._id || p.id,
        id: p._id || p.id,
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
        amenities: p.amenities && p.amenities.length > 0 ? p.amenities.slice(0, 5) : ["WiFi", "Pool", "Parking", "Air Conditioning"],
        image: p.images && p.images[0]?.imageUrl ? p.images[0].imageUrl : (typeof p.images?.[0] === "string" ? p.images[0] : (p.image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80")),
        whatsapp: p.whatsapp || p.phone || "254745689773",
        color: p.color || "#E31B1B",
        categoryTab: (p.category || p.type || "")?.toLowerCase().includes("beach") ? "beach" : (p.category || p.type || "")?.toLowerCase().includes("safari") ? "safari" : (p.category || p.type || "")?.toLowerCase().includes("mountain") || (p.category || p.type || "")?.toLowerCase().includes("lake") ? "mountain" : "city",
        description: p.description || "Comfortable stay with verified Kenyan hospitality.",
        videos: p.videos || [],
      }));
    }
    return [];
  }, [backendFeatured]);

  // Filtered properties based on category tab and sorting
  const displayedProperties = useMemo(() => {
    let list = allProperties;
    if (activeCategoryTab === "beach") {
      list = allProperties.filter(
        (p) =>
          p.categoryTab === "beach" ||
          p.category?.toLowerCase().includes("beach") ||
          p.location?.toLowerCase().includes("mombasa") ||
          p.location?.toLowerCase().includes("diani") ||
          p.location?.toLowerCase().includes("watamu")
      );
    } else if (activeCategoryTab === "safari") {
      list = allProperties.filter(
        (p) =>
          p.categoryTab === "safari" ||
          p.category?.toLowerCase().includes("safari") ||
          p.category?.toLowerCase().includes("camp") ||
          p.location?.toLowerCase().includes("mara") ||
          p.location?.toLowerCase().includes("laikipia") ||
          p.location?.toLowerCase().includes("amboseli")
      );
    } else if (activeCategoryTab === "mountain") {
      list = allProperties.filter(
        (p) =>
          p.categoryTab === "mountain" ||
          p.category?.toLowerCase().includes("mountain") ||
          p.category?.toLowerCase().includes("lake") ||
          p.location?.toLowerCase().includes("naivasha") ||
          p.location?.toLowerCase().includes("nanyuki")
      );
    } else if (activeCategoryTab === "city") {
      list = allProperties.filter(
        (p) =>
          p.categoryTab === "city" ||
          p.category?.toLowerCase().includes("city") ||
          p.location?.toLowerCase().includes("nairobi")
      );
    }

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortBy === "rating-desc") {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [allProperties, activeCategoryTab, sortBy]);

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
      showToast(`Removed from your saved stays`);
    } else {
      updated = [...favs, id];
      showToast(`Saved "${name || "Property"}" to wishlist`);
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
  const guestsLabel = `${guestsCount.adults + guestsCount.children} guest${guestsCount.adults + guestsCount.children > 1 ? "s" : ""}, ${guestsCount.rooms} room${guestsCount.rooms > 1 ? "s" : ""}`;

  // Budget Planner Calculation
  const estimatedNightlyRate =
    plannerStyle === "budget" ? 4500 : plannerStyle === "comfort" ? 12000 : 28000;
  const totalEstimatedStay = estimatedNightlyRate * plannerNights;

  return (
    <div className="ax-accommodation-root">
      <style>{css}</style>

      {/* ── TOP SCROLL PROGRESS BAR ── */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP NAVIGATION HEADER (Executive Midnight Theme) ── */}
      <header className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner-container">
          {/* BRAND */}
          <div className="nav-logo-group" onClick={() => navigate("/accommodation")}>
            <div className="nav-logo-badge">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="nav-logo-text">
              <div className="nav-logo-wordmark">
                <span className="logo-brand-white">AXX</span>
                <span className="logo-brand-red">Space</span>
              </div>
              <span className="nav-logo-sub">Accommodation</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-links">
            <button type="button" className="nav-link-btn" onClick={() => navigate("/accommodation/listings")}>
              Explore Stays
            </button>
            <button type="button" className="nav-link-btn" onClick={() => document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" })}>
              Featured Stays
            </button>
            <button type="button" className="nav-link-btn" onClick={() => document.getElementById("budget-planner")?.scrollIntoView({ behavior: "smooth" })}>
              Budget Planner
            </button>
            <button type="button" className="nav-link-btn" onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}>
              For Hosts
            </button>
            <button type="button" className="nav-link-btn" onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}>
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="nav-actions-group">
            {/* Wishlist Button with Counter */}
            <button
              type="button"
              className="wishlist-trigger-btn"
              onClick={() => setWishlistDrawerOpen(true)}
              title="Saved Stays"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill={favs.length > 0 ? "var(--brand-red)" : "none"} stroke={favs.length > 0 ? "var(--brand-red)" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="wishlist-badge-count">{favs.length}</span>
            </button>

            {isHostUser ? (
              <div className="user-nav-box">
                <button
                  type="button"
                  className="dashboard-nav-btn"
                  onClick={() => navigate("/accommodation/dashboard")}
                >
                  Host Dashboard
                </button>
                <div className="user-avatar-circle" title={user.name || "Host"}>
                  {(user.name || "H")[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="sign-in-btn"
                  onClick={() => navigate("/accommodation/login?tab=login")}
                >
                  Host Sign In
                </button>
                <button
                  type="button"
                  className="list-property-btn"
                  onClick={() => navigate("/accommodation/register?tab=register")}
                >
                  <span>List Property (Host)</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button
                  type="button"
                  className="mobile-header-auth-btn"
                  onClick={() => navigate("/accommodation/login?tab=login")}
                >
                  Host Portal
                </button>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`mobile-toggle-btn ${mobileMenuOpen ? "is-active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="mobile-toggle-bars">
                <span className="mobile-toggle-bar bar-1" />
                <span className="mobile-toggle-bar bar-2" />
                <span className="mobile-toggle-bar bar-3" />
              </span>
              <span className="mobile-toggle-label">{mobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            <div className="mobile-menu-header-bar">
              <div className="mobile-menu-brand-tag">
                <span className="mobile-menu-brand-dot" />
                <span>ACCOMMODATION NAVIGATION</span>
              </div>
              <button
                type="button"
                className="mobile-menu-close-action"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-nav-links">
              <button
                type="button"
                className="mobile-menu-nav-btn"
                onClick={() => { navigate("/accommodation/listings"); setMobileMenuOpen(false); }}
              >
                <div className="mobile-nav-icon-wrap icon-amber">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <div className="mobile-nav-text-group">
                  <span className="mobile-nav-text-main">Explore All Stays</span>
                  <span className="mobile-nav-text-sub">Villas, Safari Cottages &amp; Apartments</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </button>

              <button
                type="button"
                className="mobile-menu-nav-btn"
                onClick={() => { document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}
              >
                <div className="mobile-nav-icon-wrap icon-rose">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="mobile-nav-text-group">
                  <span className="mobile-nav-text-main">Featured Kenyan Stays</span>
                  <span className="mobile-nav-text-sub">Top-rated vacation homes &amp; getaways</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </button>

              <button
                type="button"
                className="mobile-menu-nav-btn"
                onClick={() => { document.getElementById("budget-planner")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}
              >
                <div className="mobile-nav-icon-wrap icon-blue">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M16 10h.01" />
                    <path d="M12 10h.01" />
                    <path d="M8 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M8 14h.01" />
                    <path d="M12 18h.01" />
                    <path d="M8 18h.01" />
                  </svg>
                </div>
                <div className="mobile-nav-text-group">
                  <span className="mobile-nav-text-main">Stay Budget Estimator</span>
                  <span className="mobile-nav-text-sub">Calculate stay costs by duration &amp; guests</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </button>

              <button
                type="button"
                className="mobile-menu-nav-btn"
                onClick={() => { document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}
              >
                <div className="mobile-nav-icon-wrap icon-emerald">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" />
                  </svg>
                </div>
                <div className="mobile-nav-text-group">
                  <span className="mobile-nav-text-main">Host Pricing &amp; Advertising</span>
                  <span className="mobile-nav-text-sub">Plans for vacation rental owners</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </button>

              <button
                type="button"
                className="mobile-menu-nav-btn"
                onClick={() => { document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}
              >
                <div className="mobile-nav-icon-wrap icon-purple">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="mobile-nav-text-group">
                  <span className="mobile-nav-text-main">Help &amp; FAQ</span>
                  <span className="mobile-nav-text-sub">Host rules, guest protection &amp; payments</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </button>
            </div>

            <div className="mobile-nav-divider" />

            <div className="mobile-menu-auth-group">
              {isHostUser ? (
                <button
                  type="button"
                  className="mobile-menu-action-btn host-action-primary"
                  onClick={() => { navigate("/accommodation/dashboard"); setMobileMenuOpen(false); }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Go to Host Dashboard →</span>
                </button>
              ) : (
                <>
                  <div className="mobile-auth-duo-row">
                    <button
                      type="button"
                      className="mobile-auth-duo-btn duo-signin"
                      onClick={() => { navigate("/accommodation/login?tab=login"); setMobileMenuOpen(false); }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>Host Sign In</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-auth-duo-btn duo-register"
                      onClick={() => { navigate("/accommodation/register?tab=register"); setMobileMenuOpen(false); }}
                    >
                      <span>Register Host</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mobile-menu-action-btn host-action-primary"
                    onClick={() => { navigate("/accommodation/register-property"); setMobileMenuOpen(false); }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>List Your Property (Host) →</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ═════════════════════════════════════════════════════════════
          1. ULTRA LUXURY HERO SECTION (Matching Rentals/Property)
      ═════════════════════════════════════════════════════════════ */}
      <section className="listings-hero">
        {/* Ambient atmospheric glowing orbs */}
        <div className="ambient-orb orb-crimson" />
        <div className="ambient-orb orb-amber" />
        <div className="ambient-orb orb-navy" />
        <div className="hero-grid-pattern" />

        {/* Compact Hero Header (Matching Rentals/Property) */}
        <div className="hero-compact-header">
          <div className="hero-compact-left">
            <h1 className="hero-compact-title">AxxSpace Accommodations</h1>
            <p className="hero-compact-sub">Verified vacation homes, safari lodges & luxury stays across 47 counties</p>
          </div>

          <div className="hero-compact-actions">
            {!user ? (
              <button
                type="button"
                className="hero-compact-btn-primary"
                onClick={() => navigate("/accommodation/register?tab=register")}
              >
                <span>List Stay (Host)</span>
                <span className="btn-arrow">→</span>
              </button>
            ) : isHostUser ? (
              <button
                type="button"
                className="hero-compact-btn-primary"
                onClick={() => navigate("/accommodation/dashboard")}
              >
                <span>Host Dashboard</span>
                <span className="btn-arrow">→</span>
              </button>
            ) : null}

            <button
              type="button"
              className="hero-compact-btn-secondary"
              onClick={() => navigate("/accommodation/login?tab=login")}
            >
              <span>Host Portal</span>
            </button>
          </div>
        </div>

        {/* Central Hero Tagline */}
        <div className="hero-center-content">
          <div className="hero-trust-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Direct Bookings · Verified Kenyan Hosts · 0% Hidden Commissions</span>
          </div>

          <h2 className="hero-main-headline">
            Discover Kenya's <br />
            <span className="shimmering-gradient-text">Finest Stays & Hidden Escapes</span>
          </h2>

          <p className="hero-main-sub">
            From sun-kissed Diani beachfront villas and Great Rift Valley safari lodges to chic Nairobi skyline penthouses. Connect directly with verified hosts on WhatsApp with zero middleman markups.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            2. FLOATING REAL ESTATE SEARCH & FILTER CONSOLE
        ═════════════════════════════════════════════════════════════ */}
        <div className="search-console-wrapper" ref={searchContainerRef}>
          <div className="search-console-card">
            <form onSubmit={handleSearchSubmit} className="search-inputs-grid">
              {/* Segment 1: Destination */}
              <div
                className="search-segment"
                onClick={() => {
                  setShowDestDropdown(!showDestDropdown);
                  setShowGuestsDropdown(false);
                }}
              >
                <label className="segment-label">WHERE TO?</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search city, beach, or safari park…"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="segment-text-input"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setShowDestDropdown(true)}
                  />
                  {destination && (
                    <button
                      type="button"
                      className="segment-clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDestination("");
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Destination Suggestions Popover (Clean SVG icons, zero emojis) */}
                {showDestDropdown && (
                  <div className="dest-dropdown-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="dest-dropdown-header">
                      <span>POPULAR KENYAN DESTINATIONS</span>
                    </div>
                    <div className="dest-dropdown-list">
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
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--brand-red)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div style={{ flex: 1 }}>
                            <div className="dest-item-name">{dest.name}</div>
                            <div className="dest-item-county">{dest.county} · {dest.type}</div>
                          </div>
                          <span className="dest-select-arrow">Select →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Segment 2: Check-In */}
              <div className="search-segment">
                <label className="segment-label">CHECK-IN</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="segment-text-input"
                  />
                </div>
              </div>

              {/* Segment 3: Check-Out */}
              <div className="search-segment">
                <label className="segment-label">CHECK-OUT</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M12 14l2 2 4-4" />
                  </svg>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="segment-text-input"
                  />
                </div>
              </div>

              {/* Segment 4: Guests & Rooms */}
              <div
                className="search-segment"
                onClick={() => {
                  setShowGuestsDropdown(!showGuestsDropdown);
                  setShowDestDropdown(false);
                }}
              >
                <label className="segment-label">GUESTS & ROOMS</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div className="segment-text-display">
                    {guestsLabel}
                  </div>
                </div>

                {/* Guests Popover Stepper */}
                {showGuestsDropdown && (
                  <div className="guests-dropdown-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="guest-stepper-row">
                      <div>
                        <div className="stepper-title">Adults</div>
                        <div className="stepper-sub">Age 13 or above</div>
                      </div>
                      <div className="stepper-controls">
                        <button
                          type="button"
                          disabled={guestsCount.adults <= 1}
                          onClick={() => setGuestsCount((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                          className="stepper-btn"
                        >
                          -
                        </button>
                        <span className="stepper-num">{guestsCount.adults}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, adults: g.adults + 1 }))}
                          className="stepper-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="guest-stepper-row">
                      <div>
                        <div className="stepper-title">Children</div>
                        <div className="stepper-sub">Ages 0 - 12</div>
                      </div>
                      <div className="stepper-controls">
                        <button
                          type="button"
                          disabled={guestsCount.children <= 0}
                          onClick={() => setGuestsCount((g) => ({ ...g, children: Math.max(0, g.children - 1) }))}
                          className="stepper-btn"
                        >
                          -
                        </button>
                        <span className="stepper-num">{guestsCount.children}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, children: g.children + 1 }))}
                          className="stepper-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="guest-stepper-row">
                      <div>
                        <div className="stepper-title">Rooms</div>
                        <div className="stepper-sub">Bedrooms / Suites</div>
                      </div>
                      <div className="stepper-controls">
                        <button
                          type="button"
                          disabled={guestsCount.rooms <= 1}
                          onClick={() => setGuestsCount((g) => ({ ...g, rooms: Math.max(1, g.rooms - 1) }))}
                          className="stepper-btn"
                        >
                          -
                        </button>
                        <span className="stepper-num">{guestsCount.rooms}</span>
                        <button
                          type="button"
                          onClick={() => setGuestsCount((g) => ({ ...g, rooms: g.rooms + 1 }))}
                          className="stepper-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="guests-done-btn"
                      onClick={() => setShowGuestsDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Search Button */}
              <div className="search-submit-segment">
                <button type="submit" className="hero-search-submit-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Search Stays</span>
                </button>
              </div>
            </form>

            {/* Quick Category Chips Strip (Zero Emojis) */}
            <div className="quick-category-strip">
              <span className="quick-cat-label">Explore Hotspots:</span>
              <div className="quick-cat-scroll">
                <button
                  type="button"
                  className={`quick-chip ${!destination ? "active" : ""}`}
                  onClick={() => setDestination("")}
                >
                  <span>All Stays</span>
                </button>
                {POPULAR_DESTINATIONS.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    className={`quick-chip ${destination === d.name ? "active" : ""}`}
                    onClick={() => handleDestinationSelect(d.name)}
                  >
                    <span>{d.name}</span>
                  </button>
                ))}
                {favs.length > 0 && (
                  <button
                    type="button"
                    className="quick-chip"
                    onClick={() => setWishlistDrawerOpen(true)}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--brand-red)" stroke="var(--brand-red)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>Saved ({favs.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          2. MAIN CONTENT BODY & DISCOVERY WORKSPACE (Matching Rentals)
      ═════════════════════════════════════════════════════════════ */}
      <main className="accommodation-main-canvas" id="featured-section">
        {/* ── HIGH LEVEL NAVIGATION TABS (Segmented Discovery Nav with Clean SVGs) ── */}
        <div className="segmented-discovery-nav">
          <div className="discovery-tabs-cluster">
            {[
              {
                id: "all",
                label: "All Stays & Escapes",
                icon: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
              },
              {
                id: "beach",
                label: "Beachfront Villas",
                icon: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ),
              },
              {
                id: "safari",
                label: "Safari & Bush Camps",
                icon: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                ),
              },
              {
                id: "mountain",
                label: "Lakes & Mountains",
                icon: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
                  </svg>
                ),
              },
              {
                id: "city",
                label: "City Luxury Suites",
                icon: (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <path d="M9 22v-4h6v4" />
                    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`discovery-tab ${activeCategoryTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveCategoryTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-text">{tab.label}</span>
                {tab.id === "all" && <span className="tab-counter">{allProperties.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── TOOLBAR: RESULTS COUNT, SORTING, MAP VIEW & SAVED ── */}
        <div className="listings-toolbar">
          <div className="toolbar-left">
            <h2 className="results-headline">
              <span className="results-bold-num">{displayedProperties.length}</span>
              <span>{displayedProperties.length === 1 ? " Verified Stay Found" : " Verified Stays Found in Kenya"}</span>
              {destination && <span className="results-location-tag">in "{destination}"</span>}
            </h2>
          </div>

          <div className="toolbar-right">
            {/* Sort Selector */}
            <div className="sort-box">
              <span className="sort-label">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>

            {/* Trip Planner Jump */}
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => document.getElementById("budget-planner")?.scrollIntoView({ behavior: "smooth" })}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.2" fill="none">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Stay Estimator</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              className={`toolbar-btn ${wishlistDrawerOpen ? "active" : ""}`}
              onClick={() => setWishlistDrawerOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill={favs.length > 0 ? "var(--brand-red)" : "none"} stroke={favs.length > 0 ? "var(--brand-red)" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Saved ({favs.length})</span>
            </button>
          </div>
        </div>

        {/* ── 3. MODERN PROPERTY CARDS GRID (Matching Rentals/Property) ── */}
        <div className="properties-modern-grid">
          {displayedProperties.length === 0 ? (
            <div className="empty-results-box">
              <div className="empty-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
                  <path d="M9 22v-4h6v4"></path>
                </svg>
              </div>
              <h3 className="empty-title">Accommodations Coming Soon</h3>
              <p className="empty-desc">
                We're reviewing stays for this category. Browse all available stays or list your property today!
              </p>
              <div className="empty-actions">
                <button type="button" className="btn-primary-red" onClick={() => navigate("/accommodation/listings")}>
                  Browse All Stays
                </button>
                <button type="button" className="btn-secondary-outline" onClick={() => navigate("/accommodation/register-property")}>
                  List Your Property
                </button>
              </div>
            </div>
          ) : (
            displayedProperties.map((prop, idx) => {
              const isFav = favs.includes(prop._id || prop.id);
              return (
                <article
                  key={prop._id || prop.id || idx}
                  className="property-card reveal"
                  style={{ animationDelay: `${(idx % 3) * 0.1}s` }}
                  onClick={() => navigate(`/accommodation/${prop._id || prop.id}`)}
                >
                  {/* Card Media Shell */}
                  <div className="card-media-shell">
                    <img
                      src={prop.image}
                      alt={prop.name}
                      className="card-main-image"
                      loading="lazy"
                    />

                    {/* Badge Overlay */}
                    <div className="card-badges-overlay">
                      <span className="badge-category-tag">{prop.type || prop.category}</span>
                      <span className="badge-verified-host">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <span>Verified Host</span>
                      </span>
                      {prop.videos && prop.videos.length > 0 && (
                        <span className="badge-video-tour">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                          <span>Video Tour</span>
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      className={`card-wishlist-btn ${isFav ? "active" : ""}`}
                      onClick={(e) => toggleFavorite(e, prop._id || prop.id, prop.name)}
                      aria-label="Save to Wishlist"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill={isFav ? "var(--brand-red)" : "none"} stroke={isFav ? "var(--brand-red)" : "currentColor"} strokeWidth="2.4">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div className="card-content-body">
                    {/* Location Pin */}
                    <div className="card-location-row">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="var(--brand-red)" strokeWidth="2.4" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="card-location-text">{prop.location}</span>
                    </div>

                    {/* Property Title */}
                    <h3 className="card-property-title">{prop.name}</h3>

                    {/* Amenities Chips */}
                    <div className="card-amenities-row">
                      {(prop.amenities || ["WiFi", "Pool", "Parking"]).slice(0, 3).map((am) => (
                        <span key={am} className="card-amenity-chip">
                          ✓ {am}
                        </span>
                      ))}
                      {prop.amenities && prop.amenities.length > 3 && (
                        <span className="card-amenity-more">+{prop.amenities.length - 3}</span>
                      )}
                    </div>

                    <div className="card-body-divider" />

                    {/* Price and Rating row */}
                    <div className="card-bottom-row">
                      <div>
                        <div className="card-price-amount">
                          KSh {(prop.price || prop.basePrice || 0).toLocaleString()}
                        </div>
                        <div className="card-price-frequency">per night</div>
                      </div>

                      <div className="card-rating-badge">
                        <span className="star-gold">★</span>
                        <span className="rating-num">{prop.rating || "4.8"}</span>
                        <span className="rating-count">({prop.reviews || "24"})</span>
                      </div>
                    </div>

                    {/* Action CTAs */}
                    <div className="card-actions-grid" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-card-details"
                        onClick={() => navigate(`/accommodation/${prop._id || prop.id}`)}
                      >
                        <span>View Details</span>
                        <span className="arrow-icon">→</span>
                      </button>

                      <button
                        type="button"
                        className="btn-card-whatsapp"
                        title="Chat directly on WhatsApp"
                        onClick={(e) => handleWhatsAppContact(e, prop)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.72 1.33-1.37 1.57-.45.17-.98.24-3.16-.62-2.34-.92-3.83-3.32-3.95-3.48-.12-.16-.95-1.26-.95-2.4 0-1.14.6-1.7.81-1.93.21-.23.46-.29.62-.29.15 0 .31 0 .44.01.14.01.32-.05.5.38.18.44.62 1.51.68 1.62.06.12.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.91.81 1.67 1.06 1.91 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.19 1.3z" />
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* View All Button */}
        <div className="section-footer-cta">
          <button
            type="button"
            className="btn-browse-all"
            onClick={() => navigate("/accommodation/listings")}
          >
            <span>Explore All 500+ Verified Stays in Kenya</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </main>

      {/* ── SPECIAL DEALS & FLASH OFFERS BANNER (Executive Atmosphere) ── */}
      <section className="deals-banner-section">
        <div className="deals-banner-card reveal">
          <div className="ambient-orb orb-crimson" style={{ top: "-60px", left: "10%", opacity: 0.4 }} />
          <div className="ambient-orb orb-amber" style={{ bottom: "-60px", right: "10%", opacity: 0.3 }} />

          <div className="deals-content-left">
            <div className="deal-badge-pill">LIMITED WEEKEND ESCAPES</div>
            <h3 className="deal-title">Save Up to 25% on Direct Bookings This Month</h3>
            <p className="deal-desc">
              Exclusive direct host specials in Diani Beach, Naivasha, and the Maasai Mara. Connect directly, avoid third-party agency surcharges, and enjoy complimentary breakfast or sunset safari drives.
            </p>
            <div className="deal-actions-row">
              <button
                type="button"
                className="btn-claim-deal"
                onClick={() => navigate("/accommodation/listings?sort=Price:+Low+to+High")}
              >
                Browse Discounted Stays →
              </button>
              <div className="deal-guarantees">
                <span>✓ Verified Direct Rates</span>
                <span>•</span>
                <span>✓ Direct WhatsApp Contact</span>
              </div>
            </div>
          </div>

          <div className="deals-preview-right">
            <div className="deal-mini-card">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="deal-icon-square">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2.2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "var(--navy-ink)", fontSize: "15px" }}>Diani Coastal Villa</div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>3 Nights · Oceanfront Private Pool</div>
                </div>
              </div>
              <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--brand-red)", fontWeight: 800, fontSize: "16px" }}>Save KSh 9,000</span>
                <span className="deal-pill-tag">25% OFF DIRECT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KENYA STAY BUDGET ESTIMATOR ── */}
      <section id="budget-planner" className="planner-section">
        <div className="planner-inner-shell reveal">
          <div className="planner-header">
            <span className="section-eyebrow">SMART COST CALCULATOR</span>
            <h3 className="section-title">Kenya Stay Budget Estimator</h3>
            <p className="section-subtitle">
              Plan your getaway budget based on real market rates across Kenya's top vacation and business destinations.
            </p>
          </div>

          <div className="planner-card">
            <div className="planner-controls-grid">
              {/* Destination Selector */}
              <div className="planner-group">
                <label className="planner-label">Destination Region</label>
                <select
                  value={plannerDestination}
                  onChange={(e) => setPlannerDestination(e.target.value)}
                  className="planner-select"
                >
                  <option value="Coast (Diani / Mombasa)">Coast (Diani Beach / Mombasa)</option>
                  <option value="Rift Valley (Naivasha / Nakuru)">Rift Valley (Naivasha / Nakuru)</option>
                  <option value="Maasai Mara / Safari">Maasai Mara / Amboseli Bush</option>
                  <option value="Nairobi Luxury Penthouses">Nairobi Luxury Penthouses</option>
                  <option value="Mt. Kenya (Nanyuki)">Mt. Kenya (Nanyuki / Laikipia)</option>
                </select>
              </div>

              {/* Number of Nights */}
              <div className="planner-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="planner-label">Length of Stay</label>
                  <span className="planner-val-badge">{plannerNights} Night{plannerNights > 1 ? "s" : ""}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={plannerNights}
                  onChange={(e) => setPlannerNights(Number(e.target.value))}
                  className="planner-slider"
                />
              </div>

              {/* Style of Travel */}
              <div className="planner-group">
                <label className="planner-label">Stay Style</label>
                <div className="planner-styles-cluster">
                  {[
                    { id: "budget", label: "Cozy / Budget", desc: "~KSh 4.5K/night" },
                    { id: "comfort", label: "Comfort / Villa", desc: "~KSh 12K/night" },
                    { id: "luxury", label: "Luxury / Resort", desc: "~KSh 28K/night" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`planner-style-btn ${plannerStyle === st.id ? "active" : ""}`}
                      onClick={() => setPlannerStyle(st.id)}
                    >
                      <div style={{ fontWeight: 800 }}>{st.label}</div>
                      <div style={{ fontSize: "11px", opacity: 0.8 }}>{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Result Banner */}
            <div className="planner-result-banner">
              <div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Estimated Total Stay Cost</div>
                <div className="planner-total-amount">
                  KSh {totalEstimatedStay.toLocaleString()}
                  <span style={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}> for {plannerNights} nights</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--emerald)", fontWeight: 700, marginTop: "4px" }}>
                  ✓ Direct host pricing · Zero middleman commissions
                </div>
              </div>

              <button
                type="button"
                className="planner-find-btn"
                onClick={() => navigate(`/accommodation/listings?maxPrice=${estimatedNightlyRate + 4000}`)}
              >
                Find Stays in This Range →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="how-it-works-section">
        <div className="content-container reveal">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="section-eyebrow">SEAMLESS HOSPITALITY</span>
            <h3 className="section-title">How AxxSpace Accommodation Works</h3>
            <p className="section-subtitle">
              Connecting travelers and corporate guests directly with verified property hosts across Kenya.
            </p>

            {/* Tab switch: Guests vs Hosts */}
            <div className="how-tab-toggle">
              <button
                type="button"
                className={`how-toggle-btn ${howItWorksTab === "guests" ? "active" : ""}`}
                onClick={() => setHowItWorksTab("guests")}
              >
                For Travelers & Guests
              </button>
              <button
                type="button"
                className={`how-toggle-btn ${howItWorksTab === "hosts" ? "active" : ""}`}
                onClick={() => setHowItWorksTab("hosts")}
              >
                For Property Hosts
              </button>
            </div>
          </div>

          <div className="how-steps-grid">
            {howItWorksTab === "guests" ? (
              <>
                <div className="how-step-card">
                  <div className="step-num-pill">01</div>
                  <h4 className="step-card-title">Explore Verified Stays</h4>
                  <p className="step-card-desc">
                    Search by destination, view verified photos, high-definition video walkthroughs, and confirmed amenities.
                  </p>
                </div>
                <div className="how-step-card">
                  <div className="step-num-pill">02</div>
                  <h4 className="step-card-title">Chat Directly on WhatsApp</h4>
                  <p className="step-card-desc">
                    Inquire about dates, negotiated rates, and special requests straight with the owner. Zero broker markups.
                  </p>
                </div>
                <div className="how-step-card">
                  <div className="step-num-pill">03</div>
                  <h4 className="step-card-title">Seamless Check-In</h4>
                  <p className="step-card-desc">
                    Receive verified GPS coordinates, self-check-in lockbox codes, and host hospitality instructions.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="how-step-card">
                  <div className="step-num-pill">01</div>
                  <h4 className="step-card-title">List Your Stay Free</h4>
                  <p className="step-card-desc">
                    Create an account, upload photos, set nightly rates, and specify house rules for vacationers and corporate clients.
                  </p>
                </div>
                <div className="how-step-card">
                  <div className="step-num-pill">02</div>
                  <h4 className="step-card-title">Get Verified</h4>
                  <p className="step-card-desc">
                    Our team verifies physical location and ownership, awarding your listing the Emerald Verified Host badge.
                  </p>
                </div>
                <div className="how-step-card">
                  <div className="step-num-pill">03</div>
                  <h4 className="step-card-title">Receive Direct Inquiries</h4>
                  <p className="step-card-desc">
                    Receive direct bookings and WhatsApp inquiries from thousands of travelers visiting Kenya each month.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE AXXSPACE ACCOMMODATION ── */}
      <section className="why-choose-section">
        <div className="content-container reveal">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-eyebrow">THE AXXSPACE ADVANTAGE</span>
            <h3 className="section-title">Why Book & List on AxxSpace</h3>
            <p className="section-subtitle">
              Engineered specifically for the Kenyan hospitality ecosystem with unmatched transparency.
            </p>
          </div>

          <div className="why-cards-grid">
            <div className="why-feature-card">
              <div className="why-icon-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h4 className="why-title">100% Verified Hosts</h4>
              <p className="why-desc">
                We physically and digitally verify host identities and property locations so you can book with total confidence.
              </p>
            </div>

            <div className="why-feature-card">
              <div className="why-icon-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2.2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 15h0M2 9.5h20" />
                </svg>
              </div>
              <h4 className="why-title">Zero Broker Fees</h4>
              <p className="why-desc">
                Cut out arbitrary travel agency commissions. Talk to the actual host and negotiate the most authentic Kenyan rates.
              </p>
            </div>

            <div className="why-feature-card">
              <div className="why-icon-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2.2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h4 className="why-title">Verified Video Walkthroughs</h4>
              <p className="why-desc">
                Experience raw, authentic video tours of bedrooms, pools, and ocean views before you pay a single shilling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOST ADVERTISING PACKAGES (Resembling Rentals) ── */}
      <section id="packages-section" className="packages-section">
        <div className="content-container reveal">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-eyebrow">HOST PARTNER PROGRAM</span>
            <h3 className="section-title">List Your Stay & Reach More Guests</h3>
            <p className="section-subtitle">
              Transparent host advertising packages designed to maximize occupancy and direct inquiries.
            </p>
          </div>

          <div className="packages-cards-grid">
            {ADVERTISING_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`pricing-card ${pkg.popular ? "popular-highlight" : ""}`}
              >
                {pkg.popular && <div className="popular-ribbon">MOST POPULAR</div>}
                <div className="pricing-pkg-name">{pkg.name}</div>
                <div className="pricing-pkg-price">
                  KSh {pkg.price.toLocaleString()}
                  <span className="pricing-pkg-dur"> / {pkg.duration}</span>
                </div>
                <p className="pricing-pkg-desc">{pkg.desc}</p>

                <ul className="pricing-features-list">
                  <li>✓ Direct WhatsApp inquiries</li>
                  <li>✓ Verified Host Emerald badge</li>
                  <li>✓ High-definition photo gallery</li>
                  <li>✓ GPS location mapping</li>
                  {pkg.name !== "Starter" && <li>✓ Featured homepage carousel slot</li>}
                  {pkg.name === "Premium" && <li>✓ Video tour & priority ranking</li>}
                </ul>

                <button
                  type="button"
                  className={`pricing-action-btn ${pkg.popular ? "btn-red-popular" : "btn-dark-standard"}`}
                  onClick={() => navigate("/accommodation/register?tab=register")}
                >
                  Get Started as Host →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="content-container reveal">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-eyebrow">TRUSTED REVIEWS</span>
            <h3 className="section-title">Loved by Kenyan Travelers</h3>
            <p className="section-subtitle">
              Read authentic feedback from travelers who booked direct accommodations on AxxSpace.
            </p>
          </div>

          <div className="testimonials-grid">
            {GUEST_TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div style={{ color: "var(--gold)", fontSize: "16px", marginBottom: "12px" }}>
                  {"★".repeat(t.rating)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-stay-badge">Stayed at {t.stay}</div>
                <div className="testimonial-author-row">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--navy-ink)", fontSize: "14px" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section id="faq-section" className="faq-section">
        <div className="content-container reveal" style={{ maxWidth: "860px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="section-eyebrow">HELP & SUPPORT</span>
            <h3 className="section-title">Frequently Asked Questions</h3>
            <p className="section-subtitle">
              Everything you need to know about booking and hosting on AxxSpace Accommodation.
            </p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  >
                    <span className="faq-question-text">{faq.q}</span>
                    <span className={`faq-chevron ${isOpen ? "rotate" : ""}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p className="faq-answer-text">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION (Midnight & Crimson Atmosphere) ── */}
      <section className="bottom-cta-section">
        <div className="ambient-orb orb-crimson" style={{ top: "-100px", left: "20%", opacity: 0.5 }} />
        <div className="ambient-orb orb-navy" style={{ bottom: "-100px", right: "20%", opacity: 0.4 }} />
        <div className="hero-grid-pattern" />

        <div className="bottom-cta-content reveal">
          <h3 className="bottom-cta-headline">Ready for an Unforgettable Kenyan Stay?</h3>
          <p className="bottom-cta-sub">
            Browse hundreds of verified beach resorts, game lodges, and executive apartments across Kenya, or list your stay today.
          </p>
          <div className="bottom-cta-buttons">
            <button
              type="button"
              className="btn-cta-crimson"
              onClick={() => navigate("/accommodation/listings")}
            >
              Explore Verified Stays →
            </button>
            <button
              type="button"
              className="btn-cta-glass"
              onClick={() => navigate("/accommodation/register?tab=register")}
            >
              List Your Property as Host
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER (Executive Dark) ── */}
      <footer className="accommodation-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="nav-logo-wordmark" style={{ fontSize: "22px" }}>
              <span className="logo-brand-white">AXX</span>
              <span className="logo-brand-red">Space</span>
            </div>
            <p className="footer-desc">
              Kenya's premier property & accommodation marketplace. Connecting travelers, corporate clients, and hosts directly with verified listings and zero agency markups.
            </p>
            <div style={{ marginTop: "12px" }}>
              <SocialMediaLinks />
            </div>
          </div>

          <div className="footer-links-grid">
            <div>
              <h5 className="footer-col-title">Explore Kenya</h5>
              <ul className="footer-links-list">
                <li><button type="button" onClick={() => handleDestinationSelect("Diani Beach")}>Diani Beachfront</button></li>
                <li><button type="button" onClick={() => handleDestinationSelect("Maasai Mara")}>Maasai Mara Safari</button></li>
                <li><button type="button" onClick={() => handleDestinationSelect("Naivasha")}>Naivasha Lakeside</button></li>
                <li><button type="button" onClick={() => handleDestinationSelect("Nairobi")}>Nairobi Penthouses</button></li>
              </ul>
            </div>

            <div>
              <h5 className="footer-col-title">For Hosts</h5>
              <ul className="footer-links-list">
                <li><button type="button" onClick={() => navigate("/accommodation/register-property")}>Add Listing</button></li>
                <li><button type="button" onClick={() => navigate("/accommodation/login?tab=login")}>Host Portal</button></li>
                <li><button type="button" onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}>Advertising Rates</button></li>
                <li><button type="button" onClick={() => navigate("/faq")}>Hosting Guidelines</button></li>
              </ul>
            </div>

            <div>
              <h5 className="footer-col-title">Platform</h5>
              <ul className="footer-links-list">
                <li><button type="button" onClick={() => navigate("/listings")}>Rentals / Property</button></li>
                <li><button type="button" onClick={() => navigate("/about")}>About AxxSpace</button></li>
                <li><button type="button" onClick={() => navigate("/terms")}>Terms & Privacy</button></li>
                <li><button type="button" onClick={() => navigate("/contact")}>Direct Contact</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} AxxSpace Limited. All rights reserved. Kenya's Direct Property & Stay Platform.</div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ color: "var(--emerald)", fontWeight: 700 }}>All 47 Counties Active</span>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href="https://wa.me/254745689773?text=Hi%20AXXSpace%20Accommodation%20Concierge,%20I%20need%20assistance%20finding%20a%20verified%20stay"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-floating-concierge"
        aria-label="Direct WhatsApp Concierge"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.72 1.33-1.37 1.57-.45.17-.98.24-3.16-.62-2.34-.92-3.83-3.32-3.95-3.48-.12-.16-.95-1.26-.95-2.4 0-1.14.6-1.7.81-1.93.21-.23.46-.29.62-.29.15 0 .31 0 .44.01.14.01.32-.05.5.38.18.44.62 1.51.68 1.62.06.12.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.91.81 1.67 1.06 1.91 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.19 1.3z" />
        </svg>
        <span className="wa-tooltip-label">Direct Concierge</span>
      </a>

      {/* ── SCROLL TO TOP ── */}
      <button
        type="button"
        className={`scroll-to-top-button ${showTopBtn ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        ▲
      </button>

      {/* ── WISHLIST DRAWER OVERLAY ── */}
      {wishlistDrawerOpen && (
        <div className="wishlist-overlay" onClick={() => setWishlistDrawerOpen(false)}>
          <div className="wishlist-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="wishlist-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--brand-red)" stroke="var(--brand-red)" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <h4 style={{ fontWeight: 800, margin: 0, fontSize: "16px", color: "var(--navy-ink)" }}>
                  Saved Stays ({favs.length})
                </h4>
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
                <div style={{ textAlign: "center", padding: "40px 10px", color: "#64748B" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--brand-red)" }}>
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--navy-ink)" }}>No saved stays yet</div>
                  <p style={{ fontSize: "13px", marginTop: "6px" }}>Click the heart icon on any accommodation to build your Kenyan getaway wishlist.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                        <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--navy-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>{p.location}</div>
                        <div style={{ fontWeight: 800, color: "var(--brand-red)", fontSize: "13px", marginTop: "2px" }}>
                          KSh {(p.price || p.basePrice || 0).toLocaleString()} / night
                        </div>
                      </div>
                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={(e) => toggleFavorite(e, p._id || p.id, p.name)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wishlist-drawer-footer">
              <button
                type="button"
                className="drawer-browse-all-btn"
                onClick={() => {
                  setWishlistDrawerOpen(false);
                  navigate("/accommodation/listings");
                }}
              >
                Browse All Kenyan Stays →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HIGH-END MODERN STYLING: AXXSPACE LUXURY REAL ESTATE PALETTE
   Palette: Deep Midnight Executive (#08101D) · Signature Crimson (#E31B1B)
   Clean White Card Elevation · Emerald Live Indicators (#10B981)
══════════════════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .ax-accommodation-root {
    --bg-dark: #08101D;
    --bg-dark-secondary: #0D1B2A;
    --canvas-light: #F8FAFC;
    --card-bg: #FFFFFF;
    --brand-red: #E31B1B;
    --brand-red-hover: #c41414;
    --brand-red-light: rgba(227, 27, 27, 0.08);
    --gold: #F59E0B;
    --emerald: #10B981;
    --emerald-light: rgba(16, 185, 129, 0.12);
    --navy-ink: #0F172A;
    --text-muted: #64748B;
    --text-light: #94A3B8;
    --border-soft: #E2E8F0;
    --border-dark: rgba(255, 255, 255, 0.1);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-subtle: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
    --shadow-elevated: 0 20px 40px -15px rgba(15, 23, 42, 0.12);
    --shadow-glow-red: 0 10px 30px -5px rgba(227, 27, 27, 0.3);

    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    color: var(--navy-ink);
    background-color: var(--canvas-light);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .ax-accommodation-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Scroll Progress Bar */
  .scroll-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #E31B1B, #F59E0B);
    z-index: 1001;
    transition: width 0.1s;
  }

  /* ── 1. TOP NAV HEADER (Midnight Executive Theme) ── */
  .main-nav {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(8, 16, 29, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.25s ease;
  }
  .main-nav.scrolled {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  }
  .nav-inner-container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .nav-logo-group {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .nav-logo-badge {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.35);
  }
  .nav-logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .nav-logo-wordmark {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: -0.02em;
  }
  .logo-brand-white { color: #FFFFFF; }
  .logo-brand-red { color: var(--brand-red); margin-left: 1px; }
  .nav-logo-sub {
    font-size: 0.65rem;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .desktop-nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .nav-link-btn {
    background: transparent;
    border: none;
    color: #CBD5E1;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .nav-link-btn:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .wishlist-trigger-btn {
    position: relative;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .wishlist-trigger-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: scale(1.05);
  }
  .wishlist-badge-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--brand-red);
    color: #FFFFFF;
    font-size: 0.68rem;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    box-shadow: 0 2px 6px rgba(227, 27, 27, 0.4);
  }

  .sign-in-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sign-in-btn:hover {
    background: rgba(255, 255, 255, 0.16);
  }
  .list-property-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.35);
    transition: all 0.2s;
  }
  .list-property-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(227, 27, 27, 0.45);
  }
  .user-nav-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dashboard-nav-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
  }
  .user-avatar-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
  }
  .mobile-header-auth-btn {
    display: none;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 12px;
    cursor: pointer;
  }
  .mobile-toggle-btn {
    display: none;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    color: #FFFFFF;
    cursor: pointer;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    transition: all 0.2s ease;
  }
  .mobile-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.3);
  }
  .mobile-toggle-btn.is-active {
    background: #E31B1B;
    border-color: #E31B1B;
  }
  .mobile-toggle-bars {
    width: 16px;
    height: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .mobile-toggle-bar {
    width: 100%;
    height: 2px;
    background: #FFFFFF;
    border-radius: 2px;
    transition: all 0.22s ease;
    transform-origin: center;
  }
  .mobile-toggle-btn.is-active .bar-1 {
    transform: translateY(5px) rotate(45deg);
  }
  .mobile-toggle-btn.is-active .bar-2 {
    opacity: 0;
  }
  .mobile-toggle-btn.is-active .bar-3 {
    transform: translateY(-5px) rotate(-45deg);
  }

  .mobile-dropdown-menu {
    display: flex;
    flex-direction: column;
    padding: 16px 18px 24px;
    background: linear-gradient(180deg, #0B1320 0%, #060B14 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
    animation: axAccDrop 0.22s ease;
  }
  @keyframes axAccDrop {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mobile-menu-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .mobile-menu-brand-tag {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    font-weight: 800;
    color: #94A3B8;
    letter-spacing: 0.6px;
  }
  .mobile-menu-brand-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--brand-red);
  }
  .mobile-menu-close-action {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    cursor: pointer;
    font-size: 11px;
  }
  .mobile-menu-close-action:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.15);
  }

  .mobile-menu-nav-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mobile-menu-nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: #CBD5E1;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .mobile-menu-nav-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #FFFFFF;
  }
  .mobile-nav-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .mobile-nav-text-group {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .mobile-nav-text-main {
    font-size: 13.5px;
    font-weight: 700;
    color: #FFFFFF;
  }
  .mobile-nav-text-sub {
    font-size: 11px;
    color: #94A3B8;
    margin-top: 1px;
  }
  .mobile-nav-arrow {
    font-size: 12px;
    color: #64748B;
    transition: transform 0.15s ease;
  }
  .mobile-menu-nav-btn:hover .mobile-nav-arrow {
    transform: translateX(3px);
    color: #FFFFFF;
  }

  .mobile-nav-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0 14px;
  }

  .mobile-menu-auth-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mobile-auth-duo-row {
    display: flex;
    gap: 8px;
  }
  .mobile-auth-duo-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .duo-signin {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #FFFFFF;
  }
  .duo-signin:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  .duo-register {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #F8FAFC;
  }
  .duo-register:hover {
    background: #1e293b;
  }
  .mobile-menu-action-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .host-action-primary {
    background: linear-gradient(135deg, #E31B1B 0%, #B91C1C 100%);
    border: none;
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(227, 27, 27, 0.3);
  }
  .host-action-primary:hover {
    box-shadow: 0 6px 18px rgba(227, 27, 27, 0.45);
    transform: translateY(-1px);
  }

  /* ── 2. HERO ATMOSPHERE (Matching Rentals/Property) ── */
  .listings-hero {
    position: relative;
    background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
    color: #FFFFFF;
    padding: 24px 20px 48px;
    overflow: hidden;
    isolation: isolate;
  }

  .ambient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: -2;
    opacity: 0.6;
    animation: orbFloat 10s ease-in-out infinite alternate;
  }
  .orb-crimson {
    top: -100px;
    left: 10%;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(227, 27, 27, 0.35) 0%, transparent 70%);
  }
  .orb-amber {
    top: 40px;
    right: 5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
    animation-delay: -3s;
  }
  .orb-navy {
    bottom: -150px;
    left: 40%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
    animation-delay: -6s;
  }

  @keyframes orbFloat {
    0% { transform: translateY(0) scale(1); }
    100% { transform: translateY(30px) scale(1.1); }
  }

  .hero-grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
    pointer-events: none;
    z-index: -1;
  }

  .hero-compact-header {
    max-width: 1200px;
    margin: 0 auto 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    position: relative;
    z-index: 2;
  }
  .hero-compact-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }
  .hero-compact-sub {
    color: #94A3B8;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .hero-compact-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hero-compact-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    text-decoration: none;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.35);
    transition: all 0.2s ease;
  }
  .hero-compact-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(227, 27, 27, 0.45);
  }
  .btn-arrow {
    transition: transform 0.2s ease;
  }
  .hero-compact-btn-primary:hover .btn-arrow {
    transform: translateX(3px);
  }
  .hero-compact-btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #FFFFFF;
    font-family: inherit;
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  }
  .hero-compact-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.35);
  }

  .hero-center-content {
    max-width: 900px;
    margin: 0 auto 28px;
    text-align: center;
    position: relative;
    z-index: 2;
  }
  .hero-trust-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    border-radius: 999px;
    padding: 6px 16px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  .hero-main-headline {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin-bottom: 14px;
  }
  .shimmering-gradient-text {
    background: linear-gradient(90deg, #FFFFFF 0%, #F59E0B 45%, #E31B1B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-main-sub {
    font-size: 0.95rem;
    color: #CBD5E1;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
    font-weight: 400;
  }

  /* ── 3. SEARCH CONSOLE (Matching Rentals/Property) ── */
  .search-console-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }
  .search-console-card {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    padding: 22px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8);
    color: var(--navy-ink);
  }
  .search-inputs-grid {
    display: grid;
    grid-template-columns: 2fr 1.3fr 1.3fr 1.5fr auto;
    gap: 10px;
    align-items: center;
  }
  @media (max-width: 1024px) {
    .search-inputs-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 640px) {
    .search-inputs-grid {
      grid-template-columns: 1fr;
    }
  }

  .search-segment {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 9px 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .search-segment:focus-within {
    border-color: var(--brand-red);
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.1);
    background: #FFFFFF;
  }
  .segment-label {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #64748B;
    text-transform: uppercase;
  }
  .segment-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  .segment-svg-icon {
    color: var(--brand-red);
    flex-shrink: 0;
  }
  .segment-text-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--navy-ink);
    width: 100%;
  }
  .segment-text-input::placeholder {
    color: #94A3B8;
    font-weight: 400;
  }
  .segment-text-display {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--navy-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .segment-clear-btn {
    border: none;
    background: #E2E8F0;
    color: #64748B;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Search Submit Button */
  .search-submit-segment {
    display: flex;
    align-items: center;
  }
  .hero-search-submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 54px;
    padding: 0 24px;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    border-radius: var(--radius-md);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.35);
    transition: all 0.2s ease;
    white-space: nowrap;
    width: 100%;
  }
  .hero-search-submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(227, 27, 27, 0.45);
  }

  /* Quick Category Chips Strip */
  .quick-category-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #F1F5F9;
    overflow-x: auto;
  }
  .quick-cat-label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex-shrink: 0;
  }
  .quick-cat-scroll {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .quick-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #475569;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .quick-chip:hover {
    border-color: var(--brand-red);
    color: var(--brand-red);
    transform: translateY(-1px);
  }
  .quick-chip.active {
    background: var(--brand-red);
    border-color: var(--brand-red);
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.25);
  }

  /* Popover Dropdowns */
  .dest-dropdown-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 320px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-md);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    z-index: 50;
    overflow: hidden;
  }
  .dest-dropdown-header {
    padding: 10px 14px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #64748B;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
  }
  .dest-dropdown-list {
    max-height: 260px;
    overflow-y: auto;
  }
  .dest-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    transition: background 0.15s;
  }
  .dest-dropdown-item:hover {
    background: var(--brand-red-light);
  }
  .dest-item-name {
    font-weight: 700;
    color: var(--navy-ink);
    font-size: 0.88rem;
  }
  .dest-item-county {
    font-size: 0.75rem;
    color: #64748B;
  }
  .dest-select-arrow {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--brand-red);
  }

  .guests-dropdown-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 290px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-md);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 50;
  }
  .guest-stepper-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #F1F5F9;
  }
  .stepper-title {
    font-weight: 700;
    font-size: 0.88rem;
    color: var(--navy-ink);
  }
  .stepper-sub {
    font-size: 0.72rem;
    color: #64748B;
  }
  .stepper-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .stepper-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid #CBD5E1;
    background: #FFFFFF;
    color: var(--navy-ink);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stepper-num {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--navy-ink);
    min-width: 16px;
    text-align: center;
  }
  .guests-done-btn {
    width: 100%;
    margin-top: 12px;
    background: var(--navy-ink);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 9px;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
  }

  /* ── 4. MAIN DISCOVERY WORKSPACE & TOOLBAR ── */
  .accommodation-main-canvas {
    max-width: 1200px;
    margin: 0 auto;
    padding: 36px 20px 60px;
  }

  /* Segmented Discovery Nav */
  .segmented-discovery-nav {
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .discovery-tabs-cluster {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 4px;
  }
  .discovery-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--radius-md);
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: var(--shadow-subtle);
    transition: all 0.2s ease;
  }
  .discovery-tab:hover {
    border-color: var(--brand-red);
    color: var(--brand-red);
  }
  .discovery-tab.active {
    background: var(--brand-red);
    border-color: var(--brand-red);
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.25);
  }
  .tab-icon {
    display: flex;
    align-items: center;
  }
  .tab-counter {
    background: rgba(0, 0, 0, 0.08);
    font-size: 0.72rem;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .discovery-tab.active .tab-counter {
    background: rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
  }

  /* Listings Toolbar */
  .listings-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E2E8F0;
  }
  .results-headline {
    font-size: 1.15rem;
    font-weight: 700;
    color: #475569;
  }
  .results-bold-num {
    font-family: 'Outfit', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--brand-red);
    margin-right: 6px;
  }
  .results-location-tag {
    font-size: 0.95rem;
    color: #0F172A;
    font-weight: 700;
    margin-left: 6px;
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .sort-box {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    padding: 7px 12px;
    border-radius: var(--radius-sm);
  }
  .sort-label {
    font-size: 0.78rem;
    color: #64748B;
    font-weight: 600;
  }
  .sort-select {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--navy-ink);
    cursor: pointer;
  }
  .toolbar-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-sm);
    color: #475569;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .toolbar-btn:hover, .toolbar-btn.active {
    background: var(--brand-red-light);
    border-color: var(--brand-red);
    color: var(--brand-red);
  }

  /* ── 5. PROPERTY CARDS GRID (Matching Rentals/Property) ── */
  .properties-modern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 26px;
  }
  @media (max-width: 640px) {
    .properties-modern-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  .property-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .property-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12);
    border-color: #CBD5E1;
  }

  .card-media-shell {
    position: relative;
    aspect-ratio: 16 / 10;
    background: #0B1320;
    overflow: hidden;
  }
  .card-main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  .property-card:hover .card-main-image {
    transform: scale(1.04);
  }

  .card-badges-overlay {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    z-index: 2;
  }
  .badge-category-tag {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    color: #FFFFFF;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    text-transform: capitalize;
  }
  .badge-verified-host {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #DCFCE7;
    color: #15803D;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    border: 1px solid #BBF7D0;
  }
  .badge-video-tour {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(15, 23, 42, 0.85);
    color: #38BDF8;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 3px 9px;
    border-radius: 6px;
  }

  .card-wishlist-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(8px);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748B;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
  }
  .card-wishlist-btn:hover {
    transform: scale(1.1);
    background: #FFFFFF;
  }
  .card-wishlist-btn.active {
    color: var(--brand-red);
    background: #FFFFFF;
  }

  .card-content-body {
    padding: 18px 20px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .card-location-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .card-location-text {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-property-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 10px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-amenities-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .card-amenity-chip {
    font-size: 0.72rem;
    font-weight: 700;
    color: #475569;
    background: #F1F5F9;
    padding: 3px 8px;
    border-radius: 6px;
  }
  .card-amenity-more {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94A3B8;
  }

  .card-body-divider {
    height: 1px;
    background: #F1F5F9;
    margin-bottom: 14px;
  }

  .card-bottom-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .card-price-amount {
    font-family: 'Outfit', sans-serif;
    font-size: 1.3rem;
    font-weight: 900;
    color: var(--navy-ink);
    line-height: 1.1;
  }
  .card-price-frequency {
    font-size: 0.75rem;
    color: #64748B;
    font-weight: 600;
    margin-top: 2px;
  }
  .card-rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
  }
  .star-gold { color: var(--gold); }
  .rating-num { font-weight: 800; color: var(--navy-ink); }
  .rating-count { color: #64748B; font-size: 0.75rem; }

  /* Dual Action CTAs */
  .card-actions-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    margin-top: auto;
  }
  .btn-card-details {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.25);
    transition: all 0.2s;
  }
  .btn-card-details:hover {
    box-shadow: 0 6px 16px rgba(227, 27, 27, 0.35);
    transform: translateY(-1px);
  }
  .btn-card-whatsapp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: #10B981;
    color: #FFFFFF;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-card-whatsapp:hover {
    background: #059669;
  }

  .btn-browse-all {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: var(--radius-md);
    background: #FFFFFF;
    color: var(--navy-ink);
    border: 1px solid #CBD5E1;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: var(--shadow-subtle);
    transition: all 0.2s;
  }
  .btn-browse-all:hover {
    border-color: var(--brand-red);
    color: var(--brand-red);
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
  .section-footer-cta {
    text-align: center;
    margin-top: 40px;
  }

  /* Empty state */
  .empty-results-box {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
  }
  .empty-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .empty-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .empty-desc {
    color: #64748B;
    max-width: 440px;
    margin: 0 auto 20px;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .empty-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .btn-primary-red {
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-weight: 800;
    cursor: pointer;
  }
  .btn-secondary-outline {
    background: #FFFFFF;
    border: 1.5px solid #CBD5E1;
    color: var(--navy-ink);
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-weight: 800;
    cursor: pointer;
  }

  /* ── 6. SPECIAL DEALS BANNER (Executive Dark) ── */
  .deals-banner-section {
    max-width: 1200px;
    margin: 0 auto 60px;
    padding: 0 20px;
  }
  .deals-banner-card {
    position: relative;
    background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
    color: #FFFFFF;
    border-radius: var(--radius-xl);
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 36px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow-elevated);
  }
  @media (max-width: 900px) {
    .deals-banner-card { flex-direction: column; padding: 28px 20px; }
  }
  .deals-content-left {
    flex: 1;
    z-index: 2;
  }
  .deal-badge-pill {
    display: inline-block;
    background: rgba(227, 27, 27, 0.2);
    border: 1px solid rgba(227, 27, 27, 0.4);
    color: #FCA5A5;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 14px;
  }
  .deal-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.4rem, 2.8vw, 2.2rem);
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  .deal-desc {
    font-size: 0.92rem;
    color: #CBD5E1;
    line-height: 1.6;
    margin-bottom: 22px;
    max-width: 580px;
  }
  .deal-actions-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-claim-deal {
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    padding: 12px 24px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.35);
    transition: all 0.2s;
  }
  .btn-claim-deal:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(227, 27, 27, 0.5);
  }
  .deal-guarantees {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94A3B8;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .deals-preview-right {
    z-index: 2;
    width: 320px;
    max-width: 100%;
  }
  .deal-mini-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  }
  .deal-icon-square {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(227, 27, 27, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .deal-pill-tag {
    font-size: 0.72rem;
    background: #FEE2E2;
    color: var(--brand-red);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 800;
  }

  /* ── 7. BUDGET PLANNER SECTION ── */
  .planner-section {
    padding: 40px 20px 60px;
    background: var(--canvas-light);
  }
  .planner-inner-shell {
    max-width: 1000px;
    margin: 0 auto;
  }
  .planner-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .section-eyebrow {
    display: inline-block;
    background: var(--brand-red-light);
    color: var(--brand-red);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 8px;
  }
  .section-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .section-subtitle {
    font-size: 0.95rem;
    color: #64748B;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .planner-card {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    border: 1px solid #E2E8F0;
    padding: 30px;
    box-shadow: var(--shadow-subtle);
  }
  .planner-controls-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
  @media (max-width: 900px) {
    .planner-controls-grid { grid-template-columns: 1fr; }
  }
  .planner-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .planner-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #334155;
  }
  .planner-val-badge {
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--brand-red);
    background: var(--brand-red-light);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .planner-select {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid #CBD5E1;
    background: #FFFFFF;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--navy-ink);
    outline: none;
  }
  .planner-slider {
    accent-color: var(--brand-red);
    cursor: pointer;
    margin-top: 10px;
  }
  .planner-styles-cluster {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .planner-style-btn {
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #475569;
    font-family: inherit;
    font-size: 0.82rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }
  .planner-style-btn.active {
    background: var(--brand-red-light);
    border-color: var(--brand-red);
    color: var(--brand-red);
  }

  .planner-result-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
    background: #F8FAFC;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
  }
  @media (max-width: 640px) {
    .planner-result-banner { flex-direction: column; align-items: flex-start; }
  }
  .planner-total-amount {
    font-family: 'Outfit', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--brand-red);
    line-height: 1.1;
  }
  .planner-find-btn {
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    padding: 12px 24px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.25);
    transition: all 0.2s;
    white-space: nowrap;
  }
  .planner-find-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(227, 27, 27, 0.35);
  }

  /* ── 8. HOW IT WORKS ── */
  .how-it-works-section {
    padding: 60px 20px;
    background: #FFFFFF;
    border-top: 1px solid #E2E8F0;
  }
  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .how-tab-toggle {
    display: inline-flex;
    background: #F1F5F9;
    border-radius: 999px;
    padding: 4px;
    margin-top: 16px;
  }
  .how-toggle-btn {
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: 999px;
    cursor: pointer;
    color: #64748B;
    transition: all 0.2s;
  }
  .how-toggle-btn.active {
    background: #FFFFFF;
    color: var(--navy-ink);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  .how-steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 20px;
  }
  @media (max-width: 800px) {
    .how-steps-grid { grid-template-columns: 1fr; }
  }
  .how-step-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-lg);
    padding: 28px 24px;
  }
  .step-num-pill {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 4px 10px rgba(227, 27, 27, 0.25);
  }
  .step-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .step-card-desc {
    font-size: 0.88rem;
    color: #64748B;
    line-height: 1.6;
  }

  /* ── 9. WHY CHOOSE US ── */
  .why-choose-section {
    padding: 60px 20px;
    background: var(--canvas-light);
  }
  .why-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 800px) {
    .why-cards-grid { grid-template-columns: 1fr; }
  }
  .why-feature-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
    padding: 30px;
    box-shadow: var(--shadow-subtle);
  }
  .why-icon-bubble {
    width: 50px;
    height: 50px;
    border-radius: var(--radius-md);
    background: var(--brand-red-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
  }
  .why-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .why-desc {
    font-size: 0.88rem;
    color: #64748B;
    line-height: 1.65;
  }

  /* ── 10. HOST PACKAGES ── */
  .packages-section {
    padding: 60px 20px;
    background: #FFFFFF;
    border-top: 1px solid #E2E8F0;
  }
  .packages-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 900px) {
    .packages-cards-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
  }
  .pricing-card {
    position: relative;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-xl);
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    transition: all 0.25s;
  }
  .pricing-card.popular-highlight {
    background: #FFFFFF;
    border: 2px solid var(--brand-red);
    box-shadow: 0 15px 35px rgba(227, 27, 27, 0.12);
    transform: translateY(-4px);
  }
  .popular-ribbon {
    position: absolute;
    top: -12px;
    right: 20px;
    background: var(--brand-red);
    color: #FFFFFF;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .pricing-pkg-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .pricing-pkg-price {
    font-family: 'Outfit', sans-serif;
    font-size: 1.9rem;
    font-weight: 900;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .pricing-pkg-dur {
    font-size: 0.85rem;
    color: #64748B;
    font-weight: 500;
  }
  .pricing-pkg-desc {
    font-size: 0.85rem;
    color: #64748B;
    margin-bottom: 20px;
  }
  .pricing-features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 0.85rem;
    color: #334155;
    flex: 1;
  }
  .pricing-action-btn {
    width: 100%;
    padding: 12px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 800;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .btn-red-popular {
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.3);
  }
  .btn-dark-standard {
    background: #0F172A;
    color: #FFFFFF;
  }

  /* ── 11. TESTIMONIALS & FAQ ── */
  .testimonials-section {
    padding: 60px 20px;
    background: var(--canvas-light);
  }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 800px) {
    .testimonials-grid { grid-template-columns: 1fr; }
  }
  .testimonial-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
    padding: 26px;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-subtle);
  }
  .testimonial-text {
    font-size: 0.92rem;
    color: #334155;
    line-height: 1.65;
    font-style: italic;
    margin-bottom: 14px;
    flex: 1;
  }
  .testimonial-stay-badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--brand-red);
    background: var(--brand-red-light);
    padding: 3px 8px;
    border-radius: 4px;
    align-self: flex-start;
    margin-bottom: 14px;
  }
  .testimonial-author-row {
    display: flex;
    align-items: center;
    gap: 12px;
    border-top: 1px solid #F1F5F9;
    padding-top: 14px;
  }
  .testimonial-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* FAQ Accordion */
  .faq-section {
    padding: 60px 20px 80px;
    background: #FFFFFF;
    border-top: 1px solid #E2E8F0;
  }
  .faq-accordion-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .faq-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all 0.2s;
  }
  .faq-card.open {
    border-color: var(--brand-red);
    background: #FFFFFF;
  }
  .faq-question-btn {
    width: 100%;
    background: transparent;
    border: none;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
  }
  .faq-question-text {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--navy-ink);
  }
  .faq-card.open .faq-question-text {
    color: var(--brand-red);
  }
  .faq-chevron {
    color: #64748B;
    font-size: 0.8rem;
    transition: transform 0.2s;
  }
  .faq-chevron.rotate {
    transform: rotate(180deg);
    color: var(--brand-red);
  }
  .faq-answer-pane {
    padding: 0 20px 18px;
    border-top: 1px solid #F1F5F9;
  }
  .faq-answer-text {
    font-size: 0.88rem;
    color: #475569;
    line-height: 1.65;
  }

  /* ── 12. BOTTOM CTA SECTION (Midnight Atmosphere) ── */
  .bottom-cta-section {
    position: relative;
    background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
    color: #FFFFFF;
    padding: 80px 20px;
    text-align: center;
    overflow: hidden;
    isolation: isolate;
  }
  .bottom-cta-content {
    max-width: 760px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }
  .bottom-cta-headline {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .bottom-cta-sub {
    font-size: 1rem;
    color: #CBD5E1;
    line-height: 1.65;
    margin-bottom: 32px;
  }
  .bottom-cta-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .btn-cta-crimson {
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 800;
    padding: 14px 28px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.4);
    transition: all 0.2s;
  }
  .btn-cta-crimson:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(227, 27, 27, 0.55);
  }
  .btn-cta-glass {
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 800;
    padding: 14px 28px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
  }
  .btn-cta-glass:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  /* ── 13. FOOTER (Executive Dark) ── */
  .accommodation-footer {
    background: var(--bg-dark);
    color: #94A3B8;
    padding: 60px 20px 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 50px;
    margin-bottom: 40px;
  }
  @media (max-width: 900px) {
    .footer-inner { grid-template-columns: 1fr; gap: 30px; }
  }
  .footer-brand-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .footer-desc {
    font-size: 0.85rem;
    line-height: 1.65;
    color: #94A3B8;
  }
  .footer-links-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  @media (max-width: 600px) {
    .footer-links-grid { grid-template-columns: 1fr; gap: 20px; }
  }
  .footer-col-title {
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }
  .footer-links-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .footer-links-list button {
    background: transparent;
    border: none;
    color: #94A3B8;
    font-family: inherit;
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .footer-links-list button:hover {
    color: #FFFFFF;
  }
  .footer-bottom-bar {
    max-width: 1200px;
    margin: 0 auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
    color: #64748B;
  }

  /* ── 14. FLOATING WHATSAPP & SCROLL TOP ── */
  .wa-floating-concierge {
    position: fixed;
    right: 20px;
    bottom: 24px;
    background: #25D366;
    color: #FFFFFF;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.45);
    z-index: 400;
    text-decoration: none;
    transition: all 0.25s ease;
    animation: waPulse 2.4s infinite;
  }
  .wa-floating-concierge:hover {
    transform: scale(1.08);
  }
  .wa-tooltip-label {
    position: absolute;
    right: 68px;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 0.75rem;
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

  .scroll-to-top-button {
    position: fixed;
    right: 26px;
    bottom: 92px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #0F172A;
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 400;
    opacity: 0;
    transform: translateY(14px);
    pointer-events: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
  .scroll-to-top-button.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .scroll-to-top-button:hover {
    background: var(--brand-red);
  }

  /* Wishlist Drawer */
  .wishlist-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
  }
  .wishlist-drawer-content {
    background: #FFFFFF;
    width: 100%;
    max-width: 400px;
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
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .drawer-close-btn {
    background: #F1F5F9;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #64748B;
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
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 10px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .wishlist-item-row:hover {
    background: #F1F5F9;
  }
  .wishlist-item-thumbnail {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
  }
  .wishlist-remove-btn {
    background: transparent;
    border: none;
    color: #94A3B8;
    font-size: 0.9rem;
    padding: 6px;
    cursor: pointer;
  }
  .wishlist-remove-btn:hover {
    color: var(--brand-red);
  }
  .wishlist-drawer-footer {
    padding: 18px 20px;
    border-top: 1px solid #E2E8F0;
  }
  .drawer-browse-all-btn {
    width: 100%;
    background: linear-gradient(135deg, #E31B1B 0%, #C41414 100%);
    color: #FFFFFF;
    border: none;
    border-radius: var(--radius-sm);
    padding: 12px;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.25);
  }

  /* Toast notification */
  .toast-notification {
    position: fixed;
    top: 75px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--navy-ink);
    color: #FFFFFF;
    padding: 10px 22px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    z-index: 9999;
    animation: toastPop 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  @keyframes toastPop {
    from { opacity: 0; transform: translate(-50%, -10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  /* Reveal Animations */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.in {
    opacity: 1;
    transform: translateY(0);
  }

  /* Responsive Rules */
  @media (max-width: 900px) {
    .desktop-nav-links { display: none; }
    .mobile-toggle-btn { display: inline-flex; }
    .sign-in-btn { display: none; }
    .list-property-btn { display: none; }
    .mobile-header-auth-btn { display: inline-flex; }
    .dest-dropdown-popover { width: 100%; }
    .guests-dropdown-popover { width: 100%; right: auto; left: 0; }
  }

  @media (max-width: 480px) {
    .hero-compact-header { flex-direction: column; align-items: flex-start; }
    .hero-compact-actions { width: 100%; }
    .hero-compact-btn-primary, .hero-compact-btn-secondary { width: 100%; justify-content: center; }
  }
`;