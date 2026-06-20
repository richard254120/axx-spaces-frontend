export default function PropertyCard({ property, isOwner = false, onDelete }) {
  const status = property.status || "pending";
  const isApproved = status === "approved";

  const BADGE_IMAGES = {
    student_verified: "/Student Verified.png",
    business_verified: "/Business Verified.png",
    identity_verified: "/Identity Verified.png",
    location_verified: "/Locationn Verified.png",
    online_verified: "/Online Verified.png",
    premium_verified: "/Premium Verified.png",
  };

  return (
    <div style={styles.card}>
      {/* ✅ FIXED: Image Gallery - Shows ALL images! */}
      <div style={styles.imageGallery}>
        {property.images && property.images.length > 0 ? (
          property.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`${property.title} - Photo ${index + 1}`}
              style={styles.image}
            />
          ))
        ) : (
          <div style={styles.noImage}>No Image</div>
        )}
      </div>

      <h3 style={styles.title}>{property.title}</h3>
      <p style={styles.location}>
        {property.area}, {property.county}
      </p>
      <h4 style={styles.price}>KSh {Number(property.price).toLocaleString()}</h4>

      {/* Verification Badges */}
      {property.owner?.verificationBadges && property.owner.verificationBadges.length > 0 && (
        <div style={styles.badgeSection}>
          <div style={styles.badgeSectionLabel}>
            <span style={{ fontSize: 12 }}>✅</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#0ea5e9" }}>Verified Seller</span>
          </div>
          <div style={styles.badgeContainer}>
            {property.owner.verificationBadges.map((badgeId) => (
              <div key={badgeId} style={styles.badgeWrapper}>
                <img
                  src={BADGE_IMAGES[badgeId]}
                  alt={badgeId}
                  style={styles.badgeImage}
                  title={badgeId.replace(/_/g, ' ').toUpperCase()}
                />
                <div style={styles.badgeTooltip}>
                  {badgeId.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Display */}
      <div style={{
        ...styles.statusBadge,
        backgroundColor: isApproved ? "#4ade80" : "#facc15",
      }}>
        {isApproved ? "✅ Approved" : "⏳ Pending Approval"}
      </div>

      {property.images && property.images.length > 1 && (
        <p style={styles.imageCount}>
          📸 {property.images.length} photos total
        </p>
      )}

      {/* Delete Button - Only show for owner */}
      {isOwner && (
        <button
          onClick={() => onDelete(property._id)}
          style={styles.deleteBtn}
        >
          🗑 Delete Property
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#111",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #222",
  },

  // ✅ NEW: Image Gallery Container
  imageGallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "8px",
    marginBottom: "12px",
  },

  image: {
    width: "100%",
    height: "120px",  // ✅ Reduced height for multiple images
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },

  noImage: {
    width: "100%",
    height: "120px",
    background: "#1a1a1a",
    borderRadius: "8px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontSize: "14px",
  },

  title: {
    margin: "10px 0 6px 0",
    color: "#fff",
    fontSize: "20px",
  },
  location: {
    color: "#aaa",
    margin: "4px 0",
  },
  price: {
    color: "#ff4d4d",
    fontSize: "22px",
    fontWeight: "600",
    margin: "8px 0",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "8px",
  },
  badgeSection: {
    marginTop: "12px",
    padding: "10px",
    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%)",
    borderRadius: "8px",
    border: "1px solid rgba(14, 165, 233, 0.2)",
  },
  badgeSectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  badgeContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badgeWrapper: {
    position: "relative",
    display: "inline-block",
  },
  "badgeWrapper:hover .badgeTooltip": {
    opacity: 1,
    visibility: "visible",
  },
  "badgeWrapper:hover .badgeImage": {
    transform: "scale(1.1)",
  },
  badgeImage: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  badgeTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    color: "#f1f5f9",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    opacity: 0,
    visibility: "hidden",
    transition: "all 0.2s",
    marginBottom: "4px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    zIndex: 10,
    pointerEvents: "none",
  },
  imageCount: {
    color: "#0a84ff",
    fontSize: "13px",
    marginTop: "4px",
  },
  deleteBtn: {
    marginTop: "12px",
    background: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "600",
  },
};