import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(251, 191, 36, 0.3)",
  },
  title: {
    fontSize: "48px",
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#1e293b",
    fontWeight: 500,
  },
  filters: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  filterSelect: {
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    minWidth: "200px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "25px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "20px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "8px",
  },
  cardCategory: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  cardLocation: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "15px",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },
  contactButton: {
    padding: "10px 20px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  badgeStudent: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    border: "1px solid #22c55e",
  },
  badgeIdentity: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    border: "1px solid #22c55e",
  },
  badgeBusiness: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
  },
  badgeOnline: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
  },
  badgeLocation: {
    background: "rgba(168, 85, 247, 0.2)",
    color: "#a855f7",
    border: "1px solid #a855f7",
  },
  badgePremium: {
    background: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
    border: "1px solid #fbbf24",
  },
  socialLinks: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  socialIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f1f5f9",
    textDecoration: "none",
    transition: "background 0.3s",
  },
  featured: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#fbbf24",
    color: "#0f172a",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "24px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#64748b",
  },
  addButton: {
    padding: "12px 24px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(251, 191, 36, 0.3)",
    transition: "opacity 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pricingSection: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
  },
  pricingCard: {
    background: "rgba(251, 191, 36, 0.1)",
    border: "2px solid #fbbf24",
    borderRadius: "20px",
    padding: "30px 50px",
    textAlign: "center",
    maxWidth: "500px",
  },
  pricingOriginal: {
    fontSize: "24px",
    color: "#94a3b8",
    textDecoration: "line-through",
    marginBottom: "10px",
  },
  pricingCurrent: {
    fontSize: "48px",
    fontWeight: 900,
    color: "#fbbf24",
    marginBottom: "10px",
  },
  pricingDiscount: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#22c55e",
    marginBottom: "15px",
  },
  pricingUrgency: {
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },
  announcementsSection: {
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  announcementsTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
  },
  announcementsScroll: {
    display: "flex",
    gap: "20px",
    overflowX: "auto",
    paddingBottom: "10px",
    scrollbarWidth: "thin",
    scrollbarColor: "#fbbf24 rgba(30, 41, 59, 0.5)",
  },
  announcementBox: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "15px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s",
    minWidth: "280px",
    maxWidth: "320px",
    flexShrink: 0,
  },
  announcementBusiness: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: "10px",
    display: "block",
  },
  announcementSubmitter: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "5px",
    display: "block",
  },
  announcementBoxTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#f1f5f9",
    marginBottom: "10px",
    margin: 0,
  },
  announcementBoxDate: {
    fontSize: "12px",
    color: "#64748b",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "rgba(30, 41, 59, 0.95)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "600px",
    width: "90%",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "20px",
    color: "#f1f5f9",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  modalTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "15px",
  },
  modalBusiness: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  modalDate: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
  },
  modalContentText: {
    fontSize: "16px",
    color: "#cbd5e1",
    lineHeight: "1.8",
  },
  announcementSuccess: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#22c55e",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    textAlign: "center",
  },
  announcementForm: {
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  formTextarea: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  formSubmit: {
    padding: "12px 24px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  searchSection: {
    marginBottom: "30px",
  },
  searchInputWrapper: {
    position: "relative",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
  },
  searchInput: {
    width: "100%",
    padding: "15px 15px 15px 50px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "18px",
    padding: "5px",
  },
};

const BUSINESS_CATEGORIES = [
  "Restaurants", "Retail", "Services", "Technology", "Healthcare",
  "Education", "Entertainment", "Professional Services", "Manufacturing",
  "Agriculture", "Construction", "Transportation", "Other",
];

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

const BADGE_CONFIG = {
  student_verified:  { label: "🟢 Student Verified",  style: styles.badgeStudent  },
  identity_verified: { label: "🟢 Identity Verified", style: styles.badgeIdentity },
  business_verified: { label: "🔵 Business Verified", style: styles.badgeBusiness },
  online_verified:   { label: "🔵 Online Verified",   style: styles.badgeOnline   },
  location_verified: { label: "🟣 Location Verified", style: styles.badgeLocation },
  premium_verified:  { label: "⭐ Premium Verified",  style: styles.badgePremium  },
};

export default function AxxBiashara() {
  const navigate = useNavigate();
  const [businesses, setBusinesses]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [selectedCategory, setSelectedCategory]   = useState(null);
  const [selectedCounty, setSelectedCounty]       = useState(null);
  const [searchQuery, setSearchQuery]             = useState("");
  const [sortBy, setSortBy]                       = useState("newest");
  const [announcements, setAnnouncements]         = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm]   = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSuccess, setAnnouncementSuccess]   = useState("");
  const [submitterName, setSubmitterName]         = useState("");
  const [organizationName, setOrganizationName]   = useState("");

  // ── Load businesses whenever filters change ──────────────────────────────
  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCounty)   params.county   = selectedCounty;
      if (searchQuery)      params.search   = searchQuery;
      if (sortBy)           params.sort     = sortBy;

      const res = await API.get("/business", { params });
      // FIX: safe optional-chain + fallback so a bad API shape never crashes render
      setBusinesses(res.data?.businesses || []);
    } catch (err) {
      console.error("Failed to load businesses:", err);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Load announcements ────────────────────────────────────────────────────
  // FIX: uses the renamed /all-announcements route that no longer clashes with /:id
  const loadAnnouncements = async () => {
    try {
      const res = await API.get("/business/all-announcements");
      setAnnouncements(res.data?.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    }
  };

  useEffect(() => { loadBusinesses(); }, [selectedCategory, selectedCounty, searchQuery, sortBy]);
  useEffect(() => { loadAnnouncements(); }, []);

  // ── Submit general announcement ───────────────────────────────────────────
  // FIX: uses the renamed /general-announcements POST route
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post("/business/general-announcements", {
        title: announcementTitle,
        content: announcementContent,
        submitterName,
        organizationName,
      });
      setAnnouncementSuccess("✅ Announcement submitted for approval!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSubmitterName("");
      setOrganizationName("");
      setShowAnnouncementForm(false);
      setTimeout(() => setAnnouncementSuccess(""), 3000);
    } catch (err) {
      alert("❌ Failed to submit announcement");
    }
  };

  const getBadgeLabel = (badgeType) => BADGE_CONFIG[badgeType]?.label || badgeType;
  const getBadgeStyle = (badgeType) => BADGE_CONFIG[badgeType]?.style || styles.badge;

  return (
    <div style={styles.container}>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={styles.title}>🏪 AxxBiashara</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={styles.addButton}
              onClick={() => navigate("/business/create")}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + Create Business
            </button>
            <button
              style={{ ...styles.addButton, background: "#22c55e" }}
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {showAnnouncementForm ? "Cancel" : "+ Create Announcement"}
            </button>
          </div>
        </div>

        {announcementSuccess && (
          <div style={styles.announcementSuccess}>{announcementSuccess}</div>
        )}

        {showAnnouncementForm && (
          <form onSubmit={handleAddAnnouncement} style={styles.announcementForm}>
            <h3 style={styles.formTitle}>Create Announcement</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              style={styles.formInput}
              required
            />
            <input
              type="text"
              placeholder="Organization/Company Name (Optional)"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              style={styles.formInput}
            />
            <input
              type="text"
              placeholder="Announcement Title"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              style={styles.formInput}
              required
            />
            <textarea
              placeholder="Announcement Content"
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              style={styles.formTextarea}
              required
              rows={4}
            />
            <button type="submit" style={styles.formSubmit}>
              Submit for Approval
            </button>
          </form>
        )}

        {/* Announcements Section */}
        <div style={styles.announcementsSection}>
          <h3 style={styles.announcementsTitle}>📢 Latest Announcements</h3>
          {announcements.length > 0 ? (
            <div style={styles.announcementsScroll}>
              {announcements.slice(0, 10).map((announcement, index) => (
                <div
                  key={index}
                  style={styles.announcementBox}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setShowAnnouncementModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(251, 191, 36, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={styles.announcementBusiness}>{announcement.businessName}</span>
                  <h4 style={styles.announcementBoxTitle}>{announcement.title}</h4>
                  <span style={styles.announcementSubmitter}>
                    👤 {announcement.submitterName || "Anonymous"}
                    {announcement.organizationName && ` • 🏢 ${announcement.organizationName}`}
                  </span>
                  <span style={styles.announcementBoxDate}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              No announcements yet. Create one on a business page!
            </p>
          )}
        </div>

        <p style={styles.subtitle}>Discover and connect with trusted businesses across Kenya</p>

        {/* Pricing Section */}
        <div style={styles.pricingSection}>
          <div style={styles.pricingCard}>
            <div style={styles.pricingOriginal}>KSh 999/month</div>
            <div style={styles.pricingCurrent}>KSh 499/month</div>
            <div style={styles.pricingDiscount}>50% OFF Launch Offer</div>
            <div style={styles.pricingUrgency}>
              Offer ends soon • Only for early verified businesses • Price increases after launch phase
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────────────────── */}
      <div style={styles.searchSection}>
        <div style={styles.searchInputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search businesses by name, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={styles.clearSearchBtn} onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>
      </div>

      {/* ── FILTERS ────────────────────────────────────────────────────────── */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category:</label>
          <select
            style={styles.filterSelect}
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>County:</label>
          <select
            style={styles.filterSelect}
            value={selectedCounty || ""}
            onChange={(e) => setSelectedCounty(e.target.value || null)}
          >
            <option value="">All Counties</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort By:</label>
          <select
            style={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Viewed</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* ── BUSINESS GRID ──────────────────────────────────────────────────── */}
      {loading ? (
        <div style={styles.loading}>Loading businesses...</div>
      ) : businesses.length === 0 ? (
        <div style={styles.empty}>No businesses found</div>
      ) : (
        <div style={styles.grid}>
          {businesses.map((business) => (
            <div
              key={business._id}
              style={styles.card}
              onClick={() => navigate(`/business/${business._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {business.featured && <div style={styles.featured}>⭐ Featured</div>}
              {business.images && business.images.length > 0 && (
                <img src={business.images[0]} alt={business.name} style={styles.image} />
              )}
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{business.name}</h3>
                {/* FIX: safe join in case categories is not yet an array */}
                <p style={styles.cardCategory}>
                  {Array.isArray(business.categories)
                    ? business.categories.join(", ")
                    : business.categories}
                </p>
                {/* FIX: optional chaining so missing location doesn't crash render */}
                <p style={styles.cardLocation}>
                  📍 {business.location?.town}, {business.location?.county}
                </p>
                <p style={styles.cardDescription}>{business.description}</p>

                {business.verificationBadges && business.verificationBadges.length > 0 && (
                  <div style={styles.badges}>
                    {business.verificationBadges.map((badge, index) => (
                      <span key={index} style={{ ...styles.badge, ...getBadgeStyle(badge.type) }}>
                        {getBadgeLabel(badge.type)}
                      </span>
                    ))}
                  </div>
                )}

                <div style={styles.cardActions}>
                  {business.contact?.phone && (
                    <a
                      href={`tel:${business.contact.phone}`}
                      style={styles.contactButton}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📞 Call
                    </a>
                  )}
                  {business.contact?.email && (
                    <a
                      href={`mailto:${business.contact.email}`}
                      style={styles.contactButton}
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✉️ Email
                    </a>
                  )}
                </div>

                {business.socialMedia && (
                  <div style={styles.socialLinks}>
                    {business.socialMedia.facebook && (
                      <a
                        href={business.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >f</a>
                    )}
                    {business.socialMedia.instagram && (
                      <a
                        href={business.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >📷</a>
                    )}
                    {business.socialMedia.whatsapp && (
                      <a
                        href={`https://wa.me/${business.socialMedia.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >💬</a>
                    )}
                    {business.contact?.website && (
                      <a
                        href={business.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >🔗</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ANNOUNCEMENT MODAL ─────────────────────────────────────────────── */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div style={styles.modalOverlay} onClick={() => setShowAnnouncementModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowAnnouncementModal(false)}>
              ✕
            </button>
            <h3 style={styles.modalTitle}>{selectedAnnouncement.title}</h3>
            <p style={styles.modalBusiness}>📢 {selectedAnnouncement.businessName}</p>
            <p style={styles.modalDate}>
              📅 {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
            </p>
            <p style={styles.modalContentText}>{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}