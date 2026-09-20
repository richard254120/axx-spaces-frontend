import { useContext, useState, useEffect, useRef } from "react";
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

const DESTINATIONS = ["Nairobi", "Mombasa", "Diani Beach", "Maasai Mara", "Naivasha", "Nakuru", "Nanyuki", "Lamu", "Malindi", "Kisumu", "Watamu", "Amboseli"];

// ── ANIMATION: counts a stat up once it scrolls into view ──
function CountUp({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const m = String(value).match(/^([\d.]+)(.*)$/);
    if (!m) return;
    const end = parseFloat(m[1]), dec = (m[1].split(".")[1] || "").length, suffix = m[2];
    const el = ref.current;
    el.textContent = (0).toFixed(dec) + suffix;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const { featured: featuredList, stats: heroStats } = useAccommodationHome();
  const [heroVisible, setHeroVisible] = useState(true);

  // ── ANIMATION: reveal elements as they scroll into view ──
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [featuredList]);

  // ── AUTO-SCROLL: scroll to featured properties after 3 seconds ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroVisible(false);
      const featuredSection = document.getElementById('featured-section');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // ── FEATURES: scroll progress, nav shadow, back-to-top, saved properties ──
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favs, setFavs] = useState([]);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 500);
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  const handleSelectPackage = (pkg) => {
    navigate("/accommodation/register-property");
  };

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div className="scroll-progress" style={{ width: progress + "%" }} />

      {/* ── NAV ── */}
      <nav style={s.nav} className={scrolled ? "nav scrolled" : "nav"}>
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
      {heroVisible && (
        <section style={s.hero}>
          <div style={s.heroOverlay} />
          <div className="blob b1" /><div className="blob b2" />
          <div style={s.heroContent}>
            <div style={s.heroBadge} className="hero-in i1"> Kenya's Premier Accommodation QuickSales</div>
            <h1 style={s.heroTitle} className="hero-in i2">
              Discover Kenya's
              <br />
              <span style={s.heroAccent} className="hero-accent">Finest Stays</span>
            </h1>
            <p style={s.heroSub} className="hero-in i3">
              From luxury hotels to cozy guesthouses across all 47 counties — find perfect accommodation for every occasion with verified properties and direct bookings.
            </p>

            {/* Segmented Search Bar */}
            <div style={s.searchContainer} className="search-container hero-in i4">
              <div style={s.searchSegment} className="search-seg">
                <span style={s.searchSegmentIcon}></span>
                <input
                  style={s.searchSegmentInput}
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div style={s.searchSegment} className="search-seg">
                <span style={s.searchSegmentIcon}></span>
                <input
                  style={s.searchSegmentInput}
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div style={s.searchSegment} className="search-seg">
                <span style={s.searchSegmentIcon}></span>
                <input
                  style={s.searchSegmentInput}
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div style={s.searchSegment} className="search-seg">
                <span style={s.searchSegmentIcon}></span>
                <input
                  style={s.searchSegmentInput}
                  placeholder="Add guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>
              <button style={s.searchBtn} className="search-btn" onClick={() => navigate("/accommodation/listings")}>Search</button>
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <section style={s.statsBar}>
        <div style={s.statsInner}>
          {[
            { icon: "", val: "200+", label: "Properties Listed" },
            { icon: "", val: "47", label: "Counties Covered" },
            { icon: "", val: "18K+", label: "Monthly Visitors" },
            { icon: "", val: "4.8★", label: "Avg. Rating" },
          ].map((st) => (
            <div key={st.label} style={s.statItem} className="reveal">
              <span style={s.statIcon}>{st.icon}</span>
              <div>
                <div style={s.statVal}><CountUp value={st.val} /></div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS MARQUEE ── */}
      <section className="marquee" aria-label="Popular destinations">
        <div className="marquee-track">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <button key={d + i} className="dest-pill" onClick={() => navigate("/accommodation/listings")}>{d}</button>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section id="featured-section" style={{ ...s.section, background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)", paddingTop: "100px" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead} className="reveal">
            <div>
              <h2 style={s.sectionTitle}>Featured Properties</h2>
              <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "8px", lineHeight: 1.6 }}>Curated selection of Kenya's top-rated accommodations</p>
            </div>
            <button style={s.viewAllBtn} onClick={() => navigate("/accommodation/listings")}>View All →</button>
          </div>
          <div className="prop-grid">
            {featuredList.map((p) => (
              <div key={p._id || p.id} className="prop-card reveal" style={s.propCard} onClick={() => navigate(`/accommodation/${p._id || p.id}`)}>
                <div className="prop-img" style={{ ...s.propImg, aspectRatio: "4/3", position: "relative", overflow: "hidden" }}>
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0].imageUrl}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${p.color || "#065f46"}40, ${p.color || "#065f46"}20)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "64px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>{p.emoji || "🏨"}</span>
                    </div>
                  )}
                  {p.tag && <div style={{ ...s.propTag, background: getBadgeColor(p.tag) }}>{p.tag}</div>}
                  <button className={"fav-btn" + (favs.includes(p._id || p.id) ? " on" : "")} aria-label="Save property" aria-pressed={favs.includes(p._id || p.id)} onClick={(e) => toggleFav(e, p._id || p.id)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  </button>
                </div>
                <div style={s.propBody}>
                  <div style={s.propCat}>{p.type || p.category || "Accommodation"}</div>
                  <h3 style={s.propName}>{p.name}</h3>
                  <div style={{ ...s.propLoc, display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: p.color || "#065f46" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{typeof p.location === 'object' ? p.address : p.location || p.address || "Kenya"}</span>
                  </div>
                  <div style={s.propFooter}>
                    <div>
                      <span style={{ ...s.propPrice, color: p.color || "#065f46", fontSize: "22px" }}>KSh {(p.basePrice || p.price || 0).toLocaleString()}</span>
                      <span style={s.propPer}>/night</span>
                    </div>
                    <div style={s.propRating}> <span style={{ color: "#fbbf24", fontSize: "16px" }}>★</span> {p.rating || "4.5"} <span style={{ color: "#9ca3af" }}>({p.reviews || "0"})</span></div>
                  </div>
                  <button style={{ ...s.propBtn, background: p.color || "#065f46" }} onClick={(e) => { e.stopPropagation(); navigate(`/accommodation/${p._id || p.id}`); }}>
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
              <div key={h.step} className="how-item reveal" style={s.howItem}>
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

      {/* ── WHY CHOOSE US ── */}
      <section style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: "48px" }} className="reveal">Why Choose AXXSpace</h2>
          <div className="why-grid">
            {[
              { icon: "✅", title: "Verified Properties", desc: "Every listing is reviewed by our team before it goes live." },
              { icon: "💬", title: "Direct Contact", desc: "Reach owners on WhatsApp or phone. No middlemen." },
              { icon: "🗺️", title: "All 47 Counties", desc: "From Mombasa beaches to Mara safari camps and city hotels." },
              { icon: "⚡", title: "Quick Listing", desc: "Owners add a property in minutes and get discovered fast." },
            ].map((w) => (
              <div key={w.title} className="why-card reveal">
                <div className="why-icon">{w.icon}</div>
                <h3 style={s.howTitle}>{w.title}</h3>
                <p style={s.howDesc}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (sample text: replace with real reviews) ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: "48px" }} className="reveal">What People Say</h2>
          <div className="testi-grid">
            {[
              { name: "Wanjiru M.", role: "Guest, Nairobi", text: "Found a clean apartment in Diani and booked straight with the owner on WhatsApp. Easy." },
              { name: "Brian O.", role: "Property owner, Nakuru", text: "I listed my guest house on Monday and had my first enquiry by Wednesday." },
              { name: "Amina H.", role: "Guest, Mombasa", text: "The photos matched the place exactly. No surprises when we arrived." },
            ].map((t) => (
              <figure key={t.name} className="testi-card reveal">
                <div className="testi-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote>{t.text}</blockquote>
                <figcaption><b>{t.name}</b><span>{t.role}</span></figcaption>
              </figure>
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

      {/* ── FLOATING ACTIONS ── */}
      <a className="wa-float" href="https://wa.me/254745689773" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
      </a>
      <button className={"to-top" + (showTop ? " show" : "")} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
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

  /* ── ANIMATIONS ── */
  .blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .45; pointer-events: none; }
  .blob.b1 { width: 380px; height: 380px; background: #fbbf24; top: -120px; right: -80px; animation: drift 12s ease-in-out infinite alternate; }
  .blob.b2 { width: 320px; height: 320px; background: #06b6d4; bottom: -120px; left: -80px; animation: drift 10s ease-in-out infinite alternate-reverse; }
  @keyframes drift { to { transform: translate(40px, 30px) scale(1.15); } }

  .hero-in { animation: heroUp .8s cubic-bezier(.2,.8,.2,1) backwards; }
  .hero-in.i1 { animation-delay: .1s; } .hero-in.i2 { animation-delay: .25s; }
  .hero-in.i3 { animation-delay: .4s; } .hero-in.i4 { animation-delay: .55s; }
  @keyframes heroUp { from { opacity: 0; transform: translateY(28px); } }

  .hero-accent {
    background: linear-gradient(90deg, #fbbf24, #fff3c4, #fbbf24); background-size: 200% 100%;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent !important;
    animation: shine 4s linear infinite;
  }
  @keyframes shine { to { background-position: -200% 0; } }

  .reveal { opacity: 0; }
  .reveal.in { opacity: 1; animation: revealUp .7s cubic-bezier(.2,.8,.2,1) backwards; }
  @keyframes revealUp { from { opacity: 0; transform: translateY(36px); } }
  .prop-grid .reveal:nth-child(3n+2), .how-grid .reveal:nth-child(2) { animation-delay: .12s; }
  .prop-grid .reveal:nth-child(3n), .how-grid .reveal:nth-child(3) { animation-delay: .24s; }
  .how-grid .reveal:nth-child(4) { animation-delay: .36s; }

  .prop-img img { transition: transform .7s cubic-bezier(.2,.8,.2,1); }
  .prop-card:hover .prop-img img { transform: scale(1.08); }

  .how-item.in .how-number { animation: popIn .6s .2s cubic-bezier(.34,1.56,.64,1) backwards; }
  .how-line { transform-origin: left; }
  .how-item.in .how-line { animation: draw .8s .4s ease-out backwards; }
  @keyframes popIn { from { transform: scale(0); } }
  @keyframes draw { from { transform: scaleX(0); } }

  .search-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(99,102,241,.45); }
  .search-btn:active { transform: scale(.97); }

  /* Mobile fix: search stacks on phones (inline styles need !important) */
  @media (max-width: 900px) {
    .search-container { flex-direction: column !important; border-radius: 20px !important; }
    .search-container > div { width: 100%; }
    .search-btn { width: 100%; }
  }

  /* ── NEW FEATURES ── */
  .scroll-progress { position: fixed; top: 0; left: 0; height: 3px; z-index: 300; background: linear-gradient(90deg, #6366F1, #ec4899, #fbbf24); transition: width .1s linear; }
  .nav { transition: box-shadow .3s, background .3s; }
  .nav.scrolled { box-shadow: 0 8px 30px rgba(15,23,42,.12); background: rgba(255,255,255,.88) !important; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  .search-seg:focus-within { border-color: #6366F1 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

  .marquee { overflow: hidden; background: #0f172a; padding: 16px 0; }
  .marquee-track { display: flex; width: max-content; animation: marquee 45s linear infinite; }
  .marquee:hover .marquee-track { animation-play-state: paused; }
  .dest-pill { margin-right: 12px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #e5e7eb; border-radius: 999px; padding: 9px 20px; font: 600 14px 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; transition: background .2s, color .2s, transform .2s; }
  .dest-pill::before { content: "📍 "; }
  .dest-pill:hover { background: #fbbf24; color: #1f2937; transform: translateY(-2px); }
  @keyframes marquee { to { transform: translateX(-50%); } }

  .cat-grid .reveal:nth-child(4n+2) { animation-delay: .1s; }
  .cat-grid .reveal:nth-child(4n+3) { animation-delay: .2s; }
  .cat-grid .reveal:nth-child(4n) { animation-delay: .3s; }

  .fav-btn { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer; display: grid; place-items: center; background: rgba(255,255,255,.92); color: #1f2937; box-shadow: 0 4px 12px rgba(0,0,0,.18); transition: transform .2s; z-index: 2; }
  .fav-btn:hover { transform: scale(1.1); }
  .fav-btn.on { color: #e0355e; animation: heartPop .45s; }
  .fav-btn.on svg { fill: currentColor; }
  @keyframes heartPop { 40% { transform: scale(1.4); } }

  .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .why-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px 24px; text-align: center; transition: transform .3s, box-shadow .3s; }
  .why-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(99,102,241,.15); }
  .why-icon { width: 64px; height: 64px; margin: 0 auto 18px; border-radius: 18px; display: grid; place-items: center; font-size: 30px; background: linear-gradient(135deg, #eef2ff, #fdf2f8); }
  .why-card:hover .why-icon { animation: wiggle .6s; }
  @keyframes wiggle { 25% { transform: rotate(-8deg) scale(1.1); } 75% { transform: rotate(8deg) scale(1.1); } }
  .why-grid .reveal:nth-child(4n+2) { animation-delay: .1s; }
  .why-grid .reveal:nth-child(4n+3) { animation-delay: .2s; }
  .why-grid .reveal:nth-child(4n) { animation-delay: .3s; }

  .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .testi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 14px; }
  .testi-stars { color: #fbbf24; font-size: 18px; letter-spacing: 2px; }
  .testi-card blockquote { font-size: 15px; line-height: 1.7; color: #374151; flex: 1; }
  .testi-card figcaption { display: flex; flex-direction: column; font-size: 13px; color: #6b7280; }
  .testi-card figcaption b { color: #1f2937; font-size: 14px; }
  .testi-grid .reveal:nth-child(3n+2) { animation-delay: .12s; }
  .testi-grid .reveal:nth-child(3n) { animation-delay: .24s; }

  .wa-float { position: fixed; right: 18px; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 58px; height: 58px; border-radius: 50%; background: #25D366; color: #fff; display: grid; place-items: center; box-shadow: 0 10px 28px rgba(37,211,102,.5); z-index: 150; animation: waPulse 2.4s infinite; }
  @keyframes waPulse { 0% { box-shadow: 0 0 0 0 rgba(37,211,102,.55); } 70% { box-shadow: 0 0 0 18px rgba(37,211,102,0); } 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); } }
  .to-top { position: fixed; right: 26px; bottom: calc(88px + env(safe-area-inset-bottom, 0px)); width: 42px; height: 42px; border-radius: 50%; border: none; background: #6366F1; color: #fff; font-size: 20px; font-weight: 800; cursor: pointer; z-index: 150; opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity .3s, transform .3s; box-shadow: 0 8px 20px rgba(99,102,241,.4); }
  .to-top.show { opacity: 1; transform: none; pointer-events: auto; }

  @media (max-width: 900px) {
    .why-grid { grid-template-columns: repeat(2, 1fr); }
    .testi-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .why-grid { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;