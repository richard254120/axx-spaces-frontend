import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import API from "../api/api";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [searchForm, setSearchForm] = useState({ county: "", type: "" });
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
    "👋 Welcome to Axx Spaces!", "🏠 Kenya's #1 Rental Platform",
    "✅ Verified Listings in All 47 Counties", "💬 Direct WhatsApp Connect",
    "🚀 Boost Your Property", "🔒 Safe & Secure",
  ];

  const howItWorks = [
    { step: "01", icon: "🔍", title: "Search", desc: "Filter by county and property type instantly." },
    { step: "02", icon: "🏠", title: "Explore", desc: "Browse real photos and maps." },
    { step: "03", icon: "💬", title: "Connect", desc: "Chat directly with landlords." },
    { step: "04", icon: "🎉", title: "Move In", desc: "Sign and move stress-free." },
  ];

  // Fetch Featured Properties
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/payment/featured");
        setFeaturedProperties(res.data || []);
      } catch (err) {
        console.error("Failed to load featured");
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Testimonial Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.county) params.append("county", searchForm.county);
    if (searchForm.type) params.append("type", searchForm.type);
    navigate(`/listings?${params.toString()}`);
  };

  const handleListProperty = () => {
    if (!token) { navigate("/login"); return; }
    navigate("/upload");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Marquee */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>{item}</span>
          ))}
        </div>
      </div>

      {/* HERO - Minimized for faster scroll to Featured */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Axx Spaces" style={styles.heroLogo} />
          </div>

          <h1 style={styles.heroTitle}>Find Your Dream Home in Kenya</h1>
          <p style={styles.heroSubtitle}>Verified rentals • Direct landlord chat • No agents</p>

          {/* Mobile-Friendly Search */}
          <form onSubmit={handleSearch} style={styles.searchCard}>
            <div style={styles.searchRow}>
              <select
                style={styles.searchInput}
                value={searchForm.county}
                onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}
              >
                <option value="">📍 Any County</option>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                style={styles.searchInput}
                value={searchForm.type}
                onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}
              >
                <option value="">🏠 Any Type</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <button type="submit" style={styles.searchBtn}>
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FEATURED LISTINGS - Now appears much earlier */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>
          <p style={styles.sectionSubtitle}>Boosted &amp; handpicked properties</p>
        </div>

        {loadingFeatured ? (
          <div style={styles.loadingWrap}>Loading featured homes...</div>
        ) : featuredProperties.length > 0 ? (
          <div style={styles.featuredGrid}>
            {featuredProperties.slice(0, 6).map((property) => (
              <div key={property._id} style={styles.featuredCard}>
                <img
                  src={property.images?.[0] || ""}
                  alt={property.title}
                  style={styles.featuredImage}
                />
                <div style={styles.featuredInfo}>
                  <h3 style={styles.featuredTitle}>{property.title}</h3>
                  <p style={styles.featuredLocation}>📍 {property.county}</p>
                  <p style={styles.featuredPrice}>
                    KSh {Number(property.price).toLocaleString()} <span style={styles.perMonth}>/month</span>
                  </p>
                  <button
                    onClick={() => navigate(`/listings?highlight=${property._id}`)}
                    style={styles.viewBtn}
                  >
                    View Property →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Rest of your sections remain unchanged */}
      {/* How It Works, Trust, CTA, Footer... */}

    </div>
  );
}

/* ====================== OPTIMIZED STYLES ====================== */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", color: "#1f2937", minHeight: "100vh" },

  /* Marquee */
  marqueeWrapper: { overflow: "hidden", background: "#fbbf24", padding: "8px 0", borderBottom: "2px solid #f59e0b" },
  marqueePill: { display: "inline-flex", alignItems: "center", gap: "8px", background: "white", borderRadius: "20px", padding: "4px 14px", margin: "0 6px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" },

  /* Hero - Minimized height */
  hero: { background: "linear-gradient(150deg, #ffffff 0%, #fef3e2 100%)", padding: "40px 20px 50px", textAlign: "center" },
  heroContent: { maxWidth: "820px", margin: "0 auto" },
  logoContainer: { display: "flex", justifyContent: "center", marginBottom: "12px" },
  heroLogo: { height: "65px" },
  heroTitle: { fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 800, color: "#1f2937", margin: "0 0 8px", lineHeight: 1.2 },
  heroSubtitle: { fontSize: "15px", color: "#6b7280", margin: "0 auto 24px", maxWidth: "460px" },

  /* Mobile-First Search */
  searchCard: { background: "white", borderRadius: "14px", padding: "18px", boxShadow: "0 6px 30px rgba(0,0,0,0.1)", maxWidth: "680px", margin: "0 auto" },
  searchRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px" },
  searchInput: { padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", background: "#f9fafb" },
  searchBtn: { padding: "12px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },

  /* Featured - Prominent and early */
  featuredSection: { padding: "50px 20px 70px", background: "#1f2937", color: "white" },
  sectionHeader: { textAlign: "center", marginBottom: "32px" },
  sectionTitle: { fontSize: "28px", fontWeight: 800, color: "#fbbf24", margin: "0 0 8px" },
  sectionSubtitle: { color: "#94a3b8", fontSize: "15px" },
  featuredGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", maxWidth: "1200px", margin: "0 auto" },
  featuredCard: { background: "#111827", borderRadius: "14px", overflow: "hidden", border: "1px solid #334155" },
  featuredImage: { width: "100%", height: "180px", objectFit: "cover" },
  featuredInfo: { padding: "16px" },
  featuredTitle: { fontSize: "15.5px", fontWeight: 700, color: "white", margin: "0 0 6px" },
  featuredLocation: { color: "#94a3b8", fontSize: "13px", marginBottom: "8px" },
  featuredPrice: { color: "#22c55e", fontSize: "17px", fontWeight: 800 },
  perMonth: { fontSize: "13px", color: "#4ade80" },
  viewBtn: { marginTop: "12px", width: "100%", padding: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },

  /* Loading */
  loadingWrap: { textAlign: "center", padding: "60px 20px", color: "#94a3b8" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
  }

  .searchRow { 
    grid-template-columns: 1fr 1fr auto; 
  }

  @media (max-width: 620px) {
    .searchRow { 
      grid-template-columns: 1fr !important; 
    }
    .hero { padding: "30px 20px 40px"; }
  }
`;