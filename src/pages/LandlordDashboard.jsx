import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserProfileEditor } from "../features/profile";
import VerificationBadges from "../components/VerificationBadges";
import VerificationStatus from "../components/VerificationStatus";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BoostNotification from "../components/BoostNotification";

import { getDashboardPath, normalizeRole } from "../utils/dashboardRoutes";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function LandlordDashboard() {
  const { token, user, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user && normalizeRole(user.role) !== "landlord") {
      navigate(getDashboardPath(user.role));
      return;
    }
    if (user) {
      setAuthLoading(false);
      fetchMyProperties();
      fetchAgents();
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
      // Calculate availableUnits on the frontend too
      const processed = data.map(p => ({
        ...p,
        availableUnits: Math.max(0, (p.totalUnits || 1) - (p.bookedUnits || 0)),
      }));
      setProperties(processed);
      // Initialize selected agents with existing assignments
      const initialSelectedAgents = {};
      processed.forEach(p => {
        if (p.assignedAgent) {
          initialSelectedAgents[p._id] = p.assignedAgent;
        }
      });
      setSelectedAgents(initialSelectedAgents);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load your properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/properties/agents/all`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error("Fetch agents error:", err);
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
      setSuccessMessage(change > 0 ? "✅ 1 Unit Marked as Booked" : "✅ 1 Unit Freed Up");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBoost = (propertyId) => {
    navigate(`/premium-plans?propertyId=${propertyId}`);
  };

  const handleAssignAgent = async (propertyId, agentId) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${propertyId}/assign-agent`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId }),
      });
      if (!response.ok) throw new Error("Failed to assign agent");
      const data = await response.json();
      setSelectedAgents(prev => ({ ...prev, [propertyId]: agentId }));
      setSuccessMessage("✅ Agent assigned successfully");
      setTimeout(() => setSuccessMessage(""), 2500);
      fetchMyProperties();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
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

      {/* BOOST NOTIFICATION */}
      <BoostNotification user={user} userType="landlord" />

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
          <button style={styles.menuActionBtn} onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}>
            ⚙️ Settings
          </button>
          <button style={styles.logoutBtn} onClick={() => { logout("/login"); setMobileMenuOpen(false); }}>
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

      {/* VERIFICATION STATUS */}
      <div style={{ marginBottom: '20px' }}>
        <VerificationStatus />
      </div>

      {/* UPLOAD BUTTON */}
      <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
        ➕ Post New Property
      </button>

      {/* MESSAGES */}
      {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* TABS */}
      <div style={styles.tabsScroll}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "profile" && styles.tabBtnActive) }}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
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

      {activeTab === "profile" ? (
        <div style={styles.profileSection}>
          <VerificationBadges userId={user?._id || user?.id} userType="landlord" />
          <AnalyticsDashboard userType="landlord" userId={user?._id || user?.id} />
          <UserProfileEditor token={token} user={user} accentColor="#60a5fa" onUpdated={(u) => { if (u) login(token, u); }} />
        </div>
      ) : null}

      {/* PROPERTIES LIST */}
      {activeTab !== "profile" && loading ? (
        <p style={styles.loading}>⏳ Loading properties...</p>
      ) : activeTab !== "profile" && filteredProperties.length === 0 ? (
        <div style={styles.empty}>
          <p>No {activeTab === "all" ? "" : activeTab} properties yet.</p>
          <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
            Start Listing
          </button>
        </div>
      ) : activeTab !== "profile" ? (
        <div style={styles.propertiesList}>
          {filteredProperties.map((property) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            const booked = property.bookedUnits || 0;
            const total = property.totalUnits || 1;
            const available = property.availableUnits ?? Math.max(0, total - booked);
            const fullyBooked = booked >= total;

            return (
              <div key={property._id} style={styles.propertyCard}>
                {/* IMAGE */}
                <div style={styles.propertyImage}>
                  <img
                    src={property.images?.[0] || "/placeholder.jpg"}
                    alt={property.title}
                    style={styles.image}
                  />
                  <div style={{ ...styles.badge, backgroundColor: status.bg }}>
                    {status.label}
                  </div>
                  {/* Fully booked overlay badge */}
                  {fullyBooked && (
                    <div style={styles.fullyBookedBadge}>🔴 FULLY BOOKED</div>
                  )}
                </div>

                {/* DETAILS */}
                <div style={styles.propertyContent}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <p style={styles.propertyLocation}>📍 {property.location}</p>
                  <p style={styles.propertyPrice}>KSh {Number(property.price).toLocaleString()}/mo</p>

                  {/* UNITS DISPLAY */}
                  <div style={styles.unitsRow}>
                    <div style={styles.unitBox}>
                      <span style={styles.unitNum}>{total}</span>
                      <span style={styles.unitLbl}>Total</span>
                    </div>
                    <div style={styles.unitBox}>
                      <span style={{ ...styles.unitNum, color: "#ef4444" }}>{booked}</span>
                      <span style={styles.unitLbl}>Booked</span>
                    </div>
                    <div style={styles.unitBox}>
                      <span style={{ ...styles.unitNum, color: available > 0 ? "#22c55e" : "#ef4444" }}>
                        {available}
                      </span>
                      <span style={styles.unitLbl}>Available</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(100, (booked / total) * 100)}%`,
                        background: fullyBooked ? "#ef4444" : "#22c55e",
                      }}
                    />
                  </div>
                  <p style={styles.progressLabel}>
                    {fullyBooked
                      ? "🔴 All units booked — hidden from listings"
                      : `🟢 ${available} of ${total} units available to renters`}
                  </p>

                  {/* ACTIONS */}
                  {property.status === "approved" && (
                    <div style={styles.actions}>
                      {/* BOOK a unit */}
                      <button
                        onClick={() => updateBookedUnits(property._id, 1)}
                        disabled={fullyBooked}
                        style={{
                          ...styles.actionBtn,
                          background: fullyBooked ? "#1e293b" : "#22c55e",
                          color: fullyBooked ? "#475569" : "white",
                          cursor: fullyBooked ? "not-allowed" : "pointer",
                          opacity: fullyBooked ? 0.5 : 1,
                        }}
                      >
                        ✓ Mark Booked
                      </button>

                      {/* FREE a unit */}
                      <button
                        onClick={() => updateBookedUnits(property._id, -1)}
                        disabled={booked === 0}
                        style={{
                          ...styles.actionBtn,
                          background: booked === 0 ? "#1e293b" : "#ef4444",
                          color: booked === 0 ? "#475569" : "white",
                          cursor: booked === 0 ? "not-allowed" : "pointer",
                          opacity: booked === 0 ? 0.5 : 1,
                        }}
                      >
                        ✗ Mark Freed
                      </button>

                      {/* BOOST — full width */}
                      <button
                        onClick={() => handleBoost(property._id)}
                        style={{ ...styles.actionBtn, ...styles.boostActionBtn, gridColumn: "1 / -1" }}
                      >
                        ⭐ Boost Property
                      </button>

                      {/* ASSIGN AGENT — full width */}
                      <div style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                        <label style={{ ...styles.unitLbl, marginBottom: "4px" }}>Assign Agent:</label>
                        <select
                          value={selectedAgents[property._id] || ""}
                          onChange={(e) => handleAssignAgent(property._id, e.target.value)}
                          style={styles.agentSelect}
                        >
                          <option value="">No Agent Assigned</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} - {agent.phone}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  headerTitle: { margin: 0, fontSize: "28px", fontWeight: 800, color: "#fbbf24", letterSpacing: "-0.5px" },
  menuBtn: {
    background: "#1e293b", border: "none", color: "#fbbf24",
    fontSize: "24px", padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
  },
  mobileMenu: {
    background: "#1e293b", borderRadius: "12px", padding: "16px",
    marginBottom: "20px", border: "1px solid #334155",
  },
  menuItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: "12px", borderBottom: "1px solid #334155", marginBottom: "12px",
  },
  menuLabel: { color: "#94a3b8", fontSize: "13px", fontWeight: 600 },
  menuValue: { color: "#fbbf24", fontSize: "14px", fontWeight: 600 },
  menuActionBtn: {
    width: "100%", padding: "12px", background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "8px",
    color: "#fbbf24", fontSize: "14px", fontWeight: 600, cursor: "pointer",
    marginBottom: "12px", transition: "all 0.2s",
  },
  statsContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" },
  statCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px", padding: "24px", textAlign: "center",
    transition: "all 0.3s ease", cursor: "pointer",
  },
  statValue: { fontSize: "36px", fontWeight: 800, color: "#fbbf24", marginBottom: "8px", letterSpacing: "-1px" },
  statName: { fontSize: "13px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" },
  uploadBtn: {
    width: "100%", padding: "16px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white", border: "none", borderRadius: "14px",
    fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", transition: "all 0.3s ease",
  },
  successMsg: {
    background: "rgba(34, 197, 94, 0.2)", border: "1px solid #22c55e",
    color: "#86efac", padding: "12px", borderRadius: "8px",
    marginBottom: "16px", fontSize: "14px", fontWeight: 600,
  },
  errorMsg: {
    background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444",
    color: "#fca5a5", padding: "12px", borderRadius: "8px",
    marginBottom: "16px", fontSize: "14px", fontWeight: 600,
  },
  tabsScroll: {
    display: "flex", gap: "8px", overflowX: "auto",
    marginBottom: "20px", paddingBottom: "8px", scrollBehavior: "smooth",
  },
  tabBtn: {
    background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8",
    padding: "12px 16px", borderRadius: "10px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s ease",
  },
  tabBtnActive: { background: "#fbbf24", color: "#0f1729", border: "1px solid #fbbf24", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" },
  tabCount: { fontSize: "10px", display: "block" },
  propertiesList: { display: "flex", flexDirection: "column", gap: "16px" },
  propertyCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px", overflow: "hidden",
    transition: "all 0.3s ease", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  },
  propertyImage: { position: "relative", height: "180px", width: "100%" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  badge: {
    position: "absolute", top: "8px", right: "8px",
    padding: "4px 10px", borderRadius: "16px",
    fontSize: "11px", fontWeight: 700, color: "white",
  },
  fullyBookedBadge: {
    position: "absolute", bottom: "8px", left: "8px",
    background: "rgba(239,68,68,0.9)", color: "white",
    padding: "4px 10px", borderRadius: "8px",
    fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em",
  },
  propertyContent: { padding: "20px" },
  propertyTitle: { margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" },
  propertyLocation: { margin: "0 0 6px", fontSize: "14px", color: "#94a3b8" },
  propertyPrice: { margin: "8px 0 16px", fontSize: "20px", fontWeight: 800, color: "#fbbf24", letterSpacing: "-0.5px" },

  /* Units row */
  unitsRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px", marginBottom: "10px",
  },
  unitBox: {
    background: "rgba(255,255,255,0.05)", borderRadius: "10px",
    padding: "12px 6px", textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  unitNum: { display: "block", fontSize: "24px", fontWeight: 800, color: "#fbbf24", letterSpacing: "-1px" },
  unitLbl: { display: "block", fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },

  /* Progress bar */
  progressBar: {
    height: "6px", background: "#1e293b", borderRadius: "4px",
    overflow: "hidden", marginBottom: "6px", border: "1px solid #334155",
  },
  progressFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  progressLabel: { fontSize: "11px", color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.4 },

  actions: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "10px", marginTop: "12px",
  },
  actionBtn: {
    padding: "12px", background: "rgba(51, 65, 85, 0.8)", color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", fontSize: "13px",
    fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease",
  },
  boostActionBtn: { background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#0f1729", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" },
  agentSelect: {
    width: "100%", padding: "12px", background: "rgba(30, 41, 59, 0.8)",
    color: "#f1f5f9", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
  },
  logoutBtn: {
    width: "100%", padding: "12px", background: "#ef4444", color: "white",
    border: "none", borderRadius: "8px", fontSize: "14px",
    fontWeight: 700, cursor: "pointer", marginTop: "12px",
  },
  loading: { textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "40px 20px" },
  empty: {
    textAlign: "center", color: "#94a3b8", padding: "40px 20px",
    background: "#1e293b", borderRadius: "12px", border: "1px dashed #334155",
  },
  profileSection: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
  div[style*="overflowX: auto"] {
    scrollbar-width: thin;
    scrollbar-color: #334155 #1e293b;
  }
  div[style*="overflowX: auto"]::-webkit-scrollbar { height: 4px; }
  div[style*="overflowX: auto"]::-webkit-scrollbar-track { background: #1e293b; }
  div[style*="overflowX: auto"]::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
  .stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.15);
  }
  .property-card:hover {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.2);
  }
  .upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
`;