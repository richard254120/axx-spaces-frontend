import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { getPricelistUrl } from "../utils/fileLinks";
import QRGeneratorModal from "../components/QRGeneratorModal";
import AdminPropertyImageModal from "../components/AdminPropertyImageModal";

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("pending");
    // "all" | "rent" | "sale" — sale listings arrive pending and need ownership review
    const [propertyListingType, setPropertyListingType] = useState("all");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPropertyForQR, setSelectedPropertyForQR] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPropertyForImages, setSelectedPropertyForImages] = useState(null);
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

  // ADDED: agent packages tab state
  const [agentPackages, setAgentPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  // END ADDED

  // ADDED: pending package purchases state
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [pendingPurchasesLoading, setPendingPurchasesLoading] = useState(false);
  // END ADDED

  // Responsive mobile states
  const [mobileStatsCollapsed, setMobileStatsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
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
    loadAgentPackages();
    loadPendingPurchases();
    setTimeout(() => setIsRefreshing(false), 700);
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

  // ADDED: load agent packages when tab is selected
  useEffect(() => {
    if (activeTab === "packages") {
      loadAgentPackages();
      loadPendingPurchases();
    }
  }, [activeTab]);

  // ADDED: load properties when tab or filter changes
  useEffect(() => {
    if (activeTab === "properties") {
      fetchProperties();
    }
  }, [activeTab, propertyFilter, propertyListingType]);

  const fetchProperties = async () => {
    setPropertiesLoading(true);
    try {
      let res;
      if (propertyFilter === "pending") {
        res = await API.get("/admin/all", { params: { type: "properties", status: "pending" } });
      } else if (propertyFilter === "approved") {
        res = await API.get("/admin/all", { params: { type: "properties", status: "approved" } });
      } else if (propertyFilter === "rejected") {
        res = await API.get("/admin/all", { params: { type: "properties", status: "rejected" } });
      } else {
        res = await API.get("/admin/all", { params: { type: "properties" } });
      }
      setPropertiesList(
        (res.data || []).filter((item) => {
          if (propertyListingType === "all") return true;
          const mode = item.listingType === "sale" ? "sale" : "rent";
          return mode === propertyListingType;
        })
      );
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

  const handleToggleFeatured = async (accommodationId, currentFeatured) => {
    try {
      await API.patch(`/accommodations/${accommodationId}/featured`, {
        isFeatured: !currentFeatured,
        promotionTier: "boost-7days",
        durationDays: 7,
      });
      loadAccommodations();
      alert(currentFeatured ? "Accommodation unfeatured" : "Accommodation featured");
    } catch (err) {
      alert("Failed to toggle featured status");
    }
  };

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

  const loadAgentPackages = async () => {
    try {
      setPackagesLoading(true);
      const res = await API.get("/agents/all-packages");
      setAgentPackages(res.data || []);
    } catch (err) {
      console.error("Failed to load agent packages:", err);
    } finally {
      setPackagesLoading(false);
    }
  };

  const loadPendingPurchases = async () => {
    try {
      setPendingPurchasesLoading(true);
      const res = await API.get("/agents/pending-purchases");
      setPendingPurchases(res.data || []);
    } catch (err) {
      console.error("Failed to load pending purchases:", err);
    } finally {
      setPendingPurchasesLoading(false);
    }
  };

  const handleApprovePurchase = async (userId) => {
    try {
      await API.put(`/agents/approve-purchase/${userId}`);
      alert("Package purchase approved successfully");
      loadPendingPurchases();
      loadAgentPackages();
    } catch (err) {
      alert("Failed to approve purchase");
    }
  };

  const handleRejectPurchase = async (userId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await API.put(`/agents/reject-purchase/${userId}`, { reason });
      alert("Package purchase rejected successfully");
      loadPendingPurchases();
    } catch (err) {
      alert("Failed to reject purchase");
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
    <div style={styles.container} className="admin-dashboard-root">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* ENTERPRISE TOP ADMIN BAR */}
      <div style={styles.topAdminBar} className="admin-top-bar">
        <div style={styles.brandGroup} className="admin-brand-group">
          <div style={styles.brandLogo} className="admin-brand-logo">AXX</div>
          <div>
            <div style={styles.brandTitleRow} className="admin-brand-title-row">
              <h1 style={styles.brandTitle} className="admin-brand-title">AxxSpace Admin</h1>
              <span style={styles.liveBadge} className="admin-live-badge">
                <span style={styles.pulsingDot}></span> <span className="admin-live-text">Live Operations</span>
              </span>
            </div>
            <p style={styles.brandSubtitle} className="admin-brand-subtitle">Centralized Portal Operations, Moderation &amp; Gateway Management</p>
          </div>
        </div>

        <div style={styles.topRightControls} className="admin-top-controls">
          <button
            onClick={() => setMobileStatsCollapsed(!mobileStatsCollapsed)}
            style={{
              ...styles.refreshBtn,
              background: mobileStatsCollapsed ? "rgba(245, 158, 11, 0.2)" : "rgba(30, 41, 59, 0.7)",
              borderColor: mobileStatsCollapsed ? "rgba(245, 158, 11, 0.45)" : "rgba(255, 255, 255, 0.12)",
              color: mobileStatsCollapsed ? "#fbbf24" : "#f1f5f9",
            }}
            title={mobileStatsCollapsed ? "Show KPIs" : "Hide KPIs for max data space"}
            className="admin-kpi-toggle-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="admin-btn-label">{mobileStatsCollapsed ? "Show KPIs" : "KPIs"}</span>
          </button>

          <button onClick={handleRefreshAll} style={styles.refreshBtn} title="Sync database records" className="admin-control-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isRefreshing ? "spin-sync" : ""}>
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span className="admin-btn-label">Sync</span>
          </button>

          <button onClick={() => navigate("/admin/verification")} style={styles.verificationBtn} className="admin-control-btn" title="KYC Verification Portal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span className="admin-btn-label">KYC</span>
          </button>

          <div style={styles.adminUserPill} className="admin-user-pill">
            <span style={styles.userRoleBadge}>ADMIN</span>
            <span style={styles.userEmail}>{user?.name || user?.email?.split("@")[0] || "Admin"}</span>
          </div>

          <button onClick={() => navigate("/")} style={styles.exitBtn} title="View public site" className="admin-control-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span className="admin-btn-label">Site</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI OVERVIEW */}
      {stats && !mobileStatsCollapsed && (
        <div style={styles.statsGrid} className="admin-stats-strip">
          <div
            style={{ ...styles.statCard, borderTop: "3px solid #f59e0b" }}
            className="admin-stat-card"
            onClick={() => setActiveTab("properties")}
            title="Click to view Properties"
          >
            <div className="stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={styles.statTitle} className="admin-stat-title">Rental Properties</span>
              <svg className="admin-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="18" x2="15" y2="18"></line></svg>
            </div>
            <p style={styles.statValue} className="admin-stat-value">{stats.properties?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="admin-stat-badge" style={{
                fontSize: "11px",
                fontWeight: 700,
                color: (stats.properties?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.properties?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {stats.properties?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.statCard, borderTop: "3px solid #3b82f6" }}
            className="admin-stat-card"
            onClick={() => setActiveTab("accommodations")}
            title="Click to view Accommodations"
          >
            <div className="stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={styles.statTitle} className="admin-stat-title">Accommodations</span>
              <svg className="admin-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="M9 22v-4h6v4"></path></svg>
            </div>
            <p style={{ ...styles.statValue, color: "#60a5fa" }} className="admin-stat-value">{stats.tourism?.total || pendingAccommodations.length || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="admin-stat-badge" style={{
                fontSize: "11px",
                fontWeight: 700,
                color: (stats.tourism?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.tourism?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {stats.tourism?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.statCard, borderTop: "3px solid #10b981" }}
            className="admin-stat-card"
            onClick={() => setActiveTab("materials")}
            title="Click to view QuickSales"
          >
            <div className="stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={styles.statTitle} className="admin-stat-title">QuickSales</span>
              <svg className="admin-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <p style={{ ...styles.statValue, color: "#34d399" }} className="admin-stat-value">{stats.materials?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="admin-stat-badge" style={{
                fontSize: "11px",
                fontWeight: 700,
                color: (stats.materials?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.materials?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {stats.materials?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.statCard, borderTop: "3px solid #8b5cf6" }}
            className="admin-stat-card"
            onClick={() => setActiveTab("sellers")}
            title="Click to view QuickSales Sellers"
          >
            <div className="stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={styles.statTitle} className="admin-stat-title">QuickSales Sellers</span>
              <svg className="admin-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </div>
            <p style={{ ...styles.statValue, color: "#a78bfa" }} className="admin-stat-value">{stats.sellers?.total || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="admin-stat-badge" style={{
                fontSize: "11px",
                fontWeight: 700,
                color: (stats.sellers?.pending || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (stats.sellers?.pending || 0) > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {stats.sellers?.pending || 0} pending review
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.statCard, borderTop: "3px solid #ec4899" }}
            className="admin-stat-card"
            onClick={() => setActiveTab("payments")}
            title="Click to view Pending Payments"
          >
            <div className="stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={styles.statTitle} className="admin-stat-title">Pending Payments</span>
              <svg className="admin-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <p style={{ ...styles.statValue, color: "#f472b6" }} className="admin-stat-value">{pendingPayments?.length || 0}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="admin-stat-badge" style={{
                fontSize: "11px",
                fontWeight: 700,
                color: (pendingPayments?.length || 0) > 0 ? "#ef4444" : "#22c55e",
                background: (pendingPayments?.length || 0) > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {(pendingPayments?.length || 0) > 0 ? "Action required" : "All cleared"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODERN TAB PILLS BAR */}
      <div style={styles.tabs} className="admin-tabs-track">
        {[
          { id: "properties", label: "Properties", count: allPending?.properties?.length || 0 },
          { id: "accommodations", label: "Accommodations", count: pendingAccommodations?.length || (allPending?.tourism?.length || 0) },
          { id: "businesses", label: "Businesses", count: pendingBusinesses?.length || 0 },
          { id: "announcements", label: "Announcements", count: pendingAnnouncements.filter(a => a.status === "pending").length || 0 },
          { id: "materials", label: "QuickSales", count: allPending?.materials?.length || 0 },
          { id: "sellers", label: "QuickSales Sellers", count: allPending?.sellers?.length || 0 },
          { id: "agents", label: "Agents", count: agents?.length || 0 },
          { id: "packages", label: "Agent Packages", count: agentPackages?.length || 0 },
          { id: "users", label: "Users", count: users?.length || 0 },
          { id: "requests", label: "Requests", count: requests?.length || 0 },
          { id: "payments", label: "Payments", count: pendingPayments?.length || 0 },
          { id: "payment", label: "Payment Settings" },
        ].map((t) => {
          const isActive = activeTab === t.id || (t.id === "accommodations" && activeTab === "tourism");
          return (
            <button
              key={t.id}
              className={`admin-tab-btn ${isActive ? "active" : ""}`}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(t.id)}
            >
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
          onClick={() => navigate("/admin/verification")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>KYC Verifications</span>
          <span style={{ fontSize: "11px", opacity: 0.8 }}>→</span>
        </button>
      </div>

      {activeTab === "properties" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Properties Directory</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Type:</span>
              <select
                value={propertyListingType}
                onChange={(e) => setPropertyListingType(e.target.value)}
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
                <option value="all">Rent &amp; Sale</option>
                <option value="rent">Rentals only</option>
                <option value="sale">For Sale only</option>
              </select>
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Status:</span>
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
                <option value="rejected">Rejected</option>
                <option value="all">All Properties</option>
              </select>
            </div>
          </div>

          {propertiesLoading ? (
            <div style={styles.loader}>Syncing with database...</div>
          ) : propertiesList.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>No properties found matching "{propertyFilter}" status{propertyListingType === "all" ? "" : propertyListingType === "sale" ? " for sale" : " for rent"}.</p>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {item.images?.[0] ? (
                            <img
                              src={typeof item.images[0] === "object" ? item.images[0]?.imageUrl || item.images[0]?.url : item.images[0]}
                              alt=""
                              style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0", cursor: "pointer" }}
                              onClick={() => {
                                setSelectedPropertyForImages(item);
                                setImageModalOpen(true);
                              }}
                              title="Click to edit property pictures"
                            />
                          ) : (
                            <div
                              style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "10px", fontWeight: 700, flexShrink: 0, cursor: "pointer" }}
                              onClick={() => {
                                setSelectedPropertyForImages(item);
                                setImageModalOpen(true);
                              }}
                              title="Click to add property pictures"
                            >
                              No Photo
                            </div>
                          )}
                          <div>
                            <div style={styles.propTitle}>{item.title}</div>
                            <div style={{ ...styles.propLoc, display: "flex", alignItems: "center", gap: "4px" }}>
                              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              <span>{item.location || `${item.area}, ${item.county}`}</span>
                            </div>
                          </div>
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
                          {item.listingType === "sale" ? (
                            <span style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              background: "rgba(239,68,68,0.12)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.3)",
                              letterSpacing: "0.4px",
                            }}>
                              FOR SALE
                            </span>
                          ) : (() => {
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
                          {item.listingType === "sale" && item.listingAuthorization?.proofUrl && (
                            <a
                              href={item.listingAuthorization.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontWeight: 700,
                                background: "rgba(59,130,246,0.12)",
                                color: "#60a5fa",
                                border: "1px solid rgba(59,130,246,0.3)",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Open the ownership document submitted by the owner"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              Verify Ownership Doc
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.ownerName}>{item.owner?.name || "Member"}</div>
                        <div style={styles.ownerContact}>{item.owner?.phone}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.priceBadge}>{item.price?.toLocaleString()}</span>
                        {item.listingType === "sale" && (
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontWeight: 600 }}>
                            Asking price{item.priceNegotiable ? " · negotiable" : ""}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button
                            onClick={() => {
                              setSelectedPropertyForImages(item);
                              setImageModalOpen(true);
                            }}
                            style={{
                              background: "rgba(14, 165, 233, 0.15)",
                              color: "#0284c7",
                              border: "1px solid rgba(14, 165, 233, 0.3)",
                              padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: "6px"
                            }}
                            title="Edit or manage property images"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Images ({item.images?.length || 0})
                          </button>
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
                          {item.status === "rejected" && (
                            <button
                              onClick={() => handleStatusUpdate(item._id, "approved")}
                              style={styles.approveBtn}
                            >Restore</button>
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
        // QuickSales listings tab
        !allPending?.materials || allPending.materials.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending QuickSales listings to review.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Listing Details</th>
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
        // QuickSales seller verification tab
        !allPending?.sellers || allPending.sellers.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}> All caught up! No pending QuickSales seller verifications to review.</p>
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
                          {accommodation.isFeatured && (
                            <span style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              background: "rgba(251, 191, 36, 0.2)",
                              color: "#fbbf24",
                              border: "1px solid rgba(251, 191, 36, 0.4)",
                            }}>
                              ⭐ FEATURED
                            </span>
                          )}
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
                            <>
                              <button
                                onClick={() => handleAccommodationStatus(accommodation._id, "inactive")}
                                style={styles.rejectBtn}
                              >
                                Deactivate
                              </button>
                              <button
                                onClick={() => handleToggleFeatured(accommodation._id, accommodation.isFeatured)}
                                style={{
                                  ...styles.approveBtn,
                                  background: accommodation.isFeatured ? "rgba(251, 191, 36, 0.15)" : "rgba(59, 130, 246, 0.15)",
                                  color: accommodation.isFeatured ? "#fbbf24" : "#3b82f6",
                                  border: accommodation.isFeatured ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
                                }}
                              >
                                {accommodation.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                            </>
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
      ) : activeTab === "packages" ? (
        // ADDED: Agent Packages Tab
        packagesLoading ? (
          <div style={styles.loader}>Loading agent packages...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            {/* Pending Purchases Section */}
            {pendingPurchases.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))",
                border: "1px solid #fbbf24",
                borderRadius: "12px",
                padding: "20px",
              }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "16px" }}>
                  ⏳ Pending Package Purchases ({pendingPurchases.length})
                </h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.theadRow}>
                        <th style={styles.th}>Agent Info</th>
                        <th style={styles.th}>Package</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Payment Message</th>
                        <th style={styles.th}>Submitted</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPurchases.map((agent) => (
                        <tr key={agent._id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.propTitle}>{agent.name}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                              {agent.email}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {agent.phone}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#f59e0b",
                            }}>
                              {agent.pendingPurchase.tier.toUpperCase()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.propLoc}>
                              KSh {agent.pendingPurchase.amount.toLocaleString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: "250px", fontSize: "12px", color: "#94a3b8", wordBreak: "break-word" }}>
                              {agent.pendingPurchase.paymentMessage}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.propLoc}>
                              {new Date(agent.pendingPurchase.submittedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.btnGroup}>
                              <button
                                onClick={() => handleApprovePurchase(agent._id)}
                                style={styles.approveBtn}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectPurchase(agent._id)}
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
              </div>
            )}

            {/* All Agent Packages Section */}
            <h2 style={styles.sectionTitle}>All Agent Packages</h2>
            {agentPackages.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyText}>No agents with packages yet.</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Agent Info</th>
                      <th style={styles.th}>Current Package</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Expires</th>
                      <th style={styles.th}>Active Listings</th>
                      <th style={styles.th}>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPackages.map((agent) => (
                      <tr key={agent._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.propTitle}>{agent.name}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                            {agent.email}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                            {agent.phone}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: agent.currentTier === "verified" ? "#8b5cf6" : agent.currentTier === "pro_plus" ? "#3b82f6" : agent.currentTier === "pro" ? "#22c55e" : "#6b7280",
                          }}>
                            {agent.package?.name || "No Package"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            background: agent.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            color: agent.isActive ? "#22c55e" : "#ef4444",
                            border: `1px solid ${agent.isActive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                          }}>
                            {agent.isActive ? "ACTIVE" : "EXPIRED"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.propLoc}>
                            {agent.expiresAt ? new Date(agent.expiresAt).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.propLoc}>
                            {agent.activeListingsCount} / {agent.package?.maxActiveListings === 100 ? "Unlimited" : agent.package?.maxActiveListings || 0}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                            {agent.packageHistory?.length || 0} purchases
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  <th style={styles.th}>Requester & Channel</th>
                  <th style={styles.th}>Category & Timeline</th>
                  <th style={styles.th}>Item / Requirements</th>
                  <th style={styles.th}>Location & Budget</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const cleanPhone = (req.phone || "").replace(/[^0-9]/g, "");
                  const waPhone = cleanPhone.startsWith("0") ? `254${cleanPhone.slice(1)}` : cleanPhone;
                  const urgencyColors = {
                    immediate: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", border: "#ef4444" },
                    this_week: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", border: "#f59e0b" },
                    this_month: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa", border: "#3b82f6" },
                    flexible: { bg: "rgba(148, 163, 184, 0.2)", text: "#94a3b8", border: "#64748b" }
                  };
                  const uStyle = urgencyColors[req.urgency] || urgencyColors.flexible;

                  return (
                    <tr key={req._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ ...styles.propTitle, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{req.name || "Client"}</span>
                        </div>
                        <div style={styles.propLoc}>{req.email}</div>
                        {req.phone && (
                          <div style={{ fontSize: "12px", color: "#38bdf8", marginTop: "2px" }}>
                            Tel: {req.phone}
                          </div>
                        )}
                        {req.preferredContact && (
                          <span style={{
                            display: "inline-block",
                            marginTop: "4px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: req.preferredContact === "whatsapp" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                            color: req.preferredContact === "whatsapp" ? "#4ade80" : "#cbd5e1",
                            border: req.preferredContact === "whatsapp" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.1)"
                          }}>
                            Channel: {req.preferredContact}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: req.serviceType === "rental" ? "rgba(251, 191, 36, 0.15)" : "rgba(30,41,59,0.8)",
                            color: req.serviceType === "rental" ? "#fbbf24" : "#94a3b8",
                            border: req.serviceType === "rental" ? "1px solid #fbbf24" : "1px solid #334155"
                          }}>
                            {req.serviceType}
                          </span>
                          {req.urgency && (
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: uStyle.bg,
                              color: uStyle.text,
                              border: `1px solid ${uStyle.border}`
                            }}>
                              {req.urgency === "immediate" ? "Immediate" : req.urgency.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: "#f1f5f9", display: "block", marginBottom: "4px", fontSize: "14px" }}>
                          "{req.searchQuery}"
                        </strong>
                        <div style={{ maxWidth: "260px", whiteSpace: "normal", wordBreak: "break-word", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                          {req.details}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {req.targetLocation && (
                          <div style={{ fontSize: "12px", color: "#e2e8f0", marginBottom: "4px" }}>
                            Location: {req.targetLocation}
                          </div>
                        )}
                        {(req.budgetMin || req.budgetMax) ? (
                          <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 700 }}>
                            {req.budgetCurrency || "KES"} {req.budgetMin ? Number(req.budgetMin).toLocaleString() : "0"} - {req.budgetMax ? Number(req.budgetMax).toLocaleString() : "Flex"}{req.budgetPeriod === "monthly" ? " / mo" : ""}
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>Budget open</span>
                        )}
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={styles.btnGroup}>
                            {req.status === "pending" && (
                              <button
                                onClick={() => handleRequestStatus(req._id, "contacted")}
                                style={{
                                  ...styles.approveBtn,
                                  background: "#fbbf24",
                                  color: "#000",
                                  borderColor: "#fbbf24",
                                  padding: "6px 12px",
                                  fontSize: "11px"
                                }}
                              >
                                Contacted
                              </button>
                            )}
                            {req.status !== "resolved" && (
                              <button
                                onClick={() => handleRequestStatus(req._id, "resolved")}
                                style={{
                                  ...styles.approveBtn,
                                  padding: "6px 12px",
                                  fontSize: "11px"
                                }}
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${req.name || ""}, I am contacting you from AxxSpace regarding your request: "${req.searchQuery}"`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: "5px 10px",
                                  background: "rgba(34,197,94,0.15)",
                                  color: "#4ade80",
                                  border: "1px solid rgba(34,197,94,0.3)",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textDecoration: "none"
                                }}
                              >
                                WhatsApp
                              </a>
                            )}
                            {req.phone && (
                              <a
                                href={`tel:${req.phone}`}
                                style={{
                                  padding: "5px 10px",
                                  background: "rgba(56,189,248,0.15)",
                                  color: "#38bdf8",
                                  border: "1px solid rgba(56,189,248,0.3)",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textDecoration: "none"
                                }}
                              >
                                Call
                              </a>
                            )}
                            <a
                              href={`mailto:${req.email}?subject=AxxSpace Request: ${encodeURIComponent(req.searchQuery)}`}
                              style={{
                                padding: "5px 10px",
                                background: "transparent",
                                color: "#fbbf24",
                                border: "1px solid rgba(251, 191, 36, 0.4)",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                textDecoration: "none"
                              }}
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {imageModalOpen && selectedPropertyForImages && (
        <AdminPropertyImageModal
          isOpen={imageModalOpen}
          onClose={() => {
            setImageModalOpen(false);
            setSelectedPropertyForImages(null);
          }}
          property={selectedPropertyForImages}
          onSaved={(updatedProp) => {
            setPropertiesList((prev) =>
              prev.map((p) =>
                p._id === updatedProp._id
                  ? { ...p, images: updatedProp.images }
                  : p
              )
            );
          }}
        />
      )}
    </div>
  );
}

/* ==================== STYLES (Ultra Glassmorphism & Gold Theme) ==================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at 15% 10%, rgba(245, 158, 11, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 85% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), linear-gradient(135deg, #030712 0%, #061124 50%, #0a172e 100%)",
    padding: "24px 3%",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative",
  },
  topAdminBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "14px 20px",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "#0f172a",
    fontSize: "16px",
    letterSpacing: "1px",
    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
    flexShrink: 0,
  },
  brandTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  brandTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.4px",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.3px",
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
    fontSize: "12px",
    color: "#94a3b8",
    margin: "3px 0 0 0",
    fontWeight: 500,
  },
  topRightControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  refreshBtn: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  verificationBtn: {
    background: "rgba(245, 158, 11, 0.15)",
    backdropFilter: "blur(12px)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
  },
  adminUserPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "6px 12px",
    borderRadius: "10px",
  },
  userRoleBadge: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  exitBtn: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(12px)",
    color: "#94a3b8",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },

  /* Stats Cards (KPI Strip) */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statTitle: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "4px 0 6px 0",
    letterSpacing: "-0.5px",
  },

  /* Navigation Tabs */
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    paddingBottom: "4px",
    scrollbarWidth: "none",
  },
  tab: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#94a3b8",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  tabActive: {
    background: "rgba(245, 158, 11, 0.18)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.45)",
    boxShadow: "0 0 16px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
  },
  tabBadge: {
    fontSize: "10px",
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: "9999px",
  },
  tabBadgeActive: {
    background: "#f59e0b",
    color: "#0f172a",
  },
  tabBadgePending: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.35)",
  },

  /* Section Titles & Layout */
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.4px",
    margin: 0,
  },
  loader: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#fbbf24",
    fontSize: "14px",
    fontWeight: 600,
    background: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  emptyCard: {
    background: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(16px)",
    padding: "40px 20px",
    borderRadius: "14px",
    textAlign: "center",
    border: "1px dashed rgba(245, 158, 11, 0.25)",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
    fontWeight: 500,
  },

  /* Glass Data Tables */
  tableContainer: {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderTop: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  theadRow: {
    background: "rgba(245, 158, 11, 0.08)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  th: {
    padding: "12px 16px",
    color: "#fbbf24",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "background 0.2s ease",
  },
  td: {
    padding: "12px 16px",
    verticalAlign: "middle",
    fontSize: "13px",
    color: "#e2e8f0",
  },

  /* Row content helpers */
  propTitle: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#f8fafc",
    marginBottom: "3px",
  },
  propLoc: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  ownerName: {
    fontWeight: 600,
    fontSize: "13px",
    color: "#f1f5f9",
  },
  ownerContact: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  priceBadge: {
    background: "rgba(59, 130, 246, 0.12)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "12px",
    display: "inline-block",
  },
  roleBadge: {
    background: "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "11px",
    textTransform: "uppercase",
  },
  badges: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  badge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  select: {
    padding: "8px 12px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  /* Buttons & Transaction info */
  txCode: {
    background: "rgba(34, 197, 94, 0.1)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "monospace",
  },
  smsPreview: {
    fontSize: "12px",
    color: "#64748b",
    maxWidth: "220px",
    lineHeight: "1.4",
  },
  approveBtn: {
    background: "rgba(34, 197, 94, 0.16)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  rejectBtn: {
    background: "rgba(239, 68, 68, 0.16)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  viewBtn: {
    background: "rgba(59, 130, 246, 0.16)",
    color: "#3b82f6",
    border: "1px solid rgba(59, 130, 246, 0.35)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  /* M-Pesa Settings Form */
  configContainer: {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderTop: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
    maxWidth: "650px",
    margin: "0 auto",
  },
  configTitle: { fontSize: "20px", fontWeight: 800, color: "#fbbf24", marginBottom: "6px" },
  configSubtitle: { color: "#94a3b8", fontSize: "13px", marginBottom: "20px" },
  configForm: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" },
  configField: { display: "flex", flexDirection: "column", gap: "5px" },
  configLabel: { fontSize: "12px", fontWeight: 700, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.5px" },
  configInput: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(30, 41, 59, 0.6)",
    color: "#f1f5f9",
    fontSize: "13px",
    outline: "none",
    transition: "0.2s",
  },
  configHint: { fontSize: "11px", color: "#64748b", margin: 0 },
  saveConfigBtn: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    transition: "0.2s",
    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
  },
  configMessage: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "16px",
  },
  configInfo: {
    background: "rgba(30, 41, 59, 0.4)",
    padding: "16px",
    borderRadius: "10px",
    border: "1px dashed rgba(251, 191, 36, 0.3)",
  },
  configInfoTitle: { fontSize: "13px", fontWeight: 700, color: "#fbbf24", marginBottom: "8px" },
  configInfoList: { margin: 0, paddingLeft: "18px", color: "#94a3b8", fontSize: "12px", lineHeight: "1.7" },
  configLink: { color: "#3b82f6", textDecoration: "none" },
};

const cssStyles = `
  /* Ambient glowing background */
  .admin-dashboard-root {
    position: relative;
    overflow-x: hidden;
  }

  .spin-sync {
    animation: adminSpin 0.75s linear infinite;
  }
  @keyframes adminSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Custom Glass Scrollbars */
  .admin-tabs-track::-webkit-scrollbar,
  .admin-stats-strip::-webkit-scrollbar {
    height: 4px;
  }
  .admin-tabs-track::-webkit-scrollbar-thumb,
  .admin-stats-strip::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.3);
    border-radius: 999px;
  }
  .admin-table-container::-webkit-scrollbar,
  div[style*="overflow-x: auto"]::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }
  .admin-table-container::-webkit-scrollbar-thumb,
  div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 999px;
  }
  .admin-table-container::-webkit-scrollbar-track,
  div[style*="overflow-x: auto"]::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  /* Glass hover & active effects */
  .admin-tab-btn {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .admin-tab-btn:hover {
    background: rgba(30, 41, 59, 0.8) !important;
    border-color: rgba(245, 158, 11, 0.3) !important;
    transform: translateY(-1px);
  }
  .admin-tab-btn.active {
    background: rgba(245, 158, 11, 0.18) !important;
    border-color: rgba(245, 158, 11, 0.5) !important;
    color: #fbbf24 !important;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  }

  .admin-stat-card {
    transition: all 0.2s ease !important;
  }
  .admin-stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.18) !important;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.035) !important;
  }
  button:active {
    transform: scale(0.96);
  }
  button:hover {
    opacity: 0.95;
  }

  input:focus, select:focus, textarea:focus {
    border-color: rgba(245, 158, 11, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25) !important;
  }

  /* ============================================================
     MOBILE PHONE VIEW (Max Width 768px)
     Fits screen fully so Admin sees DATA immediately without scrolling!
     ============================================================ */
  @media (max-width: 768px) {
    .admin-dashboard-root {
      padding: 8px 8px 24px 8px !important;
      min-height: 100vh !important;
    }

    /* Ultra-compact top admin bar (takes ~44px height) */
    .admin-top-bar {
      padding: 6px 10px !important;
      margin-bottom: 6px !important;
      border-radius: 12px !important;
      flex-wrap: nowrap !important;
      justify-content: space-between !important;
      gap: 6px !important;
    }
    .admin-brand-group {
      gap: 8px !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
    }
    .admin-brand-logo {
      width: 30px !important;
      height: 30px !important;
      font-size: 12px !important;
      border-radius: 8px !important;
      flex-shrink: 0 !important;
    }
    .admin-brand-title {
      font-size: 14px !important;
      line-height: 1.1 !important;
      margin: 0 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    .admin-brand-subtitle {
      display: none !important;
    }
    .admin-live-badge {
      padding: 1px 6px !important;
      font-size: 9px !important;
    }
    .admin-live-text {
      display: none !important;
    }
    .admin-top-controls {
      gap: 4px !important;
      flex-shrink: 0 !important;
    }
    .admin-top-controls button {
      padding: 5px 8px !important;
      font-size: 11px !important;
      border-radius: 8px !important;
    }
    .admin-btn-label {
      display: none !important;
    }
    .admin-user-pill {
      display: none !important;
    }

    /* Ultra-compact horizontal swipeable KPI stats (takes ~52px height) */
    .admin-stats-strip {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      gap: 6px !important;
      padding: 2px 2px 6px 2px !important;
      margin-bottom: 6px !important;
      scrollbar-width: none !important;
    }
    .admin-stats-strip::-webkit-scrollbar {
      display: none !important;
    }
    .admin-stat-card {
      min-width: 120px !important;
      max-width: 135px !important;
      flex: 0 0 auto !important;
      padding: 6px 9px !important;
      border-radius: 10px !important;
    }
    .admin-stat-title {
      font-size: 10px !important;
      white-space: nowrap !important;
    }
    .admin-stat-value {
      font-size: 16px !important;
      margin: 1px 0 2px 0 !important;
    }
    .admin-stat-badge {
      font-size: 9px !important;
      padding: 1px 5px !important;
      white-space: nowrap !important;
    }
    .admin-stat-icon {
      width: 13px !important;
      height: 13px !important;
    }

    /* Horizontal swipeable tabs track (takes ~36px height) */
    .admin-tabs-track {
      display: flex !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      gap: 5px !important;
      padding: 2px 2px 6px 2px !important;
      margin-bottom: 8px !important;
      justify-content: flex-start !important;
      scrollbar-width: none !important;
    }
    .admin-tabs-track::-webkit-scrollbar {
      display: none !important;
    }
    .admin-tab-btn {
      flex: 0 0 auto !important;
      padding: 6px 11px !important;
      font-size: 12px !important;
      border-radius: 8px !important;
      white-space: nowrap !important;
    }

    /* Data Table Container fits phone screen */
    .admin-table-container,
    div[style*="border-radius: 16px"] {
      border-radius: 12px !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      margin-bottom: 12px !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
    }
    th, td {
      padding: 9px 10px !important;
      font-size: 12px !important;
    }
    img[style*="width: 48px"] {
      width: 36px !important;
      height: 36px !important;
    }
    div[style*="width: 48px"] {
      width: 36px !important;
      height: 36px !important;
    }
  }
`;