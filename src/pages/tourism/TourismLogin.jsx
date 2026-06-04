import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../utils/constants";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import useForgotPassword from "../../hooks/useForgotPassword";

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
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    padding: "0 10px",
  },
  googleButtonContainer: {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    width: "100%",
    padding: "14px",
    background: "white",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
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
  const [success, setSuccess] = useState("");

  const googleButtonRef = useRef(null);

  const { handleGoogleLogin } = useGoogleAuth({
    buttonRef: googleButtonRef,
    skipLogin: true,
    validate: (data) => {
      if (data.user.role !== "tourism_provider") {
        throw new Error("This login is for tourism providers only");
      }
      if (!data.user.isApproved) {
        throw new Error("Your account is pending admin approval. Approval typically takes less than 5 hours. Please wait for approval email before logging in.");
      }
    },
    onSuccess: (data) => {
      login(data.token, {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      setSuccess("✅ Google login successful! Redirecting...");
      setTimeout(() => navigate("/tourism/dashboard"), 1000);
    },
    onError: (msg) => setError(msg),
  });

  const {
    showForgot, setShowForgot, forgotEmail, setForgotEmail,
    forgotLoading, forgotMsg, handleForgotPassword, resetForgotState,
  } = useForgotPassword();

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      handleGoogleLogin();
    }
  }, []);



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
        throw new Error("Your account is pending admin approval. Approval typically takes less than 5 hours. Please wait for approval email before logging in.");
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
        {showForgot ? (
          <>
            <div style={styles.logo}>
              <span style={styles.logoAccent}>AXX</span>
              <span style={styles.logoWord}>SPACE</span>
            </div>

            <h1 style={styles.title}>🔐 Reset Password</h1>
            <p style={styles.subtitle}>Enter your email to receive a reset link</p>

            {forgotMsg && (
              <div style={forgotMsg.includes("❌") ? styles.error : { ...styles.error, background: "#f0fdf4", borderColor: "#22c55e", color: "#16a34a" }}>
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={styles.form}>
              <div>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ ...styles.button, ...(forgotLoading ? styles.buttonDisabled : {}) }}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "📧 Send Reset Link"}
              </button>
            </form>

            <div style={styles.link}>
              <span style={styles.linkText} onClick={resetForgotState}>
                ← Back to Login
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={styles.logo}>
              <span style={styles.logoAccent}>AXX</span>
              <span style={styles.logoWord}>SPACE</span>
            </div>

            <h1 style={styles.title}>Tourism Provider Login</h1>
            <p style={styles.subtitle}>Access your tourism property dashboard</p>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={{ ...styles.error, background: "#f0fdf4", borderColor: "#22c55e", color: "#16a34a" }}>{success}</div>}

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
                <div style={{ textAlign: "right", marginTop: "8px" }}>
                  <span
                    onClick={() => { setShowForgot(true); setError(""); }}
                    style={{ color: "#fbbf24", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                  >
                    Forgot password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div style={{ ...styles.link, marginTop: "24px" }}>
              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>or</span>
                <div style={styles.dividerLine}></div>
              </div>

              <div ref={googleButtonRef} style={styles.googleButtonContainer}></div>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
