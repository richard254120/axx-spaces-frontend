import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LandlordDashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch properties based on active tab
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProperties = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint =
          activeTab === "active"
            ? "/api/properties/my-properties/active"
            : "/api/properties/my-properties/booked";

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err.message || "Error fetching properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [activeTab, token, navigate]);

  // Mark property as booked
  const handleMarkBooked = async (propertyId) => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/mark-booked`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark as booked");
      }

      setProperties(properties.filter((p) => p._id !== propertyId));
      setSuccessMessage("✅ Property marked as booked!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Unmark property as booked
  const handleUnmarkBooked = async (propertyId) => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/unmark-booked`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unmark as booked");
      }

      setProperties(properties.filter((p) => p._id !== propertyId));
      setSuccessMessage("✅ Booked status removed!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete property
  const handleDelete = async (propertyId) => {
    if (!window.confirm("🗑️ Delete this property permanently?")) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete property");
      }

      setProperties(properties.filter((p) => p._id !== propertyId));
      setSuccessMessage("✅ Property deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <p style={styles.subtitle}>Manage your rental listings</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div style={styles.successMsg}>{successMessage}</div>
      )}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "active"
              ? styles.tabBtnActive
              : styles.tabBtnInactive),
          }}
          onClick={() => setActiveTab("active")}
        >
          📋 Active Properties ({properties.length})
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "booked"
              ? styles.tabBtnActive
              : styles.tabBtnInactive),
          }}
          onClick={() => setActiveTab("booked")}
        >
          ✅ Booked Properties ({properties.length})
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={styles.loading}>⏳ Loading properties...</p>}

      {/* No Properties */}
      {!loading && properties.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            {activeTab === "active"
              ? "📝 No active properties yet. Upload one to get started! 🚀"
              : "📌 No booked properties yet."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={() => navigate("/upload")}
              style={styles.uploadBtn}
            >
              ➕ Upload New Property
            </button>
          )}
        </div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <div style={styles.grid}>
          {properties.map((property) => (
            <div key={property._id} style={styles.card}>
              {/* Image */}
              <div style={styles.imageContainer}>
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}

                {/* Status Badge */}
                <div
                  style={{
                    ...styles.badge,
                    ...(property.status === "approved"
                      ? styles.badgeApproved
                      : property.status === "pending"
                      ? styles.badgePending
                      : styles.badgeRejected),
                  }}
                >
                  {property.status === "approved" && "✅ Approved"}
                  {property.status === "pending" && "⏳ Pending"}
                  {property.status === "rejected" && "❌ Rejected"}
                </div>

                {/* Booked Badge */}
                {property.bookedUnits > 0 && (
                  <div style={styles.bookedBadge}>
                    {property.bookedUnits} of {property.totalUnits} Booked
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={styles.content}>
                <h2 style={styles.title2}>{property.title}</h2>
                <p style={styles.location}>📍 {property.location}</p>

                <div style={styles.specs}>
                  <span style={styles.spec}>🛏️ {property.bedrooms} Beds</span>
                  <span style={styles.spec}>🚿 {property.bathrooms} Baths</span>
                </div>

                <p style={styles.price}>
                  💰 KES {property.price?.toLocaleString()} / month
                </p>

                <p style={styles.description}>
                  {property.description?.substring(0, 100)}...
                </p>

                {/* Unit Info */}
                <div style={styles.unitsInfo}>
                  <span style={styles.unitItem}>Total: {property.totalUnits}</span>
                  <span style={styles.unitItem}>Booked: {property.bookedUnits}</span>
                  <span style={styles.unitItem}>
                    Available: {property.availableUnits}
                  </span>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div style={styles.amenitiesBox}>
                    <p style={styles.amenitiesTitle}>✨ Amenities:</p>
                    <div style={styles.amenitiesList}>
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} style={styles.amenityTag}>
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span style={styles.amenityTag}>
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={styles.actions}>
                  {activeTab === "active" ? (
                    <>
                      <button
                        style={styles.bookedBtn}
                        onClick={() => handleMarkBooked(property._id)}
                      >
                        ✅ Mark Booked
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(property._id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    <button
                      style={styles.unbookBtn}
                      onClick={() => handleUnmarkBooked(property._id)}
                    >
                      🔄 Unmark Booked
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    minHeight: "100vh",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI'",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#f1f5f9",
  },
  title: {
    fontSize: "2.5rem",
    margin: 0,
    color: "#fbbf24",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginTop: "8px",
  },
  successMsg: {
    background: "#10b981",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: 500,
  },
  errorMsg: {
    background: "#ef4444",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: 500,
  },
  tabsContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    borderBottom: "2px solid #1e293b",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
  },
  tabBtnActive: {
    color: "#fbbf24",
    borderBottomColor: "#fbbf24",
  },
  tabBtnInactive: {
    color: "#94a3b8",
  },
  loading: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "1.1rem",
    padding: "40px 20px",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "60px 20px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "12px",
    border: "2px dashed #475569",
  },
  emptyText: {
    fontSize: "1.1rem",
    margin: 0,
  },
  uploadBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
    background: "#0f1729",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#334155",
    color: "#94a3b8",
    fontWeight: 600,
  },
  badge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "white",
  },
  badgeApproved: {
    background: "#10b981",
  },
  badgePending: {
    background: "#f59e0b",
  },
  badgeRejected: {
    background: "#ef4444",
  },
  bookedBadge: {
    position: "absolute",
    bottom: "12px",
    left: "12px",
    background: "rgba(59, 130, 246, 0.9)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  content: {
    padding: "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  title2: {
    color: "#f1f5f9",
    fontSize: "1.3rem",
    margin: "0 0 8px 0",
    wordBreak: "break-word",
  },
  location: {
    color: "#94a3b8",
    margin: "0 0 12px 0",
    fontSize: "0.95rem",
  },
  specs: {
    display: "flex",
    gap: "12px",
    margin: "12px 0",
  },
  spec: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
  },
  price: {
    color: "#fbbf24",
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: "12px 0",
  },
  description: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
    margin: "12px 0",
    lineHeight: "1.5",
  },
  unitsInfo: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: "8px",
    margin: "12px 0",
    fontSize: "0.85rem",
    color: "#cbd5e1",
  },
  unitItem: {
    flex: 1,
    textAlign: "center",
  },
  amenitiesBox: {
    background: "rgba(139, 92, 246, 0.1)",
    padding: "12px",
    borderRadius: "8px",
    margin: "12px 0",
    border: "1px solid rgba(139, 92, 246, 0.3)",
  },
  amenitiesTitle: {
    color: "#8b5cf6",
    fontSize: "0.85rem",
    fontWeight: 600,
    margin: "0 0 8px 0",
  },
  amenitiesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  amenityTag: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#cbd5e1",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  bookedBtn: {
    flex: 1,
    padding: "10px 12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  unbookBtn: {
    flex: 1,
    padding: "10px 12px",
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  deleteBtn: {
    flex: 1,
    padding: "10px 12px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
};

const cssStyles = `
  * {
    box-sizing: border-box;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  button:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] {
      grid-template-columns: 1fr !important;
    }
  }
`;