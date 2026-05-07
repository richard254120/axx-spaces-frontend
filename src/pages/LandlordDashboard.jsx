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
  const [activeTab, setActiveTab] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchMyProperties();
  }, [token, navigate]);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/properties/my-properties/all`, {
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete property");
      }

      setProperties(properties.filter((p) => p._id !== propertyId));
      setSuccessMessage("✅ Property deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete property");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ NEW: Update booked units using the backend endpoint
  const updateBookedUnits = async (propertyId, change) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${propertyId}/book`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ change }), // +1 or -1
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update units");
      }

      // Refresh properties
      fetchMyProperties();
      setSuccessMessage(change > 0 ? "✅ 1 Unit marked as Booked" : "✅ 1 Unit marked as Available");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err.message || "Failed to update booking status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const counts = {
    all: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "all") return true;
    return p.status === activeTab;
  });

  const statusConfig = {
    approved: { bg: "#22c55e", label: "✅ Approved" },
    pending:  { bg: "#f59e0b", label: "⏳ Pending Approval" },
    rejected: { bg: "#ef4444", label: "❌ Rejected" },
  };

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <p style={styles.subtitle}>Manage your rental listings</p>
        <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>
          ➕ Upload New Property
        </button>
      </div>

      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Tabs — now includes Rejected */}
      <div style={styles.tabsContainer}>
        {[
          { key: "all",      label: "📋 All",       count: counts.all },
          { key: "pending",  label: "⏳ Pending",    count: counts.pending },
          { key: "approved", label: "✅ Approved",   count: counts.approved },
          { key: "rejected", label: "❌ Rejected",   count: counts.rejected },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            style={{ ...styles.tabBtn, ...(activeTab === key && styles.tabBtnActive) }}
            onClick={() => setActiveTab(key)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {loading && <p style={styles.loading}>⏳ Loading your properties...</p>}

      {!loading && filteredProperties.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            {activeTab === "all"
              ? "You have not uploaded any properties yet."
              : `No ${activeTab} properties found.`}
          </p>
          {activeTab === "all" && (
            <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
              ➕ Upload New Property
            </button>
          )}
          {activeTab === "rejected" && (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "12px" }}>
              Rejected properties can be deleted and re-submitted after fixing any issues.
            </p>
          )}
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div style={styles.grid}>
          {filteredProperties.map((property) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            const total = property.totalUnits || 1;
            const booked = property.bookedUnits || 0;
            const available = Math.max(0, total - booked);

            return (
              <div key={property._id} style={styles.card}>
                <div style={styles.imageContainer}>
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>📷 No Image</div>
                  )}
                  <div style={{ ...styles.statusBadge, backgroundColor: status.bg }}>
                    {status.label}
                  </div>
                </div>

                <div style={styles.content}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <p style={styles.location}>📍 {property.location}</p>
                  <p style={styles.price}>KSh {Number(property.price).toLocaleString()} / month</p>

                  <div style={styles.specs}>
                    <span>🛏 {property.bedrooms} Beds</span>
                    <span>🚿 {property.bathrooms} Baths</span>
                    <span>🏢 {available}/{total} units free</span>
                  </div>

                  {/* ✅ Show rejection note if rejected */}
                  {property.status === "rejected" && (
                    <div style={styles.rejectedNote}>
                      ⚠️ This listing was rejected. Delete it and re-submit after making changes.
                    </div>
                  )}

                  {/* ✅ Show pending info */}
                  {property.status === "pending" && (
                    <div style={styles.pendingNote}>
                      🕐 Under review by admin. Usually takes 24–48 hours.
                    </div>
                  )}

                  {/* ✅ Booking Controls - Only for Approved Properties */}
                  {property.status === "approved" && (
                    <div style={styles.bookingControls}>
                      <button 
                        onClick={() => updateBookedUnits(property._id, 1)}
                        disabled={available <= 0}
                        style={styles.bookedBtn}
                      >
                        Mark 1 Unit Booked
                      </button>
                      <button 
                        onClick={() => updateBookedUnits(property._id, -1)}
                        disabled={booked <= 0}
                        style={styles.availableBtn}
                      >
                        Mark 1 Unit Available
                      </button>
                    </div>
                  )}

                  <div style={styles.cardActions}>
                    <button onClick={() => handleDelete(property._id)} style={styles.deleteBtn}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI'" },
  header: { textAlign: "center", marginBottom: "40px", color: "#f1f5f9" },
  title: { fontSize: "2.5rem", margin: 0, color: "#fbbf24", fontWeight: 700 },
  subtitle: { fontSize: "1rem", color: "#94a3b8", marginTop: "8px" },
  uploadBtnTop: { marginTop: "16px", padding: "10px 24px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" },
  successMsg: { background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#6ee7b7", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontWeight: 500 },
  errorMsg: { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontWeight: 500 },
  tabsContainer: { display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "2px solid #1e293b", justifyContent: "center", flexWrap: "wrap" },
  tabBtn: { background: "transparent", border: "none", padding: "12px 20px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", borderBottom: "3px solid transparent", marginBottom: "-2px", color: "#94a3b8" },
  tabBtnActive: { color: "#fbbf24", borderBottomColor: "#fbbf24" },
  loading: { textAlign: "center", color: "#94a3b8", fontSize: "1.1rem", padding: "40px 20px" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  emptyText: { fontSize: "1.1rem", margin: 0 },
  uploadBtn: { marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  card: { background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease", display: "flex", flexDirection: "column" },
  imageContainer: { position: "relative", width: "100%", height: "200px", overflow: "hidden", background: "#0f1729" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#334155", color: "#94a3b8", fontWeight: 600 },
  statusBadge: { position: "absolute", top: "12px", right: "12px", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600, color: "white" },
  content: { padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  propertyTitle: { color: "#f1f5f9", fontSize: "1.1rem", margin: 0, fontWeight: 700 },
  location: { color: "#94a3b8", margin: 0, fontSize: "0.9rem" },
  price: { color: "#fbbf24", fontSize: "1.15rem", fontWeight: 700, margin: 0 },
  specs: { display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "0.85rem", color: "#cbd5e1" },
  rejectedNote: { background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "10px 12px", borderRadius: "8px", fontSize: "0.85rem" },
  pendingNote: { background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fcd34d", padding: "10px 12px", borderRadius: "8px", fontSize: "0.85rem" },
  cardActions: { marginTop: "auto", paddingTop: "12px", display: "flex", gap: "8px" },
  deleteBtn: { flex: 1, padding: "10px 12px", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" },

  // ✅ NEW STYLES FOR BOOKING CONTROLS
  bookingControls: { display: "flex", gap: "8px", margin: "12px 0" },
  bookedBtn: { flex: 1, padding: "9px 12px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" },
  availableBtn: { flex: 1, padding: "9px 12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" },
};

const cssStyles = `
  button:hover:not(:disabled) { transform: translateY(-2px); }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }
`;