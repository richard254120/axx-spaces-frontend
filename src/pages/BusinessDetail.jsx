import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    padding: "40px",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "48px",
    fontWeight: 900,
    color: "#fbbf24",
    marginBottom: "15px",
  },
  category: {
    fontSize: "18px",
    color: "#94a3b8",
    marginBottom: "15px",
  },
  location: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  description: {
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#cbd5e1",
    marginBottom: "25px",
  },
  badges: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  badge: {
    padding: "8px 16px",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: 600,
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
    gap: "15px",
    marginBottom: "25px",
  },
  socialButton: {
    padding: "12px 24px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    textDecoration: "none",
    transition: "all 0.3s",
    fontWeight: 600,
  },
  socialButtonHover: {
    background: "#fbbf24",
    color: "#0f172a",
    border: "1px solid #fbbf24",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
  },
  section: {
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    padding: "30px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #fbbf24",
  },
  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "8px",
  },
  hoursItem: {
    padding: "8px 12px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hoursDay: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  hoursTime: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  promoCard: {
    background: "rgba(15, 23, 42, 0.5)",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "15px",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    display: "flex",
    gap: "15px",
  },
  promoImage: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "8px",
  },
  promoDescription: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "10px",
    lineHeight: "1.5",
  },
  promoDiscount: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#22c55e",
    marginBottom: "8px",
  },
  promoDates: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  promoCode: {
    fontSize: "14px",
    color: "#fbbf24",
    fontWeight: 600,
    background: "rgba(251, 191, 36, 0.1)",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },
  contactInfo: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#cbd5e1",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "24px",
    color: "#94a3b8",
  },
  error: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#ef4444",
  },
  backButton: {
    padding: "12px 24px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    textDecoration: "none",
    marginBottom: "20px",
    display: "inline-block",
    fontWeight: 600,
  },
  adminButton: {
    padding: "10px 16px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "15px",
  },
  announcementForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  announcementInput: {
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  announcementTextarea: {
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
    minHeight: "80px",
    resize: "vertical",
  },
  submitButton: {
    padding: "10px 16px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  successMessage: {
    padding: "10px 12px",
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    borderRadius: "8px",
    color: "#22c55e",
    fontSize: "14px",
    marginTop: "10px",
  },
};

const BADGE_CONFIG = {
  student_verified: { label: "🟢 Student Verified", style: styles.badgeStudent },
  identity_verified: { label: "🟢 Identity Verified", style: styles.badgeIdentity },
  business_verified: { label: "🔵 Business Verified", style: styles.badgeBusiness },
  online_verified: { label: "🔵 Online Verified", style: styles.badgeOnline },
  location_verified: { label: "🟣 Location Verified", style: styles.badgeLocation },
  premium_verified: { label: "⭐ Premium Verified", style: styles.badgePremium },
};

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState("");

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/business/${id}`);
      setBusiness(res.data.business);
    } catch (err) {
      setError("Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeLabel = (badgeType) => {
    return BADGE_CONFIG[badgeType]?.label || badgeType;
  };

  const getBadgeStyle = (badgeType) => {
    return BADGE_CONFIG[badgeType]?.style || styles.badge;
  };

  const formatTime = (time) => {
    if (!time) return "Closed";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/business/${id}/announcements`, {
        title: announcementTitle,
        content: announcementContent,
      });
      setAnnouncementSuccess("Announcement added successfully!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setShowAnnouncementForm(false);
      loadBusiness();
      setTimeout(() => setAnnouncementSuccess(""), 3000);
    } catch (err) {
      setAnnouncementSuccess("Failed to add announcement");
    }
  };

  if (loading) return <div style={styles.loading}>Loading business...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!business) return <div style={styles.error}>Business not found</div>;

  return (
    <div style={styles.container}>
      <a href="/axxbiashara" style={styles.backButton}>
        ← Back to Businesses
      </a>

      <div style={styles.header}>
        <h1 style={styles.title}>{business.name}</h1>
        <p style={styles.category}>{business.categories.join(", ")}</p>
        <p style={styles.location}>
          📍 {business.location.town}, {business.location.county}
          {business.location.address && `, ${business.location.address}`}
        </p>
        <p style={styles.description}>{business.description}</p>

        {business.verificationBadges && business.verificationBadges.length > 0 && (
          <div style={styles.badges}>
            {business.verificationBadges.map((badge, index) => (
              <span key={index} style={{ ...styles.badge, ...getBadgeStyle(badge.type) }}>
                {getBadgeLabel(badge.type)}
              </span>
            ))}
          </div>
        )}

        {business.socialMedia && (
          <div style={styles.socialLinks}>
            {business.socialMedia.facebook && (
              <a
                href={business.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                Facebook
              </a>
            )}
            {business.socialMedia.instagram && (
              <a
                href={business.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                Instagram
              </a>
            )}
            {business.socialMedia.twitter && (
              <a
                href={business.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                Twitter
              </a>
            )}
            {business.socialMedia.linkedin && (
              <a
                href={business.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                LinkedIn
              </a>
            )}
            {business.socialMedia.whatsapp && (
              <a
                href={`https://wa.me/${business.socialMedia.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                WhatsApp
              </a>
            )}
            {business.contact.website && (
              <a
                href={business.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fbbf24";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>

      <div style={styles.content}>
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Business Hours</h2>
            <div style={styles.hoursGrid}>
              {Object.entries(business.businessHours || {}).map(([day, hours]) => (
                <div key={day} style={styles.hoursItem}>
                  <div style={styles.hoursDay}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>
                  <div style={styles.hoursTime}>
                    {hours.closed ? "Closed" : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {business.promotions && business.promotions.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Featured Promotions</h2>
              {business.promotions
                .filter(p => p.status === "active" && p.isFeatured)
                .map((promo, index) => (
                  <div key={index} style={styles.promoCard}>
                    {promo.imageUrl && (
                      <img src={promo.imageUrl} alt={promo.title} style={styles.promoImage} />
                    )}
                    <div style={styles.promoContent}>
                      <div style={styles.promoTitle}>{promo.title}</div>
                      <div style={styles.promoDescription}>{promo.description}</div>
                      <div style={styles.promoDiscount}>
                        {promo.discountType === "percentage"
                          ? `${promo.discountValue}% OFF`
                          : promo.discountType === "fixed"
                            ? `KES ${promo.discountValue} OFF`
                            : "Buy One Get One"}
                      </div>
                      <div style={styles.promoDates}>
                        Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                      {promo.code && <div style={styles.promoCode}>Code: {promo.code}</div>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            <div style={styles.contactInfo}>
              <p>📞 {business.contact.phone}</p>
              {business.contact.email && <p>✉️ {business.contact.email}</p>}
              {business.location.address && <p>📍 {business.location.address}</p>}
              <p>👁️ {business.views} views</p>
              {business.rating > 0 && (
                <p>⭐ {business.rating.toFixed(1)} ({business.reviewCount} reviews)</p>
              )}
            </div>
          </div>

          {business.owner && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Business Owner</h2>
              <div style={styles.contactInfo}>
                <p>👤 {business.owner.name}</p>
                <p>📧 {business.owner.email}</p>
                <p>📱 {business.owner.phone}</p>
              </div>
            </div>
          )}

          {user?.role === "admin" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Admin Actions</h2>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                style={styles.adminButton}
              >
                {showAnnouncementForm ? "Cancel" : "+ Add Announcement"}
              </button>
              {showAnnouncementForm && (
                <form onSubmit={handleAddAnnouncement} style={styles.announcementForm}>
                  <input
                    type="text"
                    placeholder="Announcement Title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    style={styles.announcementInput}
                    required
                  />
                  <textarea
                    placeholder="Announcement Content"
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    style={styles.announcementTextarea}
                    required
                  />
                  <button type="submit" style={styles.submitButton}>
                    Submit Announcement
                  </button>
                </form>
              )}
              {announcementSuccess && (
                <div style={styles.successMessage}>{announcementSuccess}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
