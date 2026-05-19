import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
  "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
  "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
  "Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
  "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
  "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City",
];

const CATEGORIES = ["Construction Materials","Furniture","Appliances","Electronics","Tools","Other"];
const CONDITIONS = ["Like New","Good","Fair","Poor"];

const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "⏳ Pending Approval" },
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  sold: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "🏷️ Sold" },
  archived: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
};

export default function SellerDashboard() {
  const navigate = useNavigate();
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

  // Analytics & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ totalEarnings: 0, liveItems: 0, pendingReview: 0, totalViews: 0 });

  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "Good",
    price: "", quantity: "", location: "", county: "", subcategory: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("sellerToken");
    const storedUser = localStorage.getItem("sellerUser");
    if (!storedToken || !storedUser) {
      navigate("/seller-login");
      return;
    }
    setToken(storedToken);
    setSeller(JSON.parse(storedUser));
    fetchMyMaterials(storedToken);
  }, []);

  // Compute stats dynamically from listing data
  useEffect(() => {
    if (materials.length > 0) {
      const earnings = materials
        .filter(m => m.status === "sold")
        .reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      // Backwards-compatible check for active items
      const live = materials.filter(m => m.status === "active" || m.isVerified === true).length;
      const pending = materials.filter(m => m.status === "pending" || (!m.status && !m.isVerified)).length;
      const views = materials.reduce((sum, item) => sum + (item.views || 0), 0);

      setStats({ totalEarnings: earnings, liveItems: live, pendingReview: pending, totalViews: views });
    } else {
      setStats({ totalEarnings: 0, liveItems: 0, pendingReview: 0, totalViews: 0 });
    }
  }, [materials]);

  const fetchMyMaterials = async (tkn) => {
    try {
      setLoading(true);
      // Added a timestamp parameter to completely bypass browser caching issues
      const res = await fetch(`${API_BASE}/materials/seller/my-materials?_cb=${Date.now()}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching materials:", err);
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
      setError("Please fill in all required fields.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append("images", img));

      const res = await fetch(`${API_BASE}/materials/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit"); return; }

      setSuccess("✅ Material submitted! It will be visible after admin approval.");
      setForm({ title: "", description: "", category: "", condition: "Good", price: "", quantity: "", location: "", county: "", subcategory: "" });
      setImages([]);
      setPreviews([]);
      setView("listings");
      fetchMyMaterials(token);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material permanently?")) return;
    try {
      await fetch(`${API_BASE}/materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyMaterials(token);
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await fetch(`${API_BASE}/materials/${id}/sold`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyMaterials(token);
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerUser");
    navigate("/seller-login");
  };

  // Filter application pipeline
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Fallback normalization: If backend sets isVerified to true, count it as active
    let effectiveStatus = m.status || "pending";
    if (m.isVerified && effectiveStatus === "pending") {
      effectiveStatus = "active";
    }

    const matchesStatus = statusFilter === "all" ? true : effectiveStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!seller) return null;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* TOP BAR */}
      <div style={s.topBar}>
        <div>
          <h1 style={s.topTitle}>🛒 Seller Dashboard</h1>
          <p style={s.topSub}>Welcome back, <strong style={{ color: "#fbbf24" }}>{seller.name}</strong></p>
        </div>
        <div style={s.topBtns}>
          <button style={s.uploadBtn} onClick={() => { setView("upload"); setError(""); setSuccess(""); }}>
            + Upload Material
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* PERFORMANCE ANALYTICS SECTION */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <span style={s.statIcon}>💰</span>
          <div>
            <div style={s.statLabel}>Revenue (Sold Items)</div>
            <div style={s.statVal}>KES {stats.totalEarnings.toLocaleString()}</div>
          </div>
        </div>
        <div style={s.statCard}>
          <span style={s.statIcon}>🌐</span>
          <div>
            <div style={s.statLabel}>Live Listings</div>
            <div style={s.statVal}>{stats.liveItems}</div>
          </div>
        </div>
        <div style={s.statCard}>
          <span style={s.statIcon}>⏳</span>
          <div>
            <div style={s.statLabel}>Awaiting Review</div>
            <div style={s.statVal}>{stats.pendingReview}</div>
          </div>
        </div>
        <div style={s.statCard}>
          <span style={s.statIcon}>👁️</span>
          <div>
            <div style={s.statLabel}>Product Impressions</div>
            <div style={s.statVal}>{stats.totalViews.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* APPROVAL NOTICE */}
      <div style={s.noticeBox}>
        📋 All uploaded materials go through admin review before appearing on the marketplace. You can track status below.
      </div>

      {/* TABS & SEARCH CONTROLS */}
      <div style={s.controlsRow}>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(view === "listings" ? s.activeTab : {}) }} onClick={() => setView("listings")}>
            My Listings ({materials.length})
          </button>
          <button style={{ ...s.tab, ...(view === "upload" ? s.activeTab : {}) }} onClick={() => { setView("upload"); setError(""); setSuccess(""); }}>
            + New Listing
          </button>
        </div>

        {view === "listings" && (
          <div style={s.filterGroup}>
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={s.searchBar}
            />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              style={s.statusDropdown}
            >
              <option value="all">All Statuses</option>
              <option value="active">Live</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="archived">Rejected</option>
            </select>
            <button style={s.refreshBtn} onClick={() => fetchMyMaterials(token)}>
              🔄 Refresh Status
            </button>
          </div>
        )}
      </div>

      {/* ─── LISTINGS VIEW ─── */}
      {view === "listings" && (
        <div>
          {loading ? (
            <p style={s.muted}>Loading your listings...</p>
          ) : filteredMaterials.length === 0 ? (
            <div style={s.empty}>
              <p>No listings match your selection.</p>
              {materials.length === 0 && (
                <button style={s.uploadBtn} onClick={() => setView("upload")}>Upload your first material</button>
              )}
            </div>
          ) : (
            <div style={s.grid}>
              {filteredMaterials.map((m) => {
                // Determine layout badge dynamically based on true status or verification status
                let calculatedStatus = m.status || "pending";
                if (m.isVerified && calculatedStatus === "pending") {
                  calculatedStatus = "active";
                }
                
                const st = STATUS_COLORS[calculatedStatus] || STATUS_COLORS.pending;
                const isLowStock = m.quantity <= 2 && calculatedStatus === "active";

                return (
                  <div key={m._id} style={s.card}>
                    <div style={s.cardImg}>
                      {m.images?.[0] ? (
                        <img src={m.images[0]} alt={m.title} style={s.img} />
                      ) : (
                        <div style={s.noImg}>📷 No Image</div>
                      )}
                      <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      {isLowStock && (
                        <span style={s.stockWarning}>⚠️ Low Stock</span>
                      )}
                    </div>
                    <div style={s.cardBody}>
                      <h3 style={s.cardTitle}>{m.title}</h3>
                      <p style={s.cardMeta}>📍 {m.location}, {m.county}</p>
                      <p style={s.cardMeta}>🏷️ {m.category} • {m.condition}</p>
                      <p style={s.cardPrice}>KES {m.price?.toLocaleString()}</p>
                      <p style={s.cardMeta}>Qty: {m.quantity} • 👁️ {m.views || 0} views</p>
                      <div style={s.cardBtns}>
                        {calculatedStatus !== "sold" && calculatedStatus !== "archived" && (
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
          )}
        </div>
      )}

      {/* ─── UPLOAD VIEW ─── */}
      {view === "upload" && (
        <div style={s.formBox}>
          <h2 style={s.formTitle}>📦 List a New Material</h2>

          {error && <div style={s.errorMsg}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}

          <div style={s.formGrid}>
            <div style={s.fieldFull}>
              <label style={s.label}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Iron Sheets, Used Sofa Set..." style={s.input} />
            </div>

            <div>
              <label style={s.label}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} style={s.input}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={s.label}>Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} style={s.input}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={s.label}>Price (KES) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange}
                placeholder="e.g. 5000" style={s.input} />
            </div>

            <div>
              <label style={s.label}>Quantity Available *</label>
              <input name="quantity" type="number" value={form.quantity} onChange={handleChange}
                placeholder="e.g. 10" style={s.input} />
            </div>

            <div>
              <label style={s.label}>Specific Neighborhood/Location *</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Westlands" style={s.input} />
            </div>

            <div>
              <label style={s.label}>County *</label>
              <select name="county" value={form.county} onChange={handleChange} style={s.input}>
                <option value="">Select county</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={s.fieldFull}>
              <label style={s.label}>Detailed Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the material, its dimensions, why you are selling, etc."
                rows={4} style={{ ...s.input, resize: "vertical" }} />
            </div>

            <div style={s.fieldFull}>
              <label style={s.label}>Images * (up to 8)</label>
              <input type="file" accept="image/*" multiple onChange={handleImages} style={s.fileInput} />
              {previews.length > 0 && (
                <div style={s.previews}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt={`preview ${i}`} style={s.preview} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={s.formBtns}>
            <button style={s.cancelBtn} onClick={() => setView("listings")}>Cancel</button>
            <button style={s.submitBtn} onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "24px", background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  topTitle: { margin: 0, color: "#fbbf24", fontSize: "2rem", fontWeight: 800 },
  topSub: { color: "#94a3b8", margin: "4px 0 0 0", fontSize: "1rem" },
  topBtns: { display: "flex", gap: "12px", alignItems: "center" },
  uploadBtn: { padding: "10px 20px", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#0f1729", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" },
  logoutBtn: { padding: "10px 16px", background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "linear-gradient(135deg, #1e293b, #0f1729)", border: "1px solid #334155", borderRadius: "12px" },
  statIcon: { fontSize: "1.75rem", padding: "10px", background: "rgba(251,191,36,0.1)", borderRadius: "10px", color: "#fbbf24" },
  statLabel: { color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  statVal: { color: "#f1f5f9", fontSize: "1.35rem", fontWeight: 800, marginTop: "2px" },

  noticeBox: { background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", color: "#93c5fd", fontSize: "0.88rem" },
  controlsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  filterGroup: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  searchBar: { padding: "8px 14px", background: "#0f1729", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.88rem", width: "200px" },
  statusDropdown: { padding: "8px 12px", background: "#0f1729", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.88rem", cursor: "pointer" },
  refreshBtn: { padding: "8px 14px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" },

  tabs: { display: "flex", gap: "4px", background: "#0f1729", borderRadius: "8px", padding: "4px", width: "fit-content" },
  tab: { padding: "9px 20px", background: "transparent", border: "none", color: "#94a3b8", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" },
  activeTab: { background: "#334155", color: "#fbbf24" },
  muted: { color: "#94a3b8", textAlign: "center", padding: "40px" },
  empty: { width: "100%", textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30,41,59,0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
  card: { background: "linear-gradient(135deg, #1e293b, #0f1729)", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden" },
  cardImg: { position: "relative", height: "180px", background: "#0f1729" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontWeight: 600 },
  statusBadge: { position: "absolute", top: "10px", left: "10px", padding: "5px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 },
  stockWarning: { position: "absolute", top: "10px", right: "10px", padding: "5px 10px", background: "rgba(239,68,68,0.85)", color: "#fff", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800 },
  cardBody: { padding: "16px" },
  cardTitle: { margin: "0 0 6px 0", color: "#f1f5f9", fontSize: "1rem", fontWeight: 700 },
  cardMeta: { margin: "3px 0", color: "#94a3b8", fontSize: "0.82rem" },
  cardPrice: { color: "#fbbf24", fontWeight: 700, fontSize: "1.1rem", margin: "8px 0" },
  cardBtns: { display: "flex", gap: "8px", marginTop: "12px" },
  soldBtn: { flex: 1, padding: "8px", background: "rgba(34,197,94,0.2)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" },
  deleteBtn: { flex: 1, padding: "8px", background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" },
  formBox: { background: "linear-gradient(135deg, #1e293b, #0f1729)", border: "1px solid #334155", borderRadius: "12px", padding: "28px" },
  formTitle: { margin: "0 0 20px 0", color: "#fbbf24", fontSize: "1.3rem", fontWeight: 700 },
  errorMsg: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem" },
  successMsg: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  fieldFull: { gridColumn: "1 / -1" },
  label: { display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 },
  input: { width: "100%", padding: "11px 14px", background: "#0f1729", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.92rem", boxSizing: "border-box", fontFamily: "inherit" },
  fileInput: { width: "100%", padding: "10px", background: "#0f1729", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8", fontSize: "0.9rem", boxSizing: "border-box" },
  previews: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" },
  preview: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "2px solid #334155" },
  formBtns: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { padding: "11px 24px", background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
  submitBtn: { padding: "11px 28px", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#0f1729", border: "none", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "1rem" },
};

const css = `
  * { box-sizing: border-box; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1) !important; }
  button:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
    [style*="display: flex"][style*="gap: 8px"] { width: 100%; justify-content: space-between; }
    input[style*="width: 200px"] { width: 100% !important; }
  }
`;