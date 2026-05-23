import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { icon: "🏨", label: "Hotels", count: "48 listed" },
  { icon: "🏖️", label: "Beach Resorts", count: "12 listed" },
  { icon: "⛰️", label: "Mountain Lodges", count: "19 listed" },
  { icon: "🎪", label: "Theme Parks", count: "7 listed" },
  { icon: "🏕️", label: "Camping Grounds", count: "23 listed" },
  { icon: "🍽️", label: "Restaurants", count: "61 listed" },
  { icon: "🎭", label: "Entertainment", count: "15 listed" },
  { icon: "🏊", label: "Spas & Wellness", count: "31 listed" },
  { icon: "🗻", label: "Adventure Tours", count: "27 listed" },
  { icon: "🚣", label: "Water Sports", count: "9 listed" },
];

const featured = [
  {
    id: 1,
    name: "Serena Beach Resort",
    location: "Mombasa, Coast",
    category: "Beach Resort",
    price: 12500,
    rating: 4.8,
    reviews: 312,
    image: null,
    color: "#0ea5e9",
    tag: "Top Rated",
  },
  {
    id: 2,
    name: "Fairmont Mount Kenya Safari Club",
    location: "Nanyuki, Laikipia",
    category: "Mountain Lodge",
    price: 28000,
    rating: 4.9,
    reviews: 198,
    image: null,
    color: "#22c55e",
    tag: "Luxury Pick",
  },
  {
    id: 3,
    name: "Nairobi Serena Hotel",
    location: "Nairobi CBD",
    category: "Hotel",
    price: 9500,
    rating: 4.7,
    reviews: 541,
    image: null,
    color: "#f59e0b",
    tag: "Most Booked",
  },
  {
    id: 4,
    name: "Ol Pejeta Bush Camp",
    location: "Laikipia, Rift Valley",
    category: "Adventure Tour",
    price: 18000,
    rating: 4.9,
    reviews: 87,
    image: null,
    color: "#a855f7",
    tag: "Hidden Gem",
  },
];

export default function TourismPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(1);

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.heroBadge}>🌍 Explore Kenya</div>
          <h1 style={s.heroTitle}>
            Discover Hotels,<br />Resorts & Adventures
          </h1>
          <p style={s.heroSub}>
            Kenya's top hospitality & recreation destinations — all in one place.
          </p>

          {/* SEARCH BAR */}
          <div style={s.searchBox}>
            <div style={s.searchField}>
              <span style={s.searchLabel}>Where</span>
              <input
                style={s.searchInput}
                placeholder="Destination or property name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={s.searchDivider} />
            <div style={s.searchField}>
              <span style={s.searchLabel}>Check-in</span>
              <input
                style={s.searchInput}
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
              />
            </div>
            <div style={s.searchDivider} />
            <div style={s.searchField}>
              <span style={s.searchLabel}>Check-out</span>
              <input
                style={s.searchInput}
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
              />
            </div>
            <div style={s.searchDivider} />
            <div style={s.searchField}>
              <span style={s.searchLabel}>Guests</span>
              <input
                style={s.searchInput}
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <button
              style={s.searchBtn}
              onClick={() => navigate("/tourism/listings")}
            >
              🔍 Search
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.sectionLabel}>Browse By Type</div>
          <h2 style={s.sectionTitle}>What Are You Looking For?</h2>
          <div style={s.catGrid}>
            {categories.map((c) => (
              <div
                key={c.label}
                style={s.catCard}
                className="cat-card"
                onClick={() => navigate(`/tourism/listings?category=${c.label}`)}
              >
                <div style={s.catIcon}>{c.icon}</div>
                <div style={s.catLabel}>{c.label}</div>
                <div style={s.catCount}>{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ ...s.section, background: "#1f2937" }}>
        <div style={s.inner}>
          <div style={{ ...s.sectionLabel, background: "#fbbf2420", color: "#fbbf24", border: "1px solid #fbbf2440" }}>
            Featured Experiences
          </div>
          <h2 style={{ ...s.sectionTitle, color: "#fbbf24" }}>Top Picks in Kenya</h2>
          <p style={{ ...s.sectionSub, color: "#94a3b8" }}>Handpicked destinations loved by travellers</p>
          <div style={s.featGrid}>
            {featured.map((f) => (
              <div
                key={f.id}
                style={s.featCard}
                className="feat-card"
                onClick={() => navigate(`/tourism/${f.id}`)}
              >
                <div style={{ ...s.featImg, background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`, border: `1px solid ${f.color}40` }}>
                  <span style={{ fontSize: "52px" }}>
                    {f.category === "Beach Resort" ? "🏖️" :
                     f.category === "Mountain Lodge" ? "⛰️" :
                     f.category === "Hotel" ? "🏨" : "🗻"}
                  </span>
                  <div style={{ ...s.featTag, background: f.color }}>{f.tag}</div>
                </div>
                <div style={s.featBody}>
                  <div style={s.featCat}>{f.category}</div>
                  <h3 style={s.featName}>{f.name}</h3>
                  <div style={s.featLocation}>📍 {f.location}</div>
                  <div style={s.featBottom}>
                    <div style={s.featPrice}>
                      <span style={{ color: f.color, fontWeight: 800, fontSize: "18px" }}>
                        KSh {f.price.toLocaleString()}
                      </span>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>/night</span>
                    </div>
                    <div style={s.featRating}>
                      ⭐ {f.rating} <span style={{ color: "#6b7280" }}>({f.reviews})</span>
                    </div>
                  </div>
                  <button
                    style={{ ...s.bookBtn, background: f.color }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/tourism/${f.id}`); }}
                  >
                    View & Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button style={s.viewAllBtn} onClick={() => navigate("/tourism/listings")}>
              View All Properties →
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.sectionLabel}>Simple Process</div>
          <h2 style={s.sectionTitle}>How It Works</h2>
          <div style={s.howGrid}>
            {[
              { step: "01", icon: "🔍", title: "Search & Discover", desc: "Browse hundreds of verified hotels, resorts, and recreation sites across Kenya." },
              { step: "02", icon: "📅", title: "Check Availability", desc: "Pick your dates, number of guests, and view real-time pricing and availability." },
              { step: "03", icon: "💳", title: "Book & Pay", desc: "Confirm your booking and pay securely via M-Pesa or card — instantly." },
              { step: "04", icon: "🎉", title: "Enjoy Your Stay", desc: "Arrive and enjoy! Leave a review to help other travellers discover the best spots." },
            ].map((h) => (
              <div key={h.step} style={s.howCard} className="how-card">
                <div style={s.howStep}>{h.step}</div>
                <div style={s.howIcon}>{h.icon}</div>
                <h3 style={s.howTitle}>{h.title}</h3>
                <p style={s.howDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIST YOUR PROPERTY CTA */}
      <section style={s.listCta}>
        <div style={s.listCtaInner}>
          <div style={s.listCtaLeft}>
            <h2 style={s.listCtaTitle}>Own a Hotel, Resort or Recreation Site?</h2>
            <p style={s.listCtaSub}>
              Join Kenya's fastest-growing hospitality marketplace. List your property and start receiving
              bookings from thousands of travellers — for free.
            </p>
            <ul style={s.listCtaPoints}>
              {["Free to list your property", "Receive direct bookings", "Manage availability easily", "Get paid via M-Pesa"].map((p) => (
                <li key={p} style={s.listCtaPoint}>✅ {p}</li>
              ))}
            </ul>
            <button style={s.listCtaBtn} onClick={() => navigate("/tourism/register-property")}>
              List Your Property Free →
            </button>
          </div>
          <div style={s.listCtaRight}>
            <div style={s.listCtaStats}>
              {[
                { val: "280+", label: "Properties Listed" },
                { val: "47", label: "Counties Covered" },
                { val: "10-15%", label: "Commission Rate" },
                { val: "24hr", label: "Go-Live Time" },
              ].map((stat) => (
                <div key={stat.label} style={s.listCtaStat}>
                  <div style={s.listCtaStatVal}>{stat.val}</div>
                  <div style={s.listCtaStatLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", color: "#1f2937", minHeight: "100vh" },

  hero: { position: "relative", background: "linear-gradient(150deg, #0f172a 0%, #1e3a5f 50%, #0f4c75 100%)", padding: "100px 20px 80px", textAlign: "center", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", zIndex: 0 },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" },
  heroBadge: { display: "inline-block", background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)", padding: "6px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, marginBottom: "20px" },
  heroTitle: { fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 800, color: "white", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-1px" },
  heroSub: { fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "40px" },

  searchBox: { background: "white", borderRadius: "16px", padding: "8px", display: "flex", alignItems: "center", maxWidth: "900px", margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", flexWrap: "wrap", gap: "0" },
  searchField: { flex: 1, minWidth: "150px", padding: "12px 16px", display: "flex", flexDirection: "column" },
  searchLabel: { fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" },
  searchInput: { border: "none", outline: "none", fontSize: "14px", color: "#1f2937", background: "transparent", fontFamily: "inherit" },
  searchDivider: { width: "1px", height: "40px", background: "#e5e7eb", flexShrink: 0 },
  searchBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "12px", padding: "14px 28px", fontWeight: 800, fontSize: "14px", cursor: "pointer", margin: "4px", whiteSpace: "nowrap", fontFamily: "inherit" },

  section: { padding: "72px 20px", background: "#f8f4f0" },
  inner: { maxWidth: "1200px", margin: "0 auto" },
  sectionLabel: { display: "inline-block", background: "#fef9c3", color: "#854d0e", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid #fde68a" },
  sectionTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px" },
  sectionSub: { fontSize: "15px", color: "#6b7280", margin: "0 0 40px" },

  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginTop: "32px" },
  catCard: { background: "white", borderRadius: "14px", padding: "24px 16px", textAlign: "center", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.22s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  catIcon: { fontSize: "36px", marginBottom: "10px" },
  catLabel: { fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "4px" },
  catCount: { fontSize: "12px", color: "#6b7280" },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px", marginTop: "32px" },
  featCard: { background: "#111827", borderRadius: "16px", overflow: "hidden", border: "1px solid #334155", cursor: "pointer", transition: "all 0.25s" },
  featImg: { height: "180px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  featTag: { position: "absolute", top: "12px", left: "12px", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" },
  featBody: { padding: "20px" },
  featCat: { fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" },
  featName: { fontSize: "16px", fontWeight: 800, color: "white", margin: "0 0 6px", lineHeight: 1.3 },
  featLocation: { fontSize: "13px", color: "#94a3b8", marginBottom: "14px" },
  featBottom: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
  featPrice: { display: "flex", alignItems: "baseline", gap: "4px" },
  featRating: { fontSize: "13px", color: "#fbbf24", fontWeight: 700 },
  bookBtn: { width: "100%", border: "none", color: "white", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },

  viewAllBtn: { background: "transparent", border: "2px solid #fbbf24", color: "#fbbf24", padding: "14px 36px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  howGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px", marginTop: "40px" },
  howCard: { background: "white", borderRadius: "14px", padding: "28px 24px", border: "1px solid #e5e7eb", textAlign: "center", transition: "all 0.22s" },
  howStep: { fontSize: "40px", fontWeight: 800, color: "#fbbf2430", lineHeight: 1, marginBottom: "12px" },
  howIcon: { fontSize: "36px", marginBottom: "14px" },
  howTitle: { fontSize: "16px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px" },
  howDesc: { fontSize: "13px", color: "#6b7280", lineHeight: 1.65, margin: 0 },

  listCta: { background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", padding: "72px 20px", borderTop: "3px solid #fbbf24" },
  listCtaInner: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" },
  listCtaLeft: {},
  listCtaTitle: { fontSize: "32px", fontWeight: 800, color: "white", margin: "0 0 16px", lineHeight: 1.2 },
  listCtaSub: { fontSize: "15px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "24px" },
  listCtaPoints: { listStyle: "none", padding: 0, margin: "0 0 32px" },
  listCtaPoint: { fontSize: "14px", color: "#d1d5db", padding: "6px 0" },
  listCtaBtn: { background: "#fbbf24", color: "#1f2937", border: "none", padding: "16px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  listCtaRight: {},
  listCtaStats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  listCtaStat: { background: "#1f2937", border: "1px solid #334155", borderRadius: "12px", padding: "24px", textAlign: "center" },
  listCtaStatVal: { fontSize: "28px", fontWeight: 800, color: "#fbbf24", marginBottom: "6px" },
  listCtaStatLabel: { fontSize: "12px", color: "#6b7280", fontWeight: 600 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .cat-card:hover { transform: translateY(-4px); border-color: #fbbf24 !important; box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
  .feat-card:hover { transform: translateY(-4px); border-color: #fbbf24 !important; box-shadow: 0 16px 40px rgba(0,0,0,0.3) !important; }
  .how-card:hover { transform: translateY(-4px); border-color: #fbbf24 !important; box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }

  @media (max-width: 768px) {
    [style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
    [style*="display: flex"][style*="flexWrap"] { flex-direction: column; }
  }
`;