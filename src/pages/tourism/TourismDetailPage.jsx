import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useTourismProperty,
  TourismNav,
  LoadingBlock,
  ErrorAlert,
  TOURISM_FONT_CSS,
  tourismTheme,
} from "../../features/tourism";
import { useAuth } from "../../context/AuthContext";

const properties = {
  1: {
    id: 1, name: "Serena Beach Resort & Spa", location: "Nyali, Mombasa", county: "Mombasa",
    category: "Beach Resort", price: 12500, rating: 4.8, reviews: 312, color: "#0ea5e9", tag: "Top Rated", emoji: "🏖️",
    bookingUrl: "https://www.serenahotels.com/mombasa", // Owner's own booking site
    description: "Experience the ultimate coastal getaway at Serena Beach Resort & Spa. Nestled along the pristine shores of Nyali, Mombasa, our resort offers breathtaking Indian Ocean views, world-class amenities, and an unparalleled blend of modern luxury with authentic Swahili hospitality. Award-winning cuisine, a full-service spa, and dedicated kids club make us the perfect destination for families, couples, and corporate retreats.",
    amenities: ["🏊 Infinity Pool", "🍽️ 3 Restaurants", "💆 Full Spa", "🏋️ Fitness Centre", "📶 Free WiFi", "🚗 Free Parking", "🎾 Tennis Court", "🚣 Water Sports", "🌅 Beach Access", "🛎️ 24hr Room Service", "🍸 Beach Bar", "👶 Kids Club"],
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
    category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", tag: "Luxury", emoji: "⛰️",
    bookingUrl: "https://www.fairmont.com/mount-kenya-safari-club",
    description: "Perched on the equator at 7,000 feet, the Fairmont Mount Kenya Safari Club sits on 100 acres of manicured grounds at the foot of Mount Kenya. This historic property — founded by actor William Holden — combines colonial elegance with modern luxury. Wake to Mount Kenya views, spot wildlife from your cottage, and dine under the stars.",
    amenities: ["🦁 Game Drives", "🏊 Heated Pool", "🍽️ Fine Dining", "🐴 Horse Riding", "📶 Free WiFi", "🚗 Airport Transfer", "🎾 Tennis", "🧘 Yoga & Meditation", "🔭 Stargazing Deck", "🛎️ Butler Service", "🌿 Nature Walks", "📸 Photography Tours"],
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
    category: "Safari Camp", price: 18000, rating: 4.9, reviews: 87, color: "#a855f7", tag: "Hidden Gem", emoji: "🦁",
    bookingUrl: "https://www.olpejetabushcamp.com",
    description: "Ol Pejeta Bush Camp sits in the heart of the Ol Pejeta Conservancy — home to the world's last two northern white rhinos and Africa's largest black rhino sanctuary. Experience Big Five game drives, chimpanzee sanctuary visits, and the powerful conservation story of this remarkable 90,000-acre conservancy. An intimate camp experience with only 10 tented suites.",
    amenities: ["🦏 Rhino Tracking", "🦁 Big Five Drives", "🐒 Chimp Sanctuary", "🍽️ Bush Dining", "📶 WiFi in Lodge", "🌿 Night Game Drive", "🔭 Stargazing", "🎙️ Conservation Talks", "📸 Photography Guide", "🧘 Bush Yoga"],
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

export default function TourismDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, roomTypes, loading, error } = useTourismProperty(id);

  const [selectedRoom, setSelectedRoom] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: tourismTheme.bg, minHeight: "100vh" }}>
        <style>{TOURISM_FONT_CSS}</style>
        <TourismNav />
        <LoadingBlock message="Loading property details…" />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: tourismTheme.bg, minHeight: "100vh", padding: "40px 20px" }}>
        <TourismNav />
        <ErrorAlert message={error || "Property not found"} />
        <button type="button" onClick={() => navigate("/tourism/listings")} style={{ marginTop: "16px", padding: "12px 20px", borderRadius: "10px", border: "none", background: "#fbbf24", fontWeight: 800, cursor: "pointer" }}>
          Back to listings
        </button>
      </div>
    );
  }

  const roomPrice = roomTypes[selectedRoom]?.price ?? property.price;
  const { user, token } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // If property has its own booking URL, redirect there; otherwise handle internally
  const handleBook = () => {
    if (property.bookingUrl) {
      window.open(property.bookingUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Contact the property manager to book.");
    }
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
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";
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
        setPaymentSuccess("✅ M-Pesa prompt sent! Check your phone to complete payment.");
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess("");
        }, 3000);
      } else {
        setPaymentError(data.error || "❌ Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError("❌ Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const BookingWidget = () => (
    <div style={s.bookingCard}>
      <div style={s.bookingHeader}>
        <div>
          <span style={{ ...s.bookingPrice, color: property.color }}>KSh {roomPrice.toLocaleString()}</span>
          <span style={s.bookingPer}>/night</span>
        </div>
        <div style={s.bookingRating}>⭐ {property.rating} <span style={{ color: "#9ca3af", fontSize: "11px" }}>({property.reviews})</span></div>
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
          <div style={s.redirectIcon}>🔗</div>
          <div>
            <div style={s.redirectTitle}>Direct Booking Available</div>
            <div style={s.redirectSub}>Clicking "Book Now" will redirect you to {property.name}'s official booking site for secure payment.</div>
          </div>
        </div>
      )}

      <div style={s.buttonGroup}>
        <button style={{ ...s.bookNowBtn, background: property.color }} onClick={handleBook}>
          {property.bookingUrl ? "🔗 Book on Official Site →" : "📞 Request Booking"}
        </button>
        <button style={s.mpesaBookBtn} onClick={handleBookWithMpesa}>
          📱 Pay with M-Pesa
        </button>
      </div>
      {property.bookingUrl && <div style={s.bookNote}>You'll be redirected to {new URL(property.bookingUrl).hostname}</div>}
    </div>
  );

  return (
    <div style={s.root}>
      <style>{TOURISM_FONT_CSS}{css}</style>
      <TourismNav />
      {error && (
        <div style={{ maxWidth: "1100px", margin: "12px auto", padding: "0 16px" }}>
          <ErrorAlert message={`Showing cached preview: ${error}`} />
        </div>
      )}

      {/* TOP BAR */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate("/tourism/listings")}>← Listings</button>
        <div style={s.breadcrumb}>{property.category} / {property.name}</div>
        <button style={s.homeBtn} onClick={() => navigate("/tourism")}>🏠 Home</button>
      </div>

      <div className="detail-layout">
        {/* ── LEFT ── */}
        <div style={s.leftCol}>

          {/* HERO / MEDIA */}
          {(property.images?.length > 0 || property.videos?.length > 0) ? (
            <div style={{ marginBottom: "16px" }}>
              {property.images?.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: property.videos?.length ? "12px" : 0 }}>
                  {property.images.map((url) => (
                    <img key={url} src={url} alt={property.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", border: `1px solid ${property.color}25` }} />
                  ))}
                </div>
              )}
              {property.videos?.map((url) => (
                <video key={url} src={url} controls style={{ width: "100%", maxHeight: "360px", borderRadius: "12px", marginBottom: "8px" }} />
              ))}
            </div>
          ) : (
            <div style={{ ...s.heroImg, background: `linear-gradient(135deg, ${property.color}30, ${property.color}10)`, border: `1px solid ${property.color}25` }}>
              <span style={{ fontSize: "88px" }}>{property.emoji}</span>
              {property.tag && <div style={{ ...s.heroTag, background: property.color }}>{property.tag}</div>}
              {property.bookingUrl && (
                <div style={s.bookingUrlBadge}>🔗 Official Booking Available</div>
              )}
            </div>
          )}

          {/* INFO */}
          <div style={s.card}>
            <div style={s.catBadge}>{property.category}</div>
            <h1 style={s.propName}>{property.name}</h1>
            <div style={s.propMeta}>
              <span>📍 {property.location}, {property.county} County</span>
              <span style={{ color: property.color, fontWeight: 700 }}>⭐ {property.rating} ({property.reviews} reviews)</span>
            </div>
            <p style={s.description}>{property.description}</p>
          </div>

          {/* MOBILE BOOK */}
          <button className="mobile-book-btn" style={{ ...s.mobileBookBtn, background: property.color }} onClick={() => setBookingOpen(true)}>
            {property.bookingUrl ? "🔗 Book on Official Site" : "📅 Enquire Now"} — KSh {roomPrice.toLocaleString()}/night
          </button>

          {/* AMENITIES */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Amenities & Features</h2>
            <div className="amenities-grid">
              {property.amenities.map((a) => (
                <div key={a} style={s.amenityItem}>{a}</div>
              ))}
            </div>
          </div>

          {/* ROOM TYPES */}
          <div style={s.card}>
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
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>👥 Up to {r.guests} guests</div>
                  {selectedRoom === i && <div style={{ position: "absolute", top: "10px", right: "10px", background: property.color, color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* POLICIES */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Policies</h2>
            <div className="policies-grid">
              <div style={s.policyItem}><div style={s.policyLabel}>Check-in</div><div style={s.policyVal}>{property.policies.checkin}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Check-out</div><div style={s.policyVal}>{property.policies.checkout}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Cancellation</div><div style={s.policyVal}>{property.policies.cancellation}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Payment Methods</div><div style={s.policyVal}>{property.policies.payment}</div></div>
            </div>
          </div>

          {/* REVIEWS */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Guest Reviews</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "42px", fontWeight: 900, color: property.color, lineHeight: 1 }}>{property.rating}</div>
              <div>
                <div style={{ fontSize: "18px", marginBottom: "3px" }}>{"⭐".repeat(Math.round(property.rating))}</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>{property.reviews} verified reviews</div>
              </div>
            </div>
            {(property.reviewList || []).map((r) => (
              <div key={r.name} style={s.reviewCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={s.reviewAvatar}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937" }}>{r.name}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>{r.date} · {"⭐".repeat(r.rating)}</div>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.65, margin: 0 }}>{r.comment}</p>
              </div>
            ))}
          </div>

          {/* CONTACT */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Contact Property Manager</h3>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "14px" }}>👤 {property.manager.name} — Property Representative</div>
            <div style={s.contactBtns}>
              <a href={`tel:${property.manager.phone}`} style={s.contactBtn}>📞 Call</a>
              <a href={`https://wa.me/${property.manager.whatsapp}`} style={{ ...s.contactBtn, background: "#22c55e" }} target="_blank" rel="noreferrer">💬 WhatsApp</a>
              <a href={`mailto:${property.manager.email}`} style={{ ...s.contactBtn, background: "#3b82f6" }}>📧 Email</a>
            </div>
            {property.bookingUrl && (
              <a href={property.bookingUrl} target="_blank" rel="noreferrer" style={{ ...s.contactBtn, background: property.color, display: "block", textAlign: "center", marginTop: "10px", padding: "12px" }}>
                🌐 Visit Official Website
              </a>
            )}
          </div>
        </div>

        {/* ── RIGHT (desktop) ── */}
        <aside className="booking-col">
          <BookingWidget />
          <div style={s.sideContact}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" }}>Need Help?</h3>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>👤 {property.manager.name}</div>
            <div style={s.contactBtns}>
              <a href={`tel:${property.manager.phone}`} style={s.contactBtn}>📞 Call</a>
              <a href={`https://wa.me/${property.manager.whatsapp}`} style={{ ...s.contactBtn, background: "#22c55e" }} target="_blank" rel="noreferrer">💬 WhatsApp</a>
              <a href={`mailto:${property.manager.email}`} style={{ ...s.contactBtn, background: "#3b82f6" }}>📧 Email</a>
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

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={s.paymentModal} onClick={() => setShowPaymentModal(false)}>
          <div style={s.paymentModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.paymentTitle}>💳 Book Tourism - M-Pesa Payment</h3>
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
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="2547XXXXXXXX"
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
                  {paymentLoading ? "Processing..." : "📱 Pay with M-Pesa"}
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
`;