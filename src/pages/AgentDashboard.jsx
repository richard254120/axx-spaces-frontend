import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/fileLinks";
import QRGeneratorModal from "../components/QRGeneratorModal";
import AgentQRPosterModal from "../components/AgentQRPosterModal";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    minHeight: "100vh",
  },
  header: {
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  logoAccent: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#fbbf24",
  },
  logoWord: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#1f2937",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
  },
  logoutBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
  },
  tab: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: {
    color: "#fbbf24",
    borderBottomColor: "#fbbf24",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
  },
  cardName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
  },
  cardEmail: {
    fontSize: "12px",
    color: "#6b7280",
  },
  cardPhone: {
    fontSize: "13px",
    color: "#4b5563",
    marginTop: "4px",
  },
  cardCounty: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "100%",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "100px",
    resize: "vertical",
    marginBottom: "16px",
  },
  modalButtons: {
    display: "flex",
    gap: "10px",
  },
  modalBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modalBtnPrimary: {
    background: "#fbbf24",
    color: "#1f2937",
  },
  modalBtnSecondary: {
    background: "#e5e7eb",
    color: "#4b5563",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
    transition: "all 0.2s",
  },
  statusApproved: {
    background: "#dcfce7",
    color: "#166534",
  },
  houseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: "20px",
  },
  houseCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  },
  houseImgWrap: {
    width: "100%",
    height: "175px",
    position: "relative",
    background: "#f1f5f9",
  },
  houseImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  houseTypePill: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
    backdropFilter: "blur(4px)",
  },
  houseStatusPill: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  houseContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px",
  },
  houseTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  houseLocation: {
    fontSize: "13px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  housePrice: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#059669",
    marginTop: "2px",
  },
  houseInfoRow: {
    fontSize: "12px",
    color: "#4b5563",
    background: "#f9fafb",
    padding: "8px 10px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
  },
  houseActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  editBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#1f2937",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  viewBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#f3f4f6",
    color: "#1f2937",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  delBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyCard: {
    background: "white",
    borderRadius: "14px",
    border: "1.5px dashed #cbd5e1",
    padding: "48px 24px",
    textAlign: "center",
    maxWidth: "520px",
    margin: "24px auto",
  },
  profileSection: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  profileImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    background: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: 700,
    color: "#fff",
    border: "4px solid #fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  profileInfo: {
    flex: 1,
    minWidth: "250px",
  },
  profileName: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "4px",
  },
  profileDetail: {
    fontSize: "14px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  },
  statsGrid: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  statBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px 24px",
    textAlign: "center",
    flex: "1",
    minWidth: "120px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#3b82f6",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
  },
  qrBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #fbbf24",
    background: "#fffbeb",
    color: "#d97706",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "11px",
    fontWeight: 600,
    opacity: 0,
    transition: "opacity 0.2s",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#fbbf24",
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  },
};

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("houses");
  const [myHouses, setMyHouses] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalProperty, setQrModalProperty] = useState(null);
  const [showAgentQRPoster, setShowAgentQRPoster] = useState(false);

  // New professional enhancements state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Profile picture upload state
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [hoveredAvatar, setHoveredAvatar] = useState(false);
  const profilePictureInputRef = useRef(null);

  // Package-related state
  const [packages, setPackages] = useState(null);
  const [myPackage, setMyPackage] = useState(null);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [purchasingPackage, setPurchasingPackage] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Check if we've already processed this approval
  const getApprovalProcessedFlag = () => {
    const userId = user?._id;
    if (!userId) {
      console.log("⚠️ [Flag] No user ID, skipping flag check");
      return false;
    }
    const flagKey = `approvalProcessed_${userId}`;
    const value = localStorage.getItem(flagKey) === "true";
    console.log(`📍 [Flag] Checking ${flagKey}: ${value}`);
    return value;
  };

  const setApprovalProcessedFlag = () => {
    const userId = user?._id;
    if (!userId) {
      console.log("⚠️ [Flag] No user ID, cannot set flag");
      return;
    }
    const flagKey = `approvalProcessed_${userId}`;
    localStorage.setItem(flagKey, "true");
    console.log(`✅ [Flag] Set ${flagKey} = true`);
  };

  const clearApprovalProcessedFlag = () => {
    const userId = user?._id;
    if (!userId) {
      console.log("⚠️ [Flag] No user ID, cannot clear flag");
      return;
    }
    const flagKey = `approvalProcessed_${userId}`;
    localStorage.removeItem(flagKey);
    console.log(`🗑️ [Flag] Cleared ${flagKey}`);
  };

  // Toast system functions
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Profile completeness calculation
  const calculateProfileCompleteness = () => {
    let completeness = 0;
    if (user?.name) completeness += 20;
    if (user?.email) completeness += 20;
    if (user?.phone) completeness += 20;
    if (user?.county) completeness += 20;
    if (user?.profileImage) completeness += 20;
    return completeness;
  };

  // Filtered and sorted houses
  const filteredAndSortedHouses = () => {
    let filtered = [...myHouses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.title?.toLowerCase().includes(query) ||
        h.location?.toLowerCase().includes(query) ||
        h.county?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(h => h.status === statusFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return filtered;
  };

  // Count requests by status
  const requestCounts = {
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  };

  useEffect(() => {
    if (!user || user.role !== "agent") {
      navigate("/agent/login");
      return;
    }
    console.log("🚀 [Mount] AgentDashboard mounted for user:", user._id);
    
    loadData();
    loadPackages();
    loadMyPackage(token);
    loadPendingPurchase(token);
  }, [user, navigate, token]);

  // Auto-refresh package status every 3 seconds to detect admin approval
  useEffect(() => {
    if (!user || user.role !== "agent" || !token) return;
    
    console.log("🔄 [Polling] Started - checking every 3 seconds");
    
    const interval = setInterval(() => {
      console.log("🔍 [Polling] Checking for updates...");
      loadMyPackage(token);
      loadPendingPurchase(token);
    }, 3000); // Check every 3 seconds for faster detection
    
    return () => {
      console.log("🛑 [Polling] Stopped");
      clearInterval(interval);
    };
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load my uploaded houses
      try {
        const housesRes = await fetch(`${API_BASE}/properties/my-properties/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (housesRes.ok) {
          const housesData = await housesRes.json();
          setMyHouses(Array.isArray(housesData) ? housesData : []);
        }
      } catch (err) {
        console.error("Error loading agent houses:", err);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const res = await fetch(`${API_BASE}/agents/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Error loading packages:", err);
    }
  };

  const loadMyPackage = async (currentToken) => {
    try {
      const res = await fetch(`${API_BASE}/agents/my-package`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyPackage(data);
        
        // If the package tier has been upgraded, update the auth context
        if (data.currentTier && user?.agentProfile?.subscriptionTier !== data.currentTier) {
          console.log(`📦 [Package] Tier upgraded from ${user?.agentProfile?.subscriptionTier} to ${data.currentTier}`);
          updateUser({
            ...user,
            agentProfile: {
              ...user.agentProfile,
              subscriptionTier: data.currentTier,
              subscriptionExpiresAt: data.expiresAt,
            }
          });
          addToast(`Package upgraded to ${data.package?.name}!`, 'success');
        }
      }
    } catch (err) {
      console.error("Error loading my package:", err);
    }
  };

  const loadPendingPurchase = async (currentToken) => {
    try {
      const res = await fetch(`${API_BASE}/agents/my-pending-purchase`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("📊 [Polling] Pending Purchase Data:", data);
        
        // If approval detected (and we haven't already processed it for this approval)
        // AND there's no existing pending purchase (meaning it was just approved)
        if (!data.pendingPurchase && data.hasPending === false && !getApprovalProcessedFlag() && pendingPurchase) {
          console.log("✅ [Polling] Clearing pending purchase - approval detected!");
          setPendingPurchase(null);
          setShowPackageModal(false);
          addToast("Payment approved! Your package has been upgraded.", "success");
          
          // Mark this approval as processed (persists across page reloads/component remounts)
          setApprovalProcessedFlag();
          
          // Force refresh the package info to show new tier
          console.log("📦 [Polling] Refreshing package info after approval...");
          await loadMyPackage(currentToken);
          
          // NO PAGE RELOAD - Just update UI directly
          console.log("✅ [Polling] Approval processed, UI updated");
        } else if (data.pendingPurchase) {
          // If there's a new pending purchase, clear the flag so future approvals will trigger the toast
          clearApprovalProcessedFlag();
          setPendingPurchase(data.pendingPurchase);
        } else if (!data.pendingPurchase && data.hasPending === false) {
          // If no pending purchase and flag already set, just clear the state
          setPendingPurchase(null);
        }
      }
    } catch (err) {
      console.error("Error loading pending purchase:", err);
    }
  };

  const handleCancelPendingPurchase = async () => {
    if (!confirm("Are you sure you want to cancel your pending package purchase?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agents/cancel-pending-purchase`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast("Pending purchase cancelled successfully", "success");
        setPendingPurchase(null);
        // Close the modal to force state refresh
        setShowPackageModal(false);
        // Reload pending purchase state to ensure it's cleared
        await loadPendingPurchase(token);
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to cancel pending purchase", "error");
        console.error("Cancel error details:", error);
      }
    } catch (err) {
      console.error("Error cancelling pending purchase:", err);
      addToast("Failed to cancel pending purchase", "error");
    }
  };

  const handleDebugPendingPurchase = async () => {
    try {
      const res = await fetch(`${API_BASE}/agents/debug-pending-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("=== DEBUG PENDING PURCHASE ===");
        console.log("Full data:", data);
        console.log("Has pending purchase:", data.hasPendingPurchase);
        console.log("Pending purchase:", data.pendingPurchase);
        console.log("Full agent profile:", data.fullAgentProfile);
        console.log("=== END DEBUG ===");

        const debugText = JSON.stringify(data, null, 2);
        alert(debugText);

        // Also copy to clipboard
        navigator.clipboard.writeText(debugText).then(() => {
          addToast("Debug info copied to clipboard", "success");
        }).catch(() => {
          addToast("Debug info displayed (copy failed)", "info");
        });
      } else {
        const error = await res.json();
        console.error("Debug error:", error);
        alert("Debug error: " + JSON.stringify(error, null, 2));
      }
    } catch (err) {
      console.error("Error debugging pending purchase:", err);
      alert("Error: " + err.message);
    }
  };

  const handlePurchasePackage = async () => {
    if (!selectedPackage) {
      addToast("Please select a package", "error");
      return;
    }

    if (selectedPackage && packages[selectedPackage].price > 0 && !paymentReference.trim()) {
      addToast("M-Pesa SMS confirmation message is required for paid packages", "error");
      return;
    }

    try {
      setPurchasingPackage(true);
      const res = await fetch(`${API_BASE}/agents/purchase-package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: selectedPackage,
          paymentMessage: paymentReference.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addToast(data.message, "success");
        setShowPackageModal(false);
        setSelectedPackage(null);
        setPaymentReference("");
        loadMyPackage();
        loadPendingPurchase();
        if (data.user) {
          updateUser(data.user);
        }
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to purchase package", "error");
      }
    } catch (err) {
      console.error("Error purchasing package:", err);
      addToast("Failed to purchase package", "error");
    } finally {
      setPurchasingPackage(false);
    }
  };

  const handleDeleteHouse = async (houseId) => {
    setConfirmDelete(houseId);
  };

  const confirmDeleteAction = async () => {
    const houseId = confirmDelete;
    setConfirmDelete(null);
    setDeleteLoading(houseId);
    try {
      const res = await fetch(`${API_BASE}/properties/${houseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyHouses((prev) => prev.filter((h) => h._id !== houseId));
        addToast("House deleted successfully", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error || data.message || "Failed to delete listing", "error");
      }
    } catch (err) {
      console.error("Error deleting house:", err);
      addToast("Network error while deleting house", "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = () => {
    clearApprovalProcessedFlag();
    logout("/agent/login");
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast('Only jpg, jpeg, png, gif, and webp files are allowed', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploadingProfilePicture(true);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Update user in context
        if (data.data?.user?.profileImage) {
          updateUser({ profileImage: data.data.user.profileImage });
          setProfilePicturePreview(null);
        }
        addToast('Profile picture updated successfully', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        addToast(errorData.message || 'Failed to update profile picture', 'error');
        setProfilePicturePreview(null);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      addToast('Network error while uploading profile picture', 'error');
      setProfilePicturePreview(null);
    } finally {
      setUploadingProfilePicture(false);
      // Reset file input
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.header}>
          <div style={s.logo}>
            <span style={s.logoAccent}>AXX</span>
            <span style={s.logoWord}>SPACE</span>
          </div>
          <div style={s.headerTitle}>Agent Dashboard</div>
        </div>
        <div style={{ ...s.container, paddingTop: '40px' }} aria-busy="true">
          {/* Skeleton loaders */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                height: '100px',
                borderRadius: '12px',
              }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                  backgroundSize: '200% 100%',
                  height: '180px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                  backgroundSize: '200% 100%',
                  height: '20px',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                  backgroundSize: '200% 100%',
                  height: '16px',
                  borderRadius: '4px',
                  width: '60%',
                }} />
              </div>
            ))}
          </div>
          <style>
            {`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={{ ...s.header, flexWrap: 'wrap', gap: isMobile ? '10px' : '0', padding: isMobile ? '12px 16px' : '16px 24px' }}>
        <div style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
        </div>
        <div style={{ ...s.headerTitle, fontSize: isMobile ? '15px' : '18px' }}>Agent Dashboard</div>
        <div style={{ ...s.headerActions, flexWrap: 'wrap', gap: '8px' }}>
          <button style={{ ...s.uploadBtn, padding: isMobile ? '10px 12px' : '8px 16px', fontSize: isMobile ? '12px' : '13px', minHeight: '44px' }} onClick={() => navigate('/upload')}>
            + Upload House
          </button>
          <button
            style={{
              ...s.uploadBtn,
              background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '10px 12px' : '8px 16px',
              minHeight: '44px',
            }}
            onClick={() => setShowPackageModal(true)}
            title="Upgrade Package"
          >
            {isMobile ? 'Package' : myPackage?.package?.name || 'Upgrade Package'}
          </button>
          <button
            style={{
              ...s.uploadBtn,
              background: 'linear-gradient(135deg,#d9383a,#b91c1c)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '10px 12px' : '8px 16px',
              minHeight: '44px',
            }}
            onClick={() => setShowAgentQRPoster(true)}
            title="Generate My Agent QR Poster"
          >
            {isMobile ? 'QR' : 'My QR Poster'}
          </button>
          <button style={{ ...s.logoutBtn, minHeight: '44px', padding: isMobile ? '10px 14px' : '8px 16px' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ ...s.container, padding: isMobile ? '12px 12px' : '24px' }}>
        {/* Toast notifications */}
        <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }} aria-live="polite">
          {toasts.map(toast => (
            <div key={toast.id} style={{
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '280px',
              fontSize: '14px',
              fontWeight: 600,
              animation: 'slideIn 0.3s ease',
            }}>
              {toast.message}
            </div>
          ))}
        </div>
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        {/* Profile Overview Section with completeness */}
        <div style={{
          ...s.profileSection,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '24px',
          padding: isMobile ? '16px' : '24px',
          alignItems: isMobile ? 'center' : 'flex-start',
          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(253, 230, 138, 0.3) 100%), white',
        }}>
          {/* Avatar with upload functionality */}
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
              minWidth: isMobile ? '72px' : '100px',
              minHeight: isMobile ? '72px' : '100px',
            }}
            onMouseEnter={() => setHoveredAvatar(true)}
            onMouseLeave={() => setHoveredAvatar(false)}
            onClick={() => profilePictureInputRef.current?.click()}
          >
            {profilePicturePreview || user?.profileImage ? (
              <img
                src={profilePicturePreview || resolveMediaUrl(user.profileImage)}
                alt={user?.name}
                style={{
                  ...s.profileImg,
                  width: isMobile ? '72px' : '100px',
                  height: isMobile ? '72px' : '100px',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <div
                style={{
                  ...s.profileImg,
                  width: isMobile ? '72px' : '100px',
                  height: isMobile ? '72px' : '100px',
                  fontSize: isMobile ? '26px' : '36px',
                  cursor: 'pointer',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            {/* Hover overlay */}
            <div
              style={{
                ...s.avatarOverlay,
                width: isMobile ? '72px' : '100px',
                height: isMobile ? '72px' : '100px',
                opacity: hoveredAvatar ? 1 : 0,
              }}
            >
              📷
              <span style={{ fontSize: '9px', marginTop: '2px' }}>Upload</span>
            </div>
            {/* Camera badge */}
            <div style={s.cameraBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            {/* Uploading overlay */}
            {uploadingProfilePicture && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              </div>
            )}
            {/* Hidden file input */}
            <input
              ref={profilePictureInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
              disabled={uploadingProfilePicture}
            />
          </div>
          <div style={s.profileInfo}>
            <div style={{ ...s.profileName, fontSize: isMobile ? '18px' : '24px' }}>{user?.name || "Agent"}</div>

            {/* Profile completeness bar */}
            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Profile {calculateProfileCompleteness()}% Complete</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${calculateProfileCompleteness()}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            <div style={s.profileDetail}>{user?.email || "No email provided"}</div>
            <div style={s.profileDetail}>{user?.phone || "No phone provided"}</div>
            <div style={s.profileDetail}>{user?.county || "Kenya"}</div>
          </div>
          <div style={{ ...s.statsGrid, justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <div style={s.statBox}>
              <div style={s.statValue}>{myHouses.length}</div>
              <div style={s.statLabel}>Listings</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statValue}>{myHouses.reduce((sum, h) => sum + (h.views || 0), 0)}</div>
              <div style={s.statLabel}>Total Views</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statValue}>{myHouses.reduce((sum, h) => sum + (h.qrScans || 0), 0)}</div>
              <div style={s.statLabel}>QR Scans</div>
            </div>
          </div>
        </div>

        {/* Stats Overview Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }} role="status" aria-label="Dashboard statistics">
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderTop: '3px solid',
            borderImage: 'linear-gradient(90deg, #fbbf24, #f59e0b) 1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>{myHouses.length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Total Listings</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderTop: '3px solid',
            borderImage: 'linear-gradient(90deg, #fbbf24, #f59e0b) 1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>{myHouses.reduce((sum, h) => sum + (h.views || 0), 0)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Total Views</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderTop: '3px solid',
            borderImage: 'linear-gradient(90deg, #fbbf24, #f59e0b) 1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>{myHouses.reduce((sum, h) => sum + (h.qrScans || 0), 0)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>QR Scans</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...s.tabs, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', flexWrap: 'nowrap', paddingBottom: isMobile ? '2px' : '0', gap: isMobile ? '4px' : '12px' }}>
          <button
            style={{ ...s.tab, ...(activeTab === 'houses' ? s.tabActive : {}), whiteSpace: 'nowrap', padding: isMobile ? '10px 12px' : '12px 20px', minHeight: '44px', fontSize: isMobile ? '12px' : '14px' }}
            onClick={() => setActiveTab("houses")}
          >
            My Houses ({myHouses.length})
          </button>
        </div>

        {activeTab === "houses" && (
          <div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '16px', gap: '10px' }}>
              <div>
                <h2 style={{ ...s.sectionTitle, marginBottom: "4px" }}>My Uploaded Houses &amp; Properties</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                  Upload, manage, and track your property listings directly on AXXSpace
                </p>
              </div>
              <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
                + Upload New House
              </button>
            </div>

            {/* Search and Filter Bar */}
            {myHouses.length > 0 && (
              <div style={{
                background: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search houses by title or location"
                  style={{
                    flex: isMobile ? '1' : '2',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    minWidth: '200px',
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Live</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort houses"
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
            )}

            {filteredAndSortedHouses().length === 0 && myHouses.length === 0 ? (
              <div style={s.emptyCard}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  No Houses Uploaded Yet
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.5, marginBottom: "20px" }}>
                  As an agent on AXXSpace, you can upload and manage your rental houses, apartments, hostels, and commercial units to get direct inquiries from tenants.
                </p>
                <button
                  style={{ ...s.uploadBtn, padding: "10px 22px", fontSize: "14px" }}
                  onClick={() => navigate("/upload")}
                >
                  + Upload Your First House
                </button>
              </div>
            ) : filteredAndSortedHouses().length === 0 ? (
              <div style={{ ...s.emptyCard, border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  No houses match your filters
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div style={{ ...s.houseGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {filteredAndSortedHouses().map((house) => {
                  const isApproved = house.status === "approved";
                  const isRejected = house.status === "rejected";
                  const thumb = house.images?.[0] ? resolveMediaUrl(house.images[0]) : "";
                  const isHovered = hoveredCard === house._id;

                  return (
                    <div
                      key={house._id}
                      style={{
                        ...s.houseCard,
                        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={() => setHoveredCard(house._id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div style={s.houseImgWrap}>
                        {thumb ? (
                          <img src={thumb} alt={house.title} style={s.houseImg} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "36px", background: "#f1f5f9" }}>
                          </div>
                        )}
                        <span style={s.houseTypePill}>{house.propertyType || "Rental"}</span>
                        <span
                          style={{
                            ...s.houseStatusPill,
                            ...(isApproved
                              ? s.statusApproved
                              : isRejected
                                ? s.statusRejected
                                : s.statusPending),
                          }}
                        >
                          {isApproved ? "✓ LIVE" : isRejected ? "REJECTED" : "PENDING REVIEW"}
                        </span>
                        {(house.isBoosted || house.featured) && (
                          <span style={{
                            position: 'absolute',
                            top: '45px',
                            right: '10px',
                            background: '#fbbf24',
                            color: '#1f2937',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}>
                            ⭐ FEATURED
                          </span>
                        )}
                      </div>

                      <div style={s.houseContent}>
                        <h3 style={s.houseTitle} title={house.title}>{house.title}</h3>
                        <div style={s.houseLocation}>
                          {house.location || house.county || "Kenya"}
                        </div>
                        <div style={s.housePrice}>
                          KES {Number(house.price || 0).toLocaleString()} <span style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}>/ {house.leaseType || "month"}</span>
                        </div>

                        <div style={s.houseInfoRow}>
                          <span><strong>{house.totalUnits || 1}</strong> total units</span>
                          <span><strong>{house.bookedUnits || 0}</strong> booked</span>
                        </div>
                        <div style={{ ...s.houseInfoRow, marginTop: "8px", background: "#eff6ff" }}>
                          <span style={{ color: "#2563eb", display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <strong>{house.views || 0}</strong> Views
                          </span>
                          <span style={{ color: "#2563eb", display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <path d="M12 18h.01" />
                            </svg>
                            <strong>{house.qrScans || 0}</strong> QR Scans
                          </span>
                        </div>

                        <div style={{ ...s.houseActions, flexWrap: 'wrap' }}>
                          {isApproved && (
                            <button
                              style={{ ...s.viewBtn, minHeight: '44px', transition: 'all 0.2s ease' }}
                              onClick={() => window.open(`/listings?property=${house._id}`, "_blank")}
                              title="View live listing"
                              aria-label="View live listing"
                            >
                              Live ↗
                            </button>
                          )}
                          <button
                            style={{ ...s.qrBtn, minHeight: '44px', transition: 'all 0.2s ease' }}
                            onClick={() => setQrModalProperty(house)}
                            title="View QR Poster"
                            aria-label="View QR Poster"
                          >
                            QR Poster
                          </button>
                          <button
                            style={{ ...s.editBtn, minHeight: '44px', transition: 'all 0.2s ease' }}
                            onClick={() => navigate(`/property/edit/${house._id}`)}
                            title="Edit house listing"
                            aria-label="Edit house listing"
                          >
                            Edit
                          </button>
                          <button
                            style={{ ...s.delBtn, minHeight: '44px', transition: 'all 0.2s ease' }}
                            onClick={() => handleDeleteHouse(house._id)}
                            disabled={deleteLoading === house._id}
                            title="Delete house listing"
                            aria-label="Delete house listing"
                          >
                            {deleteLoading === house._id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {qrModalProperty && (
        <QRGeneratorModal
          isOpen={!!qrModalProperty}
          onClose={() => setQrModalProperty(null)}
          property={qrModalProperty}
        />
      )}

      {/* Confirmation Delete Modal */}
      {confirmDelete && (
        <div style={s.modal}>
          <div style={{ ...s.modalContent, maxWidth: '400px' }}>
            <h3 style={s.modalTitle}>Delete House Listing</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: 1.5 }}>
              Are you sure you want to delete this house listing? This action cannot be undone.
            </p>
            <div style={s.modalButtons}>
              <button
                style={{
                  ...s.modalBtn,
                  ...s.modalBtnSecondary,
                  minHeight: '44px',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setConfirmDelete(null)}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                style={{
                  ...s.modalBtn,
                  background: '#dc2626',
                  color: 'white',
                  minHeight: '44px',
                  transition: 'all 0.2s ease',
                }}
                onClick={confirmDeleteAction}
                aria-label="Confirm deletion"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AgentQRPosterModal
        isOpen={showAgentQRPoster}
        onClose={() => setShowAgentQRPoster(false)}
        agent={user}
      />

      {/* Package Selection Modal */}
      {showPackageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowPackageModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1f2937',
              marginBottom: '8px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Choose Your Package
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
            }}>
              Select a package that fits your needs
            </p>

            {/* Pending Purchase Warning */}
            {pendingPurchase && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>
                  ⏳ Pending Purchase
                </div>
                <div style={{ fontSize: '13px', color: '#b45309', lineHeight: 1.6, marginBottom: '12px' }}>
                  You have a pending purchase for <strong>{pendingPurchase.name}</strong> (KSh {pendingPurchase.amount?.toLocaleString()}) submitted on {new Date(pendingPurchase.submittedAt).toLocaleDateString()}. Please wait for admin approval.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCancelPendingPurchase}
                    style={{
                      padding: '8px 16px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel Pending Purchase
                  </button>
                  <button
                    onClick={handleDebugPendingPurchase}
                    style={{
                      padding: '8px 16px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Debug
                  </button>
                </div>
              </div>
            )}

            {/* Current Package Status */}
            {myPackage && myPackage.currentTier !== 'none' && (
              <div style={{
                background: myPackage.isActive ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${myPackage.isActive ? '#22c55e' : '#ef4444'}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: myPackage.isActive ? '#166534' : '#dc2626', marginBottom: '4px' }}>
                  Current Package: {myPackage.package?.name}
                </div>
                <div style={{ fontSize: '13px', color: myPackage.isActive ? '#15803d' : '#b91c1c' }}>
                  {myPackage.isActive ? `Expires: ${new Date(myPackage.expiresAt).toLocaleDateString()}` : 'Package expired'}
                </div>
                <div style={{ fontSize: '13px', color: myPackage.isActive ? '#15803d' : '#b91c1c', marginTop: '4px' }}>
                  Active Listings: {myPackage.activeListingsCount} / {myPackage.package?.maxActiveListings === 100 ? 'Unlimited' : myPackage.package?.maxActiveListings}
                </div>
              </div>
            )}

            {/* Package Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {packages && Object.entries(packages).map(([tier, pkg]) => (
                <div
                  key={tier}
                  onClick={() => setSelectedPackage(tier)}
                  style={{
                    border: `2px solid ${selectedPackage === tier ? '#8b5cf6' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedPackage === tier ? '#f5f3ff' : 'white',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
                    {pkg.name}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginBottom: '12px' }}>
                    {pkg.price === 0 ? 'FREE' : `KSh ${pkg.price.toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    {pkg.description}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#374151' }}>
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Payment Instructions */}
            {selectedPackage && packages[selectedPackage].price > 0 && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
                  💳 Payment Instructions
                </div>
                <div style={{ fontSize: '13px', color: '#15803d', lineHeight: 1.6 }}>
                  <div>1. Go to M-Pesa menu on your phone</div>
                  <div>2. Select <strong>Lipa na M-Pesa</strong></div>
                  <div>3. Select <strong>Buy Goods and Services</strong></div>
                  <div>4. Enter Till Number: <strong>6593552</strong></div>
                  <div>5. Enter Amount: <strong>KSh {packages[selectedPackage].price.toLocaleString()}</strong></div>
                  <div>6. Enter your M-Pesa PIN and complete payment</div>
                  <div>7. Copy the SMS confirmation message below</div>
                </div>
              </div>
            )}

            {/* Payment Message Input */}
            {selectedPackage && packages[selectedPackage].price > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  M-Pesa SMS Confirmation Message *
                </label>
                <textarea
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Paste the M-Pesa SMS confirmation message here..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Example: "KSh1,500.00 received from John Doe 0712345678 on 5/10/26 at 12:30 PM. Account: 6593552"
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPackageModal(false);
                  setSelectedPackage(null);
                  setPaymentReference("");
                }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#6b7280',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchasePackage}
                disabled={!selectedPackage || purchasingPackage}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedPackage && !purchasingPackage ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                  opacity: selectedPackage && !purchasingPackage ? 1 : 0.5,
                }}
              >
                {purchasingPackage ? 'Processing...' : selectedPackage && packages[selectedPackage].price === 0 ? 'Activate Free' : 'Purchase Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
