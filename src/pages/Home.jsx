import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.jpeg";

// ── Floating particle background ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.dx;
        d.y += d.dy;
        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${d.alpha})`;
        ctx.fill();
      });
      // draw faint connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, label, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(end / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 20);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} style={styles.statItem}>
      <span style={styles.statNumber}>{count.toLocaleString()}{suffix}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: "", area: "", price: "", type: "", bedrooms: "",
  });
  const [activeTab, setActiveTab] = useState("rent");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Data ────────────────────────────────────────────────────────────────────
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

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
    "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block",
    "Single Room","Shared Room","Hostel Room","Commercial Office",
    "Shop / Retail Space","Warehouse","Plot / Land",
    "Furnished Apartment","Unfurnished Apartment",
  ];

  const featuredAreas = [
    { name: "Nairobi", listings: 1240, emoji: "🏙️" },
    { name: "Mombasa", listings: 430, emoji: "🌊" },
    { name: "Kisumu", listings: 290, emoji: "🌅" },
    { name: "Nakuru", listings: 215, emoji: "🌿" },
    { name: "Eldoret", listings: 180, emoji: "🏞️" },
    { name: "Thika", listings: 165, emoji: "🏘️" },
  ];

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (searchData.location) query.append("county", searchData.location);
    if (searchData.area)     query.append("area", searchData.area);
    if (searchData.price)    query.append("price", searchData.price);
    if (searchData.type)     query.append("type", searchData.type);
    if (searchData.bedrooms) query.append("bedrooms", searchData.bedrooms);
    navigate(`/listings?${query.toString()}`);
  };

  const handleAreaClick = (areaName) => {
    navigate(`/listings?county=${encodeURIComponent(areaName)}`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <style>{cssOverrides}</style>

      {/* ── Sticky mini-header ── */}
      <div style={{ ...styles.stickyBar, opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? "auto" : "none" }}>
        <img src={logo} alt="logo" style={styles.stickyLogo} />
        <span style={styles.stickyTitle}>Axx Spaces</span>
        <button className="axx-btn-sm" onClick={() => navigate("/upload")}>List Property</button>
      </div>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <div style={styles.hero}>
        <ParticleCanvas />
        <div style={styles.heroInner}>

          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Kenya&apos;s #1 Verified Rental Platform
          </div>

          <img src={logo} alt="Axx Spaces Logo" style={styles.logo} />

          <h1 style={styles.title}>
            Find Affordable &amp; Verified<br />
            <span style={styles.titleAccent}>Homes in Kenya</span> 🏠
          </h1>

          <p style={styles.subtitle}>
            Trusted rental platform connecting landlords and tenants across all 47 counties
          </p>

          {/* ── Rent / Buy / Hostel tabs ── */}
          <div style={styles.tabRow}>
            {["rent", "buy", "hostel"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  ...styles.tab,
                  ...(activeTab === t ? styles.tabActive : {}),
                }}
              >
                {{ rent: "🏠 Rent", buy: "💰 Buy", hostel: "🛏 Hostel" }[t]}
              </button>
            ))}
          </div>

          {/* ── Search box ── */}
          <div style={styles.searchCard}>
            <div style={styles.searchBox}>
              <select
                className="axx-input"
                value={searchData.location}
                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
              >
                <option value="">📍 Select County</option>
                {counties.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>

              <input
                className="axx-input"
                placeholder="🏘 Area (e.g Kilimani)"
                value={searchData.area}
                onChange={(e) => setSearchData({ ...searchData, area: e.target.value })}
              />

              <input
                className="axx-input"
                placeholder="💵 Max Price (KES)"
                value={searchData.price}
                onChange={(e) => setSearchData({ ...searchData, price: e.target.value })}
              />

              <select
                className="axx-input"
                value={searchData.type}
                onChange={(e) => setSearchData({ ...searchData, type: e.target.value })}
              >
                <option value="">🏗 Property Type</option>
                {propertyTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>

              <select
                className="axx-input"
                value={searchData.bedrooms}
                onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
              >
                <option value="">🛏 Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <button className="axx-btn" onClick={handleSearch}>
                Search Homes
              </button>
            </div>

            {/* Quick filters */}
            <div style={styles.quickFilters}>
              <span style={styles.quickLabel}>Quick:</span>
              {["Bedsitter", "Studio Apartment", "2 Bedroom", "Furnished Apartment"].map((q) => (
                <button
                  key={q}
                  className="axx-chip"
                  onClick={() => {
                    setSearchData({ ...searchData, type: q });
                    navigate(`/listings?type=${encodeURIComponent(q)}`);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={styles.scrollHint}>
          <div style={styles.scrollDot} />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <div style={styles.statsStrip}>
        <Counter end={4800} label="Active Listings" />
        <div style={styles.statDivider} />
        <Counter end={47} label="Counties Covered" />
        <div style={styles.statDivider} />
        <Counter end={12000} label="Happy Tenants" />
        <div style={styles.statDivider} />
        <Counter end={3200} label="Verified Landlords" />
      </div>

      {/* ══════════════════════════════════════════
          BROWSE BY CITY
      ══════════════════════════════════════════ */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Browse by City</h2>
          <p style={styles.sectionSub}>Explore top rental markets across Kenya</p>
        </div>

        <div style={styles.areaGrid}>
          {featuredAreas.map((area) => (
            <button
              key={area.name}
              className="axx-area-card"
              onClick={() => handleAreaClick(area.name)}
            >
              <span style={styles.areaEmoji}>{area.emoji}</span>
              <span style={styles.areaName}>{area.name}</span>
              <span style={styles.areaCount}>{area.listings} listings</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHY RENTERS TRUST AXX SPACES
      ══════════════════════════════════════════ */}
      <div style={{ ...styles.section, background: "#080f1e" }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Why Renters Trust Axx Spaces</h2>
          <p style={styles.sectionSub}>Everything you need for a stress-free rental experience</p>
        </div>

        <div style={styles.grid}>
          {[
            { icon: "🔐", title: "Verified Listings", desc: "Every property is reviewed before approval" },
            { icon: "🧾", title: "No Fake Ads",       desc: "We filter scams and fake landlords" },
            { icon: "📞", title: "Direct Contact",    desc: "Talk directly to landlords, no middlemen" },
            { icon: "⚡", title: "Fast Updates",      desc: "New listings appear instantly" },
            { icon: "🗺️", title: "All 47 Counties",   desc: "Search properties anywhere in Kenya" },
            { icon: "🔔", title: "Alerts",            desc: "Get notified when new matches appear" },
          ].map((f) => (
            <div key={f.title} className="axx-feature-card">
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSub}>Find your next home in 3 easy steps</p>
        </div>

        <div style={styles.stepsRow}>
          {[
            { n: "01", title: "Search", desc: "Filter by county, price, and property type to find what fits your needs." },
            { n: "02", title: "Connect", desc: "View verified listings and contact landlords directly — no agents needed." },
            { n: "03", title: "Move In", desc: "Agree on terms, sign your lease, and settle into your new home." },
          ].map((step, i) => (
            <div key={step.n} style={styles.step}>
              <div style={styles.stepNum}>{step.n}</div>
              {i < 2 && <div style={styles.stepArrow}>→</div>}
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <div style={{ ...styles.section, background: "#080f1e" }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>What Our Users Say</h2>
          <p style={styles.sectionSub}>Real stories from real tenants</p>
        </div>

        <div style={styles.grid}>
          {[
            {
              quote: "Found a 2-bedroom in Kilimani within 3 days. The verification system gave me so much confidence!",
              name: "Amina W.", city: "Nairobi",
            },
            {
              quote: "Listed my property on a Friday, had a tenant the following Monday. Axx Spaces is the real deal.",
              name: "James Kimani.", city: "Mombasa",
            },
            {
              quote: "The direct contact feature saved me from paying commission to three different agents. 10/10.",
              name: "Faith Okello.", city: "Kisumu", 
            },
          ].map((t) => (
            <div key={t.name} className="axx-testimonial">
              <p style={styles.quoteText}>&ldquo;{t.quote}&rdquo;</p>
              <div style={styles.quoteAuthor}>
                <span style={styles.avatar}>{t.avatar}</span>
                <div>
                  <div style={styles.authorName}>{t.name}</div>
                  <div style={styles.authorCity}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CTA  (unchanged logic, enhanced look)
      ══════════════════════════════════════════ */}
      <div style={styles.cta}>
        <div style={styles.ctaGlow} />
        <h2 style={styles.ctaTitle}>Are you a landlord?</h2>
        <p style={styles.ctaSub}>Post your property and reach thousands of tenants across Kenya</p>
        <div style={styles.ctaButtons}>
          <button className="axx-btn" onClick={() => navigate("/upload")}>
            Upload Property
          </button>
          <button className="axx-btn-outline" onClick={() => navigate("/listings")}>
            Browse Listings
          </button>
        </div>
        <p style={styles.ctaNote}>🔒 Free to list · No hidden fees · Instant approval</p>
      </div>

      {/* ── Footer ── */}
      <div style={styles.footer}>
        <span>© {new Date().getFullYear()} axxspacegroup@gmail.com · All rights reserved</span>
        <span style={{ color: "#3b82f6" }}>Made with  axxspacegroup for Kenya</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════════════ */
const styles = {
  root: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh" },

  // Sticky bar
  stickyBar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 24px",
    background: "rgba(6,16,31,0.92)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(59,130,246,0.15)",
    transition: "opacity 0.3s",
  },
  stickyLogo: { width: "30px", height: "30px", borderRadius: "8px", objectFit: "contain" },
  stickyTitle: { fontWeight: 700, fontSize: "15px", color: "#fff", flex: 1 },

  // Hero
  hero: {
    position: "relative", overflow: "hidden",
    padding: "80px 20px 60px",
    textAlign: "center",
    background: "linear-gradient(160deg, #0a1f44 0%, #060e1c 60%, #000 100%)",
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  heroInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: "900px" },

  badge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: "999px", padding: "5px 14px", fontSize: "13px",
    color: "#93c5fd", marginBottom: "20px", letterSpacing: "0.3px",
  },
  badgeDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 2s infinite" },

  logo: { width: "90px", height: "90px", objectFit: "contain", marginBottom: "12px", borderRadius: "20px", boxShadow: "0 0 40px rgba(59,130,246,0.35)" },

  title: { fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: "14px", letterSpacing: "-1px" },
  titleAccent: { background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { color: "#94a3b8", marginBottom: "24px", fontSize: "16px", maxWidth: "550px", margin: "0 auto 24px" },

  // Tabs
  tabRow: { display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" },
  tab: {
    padding: "8px 22px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: 500,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "linear-gradient(135deg,#1d4ed8,#6d28d9)",
    border: "1px solid transparent", color: "#fff",
    boxShadow: "0 0 20px rgba(59,130,246,0.4)",
  },

  // Search
  searchCard: {
    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
    padding: "24px", marginTop: "10px",
  },
  searchBox: { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" },
  quickFilters: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px", alignItems: "center", justifyContent: "center" },
  quickLabel: { color: "#64748b", fontSize: "13px" },

  // Scroll hint
  scrollHint: {
    position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
    zIndex: 1,
  },
  scrollDot: {
    width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6",
    animation: "bounce 1.8s infinite",
  },

  // Stats
  statsStrip: {
    display: "flex", justifyContent: "center", alignItems: "center",
    flexWrap: "wrap", gap: "0",
    background: "linear-gradient(90deg,#0f1e3d,#0a1630,#0f1e3d)",
    borderTop: "1px solid rgba(59,130,246,0.15)",
    borderBottom: "1px solid rgba(59,130,246,0.15)",
    padding: "28px 20px",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 40px" },
  statNumber: { fontSize: "32px", fontWeight: 800, color: "#60a5fa", lineHeight: 1 },
  statLabel: { fontSize: "12px", color: "#64748b", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.8px" },
  statDivider: { width: "1px", height: "40px", background: "rgba(59,130,246,0.2)" },

  // Sections
  section: { padding: "70px 20px", maxWidth: "1100px", margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: "40px" },
  sectionTitle: { fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" },
  sectionSub: { color: "#64748b", fontSize: "15px" },

  // Area grid
  areaGrid: { display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" },
  areaEmoji: { fontSize: "28px", display: "block", marginBottom: "8px" },
  areaName: { fontWeight: 700, fontSize: "16px", color: "#e2e8f0", display: "block" },
  areaCount: { fontSize: "12px", color: "#60a5fa", marginTop: "4px", display: "block" },

  // Feature cards
  grid: { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" },
  featureIcon: { fontSize: "30px", marginBottom: "12px" },
  featureTitle: { fontSize: "16px", fontWeight: 700, color: "#e2e8f0", marginBottom: "6px" },
  featureDesc: { fontSize: "13px", color: "#64748b", lineHeight: 1.5 },

  // Steps
  stepsRow: { display: "flex", gap: "0", justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" },
  step: { textAlign: "center", flex: "1", minWidth: "200px", maxWidth: "280px", padding: "0 16px", position: "relative" },
  stepNum: {
    fontSize: "48px", fontWeight: 900, color: "transparent",
    WebkitTextStroke: "2px #1d4ed8", marginBottom: "12px", lineHeight: 1,
  },
  stepArrow: { position: "absolute", top: "14px", right: "-16px", fontSize: "24px", color: "#1d4ed8", display: "none" },
  stepTitle: { fontSize: "18px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#64748b", lineHeight: 1.6 },

  // Testimonials
  quoteText: { fontSize: "15px", color: "#94a3b8", lineHeight: 1.7, fontStyle: "italic", marginBottom: "16px" },
  quoteAuthor: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { fontSize: "32px" },
  authorName: { fontWeight: 700, fontSize: "14px", color: "#e2e8f0" },
  authorCity: { fontSize: "12px", color: "#60a5fa" },

  // CTA
  cta: {
    padding: "80px 20px", textAlign: "center",
    background: "linear-gradient(160deg,#0c1d42,#060e1c)",
    borderTop: "1px solid rgba(59,130,246,0.15)",
    position: "relative", overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none",
  },
  ctaTitle: { fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: "#fff", marginBottom: "10px", position: "relative" },
  ctaSub: { color: "#94a3b8", marginBottom: "28px", position: "relative" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", position: "relative" },
  ctaNote: { marginTop: "20px", fontSize: "13px", color: "#475569", position: "relative" },

  // Footer
  footer: {
    padding: "20px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap",
    gap: "8px", fontSize: "13px", color: "#334155",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
};

/* ── CSS classes injected via <style> ──────────────────────────────────────── */
const cssOverrides = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  /* Inputs */
  .axx-input {
    padding: 11px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
    width: 185px;
    font-size: 14px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .axx-input:focus {
    border-color: rgba(59,130,246,0.6);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .axx-input option { background: #0f1e3d; }

  /* Primary button */
  .axx-btn {
    padding: 11px 28px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    font-family: inherit;
    white-space: nowrap;
  }
  .axx-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,0.45); }
  .axx-btn:active { transform: scale(0.97); }

  /* Small button */
  .axx-btn-sm {
    padding: 7px 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9);
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: transform 0.15s;
    font-family: inherit;
  }
  .axx-btn-sm:hover { transform: translateY(-1px); }

  /* Outline button */
  .axx-btn-outline {
    padding: 11px 28px;
    border-radius: 10px;
    border: 1px solid rgba(59,130,246,0.5);
    background: transparent;
    color: #60a5fa;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s, border 0.2s;
    font-family: inherit;
  }
  .axx-btn-outline:hover { background: rgba(59,130,246,0.1); border-color: #60a5fa; }

  /* Quick filter chips */
  .axx-chip {
    padding: 5px 14px;
    border-radius: 999px;
    border: 1px solid rgba(59,130,246,0.25);
    background: rgba(59,130,246,0.07);
    color: #93c5fd;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s, border 0.2s;
    font-family: inherit;
  }
  .axx-chip:hover { background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.6); }

  /* Area cards */
  .axx-area-card {
    background: linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 22px 28px;
    cursor: pointer;
    text-align: center;
    min-width: 140px;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .axx-area-card:hover {
    transform: translateY(-4px);
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 8px 24px rgba(59,130,246,0.15);
  }

  /* Feature cards */
  .axx-feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px 24px;
    width: 220px;
    text-align: center;
    transition: transform 0.2s, border-color 0.2s;
  }
  .axx-feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(59,130,246,0.3);
  }

  /* Testimonials */
  .axx-testimonial {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px;
    width: 280px;
    transition: border-color 0.2s;
  }
  .axx-testimonial:hover { border-color: rgba(59,130,246,0.3); }

  /* Animations */
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes bounce {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }
`;