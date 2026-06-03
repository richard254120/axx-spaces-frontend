import { useState, useEffect } from "react";
import { API_BASE } from "../utils/constants";

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "4px", cursor: readOnly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: readOnly ? "1.2rem" : "1.6rem",
            color: star <= (hovered || value) ? "#fbbf24" : "#475569",
            transition: "color 0.2s",
          }}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function ReviewsSection({ propertyId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  // Fetch Reviews
  const fetchReviews = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Please enter your name");
    if (form.rating === 0) return setError("Please give a rating");
    if (!form.comment.trim()) return setError("Please write a comment");

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          rating: form.rating,
          comment: form.comment.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      setSuccess("✅ Thank you! Your review has been submitted.");
      setForm({ name: "", rating: 0, comment: "" });
      await fetchReviews(); // Refresh list

    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>⭐ Reviews & Ratings</h3>

      {/* Average Rating */}
      {reviews.length > 0 && (
        <div style={styles.avgContainer}>
          <span style={styles.avgNumber}>{avgRating}</span>
          <StarRating value={Math.round(parseFloat(avgRating))} readOnly />
          <span style={styles.reviewCount}>
            ({reviews.length} review{reviews.length > 1 ? "s" : ""})
          </span>
        </div>
      )}

      {/* Reviews List */}
      <div style={styles.reviewsList}>
        {loading ? (
          <p style={styles.loading}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.avatar}>
                  {(review.name || "U")[0].toUpperCase()}
                </div>
                <div style={styles.reviewerInfo}>
                  <p style={styles.reviewerName}>{review.name}</p>
                  <StarRating value={review.rating} readOnly />
                </div>
                <span style={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString("en-KE")}
                </span>
              </div>
              <p style={styles.comment}>{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Review Form */}
      <div style={styles.formContainer}>
        <h4 style={styles.formTitle}>Write a Review</h4>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={styles.input}
        />

        <div style={styles.ratingGroup}>
          <span style={styles.label}>Your Rating:</span>
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm({ ...form, rating })}
          />
        </div>

        <textarea
          placeholder="Share your experience with this property..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={4}
          style={styles.textarea}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name || form.rating === 0 || !form.comment}
          style={styles.submitButton}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  container: {
    marginTop: "40px",
    padding: "24px",
    background: "#0f172a",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  heading: { color: "#fbbf24", marginBottom: "20px", fontSize: "1.3rem" },
  avgContainer: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  avgNumber: { fontSize: "2.8rem", fontWeight: 800, color: "#fbbf24" },
  reviewCount: { color: "#94a3b8", fontSize: "0.9rem" },
  reviewsList: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" },
  reviewCard: {
    background: "#1e2937",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #334155",
  },
  reviewHeader: { display: "flex", gap: "12px", marginBottom: "10px" },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#8b5cf6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  reviewerName: { margin: 0, fontWeight: 600, color: "#e2e8f0" },
  date: { marginLeft: "auto", color: "#64748b", fontSize: "0.8rem" },
  comment: { margin: 0, color: "#cbd5e1", lineHeight: 1.6 },

  formContainer: {
    background: "#1e2937",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #475569",
  },
  formTitle: { color: "#c4b5fd", marginBottom: "16px" },
  error: { color: "#fca5a5", background: "#7f1d1d", padding: "10px", borderRadius: "6px", marginBottom: "12px" },
  success: { color: "#86efac", background: "#14532d", padding: "10px", borderRadius: "6px", marginBottom: "12px" },
  input: {
    width: "100%",
    padding: "12px",
    background: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "#f1f5f9",
    marginBottom: "12px",
  },
  ratingGroup: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  label: { color: "#94a3b8", minWidth: "90px" },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "#f1f5f9",
    minHeight: "100px",
    marginBottom: "16px",
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export { StarRating };