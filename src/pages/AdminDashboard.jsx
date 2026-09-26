import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { getPricelistUrl } from "../utils/fileLinks";
import QRGeneratorModal from "../components/QRGeneratorModal";

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("pending");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPropertyForQR, setSelectedPropertyForQR] = useState(null);
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

  // ADDED: requests tab state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // ADDED: accommodations tab state
  const [pendingAccommodations, setPendingAccommodations] = useState([]);
  const [accommodationsLoading, setAccommodationsLoading] = useState(false);
  const [accommodationFilter, setAccommodationFilter] = useState("pending");
  // END ADDED

  // ADDED: agents tab state
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentStatusFilter, setAgentStatusFilter] = useState("");
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
    loadRequests();
  }, []);

  const handleRefreshAll = () => {
    loadStats();
    loadAllPending();
    fetchProperties();
    loadAccommodations();
    loadPendingBusinesses();
    loadPendingAnnouncements();
    loadUsers();
    loadRequests();
    loadPendingPayments();
    loadAgents();
  };

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

  // ADDED: load requests when tab is selected
  useEffect(() => {
    if (activeTab === "requests") {
      loadRequests();
    }
  }, [activeTab]);

  // ADDED: load accommodations when tab or filter changes
  useEffect(() => {
    if (activeTab === "accommodations") {
      loadAccommodations();
    }
  }, [activeTab, accommodationFilter]);

  // ADDED: load agents when tab is selected
  useEffect(() => {
    if (activeTab === "agents") {
      loadAgents(agentStatusFilter);
    }
  }, [activeTab, agentStatusFilter]);

  // ADDED: load properties when tab or filter changes
  useEffect(() => {
    if (activeTab === "properties") {
      fetchProperties();
    }
  }, [activeTab, propertyFilter]);

  const fetchProperties = async () => {
    setPropertiesLoading(true);
    try {
      let res;
      if (propertyFilter === "pending") {
        res = await API.get("/admin/all", { params: { type: "properties", status: "pending" } });
      } else if (propertyFilter === "approved") {
        res = await API.get("/admin/all", { params: { type: "properties", status: "approved" } });
      } else {
        res = await API.get("/admin/all", { params: { type: "properties" } });
      }
      setPropertiesList(res.data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  // ADDED: load accommodations function
  const loadAccommodations = async () => {
    setAccommodationsLoading(true);
    try {
      const params = {};
      if (accommodationFilter === "pending") {
        params.status = "pending_review";
      } else if (accommodationFilter === "active") {
        params.status = "active";
      } else if (accommodationFilter === "inactive") {
        params.status = "inactive";
      }

      const res = await API.get("/accommodations", { params });
      setPendingAccommodations(res.data || []);
    } catch (err) {
      console.error("Failed to load accommodations:", err);
    } finally {
      setAccommodationsLoading(false);
    }
  };

  const handleAccommodationStatus = async (accommodationId, status) => {
    try {
      await API.patch(`/accommodations/${accommodationId}/status`, { status });
      loadAccommodations();
      loadStats();
      alert(`Accommodation ${status} successfully`);
    } catch (err) {
      alert("Failed to update accommodation status");
    }
  };
  // END ADDED

  // ADDED: load agents function
  const loadAgents = async (statusFilter = null) => {
    setAgentsLoading(true);
    try {
      const params = statusFilter ? { verificationStatus: statusFilter } : {};
      const res = await API.get("/agents", { params });
      setAgents(res.data || []);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleVerifyAgent = async (agentId) => {
    try {
      await API.put(`/agents/${agentId}/verify`);
      loadAgents();
      alert("Agent verified successfully");
    } catch (err) {
      alert("Failed to verify agent");
    }
  };

  const handleRejectAgent = async (agentId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await API.put(`/agents/${agentId}/reject`, { reason });
      loadAgents();
      alert("Agent rejected successfully");
    } catch (err) {
      alert("Failed to reject agent");
    }
  };

  const handleAssignAgent = async (accommodationId, agentId) => {
    try {
      await API.put(`/agents/assign/${accommodationId}`, { agentId });
      loadAccommodations();
      alert("Agent assigned successfully");
    } catch (err) {
      alert("Failed to assign agent");
    }
  };
  // END ADDED

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
      alert(" Failed to process payment verification.");
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
      alert(` Business ${status} successfully`);
    } catch (err) {
      alert(" Failed to update business status");
    }
  };

  const handleAddBadge = async (businessId, badgeType) => {
    try {
      await API.post(`/business/admin/${businessId}/verify`, { badgeType });
      loadPendingBusinesses();
      alert(" Verification badge added successfully");
    } catch (err) {
      alert(" Failed to add verification badge");
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
      alert(` Announcement ${status} successfully`);
    } catch (err) {
      alert(" Failed to update announcement status");
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
    if (!window.confirm("Are you sure you want to delete this user? This will also delete all their properties, materials, and accommodation listings.")) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert(" User deleted successfully");
    } catch (err) {
      alert(" Failed to delete user");
    }
  };
  // END ADDED

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      console.log("Loading user requests...");
      const res = await API.get("/item-requests/admin");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      await API.patch(`/item-requests/admin/${requestId}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
      alert(` Request status updated to ${status}`);
    } catch (err) {
      alert(" Failed to update request status");
    }
  };

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
      setConfigMessage(" M-Pesa configuration saved successfully!");
      setTimeout(() => setConfigMessage(""), 3000);
    } catch (err) {
      setConfigMessage(" Failed to save configuration. Please try again.");
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
      console.error(" Failed to load pending properties", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProviders = async () => {
    try {
      const res = await API.get("/users/pending-tourism-providers");
      setPendingProviders(res.data);
    } catch (err) {
      console.error(" Failed to load pending accommodation providers", err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      // Using a single PATCH route is cleaner for state management
      await API.patch(`/properties/${id}/status`, { status });
      fetchProperties();
      loadStats();
      console.log(` Property ${status} successfully`);
    } catch (err) {
      alert(" Operation failed. Please check permissions.");
    }
  };

  const handleProviderApproval = async (userId, approve) => {
    try {
      await API.patch(`/users/${userId}/approve-tourism-provider`, { approve });
      setPendingProviders((prev) => prev.filter((p) => p._id !== userId));
      console.log(` Accommodation provider ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      alert(" Operation failed. Please check permissions.");
    }
  };

  const handleAdminApprove = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/approve`);
      loadAllPending();
      loadStats();
      alert(" Approved successfully");
    } catch (err) {
      alert(" Failed to approve");
    }
  };

  const handleAdminReject = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/reject`);
      loadAllPending();
      loadStats();
      alert(" Rejected successfully");
    } catch (err) {
      alert(" Failed to reject");
    }
  };

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* ENTERPRISE TOP ADMIN BAR */}
      <div style={styles.topAdminBar}>
        <div style={styles.brandGroup}>
          <div style={styles.brandLogo}>AXX</div>
          <div>
            <div style={styles.brandTitleRow}>
              <h1 style={styles.brandTitle}>AxxSpace Command Center</h1>
              <span style={styles.liveBadge}>
                <span style={styles.pulsingDot}></span> Production Active
              </span>
            </div>
            <p style={styles.brandSubtitle}>Centralized Portal Operations, Moderation &amp; Gateway Management</p>
          </div>
        </div>

        <div style={styles.topRightControls}>
          <button onClick={handleRefreshAll} style={styles.refreshBtn} title="Sync database records">
            <span>🔄</span> Sync Data
          </button>
          <button onClick={() => navigate("/admin/verification")} style={styles.verificationBtn}>
            <span>🛡️</span> KYC Verification
          </button>
          <div style={styles.adminUserPill}>
            <span style={styles.userRoleBadge}>SUPERADMIN</span>
            <span style={styles.userEmail}>{user?.name || user?.email || "Admin"}</span>
          </div>
          <button onClick={() => navigate("/")} style={styles.exitBtn} title="View public site">
            <span>🌐</span> Site
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI OVERVIEW */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: "3px solid #f59e0b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.statTitle}>Rental Properties</span>
              <span style={{ fontSize: "20px" }}>🏢</span>
            </div>
            <p style={styles.statValue}>{stats.properties?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: (stats.properties?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.properties?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {stats.properties?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: "3px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.statTitle}>Accommodations</span>
              <span style={{ fontSize: "20px" }}>🏨</span>
            </div>
            <p style={{ ...styles.statValue, color: "#60a5fa" }}>{stats.tourism?.total || pendingAccommodations.length || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: (stats.tourism?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.tourism?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {stats.tourism?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: "3px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.statTitle}>QuickSales &amp; Materials</span>
              <span style={{ fontSize: "20px" }}>📦</span>
            </div>
            <p style={{ ...styles.statValue, color: "#34d399" }}>{stats.materials?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: (stats.materials?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.materials?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {stats.materials?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: "3px solid #8b5cf6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.statTitle}>Verified Sellers</span>
              <span style={{ fontSize: "20px" }}>🏷️</span>
            </div>
            <p style={{ ...styles.statValue, color: "#a78bfa" }}>{stats.sellers?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: (stats.sellers?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.sellers?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {stats.sellers?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: "3px solid #ec4899" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.statTitle}>Pending Payments</span>
              <span style={{ fontSize: "20px" }}>💳</span>
            </div>
            <p style={{ ...styles.statValue, color: "#f472b6" }}>{pendingPayments?.length || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: (pendingPayments?.length || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (pendingPayments?.length || 0) > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {(pendingPayments?.length || 0) > 0 ? "Action required" : "All cleared"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODERN TAB PILLS BAR */}
      <div style={styles.tabs}>
        {[
          { id: "properties", label: "Properties", icon: "🏢", count: allPending?.properties?.length || 0 },
          { id: "accommodations", label: "Accommodations", icon: "🏨", count: pendingAccommodations?.length || (allPending?.tourism?.length || 0) },
          { id: "businesses", label: "Businesses", icon: "💼", count: pendingBusinesses?.length || 0 },
          { id: "announcements", label: "Announcements", icon: "📢", count: pendingAnnouncements.filter(a => a.status === "pending").length || 0 },
          { id: "materials", label: "Materials", icon: "📦", count: allPending?.materials?.length || 0 },
          { id: "sellers", label: "Sellers", icon: "🏷️", count: allPending?.sellers?.length || 0 },
          { id: "agents", label: "Agents", icon: "🤝", count: agents?.length || 0 },
          { id: "users", label: "Users", icon: "👥", count: users?.length || 0 },
          { id: "requests", label: "Requests", icon: "📋", count: requests?.length || 0 },
          { id: "payments", label: "Payments", icon: "💳", count: pendingPayments?.length || 0 },
          { id: "payment", label: "Payment Settings", icon: "⚙️" },
        ].map((t) => {
          const isActive = activeTab === t.id || (t.id === "accommodations" && activeTab === "tourism");
          return (
            <button
              key={t.id}
              className="admin-tab-btn"
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span
                  style={{
                    ...styles.tabBadge,
                    ...(isActive ? styles.tabBadgeActive : styles.tabBadgePending),
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}

        <button
          className="admin-tab-btn"
          style={{
            ...styles.tab,
            background: "rgba(245, 158, 11, 0.12)",
            borderColor: "rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
          }}
          onClick={() => navigate("/admin/verification")}
        >
          <span>🛡️</span>
          <span>KYC Verifications</span>
          <span style={{ fontSize: "11px", opacity: 0.8 }}>→</span>
        </button>
      </div>

      {activeTab === "properties" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Properties Directory</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Filter by Status:</span>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="all">All Properties</option>
              </select>
            </div>
          </div>

          {propertiesLoading ? (
            <div style={styles.loader}>Syncing with database...</div>
          ) : propertiesList.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>No properties found matching "{propertyFilter}" status.</p>
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
                  {propertiesList.map((item) => (
                    <tr key={item._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.propTitle}>{item.title}</div>
                        <div style={{ ...styles.propLoc, display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <span>{item.location || `${item.area}, ${item.county}`}</span>
                        </div>
                        {/* Status & Availability Badges */}
                        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            background: item.status === "approved" ? "rgba(34,197,94,0.12)" : item.status === "rejected" ? "rgba(239,68,68,0.12)" : "rgba(251,191,36,0.12)",
                            color: item.status === "approved" ? "#22c55e" : item.status === "rejected" ? "#ef4444" : "#fbbf24",
                            border: `1px solid ${item.status === "approved" ? "rgba(34,197,94,0.3)" : item.status === "rejected" ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                          {(() => {
                            const available = Math.max(0, (item.totalUnits || 1) - (item.bookedUnits || 0));
                            const isFullyBooked = available === 0;
                            return (
                              <span style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontWeight: 600,
                                background: isFullyBooked ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                                color: isFullyBooked ? "#ef4444" : "#22c55e",
                                border: `1px solid ${isFullyBooked ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                              }}>
                                {isFullyBooked ? "Fully Booked — Hidden" : `${available}/${item.totalUnits || 1} units available`}
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.ownerName}>{item.owner?.name || "Member"}</div>
                        <div style={styles.ownerContact}>{item.owner?.phone}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.priceBadge}>{item.price?.toLocaleString()}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button
                            onClick={() => {
                              setSelectedPropertyForQR(item);
                              setQrModalOpen(true);
                            }}
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              color: "#60a5fa",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >Poster / QR</button>
                          <button
                            onClick={() => navigate(`/property/edit/${item._id}`)}
                            style={{
                              background: "#3b82f6", color: "white", border: "none",
                              padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer"
                            }}
                          >Edit</button>
                          {item.status !== "approved" && (
                            <button
                              onClick={() => handleStatusUpdate(item._id, "approved")}
                              style={styles.approveBtn}
                            >Approve</button>
                          )}
                          {item.status !== "rejected" && (
                            <button
                              onClick={() => handleStatusUpdate(item._id, "rejected")}
                              style={styles.rejectBtn}
                            >Reject</button>
                          )}
                          {/* Agent Assignment Dropdown */}
                          {item.status === "approved" && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignAgent(item._id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              style={{
                                padding: "6px 10px",
                                backgroundColor: "#0f172a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: 600,
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="">Assign Agent</option>
                              {agents.filter(a => a.agentProfile?.verified).map(agent => (
                                <option key={agent._id} value={agent._id}>
                                  {agent.name} ({agent.agentProfile?.county})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === "materials" ? (
        // Materials Tab
        !allPending?.materials || allPending.materials.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending materials to review.</p>
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
                      <div style={styles.propLoc}> {item.category}</div>
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
        // Accommodation Tab
        !allPending?.tourism || allPending.tourism.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending accommodation listings to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Accommodation Details</th>
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
                      <div style={styles.propLoc}> {item.category}</div>
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
      ) : activeTab === "sellers" ? (
        // Sellers Tab
        !allPending?.sellers || allPending.sellers.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending seller verifications to review.</p>
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
                      <div style={styles.propLoc}> Reg: {item.businessRegNumber}</div>
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
          <h2 style={styles.configTitle}> M-Pesa Payment Configuration</h2>
          <p style={styles.configSubtitle}>Configure your M-Pesa credentials to enable payments for subscriptions, boosts, and property promotions.</p>

          {configMessage && (
            <div style={{
              ...styles.configMessage,
              background: configMessage.startsWith("") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: configMessage.startsWith("") ? "#22c55e" : "#ef4444",
              borderColor: configMessage.startsWith("") ? "#22c55e" : "#ef4444",
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
              {configSaving ? "Saving..." : " Save Configuration"}
            </button>
          </div>

          <div style={styles.configInfo}>
            <h3 style={styles.configInfoTitle}> Configuration Notes</h3>
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
          <div style={styles.loader}> Loading pending payments...</div>
        ) : pendingPayments.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> No pending bank transfer payments.</p>
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
                            {verifyingId === p.transactionRef ? "..." : " Approve"}
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
          <div style={styles.loader}> Loading pending businesses...</div>
        ) : pendingBusinesses.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> No pending businesses to review.</p>
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
                        <a href={getPricelistUrl(business.pricelist)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none" }}>
                          View / Download
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
                        <option value="student_verified"> Student</option>
                        <option value="identity_verified"> Identity</option>
                        <option value="business_verified"> Business</option>
                        <option value="online_verified"> Online</option>
                        <option value="location_verified"> Location</option>
                        <option value="premium_verified"> Premium</option>
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
          <div style={styles.loader}> Loading pending announcements...</div>
        ) : pendingAnnouncements.filter(a => a.status === "pending").length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending announcements to review.</p>
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
          <div style={styles.loader}> Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> No users found in the system.</p>
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
      ) : activeTab === "accommodations" ? (
        // ADDED: Accommodations Tab
        accommodationsLoading ? (
          <div style={styles.loader}>Loading accommodations...</div>
        ) : pendingAccommodations.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No accommodations found matching "{accommodationFilter}" status.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Accommodation Directory</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Filter by Status:</span>
                <select
                  value={accommodationFilter}
                  onChange={(e) => setAccommodationFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="pending">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Accommodation Details</th>
                    <th style={styles.th}>Owner Info</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAccommodations.map((accommodation) => (
                    <tr key={accommodation._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.propTitle}>{accommodation.name}</div>
                        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                          {accommodation.description?.substring(0, 80)}...
                        </div>
                        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            background: accommodation.status === "active" ? "rgba(34,197,94,0.12)" :
                              accommodation.status === "inactive" ? "rgba(239,68,68,0.12)" :
                                "rgba(251,191,36,0.12)",
                            color: accommodation.status === "active" ? "#22c55e" :
                              accommodation.status === "inactive" ? "#ef4444" :
                                "#fbbf24",
                            border: `1px solid ${accommodation.status === "active" ? "rgba(34,197,94,0.3)" :
                              accommodation.status === "inactive" ? "rgba(239,68,68,0.3)" :
                                "rgba(251,191,36,0.3)"}`,
                          }}>
                            {accommodation.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {accommodation.maxGuests} guests • {accommodation.totalRooms} rooms
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.ownerName}>{accommodation.owner?.name || "Member"}</div>
                        <div style={styles.ownerContact}>{accommodation.owner?.email}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          background: "rgba(59, 130, 246, 0.15)",
                          color: "#60a5fa",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                        }}>
                          {accommodation.type}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.propLoc}>{accommodation.address}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          {accommodation.status === "pending_review" && (
                            <>
                              <button
                                onClick={() => handleAccommodationStatus(accommodation._id, "active")}
                                style={styles.approveBtn}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAccommodationStatus(accommodation._id, "inactive")}
                                style={styles.rejectBtn}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {accommodation.status === "active" && (
                            <button
                              onClick={() => handleAccommodationStatus(accommodation._id, "inactive")}
                              style={styles.rejectBtn}
                            >
                              Deactivate
                            </button>
                          )}
                          {accommodation.status === "inactive" && (
                            <button
                              onClick={() => handleAccommodationStatus(accommodation._id, "active")}
                              style={styles.approveBtn}
                            >
                              Activate
                            </button>
                          )}
                          {/* Agent Assignment Dropdown */}
                          {accommodation.status === "active" && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignAgent(accommodation._id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              style={{
                                padding: "6px 10px",
                                backgroundColor: "#0f172a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: 600,
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="">Assign Agent</option>
                              {agents.filter(a => a.agentProfile?.verified).map(agent => (
                                <option key={agent._id} value={agent._id}>
                                  {agent.name} ({agent.agentProfile?.county})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
        // END ADDED
      ) : activeTab === "agents" ? (
        // ADDED: Agents Tab
        agentsLoading ? (
          <div style={styles.loader}>Loading agents...</div>
        ) : agents.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No agents have applied yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Rental Agents</h2>
              <select
                value={agentStatusFilter}
                onChange={(e) => setAgentStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Agent Info</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>County</th>
                    <th style={styles.th}>ID Number</th>
                    <th style={styles.th}>Bio</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.propTitle}>{agent.name}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                          {agent.email}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.propLoc}>{agent.agentProfile?.phone || "N/A"}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.propLoc}>{agent.agentProfile?.county || "N/A"}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.propLoc}>{agent.agentProfile?.idNumber || "N/A"}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ maxWidth: "250px", fontSize: "13px", color: "#94a3b8" }}>
                          {agent.agentProfile?.bio?.substring(0, 100) || "N/A"}
                          {agent.agentProfile?.bio?.length > 100 && "..."}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          background: agent.agentProfile?.verificationStatus === "verified"
                            ? "rgba(34,197,94,0.12)"
                            : agent.agentProfile?.verificationStatus === "rejected"
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(251,191,36,0.12)",
                          color: agent.agentProfile?.verificationStatus === "verified"
                            ? "#22c55e"
                            : agent.agentProfile?.verificationStatus === "rejected"
                              ? "#ef4444"
                              : "#fbbf24",
                          border: `1px solid ${agent.agentProfile?.verificationStatus === "verified"
                            ? "rgba(34,197,94,0.3)"
                            : agent.agentProfile?.verificationStatus === "rejected"
                              ? "rgba(239,68,68,0.3)"
                              : "rgba(251,191,36,0.3)"}`,
                        }}>
                          {agent.agentProfile?.verificationStatus?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          {agent.agentProfile?.verificationStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleVerifyAgent(agent._id)}
                                style={styles.approveBtn}
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleRejectAgent(agent._id)}
                                style={styles.rejectBtn}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {agent.agentProfile?.idPhotoFront && (
                            <button
                              onClick={() => window.open(agent.agentProfile.idPhotoFront, "_blank")}
                              style={{ ...styles.viewBtn, marginLeft: "8px" }}
                            >
                              View ID
                            </button>
                          )}
                          {agent.agentProfile?.selfiePhoto && (
                            <button
                              onClick={() => window.open(agent.agentProfile.selfiePhoto, "_blank")}
                              style={{ ...styles.viewBtn, marginLeft: "8px" }}
                            >
                              View Selfie
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
        // END ADDED
      ) : activeTab === "requests" ? (
        requestsLoading ? (
          <div style={styles.loader}> Fetching user requests...</div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> No custom service requests submitted yet.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Requester Info</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Search Query</th>
                  <th style={styles.th}>Details & Requirements</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.propTitle}>{req.name}</div>
                      <div style={styles.propLoc}>{req.email}</div>
                      {req.phone && <div style={{ fontSize: "12px", color: "#94a3b8" }}> {req.phone}</div>}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: req.serviceType === "rental" ? "rgba(251, 191, 36, 0.15)" : "rgba(30,41,59,0.8)",
                        color: req.serviceType === "rental" ? "#fbbf24" : "#94a3b8",
                        border: req.serviceType === "rental" ? "1px solid #fbbf24" : "1px solid #334155"
                      }}>
                        {req.serviceType}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "#f1f5f9" }}>"{req.searchQuery}"</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ maxWidth: "300px", whiteSpace: "normal", wordBreak: "break-word", fontSize: "13px", color: "#94a3b8" }}>
                        {req.details}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: req.status === "resolved" ? "rgba(34,197,94,0.15)" : req.status === "contacted" ? "rgba(251,191,36,0.15)" : "rgba(239,68,68,0.15)",
                        color: req.status === "resolved" ? "#22c55e" : req.status === "contacted" ? "#fbbf24" : "#ef4444",
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        {req.status === "pending" && (
                          <button
                            onClick={() => handleRequestStatus(req._id, "contacted")}
                            style={{
                              ...styles.approveBtn,
                              background: "#fbbf24",
                              color: "#000",
                              borderColor: "#fbbf24"
                            }}
                          >
                            Contacted
                          </button>
                        )}
                        {req.status !== "resolved" && (
                          <button
                            onClick={() => handleRequestStatus(req._id, "resolved")}
                            style={styles.approveBtn}
                          >
                            Resolve
                          </button>
                        )}
                        <a
                          href={`mailto:${req.email}?subject=AxxSpace Request regarding: ${encodeURIComponent(req.searchQuery)}`}
                          style={{
                            display: "inline-block",
                            padding: "8px 16px",
                            background: "transparent",
                            color: "#fbbf24",
                            border: "1px solid #fbbf24",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            textDecoration: "none",
                            textAlign: "center"
                          }}
                        >
                          Email
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {qrModalOpen && selectedPropertyForQR && (
        <QRGeneratorModal
          property={selectedPropertyForQR}
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedPropertyForQR(null);
          }}
        />
      )}
    </div>
  );
}

/* ==================== STYLES (Midnight Blue & Gold Theme) ==================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #040914 0%, #071224 50%, #0b1a33 100%)",
    padding: "36px 4%",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  topAdminBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "18px 24px",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  brandLogo: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "#0f172a",
    fontSize: "17px",
    letterSpacing: "1px",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.35)",
  },
  brandTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  brandTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  pulsingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px #22c55e",
    display: "inline-block",
  },
  brandSubtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
    fontWeight: 500,
  },
  topRightControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  refreshBtn: {
    background: "rgba(30, 41, 59, 0.8)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "9px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },
  verificationBtn: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    padding: "9px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },
  adminUserPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "6px 14px",
    borderRadius: "10px",
  },
  userRoleBadge: {
    background: "#f59e0b",
    color: "#0f172a",
    fontSize: "10px",
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  userEmail: {
    fontSize: "12px",
    color: "#e2e8f0",
    fontWeight: 600,
  },
  exitBtn: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },
  // ADDED styles
  txCode: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace" },
  smsPreview: { fontSize: "12px", color: "#64748b", maxWidth: "220px", lineHeight: "1.5" },
  approveBtn: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  rejectBtn: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  viewBtn: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#3b82f6",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
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