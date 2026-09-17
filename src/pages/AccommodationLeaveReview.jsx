import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationLeaveReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const accommodationId = searchParams.get("accommodationId");

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/user-login");
      return;
    }

    if (!accommodationId) {
      setError("Accommodation ID is required");
      setLoading(false);
      return;
    }

    fetchAccommodation();
  }, [user, accommodationId]);

  const fetchAccommodation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/accommodations/${accommodationId}`);
      setAccommodation(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accommodation:", err);
      setError("Failed to load accommodation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.comment.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/accommodation-reviews`,
        {
          accommodationId,
          rating: formData.rating,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/my-bookings");
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.error || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading...</div>
      </div>
    );
  }

  if (error && !accommodation) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>
            {error}
          </h3>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", background: "white", borderRadius: "16px", padding: "48px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#065f46", marginBottom: "8px" }}>
            Review Submitted!
          </h2>
          <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>
            Thank you for sharing your experience.
          </p>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "white", marginBottom: "8px" }}>
            Leave a Review
          </h1>
          <p style={{ fontSize: "16px", color: "#d1fae5" }}>
            Share your experience at {accommodation?.name || "this accommodation"}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 20px" }}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "24px", color: "#991b1b" }}>
            {error}
          </div>
        )}

        <div style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e5e7eb" }}>
          {/* Accommodation Info */}
          {accommodation && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
              {accommodation.images && accommodation.images.length > 0 ? (
                <img
                  src={accommodation.images[0].imageUrl}
                  alt={accommodation.name}
                  style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "8px" }}
                />
              ) : (
                <div style={{ width: "100px", height: "75px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                  🏨
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", marginBottom: "4px" }}>
                  {accommodation.name}
                </h3>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  {accommodation.address}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "12px", display: "block" }}>
                Overall Rating *
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    style={{
                      fontSize: "40px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: star <= formData.rating ? "#fbbf24" : "#d1d5db",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
                {formData.rating} out of 5 stars
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Review Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summarize your experience (e.g., 'Great stay, excellent location')"
                maxLength={100}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  background: "#f9fafb",
                  color: "#374151",
                  transition: "all 0.2s",
                }}
              />
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Tell us about your stay - the room, amenities, cleanliness, host, location, etc."
                rows={6}
                maxLength={1000}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  background: "#f9fafb",
                  color: "#374151",
                  transition: "all 0.2s",
                  resize: "vertical",
                }}
              />
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                {formData.comment.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                style={{
                  padding: "14px 28px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "14px 28px",
                  background: submitting ? "#9ca3af" : "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>

        {/* Review Guidelines */}
        <div style={{ marginTop: "24px", background: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" }}>
          <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#065f46", marginBottom: "12px" }}>
            Review Guidelines
          </h4>
          <ul style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.8, paddingLeft: "20px", margin: 0 }}>
            <li>Be honest and accurate in your review</li>
            <li>Focus on your actual experience at the accommodation</li>
            <li>Avoid offensive language or personal attacks</li>
            <li>You can only review accommodations after completing a booking</li>
            <li>Reviews help other guests make informed decisions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
