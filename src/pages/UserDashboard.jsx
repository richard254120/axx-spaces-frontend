import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  dashboard: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #60a5fa",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#60a5fa",
  },
  welcome: {
    fontSize: "18px",
    color: "#cbd5e1",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    padding: "25px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  section: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #60a5fa",
  },
  businessCard: {
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "15px",
  },
  businessName: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "10px",
  },
  businessStatus: {
    display: "inline-block",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  statusPending: {
    background: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
    border: "1px solid #fbbf24",
  },
  statusApproved: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    border: "1px solid #22c55e",
  },
  statusRejected: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    border: "1px solid #ef4444",
  },
  businessDescription: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "15px",
  },
  button: {
    padding: "10px 20px",
    background: "#60a5fa",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.3s",
    marginRight: "10px",
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
  },
  buttonDanger: {
    background: "#ef4444",
    color: "white",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "16px",
    color: "#94a3b8",
  },
};

export default function UserDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!token) {
      navigate("/business-login");
      return;
    }
    loadBusinesses();
  }, [token, navigate]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/business/my");
      setBusinesses(res.data.businesses || []);

      // Calculate stats
      const allBusinesses = res.data.businesses || [];
      setStats({
        total: allBusinesses.length,
        pending: allBusinesses.filter(b => b.status === "pending").length,
        approved: allBusinesses.filter(b => b.status === "approved").length,
        rejected: allBusinesses.filter(b => b.status === "rejected").length,
      });
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = (businessId) => {
    navigate(`/business/edit/${businessId}`);
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm("Are you sure you want to delete this business?")) return;

    try {
      await API.delete(`/business/${businessId}`);
      setBusinesses(prev => prev.filter(b => b._id !== businessId));
      loadBusinesses();
      alert("✅ Business deleted successfully");
    } catch (err) {
      alert("❌ Failed to delete business");
    }
  };

  const handleCreateBusiness = () => {
    navigate("/business/create");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Business Dashboard</h1>
            <p style={styles.welcome}>Welcome, {user?.name || user?.email || "User"}!</p>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={() => navigate("/settings")}
          >
            ⚙️ Settings
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={() => logout("/login")}
          >
            Logout
          </button>
        </div>

        {/* Stats Section */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Businesses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending Review</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.approved}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.rejected}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>

        {/* My Businesses Section */}
        <div style={styles.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={styles.sectionTitle}>My Businesses</h2>
            <button style={styles.button} onClick={handleCreateBusiness}>
              + Add Your Business
            </button>
          </div>

          {businesses.length === 0 ? (
            <div style={styles.empty}>
              <p>You haven't submitted any businesses yet.</p>
              <button style={styles.button} onClick={handleCreateBusiness}>
                Add Your First Business
              </button>
            </div>
          ) : (
            businesses.map((business) => (
              <div key={business._id} style={styles.businessCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.businessName}>{business.name}</h3>
                    <span style={{ ...styles.businessStatus, ...getStatusStyle(business.status) }}>
                      {business.status?.toUpperCase() || "PENDING"}
                    </span>
                    <p style={styles.businessDescription}>
                      {business.description?.substring(0, 150)}...
                    </p>
                    <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "10px" }}>
                      📍 {business.location?.town}, {business.location?.county}
                    </div>
                    <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "10px" }}>
                      📂 {business.categories?.join(", ")}
                    </div>
                    <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                      📷 {business.images?.length || 0} photo(s)
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      style={styles.button}
                      onClick={() => handleEditBusiness(business._id)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.buttonDanger }}
                      onClick={() => handleDeleteBusiness(business._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
