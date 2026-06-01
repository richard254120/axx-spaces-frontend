import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 50%, #0f172a 100%)",
    padding: "20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    padding: "40px",
    background: "rgba(30, 58, 95, 0.6)",
    borderRadius: "24px",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.15)",
  },
  title: {
    fontSize: "52px",
    fontWeight: 900,
    color: "#60a5fa",
    marginBottom: "15px",
    textShadow: "0 2px 8px rgba(96, 165, 250, 0.3)",
  },
  category: {
    fontSize: "18px",
    color: "#94a3b8",
    marginBottom: "15px",
  },
  location: {
    fontSize: "16px",
    color: "#cbd5e1",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  description: {
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#e2e8f0",
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
    color: "#4ade80",
    border: "1px solid #22c55e",
  },
  badgeIdentity: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
    border: "1px solid #22c55e",
  },
  badgeBusiness: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    border: "1px solid #3b82f6",
  },
  badgeOnline: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    border: "1px solid #3b82f6",
  },
  badgeLocation: {
    background: "rgba(168, 85, 247, 0.2)",
    color: "#c084fc",
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
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "10px",
    color: "#60a5fa",
    textDecoration: "none",
    transition: "all 0.3s",
    fontWeight: 600,
  },
  socialButtonHover: {
    background: "#3b82f6",
    color: "#ffffff",
    border: "1px solid #3b82f6",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
  },
  section: {
    background: "rgba(30, 58, 95, 0.6)",
    borderRadius: "20px",
    padding: "30px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    marginBottom: "30px",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.1)",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #3b82f6",
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
    border: "1px solid rgba(59, 130, 246, 0.3)",
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
    color: "#60a5fa",
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
    color: "#4ade80",
    marginBottom: "8px",
  },
  promoDates: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  promoCode: {
    fontSize: "14px",
    color: "#60a5fa",
    fontWeight: 600,
    background: "rgba(59, 130, 246, 0.1)",
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
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "10px",
    color: "#60a5fa",
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
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  announcementTextarea: {
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
    minHeight: "80px",
    resize: "vertical",
  },
  submitButton: {
    padding: "10px 16px",
    background: "#3b82f6",
    color: "#ffffff",
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
    color: "#4ade80",
    fontSize: "14px",
    marginTop: "10px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  actionButton: {
    padding: "10px 20px",
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "8px",
    color: "#60a5fa",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  imageGallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },
  galleryImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  statItem: {
    background: "rgba(59, 130, 246, 0.1)",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#60a5fa",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  emailContact: {
    background: "rgba(59, 130, 246, 0.1)",
    padding: "15px",
    borderRadius: "12px",
    marginTop: "20px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  emailContactTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "10px",
  },
  emailContactItem: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },
  logo: {
    width: "120px",
    height: "120px",
    borderRadius: "16px",
    objectFit: "cover",
    border: "3px solid rgba(59, 130, 246, 0.3)",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
  },
  productsSection: {
    marginTop: "20px",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  productCard: {
    background: "rgba(15, 23, 42, 0.5)",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  productName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "8px",
  },
  productDescription: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  productPrice: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#4ade80",
    marginBottom: "6px",
  },
  productCategory: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  pricelistSection: {
    marginTop: "20px",
  },
  pricelistButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "10px",
    color: "#60a5fa",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
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
        <div style={styles.logoContainer}>
          {business.logo && (
            <img src={business.logo} alt={`${business.name} logo`} style={styles.logo} />
          )}
          <div>
            <h1 style={styles.title}>{business.name}</h1>
            <p style={styles.category}>{business.categories.join(", ")}</p>
          </div>
        </div>
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

        <div style={styles.actionButtons}>
          <a href={`tel:${business.contact.phone}`} style={styles.actionButton}>
            📞 Call
          </a>
          <a href={`mailto:${business.contact.email}`} style={styles.actionButton}>
            ✉️ Email
          </a>
          {business.contact.website && (
            <a href={business.contact.website} target="_blank" rel="noopener noreferrer" style={styles.actionButton}>
              🌐 Website
            </a>
          )}
          <button style={styles.actionButton} onClick={() => window.open(`https://wa.me/${business.contact.phone}`)}>
            💬 WhatsApp
          </button>
          <button style={styles.actionButton} onClick={() => navigator.share?.({ title: business.name, url: window.location.href })}>
            📤 Share
          </button>
        </div>

        {business.images && business.images.length > 0 && (
          <div style={styles.imageGallery}>
            {business.images.slice(0, 4).map((image, index) => (
              <img key={index} src={image} alt={`${business.name} ${index + 1}`} style={styles.galleryImage} />
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
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#60a5fa";
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
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#60a5fa";
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
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#60a5fa";
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
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#60a5fa";
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
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                  e.currentTarget.style.color = "#60a5fa";
                }}
              >
                WhatsApp
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

          {business.products && business.products.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Products & Services</h2>
              <div style={styles.productsGrid}>
                {business.products.map((product, index) => (
                  <div key={index} style={styles.productCard}>
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }} />
                    )}
                    <div style={styles.productName}>{product.name}</div>
                    {product.description && <div style={styles.productDescription}>{product.description}</div>}
                    {product.price && <div style={styles.productPrice}>KES {product.price.toLocaleString()}</div>}
                    {product.category && <div style={styles.productCategory}>{product.category}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {business.pricelist && business.pricelist.url && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Pricelist / Menu</h2>
              <div style={styles.pricelistSection}>
                <a href={business.pricelist.url} target="_blank" rel="noopener noreferrer" style={styles.pricelistButton}>
                  📄 Download {business.pricelist.name || "Pricelist"}
                </a>
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Business Stats</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{business.views || 0}</div>
                <div style={styles.statLabel}>Views</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{business.rating.toFixed(1)}</div>
                <div style={styles.statLabel}>Rating</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{business.reviewCount || 0}</div>
                <div style={styles.statLabel}>Reviews</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{business.yearEstablished || "N/A"}</div>
                <div style={styles.statLabel}>Est.</div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            <div style={styles.contactInfo}>
              <p>📞 {business.contact.phone}</p>
              {business.contact.email && <p>✉️ {business.contact.email}</p>}
              {business.location.address && <p>📍 {business.location.address}</p>}
            </div>
          </div>

          <div style={styles.emailContact}>
            <div style={styles.emailContactTitle}>📧 Axxspace Support</div>
            <div style={styles.emailContactItem}>info@axxspace.com</div>
            <div style={styles.emailContactItem}>support@axxspace.com</div>
            <div style={styles.emailContactItem}>admin@axxspace.com</div>
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
        </div>

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
    </div >
  );
}
