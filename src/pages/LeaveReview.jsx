import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function LeaveReview() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    category: "general",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.comment) {
      setError("❌ Please fill in all required fields");
      return;
    }

    if (!token) {
      setError("❌ Please login to leave a review");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/reviews", {
        ...formData,
        userName: user?.name || "Anonymous",
      });

      setSuccess("✅ Review submitted successfully!");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <div style={styles.formBox}>
          <h1 style={styles.title}>Share Your Experience</h1>
          <p style={styles.subtitle}>Tell us about your experience with Axxspace services</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Rating */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Rating</label>
              <div style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    style={{
                      ...styles.starButton,
                      color: star <= formData.rating ? "#fbbf24" : "#d1d5db",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="general">General Experience</option>
                <option value="property">Property/Rentals</option>
                <option value="mover">Moving Services</option>
                <option value="merchant">Building Materials</option>
                <option value="tourism">Tourism & Hotels</option>
              </select>
            </div>

            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Review Title</label>
              <input
                type="text"
                name="title"
                placeholder="Summarize your experience"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                maxLength={100}
                required
              />
            </div>

            {/* Comment */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Your Review</label>
              <textarea
                name="comment"
                placeholder="Tell us more about your experience..."
                value={formData.comment}
                onChange={handleChange}
                style={styles.textarea}
                rows={6}
                maxLength={1000}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          <div style={styles.divider}></div>

          <p style={styles.footer}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.backBtn}
            >
              ← Back to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #0f1729 0%, #1a2e4d 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
  },
  formBox: {
    background: "white",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0B2140",
    margin: "0 0 8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 30px",
    textAlign: "center",
  },
  error: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  success: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#16a34a",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  ratingContainer: {
    display: "flex",
    gap: "8px",
  },
  starButton: {
    fontSize: "32px",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  select: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#0B2140",
    transition: "all 0.2s",
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#0B2140",
    transition: "all 0.2s",
  },
  textarea: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#0B2140",
    transition: "all 0.2s",
    resize: "vertical",
  },
  submitBtn: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #E31B1B 0%, #C01010 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(227, 27, 27, 0.35)",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "24px 0",
  },
  footer: {
    textAlign: "center",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
  },
};
