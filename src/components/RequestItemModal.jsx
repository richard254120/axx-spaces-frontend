import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(7, 16, 24, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    background: "linear-gradient(135deg, #0d1b2a 0%, #162233 100%)",
    border: "1px solid rgba(201, 168, 76, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(201, 168, 76, 0.15)",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "540px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#F0EAD8",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "28px",
    fontWeight: 700,
    color: "#C9A84C",
    marginBottom: "12px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#B8AD96",
    marginBottom: "24px",
    textAlign: "center",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#B8AD96",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  input: {
    padding: "12px 16px",
    background: "#1E3148",
    border: "1px solid rgba(201, 168, 76, 0.18)",
    borderRadius: "8px",
    color: "#F0EAD8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px 16px",
    background: "#1E3148",
    border: "1px solid rgba(201, 168, 76, 0.18)",
    borderRadius: "8px",
    color: "#F0EAD8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100px",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  select: {
    padding: "12px 16px",
    background: "#1E3148",
    border: "1px solid rgba(201, 168, 76, 0.18)",
    borderRadius: "8px",
    color: "#F0EAD8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%)",
    color: "#0D1B2A",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "12px",
    background: "transparent",
    border: "1px solid rgba(201, 168, 76, 0.3)",
    borderRadius: "8px",
    color: "#B8AD96",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  },
  message: {
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "16px",
  },
  successMessage: {
    background: "rgba(76, 175, 116, 0.15)",
    border: "1px solid #4CAF74",
    color: "#4CAF74",
  },
  errorMessage: {
    background: "rgba(227, 27, 27, 0.15)",
    border: "1px solid #E31B1B",
    color: "#E31B1B",
  }
};

export default function RequestItemModal({ isOpen, onClose, initialQuery = "", defaultService = "other" }) {
  const { user, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "other",
    searchQuery: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        serviceType: defaultService,
        searchQuery: initialQuery,
        details: "",
      });
      setMsg({ text: "", type: "" });
    }
  }, [isOpen, user, initialQuery, defaultService]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await API.post("/item-requests", formData, { headers });
      if (res.data.success) {
        setMsg({ text: "✅ Request submitted successfully! The admin has been notified.", type: "success" });
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setMsg({ text: res.data.error || "Failed to submit request", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: err.response?.data?.error || "Connection error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Can't find what you need?</h2>
        <p style={styles.subtitle}>
          Submit a custom request. Our administrators and verified providers will search across all of AxxSpace to locate it for you!
        </p>

        {msg.text && (
          <div style={{ ...styles.message, ...(msg.type === "success" ? styles.successMessage : styles.errorMessage) }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!user && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={styles.input}
                />
              </div>
            </>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Service / Category</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="rental">🏠 Rental Properties</option>
              <option value="mover">🚛 Movers & Logistics</option>
              <option value="material">🛍️ Construction & General Materials</option>
              <option value="tourism">🏨 Tourism & Travel</option>
              <option value="business">🏪 Business Services (Biashara)</option>
              <option value="other">❓ Other Services</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>What are you looking for?</label>
            <input
              type="text"
              name="searchQuery"
              value={formData.searchQuery}
              onChange={handleChange}
              placeholder="e.g. 2 Bedroom house in Kileleshwa, Cement, Mover truck"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Specific Details & Requirements</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Provide more specifications (e.g. budget range, specific dimensions, time of move, quantity needed)"
              style={styles.textarea}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting request..." : "🚀 Submit Request"}
          </button>

          <button type="button" style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
