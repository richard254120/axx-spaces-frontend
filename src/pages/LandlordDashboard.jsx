import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserProfileEditor } from "../features/profile";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

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
    if (user) {
      if (user.role !== "landlord") {
        navigate(user.role === "mover" ? "/mover-dashboard" : "/");
      } else {
        setAuthLoading(false);
        fetchMyProperties();
        fetchAgents();
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
        <UserProfileEditor token={token} user={user} accentColor="#60a5fa" onUpdated={(u) => { if (u) login(token, u); }} />
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
  headerTitle: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#fbbf24" },
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
  statsContainer: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" },
  statCard: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: "12px", padding: "16px", textAlign: "center",
  },
  statValue: { fontSize: "24px", fontWeight: 800, color: "#fbbf24", marginBottom: "4px" },
  statName: { fontSize: "12px", color: "#94a3b8", fontWeight: 600 },
  uploadBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "20px",
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
    background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
    padding: "10px 12px", borderRadius: "8px", fontSize: "11px",
    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
  },
  tabBtnActive: { background: "#fbbf24", color: "#0f1729", border: "1px solid #fbbf24" },
  tabCount: { fontSize: "10px", display: "block" },
  propertiesList: { display: "flex", flexDirection: "column", gap: "16px" },
  propertyCard: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: "12px", overflow: "hidden",
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
  propertyContent: { padding: "16px" },
  propertyTitle: { margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#f1f5f9" },
  propertyLocation: { margin: "0 0 4px", fontSize: "13px", color: "#94a3b8" },
  propertyPrice: { margin: "6px 0 12px", fontSize: "16px", fontWeight: 800, color: "#fbbf24" },

  /* Units row */
  unitsRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px", marginBottom: "10px",
  },
  unitBox: {
    background: "rgba(255,255,255,0.04)", borderRadius: "8px",
    padding: "8px 4px", textAlign: "center",
    border: "1px solid #334155",
  },
  unitNum: { display: "block", fontSize: "20px", fontWeight: 800, color: "#fbbf24" },
  unitLbl: { display: "block", fontSize: "10px", color: "#64748b", marginTop: "2px", fontWeight: 600 },

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
    padding: "10px", background: "#334155", color: "#f1f5f9",
    border: "none", borderRadius: "8px", fontSize: "12px",
    fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
  },
  boostActionBtn: { background: "#fbbf24", color: "#0f1729" },
  agentSelect: {
    width: "100%", padding: "10px", background: "#1e293b",
    color: "#f1f5f9", border: "1px solid #334155", borderRadius: "8px",
    fontSize: "12px", fontWeight: 600, cursor: "pointer",
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
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
  div[style*="overflowX: auto"] {
    scrollbar-width: thin;
    scrollbar-color: #334155 #1e293b;
  }
  div[style*="overflowX: auto"]::-webkit-scrollbar { height: 4px; }
  div[style*="overflowX: auto"]::-webkit-scrollbar-track { background: #1e293b; }
  div[style*="overflowX: auto"]::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
`;