import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function LandlordDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user) {
      if (user.role !== "landlord") {
        console.error("Access Denied: User role is", user.role);
        navigate(user.role === "mover" ? "/mover-dashboard" : "/");
      } else {
        setAuthLoading(false);
        fetchMyProperties();
      }
    } else {
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
    pending: { bg: "#f59e0b", label: "⏳ Pending" },
    rejected: { bg: "#ef4444", label: "❌ Rejected" },
  };

  if (authLoading && !user) {
    return (
      <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ color: "#60a5fa" }}>Verifying Credentials...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Properties</h1>
        <button style={styles.menuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <div style={styles.menuItem}>
            <span style={styles.menuLabel}>Name:</span>
            <span style={styles.menuValue}>{user?.name || "Landlord"}</span>
          </div>
          <div style={styles.menuItem}>
            <span style={styles.menuLabel}>Email:</span>
            <span style={styles.menuValue}>{user?.email}</span>
          </div>
          <button style={styles.logoutBtn} onClick={() => { logout(); setMobileMenuOpen(false); }}>
            Logout
          </button>
        </div>
      )}

      {/* STATS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{counts.all}</div>
          <div style={styles.statName}>Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{counts.approved}</div>
          <div style={styles.statName}>Live</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{counts.booked}</div>
          <div style={styles.statName}>Occupied</div>
        </div>
      </div>

      {/* UPLOAD BUTTON */}
      <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
        ➕ Post New Property
      </button>

      {/* MESSAGES */}
      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* TABS - HORIZONTAL SCROLL */}
      <div style={styles.tabsScroll}>
        {["all", "pending", "approved", "booked", "rejected"].map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tabBtn, ...(activeTab === tab && styles.tabBtnActive) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <br />
            <span style={styles.tabCount}>({counts[tab] || 0})</span>
          </button>
        ))}
      </div>

      {/* PROPERTIES LIST */}
      {loading ? (
        <p style={styles.loading}>⏳ Loading properties...</p>
      ) : filteredProperties.length === 0 ? (
        <div style={styles.empty}>
          <p>No {activeTab === "all" ? "" : activeTab} properties yet.</p>
          <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
            Start Listing
          </button>
        </div>
      ) : (
        <div style={styles.propertiesList}>
          {filteredProperties.map((property) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            return (
              <div key={property._id} style={styles.propertyCard}>
                {/* IMAGE */}
                <div style={styles.propertyImage}>
                  <img src={property.images?.[0] || "/placeholder.jpg"} alt={property.title} style={styles.image} />
                  <div style={{ ...styles.badge, backgroundColor: status.bg }}>
                    {status.label}
                  </div>
                </div>

                {/* DETAILS */}
                <div style={styles.propertyContent}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <p style={styles.propertyLocation}>📍 {property.location}</p>
                  <p style={styles.propertyPrice}>KSh {Number(property.price).toLocaleString()}</p>
                  
                  {/* UNITS INFO */}
                  {property.totalUnits && (
                    <p style={styles.unitsInfo}>
                      {property.bookedUnits || 0}/{property.totalUnits} Booked
                    </p>
                  )}

                  {/* ACTIONS */}
                  {property.status === "approved" && (
                    <div style={styles.actions}>
                      <button
                        onClick={() => updateBookedUnits(property._id, 1)}
                        style={styles.actionBtn}
                      >
                        ✓ Book
                      </button>
                      <button
                        onClick={() => handleBoost(property._id)}
                        style={{ ...styles.actionBtn, ...styles.boostActionBtn }}
                      >
                        ⭐ Boost
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

const styles = {
  container: {
    background: "#06101f",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    padding: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #1e293b",
  },

  headerTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#fbbf24",
  },

  menuBtn: {
    background: "#1e293b",
    border: "none",
    color: "#fbbf24",
    fontSize: "24px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  mobileMenu: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid #334155",
  },

  menuItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #334155",
    marginBottom: "12px",
  },

  menuLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 600,
  },

  menuValue: {
    color: "#fbbf24",
    fontSize: "14px",
    fontWeight: 600,
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
  },

  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "4px",
  },

  statName: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 600,
  },

  uploadBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "20px",
  },

  successMsg: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#86efac",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },

  errorMsg: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },

  tabsScroll: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    marginBottom: "20px",
    paddingBottom: "8px",
    scrollBehavior: "smooth",
  },

  tabBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },

  tabBtnActive: {
    background: "#fbbf24",
    color: "#0f1729",
    border: "1px solid #fbbf24",
  },

  tabCount: {
    fontSize: "10px",
    display: "block",
  },

  propertiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  propertyCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    overflow: "hidden",
  },

  propertyImage: {
    position: "relative",
    height: "180px",
    width: "100%",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  badge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "white",
  },

  propertyContent: {
    padding: "16px",
  },

  propertyTitle: {
    margin: "0 0 8px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
  },

  propertyLocation: {
    margin: "0 0 4px",
    fontSize: "13px",
    color: "#94a3b8",
  },

  propertyPrice: {
    margin: "8px 0",
    fontSize: "16px",
    fontWeight: 800,
    color: "#fbbf24",
  },

  unitsInfo: {
    margin: "8px 0",
    fontSize: "12px",
    color: "#cbd5e1",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "6px 10px",
    borderRadius: "6px",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "12px",
  },

  actionBtn: {
    padding: "10px",
    background: "#334155",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  boostActionBtn: {
    background: "#fbbf24",
    color: "#0f1729",
  },

  logoutBtn: {
    width: "100%",
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "12px",
  },

  loading: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "40px 20px",
  },

  empty: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "40px 20px",
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px dashed #334155",
  },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }

  /* Hide scrollbar but keep scrolling */
  div[style*="overflowX: auto"] {
    scrollbar-width: thin;
    scrollbar-color: #334155 #1e293b;
  }

  div[style*="overflowX: auto"]::-webkit-scrollbar {
    height: 4px;
  }

  div[style*="overflowX: auto"]::-webkit-scrollbar-track {
    background: #1e293b;
  }

  div[style*="overflowX: auto"]::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 2px;
  }

  @media (max-width: 480px) {
    [style*="fontSize: 24px"][style*="fontWeight: 800"] {
      font-size: 20px !important;
    }

    [style*="padding: 16px"] {
      padding: 12px !important;
    }

    [style*="gap: 12px"] {
      gap: 10px !important;
    }
  }
`;