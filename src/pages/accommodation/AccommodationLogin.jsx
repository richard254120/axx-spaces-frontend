import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../../hooks/useGoogleSignIn";
import {
  setAccommodationSession,
  isAccommodationLoggedIn,
} from "../../features/accommodation";
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
    padding: "24px 16px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "36px 32px",
    maxWidth: "440px",
    width: "100%",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  },
  logo: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logoAccent: {
    color: "#fbbf24",
    fontWeight: 800,
    fontSize: "26px",
  },
  logoWord: {
    color: "#1f2937",
    fontWeight: 800,
    fontSize: "26px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: 700,
    borderRadius: "999px",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "6px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "13.5px",
    color: "#6b7280",
    marginBottom: "24px",
    textAlign: "center",
    lineHeight: "1.45",
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
    display: "block",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
    color: "#1f2937",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.35)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.4",
    marginBottom: "16px",
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.4",
    marginBottom: "16px",
  },
  link: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "13px",
    color: "#6b7280",
  },
  linkText: {
    color: "#d97706",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0 16px",
    color: "#9ca3af",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    padding: "0 12px",
  },
  googleContainer: {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const css = `
  input:focus {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2) !important;
  }
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

export default function AccommodationLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (isAccommodationLoggedIn()) {
      navigate("/accommodation/dashboard", { replace: true });
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password modal/toggle state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // Google sign in integration
  const handleGoogleCredential = useCallback(async (googleUser) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

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
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }
      if (!data.token || !data.user) {
        throw new Error("Invalid response received from server");
      }

      setAccommodationSession(data.token, data.user);
      login(data.token, data.user);

      setSuccess("Google sign-in successful! Entering host dashboard...");
      setTimeout(() => {
        navigate("/accommodation/dashboard");
      }, 700);
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please use email and password.");
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const handleGoogleError = useCallback((message) => {
    setError(message || "Google sign-in is unavailable. Please sign in with email.");
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          role: "host",
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Unable to parse server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      const userRole = data.user?.role;
      // Host, admin, or landlord are authorized to manage accommodation
      if (userRole !== "host" && userRole !== "admin" && userRole !== "landlord") {
        throw new Error(
          `Your account is registered as a ${userRole}. Please register as an Accommodation Host or sign in through your user portal.`
        );
      }

      setAccommodationSession(data.token, data.user);
      login(data.token, {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone,
      });

      setSuccess("Login successful! Redirecting to host dashboard...");
      setTimeout(() => {
        navigate("/accommodation/dashboard");
      }, 600);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    const cleanForgotEmail = forgotEmail.trim().toLowerCase();

    if (!cleanForgotEmail) {
      setForgotMsg("Please enter your registered email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanForgotEmail,
          role: "host",
        }),
      });

      const data = await response.json();
      setForgotMsg(data.message || "Password reset link sent! Please check your inbox.");
    } catch {
      setForgotMsg("Failed to send reset email. Please verify your connection and try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.card}>
        <div style={styles.logo}>
          <img
            src={logo}
            alt="Axxspace"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              margin: "0 auto 10px",
              display: "block",
              boxShadow: "0 4px 12px rgba(2, 39, 83, 0.15)",
            }}
          />
          <div>
            <span style={styles.logoAccent}>AXX</span>
            <span style={styles.logoWord}>SPACE</span>
          </div>
        </div>

        {showForgot ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <span style={styles.badge}>Host Account Recovery</span>
            </div>
            <h1 style={styles.title}>Reset Host Password</h1>
            <p style={styles.subtitle}>
              Enter your registered host email address to receive password reset instructions.
            </p>

            {forgotMsg && (
              <div
                style={
                  forgotMsg.toLowerCase().includes("sent") || forgotMsg.toLowerCase().includes("check")
                    ? styles.success
                    : styles.error
                }
              >
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={styles.form}>
              <div>
                <label style={styles.label}>Registered Host Email</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="email"
                    style={styles.input}
                    placeholder="host@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ ...styles.button, ...(forgotLoading ? styles.buttonDisabled : {}) }}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <div style={styles.link}>
              <span
                style={styles.linkText}
                onClick={() => {
                  setShowForgot(false);
                  setForgotMsg("");
                }}
              >
                ← Back to Host Login
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <span style={styles.badge}>Accommodation Portal</span>
            </div>
            <h1 style={styles.title}>Host Sign In</h1>
            <p style={styles.subtitle}>
              Access your accommodation dashboard, manage bookings & listings.
            </p>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="email"
                    style={styles.input}
                    placeholder="host@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={styles.label}>Password</label>
                  <span
                    onClick={() => {
                      setShowForgot(true);
                      setError("");
                      setForgotEmail(email);
                    }}
                    style={{
                      color: "#d97706",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    Forgot password?
                  </span>
                </div>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ ...styles.input, paddingRight: "40px" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </button>
            </form>

            {GOOGLE_CLIENT_ID ? (
              <div style={{ marginTop: "16px" }}>
                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>or sign in with</span>
                  <div style={styles.dividerLine}></div>
                </div>

                <div ref={googleButtonRef} style={styles.googleContainer}></div>
              </div>
            ) : null}

            <div style={styles.link}>
              New accommodation host?{" "}
              <span style={styles.linkText} onClick={() => navigate("/accommodation/register")}>
                Create Host Account
              </span>
            </div>

            <div style={styles.link}>
              <span style={styles.linkText} onClick={() => navigate("/accommodation")}>
                ← Back to Accommodations
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
