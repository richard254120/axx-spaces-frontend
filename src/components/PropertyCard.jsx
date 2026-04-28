export default function PropertyCard({ property, isOwner = false, onDelete }) {
  const status = property.status || "pending";
  const isApproved = status === "approved";

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