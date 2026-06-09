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

  // ADDED: payments tab state
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  // END ADDED

  // ADDED: businesses tab state
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  // END ADDED

  // ADDED: announcements tab state
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  // END ADDED

  // ADDED: users tab state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  // END ADDED

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

  // ADDED: load pending payments when tab is selected
  useEffect(() => {
    if (activeTab === "payments") {
      loadPendingPayments();
    }
  }, [activeTab]);

  // ADDED: load pending announcements when tab is selected
  useEffect(() => {
    if (activeTab === "announcements") {
      loadPendingAnnouncements();
    }
  }, [activeTab]);

  // ADDED: load pending businesses when tab is selected
  useEffect(() => {
    if (activeTab === "businesses") {
      loadPendingBusinesses();
    }
  }, [activeTab]);

  // ADDED: load users when tab is selected
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
    if (activeTab === "users") {
      console.log("Loading users...");
      loadUsers();
    }
  }, [activeTab]);

  const loadPendingPayments = async () => {
    setPaymentsLoading(true);
    try {
      console.log("Loading pending payments...");
      const res = await API.get("/payment/pending-bank-payments");
      console.log("Pending payments response:", res.data);
      setPendingPayments(res.data.pendingPayments || []);
    } catch (err) {
      console.error("Failed to load pending payments:", err);
      console.error("Error response:", err.response);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleVerifyPayment = async (payment, approve) => {
    setVerifyingId(payment.transactionRef);
    try {
      await API.post("/payment/verify-bank-payment", {
        transactionRef: payment.transactionRef,
        userId: payment.userId,
        approve,
      });
      setPendingPayments((prev) =>
        prev.filter((p) => p.transactionRef !== payment.transactionRef)
      );
    } catch (err) {
      alert("❌ Failed to process payment verification.");
    } finally {
      setVerifyingId(null);
    }
  };
  // END ADDED

  // ADDED: load pending businesses function
  const loadPendingBusinesses = async () => {
    setBusinessesLoading(true);
    try {
      console.log("Loading pending businesses...");
      const res = await API.get("/business/admin/pending");
      console.log("Pending businesses response:", res.data);
      setPendingBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error("Failed to load pending businesses:", err);
      console.error("Error response:", err.response);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleBusinessStatus = async (businessId, status) => {
    try {
      await API.patch(`/business/admin/${businessId}/status`, { status });
      setPendingBusinesses((prev) =>
        prev.filter((b) => b._id !== businessId)
      );
      alert(`✅ Business ${status} successfully`);
    } catch (err) {
      alert("❌ Failed to update business status");
    }
  };

  const handleAddBadge = async (businessId, badgeType) => {
    try {
      await API.post(`/business/admin/${businessId}/verify`, { badgeType });
      loadPendingBusinesses();
      alert("✅ Verification badge added successfully");
    } catch (err) {
      alert("❌ Failed to add verification badge");
    }
  };

  // ADDED: load pending announcements function
  const loadPendingAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      console.log("Loading pending announcements...");
      const res = await API.get("/business/admin/announcements");
      console.log("Pending announcements response:", res.data);
      setPendingAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load pending announcements:", err);
      console.error("Error response:", err.response);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleAnnouncementStatus = async (businessId, announcementIndex, status, announcement) => {
    try {
      await API.patch(`/business/admin/announcements/${businessId}/${announcementIndex}`, {
        status,
        title: announcement.title,
        createdAt: announcement.createdAt,
      });
      loadPendingAnnouncements();
      alert(`✅ Announcement ${status} successfully`);
    } catch (err) {
      alert("❌ Failed to update announcement status");
    }
  };
  // END ADDED
  // END ADDED

  // ADDED: load users function
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      console.log("Loading users...");
      const res = await API.get("/admin/users");
      console.log("Users response:", res.data);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      console.error("Error response:", err.response);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also delete all their properties, materials, and tourism listings.")) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert("✅ User deleted successfully");
    } catch (err) {
      alert("❌ Failed to delete user");
    }
  };
  // END ADDED

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
        {/* ADDED: Payments tab button */}
        <button
          style={{ ...styles.tab, ...(activeTab === "payments" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("payments")}
        >
          💰 Payments {pendingPayments.length > 0 ? `(${pendingPayments.length})` : ""}
        </button>
        {/* END ADDED */}
        {/* ADDED: Businesses tab button */}
        <button
          style={{ ...styles.tab, ...(activeTab === "businesses" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("businesses")}
        >
          🏪 Businesses {pendingBusinesses.length > 0 ? `(${pendingBusinesses.length})` : ""}
        </button>
        {/* ADDED: Announcements tab button */}
        <button
          style={{ ...styles.tab, ...(activeTab === "announcements" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("announcements")}
        >
          📢 Announcements {pendingAnnouncements.filter(a => a.status === "pending").length > 0 ? `(${pendingAnnouncements.filter(a => a.status === "pending").length})` : ""}
        </button>
        {/* END ADDED */}
        {/* ADDED: Users tab button */}
        <button
          style={{ ...styles.tab, ...(activeTab === "users" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("users")}
        >
          👥 Users {users.length > 0 ? `(${users.length})` : ""}
        </button>
        {/* END ADDED */}
        {/* Verification tab button */}
        <button
          style={{ ...styles.tab, ...(activeTab === "verification" ? styles.tabActive : {}) }}
          onClick={() => navigate("/admin/verification")}
        >
          ✓ Verification
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
      ) : activeTab === "payments" ? (
        // ADDED: Payments Tab
        paymentsLoading ? (
          <div style={styles.loader}>⏳ Loading pending payments...</div>
        ) : pendingPayments.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ No pending bank transfer payments.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Amount (KSh)</th>
                  <th style={styles.th}>Plan</th>
                  <th style={styles.th}>Transaction Code</th>
                  <th style={styles.th}>M-Pesa Message</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((p) => {
                  const codeMatch = (p.bankMessage || "").match(/([A-Z0-9]{10,12})\s+confirmed/i);
                  const txCode = codeMatch ? codeMatch[1] : p.transactionRef?.slice(0, 20) || "—";
                  return (
                    <tr key={p.transactionRef} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.propTitle}>{p.userName}</div>
                        <div style={styles.propLoc}>{p.userPhone}</div>
                        <div style={styles.propLoc}>{p.userEmail}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.priceBadge}>{Number(p.amount).toLocaleString()}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.roleBadge}>{p.plan || p.subscriptionType || "Boost"}</span>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.txCode}>{txCode}</code>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.smsPreview}>
                          {p.bankMessage
                            ? p.bankMessage.slice(0, 80) + (p.bankMessage.length > 80 ? "…" : "")
                            : <span style={{ color: "#475569" }}>No message</span>}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.propLoc}>
                          {p.date ? new Date(p.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button
                            disabled={verifyingId === p.transactionRef}
                            onClick={() => handleVerifyPayment(p, true)}
                            style={styles.approveBtn}
                          >
                            {verifyingId === p.transactionRef ? "..." : "✅ Approve"}
                          </button>
                          <button
                            disabled={verifyingId === p.transactionRef}
                            onClick={() => handleVerifyPayment(p, false)}
                            style={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
        // END ADDED
      ) : activeTab === "businesses" ? (
        // ADDED: Businesses Tab
        businessesLoading ? (
          <div style={styles.loader}>⏳ Loading pending businesses...</div>
        ) : pendingBusinesses.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ No pending businesses to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Business</th>
                  <th style={styles.th}>Logo</th>
                  <th style={styles.th}>Photos</th>
                  <th style={styles.th}>Categories</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Products</th>
                  <th style={styles.th}>Pricelist</th>
                  <th style={styles.th}>Badges</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBusinesses.map((business) => (
                  <tr key={business._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{business.name}</div>
                      <div style={styles.propLoc}>{business.description?.substring(0, 50)}...</div>
                    </td>
                    <td style={styles.td}>
                      {business.logo && (
                        <img src={business.logo} alt={business.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {business.images && business.images.length > 0 ? `${business.images.length} photos` : "None"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>{business.categories.join(", ")}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.propLoc}>{business.location.town}, {business.location.county}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{business.owner?.name}</div>
                      <div style={styles.propLoc}>{business.owner?.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {business.products && business.products.length > 0 ? `${business.products.length} products` : "None"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {business.pricelist && business.pricelist.url ? (
                        <a href={`/api/uploads/pricelist/${business.pricelist.publicId || business.pricelist.url.split('/').pop()}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none" }}>
                          📄 View
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>None</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.badges}>
                        {business.verificationBadges && business.verificationBadges.map((badge, index) => (
                          <span key={index} style={styles.badge}>
                            {badge.type}
                          </span>
                        ))}
                      </div>
                      <select
                        style={{ ...styles.select, fontSize: "12px", padding: "5px" }}
                        onChange={(e) => handleAddBadge(business._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Add Badge</option>
                        <option value="student_verified">🟢 Student</option>
                        <option value="identity_verified">🟢 Identity</option>
                        <option value="business_verified">🔵 Business</option>
                        <option value="online_verified">🔵 Online</option>
                        <option value="location_verified">🟣 Location</option>
                        <option value="premium_verified">⭐ Premium</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleBusinessStatus(business._id, "approved")}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBusinessStatus(business._id, "rejected")}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        // END ADDED
      ) : activeTab === "announcements" ? (
        // ADDED: Announcements Tab
        announcementsLoading ? (
          <div style={styles.loader}>⏳ Loading pending announcements...</div>
        ) : pendingAnnouncements.filter(a => a.status === "pending").length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ All caught up! No pending announcements to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Business</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Content</th>
                  <th style={styles.th}>Submitter</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAnnouncements.filter(a => a.status === "pending").map((announcement, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{announcement.businessName}</td>
                    <td style={styles.td}>{announcement.title}</td>
                    <td style={styles.td}>{announcement.content.substring(0, 100)}...</td>
                    <td style={styles.td}>{announcement.submitterName || "Anonymous"}</td>
                    <td style={styles.td}>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleAnnouncementStatus(announcement.businessId, index, "approved", announcement)}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAnnouncementStatus(announcement.businessId, index, "rejected", announcement)}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        // END ADDED
      ) : activeTab === "users" ? (
        // ADDED: Users Tab
        usersLoading ? (
          <div style={styles.loader}>⏳ Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>✅ No users found in the system.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>User Details</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{user.name}</div>
                      {user.profileImage && (
                        <img src={user.profileImage} alt={user.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginTop: "8px" }} />
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerContact}>{user.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerContact}>{user.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        background: user.role === "admin" ? "rgba(239, 68, 68, 0.2)" :
                          user.role === "landlord" ? "rgba(34, 197, 94, 0.2)" :
                            user.role === "mover" ? "rgba(14, 165, 233, 0.2)" :
                              user.role === "seller" ? "rgba(251, 191, 36, 0.2)" :
                                "rgba(148, 163, 184, 0.2)",
                        color: user.role === "admin" ? "#ef4444" :
                          user.role === "landlord" ? "#22c55e" :
                            user.role === "mover" ? "#0ea5e9" :
                              user.role === "seller" ? "#fbbf24" :
                                "#94a3b8",
                      }}>
                        {user.role?.toUpperCase() || "USER"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        background: user.status === "approved" ? "rgba(34, 197, 94, 0.2)" :
                          user.status === "rejected" ? "rgba(239, 68, 68, 0.2)" :
                            "rgba(251, 191, 36, 0.2)",
                        color: user.status === "approved" ? "#22c55e" :
                          user.status === "rejected" ? "#ef4444" :
                            "#fbbf24",
                      }}>
                        {user.status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.propLoc}>
                        {new Date(user.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={styles.rejectBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        // END ADDED
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
  // ADDED styles
  txCode: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace" },
  smsPreview: { fontSize: "12px", color: "#64748b", maxWidth: "220px", lineHeight: "1.5" },
  // END ADDED
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