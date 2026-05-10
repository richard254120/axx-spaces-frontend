import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("landlord"); // landlord or mover

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      setError("❌ Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setSuccess("✅ Login successful! Redirecting...");

      login(data.token, data.user);

      // Redirect based on role
      if (data.user?.role === "mover") {
        navigate("/movers");
      } else {
        navigate("/dashboard");   // Your original landlord redirect
      }

    } catch (err) {
      setError(err.message || "❌ Login failed. Please try again.");
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
          <h1 style={styles.title}>🔐 Welcome Back</h1>
          <p style={styles.subtitle}>Login to your Axx Spaces account</p>

          {/* TABS - Added on top, your original form remains below */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "landlord" && styles.tabBtnActive) }}
              onClick={() => setActiveTab("landlord")}
            >
              🏠 Landlord Login
            </button>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "mover" && styles.tabBtnActive) }}
              onClick={() => setActiveTab("mover")}
            >
              🚚 Mover Login
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {/* YOUR ORIGINAL FORM - UNCHANGED */}
          <form onSubmit={handleSubmit} style={styles.form}>
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
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
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
              {loading ? "⏳ Logging in..." : `🚀 Login as ${activeTab === "landlord" ? "Landlord" : "Mover"}`}
            </button>
          </form>

          <div style={styles.divider}></div>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====================== YOUR ORIGINAL STYLES + NEW TABS ====================== */
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

  // ✅ NEW TABS STYLES
  tabs: {
    display: "flex",
    background: "#f3f4f6",
    borderRadius: "8px",
    padding: "4px",
    marginBottom: "24px",
  },
  tabBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    background: "transparent",
    color: "#6b7280",
  },
  tabBtnActive: {
    background: "white",
    color: "#1f2937",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
    background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(36, 39, 251, 0.3)",
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
    color: "#2427fb",
    textDecoration: "none",
    fontWeight: 700,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  input:focus {
    outline: none;
    border-color: #2427fb !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(36, 39, 251, 0.1);
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(36, 39, 251, 0.4) !important;
  }
  @media (max-width: 600px) {
    [style*="padding: 40px 32px"] {
      padding: 32px 24px !important;
    }
  }
`;