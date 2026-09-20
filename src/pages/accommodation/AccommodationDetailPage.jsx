import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAccommodationProperty,
  AccommodationNav,
  LoadingBlock,
  ErrorAlert,
  ACCOMMODATION_FONT_CSS,
  accommodationTheme,
  CompactReviews,
} from "../../features/accommodation";
import PhoneInput from "../../components/PhoneInput";
import { useAuth } from "../../context/AuthContext";
import MessagingSystem from "../../components/MessagingSystem";

const properties = {
  1: {
    id: 1, name: "Serena Beach Resort & Spa", location: "Nyali, Mombasa", county: "Mombasa",
    category: "Beach Resort", price: 12500, rating: 4.8, reviews: 312, color: "#0ea5e9", tag: "Top Rated", emoji: "",
    bookingUrl: "https://www.serenahotels.com/mombasa", // Owner's own booking site
    description: "Experience the ultimate coastal getaway at Serena Beach Resort & Spa. Nestled along the pristine shores of Nyali, Mombasa, our resort offers breathtaking Indian Ocean views, world-class amenities, and an unparalleled blend of modern luxury with authentic Swahili hospitality. Award-winning cuisine, a full-service spa, and dedicated kids club make us the perfect destination for families, couples, and corporate retreats.",
    amenities: [" Infinity Pool", " 3 Restaurants", " Full Spa", " Fitness Centre", " Free WiFi", " Free Parking", " Tennis Court", " Water Sports", " Beach Access", " 24hr Room Service", " Beach Bar", " Kids Club"],
    policies: { checkin: "2:00 PM", checkout: "11:00 AM", cancellation: "Free cancellation up to 48 hours before check-in", payment: "M-Pesa, Visa, Mastercard accepted" },
    roomTypes: [
      { name: "Standard Garden Room", price: 12500, guests: 2, desc: "Garden view, king bed, en-suite with rain shower" },
      { name: "Deluxe Ocean View", price: 18500, guests: 2, desc: "Ocean-facing balcony, king bed, deep bathtub" },
      { name: "Family Suite", price: 28000, guests: 4, desc: "2 bedrooms, living room, private terrace with sea view" },
      { name: "Presidential Suite", price: 65000, guests: 4, desc: "Penthouse level, private plunge pool, butler service" },
    ],
    reviewList: [
      { name: "Amina K.", rating: 5, date: "March 2026", comment: "Absolutely stunning resort! The staff were incredibly welcoming and the food was phenomenal. The infinity pool at sunset is magical. Will definitely return." },
      { name: "David M.", rating: 5, date: "February 2026", comment: "Best beach resort in Kenya hands down. Rooms are spacious and immaculate. The Swahili cuisine at the main restaurant is a highlight." },
      { name: "Sarah W.", rating: 4, date: "January 2026", comment: "Beautiful property with excellent service. The spa treatments are worth every shilling. Highly recommended for a romantic getaway!" },
    ],
    manager: { name: "James Otieno", phone: "+254 700 123 456", email: "reservations@serena-beach.co.ke", whatsapp: "254700123456" },
  },
  2: {
    id: 2, name: "Fairmont Mount Kenya Safari Club", location: "Nanyuki, Laikipia", county: "Laikipia",
    category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", tag: "Luxury", emoji: "",
    bookingUrl: "https://www.fairmont.com/mount-kenya-safari-club",
    description: "Perched on the equator at 7,000 feet, the Fairmont Mount Kenya Safari Club sits on 100 acres of manicured grounds at the foot of Mount Kenya. This historic property — founded by actor William Holden — combines colonial elegance with modern luxury. Wake to Mount Kenya views, spot wildlife from your cottage, and dine under the stars.",
    amenities: [" Game Drives", " Heated Pool", " Fine Dining", " Horse Riding", " Free WiFi", " Airport Transfer", " Tennis", " Yoga & Meditation", " Stargazing Deck", " Butler Service", " Nature Walks", " Photography Tours"],
    policies: { checkin: "3:00 PM", checkout: "12:00 PM", cancellation: "Free cancellation up to 72 hours before check-in", payment: "M-Pesa, Visa, Mastercard, Bank Transfer" },
    roomTypes: [
      { name: "Classic Room", price: 28000, guests: 2, desc: "Mountain view, queen bed, en-suite, fireplace" },
      { name: "Deluxe Cottage", price: 45000, guests: 2, desc: "Private garden, wood fireplace, king bed, soaking tub" },
      { name: "Club Cottage", price: 68000, guests: 4, desc: "2 bedrooms, private veranda, dedicated butler service" },
    ],
    reviewList: [
      { name: "Peter N.", rating: 5, date: "April 2026", comment: "The most magical experience I've had in Kenya. Waking up to Mount Kenya views every morning was absolutely priceless. The game drives were exceptional." },
      { name: "Grace A.", rating: 5, date: "March 2026", comment: "Exceptional service from check-in to checkout. The colonial elegance is perfectly balanced with modern luxury. The equator ceremony at dinner was a memorable touch." },
    ],
    manager: { name: "Carol Wanjiku", phone: "+254 722 987 654", email: "reservations@fairmont-mkenya.co.ke", whatsapp: "254722987654" },
  },
  4: {
    id: 4, name: "Ol Pejeta Bush Camp", location: "Laikipia Conservancy", county: "Laikipia",
    category: "Safari Camp", price: 18000, rating: 4.9, reviews: 87, color: "#a855f7", tag: "Hidden Gem", emoji: "",
    bookingUrl: "https://www.olpejetabushcamp.com",
    description: "Ol Pejeta Bush Camp sits in the heart of the Ol Pejeta Conservancy — home to the world's last two northern white rhinos and Africa's largest black rhino sanctuary. Experience Big Five game drives, chimpanzee sanctuary visits, and the powerful conservation story of this remarkable 90,000-acre conservancy. An intimate camp experience with only 10 tented suites.",
    amenities: [" Rhino Tracking", " Big Five Drives", " Chimp Sanctuary", " Bush Dining", " WiFi in Lodge", " Night Game Drive", " Stargazing", " Conservation Talks", " Photography Guide", " Bush Yoga"],
    policies: { checkin: "2:00 PM", checkout: "10:00 AM", cancellation: "Free cancellation up to 7 days before check-in", payment: "M-Pesa, Visa, Mastercard, USD/EUR accepted" },
    roomTypes: [
      { name: "Tented Suite", price: 18000, guests: 2, desc: "En-suite tent, raised deck, bush views, all meals included" },
      { name: "Family Tent", price: 32000, guests: 4, desc: "Connected sleeping areas, private outdoor shower, all meals" },
    ],
    reviewList: [
      { name: "James L.", rating: 5, date: "April 2026", comment: "Meeting the last northern white rhinos, Sudan's daughters, was a life-changing moment. The conservation work here is inspiring." },
      { name: "Maria S.", rating: 5, date: "March 2026", comment: "The most authentic bush camp experience in East Africa. Small, intimate, exceptional guiding. Worth every shilling." },
    ],
    manager: { name: "Moses Kipchoge", phone: "+254 733 456 789", email: "bookings@olpejetacamp.co.ke", whatsapp: "254733456789" },
  },
};

const defaultProperty = properties[2];

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, offline, error } = useAccommodationProperty(id);
  const { user, token } = useAuth();

  const [selectedRoom, setSelectedRoom] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // ── FEATURES: lightbox, share/save, scroll-reveal, section scroll-spy ──
  // (hooks must stay above the early returns below)
  const [lightbox, setLightbox] = useState(-1);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSec, setActiveSec] = useState("overview");

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [property, loading]);

  useEffect(() => {
    const ids = ["overview", "amenities", "rooms", "policies", "reviews", "contact"];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setActiveSec(e.target.id);
    }), { rootMargin: "-35% 0px -55% 0px" });
    ids.forEach((i) => { const el = document.getElementById(i); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [property, loading]);

  useEffect(() => {
    if (lightbox < 0) return;
    const n = property?.images?.length || 0;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(-1);
      if (e.key === "ArrowRight" && n) setLightbox((i) => (i + 1) % n);
      if (e.key === "ArrowLeft" && n) setLightbox((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, property]);

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: accommodationTheme.bg, minHeight: "100vh" }}>
        <style>{ACCOMMODATION_FONT_CSS}</style>
        <AccommodationNav />
        <LoadingBlock message="Loading property details…" />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: accommodationTheme.bg, minHeight: "100vh", padding: "40px 20px" }}>
        <AccommodationNav />
        <ErrorAlert message={error || "Property not found"} />
        <button type="button" onClick={() => navigate("/accommodation/listings")} style={{ marginTop: "16px", padding: "12px 20px", borderRadius: "10px", border: "none", background: "#fbbf24", fontWeight: 800, cursor: "pointer" }}>
          Back to listings
        </button>
      </div>
    );
  }

  const roomTypes = property.roomTypes || [{ name: "Standard Room", price: property.basePrice || property.price || 0, guests: property.maxGuests || 2, desc: property.description || "Comfortable accommodation" }];
  const roomPrice = roomTypes[selectedRoom]?.price ?? property.basePrice ?? property.price ?? 0;

  // Manager/contact info from owner
  const manager = property.owner || {
    name: property.ownerName || "Property Owner",
    phone: property.ownerPhone || "",
    email: property.ownerEmail || property.owner?.email || "",
    whatsapp: property.ownerPhone?.replace(/\D/g, '') || ""
  };

  // If property has its own booking URL, redirect there; otherwise handle internally
  const handleBook = () => {
    if (property.bookingUrl) {
      window.open(property.bookingUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Contact the property manager to book.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: property.name, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch (e) { /* user cancelled */ }
  };

  const handleBookWithMpesa = () => {
    if (!user) {
      alert("Please log in to book this tourism listing");
      return;
    }
    setPaymentAmount(roomPrice.toString());
    setPaymentPhone(user.phone || "");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
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
          tourismId: property.id,
          phone: paymentPhone,
          amount: paymentAmount,
          checkIn,
          checkOut,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentSuccess(" M-Pesa prompt sent! Check your phone to complete payment.");
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess("");
        }, 3000);
      } else {
        setPaymentError(data.error || " Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError(" Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const BookingWidget = () => (
    <div style={s.bookingCard} className="booking-card">
      <div style={s.bookingHeader}>
        <div>
          <span style={{ ...s.bookingPrice, color: property.color }}>KSh {roomPrice.toLocaleString()}</span>
          <span style={s.bookingPer}>/night</span>
        </div>
        <div style={s.bookingRating}> {property.rating} <span style={{ color: "#9ca3af", fontSize: "11px" }}>({property.reviews})</span></div>
      </div>

      {/* Room selector */}
      <div style={s.roomSelectWrap}>
        <label style={s.fieldLabel}>Select Room Type</label>
        <select style={s.roomSelectEl} value={selectedRoom} onChange={(e) => setSelectedRoom(Number(e.target.value))}>
          {roomTypes.map((r, i) => (
            <option key={r.name} value={i}>{r.name} — KSh {r.price.toLocaleString()}/night</option>
          ))}
        </select>
      </div>

      {/* Booking redirect notice */}
      {property.bookingUrl && (
        <div style={s.redirectNotice}>
          <div style={s.redirectIcon}></div>
          <div>
            <div style={s.redirectTitle}>Direct Booking Available</div>
            <div style={s.redirectSub}>Clicking "Book Now" will redirect you to {property.name}'s official booking site for secure payment.</div>
          </div>
        </div>
      )}

      <div style={s.buttonGroup}>
        <button className="cta-btn" style={{ ...s.bookNowBtn, background: property.color }} onClick={handleBook}>
          {property.bookingUrl ? " Book on Official Site →" : " Request Booking"}
        </button>
        <button className="cta-btn" style={s.mpesaBookBtn} onClick={handleBookWithMpesa}>
          Pay with M-Pesa
        </button>
      </div>
      {property.bookingUrl && <div style={s.bookNote}>You'll be redirected to the property's official booking site</div>}
    </div>
  );

  return (
    <div style={s.root}>
      <style>{ACCOMMODATION_FONT_CSS}{css}</style>
      <AccommodationNav />
      {error && (
        <div style={{ maxWidth: "1100px", margin: "12px auto", padding: "0 16px" }}>
          <ErrorAlert message={`Showing cached preview: ${error}`} />
        </div>
      )}

      {/* TOP BAR */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate("/accommodation/listings")}>← Listings</button>
        <div style={s.breadcrumb}>{property.type || property.category} / {property.name}</div>
        <button style={s.homeBtn} onClick={() => navigate("/accommodation")}> Home</button>
      </div>

      {/* SECTION NAV */}
      <div className="section-nav" role="navigation" aria-label="Page sections">
        {[["overview", "Overview"], ["amenities", "Amenities"], ["rooms", "Rooms"], ["policies", "Policies"], ["reviews", "Reviews"], ["contact", "Contact"]].map(([sid, label]) => (
          <a
            key={sid}
            href={`#${sid}`}
            className={activeSec === sid ? "active" : ""}
            onClick={(e) => { e.preventDefault(); document.getElementById(sid)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="detail-layout">
        {/* ── LEFT ── */}
        <div style={s.leftCol}>

          {/* HERO / MEDIA */}
          {property.images?.length > 0 ? (
            <div style={{ marginBottom: "16px" }}>
              {/* Hero Image */}
              <div className="hero-main" style={{ ...s.heroImg, position: "relative", overflow: "hidden", border: `1px solid ${property.color}25` }}>
                <img
                  src={property.images[0].imageUrl}
                  alt={property.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  className="zoomable"
                  onClick={() => setLightbox(0)}
                />
                {property.tag && <div style={{ ...s.heroTag, background: property.color }}>{property.tag}</div>}
                {property.bookingUrl && (
                  <div style={s.bookingUrlBadge}> Official Booking Available</div>
                )}
                {property.images.length > 1 && (
                  <button className="photo-count" onClick={() => setLightbox(0)}>📷 View all {property.images.length} photos</button>
                )}
              </div>

              {/* Additional Media */}
              {property.audio?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}> Audio Clips</h3>
                  {property.audio.map((url, idx) => (
                    <div key={url} style={{ marginBottom: "12px" }}>
                      <audio
                        controls
                        style={{ width: "100%", borderRadius: "8px" }}
                        preload="metadata"
                      >
                        <source src={url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              )}
              {property.videos?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}> Videos</h3>
                  {property.videos.map((url, idx) => {
                    // Ensure proper Cloudinary video URL format
                    let videoUrl = url;
                    if (url.includes('cloudinary')) {
                      // Remove any existing transformations and add video-specific ones
                      const baseUrl = url.split('/upload/')[0] + '/upload/';
                      const publicId = url.split('/upload/')[1];
                      videoUrl = baseUrl + 'f_mp4,vc_auto,q_auto/' + publicId;
                      // Ensure .mp4 extension
                      if (!videoUrl.endsWith('.mp4')) {
                        videoUrl += '.mp4';
                      }
                    }
                    return (
                      <div key={url} style={{ marginBottom: "12px" }}>
                        <video
                          key={url}
                          src={videoUrl}
                          controls
                          controlsList="nodownload"
                          preload="metadata"
                          playsInline
                          style={{ width: "100%", borderRadius: "12px", maxHeight: "400px", background: "#000" }}
                          onError={(e) => {
                            console.error('Video failed to load:', videoUrl);
                            e.target.style.display = 'none';
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  })}
                </div>
              )}
              {property.images?.length > 1 && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}> More Photos</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                    {property.images.slice(1).map((img, i) => (
                      <img key={img._id || img.imageUrl} src={img.imageUrl || img} alt={property.name} className="thumb" onClick={() => setLightbox(i + 1)} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", border: `1px solid ${property.color}25`, cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...s.heroImg, background: `linear-gradient(135deg, ${property.color}30, ${property.color}10)`, border: `1px solid ${property.color}25` }}>
              <span style={{ fontSize: "88px" }}>{property.emoji}</span>
              {property.tag && <div style={{ ...s.heroTag, background: property.color }}>{property.tag}</div>}
              {property.bookingUrl && (
                <div style={s.bookingUrlBadge}> Official Booking Available</div>
              )}
            </div>
          )}

          {/* INFO */}
          <div style={s.card} className="card reveal" id="overview">
            <div style={s.catBadge}>{property.type || "Accommodation"}</div>
            <h1 style={s.propName}>{property.name}</h1>
            <div style={s.propMeta}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{typeof property.location === 'object' ? property.address : property.location || property.address || "Kenya"}</span>
              </span>
              <span style={{ color: property.color || "#065f46", fontWeight: 700 }}> {property.rating || "4.5"} ({property.reviews || "0"} reviews)</span>
            </div>
            <p style={s.description}>{property.description}</p>
            <div className="action-row">
              <button type="button" className={"action-btn" + (saved ? " on" : "")} aria-pressed={saved} onClick={() => setSaved((v) => !v)}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                {saved ? "Saved" : "Save"}
              </button>
              <button type="button" className="action-btn" onClick={handleShare}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                {copied ? "Link copied" : "Share"}
              </button>
            </div>
          </div>

          {/* QUICK FACTS */}
          <div className="facts reveal">
            {[
              ["🕑", "Check-in", property.checkInTime],
              ["🕚", "Check-out", property.checkOutTime],
              ["👥", "Guests", property.maxGuests ? `Up to ${property.maxGuests}` : null],
              ["🛏️", "Rooms", property.totalRooms],
              ["⭐", "Rating", property.rating ? `${property.rating} / 5` : null],
            ].filter((f) => f[2]).map(([icon, label, val]) => (
              <div key={label} className="fact">
                <span className="fact-icon">{icon}</span>
                <div><div className="fact-val">{val}</div><div className="fact-label">{label}</div></div>
              </div>
            ))}
          </div>

          {/* GPS LOCATION */}
          {(property.location?.lat && property.location?.lng) || (property.coordinates?.lat && property.coordinates?.lng) && (
            <div style={s.card} className="card reveal">
              <h2 style={{ ...s.cardTitle, display: "flex", alignItems: "center", gap: "4px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Exact Location</span>
              </h2>
              <div style={s.locationBox}>
                <div style={s.coordsDisplay}>
                  <div style={s.coordItem}>
                    <span style={s.coordLabel}>Latitude:</span>
                    <span style={s.coordValue}>{property.location?.lat || property.coordinates?.lat}</span>
                  </div>
                  <div style={s.coordItem}>
                    <span style={s.coordLabel}>Longitude:</span>
                    <span style={s.coordValue}>{property.location?.lng || property.coordinates?.lng}</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${property.location?.lat || property.coordinates?.lat},${property.location?.lng || property.coordinates?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={s.mapBtn}
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}

          {/* MOBILE BOOK */}
          <button className="mobile-book-btn" style={{ ...s.mobileBookBtn, background: property.color }} onClick={() => setBookingOpen(true)}>
            {property.bookingUrl ? " Book on Official Site" : " Enquire Now"} — KSh {roomPrice.toLocaleString()}/night
          </button>

          {/* AMENITIES */}
          <div style={s.card} className="card reveal" id="amenities">
            <h2 style={s.cardTitle}>Amenities & Features</h2>
            <div className="amenities-grid">
              {property.amenities.map((a) => (
                <div key={a} style={s.amenityItem} className="amenity">{a}</div>
              ))}
            </div>
          </div>

          {/* ROOM TYPES */}
          <div style={s.card} className="card reveal" id="rooms">
            <h2 style={s.cardTitle}>Room Types & Rates</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {roomTypes.map((r, i) => (
                <div
                  key={r.name}
                  style={{ ...s.roomCard, ...(selectedRoom === i ? { borderColor: property.color, background: property.color + "08" } : {}) }}
                  onClick={() => setSelectedRoom(i)}
                  className="room-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px", flexWrap: "wrap", gap: "6px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", margin: 0 }}>{r.name}</h3>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: property.color }}>KSh {r.price.toLocaleString()}<span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 400 }}>/night</span></div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{r.desc}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}> Up to {r.guests} guests</div>
                  {selectedRoom === i && <div style={{ position: "absolute", top: "10px", right: "10px", background: property.color, color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* POLICIES */}
          <div style={s.card} className="card reveal" id="policies">
            <h2 style={s.cardTitle}>Policies</h2>
            <div className="policies-grid">
              <div style={s.policyItem}><div style={s.policyLabel}>Check-in</div><div style={s.policyVal}>{property.checkInTime || "14:00"}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Check-out</div><div style={s.policyVal}>{property.checkOutTime || "11:00"}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>House Rules</div><div style={s.policyVal}>{property.houseRules || "Contact property for details"}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Payment Methods</div><div style={s.policyVal}>M-Pesa, Visa, Mastercard accepted</div></div>
            </div>
          </div>

          {/* REVIEWS */}
          <div style={s.card} className="card reveal" id="reviews">
            <h2 style={s.cardTitle}>Guest Reviews</h2>
            <CompactReviews
              reviews={property.reviewList || []}
              rating={property.rating}
              totalReviews={property.reviews}
            />
          </div>

          {/* CONTACT */}
          <div style={s.card} className="card reveal" id="contact">
            <h3 style={s.cardTitle}>Contact Property Manager</h3>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "14px" }}> {manager.name} — Property Representative</div>
            <div style={s.contactBtns}>
              <a href={`tel:${manager.phone}`} style={s.contactBtn}> Call</a>
              <a href={`https://wa.me/${manager.whatsapp}`} style={{ ...s.contactBtn, background: "#22c55e" }} target="_blank" rel="noreferrer"> WhatsApp</a>
              <a href={`mailto:${manager.email}`} style={{ ...s.contactBtn, background: "#3b82f6" }}> Email</a>
            </div>
            {property.bookingUrl && (
              <a href={property.bookingUrl} target="_blank" rel="noreferrer" style={{ ...s.contactBtn, background: property.color || "#065f46", display: "block", textAlign: "center", marginTop: "10px", padding: "12px" }}>
                Visit Official Website
              </a>
            )}

            {/* In-App Chat */}
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <MessagingSystem
                recipientId={manager.email}
                recipientName={manager.name}
                recipientType="Property Manager"
                propertyId={property._id || property.id}
                propertyTitle={property.name}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT (desktop) ── */}
        <aside className="booking-col">
          <BookingWidget />
          <div style={s.sideContact}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" }}>Need Help?</h3>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}> {manager.name}</div>
            <div style={s.contactBtns}>
              <a href={`tel:${manager.phone}`} style={s.contactBtn}> Call</a>
              <a href={`https://wa.me/${manager.whatsapp}`} style={{ ...s.contactBtn, background: "#22c55e" }} target="_blank" rel="noreferrer"> WhatsApp</a>
              <a href={`mailto:${manager.email}`} style={{ ...s.contactBtn, background: "#3b82f6" }}> Email</a>
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE SHEET */}
      {bookingOpen && (
        <div style={s.overlay} onClick={() => setBookingOpen(false)}>
          <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "#1f2937" }}>Book Your Stay</span>
              <button style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "30px", height: "30px", fontSize: "14px", cursor: "pointer" }} onClick={() => setBookingOpen(false)}>✕</button>
            </div>
            <BookingWidget />
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {lightbox >= 0 && property.images?.length > 0 && (
        <div className="lightbox" onClick={() => setLightbox(-1)} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button className="lb-close" aria-label="Close photo viewer" onClick={() => setLightbox(-1)}>✕</button>
          {property.images.length > 1 && (
            <button className="lb-nav lb-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + property.images.length) % property.images.length); }}>‹</button>
          )}
          <img key={lightbox} className="lb-img" src={property.images[lightbox]?.imageUrl || property.images[lightbox]} alt={property.name} onClick={(e) => e.stopPropagation()} />
          {property.images.length > 1 && (
            <button className="lb-nav lb-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % property.images.length); }}>›</button>
          )}
          <div className="lb-count">{lightbox + 1} / {property.images.length}</div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={s.paymentModal} onClick={() => setShowPaymentModal(false)}>
          <div style={s.paymentModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.paymentTitle}> Book Tourism - M-Pesa Payment</h3>
            <p style={s.paymentSubtitle}>
              {property.name} - KES {paymentAmount}
            </p>
            {paymentSuccess && (
              <div style={s.paymentSuccess}>{paymentSuccess}</div>
            )}
            {paymentError && (
              <div style={s.paymentError}>{paymentError}</div>
            )}
            {!paymentSuccess && (
              <form onSubmit={handlePaymentSubmit} style={s.paymentForm}>
                <div style={s.paymentField}>
                  <label style={s.paymentLabel}>M-Pesa Phone Number</label>
                  <PhoneInput
                    value={paymentPhone}
                    onChange={(value) => setPaymentPhone(value)}
                    style={s.paymentInput}
                    required
                  />
                </div>
                <div style={s.paymentField}>
                  <label style={s.paymentLabel}>Amount (KES)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={s.paymentInput}
                    required
                  />
                </div>
                <div style={s.paymentField}>
                  <label style={s.paymentLabel}>Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={s.paymentInput}
                    required
                  />
                </div>
                <div style={s.paymentField}>
                  <label style={s.paymentLabel}>Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={s.paymentInput}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={s.paymentButton}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Processing..." : " Pay with M-Pesa"}
                </button>
                <button
                  type="button"
                  style={s.paymentCancelButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh", overflowX: "hidden" },
  topBar: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" },
  backBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", whiteSpace: "nowrap" },
  homeBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", whiteSpace: "nowrap" },
  breadcrumb: { fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "center" },

  leftCol: { display: "flex", flexDirection: "column", gap: "16px" },

  heroImg: { height: "280px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  heroTag: { position: "absolute", top: "14px", left: "14px", color: "white", fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" },
  bookingUrlBadge: { position: "absolute", bottom: "14px", left: "14px", background: "rgba(255,255,255,0.95)", color: "#374151", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px", border: "1px solid #e5e7eb" },

  card: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb" },
  cardTitle: { fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "16px" },
  catBadge: { display: "inline-block", background: "#f3f4f6", color: "#6b7280", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  propName: { fontSize: "22px", fontWeight: 900, color: "#1f2937", margin: "0 0 8px", lineHeight: 1.2 },
  propMeta: { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "14px", fontSize: "13px", color: "#6b7280" },
  description: { fontSize: "14px", color: "#4b5563", lineHeight: 1.8, margin: 0 },

  mobileBookBtn: { display: "none", width: "100%", color: "white", border: "none", borderRadius: "12px", padding: "16px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },

  amenityItem: { fontSize: "13px", color: "#4b5563", padding: "9px 12px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" },

  roomCard: { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "14px", cursor: "pointer", transition: "all 0.2s", position: "relative" },

  policyItem: { background: "#f9fafb", borderRadius: "10px", padding: "12px" },
  policyLabel: { fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" },
  policyVal: { fontSize: "12px", color: "#1f2937", fontWeight: 600, lineHeight: 1.5 },

  reviewCard: { border: "1px solid #f3f4f6", borderRadius: "10px", padding: "14px", marginBottom: "12px" },
  reviewAvatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#fbbf24", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", flexShrink: 0 },

  contactBtns: { display: "flex", gap: "8px" },
  contactBtn: { flex: 1, background: "#1f2937", color: "white", border: "none", borderRadius: "8px", padding: "10px 6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "block" },

  // GPS Location
  locationBox: { background: "#f9fafb", borderRadius: "10px", padding: "14px", border: "1px solid #e5e7eb" },
  coordsDisplay: { display: "flex", gap: "20px", marginBottom: "12px" },
  coordItem: { display: "flex", flexDirection: "column", gap: "4px" },
  coordLabel: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" },
  coordValue: { fontSize: "14px", fontWeight: 600, color: "#1f2937" },
  mapBtn: { display: "block", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none" },

  // Booking widget
  bookingCard: { background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" },
  bookingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  bookingPrice: { fontSize: "24px", fontWeight: 900 },
  bookingPer: { fontSize: "13px", color: "#9ca3af" },
  bookingRating: { fontSize: "13px", color: "#fbbf24", fontWeight: 700 },
  roomSelectWrap: { marginBottom: "14px" },
  fieldLabel: { display: "block", fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" },
  roomSelectEl: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" },

  redirectNotice: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px", marginBottom: "14px", display: "flex", gap: "10px", alignItems: "flex-start" },
  redirectIcon: { fontSize: "20px", flexShrink: 0 },
  redirectTitle: { fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "3px" },
  redirectSub: { fontSize: "11px", color: "#15803d", lineHeight: 1.5 },

  bookNowBtn: { width: "100%", color: "white", border: "none", borderRadius: "10px", padding: "15px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: "8px" },
  bookNote: { textAlign: "center", fontSize: "11px", color: "#9ca3af" },
  buttonGroup: { display: "flex", gap: "8px" },
  mpesaBookBtn: { flex: 1, background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "10px", padding: "15px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },

  sideContact: { background: "white", borderRadius: "14px", padding: "18px", border: "1px solid #e5e7eb" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" },
  sheet: { background: "white", borderRadius: "20px 20px 0 0", padding: "20px 20px 32px", width: "100%", maxHeight: "85vh", overflowY: "auto" },
  sheetHandle: { width: "40px", height: "4px", background: "#e5e7eb", borderRadius: "2px", margin: "0 auto 16px" },

  paymentModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" },
  paymentModalContent: { background: "white", borderRadius: "12px", maxWidth: "400px", width: "100%", padding: "24px", border: "1px solid #e5e7eb", position: "relative" },
  paymentTitle: { fontSize: "1.2rem", margin: "0 0 12px 0", color: "#1f2937", textAlign: "center" },
  paymentSubtitle: { fontSize: "0.9rem", color: "#6b7280", textAlign: "center", marginBottom: "20px" },
  paymentForm: { display: "flex", flexDirection: "column", gap: "16px" },
  paymentField: { display: "flex", flexDirection: "column", gap: "6px" },
  paymentLabel: { fontSize: "0.85rem", color: "#1f2937", fontWeight: 600 },
  paymentInput: { padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#f9fafb", color: "#1f2937", fontSize: "0.95rem", outline: "none" },
  paymentButton: { padding: "12px 16px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.3s ease" },
  paymentCancelButton: { padding: "12px 16px", background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.3s ease" },
  paymentSuccess: { background: "rgba(34, 197, 94, 0.15)", color: "#86efac", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center", fontSize: "0.9rem", border: "1px solid rgba(34, 197, 94, 0.3)" },
  paymentError: { background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center", fontSize: "0.9rem", border: "1px solid rgba(239, 68, 68, 0.3)" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus { border-color: #fbbf24 !important; outline: none; }
  .room-card:hover { border-color: #fbbf24 !important; }

  .detail-layout {
    max-width: 1300px;
    margin: 0 auto;
    padding: 20px 16px;
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    align-items: start;
  }

  .booking-col {
    position: sticky;
    top: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 10px;
  }

  .policies-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 860px) {
    .detail-layout { grid-template-columns: 1fr; }
    .booking-col { display: none; }
    .mobile-book-btn { display: block !important; }
    .amenities-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .policies-grid { grid-template-columns: 1fr; }
  }

  /* ── NEW LAYOUT + ANIMATION ── */
  html { scroll-behavior: smooth; }
  :root { --nav-h: 0px; } /* set to your sticky AccommodationNav height (e.g. 61px) if it is sticky */

  .hero-main { height: clamp(260px, 42vw, 470px) !important; border-radius: 20px !important; box-shadow: 0 18px 50px rgba(15,23,42,.18); animation: heroIn .8s cubic-bezier(.2,.8,.2,1) backwards; }
  @keyframes heroIn { from { opacity: 0; transform: scale(.97); } }
  .hero-main .zoomable { cursor: zoom-in; transition: transform .8s cubic-bezier(.2,.8,.2,1); }
  .hero-main:hover .zoomable { transform: scale(1.04); }
  .hero-main::after { content: ""; position: absolute; inset: auto 0 0 0; height: 35%; background: linear-gradient(to top, rgba(0,0,0,.35), transparent); pointer-events: none; }
  .photo-count { position: absolute; right: 14px; bottom: 14px; z-index: 2; border: none; cursor: pointer; background: rgba(255,255,255,.95); color: #1f2937; font: 700 12px 'DM Sans', sans-serif; padding: 9px 16px; border-radius: 999px; box-shadow: 0 6px 18px rgba(0,0,0,.2); transition: transform .2s; }
  .photo-count:hover { transform: translateY(-2px); }
  .thumb { transition: transform .35s, box-shadow .35s; }
  .thumb:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 14px 30px rgba(0,0,0,.2); }

  .section-nav { position: sticky; top: var(--nav-h); z-index: 50; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 10px 16px; background: rgba(255,255,255,.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; }
  .section-nav::-webkit-scrollbar { display: none; }
  .section-nav a { flex: none; text-decoration: none; color: #4b5563; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 999px; transition: background .2s, color .2s; }
  .section-nav a:hover { background: #f3f4f6; }
  .section-nav a.active { background: #1f2937; color: #fff; }
  .card, .facts { scroll-margin-top: calc(var(--nav-h) + 64px); }

  .reveal { opacity: 0; }
  .reveal.in { opacity: 1; animation: revealUp .7s cubic-bezier(.2,.8,.2,1) backwards; }
  @keyframes revealUp { from { opacity: 0; transform: translateY(30px); } }
  .card { transition: box-shadow .3s; }
  .card:hover { box-shadow: 0 14px 36px rgba(15,23,42,.08); }

  .action-row { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
  .action-btn { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font: 700 13px 'DM Sans', sans-serif; color: #374151; background: #fff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 9px 18px; transition: background .2s, transform .15s, color .2s; }
  .action-btn:hover { background: #f9fafb; }
  .action-btn:active { transform: scale(.95); }
  .action-btn.on { color: #e0355e; border-color: #f7b4c4; background: #fff1f4; animation: heartPop .4s; }
  .action-btn.on svg { fill: currentColor; }
  @keyframes heartPop { 40% { transform: scale(1.12); } }

  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .fact { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
  .fact-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 18px; background: linear-gradient(135deg, #eef2ff, #fdf2f8); flex: none; }
  .fact-val { font-size: 14px; font-weight: 800; color: #1f2937; }
  .fact-label { font-size: 11px; color: #9ca3af; font-weight: 600; }

  .amenity { transition: transform .2s, background .2s, border-color .2s; }
  .amenity:hover { transform: translateY(-2px); background: #fff !important; border-color: #fbbf24 !important; }
  .room-card { transition: transform .2s, box-shadow .2s, border-color .2s; }
  .room-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.08); }

  .booking-card { transition: box-shadow .3s; }
  .booking-card:hover { box-shadow: 0 16px 44px rgba(15,23,42,.16) !important; }
  .cta-btn { transition: transform .15s, filter .2s, box-shadow .2s; }
  .cta-btn:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 10px 22px rgba(0,0,0,.2); }
  .cta-btn:active { transform: scale(.97); }

  .lightbox { position: fixed; inset: 0; z-index: 3000; background: rgba(8,12,20,.94); display: flex; align-items: center; justify-content: center; animation: fadeIn .25s; }
  @keyframes fadeIn { from { opacity: 0; } }
  .lb-img { max-width: 92vw; max-height: 84vh; border-radius: 14px; object-fit: contain; animation: lbIn .35s cubic-bezier(.2,.8,.2,1); }
  @keyframes lbIn { from { opacity: 0; transform: scale(.94); } }
  .lb-close, .lb-nav { position: absolute; border: none; cursor: pointer; color: #fff; background: rgba(255,255,255,.14); border-radius: 50%; display: grid; place-items: center; transition: background .2s; }
  .lb-close:hover, .lb-nav:hover { background: rgba(255,255,255,.28); }
  .lb-close { top: calc(16px + env(safe-area-inset-top, 0px)); right: 16px; width: 42px; height: 42px; font-size: 16px; }
  .lb-nav { top: 50%; transform: translateY(-50%); width: 48px; height: 48px; font-size: 30px; padding-bottom: 4px; }
  .lb-prev { left: 14px; } .lb-next { right: 14px; }
  .lb-count { position: absolute; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%); color: #e5e7eb; font: 600 13px 'DM Sans', sans-serif; background: rgba(255,255,255,.12); padding: 6px 14px; border-radius: 999px; }

  @media (max-width: 860px) {
    .detail-layout { padding-bottom: 100px; }
    .mobile-book-btn { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); width: auto !important; z-index: 90; box-shadow: 0 14px 34px rgba(0,0,0,.35); animation: ctaUp .5s .4s cubic-bezier(.2,.8,.2,1) backwards; }
    .hero-main { border-radius: 16px !important; }
    .lb-nav { width: 40px; height: 40px; font-size: 26px; }
  }
  @keyframes ctaUp { from { opacity: 0; transform: translateY(30px); } }

  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; }
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;