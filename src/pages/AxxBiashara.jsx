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
  filterButton: {
    padding: "12px 24px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    cursor: "pointer",
    transition: "all 0.3s",
    fontWeight: 600,
  },
  filterButtonActive: {
    background: "#fbbf24",
    color: "#0f172a",
    border: "1px solid #fbbf24",
  },
  searchInput: {
    padding: "12px 20px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    width: "300px",
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
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
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
  socialIconHover: {
    background: "#fbbf24",
    color: "#0f172a",
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
  addButtonHover: {
    opacity: 0.9,
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
  announcementsList: {
    display: "grid",
    gap: "15px",
  },
  announcementCard: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  announcementBusiness: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fbbf24",
  },
  announcementDate: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  announcementTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  announcementContent: {
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.5",
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
  "Restaurants",
  "Retail",
  "Services",
  "Technology",
  "Healthcare",
  "Education",
  "Entertainment",
  "Professional Services",
  "Manufacturing",
  "Agriculture",
  "Construction",
  "Transportation",
  "Other",
];

const BADGE_CONFIG = {
  student_verified: { label: "🟢 Student Verified", style: styles.badgeStudent },
  identity_verified: { label: "🟢 Identity Verified", style: styles.badgeIdentity },
  business_verified: { label: "🔵 Business Verified", style: styles.badgeBusiness },
  online_verified: { label: "🔵 Online Verified", style: styles.badgeOnline },
  location_verified: { label: "🟣 Location Verified", style: styles.badgeLocation },
  premium_verified: { label: "⭐ Premium Verified", style: styles.badgePremium },
};

export default function AxxBiashara() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadBusinesses();
    loadAnnouncements();
  }, [selectedCategory, selectedCounty, searchQuery, sortBy]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCounty) params.county = selectedCounty;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;

      const res = await API.get("/business", { params });
      setBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await API.get("/business/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  const getBadgeLabel = (badgeType) => {
    return BADGE_CONFIG[badgeType]?.label || badgeType;
  };

  const getBadgeStyle = (badgeType) => {
    return BADGE_CONFIG[badgeType]?.style || styles.badge;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={styles.title}>🏪 AxxBiashara</h1>
          <button
            style={styles.addButton}
            onClick={() => navigate("/business/create")}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            + Create Business
          </button>
        </div>
        <p style={styles.subtitle}>Discover and connect with trusted businesses across Kenya</p>

        {/* Pricing Section */}
        <div style={styles.pricingSection}>
          <div style={styles.pricingCard}>
            <div style={styles.pricingOriginal}>KSh 999/month</div>
            <div style={styles.pricingCurrent}>KSh 499/month</div>
            <div style={styles.pricingDiscount}>50% OFF Launch Offer</div>
            <div style={styles.pricingUrgency}>Offer ends soon • Only for early verified businesses • Price increases after launch phase</div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div style={styles.announcementsSection}>
          <h3 style={styles.announcementsTitle}>📢 Latest Announcements</h3>
          <div style={styles.announcementsList}>
            {announcements.slice(0, 5).map((announcement, index) => (
              <div key={index} style={styles.announcementCard}>
                <div style={styles.announcementHeader}>
                  <span style={styles.announcementBusiness}>{announcement.businessName}</span>
                  <span style={styles.announcementDate}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={styles.announcementTitle}>{announcement.title}</h4>
                <p style={styles.announcementContent}>{announcement.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
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

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category:</label>
          <select
            style={styles.filterSelect}
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {BUSINESS_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
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
            {KENYA_COUNTIES.map((county) => (
              <option key={county} value={county}>{county}</option>
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
                <p style={styles.cardCategory}>{business.categories.join(", ")}</p>
                <p style={styles.cardLocation}>
                  📍 {business.location.town}, {business.location.county}
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
                  {business.contact.phone && (
                    <a
                      href={`tel:${business.contact.phone}`}
                      style={styles.contactButton}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📞 Call
                    </a>
                  )}
                  {business.contact.email && (
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >
                        f
                      </a>
                    )}
                    {business.socialMedia.instagram && (
                      <a
                        href={business.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >
                        📷
                      </a>
                    )}
                    {business.socialMedia.whatsapp && (
                      <a
                        href={`https://wa.me/${business.socialMedia.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >
                        💬
                      </a>
                    )}
                    {business.contact.website && (
                      <a
                        href={business.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialIcon}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fbbf24";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.color = "#f1f5f9";
                        }}
                      >
                        🔗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
