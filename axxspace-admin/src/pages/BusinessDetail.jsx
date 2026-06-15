import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { getPricelistUrl, resolveMediaUrl } from "../utils/fileLinks";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "20px",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#fbbf24",
    margin: 0,
  },
  backButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  section: {
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "16px",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  infoValue: {
    fontSize: "16px",
    color: "#f1f5f9",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  reviewCard: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  reviewAuthor: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  reviewRating: {
    fontSize: "16px",
    color: "#fbbf24",
  },
  reviewTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "10px",
  },
  reviewComment: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  reviewMeta: {
    fontSize: "12px",
    color: "#64748b",
  },
  deleteButton: {
    padding: "8px 16px",
    background: "#ef4444",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "24px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "16px",
    color: "#64748b",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    background: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
    border: "1px solid #fbbf24",
  },
};

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
    loadReviews();
  }, [id]);

  const loadBusiness = async () => {
    try {
      const res = await API.get(`/business/${id}`);
      setBusiness(res.data.business);
    } catch (err) {
      console.error("Failed to load business:", err);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await API.get(`/business-reviews/business/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await API.delete(`/business-reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      loadBusiness(); // Reload business to update rating
      alert("✅ Review deleted successfully");
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert("❌ Failed to delete review");
    }
  };

  if (loading) {
    return <div style={styles.container}><div style={styles.loading}>Loading...</div></div>;
  }

  if (!business) {
    return <div style={styles.container}><div style={styles.empty}>Business not found</div></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Business Details</h1>
        <button style={styles.backButton} onClick={() => navigate("/admin")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Business Information */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Business Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Name</span>
            <span style={styles.infoValue}>{business.name}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Category</span>
            <span style={styles.infoValue}>
              {Array.isArray(business.categories) ? business.categories.join(", ") : business.categories}
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Location</span>
            <span style={styles.infoValue}>
              {business.location?.town}, {business.location?.county}
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Rating</span>
            <span style={styles.infoValue}>{business.rating || "N/A"} ⭐ ({business.reviewCount || 0} reviews)</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Status</span>
            <span style={styles.infoValue}>{business.status}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Contact Phone</span>
            <span style={styles.infoValue}>{business.contact?.phone || "N/A"}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Contact Email</span>
            <span style={styles.infoValue}>{business.contact?.email || "N/A"}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Price Range</span>
            <span style={styles.infoValue}>{business.priceRange || "N/A"}</span>
          </div>
        </div>
        {business.verificationBadges && business.verificationBadges.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <span style={styles.infoLabel}>Verification Badges:</span>
            <div style={styles.badges}>
              {business.verificationBadges.map((badge, index) => (
                <span key={index} style={styles.badge}>{badge.type}</span>
              ))}
            </div>
          </div>
        )}
        {business.description && (
          <div style={{ marginTop: "20px" }}>
            <span style={styles.infoLabel}>Description:</span>
            <p style={styles.infoValue}>{business.description}</p>
          </div>
        )}
        {business.pricelist?.url && (
          <div style={{ marginTop: "20px" }}>
            <span style={styles.infoLabel}>Pricelist / Menu:</span>
            <p style={styles.infoValue}>
              <a href={getPricelistUrl(business.pricelist)} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
                📄 View / Download {business.pricelist.name ? `(${business.pricelist.name})` : ""}
              </a>
            </p>
          </div>
        )}
        {business.images?.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <span style={styles.infoLabel}>Photos:</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
              {business.images.map((img, i) => (
                <a key={i} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer">
                  <img src={resolveMediaUrl(img)} alt={`${business.name} ${i + 1}`} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                </a>
              ))}
            </div>
          </div>
        )}
        {business.documents?.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <span style={styles.infoLabel}>Business Documents:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              {business.documents.map((doc, i) => (
                <a key={i} href={resolveMediaUrl(doc.url)} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
                  📄 {doc.name || doc.type || `Document ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⭐ Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div style={styles.empty}>No reviews yet</div>
        ) : (
          <div style={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review._id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <div style={styles.reviewAuthor}>{review.userName}</div>
                    <div style={styles.reviewRating}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  </div>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
                {review.title && <div style={styles.reviewTitle}>{review.title}</div>}
                <div style={styles.reviewComment}>{review.comment}</div>
                <div style={styles.reviewMeta}>
                  Posted on {new Date(review.createdAt).toLocaleDateString()}
                </div>
                {(review.pros && review.pros.length > 0) && (
                  <div style={{ marginTop: "10px" }}>
                    <span style={styles.infoLabel}>Pros: </span>
                    <span style={styles.infoValue}>{review.pros.join(", ")}</span>
                  </div>
                )}
                {(review.cons && review.cons.length > 0) && (
                  <div style={{ marginTop: "5px" }}>
                    <span style={styles.infoLabel}>Cons: </span>
                    <span style={styles.infoValue}>{review.cons.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
