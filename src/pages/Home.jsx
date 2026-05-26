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
  const [animatedStats, setAnimatedStats] = useState({ listings: 0, counties: 0, tenants: 0 });
  const [activeCategoryTab, setActiveCategoryTab] = useState("rentals");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

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
    "👋 Welcome to Axxspace!",
    "🏠 Rentals Across All 47 Counties",
    "🚛 Trusted Moving Services",
    "🛍️ Building Materials & Merchants",
    "🏨 Hotels & Tourism Experiences",
    "✅ Verified Listings — Zero Hidden Fees",
    "💬 Connect Directly via WhatsApp",
    "🗺 GPS Maps for Every Listing",
    "🔒 Safe, Secure & 100% Transparent",
    "🎉 One Platform. Everything You Need.",
  ];

  // Platform categories
  const platformCategories = [
    {
      id: "rentals",
      icon: "🏢",
      title: "Rentals",
      tagline: "Find your next home",
      description: "Browse verified rental properties across all 47 counties. Bedsitters, apartments, maisonettes & more — no agents, no hidden fees.",
      features: ["Verified landlords", "All property types", "GPS-mapped locations", "Direct WhatsApp contact"],
      cta: "Browse Rentals",
      route: "/listings",
      color: "#E31B1B",
      bg: "linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)",
      accent: "#C01010",
    },
    {
      id: "movers",
      icon: "🚛",
      title: "Movers",
      tagline: "Stress-free moving",
      description: "Connect with trusted, vetted moving companies across Kenya. Get quotes, compare rates, and book your move with confidence.",
      features: ["Vetted moving crews", "Transparent pricing", "Local & long-distance", "Real-time tracking"],
      cta: "Find Movers",
      route: "/movers",
      color: "#0B2140",
      bg: "linear-gradient(135deg, #f0f4ff 0%, #dce8ff 100%)",
      accent: "#1a3a52",
    },
    {
      id: "merchants",
      icon: "🛍️",
      title: "Merchants",
      tagline: "Building materials & supplies",
      description: "Source quality construction materials, hardware, and home supplies from verified merchants. Compare prices and order directly.",
      features: ["Verified suppliers", "Hardware & materials", "Wholesale pricing", "Delivery available"],
      cta: "Shop Materials",
      route: "/materials",
      color: "#d97706",
      bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      accent: "#b45309",
    },
    {
      id: "tourism",
      icon: "🏨",
      title: "Tourism",
      tagline: "Discover Kenya's best",
      description: "Explore hotels, lodges, resorts, and unique experiences across Kenya's 47 counties. From Nairobi to the coast and beyond.",
      features: ["Hotels & lodges", "Safari packages", "Weekend getaways", "Direct bookings"],
      cta: "Explore Tourism",
      route: "/tourism",
      color: "#059669",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      accent: "#047857",
    },
  ];

  // Stats per category
  const categoryStats = {
    rentals:   [{ val: "280+", label: "Active Listings" }, { val: "47", label: "Counties" }, { val: "500+", label: "Happy Tenants" }],
    movers:    [{ val: "60+", label: "Moving Companies" }, { val: "47", label: "Counties Covered" }, { val: "1,200+", label: "Moves Completed" }],
    merchants: [{ val: "150+", label: "Verified Merchants" }, { val: "5,000+", label: "Products Listed" }, { val: "30+", label: "Counties" }],
    tourism:   [{ val: "200+", label: "Hotels & Lodges" }, { val: "47", label: "Counties" }, { val: "3,000+", label: "Happy Guests" }],
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setFetchError(false);
        const res = await API.get("/payment/featured", { timeout: 15000 });
        const data = res?.data;
        if (Array.isArray(data)) setFeaturedProperties(data);
        else if (data && Array.isArray(data.properties)) setFeaturedProperties(data.properties);
        else setFeaturedProperties([]);
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("/reviews", { timeout: 15000 });
        const data = res?.data;
        if (Array.isArray(data)) setReviews(data.slice(0, 4));
        else setReviews([]);
      } catch (err) {
        console.error("Failed to load reviews:", err?.message || err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const targetStats = { listings: 280, counties: 47, tenants: 500 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        listings: Math.floor(targetStats.listings * easeOut),
        counties: Math.floor(targetStats.counties * easeOut),
        tenants: Math.floor(targetStats.tenants * easeOut),
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);
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

  const activeCategory = platformCategories.find(c => c.id === activeCategoryTab);

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

      {/* ── HERO WITH BACKGROUND VIDEO ── */}
      <section style={styles.hero}>
        <video autoPlay muted loop playsInline style={styles.bgVideo} className="hero-video">
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div style={styles.videoOverlay}></div>

        <div style={styles.heroContent}>
          <div style={styles.trustBadge}>
            <span style={styles.trustDot}></span>
            Kenya's #1 Property & Services Platform
          </div>

          <h1 style={styles.heroTitle}>
            Everything You Need<br />
            <span style={styles.heroTitleAccent}>Under One Roof</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Rentals · Movers · Merchants · Tourism — verified across all 47 counties
          </p>

          {/* ── CATEGORY QUICK LINKS ── */}
          <div style={styles.heroCategories}>
            {platformCategories.map((cat) => (
              <button
                key={cat.id}
                style={{
                  ...styles.heroCategoryBtn,
                  background: activeCategoryTab === cat.id
                    ? "white"
                    : "rgba(255,255,255,0.15)",
                  color: activeCategoryTab === cat.id ? "#0B2140" : "white",
                  border: activeCategoryTab === cat.id
                    ? "2px solid white"
                    : "2px solid rgba(255,255,255,0.3)",
                  fontWeight: activeCategoryTab === cat.id ? 800 : 600,
                }}
                onClick={() => setActiveCategoryTab(cat.id)}
              >
                <span style={{ fontSize: "18px" }}>{cat.icon}</span>
                {cat.title}
              </button>
            ))}
          </div>

          {/* ── SEARCH PANEL (Rentals only) or Quick CTA ── */}
          {activeCategoryTab === "rentals" ? (
            <>
              <p style={styles.searchPropertyLabel}>Search Rental Properties</p>
              <div style={styles.hamburgerWrapper} onClick={() => setMenuOpen(!menuOpen)}>
                <button
                  type="button"
                  style={styles.hamburgerBtn}
                  aria-label="Open property search"
                  className="hamburger-btn"
                >
                  <span style={{ ...styles.hamburgerLine, transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }}></span>
                  <span style={{ ...styles.hamburgerLine, opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "none" }}></span>
                  <span style={{ ...styles.hamburgerLine, transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }}></span>
                </button>
                <span style={styles.hamburgerLabel}>Search Properties</span>
              </div>
              {menuOpen && (
                <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} style={styles.searchDropdown} className="hamburger-menu">
                  <select style={styles.searchInput} value={searchForm.county} onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}>
                    <option value="">📍 Select County</option>
                    {counties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select style={styles.searchInput} value={searchForm.type} onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}>
                    <option value="">🏗 Property Type</option>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="submit" style={styles.searchBtn}>🔍 Search Now</button>
                </form>
              )}
            </>
          ) : (
            <div style={styles.categoryHeroCta}>
              <p style={styles.categoryHeroDesc}>{activeCategory?.description}</p>
              <button
                style={styles.categoryHeroBtn}
                onClick={() => navigate(activeCategory?.route)}
              >
                {activeCategory?.cta} →
              </button>
            </div>
          )}

          <div style={styles.heroStats}>
            {categoryStats[activeCategoryTab].map((s) => (
              <div key={s.label} style={styles.heroStat}>
                <span style={styles.heroStatVal}>{s.val}</span>
                <span style={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM CATEGORIES SHOWCASE ── */}
      <section style={styles.categoriesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything on One Platform</h2>
          <p style={styles.sectionSubtitle}>From finding a home to settling in — Axxspace has you covered</p>
        </div>
        <div style={styles.categoriesGrid}>
          {platformCategories.map((cat) => (
            <div
              key={cat.id}
              style={{ ...styles.categoryCard, background: cat.bg, borderTop: `4px solid ${cat.color}` }}
              className="category-card"
              onClick={() => navigate(cat.route)}
            >
              <div style={{ ...styles.categoryCardIcon, background: cat.color }}>{cat.icon}</div>
              <h3 style={{ ...styles.categoryCardTitle, color: cat.color }}>{cat.title}</h3>
              <p style={styles.categoryCardTagline}>{cat.tagline}</p>
              <p style={styles.categoryCardDesc}>{cat.description}</p>
              <ul style={styles.categoryFeatureList}>
                {cat.features.map((f) => (
                  <li key={f} style={{ ...styles.categoryFeatureItem, color: cat.accent }}>
                    <span style={{ color: cat.color, fontWeight: 800 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button style={{ ...styles.categoryCardBtn, background: cat.color }} onClick={(e) => { e.stopPropagation(); navigate(cat.route); }}>
                {cat.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>
          <p style={styles.sectionSubtitle}>Verified & boosted properties — handpicked for maximum trust</p>
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
            <button onClick={() => window.location.reload()} style={styles.boostBtn}>🔄 Retry</button>
          </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div style={styles.marqueeCardsWrapper}>
              <div className="cards-marquee-track">
                {[...featuredProperties, ...featuredProperties].map((property, idx) => (
                  <div key={`${property._id}-${idx}`} style={styles.featuredCard} className="featured-card">
                    <div style={styles.featuredImageWrapper}>
                      <img src={property.images?.[0] || ""} alt={property.title || "Property"} style={styles.featuredImage} onError={(e) => { e.target.style.display = "none"; }} />
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
                      <button onClick={() => navigate(`/listings?highlight=${property._id}`)} style={styles.viewBtn} className="view-btn">
                        View Property →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button onClick={() => navigate("/listings")} style={styles.viewAllBtn}>View All Listings →</button>
            </div>
          </>
        ) : (
          <div style={styles.noFeatured}>
            <div style={styles.noFeaturedIcon}>🏡</div>
            <p style={styles.noFeaturedText}>No featured listings yet</p>
            <p style={styles.noFeaturedSub}>Boost your property to appear here and reach thousands of tenants!</p>
            <button onClick={handleListProperty} style={styles.boostBtn}>🚀 Boost Your Property</button>
          </div>
        )}
      </section>

      {/* ── SERVICE SPOTLIGHT STRIPS ── */}
      <section style={styles.spotlightSection}>
        {/* Movers strip */}
        <div style={styles.spotlightStrip} className="spotlight-strip">
          <div style={styles.spotlightText}>
            <span style={styles.spotlightBadge}>🚛 Movers</span>
            <h3 style={styles.spotlightTitle}>Planning a Move?</h3>
            <p style={styles.spotlightDesc}>Connect with 60+ vetted moving companies across Kenya. Get instant quotes, compare prices, and book your move today — local or long-distance.</p>
            <div style={styles.spotlightFeatures}>
              {["Insured cargo", "Trained crews", "Transparent quotes", "Available 24/7"].map(f => (
                <span key={f} style={styles.spotlightFeature}>✓ {f}</span>
              ))}
            </div>
            <button style={{ ...styles.spotlightBtn, background: "#0B2140" }} onClick={() => navigate("/movers")}>Find a Mover →</button>
          </div>
          <div style={styles.spotlightVisual}>
            <div style={{ ...styles.spotlightEmoji, background: "linear-gradient(135deg, #dce8ff, #b8d0f8)" }}>🚛</div>
            <div style={styles.spotlightStatGrid}>
              {[["60+", "Moving Companies"], ["47", "Counties"], ["1,200+", "Moves Done"]].map(([v, l]) => (
                <div key={l} style={styles.spotlightStat}>
                  <span style={{ ...styles.spotlightStatVal, color: "#0B2140" }}>{v}</span>
                  <span style={styles.spotlightStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Merchants strip */}
        <div style={{ ...styles.spotlightStrip, flexDirection: "row-reverse", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }} className="spotlight-strip">
          <div style={styles.spotlightText}>
            <span style={{ ...styles.spotlightBadge, background: "#fef3c7", color: "#b45309" }}>🛍️ Merchants</span>
            <h3 style={styles.spotlightTitle}>Building or Renovating?</h3>
            <p style={styles.spotlightDesc}>Source construction materials, hardware, paint, tiles, roofing, and more from 150+ verified Kenyan merchants at competitive wholesale prices.</p>
            <div style={styles.spotlightFeatures}>
              {["Hardware & tools", "Roofing & tiles", "Paint & finishes", "Plumbing & electrical"].map(f => (
                <span key={f} style={{ ...styles.spotlightFeature, color: "#b45309" }}>✓ {f}</span>
              ))}
            </div>
            <button style={{ ...styles.spotlightBtn, background: "#d97706" }} onClick={() => navigate("/materials")}>Shop Materials →</button>
          </div>
          <div style={styles.spotlightVisual}>
            <div style={{ ...styles.spotlightEmoji, background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>🛍️</div>
            <div style={styles.spotlightStatGrid}>
              {[["150+", "Merchants"], ["5,000+", "Products"], ["30+", "Counties"]].map(([v, l]) => (
                <div key={l} style={styles.spotlightStat}>
                  <span style={{ ...styles.spotlightStatVal, color: "#d97706" }}>{v}</span>
                  <span style={styles.spotlightStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tourism strip */}
        <div style={{ ...styles.spotlightStrip, background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }} className="spotlight-strip">
          <div style={styles.spotlightText}>
            <span style={{ ...styles.spotlightBadge, background: "#dcfce7", color: "#047857" }}>🏨 Tourism</span>
            <h3 style={styles.spotlightTitle}>Explore Kenya Like Never Before</h3>
            <p style={styles.spotlightDesc}>Discover hotels, beach resorts, safari lodges, and unique experiences across Kenya's 47 counties. Book directly — no commission fees.</p>
            <div style={styles.spotlightFeatures}>
              {["Hotels & resorts", "Safari packages", "Beach getaways", "City escapes"].map(f => (
                <span key={f} style={{ ...styles.spotlightFeature, color: "#047857" }}>✓ {f}</span>
              ))}
            </div>
            <button style={{ ...styles.spotlightBtn, background: "#059669" }} onClick={() => navigate("/tourism")}>Explore Tourism →</button>
          </div>
          <div style={styles.spotlightVisual}>
            <div style={{ ...styles.spotlightEmoji, background: "linear-gradient(135deg, #dcfce7, #a7f3d0)" }}>🏨</div>
            <div style={styles.spotlightStatGrid}>
              {[["200+", "Hotels & Lodges"], ["47", "Counties"], ["3,000+", "Guests"]].map(([v, l]) => (
                <div key={l} style={styles.spotlightStat}>
                  <span style={{ ...styles.spotlightStatVal, color: "#059669" }}>{v}</span>
                  <span style={styles.spotlightStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>One platform. Four services. Endless possibilities.</p>
        </div>
        <div style={styles.stepsGrid}>
          {[
            { step: "01", icon: "🔍", title: "Search & Discover", text: "Browse verified listings across Rentals, Movers, Merchants, and Tourism — all in one place." },
            { step: "02", icon: "💬", title: "Connect Directly", text: "Chat with landlords, movers, merchants, or hotels via WhatsApp or call — no middlemen." },
            { step: "03", icon: "✅", title: "Book & Confirm", text: "Schedule viewings, get quotes, place orders, or book stays — with full transparency." },
            { step: "04", icon: "🏠", title: "Move In & Thrive", text: "Find your home, move your stuff, furnish it, and explore Kenya — all through Axxspace." },
          ].map((s, idx) => (
            <div key={s.step} style={styles.stepCard} className="step-card">
              <div style={styles.stepNumber}>{s.step}</div>
              <div style={styles.stepIcon}>{s.icon}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepText}>{s.text}</p>
              {idx < 3 && <div style={styles.stepConnector}></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={styles.testimonialsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "white" }}>What Our Users Say</h2>
          <p style={{ ...styles.sectionSubtitle, color: "rgba(255,255,255,0.7)" }}>Real stories from happy customers across all our services</p>
        </div>
        <div style={styles.testimonialsGrid}>
          {loadingReviews ? (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px" }}>
              <div className="spinner"></div>
              <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "16px" }}>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} style={styles.testimonialCard} className="testimonial-card">
                <div style={styles.testimonialTop}>
                  <div style={styles.testimonialAvatar}>{review.userName?.charAt(0).toUpperCase() || "U"}</div>
                  <div style={{ ...styles.testimonialServiceTag, background: review.category === "property" ? "#E31B1B" : review.category === "mover" ? "#0B2140" : review.category === "merchant" ? "#d97706" : review.category === "tourism" ? "#059669" : "#6b7280" }}>
                    {review.category === "general" ? "General" : review.category.charAt(0).toUpperCase() + review.category.slice(1)}
                  </div>
                </div>
                <div style={styles.testimonialRating}>{"⭐".repeat(review.rating)}</div>
                <h3 style={styles.testimonialTitle}>{review.title}</h3>
                <p style={styles.testimonialText}>"{review.comment}"</p>
                <div style={styles.testimonialAuthor}>
                  <strong style={styles.testimonialName}>{review.userName}</strong>
                  <span style={styles.testimonialRole}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            [
              { name: "Sarah Wanjiku", role: "Tenant · Nairobi", rating: 5, text: "Found my dream apartment in 2 days! The WhatsApp feature made connecting with the landlord so easy. No agents, no hidden fees.", avatar: "", tag: "Rentals" },
              { name: "David Mwangi", role: "Customer · Mombasa", rating: 5, text: "Booked movers through Axxspace for my relocation to Nairobi. Professional team, transparent pricing, everything arrived safely.", avatar: "", tag: "Movers" },
              { name: "Grace Omondi", role: "Developer · Kisumu", rating: 5, text: "The merchant listings saved me thousands on my construction project. Found roofing materials at 20% below market prices.", avatar: "", tag: "Merchants" },
              { name: "James Kariuki", role: "Tourist · Nairobi", rating: 5, text: "Planned a full safari weekend through Axxspace Tourism. Best lodge, easy booking, and zero commission. Absolutely loved it!", avatar: "", tag: "Tourism" },
            ].map((t) => (
              <div key={t.name} style={styles.testimonialCard} className="testimonial-card">
                <div style={styles.testimonialTop}>
                  <div style={styles.testimonialAvatar}>{t.avatar}</div>
                  <div style={{ ...styles.testimonialServiceTag, background: t.tag === "Rentals" ? "#E31B1B" : t.tag === "Movers" ? "#0B2140" : t.tag === "Merchants" ? "#d97706" : "#059669" }}>{t.tag}</div>
                </div>
                <div style={styles.testimonialRating}>{"⭐".repeat(t.rating)}</div>
                <p style={styles.testimonialText}>"{t.text}"</p>
                <div style={styles.testimonialAuthor}>
                  <strong style={styles.testimonialName}>{t.name}</strong>
                  <span style={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button onClick={() => navigate("/leave-review")} style={styles.leaveReviewBtn}>
            ✍️ Leave a Review
          </button>
        </div>
      </section>

      {/* ── WHY AXXSPACE ── */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#0B2140" }}>Why Axxspace?</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#6b7280" }}>Built for Kenyans, by Kenyans — serving every need</p>
        </div>
        <div style={styles.featureGrid}>
          {[
            { icon: "✓", title: "Verified Listings", text: "Every listing across all categories is manually reviewed before going live", color: "#E31B1B" },
            { icon: "💬", title: "Direct WhatsApp", text: "Skip the middleman. Chat directly with landlords, movers, merchants, or hotels", color: "#E31B1B" },
            { icon: "🌍", title: "All 47 Counties", text: "The only platform serving every corner of Kenya across all services", color: "#0B2140" },
            { icon: "📱", title: "Mobile Optimized", text: "Fully responsive — find homes, book services, shop materials on any device", color: "#0B2140" },
            { icon: "🗺", title: "GPS Maps", text: "Interactive maps with exact coordinates for every listing and service", color: "#E31B1B" },
            { icon: "💰", title: "Zero Hidden Fees", text: "What you see is what you pay. Transparent pricing across all categories", color: "#059669" },
            { icon: "🔒", title: "Safe & Secure", text: "Industry-standard encryption protects all your personal data and transactions", color: "#d97706" },
            { icon: "⚡", title: "One Platform", text: "Rent, move, build, and explore — everything you need without switching apps", color: "#0B2140" },
          ].map((f) => (
            <div key={f.title} style={{ ...styles.featureCard, borderTop: `4px solid ${f.color}` }} className="feature-card">
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
          <h2 style={styles.ctaTitle}>Start Your Journey Today</h2>
          <p style={styles.ctaText}>
            Join thousands of Kenyans who find homes, move smarter, build better, and explore more — all through Axxspace.
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>🏢 Browse Rentals</button>
            <button style={{ ...styles.ctaBtnPrimary, background: "linear-gradient(135deg, #0B2140, #1a3a52)" }} onClick={() => navigate("/movers")}>🚛 Find Movers</button>
            <button style={{ ...styles.ctaBtnPrimary, background: "linear-gradient(135deg, #d97706, #b45309)" }} onClick={() => navigate("/materials")}>🛍️ Shop Materials</button>
            <button style={{ ...styles.ctaBtnPrimary, background: "linear-gradient(135deg, #059669, #047857)" }} onClick={() => navigate("/tourism")}>🏨 Explore Tourism</button>
          </div>
          <div style={styles.ctaDivider}></div>
          <button
            style={{
              ...styles.ctaBtnSecondary,
              background: token ? "#E31B1B" : "white",
              color: token ? "white" : "#0B2140",
              border: token ? "none" : "2px solid #0B2140",
            }}
            onClick={handleListProperty}
          >
            {token ? "📝 List Your Property / Service" : "🔐 Login to List Your Business"}
          </button>
          {!token && <p style={styles.loginHint}>💡 Free to join — no credit card required</p>}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <strong style={{ color: "#E31B1B", fontSize: "18px" }}>Axxspace</strong>
            <p style={styles.footerTagline}>Kenya's most trusted property & services platform</p>
          </div>
          <div style={styles.footerColumns}>
            <div style={styles.footerCol}>
              <p style={styles.footerColTitle}>Services</p>
              {[["🏢 Rentals", "/listings"], ["🚛 Movers", "/movers"], ["🛍️ Merchants", "/materials"], ["🏨 Tourism", "/tourism"]].map(([l, r]) => (
                <span key={l} style={styles.footerLink} onClick={() => navigate(r)}>{l}</span>
              ))}
            </div>
            <div style={styles.footerCol}>
              <p style={styles.footerColTitle}>Company</p>
              {["About Us", "How It Works", "Contact Us", "Advertise"].map((l) => (
                <span key={l} style={styles.footerLink}>{l}</span>
              ))}
            </div>
            <div style={styles.footerCol}>
              <p style={styles.footerColTitle}>Legal</p>
              {["Terms of Service", "Privacy Policy", "FAQ", "Safety Tips"].map((l) => (
                <span key={l} style={styles.footerLink}>{l}</span>
              ))}
            </div>
          </div>
          <p style={styles.footerCopy}>© 2026 Axxspace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════ STYLES ═══════════════════════ */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#FFFFFF", color: "#0B2140", minHeight: "100vh" },

  marqueeWrapper: { overflow: "hidden", background: "linear-gradient(90deg, #E31B1B 0%, #D91414 50%, #E31B1B 100%)", padding: "9px 0", borderBottom: "2px solid #C01010" },
  marqueePill: { display: "inline-flex", alignItems: "center", gap: "10px", background: "white", borderRadius: "20px", padding: "4px 16px", margin: "0 8px", fontSize: "13px", fontWeight: 600, color: "#0B2140", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(227, 27, 27, 0.15)" },
  marqueeSep: { color: "#C01010", fontWeight: 700, fontSize: "16px", marginLeft: "8px" },

  hero: { position: "relative", padding: "80px 16px 60px", textAlign: "center", borderBottom: "3px solid #E31B1B", width: "100%", boxSizing: "border-box", overflow: "hidden", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" },
  bgVideo: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", zIndex: 0, display: "block", pointerEvents: "none", background: "#0B2140" },
  videoOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, rgba(11, 33, 64, 0.75) 0%, rgba(11, 33, 64, 0.65) 50%, rgba(11, 33, 64, 0.80) 100%)", zIndex: 1 },
  heroContent: { maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 2 },

  trustBadge: { display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.95)", color: "#0B2140", padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, marginBottom: "18px", border: "1px solid rgba(227, 27, 27, 0.3)", boxShadow: "0 4px 16px rgba(227, 27, 27, 0.2)" },
  trustDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#E31B1B", display: "inline-block", animation: "pulse 1.8s infinite" },

  heroTitle: { fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 800, color: "white", margin: "0 0 6px", letterSpacing: "-1px", lineHeight: 1.15, textShadow: "0 2px 16px rgba(11, 33, 64, 0.8)" },
  heroTitleAccent: { color: "#fbbf24" },
  heroSubtitle: { fontSize: "15px", color: "#f3f4f6", margin: "0 auto 24px", maxWidth: "520px", lineHeight: 1.6, textShadow: "0 1px 8px rgba(11, 33, 64, 0.6)" },

  heroCategories: { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "24px" },
  heroCategoryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "50px", fontSize: "14px", cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)" },

  searchPropertyLabel: { fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px", textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)" },
  hamburgerWrapper: { display: "inline-flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "50px", padding: "8px 20px 8px 8px", margin: "0 auto 16px", cursor: "pointer", backdropFilter: "blur(8px)" },
  hamburgerLabel: { color: "white", fontWeight: 700, fontSize: "15px", letterSpacing: "0.02em", textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)" },
  hamburgerBtn: { background: "#0B2140", border: "none", borderRadius: "50%", width: "42px", height: "42px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", flexShrink: 0, transition: "background 0.2s", padding: 0 },
  hamburgerLine: { display: "block", width: "20px", height: "2.5px", background: "#E31B1B", borderRadius: "2px", transition: "transform 0.25s ease, opacity 0.2s ease" },
  searchDropdown: { background: "rgba(255,255,255,0.98)", borderRadius: "16px", padding: "16px", boxShadow: "0 12px 40px rgba(227, 27, 27, 0.25)", maxWidth: "400px", width: "100%", margin: "0 auto 20px", display: "flex", flexDirection: "column", gap: "10px", boxSizing: "border-box", backdropFilter: "blur(8px)", border: "1px solid rgba(227, 27, 27, 0.1)" },
  searchInput: { padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", background: "#f9fafb", color: "#0B2140", transition: "all 0.2s", width: "100%", boxSizing: "border-box" },
  searchBtn: { padding: "13px 22px", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(227, 27, 27, 0.35)", width: "100%" },

  categoryHeroCta: { maxWidth: "480px", margin: "0 auto 20px", textAlign: "center" },
  categoryHeroDesc: { color: "rgba(255,255,255,0.9)", fontSize: "15px", lineHeight: 1.6, marginBottom: "16px", textShadow: "0 1px 6px rgba(11,33,64,0.5)" },
  categoryHeroBtn: { padding: "13px 32px", background: "white", color: "#0B2140", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" },

  heroStats: { display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginTop: "4px" },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
  heroStatVal: { fontSize: "20px", fontWeight: 800, color: "white", textShadow: "0 2px 10px rgba(11, 33, 64, 0.6)" },
  heroStatLabel: { fontSize: "11px", color: "rgba(255, 255, 255, 0.95)", fontWeight: 500, textShadow: "0 1px 4px rgba(11, 33, 64, 0.5)" },

  /* Categories showcase */
  categoriesSection: { padding: "80px 20px", background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)" },
  sectionHeader: { textAlign: "center", marginBottom: "44px", padding: "0 20px" },
  sectionTitle: { fontSize: "30px", fontWeight: 800, color: "#E31B1B", margin: "0 0 10px" },
  sectionSubtitle: { color: "#6b7280", fontSize: "16px", margin: 0 },
  categoriesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", maxWidth: "1200px", margin: "0 auto" },
  categoryCard: { padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer", transition: "all 0.25s", position: "relative" },
  categoryCardIcon: { width: "52px", height: "52px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "16px" },
  categoryCardTitle: { fontSize: "22px", fontWeight: 800, margin: "0 0 4px" },
  categoryCardTagline: { fontSize: "13px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" },
  categoryCardDesc: { fontSize: "14px", color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px" },
  categoryFeatureList: { listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "6px" },
  categoryFeatureItem: { fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" },
  categoryCardBtn: { width: "100%", padding: "12px", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },

  /* Featured */
  featuredSection: { padding: "60px 0", background: "white", overflow: "hidden" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "40px 0" },
  loadingText: { color: "#6b7280", fontSize: "15px" },
  marqueeCardsWrapper: { overflow: "hidden", width: "100%" },
  featuredCard: { background: "white", borderRadius: "14px", overflow: "hidden", border: "1px solid #e5e7eb", transition: "transform 0.25s, box-shadow 0.25s", minWidth: "280px", maxWidth: "280px", flexShrink: 0, margin: "0 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  featuredImageWrapper: { position: "relative" },
  featuredImage: { width: "100%", height: "180px", objectFit: "cover", display: "block" },
  boostedBadge: { position: "absolute", top: "12px", left: "12px", background: "#E31B1B", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  featuredType: { position: "absolute", top: "12px", right: "12px", background: "rgba(11, 33, 64, 0.85)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 },
  featuredInfo: { padding: "16px 18px 20px" },
  featuredTitle: { fontSize: "15px", fontWeight: 700, margin: "0 0 6px", color: "#0B2140" },
  featuredLocation: { color: "#6b7280", margin: "0 0 8px", fontSize: "12px" },
  featuredMeta: { display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" },
  metaTag: { background: "rgba(227, 27, 27, 0.1)", color: "#E31B1B", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500 },
  featuredPrice: { color: "#E31B1B", fontSize: "17px", fontWeight: 800, margin: "8px 0 0" },
  perMonth: { fontSize: "12px", color: "#C01010", fontWeight: 400 },
  viewBtn: { marginTop: "14px", width: "100%", padding: "11px", background: "linear-gradient(135deg, #0B2140 0%, #152B4A 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", transition: "background 0.2s" },
  viewAllBtn: { padding: "13px 36px", background: "transparent", color: "#E31B1B", border: "2px solid #E31B1B", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  noFeatured: { textAlign: "center", padding: "40px 20px" },
  noFeaturedIcon: { fontSize: "52px", marginBottom: "12px" },
  noFeaturedText: { color: "#0B2140", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" },
  noFeaturedSub: { color: "#6b7280", fontSize: "14px", margin: "0 0 20px" },
  boostBtn: { padding: "12px 28px", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "15px", cursor: "pointer" },

  /* Spotlight strips */
  spotlightSection: { background: "#f8f9fa" },
  spotlightStrip: { display: "flex", alignItems: "center", gap: "48px", padding: "64px 40px", maxWidth: "1200px", margin: "0 auto", background: "linear-gradient(135deg, #f0f4ff 0%, #dce8ff 100%)" },
  spotlightText: { flex: 1, minWidth: 0 },
  spotlightBadge: { display: "inline-block", background: "#dce8ff", color: "#0B2140", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" },
  spotlightTitle: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#0B2140", margin: "0 0 12px", lineHeight: 1.2 },
  spotlightDesc: { fontSize: "15px", color: "#4b5563", lineHeight: 1.7, margin: "0 0 18px" },
  spotlightFeatures: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" },
  spotlightFeature: { fontSize: "13px", fontWeight: 600, color: "#1a3a52" },
  spotlightBtn: { display: "inline-block", padding: "13px 28px", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" },
  spotlightVisual: { display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", flexShrink: 0 },
  spotlightEmoji: { width: "120px", height: "120px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "60px" },
  spotlightStatGrid: { display: "flex", gap: "20px" },
  spotlightStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
  spotlightStatVal: { fontSize: "20px", fontWeight: 800 },
  spotlightStatLabel: { fontSize: "11px", color: "#6b7280", fontWeight: 500, textAlign: "center" },

  /* How it works */
  howItWorksSection: { padding: "80px 20px", background: "white", maxWidth: "1200px", margin: "0 auto" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px", marginTop: "40px", position: "relative" },
  stepCard: { position: "relative", padding: "32px 24px", background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", textAlign: "center", transition: "all 0.3s" },
  stepNumber: { position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, boxShadow: "0 4px 12px rgba(227, 27, 27, 0.3)" },
  stepIcon: { fontSize: "48px", marginBottom: "16px" },
  stepTitle: { fontSize: "17px", fontWeight: 700, color: "#0B2140", margin: "0 0 12px" },
  stepText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },
  stepConnector: { position: "absolute", top: "50%", right: "-20px", width: "40px", height: "2px", background: "#E31B1B", opacity: 0.3 },

  /* Testimonials */
  testimonialsSection: { padding: "80px 20px", background: "#0B2140", color: "white" },
  testimonialsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginTop: "40px", maxWidth: "1200px", margin: "40px auto 0" },
  testimonialCard: { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "24px", transition: "all 0.3s" },
  testimonialTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  testimonialAvatar: { fontSize: "40px" },
  testimonialServiceTag: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "white" },
  testimonialRating: { fontSize: "14px", marginBottom: "10px" },
  testimonialTitle: { fontSize: "15px", fontWeight: 700, color: "white", margin: "0 0 8px" },
  testimonialText: { fontSize: "14px", lineHeight: 1.7, color: "rgba(255, 255, 255, 0.85)", margin: "0 0 14px", fontStyle: "italic" },
  testimonialAuthor: { display: "flex", flexDirection: "column", gap: "2px" },
  testimonialName: { fontSize: "14px", color: "#fbbf24" },
  testimonialRole: { fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" },
  leaveReviewBtn: { padding: "14px 32px", background: "white", color: "#0B2140", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" },

  /* Features */
  featuresSection: { padding: "72px 20px", background: "#FFFFFF", maxWidth: "1200px", margin: "0 auto" },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginTop: "8px" },
  featureCard: { padding: "26px", background: "#F8F9FA", borderRadius: "12px", textAlign: "center", border: "1px solid #e5e7eb", transition: "all 0.22s" },
  featureIcon: { fontSize: "34px", marginBottom: "14px" },
  featureTitle: { fontSize: "16px", fontWeight: 700, color: "#0B2140", margin: "0 0 10px" },
  featureText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* CTA */
  cta: { background: "linear-gradient(135deg, #0B2140 0%, #1a3a52 100%)", padding: "76px 20px", textAlign: "center", borderTop: "3px solid #E31B1B" },
  ctaInner: { maxWidth: "760px", margin: "0 auto" },
  ctaTitle: { fontSize: "34px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "16px", color: "rgba(255,255,255,0.85)", margin: "0 0 32px", lineHeight: 1.6 },
  ctaButtons: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" },
  ctaBtnPrimary: { padding: "13px 22px", background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" },
  ctaDivider: { height: "1px", background: "rgba(255,255,255,0.15)", margin: "24px auto", maxWidth: "400px" },
  ctaBtnSecondary: { padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  loginHint: { fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "14px", fontStyle: "italic" },

  /* Footer */
  footer: { background: "#060f1e", color: "#cbd5e1", padding: "48px 20px 24px" },
  footerInner: { maxWidth: "960px", margin: "0 auto" },
  footerBrand: { textAlign: "center", marginBottom: "32px" },
  footerTagline: { fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" },
  footerColumns: { display: "flex", justifyContent: "center", gap: "60px", flexWrap: "wrap", marginBottom: "32px" },
  footerCol: { display: "flex", flexDirection: "column", gap: "8px" },
  footerColTitle: { fontSize: "12px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" },
  footerLink: { fontSize: "13px", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" },
  footerCopy: { fontSize: "12px", color: "#475569", textAlign: "center", margin: 0 },
};

/* ════════ INJECTED CSS ════════ */
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
    animation: marquee 36s linear infinite;
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

  .hamburger-menu { animation: slideDown 0.2s ease; }

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

  .category-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.10);
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(227, 27, 27, 0.08);
    background: white;
  }

  .step-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(227, 27, 27, 0.15);
    border-color: #E31B1B;
  }

  .testimonial-card:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .spotlight-strip:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.06); }

  @media (max-width: 768px) {
    .spotlight-strip {
      flex-direction: column !important;
      padding: 40px 20px !important;
    }
    .spotlight-strip > div:last-child {
      width: 100%;
    }
    .spotlight-stat-grid {
      justify-content: center;
    }
  }

  @media (max-width: 620px) {
    .stepConnector { display: none !important; }
  }

  @media (max-width: 768px) {
    .hero-video {
      object-fit: cover !important;
      object-position: center center !important;
      width: 100vw !important;
      height: 100vh !important;
    }
    section[style*="hero"] {
      min-height: 100vh !important;
      padding: 40px 16px 60px !important;
    }
  }
`;