import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { tourismLogin } from "../../api/tourism";
import {
  useTourismHome,
  ADVERTISING_PACKAGES,
  DEFAULT_CATEGORIES,
  setTourismSession,
  getDisplayName,
  isTourismLoggedIn,
  getTourismUser,
} from "../../features/tourism";
import SocialMediaLinks from "../../components/SocialMediaLinks";

const packages = ADVERTISING_PACKAGES.map((p) => ({
  ...p,
  features: p.desc.split(",").map((x) => x.trim()),
}));

const categories = DEFAULT_CATEGORIES;

export default function TourismPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | "packages"
  const [authTab, setAuthTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "", businessName: "" });
  const [loggedIn, setLoggedIn] = useState(isTourismLoggedIn());
  const [userName, setUserName] = useState(getDisplayName(getTourismUser()));
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [search, setSearch] = useState("");
  const { featured: featuredList, stats: heroStats } = useTourismHome();

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await tourismLogin(loginForm.email, loginForm.password);
      const user = res.user || { name: res.name, email: loginForm.email };
      setTourismSession(res.token, user);
      authLogin(res.token, res.user);
      setLoggedIn(true);
      setUserName(getDisplayName(user));
      setAuthModal(null);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = () => {
    if (regForm.name && regForm.email && regForm.phone && regForm.password) {
      setLoggedIn(true);
      setUserName(regForm.name.split(" ")[0]);
      setAuthModal("packages");
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
    setAuthModal(null);
    navigate("/tourism/register-property");
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
            <span style={s.logoLabel}>Tourism</span>
          </div>
          <div style={s.navLinks} className="nav-links">
            <button style={s.navLink} onClick={() => navigate("/tourism/listings")}>Explore</button>
            <button style={s.navLink} onClick={() => setAuthModal("packages")}>Pricing</button>
            {loggedIn ? (
              <>
                <button style={s.navLink} onClick={() => navigate("/tourism/dashboard")}>Dashboard</button>
                <div style={s.userChip}>👤 {userName}</div>
              </>
            ) : (
              <>
                <button style={s.navLink} onClick={() => { setAuthModal("auth"); setAuthTab("login"); }}>Sign In</button>
                <button style={s.navBtnPrimary} onClick={() => { setAuthModal("auth"); setAuthTab("register"); }}>
                  List Your Property
                </button>
              </>
            )}
          </div>
          {/* Mobile menu */}
          <div className="nav-mobile-btns">
            {loggedIn ? (
              <button style={s.navBtnPrimary} onClick={() => navigate("/tourism/dashboard")}>Dashboard</button>
            ) : (
              <button style={s.navBtnPrimary} onClick={() => { setAuthModal("auth"); setAuthTab("register"); }}>
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
          <div style={s.heroBadge}>🇰🇪 Kenya's Premier Tourism QuickSAles</div>
          <h1 style={s.heroTitle}>
            Discover Kenya's
            <br />
            <span style={s.heroAccent}>Finest Getaways</span>
          </h1>
          <p style={s.heroSub}>
            From Diani's pristine beaches to Masai Mara's wildlife safaris — explore Kenya's most breathtaking destinations with verified properties and direct bookings.
          </p>
          <div style={s.searchBox}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search resorts, safaris, lodges, hotels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate("/tourism/listings")}
            />
            <button style={s.searchBtn} onClick={() => navigate("/tourism/listings")}>Search</button>
          </div>
          <div style={s.heroStats}>
            {heroStats.map((st) => (
              <div key={st.label} style={s.heroStat}>
                <div style={s.heroStatVal}>{st.val}</div>
                <div style={s.heroStatLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={s.sectionTitle}>Explore by Category</h2>
            <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "8px" }}>Find the perfect accommodation for your Kenyan adventure</p>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <button key={c.name} style={s.catCard} onClick={() => navigate("/tourism/listings")} className="cat-card">
                <span style={s.catEmoji}>{c.emoji}</span>
                <div style={s.catName}>{c.name}</div>
                <div style={s.catCount}>{c.count} properties</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section style={{ ...s.section, background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <div>
              <h2 style={s.sectionTitle}>Featured Properties</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Curated selection of Kenya's top-rated accommodations</p>
            </div>
            <button style={s.viewAllBtn} onClick={() => navigate("/tourism/listings")}>View All →</button>
          </div>
          <div className="prop-grid">
            {featuredList.map((p) => (
              <div key={p.id} className="prop-card" style={s.propCard} onClick={() => navigate(`/tourism/${p.id}`)}>
                <div style={{ ...s.propImg, background: `linear-gradient(135deg, ${p.color}30, ${p.color}10)`, border: `1px solid ${p.color}25` }}>
                  <span style={{ fontSize: "52px" }}>{p.emoji}</span>
                  {p.tag && <div style={{ ...s.propTag, background: p.color }}>{p.tag}</div>}
                </div>
                <div style={s.propBody}>
                  <div style={s.propCat}>{p.category}</div>
                  <h3 style={s.propName}>{p.name}</h3>
                  <div style={s.propLoc}>📍 {p.location}</div>
                  <p style={s.propDesc}>{p.shortDesc}</p>
                  <div style={s.propFooter}>
                    <div>
                      <span style={{ ...s.propPrice, color: p.color }}>KSh {p.price.toLocaleString()}</span>
                      <span style={s.propPer}>/night</span>
                    </div>
                    <div style={s.propRating}>⭐ {p.rating} <span style={{ color: "#9ca3af" }}>({p.reviews})</span></div>
                  </div>
                  <button style={{ ...s.propBtn, background: p.color }} onClick={(e) => { e.stopPropagation(); navigate(`/tourism/${p.id}`); }}>
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES / ADVERTISE ── */}
      <section style={{ ...s.section, background: "#1f2937" }} id="packages">
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ ...s.sectionTitle, color: "white" }}>Advertise on AXXSpace</h2>
            <p style={{ color: "#9ca3af", fontSize: "15px", marginTop: "8px" }}>
              List your property and reach 18,000+ monthly visitors looking for Kenya's best tourism experiences.
            </p>
          </div>
          <div className="pkg-grid">
            {packages.map((pkg) => (
              <div key={pkg.name} style={{ ...s.pkgCard, ...(pkg.popular ? s.pkgPopular : {}) }} className="pkg-card">
                {pkg.popular && <div style={s.pkgBadge}>⭐ Most Popular</div>}
                <div style={{ ...s.pkgName, color: pkg.color }}>{pkg.name}</div>
                <div style={s.pkgDuration}>{pkg.duration}</div>
                <div style={s.pkgPrice}>
                  <span style={s.pkgPriceVal}>KSh {pkg.price.toLocaleString()}</span>
                </div>
                <div style={s.pkgFeatures}>
                  {pkg.features.map((f) => (
                    <div key={f} style={s.pkgFeature}>
                      <span style={{ color: pkg.color, fontWeight: 700, marginRight: "8px" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  style={{ ...s.pkgBtn, background: pkg.popular ? "#fbbf24" : "transparent", color: pkg.popular ? "#1f2937" : "white", border: pkg.popular ? "none" : "1px solid #374151" }}
                  onClick={() => loggedIn ? navigate("/tourism/register-property") : (setAuthModal("auth"), setAuthTab("register"))}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "12px", marginTop: "24px" }}>
            All plans include a free 7-day trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: "32px" }}>How It Works</h2>
          <div className="how-grid">
            {[
              { step: "01", icon: "📝", title: "Create an Account", desc: "Register as a property owner/manager and choose your advertising package." },
              { step: "02", icon: "🏨", title: "List Your Property", desc: "Add your property details, amenities, pricing and your existing booking site link." },
              { step: "03", icon: "🌍", title: "Get Discovered", desc: "Your property is advertised to thousands of travelers on AXXSpace." },
              { step: "04", icon: "🔗", title: "Guests Book Direct", desc: "Interested guests click your booking link and are redirected to your own site." },
            ].map((h) => (
              <div key={h.step} style={s.howCard}>
                <div style={s.howStep}>{h.step}</div>
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
            Join 200+ properties already benefiting from AXXSpace's tourism QuickSAles. Start attracting guests today.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={s.ctaBtn} onClick={() => loggedIn ? navigate("/tourism/register-property") : (setAuthModal("auth"), setAuthTab("register"))}>
              🚀 List Your Property
            </button>
            <button style={s.ctaBtnSecondary} onClick={() => navigate("/tourism/listings")}>
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
              Kenya's premier platform for discovering and advertising tourism properties.
            </p>
            <div style={{ marginTop: "16px" }}>
              <SocialMediaLinks iconSize={20} />
            </div>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Explore</div>
              {["Beach Resorts", "Safari Camps", "Mountain Lodges", "City Hotels"].map((l) => (
                <button key={l} style={s.footerLink} onClick={() => navigate("/tourism/listings")}>{l}</button>
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
              <div style={{ ...s.footerLink, cursor: "default" }}>📧 tourismaxxspace@gmail.com</div>
              <div style={{ ...s.footerLink, cursor: "default" }}>📞 +254 745689773</div>
              <div style={{ ...s.footerLink, cursor: "default" }}>💬 WhatsApp Business</div>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span>© 2026 AXXSpace Tourism. All rights reserved.</span>
          <span>Nairobi, Kenya 🇰🇪</span>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {authModal === "auth" && (
        <div style={s.modalOverlay} onClick={() => setAuthModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setAuthModal(null)}>✕</button>
            <div style={s.modalLogo}>
              <span style={s.logoAccent}>AXX</span><span style={{ fontWeight: 800, fontSize: "18px", color: "#1f2937" }}>SPACE</span>
            </div>
            <div style={s.authTabs}>
              <button style={{ ...s.authTab, ...(authTab === "login" ? s.authTabActive : {}) }} onClick={() => setAuthTab("login")}>Sign In</button>
              <button style={{ ...s.authTab, ...(authTab === "register" ? s.authTabActive : {}) }} onClick={() => setAuthTab("register")}>Create Account</button>
            </div>

            {authTab === "login" ? (
              <div>
                <p style={s.authSub}>Welcome back to AXXSpace Tourism</p>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <input style={s.input} type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>
                {authError && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "10px" }}>{authError}</p>}
                <button style={s.authBtn} onClick={handleLogin} disabled={authLoading}>
                  {authLoading ? "Signing in…" : "Sign In →"}
                </button>
                <p style={s.authSwitch}>No account? <span style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("register")}>Register free</span></p>
              </div>
            ) : (
              <div>
                <p style={s.authSub}>Join Kenya's #1 tourism QuickSAles</p>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} placeholder="Your full name" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Business / Property Name</label>
                  <input style={s.input} placeholder="e.g. Sunrise Beach Hotel" value={regForm.businessName} onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={s.field}>
                    <label style={s.label}>Email</label>
                    <input style={s.input} type="email" placeholder="you@example.com" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Phone / WhatsApp</label>
                    <input style={s.input} placeholder="+254 7XX XXX XXX" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <input style={s.input} type="password" placeholder="Create a password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                </div>
                <button style={s.authBtn} onClick={handleRegister}>Create Account & Choose Plan →</button>
                <p style={s.authSwitch}>Already have an account? <span style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("login")}>Sign in</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PACKAGES MODAL (post-register) ── */}
      {authModal === "packages" && (
        <div style={s.modalOverlay} onClick={() => setAuthModal(null)}>
          <div style={{ ...s.modal, maxWidth: "780px", padding: "28px 24px" }} onClick={(e) => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setAuthModal(null)}>✕</button>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "6px" }}>
              🎉 Account Created! Choose Your Plan
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
              Select an advertising package to start listing your property on AXXSpace.
            </p>
            <div className="pkg-grid-modal">
              {packages.map((pkg) => (
                <div key={pkg.name} style={{ ...s.pkgCard, background: "#f9fafb", border: `2px solid ${selectedPkg?.name === pkg.name ? pkg.color : "#e5e7eb"}` }}>
                  {pkg.popular && <div style={{ ...s.pkgBadge, background: "#fbbf24", color: "#1f2937" }}>⭐ Most Popular</div>}
                  <div style={{ ...s.pkgName, color: pkg.color }}>{pkg.name}</div>
                  <div style={s.pkgDuration}>{pkg.duration}</div>
                  <div style={{ ...s.pkgPriceVal, fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>
                    KSh {pkg.price.toLocaleString()}
                  </div>
                  {pkg.features.slice(0, 3).map((f) => (
                    <div key={f} style={{ ...s.pkgFeature, color: "#4b5563" }}>
                      <span style={{ color: pkg.color, fontWeight: 700, marginRight: "6px" }}>✓</span>{f}
                    </div>
                  ))}
                  <button
                    style={{ ...s.pkgBtn, marginTop: "14px", background: pkg.color, color: "white", border: "none" }}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Select {pkg.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#ffffff", overflowX: "hidden" },

  // Nav
  nav: { background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1400px", margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" },
  logo: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  logoAccent: { fontSize: "20px", fontWeight: 900, color: "#fbbf24", letterSpacing: "-0.5px" },
  logoSub: { fontSize: "20px", fontWeight: 900, color: "#1f2937", letterSpacing: "-0.5px" },
  logoDivider: { color: "#e5e7eb", margin: "0 8px", fontSize: "18px" },
  logoLabel: { fontSize: "13px", fontWeight: 600, color: "#6b7280" },
  navLinks: { display: "flex", alignItems: "center", gap: "4px" },
  navLink: { background: "transparent", border: "none", padding: "8px 14px", fontSize: "14px", fontWeight: 600, color: "#4b5563", cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" },
  navBtnPrimary: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  userChip: { background: "#f3f4f6", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: 700, color: "#1f2937" },

  // Hero
  hero: { background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)", position: "relative", overflow: "hidden", padding: "100px 20px 80px" },
  heroOverlay: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 40%)" },
  heroContent: { maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-block", background: "rgba(251, 191, 36, 0.2)", border: "1px solid rgba(251, 191, 36, 0.4)", color: "#fbbf24", fontSize: "12px", fontWeight: 700, padding: "8px 20px", borderRadius: "24px", marginBottom: "24px", letterSpacing: "0.05em" },
  heroTitle: { fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-1.5px" },
  heroAccent: { color: "#fbbf24" },
  heroSub: { fontSize: "17px", color: "#d1fae5", lineHeight: 1.8, marginBottom: "36px", maxWidth: "600px", margin: "0 auto 36px" },
  searchBox: { background: "white", borderRadius: "16px", padding: "8px 8px 8px 20px", display: "flex", alignItems: "center", gap: "12px", maxWidth: "650px", margin: "0 auto 40px", boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)" },
  searchIcon: { fontSize: "20px", flexShrink: 0 },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: "16px", fontFamily: "inherit", color: "#1f2937", background: "transparent" },
  searchBtn: { background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "white", border: "none", borderRadius: "12px", padding: "14px 28px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.3s" },
  heroStats: { display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap", marginTop: "8px" },
  heroStat: { textAlign: "center", minWidth: "100px" },
  heroStatVal: { fontSize: "28px", fontWeight: 900, color: "#fbbf24", lineHeight: 1.2 },
  heroStatLabel: { fontSize: "12px", color: "#d1fae5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" },

  // Sections
  section: { padding: "80px 20px" },
  sectionInner: { maxWidth: "1400px", margin: "0 auto" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" },
  sectionTitle: { fontSize: "28px", fontWeight: 900, color: "#065f46", marginBottom: "8px", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: "14px", color: "#6b7280" },
  viewAllBtn: { background: "transparent", border: "2px solid #059669", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 700, color: "#059669", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.3s" },

  // Categories
  catCard: { background: "white", border: "2px solid #e5e7eb", borderRadius: "16px", padding: "24px 20px", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
  catEmoji: { fontSize: "40px", display: "block", marginBottom: "12px" },
  catName: { fontSize: "15px", fontWeight: 800, color: "#065f46", marginBottom: "6px" },
  catCount: { fontSize: "12px", color: "#6b7280", fontWeight: 600 },

  // Properties
  propCard: { background: "white", borderRadius: "18px", border: "2px solid #e5e7eb", overflow: "hidden", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)" },
  propImg: { height: "180px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  propTag: { position: "absolute", top: "12px", left: "12px", color: "white", fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" },
  propBody: { padding: "20px" },
  propCat: { fontSize: "11px", color: "#059669", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "6px" },
  propName: { fontSize: "17px", fontWeight: 800, color: "#065f46", margin: "0 0 6px", lineHeight: 1.3 },
  propLoc: { fontSize: "13px", color: "#6b7280", marginBottom: "10px", fontWeight: 500 },
  propDesc: { fontSize: "13px", color: "#4b5563", lineHeight: 1.7, marginBottom: "16px" },
  propFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" },
  propPrice: { fontSize: "19px", fontWeight: 900 },
  propPer: { fontSize: "12px", color: "#9ca3af", fontWeight: 500 },
  propRating: { fontSize: "13px", color: "#fbbf24", fontWeight: 800 },
  propBtn: { width: "100%", border: "none", color: "white", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" },

  // Packages
  pkgCard: { background: "#111827", border: "1px solid #374151", borderRadius: "16px", padding: "24px 20px", position: "relative" },
  pkgPopular: { border: "2px solid #fbbf24" },
  pkgBadge: { position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#fbbf24", color: "#1f2937", fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap" },
  pkgName: { fontSize: "18px", fontWeight: 800, marginBottom: "4px" },
  pkgDuration: { fontSize: "12px", color: "#6b7280", marginBottom: "16px" },
  pkgPrice: { marginBottom: "20px" },
  pkgPriceVal: { fontSize: "24px", fontWeight: 900, color: "white" },
  pkgFeatures: { marginBottom: "20px" },
  pkgFeature: { fontSize: "13px", color: "#d1d5db", padding: "5px 0", borderBottom: "1px solid #1f2937" },
  pkgBtn: { width: "100%", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },

  // How it works
  howCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px 20px", textAlign: "center" },
  howStep: { fontSize: "11px", fontWeight: 800, color: "#fbbf24", letterSpacing: "0.1em", marginBottom: "12px" },
  howIcon: { fontSize: "32px", marginBottom: "12px", display: "block" },
  howTitle: { fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" },
  howDesc: { fontSize: "13px", color: "#6b7280", lineHeight: 1.65 },

  // CTA
  ctaBtn: { background: "#1f2937", color: "white", border: "none", borderRadius: "10px", padding: "14px 28px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  ctaBtnSecondary: { background: "rgba(255,255,255,0.3)", color: "#1f2937", border: "2px solid rgba(0,0,0,0.1)", borderRadius: "10px", padding: "14px 28px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },

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
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 0;
  }
  .cat-card:hover { border-color: #059669; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(6, 95, 70, 0.15); }

  .prop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  .prop-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(6, 95, 70, 0.12); border-color: #059669; }

  .pkg-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 900px;
    margin: 0 auto;
  }
  .pkg-grid-modal {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .pkg-card { transition: transform 0.2s; }
  .pkg-card:hover { transform: translateY(-3px); }

  .how-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .pkg-grid { grid-template-columns: 1fr; max-width: 400px; }
    .pkg-grid-modal { grid-template-columns: 1fr; }
    .how-grid { grid-template-columns: repeat(2, 1fr); }
    .nav-links { display: none; }
    .nav-mobile-btns { display: flex; }
  }
  @media (max-width: 600px) {
    .how-grid { grid-template-columns: 1fr; }
    .cat-grid { grid-template-columns: repeat(4, 1fr); }
    .prop-grid { grid-template-columns: 1fr; }
  }
`;