import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import QuickSalePostModal from "../components/QuickSalePostModal";
import { optimizeImage, imageSrcSet, IMG_WIDTH } from "../utils/imageUrl";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

const CATEGORIES = [
  { name: "Furniture", icon: "🪑" },
  { name: "Electronics", icon: "💻" },
  { name: "Appliances", icon: "🔌" },
  { name: "Tools", icon: "🔧" },
  { name: "Clothing", icon: "👕" },
  { name: "Books", icon: "📚" },
  { name: "Sports & Outdoors", icon: "⚽" },
  { name: "Home & Garden", icon: "🪴" },
  { name: "Beauty & Personal Care", icon: "✨" },
  { name: "Toys & Games", icon: "🎮" },
  { name: "Construction Materials", icon: "🏗️" },
  { name: "Vehicles & Parts", icon: "🚗" },
  { name: "Other", icon: "📦" },
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "For Parts"];

// ── Professional SVG Icons ──
const IconCamera = ({ size = 13, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconMapPin = ({ size = 13, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconShieldCheck = ({ size = 13, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconWhatsApp = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} style={{ flexShrink: 0 }}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
  </svg>
);

const IconPhone = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconShare = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconSparkles = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z" />
  </svg>
);

const IconTag = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Multi-Image Card Media Component (Just as Listings.jsx) ──
function QuickSaleCardMedia({ item, isFavorite, onToggleFavorite }) {
  const rawImages = Array.isArray(item.images)
    ? item.images
    : item.images
    ? [item.images]
    : item.imageUrl
    ? [item.imageUrl]
    : [];

  const images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url || img?.secure_url : img))
    .filter(Boolean);

  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-cycle through images automatically showing the next picture every 3.2s
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    setActiveIdx(idx);
  };

  const isLowStock = item.quantity && Number(item.quantity) <= 2;
  const isAvailable = item.quantity === undefined || Number(item.quantity) > 0;
  const isNewItem = item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 172800000;

  return (
    <div className="card-media-box">
      {images.length > 0 ? (
        <div className="card-carousel-track">
          {images.map((imgUrl, idx) => {
            // Mount only the visible slide plus the next one in the queue —
            // rendering every slide downloaded the whole gallery per card.
            const isQueued = idx === (activeIdx + 1) % images.length;
            if (idx !== activeIdx && !isQueued) return null;
            return (
              <img
                key={idx}
                src={optimizeImage(imgUrl, IMG_WIDTH.card)}
                srcSet={imageSrcSet(imgUrl)}
                sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 360px"
                alt={`${item.title} - photo ${idx + 1}`}
                className={`card-carousel-slide ${idx === activeIdx ? "active" : ""}`}
                loading={activeIdx === 0 && idx === 0 ? "eager" : "lazy"}
                decoding="async"
                width="480"
                height="360"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="card-no-photo">
          <IconCamera size={26} />
          <span>No Photos Uploaded</span>
        </div>
      )}

      {/* Prev / Next Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="card-carousel-arrow card-carousel-prev"
            onClick={handlePrev}
            aria-label="Previous photo"
            title="Previous photo"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="card-carousel-arrow card-carousel-next"
            onClick={handleNext}
            aria-label="Next photo"
            title="Next photo"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Progress Indicator Dots */}
      {images.length > 1 && (
        <div className="card-carousel-dots">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`card-carousel-dot ${idx === activeIdx ? "active" : ""}`}
              onClick={(e) => handleDotClick(e, idx)}
              aria-label={`Show photo ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient shadow overlay */}
      <div className="card-img-gradient-overlay" />

      {/* Availability / Stock Badge */}
      <div
        className={`card-avail-badge ${
          isAvailable ? (isLowStock ? "avail-amber" : "avail-green") : "avail-red"
        }`}
      >
        <span className="live-dot" />
        <span>
          {!isAvailable ? "Sold Out" : isLowStock ? `Only ${item.quantity} Left` : "Available"}
        </span>
      </div>

      {/* Condition / Category Badge */}
      <div className="card-type-badge">
        {item.condition || item.category || "Item"}
      </div>

      {/* Photo Count & Live Index Tag */}
      {images.length > 1 && (
        <div className="card-photo-count">
          <IconCamera size={11} />
          <span>{activeIdx + 1} / {images.length}</span>
        </div>
      )}

      {/* New Item Badge */}
      {isNewItem && (
        <div className="card-new-tag">
          <span>⚡ New</span>
        </div>
      )}

      {/* Wishlist Favorite Heart Button */}
      <button
        type="button"
        className={`card-fav-btn ${isFavorite ? "is-favorite" : ""}`}
        onClick={(e) => onToggleFavorite(e, item._id)}
        aria-label={isFavorite ? "Remove from saved items" : "Save item to favorites"}
        title={isFavorite ? "Saved in favorites" : "Save to favorites"}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill={isFavorite ? "#E31B1B" : "none"} stroke={isFavorite ? "#E31B1B" : "#1e293b"} strokeWidth="2.2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}

export default function QuickSales() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user } = useContext(AuthContext);

  // Check for seller authentication
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const sellerToken = localStorage.getItem("sellerToken");
    setIsSeller(!!sellerToken);
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "post" || searchParams.get("post") === "true") {
      setIsPostModalOpen(true);
    }
  }, [searchParams]);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("fav_quicksales");
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedId, setCopiedId] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    county: searchParams.get("county") || "",
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem("fav_quicksales", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    setSearchParams(params, { replace: true });
    fetchItems();
  }, [filters]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  // Handle material query parameter to select and highlight specific material
  useEffect(() => {
    const materialId = searchParams.get("material");
    if (materialId && items.length > 0) {
      const item = items.find((i) => i._id === materialId);
      if (item) {
        setSelected(item);
        setCurrentImage(0);
        setTimeout(() => {
          const materialCard = document.querySelector(`[data-material-id="${materialId}"]`);
          if (materialCard) {
            materialCard.scrollIntoView({ behavior: "smooth", block: "center" });
            materialCard.style.boxShadow = "0 0 25px rgba(227, 27, 27, 0.45)";
            materialCard.style.borderColor = "#E31B1B";
            materialCard.style.transform = "scale(1.02)";
            setTimeout(() => {
              materialCard.style.boxShadow = "";
              materialCard.style.borderColor = "";
              materialCard.style.transform = "";
            }, 2500);
          }
        }, 150);
      }
    }
  }, [searchParams, items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.condition) query.append("condition", filters.condition);
      if (filters.minPrice) query.append("minPrice", filters.minPrice);
      if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
      if (filters.county) query.append("county", filters.county);
      query.append("_cb", Date.now());

      const res = await fetch(`${API_BASE}/materials?${query}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const approvedItems = data.filter((item) => item.status === "active");
        setItems(approvedItems);
      } else {
        setItems([]);
      }
      setError("");
    } catch (err) {
      setError("Failed to load QuickSales items. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      county: "",
    });
  };

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((favId) => favId !== id) : [...prev, id];
      showToast(exists ? "Removed from Saved Items" : "Saved to Favorites ❤️");
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleShareListing = (e, item) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(item.title)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(item._id);
      showToast("Listing link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSell = () => setIsPostModalOpen(true);

  const handleItemCreated = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
    showToast("🎉 Your item is now LIVE on QuickSales!");
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.toString().replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    if (cleaned.startsWith("254")) return cleaned;
    return "254" + cleaned;
  };

  const handleWhatsApp = (item) => {
    const phone = formatPhone(item.sellerPhone);
    const msg = `Hi ${item.sellerName || "Seller"}, I'm interested in your listing "${item.title}" on Axxspace for KES ${Number(item.price || 0).toLocaleString()}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = (item) => {
    if (item.sellerPhone) {
      window.open(`tel:${item.sellerPhone}`, "_blank");
    }
  };

  const openModal = (item) => {
    setSelected(item);
    setCurrentImage(0);
  };

  const closeModal = () => {
    setSelected(null);
    setCurrentImage(0);
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== "");

  // Client side sorting
  const sortedItems = useMemo(() => {
    const list = [...items];
    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "stock") {
      list.sort((a, b) => Number(b.quantity || 1) - Number(a.quantity || 1));
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [items, sortBy]);

  return (
    <div className="ax-quicksales-root">
      <style>{css}</style>

      {/* ── 1. HERO ATMOSPHERE (Matching Listings.jsx) ── */}
      <section className="quicksales-hero">
        <div className="ambient-orb orb-crimson" />
        <div className="ambient-orb orb-amber" />
        <div className="ambient-orb orb-navy" />
        <div className="hero-grid-pattern" />

        <div className="hero-inner-container">
          {/* Top Pill & Badges */}
          <div className="hero-top-row">
            <span className="hero-live-pill">
              <span className="pulse-dot" />
              <span>Axxspace QuickSales Marketplace</span>
            </span>

            <div className="hero-header-actions">
              {(token || isSeller) && (
                <button
                  type="button"
                  className="hero-action-btn hero-dash-btn"
                  onClick={() => navigate("/quicksales-dashboard")}
                >
                  <IconSparkles size={14} />
                  <span>My Listings</span>
                </button>
              )}
              <button
                type="button"
                className="hero-action-btn hero-sell-btn"
                onClick={handleSell}
              >
                <IconTag size={14} />
                <span>+ Sell Your Item Free</span>
              </button>
            </div>
          </div>

          <h1 className="hero-headline">
            Verified Liquidation & Second-Hand Deals in <span className="headline-highlight">Kenya</span>
          </h1>
          <p className="hero-subtext">
            Browse furniture, electronics, construction equipment, power tools, and household essentials directly from trusted local sellers across all 47 counties.
          </p>

          {/* Trust Guarantees */}
          <div className="hero-trust-bar">
            <span className="trust-item">
              <IconShieldCheck size={14} /> Verified Listings
            </span>
            <span className="trust-item">
              <IconWhatsApp size={14} /> Direct WhatsApp Chat
            </span>
            <span className="trust-item">
              <IconMapPin size={14} /> 47 Kenyan Counties
            </span>
            <span className="trust-item">
              <IconSparkles size={14} /> Zero Buyer Fees
            </span>
          </div>

          {/* ── 2. SEARCH & FILTER COMMAND CENTER ── */}
          <div className="hero-search-card">
            <div className="search-inputs-grid">
              {/* Search Bar Input */}
              <div className="search-field search-main-field">
                <span className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search furniture, iPhone, drill, cement, sofa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-text-input"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="clear-input-btn"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* County Dropdown */}
              <div className="search-field search-select-field">
                <span className="field-icon">
                  <IconMapPin size={15} />
                </span>
                <select
                  name="county"
                  value={filters.county}
                  onChange={handleFilterChange}
                  className="search-select-input"
                >
                  <option value="">All Counties</option>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="search-field search-select-field">
                <span className="field-icon">
                  <IconTag size={15} />
                </span>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="search-select-input"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Dropdown */}
              <div className="search-field search-select-field">
                <span className="field-icon">
                  <IconShieldCheck size={15} />
                </span>
                <select
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="search-select-input"
                >
                  <option value="">All Conditions</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Price Range inputs */}
              <div className="search-field search-price-field">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min KES"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="search-price-input"
                />
                <span className="price-divider">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max KES"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="search-price-input"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="hero-reset-btn"
                  title="Clear all filters"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Quick Category Chips Strip */}
            <div className="hero-categories-strip">
              <span className="cat-strip-label">Categories:</span>
              <div className="cat-strip-scroll">
                <button
                  type="button"
                  className={`quick-category-chip ${filters.category === "" ? "active" : ""}`}
                  onClick={() => setFilters((p) => ({ ...p, category: "" }))}
                >
                  ✨ All Items
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    className={`quick-category-chip ${filters.category === cat.name ? "active" : ""}`}
                    onClick={() => setFilters((p) => ({ ...p, category: cat.name }))}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT BODY ── */}
      <main className="quicksales-main-canvas">
        {error && <div className="error-alert-banner">{error}</div>}

        {/* Results Toolbar */}
        <div className="quicksales-toolbar">
          <div className="toolbar-left">
            <h2 className="results-headline">
              Available Deals: <span className="results-bold-num">{sortedItems.length}</span>
              {filters.county && <span className="results-filter-badge">in {filters.county}</span>}
              {filters.category && <span className="results-filter-badge">{filters.category}</span>}
            </h2>
          </div>

          <div className="toolbar-right">
            <div className="sort-box">
              <span className="sort-label">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock">Stock Available</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="toolbar-clear-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="quicksales-loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Loading verified QuickSales items...</p>
          </div>
        ) : sortedItems.length === 0 ? (
          /* Empty State */
          <div className="quicksales-empty-state">
            <div className="empty-icon-box">
              <IconTag size={38} />
            </div>
            <h3 className="empty-title">No listings match your criteria</h3>
            <p className="empty-subtitle">
              We couldn't find items matching your search or filters. Try clearing specific filters or search keywords.
            </p>
            <div className="empty-actions">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="empty-btn empty-btn-secondary"
                >
                  Clear All Filters
                </button>
              )}
              <button
                type="button"
                onClick={handleSell}
                className="empty-btn empty-btn-primary"
              >
                Sell Your Item Free
              </button>
            </div>
          </div>
        ) : (
          /* ── 4. MODERN QUICKSALE CARDS GRID (Just as Listings.jsx) ── */
          <div className="quicksales-cards-grid">
            {sortedItems.map((item) => {
              const isFav = favorites.includes(item._id);

              return (
                <div
                  key={item._id}
                  data-material-id={item._id}
                  className="quicksale-card"
                  onClick={() => openModal(item)}
                >
                  {/* Media Carousel Box */}
                  <QuickSaleCardMedia
                    item={item}
                    isFavorite={isFav}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {/* Card Content Box */}
                  <div className="card-content-box">
                    {/* Location Row */}
                    <div className="card-location-row">
                      <IconMapPin size={13} className="location-pin-icon" />
                      <span className="location-text">
                        {item.location ? `${item.location}, ` : ""}{item.county || "Kenya"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="card-item-title" title={item.title}>
                      {item.title}
                    </h3>

                    {/* Price & Deal Row */}
                    <div className="card-price-row">
                      <div className="price-tag-wrap">
                        <span className="price-currency">KES</span>
                        <span className="price-amount">
                          {Number(item.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="card-deal-pill">✓ Verified Deal</span>
                    </div>

                    {/* Specification Badges Grid */}
                    <div className="card-specs-grid">
                      <div className="spec-chip">
                        <span className="spec-label">Category</span>
                        <span className="spec-val">{item.category || "General"}</span>
                      </div>
                      <div className="spec-chip">
                        <span className="spec-label">Condition</span>
                        <span className="spec-val">{item.condition || "Good"}</span>
                      </div>
                      <div className="spec-chip">
                        <span className="spec-label">Available</span>
                        <span className="spec-val">{item.quantity || 1} units</span>
                      </div>
                    </div>

                    {/* Seller Bar */}
                    {item.sellerName && (
                      <div className="card-seller-bar">
                        <div className="seller-avatar">
                          {item.sellerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="seller-meta">
                          <span className="seller-name">{item.sellerName}</span>
                          <span className="seller-verified-tag">
                            <IconShieldCheck size={11} /> Verified Seller
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="card-actions-row">
                      <button
                        type="button"
                        className="card-action-btn card-whatsapp-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(item);
                        }}
                        title="Chat with seller on WhatsApp"
                      >
                        <IconWhatsApp size={15} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        className="card-action-btn card-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(item);
                        }}
                        title="View detailed photos & description"
                      >
                        <span>View Details</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── 5. PROFESSIONAL DETAILS MODAL ── */}
      {selected && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Gallery Section */}
            <div className="modal-gallery-pane">
              {selected.images?.length > 0 ? (
                <>
                  <div className="modal-main-img-box">
                    <img
                      src={optimizeImage(
                        typeof selected.images[currentImage] === "object"
                          ? selected.images[currentImage]?.imageUrl || selected.images[currentImage]?.url
                          : selected.images[currentImage],
                        IMG_WIDTH.panel
                      )}
                      alt={selected.title}
                      className="modal-main-img"
                      decoding="async"
                    />

                    {selected.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="modal-nav-arrow modal-nav-prev"
                          onClick={() =>
                            setCurrentImage(
                              (p) => (p - 1 + selected.images.length) % selected.images.length
                            )
                          }
                          aria-label="Previous image"
                        >
                          ❮
                        </button>
                        <button
                          type="button"
                          className="modal-nav-arrow modal-nav-next"
                          onClick={() =>
                            setCurrentImage((p) => (p + 1) % selected.images.length)
                          }
                          aria-label="Next image"
                        >
                          ❯
                        </button>
                        <div className="modal-photo-indicator">
                          <IconCamera size={12} />
                          <span>{currentImage + 1} / {selected.images.length}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails Row */}
                  {selected.images.length > 1 && (
                    <div className="modal-thumb-row">
                      {selected.images.map((img, idx) => {
                        const src = typeof img === "object" ? img?.imageUrl || img?.url : img;
                        return (
                          <img
                            key={idx}
                            src={optimizeImage(src, IMG_WIDTH.thumb)}
                            alt="thumbnail"
                            className={`modal-thumb ${idx === currentImage ? "active" : ""}`}
                            onClick={() => setCurrentImage(idx)}
                            decoding="async"
                            width="160"
                            height="110"
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="modal-no-img">
                  <IconCamera size={36} />
                  <span>No photos available for this listing</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="modal-details-pane">
              <div className="modal-header-meta">
                <span className="modal-verified-pill">
                  <IconShieldCheck size={13} /> Verified Listing
                </span>
                <button
                  type="button"
                  className="modal-share-btn"
                  onClick={(e) => handleShareListing(e, selected)}
                >
                  <IconShare size={14} />
                  <span>{copiedId === selected._id ? "Copied!" : "Share Link"}</span>
                </button>
              </div>

              <h2 className="modal-item-title">{selected.title}</h2>

              <p className="modal-location-text">
                <IconMapPin size={14} className="location-pin-icon" />
                <span>{selected.location}, {selected.county}</span>
              </p>

              {/* Price Banner */}
              <div className="modal-price-banner">
                <div>
                  <span className="modal-price-label">Asking Price</span>
                  <div className="modal-price-val">
                    KES {Number(selected.price || 0).toLocaleString()}
                  </div>
                </div>
                <div className="modal-stock-col">
                  <span className="modal-price-label">Available Units</span>
                  <div className="modal-stock-val">
                    {selected.quantity || 1}
                  </div>
                </div>
              </div>

              {/* Specification Pills */}
              <div className="modal-tags-row">
                <span className="modal-tag-pill">
                  🏷️ {selected.category || "Item"}
                </span>
                {selected.condition && (
                  <span className="modal-tag-pill tag-blue">
                    ✨ {selected.condition}
                  </span>
                )}
                {selected.quantity <= 2 && (
                  <span className="modal-tag-pill tag-red">
                    ⚡ Limited Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="modal-desc-box">
                <h4 className="modal-desc-heading">About This Item</h4>
                <p className="modal-desc-text">
                  {selected.description || "No additional description provided by the seller."}
                </p>
              </div>

              {/* Seller Information */}
              <div className="modal-seller-card">
                <div className="modal-seller-header">
                  <div className="seller-avatar large">
                    {(selected.sellerName || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="modal-seller-name">{selected.sellerName || "Verified Seller"}</h4>
                    <p className="modal-seller-sub">
                      Based in {selected.location}, {selected.county}
                    </p>
                  </div>
                </div>

                <div className="modal-contact-grid">
                  <button
                    type="button"
                    className="modal-contact-btn btn-whatsapp"
                    onClick={() => handleWhatsApp(selected)}
                  >
                    <IconWhatsApp size={16} />
                    <span>Chat on WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className="modal-contact-btn btn-call"
                    onClick={() => handleCall(selected)}
                  >
                    <IconPhone size={15} />
                    <span>Call Seller</span>
                  </button>
                </div>
              </div>

              <div className="modal-safety-note">
                <IconShieldCheck size={14} />
                <span>
                  Safety First: Always inspect the item in person and test functionality before making payment. Meet in open, public places.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Post Item Modal for All Users */}
      <QuickSalePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onItemCreated={handleItemCreated}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="ax-toast-bubble">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// ── Ultra-Professional Styles (Aligning with Listings.jsx) ──
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .ax-quicksales-root {
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
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-subtle: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
    --shadow-elevated: 0 20px 40px -15px rgba(15, 23, 42, 0.12);

    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    color: var(--navy-ink);
    background-color: var(--canvas-light);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .ax-quicksales-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── 1. HERO ATMOSPHERE ── */
  .quicksales-hero {
    position: relative;
    background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
    color: #FFFFFF;
    padding: 30px 20px 46px;
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
    100% { transform: translateY(28px) scale(1.08); }
  }

  .hero-grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 38px 38px;
    mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
    pointer-events: none;
    z-index: -1;
  }

  .hero-inner-container {
    max-width: 1240px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .hero-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 16px;
  }

  .hero-live-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--brand-red);
    box-shadow: 0 0 10px var(--brand-red);
    animation: livePulse 1.8s infinite;
  }

  @keyframes livePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }

  .hero-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hero-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    border: none;
    outline: none;
  }

  .hero-dash-btn {
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #FDE68A;
  }
  .hero-dash-btn:hover {
    background: rgba(245, 158, 11, 0.35);
    transform: translateY(-2px);
  }

  .hero-sell-btn {
    background: var(--brand-red);
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.35);
  }
  .hero-sell-btn:hover {
    background: var(--brand-red-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(227, 27, 27, 0.45);
  }

  .hero-headline {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.7rem);
    font-weight: 800;
    line-height: 1.18;
    margin-bottom: 10px;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }

  .headline-highlight {
    background: linear-gradient(135deg, #FF6B6B 0%, #E31B1B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtext {
    font-size: clamp(0.9rem, 2vw, 1.05rem);
    color: #CBD5E1;
    max-width: 780px;
    line-height: 1.55;
    margin-bottom: 18px;
  }

  .hero-trust-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }

  .trust-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #94A3B8;
    font-weight: 600;
  }

  /* ── 2. SEARCH & FILTER CARD ── */
  .hero-search-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--navy-ink);
  }

  .search-inputs-grid {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-field {
    display: flex;
    align-items: center;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-sm);
    padding: 0 12px;
    height: 44px;
    transition: all 0.2s ease;
  }
  .search-field:focus-within {
    border-color: var(--brand-red);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.1);
  }

  .search-main-field {
    flex: 2;
    min-width: 240px;
  }

  .search-select-field {
    flex: 1;
    min-width: 140px;
  }

  .search-price-field {
    flex: 1.2;
    min-width: 180px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .field-icon {
    color: #94A3B8;
    margin-right: 8px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .search-text-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.88rem;
    color: var(--navy-ink);
    width: 100%;
    font-weight: 500;
  }

  .search-select-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.85rem;
    color: var(--navy-ink);
    width: 100%;
    cursor: pointer;
    font-weight: 600;
  }

  .search-price-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.82rem;
    color: var(--navy-ink);
    width: 100%;
    font-weight: 600;
  }

  .price-divider {
    color: #94A3B8;
    font-weight: 700;
  }

  .clear-input-btn {
    border: none;
    background: transparent;
    color: #94A3B8;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 4px;
  }
  .clear-input-btn:hover {
    color: var(--brand-red);
  }

  .hero-reset-btn {
    height: 44px;
    padding: 0 16px;
    border-radius: var(--radius-sm);
    background: var(--brand-red-light);
    border: 1px solid rgba(227, 27, 27, 0.25);
    color: var(--brand-red);
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .hero-reset-btn:hover {
    background: var(--brand-red);
    color: #FFFFFF;
  }

  /* Category Strip */
  .hero-categories-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #F1F5F9;
    overflow-x: auto;
  }

  .cat-strip-label {
    font-size: 0.76rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex-shrink: 0;
  }

  .cat-strip-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .cat-strip-scroll::-webkit-scrollbar {
    display: none;
  }

  .quick-category-chip {
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
  .quick-category-chip:hover {
    border-color: var(--brand-red);
    color: var(--brand-red);
    transform: translateY(-1px);
  }
  .quick-category-chip.active {
    background: var(--brand-red);
    border-color: var(--brand-red);
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.25);
  }

  /* ── 3. MAIN CONTENT BODY ── */
  .quicksales-main-canvas {
    max-width: 1240px;
    margin: 0 auto;
    padding: 32px 20px 80px;
  }

  .error-alert-banner {
    background: #FEE2E2;
    border: 1px solid #FCA5A5;
    color: #B91C1C;
    padding: 12px 18px;
    border-radius: var(--radius-md);
    margin-bottom: 24px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .quicksales-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E2E8F0;
  }

  .results-headline {
    font-size: 1.05rem;
    font-weight: 700;
    color: #475569;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .results-bold-num {
    font-family: 'Outfit', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--brand-red);
  }

  .results-filter-badge {
    background: #F1F5F9;
    color: #334155;
    font-size: 0.78rem;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 700;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sort-box {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    padding: 6px 12px;
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

  .toolbar-clear-btn {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: var(--brand-red);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .toolbar-clear-btn:hover {
    background: var(--brand-red-light);
    border-color: var(--brand-red);
  }

  /* ── 4. MODERN QUICKSALE CARDS GRID (Just like Listings.jsx) ── */
  .quicksales-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 24px;
  }

  @media (max-width: 640px) {
    .quicksales-cards-grid {
      grid-template-columns: 1fr;
      gap: 18px;
    }
  }

  .quicksale-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 18px -2px rgba(15, 23, 42, 0.05);
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  }
  .quicksale-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(227, 27, 27, 0.25);
    border-color: rgba(227, 27, 27, 0.3);
  }

  /* Card Media Box (Identical to PropertyCardMedia in Listings.jsx) */
  .card-media-box {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #0F172A;
  }

  .card-carousel-track {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .card-carousel-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
    transform: scale(1);
    pointer-events: none;
  }

  .card-carousel-slide.active {
    opacity: 1;
    pointer-events: auto;
  }

  .quicksale-card:hover .card-carousel-slide.active {
    transform: scale(1.04);
  }

  /* Carousel Navigation Arrows */
  .card-carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .card-carousel-prev {
    left: 8px;
  }
  .card-carousel-next {
    right: 8px;
  }

  .quicksale-card:hover .card-carousel-arrow {
    opacity: 1;
  }
  .card-carousel-arrow:hover {
    background: var(--brand-red);
    border-color: var(--brand-red);
    transform: translateY(-50%) scale(1.12);
  }

  /* Carousel Indicators */
  .card-carousel-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 4;
    padding: 3px 6px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    max-width: 90px;
    overflow: hidden;
  }

  .card-carousel-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }
  .card-carousel-dot.active {
    background: var(--brand-red);
    width: 12px;
    border-radius: 3px;
  }

  .card-no-photo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94A3B8;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .card-img-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Card Badges */
  .card-avail-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 2;
  }
  .avail-green {
    background: rgba(16, 185, 129, 0.95);
    color: #FFFFFF;
  }
  .avail-amber {
    background: rgba(245, 158, 11, 0.95);
    color: #FFFFFF;
  }
  .avail-red {
    background: rgba(220, 38, 38, 0.95);
    color: #FFFFFF;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 8px #FFFFFF;
    animation: livePulse 1.8s infinite;
  }

  .card-type-badge {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(15, 23, 42, 0.78);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    backdrop-filter: blur(6px);
  }

  .card-photo-count {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(15, 23, 42, 0.78);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    backdrop-filter: blur(6px);
  }

  .card-new-tag {
    position: absolute;
    top: 40px;
    left: 10px;
    background: rgba(227, 27, 27, 0.95);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    z-index: 2;
  }

  .card-fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    z-index: 3;
  }
  .card-fav-btn:hover {
    transform: scale(1.15);
    background: #FFFFFF;
  }

  /* Card Content */
  .card-content-box {
    padding: 16px 18px 18px;
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
  .location-pin-icon {
    color: var(--brand-red);
  }
  .location-text {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--brand-red);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-item-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--navy-ink);
    line-height: 1.35;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .price-tag-wrap {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .price-currency {
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--brand-red);
  }
  .price-amount {
    font-family: 'Outfit', sans-serif;
    font-size: 1.35rem;
    font-weight: 900;
    color: var(--brand-red);
    letter-spacing: -0.01em;
  }

  .card-deal-pill {
    background: #DCFCE7;
    color: #15803D;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 999px;
  }

  .card-specs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: #F8FAFC;
    border: 1px solid #F1F5F9;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    margin-bottom: 14px;
  }
  .spec-chip {
    display: flex;
    flex-direction: column;
  }
  .spec-label {
    font-size: 0.65rem;
    color: #94A3B8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .spec-val {
    font-size: 0.78rem;
    font-weight: 700;
    color: #1E293B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Seller Bar */
  .card-seller-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #F8FAFC;
    border-radius: var(--radius-sm);
    margin-bottom: 14px;
  }

  .seller-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0B2140 0%, #1E3A8A 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    flex-shrink: 0;
  }
  .seller-avatar.large {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  .seller-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .seller-name {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--navy-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .seller-verified-tag {
    font-size: 0.68rem;
    color: #16A34A;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  /* Action Buttons */
  .card-actions-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: auto;
  }

  .card-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }

  .card-whatsapp-btn {
    background: #25D366;
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.25);
  }
  .card-whatsapp-btn:hover {
    background: #1EBE5D;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
  }

  .card-view-btn {
    background: var(--navy-ink);
    color: #FFFFFF;
  }
  .card-view-btn:hover {
    background: #1E293B;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  }

  /* ── 5. MODAL STYLES ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-window {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    max-width: 820px;
    width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(15, 23, 42, 0.7);
    color: #FFFFFF;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .modal-close-btn:hover {
    background: var(--brand-red);
    transform: scale(1.1);
  }

  .modal-gallery-pane {
    position: relative;
    background: #0F172A;
  }

  .modal-main-img-box {
    position: relative;
    width: 100%;
    height: 380px;
    overflow: hidden;
  }

  .modal-main-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #08101D;
  }

  .modal-nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(15, 23, 42, 0.75);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 5;
  }
  .modal-nav-arrow:hover {
    background: var(--brand-red);
    border-color: var(--brand-red);
    transform: translateY(-50%) scale(1.1);
  }
  .modal-nav-prev { left: 14px; }
  .modal-nav-next { right: 14px; }

  .modal-photo-indicator {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.65);
    color: #FFFFFF;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    backdrop-filter: blur(4px);
  }

  .modal-thumb-row {
    display: flex;
    gap: 8px;
    padding: 10px 14px;
    overflow-x: auto;
    background: #0D1B2A;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .modal-thumb {
    width: 58px;
    height: 58px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    opacity: 0.5;
    border: 2px solid transparent;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .modal-thumb:hover, .modal-thumb.active {
    opacity: 1;
    border-color: var(--brand-red);
  }

  .modal-no-img {
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    gap: 8px;
    font-weight: 600;
  }

  .modal-details-pane {
    padding: 24px 28px 32px;
  }

  .modal-header-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .modal-verified-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #DCFCE7;
    color: #15803D;
    font-size: 0.75rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .modal-share-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #F1F5F9;
    border: none;
    color: #475569;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s;
  }
  .modal-share-btn:hover {
    background: #E2E8F0;
    color: var(--navy-ink);
  }

  .modal-item-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.55rem;
    font-weight: 800;
    color: var(--navy-ink);
    line-height: 1.25;
    margin-bottom: 8px;
  }

  .modal-location-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
    color: #64748B;
    margin-bottom: 18px;
    font-weight: 600;
  }

  .modal-price-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FFF5F5;
    border: 1px solid #FED7D7;
    padding: 14px 20px;
    border-radius: var(--radius-md);
    margin-bottom: 18px;
  }

  .modal-price-label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 2px;
  }
  .modal-price-val {
    font-family: 'Outfit', sans-serif;
    font-size: 1.7rem;
    font-weight: 900;
    color: var(--brand-red);
  }

  .modal-stock-col {
    text-align: right;
  }
  .modal-stock-val {
    font-family: 'Outfit', sans-serif;
    font-size: 1.45rem;
    font-weight: 800;
    color: #10B981;
  }

  .modal-tags-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }
  .modal-tag-pill {
    background: #F1F5F9;
    color: #334155;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
  }
  .tag-blue { background: #DBEAFE; color: #1D4ED8; }
  .tag-red { background: #FEE2E2; color: #B91C1C; }

  .modal-desc-box {
    margin-bottom: 22px;
  }
  .modal-desc-heading {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .modal-desc-text {
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .modal-seller-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-left: 4px solid var(--brand-red);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    margin-bottom: 18px;
  }

  .modal-seller-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .modal-seller-name {
    font-size: 1rem;
    font-weight: 800;
    color: var(--navy-ink);
  }
  .modal-seller-sub {
    font-size: 0.8rem;
    color: #64748B;
  }

  .modal-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .modal-contact-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .btn-whatsapp {
    background: #25D366;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
  }
  .btn-whatsapp:hover {
    background: #1EBE5D;
    transform: translateY(-1px);
  }

  .btn-call {
    background: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }
  .btn-call:hover {
    background: #1D4ED8;
    transform: translateY(-1px);
  }

  .modal-safety-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #FEF3C7;
    border: 1px solid #FDE68A;
    color: #92400E;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    line-height: 1.5;
    font-weight: 600;
  }

  /* ── 6. EMPTY & LOADING STATES ── */
  .quicksales-loading-state {
    text-align: center;
    padding: 80px 20px;
  }
  .loading-spinner {
    width: 44px;
    height: 44px;
    border: 3px solid #E2E8F0;
    border-top: 3px solid var(--brand-red);
    border-radius: 50%;
    animation: spin 0.85s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .loading-text {
    color: #64748B;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .quicksales-empty-state {
    text-align: center;
    padding: 70px 20px;
    background: #FFFFFF;
    border: 2px dashed #E2E8F0;
    border-radius: var(--radius-lg);
  }
  .empty-icon-box {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #FEE2E2;
    color: var(--brand-red);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .empty-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 6px;
  }
  .empty-subtitle {
    font-size: 0.9rem;
    color: #64748B;
    max-width: 480px;
    margin: 0 auto 22px;
    line-height: 1.5;
  }
  .empty-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .empty-btn {
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .empty-btn-primary {
    background: var(--brand-red);
    color: #FFFFFF;
  }
  .empty-btn-primary:hover {
    background: var(--brand-red-hover);
    transform: translateY(-1px);
  }
  .empty-btn-secondary {
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #CBD5E1;
  }
  .empty-btn-secondary:hover {
    background: #E2E8F0;
  }

  /* Toast Notification Bubble */
  .ax-toast-bubble {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0F172A;
    color: #FFFFFF;
    padding: 12px 20px;
    border-radius: var(--radius-md);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    font-size: 0.85rem;
    font-weight: 700;
    z-index: 2000;
    animation: toastSlide 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  @keyframes toastSlide {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 768px) {
    .modal-contact-grid {
      grid-template-columns: 1fr;
    }
    .modal-main-img-box {
      height: 280px;
    }
    .modal-details-pane {
      padding: 18px 20px 24px;
    }
  }
`;