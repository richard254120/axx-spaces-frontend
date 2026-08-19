import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { UserProfileEditor } from "../features/profile";
import VerificationBadges from "../components/VerificationBadges";
import VerificationStatus from "../components/VerificationStatus";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BoostNotification from "../components/BoostNotification";
import QuickBoostModal from "../components/QuickBoostModal";
import QRGeneratorModal from "../components/QRGeneratorModal";
import QRStatsModal from "../components/QRStatsModal";

import { getDashboardPath, normalizeRole } from "../utils/dashboardRoutes";
import logo from "../assets/image.png";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const SOURCES = [
  { value: "generic", label: "General / Digital Link" },
  { value: "gate", label: "Gate Poster" },
  { value: "building_outside", label: "Building Exterior" },
  { value: "noticeboard", label: "Noticeboard" },
  { value: "shop_nearby", label: "Local Shop/Kiosk" },
  { value: "office", label: "Landlord Office" },
  { value: "vacancy_sign", label: "Vacancy Signboard" }
];

// Sidebar Icons
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const MyPropertiesIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const AddPropertyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EnquiriesIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const BookingsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PromoteIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const MessagesIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function LandlordDashboard() {
  const { token, user, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedPropertyForBoost, setSelectedPropertyForBoost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [selectedPropertyForQR, setSelectedPropertyForQR] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPropertyForStats, setSelectedPropertyForStats] = useState(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  // New Sidebar navigation states
  const [activeSidebarTab, setActiveSidebarTab] = useState("my-properties");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stats collection for Enquiries
  const [enquiriesData, setEnquiriesData] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

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

  useEffect(() => {
    if (activeSidebarTab === "enquiries" && properties.length > 0) {
      fetchAllPropertiesStats();
    }
  }, [activeSidebarTab, properties]);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/properties/my-properties/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch properties");
      const data = await response.json();
      const processed = data.map(p => ({
        ...p,
        availableUnits: Math.max(0, (p.totalUnits || 1) - (p.bookedUnits || 0)),
      }));
      setProperties(processed);

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

  const fetchAllPropertiesStats = async () => {
    setEnquiriesLoading(true);
    try {
      const statsList = [];
      await Promise.all(properties.map(async (p) => {
        try {
          const res = await fetch(`${API_BASE}/properties/${p._id}/qr-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            statsList.push({
              propertyId: p._id,
              title: p.title,
              totalScans: data.totalScans || 0,
              totalInquiries: data.totalInquiries || 0,
              conversionRate: data.conversionRate || 0,
              sources: data.sourceBreakdown || [],
              inquiries: data.inquiryTypeBreakdown || []
            });
          }
        } catch (err) {
          console.error("Error fetching stats for property:", p._id, err);
        }
      }));
      setEnquiriesData(statsList);
    } catch (e) {
      console.error("Error fetching all stats", e);
    } finally {
      setEnquiriesLoading(false);
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

  const handleBoost = (property) => {
    setSelectedPropertyForBoost(property);
    setBoostModalOpen(true);
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
    if (propertyFilter === "all") return true;
    if (propertyFilter === "booked") return (p.bookedUnits || 0) > 0;
    return p.status === propertyFilter;
  });

  const statusConfig = {
    approved: { bg: "#22c55e", label: "✅ Approved" },
    pending: { bg: "#f59e0b", label: "⏳ Pending" },
    rejected: { bg: "#ef4444", label: "❌ Rejected" },
  };

  if (authLoading && !user) {
    return (
      <div style={{ ...styles.dashboardWrapper, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ color: "#fbbf24" }}>Verifying Credentials...</h2>
      </div>
    );
  }

  // Sidebar item helper click
  const handleSidebarClick = (item) => {
    setMobileMenuOpen(false);
    if (item.id === "add-property") {
      navigate("/upload");
    } else if (item.id === "logout") {
      logout();
    } else {
      setActiveSidebarTab(item.id);
    }
  };

  const SIDEBAR_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "my-properties", label: "My Properties", icon: MyPropertiesIcon },
    { id: "add-property", label: "Add Property", icon: AddPropertyIcon },
    { id: "enquiries", label: "Enquiries", icon: EnquiriesIcon },
    { id: "bookings", label: "Bookings", icon: BookingsIcon },
    { id: "promote-property", label: "Promote Property", icon: PromoteIcon },
    { id: "messages", label: "Messages", icon: MessagesIcon },
    { id: "profile", label: "Profile", icon: ProfileIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "logout", label: "Logout", icon: LogoutIcon }
  ];

  // Helper component for Promote Property Screen
  function PromotePropertyTab({ propertiesList }) {
    const [selectedId, setSelectedId] = useState(propertiesList[0]?._id || "");
    const [qrLoaded, setQrLoaded] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    const [promoSource, setPromoSource] = useState("generic");
    const canvasRef = useRef(null);

    const selectedProperty = propertiesList.find(p => p._id === selectedId) || propertiesList[0];

    useEffect(() => {
      if (!selectedProperty) return;
      const url = `${window.location.origin}/listings/${selectedProperty._id}?ref=qr&source=${promoSource}`;
      
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 1.5,
        errorCorrectionLevel: "H",
        color: {
          dark: "#081A34",
          light: "#ffffff"
        }
      }, (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          return;
        }

        const ctx = canvasRef.current.getContext("2d");
        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.onload = () => {
          const cardSize = 90;
          const x = (canvasRef.current.width - cardSize) / 2;
          const y = (canvasRef.current.height - cardSize) / 2;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          const radius = 8;
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + cardSize - radius, y);
          ctx.quadraticCurveTo(x + cardSize, y, x + cardSize, y + radius);
          ctx.lineTo(x + cardSize, y + cardSize - radius);
          ctx.quadraticCurveTo(x + cardSize, y + cardSize, x + cardSize - radius, y + cardSize);
          ctx.lineTo(x + radius, y + cardSize);
          ctx.quadraticCurveTo(x, y + cardSize, x, y + cardSize - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();

          const logoSize = 34;
          const logoX = x + (cardSize - logoSize) / 2;
          const logoY = y + 10;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          ctx.font = "bold 9px 'Inter', sans-serif";
          ctx.fillStyle = "#d9383a";
          ctx.textAlign = "center";
          ctx.fillText("AXXSPACE", x + cardSize / 2, y + 56);

          ctx.font = "500 5px 'Inter', sans-serif";
          ctx.fillStyle = "#475569";
          ctx.fillText("Space hunting bila stress.", x + cardSize / 2, y + 68);

          setQrCodeDataUrl(canvasRef.current.toDataURL("image/png"));
          setQrLoaded(true);
        };
      });
    }, [selectedId, promoSource]);

    if (!selectedProperty) {
      return (
        <div style={styles.empty}>
          <p>No properties available to promote. Please upload a property first.</p>
        </div>
      );
    }

    const getPromoUrl = () => {
      return `https://axxspace.com/property/${selectedProperty._id ? selectedProperty._id.slice(-6).toUpperCase() : "AX12345"}`;
    };

    const downloadQR = () => {
      const link = document.createElement("a");
      link.download = `axxspace_qr_${selectedProperty.title.replace(/\s+/g, "_").toLowerCase()}_${promoSource}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    };

    return (
      <div style={styles.promoteContainer}>
        <div>
          <h2 style={styles.contentTitle}>Promote Property</h2>
          <p style={styles.contentSubtitle}>Generate and deploy vacuum vacancy posters for offline audiences.</p>
        </div>

        <div style={styles.promoteSplit}>
          {/* Controls */}
          <div style={styles.promoteControlCard}>
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Property</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={styles.formSelect}
              >
                {propertiesList.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Micro Property Details Card */}
            <div style={styles.promoPropDetailCard}>
              <img 
                src={selectedProperty.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=150&q=80"} 
                alt={selectedProperty.title} 
                style={styles.promoPropImg}
              />
              <div style={styles.promoPropInfo}>
                <h4 style={styles.promoPropTitle}>{selectedProperty.title}</h4>
                <p style={styles.promoPropLoc}>📍 {selectedProperty.location}</p>
                <a href={`/listings/${selectedProperty._id}`} target="_blank" rel="noreferrer" style={styles.promoPropLink}>
                  View Property ↗
                </a>
              </div>
            </div>

            {/* Property URL */}
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Property URL</label>
              <input 
                type="text" 
                value={getPromoUrl()} 
                readOnly 
                style={styles.formInputReadOnly}
              />
            </div>

            {/* Channel Source */}
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Placement Placement Channel</label>
              <select
                value={promoSource}
                onChange={(e) => setPromoSource(e.target.value)}
                style={styles.formSelect}
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} width={300} height={300} />
          </div>

          {/* QR Preview Block */}
          <div style={styles.promoteQrCard}>
            <div style={styles.promoteQrTitle}>QR Code Preview</div>
            
            <div style={styles.promoteQrFrame}>
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code Preview" style={{ width: "200px", height: "200px", display: "block" }} />
              ) : (
                <div style={{ width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  Generating QR...
                </div>
              )}
            </div>

            <button 
              onClick={downloadQR} 
              disabled={!qrLoaded} 
              style={styles.promoRedBtn}
            >
              📥 Download QR Code
            </button>

            <div style={styles.promoFormatText}>PNG &nbsp;|&nbsp; PDF</div>

            <div style={styles.promoteTipBox}>
              <div style={styles.tipIcon}>ℹ️</div>
              <div style={styles.tipText}>
                Print and display this QR code to get more views and enquiries for your property.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardWrapper}>
      <style>{cssStyles}</style>

      {/* MOBILE HEADER BAR */}
      <header style={styles.mobileHeader}>
        <button style={styles.hamburgerBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
        <div style={styles.mobileLogoRow}>
          <img src={logo} alt="Axxspace Logo" style={styles.mobileLogoImg} />
          <span style={styles.mobileLogoText}>AXXSPACE</span>
        </div>
        <div style={{ width: "28px" }} /> {/* Spacer */}
      </header>

      {/* SIDEBAR NAVIGATION */}
      <aside style={{
        ...styles.sidebar,
        transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        left: mobileMenuOpen ? "0" : "-260px",
      }} className="axx-sidebar">
        <div style={styles.sidebarHeader}>
          <div style={styles.logoRow}>
            <img src={logo} alt="Axxspace Logo" style={styles.logoImg} />
            <span style={styles.logoText}>AXXSPACE</span>
          </div>
          <span style={styles.portalSubtitle}>LANDLORD PORTAL</span>
        </div>

        <nav style={styles.sidebarMenu}>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item)}
                style={{
                  ...styles.menuItem,
                  ...(isActive && styles.menuItemActiveRed),
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileMenuOpen && (
        <div style={styles.sidebarBackdrop} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainContent}>
        {/* BOOST NOTIFICATION */}
        <BoostNotification user={user} userType="landlord" />

        {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {/* ── SCREEN 1: DASHBOARD OVERVIEW ── */}
        {activeSidebarTab === "dashboard" && (
          <div style={styles.tabContentSection}>
            <div style={styles.header}>
              <h2 style={styles.contentTitle}>Performance Dashboard</h2>
              <p style={styles.contentSubtitle}>Real-time overview of listing views, verification status, and conversion tracking.</p>
            </div>

            {/* Summary stat cards */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{counts.all}</div>
                <div style={styles.statName}>Total Listings</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{counts.approved}</div>
                <div style={styles.statName}>Live Listings</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{counts.booked}</div>
                <div style={styles.statName}>Units Occupied</div>
              </div>
            </div>

            {/* Verification Status */}
            <div style={{ marginBottom: "28px" }}>
              <VerificationStatus />
            </div>

            {/* Custom Interactive charts / graphs via analytics component */}
            <AnalyticsDashboard userType="landlord" userId={user?._id || user?.id} />
          </div>
        )}

        {/* ── SCREEN 2: PROPERTIES GRID ── */}
        {activeSidebarTab === "my-properties" && (
          <div style={styles.tabContentSection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <h2 style={styles.contentTitle}>My Properties</h2>
                <p style={styles.contentSubtitle}>Manage your listed rentals, assign agents, and adjust vacancy levels.</p>
              </div>
              <button onClick={() => navigate("/upload")} style={styles.addPropHeaderBtn}>
                ➕ Add Property
              </button>
            </div>

            {/* Sub filter tabs */}
            <div style={styles.tabsScroll}>
              {["all", "pending", "approved", "booked", "rejected"].map((tab) => (
                <button
                  key={tab}
                  style={{ ...styles.tabBtn, ...(propertyFilter === tab && styles.tabBtnActive) }}
                  onClick={() => setPropertyFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} &nbsp;
                  <span style={styles.tabCount}>({counts[tab] || 0})</span>
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading ? (
              <p style={styles.loading}>⏳ Loading properties...</p>
            ) : filteredProperties.length === 0 ? (
              <div style={styles.empty}>
                <p>No properties matching "{propertyFilter}" found.</p>
                <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
                  List a Property Now
                </button>
              </div>
            ) : (
              <div style={styles.propertiesGrid}>
                {filteredProperties.map((property) => {
                  const status = statusConfig[property.status] || statusConfig.pending;
                  const booked = property.bookedUnits || 0;
                  const total = property.totalUnits || 1;
                  const available = property.availableUnits ?? Math.max(0, total - booked);
                  const fullyBooked = booked >= total;

                  return (
                    <div key={property._id} style={styles.propertyCard} className="property-card">
                      {/* Thumbnail Image */}
                      <div style={styles.propertyImage}>
                        <img
                          src={property.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"}
                          alt={property.title}
                          style={styles.image}
                        />
                        <div style={{ ...styles.badge, backgroundColor: status.bg }}>
                          {status.label}
                        </div>
                        {fullyBooked && (
                          <div style={styles.fullyBookedBadge}>🔴 FULLY BOOKED</div>
                        )}
                      </div>

                      {/* Info detail */}
                      <div style={styles.propertyContent}>
                        <h3 style={styles.propertyTitle}>{property.title}</h3>
                        <p style={{ ...styles.propertyLocation, display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <span>{property.location}</span>
                        </p>
                        <p style={styles.propertyPrice}>KSh {Number(property.price).toLocaleString()} / month</p>

                        {/* Units counts */}
                        <div style={styles.unitsRow}>
                          <div style={styles.unitBox}>
                            <span style={styles.unitNum}>{total}</span>
                            <span style={styles.unitLbl}>Total Units</span>
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

                        {/* Progress Bar */}
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
                            ? "🔴 All units booked — hidden from searches"
                            : `🟢 ${available} of ${total} units active to rent`}
                        </p>

                        {/* Actions block */}
                        {property.status === "approved" && (
                          <div style={styles.actionsGrid}>
                            <button
                              onClick={() => updateBookedUnits(property._id, 1)}
                              disabled={fullyBooked}
                              style={{
                                ...styles.actionGridBtn,
                                background: fullyBooked ? "#1e293b" : "#22c55e",
                                color: "white",
                                cursor: fullyBooked ? "not-allowed" : "pointer",
                                opacity: fullyBooked ? 0.5 : 1,
                              }}
                            >
                              ✓ Occupied
                            </button>

                            <button
                              onClick={() => updateBookedUnits(property._id, -1)}
                              disabled={booked === 0}
                              style={{
                                ...styles.actionGridBtn,
                                background: booked === 0 ? "#1e293b" : "#ef4444",
                                color: "white",
                                cursor: booked === 0 ? "not-allowed" : "pointer",
                                opacity: booked === 0 ? 0.5 : 1,
                              }}
                            >
                              ✗ Free Unit
                            </button>

                            <button
                              onClick={() => handleBoost(property)}
                              style={{ ...styles.actionGridBtn, ...styles.boostBtnGrid, gridColumn: "1 / -1" }}
                            >
                              ⭐ Boost Property
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPropertyForQR(property);
                                setQrModalOpen(true);
                              }}
                              style={styles.qrGridBtn}
                            >
                              🖨️ Poster / QR
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPropertyForStats(property);
                                setStatsModalOpen(true);
                              }}
                              style={styles.statsGridBtn}
                            >
                              📊 QR Stats
                            </button>

                            {/* Assign Agent Selector */}
                            <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                              <label style={styles.agentLabel}>Assign Management Agent:</label>
                              <select
                                value={selectedAgents[property._id] || ""}
                                onChange={(e) => handleAssignAgent(property._id, e.target.value)}
                                style={styles.agentSelect}
                              >
                                <option value="">Direct Landlord Management</option>
                                {agents.map((agent) => (
                                  <option key={agent._id} value={agent._id}>
                                    {agent.name} ({agent.phone})
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
            )}
          </div>
        )}

        {/* ── SCREEN 3: ENQUIRIES LOG ── */}
        {activeSidebarTab === "enquiries" && (
          <div style={styles.tabContentSection}>
            <div>
              <h2 style={styles.contentTitle}>Offline Inquiry Leads</h2>
              <p style={styles.contentSubtitle}>Monitor potential tenant inquiries generated through physical poster QR scans.</p>
            </div>

            {enquiriesLoading ? (
              <p style={styles.loading}>⏳ Aggregating scan reports...</p>
            ) : enquiriesData.length === 0 ? (
              <div style={styles.empty}>
                <p>No offline QR scans recorded yet. Deploy posters to begin collecting conversions!</p>
              </div>
            ) : (
              <div style={styles.leadsGrid}>
                {/* Metrics */}
                <div style={styles.statsContainer}>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>
                      {enquiriesData.reduce((acc, curr) => acc + curr.totalScans, 0)}
                    </div>
                    <div style={styles.statName}>Aggregate Poster Scans</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>
                      {enquiriesData.reduce((acc, curr) => acc + curr.totalInquiries, 0)}
                    </div>
                    <div style={styles.statName}>Total Digital Inquiries</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>
                      {enquiriesData.reduce((acc, curr) => acc + curr.totalScans, 0) > 0
                        ? ((enquiriesData.reduce((acc, curr) => acc + curr.totalInquiries, 0) /
                            enquiriesData.reduce((acc, curr) => acc + curr.totalScans, 0)) * 100).toFixed(1)
                        : "0.0"}%
                    </div>
                    <div style={styles.statName}>Scan-to-Inquiry Rate</div>
                  </div>
                </div>

                {/* Leads Log Table */}
                <div style={styles.tableCard}>
                  <h3 style={styles.tableCardHeader}>QR Scan Channels Breakdown</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.leadsTable}>
                      <thead>
                        <tr>
                          <th style={styles.tableTh}>Property</th>
                          <th style={styles.tableTh}>Total Scans</th>
                          <th style={styles.tableTh}>Digital Inquiries</th>
                          <th style={styles.tableTh}>Conversion Rate</th>
                          <th style={styles.tableTh}>Top Placement Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiriesData.map((data) => {
                          // Find top placement source
                          let topSource = "N/A";
                          let maxCount = 0;
                          data.sources.forEach(src => {
                            if (src.count > maxCount) {
                              maxCount = src.count;
                              topSource = SOURCES.find(s => s.value === src._id)?.label || src._id;
                            }
                          });

                          return (
                            <tr key={data.propertyId} style={styles.tableTr}>
                              <td style={styles.tableTd}>{data.title}</td>
                              <td style={styles.tableTd}>{data.totalScans}</td>
                              <td style={styles.tableTd}>{data.totalInquiries}</td>
                              <td style={styles.tableTd}>
                                <span style={{
                                  color: data.conversionRate > 20 ? "#22c55e" : "#fbbf24",
                                  fontWeight: "700"
                                }}>
                                  {data.conversionRate.toFixed(1)}%
                                </span>
                              </td>
                              <td style={styles.tableTd}>
                                <span style={styles.sourceTag}>{topSource}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mock CRM Contact Feed */}
                <div style={styles.tableCard}>
                  <h3 style={styles.tableCardHeader}>Recent QR Prospects & Channels</h3>
                  <div style={styles.leadsFeed}>
                    <div style={styles.feedItem}>
                      <div style={styles.feedAvatar}>DK</div>
                      <div style={styles.feedDetail}>
                        <div style={styles.feedRow1}>
                          <span style={styles.feedName}>David Kiprop</span>
                          <span style={styles.feedTime}>2 hours ago</span>
                        </div>
                        <p style={styles.feedText}>
                          Scanned <strong>Gate Poster</strong> on property and contacted via <strong>WhatsApp</strong>.
                        </p>
                      </div>
                    </div>
                    <div style={styles.feedItem}>
                      <div style={styles.feedAvatar}>AM</div>
                      <div style={styles.feedDetail}>
                        <div style={styles.feedRow1}>
                          <span style={styles.feedName}>Alice Mutua</span>
                          <span style={styles.feedTime}>5 hours ago</span>
                        </div>
                        <p style={styles.feedText}>
                          Scanned <strong>Noticeboard Poster</strong> and initiated <strong>Direct Call</strong>.
                        </p>
                      </div>
                    </div>
                    <div style={styles.feedItem}>
                      <div style={styles.feedAvatar}>JO</div>
                      <div style={styles.feedDetail}>
                        <div style={styles.feedRow1}>
                          <span style={styles.feedName}>Julius Onyango</span>
                          <span style={styles.feedTime}>Yesterday</span>
                        </div>
                        <p style={styles.feedText}>
                          Scanned <strong>Vacancy Signboard</strong> and booked a viewing unit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 4: BOOKINGS SCREEN ── */}
        {activeSidebarTab === "bookings" && (
          <div style={styles.tabContentSection}>
            <div>
              <h2 style={styles.contentTitle}>Bookings & Tenancies</h2>
              <p style={styles.contentSubtitle}>Track unit occupancies, lease completions, and booking calendars.</p>
            </div>

            <div style={styles.empty}>
              <p style={{ fontSize: "16px", color: "#fbbf24", fontWeight: "700" }}>📅 Booking Manager Active</p>
              <p style={{ marginTop: "8px" }}>
                Total occupied units: <strong>{counts.booked} units</strong> across {counts.all} listings.
              </p>
              <div style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "#22c55e",
                fontWeight: "600",
                fontSize: "12px"
              }}>
                ✓ Syncing with Axxspace Rent Payment system
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 5: PROMOTE SUITE (MATCHING MOCKUP IMAGE) ── */}
        {activeSidebarTab === "promote-property" && (
          <PromotePropertyTab propertiesList={properties} />
        )}

        {/* ── SCREEN 6: MESSAGES BOX ── */}
        {activeSidebarTab === "messages" && (
          <div style={styles.tabContentSection}>
            <div>
              <h2 style={styles.contentTitle}>Messages</h2>
              <p style={styles.contentSubtitle}>Communicate with prospective tenants and assigned agents.</p>
            </div>

            {/* Premium Chat Layout Mockup */}
            <div style={styles.chatWrapper}>
              <div style={styles.chatSidebar}>
                <div style={styles.chatSearch}>
                  <input type="text" placeholder="Search chats..." style={styles.chatSearchInput} />
                </div>
                <div style={styles.chatContactList}>
                  <div style={{ ...styles.chatContact, ...styles.chatContactActive }}>
                    <div style={styles.contactAvatar}>DK</div>
                    <div style={styles.contactInfo}>
                      <div style={styles.contactHeader}>
                        <span style={styles.contactName}>David Kiprop</span>
                        <span style={styles.contactTime}>12:30 PM</span>
                      </div>
                      <p style={styles.contactPreview}>Is the 2-bedroom Kileleshwa still vacant?</p>
                    </div>
                  </div>
                  <div style={styles.chatContact}>
                    <div style={styles.contactAvatar}>AM</div>
                    <div style={styles.contactInfo}>
                      <div style={styles.contactHeader}>
                        <span style={styles.contactName}>Alice Mutua</span>
                        <span style={styles.contactTime}>Yesterday</span>
                      </div>
                      <p style={styles.contactPreview}>I will send the deposit in 1 hour.</p>
                    </div>
                  </div>
                  <div style={styles.chatContact}>
                    <div style={styles.contactAvatar}>KA</div>
                    <div style={styles.contactInfo}>
                      <div style={styles.contactHeader}>
                        <span style={styles.contactName}>Kevin Agent</span>
                        <span style={styles.contactTime}>Aug 17</span>
                      </div>
                      <p style={styles.contactPreview}>Assigned property keys received.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.chatArea}>
                <div style={styles.chatHeader}>
                  <div style={styles.chatHeaderName}>David Kiprop</div>
                  <div style={styles.chatHeaderStatus}>Active QR lead (Gate Poster)</div>
                </div>
                <div style={styles.chatMessages}>
                  <div style={styles.messageReceived}>
                    <div style={styles.messageText}>
                      Hello, I scanned the poster outside. Is the Kileleshwa 2 bedroom apartment available for viewings?
                    </div>
                    <span style={styles.messageTime}>12:28 PM</span>
                  </div>
                  <div style={styles.messageSent}>
                    <div style={styles.messageText}>
                      Yes, David! It is available. You can view today at 4:00 PM. Our assigned agent Kevin will be there.
                    </div>
                    <span style={styles.messageTime}>12:30 PM</span>
                  </div>
                </div>
                <div style={styles.chatInputRow}>
                  <input type="text" placeholder="Type a message..." style={styles.chatInput} />
                  <button style={styles.chatSendBtn}>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 7: PROFILE SCREEN ── */}
        {activeSidebarTab === "profile" && (
          <div style={styles.tabContentSection}>
            <div style={styles.header}>
              <h2 style={styles.contentTitle}>My Profile</h2>
              <p style={styles.contentSubtitle}>Update your personal profile, credentials, and verification badges.</p>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <VerificationBadges userId={user?._id || user?.id} userType="landlord" />
            </div>

            <UserProfileEditor 
              token={token} 
              user={user} 
              accentColor="#fbbf24" 
              onUpdated={(u) => { if (u) login(token, u); }} 
            />
          </div>
        )}

        {/* ── SCREEN 8: SETTINGS SCREEN ── */}
        {activeSidebarTab === "settings" && (
          <div style={styles.tabContentSection}>
            <div>
              <h2 style={styles.contentTitle}>Settings</h2>
              <p style={styles.contentSubtitle}>Manage notifications, payout account settings, and workspace preferences.</p>
            </div>

            <div style={styles.settingsGrid}>
              <div style={styles.settingsCard}>
                <h4 style={styles.settingsCardTitle}>Payout Account</h4>
                <p style={styles.settingsCardDesc}>Define where your rental deposits are wired.</p>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>M-PESA Paybill / Number</label>
                  <input type="text" placeholder="e.g. 0712345678" style={styles.formSelect} />
                </div>
                <button style={styles.addPropHeaderBtn}>Save Details</button>
              </div>

              <div style={styles.settingsCard}>
                <h4 style={styles.settingsCardTitle}>Email Notifications</h4>
                <p style={styles.settingsCardDesc}>Control alert emails sent when prospects scan posters.</p>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
                  <span style={{ fontSize: "14px" }}>Send email for every new QR scan</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px" }}>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
                  <span style={{ fontSize: "14px" }}>Send weekly performance summary</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {selectedPropertyForBoost && (
        <QuickBoostModal
          isOpen={boostModalOpen}
          onClose={() => {
            setBoostModalOpen(false);
            setSelectedPropertyForBoost(null);
          }}
          itemType="property"
          itemId={selectedPropertyForBoost._id}
          itemName={selectedPropertyForBoost.title}
          onSuccess={fetchMyProperties}
        />
      )}

      {selectedPropertyForQR && (
        <QRGeneratorModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedPropertyForQR(null);
          }}
          property={selectedPropertyForQR}
        />
      )}

      {selectedPropertyForStats && (
        <QRStatsModal
          isOpen={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setSelectedPropertyForStats(null);
          }}
          property={selectedPropertyForStats}
        />
      )}
    </div>
  );
}

// Sidebar & Main Layout Styles
const styles = {
  dashboardWrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#070F1E",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
  },
  mobileHeader: {
    display: "none",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#08101E",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    zIndex: 150,
  },
  sidebarHeader: {
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImg: {
    width: "32px",
    height: "32px",
    objectFit: "contain",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  portalSubtitle: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginTop: "12px",
  },
  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "16px 12px",
    flex: 1,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94A3B8",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    width: "100%",
  },
  menuItemActiveRed: {
    background: "rgba(217, 56, 58, 0.15)",
    border: "1px solid rgba(217, 56, 58, 0.3)",
    color: "#ffffff",
  },
  sidebarBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    backgroundColor: "#070F1E",
    overflowY: "auto",
    maxHeight: "100vh",
  },
  tabContentSection: {
    display: "flex",
    flexDirection: "column",
  },
  contentTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#f1f5f9",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  contentSubtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 24px",
  },
  statsContainer: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
    gap: "16px", 
    marginBottom: "28px" 
  },
  statCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px", 
    padding: "24px", 
    textAlign: "center",
  },
  statValue: { 
    fontSize: "36px", 
    fontWeight: 800, 
    color: "#fbbf24", 
    marginBottom: "8px", 
    letterSpacing: "-1px" 
  },
  statName: { 
    fontSize: "13px", 
    color: "#94a3b8", 
    fontWeight: 600, 
    textTransform: "uppercase", 
    letterSpacing: "1px" 
  },
  addPropHeaderBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white", 
    border: "none", 
    borderRadius: "10px",
    fontSize: "13px", 
    fontWeight: 700, 
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", 
    transition: "all 0.3s ease",
  },
  tabsScroll: {
    display: "flex", 
    gap: "8px", 
    overflowX: "auto",
    marginBottom: "20px", 
    paddingBottom: "8px", 
    scrollBehavior: "smooth",
  },
  tabBtn: {
    background: "rgba(30, 41, 59, 0.6)", 
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    color: "#94a3b8",
    padding: "10px 16px", 
    borderRadius: "8px", 
    fontSize: "12px",
    fontWeight: 600, 
    cursor: "pointer", 
    whiteSpace: "nowrap", 
    transition: "all 0.3s ease",
  },
  tabBtnActive: { 
    background: "#fbbf24", 
    color: "#0f1729", 
    border: "1px solid #fbbf24", 
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" 
  },
  tabCount: { 
    fontSize: "10px",
    fontWeight: "750" 
  },
  propertiesGrid: { 
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px" 
  },
  propertyCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px", 
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
  },
  propertyImage: { 
    position: "relative", 
    height: "180px", 
    width: "100%" 
  },
  image: { 
    width: "100%", 
    height: "100%", 
    objectFit: "cover" 
  },
  badge: {
    position: "absolute", 
    top: "8px", 
    right: "8px",
    padding: "4px 10px", 
    borderRadius: "16px",
    fontSize: "11px", 
    fontWeight: 700, 
    color: "white",
  },
  fullyBookedBadge: {
    position: "absolute", 
    bottom: "8px", 
    left: "8px",
    background: "rgba(239,68,68,0.9)", 
    color: "white",
    padding: "4px 10px", 
    borderRadius: "8px",
    fontSize: "11px", 
    fontWeight: 800, 
    letterSpacing: "0.05em",
  },
  propertyContent: { 
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  propertyTitle: { 
    margin: "0 0 8px", 
    fontSize: "17px", 
    fontWeight: 800, 
    color: "#f1f5f9", 
    letterSpacing: "-0.3px" 
  },
  propertyLocation: { 
    margin: "0 0 6px", 
    fontSize: "13px", 
    color: "#94a3b8" 
  },
  propertyPrice: { 
    margin: "8px 0 16px", 
    fontSize: "18px", 
    fontWeight: 850, 
    color: "#fbbf24", 
    letterSpacing: "-0.5px" 
  },
  unitsRow: {
    display: "grid", 
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px", 
    marginBottom: "10px",
  },
  unitBox: {
    background: "rgba(255,255,255,0.05)", 
    borderRadius: "10px",
    padding: "10px 4px", 
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  unitNum: { 
    display: "block", 
    fontSize: "20px", 
    fontWeight: 800, 
    color: "#fbbf24", 
    letterSpacing: "-1px" 
  },
  unitLbl: { 
    display: "block", 
    fontSize: "9px", 
    color: "#94a3b8", 
    marginTop: "4px", 
    fontWeight: 700, 
    textTransform: "uppercase" 
  },
  progressBar: {
    height: "6px", 
    background: "#1e293b", 
    borderRadius: "4px",
    overflow: "hidden", 
    marginBottom: "6px", 
    border: "1px solid #334155",
  },
  progressFill: { 
    height: "100%", 
    borderRadius: "4px", 
    transition: "width 0.4s ease" 
  },
  progressLabel: { 
    fontSize: "11px", 
    color: "#94a3b8", 
    margin: "0 0 16px", 
    lineHeight: 1.4 
  },
  actionsGrid: {
    display: "grid", 
    gridTemplateColumns: "1fr 1fr",
    gap: "8px", 
    marginTop: "auto",
  },
  actionGridBtn: {
    padding: "10px", 
    background: "rgba(51, 65, 85, 0.8)", 
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    borderRadius: "8px", 
    fontSize: "12px",
    fontWeight: 700, 
    cursor: "pointer", 
    transition: "all 0.3s ease",
  },
  boostBtnGrid: { 
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", 
    color: "#0f1729", 
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" 
  },
  qrGridBtn: {
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  statsGridBtn: {
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  agentLabel: { 
    fontSize: "11px", 
    color: "#94a3b8", 
    marginBottom: "4px",
    display: "block",
    fontWeight: "700"
  },
  agentSelect: {
    width: "100%", 
    padding: "10px", 
    background: "rgba(30, 41, 59, 0.8)",
    color: "#f1f5f9", 
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    borderRadius: "8px",
    fontSize: "12px", 
    fontWeight: 600, 
    cursor: "pointer",
  },
  successMsg: {
    background: "rgba(34, 197, 94, 0.2)", 
    border: "1px solid #22c55e",
    color: "#86efac", 
    padding: "12px", 
    borderRadius: "8px",
    marginBottom: "20px", 
    fontSize: "13px", 
    fontWeight: 600,
  },
  errorMsg: {
    background: "rgba(239, 68, 68, 0.2)", 
    border: "1px solid #ef4444",
    color: "#fca5a5", 
    padding: "12px", 
    borderRadius: "8px",
    marginBottom: "20px", 
    fontSize: "13px", 
    fontWeight: 600,
  },
  loading: { 
    textAlign: "center", 
    color: "#94a3b8", 
    fontSize: "14px", 
    padding: "40px 20px" 
  },
  empty: {
    textAlign: "center", 
    color: "#94a3b8", 
    padding: "40px 20px",
    background: "#1e293b", 
    borderRadius: "12px", 
    border: "1px dashed #334155",
  },
  // Promote Property Screen layout Styles
  promoteContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  promoteSplit: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
  },
  promoteControlCard: {
    backgroundColor: "#111A2E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  promoteQrCard: {
    backgroundColor: "#111A2E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: "750",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  formSelect: {
    padding: "12px 16px",
    backgroundColor: "#070F1E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    outline: "none",
  },
  promoPropDetailCard: {
    display: "flex",
    gap: "16px",
    backgroundColor: "#070F1E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "16px",
  },
  promoPropImg: {
    width: "70px",
    height: "70px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  promoPropInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  promoPropTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 4px 0",
  },
  promoPropLoc: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 6px 0",
  },
  promoPropLink: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#fbbf24",
    textDecoration: "none",
  },
  formInputReadOnly: {
    padding: "12px 16px",
    backgroundColor: "#070F1E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    outline: "none",
  },
  promoteQrTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#fbbf24",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    marginBottom: "16px",
  },
  promoteQrFrame: {
    border: "4px solid #C5A059",
    borderRadius: "20px",
    padding: "12px",
    backgroundColor: "#ffffff",
    marginBottom: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  promoRedBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#d9383a",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "750",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(217, 56, 58, 0.3)",
    transition: "all 0.2s ease",
  },
  promoFormatText: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "12px",
    fontWeight: "600",
  },
  promoteTipBox: {
    display: "flex",
    gap: "12px",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    border: "1px solid rgba(59, 130, 246, 0.15)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginTop: "24px",
    alignItems: "flex-start",
  },
  tipIcon: {
    fontSize: "18px",
    lineHeight: "1",
  },
  tipText: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.4",
  },
  // Table CRM styling
  tableCard: {
    backgroundColor: "#111A2E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
  },
  tableCardHeader: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#f1f5f9",
    margin: "0 0 16px 0",
    letterSpacing: "-0.3px",
  },
  leadsTable: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableTh: {
    padding: "12px",
    borderBottom: "1.5px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    fontSize: "11px",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  tableTr: {
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  tableTd: {
    padding: "14px 12px",
    fontSize: "13px",
    color: "#f1f5f9",
  },
  sourceTag: {
    padding: "4px 8px",
    borderRadius: "12px",
    backgroundColor: "rgba(197, 160, 89, 0.15)",
    color: "#C5A059",
    fontSize: "10px",
    fontWeight: "700",
  },
  leadsFeed: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  feedItem: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  feedAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#d9383a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
  },
  feedDetail: {
    flex: 1,
  },
  feedRow1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedName: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#f1f5f9",
  },
  feedTime: {
    fontSize: "11px",
    color: "#64748b",
  },
  feedText: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  // Chat Room layouts
  chatWrapper: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    backgroundColor: "#111A2E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    height: "550px",
    overflow: "hidden",
  },
  chatSidebar: {
    borderRight: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  chatSearch: {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  chatSearchInput: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#070F1E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
  },
  chatContactList: {
    flex: 1,
    overflowY: "auto",
  },
  chatContact: {
    display: "flex",
    gap: "10px",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  chatContactActive: {
    backgroundColor: "rgba(217, 56, 58, 0.08)",
  },
  contactAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#334155",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "750",
    fontSize: "12px",
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  contactName: {
    fontSize: "13px",
    fontWeight: "750",
    color: "#ffffff",
  },
  contactTime: {
    fontSize: "10px",
    color: "#64748b",
  },
  contactPreview: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chatArea: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#08101E",
  },
  chatHeader: {
    padding: "16px 20px",
    backgroundColor: "#111A2E",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  chatHeaderName: {
    fontSize: "15px",
    fontWeight: "800",
  },
  chatHeaderStatus: {
    fontSize: "11px",
    color: "#fbbf24",
    marginTop: "2px",
    fontWeight: "600",
  },
  chatMessages: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageReceived: {
    alignSelf: "flex-start",
    maxWidth: "70%",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  messageSent: {
    alignSelf: "flex-end",
    maxWidth: "70%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  messageText: {
    padding: "12px 16px",
    borderRadius: "14px",
    backgroundColor: "#111A2E",
    color: "#f1f5f9",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  messageTime: {
    fontSize: "10px",
    color: "#64748b",
  },
  chatInputRow: {
    padding: "16px 20px",
    backgroundColor: "#111A2E",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    gap: "12px",
  },
  chatInput: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#070F1E",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
  },
  chatSendBtn: {
    padding: "0 20px",
    backgroundColor: "#d9383a",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "750",
    fontSize: "13px",
    cursor: "pointer",
  },
  // Settings Screen
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  settingsCard: {
    backgroundColor: "#111A2E",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  settingsCardTitle: {
    fontSize: "15px",
    fontWeight: "800",
    margin: 0,
  },
  settingsCardDesc: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  }
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
  
  .axx-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
  }
  
  @media (max-width: 768px) {
    div[style*="dashboardWrapper"] {
      flex-direction: column;
    }
    header[style*="mobileHeader"] {
      display: flex !important;
      height: 60px;
      background-color: #08101E;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      position: sticky;
      top: 0;
      z-index: 200;
    }
    .axx-sidebar {
      position: fixed !important;
      top: 60px !important;
      height: calc(100vh - 60px) !important;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    main[style*="mainContent"] {
      padding: 20px !important;
    }
    div[style*="promoteSplit"] {
      grid-template-columns: 1fr !important;
    }
    div[style*="chatWrapper"] {
      grid-template-columns: 1fr !important;
      height: auto !important;
    }
    div[style*="chatSidebar"] {
      border-right: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      max-height: 200px;
    }
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }

  /* Custom scrollbar */
  aside::-webkit-scrollbar, main::-webkit-scrollbar, div::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  aside::-webkit-scrollbar-track, main::-webkit-scrollbar-track {
    background: transparent;
  }
  aside::-webkit-scrollbar-thumb, main::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 3px;
  }
  
  @media print {
    body * {
      visibility: hidden !important;
    }
    .print-poster-only, .print-poster-only * {
      visibility: visible !important;
    }
    .print-poster-only {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      background: white !important;
      color: black !important;
      z-index: 999999 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    .axx-vacancy-poster {
      width: 210mm !important;
      height: 297mm !important;
      max-width: 210mm !important;
      max-height: 297mm !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      page-break-inside: avoid !important;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
  }
`;