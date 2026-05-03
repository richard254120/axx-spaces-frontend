import { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Listings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    preferredMoveInDate: '',
    requestMessage: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get("county")) params.append("county", searchParams.get("county"));
      if (searchParams.get("area")) params.append("area", searchParams.get("area"));
      if (searchParams.get("type")) params.append("type", searchParams.get("type"));
      if (searchParams.get("price")) params.append("price", searchParams.get("price"));
      if (searchParams.get("bedrooms")) params.append("bedrooms", searchParams.get("bedrooms"));

      const res = await API.get(`/properties/approved?${params.toString()}`);
      setProperties(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyImages = (property) => {
    if (!property) return [];
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    if (property.image) return [property.image];
    return [];
  };

  const formatPhone = (phone) => {
    let num = phone.trim();
    if (num.startsWith("0")) num = num.substring(1);
    if (!num.startsWith("254")) num = "254" + num;
    return num;
  };

  const getWhatsAppMessage = (property) => {
    return encodeURIComponent(
      `Hello,\n\n` +
      `I'm interested in this property:\n\n` +
      `🏠 ${property.title}\n` +
      `📍 ${property.county}${property.area ? `, ${property.area}` : ''}\n` +
      `💰 Rent: Ksh ${Number(property.price).toLocaleString()}\n` +
      `${property.deposit ? `🔒 Deposit: Ksh ${Number(property.deposit).toLocaleString()}\n` : ''}` +
      `${property.type ? `🏡 Type: ${property.type}\n` : ''}` +
      `${property.bedrooms ? `🛏 Bedrooms: ${property.bedrooms}\n` : ''}` +
      `${property.bathrooms ? `🚿 Bathrooms: ${property.bathrooms}\n` : ''}` +
      `${property.description ? `\n📝 ${property.description}\n` : ''}` +
      `\nKindly send more details. Thank you!`
    );
  };

  // ✅ NEW - Handle booking request submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please login to submit a booking request');
      navigate('/login');
      return;
    }

    if (!bookingForm.tenantName || !bookingForm.tenantPhone || !bookingForm.tenantEmail || !bookingForm.preferredMoveInDate) {
      setBookingMessage('❌ Please fill all required fields');
      return;
    }

    setSubmittingBooking(true);
    setBookingMessage('');

    try {
      const res = await API.post(`/properties/${selectedProperty._id}/request-booking`, bookingForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBookingMessage('✅ Booking request sent successfully! The landlord will review it shortly.');
      setBookingForm({
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        preferredMoveInDate: '',
        requestMessage: ''
      });

      setTimeout(() => {
        setShowBookingModal(false);
        setSelectedProperty(null);
        fetchListings();
      }, 2000);

    } catch (err) {
      console.error('❌ Booking error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to submit booking request';
      setBookingMessage('❌ ' + errorMsg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{css}</style>
        <div style={styles.spinner} />
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🏠 Available Listings</h1>
        <p style={styles.count}>{properties.length} properties found</p>
      </div>

      {properties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h2>No properties found</h2>
          <p>Try adjusting your filters</p>
          <button className="btn-primary" onClick={() => navigate("/listings")}>Clear Filters</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((property, idx) => {
            const images = getPropertyImages(property);
            const currentImageIndex = selectedImageIndex[property._id] || 0;
            const currentImage = images.length > 0 ? images[currentImageIndex] : null;

            // ✅ Get status badge
            const getStatusBadge = (bookingStatus) => {
              switch(bookingStatus) {
                case 'available':
                  return { text: '✅ Available', color: '#22c55e' };
                case 'pending_booking':
                  return { text: '⏳ Pending Booking', color: '#f59e0b' };
                case 'booked':
                  return { text: '🔒 Booked', color: '#ef4444' };
                default:
                  return { text: '✅ Available', color: '#22c55e' };
              }
            };

            const statusBadge = getStatusBadge(property.bookingStatus);

            return (
              <div key={property._id} className="card" style={{ animationDelay: `${idx * 60}ms` }}>
                {currentImage ? (
                  <div style={styles.imageContainer} onClick={() => setSelectedProperty(property)}>
                    <img src={currentImage} alt={property.title} style={styles.image} />
                    
                    {/* Status Badge */}
                    <div style={{...styles.statusBadge, background: statusBadge.color}}>
                      {statusBadge.text}
                    </div>

                    {images.length > 1 && (
                      <div style={styles.imageBadge}>
                        {currentImageIndex + 1}/{images.length}
                      </div>
                    )}

                    {images.length > 1 && (
                      <div style={styles.arrowsContainer}>
                        <button className="arrow-btn" onClick={(e) => { e.stopPropagation(); const cur = selectedImageIndex[property._id] || 0; setSelectedImageIndex({...selectedImageIndex, [property._id]: cur === 0 ? images.length-1 : cur-1}); }}>❮</button>
                        <button className="arrow-btn" onClick={(e) => { e.stopPropagation(); const cur = selectedImageIndex[property._id] || 0; setSelectedImageIndex({...selectedImageIndex, [property._id]: (cur + 1) % images.length}); }}>❯</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}

                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{property.title}</h3>
                  <p style={styles.location}>📍 {property.county}{property.area && ` · ${property.area}`}</p>

                  <div style={styles.priceBox}>
                    <div>
                      <div style={styles.label}>Monthly Rent</div>
                      <div style={styles.price}>Ksh {Number(property.price).toLocaleString()}</div>
                    </div>
                    {property.deposit && (
                      <div>
                        <div style={styles.label}>Deposit</div>
                        <div style={styles.deposit}>Ksh {Number(property.deposit).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  <div style={styles.features}>
                    {property.type && <span className="badge">{property.type}</span>}
                    {property.bedrooms && <span className="badge">🛏 {property.bedrooms} Bed</span>}
                    {property.bathrooms && <span className="badge">🚿 {property.bathrooms} Bath</span>}
                  </div>

                  {property.description && <p style={styles.description}>{property.description}</p>}
                  {property.amenities?.length > 0 && <p style={styles.amenities}>✨ {property.amenities.join(", ")}</p>}

                  <div style={styles.contactBox}>
                    <p style={styles.phone}>📞 {property.phone}</p>
                  </div>

                  {/* ✅ Actions - Show/Hide based on booking status */}
                  <div style={styles.actions}>
                    {property.bookingStatus === 'available' ? (
                      <>
                        <button 
                          className="btn-express-interest"
                          onClick={() => {
                            if (!token) {
                              alert('Please login to express interest');
                              navigate('/login');
                              return;
                            }
                            setSelectedProperty(property);
                            setShowBookingModal(true);
                          }}
                        >
                          💌 Express Interest
                        </button>
                        <a
                          href={`https://wa.me/${formatPhone(property.phone)}?text=${getWhatsAppMessage(property)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.btnWhatsapp}
                        >
                          💬 WhatsApp
                        </a>
                      </>
                    ) : (
                      <button style={styles.btnDisabled} disabled>
                        {property.bookingStatus === 'pending_booking' ? '⏳ Booking in Progress' : '🔒 Not Available'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ BOOKING REQUEST MODAL */}
      {showBookingModal && selectedProperty && (
        <div style={styles.modalOverlay} onClick={() => { setShowBookingModal(false); setSelectedProperty(null); }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => { setShowBookingModal(false); setSelectedProperty(null); }}>✕</button>
            
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>📝 Booking Request</h2>
              <p style={styles.modalSubtitle}>{selectedProperty.title}</p>

              {bookingMessage && (
                <div style={{
                  ...styles.message,
                  background: bookingMessage.startsWith('✅') ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: bookingMessage.startsWith('✅') ? '#86efac' : '#fca5a5',
                  border: bookingMessage.startsWith('✅') ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.35)'
                }}>
                  {bookingMessage}
                </div>
              )}

              <form onSubmit={handleSubmitBooking} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    style={styles.input}
                    value={bookingForm.tenantName}
                    onChange={(e) => setBookingForm({...bookingForm, tenantName: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0712345678"
                    style={styles.input}
                    value={bookingForm.tenantPhone}
                    onChange={(e) => setBookingForm({...bookingForm, tenantPhone: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    style={styles.input}
                    value={bookingForm.tenantEmail}
                    onChange={(e) => setBookingForm({...bookingForm, tenantEmail: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Preferred Move-in Date *</label>
                  <input
                    type="date"
                    required
                    style={styles.input}
                    value={bookingForm.preferredMoveInDate}
                    onChange={(e) => setBookingForm({...bookingForm, preferredMoveInDate: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message to Landlord</label>
                  <textarea
                    placeholder="Tell the landlord about yourself, your occupation, etc."
                    style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
                    value={bookingForm.requestMessage}
                    onChange={(e) => setBookingForm({...bookingForm, requestMessage: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={submittingBooking}
                >
                  {submittingBooking ? '⏳ Sending...' : '✅ Send Booking Request'}
                </button>
              </form>

              <p style={styles.hint}>The landlord will review your request and contact you within 24 hours.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "40px 20px 60px", maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" },
  count: { color: "#64748b", fontSize: "16px", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "60px" },
  imageContainer: { position: "relative", cursor: "pointer", overflow: "hidden", borderRadius: "14px 14px 0 0" },
  image: { width: "100%", height: "240px", objectFit: "cover" },
  noImage: { width: "100%", height: "160px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
  statusBadge: { position: "absolute", top: "12px", left: "12px", color: "#fff", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backdropFilter: "blur(6px)" },
  imageBadge: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 },
  arrowsContainer: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "12px", background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: "999px" },
  cardBody: { padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0 0 14px 14px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" },
  location: { fontSize: "14px", color: "#60a5fa", margin: "0 0 16px" },
  priceBox: { display: "flex", justifyContent: "space-between", background: "rgba(59,130,246,0.08)", padding: "14px", borderRadius: "10px", marginBottom: "14px" },
  label: { fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" },
  price: { fontSize: "18px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "16px", fontWeight: 700, color: "#94a3b8" },
  features: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" },
  description: { fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, margin: "14px 0" },
  amenities: { fontSize: "13px", color: "#94a3b8", margin: "14px 0" },
  contactBox: { background: "rgba(255,255,255,0.04)", padding: "12px", borderRadius: "8px", marginBottom: "14px" },
  phone: { margin: 0, fontSize: "14px", color: "#e2e8f0", fontWeight: 600 },
  actions: { display: "flex", gap: "10px", flexDirection: "column" },
  btnWhatsapp: { padding: "12px", background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: "8px", textAlign: "center", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" },
  btnDisabled: { padding: "12px", background: "rgba(100,116,139,0.2)", color: "#94a3b8", border: "none", borderRadius: "8px", textAlign: "center", fontSize: "14px", fontWeight: 700, cursor: "not-allowed", width: "100%" },
  emptyState: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "20px" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(59,130,246,0.2)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  // ✅ MODAL STYLES
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "rgba(13,27,50,0.95)", borderRadius: "20px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflow: "auto", border: "1px solid rgba(59,130,246,0.2)" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", zIndex: 10 },
  modalContent: { padding: "40px" },
  modalTitle: { fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px" },
  modalSubtitle: { fontSize: "14px", color: "#60a5fa", margin: "0 0 20px" },
  message: { padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  input: { padding: "12px 14px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", color: "#f1f5f9", fontSize: "14px", fontFamily: "inherit", outline: "none" },
  submitBtn: { padding: "14px 24px", background: "linear-gradient(135deg,#1d4ed8,#6d28d9)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(59,130,246,0.35)", transition: "all 0.2s" },
  hint: { fontSize: "13px", color: "#64748b", textAlign: "center", margin: 0 }
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    transition: all .2s;
    animation: fadeUp .4s ease both;
  }
  .card:hover { transform: translateY(-6px); border-color: rgba(59,130,246,0.35); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }

  .arrow-btn {
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .arrow-btn:hover { background: rgba(255,255,255,0.2); }

  .badge {
    background: rgba(59,130,246,0.15);
    border: 1px solid rgba(59,130,246,0.3);
    color: #60a5fa;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  .btn-express-interest {
    padding: 12px;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    borderRadius: 8px;
    fontSize: 14px;
    fontWeight: 700;
    cursor: pointer;
    fontFamily: inherit;
    transition: all 0.2s;
  }
  .btn-express-interest:hover { transform: translateY(-2px); }

  .btn-primary { padding: 12px 24px; background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white; border: none; borderRadius: 10px; fontSize: 14px; fontWeight: 700; cursor: pointer; fontFamily: inherit; }
  .btn-primary:hover { transform: translateY(-2px); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;