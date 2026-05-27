import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [allPending, setAllPending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [mpesaConfig, setMpesaConfig] = useState({
    mpesa_shortcode: "",
    mpesa_passkey: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState("");

  useEffect(() => {
    // Security check: ensure only admins can stay on this page
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    loadStats();
    loadAllPending();
    loadMpesaConfig();
  }, []);

  const loadMpesaConfig = async () => {
    try {
      const res = await API.get("/config");
      setMpesaConfig({
        mpesa_shortcode: res.data.mpesa_shortcode || "",
        mpesa_passkey: res.data.mpesa_passkey || "",
        mpesa_consumer_key: res.data.mpesa_consumer_key || "",
        mpesa_consumer_secret: res.data.mpesa_consumer_secret || "",
      });
    } catch (err) {
      console.error("Failed to load M-Pesa config:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const loadAllPending = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/pending");
      setAllPending(res.data);
    } catch (err) {
      console.error("Failed to load pending items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMpesaConfig = async () => {
    setConfigSaving(true);
    try {
      // Save each config value
      await Promise.all([
        API.post("/config", { key: "mpesa_shortcode", value: mpesaConfig.mpesa_shortcode, description: "M-Pesa Paybill/Shortcode" }),
        API.post("/config", { key: "mpesa_passkey", value: mpesaConfig.mpesa_passkey, description: "M-Pesa Passkey" }),
        API.post("/config", { key: "mpesa_consumer_key", value: mpesaConfig.mpesa_consumer_key, description: "M-Pesa Consumer Key" }),
        API.post("/config", { key: "mpesa_consumer_secret", value: mpesaConfig.mpesa_consumer_secret, description: "M-Pesa Consumer Secret" }),
      ]);
      setConfigMessage("✅ M-Pesa configuration saved successfully!");
      setTimeout(() => setConfigMessage(""), 3000);
    } catch (err) {
      setConfigMessage("❌ Failed to save configuration. Please try again.");
      setTimeout(() => setConfigMessage(""), 3000);
    } finally {
      setConfigSaving(false);
    }
  };

  const loadPending = async () => {
    try {
      setLoading(true);
      // Fetches properties where status is 'pending'
      const res = await API.get("/properties/admin/pending");
      setPending(res.data);
    } catch (err) {
      console.error("❌ Failed to load pending properties", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProviders = async () => {
    try {
      const res = await API.get("/users/pending-tourism-providers");
      setPendingProviders(res.data);
    } catch (err) {
      console.error("❌ Failed to load pending tourism providers", err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      // Using a single PATCH route is cleaner for state management
      await API.patch(`/properties/${id}/status`, { status });
      setPending((prev) => prev.filter((item) => item._id !== id));
      console.log(`✅ Property ${status} successfully`);
    } catch (err) {
      alert("❌ Operation failed. Please check permissions.");
    }
  };

  const handleProviderApproval = async (userId, approve) => {
    try {
      await API.patch(`/users/${userId}/approve-tourism-provider`, { approve });
      setPendingProviders((prev) => prev.filter((p) => p._id !== userId));
      console.log(`✅ Tourism provider ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      alert("❌ Operation failed. Please check permissions.");
    }
  };

  const handleAdminApprove = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/approve`);
      loadAllPending();
      loadStats();
      alert("✅ Approved successfully");
    } catch (err) {
      alert("❌ Failed to approve");
    }
  };

  const handleAdminReject = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/reject`);
      loadAllPending();
      loadStats();
      alert("✅ Rejected successfully");
    } catch (err) {
      alert("❌ Failed to reject");
    }
  };

  return (
    <div style={styles.container}>
      <style>{cssStyles}></style>

      <div style={styles.header}>
        <h1 style={styles.title}>🛡️ Admin Review Panel</h1>
        <p style={styles.subtitle}>Manage pending submissions for Axxspace</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>🏢 Properties</h3>
            <p style={styles.statValue}>{stats.properties.total}</p>
            <p style={styles.statPending}>{stats.properties.pending} pending</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>🛍️ Materials</h3>
            <p style={styles.statValue}>{stats.materials.total}</p>
            <p style={styles.statPending}>{stats.materials.pending} pending</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>🚛 Movers</h3>
            <p style={styles.statValue}>{stats.movers.total}</p>
            <p style={styles.statPending}>{stats.movers.pending} pending</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>🏨 Tourism</h3>
            <p style={styles.statValue}>{stats.tourism.total}</p>
            <p style={styles.statPending}>{stats.tourism.pending} pending</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>📋 Sellers</h3>
            <p style={styles.statValue}>{stats.sellers.total}</p>
            <p style={styles.statPending}>{stats.sellers.pending} pending</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === "properties" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("properties")}
        >
          🏠 Properties {allPending?.properties ? `(${allPending.properties.length})` : ""}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "materials" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("materials")}
        >
          🛍️ Materials {allPending?.materials ? `(${allPending.materials.length})` : ""}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "tourism" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("tourism")}
        >
          🏨 Tourism {allPending?.tourism ? `(${allPending.tourism.length})` : ""}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "movers" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("movers")}
        >
          🚛 Movers {allPending?.movers ? `(${allPending.movers.length})` : ""}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "sellers" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("sellers")}
        >
          📋 Sellers {allPending?.sellers ? `(${allPending.sellers.length})` : ""}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "payment" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("payment")}
        >
          💳 Payment Settings
        </button>
      </div>

      {loading ? (
        <div style={styles.loader}>⏳ Syncing with database...</div>
      ) : activeTab === "properties" ? (
        pending.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending properties to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Property Details</th>
                  <th style={styles.th}>Owner Info</th>
                  <th style={styles.th}>Price (KES)</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{item.title}</div>
                      <div style={styles.propLoc}>📍 {item.location || `${item.area}, ${item.county}`}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{item.owner?.name || "Member"}</div>
                      <div style={styles.ownerContact}>{item.owner?.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priceBadge}>{item.price.toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleStatusUpdate(item._id, "approved")}
                          style={styles.approveBtn}
                        >Approve</button>
                        <button
                          onClick={() => handleStatusUpdate(item._id, "rejected")}
                          style={styles.rejectBtn}
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "materials" ? (
        // Materials Tab
        !allPending?.materials || allPending.materials.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending materials to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Material Details</th>
                  <th style={styles.th}>Seller Info</th>
                  <th style={styles.th}>Price (KES)</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPending.materials.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{item.title}</div>
                      <div style={styles.propLoc}>📦 {item.category}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{item.seller?.name}</div>
                      <div style={styles.ownerContact}>{item.seller?.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priceBadge}>{item.price.toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleAdminApprove("materials", item._id)}
                          style={styles.approveBtn}
                        >Approve</button>
                        <button
                          onClick={() => handleAdminReject("materials", item._id)}
                          style={styles.rejectBtn}
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "tourism" ? (
        // Tourism Tab
        !allPending?.tourism || allPending.tourism.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending tourism listings to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Tourism Details</th>
                  <th style={styles.th}>Owner Info</th>
                  <th style={styles.th}>Price (KES)</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPending.tourism.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{item.name}</div>
                      <div style={styles.propLoc}>🏨 {item.category}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{item.owner?.name}</div>
                      <div style={styles.ownerContact}>{item.owner?.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priceBadge}>{item.price.toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleAdminApprove("tourism", item._id)}
                          style={styles.approveBtn}
                        >Approve</button>
                        <button
                          onClick={() => handleAdminReject("tourism", item._id)}
                          style={styles.rejectBtn}
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "movers" ? (
        // Movers Tab
        !allPending?.movers || allPending.movers.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending movers to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Mover Details</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Vehicle Type</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPending.movers.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{item.name}</div>
                      <div style={styles.propLoc}>📍 {item.county}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{item.email}</div>
                      <div style={styles.ownerContact}>{item.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>{item.vehicleType}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleAdminApprove("movers", item._id)}
                          style={styles.approveBtn}
                        >Approve</button>
                        <button
                          onClick={() => handleAdminReject("movers", item._id)}
                          style={styles.rejectBtn}
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "sellers" ? (
        // Sellers Tab
        !allPending?.sellers || allPending.sellers.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending seller verifications to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Business Details</th>
                  <th style={styles.th}>Seller Info</th>
                  <th style={styles.th}>Registration</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPending.sellers.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{item.businessName}</div>
                      <div style={styles.propLoc}>📋 Reg: {item.businessRegNumber}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{item.seller?.name}</div>
                      <div style={styles.ownerContact}>{item.seller?.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>KRA: {item.kraPin}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleAdminApprove("sellers", item._id)}
                          style={styles.approveBtn}
                        >Approve</button>
                        <button
                          onClick={() => handleAdminReject("sellers", item._id)}
                          style={styles.rejectBtn}
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "payment" ? (
        // Payment Settings Tab
        <div style={styles.configContainer}>
          <h2 style={styles.configTitle}>💳 M-Pesa Payment Configuration</h2>
          <p style={styles.configSubtitle}>Configure your M-Pesa credentials to enable payments for subscriptions, boosts, and property promotions.</p>
          
          {configMessage && (
            <div style={{
              ...styles.configMessage,
              background: configMessage.startsWith("✅") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444",
              borderColor: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444",
            }}>
              {configMessage}
            </div>
          )}

          <div style={styles.configForm}>
            <div style={styles.configField}>
              <label style={styles.configLabel}>Paybill/Shortcode Number</label>
              <input
                type="text"
                value={mpesaConfig.mpesa_shortcode}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, mpesa_shortcode: e.target.value })}
                placeholder="e.g., 174379"
                style={styles.configInput}
              />
              <p style={styles.configHint}>Your M-Pesa Paybill or Buy Goods Till Number</p>
            </div>

            <div style={styles.configField}>
              <label style={styles.configLabel}>Passkey</label>
              <input
                type="password"
                value={mpesaConfig.mpesa_passkey}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, mpesa_passkey: e.target.value })}
                placeholder="Enter your M-Pesa Passkey"
                style={styles.configInput}
              />
              <p style={styles.configHint}>The passkey from your M-Pesa dashboard</p>
            </div>

            <div style={styles.configField}>
              <label style={styles.configLabel}>Consumer Key</label>
              <input
                type="text"
                value={mpesaConfig.mpesa_consumer_key}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, mpesa_consumer_key: e.target.value })}
                placeholder="Enter Consumer Key"
                style={styles.configInput}
              />
              <p style={styles.configHint}>API Consumer Key from Safaricom Developer Portal</p>
            </div>

            <div style={styles.configField}>
              <label style={styles.configLabel}>Consumer Secret</label>
              <input
                type="password"
                value={mpesaConfig.mpesa_consumer_secret}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, mpesa_consumer_secret: e.target.value })}
                placeholder="Enter Consumer Secret"
                style={styles.configInput}
              />
              <p style={styles.configHint}>API Consumer Secret from Safaricom Developer Portal</p>
            </div>

            <button
              onClick={handleSaveMpesaConfig}
              disabled={configSaving}
              style={styles.saveConfigBtn}
            >
              {configSaving ? "Saving..." : "💾 Save Configuration"}
            </button>
          </div>

          <div style={styles.configInfo}>
            <h3 style={styles.configInfoTitle}>📋 Configuration Notes</h3>
            <ul style={styles.configInfoList}>
              <li>These credentials are required for M-Pesa STK Push payments</li>
              <li>Get your credentials from the <a href="https://developer.safaricom.co.ke/" target="_blank" style={styles.configLink}>Safaricom Developer Portal</a></li>
              <li>For production, use your live credentials instead of sandbox credentials</li>
              <li>Changes take effect immediately for all new payment requests</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ==================== STYLES (Midnight Blue & Gold Theme) ==================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)",
    padding: "50px 5%",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: { textAlign: "center", marginBottom: "50px" },
  title: { fontSize: "32px", fontWeight: 800, color: "#fbbf24", marginBottom: "10px" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "30px" },
  statCard: { background: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" },
  statTitle: { fontSize: "13px", color: "#94a3b8", margin: "0 0 8px 0" },
  statValue: { fontSize: "28px", fontWeight: 800, color: "#fbbf24", margin: "0 0 4px 0" },
  statPending: { fontSize: "12px", color: "#ef4444", margin: 0 },
  loader: { textAlign: "center", padding: "100px", color: "#fbbf24", fontSize: "18px" },
  emptyCard: { 
    background: "rgba(30, 41, 59, 0.4)", 
    padding: "60px", 
    borderRadius: "20px", 
    textAlign: "center", 
    border: "1px dashed rgba(251, 191, 36, 0.3)" 
  },
  emptyText: { color: "#94a3b8", fontSize: "18px" },
  tableContainer: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "rgba(251, 191, 36, 0.1)" },
  th: { padding: "18px", textAlign: "left", color: "#fbbf24", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "0.2s" },
  td: { padding: "18px", verticalAlign: "middle" },
  propTitle: { fontWeight: 700, fontSize: "16px", marginBottom: "4px" },
  propLoc: { fontSize: "13px", color: "#94a3b8" },
  ownerName: { fontWeight: 600, fontSize: "14px" },
  ownerContact: { fontSize: "12px", color: "#64748b" },
  priceBadge: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "6px 12px", borderRadius: "6px", fontWeight: 700 },
  btnGroup: { display: "flex", gap: "10px" },
  approveBtn: { 
    background: "#22c55e", color: "white", border: "none", 
    padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" 
  },
  rejectBtn: {
    background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444",
    padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer"
  },
  tabs: { display: "flex", gap: "10px", marginBottom: "30px", justifyContent: "center" },
  tab: {
    background: "rgba(30, 41, 59, 0.6)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s",
  },
  tabActive: {
    background: "#fbbf24",
    color: "#1f2937",
    borderColor: "#fbbf24",
  },
  roleBadge: { background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", padding: "6px 12px", borderRadius: "6px", fontWeight: 700 },
  configContainer: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.05)",
    maxWidth: "700px",
    margin: "0 auto",
  },
  configTitle: { fontSize: "24px", fontWeight: 800, color: "#fbbf24", marginBottom: "8px" },
  configSubtitle: { color: "#94a3b8", fontSize: "14px", marginBottom: "24px" },
  configForm: { display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" },
  configField: { display: "flex", flexDirection: "column", gap: "6px" },
  configLabel: { fontSize: "13px", fontWeight: 700, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.5px" },
  configInput: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(30, 41, 59, 0.6)",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
  },
  configHint: { fontSize: "12px", color: "#64748b", margin: 0 },
  saveConfigBtn: {
    padding: "14px 24px",
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.2s",
  },
  configMessage: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  configInfo: {
    background: "rgba(30, 41, 59, 0.4)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px dashed rgba(251, 191, 36, 0.3)",
  },
  configInfoTitle: { fontSize: "14px", fontWeight: 700, color: "#fbbf24", marginBottom: "12px" },
  configInfoList: { margin: 0, paddingLeft: "20px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.8" },
  configLink: { color: "#3b82f6", textDecoration: "none" },
};

const cssStyles = `
  tr:hover { background: rgba(255,255,255,0.02); }
  button:active { transform: scale(0.95); }
  button:hover { opacity: 0.9; }
`;