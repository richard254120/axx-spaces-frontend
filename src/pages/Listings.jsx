import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import RequestItemModal from "../components/RequestItemModal";
import ShareProperty from "../components/ShareProperty";
import MapView from "../components/MapView";
import MessagingSystem from "../components/MessagingSystem";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { kenyanUniversities, searchUniversities } from "../data/kenyanUniversities";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

// ── Professional Icons (SVG) ──
const IconHome = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBuilding = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
);

const IconApartment = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const IconBed = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
);

const IconSparkles = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z" />
  </svg>
);

const IconPaw = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5z" />
  </svg>
);

const IconTag = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconHeart = ({ size = 15, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconGraduationCap = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconBriefcase = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconMapPin = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconShieldCheck = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconCamera = ({ size = 12, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconEye = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconCompass = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const IconAlertTriangle = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconSearch = ({ size = 28, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function PropertyCardMedia({ property, favorites, toggleFavorite }) {
  const rawImages = Array.isArray(property.images) ? property.images : [];
  const images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url : img))
    .filter(Boolean);

  const [activeIdx, setActiveIdx] = useState(0);

  // Keep changing images automatically showing the next picture
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

  const isFav = favorites.includes(property._id);

  return (
    <div className="card-media-box">
      {images.length > 0 ? (
        <div className="card-carousel-track">
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${property.title} - photo ${idx + 1}`}
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

      {/* Availability Badge */}
      <div
        className={`card-avail-badge ${
          property.availableUnits > 0 ? "avail-green" : "avail-red"
        }`}
      >
        <span className="live-dot" />
        <span>
          {property.availableUnits > 0
            ? "Available"
            : "Fully Occupied"}
        </span>
      </div>

      {/* Property Type Badge */}
      <div className="card-type-badge">
        {property.propertyType || "Rental"}
      </div>

      {/* Photo Count & Live Index Tag */}
      {images.length > 1 && (
        <div className="card-photo-count">
          <IconCamera size={12} />
          <span>{activeIdx + 1} / {images.length}</span>
        </div>
      )}

      {/* Wishlist Favorite Heart Button */}
      <button
        type="button"
        className={`card-fav-btn ${isFav ? "is-favorite" : ""}`}
        onClick={(e) => toggleFavorite(property._id, e)}
        title="Save to favorites"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill={isFav ? "#E31B1B" : "none"} stroke={isFav ? "#E31B1B" : "#1e293b"} strokeWidth="2.2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
  );
}

export default function Listings() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();

  // Modals & Popups
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState("");
  const [modalService, setModalService] = useState("rental");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Data states
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  // Sorting & Quick Category
  const [sortBy, setSortBy] = useState("recommended");
  const [quickCategory, setQuickCategory] = useState("all");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: "",
    bathrooms: "",
    furnished: "",
    propertyType: "",
    amenities: "",
    petFriendly: "",
    availableFrom: "",
  });

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Favorites & Saved Searches
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // University Hostels state
  const [showUniversityHostels, setShowUniversityHostels] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universitySearch, setUniversitySearch] = useState("");
  const [universityProperties, setUniversityProperties] = useState([]);
  const [universityLoading, setUniversityLoading] = useState(false);

  // Agent Listings state
  const [showAgentListings, setShowAgentListings] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_BASE}/properties`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        const processedProperties = data.map((prop) => ({
          ...prop,
          availableUnits: Math.max(0, (prop.totalUnits || 1) - (prop.bookedUnits || 0)),
        }));
        setProperties(processedProperties);
        setFilteredProperties(processedProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();

    const savedFavorites = localStorage.getItem("axxspace_favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const savedSearchesData = localStorage.getItem("axxspace_saved_searches");
    if (savedSearchesData) setSavedSearches(JSON.parse(savedSearchesData));
  }, []);

  // Handle URL property query parameter to highlight specific property
  useEffect(() => {
    const propertyId = searchParams.get("property");
    if (propertyId && properties.length > 0) {
      const property = properties.find((p) => p._id === propertyId);
      if (property) {
        setSelectedProperty(property);
        setCurrentImageIndex(0);
        setTimeout(() => {
          const propertyCard = document.querySelector(`[data-property-id="${propertyId}"]`);
          if (propertyCard) {
            propertyCard.scrollIntoView({ behavior: "smooth", block: "center" });
            propertyCard.style.boxShadow = "0 0 25px rgba(227, 27, 27, 0.6)";
            propertyCard.style.transform = "scale(1.02)";
            setTimeout(() => {
              propertyCard.style.boxShadow = "";
              propertyCard.style.transform = "";
            }, 2500);
          }
        }, 150);
      }
    }
  }, [searchParams, properties]);

  // Main Filtering & Sorting Engine
  useEffect(() => {
    let filtered = [...properties];

    // Location / County
    if (filters.location) {
      const q = filters.location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.location || "").toLowerCase().includes(q) ||
          (p.county || "").toLowerCase().includes(q) ||
          (p.title || "").toLowerCase().includes(q)
      );
    }

    // Quick category or Property type
    const activeType = filters.propertyType || (quickCategory !== "all" && quickCategory !== "favorites" && quickCategory !== "furnished" && quickCategory !== "pet" && quickCategory !== "budget" ? quickCategory : "");
    if (activeType) {
      filtered = filtered.filter(
        (p) => (p.propertyType || "").toLowerCase() === activeType.toLowerCase()
      );
    }

    if (quickCategory === "furnished") {
      filtered = filtered.filter((p) => p.furnished === true);
    } else if (quickCategory === "pet") {
      filtered = filtered.filter((p) => p.petFriendly === true);
    } else if (quickCategory === "budget") {
      filtered = filtered.filter((p) => p.price <= 25000);
    } else if (quickCategory === "favorites") {
      filtered = filtered.filter((p) => favorites.includes(p._id));
    }

    // Bedrooms
    if (filters.bedrooms) {
      if (filters.bedrooms === "4+") {
        filtered = filtered.filter((p) => (p.bedrooms || 0) >= 4);
      } else {
        filtered = filtered.filter((p) => p.bedrooms === parseInt(filters.bedrooms));
      }
    }

    // Bathrooms
    if (filters.bathrooms) {
      if (filters.bathrooms === "3+") {
        filtered = filtered.filter((p) => (p.bathrooms || 0) >= 3);
      } else {
        filtered = filtered.filter((p) => p.bathrooms === parseInt(filters.bathrooms));
      }
    }

    // Furnished
    if (filters.furnished !== "") {
      filtered = filtered.filter((p) => p.furnished === (filters.furnished === "true"));
    }

    // Pet friendly
    if (filters.petFriendly !== "") {
      filtered = filtered.filter((p) => p.petFriendly === (filters.petFriendly === "true"));
    }

    // Amenities
    if (filters.amenities) {
      const am = filters.amenities.toLowerCase();
      filtered = filtered.filter((p) =>
        p.amenities?.some((a) => a.toLowerCase().includes(am))
      );
    }

    // Available from
    if (filters.availableFrom) {
      filtered = filtered.filter((p) => {
        if (!p.availableFrom) return true;
        return new Date(p.availableFrom) <= new Date(filters.availableFrom);
      });
    }

    // Price range
    filtered = filtered.filter(
      (p) => (p.price || 0) >= filters.minPrice && (p.price || 0) <= filters.maxPrice
    );

    // Favorites only toggle
    if (showFavoritesOnly) {
      filtered = filtered.filter((p) => favorites.includes(p._id));
    }

    // Sorting
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "bedrooms-desc") {
      filtered.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredProperties(filtered);
  }, [filters, properties, favorites, showFavoritesOnly, quickCategory, sortBy]);

  // University Hostels logic
  useEffect(() => {
    if (!showUniversityHostels || !selectedUniversity?.id) {
      setUniversityProperties([]);
      return;
    }

    const fetchUniversityProperties = async () => {
      setUniversityLoading(true);
      try {
        const params = new URLSearchParams({
          universityId: String(selectedUniversity.id),
          available: "true",
          limit: "200",
        });
        const response = await fetch(`${API_BASE}/properties?${params}`);
        if (!response.ok) throw new Error("Failed to fetch university listings");
        const data = await response.json();
        const processed = data.map((prop) => ({
          ...prop,
          availableUnits: Math.max(0, (prop.totalUnits || 1) - (prop.bookedUnits || 0)),
        }));
        setUniversityProperties(processed.filter((p) => p.availableUnits > 0));
      } catch (err) {
        setError(err.message);
        setUniversityProperties([]);
      } finally {
        setUniversityLoading(false);
      }
    };

    fetchUniversityProperties();
  }, [showUniversityHostels, selectedUniversity]);

  // Agent Listings logic
  useEffect(() => {
    if (!showAgentListings) return;

    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/agents/verified`);
        if (!response.ok) throw new Error("Failed to fetch agents");
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
        setAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, [showAgentListings]);

  useEffect(() => {
    if (!showAgentListings || !selectedAgent) return;

    const agentProperties = properties.filter((p) => {
      if (!p.assignedAgent) return false;
      const agentId =
        typeof p.assignedAgent === "object" ? p.assignedAgent._id : p.assignedAgent;
      return agentId === selectedAgent._id;
    });
    setFilteredProperties(agentProperties);
  }, [showAgentListings, selectedAgent, properties]);

  const displayProperties =
    showUniversityHostels && selectedUniversity ? universityProperties : filteredProperties;

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyType) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.furnished !== "") count++;
    if (filters.petFriendly !== "") count++;
    if (filters.amenities) count++;
    if (filters.availableFrom) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 1000000) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "minPrice" || name === "maxPrice"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const resetAllFilters = () => {
    setFilters({
      location: "",
      minPrice: 0,
      maxPrice: 1000000,
      bedrooms: "",
      bathrooms: "",
      furnished: "",
      propertyType: "",
      amenities: "",
      petFriendly: "",
      availableFrom: "",
    });
    setQuickCategory("all");
    setShowFavoritesOnly(false);
  };

  const openModal = async (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    try {
      await fetch(`${API_BASE}/properties/${property._id}/view`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to record view:", err);
    }
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length
      );
    }
  };

  const handleContactLandlord = (property, e) => {
    if (e) e.stopPropagation();
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" located in ${property.county || ""} ${property.location || ""}. Is it currently available for viewing?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleBookNow = (property) => {
    if (!user) {
      alert("Please log in to book this property");
      return;
    }
    setPaymentAmount(property.price?.toString() || "");
    setPaymentPhone(user.phone || "");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      const response = await fetch(`${API_BASE}/payment/book-property`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          phone: paymentPhone,
          amount: paymentAmount,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentSuccess("M-Pesa STK prompt sent! Please enter your PIN on your phone to complete.");
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess("");
        }, 3500);
      } else {
        setPaymentError(data.error || "Payment prompt could not be sent. Please retry.");
      }
    } catch (err) {
      setPaymentError("Payment failed. Please check network connection and try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendSMS = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const message = `Hello, I am inquiring about booking this rental:
${property.title}
Location: ${property.county || ""} - ${property.location || ""}
Rent: KES ${property.price?.toLocaleString()}/month
Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}
Status: ${property.availableUnits > 0 ? "Available" : "Fully Occupied"}

Please contact me back with viewing details. Thank you!`;
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleFavorite = (propertyId, e) => {
    if (e) e.stopPropagation();
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];
    setFavorites(newFavorites);
    localStorage.setItem("axxspace_favorites", JSON.stringify(newFavorites));
  };

  const saveCurrentSearch = () => {
    const hasActiveFilters = Object.values(filters).some(
      (v) => v !== "" && v !== 0 && v !== 1000000
    );
    if (!hasActiveFilters) {
      alert("Please adjust some filters (e.g. location, budget, bedrooms) before saving.");
      return;
    }
    const searchName = prompt("Give this search a name (e.g., 'Westlands 2 Bedroom Apartments'):");
    if (!searchName) return;
    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem("axxspace_saved_searches", JSON.stringify(updatedSearches));
    alert("Search preference saved! Access it anytime from the Saved menu.");
  };

  const applySavedSearch = (search) => {
    setFilters(search.filters);
    setShowSavedSearches(false);
  };

  const deleteSavedSearch = (searchId) => {
    const updatedSearches = savedSearches.filter((s) => s.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem("axxspace_saved_searches", JSON.stringify(updatedSearches));
  };

  const leaseLabel = { monthly: "Monthly", "6months": "6 Months", yearly: "Yearly" };

  if (loading) {
    return (
      <div className="ax-listings-root">
        <style>{css}</style>
        <div className="loading-container">
          <div className="loading-pulsar">
            <div className="loading-inner-core" />
          </div>
          <h3 className="loading-title">Curating Kenya's Finest Rentals</h3>
          <p className="loading-sub">Connecting directly with verified landlords and property managers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ax-listings-root">
      <style>{css}</style>

      {/* ═════════════════════════════════════════════════════════════
          1. ULTRA LUXURY HERO SECTION WITH AMBIENT GRADIENT MESH
      ═════════════════════════════════════════════════════════════ */}
      <section className="listings-hero">
        {/* Ambient atmospheric glows */}
        <div className="ambient-orb orb-crimson" />
        <div className="ambient-orb orb-amber" />
        <div className="ambient-orb orb-navy" />
        <div className="hero-grid-pattern" />

        <div className="hero-compact-header">
          <div className="hero-compact-left">
            <h1 className="hero-compact-title">AxxSpace Rentals</h1>
            <p className="hero-compact-sub">Verified residential rentals across all 47 counties</p>
          </div>

          <div className="hero-compact-actions">
            {!user ? (
              <a href="/register" className="hero-compact-btn-primary">
                <span>List Property</span>
                <span className="btn-arrow">→</span>
              </a>
            ) : user.role === "landlord" ? (
              <a href="/dashboard" className="hero-compact-btn-primary">
                <span>Landlord Portal</span>
                <span className="btn-arrow">→</span>
              </a>
            ) : null}

            <button
              type="button"
              className="hero-compact-btn-secondary"
              onClick={() => {
                setModalQuery(filters.location || "");
                setModalService("rental");
                setIsRequestModalOpen(true);
              }}
            >
              <span>Request Rental</span>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            2. FLOATING REAL ESTATE SEARCH & FILTER CONSOLE
        ═════════════════════════════════════════════════════════════ */}
        <div className="search-console-wrapper">
          <div className="search-console-card">
            {/* Primary Search Inputs Row */}
            <div className="search-inputs-grid">
              {/* Location Input */}
              <div className="search-segment">
                <label className="segment-label">WHERE IN KENYA?</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    name="location"
                    placeholder="Search Nairobi, Juja, Westlands, Kisumu…"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="segment-text-input"
                  />
                  {filters.location && (
                    <button
                      type="button"
                      className="segment-clear-btn"
                      onClick={() => setFilters((prev) => ({ ...prev, location: "" }))}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="search-segment">
                <label className="segment-label">PROPERTY TYPE</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <select
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleFilterChange}
                    className="segment-select-input"
                  >
                    <option value="">All Property Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="bedsitter">Bedsitter</option>
                    <option value="maisonette">Maisonette</option>
                    <option value="studio">Studio</option>
                    <option value="house">Single House / Bungalow</option>
                    <option value="hostel">Student Hostel</option>
                    <option value="commercial">Commercial Unit</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms Dropdown */}
              <div className="search-segment">
                <label className="segment-label">BEDROOMS</label>
                <div className="segment-input-wrap">
                  <svg className="segment-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                  </svg>
                  <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                    className="segment-select-input"
                  >
                    <option value="">Any Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4+">4+ Bedrooms</option>
                  </select>
                </div>
              </div>

              {/* Max Budget Dropdown */}
              <div className="search-segment">
                <label className="segment-label">MAX MONTHLY RENT</label>
                <div className="segment-input-wrap">
                  <span className="currency-prefix">KES</span>
                  <select
                    name="maxPrice"
                    value={filters.maxPrice >= 1000000 ? "" : filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : 1000000,
                      }))
                    }
                    className="segment-select-input"
                  >
                    <option value="">Any Budget</option>
                    <option value="10000">Up to KES 10,000</option>
                    <option value="20000">Up to KES 20,000</option>
                    <option value="35000">Up to KES 35,000</option>
                    <option value="50000">Up to KES 50,000</option>
                    <option value="80000">Up to KES 80,000</option>
                    <option value="150000">Up to KES 150,000</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: More Filters & Reset */}
              <div className="search-actions-segment">
                <button
                  type="button"
                  className={`more-filters-trigger ${filtersOpen ? "active" : ""}`}
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  <span>{filtersOpen ? "Hide Filters" : "Filters"}</span>
                  {activeFiltersCount > 0 && <span className="active-filter-badge">{activeFiltersCount}</span>}
                </button>

                {activeFiltersCount > 0 && (
                  <button type="button" className="reset-filters-btn" onClick={resetAllFilters} title="Reset all filters">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Quick Category Chips Strip */}
            <div className="quick-category-strip">
              <span className="quick-cat-label">Explore:</span>
              <div className="quick-cat-scroll">
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "all" ? "active" : ""}`}
                  onClick={() => { setQuickCategory("all"); setFilters((p) => ({ ...p, propertyType: "" })); }}
                >
                  <IconBuilding size={14} />
                  <span>All Rentals</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "apartment" ? "active" : ""}`}
                  onClick={() => { setQuickCategory("apartment"); setFilters((p) => ({ ...p, propertyType: "apartment" })); }}
                >
                  <IconApartment size={14} />
                  <span>Apartments</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "bedsitter" ? "active" : ""}`}
                  onClick={() => { setQuickCategory("bedsitter"); setFilters((p) => ({ ...p, propertyType: "bedsitter" })); }}
                >
                  <IconBed size={14} />
                  <span>Bedsitters</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "maisonette" ? "active" : ""}`}
                  onClick={() => { setQuickCategory("maisonette"); setFilters((p) => ({ ...p, propertyType: "maisonette" })); }}
                >
                  <IconHome size={14} />
                  <span>Maisonettes</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "furnished" ? "active" : ""}`}
                  onClick={() => setQuickCategory(quickCategory === "furnished" ? "all" : "furnished")}
                >
                  <IconSparkles size={14} />
                  <span>Furnished</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "pet" ? "active" : ""}`}
                  onClick={() => setQuickCategory(quickCategory === "pet" ? "all" : "pet")}
                >
                  <IconPaw size={14} />
                  <span>Pet Friendly</span>
                </button>
                <button
                  type="button"
                  className={`quick-chip ${quickCategory === "budget" ? "active" : ""}`}
                  onClick={() => setQuickCategory(quickCategory === "budget" ? "all" : "budget")}
                >
                  <IconTag size={14} />
                  <span>Under KES 25K</span>
                </button>
                {favorites.length > 0 && (
                  <button
                    type="button"
                    className={`quick-chip ${quickCategory === "favorites" ? "active" : ""}`}
                    onClick={() => setQuickCategory(quickCategory === "favorites" ? "all" : "favorites")}
                  >
                    <IconHeart size={14} />
                    <span>Saved ({favorites.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Advanced Filter Drawer */}
            {filtersOpen && (
              <div className="advanced-filter-drawer">
                <div className="drawer-header">
                  <h4 className="drawer-title">Detailed Search Parameters</h4>
                  <button type="button" className="drawer-close-text" onClick={() => setFiltersOpen(false)}>
                    Close ✕
                  </button>
                </div>

                <div className="drawer-grid">
                  {/* Bathrooms */}
                  <div className="drawer-group">
                    <label className="drawer-label">Bathrooms</label>
                    <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} className="drawer-select">
                      <option value="">Any Bathrooms</option>
                      <option value="1">1 Bathroom</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3+">3+ Bathrooms</option>
                    </select>
                  </div>

                  {/* Furnished Status */}
                  <div className="drawer-group">
                    <label className="drawer-label">Furnished Status</label>
                    <select name="furnished" value={filters.furnished} onChange={handleFilterChange} className="drawer-select">
                      <option value="">Either Furnished or Unfurnished</option>
                      <option value="true">Fully Furnished</option>
                      <option value="false">Unfurnished</option>
                    </select>
                  </div>

                  {/* Pet Policy */}
                  <div className="drawer-group">
                    <label className="drawer-label">Pet Policy</label>
                    <select name="petFriendly" value={filters.petFriendly} onChange={handleFilterChange} className="drawer-select">
                      <option value="">Any Pet Policy</option>
                      <option value="true">Pet Friendly Allowed</option>
                      <option value="false">No Pets</option>
                    </select>
                  </div>

                  {/* Amenities Keyword */}
                  <div className="drawer-group">
                    <label className="drawer-label">Key Amenities (WiFi, Parking, Borehole…)</label>
                    <input
                      type="text"
                      name="amenities"
                      placeholder="e.g. WiFi, Parking, CCTV, Balcony, Security"
                      value={filters.amenities}
                      onChange={handleFilterChange}
                      className="drawer-input"
                    />
                  </div>

                  {/* Min Price */}
                  <div className="drawer-group">
                    <label className="drawer-label">Min Price (KES)</label>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="0"
                      value={filters.minPrice || ""}
                      onChange={handleFilterChange}
                      className="drawer-input"
                    />
                  </div>

                  {/* Max Price */}
                  <div className="drawer-group">
                    <label className="drawer-label">Max Price (KES)</label>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="1,000,000"
                      value={filters.maxPrice >= 1000000 ? "" : filters.maxPrice}
                      onChange={handleFilterChange}
                      className="drawer-input"
                    />
                  </div>

                  {/* Available From Date */}
                  <div className="drawer-group">
                    <label className="drawer-label">Available Move-in Date</label>
                    <input
                      type="date"
                      name="availableFrom"
                      value={filters.availableFrom}
                      onChange={handleFilterChange}
                      className="drawer-input"
                    />
                  </div>
                </div>

                {/* Popular Amenity Tags Shortcuts */}
                <div className="popular-amenities-shortcuts">
                  <span className="shortcuts-label">Quick Amenity Filters:</span>
                  {["WiFi", "Borehole Water", "Parking", "24/7 Security", "CCTV", "Balcony", "Gym", "Backup Generator"].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`amenity-shortcut-pill ${filters.amenities?.toLowerCase().includes(amenity.toLowerCase()) ? "active" : ""}`}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          amenities: prev.amenities === amenity ? "" : amenity,
                        }))
                      }
                    >
                      {filters.amenities?.toLowerCase().includes(amenity.toLowerCase()) ? "✓ " : "+ "}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          3. MAIN CONTENT BODY & DISCOVERY WORKSPACE
      ═════════════════════════════════════════════════════════════ */}
      <main className="listings-main-canvas">
        {error && (
          <div className="error-alert-banner">
            <IconAlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── HIGH LEVEL NAVIGATION TABS ── */}
        <div className="segmented-discovery-nav">
          <div className="discovery-tabs-cluster">
            <button
              type="button"
              className={`discovery-tab ${!showUniversityHostels && !showAgentListings ? "active" : ""}`}
              onClick={() => {
                setShowUniversityHostels(false);
                setShowAgentListings(false);
              }}
            >
              <span className="tab-icon"><IconHome size={16} /></span>
              <span className="tab-text">All Residential Rentals</span>
              <span className="tab-counter">{properties.length}</span>
            </button>

            <button
              type="button"
              className={`discovery-tab ${showUniversityHostels ? "active" : ""}`}
              onClick={() => {
                setShowUniversityHostels(true);
                setShowAgentListings(false);
              }}
            >
              <span className="tab-icon"><IconGraduationCap size={16} /></span>
              <span className="tab-text">University Hostels</span>
              <span className="tab-badge-new">Student Hub</span>
            </button>

            <button
              type="button"
              className={`discovery-tab ${showAgentListings ? "active" : ""}`}
              onClick={() => {
                setShowUniversityHostels(false);
                setShowAgentListings(true);
              }}
            >
              <span className="tab-icon"><IconBriefcase size={16} /></span>
              <span className="tab-text">Verified Agents</span>
              <span className="tab-badge-verified">Certified</span>
            </button>
          </div>
        </div>

        {/* ── TOOLBAR: RESULTS COUNT, SORTING, MAP VIEW & SAVED (Standard Mode) ── */}
        {!showUniversityHostels && !showAgentListings && (
          <div className="listings-toolbar">
            <div className="toolbar-left">
              <h2 className="results-headline">
                <span className="results-bold-num">{displayProperties.length}</span>
                <span>{displayProperties.length === 1 ? " Verified Home Found" : " Verified Homes Found"}</span>
                {filters.location && <span className="results-location-tag">in "{filters.location}"</span>}
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
                  <option value="bedrooms-desc">Bedrooms: Most to Least</option>
                  <option value="newest">Recently Added</option>
                </select>
              </div>

              {/* Map View Toggle */}
              <button
                type="button"
                className={`toolbar-btn ${showMap ? "active" : ""}`}
                onClick={() => setShowMap((v) => !v)}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.2" fill="none">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                <span>{showMap ? "Hide Map" : "Map View"}</span>
              </button>

              {/* Save Search Button */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={saveCurrentSearch}
                title="Save current filters"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.2" fill="none">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Save Search</span>
              </button>

              {/* Saved Searches Drawer Toggle */}
              {savedSearches.length > 0 && (
                <button
                  type="button"
                  className={`toolbar-btn ${showSavedSearches ? "active" : ""}`}
                  onClick={() => setShowSavedSearches(!showSavedSearches)}
                >
                  <span>Saved ({savedSearches.length})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Saved Searches Panel */}
        {!showUniversityHostels && !showAgentListings && showSavedSearches && savedSearches.length > 0 && (
          <div className="saved-searches-box">
            <h3 className="saved-searches-title">Your Saved Search Alerts</h3>
            <div className="saved-searches-grid">
              {savedSearches.map((s) => (
                <div key={s.id} className="saved-search-item">
                  <div>
                    <h5 className="saved-item-name">{s.name}</h5>
                    <p className="saved-item-date">
                      Saved on {new Date(s.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="saved-item-actions">
                    <button type="button" className="saved-apply-btn" onClick={() => applySavedSearch(s)}>
                      Apply
                    </button>
                    <button type="button" className="saved-del-btn" onClick={() => deleteSavedSearch(s.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAP VIEW EMBED ── */}
        {!showUniversityHostels && !showAgentListings && showMap && (
          <div className="map-view-shell">
            <div className="map-view-header">
              <span className="map-pin-icon"><IconMapPin size={16} /></span>
              <span>Interactive GPS Map View ({filteredProperties.length} Properties Located)</span>
            </div>
            <MapView properties={filteredProperties} />
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            4. UNIVERSITY HOSTELS TAB SECTION
        ═════════════════════════════════════════════════════════════ */}
        {showUniversityHostels && (
          <div className="university-hub-container">
            {!selectedUniversity && (
              <>
                <div className="hub-hero-header">
                  <div className="hub-badge">CAMPUS HOUSING HUB</div>
                  <h2 className="hub-title">Find Hostels Walking Distance to Campus</h2>
                  <p className="hub-subtitle">
                    Select your university or college across Kenya to view vetted bedsitters, single rooms, sharing hostels, and private apartments with zero agent fees.
                  </p>

                  <div className="university-search-control">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#E31B1B" strokeWidth="2.2" fill="none">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Type university name (e.g. UON, Kenyatta University, JKUAT, Strathmore, Moi, Egerton)…"
                      value={universitySearch}
                      onChange={(e) => setUniversitySearch(e.target.value)}
                      className="university-search-input"
                    />
                    {universitySearch && (
                      <button type="button" className="clear-uni-btn" onClick={() => setUniversitySearch("")}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="university-cards-grid">
                  {(universitySearch ? searchUniversities(universitySearch) : kenyanUniversities).map((university) => (
                    <div
                      key={university.id}
                      className="university-card"
                      onClick={() => setSelectedUniversity(university)}
                    >
                      <div className="uni-card-header">
                        <span className="uni-code-badge">{university.code}</span>
                        <span className="uni-county-tag">{university.county} County</span>
                      </div>
                      <h4 className="uni-name">{university.name}</h4>
                      <p className="uni-location">
                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{university.location} ({university.campus})</span>
                      </p>
                      <div className="uni-card-footer">
                        <span className="uni-cta-text">View Campus Hostels →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* When a university is actively selected */}
            {selectedUniversity && (
              <div className="selected-campus-banner">
                <div className="selected-campus-left">
                  <span className="campus-indicator-badge">ACTIVE CAMPUS FILTER</span>
                  <h3 className="selected-campus-name">{selectedUniversity.name}</h3>
                  <p className="selected-campus-meta">
                    <IconMapPin size={13} /> {selectedUniversity.location}, {selectedUniversity.county} County · Code: {selectedUniversity.code}
                  </p>
                </div>
                <button
                  type="button"
                  className="change-campus-btn"
                  onClick={() => {
                    setSelectedUniversity(null);
                    setUniversityProperties([]);
                  }}
                >
                  ← Select Another University
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            5. VERIFIED AGENT DIRECTORY TAB SECTION
        ═════════════════════════════════════════════════════════════ */}
        {showAgentListings && (
          <div className="agent-directory-container">
            {!selectedAgent && (
              <>
                <div className="hub-hero-header">
                  <div className="hub-badge">CERTIFIED AGENTS</div>
                  <h2 className="hub-title">Connect with Verified Property Agents</h2>
                  <p className="hub-subtitle">
                    Explore profiles of AxxSpace-verified agents managing prime rental houses, apartments, and estates across all 47 counties.
                  </p>
                </div>

                {agentsLoading ? (
                  <div className="loading-state-block">
                    <div className="loading-pulsar" />
                    <p>Loading verified rental agents…</p>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="empty-results-box">
                    <p>No verified agents found at this time.</p>
                  </div>
                ) : (
                  <div className="agent-cards-grid">
                    {agents.map((agent) => (
                      <div
                        key={agent._id}
                        className="agent-card"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="agent-avatar-wrap">
                          {agent.profileImage ? (
                            <img src={agent.profileImage} alt={agent.name} className="agent-avatar-img" />
                          ) : (
                            <div className="agent-avatar-initial">{agent.name?.charAt(0).toUpperCase()}</div>
                          )}
                          <span className="agent-verified-shield" title="Verified Agent">✓</span>
                        </div>

                        <h4 className="agent-name">{agent.name}</h4>
                        <div className="agent-county-pill">
                          <IconMapPin size={12} />
                          <span>{agent.agentProfile?.county || agent.county || "Kenya"}</span>
                        </div>

                        <p className="agent-bio">
                          {agent.agentProfile?.bio || "Certified AxxSpace real estate agent specialized in residential rentals and property management."}
                        </p>

                        <div className="agent-locations-list">
                          <span className="agent-locations-label">Active Listing Areas:</span>
                          <span className="agent-locations-val">
                            {agent.listingLocations && agent.listingLocations.length > 0
                              ? agent.listingLocations.slice(0, 3).join(", ")
                              : "Nairobi & neighboring counties"}
                          </span>
                        </div>

                        {agent.agentProfile?.offersHouseHunting !== false && Number(agent.agentProfile?.houseHuntingFee || 0) > 0 && (
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#059669",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            marginTop: "6px",
                            marginBottom: "10px",
                            width: "fit-content"
                          }}>
                            <span>House Hunting: KES {Number(agent.agentProfile.houseHuntingFee).toLocaleString()}</span>
                            <span style={{ fontSize: "10px", opacity: 0.85, fontWeight: 500 }}>
                              ({agent.agentProfile.houseHuntingFeeTerms || "Per viewing trip"})
                            </span>
                          </div>
                        )}

                        <button type="button" className="agent-view-listings-cta">
                          View Available Listings →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* When an agent is selected */}
            {selectedAgent && (
              <div className="selected-campus-banner">
                <div className="selected-campus-left">
                  <span className="campus-indicator-badge">AGENT LISTINGS</span>
                  <h3 className="selected-campus-name">Properties by {selectedAgent.name}</h3>
                  <p className="selected-campus-meta">
                    <IconMapPin size={13} /> {selectedAgent.agentProfile?.county || "Kenya"} · Phone: {selectedAgent.agentProfile?.phone || selectedAgent.phone}
                  </p>
                </div>
                <button
                  type="button"
                  className="change-campus-btn"
                  onClick={() => {
                    setSelectedAgent(null);
                    setFilteredProperties(properties);
                  }}
                >
                  ← Back to All Agents
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            6. EMPTY STATES & LOADING INDICATORS
        ═════════════════════════════════════════════════════════════ */}
        {showUniversityHostels && selectedUniversity && universityLoading && (
          <div className="loading-state-block">
            <div className="loading-pulsar" />
            <p>Loading available hostels near {selectedUniversity.name}…</p>
          </div>
        )}

        {showUniversityHostels && selectedUniversity && !universityLoading && displayProperties.length === 0 && (
          <div className="empty-results-box">
            <div className="empty-icon-wrap"><IconGraduationCap size={44} /></div>
            <h3 className="empty-title">No Hostels Currently Listed Near {selectedUniversity.name}</h3>
            <p className="empty-desc">
              Landlords near {selectedUniversity.location} are actively uploading new units. Check back shortly or submit a custom housing request.
            </p>
            <button
              type="button"
              className="empty-cta-btn"
              onClick={() => {
                setModalQuery(`${selectedUniversity.name} hostel`);
                setModalService("rental");
                setIsRequestModalOpen(true);
              }}
            >
              Request A Hostel Near This Campus
            </button>
          </div>
        )}

        {!showUniversityHostels && displayProperties.length === 0 && (
          <div className="empty-results-box">
            <div className="empty-icon-wrap"><IconSearch size={44} /></div>
            <h3 className="empty-title">No Rentals Match Your Specific Search Criteria</h3>
            <p className="empty-desc">
              Try broadening your budget range, resetting bedroom filters, or submitting a custom housing request to have landlords contact you directly.
            </p>
            <div className="empty-actions-row">
              <button type="button" className="empty-reset-btn" onClick={resetAllFilters}>
                Clear All Filters
              </button>
              <button
                type="button"
                className="empty-cta-btn"
                onClick={() => {
                  setModalQuery(filters.location || "");
                  setModalService("rental");
                  setIsRequestModalOpen(true);
                }}
              >
                Submit Custom Rental Request
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            7. WORLD-CLASS PROPERTY CARDS GRID
        ═════════════════════════════════════════════════════════════ */}
        {(!showUniversityHostels || selectedUniversity) && displayProperties.length > 0 && (
          <div className="properties-modern-grid">
            {displayProperties.map((property, idx) => (
              <article
                key={property._id}
                data-property-id={property._id}
                className="property-card"
                onClick={() => openModal(property)}
              >
                {/* Media Presentation Box with Auto-changing image carousel */}
                <PropertyCardMedia
                  property={property}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />

                {/* Card Content & Details */}
                <div className="card-content-box">
                  {/* Location Row */}
                  <div className="card-location-row">
                    <svg className="location-pin-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#E31B1B" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="location-text">
                      {property.county ? `${property.county} · ` : ""}{property.location}
                    </span>
                  </div>

                  {/* Property Title */}
                  <h3 className="card-property-title">{property.title}</h3>

                  {/* Specifications Icons Bar */}
                  <div className="card-specs-bar">
                    <div className="spec-item" title="Bedrooms">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                      </svg>
                      <span>{property.bedrooms || 1} Bed{property.bedrooms > 1 ? "s" : ""}</span>
                    </div>

                    <span className="spec-separator">|</span>

                    <div className="spec-item" title="Bathrooms">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6h6M7 10h10M4 14h16a2 2 0 0 1 2 2v2H2v-2a2 2 0 0 1 2-2z" />
                      </svg>
                      <span>{property.bathrooms || 1} Bath{property.bathrooms > 1 ? "s" : ""}</span>
                    </div>

                    <span className="spec-separator">|</span>

                    <div className="spec-item" title="Furnishing">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                    </div>
                  </div>

                  {/* Amenities Preview Chips */}
                  {property.amenities?.length > 0 && (
                    <div className="card-amenities-wrap">
                      {property.amenities.slice(0, 3).map((amenity, amIdx) => (
                        <span key={amIdx} className="amenity-chip-tag">
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="amenity-more-tag">+{property.amenities.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Landlord Verified Line */}
                  <div className="card-landlord-verify-line">
                    <IconShieldCheck size={14} className="verify-shield" />
                    <span className="verify-text">
                      {property.assignedAgent ? "Managed by Verified Agent" : "Direct Landlord Listing"}
                    </span>
                  </div>

                  {/* Card Bottom: Pricing & Fast Contact */}
                  <div className="card-bottom-bar">
                    <div className="card-price-stack">
                      <div className="card-rent-amount">
                        KES {property.price?.toLocaleString()}
                      </div>
                      <div className="card-rent-period">
                        per month {property.deposit ? `· KES ${property.deposit.toLocaleString()} dep` : ""}
                      </div>
                    </div>

                    <div className="card-cta-group" onClick={(e) => e.stopPropagation()}>
                      {/* WhatsApp Direct Connect */}
                      <button
                        type="button"
                        className="quick-whatsapp-cta"
                        onClick={(e) => handleContactLandlord(property, e)}
                        title="Chat on WhatsApp with owner"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </button>

                      {/* View Details Button */}
                      <button
                        type="button"
                        className="view-details-cta"
                        onClick={() => openModal(property)}
                      >
                        <span>Details</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ═════════════════════════════════════════════════════════════
          8. ULTRA LUXURY PROPERTY DETAIL MODAL
      ═════════════════════════════════════════════════════════════ */}
      {selectedProperty && (
        <div className="modal-overlay-backdrop backdrop-anim" onClick={closeModal}>
          <div className="property-detail-modal modal-anim" onClick={(e) => e.stopPropagation()}>
            {/* Modal Close Button */}
            <button type="button" className="modal-close-round" onClick={closeModal} title="Close window">
              ✕
            </button>

            {/* In-Modal M-Pesa Booking Modal */}
            {showPaymentModal && (
              <div className="mpesa-dialog-overlay">
                <div className="mpesa-dialog-box">
                  <div className="mpesa-badge-header">
                    <IconShieldCheck size={14} />
                    <span>LIPA NA M-PESA ONLINE</span>
                  </div>
                  <h3 className="mpesa-dialog-title">Secure Booking Deposit</h3>
                  <p className="mpesa-dialog-sub">
                    {selectedProperty.title} · KES {Number(paymentAmount).toLocaleString()}
                  </p>

                  {paymentSuccess && <div className="mpesa-success-box">{paymentSuccess}</div>}
                  {paymentError && <div className="mpesa-error-box">{paymentError}</div>}

                  {!paymentSuccess && (
                    <form onSubmit={handlePaymentSubmit} className="mpesa-form-body">
                      <div className="mpesa-form-group">
                        <label className="mpesa-form-label">M-Pesa Safaricom Phone Number</label>
                        <PhoneInput
                          value={paymentPhone}
                          onChange={(v) => setPaymentPhone(v)}
                          required
                        />
                      </div>

                      <div className="mpesa-form-group">
                        <label className="mpesa-form-label">Amount (KES)</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="mpesa-form-input"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="mpesa-submit-btn"
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? "Sending STK Prompt…" : "Send M-Pesa Prompt"}
                      </button>

                      <button
                        type="button"
                        className="mpesa-cancel-btn"
                        onClick={() => setShowPaymentModal(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Gallery Section */}
            <div className="modal-gallery-shell">
              {selectedProperty.images?.length > 0 ? (
                <>
                  <img
                    src={selectedProperty.images[currentImageIndex]}
                    alt={selectedProperty.title}
                    className="modal-featured-image"
                  />

                  {selectedProperty.images.length > 1 && (
                    <>
                      <button type="button" className="gallery-nav-btn nav-prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button type="button" className="gallery-nav-btn nav-next" onClick={nextImage}>
                        ›
                      </button>
                      <div className="gallery-counter-pill">
                        {currentImageIndex + 1} / {selectedProperty.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="modal-no-image-placeholder">No Photos Provided</div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {selectedProperty.images?.length > 1 && (
              <div className="modal-thumbnails-strip">
                {selectedProperty.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className={`modal-thumb-img ${idx === currentImageIndex ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}

            {/* Modal Body & Specifications */}
            <div className="modal-body-content">
              {/* Top Meta Info */}
              <div className="modal-headline-block">
                <div>
                  <div className="modal-category-tag">{selectedProperty.propertyType || "Rental"}</div>
                  <h2 className="modal-main-title">{selectedProperty.title}</h2>
                  <div className="modal-location-tags">
                    <span className="location-pin-chip">
                      <IconMapPin size={13} /> {selectedProperty.county} · {selectedProperty.location}
                    </span>
                    <span className="views-counter-chip">
                      <IconEye size={13} /> {selectedProperty.views || 1} Views
                    </span>
                    {selectedProperty.lat && selectedProperty.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedProperty.lat},${selectedProperty.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="google-maps-link"
                      >
                        <IconCompass size={13} /> View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>

                <div className="modal-pricing-box">
                  <div className="modal-price-big">KES {selectedProperty.price?.toLocaleString()}</div>
                  <div className="modal-price-term">per month</div>
                </div>
              </div>

              {/* Specifications Pill Bar */}
              <div className="modal-specs-strip">
                <div className="spec-unit">
                  <span className="spec-val">{selectedProperty.bedrooms || 1}</span>
                  <span className="spec-name">Bedrooms</span>
                </div>
                <div className="spec-divider" />
                <div className="spec-unit">
                  <span className="spec-val">{selectedProperty.bathrooms || 1}</span>
                  <span className="spec-name">Bathrooms</span>
                </div>
                <div className="spec-divider" />
                <div className="spec-unit">
                  <span className="spec-val" style={{ color: selectedProperty.availableUnits > 0 ? "#10b981" : "#ef4444" }}>
                    {selectedProperty.availableUnits > 0 ? "Available" : "Occupied"}
                  </span>
                  <span className="spec-name">Status</span>
                </div>
                <div className="spec-divider" />
                <div className="spec-unit">
                  <span className="spec-val">{selectedProperty.furnished ? "Yes" : "No"}</span>
                  <span className="spec-name">Furnished</span>
                </div>
              </div>

              {/* Deposit and Lease info */}
              {(selectedProperty.deposit > 0 || selectedProperty.leaseType) && (
                <div className="modal-deposit-row">
                  {selectedProperty.deposit > 0 && (
                    <div className="deposit-info-pill">
                      <span className="deposit-lbl">Security Deposit:</span>
                      <span className="deposit-val">KES {selectedProperty.deposit?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedProperty.leaseType && (
                    <div className="deposit-info-pill">
                      <span className="deposit-lbl">Lease Term:</span>
                      <span className="deposit-val">
                        {leaseLabel[selectedProperty.leaseType] || selectedProperty.leaseType}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="modal-section-wrap">
                <h4 className="modal-section-title">Property Description</h4>
                <p className="modal-description-paragraph">
                  {selectedProperty.description || "No specific description added by the owner for this listing."}
                </p>
              </div>

              {/* Amenities Grid */}
              {selectedProperty.amenities?.length > 0 && (
                <div className="modal-section-wrap">
                  <h4 className="modal-section-title">Features & Amenities</h4>
                  <div className="modal-amenities-cloud">
                    {selectedProperty.amenities.map((item, idx) => (
                      <span key={idx} className="modal-amenity-pill">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* House Rules */}
              {selectedProperty.rules && (
                <div className="modal-rules-box">
                  <h4 className="modal-rules-title">House Policies & Guidelines</h4>
                  <p className="modal-rules-text">{selectedProperty.rules}</p>
                </div>
              )}

              {/* Landlord Contact & Direct Actions */}
              {selectedProperty.availableUnits > 0 ? (
                <div className="landlord-connect-card">
                  <div className="landlord-card-header">
                    <div>
                      <span className="landlord-role-tag">LISTING CONTACT</span>
                      <h4 className="landlord-person-name">
                        {selectedProperty.owner?.name || "Verified Landlord"}
                      </h4>
                      <p className="landlord-phone-num">
                        {selectedProperty.owner?.phone || selectedProperty.phone || "Direct Phone Listed"}
                      </p>
                    </div>

                    {selectedProperty.assignedAgent && (
                      <div className="assigned-agent-badge-box">
                        <span className="agent-badge-lbl">ASSIGNED AGENT</span>
                        <div className="agent-badge-name">{selectedProperty.assignedAgent?.name}</div>
                        <div className="agent-badge-phone">{selectedProperty.assignedAgent?.phone}</div>
                      </div>
                    )}
                  </div>

                  <div className="share-property-inline">
                    <ShareProperty property={selectedProperty} />
                  </div>

                  {/* 4 Direct Contact Buttons */}
                  <div className="modal-cta-buttons-grid">
                    <button
                      type="button"
                      className="cta-btn cta-whatsapp"
                      onClick={() => handleContactLandlord(selectedProperty)}
                    >
                      <span>WhatsApp Landlord</span>
                    </button>

                    <button
                      type="button"
                      className="cta-btn cta-call"
                      onClick={() =>
                        window.open(`tel:${selectedProperty.owner?.phone || selectedProperty.phone}`)
                      }
                    >
                      <span>Direct Phone Call</span>
                    </button>

                    <button
                      type="button"
                      className="cta-btn cta-sms"
                      onClick={() => handleSendSMS(selectedProperty)}
                    >
                      <span>Send SMS</span>
                    </button>

                    <button
                      type="button"
                      className="cta-btn cta-book"
                      onClick={() => handleBookNow(selectedProperty)}
                    >
                      <span>Book via M-Pesa</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modal-occupied-banner">
                  <h4>This Property is Currently Fully Occupied</h4>
                  <p>All units are rented out. You can bookmark it to receive availability updates.</p>
                </div>
              )}

              {/* In-Modal Direct Messaging */}
              {user && selectedProperty.availableUnits > 0 && (
                <div className="modal-section-wrap in-modal-chat">
                  <h4 className="modal-section-title">Send Direct Platform Message</h4>
                  <MessagingSystem
                    recipientId={selectedProperty.owner?._id || selectedProperty.owner?.id}
                    recipientName={selectedProperty.owner?.name || "Landlord"}
                    recipientType="landlord"
                    propertyId={selectedProperty._id}
                    propertyTitle={selectedProperty.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Item / Housing Request Modal */}
      <RequestItemModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialQuery={modalQuery}
        defaultService={modalService}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HIGH-END MODERN STYLING: AXXSPACE LUXURY REAL ESTATE
   Palette: Deep Midnight Executive (#08101D) · Signature Crimson (#E31B1B)
   Clean White Card Elevation · Emerald Live Indicators (#10B981)
══════════════════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .ax-listings-root {
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

  .ax-listings-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── 1. HERO ATMOSPHERE ── */
  .listings-hero {
    position: relative;
    background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
    color: #FFFFFF;
    padding: 24px 20px 40px;
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
    margin: 0 auto 16px;
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
    text-decoration: none;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
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

  /* ── 2. SEARCH CONSOLE ── */
  .search-console-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }
  .search-console-card {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8);
    color: var(--navy-ink);
  }

  .search-inputs-grid {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.3fr 1.4fr auto;
    gap: 12px;
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
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 10px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
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
  .currency-prefix {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--brand-red);
  }
  .segment-text-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--navy-ink);
    width: 100%;
  }
  .segment-text-input::placeholder {
    color: #94A3B8;
    font-weight: 400;
  }
  .segment-clear-btn {
    border: none;
    background: #E2E8F0;
    color: #64748B;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .segment-select-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--navy-ink);
    width: 100%;
    cursor: pointer;
  }

  .search-actions-segment {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .more-filters-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 58px;
    padding: 0 20px;
    border-radius: var(--radius-md);
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    color: var(--navy-ink);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }
  .more-filters-trigger:hover, .more-filters-trigger.active {
    background: var(--brand-red-light);
    border-color: var(--brand-red);
    color: var(--brand-red);
  }
  .active-filter-badge {
    background: var(--brand-red);
    color: #FFFFFF;
    font-size: 0.75rem;
    padding: 2px 7px;
    border-radius: 999px;
  }

  .reset-filters-btn {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #64748B;
    padding: 0 14px;
    height: 58px;
    border-radius: var(--radius-md);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .reset-filters-btn:hover {
    color: var(--brand-red);
    border-color: var(--brand-red);
  }

  /* Quick Category Chips */
  .quick-category-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid #F1F5F9;
    overflow-x: auto;
  }
  .quick-cat-label {
    font-size: 0.78rem;
    font-weight: 700;
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
    padding-bottom: 4px;
  }
  .quick-cat-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .quick-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 15px;
    border-radius: 999px;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #475569;
    font-family: inherit;
    font-size: 0.82rem;
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

  /* Expandable Drawer */
  .advanced-filter-drawer {
    margin-top: 20px;
    padding: 24px;
    background: #F8FAFC;
    border-radius: var(--radius-lg);
    border: 1px solid #E2E8F0;
    animation: drawerSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes drawerSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }
  .drawer-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--navy-ink);
  }
  .drawer-close-text {
    border: none;
    background: transparent;
    color: #64748B;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }

  .drawer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .drawer-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .drawer-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .drawer-select, .drawer-input {
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-family: inherit;
    font-size: 0.88rem;
    color: var(--navy-ink);
    outline: none;
    transition: border-color 0.2s;
  }
  .drawer-select:focus, .drawer-input:focus {
    border-color: var(--brand-red);
  }

  .popular-amenities-shortcuts {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 14px;
    border-top: 1px solid #E2E8F0;
  }
  .shortcuts-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748B;
    margin-right: 4px;
  }
  .amenity-shortcut-pill {
    padding: 5px 12px;
    border-radius: 999px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    color: #475569;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .amenity-shortcut-pill:hover, .amenity-shortcut-pill.active {
    border-color: var(--brand-red);
    color: var(--brand-red);
    background: var(--brand-red-light);
  }

  /* ── 3. MAIN CONTENT BODY ── */
  .listings-main-canvas {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 24px 100px;
  }

  .error-alert-banner {
    background: #FEE2E2;
    border: 1px solid #FCA5A5;
    color: #B91C1C;
    padding: 14px 20px;
    border-radius: var(--radius-md);
    margin-bottom: 24px;
    font-weight: 600;
  }

  /* Segmented Discovery Nav */
  .segmented-discovery-nav {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }
  .discovery-tabs-cluster {
    display: inline-flex;
    background: #FFFFFF;
    padding: 6px;
    border-radius: 999px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
    border: 1px solid #E2E8F0;
    gap: 4px;
    overflow-x: auto;
    max-width: 100%;
  }
  .discovery-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    color: #64748B;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.25s ease;
  }
  .discovery-tab:hover {
    color: var(--navy-ink);
  }
  .discovery-tab.active {
    background: var(--navy-ink);
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  }
  .tab-icon {
    font-size: 1.05rem;
  }
  .tab-counter {
    background: #F1F5F9;
    color: #475569;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .discovery-tab.active .tab-counter {
    background: rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
  }
  .tab-badge-new {
    background: #FEF3C7;
    color: #B45309;
    font-size: 0.7rem;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .discovery-tab.active .tab-badge-new {
    background: #F59E0B;
    color: #FFFFFF;
  }
  .tab-badge-verified {
    background: #DCFCE7;
    color: #15803D;
    font-size: 0.7rem;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .discovery-tab.active .tab-badge-verified {
    background: #10B981;
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

  /* Saved Searches Panel */
  .saved-searches-box {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 20px;
    margin-bottom: 28px;
    box-shadow: var(--shadow-subtle);
  }
  .saved-searches-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 14px;
  }
  .saved-searches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .saved-search-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
  }
  .saved-item-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--navy-ink);
  }
  .saved-item-date {
    font-size: 0.72rem;
    color: #94A3B8;
  }
  .saved-item-actions {
    display: flex;
    gap: 6px;
  }
  .saved-apply-btn {
    background: var(--brand-red);
    color: #FFFFFF;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }
  .saved-del-btn {
    background: transparent;
    border: 1px solid #CBD5E1;
    color: #94A3B8;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Map View Shell */
  .map-view-shell {
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 32px;
    box-shadow: var(--shadow-elevated);
  }
  .map-view-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    background: #F1F5F9;
    border-bottom: 1px solid #E2E8F0;
    font-size: 0.88rem;
    font-weight: 700;
    color: #334155;
  }

  /* ── 4. MODERN PROPERTY CARDS GRID ── */
  .properties-modern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 28px;
  }
  @media (max-width: 640px) {
    .properties-modern-grid {
      grid-template-columns: 1fr;
      gap: 22px;
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
    position: relative;
  }
  .property-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 45px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(227, 27, 27, 0.25);
    border-color: rgba(227, 27, 27, 0.3);
  }

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
  .property-card:hover .card-carousel-slide.active {
    transform: scale(1.05);
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
  .property-card:hover .card-carousel-arrow {
    opacity: 1;
  }
  .card-carousel-arrow:hover {
    background: #E31B1B;
    border-color: #E31B1B;
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
    background: #E31B1B;
    width: 12px;
    border-radius: 3px;
  }

  .card-no-photo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94A3B8;
    font-size: 0.88rem;
    font-weight: 600;
  }
  .card-img-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.55) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Card Badges */
  .card-avail-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
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
  .avail-red {
    background: rgba(220, 38, 38, 0.95);
    color: #FFFFFF;
  }
  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 8px #FFFFFF;
    animation: livePulse 1.8s infinite;
  }
  @keyframes livePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }

  .card-type-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.75);
    color: #FFFFFF;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    backdrop-filter: blur(6px);
  }

  .card-photo-count {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(15, 23, 42, 0.75);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    backdrop-filter: blur(6px);
  }

  .card-fav-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
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
    z-index: 2;
  }
  .card-fav-btn:hover {
    transform: scale(1.15);
    background: #FFFFFF;
  }

  /* Card Content */
  .card-content-box {
    padding: 18px 20px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .card-location-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .location-pin-icon {
    flex-shrink: 0;
  }
  .location-text {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--brand-red);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-property-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    line-height: 1.35;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-specs-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F8FAFC;
    border: 1px solid #F1F5F9;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
  }
  .spec-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
  }
  .spec-separator {
    color: #CBD5E1;
    font-size: 0.75rem;
  }

  .card-amenities-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 14px;
  }
  .amenity-chip-tag {
    background: #F1F5F9;
    color: #64748B;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .amenity-more-tag {
    background: var(--brand-red-light);
    color: var(--brand-red);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 4px;
  }

  .card-landlord-verify-line {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748B;
    margin-bottom: 16px;
  }
  .verify-shield {
    font-size: 0.82rem;
  }

  .card-bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #F1F5F9;
    margin-top: auto;
  }

  .card-price-stack {
    display: flex;
    flex-direction: column;
  }
  .card-rent-amount {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--brand-red);
    line-height: 1;
  }
  .card-rent-period {
    font-size: 0.72rem;
    color: #94A3B8;
    margin-top: 3px;
    font-weight: 500;
  }

  .card-cta-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .quick-whatsapp-cta {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #25D366;
    color: #FFFFFF;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    transition: all 0.2s ease;
  }
  .quick-whatsapp-cta:hover {
    transform: scale(1.08);
    background: #20BA5A;
  }

  .view-details-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border-radius: 10px;
    background: var(--navy-ink);
    color: #FFFFFF;
    border: none;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .view-details-cta:hover {
    background: var(--brand-red);
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow-red);
  }

  /* ── 5. UNIVERSITY HOSTEL SECTION ── */
  .university-hub-container {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    border: 1px solid #E2E8F0;
    padding: 40px 32px;
    box-shadow: var(--shadow-elevated);
    margin-bottom: 40px;
  }
  .hub-hero-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 36px;
  }
  .hub-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 999px;
    background: #FEF3C7;
    color: #B45309;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin-bottom: 14px;
  }
  .hub-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 12px;
  }
  .hub-subtitle {
    font-size: 0.95rem;
    color: #64748B;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .university-search-control {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #F8FAFC;
    border: 2px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 12px 18px;
    max-width: 600px;
    margin: 0 auto;
    transition: all 0.2s ease;
  }
  .university-search-control:focus-within {
    border-color: var(--brand-red);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.1);
  }
  .university-search-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--navy-ink);
    width: 100%;
  }
  .clear-uni-btn {
    border: none;
    background: transparent;
    color: #94A3B8;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .university-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .university-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-lg);
    padding: 22px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
  }
  .university-card:hover {
    background: #FFFFFF;
    border-color: var(--brand-red);
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(227, 27, 27, 0.12);
  }

  .uni-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .uni-code-badge {
    background: #0F172A;
    color: #FFFFFF;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.06em;
  }
  .uni-county-tag {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--brand-red);
  }

  .uni-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
    line-height: 1.35;
  }
  .uni-location {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748B;
    font-size: 0.82rem;
    margin-bottom: 18px;
  }
  .uni-card-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid #E2E8F0;
  }
  .uni-cta-text {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--brand-red);
  }

  .selected-campus-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, rgba(227, 27, 27, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%);
    border: 1px solid var(--brand-red);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .campus-indicator-badge {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--brand-red);
    display: block;
    margin-bottom: 4px;
  }
  .selected-campus-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--navy-ink);
  }
  .selected-campus-meta {
    font-size: 0.85rem;
    color: #64748B;
    margin-top: 4px;
  }
  .change-campus-btn {
    padding: 10px 18px;
    border-radius: var(--radius-md);
    background: #FFFFFF;
    border: 1px solid var(--brand-red);
    color: var(--brand-red);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .change-campus-btn:hover {
    background: var(--brand-red);
    color: #FFFFFF;
  }

  /* ── 6. AGENT DIRECTORY SECTION ── */
  .agent-directory-container {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    border: 1px solid #E2E8F0;
    padding: 40px 32px;
    box-shadow: var(--shadow-elevated);
    margin-bottom: 40px;
  }
  .agent-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 24px;
  }
  .agent-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-lg);
    padding: 28px 22px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .agent-card:hover {
    background: #FFFFFF;
    border-color: var(--brand-red);
    transform: translateY(-4px);
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
  }

  .agent-avatar-wrap {
    position: relative;
    width: 76px;
    height: 76px;
    margin-bottom: 14px;
  }
  .agent-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid var(--brand-red);
  }
  .agent-avatar-initial {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 1.8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--brand-red);
  }
  .agent-verified-shield {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #10B981;
    color: #FFFFFF;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 900;
    border: 2px solid #FFFFFF;
  }

  .agent-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 6px;
  }
  .agent-county-pill {
    background: #F1F5F9;
    color: #475569;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 12px;
  }
  .agent-bio {
    color: #64748B;
    font-size: 0.82rem;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .agent-locations-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 18px;
    font-size: 0.78rem;
  }
  .agent-locations-label {
    color: #94A3B8;
  }
  .agent-locations-val {
    font-weight: 700;
    color: var(--brand-red);
  }
  .agent-view-listings-cta {
    margin-top: auto;
    width: 100%;
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
  .agent-card:hover .agent-view-listings-cta {
    background: var(--brand-red);
  }

  /* ── 7. EMPTY & LOADING STATES ── */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 40px;
    text-align: center;
  }
  .loading-pulsar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 4px solid #E2E8F0;
    border-top-color: var(--brand-red);
    animation: spin 0.8s linear infinite;
    margin-bottom: 20px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .loading-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 8px;
  }
  .loading-sub {
    color: #64748B;
    font-size: 0.95rem;
  }

  .loading-state-block {
    text-align: center;
    padding: 60px 20px;
    color: #64748B;
    font-size: 0.95rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .empty-results-box {
    background: #FFFFFF;
    border: 2px dashed #CBD5E1;
    border-radius: var(--radius-xl);
    padding: 60px 24px;
    text-align: center;
    max-width: 600px;
    margin: 40px auto;
  }
  .empty-icon-wrap {
    font-size: 3rem;
    margin-bottom: 16px;
  }
  .empty-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 10px;
  }
  .empty-desc {
    color: #64748B;
    font-size: 0.92rem;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .empty-actions-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .empty-reset-btn {
    padding: 10px 20px;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
  }
  .empty-cta-btn {
    padding: 10px 22px;
    background: var(--brand-red);
    color: #FFFFFF;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(227, 27, 27, 0.3);
  }

  /* ── 8. PROPERTY DETAIL MODAL ── */
  .modal-overlay-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8, 16, 29, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 20px;
  }
  .property-detail-modal {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    max-width: 760px;
    width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid #E2E8F0;
  }

  .modal-close-round {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #E2E8F0;
    color: var(--navy-ink);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.2s;
  }
  .modal-close-round:hover {
    background: var(--brand-red);
    color: #FFFFFF;
  }

  .modal-gallery-shell {
    position: relative;
    height: 380px;
    background: #0F172A;
    overflow: hidden;
  }
  @media (max-width: 640px) {
    .modal-gallery-shell {
      height: 260px;
    }
  }
  .modal-featured-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .modal-no-image-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
  }

  .gallery-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    color: var(--navy-ink);
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    backdrop-filter: blur(6px);
  }
  .nav-prev { left: 16px; }
  .nav-next { right: 16px; }
  .gallery-counter-pill {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.8);
    color: #FFFFFF;
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .modal-thumbnails-strip {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    background: #F8FAFC;
    overflow-x: auto;
    border-bottom: 1px solid #E2E8F0;
  }
  .modal-thumb-img {
    width: 68px;
    height: 52px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.6;
    border: 2px solid transparent;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .modal-thumb-img.active {
    opacity: 1;
    border-color: var(--brand-red);
  }

  .modal-body-content {
    padding: 28px;
  }

  .modal-headline-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }
  .modal-category-tag {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--brand-red);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .modal-main-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--navy-ink);
    line-height: 1.25;
    margin-bottom: 10px;
  }
  .modal-location-tags {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .location-pin-chip {
    font-size: 0.88rem;
    font-weight: 700;
    color: #475569;
  }
  .views-counter-chip {
    font-size: 0.8rem;
    font-weight: 700;
    color: #2563EB;
    background: #EFF6FF;
    padding: 3px 8px;
    border-radius: 6px;
  }
  .google-maps-link {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--brand-red);
    text-decoration: none;
  }

  .modal-pricing-box {
    text-align: right;
  }
  .modal-price-big {
    font-family: 'Outfit', sans-serif;
    font-size: 1.7rem;
    font-weight: 900;
    color: var(--brand-red);
  }
  .modal-price-term {
    font-size: 0.82rem;
    color: #64748B;
  }

  .modal-specs-strip {
    display: flex;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-md);
    padding: 14px 20px;
    margin-bottom: 22px;
  }
  .spec-unit {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .spec-val {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--navy-ink);
  }
  .spec-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
  }
  .spec-divider {
    width: 1px;
    background: #E2E8F0;
  }

  .modal-deposit-row {
    display: flex;
    gap: 12px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .deposit-info-pill {
    background: #F1F5F9;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    display: flex;
    gap: 6px;
  }
  .deposit-lbl { color: #64748B; }
  .deposit-val { font-weight: 700; color: var(--navy-ink); }

  .modal-section-wrap {
    margin-bottom: 22px;
  }
  .modal-section-title {
    font-size: 0.92rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--navy-ink);
    margin-bottom: 10px;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 6px;
  }
  .modal-description-paragraph {
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.7;
  }

  .modal-amenities-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .modal-amenity-pill {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    color: #334155;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .modal-rules-box {
    background: #FFFBEB;
    border-left: 4px solid #F59E0B;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 14px 18px;
    margin-bottom: 24px;
  }
  .modal-rules-title {
    color: #92400E;
    font-size: 0.88rem;
    font-weight: 800;
    margin-bottom: 4px;
  }
  .modal-rules-text {
    color: #78350F;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .landlord-connect-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: var(--radius-lg);
    padding: 22px;
    margin-bottom: 22px;
  }
  .landlord-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .landlord-role-tag {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #64748B;
  }
  .landlord-person-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--navy-ink);
  }
  .landlord-phone-num {
    color: #64748B;
    font-size: 0.88rem;
  }

  .assigned-agent-badge-box {
    text-align: right;
  }
  .agent-badge-lbl {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--brand-red);
    letter-spacing: 0.1em;
  }
  .agent-badge-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--navy-ink);
  }
  .agent-badge-phone {
    font-size: 0.82rem;
    color: #64748B;
  }

  .share-property-inline {
    margin-bottom: 16px;
  }

  .modal-cta-buttons-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 640px) {
    .modal-cta-buttons-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .cta-btn {
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: none;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }
  .cta-whatsapp {
    background: #25D366;
    color: #FFFFFF;
  }
  .cta-whatsapp:hover {
    background: #20BA5A;
  }
  .cta-call {
    background: #2563EB;
    color: #FFFFFF;
  }
  .cta-call:hover {
    background: #1D4ED8;
  }
  .cta-sms {
    background: #D97706;
    color: #FFFFFF;
  }
  .cta-sms:hover {
    background: #B45309;
  }
  .cta-book {
    background: var(--brand-red);
    color: #FFFFFF;
  }
  .cta-book:hover {
    background: var(--brand-red-hover);
  }

  .modal-occupied-banner {
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    padding: 18px;
    border-radius: var(--radius-md);
    text-align: center;
    color: #991B1B;
  }

  /* In Modal Chat */
  .in-modal-chat {
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid #E2E8F0;
  }

  /* ── 9. M-PESA POPUP DIALOG ── */
  .mpesa-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 16, 29, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    padding: 20px;
  }
  .mpesa-dialog-box {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    max-width: 420px;
    width: 100%;
    padding: 28px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  }
  .mpesa-badge-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #16A34A;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
  }
  .mpesa-dialog-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--navy-ink);
    margin-bottom: 4px;
  }
  .mpesa-dialog-sub {
    color: #64748B;
    font-size: 0.88rem;
    margin-bottom: 20px;
  }
  .mpesa-form-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .mpesa-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mpesa-form-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
  }
  .mpesa-form-input {
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-size: 0.95rem;
    font-family: inherit;
    font-weight: 600;
  }
  .mpesa-submit-btn {
    padding: 13px;
    border-radius: var(--radius-sm);
    border: none;
    background: #16A34A;
    color: #FFFFFF;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
  }
  .mpesa-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .mpesa-cancel-btn {
    border: 1px solid #CBD5E1;
    background: transparent;
    padding: 10px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.88rem;
    color: #64748B;
    cursor: pointer;
  }
  .mpesa-success-box {
    background: #DCFCE7;
    border: 1px solid #86EFAC;
    color: #166534;
    padding: 12px;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    margin-bottom: 16px;
  }
  .mpesa-error-box {
    background: #FEE2E2;
    border: 1px solid #FCA5A5;
    color: #991B1B;
    padding: 12px;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    margin-bottom: 16px;
  }

  /* ── 10. ANIMATIONS ── */
  @keyframes backdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .backdrop-anim {
    animation: backdropIn 0.25s ease;
  }
  .modal-anim {
    animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .ambient-orb, .live-dot, .backdrop-anim, .modal-anim {
      animation: none !important;
    }
  }
`;