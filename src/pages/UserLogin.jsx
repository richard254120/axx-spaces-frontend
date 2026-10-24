import { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../hooks/useGoogleSignIn";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function UserLogin({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  // Read return destination if available
  const redirectPath = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";

  // Tab: 'login' or 'register'
  const [tab, setTab] = useState(
    defaultTab || (searchParams.get("tab") === "register" ? "register" : "login")
  );

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  // Forgot Password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    } else if (searchParams.get("tab") === "login") {
      setTab("login");
    }
  }, [searchParams]);

  // Google Sign-In handler
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
        navigate(redirectPath, { replace: true });
      }, 600);
    } catch (err) {
      setGoogleError(err.message || "Google authentication failed. Please try again or use email.");
    } finally {
      setLoading(false);
    }
  }, [login, navigate, redirectPath]);

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
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.userNotFound ||
          response.status === 404 ||
          (data.error && data.error.toLowerCase().includes("not found"))
        ) {
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
      setTimeout(() => navigate(redirectPath, { replace: true }), 500);
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
      setError("Password must be at least 6 characters long");
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
        setTimeout(() => navigate(redirectPath, { replace: true }), 700);
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
      if (data.message?.includes("sent") || response.ok) {
        setTimeout(() => {
          setShowForgot(false);
          setForgotEmail("");
          setForgotMsg("");
        }, 2800);
      }
    } catch (err) {
      setForgotMsg(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Password rules check for live visual cues
  const hasMinLength = registerData.password.length >= 6;
  const hasLetterMatch = /[a-zA-Z]/.test(registerData.password);
  const hasNumberMatch = /[0-9]/.test(registerData.password);

  return (
    <div className="axx-auth-wrapper">
      <style>{splitScreenCss}</style>

      {/* ── LEFT HERO PANEL (BRAND & VALUE SHOWCASE) ── */}
      <div className="axx-hero-panel">
        <div className="axx-hero-ambient-glow glow-1"></div>
        <div className="axx-hero-ambient-glow glow-2"></div>

        <div className="axx-hero-content">
          {/* Top Brand Tag */}
          <Link to="/" className="axx-hero-brand">
            <img src="/logo.png" alt="Axx Spaces" className="axx-hero-logo" />
            <div className="axx-hero-brand-text">
              <span className="axx-hero-brand-name">AXX SPACES</span>
              <span className="axx-hero-brand-sub">Living & Student Housing</span>
            </div>
          </Link>

          {/* Main Hero Copy */}
          <div className="axx-hero-headline-group">
            <div className="axx-hero-pill">
              <span className="axx-hero-pill-dot"></span>
              <span>KENYA&apos;S #1 TRUSTED LIVING NETWORK</span>
            </div>
            <h1 className="axx-hero-title">
              Find, book &amp; live in <span className="highlight-text">verified spaces</span>.
            </h1>
            <p className="axx-hero-desc">
              Explore curated student hostels, urban apartments, and verified accommodations near your campus or workplace with zero hidden broker fees.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="axx-feature-cards">
            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>100% Vetted &amp; Verified Spaces</h4>
                <p>Inspected properties with genuine photos and transparent terms.</p>
              </div>
            </div>

            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>Direct Host &amp; Landlord Chat</h4>
                <p>Instant messaging, scheduled viewings, and real-time support.</p>
              </div>
            </div>

            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>Save Favorites &amp; Instant Alerts</h4>
                <p>Bookmark rental spaces and get notified when new vacancies drop.</p>
              </div>
            </div>
          </div>

          {/* Social Proof Testimonial Card */}
          <div className="axx-testimonial-card">
            <div className="axx-testimonial-stars">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="star">★</span>
              ))}
              <span className="rating-num">4.9 / 5</span>
            </div>
            <p className="axx-testimonial-quote">
              &ldquo;Finding a safe studio apartment near Strathmore was so easy with AxxSpace. No sketchy middlemen or fake listings!&rdquo;
            </p>
            <div className="axx-testimonial-author">
              <div className="author-avatar">FK</div>
              <div className="author-meta">
                <div className="author-name">Faith K.</div>
                <div className="author-role">Student · Nairobi</div>
              </div>
            </div>
          </div>

          {/* Hero Bottom Footer */}
          <div className="axx-hero-footer">
            <span>🔒 Bank-grade 256-bit SSL encrypted auth</span>
            <span>·</span>
            <span>Nairobi · Juja · Eldoret · Mombasa</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTH PANEL (INTERACTIVE LOGIN & SIGNUP) ── */}
      <div className="axx-auth-panel">
        <div className="axx-auth-container">
          {/* Top Bar with Back Button & Status Badge */}
          <div className="axx-auth-nav">
            <Link to="/" className="axx-back-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to explore</span>
            </Link>

            <div className="axx-member-badge">
              <span className="axx-member-dot"></span>
              <span>FREE USER ACCESS</span>
            </div>
          </div>

          {/* Card Container */}
          <div className="axx-auth-card">
            {showForgot ? (
              /* ── FORGOT PASSWORD VIEW ── */
              <div className="axx-forgot-view">
                <div className="axx-auth-header">
                  <div className="axx-auth-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h2 className="axx-auth-title">Reset Your Password</h2>
                  <p className="axx-auth-sub">
                    Enter the email associated with your AxxSpace account and we&apos;ll send you a secure recovery link.
                  </p>
                </div>

                {forgotMsg && (
                  <div className={forgotMsg.includes("Failed") || forgotMsg.includes("enter") ? "axx-alert axx-alert-error" : "axx-alert axx-alert-success"}>
                    {forgotMsg}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="axx-form">
                  <div className="axx-input-group">
                    <label className="axx-label">Email Address</label>
                    <div className="axx-input-wrapper">
                      <span className="axx-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="axx-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="axx-submit-btn"
                  >
                    {forgotLoading ? "Sending Recovery Link..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="axx-footer-bridge">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotMsg("");
                      setForgotEmail("");
                    }}
                    className="axx-back-to-login-btn"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* ── MAIN AUTH (SIGN IN & REGISTER) ── */
              <div className="axx-main-auth-view">
                {/* Header Greetings */}
                <div className="axx-auth-header">
                  <h2 className="axx-auth-title">
                    {tab === "login" ? "Welcome Back 👋" : "Create Free Account ✨"}
                  </h2>
                  <p className="axx-auth-sub">
                    {tab === "login"
                      ? "Sign in to view saved properties, active bookings, and messages."
                      : "Join AxxSpace to bookmark listings, book accommodations, and contact hosts."}
                  </p>
                </div>

                {/* Tab Pill Switcher */}
                <div className="axx-tab-pill-box">
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setError("");
                      setUnregisteredEmail("");
                    }}
                    className={`axx-tab-btn ${tab === "login" ? "active" : ""}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("register");
                      setError("");
                      setUnregisteredEmail("");
                    }}
                    className={`axx-tab-btn ${tab === "register" ? "active" : ""}`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Google One-Tap / Standard Button */}
                <div className="axx-google-block">
                  {GOOGLE_CLIENT_ID ? (
                    <div className="axx-google-btn-container">
                      <div ref={googleButtonRef} className="axx-google-slot"></div>
                    </div>
                  ) : (
                    <div className="axx-google-fallback-note">
                      Continue with email and password below
                    </div>
                  )}
                  {googleError && <div className="axx-alert axx-alert-error">{googleError}</div>}
                </div>

                {/* Or Divider */}
                <div className="axx-divider-row">
                  <span className="axx-divider-line"></span>
                  <span className="axx-divider-text">or continue with email</span>
                  <span className="axx-divider-line"></span>
                </div>

                {/* Alert Messages */}
                {error && (
                  <div className="axx-alert axx-alert-error">
                    <div>{error}</div>
                    {unregisteredEmail && (
                      <button
                        type="button"
                        onClick={() => handleSwitchToRegisterWithEmail(unregisteredEmail)}
                        className="axx-switch-link-btn"
                      >
                        Create an account with {unregisteredEmail} →
                      </button>
                    )}
                  </div>
                )}

                {success && <div className="axx-alert axx-alert-success">{success}</div>}

                {/* ── SIGN IN FORM ── */}
                {tab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="axx-form">
                    <div className="axx-input-group">
                      <label className="axx-label">Email Address</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </span>
                        <input
                          type="email"
                          name="email"
                          placeholder="e.g. user@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <div className="axx-label-row">
                        <label className="axx-label">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgot(true);
                            setError("");
                          }}
                          className="axx-forgot-link"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </span>
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="axx-eye-btn"
                          title={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="axx-remember-row">
                      <label className="axx-checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="axx-checkbox"
                        />
                        <span>Remember this device</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="axx-submit-btn"
                    >
                      {loading ? (
                        <span className="axx-btn-loading">
                          <span className="axx-spinner"></span>
                          <span>Signing in...</span>
                        </span>
                      ) : (
                        "Sign In to AxxSpace"
                      )}
                    </button>

                    <div className="axx-switch-tip">
                      Don&apos;t have an account yet?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("register");
                          setError("");
                        }}
                        className="axx-switch-action"
                      >
                        Create one in 30 seconds
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── CREATE ACCOUNT FORM ── */
                  <form onSubmit={handleRegisterSubmit} className="axx-form">
                    <div className="axx-input-group">
                      <label className="axx-label">Full Name</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </span>
                        <input
                          type="text"
                          name="name"
                          placeholder="e.g. Joy Wanjiku"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <label className="axx-label">Email Address</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </span>
                        <input
                          type="email"
                          name="email"
                          placeholder="e.g. joy@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <label className="axx-label">Phone Number (M-Pesa / WhatsApp)</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="0712 345 678 or +254 7..."
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <label className="axx-label">Create Password</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </span>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          placeholder="At least 6 characters with letters & numbers"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="axx-eye-btn"
                          title={showRegisterPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          )}
                        </button>
                      </div>

                      {/* Password live requirement indicators */}
                      {registerData.password.length > 0 && (
                        <div className="axx-pwd-checklist">
                          <span className={`pwd-req ${hasMinLength ? "valid" : ""}`}>
                            {hasMinLength ? "✓" : "•"} Min 6 characters
                          </span>
                          <span className={`pwd-req ${hasLetterMatch ? "valid" : ""}`}>
                            {hasLetterMatch ? "✓" : "•"} Letters
                          </span>
                          <span className={`pwd-req ${hasNumberMatch ? "valid" : ""}`}>
                            {hasNumberMatch ? "✓" : "•"} Numbers
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="axx-submit-btn"
                    >
                      {loading ? (
                        <span className="axx-btn-loading">
                          <span className="axx-spinner"></span>
                          <span>Creating Membership...</span>
                        </span>
                      ) : (
                        "Join AxxSpace for Free"
                      )}
                    </button>

                    <div className="axx-switch-tip">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("login");
                          setError("");
                        }}
                        className="axx-switch-action"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}

                {/* Other Portals Switcher */}
                <div className="axx-other-portals-wrap">
                  <span className="other-label">Are you a property owner or partner?</span>
                  <div className="portal-links">
                    <Link to="/login" className="portal-link">
                      Landlords &amp; Hosts
                    </Link>
                    <span className="portal-sep">·</span>
                    <Link to="/agent/login" className="portal-link">
                      Field Agents
                    </Link>
                    <span className="portal-sep">·</span>
                    <Link to="/business-login" className="portal-link">
                      AxxBiashara
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const splitScreenCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .axx-auth-wrapper {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #090d16;
    color: #f1f5f9;
    overflow-x: hidden;
  }

  /* ── LEFT HERO PANEL ── */
  .axx-hero-panel {
    flex: 1.05;
    position: relative;
    background: linear-gradient(145deg, #0f172a 0%, #090d16 60%, #030712 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    flex-direction: column;
    justifyContent: space-between;
    padding: 48px 56px;
    overflow: hidden;
  }

  .axx-hero-ambient-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .glow-1 {
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%);
    top: -50px;
    left: -50px;
  }
  .glow-2 {
    width: 440px;
    height: 440px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
  }

  .axx-hero-content {
    position: relative;
    z-index: 1;
    max-width: 540px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    height: 100%;
    justifyContent: space-between;
  }

  .axx-hero-brand {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    color: inherit;
  }
  .axx-hero-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  }
  .axx-hero-brand-text {
    display: flex;
    flex-direction: column;
  }
  .axx-hero-brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #f8fafc;
  }
  .axx-hero-brand-sub {
    font-size: 11px;
    font-weight: 600;
    color: #f59e0b;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .axx-hero-headline-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .axx-hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fbbf24;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    width: fit-content;
  }
  .axx-hero-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  }
  .axx-hero-title {
    font-size: 38px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    letter-spacing: -0.8px;
    margin: 0;
  }
  .highlight-text {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .axx-hero-desc {
    font-size: 15px;
    line-height: 1.6;
    color: #94a3b8;
    margin: 0;
  }

  /* Feature cards */
  .axx-feature-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .axx-feature-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 14px 18px;
    border-radius: 14px;
    backdrop-filter: blur(8px);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }
  .axx-feature-card:hover {
    transform: translateX(4px);
    border-color: rgba(245, 158, 11, 0.25);
    background: rgba(255, 255, 255, 0.05);
  }
  .axx-feature-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .axx-feature-text h4 {
    font-size: 14px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 3px 0;
  }
  .axx-feature-text p {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }

  /* Testimonial */
  .axx-testimonial-card {
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 18px 22px;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }
  .axx-testimonial-stars {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #f59e0b;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .rating-num {
    font-size: 12px;
    font-weight: 700;
    color: #cbd5e1;
    margin-left: 6px;
  }
  .axx-testimonial-quote {
    font-size: 13px;
    line-height: 1.5;
    color: #e2e8f0;
    font-style: italic;
    margin: 0 0 12px 0;
  }
  .axx-testimonial-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .author-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
  }
  .author-name {
    font-size: 12px;
    font-weight: 700;
    color: #f8fafc;
  }
  .author-role {
    font-size: 11px;
    color: #94a3b8;
  }

  .axx-hero-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #64748b;
    padding-top: 12px;
  }

  /* ── RIGHT AUTH PANEL ── */
  .axx-auth-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: #090d16;
    overflow-y: auto;
  }

  .axx-auth-container {
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .axx-auth-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .axx-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: color 0.15s ease;
  }
  .axx-back-btn:hover {
    color: #fbbf24;
  }

  .axx-member-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    color: #34d399;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .axx-member-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
  }

  .axx-auth-card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 34px 30px;
    backdrop-filter: blur(16px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  }

  .axx-auth-header {
    margin-bottom: 22px;
  }
  .axx-auth-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }
  .axx-auth-title {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 6px 0;
    letter-spacing: -0.4px;
  }
  .axx-auth-sub {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.45;
  }

  /* Tab Pill Switcher */
  .axx-tab-pill-box {
    display: flex;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .axx-tab-btn {
    flex: 1;
    padding: 10px 14px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .axx-tab-btn.active {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #0f172a;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  /* Google Button */
  .axx-google-block {
    margin-bottom: 16px;
  }
  .axx-google-btn-container {
    display: flex;
    justify-content: center;
    min-height: 44px;
  }
  .axx-google-slot {
    display: inline-block;
  }
  .axx-google-fallback-note {
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }

  /* Or Divider */
  .axx-divider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0;
  }
  .axx-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
  .axx-divider-text {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }

  /* Alerts */
  .axx-alert {
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .axx-alert-error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
  }
  .axx-alert-success {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #86efac;
    text-align: center;
  }
  .axx-switch-link-btn {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fbbf24;
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
  }

  /* Form controls */
  .axx-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .axx-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .axx-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .axx-label {
    font-size: 11px;
    font-weight: 700;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .axx-forgot-link {
    background: none;
    border: none;
    color: #fbbf24;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s ease;
  }
  .axx-forgot-link:hover {
    color: #f59e0b;
    text-decoration: underline;
  }

  .axx-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .axx-input-icon {
    position: absolute;
    left: 14px;
    color: #64748b;
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .axx-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 42px 12px 42px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #f8fafc;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  .axx-input:focus {
    outline: none;
    border-color: #fbbf24;
    background: rgba(30, 41, 59, 0.95);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
  }
  .axx-input::placeholder {
    color: #475569;
  }

  .axx-eye-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
  }
  .axx-eye-btn:hover {
    color: #f8fafc;
  }

  /* Password checklist */
  .axx-pwd-checklist {
    display: flex;
    gap: 12px;
    margin-top: 4px;
  }
  .pwd-req {
    font-size: 11px;
    color: #64748b;
    transition: color 0.15s;
  }
  .pwd-req.valid {
    color: #10b981;
    font-weight: 600;
  }

  /* Remember row */
  .axx-remember-row {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #94a3b8;
  }
  .axx-checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  .axx-checkbox {
    width: 16px;
    height: 16px;
    accent-color: #f59e0b;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Submit Button */
  .axx-submit-btn {
    width: 100%;
    padding: 13px 18px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #0f172a;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.3px;
    cursor: pointer;
    margin-top: 4px;
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .axx-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
    filter: brightness(1.05);
  }
  .axx-submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .axx-btn-loading {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .axx-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(15, 23, 42, 0.3);
    border-top-color: #0f172a;
    border-radius: 50%;
    animation: axx-spin 0.7s linear infinite;
  }
  @keyframes axx-spin {
    to { transform: rotate(360deg); }
  }

  .axx-switch-tip {
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 4px;
  }
  .axx-switch-action {
    background: none;
    border: none;
    color: #fbbf24;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-size: 13px;
    text-decoration: underline;
  }
  .axx-switch-action:hover {
    color: #f59e0b;
  }

  /* Other Portals Wrap */
  .axx-other-portals-wrap {
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .other-label {
    font-size: 12px;
    color: #64748b;
  }
  .portal-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  .portal-link {
    color: #94a3b8;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s ease;
  }
  .portal-link:hover {
    color: #fbbf24;
  }
  .portal-sep {
    color: #475569;
  }

  .axx-footer-bridge {
    margin-top: 18px;
    text-align: center;
  }
  .axx-back-to-login-btn {
    background: none;
    border: none;
    color: #fbbf24;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  /* ── RESPONSIVE ADAPTATIONS ── */
  @media (max-width: 960px) {
    .axx-auth-wrapper {
      flex-direction: column;
    }
    .axx-hero-panel {
      flex: none;
      padding: 32px 24px;
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }
    .axx-hero-title {
      font-size: 28px;
    }
    .axx-feature-cards,
    .axx-testimonial-card,
    .axx-hero-footer {
      display: none;
    }
    .axx-auth-panel {
      padding: 32px 18px;
    }
    .axx-auth-card {
      padding: 24px 20px;
    }
  }
`;