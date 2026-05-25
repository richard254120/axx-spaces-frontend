import { useState } from "react";
import { createReview } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

const styles = {
  container: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "32px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "24px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    background: "#0f1729",
    border: "2px solid #334155",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#f1f5f9",
    fontSize: "15px",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    background: "#0f1729",
    border: "2px solid #334155",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#f1f5f9",
    fontSize: "15px",
    minHeight: "120px",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  ratingContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  starButton: {
    background: "transparent",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  starButtonHover: {
    transform: "scale(1.1)",
  },
  starFilled: {
    color: "#fbbf24",
  },
  starEmpty: {
    color: "#475569",
  },
  ratingText: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  submitButton: {
    background: "#fbbf24",
    color: "#0f1729",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "16px",
    padding: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    borderRadius: "8px",
  },
  successMessage: {
    color: "#22c55e",
    fontSize: "14px",
    marginBottom: "16px",
    padding: "12px",
    background: "rgba(34, 197, 94, 0.1)",
    borderRadius: "8px",
  },
  loginPrompt: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
  },
  loginPromptText: {
    fontSize: "16px",
    marginBottom: "16px",
  },
  loginButton: {
    background: "#fbbf24",
    color: "#0f1729",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
};

export default function ReviewForm({ category = "general", relatedId = null, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user, token } = useAuth();

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        category,
        relatedId,
      };

      const data = await createReview(reviewData, token);

      if (data.success) {
        setSuccess(true);
        setRating(0);
        setTitle("");
        setComment("");

        // Call the success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(data.review);
        }

        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loginPrompt}>
          <p style={styles.loginPromptText}>Please login to share your experience</p>
          <a href="/login" style={styles.loginButton}>
            Login to Write a Review
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <h2 style={styles.title}>Share Your Experience</h2>
      <p style={styles.subtitle}>Help others by sharing your honest feedback</p>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>Review submitted successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Rating *</label>
          <div style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={{
                  ...styles.starButton,
                  ...(hoverRating >= star ? styles.starButtonHover : {}),
                  ...(star <= (hoverRating || rating) ? styles.starFilled : styles.starEmpty),
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div style={styles.ratingText}>{ratingLabels[rating]}</div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Review Title *</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Summarize your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Your Review *</label>
          <textarea
            style={styles.textarea}
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            required
          />
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {comment.length}/1000
          </div>
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(loading ? styles.submitButtonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  input:focus, textarea:focus {
    outline: none;
    border-color: #fbbf24 !important;
  }
  button:hover:not(:disabled) {
    opacity: 0.8;
  }
`;
