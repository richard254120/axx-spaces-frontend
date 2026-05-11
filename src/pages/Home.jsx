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
    "👋 Welcome to Axx Spaces!",
    "🏠 Kenya's #1 Rental Platform",
    "✅ Verified Listings in All 47 Counties",
    "💬 Connect Directly with Landlords via WhatsApp",
    "🚀 Boost Your Property for Maximum Visibility",
    "🔒 Safe, Secure & 100% Transparent",
    "📱 Search on Any Device, Anytime",
    "🗺 Interactive Maps for Every Listing",
    "💰 Zero Hidden Fees — Ever",
    "🎉 Over 5,000 Happy Tenants and Counting!",
  ];

  const howItWorks = [
    { step: "01", icon: "🔍", title: "Search", desc: "Filter by county and property type to find your match instantly." },
    { step: "02", icon: "🏠", title: "Explore", desc: "Browse photos, maps, and full details of verified listings." },
    { step: "03", icon: "💬", title: "Connect", desc: "Contact the landlord directly on WhatsApp — zero middlemen." },
    { step: "04", icon: "🎉", title: "Move In", desc: "Agree terms, sign, and move into your new home stress-free." },
  ];

  const testimonials = [
    { name: "Sarah W.", location: "Nairobi", text: "Found my perfect 2-bedroom apartment in 2 days. The WhatsApp connection was super fast!", rating: 5, color: "#fbbf24", avatar: "SW" },
    { name: "James K.", location: "Mombasa", text: "As a landlord, boosting my property increased inquiries by 300%. Highly recommended!", rating: 5, color: "#22c55e", avatar: "JK" },
    { name: "Aisha M.", location: "Kisumu", text: "Very professional platform. Got a nice house near the lake with honest landlord.", rating: 4, color: "#3b82f6", avatar: "AM" },
  ];

  // Fetch Featured Properties
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

  // Testimonial Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
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
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/upload");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Marquee */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>
              {item}<span style={styles.marqueeSep}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Axx Spaces" style={styles.heroLogo} />
          </div>

          <div style={styles.trustBadge}>
            <span style={styles.trustDot}></span>
            Kenya's Most Trusted Rental Platform
          </div>

          <h1 style={styles.heroTitle}>Find Your Dream Home<br />in Kenya</h1>
          <p style={styles.heroSubtitle}>
            Verified rentals across all 47 counties. No agents. No hidden fees.
          </p>

          <form onSubmit={handleSearch} style={styles.searchCard}>
            <p style={styles.searchLabel}>Where are you looking?</p>
            <div style={styles.searchRow}>
              <select
                style={styles.searchInput}
                value={searchForm.county}
                onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}
              >
                <option value="">📍 Select County</option>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                style={styles.searchInput}
                value={searchForm.type}
                onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}
              >
                <option value="">🏗 Property Type</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <button type="submit" style={styles.searchBtn}>
                🔍 Search Now
              </button>
            </div>
            <p style={styles.searchHint}>
              🔥 <strong>2,340</strong> new listings added this week
            </p>
          </form>

          <div style={styles.heroStats}>
            {[
              { val: "10K+", label: "Active Listings" },
              { val: "47", label: "Counties" },
              { val: "5K+", label: "Happy Tenants" },
              { val: "4.9★", label: "User Rating" },
            ].map((s) => (
              <div key={s.label} style={styles.heroStat}>
                <span style={styles.heroStatVal}>{s.val}</span>
                <span style={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>
          <p style={styles.sectionSubtitle}>
            Verified & boosted properties — handpicked for maximum trust
          </p>
        </div>

        {loadingFeatured ? (
          <div style={styles.loadingWrap}>
            <div className="spinner"></div>
            <p style={styles.loadingText}>Loading featured properties...</p>
          </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div style={styles.featuredGrid}>
              {featuredProperties.slice(0, 6).map((property) => (
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
                    <p style={styles.featuredLocation}>📍 {property.county}</p>
                    <p style={styles.featuredPrice}>
                      KSh {Number(property.price).toLocaleString()}
                      <span style={styles.perMonth}> / month</span>
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
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button onClick={() => navigate("/listings")} style={styles.viewAllBtn}>
                View All Listings →
              </button>
            </div>
          </>
        ) : (
          <div style={styles.noFeatured}>
            <div style={styles.noFeaturedIcon}>🏡</div>
            <p style={styles.noFeaturedText}>No featured listings yet</p>
            <button onClick={handleListProperty} style={styles.boostBtn}>
              🚀 Boost Your Property
            </button>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section style={styles.howSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#1f2937" }}>How It Works</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#6b7280" }}>
            From search to move-in in 4 simple steps
          </p>
        </div>
        <div style={styles.howGrid}>
          {howItWorks.map((step, i) => (
            <div key={step.step} style={styles.howCard} className="how-card">
              <div style={styles.howStep}>{step.step}</div>
              <div style={styles.howIcon}>{step.icon}</div>
              <h3 style={styles.howTitle}>{step.title}</h3>
              <p style={styles.howDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to Find Your Home?</h2>
          <p style={styles.ctaText}>Join thousands of Kenyans who found their perfect home on Axx Spaces</p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>
              🔍 Browse All Listings
            </button>
            <button style={styles.ctaBtnSecondary} onClick={handleListProperty}>
              {token ? "📝 Upload Your Property" : "🔐 Login to List Property"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <strong style={{ color: "#fbbf24", fontSize: "18px" }}>Axx Spaces</strong>
            <p style={styles.footerTagline}>Kenya's most trusted rental platform</p>
          </div>
          <p style={styles.footerCopy}>© 2026 Axx Spaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", color: "#1f2937", minHeight: "100vh" },

  /* Marquee */
  marqueeWrapper: { overflow: "hidden", background: "#fbbf24", padding: "9px 0", borderBottom: "2px solid #f59e0b" },
  marqueePill: { display: "inline-flex", alignItems: "center", gap: "10px", background: "white", borderRadius: "20px", padding: "4px 16px", margin: "0 8px", fontSize: "13px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" },
  marqueeSep: { color: "#d97706", fontWeight: 700, fontSize: "16px" },

  /* Hero */
  hero: { background: "linear-gradient(150deg, #ffffff 0%, #fef3e2 55%, #fff7ed 100%)", padding: "60px 20px 80px", textAlign: "center" },
  heroContent: { maxWidth: "820px", margin: "0 auto" },
  logoContainer: { display: "flex", justifyContent: "center", marginBottom: "16px" },
  heroLogo: { height: "80px" },
  trustBadge: { display: "inline-flex", alignItems: "center", gap: "8px", background: "#dcfce7", color: "#15803d", padding: "5px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, marginBottom: "18px" },
  trustDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", animation: "pulse 1.8s infinite" },
  heroTitle: { fontSize: "clamp(32px, 5.5vw, 52px)", fontWeight: 800, color: "#1f2937", margin: "0 0 12px", lineHeight: 1.15 },
  heroSubtitle: { fontSize: "16px", color: "#6b7280", margin: "0 auto 30px", maxWidth: "480px" },
  searchCard: { background: "white", borderRadius: "16px", padding: "24px 28px 18px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", maxWidth: "680px", margin: "0 auto 30px" },
  searchLabel: { fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
  searchRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px" },
  searchInput: { padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", background: "#f9fafb" },
  searchBtn: { padding: "12px 22px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },
  searchHint: { fontSize: "12px", color: "#9ca3af", margin: "12px 0 0", textAlign: "center" },
  heroStats: { display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginTop: "4px" },
  heroStat: { textAlign: "center" },
  heroStatVal: { fontSize: "20px", fontWeight: 800 },
  heroStatLabel: { fontSize: "11px", color: "#9ca3af" },

  /* Featured */
  featuredSection: { padding: "60px 20px", background: "#1f2937", color: "white" },
  sectionHeader: { textAlign: "center", marginBottom: "44px" },
  sectionTitle: { fontSize: "30px", fontWeight: 800, color: "#fbbf24", margin: "0 0 10px" },
  sectionSubtitle: { color: "#94a3b8", fontSize: "16px" },
  featuredGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "22px", maxWidth: "1200px", margin: "0 auto" },
  featuredCard: { background: "#111827", borderRadius: "14px", overflow: "hidden", border: "1px solid #334155" },
  featuredImageWrapper: { position: "relative" },
  featuredImage: { width: "100%", height: "195px", objectFit: "cover" },
  boostedBadge: { position: "absolute", top: "12px", left: "12px", background: "#eab308", color: "#000", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  featuredInfo: { padding: "16px 18px 20px" },
  featuredTitle: { fontSize: "16px", fontWeight: 700, color: "white", margin: "0 0 6px" },
  featuredLocation: { color: "#94a3b8", margin: "0 0 8px", fontSize: "13px" },
  featuredPrice: { color: "#22c55e", fontSize: "18px", fontWeight: 800 },
  perMonth: { fontSize: "13px", color: "#4ade80" },
  viewBtn: { marginTop: "14px", width: "100%", padding: "11px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },

  /* How It Works */
  howSection: { padding: "70px 20px", background: "white" },
  howGrid: { display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" },
  howCard: { flex: "1", minWidth: "220px", textAlign: "center", padding: "28px 16px" },
  howStep: { fontSize: "11px", fontWeight: 800, color: "#ef4444", marginBottom: "10px" },
  howIcon: { fontSize: "36px", marginBottom: "12px" },
  howTitle: { fontSize: "17px", fontWeight: 700, margin: "0 0 8px" },
  howDesc: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6 },

  /* CTA */
  cta: { background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)", padding: "76px 20px", textAlign: "center" },
  ctaInner: { maxWidth: "640px", margin: "0 auto" },
  ctaTitle: { fontSize: "34px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: "0 0 32px" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
  ctaBtnPrimary: { padding: "14px 32px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },
  ctaBtnSecondary: { padding: "14px 32px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", background: "white", color: "#1f2937" },

  /* Footer */
  footer: { background: "#1f2937", color: "#d1d5db", padding: "36px 20px 20px", textAlign: "center" },
  footerInner: { maxWidth: "960px", margin: "0 auto" },
  footerBrand: { marginBottom: "18px" },
  footerTagline: { fontSize: "13px", color: "#6b7280" },
  footerCopy: { fontSize: "12px", color: "#4b5563", margin: 0 },
};

/* Global CSS */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 35s linear infinite;
  }

  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #334155;
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  button:hover:not(:disabled) { transform: translateY(-2px); }
  .featured-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
`;