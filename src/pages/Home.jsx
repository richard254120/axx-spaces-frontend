import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import bgVideo from "../assets/AXX Homepage Video.mp4";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [searchForm, setSearchForm] = useState({ county: "", type: "" });
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    "💬 Connect Directly with Landlords via WhatsApp and call",
    "🚀 Boost Your Property for Maximum Visibility",
    "🔒 Safe, Secure & 100% Transparent",
    "📱 Search on Any Device, Anytime",
    "🗺 Interactive Maps for Every Listing",
    "💰 Zero Hidden Fees — Ever",
    "🎉 Over 500 Happy Tenants and Counting!",
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setFetchError(false);
        const res = await API.get("/payment/featured", { timeout: 15000 });
        const data = res?.data;
        if (Array.isArray(data)) {
          setFeaturedProperties(data);
        } else if (data && Array.isArray(data.properties)) {
          setFeaturedProperties(data.properties);
        } else {
          setFeaturedProperties([]);
        }
      } catch (err) {
        console.error("Failed to load featured properties:", err?.message || err);
        setFetchError(true);
        setFeaturedProperties([]);
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

      {/* ── MARQUEE at top ── */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>
              {item}<span style={styles.marqueeSep}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO WITH BACKGROUND VIDEO ── */}
      <section style={styles.hero}>
        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={styles.bgVideo}
          className="hero-video"
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* DARK OVERLAY — video visible, text clear */}
        <div style={styles.videoOverlay}></div>

        {/* CONTENT ABOVE VIDEO */}
        <div style={styles.heroContent}>
          <div style={styles.trustBadge}>
            <span style={styles.trustDot}></span>
            Kenya's Most Trusted Rental Platform
          </div>

          <h1 style={styles.heroTitle}>Find Your Dream Home<br />in Kenya</h1>
          <p style={styles.heroSubtitle}>
            Verified rentals across all 47 counties. No agents. No hidden fees.
          </p>

          {/* ── SEARCH PROPERTY LABEL ── */}
          <p style={styles.searchPropertyLabel}>Search Property</p>

          {/* ── HAMBURGER SEARCH TRIGGER ── */}
          <div style={styles.hamburgerWrapper}>
            <button
              type="button"
              style={styles.hamburgerBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open property search"
              className="hamburger-btn"
            >
              <span style={{
                ...styles.hamburgerLine,
                transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
              }}></span>
              <span style={{
                ...styles.hamburgerLine,
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "none",
              }}></span>
              <span style={{
                ...styles.hamburgerLine,
                transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
              }}></span>
            </button>
            <span style={styles.hamburgerLabel}>Search Properties</span>
          </div>

          {/* Dropdown search panel */}
          {menuOpen && (
            <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} style={styles.searchDropdown} className="hamburger-menu">
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
            </form>
          )}

          <div style={styles.heroStats}>
            {[
              { val: "280", label: "Active Listings" },
              { val: "47", label: "Counties" },
              { val: "500+", label: "Happy Tenants" },
            ].map((s) => (
              <div key={s.label} style={styles.heroStat}>
                <span style={styles.heroStatVal}>{s.val}</span>
                <span style={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>
          <p style={styles.sectionSubtitle}>
            Verified &amp; boosted properties — handpicked for maximum trust
          </p>
        </div>

        {loadingFeatured ? (
          <div style={styles.loadingWrap}>
            <div className="spinner"></div>
            <p style={styles.loadingText}>Loading featured properties...</p>
          </div>
        ) : fetchError ? (
          <div style={styles.noFeatured}>
            <div style={styles.noFeaturedIcon}>⚠️</div>
            <p style={styles.noFeaturedText}>Could not load featured listings</p>
            <p style={styles.noFeaturedSub}>Please refresh in a moment.</p>
            <button onClick={() => window.location.reload()} style={styles.boostBtn}>
              🔄 Retry
            </button>
          </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div style={styles.marqueeCardsWrapper}>
              <div className="cards-marquee-track">
                {[...featuredProperties, ...featuredProperties].map((property, idx) => (
                  <div key={`${property._id}-${idx}`} style={styles.featuredCard} className="featured-card">
                    <div style={styles.featuredImageWrapper}>
                      <img
                        src={property.images?.[0] || ""}
                        alt={property.title || "Property"}
                        style={styles.featuredImage}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div style={styles.boostedBadge}>⭐ BOOSTED</div>
                      <div style={styles.featuredType}>{property.type || "Rental"}</div>
                    </div>
                    <div style={styles.featuredInfo}>
                      <h3 style={styles.featuredTitle}>{property.title}</h3>
                      <p style={styles.featuredLocation}>📍 {property.area}, {property.county}</p>
                      <div style={styles.featuredMeta}>
                        {property.bedrooms && <span style={styles.metaTag}>🛏 {property.bedrooms} Bed</span>}
                        {property.bathrooms && <span style={styles.metaTag}>🚿 {property.bathrooms} Bath</span>}
                      </div>
                      <p style={styles.featuredPrice}>
                        KSh {Number(property.price).toLocaleString()}
                        <span style={styles.perMonth}> / month</span>
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
            <p style={styles.noFeaturedSub}>Boost your property to appear here and reach thousands of tenants!</p>
            <button onClick={handleListProperty} style={styles.boostBtn}>
              🚀 Boost Your Property
            </button>
          </div>
        )}
      </section>

      {/* ── WHY AXX SPACES ── */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#0B2140" }}>Why Axx Spaces?</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#6b7280" }}>Built for Kenyans, by Kenyans</p>
        </div>
        <div style={styles.featureGrid}>
          {[
            { icon: "✓", title: "Verified Properties", text: "Every listing is manually reviewed before going live on our platform", color: "#E31B1B" },
            { icon: "💬", title: "Direct WhatsApp", text: "Skip the middleman. Chat directly with landlords in seconds", color: "#E31B1B" },
            { icon: "🔒", title: "Safe & Secure", text: "Industry-standard encryption protects all your personal data", color: "#22c55e" },
            { icon: "📱", title: "Mobile Optimized", text: "Fully responsive — find your home on any phone or tablet", color: "#0B2140" },
            { icon: "🗺", title: "GPS Maps", text: "Interactive maps with exact coordinates for every property", color: "#E31B1B" },
            { icon: "💰", title: "No Hidden Fees", text: "What you see is what you pay. Transparent pricing always", color: "#0B2140" },
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

      {/* ── FINAL CTA ── */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Start Your Search Today</h2>
          <p style={styles.ctaText}>
            Join thousands of Kenyans who found their perfect home on Axx Spaces
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>
              🔍 Browse All Listings
            </button>
            <button
              style={{
                ...styles.ctaBtnSecondary,
                background: token ? "#E31B1B" : "white",
                color: token ? "white" : "#0B2140",
                border: token ? "none" : "2px solid #0B2140",
              }}
              onClick={handleListProperty}
            >
              {token ? "📝 Upload Your Property" : "🔐 Login to List Property"}
            </button>
          </div>
          {!token && (
            <p style={styles.loginHint}>💡 Free to join — no credit card required</p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <strong style={{ color: "#E31B1B", fontSize: "18px" }}>Axx Spaces</strong>
            <p style={styles.footerTagline}>Kenya's most trusted rental platform</p>
          </div>
          <div style={styles.footerLinks}>
            {["Browse Listings", "List Property", "How It Works", "Contact Us"].map((l) => (
              <span key={l} style={styles.footerLink}>{l}</span>
            ))}
          </div>
          <p style={styles.footerCopy}>© 2026 Axx Spaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════ UNIFIED COLOR SYSTEM ═══════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#FFFFFF",
    color: "#0B2140",
    minHeight: "100vh",
  },

  /* ── Marquee ── */
  marqueeWrapper: {
    overflow: "hidden",
    background: "linear-gradient(90deg, #E31B1B 0%, #D91414 50%, #E31B1B 100%)",
    padding: "9px 0",
    borderBottom: "2px solid #C01010",
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
    color: "#0B2140",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(227, 27, 27, 0.15)",
  },
  marqueeSep: {
    color: "#C01010",
    fontWeight: 700,
    fontSize: "16px",
    marginLeft: "8px",
  },

  /* ── Hero ── */
  hero: {
    position: "relative",
    padding: "80px 16px 60px",
    textAlign: "center",
    borderBottom: "3px solid #E31B1B",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  bgVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    zIndex: 0,
    display: "block",
    pointerEvents: "none",
  },

  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, rgba(11, 33, 64, 0.70) 0%, rgba(11, 33, 64, 0.60) 50%, rgba(11, 33, 64, 0.75) 100%)",
    zIndex: 1,
  },

  heroContent: {
    maxWidth: "820px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.95)",
    color: "#0B2140",
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "18px",
    border: "1px solid rgba(227, 27, 27, 0.3)",
    boxShadow: "0 4px 16px rgba(227, 27, 27, 0.2)",
  },
  trustDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#E31B1B",
    display: "inline-block",
    animation: "pulse 1.8s infinite",
  },
  heroTitle: {
    fontSize: "clamp(30px, 5.5vw, 52px)",
    fontWeight: 800,
    color: "white",
    margin: "0 0 12px",
    letterSpacing: "-1.5px",
    lineHeight: 1.15,
    textShadow: "0 2px 16px rgba(11, 33, 64, 0.8), 0 1px 4px rgba(11, 33, 64, 0.6)",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: "#f3f4f6",
    margin: "0 auto 30px",
    maxWidth: "480px",
    lineHeight: 1.6,
    textShadow: "0 1px 8px rgba(11, 33, 64, 0.6)",
  },

  searchPropertyLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    margin: "0 0 8px",
    textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)",
  },

  /* ── Hamburger search trigger ── */
  hamburgerWrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.15)",
    border: "1.5px solid rgba(255,255,255,0.35)",
    borderRadius: "50px",
    padding: "8px 20px 8px 8px",
    margin: "0 auto 16px",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
  },

  hamburgerLabel: {
    color: "white",
    fontWeight: 700,
    fontSize: "15px",
    letterSpacing: "0.02em",
    textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)",
  },

  hamburgerBtn: {
    background: "#0B2140",
    border: "none",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    flexShrink: 0,
    transition: "background 0.2s",
    padding: 0,
  },
  hamburgerLine: {
    display: "block",
    width: "20px",
    height: "2.5px",
    background: "#E31B1B",
    borderRadius: "2px",
    transition: "transform 0.25s ease, opacity 0.2s ease",
  },

  searchDropdown: {
    background: "rgba(255,255,255,0.98)",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 12px 40px rgba(227, 27, 27, 0.25)",
    maxWidth: "400px",
    width: "100%",
    margin: "0 auto 30px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxSizing: "border-box",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(227, 27, 27, 0.1)",
  },
  searchInput: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#0B2140",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  searchBtn: {
    padding: "13px 22px",
    background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(227, 27, 27, 0.35)",
    width: "100%",
  },

  /* ── Hero Stats ── */
  heroStats: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
  heroStatVal: {
    fontSize: "20px",
    fontWeight: 800,
    color: "white",
    textShadow: "0 2px 10px rgba(11, 33, 64, 0.6)",
  },
  heroStatLabel: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: 500,
    textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)",
  },

  /* ── Featured ── */
  featuredSection: {
    padding: "60px 0 60px",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)",
    color: "#0B2140",
    overflow: "hidden",
  },
  sectionHeader: { textAlign: "center", marginBottom: "44px", padding: "0 20px" },
  sectionTitle: { fontSize: "30px", fontWeight: 800, color: "#E31B1B", margin: "0 0 10px" },
  sectionSubtitle: { color: "#6b7280", fontSize: "16px", margin: 0 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "40px 0" },
  loadingText: { color: "#6b7280", fontSize: "15px" },

  marqueeCardsWrapper: {
    overflow: "hidden",
    width: "100%",
  },
  featuredCard: {
    background: "white",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    transition: "transform 0.25s, box-shadow 0.25s",
    minWidth: "280px",
    maxWidth: "280px",
    flexShrink: 0,
    margin: "0 12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  featuredImageWrapper: { position: "relative" },
  featuredImage: { width: "100%", height: "180px", objectFit: "cover", display: "block" },
  boostedBadge: {
    position: "absolute", top: "12px", left: "12px",
    background: "#E31B1B", color: "white",
    padding: "4px 12px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 700,
  },
  featuredType: {
    position: "absolute", top: "12px", right: "12px",
    background: "rgba(11, 33, 64, 0.85)", color: "white",
    padding: "4px 10px", borderRadius: "6px",
    fontSize: "11px", fontWeight: 600,
  },
  featuredInfo: { padding: "16px 18px 20px" },
  featuredTitle: { fontSize: "15px", fontWeight: 700, margin: "0 0 6px", color: "#0B2140" },
  featuredLocation: { color: "#6b7280", margin: "0 0 8px", fontSize: "12px" },
  featuredMeta: { display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" },
  metaTag: {
    background: "rgba(227, 27, 27, 0.1)", color: "#E31B1B",
    padding: "3px 10px", borderRadius: "6px",
    fontSize: "11px", fontWeight: 500,
  },
  featuredPrice: { color: "#E31B1B", fontSize: "17px", fontWeight: 800, margin: "8px 0 0" },
  perMonth: { fontSize: "12px", color: "#C01010", fontWeight: 400 },
  viewBtn: {
    marginTop: "14px", width: "100%", padding: "11px",
    background: "linear-gradient(135deg, #0B2140 0%, #152B4A 100%)", color: "white", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: 700,
    fontSize: "13px", transition: "background 0.2s",
  },
  viewAllBtn: {
    padding: "13px 36px", background: "transparent",
    color: "#E31B1B", border: "2px solid #E31B1B",
    borderRadius: "10px", fontSize: "15px", fontWeight: 700,
    cursor: "pointer", transition: "all 0.2s",
  },
  noFeatured: { textAlign: "center", padding: "40px 20px" },
  noFeaturedIcon: { fontSize: "52px", marginBottom: "12px" },
  noFeaturedText: { color: "#0B2140", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" },
  noFeaturedSub: { color: "#6b7280", fontSize: "14px", margin: "0 0 20px" },
  boostBtn: {
    padding: "12px 28px", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)",
    color: "white", border: "none", borderRadius: "8px",
    fontWeight: 700, fontSize: "15px", cursor: "pointer",
  },

  /* ── Features ── */
  featuresSection: { padding: "72px 20px", background: "#FFFFFF", maxWidth: "1200px", margin: "0 auto" },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px", marginTop: "8px",
  },
  featureCard: {
    padding: "26px", background: "#F8F9FA", borderRadius: "12px",
    textAlign: "center", border: "1px solid #e5e7eb", transition: "all 0.22s",
  },
  featureIcon: { fontSize: "34px", marginBottom: "14px" },
  featureTitle: { fontSize: "16px", fontWeight: 700, color: "#0B2140", margin: "0 0 10px" },
  featureText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* ── CTA ── */
  cta: {
    background: "linear-gradient(135deg, #0B2140 0%, #1a3a52 100%)",
    padding: "76px 20px", textAlign: "center",
    borderTop: "3px solid #E31B1B",
  },
  ctaInner: { maxWidth: "640px", margin: "0 auto" },
  ctaTitle: { fontSize: "34px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "17px", color: "rgba(255,255,255,0.9)", margin: "0 0 32px" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
  ctaBtnPrimary: {
    padding: "14px 32px", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)", color: "white",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(227, 27, 27, 0.4)",
  },
  ctaBtnSecondary: {
    padding: "14px 32px", borderRadius: "10px",
    fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
  },
  loginHint: { fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "16px", fontStyle: "italic" },

  /* ── Footer ── */
  footer: { background: "#0B2140", color: "#cbd5e1", padding: "36px 20px 20px" },
  footerInner: { maxWidth: "960px", margin: "0 auto", textAlign: "center" },
  footerBrand: { marginBottom: "18px" },
  footerTagline: { fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" },
  footerLinks: {
    display: "flex", justifyContent: "center",
    gap: "24px", flexWrap: "wrap", marginBottom: "20px",
  },
  footerLink: { fontSize: "13px", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" },
  footerCopy: { fontSize: "12px", color: "#475569", margin: 0 },
};

/* ════════════════════════ INJECTED CSS ════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes cardsMarquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .marquee-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: marquee 34s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  .cards-marquee-track {
    display: flex;
    align-items: stretch;
    width: max-content;
    animation: cardsMarquee 30s linear infinite;
    padding: 10px 0 20px;
  }
  .cards-marquee-track:hover { animation-play-state: paused; }

  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #E31B1B;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .hamburger-menu {
    animation: slideDown 0.2s ease;
  }

  .hamburger-btn:hover {
    background: #152B4A !important;
    transform: scale(1.05);
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
    border-color: #E31B1B !important;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.12);
  }

  button:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.93; }

  .featured-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(227, 27, 27, 0.15);
  }

  .view-btn:hover { background: linear-gradient(135deg, #152B4A 0%, #1a3a52 100%) !important; }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(227, 27, 27, 0.08);
    background: white;
  }

  @media (max-width: 620px) {
    .search-row { grid-template-columns: 1fr !important; }
  }
`;