import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const properties = {
  1: {
    id: 1,
    name: "Serena Beach Resort",
    location: "Mombasa, Coast",
    county: "Mombasa",
    category: "Beach Resort",
    price: 12500,
    rating: 4.8,
    reviews: 312,
    color: "#0ea5e9",
    tag: "Top Rated",
    description: "Experience the ultimate coastal getaway at Serena Beach Resort. Nestled along the pristine shores of Mombasa, our resort offers breathtaking ocean views, world-class amenities, and an unparalleled blend of modern luxury and authentic Swahili hospitality. Whether you're seeking relaxation by our infinity pool or adventure through water sports, Serena Beach Resort delivers an unforgettable Kenyan coastal experience.",
    amenities: ["🏊 Infinity Pool", "🍽️ 3 Restaurants", "💆 Full Spa", "🏋️ Gym", "📶 Free WiFi", "🚗 Free Parking", "🎾 Tennis Court", "🚣 Water Sports", "🌅 Beach Access", "🛎️ 24hr Room Service", "🍸 Beach Bar", "👶 Kids Club"],
    policies: {
      checkin: "2:00 PM",
      checkout: "11:00 AM",
      cancellation: "Free cancellation up to 48 hours before check-in",
      payment: "M-Pesa, Visa, Mastercard accepted",
    },
    roomTypes: [
      { name: "Standard Room", price: 12500, guests: 2, desc: "Garden view, king bed, en-suite bathroom" },
      { name: "Deluxe Ocean View", price: 18500, guests: 2, desc: "Ocean-facing balcony, king bed, bathtub" },
      { name: "Family Suite", price: 28000, guests: 4, desc: "2 bedrooms, living room, private terrace" },
      { name: "Presidential Suite", price: 65000, guests: 4, desc: "Penthouse, private pool, butler service" },
    ],
    reviewList: [
      { name: "Amina K.", rating: 5, date: "March 2026", comment: "Absolutely stunning resort! The staff were incredibly welcoming and the food was phenomenal. Will definitely return." },
      { name: "David M.", rating: 5, date: "February 2026", comment: "Best beach resort in Kenya hands down. The infinity pool overlooking the ocean is magical at sunset." },
      { name: "Sarah W.", rating: 4, date: "January 2026", comment: "Beautiful property with excellent service. The spa treatments are worth every shilling. Highly recommended!" },
    ],
    manager: { name: "James Otieno", phone: "+254 700 123 456", email: "reservations@serena-beach.co.ke", whatsapp: "+254 700 123 456" },
  },
};

// Fallback for other IDs
const defaultProperty = {
  id: 2, name: "Fairmont Mount Kenya Safari Club", location: "Nanyuki, Laikipia", county: "Laikipia",
  category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", tag: "Luxury",
  description: "Perched on the equator at the foot of Mount Kenya, the Fairmont Mount Kenya Safari Club offers an incomparable safari and mountain lodge experience. This historic property, once frequented by celebrities and dignitaries, combines colonial elegance with modern luxury amid 100 acres of manicured grounds.",
  amenities: ["🦁 Game Drives", "🏊 Heated Pool", "🍽️ Fine Dining", "🐴 Horse Riding", "📶 Free WiFi", "🚗 Airport Transfer", "🎾 Tennis", "🧘 Yoga", "🔭 Star Gazing", "🛎️ Butler Service", "🌿 Nature Walks", "📸 Photography Tours"],
  policies: { checkin: "3:00 PM", checkout: "12:00 PM", cancellation: "Free cancellation up to 72 hours before check-in", payment: "M-Pesa, Visa, Mastercard, Bank Transfer" },
  roomTypes: [
    { name: "Classic Room", price: 28000, guests: 2, desc: "Mountain view, queen bed, en-suite" },
    { name: "Deluxe Cottage", price: 45000, guests: 2, desc: "Private garden, fireplace, king bed" },
    { name: "Club Cottage", price: 68000, guests: 4, desc: "2 bedrooms, private veranda, butler" },
  ],
  reviewList: [
    { name: "Peter N.", rating: 5, date: "April 2026", comment: "The most magical safari experience I've ever had. Waking up to Mount Kenya views is priceless." },
    { name: "Grace A.", rating: 5, date: "March 2026", comment: "Exceptional service and stunning location. Worth every penny for a truly special occasion." },
  ],
  manager: { name: "Carol Wanjiku", phone: "+254 722 987 654", email: "reservations@fairmont-mkenya.co.ke", whatsapp: "+254 722 987 654" },
};

export default function TourismDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = properties[id] || defaultProperty;

  const [selectedRoom, setSelectedRoom] = useState(0);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(1);
  const [showBooking, setShowBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const nights = checkin && checkout
    ? Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
    : 1;
  const roomPrice = property.roomTypes[selectedRoom].price;
  const subtotal = roomPrice * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleBook = () => {
    if (!checkin || !checkout) { alert("Please select check-in and check-out dates."); return; }
    setBooked(true);
  };

  if (booked) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "480px", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>Booking Confirmed!</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "24px" }}>
            Your booking at <strong>{property.name}</strong> has been confirmed.
            A confirmation will be sent to your email and WhatsApp.
          </p>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700, marginBottom: "8px" }}>Booking Summary</div>
            <div style={{ fontSize: "13px", color: "#15803d" }}>📍 {property.name}</div>
            <div style={{ fontSize: "13px", color: "#15803d" }}>📅 {checkin} → {checkout} ({nights} nights)</div>
            <div style={{ fontSize: "13px", color: "#15803d" }}>🛏️ {property.roomTypes[selectedRoom].name}</div>
            <div style={{ fontSize: "13px", color: "#15803d", fontWeight: 700 }}>💰 Total: KSh {total.toLocaleString()}</div>
          </div>
          <button style={{ background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px 32px", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/tourism")}>
            Browse More Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* BACK */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate("/tourism/listings")}>← Back to Listings</button>
        <div style={s.breadcrumb}>Tourism / {property.category} / {property.name}</div>
      </div>

      <div style={s.layout}>
        {/* LEFT COLUMN */}
        <div style={s.leftCol}>

          {/* HERO IMAGE */}
          <div style={{ ...s.heroImg, background: `linear-gradient(135deg, ${property.color}25, ${property.color}10)`, border: `1px solid ${property.color}30` }}>
            <span style={{ fontSize: "100px" }}>
              {{ "Beach Resort": "🏖️", "Mountain Lodge": "⛰️", "Hotel": "🏨", "Adventure Tour": "🗻", "Camping Grounds": "🏕️" }[property.category] || "🏨"}
            </span>
            {property.tag && <div style={{ ...s.heroTag, background: property.color }}>{property.tag}</div>}
          </div>

          {/* INFO */}
          <div style={s.infoCard}>
            <div style={s.catBadge}>{property.category}</div>
            <h1 style={s.propName}>{property.name}</h1>
            <div style={s.propMeta}>
              <span>📍 {property.location}</span>
              <span style={{ ...s.ratingBadge, color: property.color }}>⭐ {property.rating} ({property.reviews} reviews)</span>
            </div>
            <p style={s.description}>{property.description}</p>
          </div>

          {/* AMENITIES */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Amenities & Features</h2>
            <div style={s.amenitiesGrid}>
              {property.amenities.map((a) => (
                <div key={a} style={s.amenityItem}>{a}</div>
              ))}
            </div>
          </div>

          {/* ROOM TYPES */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Room Types</h2>
            <div style={s.roomsGrid}>
              {property.roomTypes.map((r, i) => (
                <div
                  key={r.name}
                  style={{ ...s.roomCard, ...(selectedRoom === i ? { borderColor: property.color, background: property.color + "08" } : {}) }}
                  onClick={() => setSelectedRoom(i)}
                  className="room-card"
                >
                  <div style={s.roomHeader}>
                    <h3 style={s.roomName}>{r.name}</h3>
                    <div style={{ ...s.roomPrice, color: property.color }}>KSh {r.price.toLocaleString()}<span style={s.roomPer}>/night</span></div>
                  </div>
                  <div style={s.roomDesc}>{r.desc}</div>
                  <div style={s.roomGuests}>👥 Up to {r.guests} guests</div>
                  {selectedRoom === i && <div style={{ ...s.selectedBadge, background: property.color }}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* POLICIES */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Policies</h2>
            <div style={s.policiesGrid}>
              <div style={s.policyItem}><div style={s.policyLabel}>Check-in</div><div style={s.policyVal}>{property.policies.checkin}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Check-out</div><div style={s.policyVal}>{property.policies.checkout}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Cancellation</div><div style={s.policyVal}>{property.policies.cancellation}</div></div>
              <div style={s.policyItem}><div style={s.policyLabel}>Payment</div><div style={s.policyVal}>{property.policies.payment}</div></div>
            </div>
          </div>

          {/* REVIEWS */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Guest Reviews</h2>
            <div style={s.ratingRow}>
              <div style={{ ...s.bigRating, color: property.color }}>{property.rating}</div>
              <div>
                <div style={s.stars}>{"⭐".repeat(Math.round(property.rating))}</div>
                <div style={s.reviewCount}>{property.reviews} verified reviews</div>
              </div>
            </div>
            <div style={s.reviewsList}>
              {property.reviewList.map((r) => (
                <div key={r.name} style={s.reviewCard}>
                  <div style={s.reviewHeader}>
                    <div style={s.reviewAvatar}>{r.name[0]}</div>
                    <div>
                      <div style={s.reviewName}>{r.name}</div>
                      <div style={s.reviewDate}>{r.date} · {"⭐".repeat(r.rating)}</div>
                    </div>
                  </div>
                  <p style={s.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — BOOKING */}
        <aside style={s.bookingCol}>
          <div style={s.bookingCard}>
            <div style={s.bookingHeader}>
              <div>
                <span style={{ ...s.bookingPrice, color: property.color }}>KSh {roomPrice.toLocaleString()}</span>
                <span style={s.bookingPer}>/night</span>
              </div>
              <div style={s.bookingRating}>⭐ {property.rating}</div>
            </div>

            <div style={s.bookingForm}>
              <div style={s.dateRow}>
                <div style={s.dateField}>
                  <label style={s.fieldLabel}>Check-in</label>
                  <input type="date" style={s.dateInput} value={checkin} onChange={(e) => setCheckin(e.target.value)} />
                </div>
                <div style={s.dateField}>
                  <label style={s.fieldLabel}>Check-out</label>
                  <input type="date" style={s.dateInput} value={checkout} onChange={(e) => setCheckout(e.target.value)} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Guests</label>
                <input type="number" min={1} max={property.roomTypes[selectedRoom].guests} style={s.guestInput} value={guests} onChange={(e) => setGuests(e.target.value)} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Room Type</label>
                <select style={s.roomSelect} value={selectedRoom} onChange={(e) => setSelectedRoom(Number(e.target.value))}>
                  {property.roomTypes.map((r, i) => (
                    <option key={r.name} value={i}>{r.name} — KSh {r.price.toLocaleString()}/night</option>
                  ))}
                </select>
              </div>
            </div>

            {checkin && checkout && (
              <div style={s.priceBreakdown}>
                <div style={s.priceRow}><span>KSh {roomPrice.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span><span>KSh {subtotal.toLocaleString()}</span></div>
                <div style={s.priceRow}><span>Service fee (12%)</span><span>KSh {serviceFee.toLocaleString()}</span></div>
                <div style={{ ...s.priceRow, ...s.priceTotal }}><span>Total</span><span style={{ color: property.color }}>KSh {total.toLocaleString()}</span></div>
              </div>
            )}

            <button style={{ ...s.bookNowBtn, background: property.color }} onClick={handleBook}>
              Book Now
            </button>
            <div style={s.bookNote}>You won't be charged yet · Free cancellation</div>
          </div>

          {/* CONTACT MANAGER */}
          <div style={s.contactCard}>
            <h3 style={s.contactTitle}>Contact Property Manager</h3>
            <div style={s.contactName}>👤 {property.manager.name}</div>
            <div style={s.contactBtns}>
              <a href={`tel:${property.manager.phone}`} style={s.contactBtn}>📞 Call</a>
              <a href={`https://wa.me/${property.manager.whatsapp.replace(/\s/g, "")}`} style={{ ...s.contactBtn, background: "#22c55e" }} target="_blank" rel="noreferrer">💬 WhatsApp</a>
              <a href={`mailto:${property.manager.email}`} style={{ ...s.contactBtn, background: "#3b82f6" }}>📧 Email</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh" },
  topBar: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px" },
  backBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563" },
  breadcrumb: { fontSize: "13px", color: "#9ca3af" },

  layout: { maxWidth: "1300px", margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" },
  leftCol: { display: "flex", flexDirection: "column", gap: "20px" },

  heroImg: { height: "320px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  heroTag: { position: "absolute", top: "16px", left: "16px", color: "white", fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" },

  infoCard: { background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" },
  catBadge: { display: "inline-block", background: "#f3f4f6", color: "#6b7280", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  propName: { fontSize: "26px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px", lineHeight: 1.2 },
  propMeta: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px", fontSize: "14px", color: "#6b7280" },
  ratingBadge: { fontWeight: 700 },
  description: { fontSize: "15px", color: "#4b5563", lineHeight: 1.75, margin: 0 },

  card: { background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" },
  cardTitle: { fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" },

  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" },
  amenityItem: { fontSize: "13px", color: "#4b5563", padding: "8px 12px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" },

  roomsGrid: { display: "flex", flexDirection: "column", gap: "12px" },
  roomCard: { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s", position: "relative" },
  roomHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  roomName: { fontSize: "15px", fontWeight: 700, color: "#1f2937", margin: 0 },
  roomPrice: { fontSize: "17px", fontWeight: 800 },
  roomPer: { fontSize: "12px", color: "#9ca3af", fontWeight: 400 },
  roomDesc: { fontSize: "13px", color: "#6b7280", marginBottom: "6px" },
  roomGuests: { fontSize: "12px", color: "#9ca3af" },
  selectedBadge: { position: "absolute", top: "12px", right: "12px", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" },

  policiesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  policyItem: { background: "#f9fafb", borderRadius: "10px", padding: "14px" },
  policyLabel: { fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" },
  policyVal: { fontSize: "13px", color: "#1f2937", fontWeight: 600 },

  ratingRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  bigRating: { fontSize: "48px", fontWeight: 800, lineHeight: 1 },
  stars: { fontSize: "20px", marginBottom: "4px" },
  reviewCount: { fontSize: "13px", color: "#6b7280" },
  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewCard: { border: "1px solid #f3f4f6", borderRadius: "10px", padding: "16px" },
  reviewHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  reviewAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#fbbf24", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 },
  reviewName: { fontSize: "14px", fontWeight: 700, color: "#1f2937" },
  reviewDate: { fontSize: "12px", color: "#9ca3af" },
  reviewComment: { fontSize: "13px", color: "#4b5563", lineHeight: 1.65, margin: 0 },

  bookingCol: { position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  bookingCard: { background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" },
  bookingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  bookingPrice: { fontSize: "26px", fontWeight: 800 },
  bookingPer: { fontSize: "14px", color: "#9ca3af" },
  bookingRating: { fontSize: "14px", color: "#fbbf24", fontWeight: 700 },

  bookingForm: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  dateRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  dateField: { display: "flex", flexDirection: "column", gap: "4px" },
  fieldLabel: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" },
  dateInput: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  guestInput: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" },
  roomSelect: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" },

  priceBreakdown: { background: "#f9fafb", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  priceRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", padding: "4px 0" },
  priceTotal: { borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "12px", fontWeight: 800, color: "#1f2937", fontSize: "15px" },

  bookNowBtn: { width: "100%", color: "white", border: "none", borderRadius: "10px", padding: "16px", fontSize: "16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: "10px" },
  bookNote: { textAlign: "center", fontSize: "12px", color: "#9ca3af" },

  contactCard: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb" },
  contactTitle: { fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" },
  contactName: { fontSize: "13px", color: "#6b7280", marginBottom: "14px" },
  contactBtns: { display: "flex", gap: "8px" },
  contactBtn: { flex: 1, background: "#1f2937", color: "white", border: "none", borderRadius: "8px", padding: "10px 6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "block" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .room-card:hover { border-color: #fbbf24 !important; }
  @media (max-width: 900px) {
    [style*="gridTemplateColumns: 1fr 380px"] { grid-template-columns: 1fr !important; }
    [style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
`;