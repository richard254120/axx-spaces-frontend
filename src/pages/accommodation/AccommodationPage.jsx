import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  useAccommodationHome,
  DEFAULT_CATEGORIES,
} from "../../features/accommodation";
import SocialMediaLinks from "../../components/SocialMediaLinks";


const categories = DEFAULT_CATEGORIES;

const getCategoryColor = (name) => {
  const colors = {
    "Beach Resorts": "#06b6d4",
    "Safari Camps": "#22c55e",
    "Mountain Lodges": "#8b5cf6",
    "City Hotels": "#f59e0b",
  };
  return colors[name] || "#065f46";
};

const getBadgeColor = (tag) => {
  const colors = {
    "Top Rated": "#22c55e",
    "Luxury": "#8b5cf6",
    "Most Booked": "#f59e0b",
    "Hidden Gem": "#06b6d4",
    "Premium": "#ec4899",
  };
  return colors[tag] || "#065f46";
};

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const { featured: featuredList, stats: heroStats } = useAccommodationHome();

  const handleSelectPackage = (pkg) => {
    navigate("/accommodation/register-property");
  };

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <img src="/tourism.png" alt="Tourism" style={{ width: "40px", height: "40px", marginRight: "10px", verticalAlign: "middle", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,0,0,0.1)" }} />
            <span style={s.logoAccent}>AXX</span>
            <span style={s.logoSub}>SPACE</span>
            <span style={s.logoDivider}>|</span>
            <span style={s.logoLabel}>Accommodation</span>
          </div>
          <div style={s.navLinks} className="nav-links">
            <button style={s.navLink} onClick={() => navigate("/accommodation/listings")}>Explore</button>
            <button style={s.navLink} onClick={() => navigate("/accommodation/listings")}>Pricing</button>
            {user ? (
              <>
                <button style={s.navLink} onClick={() => navigate("/accommodation/dashboard")}>Dashboard</button>
                <div style={s.userChip}> {user.name?.split(" ")[0]}</div>
              </>
            ) : (
              <>
                <button style={s.navLink} onClick={() => navigate("/accommodation/login")}>Sign In</button>
                <button style={s.navBtnPrimary} onClick={() => navigate("/accommodation/register")}>
                  List Your Property
                </button>
              </>
            )}
          </div>
          {/* Mobile menu */}
          <div className="nav-mobile-btns">
            {user ? (
              <button style={s.navBtnPrimary} onClick={() => navigate("/accommodation/dashboard")}>Dashboard</button>
            ) : (
              <button style={s.navBtnPrimary} onClick={() => navigate("/accommodation/register")}>
                List Property
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.heroBadge}> Kenya's Premier Accommodation QuickSales</div>
          <h1 style={s.heroTitle}>
            Discover Kenya's
            <br />
            <span style={s.heroAccent}>Finest Stays</span>
          </h1>
          <p style={s.heroSub}>
            From luxury hotels to cozy guesthouses across all 47 counties — find perfect accommodation for every occasion with verified properties and direct bookings.
          </p>

          {/* Segmented Search Bar */}
          <div style={s.searchContainer}>
            <div style={s.searchSegment}>
              <span style={s.searchSegmentIcon}></span>
              <input
                style={s.searchSegmentInput}
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div style={s.searchSegment}>
              <span style={s.searchSegmentIcon}></span>
              <input
                style={s.searchSegmentInput}
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div style={s.searchSegment}>
              <span style={s.searchSegmentIcon}></span>
              <input
                style={s.searchSegmentInput}
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div style={s.searchSegment}>
              <span style={s.searchSegmentIcon}></span>
              <input
                style={s.searchSegmentInput}
                placeholder="Add guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <button style={s.searchBtn} onClick={() => navigate("/accommodation/listings")}>Search</button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={s.statsBar}>
        <div style={s.statsInner}>
          {[
            { icon: "", val: "200+", label: "Properties Listed" },
            { icon: "", val: "47", label: "Counties Covered" },
            { icon: "", val: "18K+", label: "Monthly Visitors" },
            { icon: "", val: "4.8★", label: "Avg. Rating" },
          ].map((st) => (
            <div key={st.label} style={s.statItem}>
              <span style={s.statIcon}>{st.icon}</span>
              <div>
                <div style={s.statVal}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={s.sectionTitle}>Explore by Category</h2>
            <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "8px", lineHeight: 1.6 }}>Find the perfect accommodation for every occasion</p>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <button key={c.name} style={s.catCard} onClick={() => navigate("/accommodation/listings")} className="cat-card">
                <div style={{ ...s.catImage, background: `linear-gradient(135deg, ${getCategoryColor(c.name)}40, ${getCategoryColor(c.name)}20)` }}>
                  <span style={s.catEmoji}>{c.emoji}</span>
                </div>
                <div style={s.catOverlay}>
                  <div style={s.catName}>{c.name}</div>
                  <div style={s.catCount}>{c.count} properties</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section style={{ ...s.section, background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)", paddingTop: "100px" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <div>
              <h2 style={s.sectionTitle}>Featured Properties</h2>
              <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "8px", lineHeight: 1.6 }}>Curated selection of Kenya's top-rated accommodations</p>
            </div>
            <button style={s.viewAllBtn} onClick={() => navigate("/accommodation/listings")}>View All →</button>
          </div>
          <div className="prop-grid">
            {featuredList.map((p) => (
              <div key={p.id} className="prop-card" style={s.propCard} onClick={() => navigate(`/accommodation/${p.id}`)}>
                <div style={{ ...s.propImg, background: `linear-gradient(135deg, ${p.color}40, ${p.color}20)`, aspectRatio: "4/3" }}>
                  <span style={{ fontSize: "64px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>{p.emoji}</span>
                  {p.tag && <div style={{ ...s.propTag, background: getBadgeColor(p.tag) }}>{p.tag}</div>}
                </div>
                <div style={s.propBody}>
                  <div style={s.propCat}>{p.category}</div>
                  <h3 style={s.propName}>{p.name}</h3>
                  <div style={{ ...s.propLoc, display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: p.color }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{p.location}</span>
                  </div>
                  <div style={s.propFooter}>
                    <div>
                      <span style={{ ...s.propPrice, color: p.color, fontSize: "22px" }}>KSh {p.price.toLocaleString()}</span>
                      <span style={s.propPer}>/night</span>
                    </div>
                    <div style={s.propRating}> <span style={{ color: "#fbbf24", fontSize: "16px" }}>★</span> {p.rating} <span style={{ color: "#9ca3af" }}>({p.reviews})</span></div>
                  </div>
                  <button style={{ ...s.propBtn, background: p.color }} onClick={(e) => { e.stopPropagation(); navigate(`/accommodation/${p.id}`); }}>
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: "48px" }}>How It Works</h2>
          <div className="how-grid">
            {[
              { step: "01", icon: "", title: "Create an Account", desc: "Register as a property owner/manager to get started." },
              { step: "02", icon: "", title: "List Your Property", desc: "Add your property details, amenities, pricing and contact information." },
              { step: "03", icon: "", title: "Get Discovered", desc: "Your property is visible to thousands of guests on AXXSpace." },
              { step: "04", icon: "", title: "Guests Contact Direct", desc: "Interested guests contact you directly via WhatsApp or phone for bookings." },
            ].map((h, idx) => (
              <div key={h.step} className="how-item" style={s.howItem}>
                <div className="how-number" style={s.howNumber}>{h.step}</div>
                {idx < 3 && <div className="how-line" style={s.howLine}></div>}
                <div style={s.howIcon}>{h.icon}</div>
                <h3 style={s.howTitle}>{h.title}</h3>
                <p style={s.howDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...s.section, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", padding: "48px 16px" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>
            Ready to List Your Property?
          </h2>
          <p style={{ fontSize: "14px", color: "#78350f", marginBottom: "24px", lineHeight: 1.7 }}>
            Join 300+ properties already benefiting from AXXSpace's accommodation QuickSales. Start attracting guests today.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={s.ctaBtn} onClick={() => user ? navigate("/accommodation/register-property") : navigate("/accommodation/register")}>
              List Your Property
            </button>
            <button style={s.ctaBtnSecondary} onClick={() => navigate("/accommodation/listings")}>
              Browse Properties
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div>
            <div style={s.logo}>
              <span style={s.logoAccent}>AXX</span>
              <span style={{ color: "white", fontWeight: 800, fontSize: "18px" }}>SPACE</span>
            </div>
            <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "8px", maxWidth: "220px", lineHeight: 1.6 }}>
              Kenya's premier platform for discovering and advertising accommodation properties.
            </p>
            <div style={{ marginTop: "16px" }}>
              <SocialMediaLinks iconSize={20} />
            </div>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Explore</div>
              {["Luxury Hotels", "Budget Stays", "Serviced Apartments", "Guest Houses"].map((l) => (
                <button key={l} style={s.footerLink} onClick={() => navigate("/accommodation/listings")}>{l}</button>
              ))}
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Owners</div>
              {["List Property", "Pricing Plans", "Dashboard", "Support"].map((l) => (
                <button key={l} style={s.footerLink}>{l}</button>
              ))}
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Contact</div>
              <div style={{ ...s.footerLink, cursor: "default" }}> accommodationaxxspace@gmail.com</div>
              <div style={{ ...s.footerLink, cursor: "default" }}> +254 745689773</div>
              <div style={{ ...s.footerLink, cursor: "default" }}> WhatsApp Business</div>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span> 2026 AXXSpace Accommodation. All rights reserved.</span>
          <span>Nairobi, Kenya </span>
        </div>
      </footer>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#ffffff", overflowX: "hidden" },

  // Nav
  nav: { background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1400px", margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  logo: { display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 },
  logoAccent: { fontSize: "16px", fontWeight: 900, color: "#fbbf24", letterSpacing: "-0.5px" },
  logoSub: { fontSize: "16px", fontWeight: 900, color: "#1f2937", letterSpacing: "-0.5px" },
  logoDivider: { color: "#e5e7eb", margin: "0 6px", fontSize: "14px" },
  logoLabel: { fontSize: "11px", fontWeight: 600, color: "#6b7280" },
  navLinks: { display: "flex", alignItems: "center", gap: "2px" },
  navLink: { background: "transparent", border: "none", padding: "6px 10px", fontSize: "12px", fontWeight: 600, color: "#4b5563", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px" },
  navBtnPrimary: { background: "#6366F1", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  userChip: { background: "#f3f4f6", borderRadius: "16px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#1f2937" },

  // Hero
  hero: {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.92) 50%, rgba(236, 72, 153, 0.9) 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "140px 20px 120px",
    minHeight: "650px"
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 40%)",
    backgroundSize: "cover"
  },
  heroContent: { maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-block", background: "rgba(251, 191, 36, 0.25)", border: "1px solid rgba(251, 191, 36, 0.5)", color: "#fbbf24", fontSize: "13px", fontWeight: 700, padding: "10px 24px", borderRadius: "28px", marginBottom: "32px", letterSpacing: "0.05em", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(42px, 6vw, 64px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "28px", letterSpacing: "-1.5px" },
  heroAccent: { color: "#fbbf24" },
  heroSub: { fontSize: "18px", color: "rgba(255,255,255,0.9)", lineHeight: 1.8, marginBottom: "52px", maxWidth: "650px", margin: "0 auto 52px" },

  // Segmented Search
  searchContainer: {
    background: "white",
    borderRadius: "20px",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 30px 100px rgba(0, 0, 0, 0.35)"
  },
  searchSegment: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    borderRadius: "16px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s"
  },
  searchSegmentIcon: { fontSize: "18px", flexShrink: 0, color: "#6b7280" },
  searchSegmentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    fontFamily: "inherit",
    color: "#1f2937",
    background: "transparent",
    fontWeight: 500
  },
  searchBtn: {
    background: "linear-gradient(135deg, #6366F1 0%, #7A69FF 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "18px 36px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "all 0.3s",
    flexShrink: 0
  },

  // Stats Bar
  statsBar: {
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    padding: "40px 20px",
    position: "relative",
    zIndex: 10
  },
  statsInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-around",
    gap: "32px",
    flexWrap: "wrap"
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minWidth: "200px"
  },
  statIcon: {
    fontSize: "36px",
    flexShrink: 0
  },
  statVal: {
    fontSize: "36px",
    fontWeight: 900,
    color: "#6366F1",
    lineHeight: 1.1
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: "4px"
  },

  // Sections
  section: { padding: "100px 20px" },
  sectionInner: { maxWidth: "1400px", margin: "0 auto" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "20px" },
  sectionTitle: { fontSize: "32px", fontWeight: 900, color: "#6366F1", marginBottom: "12px", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: "16px", color: "#6b7280", lineHeight: 1.6 },
  viewAllBtn: { background: "transparent", border: "2px solid #6366F1", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, color: "#6366F1", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.3s" },

  // Categories
  catCard: {
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    aspectRatio: "4/3",
    minHeight: "200px"
  },
  catImage: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.5s"
  },
  catEmoji: { fontSize: "64px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" },
  catOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
    padding: "24px 20px",
    textAlign: "left"
  },
  catName: { fontSize: "18px", fontWeight: 800, color: "white", marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  catCount: { fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 600 },

  // Properties
  propCard: {
    background: "white",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column"
  },
  propImg: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.5s"
  },
  propTag: {
    position: "absolute",
    top: "16px",
    left: "16px",
    color: "white",
    fontSize: "11px",
    fontWeight: 800,
    padding: "6px 14px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },
  propBody: {
    padding: "24px",
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  propCat: {
    fontSize: "12px",
    color: "#6366F1",
    textTransform: "uppercase",
    fontWeight: 800,
    letterSpacing: "0.1em",
    marginBottom: "8px"
  },
  propName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#6366F1",
    margin: "0 0 8px",
    lineHeight: 1.3,
    minHeight: "48px"
  },
  propLoc: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "16px",
    fontWeight: 500
  },
  propFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f3f4f6"
  },
  propPrice: {
    fontSize: "22px",
    fontWeight: 900,
    lineHeight: 1
  },
  propPer: {
    fontSize: "13px",
    color: "#9ca3af",
    fontWeight: 500,
    marginLeft: "4px"
  },
  propRating: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1f2937"
  },
  propBtn: {
    width: "100%",
    border: "none",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s",
    marginTop: "auto"
  },

  // How it works
  howItem: {
    position: "relative",
    textAlign: "center",
    flex: 1,
    padding: "0 16px"
  },
  howNumber: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 8px 24px rgba(251, 191, 36, 0.3)"
  },
  howLine: {
    position: "absolute",
    top: "28px",
    left: "calc(50% + 28px)",
    right: "calc(-50% + 28px)",
    height: "2px",
    background: "linear-gradient(90deg, #fbbf24 0%, #e5e7eb 100%)",
    zIndex: 0
  },
  howIcon: { fontSize: "40px", marginBottom: "16px", display: "block" },
  howTitle: { fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" },
  howDesc: { fontSize: "14px", color: "#6b7280", lineHeight: 1.7 },

  // CTA
  ctaBtn: { background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" },
  ctaBtnSecondary: { background: "rgba(255,255,255,0.3)", color: "#1f2937", border: "2px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" },

  // Footer
  footer: { background: "#0f172a", padding: "48px 20px 24px" },
  footerInner: { maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "48px", flexWrap: "wrap", marginBottom: "32px" },
  footerLinks: { display: "flex", gap: "48px", flexWrap: "wrap", flex: 1 },
  footerCol: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" },
  footerColTitle: { fontSize: "11px", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" },
  footerLink: { background: "transparent", border: "none", color: "#6b7280", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: 0 },
  footerBottom: { maxWidth: "1400px", margin: "0 auto", borderTop: "1px solid #1f2937", paddingTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#4b5563", flexWrap: "wrap", gap: "8px" },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal: { background: "white", borderRadius: "20px", padding: "28px 24px", maxWidth: "480px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" },
  modalClose: { position: "absolute", top: "16px", right: "16px", background: "#f3f4f6", border: "none", borderRadius: "50%", width: "30px", height: "30px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" },
  modalLogo: { textAlign: "center", marginBottom: "20px" },
  authTabs: { display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", marginBottom: "20px" },
  authTab: { flex: 1, background: "transparent", border: "none", borderRadius: "8px", padding: "9px", fontSize: "13px", fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },
  authTabActive: { background: "white", color: "#1f2937", fontWeight: 800, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  authSub: { fontSize: "13px", color: "#6b7280", marginBottom: "20px", textAlign: "center" },
  authBtn: { width: "100%", background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginTop: "4px" },
  authSwitch: { fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "14px" },

  // Form fields (modal)
  field: { marginBottom: "14px" },
  label: { display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", fontFamily: "inherit", color: "#1f2937", outline: "none" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; }
  input:focus, select:focus { border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1); }

  .nav-links { display: flex; }
  .nav-mobile-btns { display: none; }

  .cat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 0;
  }
  .cat-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 48px rgba(99, 102, 241, 0.2); }
  .cat-card:hover .catImage { transform: scale(1.1); }

  .prop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 28px;
  }
  .prop-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(99, 102, 241, 0.15); border-color: "#6366F1"; }
  .prop-card:hover .propImg { transform: scale(1.05); }

  .pkg-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
    align-items: start;
  }
  .pkg-grid-modal {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .pkg-card { transition: transform 0.3s, box-shadow 0.3s; }
  .pkg-card:hover { transform: translateY(-4px); }
  .pkg-card.pkg-popular:hover { transform: translateY(-4px) scale(1.05); }

  .how-grid {
    display: flex;
    align-items: flex-start;
    gap: 0;
    position: relative;
  }

  @media (max-width: 1024px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 900px) {
    .how-grid { flex-direction: column; }
    .how-item { padding: "0 0 40px 0"; }
    .how-line { display: none; }
    .nav-links { display: none; }
    .nav-mobile-btns { display: flex; }
    .searchContainer { flex-direction: column; }
    .searchSegment { width: 100%; }
  }

  @media (max-width: 600px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
    .prop-grid { grid-template-columns: 1fr; }
    .nav-links { display: none !important; }
    .nav-mobile-btns { display: flex !important; }
    .statsInner { flex-direction: column; align-items: center; gap: "32px"; }
    .statItem { minWidth: auto; }
    .section { padding: "80px 20px"; }
  }

  @media (max-width: 480px) {
    .cat-grid { grid-template-columns: 1fr; }
    .logoAccent { font-size: 14px !important; }
    .logoSub { font-size: 14px !important; }
    .logoDivider { font-size: 12px !important; margin: 0 4px; }
    .logoLabel { font-size: 10px !important; }
    .nav-mobile-btns button { font-size: 10px !important; padding: 6px 10px !important; }
    .searchBtn { width: 100%; }
  }
`;