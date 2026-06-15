import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { kenyanUniversities, searchUniversities } from "../data/kenyanUniversities";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const C = {
  navy: "#0f1729",
  navyLight: "#1e293b",
  navyMid: "#1a2332",
  gold: "#C9A84C",
  goldDim: "rgba(201,168,76,0.1)",
  textMain: "#f1f5f9",
  textMid: "#cbd5e1",
  textDim: "#94a3b8",
  border: "#334155",
  borderSoft: "rgba(51,65,85,0.5)",
  red: "#ef4444",
  green: "#22c55e"
};

const S = {
  page: { minHeight: "100vh", background: C.navy, fontFamily: "'DM Sans', sans-serif", paddingBottom: "60px" },
  hero: { background: `linear-gradient(135deg, ${C.navyMid} 0%, ${C.navyLight} 50%, ${C.navyMid} 100%)`, padding: "60px 20px", textAlign: "center", borderBottom: `1px solid ${C.border}` },
  heroTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: C.textMain, margin: "0 0 16px", letterSpacing: "0.02em" },
  heroSub: { color: C.textMid, fontSize: "1rem", margin: 0, maxWidth: "600px", marginInline: "auto", lineHeight: 1.6 },
  content: { maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" },
  universitySection: { background: `linear-gradient(135deg, ${C.navyMid} 0%, ${C.navyLight} 50%, ${C.navyMid} 100%)`, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px 28px", marginBottom: "36px" },
  universityHeader: { textAlign: "center", marginBottom: "28px" },
  universityBadge: { display: "inline-block", background: C.goldDim, border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.7rem", letterSpacing: "0.18em", padding: "6px 18px", borderRadius: "20px", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 },
  universityTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: C.textMain, margin: "0 0 10px", letterSpacing: "0.02em" },
  universitySub: { color: C.textMid, fontSize: "0.95rem", margin: 0, maxWidth: "500px", marginInline: "auto", lineHeight: 1.6 },
  universitySearchBox: { display: "flex", alignItems: "center", gap: "12px", background: C.navy, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", maxWidth: "600px", marginInline: "auto" },
  universitySearchInput: { background: "transparent", border: "none", outline: "none", color: C.textMain, fontSize: "1rem", width: "100%", fontFamily: "'DM Sans', sans-serif" },
  universityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" },
  universityCard: { background: C.navy, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.3s ease", position: "relative", overflow: "hidden" },
  universityCardActive: { background: C.goldDim, borderColor: C.gold, transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(201,168,76,0.2)" },
  universityCardIcon: { fontSize: "2rem", marginBottom: "12px" },
  universityCardName: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.1rem", fontWeight: 700, color: C.textMain, marginBottom: "8px", lineHeight: 1.3 },
  universityCardLocation: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" },
  universityCardCounty: { fontSize: "0.8rem", color: C.textDim, fontWeight: 500 },
  universityCardCode: { display: "inline-block", background: C.navyLight, border: `1px solid ${C.borderSoft}`, color: C.gold, padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" },
  selectedUniversityBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.goldDim, border: `1px solid ${C.gold}`, borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  selectedUniversityInfo: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  selectedUniversityLabel: { color: C.textDim, fontSize: "0.85rem", fontWeight: 500 },
  selectedUniversityName: { color: C.gold, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },
  selectedUniversityLocation: { color: C.textMid, fontSize: "0.85rem" },
  clearUniversityBtn: { padding: "8px 16px", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  backBtn: { padding: "12px 24px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", marginBottom: "20px" },
  empty: { textAlign: "center", padding: "80px 20px", border: `1px dashed ${C.border}`, borderRadius: "12px" },
  emptyIcon: { fontSize: "2.5rem", marginBottom: "16px" },
  emptyTitle: { color: C.textMain, fontSize: "1.1rem", fontWeight: 600, margin: "0 0 8px" },
  emptySub: { color: C.textMid, fontSize: "0.9rem", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" },
  card: { background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease", position: "relative" },
  cardImg: { width: "100%", height: "220px", objectFit: "cover", background: C.navy },
  cardBody: { padding: "20px" },
  cardTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.2rem", fontWeight: 700, color: C.textMain, margin: "0 0 8px", lineHeight: 1.3 },
  cardLocation: { color: C.textMid, fontSize: "0.9rem", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" },
  cardPrice: { fontSize: "1.4rem", fontWeight: 700, color: C.gold, margin: "0 0 12px" },
  cardPriceUnit: { fontSize: "0.85rem", color: C.textDim, fontWeight: 400 },
  cardMeta: { display: "flex", gap: "16px", marginBottom: "16px", fontSize: "0.85rem", color: C.textMid },
  cardMetaItem: { display: "flex", alignItems: "center", gap: "4px" },
  cardBtn: { width: "100%", padding: "12px", background: C.gold, border: "none", color: C.navy, borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  loadingWrap: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" },
  loadingSpinner: { width: "48px", height: "48px", border: `3px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 1s linear infinite" },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .university-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.5); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .clear-university-btn:hover { background: rgba(201,168,76,0.15); }
  .back-btn:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; }
  .card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,168,76,0.3); }
  .card-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.35); filter: brightness(1.05); }
`;

export default function UniversityHostels() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universitySearch, setUniversitySearch] = useState("");

  useEffect(() => {
    if (!selectedUniversity?.id) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const fetchByUniversity = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          universityId: String(selectedUniversity.id),
          available: "true",
          limit: "200",
        });
        const response = await fetch(`${API_BASE}/properties?${params}`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setProperties(data.filter((p) => {
          const available = Math.max(0, (p.totalUnits || 1) - (p.bookedUnits || 0));
          return available > 0;
        }));
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchByUniversity();
  }, [selectedUniversity]);

  const filteredProperties = properties;

  const handleUniversityClick = (university) => {
    setSelectedUniversity(university);
  };

  const handleClearSelection = () => {
    setSelectedUniversity(null);
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/listings`);
    // The Listings page will handle showing the property details
  };

  return (
    <div style={S.page}>
      <style>{css}</style>
      
      {/* Hero Section */}
      <div style={S.hero}>
        <h1 style={S.heroTitle}>University Hostels</h1>
        <p style={S.heroSub}>Find affordable hostels near your university across Kenya</p>
      </div>

      <div style={S.content}>
        {!selectedUniversity ? (
          /* University Selection View */
          <div style={S.universitySection}>
            <div style={S.universityHeader}>
              <div style={S.universityBadge}>🎓 STUDENT HOUSING</div>
              <h2 style={S.universityTitle}>Select Your University</h2>
              <p style={S.universitySub}>Browse universities across all 47 counties in Kenya and discover hostels nearby</p>
            </div>

            <div style={S.universitySearchBox}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search your university (e.g., Nairobi, Kenyatta, JKUAT)..."
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                style={S.universitySearchInput}
              />
            </div>

            <div style={S.universityGrid}>
              {(universitySearch ? searchUniversities(universitySearch) : kenyanUniversities).map((university) => (
                <div
                  key={university.id}
                  className="university-card"
                  style={S.universityCard}
                  onClick={() => handleUniversityClick(university)}
                >
                  <div style={S.universityCardIcon}>🏛️</div>
                  <div style={S.universityCardName}>{university.name}</div>
                  <div style={S.universityCardLocation}>
                    <span>📍 {university.location}</span>
                    <span style={S.universityCardCounty}>{university.county} County</span>
                  </div>
                  <div style={S.universityCardCode}>{university.code}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Hostels View for Selected University */
          <div>
            <button style={S.backBtn} onClick={handleClearSelection}>
              ← Back to Universities
            </button>

            <div style={S.selectedUniversityBar}>
              <div style={S.selectedUniversityInfo}>
                <span style={S.selectedUniversityLabel}>Showing hostels near:</span>
                <span style={S.selectedUniversityName}>{selectedUniversity.name}</span>
                <span style={S.selectedUniversityLocation}>📍 {selectedUniversity.location}, {selectedUniversity.county}</span>
              </div>
              <button style={S.clearUniversityBtn} onClick={handleClearSelection}>
                Change University ✕
              </button>
            </div>

            {loading ? (
              <div style={S.loadingWrap}>
                <div style={S.loadingSpinner}></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div style={S.empty}>
                <div style={S.emptyIcon}>🏠</div>
                <h3 style={S.emptyTitle}>No Hostels Found</h3>
                <p style={S.emptySub}>There are currently no hostels listed near {selectedUniversity.name}. Check back later!</p>
              </div>
            ) : (
              <div style={S.grid}>
                {filteredProperties.map((property) => (
                  <div key={property._id} className="card" style={S.card}>
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        style={S.cardImg}
                      />
                    ) : (
                      <div style={{ ...S.cardImg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                        🏠
                      </div>
                    )}
                    <div style={S.cardBody}>
                      <h3 style={S.cardTitle}>{property.title}</h3>
                      <p style={S.cardLocation}>
                        📍 {property.location || property.county}
                      </p>
                      <div style={S.cardPrice}>
                        KES {property.price?.toLocaleString()}
                        <span style={S.cardPriceUnit}>/month</span>
                      </div>
                      <div style={S.cardMeta}>
                        <div style={S.cardMetaItem}>🛏 {property.bedrooms || "Studio"}</div>
                        <div style={S.cardMetaItem}>🚿 {property.bathrooms || "1"}</div>
                      </div>
                      <button
                        className="card-btn"
                        style={S.cardBtn}
                        onClick={() => handleViewProperty(property._id)}
                      >
                        View Details & Contact Landlord
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
