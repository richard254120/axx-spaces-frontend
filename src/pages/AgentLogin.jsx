import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    maxWidth: "420px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    padding: "40px 30px",
  },
  logo: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logoAccent: {
    color: "#fbbf24",
    fontWeight: 800,
    fontSize: "28px",
  },
  logoWord: {
    color: "#1f2937",
    fontWeight: 800,
    fontSize: "28px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  link: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#6b7280",
  },
  linkText: {
    color: "#fbbf24",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
  },
};

const css = `
  input:focus {
    border-color: #fbbf24 !important;
  }
  button:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

export default function AgentLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user is an agent
      if (data.user.role !== "agent") {
        setError("This login is for agents only. Please use the appropriate login page.");
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate("/agent/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{css}</style>

      <div style={s.container}>
        <div style={s.logo}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
        </div>

        <h1 style={s.title}>Agent Login</h1>
        <p style={s.subtitle}>Access your agent dashboard</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              name="email"
              style={s.input}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              name="password"
              style={s.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={s.link}>
          Don't have an agent account?{" "}
          <span style={s.linkText} onClick={() => navigate("/agent/register")}>
            Register
          </span>
        </div>

        <div style={s.link}>
          <span style={s.linkText} onClick={() => navigate("/")}>
            ← Back to Home
          </span>
        </div>
      </div>
    </div>
  );
}
