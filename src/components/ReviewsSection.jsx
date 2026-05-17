import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px", cursor: readOnly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: readOnly ? "1rem" : "1.4rem",
            color: star <= (hovered || value) ? "#fbbf24" : "#475569",
            transition: "color 0.15s ease",
          }}
          onClick={() => !readOnly && onChange && onChange(star)}
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
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });

  const fetchReviews = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [propertyId]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.rating === 0) return setError("Please select a star rating.");
    if (!form.comment.trim()) return setError("Please write a comment.");
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSuccess("✅ Review submitted!");
      setForm({ name: "", rating: 0, comment: "" });
      fetchReviews();
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.sectionHead}>⭐ Reviews & Ratings</h3>
      {avgRating && (
        <div style={styles.summaryBar}>
          <span style={styles.avgScore}>{avgRating}</span>
          <div>
            <StarRating value={Math.round(avgRating)} readOnly />
            <span style={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
      {loading ? (
        <p style={styles.muted}>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p style={styles.muted}>No reviews yet — be the first! 🏠</p>
      ) : (
        <div style={styles.reviewList}>
          {reviews.map((review, idx) => (
            <div key={review._id || idx} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.avatar}>{(review.name || "A")[0].toUpperCase()}</div>
                <div>
                  <p style={styles.reviewerName}>{review.name || "Anonymous"}</p>
                  <StarRating value={review.rating} readOnly />
                </div>
                <span style={styles.reviewDate}>
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </span>
              </div>
              <p style={styles.reviewComment}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
      <div style={styles.formBox}>
        <h4 style={styles.formHead}>Leave a Review</h4>
        {error && <p style={styles.errorMsg}>{error}</p>}
        {success && <p style={styles.successMsg}>{success}</p>}
        <input type="text" placeholder="Your name" value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={styles.input} />
        <div style={styles.ratingRow}>
          <span style={styles.ratingLabel}>Your rating:</span>
          <StarRating value={form.rating} onChange={(val) => setForm((p) => ({ ...p, rating: val }))} />
        </div>
        <textarea placeholder="Share your experience…" value={form.comment}
          onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
          rows={3} style={styles.textarea} />
        <button onClick={handleSubmit} disabled={submitting}
          style={{ ...styles.submitBtn, ...(submitting ? styles.submitDisabled : {}) }}>
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginTop: "28px", paddingTop: "24px", borderTop: "1px solid #334155" },
  sectionHead: { margin: "0 0 16px 0", color: "#fbbf24", fontSize: "1.1rem" },
  summaryBar: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" },
  avgScore: { fontSize: "2.4rem", fontWeight: 700, color: "#fbbf24", lineHeight: 1 },
  reviewCount: { color: "#94a3b8", fontSize: "0.8rem", marginTop: "4px", display: "block" },
  muted: { color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 16px 0" },
  reviewList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" },
  reviewCard: { background: "rgba(30,41,59,0.7)", border: "1px solid #334155", borderRadius: "8px", padding: "14px 16px" },
  reviewHeader: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 },
  reviewerName: { margin: "0 0 4px 0", color: "#f1f5f9", fontWeight: 600, fontSize: "0.9rem" },
  reviewDate: { color: "#475569", fontSize: "0.78rem", marginLeft: "auto", flexShrink: 0, paddingTop: "2px" },
  reviewComment: { margin: 0, color: "#cbd5e1", fontSize: "0.88rem", lineHeight: "1.55" },
  formBox: { background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "16px" },
  formHead: { margin: "0 0 12px 0", color: "#c4b5fd", fontSize: "0.95rem" },
  errorMsg: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "8px 12px", borderRadius: "6px", fontSize: "0.85rem", margin: "0 0 12px 0" },
  successMsg: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", padding: "8px 12px", borderRadius: "6px", fontSize: "0.85rem", margin: "0 0 12px 0" },
  input: { width: "100%", padding: "10px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#f1f5f9", fontSize: "0.9rem", marginBottom: "12px", boxSizing: "border-box" },
  ratingRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  ratingLabel: { color: "#94a3b8", fontSize: "0.88rem", flexShrink: 0 },
  textarea: { width: "100%", padding: "10px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#f1f5f9", fontSize: "0.9rem", resize: "vertical", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" },
  submitBtn: { width: "100%", padding: "11px", background: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.3s ease" },
  submitDisabled: { opacity: 0.55, cursor: "not-allowed" },
};
