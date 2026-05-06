import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function LandlordDashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, pending, approved
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyProperties();
  }, [token, navigate]);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/properties/my-properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch properties");

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("🗑️ Delete this property permanently?")) return;

    try {
      const response = await fetch(`${API_BASE}/properties/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete property");

      setProperties(properties.filter(p => p._id !== propertyId));
      setSuccessMessage("✅ Property deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete property");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "approved") return p.status === "approved";
    return true; // "all"
  });

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <p style={styles.subtitle}>Manage your rental listings</p>
      </div>

      {/* Messages */}
      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{...styles.tabBtn, ...(activeTab === "all" && styles.tabBtnActive)}}
          onClick={() => setActiveTab("all")}
        >
          📋 All ({properties.length})
        </button>
        <button
          style={{...styles.tabBtn, ...(activeTab === "pending" && styles.tabBtnActive)}}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending ({properties.filter(p => p.status === "pending").length})
        </button>
        <button
          style={{...styles.tabBtn, ...(activeTab === "approved" && styles.tabBtnActive)}}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Approved ({properties.filter(p => p.status === "approved").length})
        </button>
      </div>

      {loading && <p style={styles.loading}>⏳ Loading your properties...</p>}

      {!loading && filteredProperties.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            {activeTab === "all" 
              ? "You have not uploaded any properties yet." 
              : `No ${activeTab} properties found.`}
          </p>
          <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
            ➕ Upload New Property
          </button>
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div style={styles.grid}>
          {filteredProperties.map((property) => (
            <div key={property._id} style={styles.card}>
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

                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: property.status === "approved" ? "#22c55e" : "#f59e0b"
                }}>
                  {property.status === "approved" ? "✅ Approved" : "⏳ Pending Approval"}
                </div>
              </div>

              <div style={styles.content}>
                <h3 style={styles.propertyTitle}>{property.title}</h3>
                <p style={styles.location}>📍 {property.location || `${property.area}, ${property.county}`}</p>
                
                <p style={styles.price}>
                  KSh {Number(property.price).toLocaleString()} / month
                </p>

                <div style={styles.specs}>
                  <span>🛏 {property.bedrooms} Beds</span>
                  <span>🚿 {property.bathrooms} Baths</span>
                </div>

                <button 
                  onClick={() => handleDelete(property._id)}
                  style={styles.deleteBtn}
                >
                  🗑 Delete Property
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== STYLES (Your Original Style Preserved) ==================== */
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
  statusBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "white",
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
  deleteBtn: {
    marginTop: "auto",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

const cssStyles = `
  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] {
      grid-template-columns: 1fr !important;
    }
  }
`;