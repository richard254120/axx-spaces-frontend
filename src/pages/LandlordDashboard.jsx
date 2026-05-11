import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function LandlordDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // New state to track auth check
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // 1. Check if token exists
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. Wait for user object to be populated by AuthContext
    if (user) {
      if (user.role !== "landlord") {
        console.error("Access Denied: User role is", user.role);
        navigate(user.role === "mover" ? "/mover-dashboard" : "/");
      } else {
        setAuthLoading(false); // Auth is confirmed, stop showing global loader
        fetchMyProperties();
      }
    } else {
      // Still waiting for 'user' data from AuthContext (e.g., from /me endpoint)
      // Give it a small timeout before deciding they are logged out
      const timeout = setTimeout(() => {
        if (!user) setAuthLoading(false); 
      }, 2000);
      return () => clearTimeout(timeout);
    }
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
      console.error("Fetch Error:", err);
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

      if (!response.ok) throw new Error("Failed to update units");

      fetchMyProperties();
      setSuccessMessage(change > 0 ? "✅ 1 Unit Booked" : "✅ 1 Unit Freed");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBoost = (propertyId) => {
    navigate(`/premium-plans?propertyId=${propertyId}`);
  };

  // --- Logic Helpers ---
  const counts = {
    all: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    booked: properties.filter((p) => (p.bookedUnits || 0) > 0).length,
    rejected: properties.filter((p) => p.status === "rejected").length,
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

  // 🛡️ LOADING SHIELD: Prevents the page from flashing "No Properties" while checking Auth
  if (authLoading && !user) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <h2 style={{color: '#60a5fa'}}>Verifying Landlord Credentials...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* Profile Section */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>👤</div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{user?.name || "Landlord"}</h2>
            <p style={styles.profileEmail}>{user?.email}</p>
            <span style={styles.roleBadge}>LANDLORD ACCOUNT</span>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.all}</div>
            <div style={styles.statLabel}>Properties</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.approved}</div>
            <div style={styles.statLabel}>Live</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{counts.booked}</div>
            <div style={styles.statLabel}>Occupied</div>
          </div>
        </div>
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>🏠 My Properties</h1>
        <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>
          ➕ Post New Property
        </button>
      </div>

      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {["all", "pending", "approved", "booked", "rejected"].map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tabBtn, ...(activeTab === tab && styles.tabBtnActive) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()} ({counts[tab] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loading}>⏳ Loading your property data...</p>
      ) : filteredProperties.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't listed any {activeTab === "all" ? "" : activeTab} properties yet.</p>
          <button onClick={() => navigate("/upload")} style={styles.uploadBtnTop}>Start Listing</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProperties.map((property) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            return (
              <div key={property._id} style={styles.card}>
                <div style={styles.imageContainer}>
                  <img src={property.images?.[0] || "/placeholder.jpg"} alt={property.title} style={styles.image} />
                  <div style={{ ...styles.statusBadge, backgroundColor: status.bg }}>{status.label}</div>
                </div>
                <div style={styles.content}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <p style={styles.location}>📍 {property.location}</p>
                  <p style={styles.price}>KSh {Number(property.price).toLocaleString()}</p>
                  
                  {property.status === "approved" && (
                    <div style={styles.actionRow}>
                       <button onClick={() => updateBookedUnits(property._id, 1)} style={styles.bookedBtn}>Mark Booked</button>
                       <button onClick={() => handleBoost(property._id)} style={styles.boostBtn}>⭐ Boost</button>
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

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "#06101f", minHeight: "100vh", color: "#fff" },
  profileCard: { background: "#1e2937", borderRadius: "16px", padding: "24px", marginBottom: "30px", border: "1px solid #334155" },
  profileHeader: { display: "flex", alignItems: "center", gap: "20px" },
  avatar: { fontSize: "40px", background: "#334155", padding: "10px", borderRadius: "50%" },
  profileInfo: { flex: 1 },
  profileName: { margin: 0, color: "#60a5fa" },
  profileEmail: { color: "#94a3b8", margin: "5px 0" },
  roleBadge: { fontSize: "10px", background: "#fbbf24", color: "#000", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" },
  logoutBtn: { background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  statsGrid: { display: "flex", gap: "20px", marginTop: "20px" },
  statBox: { flex: 1, background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", textAlign: "center" },
  statNumber: { fontSize: "1.5rem", fontWeight: "bold", color: "#fbbf24" },
  statLabel: { fontSize: "0.8rem", color: "#94a3b8" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { color: "#fbbf24", margin: 0 },
  uploadBtnTop: { background: "#3b82f6", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  tabsContainer: { display: "flex", gap: "15px", borderBottom: "1px solid #1e293b", marginBottom: "20px" },
  tabBtn: { background: "none", border: "none", color: "#94a3b8", padding: "10px", cursor: "pointer" },
  tabBtnActive: { color: "#fbbf24", borderBottom: "2px solid #fbbf24" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" },
  card: { background: "#0f172a", borderRadius: "15px", overflow: "hidden", border: "1px solid #1e293b" },
  imageContainer: { height: "200px", position: "relative" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  statusBadge: { position: "absolute", top: "10px", right: "10px", padding: "5px 12px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "bold" },
  content: { padding: "20px" },
  propertyTitle: { margin: "0 0 10px", fontSize: "1.1rem" },
  location: { color: "#94a3b8", fontSize: "0.9rem" },
  price: { color: "#fbbf24", fontSize: "1.2rem", fontWeight: "bold", margin: "10px 0" },
  actionRow: { display: "flex", gap: "10px", marginTop: "15px" },
  bookedBtn: { flex: 1, background: "#f59e0b", border: "none", color: "#fff", padding: "8px", borderRadius: "5px" },
  boostBtn: { flex: 1, background: "#fbbf24", border: "none", color: "#000", padding: "8px", borderRadius: "5px", fontWeight: "bold" },
  successMsg: { background: "#065f46", color: "#fff", padding: "10px", borderRadius: "8px", marginBottom: "20px" },
  errorMsg: { background: "#991b1b", color: "#fff", padding: "10px", borderRadius: "8px", marginBottom: "20px" },
};

const cssStyles = `
  button:hover { opacity: 0.8; transform: scale(0.98); transition: 0.2s; }
`;