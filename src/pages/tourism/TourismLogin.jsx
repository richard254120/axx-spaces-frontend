import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#f8f4f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "420px",
    width: "100%",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
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
    marginBottom: "32px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
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

export default function TourismLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role !== "tourism_provider") {
        throw new Error("This login is for tourism providers only");
      }

      if (!data.user.isApproved) {
        throw new Error("Your account is pending approval from the admin. Please wait for approval.");
      }

      login(data.token, {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });

      navigate("/tourism/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoAccent}>AXX</span>
          <span style={styles.logoWord}>SPACE</span>
        </div>

        <h1 style={styles.title}>Tourism Provider Login</h1>
        <p style={styles.subtitle}>Access your tourism property dashboard</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.link}>
          Don't have an account?{" "}
          <span style={styles.linkText} onClick={() => navigate("/tourism/register-property")}>
            Register Your Property
          </span>
        </div>

        <div style={styles.link}>
          <span style={styles.linkText} onClick={() => navigate("/tourism")}>
            ← Back to Tourism
          </span>
        </div>
      </div>
    </div>
  );
}
