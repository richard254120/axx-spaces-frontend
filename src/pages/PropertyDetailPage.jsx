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

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    moveInDate: "",
    message: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE}/properties/${id}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleWhatsApp = () => {
    if (!property) return;
    const phone = formatKenyaPhone(property.landlordPhone);
    const msg = `Hi, I'm interested in your property "${property.title}" on Axxspace. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    if (!property) return;
    window.open(`tel:${property.landlordPhone}`, "_blank");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          ...bookingData,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");
      setBookingSuccess("✅ Booking request sent successfully!");
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingData({ name: "", phone: "", moveInDate: "", message: "" });
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
        <div style={{ fontSize: "18px", color: "#64748b" }}>Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Navbar />
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
        <h2 style={{ color: "#ef4444", margin: "0 0 8px" }}>Property Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>{error || "This property doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate("/listings")}
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
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "60px" }}>
        {/* Image Gallery */}
        <div style={{ position: "relative", height: "300px", background: "#e2e8f0" }}>
          {property.images?.length > 0 ? (
            <>
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + property.images.length) % property.images.length)}
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
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % property.images.length)}
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
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
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
                  {property.propertyType || "Rental"}
                </span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", lineHeight: "1.3" }}>{property.title}</h1>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                📍 {property.location}, {property.county}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}>🛏️</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.bedrooms} Bedrooms</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}>🚿</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.bathrooms} Bathrooms</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}>📐</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Description</h2>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7" }}>{property.description || "No description provided."}</p>
              </div>

              {property.amenities?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Amenities</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {property.amenities.map((amenity, idx) => (
                      <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.houseRules && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>House Rules</h2>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7" }}>{property.houseRules}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "sticky", top: "80px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#1e293b" }}>KES {property.price?.toLocaleString()}</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>per month</div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>Availability</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: property.availableUnits > 0 ? "#22c55e" : "#ef4444" }}>
                    {property.availableUnits > 0 ? `${property.availableUnits} units available` : "Fully Booked"}
                  </div>
                </div>

                {property.availableUnits > 0 && (
                  <>
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
                      Call Landlord
                    </button>
                  </>
                )}
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
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "20px" }}>Book This Property</h2>
            {bookingSuccess && <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{bookingSuccess}</div>}
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Move-in Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.moveInDate}
                  onChange={(e) => setBookingData({ ...bookingData, moveInDate: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>Message</label>
                <textarea
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", minHeight: "80px" }}
                  placeholder="Any additional information..."
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
                  {bookingLoading ? "Sending..." : "Submit Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
