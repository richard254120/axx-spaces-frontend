import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../../hooks/useGoogleSignIn";

import {
  setAccommodationSession,
  isAccommodationLoggedIn,
  ACCOMMODATION_FONT_CSS,
  accommodationTheme,
} from "../../features/accommodation";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/image.png";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

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
    gap: "16px",
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
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
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
  hint: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "4px",
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

export default function AccommodationRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (isAccommodationLoggedIn()) {
      navigate("/accommodation/dashboard");
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = useCallback(async (googleUser) => {
    try {
      setLoading(true);
      setError("");
      setGoogleError("");

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: "host",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");

      setAccommodationSession(data.token, data.user);
      login(data.token, data.user);
      setSuccess(" Google registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/accommodation/dashboard");
      }, 900);
    } catch (err) {
      setGoogleError(err.message || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const handleGoogleError = useCallback((message) => {
    setGoogleError(message);
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return "Password must contain a mixture of both letters and numbers.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "host",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(" Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/accommodation/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.card}>
        <div style={styles.logo}>
          <img src={logo} alt="Axxspace" style={{ width: "52px", height: "52px", borderRadius: "12px", margin: "0 auto 10px", display: "block", boxShadow: "0 4px 12px rgba(2, 39, 83, 0.15)" }} />
          <span style={styles.logoAccent}>AXX</span>
          <span style={styles.logoWord}>SPACE</span>
        </div>

        <h1 style={styles.title}>Accommodation Provider Registration</h1>
        <p style={styles.subtitle}>Create your accommodation provider account</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        {googleError && <div style={styles.error}>{googleError}</div>}

        {GOOGLE_CLIENT_ID ? (
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Sign Up With Google
            </p>
            <div ref={googleButtonRef} style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "44px" }}></div>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
          <span style={{ padding: "0 12px" }}>or continue with email</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              style={styles.input}
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              style={styles.input}
              placeholder="+254 7XX XXX XXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              style={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div style={styles.hint}>
              Must be at least 6 characters with letters and numbers
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.link}>
          Already have an account?{" "}
          <span style={styles.linkText} onClick={() => navigate("/accommodation/login")}>
            Login
          </span>
        </div>

        <div style={styles.link}>
          <span style={styles.linkText} onClick={() => navigate("/accommodation")}>
            ← Back to Accommodation
          </span>
        </div>
      </div>
    </div>
  );
}
