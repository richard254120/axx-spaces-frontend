import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

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
          role: "landlord",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      if (data.user.role !== "landlord") {
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

      setSuccess("✅ Google login successful! Redirecting...");
      setTimeout(() => {
        navigate("/tourism/dashboard");
      }, 1000);

    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail, role: "landlord" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setSuccess("✅ " + (data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError("❌ " + (err.message || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setShowResend(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "landlord" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          setShowResend(true);
          setResendEmail(data.email || email);
        }
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role !== "landlord") {
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("❌ Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, role: "landlord" }),
      });

      const data = await response.json();
      setForgotMsg(data.message || "✅ Reset link sent! Check your inbox.");
    } catch (err) {
      setForgotMsg("❌ Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
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
              <span style={styles.linkText} onClick={() => { setShowForgot(false); setForgotMsg(""); }}>
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

            {showResend && (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  style={{
                    background: "rgba(251, 191, 36, 0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                    transition: "all 0.2s"
                  }}
                >
                  {resendLoading ? "⏳ Sending..." : "📧 Resend Verification Email"}
                </button>
              </div>
            )}

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
