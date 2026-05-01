import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [caretakers, setCaretakers] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [showCaretakerModal, setShowCaretakerModal] = useState(false); // ✅ NEW
  const [newCaretaker, setNewCaretaker] = useState({ name: '', email: '', phone: '' }); // ✅ NEW

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyProperties();
    fetchCaretakers(); // ✅ NEW
  }, [token, navigate]);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/properties/my-properties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW - Fetch caretakers
  const fetchCaretakers = async () => {
    try {
      const res = await API.get("/auth/my-caretakers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaretakers(res.data);
    } catch (err) {
      console.error("❌ Fetch caretakers error:", err);
    }
  };

  // ✅ NEW - Add caretaker
  const handleAddCaretaker = async () => {
    if (!newCaretaker.name || !newCaretaker.email || !newCaretaker.phone) {
      alert("❌ Please fill all fields");
      return;
    }

    try {
      await API.post("/auth/invite-caretaker", {
        caretakerName: newCaretaker.name,
        caretakerEmail: newCaretaker.email,
        caretakerPhone: newCaretaker.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Caretaker invited successfully");
      setNewCaretaker({ name: '', email: '', phone: '' });
      setShowCaretakerModal(false);
      fetchCaretakers();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ NEW - Fire caretaker
  const handleFireCaretaker = async (caretakerId) => {
    if (!window.confirm("Are you sure? This caretaker will no longer be able to upload properties.")) return;

    try {
      await API.delete(`/auth/remove-caretaker/${caretakerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Caretaker removed");
      fetchCaretakers();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ NEW - Approve property
  const handleApprovProperty = async (propertyId) => {
    try {
      await API.patch(`/properties/${propertyId}/landlord-approve`, 
        { notes: "Approved by landlord" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Property approved. Waiting for admin approval.");
      fetchMyProperties();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ NEW - Reject property
  const handleRejectProperty = async (propertyId) => {
    const notes = prompt("Why are you rejecting this property?");
    if (!notes) return;

    try {
      await API.patch(`/properties/${propertyId}/landlord-reject`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Property rejected");
      fetchMyProperties();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;

    try {
      await API.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Property deleted");
      setProperties(properties.filter(p => p._id !== id));
    } catch (err) {
      alert("❌ Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  const getPropertyImages = (property) => {
    return property.images && property.images.length > 0 
      ? property.images 
      : property.image 
        ? [property.image]
        : [];
  };

  const nextImage = (propId, images) => {
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({
      ...selectedImageIndex,
      [propId]: (current + 1) % images.length
    });
  };

  const prevImage = (propId, images) => {
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({
      ...selectedImageIndex,
      [propId]: current === 0 ? images.length - 1 : current - 1
    });
  };

  const pendingProps = properties.filter(p => p.status === "pending");
  const landlordApprovedProps = properties.filter(p => p.status === "landlord_approved");
  const approvedProps = properties.filter(p => p.status === "admin_approved");
  const rejectedProps = properties.filter(p => p.status === "rejected");

  let displayProps = [];
  if (activeTab === "pending") displayProps = pendingProps;
  else if (activeTab === "landlord_approved") displayProps = landlordApprovedProps;
  else if (activeTab === "approved") displayProps = approvedProps;
  else if (activeTab === "rejected") displayProps = rejectedProps;
  else if (activeTab === "caretakers") displayProps = []; // Special tab

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Landlord Dashboard</h1>
        <p style={styles.subtitle}>Manage properties & caretakers</p>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          className={`dash-tab${activeTab === "pending" ? " active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending ({pendingProps.length})
        </button>
        <button
          className={`dash-tab${activeTab === "landlord_approved" ? " active" : ""}`}
          onClick={() => setActiveTab("landlord_approved")}
        >
          👤 Landlord Approved ({landlordApprovedProps.length})
        </button>
        <button
          className={`dash-tab${activeTab === "approved" ? " active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Live ({approvedProps.length})
        </button>
        <button
          className={`dash-tab${activeTab === "rejected" ? " active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          ❌ Rejected ({rejectedProps.length})
        </button>
        <button
          className={`dash-tab${activeTab === "caretakers" ? " active" : ""}`}
          onClick={() => setActiveTab("caretakers")}
        >
          👥 Caretakers ({caretakers.length})
        </button>
      </div>

      {/* CARETAKERS TAB */}
      {activeTab === "caretakers" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Caretakers</h2>
          <button className="dash-btn" onClick={() => setShowCaretakerModal(true)}>
            ➕ Add Caretaker
          </button>

          {showCaretakerModal && (
            <div style={styles.modal}>
              <div style={styles.modalBox}>
                <h3>Add New Caretaker</h3>
                <input
                  placeholder="Name"
                  value={newCaretaker.name}
                  onChange={(e) => setNewCaretaker({...newCaretaker, name: e.target.value})}
                  style={styles.modalInput}
                />
                <input
                  placeholder="Email"
                  value={newCaretaker.email}
                  onChange={(e) => setNewCaretaker({...newCaretaker, email: e.target.value})}
                  style={styles.modalInput}
                />
                <input
                  placeholder="Phone"
                  value={newCaretaker.phone}
                  onChange={(e) => setNewCaretaker({...newCaretaker, phone: e.target.value})}
                  style={styles.modalInput}
                />
                <div style={styles.modalActions}>
                  <button className="dash-btn" onClick={handleAddCaretaker}>Invite</button>
                  <button className="dash-btn-cancel" onClick={() => setShowCaretakerModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.caretakersList}>
            {caretakers.length === 0 ? (
              <p style={styles.emptyText}>No caretakers yet</p>
            ) : (
              caretakers.map(ct => (
                <div key={ct._id} style={styles.caretakerCard}>
                  <div>
                    <h4>{ct.name}</h4>
                    <p>{ct.email}</p>
                    <p>{ct.phone}</p>
                  </div>
                  <button 
                    className="dash-delete-btn"
                    onClick={() => handleFireCaretaker(ct._id)}
                  >
                    🗑 Fire
                  </button>
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
            <div style={styles.loading}>
              <div className="dash-spinner" />
              <p>Loading…</p>
            </div>
          ) : displayProps.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No properties in this category</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {displayProps.map((property, idx) => {
                const images = getPropertyImages(property);
                const currentImageIndex = selectedImageIndex[property._id] || 0;
                const currentImage = images[currentImageIndex];

                return (
                  <div key={property._id} className="dash-card" style={{ animationDelay: `${idx * 60}ms` }}>
                    {images.length > 0 ? (
                      <div style={styles.imageWrap}>
                        <img src={currentImage} alt={property.title} style={styles.image} />
                        <span style={styles.statusBadge}>
                          {property.status === "pending" ? "⏳ Pending" : 
                           property.status === "landlord_approved" ? "👤 Awaiting Admin" :
                           property.status === "admin_approved" ? "✅ Live" :
                           "❌ Rejected"}
                        </span>

                        {images.length > 1 && (
                          <div style={styles.galleryControls}>
                            <button className="gallery-btn" onClick={() => prevImage(property._id, images)}>❮</button>
                            <span style={styles.imageCounter}>{currentImageIndex + 1} / {images.length}</span>
                            <button className="gallery-btn" onClick={() => nextImage(property._id, images)}>❯</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.imagePlaceholder}><span>🏠</span></div>
                    )}

                    <div style={styles.cardBody}>
                      <h3 style={styles.cardTitle}>{property.title}</h3>
                      <p style={styles.location}>📍 {property.county}</p>
                      <p style={styles.price}>Ksh {Number(property.price).toLocaleString()}</p>
                      
                      {property.uploadedBy && (
                        <p style={styles.uploadedBy}>Uploaded by: {property.uploadedBy.name}</p>
                      )}

                      {property.status === "pending" && (
                        <div style={styles.actionRow}>
                          <button className="dash-approve-btn" onClick={() => handleApprovProperty(property._id)}>✅ Approve</button>
                          <button className="dash-reject-btn" onClick={() => handleRejectProperty(property._id)}>❌ Reject</button>
                        </div>
                      )}

                      <button className="dash-delete-btn" onClick={() => handleDelete(property._id)}>🗑 Delete</button>
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
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "40px 20px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px" },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0 },
  errorBanner: {
    padding: "12px 16px", borderRadius: "10px",
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", marginBottom: "20px", fontSize: "14px",
  },
  tabBar: { display: "flex", gap: "10px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" },
  loading: { textAlign: "center", padding: "60px 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginBottom: "40px" },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px 12px 0 0", display: "block" },
  imagePlaceholder: { width: "100%", height: "160px", background: "rgba(59,130,246,0.07)", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center" },
  statusBadge: { position: "absolute", top: "10px", right: "10px", background: "rgba(6,16,31,0.85)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "999px" },
  galleryControls: { position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "999px" },
  imageCounter: { color: "#fff", fontSize: "12px", fontWeight: 600 },
  cardBody: { padding: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" },
  location: { fontSize: "13px", color: "#60a5fa", margin: "0 0 8px" },
  price: { fontSize: "18px", fontWeight: 800, color: "#60a5fa", margin: "0 0 8px" },
  uploadedBy: { fontSize: "12px", color: "#94a3b8", margin: "0 0 12px", fontStyle: "italic" },
  actionRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyText: { color: "#64748b" },
  section: { padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", marginBottom: "20px" },
  sectionTitle: { fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 20px" },
  caretakersList: { display: "grid", gap: "12px" },
  caretakerCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#0d1b2e", padding: "32px", borderRadius: "16px", maxWidth: "400px", width: "90%" },
  modalInput: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#e2e8f0" },
  modalActions: { display: "flex", gap: "10px" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .dash-tab {
    padding: 12px 20px; border: none; background: none;
    color: #94a3b8; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
    transition: all .2s;
  }
  .dash-tab.active { color: #60a5fa; border-bottom-color: #60a5fa; }
  .dash-tab:hover { color: #e2e8f0; }

  .dash-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: fadeUp .4s ease both;
  }
  .dash-card:hover {
    transform: translateY(-4px); border-color: rgba(59,130,246,0.35);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  }

  .gallery-btn {
    background: rgba(255,255,255,0.1); border: none; color: white;
    padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 600;
    font-family: inherit; transition: background .2s;
  }
  .gallery-btn:hover { background: rgba(255,255,255,0.2); }

  .dash-delete-btn {
    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
    border: 1px solid rgba(239,68,68,0.35); color: #fca5a5;
    background: rgba(239,68,68,0.08); cursor: pointer; font-family: inherit;
    font-weight: 600; transition: background .2s;
  }
  .dash-delete-btn:hover { background: rgba(239,68,68,0.18); }

  .dash-approve-btn {
    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
    border: 1px solid rgba(34,197,94,0.35); color: #86efac;
    background: rgba(34,197,94,0.08); cursor: pointer; font-family: inherit;
    font-weight: 600; transition: background .2s;
  }
  .dash-approve-btn:hover { background: rgba(34,197,94,0.18); }

  .dash-reject-btn {
    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
    border: 1px solid rgba(239,68,68,0.35); color: #fca5a5;
    background: rgba(239,68,68,0.08); cursor: pointer; font-family: inherit;
    font-weight: 600; transition: background .2s;
  }
  .dash-reject-btn:hover { background: rgba(239,68,68,0.18); }

  .dash-btn {
    padding: 12px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white;
    font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35); transition: transform .15s;
  }
  .dash-btn:hover { transform: translateY(-2px); }

  .dash-btn-cancel {
    padding: 12px 28px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05); color: #e2e8f0;
    font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: background .2s;
  }
  .dash-btn-cancel:hover { background: rgba(255,255,255,0.1); }

  .dash-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
    animation: spin .8s linear infinite; margin: 0 auto;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;