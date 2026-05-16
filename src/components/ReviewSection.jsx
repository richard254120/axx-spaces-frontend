// src/components/ReviewsSection.jsx
// Add this inside your Listings modal, below the landlord info section
// Usage: <ReviewsSection propertyId={selectedProperty._id} />

import { useState, useEffect } from "react";

const STORAGE_KEY = (id) => `axx_reviews_${id}`;

export default function ReviewsSection({ propertyId }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Load reviews from localStorage
  useEffect(() => {
    if (!propertyId) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY(propertyId));
      if (stored) setReviews(JSON.parse(stored));
    } catch {
      setReviews([]);
    }
  }, [propertyId]);

  const saveReviews = (updated) => {
    localStorage.setItem(STORAGE_KEY(propertyId), JSON.stringify(updated));
    setReviews(updated);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.comment.trim()) { setError("Please write a review."); return; }

    const newReview = {
      id: Date.now(),
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      date: new Date().toLocaleDateString("en-KE", {
        day: "numeric", month: "short", year: "numeric"
      }),
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    setForm({ name: "", rating: 5, comment: "" });
    setError("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={s.wrap}>
      {/* HEADER */}
      <div style={s.header}>
        <h3 style={s.title}>⭐ Reviews & Ratings</h3>
        {avgRating && (
          <div style={s.avgWrap}>
            <span style={s.avgNum}>{avgRating}</span>
            <div>
              <div style={s.stars}>{renderStars(Math.round(avgRating))}</div>
              <span style={s.avgSub}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>

      {/* WRITE A REVIEW */}
      <div style={s.formBox}>
        <p style={s.formTitle}>✍️ Leave a Review</p>

        <input
          style={s.input}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={40}
        />

        {/* STAR PICKER */}
        <div style={s.starPicker}>
          <span style={s.starLabel}>Your rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setForm({ ...form, rating: star })}
              style={{
                ...s.starBtn,
                color: star <= form.rating ? "#fbbf24" : "#334155",
                fontSize: star <= form.rating ? "26px" : "22px",
              }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          style={s.textarea}
          placeholder="Share your experience with this property or landlord..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={3}
          maxLength={300}
        />

        {error && <p style={s.error}>{error}</p>}
        {submitted && <p style={s.success}>✅ Review submitted! Thank you.</p>}

        <button style={s.submitBtn} onClick={handleSubmit}>
          Submit Review
        </button>
      </div>

      {/* REVIEWS LIST */}
      {reviews.length === 0 ? (
        <p style={s.empty}>No reviews yet. Be the first to review this property!</p>
      ) : (
        <div style={s.list}>
          {reviews.map((r) => (
            <div key={r.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{r.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p style={s.reviewerName}>{r.name}</p>
                  <p style={s.reviewDate}>{r.date}</p>
                </div>
                <div style={{ ...s.ratingBadge, marginLeft: "auto" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>
              <p style={s.comment}>"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderStars(n) {
  return (
    <span style={{ color: "#fbbf24", fontSize: "16px" }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

const s = {
  wrap: {
    margin: "24px 0",
    padding: "20px",
    background: "rgba(251,191,36,0.06)",
    borderRadius: "12px",
    border: "1px solid rgba(251,191,36,0.2)",
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap",
    gap: "12px", marginBottom: "20px",
  },
  title: { margin: 0, color: "#fbbf24", fontSize: "16px", fontWeight: 700 },
  avgWrap: { display: "flex", alignItems: "center", gap: "10px" },
  avgNum: { fontSize: "36px", fontWeight: 800, color: "#fbbf24", lineHeight: 1 },
  stars: { marginBottom: "2px" },
  avgSub: { fontSize: "12px", color: "#94a3b8" },

  formBox: {
    background: "rgba(255,255,255,0.04)", borderRadius: "10px",
    padding: "16px", marginBottom: "20px",
    border: "1px solid #334155",
  },
  formTitle: { margin: "0 0 12px", color: "#f1f5f9", fontWeight: 600, fontSize: "14px" },
  input: {
    width: "100%", padding: "10px 12px",
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", marginBottom: "10px",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  },
  starPicker: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" },
  starLabel: { color: "#94a3b8", fontSize: "13px", marginRight: "6px" },
  starBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "2px", lineHeight: 1, transition: "all 0.15s",
  },
  textarea: {
    width: "100%", padding: "10px 12px",
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", marginBottom: "10px",
  },
  error: { color: "#fca5a5", fontSize: "13px", margin: "0 0 8px" },
  success: { color: "#86efac", fontSize: "13px", margin: "0 0 8px" },
  submitBtn: {
    width: "100%", padding: "11px",
    background: "linear-gradient(135deg, #fbbf24, #d97706)",
    color: "#0f1729", border: "none", borderRadius: "8px",
    fontWeight: 700, fontSize: "14px", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  empty: { color: "#64748b", fontSize: "13px", textAlign: "center", padding: "16px 0" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: {
    background: "rgba(255,255,255,0.04)", borderRadius: "10px",
    padding: "14px", border: "1px solid #334155",
  },
  cardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 700, fontSize: "15px", flexShrink: 0,
  },
  reviewerName: { margin: 0, color: "#f1f5f9", fontWeight: 600, fontSize: "14px" },
  reviewDate: { margin: 0, color: "#64748b", fontSize: "11px" },
  ratingBadge: { color: "#fbbf24", fontSize: "14px", letterSpacing: "1px" },
  comment: { margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, fontStyle: "italic" },
};