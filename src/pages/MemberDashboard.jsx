import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080d1a",
    color: "#f8fafc",
    fontFamily: "'DM Sans', sans-serif",
    padding: "36px 16px 80px",
  },
  container: {
    maxWidth: "1140px",
    margin: "0 auto",
  },
  headerCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  name: {
    fontSize: "24px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  email: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  subtext: {
    fontSize: "12.5px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  exploreBtn: {
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
    transition: "all 0.2s",
  },
  providerBtn: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "20px",
    cursor: "pointer",
    transition: "transform 0.2s, border-color 0.2s",
  },
  statCardActive: {
    borderColor: "#fbbf24",
    background: "rgba(251, 191, 36, 0.05)",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "8px 0 2px 0",
  },
  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  statSub: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
    marginBottom: "24px",
    overflowX: "auto",
  },
  tabBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
  },
  section: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
  },
  sectionSub: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "50px 20px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "14px",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardImg: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 6px 0",
    lineHeight: "1.35",
  },
  cardLocation: {
    fontSize: "12.5px",
    color: "#94a3b8",
    margin: "0 0 10px 0",
  },
  cardPrice: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 12px 0",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  viewBtn: {
    flex: 1,
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    textDecoration: "none",
  },
  removeBtn: {
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusBadge: (status) => {
    const s = (status || "pending").toLowerCase();
    let bg = "rgba(251, 191, 36, 0.15)";
    let color = "#fbbf24";
    let border = "rgba(251, 191, 36, 0.3)";

    if (s === "confirmed" || s === "approved" || s === "completed") {
      bg = "rgba(16, 185, 129, 0.15)";
      color = "#34d399";
      border = "rgba(16, 185, 129, 0.3)";
    } else if (s === "cancelled" || s === "rejected") {
      bg = "rgba(239, 68, 68, 0.15)";
      color = "#f87171";
      border = "rgba(239, 68, 68, 0.3)";
    }

    return {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "11.5px",
      fontWeight: 700,
      background: bg,
      color,
      border: `1px solid ${border}`,
      textTransform: "capitalize",
    };
  },
  enquiryCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  bookingCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "14px",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  timelineItem: {
    display: "flex",
    gap: "16px",
    position: "relative",
    paddingBottom: "24px",
  },
  timelineDot: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "6px",
    display: "block",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "520px",
    width: "100%",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
  },
};

function formatTimeAgo(dateInput) {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

export default function MemberDashboard() {
  const { user, token, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState({ accommodations: [], services: [] });
  const [itemRequests, setItemRequests] = useState([]);
  const [stats, setStats] = useState({ favoritesCount: 0, enquiriesCount: 0, bookingsCount: 0, requestsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Sync tab if URL changes
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Become a Provider Modal State
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerData, setProviderData] = useState({
    businessName: "",
    county: "",
    description: "",
    services: "",
  });
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerError, setProviderError] = useState("");
  const [providerSuccess, setProviderSuccess] = useState("");

  const loadActivities = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/members/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // Merge backend favorites with local accommodation wishlists
        let combinedFavs = data.favorites || [];
        try {
          const localAccFavs = JSON.parse(localStorage.getItem("axx_accommodation_favs") || "[]");
          if (Array.isArray(localAccFavs) && localAccFavs.length > 0) {
            localAccFavs.forEach((item) => {
              if (item && item.id && !combinedFavs.some((f) => f._id === item.id || f.property?._id === item.id)) {
                combinedFavs.push({
                  _id: `local-acc-${item.id}`,
                  isLocal: true,
                  property: {
                    _id: item.id,
                    title: item.name || item.title || "Holiday Stay",
                    price: item.price,
                    location: { address: item.county || item.location || "Kenya" },
                    images: item.image ? [item.image] : [],
                    category: "accommodation",
                  },
                  createdAt: new Date().toISOString(),
                });
              }
            });
          }
        } catch (e) {
          console.warn("Local favs parse error", e);
        }

        setFavorites(combinedFavs);
        setEnquiries(data.enquiries || []);
        setBookings(data.bookings || { accommodations: [], services: [] });
        setItemRequests(data.itemRequests || []);
        setStats(data.stats || {
          favoritesCount: combinedFavs.length,
          enquiriesCount: (data.enquiries || []).length,
          bookingsCount: ((data.bookings?.accommodations || []).length + (data.bookings?.services || []).length),
          requestsCount: (data.itemRequests || []).length,
        });
      } else {
        // Fallback to separate endpoints if /activities isn't ready
        const [favRes, enqRes] = await Promise.all([
          fetch(`${API_BASE}/members/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/members/enquiries`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (favRes.ok) {
          const fData = await favRes.json();
          setFavorites(fData.favorites || []);
        }
        if (enqRes.ok) {
          const eData = await enqRes.json();
          setEnquiries(eData.enquiries || []);
        }
      }
    } catch (err) {
      console.error("Load member activities error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/user-login");
      return;
    }
    loadActivities();

    // Auto-refresh activities every 20 seconds for real-time responsiveness
    const timer = setInterval(() => {
      loadActivities();
    }, 20000);

    const onFocus = () => loadActivities();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [token, loadActivities, navigate]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const handleRemoveFavorite = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/members/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== id && f.property?._id !== id));
        setStats((prev) => ({ ...prev, favoritesCount: Math.max(0, prev.favoritesCount - 1) }));
      }
    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user || { name: profileName, phone: profilePhone });
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      } else {
        setProfileMsg(data.error || "Failed to update profile");
      }
    } catch {
      setProfileMsg("Network error saving profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBecomeProvider = async (e) => {
    e.preventDefault();
    setProviderLoading(true);
    setProviderError("");
    setProviderSuccess("");

    try {
      const res = await fetch(`${API_BASE}/users/become-provider`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: providerData.businessName,
          county: providerData.county,
          description: providerData.description,
          services: providerData.services.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade account");
      }

      setProviderSuccess("Upgrade successful! Entering your provider dashboard...");
      if (data.user) {
        updateUser(data.user);
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setProviderError(err.message || "Failed to become provider");
    } finally {
      setProviderLoading(false);
    }
  };

  const totalBookingsCount = (bookings.accommodations?.length || 0) + (bookings.services?.length || 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* TOP MEMBER PROFILE & ACTIONS */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <ProfileAvatar user={user} size={64} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={styles.name}>{user?.name || "Community Member"}</h1>
                <span style={styles.roleBadge}>
                  {user?.role === "member" ? "AXXSPACE MEMBER" : "COMMUNITY EXPLORER"}
                </span>
              </div>
              <p style={styles.email}>{user?.email}</p>
              <p style={styles.subtext}>
                Member Hub · Explore, save, inquire, and track all your website activities
              </p>
            </div>
          </div>

          <div style={styles.headerActions}>
            <Link to="/listings" style={styles.exploreBtn}>
              Browse Spaces ↗
            </Link>
            <Link to="/accommodation" style={styles.exploreBtn}>
              Book Stays ↗
            </Link>
            <button
              type="button"
              style={styles.providerBtn}
              onClick={() => setShowProviderModal(true)}
            >
              List Space / Provider →
            </button>
          </div>
        </div>

        {/* ACTIVITY STAT METRICS */}
        <div style={styles.statsRow}>
          <div
            style={{ ...styles.statCard, ...(activeTab === "overview" ? styles.statCardActive : {}) }}
            onClick={() => setActiveTab("overview")}
          >
            <div style={{ fontSize: "20px" }}>🌟</div>
            <div style={styles.statNumber}>
              {(favorites.length + enquiries.length + totalBookingsCount)}
            </div>
            <div style={styles.statLabel}>Total Activities</div>
            <div style={styles.statSub}>All platform interactions</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "favorites" ? styles.statCardActive : {}) }}
            onClick={() => setActiveTab("favorites")}
          >
            <div style={{ fontSize: "20px" }}>❤️</div>
            <div style={styles.statNumber}>{favorites.length}</div>
            <div style={styles.statLabel}>Saved Spaces</div>
            <div style={styles.statSub}>Bookmarked listings & properties</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "bookings" ? styles.statCardActive : {}) }}
            onClick={() => setActiveTab("bookings")}
          >
            <div style={{ fontSize: "20px" }}>📅</div>
            <div style={styles.statNumber}>{totalBookingsCount}</div>
            <div style={styles.statLabel}>Stays & Bookings</div>
            <div style={styles.statSub}>Accommodations & services</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "enquiries" ? styles.statCardActive : {}) }}
            onClick={() => setActiveTab("enquiries")}
          >
            <div style={{ fontSize: "20px" }}>💬</div>
            <div style={styles.statNumber}>{enquiries.length}</div>
            <div style={styles.statLabel}>Enquiries Sent</div>
            <div style={styles.statSub}>Waitlists & questions to hosts</div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={styles.tabBar}>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "overview" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("overview")}
          >
            🌟 Activity Feed
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "favorites" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("favorites")}
          >
            ❤️ Saved Spaces ({favorites.length})
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "bookings" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("bookings")}
          >
            📅 My Bookings & Stays ({totalBookingsCount})
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "enquiries" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("enquiries")}
          >
            💬 Space Enquiries ({enquiries.length})
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "profile" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("profile")}
          >
            ⚙️ Account Profile
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TIMELINE */}
        {activeTab === "overview" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Activity Timeline</h2>
                <div style={styles.sectionSub}>Everything you've explored, saved, and requested on Axxspace</div>
              </div>
              <button
                type="button"
                onClick={loadActivities}
                style={{
                  background: "none",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ↻ Refresh Feed
              </button>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8", padding: "20px 0" }}>Loading your activity feed...</p>
            ) : favorites.length === 0 && enquiries.length === 0 && totalBookingsCount === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚀</div>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "17px" }}>
                  Your Axxspace journey begins here
                </h3>
                <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "13.5px", maxWidth: "460px", marginInline: "auto" }}>
                  Save your favorite rental apartments, book weekend accommodations, or enquire about properties.
                  All your website activities will be organized right here.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link to="/listings" style={styles.submitBtn}>
                    Explore Rentals
                  </Link>
                  <Link to="/accommodation" style={{ ...styles.exploreBtn, padding: "12px 20px" }}>
                    Explore Accommodations
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Bookings events */}
                {bookings.accommodations?.map((b) => (
                  <div key={b._id} style={styles.timelineItem}>
                    <div style={styles.timelineDot}>🏨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                          Booked stay at {b.accommodation?.title || "Accommodation"}
                        </span>
                        <span style={styles.statusBadge(b.status)}>{b.status}</span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
                        Check-in: {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "TBD"} · Total: KES {Number(b.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Enquiries events */}
                {enquiries.map((enq) => (
                  <div key={enq._id} style={styles.timelineItem}>
                    <div style={styles.timelineDot}>💬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                          Sent enquiry for {enq.property?.title || enq.rental?.title || "Property"}
                        </span>
                        <span style={styles.statusBadge("Active")}>Active</span>
                      </div>
                      {enq.message && (
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "13px" }}>
                          &ldquo;{enq.message}&rdquo;
                        </p>
                      )}
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "11.5px" }}>
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Favorites events */}
                {favorites.map((fav) => {
                  const item = fav.property || fav.business;
                  if (!item) return null;
                  return (
                    <div key={fav._id} style={styles.timelineItem}>
                      <div style={styles.timelineDot}>❤️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                            Saved space: {item.title || item.name}
                          </span>
                          <span style={styles.roleBadge}>Saved</span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
                          {item.location?.address || item.county || "Kenya"} · {item.price ? `KES ${Number(item.price).toLocaleString()}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED SPACES */}
        {activeTab === "favorites" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Saved Listings ({favorites.length})</h2>
                <div style={styles.sectionSub}>All your bookmarked apartments, houses, and spaces</div>
              </div>
              <Link to="/listings" style={{ ...styles.exploreBtn, color: "#fbbf24" }}>
                + Explore More Spaces
              </Link>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading your saved spaces...</p>
            ) : favorites.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "16px", color: "#f8fafc", margin: "0 0 6px 0" }}>No saved spaces yet</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
                  Tap the heart icon on any listing to save and compare here anytime.
                </p>
                <Link to="/listings" style={styles.submitBtn}>
                  Explore Listings
                </Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {favorites.map((fav) => {
                  const item = fav.property || fav.business;
                  if (!item) return null;
                  const title = item.title || item.name || "Axxspace Listing";
                  const price = item.price ? `KES ${Number(item.price).toLocaleString()}/mo` : "";
                  const location = item.location?.address || item.location?.city || item.county || "Kenya";
                  const image = (item.images && item.images[0]) || "/rentals.png";

                  return (
                    <div key={fav._id} style={styles.card}>
                      <img src={image} alt={title} style={styles.cardImg} />
                      <div style={styles.cardBody}>
                        <div>
                          <h3 style={styles.cardTitle}>{title}</h3>
                          <p style={styles.cardLocation}>📍 {location}</p>
                          {price && <p style={styles.cardPrice}>{price}</p>}
                        </div>
                        <div style={styles.cardActions}>
                          <Link
                            to={fav.property ? `/listings/${fav.property._id}` : `/business/${fav.business?._id}`}
                            style={styles.viewBtn}
                          >
                            View Space
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(fav._id)}
                            style={styles.removeBtn}
                          >
                            Remove
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

        {/* TAB 3: BOOKINGS & STAYS */}
        {activeTab === "bookings" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>My Stays &amp; Bookings ({totalBookingsCount})</h2>
                <div style={styles.sectionSub}>Hotel, resort, cottage, and service bookings</div>
              </div>
              <Link to="/accommodation" style={{ ...styles.exploreBtn, color: "#fbbf24" }}>
                + Book Accommodations
              </Link>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading bookings...</p>
            ) : totalBookingsCount === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏖️</div>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px" }}>
                  No active bookings found
                </h3>
                <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "13px" }}>
                  Explore verified holiday stays, beachfront villas, and safari lodges across Kenya.
                </p>
                <Link to="/accommodation" style={styles.submitBtn}>
                  Find a Stay
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Accommodation stays */}
                {bookings.accommodations?.map((b) => (
                  <div key={b._id} style={styles.bookingCard}>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px" }}>
                        🏨 {b.accommodation?.title || "Accommodation Stay"}
                      </h4>
                      <p style={{ margin: "0 0 4px 0", color: "#cbd5e1", fontSize: "13px" }}>
                        Check-in: {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "TBD"} → Check-out: {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "TBD"}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12.5px" }}>
                        Guests: {b.numberOfGuests || 1} · Total:{" "}
                        <strong style={{ color: "#fbbf24" }}>KES {Number(b.totalPrice || 0).toLocaleString()}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={styles.statusBadge(b.status)}>{b.status || "Pending"}</span>
                      {b.accommodation?._id && (
                        <div style={{ marginTop: "10px" }}>
                          <Link
                            to={`/accommodation/property/${b.accommodation._id}`}
                            style={{ ...styles.exploreBtn, fontSize: "12px", padding: "6px 12px" }}
                          >
                            View Details →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Service bookings */}
                {bookings.services?.map((s) => (
                  <div key={s._id} style={styles.bookingCard}>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px" }}>
                        🚚 Service: {s.description || s.serviceType}
                      </h4>
                      <p style={{ margin: "0 0 4px 0", color: "#cbd5e1", fontSize: "13px" }}>
                        Date: {s.date ? new Date(s.date).toLocaleDateString() : ""} at {s.time}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12.5px" }}>
                        Address: {s.address} · Est: KES {Number(s.estimatedCost || 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span style={styles.statusBadge(s.status)}>{s.status || "Pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Space Enquiries &amp; Waitlists ({enquiries.length})</h2>
                <div style={styles.sectionSub}>Questions and waitlist requests sent to space providers</div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading enquiries...</p>
            ) : enquiries.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "16px", color: "#f8fafc", margin: "0 0 6px 0" }}>No active enquiries</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                  Inquiries and waitlist requests you send to property hosts will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {enquiries.map((enq) => {
                  const title = enq.property?.title || enq.rental?.title || "Property Enquiry";
                  const date = enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : "";
                  return (
                    <div key={enq._id} style={styles.enquiryCard}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc", fontSize: "15px" }}>{title}</h4>
                        <p style={{ margin: "0 0 6px 0", color: "#94a3b8", fontSize: "12px" }}>
                          Status: <span style={{ color: "#34d399", fontWeight: 700 }}>Active</span> · Date: {date}
                        </p>
                        {enq.message && <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px" }}>&ldquo;{enq.message}&rdquo;</p>}
                      </div>
                      {enq.property?._id && (
                        <Link to={`/listings/${enq.property._id}`} style={styles.viewBtn}>
                          View Space
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Account &amp; Profile Details</h2>
                <div style={styles.sectionSub}>Manage your contact details and preferences</div>
              </div>
            </div>

            {profileMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: profileMsg.includes("success") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: profileMsg.includes("success") ? "#34d399" : "#f87171",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} style={{ maxWidth: "460px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Email Address (Account ID)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{ ...styles.input, opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                style={{ ...styles.submitBtn, opacity: profileSaving ? 0.7 : 1, width: "fit-content" }}
              >
                {profileSaving ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* BECOME A PROVIDER MODAL */}
      {showProviderModal && (
        <div style={styles.modalBackdrop} onClick={() => setShowProviderModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                Upgrade to Provider
              </h3>
              <button
                type="button"
                onClick={() => setShowProviderModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "13.5px", marginBottom: "20px", lineHeight: "1.4" }}>
              Have properties, accommodations, or moving services to offer? Upgrade your member account to a Provider.
            </p>

            {providerError && (
              <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {providerError}
              </div>
            )}
            {providerSuccess && (
              <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {providerSuccess}
              </div>
            )}

            <form onSubmit={handleBecomeProvider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Business / Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Apartments or Quick Movers"
                  value={providerData.businessName}
                  onChange={(e) => setProviderData({ ...providerData, businessName: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>County / Operating Area</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Kiambu, Mombasa"
                  value={providerData.county}
                  onChange={(e) => setProviderData({ ...providerData, county: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Services Offered (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Rentals, House Moving, Student Housing"
                  value={providerData.services}
                  onChange={(e) => setProviderData({ ...providerData, services: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Short Bio / Description</label>
                <textarea
                  placeholder="Describe your offerings and experience..."
                  value={providerData.description}
                  onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  style={{ ...styles.exploreBtn, flex: 1, textAlign: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={providerLoading}
                  style={{ ...styles.submitBtn, flex: 1, opacity: providerLoading ? 0.7 : 1 }}
                >
                  {providerLoading ? "Upgrading..." : "Confirm Upgrade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
