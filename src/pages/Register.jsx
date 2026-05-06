import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

// Use environment variable with fallback
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

console.log("🌐 API Base URL:", API_BASE);

export default function Register() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
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
      const registerUrl = `${API_BASE}/auth/register`;
      console.log("📝 Register attempt");
      console.log("🌐 Sending to:", registerUrl);
      console.log("📦 Payload:", formData);
      
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("✅ Registration successful! Redirecting...");
      setToken(data.token);
      localStorage.setItem("token", data.token);

      setTimeout(() => {
        navigate("/listings");
      }, 2000);
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "❌ Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.container}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
        </div>

        {/* Form Container */}
        <div style={styles.formBox}>
          <h1 style={styles.title}>📝 Create Your Account</h1>
          <p style={styles.subtitle}>Join Kenya's fastest-growing rental platform</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Creating Account..." : "🚀 Register"}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}></div>

          {/* Login Link */}
          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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

  container: {
    width: "100%",
    maxWidth: "500px",
  },

  logoSection: {
    textAlign: "center",
    marginBottom: "40px",
  },

  logo: {
    height: "80px",
    width: "auto",
  },

  formBox: {
    background: "white",
    border: "2px solid #fbbf24",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
  },

  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 8px",
    textAlign: "center",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 24px",
    textAlign: "center",
  },

  error: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },

  success: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  input: {
    padding: "12px 14px",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.2s",
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
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    marginTop: "8px",
  },

  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "20px 0",
  },

  footer: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },

  link: {
    color: "#ef4444",
    textDecoration: "none",
    fontWeight: 700,
  },
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

  button:active {
    transform: translateY(0);
  }

  a:hover {
    opacity: 0.8;
  }

  @media (max-width: 600px) {
    [style*="padding: 40px 32px"] {
      padding: 32px 24px !important;
    }
  }
`;