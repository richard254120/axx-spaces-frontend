import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function LandlordDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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

  const updateBookedUnits = async (propertyId, change) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${propertyId}/book`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ change }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update units");
      }

      fetchMyProperties();
      setSuccessMessage(change > 0 ? "✅ 1 Unit marked as Booked" : "✅ 1 Unit marked as Available");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err.message || "Failed to update booking status");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ NEW - Boost Property (Monetization)
  const handleBoost = (propertyId) => {
    navigate(`/premium-plans?propertyId=${propertyId}`);
  };

  const counts = {
    all: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
    booked: properties.filter((p) => (p.bookedUnits || 0) > 0).length,
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "booked") return (p.bookedUnits || 0) > 0;
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

      {/* ==================== YOUR ORIGINAL PROFILE CARD ==================== */}
     <div style={styles.profileCard}>
  <div style={styles.profileHeader}>
    <div style={styles.avatar}>👤</div>
    <div style={styles.profileInfo}>
      <h2 style={styles.profileName}>
        {user?.name || "Landlord"}
      </h2>
      <p style={styles.profileEmail}>
        {user?.email || "No email loaded"}
      </p>
      <p style={styles.profilePhone}>
        {user?.phone || "No phone added"}
      </p>
    </div>
    <button style={styles.logoutBtn} onClick={logout}>
      Logout
    </button>
  </div>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.all}</div>
            <div style={styles.statLabel}>Total Properties</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.approved}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.pending}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.booked}</div>
            <div style={styles.statLabel}>Booked Properties</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <p style={styles.subtitle}>Manage your rental listings</p>
        <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>
          ➕ Upload New Property
        </button>
      </div>

      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {[
          { key: "all",      label: "📋 All",       count: counts.all },
          { key: "pending",  label: "⏳ Pending",   count: counts.pending },
          { key: "approved", label: "✅ Approved",  count: counts.approved },
          { key: "booked",   label: "📌 Booked",    count: counts.booked },
          { key: "rejected", label: "❌ Rejected",  count: counts.rejected },
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
            {activeTab === "all" ? "You have not uploaded any properties yet." : `No ${activeTab} properties found.`}
          </p>
          {activeTab === "all" && (
            <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
               Upload New Property
            </button>
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
                  <p style={styles.location}>📍 {property.county} • {property.location}</p>
                  <p style={styles.price}>KSh {Number(property.price).toLocaleString()} / month</p>

                  <div style={styles.specs}>
                    <span>🛏 {property.bedrooms} Beds</span>
                    <span>🚿 {property.bathrooms} Baths</span>
                    <span>🏢 {available}/{total} units free</span>
                  </div>

                  {/* ✅ Boost Button - Only for Approved Properties */}
                  {property.status === "approved" && (
                    <button 
                      onClick={() => handleBoost(property._id)}
                      style={styles.boostBtn}
                    >
                      ⭐ Boost your property
                    </button>
                  )}

                  {property.status === "rejected" && (
                    <div style={styles.rejectedNote}>
                      ⚠️ This listing was rejected. Delete it and re-submit after fixing any issues.
                    </div>
                  )}

                  {property.status === "pending" && (
                    <div style={styles.pendingNote}>
                      🕐 Under review by admin. Usually takes 24–48 hours.
                    </div>
                  )}

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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ====================== ALL YOUR ORIGINAL STYLES + BOOST BUTTON ====================== */
const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI'" },

  profileCard: {
    background: "linear-gradient(135deg, #1e2937, #0f172a)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid #334155"
  },
  profileHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" },
  avatar: { fontSize: "52px", width: "80px", height: "80px", background: "#334155", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  profileName: { margin: 0, fontSize: "1.6rem", color: "#60a5fa" },
  profileEmail: { margin: "4px 0", color: "#94a3b8" },
  profilePhone: { color: "#94a3b8" },
  logoutBtn: { padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginTop: "24px" },
  statBox: { background: "rgba(59, 130, 246, 0.1)", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(59, 130, 246, 0.2)" },
  statNumber: { fontSize: "1.8rem", fontWeight: 700, color: "#60a5fa" },
  statLabel: { color: "#94a3b8", fontSize: "0.9rem", marginTop: "4px" },

  header: { textAlign: "center", marginBottom: "30px", color: "#f1f5f9" },
  title: { fontSize: "2.5rem", margin: 0, color: "#fbbf24", fontWeight: 700 },
  subtitle: { fontSize: "1rem", color: "#94a3b8", marginTop: "8px" },
  uploadBtnTop: { marginTop: "16px", padding: "10px 24px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" },

  successMsg: { background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#6ee7b7", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },
  errorMsg: { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },

  tabsContainer: { display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "2px solid #1e293b", justifyContent: "center", flexWrap: "wrap" },
  tabBtn: { background: "transparent", border: "none", padding: "12px 20px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", borderBottom: "3px solid transparent", marginBottom: "-2px", color: "#94a3b8" },
  tabBtnActive: { color: "#fbbf24", borderBottomColor: "#fbbf24" },

  loading: { textAlign: "center", color: "#94a3b8", fontSize: "1.1rem", padding: "40px 20px" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  emptyText: { fontSize: "1.1rem", margin: 0 },

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
  bookingControls: { display: "flex", gap: "8px", margin: "12px 0" },
  bookedBtn: { flex: 1, padding: "9px 12px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" },
  availableBtn: { flex: 1, padding: "9px 12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" },

  // ✅ NEW BOOST BUTTON STYLE
  boostBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #eab308, #ca8a04)",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
  }
};

const cssStyles = `
  button:hover:not(:disabled) { transform: translateY(-2px); }
  .card:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }
`;