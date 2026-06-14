import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import VerificationStatus from "../components/VerificationStatus";
import { UserProfileEditor, ProfileAvatar } from "../features/profile";
import VerificationBadges from "../components/VerificationBadges";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

import { getDashboardPath } from "../utils/dashboardRoutes";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

const CATEGORIES = ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "⏳ Pending Approval" },
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  approved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  sold: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "🏷️ Sold" },
  archived: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
};

const resolveStatus = (item) => {
  const raw = item.status || "pending";
  if (raw === "approved") return "active";
  return raw;
};

export default function UserDashboard() {
  const { user, token, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation and ui states
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data lists
  const [businesses, setBusinesses] = useState([]);


  // Load all dashboard content
  useEffect(() => {
    if (!token) {
      navigate("/business-login");
      return;
    }
    // Check if user has the correct role for this dashboard
    if (user && user.role !== "user") {
      navigate(getDashboardPath(user.role));
      return;
    }
    // Allow business users (role: "user") to access this dashboard
    loadAllData();
  }, [token, user]);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const bizRes = await API.get("/business/my").catch(() => ({ data: { businesses: [] } }));
      setBusinesses(bizRes.data?.businesses || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load workspace data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };


  // Directory Listings Actions
  const handleEditBusiness = (id) => navigate(`/business/edit/${id}`);
  const handleDeleteBusiness = async (id) => {
    if (!window.confirm("Delete this business directory?")) return;
    try {
      await API.delete(`/business/${id}`);
      showSuccess("Business listing deleted successfully");
      loadAllData();
    } catch (err) {
      showError("Failed to delete business listing");
    }
  };

  // Toast Helpers
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // Total summary calculations
  const totalListedCount = businesses.length;

  if (loading) {
    return (
      <div style={s.loaderContainer}>
        <div style={s.spinner}></div>
        <p style={{ marginTop: "16px", fontWeight: "600", color: "#fbbf24" }}>Loading Unified Workspace...</p>
      </div>
    );
  }

  return (
    <div style={s.dashboardContainer}>
      <style>{customStyles}</style>

      {/* TOP HEADER MENU BAR FOR MOBILE */}
      <header style={s.mobileHeader}>
        <button style={s.menuToggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "✕ Menu" : "☰ Menu"}
        </button>
        <span style={s.headerBranding}>AxxSpace Workspace</span>
        <ProfileAvatar user={user} size={32} />
      </header>

      {/* SIDEBAR WRAPPER */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? "translateX(0)" : "" }}>
        <div style={s.sidebarBrand}>
          <span style={s.brandGold}>AXXSPACE</span>
          <span style={s.brandSub}>Client Panel</span>
        </div>

        <div style={s.sidebarUserProfile}>
          <ProfileAvatar user={user} size={50} />
          <div style={s.userMetaInfo}>
            <div style={s.userName}>{user?.name || "Member Account"}</div>
            <div style={s.userRole}>{user?.role?.toUpperCase() || "USER"}</div>
          </div>
        </div>

        <nav style={s.sidebarNav}>
          <button style={{ ...s.navItem, ...(activeTab === "overview" && s.navItemActive) }} onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>📊</span> Overview
          </button>
          <button style={{ ...s.navItem, ...(activeTab === "businesses" && s.navItemActive) }} onClick={() => { setActiveTab("businesses"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>🏢</span> Directory Listings
          </button>
          <button style={{ ...s.navItem, ...(activeTab === "profile" && s.navItemActive) }} onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>👤</span> Profile & KYC
          </button>
        </nav>

        <div style={s.sidebarFooter}>
          <button style={s.footerBtn} onClick={() => navigate("/settings")}>⚙️ Settings</button>
          <button style={{ ...s.footerBtn, ...s.logoutColor }} onClick={() => logout("/login")}>Logout</button>
        </div>
      </aside>

      {/* OVERLAY FOR BACKDROP ON MOBILE SIDEBAR OPEN */}
      {sidebarOpen && <div style={s.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* MAIN CONTENT AREA */}
      <main style={s.mainContent}>
        {/* Toast Notifs */}
        {successMsg && <div style={s.toastSuccess}>{successMsg}</div>}
        {errorMsg && <div style={s.toastError}>{errorMsg}</div>}

        {/* ── Tab Panels ── */}

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div>
            <div style={s.welcomeBanner}>
              <div style={s.bannerLeft}>
                <h1 style={s.bannerTitle}>Workspace Console 👋</h1>
                <p style={s.bannerSubtitle}>Monitor your listings, active items, and KYC verification tier from one unified space.</p>
              </div>
              <div style={s.bannerRight}>
                <div style={s.badgeCard}>
                  <VerificationBadges userId={user?._id || user?.id} />
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <div style={s.statValue}>{totalListedCount}</div>
                <div style={s.statLabel}>Total Listings</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statValue}>{businesses.length}</div>
                <div style={s.statLabel}>Businesses (Directory)</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={s.panelCard}>
              <h3 style={s.panelHeading}>⚡ Quick Listing Creation</h3>
              <div style={s.actionsGrid}>
                <button style={s.actionGridBtn} onClick={() => navigate("/business/create")}>
                  🏢 Register New Business
                </button>
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <AnalyticsDashboard userId={user?._id || user?.id} userType={user?.role} />
            </div>
          </div>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === "businesses" && (
          <div style={s.panelCard}>
            <div style={s.panelFlexHeader}>
              <h2 style={s.tabTitle}>🏢 My Directory Listings</h2>
              <button style={s.btnPrimary} onClick={() => navigate("/business/create")}>+ Register Business</button>
            </div>

            {businesses.length === 0 ? (
              <div style={s.emptyState}>
                <p>No businesses directory listed.</p>
                <button style={s.btnSecondary} onClick={() => navigate("/business/create")}>List Your Business</button>
              </div>
            ) : (
              <div style={s.cardGrid}>
                {businesses.map((biz) => {
                  const resolvedSt = biz.status || "pending";
                  const st = STATUS_COLORS[resolvedSt] || STATUS_COLORS.pending;
                  return (
                    <div key={biz._id} style={s.itemCard}>
                      <div style={s.itemCardHeader}>
                        <h3 style={s.itemCardTitle}>{biz.name}</h3>
                        <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <p style={s.itemCardDesc}>{biz.description?.substring(0, 120)}...</p>
                      <div style={s.itemCardMeta}>
                        <div>📍 {biz.location?.town}, {biz.location?.county}</div>
                        <div>📂 {biz.categories?.join(", ")}</div>
                      </div>
                      <div style={s.itemActions}>
                        <button style={s.btnEdit} onClick={() => handleEditBusiness(biz._id)}>Edit</button>
                        <button style={s.btnDelete} onClick={() => handleDeleteBusiness(biz._id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE & KYC TAB */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={s.panelCard}>
              <h2 style={s.tabTitle}>👤 Account Profile Info</h2>
              <UserProfileEditor
                token={token}
                user={user}
                accentColor="#fbbf24"
                onUpdated={(updatedUser) => {
                  if (updatedUser) login(token, updatedUser);
                }}
              />
            </div>

            <div style={s.panelCard}>
              <h2 style={s.tabTitle}>🔐 Identity & Verification status</h2>
              <VerificationStatus />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  loaderContainer: {
    minHeight: "100vh",
    background: "#080c14",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(251, 191, 36, 0.1)",
    borderTop: "4px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  dashboardContainer: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#f1f5f9",
    display: "flex",
    fontFamily: "'DM Sans', sans-serif",
  },
  mobileHeader: {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    background: "#0f172a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0 16px",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1001,
  },
  menuToggleBtn: {
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "6px",
    color: "#fbbf24",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },
  headerBranding: {
    fontWeight: "900",
    color: "#fbbf24",
    fontSize: "16px",
    letterSpacing: "0.5px",
  },
  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #0f172a 0%, #070d19 100%)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    zIndex: 1002,
    transition: "transform 0.3s ease",
  },
  sidebarBrand: {
    marginBottom: "32px",
    display: "flex",
    flexDirection: "column",
  },
  brandGold: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#fbbf24",
    letterSpacing: "1px",
  },
  brandSub: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginTop: "2px",
  },
  sidebarUserProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    marginBottom: "24px",
  },
  userMetaInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f1f5f9",
  },
  userRole: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#fbbf24",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fbbf24",
    borderLeft: "4px solid #fbbf24",
  },
  navIcon: {
    fontSize: "16px",
  },
  sidebarFooter: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  footerBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  logoutColor: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    boxSizing: "border-box",
    overflowY: "auto",
    maxHeight: "100vh",
  },
  toastSuccess: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "8px",
    color: "#34d399",
    padding: "14px 20px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "600",
  },
  toastError: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#f87171",
    padding: "14px 20px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "600",
  },
  welcomeBanner: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
  },
  bannerLeft: {
    flex: 1,
    minWidth: "280px",
  },
  bannerTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  bannerSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  badgeCard: {
    display: "flex",
    gap: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "rgba(22, 28, 45, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "14px",
    padding: "24px",
    transition: "transform 0.2s",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fbbf24",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  kycContainer: {
    marginBottom: "32px",
  },
  panelCard: {
    background: "rgba(22, 28, 45, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  },
  panelHeading: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#fbbf24",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },
  actionGridBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    color: "#fbbf24",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  panelFlexHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  tabTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#080c14",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSecondary: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  itemCard: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  itemCardHeader: {
    padding: "16px 16px 8px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemCardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#f1f5f9",
  },
  itemCardDesc: {
    margin: "0 16px 12px 16px",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.4",
  },
  itemCardMeta: {
    margin: "auto 16px 16px 16px",
    fontSize: "12px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    paddingTop: "12px",
  },
  itemActions: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    gap: "8px",
  },
  btnEdit: {
    flex: 1,
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid rgba(251, 191, 36, 0.2)",
    borderRadius: "6px",
    color: "#fbbf24",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnDelete: {
    flex: 1,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "6px",
    color: "#fca5a5",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnSold: {
    flex: 1,
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "6px",
    color: "#34d399",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  statusBadge: {
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  propertyImageContainer: {
    position: "relative",
    height: "180px",
    background: "#0f172a",
  },
  propertyImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fullyBookedOverlay: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    background: "rgba(239, 68, 68, 0.9)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
  },
  placeholderMaterialImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  propertyPriceText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fbbf24",
    margin: "0 16px 12px 16px",
  },
  unitsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    margin: "12px 16px",
  },
  unitBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
  },
  unitVal: {
    display: "block",
    fontSize: "18px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  unitLbl: {
    display: "block",
    fontSize: "9px",
    color: "#64748b",
    marginTop: "2px",
  },
  progressBar: {
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "3px",
    margin: "0 16px 16px 16px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.4s",
  },
  propertyActionsGrid: {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  unitActionBtn: {
    padding: "8px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    color: "#f1f5f9",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  boostActionBtn: {
    gridColumn: "1 / -1",
    padding: "8px",
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "6px",
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  labelMicro: {
    display: "block",
    fontSize: "10px",
    color: "#64748b",
    marginBottom: "4px",
  },
  agentSelectInput: {
    width: "100%",
    padding: "8px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    color: "#f1f5f9",
    fontSize: "11px",
  },
  engagementRow: {
    margin: "12px 16px",
    fontSize: "12px",
    color: "#64748b",
    display: "flex",
    justifyContent: "space-between",
  },
  uploadForm: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "24px",
  },
  formSubheading: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#fbbf24",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
  formInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formInputLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  formInputField: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  formTextAreaField: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    resize: "vertical",
  },
  imagePreviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
    gap: "8px",
    marginTop: "10px",
  },
  imagePreviewThumb: {
    width: "100%",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
  },
  formActionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  moverJobStatusBadge: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  moverJobText: {
    margin: "0 16px 8px 16px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  moverJobActions: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    marginTop: "auto",
  },
  btnAcceptMover: {
    width: "100%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnCompleteMover: {
    width: "100%",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

const customStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    aside[style*="position: sticky"] {
      position: fixed !important;
      left: 0;
      top: 0;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100vh;
      z-index: 1002;
    }
    header[style*="display: none"] {
      display: flex !important;
    }
    main[style*="padding: 32px"] {
      padding: 92px 16px 32px 16px !important;
    }
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
  }
  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
