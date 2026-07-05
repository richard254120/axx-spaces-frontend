import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

export default function MoverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [mover, setMover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerPhone: "",
    serviceType: "",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledDate: "",
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    const fetchMover = async () => {
      try {
        const response = await fetch(`${API_BASE}/movers/${id}`);
        if (!response.ok) throw new Error("Mover not found");
        const data = await response.json();
        setMover(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMover();
  }, [id]);

  const handleWhatsApp = () => {
    if (!mover) return;
    const phone = formatKenyaPhone(mover.phone);
    const msg = `Hi ${mover.name}, I'm interested in your moving services on Axxspace. Can you help me with a move?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    if (!mover) return;
    window.open(`tel:${mover.phone}`, "_blank");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const response = await fetch(`${API_BASE}/movers/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moverId: id,
          ...bookingData,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");
      setBookingSuccess("✅ Booking request sent successfully!");
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingData({
          customerName: "",
          customerPhone: "",
          serviceType: "",
          pickupLocation: "",
          dropoffLocation: "",
          scheduledDate: "",
          notes: "",
        });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Navbar />
        <div style={{ fontSize: "18px", color: "#64748b" }}>Loading mover details...</div>
      </div>
    );
  }

  if (error || !mover) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Navbar />
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
        <h2 style={{ color: "#ef4444", margin: "0 0 8px" }}>Mover Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>{error || "This mover doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate("/movers")}
          style={{
            padding: "12px 28px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Browse Movers
        </button>
      </div>
    );
  }

  const images = mover.portfolioImages || mover.workPhotos || [];

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "60px" }}>
        {/* Image Gallery */}
        <div style={{ position: "relative", height: "300px", background: "#e2e8f0" }}>
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${mover.name} - Work Photo`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    ❯
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              {mover.isFeatured && (
                <div style={{
                  position: "absolute",
                  top: "15px",
                  left: "15px",
                  background: "#fbbf24",
                  color: "#0f1729",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  ⭐ Featured
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "18px" }}>
              No Photos
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            {/* Main Content */}
            <div>
              <div style={{ marginBottom: "16px" }}>
                <span style={{ background: "#3b82f6", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                  Moving Service
                </span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", lineHeight: "1.3" }}>{mover.name}</h1>
              {mover.company && <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "6px" }}>🏢 {mover.company}</p>}
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                📍 {mover.county}
              </p>

              {/* Key Features */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
                <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                  🚚 {mover.vehicleType || "Various"}
                </span>
                <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                  ⭐ {mover.experienceYears || 0} years exp
                </span>
                {mover.teamInfo?.teamSize && (
                  <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                    👥 {mover.teamInfo.teamSize} team
                  </span>
                )}
                {mover.responseTime && (
                  <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                    ⚡ {mover.responseTime}
                  </span>
                )}
              </div>

              {/* Safety & Professionalism */}
              {(mover.insurance?.hasInsurance || mover.uniform || mover.safetyGear) && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Safety & Professionalism</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {mover.insurance?.hasInsurance && (
                      <span style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                        🛡️ Insured
                      </span>
                    )}
                    {mover.uniform && (
                      <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        👔 Uniform
                      </span>
                    )}
                    {mover.safetyGear && (
                      <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        ⛑️ Safety Gear
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {mover.specialties && mover.specialties.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Specialties</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {mover.specialties.map((specialty, idx) => (
                      <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        ⭐ {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {mover.services && mover.services.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Services Offered</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {mover.services.map((service, idx) => (
                      <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {mover.languages && mover.languages.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Languages</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {mover.languages.map((lang, idx) => (
                      <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        🌐 {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {mover.workHours && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Working Hours</h2>
                  <p style={{ fontSize: "14px", color: "#475569" }}>⏰ {mover.workHours}</p>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>About</h2>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7" }}>{mover.description || "No description provided."}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "sticky", top: "80px" }}>
                <div style={{ marginBottom: "16px" }}>
                  {mover.pricing?.baseRate ? (
                    <>
                      <div style={{ fontSize: "28px", fontWeight: 700, color: "#1e293b" }}>KES {mover.pricing.baseRate.toLocaleString()}</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {typeof mover.pricing.rateType === 'string' ? `/ ${mover.pricing.rateType.replace('_', ' ')}` : ''}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>Contact for pricing</div>
                  )}
                </div>

                <div style={{ marginBottom: "16px", padding: "14px", background: "#f1f5f9", borderRadius: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>Rating</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>⭐ {mover.rating || 4.5}</div>
                  {mover.reviewCount && <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{mover.reviewCount} reviews</div>}
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  Book Now
                </button>
                <button
                  onClick={handleWhatsApp}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#25d366",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleCall}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#f1f5f9",
                    color: "#1e293b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Call Mover
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingWhatsApp />

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "20px" }}>Book {mover.name}</h2>
            {bookingSuccess && <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{bookingSuccess}</div>}
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Your Name</label>
                <input
                  type="text"
                  required
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={bookingData.customerPhone}
                  onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Service Type</label>
                <select
                  required
                  value={bookingData.serviceType}
                  onChange={(e) => setBookingData({ ...bookingData, serviceType: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">Select service</option>
                  {(mover.services || ["House Moving", "Office Moving", "Furniture Moving"]).map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Pickup Location</label>
                <input
                  type="text"
                  required
                  value={bookingData.pickupLocation}
                  onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                  placeholder="e.g. Kilimani, Wood Avenue"
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Destination</label>
                <input
                  type="text"
                  required
                  value={bookingData.dropoffLocation}
                  onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                  placeholder="e.g. Syokimau, Community Road"
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Preferred Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.scheduledDate}
                  onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Additional Notes</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", minHeight: "80px" }}
                  placeholder="Special items, fragile goods, access notes..."
                />
              </div>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  style={{ padding: "12px", background: "#f1f5f9", color: "#1e293b", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  style={{ padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: bookingLoading ? "not-allowed" : "pointer" }}
                >
                  {bookingLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
