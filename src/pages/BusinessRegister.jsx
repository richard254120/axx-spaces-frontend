import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import PhoneInput from "../components/PhoneInput";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  form: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "450px",
    width: "100%",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#60a5fa",
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "30px",
    textAlign: "center",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "20px",
    transition: "border-color 0.3s",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#60a5fa",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.3s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  success: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#22c55e",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  link: {
    display: "block",
    textAlign: "center",
    marginTop: "20px",
    color: "#60a5fa",
    textDecoration: "none",
    fontSize: "14px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    padding: "0 10px",
  },
};

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "user",
      });

      setSuccess("✅ Registration successful! Please check your email to verify your account, then login.");

      setTimeout(() => {
        navigate("/business-login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h1 style={styles.title}>Business Registration</h1>
        <p style={styles.subtitle}>Add your business account on AxxBiashara</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />

          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            style={styles.input}
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />

          <label style={styles.label}>Phone Number</label>
          <PhoneInput
            name="phone"
            style={styles.input}
            value={formData.phone}
            onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            style={styles.input}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            style={styles.input}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine}></div>
        </div>

        <Link to="/business-login" style={styles.link}>
          Already have a business account? <strong>Sign in here</strong>
        </Link>

        <Link to="/axxbiashara" style={styles.link}>
          ← Back to AxxBiashara
        </Link>
      </div>
    </div>
  );
}
