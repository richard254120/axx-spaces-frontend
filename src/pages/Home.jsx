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

  const testimonials = [
    {
      name: "Amina Wanjiru",
      location: "Nairobi",
      text: "Found my dream apartment in Westlands within 2 days. The WhatsApp contact feature saved me so much time — no agents, no hassle!",
      rating: 5,
      avatar: "AW",
      color: "#3b82f6",
    },
    {
      name: "Brian Otieno",
      location: "Kisumu",
      text: "As a landlord, boosting my property got me 3 serious tenants in one week. Axx Spaces is genuinely the best platform in Kenya.",
      rating: 5,
      avatar: "BO",
      color: "#22c55e",
    },
    {
      name: "Fatuma Hassan",
      location: "Mombasa",
      text: "The verified listings gave me confidence. I knew exactly what I was getting before I even visited. Professional and trustworthy.",
      rating: 5,
      avatar: "FH",
      color: "#f59e0b",
    },
  ];

  const howItWorks = [
    { step: "01", icon: "🔍", title: "Search", desc: "Filter by county and property type to find your match instantly." },
    { step: "02", icon: "🏠", title: "Explore", desc: "Browse photos, maps, and full details of verified listings." },
    { step: "03", icon: "💬", title: "Connect", desc: "Contact the landlord directly on WhatsApp — zero middlemen." },
    { step: "04", icon: "🎉", title: "Move In", desc: "Agree terms, sign, and move into your new home stress-free." },
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
    if (!token) { navigate("/login"); return; }
    navigate("/upload");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── MARQUEE ── */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>
              {item}<span style={styles.marqueeSep}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
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
        ) : featuredProperties.length > 0 ? (
          <>
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

      {/* ── HOW IT WORKS ── */}
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
              {i < howItWorks.length - 1 && (
                <div style={styles.howArrow} className="how-arrow">›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST INDICATORS ── */}
      <section style={styles.trustSection}>
        <div style={styles.trustGrid}>
          {[
            { icon: "🛡", title: "100% Verified Listings", desc: "Every property is manually reviewed before going live" },
            { icon: "⚡", title: "Instant WhatsApp Connect", desc: "Reach landlords directly — no brokers, no delays" },
            { icon: "📸", title: "Real Photos Only", desc: "Authentic images from actual property walkthroughs" },
            { icon: "🗺", title: "GPS-Pinned Locations", desc: "Know exactly where you're going before you visit" },
            { icon: "💳", title: "Secure Payments", desc: "Boosting handled via encrypted M-Pesa gateway" },
            { icon: "🤝", title: "Landlord Vetted", desc: "All hosts pass our verification before listing" },
          ].map((t) => (
            <div key={t.title} style={styles.trustCard} className="trust-card">
              <div style={styles.trustIcon}>{t.icon}</div>
              <div>
                <h4 style={styles.trustTitle}>{t.title}</h4>
                <p style={styles.trustDesc}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={styles.statsStrip}>
        {[
          { val: "47", label: "Counties Covered", color: "#fbbf24" },
          { val: "10,000+", label: "Verified Listings", color: "#ef4444" },
          { val: "5,000+", label: "Happy Tenants", color: "#22c55e" },
          { val: "24/7", label: "Customer Support", color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} style={styles.statItem}>
            <div style={{ ...styles.statNum, color: s.color }}>{s.val}</div>
            <div style={styles.statLbl}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={styles.testimonialsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#1f2937" }}>What Our Users Say</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#6b7280" }}>
            Real stories from tenants and landlords across Kenya
          </p>
        </div>

        <div style={styles.testimonialsWrap}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                ...styles.testimonialCard,
                opacity: activeTestimonial === i ? 1 : 0.35,
                transform: activeTestimonial === i ? "scale(1)" : "scale(0.96)",
                border: activeTestimonial === i ? `2px solid ${t.color}` : "2px solid #e5e7eb",
              }}
              onClick={() => setActiveTestimonial(i)}
            >
              <div style={styles.stars}>{"★".repeat(t.rating)}</div>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={{ ...styles.avatarCircle, background: t.color }}>{t.avatar}</div>
                <div>
                  <p style={styles.authorName}>{t.name}</p>
                  <p style={styles.authorLocation}>📍 {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.testimonialDots}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              style={{
                ...styles.dot,
                background: activeTestimonial === i ? "#fbbf24" : "#d1d5db",
                width: activeTestimonial === i ? "24px" : "8px",
              }}
            />
          ))}
        </div>
      </section>

      {/* ── LANDLORD BANNER ── */}
      <section style={styles.landlordBanner}>
        <div style={styles.landlordContent}>
          <div style={styles.landlordLeft}>
            <span style={styles.landlordBadge}>FOR LANDLORDS</span>
            <h2 style={styles.landlordTitle}>List Your Property,<br />Reach 50,000+ Tenants</h2>
            <p style={styles.landlordDesc}>
              Free listing. Paid boosting for priority placement. No commissions.
            </p>
            <div style={styles.landlordPerks}>
              {[
                "✅ Free to list",
                "📊 Track views & enquiries",
                "🚀 Boost for KSh 500/week",
                "💬 Instant tenant contact",
              ].map((p) => (
                <span key={p} style={styles.perkItem}>{p}</span>
              ))}
            </div>
          </div>
          <div style={styles.landlordRight}>
            <button style={styles.landlordBtn} onClick={handleListProperty}>
              {token ? "📝 Upload Your Property" : "🔐 Get Started Free"}
            </button>
            {!token && <p style={styles.landlordHint}>No credit card required</p>}
          </div>
        </div>
      </section>

      {/* ── WHY AXX SPACES ── */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#1f2937" }}>Why Axx Spaces?</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#6b7280" }}>Built for Kenyans, by Kenyans</p>
        </div>
        <div style={styles.featureGrid}>
          {[
            { icon: "✓", title: "Verified Properties", text: "Every listing is manually reviewed before going live on our platform", color: "#fbbf24" },
            { icon: "💬", title: "Direct WhatsApp", text: "Skip the middleman. Chat directly with landlords in seconds", color: "#ef4444" },
            { icon: "🔒", title: "Safe & Secure", text: "Industry-standard encryption protects all your personal data", color: "#22c55e" },
            { icon: "📱", title: "Mobile Optimized", text: "Fully responsive — find your home on any phone or tablet", color: "#3b82f6" },
            { icon: "🗺", title: "GPS Maps", text: "Interactive maps with exact coordinates for every property", color: "#fbbf24" },
            { icon: "💰", title: "No Hidden Fees", text: "What you see is what you pay. Transparent pricing always", color: "#ef4444" },
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
            <p style={styles.loginHint}>💡 Free to join — no credit card required</p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <strong style={{ color: "#fbbf24", fontSize: "18px" }}>Axx Spaces</strong>
            <p style={styles.footerTagline}>Kenya's most trusted rental platform</p>
          </div>
          <div style={styles.footerLinks}>
            {["Browse Listings", "List Property", "How It Works", "Contact Us"].map((l) => (
              <span key={l} style={styles.footerLink}>{l}</span>
            ))}
          </div>
          <p style={styles.footerCopy}>© 2024 Axx Spaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════ STYLES ═══════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    color: "#1f2937",
    minHeight: "100vh",
  },

  /* Marquee */
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

  /* Hero */
  hero: {
    background: "linear-gradient(150deg, #ffffff 0%, #fef3e2 55%, #fff7ed 100%)",
    padding: "40px 20px 44px",
    textAlign: "center",
    borderBottom: "3px solid #fbbf24",
  },
  heroContent: { maxWidth: "820px", margin: "0 auto" },
  logoContainer: { display: "flex", justifyContent: "center", marginBottom: "16px" },
  heroLogo: { height: "80px", width: "auto" },
  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#dcfce7",
    color: "#15803d",
    padding: "5px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "18px",
    border: "1px solid #bbf7d0",
  },
  trustDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    animation: "pulse 1.8s infinite",
  },
  heroTitle: {
    fontSize: "clamp(30px, 5.5vw, 52px)",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 12px",
    letterSpacing: "-1.5px",
    lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0 auto 30px",
    maxWidth: "480px",
    lineHeight: 1.6,
  },
  searchCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px 28px 18px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    maxWidth: "680px",
    margin: "0 auto 30px",
    textAlign: "left",
    border: "1px solid #f3f4f6",
  },
  searchLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 12px",
  },
  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "10px",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#1f2937",
    transition: "all 0.2s",
  },
  searchBtn: {
    padding: "12px 22px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
  },
  searchHint: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "12px 0 0",
    textAlign: "center",
  },
  heroStats: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
  heroStatVal: { fontSize: "20px", fontWeight: 800, color: "#1f2937" },
  heroStatLabel: { fontSize: "11px", color: "#9ca3af", fontWeight: 500 },

  /* Featured */
  featuredSection: { padding: "60px 20px", background: "#1f2937", color: "white" },
  sectionHeader: { textAlign: "center", marginBottom: "44px" },
  sectionTitle: { fontSize: "30px", fontWeight: 800, color: "#fbbf24", margin: "0 0 10px" },
  sectionSubtitle: { color: "#94a3b8", fontSize: "16px", margin: 0 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "40px 0" },
  loadingText: { color: "#94a3b8", fontSize: "15px" },
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
    transition: "transform 0.25s, box-shadow 0.25s",
  },
  featuredImageWrapper: { position: "relative" },
  featuredImage: { width: "100%", height: "195px", objectFit: "cover", display: "block" },
  boostedBadge: {
    position: "absolute", top: "12px", left: "12px",
    background: "#eab308", color: "#000",
    padding: "4px 12px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 700,
  },
  featuredType: {
    position: "absolute", top: "12px", right: "12px",
    background: "rgba(0,0,0,0.65)", color: "white",
    padding: "4px 10px", borderRadius: "6px",
    fontSize: "11px", fontWeight: 600,
  },
  featuredInfo: { padding: "16px 18px 20px" },
  featuredTitle: { fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "white" },
  featuredLocation: { color: "#94a3b8", margin: "0 0 8px", fontSize: "13px" },
  featuredMeta: { display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" },
  metaTag: {
    background: "#1e3a5f", color: "#93c5fd",
    padding: "3px 10px", borderRadius: "6px",
    fontSize: "12px", fontWeight: 500,
  },
  featuredPrice: { color: "#22c55e", fontSize: "18px", fontWeight: 800, margin: "8px 0 0" },
  perMonth: { fontSize: "13px", color: "#4ade80", fontWeight: 400 },
  viewBtn: {
    marginTop: "14px", width: "100%", padding: "11px",
    background: "#3b82f6", color: "white", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: 700,
    fontSize: "14px", transition: "background 0.2s",
  },
  viewAllBtn: {
    padding: "13px 36px", background: "transparent",
    color: "#fbbf24", border: "2px solid #fbbf24",
    borderRadius: "10px", fontSize: "15px", fontWeight: 700,
    cursor: "pointer", transition: "all 0.2s",
  },
  noFeatured: { textAlign: "center", padding: "40px 20px" },
  noFeaturedIcon: { fontSize: "52px", marginBottom: "12px" },
  noFeaturedText: { color: "#e5e7eb", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" },
  noFeaturedSub: { color: "#94a3b8", fontSize: "14px", margin: "0 0 20px" },
  boostBtn: {
    padding: "12px 28px", background: "#fbbf24",
    color: "#000", border: "none", borderRadius: "8px",
    fontWeight: 700, fontSize: "15px", cursor: "pointer",
  },

  /* How It Works */
  howSection: { padding: "70px 20px", background: "white" },
  howGrid: {
    display: "flex", justifyContent: "center", gap: "0",
    maxWidth: "1000px", margin: "0 auto",
    flexWrap: "wrap", position: "relative",
  },
  howCard: {
    flex: "1", minWidth: "180px", maxWidth: "220px",
    textAlign: "center", padding: "28px 16px", position: "relative",
  },
  howStep: { fontSize: "11px", fontWeight: 800, color: "#ef4444", letterSpacing: "0.1em", marginBottom: "10px" },
  howIcon: { fontSize: "36px", marginBottom: "12px" },
  howTitle: { fontSize: "17px", fontWeight: 700, color: "#1f2937", margin: "0 0 8px" },
  howDesc: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },
  howArrow: {
    position: "absolute", right: "-12px", top: "50%",
    transform: "translateY(-60%)", fontSize: "28px",
    color: "#d1d5db", fontWeight: 300, zIndex: 1,
  },

  /* Trust */
  trustSection: { background: "#f8f4f0", padding: "60px 20px" },
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px", maxWidth: "1100px", margin: "0 auto",
  },
  trustCard: {
    background: "white", borderRadius: "12px", padding: "20px 22px",
    display: "flex", gap: "16px", alignItems: "flex-start",
    border: "1px solid #e5e7eb", transition: "transform 0.2s, box-shadow 0.2s",
  },
  trustIcon: { fontSize: "28px", flexShrink: 0, marginTop: "2px" },
  trustTitle: { fontSize: "15px", fontWeight: 700, color: "#1f2937", margin: "0 0 4px" },
  trustDesc: { fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: 1.5 },

  /* Stats Strip */
  statsStrip: {
    background: "#111827", padding: "44px 20px",
    display: "flex", justifyContent: "center",
    gap: "48px", flexWrap: "wrap", color: "white",
  },
  statItem: { textAlign: "center" },
  statNum: { fontSize: "32px", fontWeight: 800, marginBottom: "4px" },
  statLbl: { fontSize: "13px", color: "#9ca3af" },

  /* Testimonials */
  testimonialsSection: { padding: "70px 20px", background: "white" },
  testimonialsWrap: {
    display: "flex", gap: "20px", maxWidth: "1100px",
    margin: "0 auto 24px", flexWrap: "wrap", justifyContent: "center",
  },
  testimonialCard: {
    background: "#f9fafb", borderRadius: "14px", padding: "26px",
    maxWidth: "310px", flex: "1", minWidth: "240px",
    cursor: "pointer", transition: "all 0.4s ease",
    border: "2px solid #e5e7eb",
  },
  stars: { color: "#fbbf24", fontSize: "18px", marginBottom: "12px", letterSpacing: "2px" },
  testimonialText: { fontSize: "14px", color: "#374151", lineHeight: 1.7, margin: "0 0 20px", fontStyle: "italic" },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: "12px" },
  avatarCircle: {
    width: "42px", height: "42px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 700, fontSize: "14px", flexShrink: 0,
  },
  authorName: { fontSize: "14px", fontWeight: 700, color: "#1f2937", margin: 0 },
  authorLocation: { fontSize: "12px", color: "#9ca3af", margin: 0 },
  testimonialDots: { display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" },
  dot: { height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 },

  /* Landlord Banner */
  landlordBanner: {
    background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    padding: "60px 20px",
    borderTop: "3px solid #fbbf24",
    borderBottom: "3px solid #fbbf24",
  },
  landlordContent: {
    maxWidth: "960px", margin: "0 auto",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "40px", flexWrap: "wrap",
  },
  landlordLeft: { flex: 1, minWidth: "260px" },
  landlordBadge: {
    background: "#fbbf24", color: "#000",
    padding: "4px 14px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 800,
    letterSpacing: "0.08em", display: "inline-block", marginBottom: "16px",
  },
  landlordTitle: {
    fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800,
    color: "white", margin: "0 0 12px", lineHeight: 1.2,
  },
  landlordDesc: { fontSize: "15px", color: "#94a3b8", margin: "0 0 20px" },
  landlordPerks: { display: "flex", flexDirection: "column", gap: "6px" },
  perkItem: { fontSize: "14px", color: "#d1fae5", fontWeight: 500 },
  landlordRight: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  landlordBtn: {
    padding: "16px 36px", background: "#fbbf24", color: "#000",
    border: "none", borderRadius: "12px", fontSize: "16px",
    fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 6px 20px rgba(251,191,36,0.35)", whiteSpace: "nowrap",
  },
  landlordHint: { fontSize: "12px", color: "#6b7280", margin: 0 },

  /* Features */
  featuresSection: { padding: "72px 20px", background: "#f8f4f0", maxWidth: "1200px", margin: "0 auto" },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px", marginTop: "8px",
  },
  featureCard: {
    padding: "26px", background: "white", borderRadius: "12px",
    textAlign: "center", border: "1px solid #e5e7eb", transition: "all 0.22s",
  },
  featureIcon: { fontSize: "34px", marginBottom: "14px" },
  featureTitle: { fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: "0 0 10px" },
  featureText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* CTA */
  cta: {
    background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)",
    padding: "76px 20px", textAlign: "center",
    borderTop: "3px solid #f59e0b",
  },
  ctaInner: { maxWidth: "640px", margin: "0 auto" },
  ctaTitle: { fontSize: "34px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: "0 0 32px" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
  ctaBtnPrimary: {
    padding: "14px 32px", background: "#ef4444", color: "white",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
  },
  ctaBtnSecondary: {
    padding: "14px 32px", borderRadius: "10px",
    fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
  },
  loginHint: { fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "16px", fontStyle: "italic" },

  /* Footer */
  footer: { background: "#1f2937", color: "#d1d5db", padding: "36px 20px 20px" },
  footerInner: { maxWidth: "960px", margin: "0 auto", textAlign: "center" },
  footerBrand: { marginBottom: "18px" },
  footerTagline: { fontSize: "13px", color: "#6b7280", margin: "4px 0 0" },
  footerLinks: {
    display: "flex", justifyContent: "center",
    gap: "24px", flexWrap: "wrap", marginBottom: "20px",
  },
  footerLink: { fontSize: "13px", color: "#9ca3af", cursor: "pointer", transition: "color 0.2s" },
  footerCopy: { fontSize: "12px", color: "#4b5563", margin: 0 },
};

/* ════════════════════════ INJECTED CSS ════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes marquee {
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

  .marquee-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: marquee 34s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #334155;
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
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

  button:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.93; }

  .featured-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.35);
  }

  .view-btn:hover { background: #2563eb !important; }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .trust-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.07);
  }

  @media (max-width: 620px) {
    .search-row { grid-template-columns: 1fr !important; }
    .how-arrow { display: none !important; }
  }
`;