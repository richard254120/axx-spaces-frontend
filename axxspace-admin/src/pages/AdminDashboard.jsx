import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// ── tiny helpers ──────────────────────────────────────────────
const TABS = ["properties","materials","tourism","movers","sellers","payment"];
const TAB_LABELS = {
  properties:"🏠 Properties", materials:"🛍️ Materials", tourism:"🏨 Tourism",
  movers:"🚛 Movers", sellers:"📋 Sellers", payment:"💳 Payment"
};
const STATUS_VIEWS = ["pending","approved","rejected"];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allPending, setAllPending]   = useState(null);
  const [allItems,   setAllItems]     = useState([]);
  const [stats,      setStats]        = useState(null);
  const [loading,    setLoading]      = useState(true);
  const [activeTab,  setActiveTab]    = useState("properties");
  const [statusView, setStatusView]   = useState("pending");   // pending | approved | rejected
  const [selected,   setSelected]     = useState(null);        // item open in modal
  const [editMode,   setEditMode]     = useState(false);
  const [editData,   setEditData]     = useState({});
  const [saving,     setSaving]       = useState(false);

  const [mpesaConfig,   setMpesaConfig]   = useState({ mpesa_shortcode:"", mpesa_passkey:"", mpesa_consumer_key:"", mpesa_consumer_secret:"" });
  const [configSaving,  setConfigSaving]  = useState(false);
  const [configMessage, setConfigMessage] = useState("");

  // ── auth guard ─────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "admin") { navigate("/login"); return; }
    loadStats();
    loadAllPending();
    loadMpesaConfig();
  }, [user, navigate]);

  // ── reload items when tab or statusView changes ─────────────
  useEffect(() => {
    if (activeTab !== "payment") loadItems(activeTab, statusView);
  }, [activeTab, statusView]);

  // ── data loaders ───────────────────────────────────────────
  const loadStats = async () => {
    try { const r = await API.get("/admin/stats"); setStats(r.data); }
    catch(e) { console.error(e); }
  };

  const loadAllPending = async () => {
    try {
      setLoading(true);
      const r = await API.get("/admin/pending");
      setAllPending(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadItems = async (type, status) => {
    try {
      setLoading(true);
      const r = await API.get(`/admin/all?type=${type}&status=${status}`);
      setAllItems(Array.isArray(r.data) ? r.data : []);
    } catch(e) { console.error(e); setAllItems([]); }
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
    } catch(e) { console.error(e); }
  };

  // ── approve / reject ───────────────────────────────────────
  const handleApprove = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/approve`);
      refresh();
      if (selected?._id === id) setSelected(null);
      alert("✅ Approved successfully");
    } catch(e) { alert("❌ Failed to approve"); }
  };

  const handleReject = async (type, id) => {
    try {
      await API.patch(`/admin/${type}/${id}/reject`);
      refresh();
      if (selected?._id === id) setSelected(null);
      alert("✅ Rejected successfully");
    } catch(e) { alert("❌ Failed to reject"); }
  };

  const refresh = () => { loadStats(); loadAllPending(); loadItems(activeTab, statusView); };

  // ── edit / save ────────────────────────────────────────────
  const openEdit = (item) => { setEditData({ ...item }); setEditMode(true); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const endpointMap = { properties:"properties", materials:"materials", tourism:"tourism" };
      const ep = endpointMap[activeTab];
      if (!ep) { alert("Edit not supported for this type."); setSaving(false); return; }
      await API.patch(`/${ep}/${editData._id}`, editData);
      refresh();
      setEditMode(false);
      setSelected({ ...selected, ...editData });
      alert("✅ Saved successfully");
    } catch(e) { alert("❌ Failed to save: " + (e.response?.data?.error || e.message)); }
    finally { setSaving(false); }
  };

  // ── mpesa save ─────────────────────────────────────────────
  const handleSaveMpesaConfig = async () => {
    setConfigSaving(true);
    try {
      await Promise.all([
        API.post("/config", { key:"mpesa_shortcode",      value:mpesaConfig.mpesa_shortcode,      description:"M-Pesa Paybill/Shortcode" }),
        API.post("/config", { key:"mpesa_passkey",        value:mpesaConfig.mpesa_passkey,        description:"M-Pesa Passkey" }),
        API.post("/config", { key:"mpesa_consumer_key",   value:mpesaConfig.mpesa_consumer_key,   description:"M-Pesa Consumer Key" }),
        API.post("/config", { key:"mpesa_consumer_secret",value:mpesaConfig.mpesa_consumer_secret,description:"M-Pesa Consumer Secret" }),
      ]);
      setConfigMessage("✅ M-Pesa configuration saved successfully!");
    } catch(e) { setConfigMessage("❌ Failed to save configuration."); }
    finally { setConfigSaving(false); setTimeout(() => setConfigMessage(""), 3000); }
  };

  // ── pending counts for tab badge ───────────────────────────
  const pendingCount = (tab) => {
    if (!allPending) return "";
    const map = { properties:"properties", materials:"materials", tourism:"tourism", movers:"movers", sellers:"sellers" };
    const key = map[tab];
    return key && allPending[key]?.length ? ` (${allPending[key].length})` : "";
  };

  // ── items to show based on view ────────────────────────────
  const displayItems = statusView === "pending"
    ? (allPending?.[activeTab] || [])
    : allItems;

  // ── field helpers ──────────────────────────────────────────
  const getTitle   = (item) => item.title || item.name || item.businessName || "—";
  const getSub     = (item) => item.category || item.county || (item.businessRegNumber ? `Reg: ${item.businessRegNumber}` : "") || item.vehicleType || "—";
  const getOwner   = (item) => item.owner?.name || item.seller?.name || item.name || "—";
  const getContact = (item) => item.owner?.phone || item.seller?.phone || item.phone || item.owner?.email || "—";
  const getPrice   = (item) => item.price != null ? `KES ${item.price.toLocaleString()}` : item.vehicleType || (item.kraPin ? `KRA: ${item.kraPin}` : "—");
  const getImages  = (item) => {
    const imgs = item.images || item.photos || item.coverImage || item.image || [];
    if (typeof imgs === "string") return [imgs];
    return Array.isArray(imgs) ? imgs.filter(Boolean) : [];
  };

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
        <button style={S.logoutBtn} onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>
          🚪 Logout
        </button>
      </div>

      {/* STATS */}
      {stats && (
        <div style={S.statsGrid}>
          {[
            { label:"🏢 Properties", total:stats.properties.total, pending:stats.properties.pending },
            { label:"🛍️ Materials",  total:stats.materials.total,  pending:stats.materials.pending  },
            { label:"🚛 Movers",     total:stats.movers.total,     pending:stats.movers.pending     },
            { label:"🏨 Tourism",    total:stats.tourism.total,    pending:stats.tourism.pending    },
            { label:"📋 Sellers",    total:stats.sellers.total,    pending:stats.sellers.pending    },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <p style={S.statLabel}>{s.label}</p>
              <p style={S.statVal}>{s.total}</p>
              {s.pending > 0 && <p style={S.statPending}>{s.pending} pending</p>}
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t}
            style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}
            onClick={() => { setActiveTab(t); setStatusView("pending"); }}>
            {TAB_LABELS[t]}{pendingCount(t)}
          </button>
        ))}
      </div>

      {/* STATUS VIEW TOGGLE (not for payment) */}
      {activeTab !== "payment" && (
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

      {/* CONTENT */}
      {activeTab === "payment" ? (
        <PaymentSettings
          mpesaConfig={mpesaConfig} setMpesaConfig={setMpesaConfig}
          configSaving={configSaving} configMessage={configMessage}
          handleSave={handleSaveMpesaConfig} />
      ) : loading ? (
        <div style={S.loader}>⏳ Loading {statusView} {activeTab}...</div>
      ) : displayItems.length === 0 ? (
        <div style={S.empty}>
          <p style={S.emptyText}>✅ No {statusView} {activeTab} found.</p>
        </div>
      ) : (
        <div style={S.grid}>
          {displayItems.map(item => (
            <div key={item._id} style={S.card} onClick={() => setSelected(item)} className="admin-card">
              {/* card image */}
              {getImages(item)[0] && (
                <div style={{ ...S.cardImg, backgroundImage:`url(${getImages(item)[0]})` }} />
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
                {statusView === "pending" && (
                  <div style={S.cardBtns} onClick={e => e.stopPropagation()}>
                    <button style={S.approveBtn} onClick={() => handleApprove(activeTab, item._id)}>✅ Approve</button>
                    <button style={S.rejectBtn}  onClick={() => handleReject(activeTab, item._id)}>❌ Reject</button>
                  </div>
                )}
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
          getImages={getImages} getTitle={getTitle} getOwner={getOwner} getContact={getContact}
        />
      )}
    </div>
  );
}

// ── DETAIL MODAL ──────────────────────────────────────────────
function DetailModal({ item, tab, statusView, onClose, onApprove, onReject,
  editMode, editData, setEditData, onEdit, onSave, saving, onCancelEdit,
  getImages, getTitle, getOwner, getContact }) {

  const images = getImages(item);
  const [imgIdx, setImgIdx] = useState(0);

  const fields = Object.entries(item).filter(([k]) =>
    !["_id","__v","password","emailVerificationToken","resetPasswordToken",
      "images","photos","coverImage","image","owner","seller"].includes(k)
  );

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {/* modal header */}
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>{getTitle(item)}</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.modalBody}>
          {/* images */}
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

          {/* owner info */}
          <div style={S.ownerBox}>
            <p style={S.ownerLine}>👤 <strong>{getOwner(item)}</strong> &nbsp;|&nbsp; 📞 {getContact(item)}</p>
            {item.owner?.email && <p style={S.ownerLine}>✉️ {item.owner.email}</p>}
          </div>

          {/* fields */}
          {editMode ? (
            <div style={S.editGrid}>
              {Object.entries(editData)
                .filter(([k]) => !["_id","__v","password","owner","seller","images","photos","coverImage","image","emailVerificationToken","resetPasswordToken"].includes(k))
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

        {/* modal footer */}
        <div style={S.modalFooter}>
          {editMode ? (
            <>
              <button style={S.saveBtn} onClick={onSave} disabled={saving}>{saving ? "Saving…" : "💾 Save Changes"}</button>
              <button style={S.cancelBtn} onClick={onCancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              {statusView === "pending" && (
                <>
                  <button style={S.approveBtn} onClick={onApprove}>✅ Approve</button>
                  <button style={S.rejectBtn}  onClick={onReject}>❌ Reject</button>
                </>
              )}
              {["properties","materials","tourism"].includes(tab) && (
                <button style={S.editBtn} onClick={onEdit}>✏️ Edit</button>
              )}
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
    ["mpesa_shortcode","text","Paybill/Shortcode","e.g. 174379","Your M-Pesa Paybill or Buy Goods Till Number"],
    ["mpesa_passkey","password","Passkey","Enter passkey","The passkey from your M-Pesa dashboard"],
    ["mpesa_consumer_key","text","Consumer Key","Enter Consumer Key","From Safaricom Developer Portal"],
    ["mpesa_consumer_secret","password","Consumer Secret","Enter Consumer Secret","From Safaricom Developer Portal"],
  ];
  return (
    <div style={S.configBox}>
      <h2 style={S.configTitle}>💳 M-Pesa Configuration</h2>
      {configMessage && <div style={{ ...S.configMsg, color: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444", borderColor: configMessage.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{configMessage}</div>}
      {fields.map(([k, type, label, placeholder, hint]) => (
        <div key={k} style={{ marginBottom:16 }}>
          <label style={S.editLabel}>{label}</label>
          <input type={type} value={mpesaConfig[k]} placeholder={placeholder}
            onChange={e => setMpesaConfig({ ...mpesaConfig, [k]: e.target.value })} style={S.editInput} />
          <p style={{ fontSize:11, color:"#64748b", margin:"4px 0 0" }}>{hint}</p>
        </div>
      ))}
      <button style={S.saveBtn} onClick={handleSave} disabled={configSaving}>{configSaving ? "Saving…" : "💾 Save Configuration"}</button>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────
const S = {
  page:        { minHeight:"100vh", background:"linear-gradient(135deg,#06101f,#0a1428)", padding:"32px 4%", color:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" },
  header:      { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 },
  logo:        { fontSize:26, fontWeight:800, color:"#fbbf24", margin:0 },
  logoSub:     { color:"#64748b", fontSize:13, margin:"4px 0 0" },
  logoutBtn:   { background:"rgba(239,68,68,0.1)", color:"#ef4444", border:"1px solid #ef4444", padding:"8px 18px", borderRadius:8, fontWeight:700, cursor:"pointer" },
  statsGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:28 },
  statCard:    { background:"rgba(30,41,59,0.6)", padding:"16px 20px", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)" },
  statLabel:   { fontSize:12, color:"#94a3b8", margin:"0 0 6px" },
  statVal:     { fontSize:26, fontWeight:800, color:"#fbbf24", margin:"0 0 2px" },
  statPending: { fontSize:11, color:"#ef4444", margin:0 },
  tabs:        { display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 },
  tab:         { background:"rgba(30,41,59,0.6)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:13 },
  tabActive:   { background:"#fbbf24", color:"#1f2937", borderColor:"#fbbf24" },
  statusToggle:{ display:"flex", gap:8, marginBottom:24 },
  stBtn:       { background:"rgba(30,41,59,0.4)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.08)", padding:"7px 16px", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 },
  stBtnActive: { background:"rgba(251,191,36,0.15)", color:"#fbbf24", borderColor:"#fbbf24" },
  loader:      { textAlign:"center", padding:80, color:"#fbbf24", fontSize:16 },
  empty:       { background:"rgba(30,41,59,0.4)", padding:60, borderRadius:16, textAlign:"center", border:"1px dashed rgba(251,191,36,0.3)" },
  emptyText:   { color:"#94a3b8", fontSize:16 },
  grid:        { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 },
  card:        { background:"rgba(15,23,42,0.85)", borderRadius:14, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden", cursor:"pointer", transition:"transform 0.2s,box-shadow 0.2s" },
  cardImg:     { height:160, backgroundSize:"cover", backgroundPosition:"center" },
  cardBody:    { padding:16 },
  cardTitle:   { fontWeight:700, fontSize:15, margin:"0 0 4px" },
  cardSub:     { fontSize:12, color:"#94a3b8", margin:"0 0 6px" },
  cardOwner:   { fontSize:12, color:"#64748b", margin:"0 0 10px" },
  cardFooter:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  priceBadge:  { background:"rgba(59,130,246,0.15)", color:"#3b82f6", padding:"4px 10px", borderRadius:6, fontWeight:700, fontSize:12 },
  statusDot:   { padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:"#fff", textTransform:"capitalize" },
  cardBtns:    { display:"flex", gap:8, marginTop:8 },
  approveBtn:  { background:"#22c55e", color:"#fff", border:"none", padding:"7px 14px", borderRadius:7, fontWeight:700, cursor:"pointer", fontSize:12 },
  rejectBtn:   { background:"rgba(239,68,68,0.1)", color:"#ef4444", border:"1px solid #ef4444", padding:"7px 14px", borderRadius:7, fontWeight:700, cursor:"pointer", fontSize:12 },
  editBtn:     { background:"rgba(251,191,36,0.1)", color:"#fbbf24", border:"1px solid #fbbf24", padding:"7px 14px", borderRadius:7, fontWeight:700, cursor:"pointer", fontSize:12 },
  saveBtn:     { background:"#fbbf24", color:"#1f2937", border:"none", padding:"10px 20px", borderRadius:8, fontWeight:800, cursor:"pointer", fontSize:13 },
  cancelBtn:   { background:"rgba(30,41,59,0.6)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)", padding:"10px 20px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 },
  overlay:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  modal:       { background:"#0f1729", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", width:"100%", maxWidth:720, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  modalTitle:  { fontSize:20, fontWeight:800, color:"#fbbf24", margin:0 },
  closeBtn:    { background:"none", border:"none", color:"#94a3b8", fontSize:20, cursor:"pointer" },
  modalBody:   { flex:1, overflowY:"auto", padding:24 },
  modalFooter: { display:"flex", gap:10, padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.07)", flexWrap:"wrap" },
  imgSection:  { marginBottom:20 },
  mainImg:     { width:"100%", maxHeight:300, objectFit:"cover", borderRadius:10 },
  thumbRow:    { display:"flex", gap:8, marginTop:8, flexWrap:"wrap" },
  thumb:       { width:60, height:60, objectFit:"cover", borderRadius:6, cursor:"pointer", border:"2px solid transparent", opacity:0.6 },
  thumbActive: { borderColor:"#fbbf24", opacity:1 },
  ownerBox:    { background:"rgba(30,41,59,0.5)", padding:"12px 16px", borderRadius:10, marginBottom:16 },
  ownerLine:   { margin:"2px 0", fontSize:13, color:"#cbd5e1" },
  fieldsGrid:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" },
  fieldRow:    { display:"flex", flexDirection:"column", background:"rgba(30,41,59,0.3)", padding:"8px 12px", borderRadius:8 },
  fieldKey:    { fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 },
  fieldVal:    { fontSize:13, color:"#e2e8f0", wordBreak:"break-all" },
  editGrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  editField:   { display:"flex", flexDirection:"column", gap:4 },
  editLabel:   { fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:700 },
  editInput:   { padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(30,41,59,0.7)", color:"#f1f5f9", fontSize:13, outline:"none" },
  configBox:   { background:"rgba(15,23,42,0.8)", borderRadius:16, padding:32, maxWidth:600, margin:"0 auto", border:"1px solid rgba(255,255,255,0.05)" },
  configTitle: { fontSize:20, fontWeight:800, color:"#fbbf24", marginBottom:20 },
  configMsg:   { padding:"10px 14px", borderRadius:8, border:"1px solid", fontSize:13, fontWeight:600, marginBottom:16 },
};

const css = `
  .admin-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.3); border-radius: 3px; }
`;