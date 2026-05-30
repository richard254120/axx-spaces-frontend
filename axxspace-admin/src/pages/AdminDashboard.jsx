import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// ── tiny helpers ──────────────────────────────────────────────
const TABS = ["properties", "materials", "tourism", "movers", "sellers", "sold", "payment", "boosts"];
const TAB_LABELS = {
  properties: "🏠 Properties", materials: "🛍️ Materials", tourism: "🏨 Tourism",
  movers: "🚛 Movers", sellers: "📋 Sellers", sold: "💰 Sold", payment: "💳 Payment", boosts: "🚀 Payments"
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
  const [activeTab, setActiveTab] = useState("properties");
  const [statusView, setStatusView] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── NOTIFICATION STATE ─────────────────────────────────────
  const [pendingBoosts, setPendingBoosts] = useState([]);
  const [allBoosts, setAllBoosts] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostMessage, setBoostMessage] = useState("");
  const notifRef = useRef(null);

  const [mpesaConfig, setMpesaConfig] = useState({ mpesa_shortcode: "", mpesa_passkey: "", mpesa_consumer_key: "", mpesa_consumer_secret: "" });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState("");

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
  }, [user, navigate]);

  // ── poll for new notifications every 30 seconds ─────────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadPendingBoosts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── close notif panel on outside click ─────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── reload items when tab or statusView changes ─────────────
  useEffect(() => {
    if (activeTab !== "payment" && activeTab !== "sold" && activeTab !== "boosts") {
      loadItems(activeTab, statusView);
      loadViewStats(activeTab);
      loadTopViewed(activeTab);
    } else if (activeTab === "sold") {
      loadItems("sold", "sold");
    } else if (activeTab === "boosts") {
      loadAllBoosts();
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

  // ── MARK NOTIFICATION AS READ (confirm payment) ─────────────
  const handleApproveBoost = async (notifId) => {
    try {
      await API.put(`/payment/notifications/${notifId}/read`);
      setBoostMessage("✅ Payment confirmed!");
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
      await API.put(`/payment/notifications/${notifId}/read`);
      setBoostMessage("✅ Notification dismissed.");
      loadPendingBoosts();
      loadAllBoosts();
    } catch (e) {
      setBoostMessage("❌ Failed: " + (e.response?.data?.error || e.message));
    }
    setTimeout(() => setBoostMessage(""), 4000);
  };

  // ── approve / reject listings ──────────────────────────────
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

  // ── notification helpers ───────────────────────────────────
  const getNotifTitle = (n) => {
    if (n.type === "property_booking") return n.propertyId?.title || "Property Booking";
    if (n.type === "material_purchase") return n.materialId?.title || "Material Purchase";
    if (n.type === "tourism_booking") return n.tourismId?.title || "Tourism Booking";
    if (n.type === "boost") return "Listing Boost";
    if (n.type === "subscription") return "Subscription Payment";
    return "Payment";
  };

  const getNotifIcon = (type) => {
    const icons = { property_booking: "🏠", material_purchase: "🛍️", tourism_booking: "🏨", boost: "🚀", subscription: "📋" };
    return icons[type] || "💳";
  };

  const hasPendingBoosts = pendingBoosts.length > 0;

  // ── render ─────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <h1 style={S.logo}>🛡️ Axxspace Admin</h1>
          <p style={S.logoSub}>Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* 🔔 NOTIFICATION BELL */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              style={S.notifBtn}
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className={hasPendingBoosts ? "notif-btn-active" : ""}
              title={hasPendingBoosts ? `${pendingBoosts.length} payment(s) awaiting confirmation` : "No pending payments"}
            >
              🔔
              {hasPendingBoosts && (
                <span style={S.notifBadge} className="notif-badge-blink">
                  {pendingBoosts.length}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN PANEL */}
            {showNotifPanel && (
              <div style={S.notifPanel} className="notif-panel-slide">
                <div style={S.notifPanelHeader}>
                  <span style={S.notifPanelTitle}>💳 Payment Notifications</span>
                  <button style={S.notifCloseBtn} onClick={() => setShowNotifPanel(false)}>✕</button>
                </div>

                {hasPendingBoosts ? (
                  <div style={S.notifList}>
                    {pendingBoosts.map(notif => (
                      <div key={notif._id} style={S.notifItem} className="notif-item-pulse">
                        <div style={S.notifItemHeader}>
                          <span style={S.notifRedDot} className="red-dot-blink" />
                          <span style={S.notifItemTitle}>
                            {getNotifIcon(notif.type)} {getNotifTitle(notif)}
                          </span>
                        </div>
                        <div style={S.notifItemMeta}>
                          <span>👤 {notif.userName || notif.userId?.name || "User"}</span>
                          <span>📞 {notif.userPhone || notif.userId?.phone || "—"}</span>
                        </div>
                        <div style={S.notifItemMeta}>
                          <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                            KES {notif.amount?.toLocaleString() || "—"}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>
                            {notif.mpesaRef || notif.transactionId || "Pending verification"}
                          </span>
                        </div>
                        {notif.type === "tourism_booking" && notif.checkIn && (
                          <div style={{ ...S.notifItemMeta, fontSize: 11 }}>
                            <span>📅 Check-in: {new Date(notif.checkIn).toLocaleDateString()}</span>
                            <span>Check-out: {new Date(notif.checkOut).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div style={S.notifItemMeta}>
                          <span style={{ color: "#64748b", fontSize: 10 }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div style={S.notifItemBtns}>
                          <button
                            style={S.notifApproveBtn}
                            onClick={() => { handleApproveBoost(notif._id); setShowNotifPanel(false); setActiveTab("boosts"); }}
                          >
                            ✅ Confirm
                          </button>
                          <button
                            style={S.notifRejectBtn}
                            onClick={() => handleRejectBoost(notif._id)}
                          >
                            ✕ Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={S.notifEmpty}>
                    <p>✅ No pending payment confirmations</p>
                  </div>
                )}

                <div style={S.notifFooter}>
                  <button style={S.notifViewAllBtn} onClick={() => { setActiveTab("boosts"); setShowNotifPanel(false); }}>
                    View All Payments →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button style={S.logoutBtn} onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <>
          <div style={S.statsGrid}>
            {[
              { label: "🏢 Properties", total: stats.properties.total, pending: stats.properties.pending, color: "#3b82f6" },
              { label: "🛍️ Materials", total: stats.materials.total, pending: stats.materials.pending, color: "#22c55e" },
              { label: "🚛 Movers", total: stats.movers.total, pending: stats.movers.pending, color: "#f59e0b" },
              { label: "🏨 Tourism", total: stats.tourism.total, pending: stats.tourism.pending, color: "#8b5cf6" },
              { label: "📋 Sellers", total: stats.sellers.total, pending: stats.sellers.pending, color: "#ec4899" },
              { label: "💳 Payments", total: allBoosts.length, pending: pendingBoosts.length, color: "#fbbf24", isPulse: pendingBoosts.length > 0 },
            ].map(s => (
              <div key={s.label}
                style={{ ...S.statCard, borderTop: `3px solid ${s.color}`, ...(s.isPulse && s.pending > 0 ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.4)" } : {}) }}
                className={s.isPulse && s.pending > 0 ? "stat-card-pulse" : ""}>
                <p style={S.statLabel}>{s.label}</p>
                <p style={{ ...S.statVal, color: s.color }}>{s.total}</p>
                {s.pending > 0 && (
                  <p style={S.statPending}>
                    {s.isPulse ? `🔴 ${s.pending} unread` : `${s.pending} pending`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* VIEW STATISTICS */}
          {viewStats && (
            <div style={S.chartContainer}>
              <h3 style={S.chartTitle}>👁️ View Statistics by Category</h3>
              <div style={S.viewStatsGrid}>
                {viewStats.properties && viewStats.properties.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🏠 Properties</h4>
                    {viewStats.properties.map(stat => (
                      <div key={stat._id} style={S.viewStatItem}>
                        <span style={S.viewStatLabel}>{stat._id}</span>
                        <span style={S.viewStatValue}>{stat.totalViews.toLocaleString()} views</span>
                        <span style={S.viewStatMeta}>({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                      </div>
                    ))}
                  </div>
                )}
                {viewStats.materials && viewStats.materials.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🛍️ Materials</h4>
                    {viewStats.materials.map(stat => (
                      <div key={stat._id} style={S.viewStatItem}>
                        <span style={S.viewStatLabel}>{stat._id}</span>
                        <span style={S.viewStatValue}>{stat.totalViews.toLocaleString()} views</span>
                        <span style={S.viewStatMeta}>({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                      </div>
                    ))}
                  </div>
                )}
                {viewStats.tourism && viewStats.tourism.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🏨 Tourism</h4>
                    {viewStats.tourism.map(stat => (
                      <div key={stat._id} style={S.viewStatItem}>
                        <span style={S.viewStatLabel}>{stat._id}</span>
                        <span style={S.viewStatValue}>{stat.totalViews.toLocaleString()} views</span>
                        <span style={S.viewStatMeta}>({stat.totalItems} items, avg {Math.round(stat.avgViews)} views)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOP VIEWED ITEMS */}
          {topViewed && (
            <div style={S.chartContainer}>
              <h3 style={S.chartTitle}>🔥 Top Viewed Items</h3>
              <div style={S.topViewedGrid}>
                {topViewed.properties && topViewed.properties.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🏠 Properties</h4>
                    {topViewed.properties.map(item => (
                      <div key={item._id} style={S.topViewItem}>
                        <span style={S.topViewTitle}>{item.title}</span>
                        <span style={S.topViewMeta}>{item.location} · {item.propertyType}</span>
                        <span style={S.topViewValue}>{item.views.toLocaleString()} views</span>
                      </div>
                    ))}
                  </div>
                )}
                {topViewed.materials && topViewed.materials.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🛍️ Materials</h4>
                    {topViewed.materials.map(item => (
                      <div key={item._id} style={S.topViewItem}>
                        <span style={S.topViewTitle}>{item.title}</span>
                        <span style={S.topViewMeta}>{item.category} · {item.condition}</span>
                        <span style={S.topViewValue}>{item.views.toLocaleString()} views</span>
                      </div>
                    ))}
                  </div>
                )}
                {topViewed.tourism && topViewed.tourism.length > 0 && (
                  <div style={S.viewStatSection}>
                    <h4 style={S.viewStatTitle}>🏨 Tourism</h4>
                    {topViewed.tourism.map(item => (
                      <div key={item._id} style={S.topViewItem}>
                        <span style={S.topViewTitle}>{item.title}</span>
                        <span style={S.topViewMeta}>{item.location} · {item.category}</span>
                        <span style={S.topViewValue}>{item.views.toLocaleString()} views</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY CHART */}
          <div style={S.chartContainer}>
            <h3 style={S.chartTitle}>📊 Overview Distribution</h3>
            <div style={S.chartBars}>
              {[
                { label: "Properties", total: stats.properties.total, pending: stats.properties.pending, color: "#3b82f6" },
                { label: "Materials", total: stats.materials.total, pending: stats.materials.pending, color: "#22c55e" },
                { label: "Movers", total: stats.movers.total, pending: stats.movers.pending, color: "#f59e0b" },
                { label: "Tourism", total: stats.tourism.total, pending: stats.tourism.pending, color: "#8b5cf6" },
                { label: "Sellers", total: stats.sellers.total, pending: stats.sellers.pending, color: "#ec4899" },
              ].map(s => {
                const maxTotal = Math.max(...[stats.properties.total, stats.materials.total, stats.movers.total, stats.tourism.total, stats.sellers.total]);
                const barWidth = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0;
                const pendingWidth = maxTotal > 0 ? (s.pending / maxTotal) * 100 : 0;
                return (
                  <div key={s.label} style={S.chartBar}>
                    <div style={S.chartLabel}>{s.label}</div>
                    <div style={S.chartBarTrack}>
                      <div style={{ ...S.chartBarFill, width: `${barWidth}%`, background: s.color }} />
                      {s.pending > 0 && <div style={{ ...S.chartBarPending, width: `${pendingWidth}%` }} />}
                    </div>
                    <div style={S.chartValues}>
                      <span style={S.chartTotal}>{s.total}</span>
                      {s.pending > 0 && <span style={S.chartPending}>{s.pending} pending</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={S.quickActions}>
            <h3 style={S.quickActionsTitle}>⚡ Quick Actions</h3>
            <div style={S.quickActionsGrid}>
              <button style={S.quickActionBtn} className="quickActionBtn" onClick={() => { setActiveTab("properties"); setStatusView("pending"); }}>
                <span style={S.quickActionIcon}>🏠</span>
                <span style={S.quickActionText}>Review Properties</span>
                {stats?.properties?.pending > 0 && <span style={S.quickActionBadge}>{stats.properties.pending}</span>}
              </button>
              <button style={S.quickActionBtn} className="quickActionBtn" onClick={() => { setActiveTab("materials"); setStatusView("pending"); }}>
                <span style={S.quickActionIcon}>🛍️</span>
                <span style={S.quickActionText}>Review Materials</span>
                {stats?.materials?.pending > 0 && <span style={S.quickActionBadge}>{stats.materials.pending}</span>}
              </button>
              <button style={S.quickActionBtn} className="quickActionBtn" onClick={() => { setActiveTab("tourism"); setStatusView("pending"); }}>
                <span style={S.quickActionIcon}>🏨</span>
                <span style={S.quickActionText}>Review Tourism</span>
                {stats?.tourism?.pending > 0 && <span style={S.quickActionBadge}>{stats.tourism.pending}</span>}
              </button>
              <button
                style={{ ...S.quickActionBtn, ...(hasPendingBoosts ? { borderColor: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.3)" } : {}) }}
                className="quickActionBtn"
                onClick={() => setActiveTab("boosts")}>
                <span style={S.quickActionIcon}>💳</span>
                <span style={S.quickActionText}>Review Payments</span>
                {hasPendingBoosts && <span style={{ ...S.quickActionBadge, background: "#ef4444" }} className="notif-badge-blink">{pendingBoosts.length}</span>}
              </button>
              <button style={S.quickActionBtn} className="quickActionBtn" onClick={() => setActiveTab("sold")}>
                <span style={S.quickActionIcon}>💰</span>
                <span style={S.quickActionText}>View Sold Items</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* TABS */}
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t}
            style={{
              ...S.tab,
              ...(activeTab === t ? S.tabActive : {}),
              ...(t === "boosts" && hasPendingBoosts ? S.tabBoostAlert : {})
            }}
            onClick={() => { setActiveTab(t); if (t !== "sold" && t !== "payment" && t !== "boosts") setStatusView("pending"); }}>
            {TAB_LABELS[t]}{pendingCount(t)}
            {t === "boosts" && hasPendingBoosts && (
              <span style={S.tabBadge} className="notif-badge-blink">{pendingBoosts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* STATUS VIEW TOGGLE */}
      {activeTab !== "payment" && activeTab !== "sold" && activeTab !== "boosts" && (
        <div style={S.statusToggle}>
          {STATUS_VIEWS.map(v => (
            <button key={v}
              style={{ ...S.stBtn, ...(statusView === v ? S.stBtnActive : {}) }}
              onClick={() => setStatusView(v)}>
              {v === "pending" ? "⏳ Pending" : v === "approved" ? "✅ Approved" : "❌ Rejected"}
            </button>
          ))}
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      {activeTab !== "payment" && activeTab !== "boosts" && (
        <div style={S.searchBar}>
          <div style={S.searchInputWrapper}>
            <span style={S.searchIcon}>🔍</span>
            <input
              style={S.searchInput}
              placeholder="Search by title, owner, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button style={S.clearBtn} onClick={() => setSearchQuery("")}>✕</button>}
          </div>
          {(activeTab === "materials" || activeTab === "tourism" || activeTab === "properties") && (
            <select style={S.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {activeTab === "materials" && ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              {activeTab === "properties" && ["Apartment", "House", "Office", "Land", "Warehouse"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              {activeTab === "tourism" && ["Hotel", "Resort", "Airbnb", "Lodge", "Camping"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}
          <button style={S.exportBtn} onClick={exportData}>📥 Export CSV</button>
        </div>
      )}

      {/* RESULTS COUNT */}
      {activeTab !== "payment" && activeTab !== "boosts" && !loading && filteredItems.length > 0 && (
        <div style={S.resultsCount}>
          Showing <strong>{filteredItems.length}</strong> of <strong>{displayItems.length}</strong> {activeTab}
          {(searchQuery || filterCategory) && <span style={S.filterTag}> (filtered)</span>}
        </div>
      )}

      {/* BOOST / PAYMENT MESSAGE TOAST */}
      {boostMessage && (
        <div style={{ ...S.boostToast, background: boostMessage.startsWith("✅") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", borderColor: boostMessage.startsWith("✅") ? "#22c55e" : "#ef4444", color: boostMessage.startsWith("✅") ? "#22c55e" : "#ef4444" }}>
          {boostMessage}
        </div>
      )}

      {/* CONTENT */}
      {activeTab === "boosts" ? (
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
      ) : loading ? (
        <div style={S.loader}>
          <div style={S.spinner}></div>
          <p>⏳ Loading {activeTab === "sold" ? "sold" : statusView} {activeTab}...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={S.empty}>
          <p style={S.emptyText}>✅ No {activeTab === "sold" ? "sold" : statusView} {activeTab} found.</p>
          {(searchQuery || filterCategory) && (
            <button style={S.resetBtn} onClick={() => { setSearchQuery(""); setFilterCategory(""); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={S.grid}>
          {filteredItems.map(item => (
            <div key={item._id} style={{ ...S.card, ...(item.isFeatured ? S.featuredCard : {}) }} onClick={() => setSelected(item)} className="admin-card">
              {item.isFeatured && <div style={S.featuredBanner}>⭐ FEATURED</div>}
              {getImages(item)[0] && (
                <div style={{ ...S.cardImg, backgroundImage: `url(${getImages(item)[0]})` }} />
              )}
              <div style={S.cardBody}>
                <p style={S.cardTitle}>{getTitle(item)}</p>
                <p style={S.cardSub}>{getSub(item)}</p>
                <p style={S.cardOwner}>👤 {getOwner(item)} · {getContact(item)}</p>
                <div style={S.cardFooter}>
                  <span style={S.priceBadge}>{getPrice(item)}</span>
                  <span style={{ ...S.statusDot, background: item.status === "approved" || item.isApproved ? "#22c55e" : item.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                    {item.status || (item.isApproved ? "approved" : "pending")}
                  </span>
                </div>
                {statusView === "pending" && activeTab !== "sold" && (
                  <div style={S.cardBtns} onClick={e => e.stopPropagation()}>
                    <button style={S.approveBtn} onClick={() => handleApprove(activeTab, item._id)}>✅ Approve</button>
                    <button style={S.rejectBtn} onClick={() => handleReject(activeTab, item._id)}>❌ Reject</button>
                  </div>
                )}
                <button style={S.deleteBtn} onClick={(e) => { e.stopPropagation(); confirmDelete(activeTab, item._id, getTitle(item)); }}>🗑️</button>
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
        <div style={S.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={S.confirmModal} onClick={e => e.stopPropagation()}>
            <h3 style={S.confirmTitle}>⚠️ Confirm Delete</h3>
            <p style={S.confirmText}>
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?
              <br />
              <span style={{ fontSize: 12, color: "#ef4444" }}>This action cannot be undone.</span>
            </p>
            <div style={S.confirmBtns}>
              <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={S.confirmDeleteBtn} onClick={executeDelete}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAYMENT NOTIFICATIONS TAB ─────────────────────────────────
function PaymentNotifications({ pendingBoosts, allBoosts, boostLoading, onApprove, onReject, getNotifTitle, getNotifIcon }) {
  const [viewMode, setViewMode] = useState("pending");
  const displayed = viewMode === "pending" ? pendingBoosts : allBoosts;

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
        <button style={{ ...S.stBtn, ...(viewMode === "pending" ? S.stBtnActive : {}), position: "relative" }}
          onClick={() => setViewMode("pending")}>
          🔴 Unread Payments
          {pendingBoosts.length > 0 && (
            <span style={{ ...S.notifBadge, position: "static", display: "inline-flex", marginLeft: 8 }} className="notif-badge-blink">
              {pendingBoosts.length}
            </span>
          )}
        </button>
        <button style={{ ...S.stBtn, ...(viewMode === "all" ? S.stBtnActive : {}) }} onClick={() => setViewMode("all")}>
          📋 All Payments
        </button>
      </div>

      {boostLoading ? (
        <div style={S.loader}><div style={S.spinner}></div><p>Loading payments...</p></div>
      ) : displayed.length === 0 ? (
        <div style={S.empty}>
          <p style={S.emptyText}>
            {viewMode === "pending" ? "✅ No unread payment notifications." : "No payment records found."}
          </p>
        </div>
      ) : (
        <div style={S.boostGrid}>
          {displayed.map(notif => (
            <div key={notif._id}
              style={{ ...S.boostCard, ...(!notif.read ? S.boostCardPending : {}) }}
              className={!notif.read ? "boost-card-glow" : ""}>
              {!notif.read && (
                <div style={S.boostPendingStrip}>
                  <span style={S.redDotInline} className="red-dot-blink" />
                  NEW PAYMENT — AWAITING REVIEW
                </div>
              )}

              <div style={S.boostCardBody}>
                <div style={{ marginBottom: 16 }}>
                  <p style={S.boostListingTitle}>
                    {getNotifIcon(notif.type)} {getNotifTitle(notif)}
                    {notif.read && <span style={{ ...S.boostFeaturedTag, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>✅ Read</span>}
                  </p>
                  <p style={S.boostListingMeta}>{typeLabel(notif.type)}</p>
                </div>

                <div style={S.boostDetails}>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>👤 User</span>
                    <span style={S.boostDetailVal}>{notif.userName || "—"}</span>
                  </div>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>📞 Phone</span>
                    <span style={S.boostDetailVal}>{notif.userPhone || "—"}</span>
                  </div>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>✉️ Email</span>
                    <span style={S.boostDetailVal}>{notif.userEmail || "—"}</span>
                  </div>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>💰 Amount</span>
                    <span style={{ ...S.boostDetailVal, color: "#fbbf24", fontWeight: 700 }}>
                      KES {notif.amount?.toLocaleString() || "—"}
                    </span>
                  </div>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>🔖 Transaction ID</span>
                    <span style={{ ...S.boostDetailVal, fontFamily: "monospace", color: "#a78bfa", fontSize: 11 }}>
                      {notif.transactionId || notif.mpesaRef || "—"}
                    </span>
                  </div>
                  {notif.type === "tourism_booking" && notif.checkIn && (
                    <>
                      <div style={S.boostDetailRow}>
                        <span style={S.boostDetailKey}>📅 Check-in</span>
                        <span style={S.boostDetailVal}>{new Date(notif.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div style={S.boostDetailRow}>
                        <span style={S.boostDetailKey}>📅 Check-out</span>
                        <span style={S.boostDetailVal}>{new Date(notif.checkOut).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>📅 Received</span>
                    <span style={S.boostDetailVal}>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={S.boostDetailRow}>
                    <span style={S.boostDetailKey}>Status</span>
                    <span style={{ ...S.boostDetailVal, color: statusColor(notif), fontWeight: 700, textTransform: "capitalize" }}>
                      {notif.read ? "✅ Read" : "🔴 Unread"}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <div style={S.boostActions}>
                    <button style={S.boostApproveBtn} onClick={() => onApprove(notif._id)}>
                      ✅ Mark as Confirmed
                    </button>
                    <button style={S.boostRejectBtn} onClick={() => onReject(notif._id)}>
                      ✕ Dismiss
                    </button>
                  </div>
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
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>
            {item.isFeatured && <span style={{ marginRight: 8 }}>⭐</span>}
            {getTitle(item)}
          </h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          {images.length > 0 && (
            <div style={S.imgSection}>
              <img src={images[imgIdx]} alt="" style={S.mainImg} />
              {images.length > 1 && (
                <div style={S.thumbRow}>
                  {images.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setImgIdx(i)}
                      style={{ ...S.thumb, ...(i === imgIdx ? S.thumbActive : {}) }} />
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={S.ownerBox}>
            <p style={S.ownerLine}>👤 <strong>{getOwner(item)}</strong> &nbsp;|&nbsp; 📞 {getContact(item)}</p>
            {item.owner?.email && <p style={S.ownerLine}>✉️ {item.owner.email}</p>}
          </div>
          {editMode ? (
            <div style={S.editGrid}>
              {Object.entries(editData)
                .filter(([k]) => !["_id", "__v", "password", "owner", "seller", "images", "photos", "coverImage", "image", "emailVerificationToken", "resetPasswordToken"].includes(k))
                .map(([k, v]) => (
                  typeof v === "object" ? null :
                    <div key={k} style={S.editField}>
                      <label style={S.editLabel}>{k}</label>
                      <input style={S.editInput} value={v ?? ""} onChange={e => setEditData({ ...editData, [k]: e.target.value })} />
                    </div>
                ))}
            </div>
          ) : (
            <div style={S.fieldsGrid}>
              {fields.map(([k, v]) => (
                typeof v === "object" ? null :
                  <div key={k} style={S.fieldRow}>
                    <span style={S.fieldKey}>{k}</span>
                    <span style={S.fieldVal}>{String(v ?? "—")}</span>
                  </div>
              ))}
            </div>
          )}
        </div>
        <div style={S.modalFooter}>
          {editMode ? (
            <>
              <button style={S.saveBtn} onClick={onSave} disabled={saving}>{saving ? "Saving…" : "💾 Save Changes"}</button>
              <button style={S.cancelBtn} onClick={onCancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              {statusView === "pending" && tab !== "sold" && (
                <>
                  <button style={S.approveBtn} onClick={onApprove}>✅ Approve</button>
                  <button style={S.rejectBtn} onClick={onReject}>❌ Reject</button>
                </>
              )}
              {["properties", "materials", "tourism"].includes(tab) && tab !== "sold" && (
                <button style={S.editBtn} onClick={onEdit}>✏️ Edit</button>
              )}
              <button style={S.deleteBtn} onClick={() => onDelete(tab, item._id, item.title || item.name || item.businessName)}>🗑️ Delete</button>
              <button style={S.cancelBtn} onClick={onClose}>Close</button>
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
    <div style={S.configBox}>
      <h2 style={S.configTitle}>💳 M-Pesa Configuration</h2>
      {configMessage && <div style={{ ...S.configMsg, color: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444", borderColor: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{configMessage}</div>}
      {fields.map(([k, type, label, placeholder, hint]) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <label style={S.editLabel}>{label}</label>
          <input type={type} value={mpesaConfig[k]} placeholder={placeholder}
            onChange={e => setMpesaConfig({ ...mpesaConfig, [k]: e.target.value })} style={S.editInput} />
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>{hint}</p>
        </div>
      ))}
      <button style={S.saveBtn} onClick={handleSave} disabled={configSaving}>{configSaving ? "Saving…" : "💾 Save Configuration"}</button>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#06101f,#0a1428)", padding: "32px 4%", color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 26, fontWeight: 800, color: "#fbbf24", margin: 0 },
  logoSub: { color: "#64748b", fontSize: 13, margin: "4px 0 0" },
  logoutBtn: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  notifBtn: { background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", width: 44, height: 44, borderRadius: 12, fontSize: 20, cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  notifBadge: { position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #06101f" },
  notifPanel: { position: "absolute", top: 52, right: 0, width: 360, background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 2000, overflow: "hidden" },
  notifPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(239,68,68,0.08)" },
  notifPanelTitle: { fontSize: 14, fontWeight: 700, color: "#fbbf24" },
  notifCloseBtn: { background: "none", border: "none", color: "#64748b", fontSize: 16, cursor: "pointer", padding: 4 },
  notifList: { maxHeight: 400, overflowY: "auto" },
  notifItem: { padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  notifItemHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  notifRedDot: { width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 },
  notifItemTitle: { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  notifItemMeta: { display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4, fontSize: 12, color: "#94a3b8" },
  notifItemBtns: { display: "flex", gap: 8, marginTop: 10 },
  notifApproveBtn: { flex: 1, background: "#22c55e", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 },
  notifRejectBtn: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "8px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 },
  notifEmpty: { padding: "32px 20px", textAlign: "center", color: "#64748b", fontSize: 13 },
  notifFooter: { padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(15,23,42,0.5)" },
  notifViewAllBtn: { background: "none", border: "none", color: "#fbbf24", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 },
  boostGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 },
  boostCard: { background: "rgba(15,23,42,0.85)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" },
  boostCardPending: { border: "1px solid rgba(239,68,68,0.4)", boxShadow: "0 0 20px rgba(239,68,68,0.1)" },
  boostPendingStrip: { background: "rgba(239,68,68,0.15)", borderBottom: "1px solid rgba(239,68,68,0.3)", padding: "8px 16px", fontSize: 11, fontWeight: 800, color: "#ef4444", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 },
  redDotInline: { width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 },
  boostCardBody: { padding: 20 },
  boostListingInfo: { display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" },
  boostThumb: { width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 },
  boostListingTitle: { fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  boostListingMeta: { fontSize: 12, color: "#94a3b8", margin: 0 },
  boostFeaturedTag: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700 },
  boostDetails: { background: "rgba(30,41,59,0.4)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 },
  boostDetailRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  boostDetailKey: { fontSize: 12, color: "#64748b" },
  boostDetailVal: { fontSize: 12, color: "#e2e8f0", fontWeight: 600 },
  boostActions: { display: "flex", flexDirection: "column", gap: 8 },
  boostApproveBtn: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
  boostRejectBtn: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
  boostToast: { padding: "12px 20px", borderRadius: 10, border: "1px solid", fontSize: 14, fontWeight: 600, marginBottom: 20 },
  featuredCard: { border: "1px solid rgba(251,191,36,0.4)", boxShadow: "0 0 20px rgba(251,191,36,0.1)" },
  featuredBanner: { background: "linear-gradient(90deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05))", padding: "6px 16px", fontSize: 11, fontWeight: 800, color: "#fbbf24", letterSpacing: "1px", borderBottom: "1px solid rgba(251,191,36,0.2)" },
  tabBoostAlert: { background: "rgba(239,68,68,0.15)", color: "#ef4444", borderColor: "rgba(239,68,68,0.5)" },
  tabBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, padding: "0 4px", marginLeft: 6, border: "2px solid #0a1428" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 },
  statCard: { background: "rgba(30,41,59,0.6)", padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" },
  statLabel: { fontSize: 12, color: "#94a3b8", margin: "0 0 6px" },
  statVal: { fontSize: 26, fontWeight: 800, color: "#fbbf24", margin: "0 0 2px" },
  statPending: { fontSize: 11, color: "#ef4444", margin: 0 },
  chartContainer: { background: "rgba(30,41,59,0.6)", padding: "24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 28 },
  chartTitle: { fontSize: 16, fontWeight: 700, color: "#fbbf24", margin: "0 0 20px" },
  viewStatsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 },
  viewStatSection: { background: "rgba(15,23,42,0.6)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" },
  viewStatTitle: { fontSize: 14, fontWeight: 700, color: "#fbbf24", margin: "0 0 12px" },
  viewStatItem: { display: "flex", flexDirection: "column", gap: 4, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  viewStatLabel: { fontSize: 13, fontWeight: 600, color: "#f1f5f9" },
  viewStatValue: { fontSize: 14, fontWeight: 700, color: "#22c55e" },
  viewStatMeta: { fontSize: 11, color: "#94a3b8" },
  topViewedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 },
  topViewItem: { display: "flex", flexDirection: "column", gap: 6, padding: "12px", background: "rgba(15,23,42,0.4)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" },
  topViewTitle: { fontSize: 13, fontWeight: 600, color: "#f1f5f9" },
  topViewMeta: { fontSize: 11, color: "#94a3b8" },
  topViewValue: { fontSize: 14, fontWeight: 700, color: "#fbbf24" },
  chartBars: { display: "flex", flexDirection: "column", gap: 16 },
  chartBar: { display: "flex", alignItems: "center", gap: 12 },
  chartLabel: { width: 80, fontSize: 12, color: "#94a3b8", fontWeight: 600 },
  chartBarTrack: { flex: 1, height: 24, background: "rgba(15,23,42,0.8)", borderRadius: 12, overflow: "hidden", position: "relative" },
  chartBarFill: { height: "100%", borderRadius: 12, transition: "width 0.5s ease-out" },
  chartBarPending: { height: "100%", background: "rgba(239,68,68,0.6)", position: "absolute", top: 0, left: 0, borderRadius: 12, transition: "width 0.5s ease-out" },
  chartValues: { width: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 },
  chartTotal: { fontSize: 14, fontWeight: 700, color: "#fbbf24" },
  chartPending: { fontSize: 11, color: "#ef4444" },
  quickActions: { background: "rgba(30,41,59,0.6)", padding: "24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 28 },
  quickActionsTitle: { fontSize: 16, fontWeight: 700, color: "#fbbf24", margin: "0 0 16px" },
  quickActionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 },
  quickActionBtn: { display: "flex", alignItems: "center", gap: 10, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", position: "relative" },
  quickActionIcon: { fontSize: 20 },
  quickActionText: { fontSize: 13, fontWeight: 600, color: "#f1f5f9", flex: 1, textAlign: "left" },
  quickActionBadge: { background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, minWidth: 20, textAlign: "center" },
  tabs: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tab: { background: "rgba(30,41,59,0.6)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13, position: "relative" },
  tabActive: { background: "#fbbf24", color: "#1f2937", borderColor: "#fbbf24" },
  statusToggle: { display: "flex", gap: 8, marginBottom: 24 },
  stBtn: { background: "rgba(30,41,59,0.4)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", padding: "7px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 },
  stBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "#fbbf24" },
  searchBar: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  searchInputWrapper: { display: "flex", alignItems: "center", background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", flex: 1, minWidth: 280 },
  searchIcon: { fontSize: 16, marginRight: 8, color: "#94a3b8" },
  searchInput: { background: "transparent", border: "none", color: "#f1f5f9", fontSize: 14, flex: 1, outline: "none", minWidth: 200 },
  clearBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, padding: 4, marginLeft: 8 },
  filterSelect: { background: "rgba(30,41,59,0.6)", color: "#f1f5f9", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10, fontSize: 13, outline: "none", cursor: "pointer", minWidth: 180 },
  exportBtn: { background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid #3b82f6", padding: "8px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
  resultsCount: { fontSize: 13, color: "#94a3b8", marginBottom: 16 },
  filterTag: { color: "#fbbf24", fontWeight: 600 },
  resetBtn: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid #fbbf24", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, marginTop: 12 },
  loader: { textAlign: "center", padding: 80, color: "#fbbf24", fontSize: 16 },
  spinner: { display: "inline-block", width: 40, height: 40, border: "4px solid rgba(251,191,36,0.2)", borderTopColor: "#fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 },
  empty: { background: "rgba(30,41,59,0.4)", padding: 60, borderRadius: 16, textAlign: "center", border: "1px dashed rgba(251,191,36,0.3)" },
  emptyText: { color: "#94a3b8", fontSize: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 },
  card: { background: "rgba(15,23,42,0.85)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s" },
  cardImg: { height: 160, backgroundSize: "cover", backgroundPosition: "center" },
  cardBody: { padding: 16 },
  cardTitle: { fontWeight: 700, fontSize: 15, margin: "0 0 4px" },
  cardSub: { fontSize: 12, color: "#94a3b8", margin: "0 0 6px" },
  cardOwner: { fontSize: 12, color: "#64748b", margin: "0 0 10px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  priceBadge: { background: "rgba(59,130,246,0.15)", color: "#3b82f6", padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontSize: 12 },
  statusDot: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "capitalize" },
  cardBtns: { display: "flex", gap: 8, marginTop: 8 },
  approveBtn: { background: "#22c55e", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 7, fontWeight: 700, cursor: "pointer", fontSize: 12, transition: "all 0.2s" },
  rejectBtn: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "7px 14px", borderRadius: 7, fontWeight: 700, cursor: "pointer", fontSize: 12, transition: "all 0.2s" },
  editBtn: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid #fbbf24", padding: "7px 14px", borderRadius: 7, fontWeight: 700, cursor: "pointer", fontSize: 12, transition: "all 0.2s" },
  deleteBtn: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "6px 12px", borderRadius: 7, fontWeight: 700, cursor: "pointer", fontSize: 12, transition: "all 0.2s" },
  saveBtn: { background: "#fbbf24", color: "#1f2937", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: 13 },
  cancelBtn: { background: "rgba(30,41,59,0.6)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" },
  modal: { background: "#0f1729", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.3s ease-out", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(15,23,42,0.95)" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#fbbf24", margin: 0 },
  closeBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  modalBody: { flex: 1, overflowY: "auto", padding: 24 },
  modalFooter: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" },
  imgSection: { marginBottom: 20 },
  mainImg: { width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 10 },
  thumbRow: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
  thumb: { width: 60, height: 60, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "2px solid transparent", opacity: 0.6 },
  thumbActive: { borderColor: "#fbbf24", opacity: 1 },
  ownerBox: { background: "rgba(30,41,59,0.5)", padding: "12px 16px", borderRadius: 10, marginBottom: 16 },
  ownerLine: { margin: "2px 0", fontSize: 13, color: "#cbd5e1" },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" },
  fieldRow: { display: "flex", flexDirection: "column", background: "rgba(30,41,59,0.3)", padding: "8px 12px", borderRadius: 8 },
  fieldKey: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 },
  fieldVal: { fontSize: 13, color: "#e2e8f0", wordBreak: "break-all" },
  editGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  editField: { display: "flex", flexDirection: "column", gap: 4 },
  editLabel: { fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 },
  editInput: { padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(30,41,59,0.7)", color: "#f1f5f9", fontSize: 13, outline: "none" },
  configBox: { background: "rgba(15,23,42,0.8)", borderRadius: 16, padding: 32, maxWidth: 600, margin: "0 auto", border: "1px solid rgba(255,255,255,0.05)" },
  configTitle: { fontSize: 20, fontWeight: 800, color: "#fbbf24", marginBottom: 20 },
  configMsg: { padding: "10px 14px", borderRadius: 8, border: "1px solid", fontSize: 13, fontWeight: 600, marginBottom: 16 },
  confirmModal: { background: "#0f1729", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "32px", maxWidth: 400, width: "100%", animation: "slideUp 0.3s ease-out", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  confirmTitle: { fontSize: 18, fontWeight: 800, color: "#ef4444", margin: "0 0 16px" },
  confirmText: { fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 24 },
  confirmBtns: { display: "flex", gap: 12, justifyContent: "flex-end" },
  confirmDeleteBtn: { background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
};

const css = `
  .admin-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.3); border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes notifPanelSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes redBlink { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
  @keyframes badgePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
  @keyframes boostGlow { 0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.08); } 50% { box-shadow: 0 0 30px rgba(239,68,68,0.25); } }
  @keyframes statPulse { 0%,100% { box-shadow: 0 0 0 2px rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0.15); } }
  .red-dot-blink { animation: redBlink 1.2s ease-in-out infinite; }
  .notif-badge-blink { animation: badgePulse 1.5s ease-in-out infinite; }
  .notif-btn-active { border-color: rgba(239,68,68,0.5) !important; box-shadow: 0 0 12px rgba(239,68,68,0.3); }
  .notif-panel-slide { animation: notifPanelSlide 0.2s ease-out; }
  .notif-item-pulse { transition: background 0.2s; } .notif-item-pulse:hover { background: rgba(239,68,68,0.05); }
  .boost-card-glow { animation: boostGlow 2s ease-in-out infinite; }
  .stat-card-pulse { animation: statPulse 2s ease-in-out infinite; }
  .quickActionBtn:hover { background: rgba(251,191,36,0.1) !important; border-color: #fbbf24 !important; }
  button:hover { transform: translateY(-1px); }
`;