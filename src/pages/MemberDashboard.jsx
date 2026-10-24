import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function MemberDashboard() {
  const { user, token, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [loadingEnqs, setLoadingEnqs] = useState(false);

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

  useEffect(() => {
    if (!token) {
      navigate("/user-login");
      return;
    }
    loadFavorites();
    loadEnquiries();
  }, [token]);

  const loadFavorites = async () => {
    try {
      setLoadingFavs(true);
      const res = await fetch(`${API_BASE}/members/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error("Load favorites error:", err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const loadEnquiries = async () => {
    try {
      setLoadingEnqs(true);
      const res = await fetch(`${API_BASE}/members/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Load enquiries error:", err);
    } finally {
      setLoadingEnqs(false);
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/members/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== id && f.property?._id !== id));
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
    } catch (err) {
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

      setProviderSuccess("Upgrade successful! Redirecting to Provider Dashboard...");
      if (data.user) {
        updateUser(data.user);
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setProviderError(err.message || "Failed to become provider");
    } finally {
      setProviderLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* TOP MEMBER HEADER */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <ProfileAvatar user={user} size={64} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.name}>{user?.name}</h1>
                <span style={styles.memberBadge}>MEMBER</span>
              </div>
              <p style={styles.email}>{user?.email}</p>
              <p style={styles.subtext}>Axxspace Community Member · Belonging &amp; Exploring</p>
            </div>
          </div>

          <button
            type="button"
            style={styles.providerBtn}
            onClick={() => setShowProviderModal(true)}
          >
            Become a Provider →
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div style={styles.tabBar}>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "favorites" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("favorites")}
          >
            ❤️ Saved Spaces ({favorites.length})
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "enquiries" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("enquiries")}
          >
            💬 My Enquiries ({enquiries.length})
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "profile" ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab("profile")}
          >
            ⚙️ Profile Settings
          </button>
        </div>

        {/* TAB 1: FAVORITES */}
        {activeTab === "favorites" && (
          <div style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={styles.sectionTitle}>Saved Listings</h2>
              <Link to="/listings" style={styles.exploreLink}>+ Browse more spaces</Link>
            </div>

            {loadingFavs ? (
              <p style={{ color: "#94a3b8" }}>Loading favorites...</p>
            ) : favorites.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "16px", color: "#f8fafc", margin: "0 0 6px 0" }}>No saved spaces yet</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
                  Tap the heart icon on any listing to save and compare here anytime.
                </p>
                <Link to="/listings" style={styles.primaryLinkBtn}>Explore Listings</Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {favorites.map((fav) => {
                  const item = fav.property || fav.business;
                  if (!item) return null;
                  const title = item.title || item.name || "Axxspace Listing";
                  const price = item.price ? `KES ${Number(item.price).toLocaleString()}/mo` : "";
                  const location = item.location?.address || item.location?.city || item.county || "";
                  const image = (item.images && item.images[0]) || "/rentals.png";

                  return (
                    <div key={fav._id} style={styles.card}>
                      <img src={image} alt={title} style={styles.cardImg} />
                      <div style={styles.cardBody}>
                        <h3 style={styles.cardTitle}>{title}</h3>
                        <p style={styles.cardLocation}>📍 {location}</p>
                        {price && <p style={styles.cardPrice}>{price}</p>}
                        <div style={styles.cardActions}>
                          <Link to={fav.property ? `/listings/${fav.property._id}` : `/business/${fav.business?._id}`} style={styles.viewBtn}>
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

        {/* TAB 2: ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Space Enquiries &amp; Waitlists</h2>
            {loadingEnqs ? (
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
                        <p style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: "12px" }}>
                          Status: <span style={{ color: "#34d399", fontWeight: 700 }}>Active</span> · Date: {date}
                        </p>
                        {enq.message && <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px" }}>&ldquo;{enq.message}&rdquo;</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Account &amp; Profile Details</h2>
            {profileMsg && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: profileMsg.includes("success") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: profileMsg.includes("success") ? "#34d399" : "#f87171", marginBottom: "16px", fontSize: "13px" }}>
                {profileMsg}
              </div>
            )}
            <form onSubmit={handleProfileSave} style={{ maxWidth: "460px", display: "flex", flexDirection: "column", gap: "14px" }}>
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
                <label style={styles.label}>Email Address (Read-only)</label>
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
                style={{ ...styles.submitBtn, opacity: profileSaving ? 0.7 : 1 }}
              >
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* BECOME A PROVIDER MODAL */}
        {showProviderModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "20px" }}>Upgrade to Provider</h3>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: 0, marginBottom: "18px" }}>
                Ready to list rental spaces or offer services? Fill in your details below to unlock your Provider Dashboard.
              </p>

              {providerError && (
                <div style={{ padding: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                  {providerError}
                </div>
              )}
              {providerSuccess && (
                <div style={{ padding: "10px", background: "rgba(16,185,129,0.15)", color: "#34d399", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                  {providerSuccess}
                </div>
              )}

              <form onSubmit={handleBecomeProvider} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Business / Property Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Skyline Living & Hostels"
                    value={providerData.businessName}
                    onChange={(e) => setProviderData({ ...providerData, businessName: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>County / Primary Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Nairobi, Kiambu, Uasin Gishu"
                    value={providerData.county}
                    onChange={(e) => setProviderData({ ...providerData, county: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Services / Space Types (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Student Hostels, Apartments, Furnished Studios"
                    value={providerData.services}
                    onChange={(e) => setProviderData({ ...providerData, services: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Brief Description</label>
                  <textarea
                    placeholder="Tell tenants or guests about your properties/services"
                    value={providerData.description}
                    onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
                    style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowProviderModal(false)}
                    style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={providerLoading}
                    style={{ flex: 1.5, ...styles.submitBtn, opacity: providerLoading ? 0.7 : 1 }}
                  >
                    {providerLoading ? "Upgrading..." : "Confirm & Become Provider"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#f8fafc",
    padding: "36px 20px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  headerCard: {
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "24px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    marginBottom: "24px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  name: {
    fontSize: "22px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
  },
  memberBadge: {
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    color: "#fbbf24",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  email: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 2px 0",
  },
  subtext: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  providerBtn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
  },
  tabBar: {
    display: "flex",
    gap: "10px",
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
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabBtnActive: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
  },
  section: {
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "16px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
  },
  exploreLink: {
    fontSize: "13px",
    color: "#fbbf24",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyBox: {
    textAlign: "center",
    padding: "48px 20px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "12px",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
  },
  primaryLinkBtn: {
    display: "inline-block",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 800,
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardImg: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: "0 0 6px 0",
  },
  cardLocation: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 8px 0",
  },
  cardPrice: {
    fontSize: "14px",
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
    background: "#334155",
    color: "#f8fafc",
    textAlign: "center",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    textDecoration: "none",
  },
  removeBtn: {
    background: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#f87171",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  enquiryCard: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "14px 18px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(30, 41, 59, 0.8)",
    color: "#f8fafc",
    fontSize: "14px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  modalOverlay: {
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
    padding: "20px",
    zIndex: 9999,
  },
  modalContent: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "16px",
    padding: "24px 28px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
  },
};
