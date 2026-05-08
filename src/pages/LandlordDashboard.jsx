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
    // ... your existing function (unchanged) ...
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

      {/* ==================== WALLET BALANCE ==================== */}
      <div style={styles.walletBar}>
        <div style={styles.walletText}>
          💰 Wallet Balance: <strong>KSh {(user?.walletBalance || 0).toLocaleString()}</strong>
        </div>
        <button onClick={() => navigate("/premium-plans")} style={styles.topUpBtn}>
          Top Up Wallet
        </button>
      </div>

      {/* Profile Card - Your Original */}
      <div style={styles.profileCard}>
        {/* ... your existing profile card code ... */}
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

      {/* Tabs - Your Original */}
      <div style={styles.tabsContainer}>
        {/* ... your existing tabs ... */}
      </div>

      {/* Properties Grid */}
      {!loading && filteredProperties.length > 0 && (
        <div style={styles.grid}>
          {filteredProperties.map((property) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            const isBoosted = property.isFeatured && new Date(property.promotionEndDate) > new Date();

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

                  {isBoosted && (
                    <div style={styles.boostedBadge}>⭐ BOOSTED</div>
                  )}
                </div>

                <div style={styles.content}>
                  <h3 style={styles.propertyTitle}>
                    {property.title} {isBoosted && "⭐"}
                  </h3>
                  <p style={styles.location}>📍 {property.county} • {property.location}</p>
                  <p style={styles.price}>KSh {Number(property.price).toLocaleString()} / month</p>

                  <div style={styles.specs}>
                    <span>🛏 {property.bedrooms} Beds</span>
                    <span>🚿 {property.bathrooms} Baths</span>
                  </div>

                  {property.status === "approved" && (
                    <button 
                      onClick={() => handleBoost(property._id)}
                      style={styles.boostBtn}
                    >
                      ⭐ Boost This Listing
                    </button>
                  )}

                  {/* Your existing booking buttons remain here */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== BOOST HISTORY ==================== */}
      <div style={styles.historySection}>
        <h2>💳 Recent Boost History</h2>
        {user?.paymentHistory?.length > 0 ? (
          <div style={styles.historyList}>
            {user.paymentHistory.slice(0, 5).map((payment, index) => (
              <div key={index} style={styles.historyItem}>
                <span>⭐ {payment.plan?.toUpperCase()} Plan</span>
                <span>KSh {payment.amount}</span>
                <span style={{ color: payment.status === "success" ? "#22c55e" : "#f59e0b" }}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No boost history yet.</p>
        )}
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  // ... Keep all your original styles here ...

  walletBar: {
    background: "#1e293b",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    border: "1px solid #334155"
  },
  walletText: { fontSize: "1.1rem", fontWeight: "600" },
  topUpBtn: {
    padding: "8px 18px",
    background: "#eab308",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  },
  boostedBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#eab308",
    color: "#000",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700"
  },
  boostBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #eab308, #ca8a04)",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },
  historySection: {
    marginTop: "50px",
    background: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #334155"
  },
  historyList: { display: "flex", flexDirection: "column", gap: "10px" },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#0f1729",
    padding: "12px",
    borderRadius: "8px"
  }
};
const cssStyles = `
  button:hover:not(:disabled) { transform: translateY(-2px); }
  .card:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }
`;