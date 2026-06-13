import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { getDashboardPath } from "../utils/dashboardRoutes";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

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
  linkHover: {
    textDecoration: "underline",
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

export default function BusinessLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // Google Sign-In button ref
  const googleButtonRef = useRef(null);

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      handleGoogleLogin();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      if (!window.google) {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          console.log('Google Sign-In script loaded successfully');
          initializeGoogleSignIn();
        };
        script.onerror = () => {
          console.error('Failed to load Google Sign-In script');
          setError("Failed to load Google Sign-In. Please check your internet connection or use email/password.");
          setGoogleLoading(false);
        };
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError("Google Sign-In is not configured. Please use email/password.");
      setGoogleLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      // Render the Google Sign-In button instead of using prompt
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      setError("Google Sign-In initialization failed. Please use email/password.");
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleUser = JSON.parse(jsonPayload);

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      login(data.token, data.user);
      setSuccess("✅ Google login successful! Redirecting...");

      setTimeout(() => {
        navigate(getDashboardPath(data.user?.role));
      }, 1000);

    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/auth/login", formData);
      const { token, user } = res.data;

      login(token, user);
      setSuccess("✅ Login successful! Redirecting to your dashboard...");

      setTimeout(() => {
        navigate(getDashboardPath(user?.role));
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("❌ Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg(res.data.message || "✅ Reset link sent! Check your inbox.");
    } catch (err) {
      setForgotMsg("❌ Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        {showForgot ? (
          <>
            <h1 style={styles.title}>🔐 Reset Password</h1>
            <p style={styles.subtitle}>Enter your email to receive a reset link</p>

            {forgotMsg && (
              <div style={forgotMsg.includes("❌") ? styles.error : styles.success}>
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />

              <button
                type="submit"
                style={{ ...styles.button, ...(forgotLoading ? styles.buttonDisabled : {}) }}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "📧 Send Reset Link"}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            <Link to="/business-login" style={styles.link} onClick={() => { setShowForgot(false); setForgotMsg(""); }}>
              ← Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Business Login</h1>
            <p style={styles.subtitle}>Sign in to manage your business on AxxBiashara</p>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit}>
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

              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <span
                  onClick={() => { setShowForgot(true); setError(""); }}
                  style={{ color: "#60a5fa", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            <div ref={googleButtonRef} style={styles.googleButtonContainer}></div>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            <Link to="/business-register" style={styles.link}>
              Don't have a business account? <strong>Register here</strong>
            </Link>

            <Link to="/axxbiashara" style={styles.link}>
              ← Back to AxxBiashara
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
