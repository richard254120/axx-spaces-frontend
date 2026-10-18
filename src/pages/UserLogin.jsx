import { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../styles/theme";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../hooks/useGoogleSignIn";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function UserLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  // Tab: 'login' or 'register'
  const [tab, setTab] = useState(searchParams.get("tab") === "register" ? "register" : "login");

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // General states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [unregisteredEmail, setUnregisteredEmail] = useState("");

  // Forgot Password modal/view state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    }
  }, [searchParams]);

  // Google Sign-In handler (Works for both Sign In and Sign Up automatically!)
  const handleGoogleCredential = useCallback(async (googleUser) => {
    try {
      setLoading(true);
      setGoogleError("");
      setError("");

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: "user",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");

      login(data.token, data.user);
      setSuccess(data.isNewMember ? "Welcome to AxxSpace! Your account is ready." : "Welcome back! Signing you in...");
      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setGoogleError(err.message || "Google authentication failed. Please try again or use email.");
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

  // Switch to register tab prefilled with email
  const handleSwitchToRegisterWithEmail = (email) => {
    setRegisterData((prev) => ({ ...prev, email }));
    setTab("register");
    setError("");
    setUnregisteredEmail("");
  };

  // Sign In submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUnregisteredEmail("");

    if (!loginData.email || !loginData.password) {
      setError("Please provide both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email.trim(), password: loginData.password, role: "user" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.userNotFound || response.status === 404 || (data.error && data.error.toLowerCase().includes("not found"))) {
          setUnregisteredEmail(loginData.email.trim());
          throw new Error("No AxxSpace account found with this email.");
        }
        throw new Error(data.error || "Invalid email or password");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      login(data.token, data.user);
      setSuccess("✓ Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Create Account submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone) {
      setError("All fields are required to create your membership");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(registerData.password);
    const hasNumber = /[0-9]/.test(registerData.password);
    if (!hasLetter || !hasNumber) {
      setError("Password must contain both letters and numbers.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password,
        role: "user",
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      // If token is returned, sign in immediately!
      if (data.token && data.user) {
        login(data.token, data.user);
        setSuccess("Welcome to AxxSpace! Your membership is active.");
        setTimeout(() => navigate("/"), 800);
      } else {
        setSuccess("Account created successfully! Please sign in.");
        setTab("login");
        setLoginData({ email: registerData.email, password: "" });
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("Please enter your registered email address");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), role: "user" }),
      });

      const data = await response.json();
      setForgotMsg(data.message || "Password reset link sent! Check your inbox.");
      if (data.message?.includes("sent")) {
        setTimeout(() => {
          setShowForgot(false);
          setForgotEmail("");
          setForgotMsg("");
        }, 2500);
      }
    } catch (err) {
      setForgotMsg("Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <div style={styles.container}>
        {/* MEMBER PERKS BADGE */}
        <div style={styles.perksBadge}>
          <span style={styles.perksDot}></span>
          <span>AXXSPACE MEMBER ACCESS · FREE &amp; INSTANT</span>
        </div>

        <div style={styles.card}>
          {showForgot ? (
            /* ── FORGOT PASSWORD VIEW ── */
            <div>
              <h1 style={styles.title}>Reset Password</h1>
              <p style={styles.subtitle}>Enter your email to receive a secure password recovery link</p>

              {forgotMsg && (
                <div style={forgotMsg.includes("Failed") ? styles.errorBox : styles.successBox}>
                  {forgotMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </span>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={styles.input}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    ...styles.primaryBtn,
                    opacity: forgotLoading ? 0.7 : 1,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {forgotLoading ? "Sending Recovery Link..." : "Send Reset Link"}
                </button>
              </form>

              <div style={styles.divider}></div>

              <div style={styles.footerLinkWrap}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotMsg("");
                    setForgotEmail("");
                  }}
                  style={styles.backBtn}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* ── MAIN AUTH (SIGN IN & CREATE ACCOUNT) ── */
            <div>
              <div style={styles.header}>
                <h1 style={styles.title}>
                  {tab === "login" ? "Welcome Back" : "Join AxxSpace"}
                </h1>
                <p style={styles.subtitle}>
                  {tab === "login"
                    ? "Sign in to access your saved spaces, inquiries, and member perks"
                    : "Create your free account to save favorite homes, chat with owners & book stays"}
                </p>
              </div>

              {/* TAB SWITCHER */}
              <div style={styles.tabContainer}>
                <button
                  type="button"
                  onClick={() => { setTab("login"); setError(""); setUnregisteredEmail(""); }}
                  style={{
                    ...styles.tabBtn,
                    ...(tab === "login" ? styles.tabBtnActive : {}),
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("register"); setError(""); setUnregisteredEmail(""); }}
                  style={{
                    ...styles.tabBtn,
                    ...(tab === "register" ? styles.tabBtnActive : {}),
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* ONE-TAP GOOGLE AUTH (Available for both Sign In and Sign Up) */}
              <div style={styles.googleSection}>
                {GOOGLE_CLIENT_ID ? (
                  <div style={styles.googleBtnWrapper}>
                    <div ref={googleButtonRef} style={styles.googleBtnSlot}></div>
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                    Sign in with email and password below
                  </div>
                )}
                {googleError && <div style={styles.errorBox}>{googleError}</div>}
              </div>

              <div style={styles.orDivider}>
                <span style={styles.orLine}></span>
                <span style={styles.orText}>or continue with email</span>
                <span style={styles.orLine}></span>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <div>{error}</div>
                  {unregisteredEmail && (
                    <button
                      type="button"
                      onClick={() => handleSwitchToRegisterWithEmail(unregisteredEmail)}
                      style={styles.switchPromptBtn}
                    >
                      Create an account with {unregisteredEmail} →
                    </button>
                  )}
                </div>
              )}

              {success && <div style={styles.successBox}>{success}</div>}

              {/* ── SIGN IN FORM ── */}
              {tab === "login" ? (
                <form onSubmit={handleLoginSubmit} style={styles.form}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. user@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={styles.label}>Password</label>
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setError(""); }}
                        style={styles.forgotBtn}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={styles.eyeBtn}
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.primaryBtn,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In to AxxSpace"}
                  </button>

                  <div style={styles.switchRow}>
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("register"); setError(""); }}
                      style={styles.inlineLink}
                    >
                      Create one in 30 seconds
                    </button>
                  </div>
                </form>
              ) : (
                /* ── CREATE ACCOUNT FORM ── */
                <form onSubmit={handleRegisterSubmit} style={styles.form}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Full Name</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </span>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Joy Wanjiku"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. joy@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Phone Number (M-Pesa / WhatsApp)</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0712 345 678 or +254 7..."
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Password (minimum 6 chars, letters &amp; numbers)</label>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a secure password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        style={styles.input}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        style={styles.eyeBtn}
                        title={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.primaryBtn,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Creating Your Membership..." : "Join AxxSpace for Free"}
                  </button>

                  <div style={styles.switchRow}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("login"); setError(""); }}
                      style={styles.inlineLink}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* OTHER PORTALS */}
              <div style={styles.divider}></div>
              <div style={styles.otherPortals}>
                <span style={{ color: "#94a3b8" }}>Need a provider account?</span>
                <div style={styles.portalLinks}>
                  <Link to="/login" style={styles.portalLink}>Landlords &amp; Hosts</Link>
                  <span>·</span>
                  <Link to="/agent/login" style={styles.portalLink}>Field Agents</Link>
                  <span>·</span>
                  <Link to="/business-login" style={styles.portalLink}>AxxBiashara</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at top, #1e293b 0%, #0a0f1d 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "460px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  perksBadge: {
    alignSelf: "center",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  perksDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px #22c55e",
  },
  card: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "36px 30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#f8fafc",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.45",
  },
  tabContainer: {
    display: "flex",
    background: "rgba(30, 41, 59, 0.7)",
    padding: "4px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "20px",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    background: "#fbbf24",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(251, 191, 36, 0.35)",
  },
  googleSection: {
    marginBottom: "16px",
  },
  googleBtnWrapper: {
    display: "flex",
    justifyContent: "center",
    minHeight: "44px",
  },
  googleBtnSlot: {
    display: "inline-block",
  },
  orDivider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "18px 0",
  },
  orLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  orText: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "14px",
    pointerEvents: "none",
    opacity: 0.7,
  },
  input: {
    width: "100%",
    padding: "12px 42px 12px 40px",
    background: "rgba(30, 41, 59, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
    padding: "4px",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  primaryBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.3px",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
    transition: "transform 0.15s, opacity 0.15s",
  },
  switchRow: {
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  inlineLink: {
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
    fontSize: "13px",
    textDecoration: "underline",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#fca5a5",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  switchPromptBtn: {
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.4)",
    color: "#fbbf24",
    padding: "8px 12px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "left",
  },
  successBox: {
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    color: "#86efac",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "14px",
    textAlign: "center",
  },
  divider: {
    height: "1px",
    background: "rgba(255, 255, 255, 0.08)",
    margin: "24px 0 16px",
  },
  footerLinkWrap: {
    textAlign: "center",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  otherPortals: {
    textAlign: "center",
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  portalLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    color: "#64748b",
  },
  portalLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontWeight: 600,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  input:focus {
    outline: none !important;
    border-color: #fbbf24 !important;
    background: rgba(30, 41, 59, 0.95) !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18) !important;
  }
  
  button:hover:not(:disabled) {
    filter: brightness(1.06);
  }
`;