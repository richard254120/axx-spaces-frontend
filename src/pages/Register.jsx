import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const API_BASE = "http://localhost:1000";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("❌ All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("❌ Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting registration...");

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("✅ Registration successful! Logging you in...");

      login(data.token, data.user || { name: formData.name, email: formData.email });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "❌ Failed to connect to server. Is backend running on port 1000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
        </div>

        <div style={styles.formBox}>
          <h1 style={styles.title}>📝 Create Landlord Account</h1>
          <p style={styles.subtitle}>Join Kenya's trusted rental platform</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g., 254712345678"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? "⏳ Creating Account..." : "🚀 Register Now"}
            </button>
          </form>

          <div style={styles.divider}></div>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */
const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #fef9e7 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: { width: "100%", maxWidth: "500px" },
  logoSection: { textAlign: "center", marginBottom: "40px" },
  logo: { height: "80px", width: "auto" },
  formBox: {
    background: "white",
    border: "2px solid #fbbf24",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
  },
  title: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: "0 0 24px", textAlign: "center" },
  error: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  success: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 700, color: "#374151" },
  input: {
    padding: "12px 14px",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    background: "#f9fafb",
  },
  submitBtn: {
    padding: "13px 24px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },
  divider: { height: "1px", background: "#e5e7eb", margin: "20px 0" },
  footer: { textAlign: "center", color: "#6b7280", fontSize: "14px", margin: 0 },
  link: { color: "#ef4444", fontWeight: 700, textDecoration: "none" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  input:focus {
    outline: none;
    border-color: #ef4444 !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
  }
`;