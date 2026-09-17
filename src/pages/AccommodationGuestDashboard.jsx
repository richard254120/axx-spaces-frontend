import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationGuestDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/user-login");
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/accommodation-bookings/my-bookings/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }

    try {
      setCancelling(true);
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/api/accommodation-bookings/${selectedBooking._id}/cancel`,
        { cancellationReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancellationReason("");
        fetchBookings();
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err.response?.data?.error || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      cancelled: "#ef4444",
      completed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      pending: "Payment Pending",
      paid: "Paid",
      failed: "Payment Failed",
      refunded: "Refunded",
    };
    return labels[status] || status;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "white", marginBottom: "8px" }}>
            My Bookings
          </h1>
          <p style={{ fontSize: "16px", color: "#d1fae5" }}>
            View and manage your accommodation bookings
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 20px" }}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "24px", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #e5e7eb", paddingBottom: "12px" }}>
          {["all", "pending", "confirmed", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid #059669" : "3px solid transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab ? 700 : 600,
                color: activeTab === tab ? "#059669" : "#6b7280",
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>No bookings found</h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
              {activeTab === "all" ? "You haven't made any bookings yet" : `No ${activeTab} bookings`}
            </p>
            <button
              onClick={() => navigate("/accommodation-booking-search")}
              style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Browse Accommodations
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {booking.accommodation?.primaryImage ? (
                      <img
                        src={booking.accommodation.primaryImage}
                        alt={booking.accommodation.name}
                        style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    ) : (
                      <div style={{ width: "120px", height: "90px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                        🏨
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", marginBottom: "8px" }}>
                        {booking.accommodation?.name || "Accommodation"}
                      </h3>
                      <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                        <div>
                          <span style={{ fontWeight: 700, color: "#374151" }}>Check-in:</span> {formatDate(booking.checkIn)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: "#374151" }}>Check-out:</span> {formatDate(booking.checkOut)}
                        </div>
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        {booking.roomType?.name} • {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? "s" : ""} • {calculateNights(booking.checkIn, booking.checkOut)} night{calculateNights(booking.checkIn, booking.checkOut) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669", marginBottom: "4px" }}>
                      KSh {booking.totalPrice.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {getPaymentStatusLabel(booking.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: getStatusColor(booking.status), fontWeight: 700, textTransform: "capitalize", padding: "4px 12px", background: "#f3f4f6", borderRadius: "20px" }}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Booked on {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        style={{ padding: "8px 16px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === "completed" && (
                      <button
                        onClick={() => navigate(`/leave-review?accommodationId=${booking.accommodation._id}`)}
                        style={{ padding: "8px 16px", background: "#059669", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Leave Review
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/accommodation-booking-detail/${booking.accommodation._id}`)}
                      style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", maxWidth: "500px", width: "90%" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#065f46", marginBottom: "16px" }}>
              Cancel Booking
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              Are you sure you want to cancel your booking at {selectedBooking.accommodation?.name}? This action cannot be undone.
            </p>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Cancellation Reason *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                placeholder="Please explain why you're cancelling this booking..."
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason("");
                }}
                disabled={cancelling}
                style={{ padding: "12px 24px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling || !cancellationReason.trim()}
                style={{ padding: "12px 24px", background: cancelling ? "#9ca3af" : "#ef4444", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: cancelling ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
