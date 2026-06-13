import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserProfileEditor, ProfileAvatar } from "../features/profile";
import VerificationStatus from "../components/VerificationStatus";

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

const CATEGORIES = ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

// ✅ FIXED: "active" is the single live status. "approved" alias added for any
//    legacy documents already in the DB that were saved with the old status value.
const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "⏳ Pending Approval" },
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  approved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" }, // legacy alias
  sold: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "🏷️ Sold" },
  archived: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
};

// ✅ Helper: normalise status so "approved" (old DB docs) shows the same as "active"
const resolveStatus = (material) => {
  const raw = material.status || "pending";
  if (raw === "approved") return "active"; // treat legacy value as active
  return raw;
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { token: ctxToken, user: ctxUser } = useContext(AuthContext);
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("listings");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ totalEarnings: 0, liveItems: 0, pendingReview: 0, totalViews: 0 });

  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "Good",
    price: "", quantity: "", location: "", county: "", lat: "", lng: ""
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("sellerToken") || ctxToken;
    const storedUser = localStorage.getItem("sellerUser") || (ctxUser ? JSON.stringify(ctxUser) : null);
    if (!storedToken || !storedUser) {
      navigate("/seller-login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed?.role && parsed.role !== "seller") {
      navigate(getDashboardPath(parsed.role));
      return;
    }
    setToken(storedToken);
    setSeller(parsed);
    fetchMyMaterials(storedToken);
  }, [ctxToken, ctxUser]);

  useEffect(() => {
    if (materials.length > 0) {
      // ✅ FIXED: count live items using resolveStatus so both "active" and
      //    legacy "approved" documents are counted correctly.
      const earnings = materials
        .filter(m => resolveStatus(m) === "sold")
        .reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      const live = materials.filter(m => resolveStatus(m) === "active").length;
      const pending = materials.filter(m => resolveStatus(m) === "pending").length;
      const views = materials.reduce((sum, item) => sum + (item.views || 0), 0);

      setStats({ totalEarnings: earnings, liveItems: live, pendingReview: pending, totalViews: views });
    } else {
      setStats({ totalEarnings: 0, liveItems: 0, pendingReview: 0, totalViews: 0 });
    }
  }, [materials]);

  const fetchMyMaterials = async (tkn) => {
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
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.quantity || !form.location || !form.county) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append("images", img));

      const res = await fetch(`${API_BASE}/materials/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) { setError("Failed to submit"); return; }
      setSuccess("✅ Upload completed successfully!");
      setForm({ title: "", description: "", category: "", condition: "Good", price: "", quantity: "", location: "", county: "", lat: "", lng: "" });
      setImages([]); setPreviews([]); setView("listings");
      fetchMyMaterials(token);
    } catch (err) {
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

  // ✅ FIXED: use resolveStatus so filter dropdown works correctly for both
  //    "active" (new) and "approved" (legacy) documents.
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = (m.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const currentStatus = resolveStatus(m);
    return matchesSearch && (statusFilter === "all" ? true : currentStatus === statusFilter);
  });

  if (!seller) return null;

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.topBar}>
        <div>
          <h1 style={s.topTitle}>🛒 Seller Dashboard</h1>
          <p style={{ ...s.topSub, display: "flex", alignItems: "center", gap: "10px" }}>
            <ProfileAvatar user={seller} size={36} />
            <span>Vendor: <strong style={{ color: "#fbbf24" }}>{seller.name}</strong></span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button style={{ ...s.uploadBtn, background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" }} onClick={() => navigate("/business/create")}>
            🏢 Add Business
          </button>
          <button style={s.uploadBtn} onClick={() => setView(view === "listings" ? "upload" : "listings")}>
            {view === "listings" ? "+ Upload Material" : "View Inventory"}
          </button>
        </div>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}><span style={s.statIcon}>💰</span><div><div style={s.statLabel}>Revenue</div><div style={s.statVal}>KES {stats.totalEarnings.toLocaleString()}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>🌐</span><div><div style={s.statLabel}>Live Listings</div><div style={s.statVal}>{stats.liveItems}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>⏳</span><div><div style={s.statLabel}>Pending</div><div style={s.statVal}>{stats.pendingReview}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>👁️</span><div><div style={s.statLabel}>Views</div><div style={s.statVal}>{stats.totalViews}</div></div></div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <VerificationStatus />
      </div>

      <div style={s.controlsRow}>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(view === "listings" ? s.activeTab : {}) }} onClick={() => setView("listings")}>My Stock</button>
          <button style={{ ...s.tab, ...(view === "profile" ? s.activeTab : {}) }} onClick={() => setView("profile")}>👤 Profile</button>
        </div>
        {view === "listings" && (
          <div style={s.filterGroup}>
            <input
              type="text"
              placeholder="Filter inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchBar}
            />
            {/* ✅ FIXED: dropdown values now match resolveStatus() output ("active" not "approved") */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={s.statusDropdown}>
              <option value="all">All</option>
              <option value="active">Live</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="archived">Rejected</option>
            </select>
            <button style={s.refreshBtn} onClick={() => fetchMyMaterials(token)}>🔄 Refresh Status</button>
          </div>
        )}
      </div>

      {view === "profile" ? (
        <UserProfileEditor
          token={token}
          user={seller}
          accentColor="#fbbf24"
          onUpdated={(u) => u && setSeller(u)}
        />
      ) : view === "listings" ? (
        loading ? (
          <div style={s.loadingBox}>
            <div className="spinner"></div>
            <p style={{ color: "#94a3b8", marginTop: "12px" }}>Loading your inventory...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: "3rem" }}>📦</p>
            <p style={{ color: "#94a3b8" }}>
              {materials.length === 0
                ? "No materials yet. Upload your first listing!"
                : "No materials match your current filter."}
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredMaterials.map((m) => {
              // ✅ FIXED: use resolveStatus so the card badge always shows correctly
              const currentStatus = resolveStatus(m);
              const st = STATUS_COLORS[currentStatus] || STATUS_COLORS.pending;
              return (
                <div key={m._id} style={s.card}>
                  <div style={s.cardImg}>
                    {m.images?.[0]
                      ? <img src={m.images[0]} alt="" style={s.img} />
                      : <div style={s.noImg}>📷 No Image</div>
                    }
                    <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={s.cardBody}>
                    <h3 style={s.cardTitle}>{m.title}</h3>
                    <p style={s.cardPrice}>KES {m.price?.toLocaleString()}</p>
                    <p style={s.cardMeta}>Qty: {m.quantity} • {m.location}, {m.county}</p>
                    {/* Engagement Stats */}
                    <div style={s.engagementStats}>
                      <span style={s.engagementItem}>👁️ {m.views || 0} views</span>
                      <span style={s.engagementSeparator}>·</span>
                      <span style={s.engagementItem}>★ {(m.rating && m.rating > 0) ? m.rating.toFixed(1) : "—"} · {m.reviewCount || 0} reviews</span>
                    </div>
                    <div style={s.cardBtns}>
                      {currentStatus === "active" && (
                        <button style={s.soldBtn} onClick={() => handleMarkSold(m._id)}>
                          Mark Sold
                        </button>
                      )}
                      <button style={s.deleteBtn} onClick={() => handleDelete(m._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ============ UPLOAD FORM ============ */
        <div style={s.formBox}>
          {error && <div style={s.errorMsg}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}
          <div style={s.formGrid}>
            <input name="title" placeholder="Material Title" value={form.title} onChange={handleChange} style={s.input} />
            <select name="category" value={form.category} onChange={handleChange} style={s.input}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="condition" value={form.condition} onChange={handleChange} style={s.input}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="price" type="number" placeholder="Price (KES)" value={form.price} onChange={handleChange} style={s.input} />
            <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} style={s.input} />
            <input name="location" placeholder="Specific Area (e.g. Westlands)" value={form.location} onChange={handleChange} style={s.input} />
            <select name="county" value={form.county} onChange={handleChange} style={s.input}>
              <option value="">Select County</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="lat" type="number" step="any" placeholder="GPS Latitude (optional)" value={form.lat} onChange={handleChange} style={s.input} />
            <input name="lng" type="number" step="any" placeholder="GPS Longitude (optional)" value={form.lng} onChange={handleChange} style={s.input} />
            <textarea
              name="description"
              placeholder="Description Details"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ ...s.input, gridColumn: "1/-1", resize: "vertical" }}
            />
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>
                Images (at least one required)
              </label>
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ ...s.input }} />
              {previews.length > 0 && (
                <div style={s.previews}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt="" style={s.previewImg} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <button style={s.submitBtn} onClick={handleSubmit} disabled={submitLoading}>
            {submitLoading ? "Publishing..." : "Publish Material"}
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "24px", background: "#0f172a", minHeight: "100vh", fontFamily: "sans-serif", color: "#f8fafc" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" },
  topTitle: { margin: 0, color: "#fbbf24" },
  topSub: { margin: "4px 0 0 0", color: "#94a3b8" },
  uploadBtn: { padding: "10px 20px", background: "#fbbf24", color: "#0f172a", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" },
  statIcon: { fontSize: "1.5rem" },
  statLabel: { color: "#94a3b8", fontSize: "0.8rem" },
  statVal: { fontSize: "1.2rem", fontWeight: "bold", marginTop: "2px" },
  controlsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  tabs: { display: "flex" },
  tab: { padding: "8px 16px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.95rem" },
  activeTab: { color: "#fbbf24", fontWeight: "bold" },
  filterGroup: { display: "flex", gap: "8px", flexWrap: "wrap" },
  searchBar: { padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  statusDropdown: { padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  refreshBtn: { padding: "8px 12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid #2563eb", borderRadius: "6px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden" },
  cardImg: { position: "relative", height: "160px", background: "#0f172a" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "2rem" },
  statusBadge: { position: "absolute", top: "8px", left: "8px", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" },
  cardBody: { padding: "16px" },
  cardTitle: { margin: "0 0 8px 0", fontSize: "1rem" },
  cardPrice: { color: "#fbbf24", fontWeight: "bold", fontSize: "1.1rem", margin: "0 0 4px 0" },
  cardMeta: { color: "#94a3b8", fontSize: "0.85rem", margin: 0 },
  engagementStats: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "0.8rem", color: "#94a3b8" },
  engagementItem: { display: "flex", alignItems: "center", gap: "4px" },
  engagementSeparator: { color: "#94a3b8" },
  cardBtns: { display: "flex", gap: "8px", marginTop: "16px" },
  soldBtn: { flex: 1, padding: "6px", background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid #22c55e", borderRadius: "4px", cursor: "pointer" },
  deleteBtn: { flex: 1, padding: "6px", background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid #ef4444", borderRadius: "4px", cursor: "pointer" },
  formBox: { background: "#1e293b", padding: "24px", borderRadius: "8px", border: "1px solid #334155" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  input: { width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box", fontFamily: "sans-serif" },
  submitBtn: { padding: "10px 24px", background: "#fbbf24", color: "#0f172a", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  errorMsg: { background: "rgba(239,68,68,0.2)", padding: "10px", borderRadius: "6px", color: "#f87171", marginBottom: "16px" },
  successMsg: { background: "rgba(34,197,94,0.2)", padding: "10px", borderRadius: "6px", color: "#4ade80", marginBottom: "16px" },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px" },
  emptyBox: { textAlign: "center", padding: "60px 20px" },
  previews: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" },
  previewImg: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #334155" },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 36px; height: 36px; border: 3px solid #334155; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; }
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; outline: none; }
  button:hover:not(:disabled) { opacity: 0.85; }
`;