import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchAccommodation();
  }, [id]);

  const fetchAccommodation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/accommodations/${id}`);
      setAccommodation(response.data);

      // Set default room type
      if (response.data.roomTypes && response.data.roomTypes.length > 0) {
        setSelectedRoomType(response.data.roomTypes[0]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching accommodation:", err);
      setError("Failed to load accommodation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedRoomType || !checkIn || !checkOut) {
      setBookingError("Please select dates and room type");
      return;
    }

    try {
      setCheckingAvailability(true);
      setBookingError(null);

      const response = await axios.get(`${API_URL}/api/accommodation-bookings/check-availability`, {
        params: {
          roomTypeId: selectedRoomType._id,
          checkIn,
          checkOut,
          guests,
        },
      });

      if (response.data.available) {
        setAvailability(true);
        setPricing(response.data.pricing);
        setShowBookingForm(true);
      } else {
        setAvailability(false);
        setPricing(null);
        setBookingError(response.data.message || "Not available for selected dates");
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setBookingError("Failed to check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const createBooking = async () => {
    if (!user) {
      navigate("/user-login");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/accommodation-bookings`,
        {
          accommodationId: id,
          roomTypeId: selectedRoomType._id,
          checkIn,
          checkOut,
          numberOfGuests: guests,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        navigate("/my-bookings");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setBookingError(err.response?.data?.error || "Failed to create booking. Please try again.");
    }
  };

  const nextImage = () => {
    if (accommodation.images && accommodation.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % accommodation.images.length);
    }
  };

  const prevImage = () => {
    if (accommodation.images && accommodation.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + accommodation.images.length) % accommodation.images.length);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      hotel: "Hotel",
      bnb: "B&B",
      guesthouse: "Guesthouse",
      apartment: "Apartment",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading accommodation details...</div>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>
            {error || "Accommodation not found"}
          </h3>
          <button
            onClick={() => navigate("/accommodation-booking-search")}
            style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const currentImage = accommodation.images && accommodation.images.length > 0
    ? accommodation.images[currentImageIndex].imageUrl
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Image Gallery */}
      <div style={{ position: "relative", height: "500px", background: "#f3f4f6" }}>
        {currentImage ? (
          <img
            src={currentImage}
            alt={accommodation.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "80px" }}>
            🏨
          </div>
        )}

        {accommodation.images && accommodation.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "48px", height: "48px", cursor: "pointer", fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              ←
            </button>
            <button
              onClick={nextImage}
              style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "48px", height: "48px", cursor: "pointer", fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              →
            </button>
            <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
              {accommodation.images.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{ width: "10px", height: "10px", borderRadius: "50%", background: idx === currentImageIndex ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.3s" }}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/accommodation-booking-search")}
          style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px" }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#059669", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
                  {getTypeLabel(accommodation.type)}
                </span>
                <h1 style={{
                  fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "#065f46", marginTop: "8px", lineHeight: 1.2
                }}>
                  {accommodation.name}
                </h1>
              </div>
              {accommodation.isFeatured && (
                <div style={{ background: "#fbbf24", color: "#1f2937", fontSize: "12px", fontWeight: 800, padding: "6px 16px", borderRadius: "20px", textTransform: "uppercase" }}>
                  Featured
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {accommodation.address}
            </div>

            <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "#6b7280" }}>
              <div>
                <span style={{ fontWeight: 700, color: "#374151" }}>Check-in:</span> {accommodation.checkInTime}
              </div>
              <div>
                <span style={{ fontWeight: 700, color: "#374151" }}>Check-out:</span> {accommodation.checkOutTime}
              </div>
              <div>
                <span style={{ fontWeight: 700, color: "#374151" }}>Max guests:</span> {accommodation.maxGuests}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>About this property</h2>
            <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {accommodation.description}
            </p>
          </div>

          {/* Amenities */}
          {accommodation.amenities && accommodation.amenities.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>Amenities</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {accommodation.amenities.map((amenity, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4b5563" }}>
                    <span style={{ color: "#059669", fontSize: "18px" }}>✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          {accommodation.houseRules && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>House Rules</h2>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {accommodation.houseRules}
              </p>
            </div>
          )}

          {/* Room Types */}
          {accommodation.roomTypes && accommodation.roomTypes.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>Available Rooms</h2>
              <div style={{ display: "grid", gap: "16px" }}>
                {accommodation.roomTypes.map((roomType) => (
                  <div
                    key={roomType._id}
                    onClick={() => setSelectedRoomType(roomType)}
                    style={{
                      padding: "20px",
                      border: "2px solid",
                      borderColor: selectedRoomType?._id === roomType._id ? "#059669" : "#e5e7eb",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      background: selectedRoomType?._id === roomType._id ? "#f0fdf4" : "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", marginBottom: "4px" }}>
                          {roomType.name}
                        </h3>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          {roomType.capacity} guest{roomType.capacity !== 1 ? "s" : ""} • {roomType.quantity} available
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669" }}>
                          KSh {roomType.pricePerNight.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>per night</div>
                      </div>
                    </div>

                    {roomType.description && (
                      <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "12px", lineHeight: 1.6 }}>
                        {roomType.description}
                      </p>
                    )}

                    {roomType.amenities && roomType.amenities.length > 0 && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {roomType.amenities.slice(0, 4).map((amenity, idx) => (
                          <span key={idx} style={{ fontSize: "12px", background: "#f3f4f6", color: "#6b7280", padding: "4px 8px", borderRadius: "4px" }}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {accommodation.reviews && accommodation.reviews.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>
                Reviews ({accommodation.reviews.length})
              </h2>
              <div style={{ display: "grid", gap: "16px" }}>
                {accommodation.reviews.slice(0, 5).map((review) => (
                  <div key={review._id} style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 700, color: "#374151" }}>
                        {review.userName}
                      </div>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < review.rating ? "#fbbf24" : "#d1d5db", fontSize: "16px" }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6, marginBottom: "8px" }}>
                      {review.comment}
                    </p>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div style={{ width: "380px", flexShrink: 0 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb", position: "sticky", top: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", marginBottom: "20px" }}>Book Your Stay</h2>

            {/* Date Selection */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max={selectedRoomType?.capacity || accommodation.maxGuests}
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>

            {/* Selected Room Type */}
            {selectedRoomType && (
              <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "16px", marginBottom: "16px", border: "1px solid #d1fae5" }}>
                <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginBottom: "4px" }}>
                  Selected Room
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#065f46", marginBottom: "4px" }}>
                  {selectedRoomType.name}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  KSh {selectedRoomType.pricePerNight.toLocaleString()} / night
                </div>
              </div>
            )}

            {bookingError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#991b1b", fontSize: "14px" }}>
                {bookingError}
              </div>
            )}

            {!showBookingForm ? (
              <button
                onClick={checkAvailability}
                disabled={checkingAvailability || !selectedRoomType || !checkIn || !checkOut}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: checkingAvailability ? "#9ca3af" : "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: checkingAvailability ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.3s",
                }}
              >
                {checkingAvailability ? "Checking..." : "Check Availability"}
              </button>
            ) : (
              <>
                {/* Price Breakdown */}
                {pricing && (
                  <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "12px" }}>
                      Price Breakdown
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#4b5563" }}>
                      <span>KSh {pricing.basePrice.toLocaleString()} × {pricing.nights} nights</span>
                      <span>KSh {pricing.basePrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#4b5563" }}>
                      <span>Cleaning fee</span>
                      <span>KSh {pricing.cleaningFee.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#4b5563" }}>
                      <span>Service fee</span>
                      <span>KSh {pricing.serviceFee.toLocaleString()}</span>
                    </div>
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800, color: "#065f46" }}>
                      <span>Total</span>
                      <span>KSh {pricing.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={createBooking}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.3s",
                  }}
                >
                  {user ? "Proceed to Booking" : "Sign In to Book"}
                </button>

                <button
                  onClick={() => setShowBookingForm(false)}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: "transparent",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: "12px",
                  }}
                >
                  Change Dates
                </button>
              </>
            )}
          </div>
        </div>
      </div >
    </div >
  );
}
