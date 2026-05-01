import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsRes, caretakersRes] = await Promise.all([
        API.get("/properties/my-properties", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/auth/my-caretakers", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProperties(propsRes.data);
      setCaretakers(caretakersRes.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Invite caretaker by phone & name
  const handleInviteCaretaker = async () => {
    if (!inviteForm.name || !inviteForm.phone) {
      alert("❌ Please enter name and phone");
      return;
    }

    try {
      await API.post("/auth/invite-caretaker", {
        caretakerName: inviteForm.name,
        caretakerPhone: inviteForm.phone
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("✅ Caretaker invited!");
      setInviteForm({ name: '', phone: '' });
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Fire caretaker
  const handleFireCaretaker = async (caretakerId) => {
    if (!window.confirm("Fire this caretaker?")) return;

    try {
      await API.delete(`/auth/remove-caretaker/${caretakerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Caretaker removed");
      fetchData();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // ✅ Landlord approves property
  const handleApproveProperty = async (propertyId) => {
    try {
      await API.patch(`/properties/${propertyId}/landlord-approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Property approved! Admin will review soon.");
      fetchData();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // ✅ Landlord rejects property
  const handleRejectProperty = async (propertyId) => {
    if (!window.confirm("Reject this property?")) return;

    try {
      await API.patch(`/properties/${propertyId}/landlord-reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Property rejected");
      fetchData();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // ✅ Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Delete this property?")) return;

    try {
      await API.delete(`/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Property deleted");
      setProperties(properties.filter(p => p._id !== propertyId));
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  const getPropertyImages = (property) => {
    return property.images?.length > 0 
      ? property.images 
      : property.image ? [property.image] : [];
  };

  const nextImage = (propId, images) => {
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({ ...selectedImageIndex, [propId]: (current + 1) % images.length });
  };

  const prevImage = (propId, images) => {
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({ ...selectedImageIndex, [propId]: current === 0 ? images.length - 1 : current - 1 });
  };

  const pendingProps = properties.filter(p => p.status === "pending");
  const landlordApprovedProps = properties.filter(p => p.status === "landlord_approved");
  const adminApprovedProps = properties.filter(p => p.status === "admin_approved");

  let displayProps = [];
  if (activeTab === "pending") displayProps = pendingProps;
  else if (activeTab === "approved") displayProps = landlordApprovedProps;
  else if (activeTab === "live") displayProps = adminApprovedProps;
  else if (activeTab === "caretakers") displayProps = [];

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>📊 Landlord Dashboard</h1>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* TABS */}
      <div style={styles.tabBar}>
        <button className={`tab${activeTab === "pending" ? " active" : ""}`} onClick={() => setActiveTab("pending")}>
          ⏳ Pending ({pendingProps.length})
        </button>
        <button className={`tab${activeTab === "approved" ? " active" : ""}`} onClick={() => setActiveTab("approved")}>
          👤 Awaiting Admin ({landlordApprovedProps.length})
        </button>
        <button className={`tab${activeTab === "live" ? " active" : ""}`} onClick={() => setActiveTab("live")}>
          ✅ Live ({adminApprovedProps.length})
        </button>
        <button className={`tab${activeTab === "caretakers" ? " active" : ""}`} onClick={() => setActiveTab("caretakers")}>
          👥 Caretakers ({caretakers.length})
        </button>
      </div>

      {/* CARETAKERS TAB */}
      {activeTab === "caretakers" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Your Caretakers</h2>
            <button className="btn-primary" onClick={() => setShowInviteModal(true)}>➕ Invite Caretaker</button>
          </div>

          {showInviteModal && (
            <div style={styles.modal}>
              <div style={styles.modalBox}>
                <h3>Invite a Caretaker</h3>
                <input
                  placeholder="Caretaker Name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  style={styles.input}
                />
                <input
                  placeholder="Caretaker Phone"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                  style={styles.input}
                />
                <div style={styles.modalActions}>
                  <button className="btn-primary" onClick={handleInviteCaretaker}>Invite</button>
                  <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.list}>
            {caretakers.length === 0 ? (
              <p style={styles.empty}>No caretakers invited yet</p>
            ) : (
              caretakers.map(c => (
                <div key={c._id} style={styles.listItem}>
                  <div>
                    <h4>{c.name}</h4>
                    <p>📞 {c.phone}</p>
                  </div>
                  <button className="btn-danger" onClick={() => handleFireCaretaker(c._id)}>Fire</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PROPERTIES TABS */}
      {activeTab !== "caretakers" && (
        <>
          {loading ? (
            <div style={styles.loading}><div className="spinner" /></div>
          ) : displayProps.length === 0 ? (
            <div style={styles.empty}>
              <p>No properties in this category</p>
              <button className="btn-primary" onClick={() => navigate("/upload")}>📝 Upload Property</button>
            </div>
          ) : (
            <div style={styles.grid}>
              {displayProps.map((prop, idx) => {
                const images = getPropertyImages(prop);
                const currentIdx = selectedImageIndex[prop._id] || 0;

                return (
                  <div key={prop._id} className="card" style={{ animationDelay: `${idx * 60}ms` }}>
                    {/* IMAGE */}
                    {images.length > 0 ? (
                      <div style={styles.imageWrap}>
                        <img src={images[currentIdx]} alt={prop.title} style={styles.image} />
                        <span style={styles.status}>
                          {prop.status === "pending" ? "⏳ Pending" : 
                           prop.status === "landlord_approved" ? "👤 Admin Review" : "✅ Live"}
                        </span>
                        {images.length > 1 && (
                          <div style={styles.controls}>
                            <button onClick={() => prevImage(prop._id, images)}>❮</button>
                            <span>{currentIdx + 1}/{images.length}</span>
                            <button onClick={() => nextImage(prop._id, images)}>❯</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.noImage}>🏠</div>
                    )}

                    {/* INFO */}
                    <div style={styles.cardBody}>
                      <h3>{prop.title}</h3>
                      <p>📍 {prop.county}</p>
                      <p style={styles.price}>Ksh {Number(prop.price).toLocaleString()}</p>
                      
                      {prop.uploadedBy && (
                        <p style={styles.uploadedBy}>Uploaded by: {prop.uploadedBy.name}</p>
                      )}

                      {/* ACTIONS */}
                      {prop.status === "pending" && (
                        <div style={styles.actions}>
                          <button className="btn-approve" onClick={() => handleApproveProperty(prop._id)}>✅ Approve</button>
                          <button className="btn-reject" onClick={() => handleRejectProperty(prop._id)}>❌ Reject</button>
                        </div>
                      )}

                      <button className="btn-danger" onClick={() => handleDeleteProperty(prop._id)}>🗑 Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: 0 },
  errorBanner: { padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", marginBottom: "20px", fontSize: "14px" },
  tabBar: { display: "flex", gap: "10px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" },
  loading: { textAlign: "center", padding: "60px 20px" },
  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", marginBottom: "40px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  imageWrap: { position: "relative", overflow: "hidden" },
  image: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px 12px 0 0", display: "block" },
  noImage: { width: "100%", height: "160px", background: "rgba(59,130,246,0.07)", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" },
  status: { position: "absolute", top: "10px", right: "10px", background: "rgba(6,16,31,0.85)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "999px" },
  controls: { position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "999px" },
  cardBody: { padding: "16px" },
  price: { fontSize: "18px", fontWeight: 800, color: "#60a5fa", margin: "8px 0" },
  uploadedBy: { fontSize: "12px", color: "#94a3b8", fontStyle: "italic", margin: "8px 0" },
  actions: { display: "flex", gap: "8px", marginBottom: "8px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "10px" },
  empty: { textAlign: "center", padding: "40px 20px", color: "#64748b" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#0d1b2e", padding: "28px", borderRadius: "16px", maxWidth: "400px", width: "90%" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#e2e8f0" },
  modalActions: { display: "flex", gap: "10px" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .tab { padding: 12px 20px; border: none; background: none; color: #94a3b8; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s; }
  .tab.active { color: #60a5fa; border-bottom-color: #60a5fa; }
  .tab:hover { color: #e2e8f0; }

  .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; transition: all .2s; animation: fadeUp .4s ease both; }
  .card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.35); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }

  .btn-primary { padding: 12px 24px; border-radius: 10px; border: none; background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; box-shadow: 0 4px 20px rgba(59,130,246,0.35); }
  .btn-primary:hover { transform: translateY(-2px); }

  .btn-secondary { padding: 12px 24px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit; }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); }

  .btn-approve { padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); color: #86efac; font-weight: 600; font-size: 13px; cursor: pointer; }
  .btn-approve:hover { background: rgba(34,197,94,0.18); }

  .btn-reject { padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); color: #fca5a5; font-weight: 600; font-size: 13px; cursor: pointer; }
  .btn-reject:hover { background: rgba(239,68,68,0.18); }

  .btn-danger { padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); color: #fca5a5; font-weight: 600; font-size: 13px; cursor: pointer; }
  .btn-danger:hover { background: rgba(239,68,68,0.18); }

  .spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; animation: spin .8s linear infinite; margin: 0 auto; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;