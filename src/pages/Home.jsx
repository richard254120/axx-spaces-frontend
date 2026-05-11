import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import API from "../api/api";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [searchForm, setSearchForm] = useState({
    county: "",
    area: "",
    type: "",
    price: "",
    bedrooms: "",
  });

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru",
    "Tharaka Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua",
    "Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
    "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi",
    "Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay",
    "Migori","Kisii","Nyamira","Nairobi City",
  ];

  const types = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
    "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block",
  ];

  const marqueeItems = [
    "👋 Welcome to Axx Spaces!",
    "🏠 Kenya's #1 Rental Platform",
    "✅ Verified Listings in All 47 Counties",
    "💬 Connect Directly with Landlords via WhatsApp",
    "🚀 Boost Your Property for Maximum Visibility",
    "🔒 Safe, Secure & 100% Transparent",
    "📱 Search Beautiful Homes on Any Device",
    "🗺 Interactive Maps for Every Listing",
    "💰 Zero Hidden Fees — Ever",
    "🎉 Over 5,000 Happy Tenants and Counting!",
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/payment/featured");
        setFeaturedProperties(res.data || []);
      } catch (err) {
        console.error("Failed to load featured properties");
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.county) params.append("county", searchForm.county);
    if (searchForm.area) params.append("area", searchForm.area);
    if (searchForm.type) params.append("type", searchForm.type);
    if (searchForm.price) params.append("price", searchForm.price);
    if (searchForm.bedrooms) params.append("bedrooms", searchForm.bedrooms);
    navigate(`/listings?${params.toString()}`);
  };

  const handleListProperty = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/upload");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ===================== MARQUEE ===================== */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>
              {item}
              <span style={styles.marqueeSep}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===================== HERO ===================== */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Axx Spaces Logo" style={styles.heroLogo} />
          </div>

          <h1 style={styles.heroTitle}>Find Your Dream Home in Kenya</h1>
          <p style={styles.heroSubtitle}>
            Discover verified rental properties across all 47 counties
          </p>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchGrid}>
              <select
                style={styles.searchInput}
                value={searchForm.county}
                onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}
              >
                <option value="">📍 County</option>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                type="text"
                placeholder="🏘 Area / Estate"
                style={styles.searchInput}
                value={searchForm.area}
                onChange={(e) => setSearchForm({ ...searchForm, area: e.target.value })}
              />

              <select
                style={styles.searchInput}
                value={searchForm.type}
                onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}
              >
                <option value="">🏗 Property Type</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <input
                type="number"
                placeholder="💰 Max Price (KSh)"
                style={styles.searchInput}
                value={searchForm.price}
                onChange={(e) => setSearchForm({ ...searchForm, price: e.target.value })}
              />

              <input
                type="number"
                placeholder="🛏 Bedrooms"
                style={styles.searchInput}
                value={searchForm.bedrooms}
                onChange={(e) => setSearchForm({ ...searchForm, bedrooms: e.target.value })}
              />

              <button type="submit" style={styles.searchBtn}>
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===================== FEATURED LISTINGS ===================== */}
      <section style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>
        <p style={styles.sectionSubtitle}>
          Boosted properties get maximum visibility and priority placement
        </p>

        {loadingFeatured ? (
          <p style={styles.loadingText}>Loading featured properties...</p>
        ) : featuredProperties.length > 0 ? (
          <div style={styles.featuredGrid}>
            {featuredProperties.map((property) => (
              <div key={property._id} style={styles.featuredCard} className="featured-card">
                <div style={styles.featuredImageWrapper}>
                  <img
                    src={property.images?.[0] || ""}
                    alt={property.title}
                    style={styles.featuredImage}
                  />
                  <div style={styles.boostedBadge}>⭐ BOOSTED</div>
                </div>
                <div style={styles.featuredInfo}>
                  <h3 style={styles.featuredTitle}>{property.title}</h3>
                  <p style={styles.featuredLocation}>
                    📍 {property.area}, {property.county}
                  </p>
                  <p style={styles.featuredPrice}>
                    KSh {Number(property.price).toLocaleString()} / month
                  </p>
                  <button
                    onClick={() => navigate(`/listings?highlight=${property._id}`)}
                    style={styles.viewBtn}
                    className="view-btn"
                  >
                    View Property →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noFeatured}>
            <p style={styles.noFeaturedText}>
              No featured listings yet.
            </p>
            <p style={styles.noFeaturedSub}>
              Boost your property to appear here and get seen first!
            </p>
          </div>
        )}
      </section>

      {/* ===================== STATS ===================== */}
      <section style={styles.stats}>
        <div style={styles.statsContent}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNumber, color: "#fbbf24" }}>47</div>
            <div style={styles.statLabel}>Counties</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNumber, color: "#ef4444" }}>10K+</div>
            <div style={styles.statLabel}>Verified Listings</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNumber, color: "#22c55e" }}>5K+</div>
            <div style={styles.statLabel}>Happy Tenants</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNumber, color: "#60a5fa" }}>24/7</div>
            <div style={styles.statLabel}>Support</div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section style={styles.features}>
        <h2 style={{ ...styles.sectionTitle, color: "#1f2937" }}>
          Why Choose Axx Spaces?
        </h2>

        <div style={styles.featureGrid}>
          {[
            { icon: "✓", title: "Verified Properties", text: "All listings are manually verified to ensure accuracy and legitimacy", color: "#fbbf24" },
            { icon: "💬", title: "Direct Contact", text: "Chat with landlords via WhatsApp instantly — no middlemen", color: "#ef4444" },
            { icon: "🔒", title: "Safe & Secure", text: "Your data is protected with industry-standard encryption", color: "#22c55e" },
            { icon: "📱", title: "Mobile Friendly", text: "Search and find properties on the go, any time, anywhere", color: "#1f2937" },
            { icon: "🗺", title: "Location Maps", text: "View exact location of properties on interactive maps", color: "#fbbf24" },
            { icon: "💰", title: "No Hidden Fees", text: "Transparent pricing with no surprise charges — ever", color: "#ef4444" },
          ].map((f) => (
            <div
              key={f.title}
              style={{ ...styles.featureCard, borderTop: `4px solid ${f.color}` }}
              className="feature-card"
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureText}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Find Your Home?</h2>
        <p style={styles.ctaText}>
          Browse thousands of listings or list your property today
        </p>
        <div style={styles.ctaButtons}>
          <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>
            🔍 Browse Listings
          </button>

          <button
            style={{
              ...styles.ctaBtnSecondary,
              background: token ? "#22c55e" : "white",
              color: token ? "white" : "#1f2937",
              border: token ? "none" : "2px solid #1f2937",
            }}
            onClick={handleListProperty}
          >
            {token ? "📝 Upload Your Property" : "🔐 Login to List Property"}
          </button>
        </div>

        {!token && (
          <p style={styles.loginHint}>
            💡 Create a free account to start listing your properties
          </p>
        )}
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 Axx Spaces. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    color: "#1f2937",
    minHeight: "100vh",
  },

  /* --- Marquee --- */
  marqueeWrapper: {
    overflow: "hidden",
    background: "#fbbf24",
    padding: "9px 0",
    borderBottom: "2px solid #f59e0b",
  },
  marqueePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    borderRadius: "20px",
    padding: "4px 16px",
    margin: "0 8px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1f2937",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  marqueeSep: {
    color: "#d97706",
    fontWeight: 700,
    fontSize: "16px",
    marginLeft: "8px",
  },

  /* --- Hero --- */
  hero: {
    background: "linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #fef9e7 100%)",
    padding: "36px 20px 32px",
    textAlign: "center",
    borderBottom: "3px solid #fbbf24",
  },
  heroContent: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  heroLogo: {
    height: "80px",
    width: "auto",
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 46px)",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 10px",
    letterSpacing: "-1px",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0 auto 28px",
    maxWidth: "520px",
  },
  searchForm: {
    marginTop: "8px",
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  searchInput: {
    padding: "11px 14px",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "white",
    transition: "all 0.2s",
  },
  searchBtn: {
    padding: "11px 24px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },

  /* --- Featured --- */
  featuredSection: {
    padding: "52px 20px",
    background: "#1f2937",
    color: "white",
  },
  sectionTitle: {
    fontSize: "30px",
    fontWeight: 800,
    textAlign: "center",
    marginBottom: "10px",
    color: "#fbbf24",
  },
  sectionSubtitle: {
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: "40px",
    fontSize: "16px",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "22px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featuredCard: {
    background: "#111827",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #334155",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  featuredImageWrapper: {
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    display: "block",
  },
  boostedBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#eab308",
    color: "#000",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },
  featuredInfo: {
    padding: "16px 18px 20px",
  },
  featuredTitle: {
    fontSize: "17px",
    fontWeight: 700,
    margin: "0 0 8px",
    color: "white",
  },
  featuredLocation: {
    color: "#94a3b8",
    margin: "4px 0",
    fontSize: "13px",
  },
  featuredPrice: {
    color: "#22c55e",
    fontSize: "18px",
    fontWeight: 700,
    margin: "8px 0 0",
  },
  viewBtn: {
    marginTop: "14px",
    width: "100%",
    padding: "11px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "background 0.2s",
  },
  loadingText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "15px",
  },
  noFeatured: {
    textAlign: "center",
    padding: "32px 20px",
  },
  noFeaturedText: {
    color: "#e5e7eb",
    fontSize: "17px",
    fontWeight: 600,
    margin: "0 0 6px",
  },
  noFeaturedSub: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },

  /* --- Stats --- */
  stats: {
    background: "#111827",
    padding: "48px 20px",
    color: "white",
  },
  statsContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "24px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  statCard: { textAlign: "center" },
  statNumber: { fontSize: "34px", fontWeight: 800, marginBottom: "6px" },
  statLabel: { fontSize: "13px", color: "#d1d5db" },

  /* --- Features --- */
  features: {
    padding: "72px 20px",
    background: "white",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginTop: "36px",
  },
  featureCard: {
    padding: "26px",
    background: "#f9fafb",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s",
  },
  featureIcon: { fontSize: "34px", marginBottom: "14px" },
  featureTitle: { fontSize: "17px", fontWeight: 700, color: "#1f2937", margin: "0 0 10px" },
  featureText: { fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* --- CTA --- */
  cta: {
    background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)",
    padding: "72px 20px",
    textAlign: "center",
    borderTop: "3px solid #f59e0b",
  },
  ctaTitle: { fontSize: "32px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px" },
  ctaText: { fontSize: "17px", color: "#3b3b8c", margin: "0 0 28px" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
  ctaBtnPrimary: {
    padding: "13px 30px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },
  ctaBtnSecondary: {
    padding: "13px 30px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loginHint: {
    fontSize: "13px",
    color: "#3b3b8c",
    marginTop: "16px",
    fontStyle: "italic",
  },

  /* --- Footer --- */
  footer: {
    background: "#1f2937",
    color: "#d1d5db",
    padding: "18px",
    textAlign: "center",
    fontSize: "13px",
  },
  footerText: { margin: 0 },
};

/* ===================== INJECTED CSS ===================== */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .marquee-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: marquee 32s linear infinite;
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 18px;
    padding-right: 32px;
    cursor: pointer;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.92;
  }

  .featured-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.3);
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .view-btn:hover {
    background: #2563eb !important;
  }
`;