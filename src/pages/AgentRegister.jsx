import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { KENYA_COUNTIES } from "../features/accommodation";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../hooks/useGoogleSignIn";

const counties = KENYA_COUNTIES;

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    maxWidth: "500px",
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
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "120px",
    resize: "vertical",
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
  success: {
    background: "#dcfce7",
    color: "#16a34a",
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
  hint: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "4px",
  },
};

const css = `
  input:focus, textarea:focus, select:focus {
    border-color: #fbbf24 !important;
  }
  button:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

export default function AgentRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    county: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleError, setGoogleError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

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
          role: "agent",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google registration failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");

      login(data.token, data.user);
      setSuccess(" Google registration successful! Redirecting to agent dashboard...");
      setTimeout(() => {
        navigate("/agent/dashboard");
      }, 900);
    } catch (err) {
      setGoogleError(err.message || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, login, navigate]);

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

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.county || !formData.bio) {
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
          role: "agent",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.requiresVerification) {
        setSuccess("Registration successful! A verification link has been sent to " + formData.email + ". Please verify your email before logging in.");
        setTimeout(() => {
          navigate("/agent/login");
        }, 3000);
        return;
      }

      // Auto-login after registration
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        login(loginData.token, loginData.user);
        setSuccess("Registration successful! Redirecting to agent dashboard...");
        setTimeout(() => {
          navigate("/agent/dashboard");
        }, 2000);
      } else {
        setSuccess("Registration successful! Please log in.");
        setTimeout(() => {
          navigate("/agent/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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

        <h1 style={s.title}>Agent Registration</h1>
        <p style={s.subtitle}>Create your agent account to connect with accommodation providers</p>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        {googleError && <div style={s.error}>{googleError}</div>}

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
          <span style={{ padding: "0 12px" }}>or register with email</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              style={s.input}
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email *</label>
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
            <label style={s.label}>Phone Number *</label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              placeholder="e.g. 0712 345 678"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password *</label>
            <input
              type="password"
              name="password"
              style={s.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div style={s.hint}>
              Must be at least 6 characters with letters and numbers
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>County of Operation *</label>
            <select
              style={s.input}
              name="county"
              value={formData.county}
              onChange={handleChange}
              required
            >
              <option value="">Select county...</option>
              {counties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Bio / Experience *</label>
            <textarea
              style={s.textarea}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your experience in the rental market, areas you specialize in, and what makes you a great agent..."
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Agent Account"}
          </button>
        </form>

        <div style={s.link}>
          Already have an agent account?{" "}
          <span style={s.linkText} onClick={() => navigate("/agent/login")}>
            Log In
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
