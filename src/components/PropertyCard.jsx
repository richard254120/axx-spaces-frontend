export default function PropertyCard({ property, isOwner = false, onDelete }) {
  const status = property.status || "pending";
  const isApproved = status === "approved";

  return (
    <div style={styles.card}>
      {property.image && (
        <img
          src={property.image}
          alt={property.title}
          style={styles.image}
        />
      )}

      <h3 style={styles.title}>{property.title}</h3>
      <p style={styles.location}>
        {property.area}, {property.county}
      </p>
      <h4 style={styles.price}>KSh {Number(property.price).toLocaleString()}</h4>

      <div style={{
        ...styles.statusBadge,
        backgroundColor: isApproved ? "#4ade80" : "#facc15",
        color: isApproved ? "#000" : "#000"
      }}>
        {isApproved ? "✅ Approved" : "⏳ Pending Approval"}
      </div>

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
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "12px",
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