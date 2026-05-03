import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("available");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProperties();
  }, [token, navigate, activeTab]);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      let endpoint = "";
      switch(activeTab) {
        case "available":
          endpoint = "/properties/my-available";
          break;
        case "pending":
          endpoint = "/properties/my-pending";
          break;
        case "booked":
          endpoint = "/properties/my-booked";
          break;
        default:
          endpoint = "/properties/my-available";
      }

      const res = await API.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProperties(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
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

  // ✅ Accept booking
  const handleAcceptBooking = async (propertyId, requestId) => {
    if (!window.confirm("Accept this booking request?")) return;

    try {
      const res = await API.post(
        `/properties/${propertyId}/accept-booking/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActionMessage("✅ Booking accepted successfully!");
      setTimeout(() => {
        fetchProperties();
        setSelectedBookingModal(null);
      }, 1500);

    } catch (err) {
      alert("❌ Failed to accept booking: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Reject booking
  const handleRejectBooking = async (propertyId, requestId) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (!window.confirm("Reject this booking request?")) return;

    try {
      const res = await API.post(
        `/properties/${propertyId}/reject-booking/${requestId}`,
        { rejectionReason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActionMessage("✅ Booking rejected");
      setRejectReason("");
      setTimeout(() => {
        fetchProperties();
        setSelectedBookingModal(null);
      }, 1500);

    } catch (err) {
      alert("❌ Failed to reject booking: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Mark as available
  const handleMarkAvailable = async (propertyId) => {
    if (!window.confirm("This will remove all bookings. Proceed?")) return;

    try {
      const res = await API.post(
        `/properties/${propertyId}/mark-available`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActionMessage("✅ Property marked as available");
      setTimeout(() => {
        fetchProperties();
      }, 1500);

    } catch (err) {
      alert("❌ Failed: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Delete property
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;

    try {
      await API.delete(`/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setActionMessage("✅ Property deleted");
      setTimeout(() => {
        fetchProperties();
      }, 1500);

    } catch (err) {
      alert("❌ Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 My Properties</h1>
        <p style={styles.subtitle}>Manage your listings and bookings</p>
      </div>

      {/* Messages */}
      {error && <div style={styles.errorBanner}>{error}</div>}
      {actionMessage && <div style={styles.successBanner}>{actionMessage}</div>}

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          className={`dashboard-tab ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          ✅ Available ({properties.length})
        </button>
        <button
          className={`dashboard-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending Bookings ({properties.length})
        </button>
        <button
          className={`dashboard-tab ${activeTab === "booked" ? "active" : ""}`}
          onClick={() => setActiveTab("booked")}
        >
          🔒 Booked ({properties.length})
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={styles.loading}>
          <div className="dashboard-spinner" />
          <p>Loading properties…</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            {activeTab === "available" ? "📝" : activeTab === "pending" ? "⏳" : "🔒"}
          </div>
          <h3 style={styles.emptyTitle}>
            {activeTab === "available" ? "No available properties" : activeTab === "pending" ? "No pending bookings" : "No booked properties"}
          </h3>
          <p style={styles.emptyText}>
            {activeTab === "available" ? "All your properties are booked or pending!" : activeTab === "pending" ? "No one has requested your properties yet." : "You don't have any booked properties."}
          </p>
          {activeTab === "available" && (
            <button className="dashboard-btn" onClick={() => navigate("/upload")}>
              ➕ Upload a Property
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((property, idx) => {
            const images = getPropertyImages(property);
            const currentImageIndex = selectedImageIndex[property._id] || 0;
            const currentImage = images[currentImageIndex];

            return (
              <div key={property._id} className="dashboard-card" style={{ animationDelay: `${idx * 60}ms` }}>
                {/* Image */}
                {images.length > 0 ? (
                  <div style={styles.imageWrap}>
                    <img src={currentImage} alt={property.title} style={styles.image} />

                    {images.length > 1 && (
                      <>
                        <div style={styles.galleryControls}>
                          <button className="gallery-btn" onClick={() => prevImage(property._id, images)}>❮</button>
                          <span style={styles.imageCounter}>{currentImageIndex + 1} / {images.length}</span>
                          <button className="gallery-btn" onClick={() => nextImage(property._id, images)}>❯</button>
                        </div>

                        <div style={styles.thumbnails}>
                          {images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`thumb ${i}`}
                              style={{
                                ...styles.thumbnail,
                                border: i === currentImageIndex ? "2px solid #60a5fa" : "1px solid #333"
                              }}
                              onClick={() => setSelectedImageIndex({ ...selectedImageIndex, [property._id]: i })}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>🏠</div>
                )}

                {/* Content */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{property.title}</h3>
                  <p style={styles.location}>📍 {property.county}{property.area ? ` · ${property.area}` : ""}</p>

                  {/* Price */}
                  <div style={styles.priceBox}>
                    <div>
                      <div style={styles.label}>Monthly Rent</div>
                      <div style={styles.price}>Ksh {Number(property.price).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={styles.label}>Deposit</div>
                      <div style={styles.deposit}>Ksh {property.deposit ? Number(property.deposit).toLocaleString() : "N/A"}</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={styles.metaRow}>
                    {property.type && <span className="dashboard-pill">{property.type}</span>}
                    {property.bedrooms && <span className="dashboard-pill">🛏 {property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}</span>}
                  </div>

                  {/* Description */}
                  {property.description && <p style={styles.description}>{property.description}</p>}

                  {/* Phone */}
                  <div style={styles.phoneRow}>
                    <span>📞</span>
                    <span style={styles.phone}>{property.phone}</span>
                  </div>

                  {/* Amenities */}
                  {property.amenities?.length > 0 && (
                    <p style={styles.amenities}>🏡 {property.amenities.join(", ")}</p>
                  )}

                  {/* ✅ BOOKING INFO - Show for Pending & Booked */}
                  {activeTab === "pending" && property.bookingRequests?.length > 0 && (
                    <div style={styles.bookingInfo}>
                      <div style={styles.pendingBadge}>⏳ {property.bookingRequests.length} Booking Request{property.bookingRequests.length > 1 ? "s" : ""}</div>
                      {property.bookingRequests.map((req, i) => (
                        req.status === "pending" && (
                          <div key={i} style={styles.bookingRequest}>
                            <p style={styles.tenantName}>👤 {req.tenantName}</p>
                            <p style={styles.tenantContact}>📞 {req.tenantPhone}</p>
                            <p style={styles.tenantContact}>📧 {req.tenantEmail}</p>
                            <p style={styles.moveInDate}>📅 Move-in: {new Date(req.preferredMoveInDate).toLocaleDateString()}</p>
                            {req.requestMessage && <p style={styles.message}>"{req.requestMessage}"</p>}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {activeTab === "booked" && property.currentBooking && (
                    <div style={styles.bookingInfo}>
                      <div style={styles.bookedBadge}>🔒 BOOKED</div>
                      <p style={styles.tenantName}>👤 {property.currentBooking.tenantName}</p>
                      <p style={styles.tenantContact}>📞 {property.currentBooking.tenantPhone}</p>
                      <p style={styles.tenantContact}>📧 {property.currentBooking.tenantEmail}</p>
                      <p style={styles.moveInDate}>📅 Move-in: {new Date(property.currentBooking.expectedMoveInDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.actionRow}>
                    {activeTab === "available" && (
                      <>
                        <button className="dashboard-delete-btn" onClick={() => handleDelete(property._id)}>
                          🗑 Delete
                        </button>
                      </>
                    )}

                    {activeTab === "pending" && property.bookingRequests?.length > 0 && (
                      <button 
                        className="dashboard-action-btn"
                        onClick={() => setSelectedBookingModal(property)}
                      >
                        👁 View Booking Requests
                      </button>
                    )}

                    {activeTab === "booked" && (
                      <button 
                        className="dashboard-unbook-btn"
                        onClick={() => handleMarkAvailable(property._id)}
                      >
                        🔓 Mark as Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ BOOKING DETAILS MODAL */}
      {selectedBookingModal && (
        <div style={styles.modalOverlay} onClick={() => setSelectedBookingModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedBookingModal(null)}>✕</button>

            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>📝 Booking Requests</h2>
              <p style={styles.modalSubtitle}>{selectedBookingModal.title}</p>

              {actionMessage && <div style={styles.successMessage}>{actionMessage}</div>}

              {selectedBookingModal.bookingRequests?.map((request, idx) => (
                request.status === "pending" && (
                  <div key={idx} style={styles.requestCard}>
                    <h3 style={styles.requestTitle}>Request from {request.tenantName}</h3>
                    
                    <div style={styles.requestDetails}>
                      <p><strong>📞 Phone:</strong> {request.tenantPhone}</p>
                      <p><strong>📧 Email:</strong> {request.tenantEmail}</p>
                      <p><strong>📅 Preferred Move-in:</strong> {new Date(request.preferredMoveInDate).toLocaleDateString()}</p>
                      <p><strong>📅 Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}</p>
                      {request.requestMessage && (
                        <p><strong>💬 Message:</strong> "{request.requestMessage}"</p>
                      )}
                    </div>

                    {/* Accept/Reject Actions */}
                    <div style={styles.requestActions}>
                      <button 
                        className="request-accept-btn"
                        onClick={() => handleAcceptBooking(selectedBookingModal._id, request._id)}
                      >
                        ✅ Accept Booking
                      </button>
                      
                      <div style={styles.rejectSection}>
                        <textarea
                          placeholder="Reason for rejection (optional)"
                          style={styles.rejectReason}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button 
                          className="request-reject-btn"
                          onClick={() => handleRejectBooking(selectedBookingModal._id, request._id)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Upload another property?</h2>
        <button className="dashboard-btn" onClick={() => navigate("/upload")}>
          ➕ New Property
        </button>
      </div>
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
    padding: "12px 16px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    marginBottom: "20px",
    fontSize: "14px",
  },

  successBanner: {
    padding: "12px 16px",
    borderRadius: "10px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.3)",
    color: "#86efac",
    marginBottom: "20px",
    fontSize: "14px",
  },

  tabBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "28px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    overflowX: "auto",
  },

  loading: { textAlign: "center", padding: "60px 20px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  imageWrap: { position: "relative" },
  image: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px 12px 0 0", display: "block" },
  imagePlaceholder: {
    width: "100%", height: "160px", background: "rgba(59,130,246,0.07)",
    borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "48px"
  },

  galleryControls: {
    position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "999px",
  },

  imageCounter: { color: "#fff", fontSize: "12px", fontWeight: 600 },

  thumbnails: {
    display: "flex", gap: "4px", padding: "6px",
    background: "rgba(0,0,0,0.3)", borderRadius: "0 0 12px 12px",
    overflowX: "auto",
  },

  thumbnail: {
    width: "50px", height: "50px", objectFit: "cover",
    borderRadius: "4px", cursor: "pointer", flexShrink: 0,
  },

  cardBody: { padding: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" },
  location: { fontSize: "13px", color: "#60a5fa", margin: "0 0 12px" },

  priceBox: {
    display: "flex", justifyContent: "space-between",
    background: "rgba(59,130,246,0.07)", borderRadius: "10px",
    padding: "10px 14px", marginBottom: "12px",
  },
  label: { fontSize: "11px", color: "#64748b", marginBottom: "2px", textTransform: "uppercase" },
  price: { fontSize: "16px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "14px", fontWeight: 700, color: "#94a3b8" },

  metaRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },

  description: {
    fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 10px",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },

  phoneRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" },
  phone: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0" },

  amenities: { fontSize: "12px", color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 },

  // ✅ Booking info
  bookingInfo: { 
    background: "rgba(255,255,255,0.04)", 
    borderRadius: "10px", 
    padding: "12px", 
    marginBottom: "12px",
    border: "1px solid rgba(255,255,255,0.08)"
  },
  pendingBadge: { fontSize: "12px", color: "#f59e0b", fontWeight: 700, marginBottom: "8px" },
  bookedBadge: { fontSize: "12px", color: "#22c55e", fontWeight: 700, marginBottom: "8px" },
  bookingRequest: { background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px", marginTop: "8px" },
  tenantName: { fontSize: "13px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px" },
  tenantContact: { fontSize: "12px", color: "#cbd5e1", margin: "0 0 2px" },
  moveInDate: { fontSize: "12px", color: "#60a5fa", margin: "4px 0 0", fontWeight: 600 },
  message: { fontSize: "12px", color: "#94a3b8", margin: "6px 0 0", fontStyle: "italic" },

  actionRow: { display: "flex", gap: "8px" },

  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: "52px", marginBottom: "12px" },
  emptyTitle: { fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" },
  emptyText: { color: "#64748b", marginBottom: "24px" },

  cta: {
    textAlign: "center", padding: "40px",
    background: "linear-gradient(160deg,#0c1d42,#060e1c)",
    borderRadius: "16px", border: "1px solid rgba(59,130,246,0.15)",
  },
  ctaTitle: { fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 16px" },

  // ✅ MODAL
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "rgba(13,27,50,0.95)", borderRadius: "20px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto", border: "1px solid rgba(59,130,246,0.2)" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", zIndex: 10 },
  modalContent: { padding: "40px" },
  modalTitle: { fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px" },
  modalSubtitle: { fontSize: "14px", color: "#60a5fa", margin: "0 0 20px" },
  successMessage: { padding: "12px 16px", borderRadius: "10px", background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.35)", marginBottom: "20px", fontSize: "14px" },
  requestCard: { background: "rgba(255,255,255,0.04)", padding: "20px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.08)" },
  requestTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 12px" },
  requestDetails: { marginBottom: "16px" },
  requestActions: { display: "flex", flexDirection: "column", gap: "12px" },
  rejectSection: { display: "flex", flexDirection: "column", gap: "8px" },
  rejectReason: { padding: "10px 12px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", fontFamily: "inherit", minHeight: "70px", resize: "vertical" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .dashboard-tab {
    padding: 12px 20px; border: none; background: none;
    color: #94a3b8; fontSize: 14px; fontWeight: 600;
    cursor: pointer; fontFamily: inherit; borderBottom: 2px solid transparent;
    transition: all .2s; whiteSpace: nowrap;
  }
  .dashboard-tab.active { color: #60a5fa; borderBottom: 2px solid #60a5fa; }
  .dashboard-tab:hover { color: #e2e8f0; }

  .dashboard-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: fadeUp .4s ease both;
  }
  .dashboard-card:hover {
    transform: translateY(-4px); border-color: rgba(59,130,246,0.35);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  }

  .dashboard-pill {
    display: inline-block; fontSize: 11px; padding: 3px 10px;
    border-radius: 999px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08); color: #94a3b8;
  }

  .dashboard-delete-btn {
    flex: 1; padding: 10px; border-radius: 10px; fontSize: 13px;
    border: 1px solid rgba(239,68,68,0.35); color: #fca5a5;
    background: rgba(239,68,68,0.08); cursor: pointer; fontFamily: inherit;
    fontWeight: 600; transition: background .2s;
  }
  .dashboard-delete-btn:hover { background: rgba(239,68,68,0.18); }

  .dashboard-action-btn {
    flex: 1; padding: 10px; border-radius: 10px; fontSize: 13px;
    border: 1px solid rgba(59,130,246,0.35); color: #60a5fa;
    background: rgba(59,130,246,0.08); cursor: pointer; fontFamily: inherit;
    fontWeight: 600; transition: background .2s;
  }
  .dashboard-action-btn:hover { background: rgba(59,130,246,0.18); }

  .dashboard-unbook-btn {
    flex: 1; padding: 10px; border-radius: 10px; fontSize: 13px;
    border: 1px solid rgba(34,197,94,0.35); color: #86efac;
    background: rgba(34,197,94,0.08); cursor: pointer; fontFamily: inherit;
    fontWeight: 600; transition: background .2s;
  }
  .dashboard-unbook-btn:hover { background: rgba(34,197,94,0.18); }

  .dashboard-btn {
    padding: 12px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white;
    fontSize: 14px; fontWeight: 700; cursor: pointer; fontFamily: inherit;
    boxShadow: 0 4px 20px rgba(59,130,246,0.35); transition: transform .15s;
  }
  .dashboard-btn:hover { transform: translateY(-2px); }

  .gallery-btn {
    background: rgba(255,255,255,0.1); border: none; color: white;
    padding: 4px 8px; borderRadius: 4px; cursor: pointer; fontWeight: 600;
    fontFamily: inherit; transition: background .2s;
  }
  .gallery-btn:hover { background: rgba(255,255,255,0.2); }

  .dashboard-spinner {
    width: 36px; height: 36px; borderRadius: 50%;
    border: 3px solid rgba(59,130,246,0.15); borderTopColor: #3b82f6;
    animation: spin .8s linear infinite; margin: 0 auto;
  }

  .request-accept-btn {
    padding: 12px; background: linear-gradient(135deg,#16a34a,#22c55e); color: white;
    border: none; borderRadius: 8px; fontSize: 14px; fontWeight: 700;
    cursor: pointer; fontFamily: inherit; transition: transform .2s;
  }
  .request-accept-btn:hover { transform: translateY(-2px); }

  .request-reject-btn {
    padding: 10px; background: rgba(239,68,68,0.15); color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.35); borderRadius: 8px; fontSize: 14px;
    fontWeight: 700; cursor: pointer; fontFamily: inherit; transition: background .2s; width: 100%;
  }
  .request-reject-btn:hover { background: rgba(239,68,68,0.25); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;