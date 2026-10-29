import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserProfileEditor, ProfileAvatar } from "../features/profile";
import BoostNotification from "../components/BoostNotification";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import QuickBoostModal from "../components/QuickBoostModal";
import { canPublishQuickSales } from "../utils/quicksalesPermissions";

import { getDashboardPath } from "../utils/dashboardRoutes";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

const CATEGORIES = [
  "Furniture",
  "Electronics",
  "Appliances",
  "Tools",
  "Clothing",
  "Books",
  "Sports & Outdoors",
  "Home & Garden",
  "Beauty & Personal Care",
  "Toys & Games",
  "Construction Materials",
  "Vehicles & Parts",
  "Other"
];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

//  FIXED: "active" is the single live status. "approved" alias added for any
//    legacy documents already in the DB that were saved with the old status value.
const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: " Pending Approval" },
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: " Live" },
  approved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: " Live" }, // legacy alias
  sold: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: " Sold" },
  archived: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: " Rejected" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: " Rejected" }, // legacy alias
};

//  Helper: normalise status so legacy values map to the current UI statuses
const resolveStatus = (material) => {
  const raw = material.status || "pending";
  if (raw === "approved") return "active"; // treat legacy value as active
  if (raw === "rejected") return "archived"; // treat legacy value as rejected
  return raw;
};

// Read the session (localStorage sellerToken or shared AuthContext)
const readSellerSession = (ctxToken, ctxUser) => {
  const storedToken = localStorage.getItem("sellerToken") || ctxToken || null;
  const rawUser = localStorage.getItem("sellerUser") || ctxUser || null;
  if (!storedToken || !rawUser) return { token: null, user: null, invalidRole: null };
  try {
    const parsed = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
    return { token: storedToken, user: parsed, invalidRole: null };
  } catch {
    return { token: storedToken, user: rawUser, invalidRole: null };
  }
};

export default function QuickSalesDashboard() {
  const navigate = useNavigate();
  const { token: ctxToken, user: ctxUser, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout?.("/user-login");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerUser");
  };
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("listings");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  // When set, the upload form switches to edit mode for this material id
  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "",
    price: "", quantity: "", location: "", county: "", lat: "", lng: ""
  });

  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedMaterialForBoost, setSelectedMaterialForBoost] = useState(null);

  const handleBoost = (material) => {
    setSelectedMaterialForBoost(material);
    setBoostModalOpen(true);
  };

  // Resolve the seller session synchronously (localStorage or AuthContext)
  const session = useMemo(
    () => readSellerSession(ctxToken, ctxUser),
    [ctxToken, ctxUser]
  );
  const token = session.token;
  // Local profile state so the Profile editor can reflect saved changes immediately
  const [profile, setProfile] = useState(null);
  const seller = profile || session.user;
  const canPublish = canPublishQuickSales(seller);

  // Session guard: redirect unauthenticated users
  useEffect(() => {
    if (!token) {
      navigate("/user-login?redirect=/quicksales-dashboard");
    }
  }, [token, navigate]);

  const fetchMyMaterials = useCallback(async (tkn) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/materials/seller/my-materials?_cb=${Date.now()}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load inventory once a valid seller session is present.
  // The setState calls happen only after an await (async fetch completion),
  // so they don't cause a synchronous cascading render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (seller && token) fetchMyMaterials(token);
  }, [seller, token, fetchMyMaterials]);

  // Stats are derived from the inventory — no extra state or effect needed
  const stats = useMemo(() => {
    const earnings = materials
      .filter(m => resolveStatus(m) === "sold")
      .reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    return {
      totalEarnings: earnings,
      liveItems: materials.filter(m => resolveStatus(m) === "active").length,
      pendingReview: materials.filter(m => resolveStatus(m) === "pending").length,
      totalViews: materials.reduce((sum, item) => sum + (item.views || 0), 0),
    };
  }, [materials]);

  const emptyForm = { title: "", description: "", category: "", condition: "", price: "", quantity: "", location: "", county: "", lat: "", lng: "" };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setPreviews([]);
    setEditingId(null);
    setSuccess("");
  };

  // Open the upload form in edit mode, pre-filled from the existing listing
  const handleEdit = (m) => {
    setForm({
      title: m.title || "", description: m.description || "", category: m.category || "",
      condition: m.condition || "", price: m.price ?? "", quantity: m.quantity ?? "",
      location: m.location || "", county: m.county || "", lat: m.lat ?? "", lng: m.lng ?? "",
    });
    setImages([]);
    setPreviews([]);
    setError("");
    setSuccess("");
    setEditingId(m._id);
    setView("upload");
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.quantity || !form.location || !form.county) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append("images", img));

      const url = editingId
        ? `${API_BASE}/materials/${editingId}/update`
        : `${API_BASE}/materials/create`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to submit. Please try again.");
        return;
      }
      setSuccess(editingId ? "✅ Listing updated successfully!" : "✅ Upload completed successfully!");
      setView("listings");
      resetForm();
      fetchMyMaterials(token);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    await fetch(`${API_BASE}/materials/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchMyMaterials(token);
  };

  const handleMarkSold = async (id) => {
    await fetch(`${API_BASE}/materials/${id}/sold`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    fetchMyMaterials(token);
  };

  //  FIXED: use resolveStatus so filter dropdown works correctly for both
  //    "active" (new) and "approved" (legacy) documents.
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = (m.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const currentStatus = resolveStatus(m);
    return matchesSearch && (statusFilter === "all" ? true : currentStatus === statusFilter);
  });

  if (!seller) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "#94a3b8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, margin: "0 auto 16px",
            border: "3px solid rgba(255,255,255,0.12)",
            borderTop: "3px solid #22c55e",
            borderRadius: "50%",
            animation: "qs-spin 0.9s linear infinite",
          }} />
          <p>Checking your seller session…</p>
        </div>
        <style>{"@keyframes qs-spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <ProfileAvatar user={seller} size={48} />
          <div>
            <h1 style={s.headerTitle}>Seller Dashboard</h1>
            <p style={s.headerMeta}>{seller?.name || "Seller"}{seller?.email ? ` • ${seller.email}` : ""}</p>
          </div>
        </div>
        <button type="button" className="qs-signout" style={s.signOutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      {/* BOOST NOTIFICATION */}
      <BoostNotification user={seller} userType="seller" />

      {/* TABS */}
      <nav style={s.tabs} aria-label="Seller dashboard">
        {[
          { id: "listings", label: "My Stock", icon: <path d="M3 7h18v14H3zM3 7l9-4 9 4M9 11h6" /> },
          ...(canPublish ? [{ id: "upload", label: "Upload Material", icon: <path d="M12 5v14M5 12h14" /> }] : []),
          { id: "profile", label: "Profile & Analytics", icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className="qs-tab"
            style={{ ...s.tabBtn, ...(view === t.id && s.tabBtnActive) }}
            onClick={() => {
              setView(t.id);
              // Leaving the upload tab clears any pending edit mode
              if (t.id !== "upload" && editingId) resetForm();
            }}
            aria-selected={view === t.id}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* STATS */}
      <div style={s.statsGrid}>
        {[
          { label: "Revenue", value: `KES ${stats.totalEarnings.toLocaleString()}`, color: "#22c55e", icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
          { label: "Live Listings", value: stats.liveItems, color: "#3b82f6", icon: <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7" /> },
          { label: "Pending Review", value: stats.pendingReview, color: "#fbbf24", icon: <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /> },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), color: "#a855f7", icon: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
        ].map((stat) => (
          <div key={stat.label} className="qs-stat-card" style={s.statCard}>
            <div style={{ ...s.statIconWrap, color: stat.color, background: `${stat.color}1A` }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{stat.icon}</svg>
            </div>
            <div>
              <div style={s.statLabel}>{stat.label}</div>
              <div style={s.statVal}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {view === "listings" && (
        <div style={{ marginBottom: "24px" }}>
          <AnalyticsDashboard userType="seller" userId={seller?._id || seller?.id} />
        </div>
      )}

      {/* CONTROLS (Only visible in listings view) */}
      {view === "listings" && (
        <div style={s.controlsRow}>
          {canPublish && (
            <button className="qs-upload-btn" style={s.uploadBtn} onClick={() => { resetForm(); setView("upload"); }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Upload New Material
            </button>
          )}
          <div style={s.filterGroup}>
            <input
              type="text"
              placeholder="Filter inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchBar}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={s.statusDropdown}>
              <option value="all">All</option>
              <option value="active">Live</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="archived">Rejected</option>
            </select>
            <button className="qs-refresh-btn" style={s.refreshBtn} onClick={() => fetchMyMaterials(token)}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      )}

      {view === "profile" ? (
        <section style={s.sectionBox}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>Profile &amp; Analytics</h2>
              <p style={s.sectionSub}>Update your seller details and track performance</p>
            </div>
          </div>
          <AnalyticsDashboard userType="seller" userId={seller?._id || seller?.id} />
          <UserProfileEditor
            token={token}
            user={seller}
            accentColor="#fbbf24"
            onUpdated={(u) => u && setProfile(u)}
          />
        </section>
      ) : view === "listings" ? (
        loading ? (
          <div style={s.loadingBox}>
            <div className="spinner"></div>
            <p style={{ color: "#94a3b8", marginTop: "12px" }}>Loading your inventory...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ width: 64, height: 64, margin: "0 auto 16px", color: "#64748b" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <p style={{ color: "#f8fafc", fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>
              {materials.length === 0 ? "No materials listed yet" : "No materials match your filter"}
            </p>
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              {materials.length === 0
                ? "Upload your first item and start selling on Axxspace."
                : "Try a different keyword or status filter."}
            </p>
            {materials.length === 0 && canPublish && (
              <button className="qs-upload-btn" style={s.uploadBtn} onClick={() => { resetForm(); setView("upload"); }}>
                Upload your first material
              </button>
            )}
          </div>
        ) : (
          <div className="qs-grid" style={s.grid}>
            {filteredMaterials.map((m) => {
              const currentStatus = resolveStatus(m);
              const st = STATUS_COLORS[currentStatus] || STATUS_COLORS.pending;
              return (
                <article key={m._id} className="qs-card" style={s.card}>
                  <div style={s.cardImg}>
                    {m.images?.[0]
                      ? <img src={m.images[0]} alt={m.title} style={s.img} />
                      : <div style={s.noImg}>
                          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                    }
                    <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={s.cardBody}>
                    <h3 style={s.cardTitle}>{m.title}</h3>
                    <p style={s.cardPrice}>KES {m.price?.toLocaleString()}</p>
                    <p style={s.cardMeta}>Qty: {m.quantity} • {m.location}, {m.county}</p>
                    <div style={s.engagementStats}>
                      <span style={s.engagementItem}>{m.views || 0} views</span>
                      <span style={s.engagementSeparator}>·</span>
                      <span style={s.engagementItem}>★ {(m.rating && m.rating > 0) ? m.rating.toFixed(1) : "—"} · {m.reviewCount || 0} reviews</span>
                    </div>
                    <div style={s.cardBtns}>
                      {(currentStatus === "active" || currentStatus === "pending") && (
                        <button className="qs-edit-btn" style={s.editBtn} onClick={() => handleEdit(m)}>
                          Edit
                        </button>
                      )}
                      {currentStatus === "active" && (
                        <button className="qs-sold-btn" style={s.soldBtn} onClick={() => handleMarkSold(m._id)}>
                          Mark Sold
                        </button>
                      )}
                      <button className="qs-delete-btn" style={s.deleteBtn} onClick={() => handleDelete(m._id)}>
                        Delete
                      </button>
                    </div>
                    {currentStatus === "active" && (
                      <button className="qs-boost-btn" style={s.boostBtn} onClick={() => handleBoost(m)}>
                        Boost Item
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : !canPublish ? (
        /* ============ MEMBERSHIP GATE ============ */
        <section style={s.sectionBox}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>AXXSpace Membership Required</h2>
              <p style={s.sectionSub}>Only AXXSpace Explorers (community members) and registered sellers can publish items on QuickSales.</p>
            </div>
          </div>
          <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: "24px" }}>
            Your current account ({seller?.role || "guest"}) cannot publish items. Create a free Explorer (community member) account or register a seller
            account to start listing your items.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="/user-register" style={{ ...s.uploadBtn, textDecoration: "none" }}>
              Become a Member
            </a>
            <a href="/quicksales-login?mode=register" style={{ ...s.cancelEditBtn, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              Register as Seller
            </a>
          </div>
        </section>
      ) : (
        /* ============ UPLOAD FORM ============ */
        <section style={s.sectionBox}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>{editingId ? "Edit Listing" : "Upload New Material"}</h2>
              <p style={s.sectionSub}>
                {editingId
                  ? "Update your listing details below. New images you add will be appended to the existing gallery."
                  : "Fill in the details below to list your item on QuickSales"}
              </p>
            </div>
            {editingId && (
              <button className="qs-cancel-edit" style={s.cancelEditBtn} onClick={() => { resetForm(); setView("listings"); }}>
                Cancel Edit
              </button>
            )}
          </div>

          {error && <div style={s.errorMsg}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}

          <div style={s.formGrid}>
            <div style={s.field}>
              <label style={s.label}>Material Title</label>
              <input name="title" placeholder="e.g. Sofa set, 3-seater" value={form.title} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={s.input}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Price (KES)</label>
              <input name="price" type="number" placeholder="0" value={form.price} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Quantity</label>
              <input name="quantity" type="number" placeholder="1" value={form.quantity} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Specific Area</label>
              <input name="location" placeholder="e.g. Westlands" value={form.location} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>County</label>
              <select name="county" value={form.county} onChange={handleChange} style={s.input}>
                <option value="">Select County</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} style={s.input}>
                <option value="">Select Condition</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>GPS Latitude (optional)</label>
              <input name="lat" type="number" step="any" placeholder="e.g. -1.286" value={form.lat} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>GPS Longitude (optional)</label>
              <input name="lng" type="number" step="any" placeholder="e.g. 36.821" value={form.lng} onChange={handleChange} style={s.input} />
            </div>
            <div style={{ ...s.field, gridColumn: "1/-1" }}>
              <label style={s.label}>Description</label>
              <textarea
                name="description"
                placeholder="Describe the item, its condition, and why someone should buy it."
                value={form.description}
                onChange={handleChange}
                rows={4}
                style={{ ...s.input, resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ ...s.field, marginBottom: "24px" }}>
            <label style={s.label}>Images (at least one recommended)</label>
            <input type="file" multiple accept="image/*" onChange={handleImages} style={s.fileInput} />
            {previews.length > 0 && (
              <div style={s.previews}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`Preview ${i + 1}`} style={s.previewImg} />
                ))}
              </div>
            )}
          </div>

          <button className="qs-upload-btn" style={s.submitBtn} onClick={handleSubmit} disabled={submitLoading}>
            {submitLoading ? (editingId ? "Saving..." : "Publishing...") : (editingId ? "Save Changes" : "Publish Material")}
          </button>
        </section>
      )}

      {/* QUICK BOOST MODAL */}
      {selectedMaterialForBoost && (
        <QuickBoostModal
          isOpen={boostModalOpen}
          onClose={() => {
            setBoostModalOpen(false);
            setSelectedMaterialForBoost(null);
          }}
          itemType="material"
          itemId={selectedMaterialForBoost._id}
          itemName={selectedMaterialForBoost.title}
          onSuccess={fetchMyMaterials}
        />
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: "1400px", margin: "0 auto", padding: "24px 20px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", minHeight: "100vh", fontFamily: "'Inter', 'DM Sans', sans-serif", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px", padding: "20px 24px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "18px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px", minWidth: 0 },
  headerTitle: { margin: 0, fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.5px" },
  headerMeta: { margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" },
  signOutBtn: { padding: "10px 18px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease" },
  tabs: { display: "flex", gap: "10px", overflowX: "auto", marginBottom: "28px", paddingBottom: "4px" },
  tabBtn: { display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  tabBtnActive: { background: "#fbbf24", color: "#0f1729", border: "1px solid #fbbf24", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" },
  uploadBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#0f172a", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)", transition: "all 0.2s ease" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", transition: "all 0.2s ease", cursor: "default" },
  statIconWrap: { width: "46px", height: "46px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  statVal: { fontSize: "1.35rem", fontWeight: 800, marginTop: "4px", letterSpacing: "-0.5px" },
  controlsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  filterGroup: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
  searchBar: { padding: "12px 16px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", color: "#fff", fontSize: "14px", minWidth: "220px" },
  statusDropdown: { padding: "12px 16px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600 },
  refreshBtn: { display: "inline-flex", alignItems: "center", padding: "12px 16px", background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.4)", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s ease" },
  sectionBox: { background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", padding: "28px", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" },
  sectionTitle: { margin: 0, fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.3px" },
  sectionSub: { margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" },
  card: { background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "18px", overflow: "hidden", transition: "all 0.2s ease", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)" },
  cardImg: { position: "relative", aspectRatio: "16/10", background: "#0f172a" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" },
  statusBadge: { position: "absolute", top: "12px", left: "12px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, backdropFilter: "blur(10px)", textTransform: "uppercase", letterSpacing: "0.4px" },
  cardBody: { padding: "20px" },
  cardTitle: { margin: "0 0 10px 0", fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.3 },
  cardPrice: { color: "#fbbf24", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  cardMeta: { color: "#94a3b8", fontSize: "0.85rem", margin: 0, lineHeight: "1.5" },
  engagementStats: { display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 },
  engagementItem: { display: "flex", alignItems: "center", gap: "4px" },
  engagementSeparator: { color: "#64748b" },
  cardBtns: { display: "flex", gap: "10px", marginTop: "18px" },
  editBtn: { flex: 1, padding: "10px", background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.5)", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", transition: "all 0.2s ease" },
  cancelEditBtn: { padding: "10px 18px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease" },
  soldBtn: { flex: 1, padding: "10px", background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.5)", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", transition: "all 0.2s ease" },
  deleteBtn: { flex: 1, padding: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.5)", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", transition: "all 0.2s ease" },
  boostBtn: { width: "100%", marginTop: "10px", padding: "10px", fontSize: "13px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#0f172a", border: "none", borderRadius: "8px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#cbd5e1", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { width: "100%", padding: "14px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", color: "#fff", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" },
  fileInput: { width: "100%", padding: "12px", background: "rgba(15, 23, 42, 0.8)", border: "1px dashed rgba(255, 255, 255, 0.2)", borderRadius: "10px", color: "#cbd5e1", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px", cursor: "pointer" },
  submitBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#0f172a", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)", transition: "all 0.2s ease" },
  errorMsg: { background: "rgba(239,68,68,0.15)", padding: "14px 18px", borderRadius: "12px", color: "#f87171", marginBottom: "20px", fontSize: "14px", fontWeight: 600, border: "1px solid rgba(239, 68, 68, 0.3)" },
  successMsg: { background: "rgba(34,197,94,0.15)", padding: "14px 18px", borderRadius: "12px", color: "#4ade80", marginBottom: "20px", fontSize: "14px", fontWeight: 600, border: "1px solid rgba(34, 197, 94, 0.3)" },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px" },
  emptyBox: { textAlign: "center", padding: "80px 20px", background: "rgba(30, 41, 59, 0.4)", borderRadius: "20px", border: "2px dashed rgba(255, 255, 255, 0.1)" },
  previews: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" },
  previewImg: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "12px", border: "2px solid rgba(255, 255, 255, 0.1)" },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.1); border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; }
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; outline: none; box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1); }
  button:hover:not(:disabled) { opacity: 0.95; transform: translateY(-2px); }
  .qs-stat-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 8px 24px rgba(251, 191, 36, 0.15); }
  .qs-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.2); }
  .qs-upload-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4); }
  .qs-tab:hover { background: rgba(255, 255, 255, 0.08); color: #f8fafc; }
  .qs-sold-btn:hover { background: rgba(34, 197, 94, 0.3); }
  .qs-edit-btn:hover { background: rgba(59, 130, 246, 0.3); }
  .qs-cancel-edit:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
  .qs-delete-btn:hover { background: rgba(239, 68, 68, 0.3); }
  .qs-boost-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(251, 191, 36, 0.35); }
  .qs-signout:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
  @media (max-width: 640px) {
    .qs-grid { grid-template-columns: 1fr; gap: 16px; }
  }
`;