import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfileEditor, ProfileAvatar } from "../features/profile";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir",
  "Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos",
  "Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
  "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia",
  "Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia",
  "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City"
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ totalEarnings: 0, liveItems: 0, pendingReview: 0, totalViews: 0 });
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "Good",
    price: "", quantity: "", location: "", county: ""
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
    fetchSubscription(storedToken);
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      const earnings = materials
        .filter(m => m.status === "sold")
        .reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      const live = materials.filter(m => m.status === "active" || m.isVerified === true).length;
      const pending = materials.filter(m => m.status === "pending" && !m.isVerified).length;
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

  const fetchSubscription = async (tkn) => {
    try {
      const res = await fetch(`${API_BASE}/payment/subscription`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription info:", err);
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
      setForm({ title: "", description: "", category: "", condition: "Good", price: "", quantity: "", location: "", county: "" });
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

  const handleSubscribe = async (subscriptionType) => {
    setSubscriptionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payment/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionType,
          phone: seller?.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setSuccess("M-Pesa prompt sent! Check your phone.");
      setTimeout(() => { setSuccess(""); fetchSubscription(token); }, 5000);
    } catch (err) {
      setError(err.message || "Subscription failed. Try again.");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleBoostMaterial = async (materialId, plan) => {
    setBoostLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payment/boost-material`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId,
          plan,
          phone: seller?.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Boost failed");
      setSuccess("M-Pesa prompt sent! Check your phone.");
      setTimeout(() => { setSuccess(""); fetchMyMaterials(token); }, 5000);
    } catch (err) {
      setError(err.message || "Boost failed. Try again.");
    } finally {
      setBoostLoading(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = (m.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    let currentStatus = m.status || "pending";
    if (m.isVerified && currentStatus === "pending") currentStatus = "active";
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
        <button style={s.uploadBtn} onClick={() => setView(view === "listings" ? "upload" : "listings")}>
          {view === "listings" ? "+ Upload Material" : "View Inventory"}
        </button>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}><span style={s.statIcon}>💰</span><div><div style={s.statLabel}>Revenue</div><div style={s.statVal}>KES {stats.totalEarnings.toLocaleString()}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>🌐</span><div><div style={s.statLabel}>Live Listings</div><div style={s.statVal}>{stats.liveItems}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>⏳</span><div><div style={s.statLabel}>Pending</div><div style={s.statVal}>{stats.pendingReview}</div></div></div>
        <div style={s.statCard}><span style={s.statIcon}>👁️</span><div><div style={s.statLabel}>Views</div><div style={s.statVal}>{stats.totalViews}</div></div></div>
      </div>

      <div style={s.controlsRow}>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(view === "listings" ? s.activeTab : {}) }} onClick={() => setView("listings")}>My Stock</button>
          <button style={{ ...s.tab, ...(view === "subscription" ? s.activeTab : {}) }} onClick={() => setView("subscription")}>💎 Upgrade</button>
          <button style={{ ...s.tab, ...(view === "profile" ? s.activeTab : {}) }} onClick={() => setView("profile")}>👤 Profile</button>
        </div>
        {view === "listings" && (
          <div style={s.filterGroup}>
            <input type="text" placeholder="Filter inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={s.searchBar} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={s.statusDropdown}>
              <option value="all">All</option>
              <option value="active">Live</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
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
      ) : view === "subscription" ? (
        <div style={{ maxWidth: "900px" }}>
          <h2 style={{ color: "#fbbf24", marginBottom: "24px" }}>💎 Subscription & Boosts</h2>
          
          {/* Current Subscription Status */}
          <div style={s.subscriptionCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>
                  Current Plan
                </p>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                  {subscriptionInfo?.subscriptionTier || "Free"}
                </h3>
              </div>
              {subscriptionInfo?.isActive && (
                <div style={s.activeBadge}>
                  Active ({subscriptionInfo.daysRemaining} days left)
                </div>
              )}
            </div>
          </div>

          {/* Subscription Plans */}
          <h3 style={{ color: "#f8fafc", marginBottom: "16px", fontSize: "16px", fontWeight: 700 }}>📦 Subscription Plans</h3>
          <div style={s.plansGrid}>
            {[
              {
                name: "Basic",
                price: "KES 500",
                duration: "30 days",
                features: ["Priority in search results", "Basic analytics", "Email support"],
                color: "#3b82f6",
                type: "basic",
              },
              {
                name: "Premium",
                price: "KES 1,200",
                duration: "90 days",
                features: ["Top placement in search", "Advanced analytics", "Priority support", "Featured badge"],
                color: "#f59e0b",
                type: "premium",
              },
            ].map((plan) => (
              <div key={plan.name} style={s.planCard}>
                <div style={{ background: plan.color, color: "white", padding: "16px", borderRadius: "12px 12px 0 0" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>{plan.name}</h3>
                  <p style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0" }}>{plan.price}</p>
                  <p style={{ fontSize: "12px", opacity: 0.9, margin: 0 }}>{plan.duration}</p>
                </div>
                <div style={{ padding: "16px" }}>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#cbd5e1" }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: "8px", fontSize: "13px" }}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.type)}
                    disabled={subscriptionLoading}
                    style={{
                      ...s.planBtn,
                      background: plan.color,
                    }}
                  >
                    {subscriptionLoading ? "Processing..." : "Subscribe"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Boost Options for Materials */}
          <h3 style={{ color: "#f8fafc", marginBottom: "16px", marginTop: "32px", fontSize: "16px", fontWeight: 700 }}>🚀 Boost Your Listings</h3>
          <p style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "13px" }}>Boost your active materials to get more visibility</p>
          <div style={s.grid}>
            {materials.filter(m => m.status === "active" || (m.isVerified && m.status === "pending")).slice(0, 6).map((m) => (
              <div key={m._id} style={s.card}>
                <div style={s.cardImg}>
                  {m.images?.[0] ? <img src={m.images[0]} alt="" style={s.img} /> : <div style={s.noImg}>📷 No Image</div>}
                  {m.isFeatured && <span style={{ ...s.statusBadge, background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>⭐ Featured</span>}
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{m.title}</h3>
                  <p style={s.cardPrice}>KES {m.price?.toLocaleString()}</p>
                  {!m.isFeatured && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button
                        onClick={() => handleBoostMaterial(m._id, "boost-7days")}
                        disabled={boostLoading}
                        style={{ ...s.boostBtn, flex: 1, fontSize: "11px", padding: "6px" }}
                      >
                        7-Day (KES 200)
                      </button>
                      <button
                        onClick={() => handleBoostMaterial(m._id, "boost-30days")}
                        disabled={boostLoading}
                        style={{ ...s.boostBtn, flex: 1, fontSize: "11px", padding: "6px", background: "#f59e0b" }}
                      >
                        30-Day (KES 500)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : view === "listings" ? (
        <div style={s.grid}>
          {filteredMaterials.map((m) => {
            const currentStatus = m.isVerified && m.status === "pending" ? "active" : (m.status || "pending");
            const st = STATUS_COLORS[currentStatus] || STATUS_COLORS.pending;
            return (
              <div key={m._id} style={s.card}>
                <div style={s.cardImg}>
                  {m.images?.[0] ? <img src={m.images[0]} alt="" style={s.img} /> : <div style={s.noImg}>📷 No Image</div>}
                  <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{m.title}</h3>
                  <p style={s.cardPrice}>KES {m.price?.toLocaleString()}</p>
                  <p style={s.cardMeta}>Qty: {m.quantity} • Location: {m.location}</p>
                  <div style={s.cardBtns}>
                    {currentStatus === "active" && <button style={s.soldBtn} onClick={() => handleMarkSold(m._id)}>Mark Sold</button>}
                    <button style={s.deleteBtn} onClick={() => handleDelete(m._id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={s.formBox}>
          {error && <div style={s.errorMsg}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}
          <div style={s.formGrid}>
            <input name="title" placeholder="Material Title" value={form.title} onChange={handleChange} style={s.input} />
            <select name="category" value={form.category} onChange={handleChange} style={s.input}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="price" type="number" placeholder="Price (KES)" value={form.price} onChange={handleChange} style={s.input} />
            <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} style={s.input} />
            <input name="location" placeholder="Specific Area (e.g. Westlands)" value={form.location} onChange={handleChange} style={s.input} />
            <select name="county" value={form.county} onChange={handleChange} style={s.input}>
              <option value="">Select County</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea name="description" placeholder="Description Details" value={form.description} onChange={handleChange} style={{ ...s.input, gridColumn: "1/-1" }} />
            <input type="file" multiple accept="image/*" onChange={handleImages} style={{ ...s.input, gridColumn: "1/-1" }} />
          </div>
          <button style={s.submitBtn} onClick={handleSubmit} disabled={submitLoading}>{submitLoading ? "Processing..." : "Publish Material"}</button>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "24px", background: "#0f172a", minHeight: "100vh", fontFamily: "sans-serif", color: "#f8fafc" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
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
  tab: { padding: "8px 16px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" },
  activeTab: { color: "#fbbf24", fontWeight: "bold" },
  filterGroup: { display: "flex", gap: "8px" },
  searchBar: { padding: "8px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  statusDropdown: { padding: "8px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  refreshBtn: { padding: "8px 12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid #2563eb", borderRadius: "6px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden" },
  cardImg: { position: "relative", height: "160px", background: "#0f172a" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" },
  statusBadge: { position: "absolute", top: "8px", left: "8px", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" },
  cardBody: { padding: "16px" },
  cardTitle: { margin: "0 0 8px 0", fontSize: "1rem" },
  cardPrice: { color: "#fbbf24", fontWeight: "bold", fontSize: "1.1rem", margin: "0 0 4px 0" },
  cardMeta: { color: "#94a3b8", fontSize: "0.85rem", margin: 0 },
  cardBtns: { display: "flex", gap: "8px", marginTop: "16px" },
  soldBtn: { flex: 1, padding: "6px", background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid #22c55e", borderRadius: "4px", cursor: "pointer" },
  deleteBtn: { flex: 1, padding: "6px", background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid #ef4444", borderRadius: "4px", cursor: "pointer" },
  formBox: { background: "#1e293b", padding: "24px", borderRadius: "8px", border: "1px solid #334155" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  input: { width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  submitBtn: { padding: "10px 24px", background: "#fbbf24", color: "#0f172a", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  errorMsg: { background: "rgba(239,68,68,0.2)", padding: "10px", borderRadius: "6px", color: "#f87171", marginBottom: "16px" },
  successMsg: { background: "rgba(34,197,94,0.2)", padding: "10px", borderRadius: "6px", color: "#4ade80", marginBottom: "16px" },
  subscriptionCard: { background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "24px" },
  activeBadge: { background: "#22c55e", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 },
  plansGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  planCard: { background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" },
  planBtn: { width: "100%", padding: "10px", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "13px", marginTop: "12px" },
  boostBtn: { padding: "6px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "12px" }
};

const css = `
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; outline: none; }
`;