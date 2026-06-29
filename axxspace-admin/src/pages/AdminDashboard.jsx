import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AdminHeader from "../components/AdminHeader";
import StatsCard from "../components/StatsCard";
import TabNavigation from "../components/TabNavigation";
import NotificationPanel from "../components/NotificationPanel";
import { getPricelistUrl, openAdminFile, resolveMediaUrl } from "../utils/fileLinks";
import "./AdminDashboard.css";

// ── tiny helpers ──────────────────────────────────────────────
const TABS = ["overview", "properties", "materials", "tourism", "movers", "sellers", "sold", "payment", "boosts", "businesses", "announcements", "verification"];
const TAB_LABELS = {
  overview: "📊 Dashboard Overview",
  properties: "🏠 Properties",
  materials: "🛍️ Materials",
  tourism: "🏨 Tourism",
  movers: "🚛 Movers",
  sellers: "📋 Sellers",
  sold: "💰 Sold",
  payment: "💳 Payment",
  boosts: "🚀 Payments",
  businesses: "🏪 Businesses",
  announcements: "📢 Announcements",
  verification: "✓ KYC Verification"
};
const STATUS_VIEWS = ["pending", "approved", "rejected"];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allPending, setAllPending] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [viewStats, setViewStats] = useState(null);
  const [topViewed, setTopViewed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusView, setStatusView] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── NOTIFICATION STATE ─────────────────────────────────────
  const [pendingBoosts, setPendingBoosts] = useState([]);
  const [allBoosts, setAllBoosts] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostMessage, setBoostMessage] = useState("");

  // ── UNIFIED NOTIFICATIONS STATE ───────────────────────────────
  const [allNotifications, setAllNotifications] = useState([]);
  const [notificationSummary, setNotificationSummary] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

  const [mpesaConfig, setMpesaConfig] = useState({ mpesa_shortcode: "", mpesa_passkey: "", mpesa_consumer_key: "", mpesa_consumer_secret: "" });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState("");

  // ── BUSINESSES STATE ───────────────────────────────────────
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedBusinessForFeature, setSelectedBusinessForFeature] = useState(null);
  const [featureDuration, setFeatureDuration] = useState(30);

  // ── ANNOUNCEMENTS STATE ────────────────────────────────────
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // ── KYC VERIFICATION STATE ─────────────────────────────────
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ── auth guard ─────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "admin") { navigate("/login"); return; }
    loadStats();
    loadAllPending();
    loadMpesaConfig();
    loadViewStats();
    loadTopViewed();
    loadPendingBoosts();
    loadAllBoosts();
    loadAllNotifications();
  }, [user, navigate]);

  // ── load pending announcements when tab changes ─────────────
  useEffect(() => {
    if (activeTab === "announcements") {
      loadPendingAnnouncements();
    }
  }, [activeTab]);

  // ── poll for new notifications every 30 seconds ─────────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadPendingBoosts();
      loadAllNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── load pending KYC verifications when tab changes ─────────
  useEffect(() => {
    if (activeTab === "verification") {
      loadPendingVerifications();
    }
  }, [activeTab, statusView]);

  // ── KYC VERIFICATION FUNCTIONS ───────────────────────────────
  const loadPendingVerifications = async () => {
    setVerificationLoading(true);
    try {
      const res = await API.get(`/kyc-verification/admin/pending?status=${statusView}`);
      setPendingVerifications(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load pending verifications:", err);
    } finally {
      setVerificationLoading(false);
    }
  };

  const loadVerificationDetails = async (verificationId) => {
    try {
      const res = await API.get(`/kyc-verification/admin/${verificationId}`);
      setSelectedVerification(res.data?.data);
    } catch (err) {
      console.error("Failed to load verification details:", err);
    }
  };

  const handleOpenFile = async (url) => {
    try {
      await openAdminFile(url);
    } catch (err) {
      alert(err.message || "Unable to open file");
    }
  };

  const handleApproveVerification = async (verificationId) => {
    if (!window.confirm("Are you sure you want to approve this verification?")) return;
    try {
      await API.put(`/kyc-verification/admin/${verificationId}/approve`);
      alert("✅ Verification approved successfully");
      loadPendingVerifications();
      setSelectedVerification(null);
    } catch (err) {
      alert("❌ Failed to approve verification");
    }
  };

  const handleRejectVerification = async (verificationId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    if (!window.confirm("Are you sure you want to reject this verification?")) return;
    try {
      await API.put(`/kyc-verification/admin/${verificationId}/reject`, { rejectionReason });
      alert("✅ Verification rejected successfully");
      loadPendingVerifications();
      setSelectedVerification(null);
      setRejectionReason('');
    } catch (err) {
      alert("❌ Failed to reject verification");
    }
  };

  // ── reload items when tab or statusView changes ─────────────
  useEffect(() => {
    if (activeTab === "overview") {
      loadStats();
      loadViewStats();
      loadTopViewed();
      loadAllPending();
    } else if (activeTab === "verification") {
      loadPendingVerifications();
    } else if (activeTab === "announcements") {
      loadPendingAnnouncements();
    } else if (activeTab === "sold") {
      loadItems("sold", "sold");
    } else if (activeTab === "boosts") {
      loadAllBoosts();
    } else if (activeTab === "businesses") {
      loadPendingBusinesses();
    } else if (activeTab !== "payment") {
      loadItems(activeTab, statusView);
      loadViewStats(activeTab);
      loadTopViewed(activeTab);
    }
  }, [activeTab, statusView]);

  // ── data loaders ───────────────────────────────────────────
  const loadStats = async () => {
    try { const r = await API.get("/admin/stats"); setStats(r.data); }
    catch (e) { console.error(e); }
  };

  const loadViewStats = async (type = null) => {
    try {
      const params = type ? { type } : {};
      const r = await API.get("/admin/view-stats", { params });
      setViewStats(r.data);
    } catch (e) { console.error(e); }
  };

  const loadTopViewed = async (type = null) => {
    try {
      const params = type ? { type, limit: 10 } : { limit: 10 };
      const r = await API.get("/admin/top-viewed", { params });
      setTopViewed(r.data);
    } catch (e) { console.error(e); }
  };

  const loadAllPending = async () => {
    try {
      setLoading(true);
      const r = await API.get("/admin/pending");
      setAllPending(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadItems = async (type, status) => {
    try {
      setLoading(true);
      const r = await API.get(`/admin/all?type=${type}&status=${status}`);
      setAllItems(Array.isArray(r.data) ? r.data : []);
    } catch (e) { console.error(e); setAllItems([]); }
    finally { setLoading(false); }
  };

  const loadMpesaConfig = async () => {
    try {
      const r = await API.get("/config");
      setMpesaConfig({
        mpesa_shortcode: r.data.mpesa_shortcode || "",
        mpesa_passkey: r.data.mpesa_passkey || "",
        mpesa_consumer_key: r.data.mpesa_consumer_key || "",
        mpesa_consumer_secret: r.data.mpesa_consumer_secret || "",
      });
    } catch (e) { console.error(e); }
  };

  // ── NOTIFICATION LOADERS (uses your existing /payment/notifications) ──
  const loadPendingBoosts = async () => {
    try {
      const r = await API.get("/payment/notifications");
      const all = Array.isArray(r.data?.notifications) ? r.data.notifications : [];
      setPendingBoosts(all.filter(n => !n.read));
    } catch (e) { console.error("notifications load:", e); }
  };

  const loadAllBoosts = async () => {
    try {
      setBoostLoading(true);
      const r = await API.get("/payment/notifications");
      setAllBoosts(Array.isArray(r.data?.notifications) ? r.data.notifications : []);
    } catch (e) { console.error("all notifications load:", e); }
    finally { setBoostLoading(false); }
  };

  // ── LOAD ALL UNIFIED NOTIFICATIONS ─────────────────────────────
  const loadAllNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const r = await API.get("/admin/notifications");
      const notifications = Array.isArray(r.data?.notifications) ? r.data.notifications : [];
      setAllNotifications(notifications);
      setNotificationSummary(r.data?.summary || null);

      // Check for new notifications and show alert
      if (notifications.length > previousNotificationCount && previousNotificationCount > 0) {
        const newCount = notifications.length - previousNotificationCount;
        alert(`🔔 You have ${newCount} new notification${newCount > 1 ? 's' : ''} awaiting approval!`);
      }
      setPreviousNotificationCount(notifications.length);
    } catch (e) { console.error("unified notifications load:", e); }
    finally { setNotificationsLoading(false); }
  };

  // ── MARK NOTIFICATION AS READ (confirm payment) ─────────────
  const handleApproveBoost = async (notifId, badgeId = null) => {
    try {
      const payload = { approve: true };
      if (badgeId) {
        payload.badgeId = badgeId;
      }
      await API.put(`/payment/notifications/${notifId}/read`, payload);
      setBoostMessage(badgeId ? "✅ Payment confirmed & badge issued!" : "✅ Payment confirmed!");
      loadPendingBoosts();
      loadAllBoosts();
      loadStats();
    } catch (e) {
      setBoostMessage("❌ Failed: " + (e.response?.data?.error || e.message));
    }
    setTimeout(() => setBoostMessage(""), 4000);
  };

  const handleRejectBoost = async (notifId) => {
    try {
      await API.put(`/payment/notifications/${notifId}/read`, { approve: false });
      setBoostMessage("✅ Notification rejected & dismissed.");
      loadPendingBoosts();
      loadAllBoosts();
    } catch (e) {
      setBoostMessage("❌ Failed: " + (e.response?.data?.error || e.message));
    }
    setTimeout(() => setBoostMessage(""), 4000);
  };
  const handleApprove = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/approve`);
      refresh();
      if (selected?._id === id) setSelected(null);
      alert("✅ Approved successfully");
    } catch (e) { alert("❌ Failed to approve"); }
  };

  const handleReject = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/reject`);
      refresh();
      if (selected?._id === id) setSelected(null);
      alert("✅ Rejected successfully");
    } catch (e) { alert("❌ Failed to reject"); }
  };

  const refresh = () => { loadStats(); loadAllPending(); loadItems(activeTab, statusView); };

  // ── delete ─────────────────────────────────────────────────
  const handleDelete = async (type, id) => {
    try {
      await API.delete(`/admin/${type}/${id}`);
      refresh();
      if (selected?._id === id) setSelected(null);
      alert("✅ Deleted successfully");
    } catch (e) {
      console.error("Delete error:", e);
      alert("❌ Failed to delete: " + (e.response?.data?.error || e.message));
    }
  };

  const confirmDelete = (type, id, title) => setDeleteConfirm({ type, id, title });
  const executeDelete = () => {
    if (deleteConfirm) { handleDelete(deleteConfirm.type, deleteConfirm.id); setDeleteConfirm(null); }
  };

  // ── export ─────────────────────────────────────────────────
  const exportData = () => {
    if (!filteredItems.length) return;
    const dataToExport = filteredItems.map(item => ({
      title: getTitle(item), category: item.category || item.county || "",
      owner: getOwner(item), contact: getContact(item), price: getPrice(item),
      status: item.status || (item.isApproved ? "approved" : "pending"),
      createdAt: item.createdAt || new Date().toISOString()
    }));
    const csv = [Object.keys(dataToExport[0]).join(","),
    ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activeTab}_${statusView}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); window.URL.revokeObjectURL(url);
  };

  // ── BUSINESSES FUNCTIONS ─────────────────────────────────────
  const loadPendingBusinesses = async () => {
    setBusinessesLoading(true);
    try {
      console.log("Loading businesses with status:", statusView);
      const res = await API.get(`/business/admin/${statusView}`);
      console.log("Businesses response:", res.data);
      setPendingBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleBusinessStatus = async (businessId, status) => {
    try {
      await API.patch(`/business/admin/${businessId}/status`, { status });
      setPendingBusinesses((prev) => prev.filter((b) => b._id !== businessId));
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

  const handleFeatureBusiness = async () => {
    try {
      console.log("handleFeatureBusiness called");
      console.log("Selected business:", selectedBusinessForFeature);
      console.log("Feature duration:", featureDuration);
      const featuredUntil = new Date(Date.now() + featureDuration * 24 * 60 * 60 * 1000);
      console.log("Featured until:", featuredUntil);
      const response = await API.patch(`/business/admin/${selectedBusinessForFeature._id}/feature`, {
        featured: true,
        featuredUntil
      });
      console.log("Feature response:", response);
      setShowFeatureModal(false);
      setSelectedBusinessForFeature(null);
      loadPendingBusinesses();
      alert("✅ Business featured successfully");
    } catch (err) {
      console.error("Feature error:", err);
      alert("❌ Failed to feature business: " + (err.response?.data?.error || err.message));
    }
  };

  const handleUnfeatureBusiness = async (businessId) => {
    try {
      console.log("handleUnfeatureBusiness called for:", businessId);
      const response = await API.patch(`/business/admin/${businessId}/feature`, { featured: false });
      console.log("Unfeature response:", response);
      loadPendingBusinesses();
      alert("✅ Business unfeatured successfully");
    } catch (err) {
      console.error("Unfeature error:", err);
      alert("❌ Failed to unfeature business: " + (err.response?.data?.error || err.message));
    }
  };

  // ── load all announcements ────────────────────────────────
  const loadPendingAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await API.get("/business/admin/announcements");
      setPendingAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // ── approve/reject announcement ────────────────────────────────
  const handleAnnouncementStatus = async (businessId, announcementId, status) => {
    try {
      await API.patch(`/business/admin/${businessId}/announcements/${announcementId}/status`, { status });
      loadPendingAnnouncements();
      alert(`✅ Announcement ${status} successfully`);
    } catch (err) {
      alert("❌ Failed to update announcement status");
    }
  };

  // ── delete announcement ────────────────────────────────
  const handleDeleteAnnouncement = async (businessId, announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    try {
      await API.delete(`/business/admin/${businessId}/announcements/${announcementId}`);
      loadPendingAnnouncements();
      alert("✅ Announcement deleted successfully");
    } catch (err) {
      alert("❌ Failed to delete announcement");
    }
  };

  // ── edit / save ────────────────────────────────────────────
  const openEdit = (item) => { setEditData({ ...item }); setEditMode(true); };
  const saveEdit = async () => {
    setSaving(true);
    try {
      const endpointMap = { properties: "properties", materials: "materials", tourism: "tourism" };
      const ep = endpointMap[activeTab];
      if (!ep) { alert("Edit not supported for this type."); setSaving(false); return; }
      await API.patch(`/${ep}/${editData._id}`, editData);
      refresh(); setEditMode(false); setSelected({ ...selected, ...editData });
      alert("✅ Saved successfully");
    } catch (e) { alert("❌ Failed to save: " + (e.response?.data?.error || e.message)); }
    finally { setSaving(false); }
  };

  // ── mpesa save ─────────────────────────────────────────────
  const handleSaveMpesaConfig = async () => {
    setConfigSaving(true);
    try {
      await Promise.all([
        API.post("/config", { key: "mpesa_shortcode", value: mpesaConfig.mpesa_shortcode, description: "M-Pesa Paybill/Shortcode" }),
        API.post("/config", { key: "mpesa_passkey", value: mpesaConfig.mpesa_passkey, description: "M-Pesa Passkey" }),
        API.post("/config", { key: "mpesa_consumer_key", value: mpesaConfig.mpesa_consumer_key, description: "M-Pesa Consumer Key" }),
        API.post("/config", { key: "mpesa_consumer_secret", value: mpesaConfig.mpesa_consumer_secret, description: "M-Pesa Consumer Secret" }),
      ]);
      setConfigMessage("✅ M-Pesa configuration saved successfully!");
    } catch (e) { setConfigMessage("❌ Failed to save configuration."); }
    finally { setConfigSaving(false); setTimeout(() => setConfigMessage(""), 3000); }
  };

  // ── pending counts for tab badge ───────────────────────────
  const pendingCount = (tab) => {
    if (tab === "businesses") {
      return stats?.businesses?.pending > 0 ? ` (${stats.businesses.pending})` : "";
    }
    if (tab === "announcements") {
      return pendingAnnouncements.length > 0 ? ` (${pendingAnnouncements.length})` : "";
    }
    if (!allPending) return "";
    const map = { properties: "properties", materials: "materials", tourism: "tourism", movers: "movers", sellers: "sellers" };
    const key = map[tab];
    return key && allPending[key]?.length ? ` (${allPending[key].length})` : "";
  };

  // ── items to show ──────────────────────────────────────────
  const displayItems = statusView === "pending" ? (allPending?.[activeTab] || []) : allItems;
  const filteredItems = displayItems.filter(item => {
    const matchesSearch = searchQuery === "" ||
      getTitle(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOwner(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getContact(item).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "" ||
      (item.category && item.category.toLowerCase() === filterCategory.toLowerCase()) ||
      (item.county && item.county.toLowerCase() === filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // ── field helpers ──────────────────────────────────────────
  const getTitle = (item) => item.title || item.name || item.businessName || "—";
  const getSub = (item) => {
    if (activeTab === "sold") {
      const typeLabels = { property: "🏠 Property", material: "🛍️ Material", tourism: "🏨 Tourism" };
      return `${typeLabels[item.itemType] || item.itemType} · ${item.category || item.county || ""}`;
    }
    return item.category || item.county || (item.businessRegNumber ? `Reg: ${item.businessRegNumber}` : "") || item.vehicleType || "—";
  };
  const getOwner = (item) => item.owner?.name || item.seller?.name || item.name || "—";
  const getContact = (item) => item.owner?.phone || item.seller?.phone || item.phone || item.owner?.email || "—";
  const getPrice = (item) => item.price != null ? `KES ${item.price.toLocaleString()}` : item.vehicleType || (item.kraPin ? `KRA: ${item.kraPin}` : "—");
  const getImages = (item) => {
    const imgs = item.images || item.photos || item.coverImage || item.image || [];
    if (typeof imgs === "string") return [imgs];
    return Array.isArray(imgs) ? imgs.filter(Boolean) : [];
  };

  const getNotifTitle = (n) => {
    if (n.isPayment || ["property_booking", "material_purchase", "tourism_booking", "boost", "subscription"].includes(n.type)) {
      if (n.type === "property_booking") return n.propertyId?.title || "Property Booking";
      if (n.type === "material_purchase") return n.materialId?.title || "Material Purchase";
      if (n.type === "tourism_booking") return n.tourismId?.title || "Tourism Booking";
      if (n.type === "boost") return n.plan ? `Listing Boost (${n.plan})` : "Listing Boost";
      if (n.type === "subscription") {
        if (n.plan && n.plan.startsWith("verification-")) {
          const badgeLabel = n.subscriptionType ? n.subscriptionType.replace("_", " ").toUpperCase() : "Verification Badge";
          return `Verification Sub: ${badgeLabel}`;
        }
        return `Subscription Payment (${n.subscriptionType || "Basic"})`;
      }
      return "Payment";
    }
    // For approval notifications
    const typeLabels = {
      property: "Property",
      material: "Material",
      tourism: "Tourism",
      mover: "Mover",
      seller: "Seller Verification",
      business: "Business",
      announcement: "Announcement"
    };
    return n.title || typeLabels[n.type] || "Upload";
  };

  const getNotifIcon = (type, isPayment) => {
    if (isPayment || ["property_booking", "material_purchase", "tourism_booking", "boost", "subscription"].includes(type)) {
      const icons = { property_booking: "🏠", material_purchase: "🛍️", tourism_booking: "🏨", boost: "🚀", subscription: "📋" };
      return icons[type] || "💳";
    }
    const icons = { property: "🏠", material: "🛍️", tourism: "🏨", mover: "🚛", seller: "📋", business: "🏪", announcement: "📢" };
    return icons[type] || "📄";
  };

  const hasPendingBoosts = pendingBoosts.length > 0;
  const hasAllNotifications = allNotifications.length > 0;

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="admin-dashboard-container">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="brand-emoji">🛡️</span> AXXSPACE ADMIN
          <button className="btn-close-sidebar-mobile" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <div className="admin-sidebar-subtitle">Control Center</div>
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
            if (tab !== "sold" && tab !== "payment" && tab !== "boosts") setStatusView("pending");
          }}
          pendingCounts={{
            allPending,
            businesses: stats?.businesses,
            announcements: pendingAnnouncements.length,
            verification: pendingVerifications.length
          }}
          hasPendingBoosts={hasPendingBoosts}
          pendingBoosts={pendingBoosts}
        />
      </aside>
      <main className="admin-main-content">
        <div className="mobile-header-bar">
          <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(true)}>
            ☰ Menu
          </button>
          <span className="mobile-logo-text">🛡️ AXXSPACE</span>
        </div>

        {/* HEADER */}
        <AdminHeader>
          <NotificationPanel
            showNotifPanel={showNotifPanel}
            setShowNotifPanel={setShowNotifPanel}
            notifications={allNotifications}
            onApprove={handleApproveBoost}
            onReject={handleRejectBoost}
            onReview={(notif) => {
              if (notif) {
                const tabMap = {
                  property: "properties",
                  material: "materials",
                  tourism: "tourism",
                  mover: "movers",
                  seller: "sellers",
                  business: "businesses",
                  announcement: "announcements"
                };
                setActiveTab(tabMap[notif.type] || "properties");
                setStatusView("pending");
              } else {
                setActiveTab("properties");
                setStatusView("pending");
              }
            }}
          />
        </AdminHeader>

        {/* STATS */}
        {activeTab === "overview" && stats && (
          <>
            <div className="stats-grid">
              {[
                { label: "🏢 Properties", total: stats.properties.total, pending: stats.properties.pending, color: "#3b82f6" },
                { label: "🛍️ Materials", total: stats.materials.total, pending: stats.materials.pending, color: "#22c55e" },
                { label: "🚛 Movers", total: stats.movers.total, pending: stats.movers.pending, color: "#f59e0b" },
                { label: "🏨 Tourism", total: stats.tourism.total, pending: stats.tourism.pending, color: "#8b5cf6" },
                { label: "📋 Sellers", total: stats.sellers.total, pending: stats.sellers.pending, color: "#ec4899" },
                { label: "💳 Payments", total: allBoosts.length, pending: pendingBoosts.length, color: "#fbbf24", isPulse: pendingBoosts.length > 0 },
              ].map(s => (
                <StatsCard
                  key={s.label}
                  label={s.label}
                  total={s.total}
                  pending={s.pending}
                  color={s.color}
                  isPulse={s.isPulse}
                />
              ))}
            </div>

            {/* VIEW STATISTICS */}
            {viewStats && (
              <div className="chart-container">
                <h3 className="chart-title">👁️ View Statistics by Category</h3>
                <div className="view-stats-grid">
                  {viewStats.properties && viewStats.properties.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🏠 Properties</h4>
                      {viewStats.properties.map(stat => (
                        <div key={stat._id} className="view-stat-item">
                          <span className="view-stat-label">{stat._id}</span>
                          <span className="view-stat-value">{stat.totalViews.toLocaleString()} views</span>
                          <span className="view-stat-meta">({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {viewStats.materials && viewStats.materials.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🛍️ Materials</h4>
                      {viewStats.materials.map(stat => (
                        <div key={stat._id} className="view-stat-item">
                          <span className="view-stat-label">{stat._id}</span>
                          <span className="view-stat-value">{stat.totalViews.toLocaleString()} views</span>
                          <span className="view-stat-meta">({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {viewStats.tourism && viewStats.tourism.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🏨 Tourism</h4>
                      {viewStats.tourism.map(stat => (
                        <div key={stat._id} className="view-stat-item">
                          <span className="view-stat-label">{stat._id}</span>
                          <span className="view-stat-value">{stat.totalViews.toLocaleString()} views</span>
                          <span className="view-stat-meta">({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOP VIEWED ITEMS */}
            {topViewed && (
              <div className="chart-container">
                <h3 className="chart-title">🔥 Top Viewed Items</h3>
                <div className="top-viewed-grid">
                  {topViewed.properties && topViewed.properties.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🏠 Properties</h4>
                      {topViewed.properties.map(item => (
                        <div key={item._id} className="top-view-item">
                          <span className="top-view-title">{item.title}</span>
                          <span className="top-view-meta">{item.location} · {item.propertyType}</span>
                          <span className="top-view-value">{item.views.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {topViewed.materials && topViewed.materials.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🛍️ Materials</h4>
                      {topViewed.materials.map(item => (
                        <div key={item._id} className="top-view-item">
                          <span className="top-view-title">{item.title}</span>
                          <span className="top-view-meta">{item.category} · {item.condition}</span>
                          <span className="top-view-value">{item.views.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {topViewed.tourism && topViewed.tourism.length > 0 && (
                    <div className="view-stat-section">
                      <h4 className="view-stat-title">🏨 Tourism</h4>
                      {topViewed.tourism.map(item => (
                        <div key={item._id} className="top-view-item">
                          <span className="top-view-title">{item.title}</span>
                          <span className="top-view-meta">{item.location} · {item.category}</span>
                          <span className="top-view-value">{item.views.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ACTIVITY CHART */}
            <div className="chart-container">
              <h3 className="chart-title">📊 Overview Distribution</h3>
              <div className="chart-bars">
                {[
                  { label: "Properties", total: stats.properties.total, pending: stats.properties.pending, color: "#3b82f6" },
                  { label: "Materials", total: stats.materials.total, pending: stats.materials.pending, color: "#22c55e" },
                  { label: "Movers", total: stats.movers.total, pending: stats.movers.pending, color: "#f59e0b" },
                  { label: "Tourism", total: stats.tourism.total, pending: stats.tourism.pending, color: "#8b5cf6" },
                  { label: "Sellers", total: stats.sellers.total, pending: stats.sellers.pending, color: "#ec4899" },
                  { label: "Businesses", total: stats.businesses?.total || 0, pending: stats.businesses?.pending || 0, color: "#fbbf24" },
                ].map(s => {
                  const maxTotal = Math.max(...[stats.properties.total, stats.materials.total, stats.movers.total, stats.tourism.total, stats.sellers.total, stats.businesses?.total || 0]);
                  const barWidth = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0;
                  const pendingWidth = maxTotal > 0 ? (s.pending / maxTotal) * 100 : 0;
                  return (
                    <div key={s.label} className="chart-bar">
                      <div className="chart-label">{s.label}</div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ width: `${barWidth}%`, background: s.color }} />
                        {s.pending > 0 && <div className="chart-bar-pending" style={{ width: `${pendingWidth}%` }} />}
                      </div>
                      <div className="chart-values">
                        <span className="chart-total">{s.total}</span>
                        {s.pending > 0 && <span className="chart-pending">{s.pending} pending</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="quick-actions">
              <h3 className="quick-actions-title">⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="btn-quick-action" onClick={() => { setActiveTab("properties"); setStatusView("pending"); }}>
                  <span className="quick-action-icon">🏠</span>
                  <span className="quick-action-text">Review Properties</span>
                  {stats?.properties?.pending > 0 && <span className="quick-action-badge">{stats.properties.pending}</span>}
                </button>
                <button className="btn-quick-action" onClick={() => { setActiveTab("materials"); setStatusView("pending"); }}>
                  <span className="quick-action-icon">🛍️</span>
                  <span className="quick-action-text">Review Materials</span>
                  {stats?.materials?.pending > 0 && <span className="quick-action-badge">{stats.materials.pending}</span>}
                </button>
                <button className="btn-quick-action" onClick={() => { setActiveTab("tourism"); setStatusView("pending"); }}>
                  <span className="quick-action-icon">🏨</span>
                  <span className="quick-action-text">Review Tourism</span>
                  {stats?.tourism?.pending > 0 && <span className="quick-action-badge">{stats.tourism.pending}</span>}
                </button>
                <button className="btn-quick-action" onClick={() => { setActiveTab("businesses"); setStatusView("pending"); }}>
                  <span className="quick-action-icon">🏪</span>
                  <span className="quick-action-text">Review Businesses</span>
                  {stats?.businesses?.pending > 0 && <span className="quick-action-badge">{stats.businesses.pending}</span>}
                </button>
                <button
                  className="btn-quick-action"
                  style={hasPendingBoosts ? { borderColor: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.3)" } : {}}
                  onClick={() => setActiveTab("boosts")}>
                  <span className="quick-action-icon">💳</span>
                  <span className="quick-action-text">Review Payments</span>
                  {hasPendingBoosts && <span className="quick-action-badge" style={{ background: "#ef4444" }}>{pendingBoosts.length}</span>}
                </button>
                <button className="btn-quick-action" onClick={() => setActiveTab("sold")}>
                  <span className="quick-action-icon">💰</span>
                  <span className="quick-action-text">View Sold Items</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tabs rendered in Sidebar */}

        {/* STATUS VIEW TOGGLE */}
        {activeTab !== "payment" && activeTab !== "sold" && activeTab !== "boosts" && (
          <div className="status-toggle">
            {STATUS_VIEWS.map(v => (
              <button key={v}
                className={`btn-status ${statusView === v ? 'active' : ''}`}
                onClick={() => setStatusView(v)}>
                {v === "pending" ? "⏳ Pending" : v === "approved" ? "✅ Approved" : "❌ Rejected"}
              </button>
            ))}
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        {activeTab !== "payment" && activeTab !== "boosts" && activeTab !== "businesses" && activeTab !== "verification" && (
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by title, owner, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button className="btn-clear-search" onClick={() => setSearchQuery("")}>✕</button>}
            </div>
            {(activeTab === "materials" || activeTab === "tourism" || activeTab === "properties") && (
              <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                {activeTab === "materials" && ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                {activeTab === "properties" && ["Apartment", "House", "Office", "Land", "Warehouse"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                {activeTab === "tourism" && ["Hotel", "Resort", "Airbnb", "Lodge", "Camping"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
            <button className="btn-export" onClick={exportData}>📥 Export CSV</button>
          </div>
        )}

        {/* RESULTS COUNT */}
        {activeTab !== "payment" && activeTab !== "boosts" && !loading && filteredItems.length > 0 && (
          <div className="results-count">
            Showing <strong>{filteredItems.length}</strong> of <strong>{displayItems.length}</strong> {activeTab}
            {(searchQuery || filterCategory) && <span className="filter-tag"> (filtered)</span>}
          </div>
        )}

        {/* BOOST / PAYMENT MESSAGE TOAST */}
        {boostMessage && (
          <div className={`boost-toast ${boostMessage.startsWith("✅") ? 'success' : 'error'}`}>
            {boostMessage}
          </div>
        )}

        {/* CONTENT */}
        {activeTab === "overview" ? null : activeTab === "boosts" ? (
          <PaymentNotifications
            pendingBoosts={pendingBoosts}
            allBoosts={allBoosts}
            boostLoading={boostLoading}
            onApprove={handleApproveBoost}
            onReject={handleRejectBoost}
            getNotifTitle={getNotifTitle}
            getNotifIcon={getNotifIcon}
          />
        ) : activeTab === "payment" ? (
          <PaymentSettings
            mpesaConfig={mpesaConfig} setMpesaConfig={setMpesaConfig}
            configSaving={configSaving} configMessage={configMessage}
            handleSave={handleSaveMpesaConfig} />
        ) : activeTab === "businesses" ? (
          businessesLoading ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>⏳ Loading pending businesses...</p>
            </div>
          ) : pendingBusinesses.length === 0 ? (
            <div className="empty">
              <p className="empty-text">✅ No pending businesses found.</p>
            </div>
          ) : (
            <div className="grid">
              {pendingBusinesses.map(business => (
                <div key={business._id} className="card admin-card">
                  {business.images && business.images.length > 0 && (
                    <div className="card-image" style={{ backgroundImage: `url(${business.images[0]})` }} />
                  )}
                  <div className="card-body">
                    <p className="card-title">{business.name}</p>
                    <p className="card-subtitle">{business.categories.join(", ")}</p>
                    <p className="card-owner">📍 {business.location.town}, {business.location.county}</p>
                    <p className="card-owner">👤 {business.submitterName || business.owner?.name || "Anonymous"}</p>
                    <p className="card-owner">📞 {business.contact.phone}</p>
                    <p className="card-owner">📸 {business.images && business.images.length > 0 ? `${business.images.length} photos` : "No photos"}</p>
                    {business.pricelist?.url && (
                      <p className="card-owner">
                        <button
                          type="button"
                          className="doc-link"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          onClick={() => window.open(getPricelistUrl(business.pricelist), "_blank", "noopener,noreferrer")}
                        >
                          📄 View pricelist
                        </button>
                      </p>
                    )}
                    <div className="card-footer">
                      <span className="status-dot" style={{ background: business.status === "approved" ? "#22c55e" : business.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                        {business.status}
                      </span>
                    </div>
                    <div className="card-buttons">
                      <button className="btn-approve" onClick={() => handleBusinessStatus(business._id, "approved")}>✅ Approve</button>
                      <button className="btn-reject" onClick={() => handleBusinessStatus(business._id, "rejected")}>❌ Reject</button>
                    </div>
                    {business.status === "approved" && (
                      <button
                        className="btn-view"
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          background: business.featured ? "#ef4444" : "#fbbf24",
                          color: "#0f1729",
                          cursor: "pointer",
                          pointerEvents: "auto",
                          zIndex: 10,
                          position: "relative"
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Feature button clicked for business:", business.name, business._id);
                          console.log("Business status:", business.status);
                          console.log("Business featured:", business.featured);
                          if (business.featured) {
                            console.log("Unfeaturing business");
                            handleUnfeatureBusiness(business._id);
                          } else {
                            console.log("Opening feature modal");
                            setSelectedBusinessForFeature(business);
                            setShowFeatureModal(true);
                          }
                        }}
                      >
                        {business.featured ? "🚫 Unfeature" : "⭐ Feature Business"}
                      </button>
                    )}
                    <select
                      className="filter-select"
                      style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}
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
                    <button
                      className="btn-view"
                      style={{ marginTop: "10px", width: "100%" }}
                      onClick={() => navigate(`/business/${business._id}`)}
                    >
                      👁️ View Details & Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "announcements" ? (
          announcementsLoading ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>⏳ Loading announcements...</p>
            </div>
          ) : pendingAnnouncements.length === 0 ? (
            <div className="empty">
              <p className="empty-text">✅ No announcements found.</p>
            </div>
          ) : (
            <div className="grid">
              {pendingAnnouncements.map(announcement => (
                <div key={announcement.announcementId} className="card admin-card">
                  <div className="card-body">
                    <p className="card-title">{announcement.title}</p>
                    <p className="card-subtitle">📢 {announcement.businessName}</p>
                    <p className="card-owner">👤 Submitted by: {announcement.submitterName || "Unknown"}</p>
                    {announcement.organizationName && (
                      <p className="card-owner">🏢 Organization: {announcement.organizationName}</p>
                    )}
                    <p className="card-owner">📅 {new Date(announcement.createdAt).toLocaleDateString()}</p>
                    <p className="card-owner" style={{ color: announcement.status === "approved" ? "#22c55e" : announcement.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                      Status: {announcement.status.toUpperCase()}
                    </p>
                    <p className="card-owner">{announcement.content}</p>
                    <div className="card-buttons">
                      {announcement.status === "pending" && (
                        <>
                          <button className="btn-approve" onClick={() => handleAnnouncementStatus(announcement.businessId, announcement.announcementId, "approved")}>✅ Approve</button>
                          <button className="btn-reject" onClick={() => handleAnnouncementStatus(announcement.businessId, announcement.announcementId, "rejected")}>❌ Reject</button>
                        </>
                      )}
                      <button className="btn-delete" onClick={() => handleDeleteAnnouncement(announcement.businessId, announcement.announcementId)}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "verification" ? (
          selectedVerification ? (
            <div className="verification-detail">
              <button className="btn-back" onClick={() => setSelectedVerification(null)}>← Back to List</button>
              <div className="detail-card">
                <h2 className="detail-title">Verification Details</h2>
                <div className="detail-section">
                  <p className="detail-label">User ID:</p>
                  <p className="detail-value">{selectedVerification.user?._id || selectedVerification.user}</p>
                </div>
                <div className="detail-section">
                  <p className="detail-label">Verification Level:</p>
                  <p className="detail-value">Level {selectedVerification.verificationLevel}</p>
                </div>
                <div className="detail-section">
                  <p className="detail-label">Status:</p>
                  <p className="detail-value" style={{ color: selectedVerification.status === 'approved' ? '#22c55e' : selectedVerification.status === 'rejected' ? '#ef4444' : '#fbbf24' }}>
                    {selectedVerification.status.toUpperCase()}
                  </p>
                </div>
                {selectedVerification.idType && (
                  <div className="detail-section">
                    <p className="detail-label">ID Type:</p>
                    <p className="detail-value">{selectedVerification.idType.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {selectedVerification.businessName && (
                  <div className="detail-section">
                    <p className="detail-label">Business Name:</p>
                    <p className="detail-value">{selectedVerification.businessName}</p>
                  </div>
                )}
                {selectedVerification.taxId && (
                  <div className="detail-section">
                    <p className="detail-label">Tax ID:</p>
                    <p className="detail-value">{selectedVerification.taxId}</p>
                  </div>
                )}
                {selectedVerification.physicalDetails && (
                  <div className="detail-section">
                    <p className="detail-label">Physical Address & Visitation Details:</p>
                    <p className="detail-value" style={{ whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px' }}>
                      {selectedVerification.physicalDetails}
                    </p>
                  </div>
                )}
                {selectedVerification.documents && selectedVerification.documents.length > 0 && (
                  <div className="detail-section">
                    <p className="detail-label">Documents:</p>
                    {selectedVerification.documents.map((doc, idx) => (
                      <div key={idx} className="document-item">
                        <p className="doc-type">{doc.type.replace(/_/g, ' ')}</p>
                        <button
                          type="button"
                          className="doc-link"
                          onClick={() => handleOpenFile(doc.url)}
                        >
                          📄 View / Download
                        </button>
                        <p style={{ fontSize: 11, color: '#64748b' }}>Filename: {doc.filename}</p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedVerification.selfie && selectedVerification.selfie.url && (
                  <div className="detail-section">
                    <p className="detail-label">Selfie:</p>
                    <img
                      src={resolveMediaUrl(selectedVerification.selfie.url)}
                      alt="Selfie"
                      className="selfie-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <button
                      type="button"
                      className="doc-link"
                      style={{ marginTop: "8px" }}
                      onClick={() => handleOpenFile(selectedVerification.selfie.url)}
                    >
                      📥 Download selfie
                    </button>
                    <p style={{ fontSize: 12, color: '#ef4444', display: 'none' }}>
                      ⚠️ Selfie image not available (file may not exist on server)
                    </p>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: '8px' }}>
                      Filename: {selectedVerification.selfie.filename}
                    </p>
                  </div>
                )}
                {selectedVerification.status === 'pending' && (
                  <div className="action-buttons">
                    <button className="btn-approve" onClick={() => handleApproveVerification(selectedVerification._id)}>
                      ✅ Approve
                    </button>
                    <div className="reject-section">
                      <textarea
                        className="reject-input"
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <button className="btn-reject" onClick={() => handleRejectVerification(selectedVerification._id)}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : verificationLoading ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>⏳ Loading verifications...</p>
            </div>
          ) : pendingVerifications.length === 0 ? (
            <div className="empty">
              <p className="empty-text">✅ No pending verifications found.</p>
            </div>
          ) : (
            <div className="grid">
              {pendingVerifications.map(verification => (
                <div key={verification._id} className="card admin-card">
                  <div className="card-body">
                    <p className="card-title">Level {verification.verificationLevel} Verification</p>
                    <p className="card-subtitle">👤 User: {verification.user?.name || verification.user?.email || 'Unknown'}</p>
                    <p className="card-owner">📅 Submitted: {new Date(verification.submittedAt).toLocaleDateString()}</p>
                    <p className="card-owner" style={{ color: '#fbbf24' }}>
                      Status: {verification.status.toUpperCase()}
                    </p>
                    <div className="card-buttons">
                      <button className="btn-view" onClick={() => loadVerificationDetails(verification._id)}>
                        👁️ Review Verification
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="loader">
            <div className="spinner"></div>
            <p>⏳ Loading {activeTab === "sold" ? "sold" : statusView} {activeTab}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty">
            <p className="empty-text">✅ No {activeTab === "sold" ? "sold" : statusView} {activeTab} found.</p>
            {(searchQuery || filterCategory) && (
              <button className="btn-reset" onClick={() => { setSearchQuery(""); setFilterCategory(""); }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid">
            {filteredItems.map(item => (
              <div key={item._id} className={`card admin-card ${item.isFeatured ? 'featured' : ''}`} onClick={() => setSelected(item)}>
                {item.isFeatured && <div className="featured-banner">⭐ FEATURED</div>}
                {getImages(item)[0] && (
                  <div className="card-image" style={{ backgroundImage: `url(${getImages(item)[0]})` }} />
                )}
                <div className="card-body">
                  <p className="card-title">{getTitle(item)}</p>
                  <p className="card-subtitle">{getSub(item)}</p>
                  <p className="card-owner">👤 {getOwner(item)} · {getContact(item)}</p>
                  <div className="card-footer">
                    <span className="price-badge">{getPrice(item)}</span>
                    <span className="status-dot" style={{ background: item.status === "approved" || item.isApproved ? "#22c55e" : item.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                      {item.status || (item.isApproved ? "approved" : "pending")}
                    </span>
                  </div>
                  {statusView === "pending" && activeTab !== "sold" && (
                    <div className="card-buttons" onClick={e => e.stopPropagation()}>
                      <button className="btn-approve" onClick={() => handleApprove(activeTab, item._id)}>✅ Approve</button>
                      <button className="btn-reject" onClick={() => handleReject(activeTab, item._id)}>❌ Reject</button>
                    </div>
                  )}
                  <button className="btn-delete" onClick={(e) => { e.stopPropagation(); confirmDelete(activeTab, item._id, getTitle(item)); }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAIL MODAL */}
        {selected && (
          <DetailModal
            item={selected} tab={activeTab} statusView={statusView}
            onClose={() => { setSelected(null); setEditMode(false); }}
            onApprove={() => handleApprove(activeTab, selected._id)}
            onReject={() => handleReject(activeTab, selected._id)}
            editMode={editMode} editData={editData} setEditData={setEditData}
            onEdit={() => openEdit(selected)} onSave={saveEdit} saving={saving}
            onCancelEdit={() => setEditMode(false)}
            onDelete={confirmDelete}
            getImages={getImages} getTitle={getTitle} getOwner={getOwner} getContact={getContact}
          />
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <h3 className="confirm-title">⚠️ Confirm Delete</h3>
              <p className="confirm-text">
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?
                <br />
                <span style={{ fontSize: 12, color: "#ef4444" }}>This action cannot be undone.</span>
              </p>
              <div className="confirm-buttons">
                <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-confirm-delete" onClick={executeDelete}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── PAYMENT NOTIFICATIONS TAB ─────────────────────────────────
function PaymentNotifications({ pendingBoosts, allBoosts, boostLoading, onApprove, onReject, getNotifTitle, getNotifIcon }) {
  const [viewMode, setViewMode] = useState("pending");
  const [selectedBadges, setSelectedBadges] = useState({});
  const displayed = viewMode === "pending" ? pendingBoosts : allBoosts;

  const VERIFICATION_BADGES = [
    { id: "student_verified", name: "Student Verified", image: "/Student Verified.png" },
    { id: "business_verified", name: "Business Verified", image: "/Business Verified.png" },
    { id: "identity_verified", name: "Identity Verified", image: "/Identity Verified.png" },
    { id: "location_verified", name: "Location Verified", image: "/Locationn Verified.png" },
    { id: "online_verified", name: "Online Verified", image: "/Online Verified.png" },
    { id: "premium_verified", name: "Premium Verified", image: "/Premium Verified.png" },
  ];

  const typeLabel = (type) => {
    const labels = { property_booking: "Property Booking", material_purchase: "Material Purchase", tourism_booking: "Tourism Booking", boost: "Listing Boost", subscription: "Subscription" };
    return labels[type] || type;
  };

  const statusColor = (n) => {
    if (n.read) return "#22c55e";
    return "#fbbf24";
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className={`btn-status ${viewMode === "pending" ? 'active' : ''}`}
          style={{ position: "relative" }}
          onClick={() => setViewMode("pending")}>
          🔴 Unread Payments
          {pendingBoosts.length > 0 && (
            <span className="notification-badge" style={{ position: "static", display: "inline-flex", marginLeft: 8 }}>
              {pendingBoosts.length}
            </span>
          )}
        </button>
        <button className={`btn-status ${viewMode === "all" ? 'active' : ''}`} onClick={() => setViewMode("all")}>
          📋 All Payments
        </button>
      </div>

      {boostLoading ? (
        <div className="loader"><div className="spinner"></div><p>Loading payments...</p></div>
      ) : displayed.length === 0 ? (
        <div className="empty">
          <p className="empty-text">
            {viewMode === "pending" ? "✅ No unread payment notifications." : "No payment records found."}
          </p>
        </div>
      ) : (
        <div className="boost-grid">
          {displayed.map(notif => (
            <div key={notif._id}
              className={`boost-card ${!notif.read ? 'pending' : ''} ${!notif.read ? 'glow' : ''}`}>
              {!notif.read && (
                <div className="boost-pending-strip">
                  <span className="notification-red-dot" />
                  NEW PAYMENT — AWAITING REVIEW
                </div>
              )}

              <div className="boost-card-body">
                <div style={{ marginBottom: 16 }}>
                  <p className="boost-listing-title">
                    {getNotifIcon(notif.type)} {getNotifTitle(notif)}
                    {notif.read && <span className="boost-featured-tag" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>✅ Read</span>}
                  </p>
                  <p className="boost-listing-meta">{typeLabel(notif.type)}</p>
                </div>

                <div className="boost-details">
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">👤 User</span>
                    <span className="boost-detail-val">{notif.userName || "—"}</span>
                  </div>
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">📞 Phone</span>
                    <span className="boost-detail-val">{notif.userPhone || "—"}</span>
                  </div>
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">✉️ Email</span>
                    <span className="boost-detail-val">{notif.userEmail || "—"}</span>
                  </div>
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">💰 Amount</span>
                    <span className="boost-detail-val" style={{ color: "#fbbf24", fontWeight: 700 }}>
                      KES {notif.amount?.toLocaleString() || "—"}
                    </span>
                  </div>
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">🔖 Transaction ID</span>
                    <span className="boost-detail-val" style={{ fontFamily: "monospace", color: "#a78bfa", fontSize: 11 }}>
                      {notif.transactionId || notif.mpesaRef || "—"}
                    </span>
                  </div>
                  {notif.type === "tourism_booking" && notif.checkIn && (
                    <>
                      <div className="boost-detail-row">
                        <span className="boost-detail-key">📅 Check-in</span>
                        <span className="boost-detail-val">{new Date(notif.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="boost-detail-row">
                        <span className="boost-detail-key">📅 Check-out</span>
                        <span className="boost-detail-val">{new Date(notif.checkOut).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">📅 Received</span>
                    <span className="boost-detail-val">{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="boost-detail-row">
                    <span className="boost-detail-key">Status</span>
                    <span className="boost-detail-val" style={{ color: statusColor(notif), fontWeight: 700, textTransform: "capitalize" }}>
                      {notif.read ? "✅ Read" : "🔴 Unread"}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <>
                    <div style={{ marginTop: 16, padding: "16px", background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%)", borderRadius: "12px", border: "1px solid rgba(251, 191, 36, 0.25)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 16 }}>🏅</span>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.5px" }}>
                          ISSUE VERIFICATION BADGE
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginBottom: 12 }}>
                        <div
                          onClick={() => setSelectedBadges(prev => ({ ...prev, [notif._id]: "" }))}
                          style={{
                            padding: "10px 8px",
                            background: selectedBadges[notif._id] === "" ? "rgba(251, 191, 36, 0.2)" : "rgba(255, 255, 255, 0.05)",
                            border: selectedBadges[notif._id] === "" ? "2px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ fontSize: 20, marginBottom: 4 }}>❌</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>No Badge</div>
                        </div>
                        {VERIFICATION_BADGES.map(badge => (
                          <div
                            key={badge.id}
                            onClick={() => setSelectedBadges(prev => ({ ...prev, [notif._id]: badge.id }))}
                            style={{
                              padding: "10px 8px",
                              background: selectedBadges[notif._id] === badge.id ? "rgba(251, 191, 36, 0.2)" : "rgba(255, 255, 255, 0.05)",
                              border: selectedBadges[notif._id] === badge.id ? "2px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "8px",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "all 0.2s"
                            }}
                          >
                            <img
                              src={badge.image}
                              alt={badge.name}
                              style={{ width: 32, height: 32, objectFit: "contain", marginBottom: 4 }}
                            />
                            <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.2 }}>{badge.name}</div>
                          </div>
                        ))}
                      </div>

                      {selectedBadges[notif._id] && (
                        <div style={{
                          padding: "10px",
                          background: "rgba(251, 191, 36, 0.15)",
                          borderRadius: "8px",
                          border: "1px solid rgba(251, 191, 36, 0.3)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={VERIFICATION_BADGES.find(b => b.id === selectedBadges[notif._id])?.image}
                              alt="Badge Preview"
                              style={{ width: 48, height: 48, objectFit: "contain" }}
                            />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
                                {VERIFICATION_BADGES.find(b => b.id === selectedBadges[notif._id])?.name}
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                                Badge will be awarded to user upon payment confirmation
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="boost-actions" style={{ marginTop: 12 }}>
                      <button className="btn-boost-approve" onClick={() => onApprove(notif._id, selectedBadges[notif._id])}>
                        ✅ Mark as Confirmed
                      </button>
                      <button className="btn-boost-reject" onClick={() => onReject(notif._id)}>
                        ✕ Dismiss
                      </button>
                    </div>
                  </>
                )}
                {notif.read && (
                  <div style={{ padding: "10px 0", color: "#22c55e", fontWeight: 600, fontSize: 13 }}>
                    ✅ Payment reviewed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEATURE BUSINESS MODAL */}
      {showFeatureModal && selectedBusinessForFeature && (
        <div className="modal-overlay" onClick={() => setShowFeatureModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⭐ Feature Business</h2>
              <button className="btn-close-modal" onClick={() => setShowFeatureModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "20px" }}>
                Feature <strong>{selectedBusinessForFeature.name}</strong> on the homepage?
              </p>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Feature Duration (days):
                </label>
                <select
                  value={featureDuration}
                  onChange={(e) => setFeatureDuration(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px"
                  }}
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
                This business will appear in the featured section on the homepage until {new Date(Date.now() + featureDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowFeatureModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeatureBusiness}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#fbbf24",
                    color: "#0f1729",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ⭐ Feature Business
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DETAIL MODAL ──────────────────────────────────────────────
function DetailModal({ item, tab, statusView, onClose, onApprove, onReject,
  editMode, editData, setEditData, onEdit, onSave, saving, onCancelEdit, onDelete,
  getImages, getTitle, getOwner, getContact }) {

  const images = getImages(item);
  const [imgIdx, setImgIdx] = useState(0);
  const fields = Object.entries(item).filter(([k]) =>
    !["_id", "__v", "password", "emailVerificationToken", "resetPasswordToken",
      "images", "photos", "coverImage", "image", "owner", "seller"].includes(k)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {item.isFeatured && <span style={{ marginRight: 8 }}>⭐</span>}
            {getTitle(item)}
          </h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {images.length > 0 && (
            <div className="modal-image-section">
              <img src={images[imgIdx]} alt="" className="modal-main-image" />
              {images.length > 1 && (
                <div className="modal-thumb-row">
                  {images.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setImgIdx(i)}
                      className={`modal-thumb ${i === imgIdx ? 'active' : ''}`} />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="owner-box">
            <p className="owner-line">👤 <strong>{getOwner(item)}</strong> &nbsp;|&nbsp; 📞 {getContact(item)}</p>
            {item.owner?.email && <p className="owner-line">✉️ {item.owner.email}</p>}
          </div>
          {editMode ? (
            <div className="edit-grid">
              {Object.entries(editData)
                .filter(([k]) => !["_id", "__v", "password", "owner", "seller", "images", "photos", "coverImage", "image", "emailVerificationToken", "resetPasswordToken"].includes(k))
                .map(([k, v]) => (
                  typeof v === "object" ? null :
                    <div key={k} className="edit-field">
                      <label className="edit-label">{k}</label>
                      <input className="edit-input" value={v ?? ""} onChange={e => setEditData({ ...editData, [k]: e.target.value })} />
                    </div>
                ))}
            </div>
          ) : (
            <div className="fields-grid">
              {fields.map(([k, v]) => (
                typeof v === "object" ? null :
                  <div key={k} className="field-row">
                    <span className="field-key">{k}</span>
                    <span className="field-value">{String(v ?? "—")}</span>
                  </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {editMode ? (
            <>
              <button className="btn-save" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "💾 Save Changes"}</button>
              <button className="btn-cancel" onClick={onCancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              {statusView === "pending" && tab !== "sold" && (
                <>
                  <button className="btn-approve" onClick={onApprove}>✅ Approve</button>
                  <button className="btn-reject" onClick={onReject}>❌ Reject</button>
                </>
              )}
              {["properties", "materials", "tourism"].includes(tab) && tab !== "sold" && (
                <button className="btn-edit" onClick={onEdit}>✏️ Edit</button>
              )}
              <button className="btn-delete" onClick={() => onDelete(tab, item._id, item.title || item.name || item.businessName)}>🗑️ Delete</button>
              <button className="btn-cancel" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PAYMENT SETTINGS ──────────────────────────────────────────
function PaymentSettings({ mpesaConfig, setMpesaConfig, configSaving, configMessage, handleSave }) {
  const fields = [
    ["mpesa_shortcode", "text", "Paybill/Shortcode", "e.g. 174379", "Your M-Pesa Paybill or Buy Goods Till Number"],
    ["mpesa_passkey", "password", "Passkey", "Enter passkey", "The passkey from your M-Pesa dashboard"],
    ["mpesa_consumer_key", "text", "Consumer Key", "Enter Consumer Key", "From Safaricom Developer Portal"],
    ["mpesa_consumer_secret", "password", "Consumer Secret", "Enter Consumer Secret", "From Safaricom Developer Portal"],
  ];
  return (
    <div className="config-box">
      <h2 className="config-title">💳 M-Pesa Configuration</h2>
      {configMessage && <div className={`config-message ${configMessage.startsWith("✅") ? 'success' : 'error'}`}>{configMessage}</div>}
      {fields.map(([k, type, label, placeholder, hint]) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <label className="edit-label">{label}</label>
          <input type={type} value={mpesaConfig[k]} placeholder={placeholder}
            onChange={e => setMpesaConfig({ ...mpesaConfig, [k]: e.target.value })} className="edit-input" />
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>{hint}</p>
        </div>
      ))}
      <button className="btn-save" onClick={handleSave} disabled={configSaving}>{configSaving ? "Saving…" : "💾 Save Configuration"}</button>
    </div>
  );
}