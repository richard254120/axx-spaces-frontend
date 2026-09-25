import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  useAccommodationProperty,
  AccommodationNav,
  LoadingBlock,
  ErrorAlert,
  ACCOMMODATION_FONT_CSS,
  accommodationTheme,
} from "../../features/accommodation";
import PhoneInput from "../../components/PhoneInput";
import { useAuth } from "../../context/AuthContext";
import MessagingSystem from "../../components/MessagingSystem";
import AgentCard from "../../components/AgentCard";

// Fix Leaflet default marker icons broken in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const customPinIcon = L.divIcon({
  className: "custom-leaflet-pin",
  html: `
    <div style="
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      width: 42px;
      height: 42px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.45);
      border: 3px solid white;
    ">
      <span style="transform: rotate(45deg); font-size: 18px;">🏨</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

// Verification badge imagery
const BADGE_IMAGES = {
  student_verified: "/Student Verified.png",
  business_verified: "/Business Verified.png",
  identity_verified: "/Identity Verified.png",
  location_verified: "/Locationn Verified.png",
  online_verified: "/Online Verified.png",
  premium_verified: "/Premium Verified.png",
};

// Curated fallback reviews if property is newly listed
const DEFAULT_REVIEWS = [
  {
    name: "Amina Karume",
    avatar: "A",
    date: "2 weeks ago",
    rating: 5,
    comment: "Exceptional hospitality! The staff went above and beyond, and the property is even more breathtaking in person. Sparkling clean and very quiet.",
    type: "Verified Guest",
  },
  {
    name: "David Mwangi",
    avatar: "D",
    date: "1 month ago",
    rating: 5,
    comment: "Top notch experience. High-speed WiFi made remote work a breeze, and the breakfast was unforgettable. Will definitely rebook next time I am around!",
    type: "Solo Traveler",
  },
  {
    name: "Sarah Jenkins",
    avatar: "S",
    date: "2 months ago",
    rating: 5,
    comment: "The views and serenity here are unbeatable. Seamless check-in and the host was very responsive via WhatsApp. Highly recommended!",
    type: "Family Vacation",
  },
];

function formatVideoUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim().replace(/^http:\/\//i, "https://");
  if (cleanUrl.includes("cloudinary.com") && cleanUrl.includes("/video/upload/")) {
    cleanUrl = cleanUrl.replace(/\.(mov|quicktime|mkv|avi|webm|ogv|m4v)$/i, ".mp4");
    if (!/\.(mp4|webm)$/i.test(cleanUrl)) {
      cleanUrl = `${cleanUrl}.mp4`;
    }
  }
  return cleanUrl;
}

function getVideoPoster(url, fallbackImg) {
  if (!url || typeof url !== "string") return fallbackImg;
  if (url.includes("cloudinary.com") && url.includes("/video/upload/")) {
    return url.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg";
  }
  return fallbackImg;
}

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error } = useAccommodationProperty(id);
  const { user, token } = useAuth();

  // Booking & suite selection state
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });
  const [guestsCount, setGuestsCount] = useState(2);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // M-Pesa payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState(user?.phone || "");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Gallery & Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Active section scroll spy
  const [activeSection, setActiveSection] = useState("overview");

  // Wishlist & Share toast state
  const [saved, setSaved] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("axx_accommodation_favs") || "[]");
      return favs.includes(id);
    } catch {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState("");

  // Toggle favorite / wishlist
  const toggleSave = () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      const favs = JSON.parse(localStorage.getItem("axx_accommodation_favs") || "[]");
      const updated = nextSaved ? [...new Set([...favs, id])] : favs.filter((f) => f !== id);
      localStorage.setItem("axx_accommodation_favs", JSON.stringify(updated));
    } catch {}
    showToast(nextSaved ? "Saved to your Wishlist ❤️" : "Removed from your Wishlist");
  };

  // Share handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property?.name || "AxxSpace Accommodation",
      text: `Check out ${property?.name || "this stay"} on AxxSpace!`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Listing link copied to clipboard! 📋");
      } catch {
        showToast("Link: " + shareUrl);
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex < 0 || !property?.images?.length) return;
    const total = property.images.length;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxIndex(-1);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, property?.images]);

  // Section Observer for ScrollSpy
  useEffect(() => {
    const sections = ["overview", "amenities", "walkthrough", "rooms", "location", "policies", "reviews", "host"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );

    sections.forEach((sId) => {
      const el = document.getElementById(sId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [property]);

  // Calculated stay nights
  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Normalized room types
  const roomTypes = useMemo(() => {
    if (property?.roomTypes && property.roomTypes.length > 0) {
      return property.roomTypes;
    }
    const fallbackPrice = Number(property?.basePrice || property?.price || 8500);
    return [
      {
        name: "Standard Suite",
        price: fallbackPrice,
        guests: property?.maxGuests || 2,
        desc: "Comfortable suite with luxury bedding, en-suite rain shower and ambient climate control.",
        bed: "1 King Bed or 2 Twins",
      },
      {
        name: "Deluxe Scenic Suite",
        price: Math.round(fallbackPrice * 1.35),
        guests: Math.min((property?.maxGuests || 2) + 1, 4),
        desc: "Elevated suite with private balcony terrace, deep-soaking bathtub and premium views.",
        bed: "1 Extra-Large King Bed",
      },
    ];
  }, [property]);

  const activeRoom = roomTypes[selectedRoomIndex] || roomTypes[0] || {};
  const nightlyRate = Number(activeRoom.price || property?.basePrice || property?.price || 0);
  const subtotal = nightlyRate * nightsCount;
  const serviceFee = 0; // Free on AxxSpace
  const grandTotal = subtotal + serviceFee;

  // Normalized Manager / Host Details
  const host = useMemo(() => {
    const owner = property?.owner;
    return {
      name: owner?.name || property?.ownerName || "AxxSpace Verified Partner",
      phone: owner?.phone || property?.ownerPhone || "+254 700 000 000",
      email: owner?.email || property?.ownerEmail || "hospitality@axxspace.com",
      whatsapp: (owner?.phone || property?.ownerPhone || "254700000000").replace(/\D/g, ""),
      badges: owner?.verificationBadges || [],
    };
  }, [property]);

  // Coordinates
  const coordinates = useMemo(() => {
    if (property?.location?.lat && property?.location?.lng) {
      return [Number(property.location.lat), Number(property.location.lng)];
    }
    if (property?.coordinates?.lat && property?.coordinates?.lng) {
      return [Number(property.coordinates.lat), Number(property.coordinates.lng)];
    }
    // Default to Nairobi center if coordinates are unlisted
    return [-1.286389, 36.817223];
  }, [property]);

  const hasRealCoords = Boolean(
    (property?.location?.lat && property?.location?.lng) ||
    (property?.coordinates?.lat && property?.coordinates?.lng)
  );

  // Gallery images array
  const galleryImages = useMemo(() => {
    if (!property?.images || property.images.length === 0) {
      return [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
      ];
    }
    return property.images.map((img) => (typeof img === "object" ? img.imageUrl || img.url : img));
  }, [property]);

  // Handle M-Pesa payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setPaymentError("Please log in to proceed with secure M-Pesa payment.");
      return;
    }
    setPaymentLoading(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const response = await fetch(`${API_BASE}/payment/book-tourism`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourismId: property?._id || property?.id,
          phone: paymentPhone,
          amount: grandTotal.toString(),
          checkIn,
          checkOut,
          suiteName: activeRoom.name,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentSuccess("STK Push prompt sent! Please enter your M-Pesa PIN on your phone to complete your booking.");
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess("");
        }, 5000);
      } else {
        setPaymentError(data.error || data.message || "Payment initiation failed. Please check your phone number and try again.");
      }
    } catch {
      setPaymentError("Network error connecting to payment gateway. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <style>{ACCOMMODATION_FONT_CSS}</style>
        <AccommodationNav />
        <div style={{ maxWidth: "1280px", margin: "60px auto", padding: "0 20px" }}>
          <LoadingBlock message="Loading accommodation showcase…" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!property) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <AccommodationNav />
        <div style={{ maxWidth: "600px", margin: "80px auto", padding: "40px 24px", textAlign: "center", background: "white", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏖️</div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>Accommodation Not Found</h2>
          <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "28px" }}>
            This property listing might have been unlisted, booked out, or pending approval.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/accommodation/listings")}
              style={{ padding: "14px 24px", borderRadius: "12px", border: "none", background: "#0ea5e9", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
            >
              Browse Stays
            </button>
            <button
              onClick={() => navigate("/accommodation")}
              style={{ padding: "14px 24px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main layout
  return (
    <div className="lux-detail-page">
      <style>{ACCOMMODATION_FONT_CSS}{luxStyles}</style>

      {/* Main Navigation */}
      <AccommodationNav />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="lux-toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb & Quick Actions Bar */}
      <div className="lux-top-strip">
        <div className="lux-container lux-top-strip-inner">
          <nav aria-label="Breadcrumb" className="lux-breadcrumb">
            <Link to="/accommodation">Home</Link>
            <span className="lux-bread-slash">/</span>
            <Link to="/accommodation/listings">Accommodations</Link>
            <span className="lux-bread-slash">/</span>
            <span className="lux-bread-current">{property.name}</span>
          </nav>

          <div className="lux-action-pills">
            <button
              type="button"
              className={`lux-pill-btn ${saved ? "active-heart" : ""}`}
              onClick={toggleSave}
              aria-label="Save to Wishlist"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill={saved ? "#e11d48" : "none"} stroke={saved ? "#e11d48" : "currentColor"} strokeWidth="2.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              className="lux-pill-btn"
              onClick={handleShare}
              aria-label="Share this listing"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="lux-container">
        {/* Title Header Header */}
        <header className="lux-header-block">
          <div className="lux-badge-row">
            <span className="lux-category-badge">{property.category || property.type || "Luxury Stay"}</span>
            {property.tag && <span className="lux-tag-badge">{property.tag}</span>}
            {property.isFeatured && <span className="lux-featured-badge">★ Featured Stay</span>}
          </div>

          <h1 className="lux-title">{property.name}</h1>

          <div className="lux-subhead-row">
            <div className="lux-rating-pill">
              <span className="star-icon">★</span>
              <strong>{(property.rating || 4.9).toFixed(1)}</strong>
              <span className="rating-dot">·</span>
              <a href="#reviews" className="review-link">
                {property.reviews || 84} verified reviews
              </a>
            </div>

            <div className="lux-location-link" onClick={() => document.getElementById("location")?.scrollIntoView({ behavior: "smooth" })}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0ea5e9" strokeWidth="2.4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{typeof property.location === "object" ? property.address : property.location || property.address || "Kenya"}</span>
              <span className="map-shortcut">View on map →</span>
            </div>
          </div>
        </header>

        {/* Bento Gallery Showcase */}
        <section className="lux-gallery-section" aria-label="Photo Showcase">
          {galleryImages.length >= 5 ? (
            <div className="bento-gallery-5">
              <div className="bento-main" onClick={() => setLightboxIndex(0)}>
                <img src={galleryImages[0]} alt={`${property.name} preview 1`} loading="eager" />
                <div className="bento-hover-overlay">
                  <span>Zoom Photo</span>
                </div>
              </div>

              <div className="bento-mosaic">
                {galleryImages.slice(1, 5).map((imgUrl, idx) => (
                  <div key={idx} className="bento-thumb" onClick={() => setLightboxIndex(idx + 1)}>
                    <img src={imgUrl} alt={`${property.name} view ${idx + 2}`} loading="lazy" />
                    <div className="bento-hover-overlay">
                      <span>Zoom</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", position: "absolute", bottom: "16px", right: "16px", zIndex: 3 }}>
                {property.videos && property.videos.length > 0 && (
                  <button
                    type="button"
                    className="bento-video-btn"
                    onClick={() => {
                      const el = document.getElementById("walkthrough");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="bento-play-icon">▶</span>
                    <span>Video Tour ({property.videos.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  className="bento-show-all-btn"
                  onClick={() => setLightboxIndex(0)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>View all {galleryImages.length} photos</span>
                </button>
              </div>
            </div>
          ) : galleryImages.length >= 2 ? (
            <div className="bento-gallery-multi">
              {galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="bento-multi-tile" onClick={() => setLightboxIndex(idx)}>
                  <img src={imgUrl} alt={`${property.name} photo ${idx + 1}`} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px", position: "absolute", bottom: "16px", right: "16px", zIndex: 3 }}>
                {property.videos && property.videos.length > 0 && (
                  <button
                    type="button"
                    className="bento-video-btn"
                    onClick={() => {
                      const el = document.getElementById("walkthrough");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="bento-play-icon">▶</span>
                    <span>Video Tour ({property.videos.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  className="bento-show-all-btn"
                  onClick={() => setLightboxIndex(0)}
                >
                  View photos ({galleryImages.length})
                </button>
              </div>
            </div>
          ) : (
            <div className="bento-gallery-single" onClick={() => setLightboxIndex(0)}>
              <img src={galleryImages[0]} alt={property.name} />
              <div style={{ display: "flex", gap: "10px", position: "absolute", bottom: "16px", right: "16px", zIndex: 3 }}>
                {property.videos && property.videos.length > 0 && (
                  <button
                    type="button"
                    className="bento-video-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = document.getElementById("walkthrough");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="bento-play-icon">▶</span>
                    <span>Video Tour ({property.videos.length})</span>
                  </button>
                )}
                <button type="button" className="bento-show-all-btn">
                  Fullscreen Image
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Floating In-Page Sticky Nav (Scroll-Spy) */}
        <div className="lux-section-nav">
          <a href="#overview" className={activeSection === "overview" ? "active" : ""}>Overview</a>
          <a href="#amenities" className={activeSection === "amenities" ? "active" : ""}>Amenities</a>
          {property.videos && property.videos.length > 0 && (
            <a href="#walkthrough" className={activeSection === "walkthrough" ? "active" : ""}>🎬 Video Tour ({property.videos.length})</a>
          )}
          <a href="#rooms" className={activeSection === "rooms" ? "active" : ""}>Rooms & Suites</a>
          <a href="#location" className={activeSection === "location" ? "active" : ""}>Location & Map</a>
          <a href="#policies" className={activeSection === "policies" ? "active" : ""}>Policies</a>
          <a href="#reviews" className={activeSection === "reviews" ? "active" : ""}>Reviews</a>
          <a href="#host" className={activeSection === "host" ? "active" : ""}>Host & Contact</a>
        </div>

        {/* 2-Column Content Layout */}
        <div className="lux-main-layout">
          {/* ── LEFT COLUMN: Rich Details ── */}
          <main className="lux-content-col">
            {/* Host Banner & Key Metrics */}
            <div className="lux-card" id="overview">
              <div className="lux-host-header">
                <div className="lux-host-left">
                  <div className="lux-host-avatar">
                    {host.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="lux-host-title">Stay hosted by {host.name}</h2>
                    <p className="lux-host-subtitle">
                      Verified Host · Fast Responder · AxxSpace Partner
                    </p>
                  </div>
                </div>

                {host.badges?.length > 0 && (
                  <div className="lux-host-badges">
                    {host.badges.map((b, i) => {
                      const bKey = typeof b === "string" ? b : b?.type;
                      if (!BADGE_IMAGES[bKey]) return null;
                      return (
                        <img
                          key={i}
                          src={BADGE_IMAGES[bKey]}
                          alt={bKey}
                          title={bKey.replace(/_/g, " ").toUpperCase()}
                          className="lux-badge-icon"
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Key Facts Bar */}
              <div className="lux-facts-grid">
                <div className="lux-fact-item">
                  <span className="lux-fact-icon">👥</span>
                  <div>
                    <span className="lux-fact-value">Up to {property.maxGuests || 2} Guests</span>
                    <span className="lux-fact-sub">Occupancy limit</span>
                  </div>
                </div>
                <div className="lux-fact-item">
                  <span className="lux-fact-icon">🛏️</span>
                  <div>
                    <span className="lux-fact-value">{property.totalRooms || 1} Suite(s)</span>
                    <span className="lux-fact-sub">Total private rooms</span>
                  </div>
                </div>
                <div className="lux-fact-item">
                  <span className="lux-fact-icon">🕑</span>
                  <div>
                    <span className="lux-fact-value">{property.checkInTime || "14:00"}</span>
                    <span className="lux-fact-sub">Check-in time</span>
                  </div>
                </div>
                <div className="lux-fact-item">
                  <span className="lux-fact-icon">🕚</span>
                  <div>
                    <span className="lux-fact-value">{property.checkOutTime || "11:00"}</span>
                    <span className="lux-fact-sub">Check-out time</span>
                  </div>
                </div>
              </div>

              <hr className="lux-card-divider" />

              {/* Description */}
              <div className="lux-description-wrap">
                <h3 className="lux-sec-title">About this stay</h3>
                <p className="lux-description-text">
                  {property.description || "Welcome to this premier Kenyan stay offering serene comfort, genuine hospitality, and prime access to local highlights."}
                </p>
              </div>

              {/* Highlights List */}
              <div className="lux-highlights-list">
                <div className="lux-hl-item">
                  <span className="lux-hl-icon">⚡</span>
                  <div>
                    <strong className="lux-hl-title">Instant M-Pesa Confirmation</strong>
                    <p className="lux-hl-desc">Get your booking confirmed immediately via verified Safaricom STK prompt.</p>
                  </div>
                </div>
                <div className="lux-hl-item">
                  <span className="lux-hl-icon">🛡️</span>
                  <div>
                    <strong className="lux-hl-title">Verified AxxSpace Host</strong>
                    <p className="lux-hl-desc">This property has been vetted and approved for guest safety and quality standards.</p>
                  </div>
                </div>
                <div className="lux-hl-item">
                  <span className="lux-hl-icon">✨</span>
                  <div>
                    <strong className="lux-hl-title">Sparkling Clean & Sanitized</strong>
                    <p className="lux-hl-desc">Top marks from past guests on hygiene, fresh linens, and pristine maintenance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="lux-card" id="amenities">
              <div className="lux-card-header">
                <div>
                  <h3 className="lux-sec-title">What this place offers</h3>
                  <p className="lux-sec-sub">Essential amenities and luxury conveniences included with your reservation</p>
                </div>
              </div>

              <div className="lux-amenities-grid">
                {(property.amenities && property.amenities.length > 0
                  ? property.amenities
                  : ["High-speed WiFi", "Swimming Pool", "Free Parking", "Air Conditioning", "Private Balcony", "Daily Housekeeping", "24/7 Power Backup", "Dedicated Workspace"]
                ).map((amenity, idx) => (
                  <div key={idx} className="lux-amenity-card">
                    <span className="lux-am-check">✓</span>
                    <span className="lux-am-name">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Types & Suites Section */}
            <div className="lux-card" id="rooms">
              <div className="lux-card-header">
                <div>
                  <h3 className="lux-sec-title">Available Suites & Rates</h3>
                  <p className="lux-sec-sub">Select your desired suite option to update reservation totals</p>
                </div>
              </div>

              <div className="lux-rooms-list">
                {roomTypes.map((room, rIdx) => {
                  const isSelected = selectedRoomIndex === rIdx;
                  return (
                    <div
                      key={rIdx}
                      className={`lux-room-card ${isSelected ? "selected-room" : ""}`}
                      onClick={() => setSelectedRoomIndex(rIdx)}
                    >
                      <div className="lux-room-main-info">
                        <div className="lux-room-badge-row">
                          <h4 className="lux-room-title">{room.name}</h4>
                          {isSelected && <span className="lux-room-active-pill">Active Selection</span>}
                        </div>
                        <p className="lux-room-desc">{room.desc}</p>
                        <div className="lux-room-specs">
                          <span>👥 Up to {room.guests || 2} Guests</span>
                          {room.bed && <span>🛏️ {room.bed}</span>}
                        </div>
                      </div>

                      <div className="lux-room-pricing">
                        <div className="lux-room-price-tag">
                          KSh {Number(room.price).toLocaleString()}
                          <span className="lux-room-per"> / night</span>
                        </div>
                        <button
                          type="button"
                          className={`lux-room-select-btn ${isSelected ? "btn-active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoomIndex(rIdx);
                          }}
                        >
                          {isSelected ? "✓ Selected" : "Select Suite"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video / Audio Walkthroughs (If available) */}
            {((property.videos && property.videos.length > 0) || (property.audio && property.audio.length > 0)) && (
              <div className="lux-card" id="walkthrough">
                <div className="lux-card-header">
                  <div>
                    <h3 className="lux-sec-title">Virtual Video Walkthrough</h3>
                    <p className="lux-sec-sub">
                      Experience this stay with authentic, high-definition video walkthroughs provided by the host.
                    </p>
                  </div>
                  {property.videos && property.videos.length > 0 && (
                    <span className="lux-video-count-badge">
                      🎬 {property.videos.length} {property.videos.length === 1 ? "Video Tour" : "Video Tours"}
                    </span>
                  )}
                </div>

                {property.videos && property.videos.length > 0 && (
                  <div className="lux-videos-grid">
                    {property.videos.map((vidUrl, idx) => {
                      const cleanVidUrl = formatVideoUrl(vidUrl);
                      const posterUrl = getVideoPoster(cleanVidUrl, galleryImages[0]);
                      return (
                        <div key={idx} className="lux-video-card">
                          <div className="lux-video-player-container">
                            <video
                              src={cleanVidUrl}
                              controls
                              playsInline
                              preload="metadata"
                              poster={posterUrl}
                              className="lux-video-player"
                            >
                              <source src={cleanVidUrl} type="video/mp4" />
                              Your browser does not support HTML5 video playback.
                            </video>
                          </div>
                          <div className="lux-video-info-bar">
                            <div className="lux-video-title">
                              <span>🎥 Tour {idx + 1} of {property.videos.length}</span>
                              <span className="lux-video-hd-pill">HD Video Tour</span>
                            </div>
                            <a
                              href={cleanVidUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="lux-video-popout-btn"
                              title="Open video in new tab"
                            >
                              Fullscreen ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {property.audio && property.audio.length > 0 && (
                  <div className="lux-audio-wrap" style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                      🎧 Audio Tour & Ambience:
                    </div>
                    {property.audio.map((audUrl, idx) => (
                      <audio key={idx} src={audUrl} controls className="lux-audio-player" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location & Map Section */}
            <div className="lux-card" id="location">
              <div className="lux-card-header">
                <div>
                  <h3 className="lux-sec-title">Location & Neighborhood</h3>
                  <p className="lux-sec-sub">
                    {typeof property.location === "object" ? property.address : property.location || property.address || "Kenya"}
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hasRealCoords ? `${coordinates[0]},${coordinates[1]}` : property.address || property.name
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="lux-open-maps-btn"
                >
                  Open in Google Maps ↗
                </a>
              </div>

              {/* Interactive Leaflet Map Showcase */}
              <div className="lux-map-frame">
                <MapContainer
                  center={coordinates}
                  zoom={hasRealCoords ? 14 : 12}
                  scrollWheelZoom={false}
                  style={{ height: "360px", width: "100%", borderRadius: "16px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={coordinates} icon={customPinIcon}>
                    <Popup>
                      <div style={{ textAlign: "center", padding: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{property.name}</strong>
                        <div style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: 700, marginTop: "4px" }}>
                          KSh {nightlyRate.toLocaleString()}/night
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Policies Section */}
            <div className="lux-card" id="policies">
              <h3 className="lux-sec-title">Policies & House Rules</h3>
              <div className="lux-policy-grid">
                <div className="lux-policy-box">
                  <span className="lux-policy-lbl">Check-in</span>
                  <strong className="lux-policy-val">From {property.checkInTime || "14:00"}</strong>
                  <span className="lux-policy-note">Early check-in upon request</span>
                </div>
                <div className="lux-policy-box">
                  <span className="lux-policy-lbl">Check-out</span>
                  <strong className="lux-policy-val">Until {property.checkOutTime || "11:00"}</strong>
                  <span className="lux-policy-note">Express key return available</span>
                </div>
                <div className="lux-policy-box">
                  <span className="lux-policy-lbl">Cancellation</span>
                  <strong className="lux-policy-val">Flexible 48-Hour</strong>
                  <span className="lux-policy-note">Full refund up to 48h before check-in</span>
                </div>
                <div className="lux-policy-box">
                  <span className="lux-policy-lbl">House Rules</span>
                  <strong className="lux-policy-val">{property.houseRules || "Standard Respect Policy"}</strong>
                  <span className="lux-policy-note">No indoor smoking · Quiet hours after 22:00</span>
                </div>
              </div>
            </div>

            {/* Guest Reviews Section */}
            <div className="lux-card" id="reviews">
              <div className="lux-reviews-summary-card">
                <div className="lux-rev-big-score">
                  <span className="score-num">{(property.rating || 4.9).toFixed(1)}</span>
                  <span className="score-stars">★★★★★</span>
                  <span className="score-label">Guest Favorite</span>
                </div>
                <div className="lux-rev-bars">
                  <div className="lux-rev-bar-row">
                    <span>Cleanliness</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: "98%" }} /></div>
                    <strong>4.9</strong>
                  </div>
                  <div className="lux-rev-bar-row">
                    <span>Accuracy</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: "96%" }} /></div>
                    <strong>4.8</strong>
                  </div>
                  <div className="lux-rev-bar-row">
                    <span>Communication</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: "100%" }} /></div>
                    <strong>5.0</strong>
                  </div>
                  <div className="lux-rev-bar-row">
                    <span>Location</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: "98%" }} /></div>
                    <strong>4.9</strong>
                  </div>
                </div>
              </div>

              {/* Review Testimonials */}
              <div className="lux-testimonial-list">
                {(property.reviewList && property.reviewList.length > 0
                  ? property.reviewList
                  : DEFAULT_REVIEWS
                ).map((rev, rIdx) => (
                  <div key={rIdx} className="lux-rev-card">
                    <div className="lux-rev-user-row">
                      <div className="lux-rev-avatar">{rev.avatar || rev.name?.charAt(0) || "G"}</div>
                      <div>
                        <strong className="lux-rev-name">{rev.name}</strong>
                        <span className="lux-rev-date">{rev.date || "Verified Stay"}</span>
                      </div>
                      <div className="lux-rev-rating">★ {rev.rating || 5}.0</div>
                    </div>
                    <p className="lux-rev-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Profile & In-App Chat */}
            <div className="lux-card" id="host">
              <h3 className="lux-sec-title">Contact & Host Support</h3>
              <p className="lux-sec-sub">Have questions before booking? Connect with {host.name} directly</p>

              <div className="lux-contact-actions">
                <a
                  href={`https://wa.me/${host.whatsapp}?text=${encodeURIComponent(
                    `Hello ${host.name}, I am inquiring about booking ${property.name} on AxxSpace.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="lux-btn-whatsapp"
                >
                  <span>💬 Chat on WhatsApp</span>
                </a>

                <a href={`tel:${host.phone}`} className="lux-btn-call">
                  <span>📞 Call Host</span>
                </a>

                <a href={`mailto:${host.email}`} className="lux-btn-email">
                  <span>✉️ Email</span>
                </a>
              </div>

              {/* In-App Direct Chat Container */}
              <div className="lux-messaging-box">
                <MessagingSystem
                  recipientId={host.email}
                  recipientName={host.name}
                  recipientType="Host Representative"
                  propertyId={property._id || property.id}
                  propertyTitle={property.name}
                />
              </div>

              {/* Assigned Agent Card if present */}
              {property.assignedAgent && (
                <div style={{ marginTop: "24px" }}>
                  <AgentCard agent={property.assignedAgent} />
                </div>
              )}
            </div>
          </main>

          {/* ── RIGHT COLUMN: Sticky Luxury Reservation Card ── */}
          <aside className="lux-sidebar-col">
            <div className="lux-booking-card">
              {/* Pricing Header */}
              <div className="lux-card-top-price">
                <div>
                  <span className="lux-price-currency">KSh</span>
                  <span className="lux-price-digits">{nightlyRate.toLocaleString()}</span>
                  <span className="lux-price-unit"> / night</span>
                </div>
                <div className="lux-booking-rating-pill">
                  ★ {(property.rating || 4.9).toFixed(1)}
                  <span className="count-sub">({property.reviews || 84})</span>
                </div>
              </div>

              {/* Selected Suite Indicator */}
              <div className="lux-active-suite-pill">
                <span>Selected: <strong>{activeRoom.name}</strong></span>
              </div>

              {/* Interactive Reservation Form */}
              <div className="lux-res-form">
                <div className="lux-date-inputs-row">
                  <div className="lux-date-field">
                    <label>Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="lux-date-field">
                    <label>Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn}
                    />
                  </div>
                </div>

                <div className="lux-guest-field">
                  <label>Guests</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CTAs */}
              <div className="lux-cta-group">
                <button
                  type="button"
                  className="lux-btn-mpesa"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <span className="mpesa-shield">⚡</span>
                  <span>Instant Book with M-Pesa</span>
                </button>

                {property.bookingUrl && (
                  <a
                    href={property.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="lux-btn-official"
                  >
                    <span>Official Hotel Booking Site ↗</span>
                  </a>
                )}
              </div>

              {/* Transparent Price Breakdown */}
              <div className="lux-breakdown">
                <div className="lux-bd-row">
                  <span>KSh {nightlyRate.toLocaleString()} × {nightsCount} {nightsCount === 1 ? "night" : "nights"}</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="lux-bd-row">
                  <span>AxxSpace Service Fee</span>
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>Free</span>
                </div>
                <div className="lux-bd-row">
                  <span>Taxes & Tourism Levy</span>
                  <span style={{ color: "#64748b" }}>Included</span>
                </div>
                <hr className="lux-bd-divider" />
                <div className="lux-bd-total-row">
                  <strong>Total Payable</strong>
                  <strong className="lux-total-price">KSh {grandTotal.toLocaleString()}</strong>
                </div>
              </div>

              {/* Security & Guarantee Notes */}
              <div className="lux-guarantee-strip">
                <div className="lux-g-item">
                  <span>🔒</span>
                  <span>Safe Safaricom Escrow Payment</span>
                </div>
                <div className="lux-g-item">
                  <span>✓</span>
                  <span>Direct Host Confirmation</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Bottom Bar on Mobile */}
      <div className="lux-mobile-bottom-bar">
        <div className="lux-m-price">
          <span className="m-val">KSh {nightlyRate.toLocaleString()}</span>
          <span className="m-sub">/ night · {nightsCount} {nightsCount === 1 ? "night" : "nights"}</span>
        </div>
        <button
          type="button"
          className="lux-m-book-btn"
          onClick={() => setMobileDrawerOpen(true)}
        >
          Reserve Stay
        </button>
      </div>

      {/* Mobile Reservation Drawer */}
      {mobileDrawerOpen && (
        <div className="lux-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="lux-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="lux-drawer-handle" />
            <div className="lux-drawer-header">
              <h3>Reserve {property.name}</h3>
              <button onClick={() => setMobileDrawerOpen(false)}>✕</button>
            </div>

            <div className="lux-date-inputs-row" style={{ marginBottom: "16px" }}>
              <div className="lux-date-field">
                <label>Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="lux-date-field">
                <label>Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>

            <div className="lux-breakdown" style={{ marginBottom: "20px" }}>
              <div className="lux-bd-total-row">
                <strong>Total ({nightsCount} nights)</strong>
                <strong className="lux-total-price">KSh {grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            <button
              type="button"
              className="lux-btn-mpesa"
              onClick={() => {
                setMobileDrawerOpen(false);
                setShowPaymentModal(true);
              }}
            >
              ⚡ Proceed with M-Pesa
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {lightboxIndex >= 0 && galleryImages.length > 0 && (
        <div className="lux-lightbox" onClick={() => setLightboxIndex(-1)}>
          <button className="lb-close-btn" onClick={() => setLightboxIndex(-1)}>✕</button>

          <button
            className="lb-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
            }}
          >
            ‹
          </button>

          <img
            src={galleryImages[lightboxIndex]}
            alt={property.name}
            className="lb-showcase-img"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="lb-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % galleryImages.length);
            }}
          >
            ›
          </button>

          <div className="lb-counter-pill">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Safaricom M-Pesa Payment Modal */}
      {showPaymentModal && (
        <div className="lux-payment-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="lux-payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lux-pay-header">
              <div className="mpesa-brand-badge">
                <span className="mpesa-green-circle" />
                <strong>M-PESA Instant Pay</strong>
              </div>
              <button className="lux-pay-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>

            <div className="lux-pay-summary-box">
              <div className="pay-hotel-name">{property.name}</div>
              <div className="pay-suite-name">{activeRoom.name} · {nightsCount} nights</div>
              <div className="pay-amount-digits">KSh {grandTotal.toLocaleString()}</div>
            </div>

            {paymentSuccess && (
              <div className="lux-pay-alert-success">
                ✓ {paymentSuccess}
              </div>
            )}

            {paymentError && (
              <div className="lux-pay-alert-error">
                ⚠ {paymentError}
              </div>
            )}

            {!paymentSuccess && (
              <form onSubmit={handlePaymentSubmit} className="lux-pay-form">
                <div className="lux-pay-input-group">
                  <label>M-Pesa Mobile Number</label>
                  <PhoneInput
                    value={paymentPhone}
                    onChange={(val) => setPaymentPhone(val)}
                    required
                  />
                  <span className="lux-pay-hint">You will receive an instant STK PIN prompt on this phone.</span>
                </div>

                <div className="lux-pay-input-group">
                  <label>Amount in Kenyan Shillings</label>
                  <input
                    type="text"
                    value={`KSh ${grandTotal.toLocaleString()}`}
                    readOnly
                    className="lux-readonly-input"
                  />
                </div>

                <button
                  type="submit"
                  className="lux-btn-confirm-mpesa"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Connecting to Safaricom…" : `Send M-Pesa Prompt (KSh ${grandTotal.toLocaleString()})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WORLD-CLASS CSS STYLES ──────────────────────────────────────────────────
const luxStyles = `
  /* Reset & Base */
  .lux-detail-page {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
    min-height: 100vh;
    padding-bottom: 60px;
    -webkit-font-smoothing: antialiased;
  }

  .lux-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Top Strip & Breadcrumb */
  .lux-top-strip {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 0;
  }
  .lux-top-strip-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .lux-breadcrumb {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lux-breadcrumb a {
    color: #475569;
    text-decoration: none;
    transition: color 0.15s;
  }
  .lux-breadcrumb a:hover {
    color: #0ea5e9;
  }
  .lux-bread-slash {
    color: #cbd5e1;
  }
  .lux-bread-current {
    color: #0f172a;
    font-weight: 700;
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lux-action-pills {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .lux-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .lux-pill-btn:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }
  .lux-pill-btn.active-heart {
    background: #fff1f2;
    border-color: #fecdd3;
    color: #e11d48;
  }

  /* Header Section */
  .lux-header-block {
    padding: 24px 0 18px;
  }
  .lux-badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .lux-category-badge {
    background: #0284c7;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .lux-tag-badge {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .lux-featured-badge {
    background: #fef3c7;
    color: #92400e;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
  }

  .lux-title {
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 900;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .lux-subhead-row {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    font-size: 14px;
    color: #475569;
  }
  .lux-rating-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .lux-rating-pill .star-icon {
    color: #f59e0b;
    font-size: 16px;
  }
  .lux-rating-pill .review-link {
    color: #64748b;
    text-decoration: underline;
    cursor: pointer;
  }
  .lux-location-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.15s;
  }
  .lux-location-link:hover {
    color: #0ea5e9;
  }
  .map-shortcut {
    color: #0ea5e9;
    font-weight: 700;
    margin-left: 4px;
  }

  /* Bento Photo Gallery */
  .lux-gallery-section {
    margin-bottom: 24px;
    position: relative;
  }
  .bento-gallery-5 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    height: 440px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }
  .bento-main {
    position: relative;
    cursor: pointer;
    overflow: hidden;
    height: 100%;
  }
  .bento-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .bento-main:hover img {
    transform: scale(1.03);
  }
  .bento-mosaic {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    height: 100%;
  }
  .bento-thumb {
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }
  .bento-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .bento-thumb:hover img {
    transform: scale(1.05);
  }
  .bento-hover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .bento-hover-overlay span {
    background: rgba(255, 255, 255, 0.95);
    color: #0f172a;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 999px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .bento-main:hover .bento-hover-overlay,
  .bento-thumb:hover .bento-hover-overlay {
    opacity: 1;
  }

  .bento-show-all-btn {
    position: absolute;
    right: 18px;
    bottom: 18px;
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
    z-index: 10;
  }
  .bento-show-all-btn:hover {
    background: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
  }

  .bento-gallery-multi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    height: 380px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }
  .bento-multi-tile {
    cursor: pointer;
    overflow: hidden;
  }
  .bento-multi-tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
  .bento-multi-tile:hover img {
    transform: scale(1.04);
  }

  .bento-gallery-single {
    height: 420px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }
  .bento-gallery-single img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Sticky In-Page Nav */
  .lux-section-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 0;
    margin-bottom: 24px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .lux-section-nav::-webkit-scrollbar {
    display: none;
  }
  .lux-section-nav a {
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    padding: 8px 16px;
    border-radius: 999px;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .lux-section-nav a:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  .lux-section-nav a.active {
    background: #0f172a;
    color: #ffffff;
  }

  /* 2-Column Grid Layout */
  .lux-main-layout {
    display: grid;
    grid-template-columns: 1fr 390px;
    gap: 32px;
    align-items: start;
  }

  .lux-content-col {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Cards */
  .lux-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 28px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    scroll-margin-top: 80px;
  }

  .lux-sec-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px;
  }
  .lux-sec-sub {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 18px;
  }
  .lux-card-divider {
    border: none;
    border-top: 1px solid #f1f5f9;
    margin: 20px 0;
  }

  /* Host Banner */
  .lux-host-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }
  .lux-host-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .lux-host-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    color: #ffffff;
    font-size: 22px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.3);
  }
  .lux-host-title {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 3px;
  }
  .lux-host-subtitle {
    font-size: 12px;
    color: #64748b;
    margin: 0;
  }
  .lux-host-badges {
    display: flex;
    gap: 6px;
  }
  .lux-badge-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  /* Facts Grid */
  .lux-facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
  .lux-fact-item {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .lux-fact-icon {
    font-size: 20px;
  }
  .lux-fact-value {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
  }
  .lux-fact-sub {
    font-size: 11px;
    color: #94a3b8;
  }

  /* Description */
  .lux-description-text {
    font-size: 15px;
    color: #334155;
    line-height: 1.75;
    margin: 0 0 20px;
  }

  /* Highlights */
  .lux-highlights-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #f8fafc;
    border-radius: 16px;
    padding: 18px;
    border: 1px solid #e2e8f0;
  }
  .lux-hl-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .lux-hl-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  .lux-hl-title {
    display: block;
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .lux-hl-desc {
    font-size: 12px;
    color: #64748b;
    margin: 0;
  }

  /* Amenities */
  .lux-amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .lux-amenity-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    transition: all 0.2s;
  }
  .lux-amenity-card:hover {
    background: #ffffff;
    border-color: #0ea5e9;
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.08);
  }
  .lux-am-check {
    color: #0ea5e9;
    font-weight: 800;
    font-size: 14px;
  }
  .lux-am-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
  }

  /* Rooms List */
  .lux-rooms-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .lux-room-card {
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .lux-room-card:hover {
    border-color: #0ea5e9;
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.08);
  }
  .lux-room-card.selected-room {
    border-color: #0ea5e9;
    background: #f0f9ff;
  }
  .lux-room-main-info {
    flex: 1;
  }
  .lux-room-badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .lux-room-title {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }
  .lux-room-active-pill {
    background: #0ea5e9;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .lux-room-desc {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 8px;
    line-height: 1.5;
  }
  .lux-room-specs {
    font-size: 12px;
    color: #475569;
    font-weight: 600;
    display: flex;
    gap: 14px;
  }
  .lux-room-pricing {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  .lux-room-price-tag {
    font-size: 18px;
    font-weight: 900;
    color: #0ea5e9;
  }
  .lux-room-per {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }
  .lux-room-select-btn {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .lux-room-select-btn.btn-active {
    background: #0ea5e9;
    color: #ffffff;
    border-color: #0ea5e9;
  }

  /* Bento Video Button */
  .bento-video-btn {
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(8px);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }
  .bento-video-btn:hover {
    background: #0ea5e9;
    border-color: #0ea5e9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
  }
  .bento-play-icon {
    font-size: 11px;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.2);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .bento-video-btn:hover .bento-play-icon {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.3);
  }

  /* Media Players & Walkthrough */
  .lux-video-count-badge {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 12px;
    borderRadius: 20px;
  }
  .lux-videos-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 14px;
  }
  .lux-video-card {
    background: #0f172a;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #334155;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  }
  .lux-video-player-container {
    position: relative;
    background: #000000;
    width: 100%;
  }
  .lux-video-player {
    width: 100%;
    max-height: 480px;
    display: block;
    background: #000000;
    outline: none;
  }
  .lux-video-info-bar {
    padding: 12px 16px;
    background: #0f172a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #1e293b;
    flex-wrap: wrap;
    gap: 8px;
  }
  .lux-video-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 700;
  }
  .lux-video-hd-pill {
    background: rgba(14, 165, 233, 0.2);
    color: #38bdf8;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    border: 1px solid rgba(14, 165, 233, 0.3);
  }
  .lux-video-popout-btn {
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s;
  }
  .lux-video-popout-btn:hover {
    color: #38bdf8;
  }
  .lux-audio-player {
    width: 100%;
    margin-top: 8px;
  }

  /* Location Card & Map */
  .lux-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .lux-open-maps-btn {
    background: #f1f5f9;
    color: #0284c7;
    border: 1px solid #cbd5e1;
    font-size: 12px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s;
  }
  .lux-open-maps-btn:hover {
    background: #0284c7;
    color: white;
  }
  .lux-map-frame {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  /* Policies */
  .lux-policy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  .lux-policy-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .lux-policy-lbl {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.04em;
  }
  .lux-policy-val {
    font-size: 15px;
    color: #0f172a;
  }
  .lux-policy-note {
    font-size: 12px;
    color: #94a3b8;
  }

  /* Reviews */
  .lux-reviews-summary-card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 28px;
    align-items: center;
  }
  .lux-rev-big-score {
    text-align: center;
    border-right: 1px solid #e2e8f0;
    padding-right: 20px;
  }
  .score-num {
    display: block;
    font-size: 42px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 4px;
  }
  .score-stars {
    color: #f59e0b;
    font-size: 18px;
    letter-spacing: 2px;
    display: block;
    margin-bottom: 4px;
  }
  .score-label {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
  }

  .lux-rev-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .lux-rev-bar-row {
    display: grid;
    grid-template-columns: 110px 1fr 30px;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #334155;
  }
  .bar-track {
    background: #e2e8f0;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
  }
  .bar-fill {
    background: #0f172a;
    height: 100%;
    border-radius: 3px;
  }

  .lux-testimonial-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .lux-rev-card {
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 16px;
    background: #fafafa;
  }
  .lux-rev-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .lux-rev-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #0ea5e9;
    color: white;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .lux-rev-name {
    display: block;
    font-size: 14px;
    color: #0f172a;
  }
  .lux-rev-date {
    font-size: 11px;
    color: #94a3b8;
  }
  .lux-rev-rating {
    margin-left: auto;
    font-size: 13px;
    color: #f59e0b;
    font-weight: 800;
  }
  .lux-rev-comment {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  /* Host Contact Section */
  .lux-contact-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
  .lux-btn-whatsapp {
    background: #16a34a;
    color: white;
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
    transition: transform 0.15s;
  }
  .lux-btn-whatsapp:hover {
    transform: translateY(-2px);
    background: #15803d;
  }
  .lux-btn-call {
    background: #0f172a;
    color: white;
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
    transition: transform 0.15s;
  }
  .lux-btn-call:hover {
    transform: translateY(-2px);
    background: #1e293b;
  }
  .lux-btn-email {
    background: #0284c7;
    color: white;
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
    transition: transform 0.15s;
  }
  .lux-btn-email:hover {
    transform: translateY(-2px);
    background: #0369a1;
  }
  .lux-messaging-box {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }

  /* ── RIGHT COLUMN: Sticky Reservation Box ── */
  .lux-sidebar-col {
    position: sticky;
    top: 20px;
  }
  .lux-booking-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
    padding: 24px;
  }

  .lux-card-top-price {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .lux-price-currency {
    font-size: 15px;
    font-weight: 700;
    color: #64748b;
    margin-right: 4px;
  }
  .lux-price-digits {
    font-size: 28px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .lux-price-unit {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
  .lux-booking-rating-pill {
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 800;
  }
  .count-sub {
    font-size: 10px;
    font-weight: 500;
    margin-left: 2px;
    color: #92400e;
  }

  .lux-active-suite-pill {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: #166534;
    margin-bottom: 16px;
  }

  .lux-res-form {
    border: 1px solid #cbd5e1;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .lux-date-inputs-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid #cbd5e1;
  }
  .lux-date-field {
    padding: 8px 12px;
  }
  .lux-date-field:first-child {
    border-right: 1px solid #cbd5e1;
  }
  .lux-date-field label,
  .lux-guest-field label {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 800;
    color: #64748b;
    margin-bottom: 2px;
  }
  .lux-date-field input,
  .lux-guest-field select {
    width: 100%;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
    background: transparent;
    cursor: pointer;
  }
  .lux-guest-field {
    padding: 8px 12px;
  }

  .lux-cta-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  .lux-btn-mpesa {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 15px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .lux-btn-mpesa:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.45);
    filter: brightness(1.05);
  }
  .lux-btn-official {
    background: #0f172a;
    color: white;
    border-radius: 12px;
    padding: 13px;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    text-decoration: none;
    display: block;
    transition: all 0.2s;
  }
  .lux-btn-official:hover {
    background: #1e293b;
    transform: translateY(-1px);
  }

  /* Price Breakdown */
  .lux-breakdown {
    background: #f8fafc;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 13px;
    color: #475569;
  }
  .lux-bd-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .lux-bd-divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 8px 0;
  }
  .lux-bd-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    color: #0f172a;
  }
  .lux-total-price {
    font-size: 17px;
    color: #0ea5e9;
  }

  .lux-guarantee-strip {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 14px;
    font-size: 11px;
    color: #64748b;
  }
  .lux-g-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Toast Notification */
  .lux-toast {
    position: fixed;
    top: 24px;
    right: 24px;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Mobile Bottom Bar */
  .lux-mobile-bottom-bar {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 100;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.08);
    align-items: center;
    justify-content: space-between;
  }
  .lux-m-price .m-val {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
  }
  .lux-m-price .m-sub {
    font-size: 11px;
    color: #64748b;
    display: block;
  }
  .lux-m-book-btn {
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  /* Mobile Drawer */
  .lux-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
  }
  .lux-drawer-content {
    background: white;
    width: 100%;
    border-radius: 24px 24px 0 0;
    padding: 20px 24px 36px;
    max-height: 85vh;
    overflow-y: auto;
  }
  .lux-drawer-handle {
    width: 44px;
    height: 5px;
    background: #cbd5e1;
    border-radius: 999px;
    margin: 0 auto 16px;
  }
  .lux-drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .lux-drawer-header h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
  }
  .lux-drawer-header button {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  /* Fullscreen Lightbox */
  .lux-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(10, 15, 29, 0.96);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(8px);
  }
  .lb-showcase-img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  .lb-close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .lb-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .lb-prev-btn, .lb-next-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    font-size: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .lb-prev-btn:hover, .lb-next-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .lb-prev-btn { left: 24px; }
  .lb-next-btn { right: 24px; }
  .lb-counter-pill {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
  }

  /* M-Pesa Modal */
  .lux-payment-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(6px);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .lux-payment-modal {
    background: #ffffff;
    border-radius: 24px;
    max-width: 440px;
    width: 100%;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
    animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes modalScale {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .lux-pay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .mpesa-brand-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #16a34a;
    font-size: 15px;
  }
  .mpesa-green-circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #16a34a;
  }
  .lux-pay-close {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }
  .lux-pay-summary-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    margin-bottom: 20px;
  }
  .pay-hotel-name {
    font-weight: 800;
    color: #0f172a;
    font-size: 16px;
  }
  .pay-suite-name {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .pay-amount-digits {
    font-size: 26px;
    font-weight: 900;
    color: #16a34a;
    margin-top: 8px;
  }
  .lux-pay-alert-success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    padding: 14px;
    border-radius: 12px;
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .lux-pay-alert-error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
    padding: 14px;
    border-radius: 12px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .lux-pay-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .lux-pay-input-group label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 6px;
  }
  .lux-pay-hint {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
    display: block;
  }
  .lux-readonly-input {
    width: 100%;
    padding: 12px 14px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    color: #0f172a;
  }
  .lux-btn-confirm-mpesa {
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
    transition: all 0.2s;
  }
  .lux-btn-confirm-mpesa:hover {
    background: #15803d;
    transform: translateY(-1px);
  }
  .lux-btn-confirm-mpesa:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive Breakpoints */
  @media (max-width: 1024px) {
    .lux-main-layout {
      grid-template-columns: 1fr;
    }
    .lux-sidebar-col {
      display: none;
    }
    .lux-mobile-bottom-bar {
      display: flex;
    }
    .lux-reviews-summary-card {
      grid-template-columns: 1fr;
    }
    .lux-rev-big-score {
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
      padding-right: 0;
      padding-bottom: 16px;
    }
  }

  @media (max-width: 768px) {
    .bento-gallery-5 {
      grid-template-columns: 1fr;
      height: 320px;
    }
    .bento-mosaic {
      display: none;
    }
    .lux-room-card {
      flex-direction: column;
      align-items: flex-start;
    }
    .lux-room-pricing {
      text-align: left;
      align-items: flex-start;
      width: 100%;
    }
    .lux-room-select-btn {
      width: 100%;
    }
  }
`;