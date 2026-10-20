import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

const BUSINESS_CATEGORIES = [
  "Restaurants", "Retail", "Services", "Technology", "Healthcare", "Education",
  "Entertainment", "Professional Services", "Manufacturing", "Agriculture",
  "Construction", "Transportation", "Other",
];

const CATEGORY_EMOJIS = {
  "Restaurants": "🍽️",
  "Retail": "🛍️",
  "Services": "🛠️",
  "Technology": "💻",
  "Healthcare": "🏥",
  "Education": "🎓",
  "Entertainment": "🎬",
  "Professional Services": "💼",
  "Manufacturing": "🏭",
  "Agriculture": "🌾",
  "Construction": "🏗️",
  "Transportation": "🚚",
  "Other": "🏢",
};

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana",
  "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega",
  "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii",
  "Nyamira", "Nairobi City",
];

const BADGE_CONFIG = {
  student_verified: { label: "Student Verified", color: "#10b981", icon: "✦" },
  identity_verified: { label: "Identity Verified", color: "#10b981", icon: "✦" },
  business_verified: { label: "Business Verified", color: "#3b82f6", icon: "◈" },
  online_verified: { label: "Online Verified", color: "#3b82f6", icon: "◈" },
  location_verified: { label: "Location Verified", color: "#8b5cf6", icon: "◉" },
  premium_verified: { label: "Premium", color: "#f59e0b", icon: "★" },
};

// ── Professional Icons ──
const IconCamera = ({ size = 12, className = "" }) => (
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

const IconWhatsApp = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} style={{ flexShrink: 0 }}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
  </svg>
);

const IconSparkles = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z" />
  </svg>
);

// ── Multi-Image Card Media Component (Just as Listings & QuickSales) ──
function BusinessCardMedia({ biz, isFav, onToggleFavorite, isCompared, onToggleComparison }) {
  const rawImages = Array.isArray(biz.images)
    ? biz.images
    : biz.images
    ? [biz.images]
    : biz.image
    ? [biz.image]
    : biz.logo
    ? [biz.logo]
    : [];

  const images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url || img?.secure_url : img))
    .filter(Boolean);

  const [activeIdx, setActiveIdx] = useState(0);

  // Automatically cycle through business pictures every 3.2s
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

  const category = biz.categories?.[0] || biz.category || "Business";

  return (
    <div className="card-media-box">
      {images.length > 0 ? (
        <div className="card-carousel-track">
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${biz.name} - photo ${idx + 1}`}
              className={`card-carousel-slide ${idx === activeIdx ? "active" : ""}`}
              loading={idx === 0 ? "eager" : "lazy"}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>
      ) : (
        <div className="card-no-photo">
          <span style={{ fontSize: "38px" }}>{CATEGORY_EMOJIS[category] || "🏢"}</span>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>No Photos Uploaded</span>
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

      {/* Featured Tag */}
      {biz.featured && (
        <div className="card-featured-badge">
          <span>⚡ Featured</span>
        </div>
      )}

      {/* Rating Badge */}
      {biz.rating > 0 && (
        <div className="card-rating-badge">
          <span style={{ color: "#F59E0B" }}>★</span>
          <span>{biz.rating?.toFixed(1)}</span>
        </div>
      )}

      {/* Category Tag */}
      <div className="card-type-badge">
        {category}
      </div>

      {/* Photo Count Tag */}
      {images.length > 1 && (
        <div className="card-photo-count">
          <IconCamera size={11} />
          <span>{activeIdx + 1} / {images.length}</span>
        </div>
      )}

      {/* Top Right Action Buttons Overlay */}
      <div className="card-media-actions">
        {/* Compare Toggle */}
        <button
          type="button"
          className={`card-media-btn ${isCompared ? "active-compare" : ""}`}
          onClick={(e) => onToggleComparison(biz._id, e)}
          title={isCompared ? "Remove from Compare" : "Compare Business"}
          aria-label="Compare"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="8" height="18" rx="2" />
            <rect x="14" y="3" width="8" height="18" rx="2" />
          </svg>
        </button>

        {/* Wishlist Favorite Heart Button */}
        <button
          type="button"
          className={`card-media-btn ${isFav ? "active-fav" : ""}`}
          onClick={(e) => onToggleFavorite(biz._id, e)}
          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          aria-label="Favorite"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill={isFav ? "#E31B1B" : "none"} stroke={isFav ? "#E31B1B" : "currentColor"} strokeWidth="2.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AxxBiashara() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useContext(AuthContext);

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("verified");
  const [minRating, setMinRating] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [verification, setVerification] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [refreshBanner, setRefreshBanner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalBusinesses, setTotalBusinesses] = useState(0);

  /* ── core data fetchers ── */
  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCounty) params.county = selectedCounty;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;
      if (minRating) params.minRating = minRating;
      if (openNow) params.openNow = "true";
      if (verification) params.verification = verification;
      const res = await API.get("/business", { params });
      setBusinesses(res.data.businesses || []);
      setTotalBusinesses(res.data.businesses?.length || 0);
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await API.get("/business/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  const loadFavorites = async () => {
    if (!token) return;
    try {
      const res = await API.get("/favorites");
      setFavorites(res.data.favorites || []);
    } catch (err) { }
  };

  /* ── filter-driven reload ── */
  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory, selectedCounty, searchQuery, sortBy, minRating, openNow, verification]);

  /* ── initial load ── */
  useEffect(() => {
    loadAnnouncements();
    loadFavorites();
  }, []);

  /* ── refresh trigger from BusinessForm after update ── */
  useEffect(() => {
    if (location.state?.refresh) {
      loadBusinesses();
      setRefreshBanner(true);
      window.history.replaceState({}, document.title);
      const t = setTimeout(() => setRefreshBanner(false), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  /* ── favourites ── */
  const toggleFavorite = async (businessId, e) => {
    e.stopPropagation();
    if (!token) {
      navigate("/business-login");
      return;
    }
    try {
      const existing = favorites.find((f) => f.business?._id === businessId || f.business === businessId);
      if (existing) {
        await API.delete(`/favorites/${existing._id}`);
        setFavorites(favorites.filter((f) => f._id !== existing._id));
      } else {
        await API.post("/favorites", { businessId });
        loadFavorites();
      }
    } catch (err) { }
  };

  const isFavorite = (id) => favorites.some((f) => f.business?._id === id || f.business === id);

  /* ── comparison ── */
  const toggleComparison = (businessId, e) => {
    e.stopPropagation();
    if (comparisonList.includes(businessId)) {
      setComparisonList(comparisonList.filter((id) => id !== businessId));
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, businessId]);
    } else {
      alert("You can compare up to 3 businesses at a time");
    }
  };

  const openComparison = async () => {
    if (comparisonList.length < 2) {
      alert("Select at least 2 businesses to compare");
      return;
    }
    try {
      const res = await API.get(`/business/compare?ids=${comparisonList.join(",")}`);
      setComparisonData(res.data.businesses || []);
      setShowComparisonModal(true);
    } catch (err) { }
  };

  /* ── announcement submit ── */
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post("/business/announcements", {
        title: announcementTitle,
        content: announcementContent,
        submitterName,
        organizationName,
      });
      setAnnouncementSuccess("Announcement submitted for approval!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSubmitterName("");
      setOrganizationName("");
      setShowAnnouncementForm(false);
      setTimeout(() => setAnnouncementSuccess(""), 4000);
    } catch (err) {
      alert("Failed to submit: " + (err.response?.data?.error || err.message));
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedCounty(null);
    setSearchQuery("");
    setMinRating("");
    setVerification("");
    setOpenNow(false);
  };

  const hasActiveFilters = !!(selectedCategory || selectedCounty || searchQuery || minRating || verification || openNow);

  return (
    <div className="ax-biashara-root">
      <style>{css}</style>

      {/* ── 1. HERO ATMOSPHERE (Matching Listings & QuickSales) ── */}
      <section className="biashara-hero">
        <div className="ambient-orb orb-amber" />
        <div className="ambient-orb orb-crimson" />
        <div className="ambient-orb orb-navy" />
        <div className="hero-grid-pattern" />

        <div className="hero-inner-container">
          {/* Top Pill & Badges */}
          <div className="hero-top-row">
            <span className="hero-live-pill">
              <span className="pulse-dot" />
              <span>AxxBiashara Business Directory</span>
            </span>

            <div className="hero-header-actions">
              {token && user?.role === "user" ? (
                <button
                  type="button"
                  className="hero-action-btn hero-dash-btn"
                  onClick={() => navigate("/business-dashboard")}
                >
                  <IconSparkles size={14} />
                  <span>My Dashboard</span>
                </button>
              ) : null}
              <button
                type="button"
                className="hero-action-btn hero-add-btn"
                onClick={() => {
                  if (token && user?.role === "user") {
                    navigate("/business-dashboard");
                  } else {
                    navigate("/business-login");
                  }
                }}
              >
                <span>+ Register Business</span>
              </button>
            </div>
          </div>

          <h1 className="hero-headline">
            Discover Verified Local Businesses in <span className="headline-highlight">Kenya</span>
          </h1>
          <p className="hero-subtext">
            Explore trusted restaurants, hardware stores, professional tech services, healthcare facilities, contractors and suppliers across all 47 counties.
          </p>

          {/* Trust Guarantees */}
          <div className="hero-trust-bar">
            <span className="trust-item">
              <IconShieldCheck size={14} /> Verified Directory
            </span>
            <span className="trust-item">
              <IconWhatsApp size={14} /> Direct WhatsApp Contact
            </span>
            <span className="trust-item">
              <IconMapPin size={14} /> All 47 Counties
            </span>
            <span className="trust-item">
              <IconSparkles size={14} /> Real Customer Reviews
            </span>
          </div>

          {/* ── 2. SEARCH & FILTER COMMAND CENTER ── */}
          <div className="hero-search-card">
            <div className="search-inputs-grid">
              {/* Search Field */}
              <div className="search-field search-main-field">
                <span className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by business name, services, town (e.g. Java, Hardware, Kisumu)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-text-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
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
                  value={selectedCounty || ""}
                  onChange={(e) => setSelectedCounty(e.target.value || null)}
                  className="search-select-input"
                >
                  <option value="">All Counties</option>
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="search-field search-select-field">
                <span className="field-icon">🏢</span>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="search-select-input"
                >
                  <option value="">All Categories</option>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_EMOJIS[cat] || "🏢"} {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="search-field search-select-field">
                <span className="field-icon">⚡</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="search-select-input"
                >
                  <option value="verified">Verified First</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name A–Z</option>
                </select>
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
                  className={`quick-category-chip ${selectedCategory === null ? "active" : ""}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  ✨ All Categories
                </button>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`quick-category-chip ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{CATEGORY_EMOJIS[cat] || "🏢"}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REFRESH BANNER ── */}
      {refreshBanner && (
        <div className="refresh-banner-wrap">
          <div className="refresh-banner">
            <span style={{ fontSize: "16px" }}>✓</span>
            Directory records updated successfully!
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT BODY ── */}
      <main className="biashara-main-canvas">
        {/* Results Toolbar */}
        <div className="biashara-toolbar">
          <div className="toolbar-left">
            <h2 className="results-headline">
              Directory Records: <span className="results-bold-num">{businesses.length}</span>
              {selectedCounty && <span className="results-filter-badge">in {selectedCounty}</span>}
              {selectedCategory && <span className="results-filter-badge">{selectedCategory}</span>}
            </h2>
          </div>

          <div className="toolbar-right">
            {comparisonList.length > 0 && (
              <span className="compare-status-badge">
                {comparisonList.length}/3 selected for compare
              </span>
            )}
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

        {/* Announcements Strip if Available */}
        {announcements.length > 0 && (
          <div className="announcements-bar">
            <span className="ann-label">📢 Updates:</span>
            <div className="ann-scroll-track">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="ann-chip"
                  onClick={() => {
                    setSelectedAnnouncement(ann);
                    setShowAnnouncementModal(true);
                  }}
                >
                  <strong>{ann.title}</strong> — {ann.businessName || ann.organizationName || "AxxBiashara"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directory Grid */}
        {loading ? (
          <div className="shimmer-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="biashara-empty-state">
            <div className="empty-icon-box">🏢</div>
            <h3 className="empty-title">No matching businesses found</h3>
            <p className="empty-subtitle">
              Try adjusting your search keywords, clearing specific county filters, or selecting a broader business category.
            </p>
            <div className="empty-actions">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="empty-btn empty-btn-secondary"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (token && user?.role === "user") {
                    navigate("/business-dashboard");
                  } else {
                    navigate("/business-login");
                  }
                }}
                className="empty-btn empty-btn-primary"
              >
                Register Your Business Free
              </button>
            </div>
          </div>
        ) : (
          /* ── 4. MODERN BUSINESS CARDS GRID ── */
          <div className="biashara-cards-grid">
            {businesses.map((biz) => {
              const isFav = isFavorite(biz._id);
              const isCompared = comparisonList.includes(biz._id);

              return (
                <div
                  key={biz._id}
                  className={`biashara-card ${biz.featured ? "featured-card" : ""}`}
                  onClick={() => navigate(`/business/${biz._id}`)}
                >
                  {/* Multi-Image Carousel Media Header */}
                  <BusinessCardMedia
                    biz={biz}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    isCompared={isCompared}
                    onToggleComparison={toggleComparison}
                  />

                  {/* Card Content Body */}
                  <div className="card-content-box">
                    {/* Meta Category Row */}
                    <div className="card-meta-row">
                      <span className="card-category-pill">
                        {biz.categories?.[0] || biz.category || "Business"}
                      </span>
                      <div className="meta-chips-right">
                        {biz.priceRange && <span className="price-range-chip">{biz.priceRange}</span>}
                        {biz.yearEstablished && <span className="est-chip">Est. {biz.yearEstablished}</span>}
                        {biz.categoryItems?.length > 0 && (
                          <span className="items-count-chip">
                            {biz.categoryItems.length} items
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="card-business-title" title={biz.name}>
                      {biz.name}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="card-rating-row">
                      {biz.rating > 0 ? (
                        <>
                          <span style={{ color: "#F59E0B" }}>★</span>
                          <span style={{ fontWeight: 800, color: "#0F172A" }}>{biz.rating?.toFixed(1)}</span>
                          <span style={{ color: "#64748B" }}>({biz.reviewCount || 0} reviews)</span>
                        </>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "0.78rem" }}>No reviews yet</span>
                      )}
                    </div>

                    {/* Description snippet */}
                    <p className="card-description">
                      {biz.description || "Verified local business listed on AxxBiashara directory."}
                    </p>

                    {/* Verification Badges */}
                    {biz.verificationBadges?.length > 0 && (
                      <div className="card-badges-row">
                        {biz.verificationBadges.map((badge, bIdx) => {
                          const config = BADGE_CONFIG[badge.type] || { label: badge.type, color: "#64748b", icon: "◈" };
                          return (
                            <span
                              key={bIdx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                padding: "2px 6px",
                                borderRadius: "6px",
                                background: `${config.color}15`,
                                border: `1px solid ${config.color}25`,
                                color: config.color,
                                fontSize: "9.5px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.02em",
                              }}
                            >
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Location */}
                    <div className="card-location-row">
                      <IconMapPin size={13} className="location-pin-icon" />
                      <span>{biz.location?.town ? `${biz.location.town}, ` : ""}{biz.location?.county || "Kenya"}</span>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="card-footer-row">
                      <span className="card-profile-link">
                        View Profile <span className="profile-arrow">→</span>
                      </span>

                      <div className="card-footer-buttons">
                        {(biz.socialMedia?.whatsapp || biz.contact?.phone) && (
                          <a
                            href={`https://wa.me/${(biz.socialMedia?.whatsapp || biz.contact?.phone).replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="card-quick-wa-btn"
                            title="Chat on WhatsApp"
                          >
                            <IconWhatsApp size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── FLOATING COMPARE BAR ── */}
      {comparisonList.length > 0 && (
        <div className="floating-compare-bar">
          <div className="compare-bar-info">
            <span className="compare-counter-pill">{comparisonList.length}</span>
            <span className="compare-bar-label">businesses selected to compare</span>
          </div>
          <button
            type="button"
            className="compare-btn-primary"
            onClick={openComparison}
          >
            Compare Now
          </button>
          <button
            type="button"
            className="compare-btn-clear"
            onClick={() => setComparisonList([])}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── ANNOUNCEMENT VIEW MODAL ── */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="modal-backdrop" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-box-announcement" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-round"
              onClick={() => setShowAnnouncementModal(false)}
            >
              ✕
            </button>
            <div className="ann-modal-header-tag">
              📢 {selectedAnnouncement.businessName || "Announcement"}
            </div>
            <h3 className="ann-modal-title">{selectedAnnouncement.title}</h3>
            <div className="ann-modal-meta">
              {selectedAnnouncement.submitterName && `${selectedAnnouncement.submitterName}`}
              {selectedAnnouncement.organizationName && ` · ${selectedAnnouncement.organizationName}`}
              <span style={{ marginLeft: "10px" }}>
                {new Date(selectedAnnouncement.createdAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />
            <p className="ann-modal-body">{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}

      {/* ── SIDE BY SIDE COMPARISON MODAL ── */}
      {showComparisonModal && (
        <div className="modal-backdrop" onClick={() => setShowComparisonModal(false)}>
          <div className="modal-box-compare" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-round"
              onClick={() => setShowComparisonModal(false)}
            >
              ✕
            </button>
            <div className="compare-modal-header">
              <span className="compare-modal-tag">Side-by-Side Review</span>
              <h3 className="compare-modal-title">Business Comparison</h3>
            </div>
            <div className="compare-grid-layout" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
              {comparisonData.map((biz) => (
                <div key={biz._id} className="compare-card">
                  <div className="compare-card-title">{biz.name}</div>
                  {[
                    ["Category", biz.categories?.join(", ") || biz.category],
                    ["Location", `${biz.location?.town || ""}, ${biz.location?.county || "Kenya"}`],
                    ["Rating", biz.rating ? `★ ${biz.rating.toFixed(1)}` : "No rating"],
                    ["Reviews", biz.reviewCount || 0],
                    ["Price Guide", biz.priceRange || "N/A"],
                    ["Founded", biz.yearEstablished || "N/A"],
                    ["Contact Phone", biz.contact?.phone || "N/A"],
                    ["Contact Email", biz.contact?.email || "N/A"],
                  ].map(([label, val]) => (
                    <div key={label} className="compare-row">
                      <div className="compare-row-label">{label}</div>
                      <div className="compare-row-val">{val}</div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate(`/business/${biz._id}`)}
                    className="compare-view-btn"
                  >
                    View Full Profile →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="biashara-footer">
        <div className="footer-inner">
          <div className="footer-cols">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <img src="/axxbiashara.png" alt="AxxBiashara" style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "8px" }} />
                <span style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF" }}>AxxBiashara</span>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.6, maxWidth: "320px" }}>
                Empowering Kenyan businesses with digital visibility, verified trust, and instant client connections across all 47 counties.
              </p>
            </div>
            <div>
              <div className="footer-heading">Directory Support</div>
              <a href="mailto:info@axxspace.com" className="footer-link">info@axxspace.com</a>
              <a href="mailto:support@axxspace.com" className="footer-link">support@axxspace.com</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Axxspace. All rights reserved.</p>
            <p style={{ color: "#F59E0B", fontWeight: 700 }}>Built for Kenya 🇰🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Ultra-Professional Styles (Aligning with Listings & QuickSales) ──
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .ax-biashara-root {
    --bg-dark: #08101D;
    --bg-dark-secondary: #0D1B2A;
    --canvas-light: #F8FAFC;
    --card-bg: #FFFFFF;
    --brand-red: #E31B1B;
    --brand-red-hover: #c41414;
    --brand-red-light: rgba(227, 27, 27, 0.08);
    --gold: #F59E0B;
    --emerald: #10B981;
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

  .ax-biashara-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── 1. HERO ATMOSPHERE ── */
  .biashara-hero {
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
  .orb-amber {
    top: -80px;
    left: 8%;
    width: 440px;
    height: 440px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
  }
  .orb-crimson {
    top: 40px;
    right: 5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(227, 27, 27, 0.28) 0%, transparent 70%);
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
    background: #F59E0B;
    box-shadow: 0 0 10px #F59E0B;
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
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
  }
  .hero-dash-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
  }

  .hero-add-btn {
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
  }
  .hero-add-btn:hover {
    background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.45);
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
    background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
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
    border-color: #F59E0B;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }

  .search-main-field {
    flex: 2;
    min-width: 240px;
  }

  .search-select-field {
    flex: 1;
    min-width: 140px;
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
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #B45309;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .hero-reset-btn:hover {
    background: #F59E0B;
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
    border-color: #F59E0B;
    color: #B45309;
    transform: translateY(-1px);
  }
  .quick-category-chip.active {
    background: #F59E0B;
    border-color: #F59E0B;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
  }

  /* ── 3. MAIN CONTENT BODY ── */
  .biashara-main-canvas {
    max-width: 1240px;
    margin: 0 auto;
    padding: 32px 20px 80px;
  }

  .refresh-banner-wrap {
    max-width: 1240px;
    margin: 16px auto 0;
    padding: 0 20px;
  }
  .refresh-banner {
    background: #DCFCE7;
    border: 1px solid #86EFAC;
    color: #15803D;
    padding: 12px 18px;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.88rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .biashara-toolbar {
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
    color: #F59E0B;
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

  .compare-status-badge {
    background: #FEF3C7;
    color: #B45309;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid #FDE68A;
  }

  .toolbar-clear-btn {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #B45309;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .toolbar-clear-btn:hover {
    background: #FEF3C7;
    border-color: #F59E0B;
  }

  /* Announcements Bar */
  .announcements-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: var(--radius-md);
    padding: 10px 16px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .ann-label {
    font-size: 0.8rem;
    font-weight: 800;
    color: #B45309;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ann-scroll-track {
    display: flex;
    gap: 14px;
    overflow-x: auto;
  }
  .ann-chip {
    font-size: 0.82rem;
    color: #92400E;
    white-space: nowrap;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s;
  }
  .ann-chip:hover {
    color: #B45309;
  }

  /* ── 4. MODERN BUSINESS CARDS GRID ── */
  .biashara-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 24px;
  }

  @media (max-width: 640px) {
    .biashara-cards-grid {
      grid-template-columns: 1fr;
      gap: 18px;
    }
  }

  .biashara-card {
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
  .biashara-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(245, 158, 11, 0.35);
    border-color: rgba(245, 158, 11, 0.4);
  }

  /* Card Media Box (Matches Listings & QuickSales) */
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

  .biashara-card:hover .card-carousel-slide.active {
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
  .card-carousel-prev { left: 8px; }
  .card-carousel-next { right: 8px; }

  .biashara-card:hover .card-carousel-arrow {
    opacity: 1;
  }
  .card-carousel-arrow:hover {
    background: #F59E0B;
    border-color: #F59E0B;
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
    background: #F59E0B;
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
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  }

  .card-img-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, transparent 60%);
    pointer-events: none;
  }

  .card-featured-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    color: #FFFFFF;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    z-index: 2;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  }

  .card-rating-badge {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(15, 23, 42, 0.85);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 800;
    backdrop-filter: blur(6px);
    z-index: 2;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-type-badge {
    position: absolute;
    top: 10px;
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
    z-index: 2;
  }
  .card-featured-badge + .card-type-badge {
    top: 38px;
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

  /* Action Buttons Top Right of Media */
  .card-media-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
    z-index: 3;
  }

  .card-media-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    color: #1E293B;
  }
  .card-media-btn:hover {
    transform: scale(1.12);
    background: #FFFFFF;
  }
  .card-media-btn.active-compare {
    background: #F59E0B;
    color: #FFFFFF;
    border-color: #F59E0B;
  }
  .card-media-btn.active-fav {
    background: #FFFFFF;
    color: #E31B1B;
  }

  /* Card Content */
  .card-content-box {
    padding: 16px 18px 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .card-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .card-category-pill {
    font-size: 0.72rem;
    font-weight: 800;
    color: #B45309;
    background: #FEF3C7;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .meta-chips-right {
    display: flex;
    gap: 6px;
    font-size: 0.75rem;
    color: #64748B;
  }
  .price-range-chip {
    color: #F59E0B;
    font-weight: 800;
  }
  .est-chip {
    color: #64748B;
  }
  .items-count-chip {
    color: #10B981;
    font-weight: 700;
  }

  .card-business-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    line-height: 1.35;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-rating-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 0.85rem;
    color: #64748B;
    line-height: 1.45;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .card-location-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: #64748B;
    margin-top: auto;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .location-pin-icon {
    color: #F59E0B;
  }

  .card-footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid #E2E8F0;
  }

  .card-profile-link {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--brand-red);
    display: flex;
    align-items: center;
    gap: 4px;
    transition: transform 0.2s;
  }
  .biashara-card:hover .profile-arrow {
    transform: translateX(4px);
  }

  .card-footer-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-quick-wa-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #DCFCE7;
    color: #15803D;
    border: 1px solid #86EFAC;
    transition: all 0.2s ease;
  }
  .card-quick-wa-btn:hover {
    background: #25D366;
    color: #FFFFFF;
    transform: scale(1.08);
  }

  /* ── 5. FLOATING COMPARE BAR ── */
  .floating-compare-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #0F172A;
    color: #FFFFFF;
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 999px;
    padding: 10px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
    z-index: 1000;
    backdrop-filter: blur(16px);
  }

  .compare-bar-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .compare-counter-pill {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #F59E0B;
    color: #0F172A;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 800;
  }
  .compare-bar-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #E2E8F0;
  }

  .compare-btn-primary {
    background: #F59E0B;
    color: #0F172A;
    border: none;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
  .compare-btn-primary:hover {
    background: #FBBF24;
    transform: scale(1.05);
  }

  .compare-btn-clear {
    background: transparent;
    border: none;
    color: #94A3B8;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
  .compare-btn-clear:hover {
    color: #FFFFFF;
  }

  /* ── 6. MODALS ── */
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
  }

  .modal-close-round {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }
  .modal-close-round:hover {
    background: var(--brand-red);
    color: #FFFFFF;
    border-color: var(--brand-red);
  }

  .modal-box-announcement {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 32px;
    max-width: 560px;
    width: 100%;
    position: relative;
    box-shadow: var(--shadow-elevated);
  }

  .ann-modal-header-tag {
    font-size: 0.75rem;
    font-weight: 800;
    color: #B45309;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }
  .ann-modal-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .ann-modal-meta {
    font-size: 0.8rem;
    color: #64748B;
    margin-bottom: 16px;
  }
  .ann-modal-body {
    font-size: 0.92rem;
    color: #334155;
    line-height: 1.65;
  }

  .modal-box-compare {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    padding: 32px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: var(--shadow-elevated);
  }

  .compare-modal-header {
    margin-bottom: 24px;
  }
  .compare-modal-tag {
    font-size: 0.72rem;
    font-weight: 800;
    color: #B45309;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .compare-modal-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.55rem;
    font-weight: 800;
    color: var(--navy-ink);
  }

  .compare-grid-layout {
    display: grid;
    gap: 16px;
  }

  .compare-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 20px;
  }

  .compare-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #E2E8F0;
  }

  .compare-row {
    margin-bottom: 10px;
  }
  .compare-row-label {
    font-size: 0.68rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .compare-row-val {
    font-size: 0.85rem;
    color: #1E293B;
    font-weight: 600;
  }

  .compare-view-btn {
    width: 100%;
    margin-top: 14px;
    padding: 10px;
    background: #0F172A;
    color: #FFFFFF;
    border: none;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .compare-view-btn:hover {
    background: #F59E0B;
    color: #0F172A;
  }

  /* ── 7. SHIMMER & EMPTY STATES ── */
  .shimmer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 24px;
  }
  .shimmer-card {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 400px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-lg);
    height: 380px;
  }
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .biashara-empty-state {
    text-align: center;
    padding: 70px 20px;
    background: #FFFFFF;
    border: 2px dashed #E2E8F0;
    border-radius: var(--radius-lg);
  }
  .empty-icon-box {
    font-size: 42px;
    margin-bottom: 12px;
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
    background: #F59E0B;
    color: #FFFFFF;
  }
  .empty-btn-primary:hover {
    background: #D97706;
  }
  .empty-btn-secondary {
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #CBD5E1;
  }

  /* ── 8. FOOTER ── */
  .biashara-footer {
    background: #07090F;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 48px 20px 32px;
    color: #FFFFFF;
  }
  .footer-inner {
    max-width: 1240px;
    margin: 0 auto;
  }
  .footer-cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 32px;
    margin-bottom: 32px;
  }
  .footer-heading {
    font-size: 0.78rem;
    font-weight: 800;
    color: #F59E0B;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }
  .footer-link {
    display: block;
    font-size: 0.85rem;
    color: #94A3B8;
    text-decoration: none;
    margin-bottom: 8px;
    transition: color 0.2s;
  }
  .footer-link:hover {
    color: #F59E0B;
  }
  .footer-bottom {
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
`;