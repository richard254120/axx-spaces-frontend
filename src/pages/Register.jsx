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
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting to register at:", `${API_BASE}/api/auth/register`);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Response Status:", response.status);
      console.log("📥 Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setSuccess("✅ Registration successful! Logging you in...");

      login(data.token, data.user);
      localStorage.setItem("token", data.token);

      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      console.error("❌ Full Error:", err);
      setError(err.message || "Failed to connect to server. Backend must be running.");
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
          <h1 style={styles.title}>Create Landlord Account</h1>
          <p style={styles.subtitle}>Join Kenya's trusted rental platform</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input type="tel" name="phone" placeholder="254712345678" value={formData.phone} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} style={styles.input} required />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
    background: "linear-gradient(135deg, #ffffff, #fef3e2)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: { width: "100%", maxWidth: "480px" },
  logoSection: { textAlign: "center", marginBottom: "30px" },
  logo: { height: "80px" },
  formBox: {
    background: "white",
    padding: "40px 30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: { fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "8px" },
  subtitle: { textAlign: "center", color: "#666", marginBottom: "30px" },
  error: { color: "red", background: "#fee", padding: "12px", borderRadius: "8px", marginBottom: "15px" },
  success: { color: "green", background: "#efe", padding: "12px", borderRadius: "8px", marginBottom: "15px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontWeight: "600", color: "#333" },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
  },
  submitBtn: {
    padding: "14px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  footer: { textAlign: "center", marginTop: "20px", color: "#666" },
  link: { color: "#ef4444", fontWeight: "bold" },
};

const css = `
  input:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
  }
`;

export default Register;