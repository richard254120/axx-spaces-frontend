import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import { resolveMediaUrl } from "../utils/fileLinks";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

function formatVideoUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim().replace(/^http:\/\//i, "https://");
  if (cleanUrl.includes("cloudinary.com") && cleanUrl.includes("/video/upload/")) {
    cleanUrl = cleanUrl.replace(/\.(mov|quicktime|mkv|avi|webm|ogv|m4v)$/i, ".mp4");
    if (!/\.(mp4|webm)$/i.test(cleanUrl)) {
      cleanUrl = `${cleanUrl}.mp4`;
    }
  }
  if (!cleanUrl.startsWith("http")) {
    cleanUrl = resolveMediaUrl(cleanUrl);
  }
  return cleanUrl;
}

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

  // Waitlist state
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistData, setWaitlistData] = useState({
    name: "",
    email: "",
    phone: "",
    moveInDate: "Immediately",
    leaseDuration: "1 Year+",
    occupants: "1 Person",
    message: "",
  });
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState("");
  const [waitlistError, setWaitlistError] = useState("");

  const openWaitlist = () => {
    setWaitlistData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      moveInDate: "Immediately",
      leaseDuration: "1 Year+",
      occupants: "1 Person",
      message: "",
    });
    setWaitlistError("");
    setWaitlistSuccess("");
    setShowWaitlistModal(true);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE}/properties/${id}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data);

        // Check if user landed from a physical QR code poster scan
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("ref") === "qr") {
          const source = searchParams.get("source") || "generic";
          logQRScan(source);
        }
        // Record a view
        try {
          await fetch(`${API_BASE}/properties/${id}/view`, { method: "PATCH" });
        } catch (viewErr) {
          console.error("Failed to record view:", viewErr);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const logQRScan = async (source) => {
      try {
        const response = await fetch(`${API_BASE}/properties/${id}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            userAgent: navigator.userAgent,
          }),
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.scanId) {
            sessionStorage.setItem(`axx_qr_scan_id_${id}`, resData.scanId);
          }
        }
      } catch (err) {
        console.error("Failed to log QR scan:", err);
      }
    };

    fetchProperty();
  }, [id]);

  const recordQRConversion = async (inquiryType) => {
    const scanId = sessionStorage.getItem(`axx_qr_scan_id_${id}`);
    if (!scanId) return;

    try {
      await fetch(`${API_BASE}/properties/${id}/scan/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, inquiryType }),
      });
    } catch (err) {
      console.error("Failed to record QR conversion:", err);
    }
  };

  const handleWhatsApp = () => {
    if (!property) return;
    recordQRConversion("whatsapp");
    const phone = formatKenyaPhone(property.landlordPhone);
    const msg = `Hi, I'm interested in your property "${property.title}" on Axxspace. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    if (!property) return;
    recordQRConversion("call");
    window.open(`tel:${property.landlordPhone}`, "_blank");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      // 1. Record QR conversion to booking
      recordQRConversion("booking");

      // 2. Try to post to DB if logged in (optional, don't crash on failure)
      if (token) {
        try {
          await fetch(`${API_BASE}/bookings`, {
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
        } catch (dbErr) {
          console.error("Optional booking database save failed:", dbErr);
        }
      }

      // 3. Construct WhatsApp message and open link
      const phone = formatKenyaPhone(property.landlordPhone);
      const msg = `Hi, my name is ${bookingData.name} (Phone: ${bookingData.phone}). I would like to book your property "${property.title}" on Axxspace.\n\n` +
        ` Proposed Move-in Date: ${bookingData.moveInDate}\n` +
        ` Message: ${bookingData.message || "No additional message"}`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");

      setBookingSuccess(" Booking prepared! Redirecting to WhatsApp...");
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingData({ name: "", phone: "", moveInDate: "", message: "" });
      }, 2000);
    } catch (err) {
      alert("Redirect to WhatsApp failed: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setWaitlistError("");
    setWaitlistSuccess("");
    try {
      const response = await fetch(`${API_BASE}/waitlist/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waitlistData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to join waitlist");
      setWaitlistSuccess(data.message || "You have been added to the waitlist!");
      setTimeout(() => {
        setShowWaitlistModal(false);
        setWaitlistData({ name: "", email: "", phone: "", message: "" });
        setWaitlistSuccess("");
      }, 3000);
    } catch (err) {
      setWaitlistError(err.message);
    } finally {
      setWaitlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ fontSize: "18px", color: "#64748b" }}>Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}></div>
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
      <style>{`
        .property-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .property-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
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
          <div className="property-detail-grid">
            {/* Main Content */}
            <div>
              <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#3b82f6", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                  {property.propertyType || "Rental"}
                </span>
                {property.videos && property.videos.length > 0 && (
                  <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    <span>Video Tour ({property.videos.length})</span>
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", lineHeight: "1.3" }}>{property.title}</h1>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{property.location}, {property.county}</span>
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}></span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.bedrooms} Bedrooms</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}></span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.bathrooms} Bathrooms</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "20px" }}></span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6" }}>{property.views || 0} Views</span>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Description</h2>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7" }}>{property.description || "No description provided."}</p>
              </div>

              {/* ── FULLY BOOKED BANNER — shown prominently in main content when no units ── */}
              {!(property.availableUnits > 0) && (
                <div style={{
                  background: "linear-gradient(135deg, #3b0764, #4c1d95)",
                  borderRadius: "14px",
                  padding: "24px",
                  marginBottom: "24px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "28px" }}>🔒</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "17px" }}>This property is fully booked</div>
                      <div style={{ fontSize: "13px", color: "#c4b5fd", marginTop: "2px" }}>All units are currently occupied</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "#ddd6fe", margin: 0, lineHeight: "1.6" }}>
                    Join the waitlist and the landlord will contact you directly when a unit becomes free.
                    Requests are handled first-come, first-served.
                  </p>
                  <button
                    onClick={openWaitlist}
                    style={{
                      background: "white",
                      color: "#6d28d9",
                      border: "none",
                      borderRadius: "10px",
                      padding: "13px 24px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Join the Waitlist
                  </button>
                </div>
              )}

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

              {property.videos && property.videos.length > 0 && (
                <div style={{ marginBottom: "28px", background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        <span>Virtual Video Walkthrough</span>
                      </h2>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                        Take a full video tour of this property before visiting or booking.
                      </p>
                    </div>
                    <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                      {property.videos.length} {property.videos.length === 1 ? "Video" : "Videos"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {property.videos.map((vid, idx) => {
                      const cleanVid = formatVideoUrl(vid);
                      return (
                        <div key={idx} style={{ borderRadius: "12px", overflow: "hidden", background: "#000", border: "1px solid #1e293b" }}>
                          <video
                            src={cleanVid}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "220px", objectFit: "contain", background: "#000" }}
                          >
                            Your browser does not support playing this video format directly.
                          </video>
                          <div style={{ padding: "10px 14px", background: "#0f172a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>Video Tour #{idx + 1}</span>
                            <a
                              href={cleanVid}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#38bdf8", fontSize: "12px", textDecoration: "none", fontWeight: 700 }}
                            >
                              Fullscreen ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}
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
                    {property.availableUnits > 0 ? "Available" : "Fully Booked"}
                  </div>
                </div>

                {property.availableUnits > 0 ? (
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
                ) : (
                  <>
                    {/* FULLY BOOKED — show waitlist CTA */}
                    <div style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>🔒</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>Fully Booked</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>All units are currently occupied</div>
                    </div>
                    <button
                      id="join-waitlist-btn"
                      onClick={openWaitlist}
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Join Waitlist
                    </button>
                    <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", margin: "0", lineHeight: "1.5" }}>
                      Be the first to know when a unit becomes available. The landlord will contact you directly.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ASSIGNED AGENT */}
          {property.assignedAgent && (
            <AgentCard agent={property.assignedAgent} />
          )}
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

      {/* ── WAITLIST MODAL ─────────────────────────────────────────────── */}
      {showWaitlistModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px 26px", maxWidth: "520px", width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3)", border: "1px solid #e2e8f0", boxSizing: "border-box" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", flexShrink: 0, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}>
                  📋
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>Priority Waitlist</h2>
                    <span style={{ fontSize: "10px", fontWeight: 700, background: "#ecfdf5", color: "#047857", padding: "2px 7px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>Active Queue</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                    {property.title} · <span style={{ color: "#059669", fontWeight: 600 }}>KES {property.price?.toLocaleString()}/mo</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowWaitlistModal(false); setWaitlistError(""); }}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", fontSize: "16px", transition: "all 0.15s" }}
              >
                ✕
              </button>
            </div>

            {/* Reassurance Banner */}
            <div style={{ padding: "11px 14px", background: "rgba(16, 185, 129, 0.08)", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)", marginBottom: "18px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "16px", marginTop: "1px" }}>⚡</span>
              <div style={{ fontSize: "12px", color: "#065f46", lineHeight: 1.5 }}>
                <strong>First-come, first-served queue.</strong> The landlord contacts waitlisted tenants via WhatsApp/Call the moment a vacancy opens up.
              </div>
            </div>

            {waitlistSuccess && (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "44px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>You're on the Waitlist!</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 }}>
                  {waitlistSuccess}
                </p>
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0", marginBottom: "20px", textAlign: "left", fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div><strong>Applicant:</strong> {waitlistData.name}</div>
                  <div><strong>Contact:</strong> {waitlistData.phone} ({waitlistData.email})</div>
                  <div><strong>Target Move-in:</strong> {waitlistData.moveInDate || "Immediately"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowWaitlistModal(false); setWaitlistSuccess(""); }}
                  style={{ width: "100%", padding: "12px", background: "#0f172a", color: "white", border: "none", borderRadius: "9px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
                >
                  Close
                </button>
              </div>
            )}

            {waitlistError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "11px 14px", borderRadius: "9px", marginBottom: "16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠️</span>
                <span>{waitlistError}</span>
              </div>
            )}

            {!waitlistSuccess && (
              <form onSubmit={handleWaitlistSubmit}>
                {/* Contact Information */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Brian Kamau"
                    value={waitlistData.name}
                    onChange={(e) => setWaitlistData({ ...waitlistData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 13px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "#0f172a" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Phone / WhatsApp *
                    </label>
                    <div style={{ display: "flex", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" }}>
                      <span style={{ padding: "10px 10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", fontWeight: 700, borderRight: "1px solid #cbd5e1" }}>🇰🇪 +254</span>
                      <input
                        type="tel"
                        required
                        placeholder="712345678"
                        value={waitlistData.phone}
                        onChange={(e) => setWaitlistData({ ...waitlistData, phone: e.target.value })}
                        style={{ width: "100%", padding: "10px 10px", border: "none", fontSize: "14px", outline: "none", color: "#0f172a" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. brian@gmail.com"
                      value={waitlistData.email}
                      onChange={(e) => setWaitlistData({ ...waitlistData, email: e.target.value })}
                      style={{ width: "100%", padding: "10px 13px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "#0f172a" }}
                    />
                  </div>
                </div>

                {/* Rental Preferences */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Target Move-in
                    </label>
                    <select
                      value={waitlistData.moveInDate}
                      onChange={(e) => setWaitlistData({ ...waitlistData, moveInDate: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "white", boxSizing: "border-box", color: "#0f172a", cursor: "pointer" }}
                    >
                      <option value="Immediately">Immediately</option>
                      <option value="Within 2 Weeks">Within 2 Weeks</option>
                      <option value="Next Month (1st)">Next Month (1st)</option>
                      <option value="Within 1-2 Months">Within 1–2 Months</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Lease Duration
                    </label>
                    <select
                      value={waitlistData.leaseDuration}
                      onChange={(e) => setWaitlistData({ ...waitlistData, leaseDuration: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "white", boxSizing: "border-box", color: "#0f172a", cursor: "pointer" }}
                    >
                      <option value="1 Year+">1 Year+ (Standard)</option>
                      <option value="6 Months">6 Months</option>
                      <option value="3-6 Months">3–6 Months</option>
                      <option value="Flexible">Flexible / Month-to-Month</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Number of Occupants
                  </label>
                  <select
                    value={waitlistData.occupants}
                    onChange={(e) => setWaitlistData({ ...waitlistData, occupants: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "white", boxSizing: "border-box", color: "#0f172a", cursor: "pointer" }}
                  >
                    <option value="1 Person">1 Person (Solo)</option>
                    <option value="2 People">2 People (Couple / Flatmates)</option>
                    <option value="Family / 3+ People">Family / 3+ People</option>
                  </select>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Special Requests / Notes <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={waitlistData.message}
                    onChange={(e) => setWaitlistData({ ...waitlistData, message: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box", outline: "none", color: "#0f172a" }}
                    placeholder="e.g., Preferred floor, car parking required, have pets, etc."
                  />
                </div>

                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🔒</span>
                  <span>Your details are kept strictly confidential and used only to notify you of openings.</span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => { setShowWaitlistModal(false); setWaitlistError(""); }}
                    style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "9px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    style={{
                      flex: 2,
                      padding: "12px 18px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "9px",
                      fontWeight: 700,
                      cursor: waitlistLoading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                      opacity: waitlistLoading ? 0.75 : 1,
                    }}
                  >
                    {waitlistLoading ? "Joining Priority Queue..." : "Join Priority Waitlist"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
