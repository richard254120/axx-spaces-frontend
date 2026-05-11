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
    // 🛡️ SECURITY FIREWALL: Check if logged in and if user is a Landlord
    if (!token) { 
      navigate("/login"); 
      return; 
    }
    
    if (user && user.role !== "landlord") {
      // Redirect Movers or others to their correct dashboard
      navigate(user.role === "mover" ? "/mover-dashboard" : "/");
      return;
    }

    fetchMyProperties();
  }, [token, user, navigate]);

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

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>👤</div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{user?.name || "Landlord"}</h2>
            <p style={styles.profileEmail}>{user?.email || "No email loaded"}</p>
            <p style={styles.profilePhone}>{user?.phone || "No phone added"}</p>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
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
            <div style={styles.statLabel}>Booked Units</div>
          </div>
        </div>
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>
          ➕ Upload New Property
        </button>
      </div>

      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

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
          <p style={styles.emptyText}>No {activeTab === "all" ? "" : activeTab} properties found.</p>
          {activeTab === "all" && (
            <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>Upload Now</button>
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
                  {property.images?.[0] ? (
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
                  <p style={styles.price}>KSh {Number(property.price).toLocaleString()}</p>

                  <div style={styles.specs}>
                    <span>🛏 {property.bedrooms} Beds</span>
                    <span>🏢 {available}/{total} units free</span>
                  </div>

                  {property.status === "approved" && (
                    <>
                      <button onClick={() => handleBoost(property._id)} style={styles.boostBtn}>
                        ⭐ Boost Property
                      </button>
                      <div style={styles.bookingControls}>
                        <button onClick={() => updateBookedUnits(property._id, 1)} disabled={available <= 0} style={styles.bookedBtn}>Book Unit</button>
                        <button onClick={() => updateBookedUnits(property._id, -1)} disabled={booked <= 0} style={styles.availableBtn}>Free Unit</button>
                      </div>
                    </>
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

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "#06101f", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  profileCard: { background: "#1e2937", borderRadius: "16px", padding: "24px", marginBottom: "32px", border: "1px solid #334155" },
  profileHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" },
  avatar: { fontSize: "40px", width: "60px", height: "60px", background: "#334155", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  profileName: { margin: 0, fontSize: "1.4rem", color: "#60a5fa" },
  profileEmail: { margin: "2px 0", color: "#94a3b8", fontSize: "0.9rem" },
  profilePhone: { color: "#94a3b8", fontSize: "0.9rem" },
  logoutBtn: { padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginTop: "20px" },
  statBox: { background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(59, 130, 246, 0.2)" },
  statNumber: { fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" },
  statLabel: { color: "#94a3b8", fontSize: "0.8rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" },
  title: { color: "#fbbf24", fontSize: "1.8rem", margin: 0 },
  uploadBtnTop: { padding: "12px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  successMsg: { background: "#065f46", color: "#a7f3d0", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center" },
  errorMsg: { background: "#991b1b", color: "#fecaca", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center" },
  tabsContainer: { display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom: "10px" },
  tabBtn: { background: "transparent", border: "none", color: "#94a3b8", padding: "10px 15px", cursor: "pointer", borderBottom: "2px solid transparent" },
  tabBtnActive: { color: "#fbbf24", borderBottom: "2px solid #fbbf24" },
  loading: { textAlign: "center", color: "#94a3b8" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "50px", border: "1px dashed #334155", borderRadius: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  card: { background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", overflow: "hidden" },
  imageContainer: { height: "180px", position: "relative" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  noImage: { background: "#1e293b", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  statusBadge: { position: "absolute", top: "10px", right: "10px", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", color: "white" },
  content: { padding: "15px" },
  propertyTitle: { color: "#f1f5f9", margin: "0 0 5px", fontSize: "1rem" },
  location: { color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 10px" },
  price: { color: "#fbbf24", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 10px" },
  specs: { display: "flex", gap: "10px", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "15px" },
  boostBtn: { width: "100%", padding: "10px", background: "#eab308", color: "#000", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", marginBottom: "10px" },
  bookingControls: { display: "flex", gap: "10px" },
  bookedBtn: { flex: 1, padding: "8px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", fontSize: "0.8rem" },
  availableBtn: { flex: 1, padding: "8px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", fontSize: "0.8rem" },
};

const cssStyles = `
  button:hover { opacity: 0.9; transform: translateY(-1px); }
  @media (max-width: 600px) {
    [style*="header"] { flex-direction: column; text-align: center; }
  }
`;