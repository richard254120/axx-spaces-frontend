import { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../hooks/useGoogleSignIn";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function UserLogin({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  // Read return destination if available, defaulting to Member / User Activities Dashboard
  const redirectPath = searchParams.get("redirect") || searchParams.get("returnUrl") || "/member";

  // Tab: 'login' or 'register'. Default to register if 'tab=register' or defaultTab specified, otherwise login
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

  // Verification resend state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("✓ Email verified successfully! Please sign in to your explorer account.");
    }
    if (searchParams.get("tab") === "register") {
      setTab("register");
    } else if (searchParams.get("tab") === "login") {
      setTab("login");
    }
  }, [searchParams]);

  // Google Sign-In handler (Works for both exploring & returning members)
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
      setSuccess(data.isNewMember ? "Welcome to AxxSpace! Your explorer account is ready." : "Welcome back! Signing you in...");
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
        if (data.requiresVerification) {
          setShowResend(true);
          setResendEmail(data.email || loginData.email.trim());
        }
        if (
          data.userNotFound ||
          response.status === 404 ||
          (data.error && data.error.toLowerCase().includes("not found"))
        ) {
          setUnregisteredEmail(loginData.email.trim());
          throw new Error("No AxxSpace explorer account found with this email.");
        }
        throw new Error(data.error || "Invalid email or password");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      login(data.token, data.user);
      setSuccess("✓ Welcome back! Exploring spaces...");
      setTimeout(() => navigate(redirectPath, { replace: true }), 500);
    } catch (err) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Create Account submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone) {
      setError("Please fill in all fields to create your explorer account");
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

      if (data.requiresVerification) {
        setSuccess("Registration successful! A verification email has been sent to " + registerData.email + ". Please check your inbox and verify your email before logging in.");
        setTab("login");
        setLoginData({ email: registerData.email, password: "" });
        return;
      }

      if (data.token && data.user) {
        login(data.token, data.user);
        setSuccess("Welcome to AxxSpace! Your explorer membership is active.");
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

  // Resend verification email
  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail || loginData.email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resend verification email");
      setSuccess("✓ " + (data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setResendLoading(false);
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
      <style>{explorerCss}</style>

      {/* ── LEFT HERO PANEL (EXPLORER VALUE & DISCOVERY) ── */}
      <div className="axx-hero-panel">
        <div className="axx-hero-ambient-glow glow-1"></div>
        <div className="axx-hero-ambient-glow glow-2"></div>

        <div className="axx-hero-content">
          {/* Top Brand Tag */}
          <Link to="/" className="axx-hero-brand" title="AxxSpace Home">
            <img src="/logo.png" alt="Axx Spaces Logo" className="axx-hero-logo" />
            <div className="axx-hero-brand-text">
              <span className="axx-hero-brand-name">AXX SPACES</span>
              <span className="axx-hero-brand-sub">Community &amp; Spaces Explorer</span>
            </div>
          </Link>

          {/* Main Hero Copy */}
          <div className="axx-hero-headline-group">
            <div className="axx-hero-pill">
              <span className="axx-hero-pill-dot"></span>
              <span>100% FREE EXPLORER ACCOUNT · NO LISTINGS REQUIRED</span>
            </div>
            <h1 className="axx-hero-title">
              Your gateway to discover <span className="highlight-text">exceptional spaces</span> across Kenya.
            </h1>
            <p className="axx-hero-desc">
              Join thousands of students, remote professionals, and travelers exploring verified hostels, rentals, and stays. Save your favorites, chat directly with owners, and unlock exclusive community perks.
            </p>
          </div>

          {/* 4 Feature Highlights Specific to Users/Explorers */}
          <div className="axx-feature-cards">
            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>Browse &amp; Compare Rentals</h4>
                <p>Discover student hostels, serviced studios, and modern apartments with transparent rates.</p>
              </div>
            </div>

            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>Bookmark &amp; Share Favorites</h4>
                <p>Save properties you love to your personal wishlist and share with friends or family.</p>
              </div>
            </div>

            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>Direct Messaging · Zero Middleman Fees</h4>
                <p>Inquire directly with property owners and hosts. Never pay unfair broker commissions.</p>
              </div>
            </div>

            <div className="axx-feature-card">
              <div className="axx-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div className="axx-feature-text">
                <h4>First-Look Vacancy Alerts</h4>
                <p>Get notified immediately when prices drop or spaces open up near your university or office.</p>
              </div>
            </div>
          </div>

          {/* Social Proof & Reassurance Badge */}
          <div className="axx-explorer-proof-card">
            <div className="proof-header">
              <div className="avatar-group">
                <span className="mini-avatar av1">JK</span>
                <span className="mini-avatar av2">MW</span>
                <span className="mini-avatar av3">AO</span>
                <span className="mini-count">+5k</span>
              </div>
              <div className="proof-stat">
                <div className="stat-num">5,000+ Members</div>
                <div className="stat-sub">Exploring &amp; booking on AxxSpace</div>
              </div>
            </div>
            <div className="proof-reassurance">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>No landlord commitments · You never need to list anything to use AxxSpace</span>
            </div>
          </div>

          {/* Hero Bottom Footer */}
          <div className="axx-hero-footer">
            <span>🛡️ Verified &amp; Secure Explorer Experience</span>
            <span>·</span>
            <span>Nairobi · Juja · Eldoret · Mombasa · Nakuru</span>
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
              <span>Explore website without sign in</span>
            </Link>

            <div className="axx-member-badge">
              <span className="axx-member-dot"></span>
              <span>COMMUNITY ACCESS</span>
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
                    Enter the email associated with your AxxSpace account and we&apos;ll send you a password recovery link.
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
              /* ── MAIN AUTH (EXPLORE SIGN IN & CREATE FREE ACCOUNT) ── */
              <div className="axx-main-auth-view">
                {/* Header Greetings tailored to Community Explorers */}
                <div className="axx-auth-header">
                  <h2 className="axx-auth-title">
                    {tab === "login" ? "Welcome Back Explorer 👋" : "Join the Community ✨"}
                  </h2>
                  <p className="axx-auth-sub">
                    {tab === "login"
                      ? "Sign in to access your saved spaces, active inquiries, and booking history."
                      : "Create a free explorer account. You don't need anything to list—just search, save, and connect."}
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
                    Create Free Account
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
                      Continue with your email below
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

                {showResend && (
                  <div style={{ marginBottom: "16px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      style={{
                        background: "rgba(251, 191, 36, 0.15)",
                        color: "#b45309",
                        border: "1px solid rgba(251, 191, 36, 0.5)",
                        borderRadius: "8px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {resendLoading ? "Sending verification email..." : "Resend Verification Email"}
                    </button>
                  </div>
                )}

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
                          placeholder="e.g. explorer@example.com"
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
                        <span>Stay signed in on this device</span>
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
                        "Sign In & Start Exploring"
                      )}
                    </button>

                    <div className="axx-switch-tip">
                      New to AxxSpace?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("register");
                          setError("");
                        }}
                        className="axx-switch-action"
                      >
                        Create your free explorer account
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── CREATE ACCOUNT FORM (FOR NEW EXPLORERS) ── */
                  <form onSubmit={handleRegisterSubmit} className="axx-form">
                    <div className="axx-free-notice-card">
                      <span className="free-icon">🎉</span>
                      <div className="free-text">
                        <strong>100% Free Explorer Membership</strong>
                        <span>No fees, no listings required. Enjoy full access to browse and save spaces.</span>
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <label className="axx-label">Your Name</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </span>
                        <input
                          type="text"
                          name="name"
                          placeholder="e.g. Kevin Otieno"
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
                          placeholder="e.g. kevin@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="axx-input"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="axx-input-group">
                      <label className="axx-label">Phone Number (For Host Inquiries &amp; WhatsApp)</label>
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
                      <label className="axx-label">Password</label>
                      <div className="axx-input-wrapper">
                        <span className="axx-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </span>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          placeholder="Min 6 characters (mix letters & numbers)"
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
                          <span>Creating Explorer Account...</span>
                        </span>
                      ) : (
                        "Create Free Explorer Account"
                      )}
                    </button>

                    <p className="axx-terms-micro">
                      By joining, you agree to AxxSpace Terms of Service. No listing requirements.
                    </p>

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

                {/* Clear distinction for Providers / Landlords */}
                <div className="axx-provider-bridge">
                  <div className="provider-box">
                    <span className="provider-tag">ARE YOU A PROPERTY OWNER?</span>
                    <p className="provider-desc">
                      Looking to list student hostels, apartments, or holiday stays?
                    </p>
                    <div className="provider-links">
                      <Link to="/login" className="provider-link">
                        Landlord / Host Portal →
                      </Link>
                      <span className="provider-sep">|</span>
                      <Link to="/agent/login" className="provider-link">
                        Agent Portal →
                      </Link>
                    </div>
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

const explorerCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .axx-auth-wrapper {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #080c14;
    color: #f1f5f9;
    overflow-x: hidden;
  }

  /* ── LEFT HERO PANEL ── */
  .axx-hero-panel {
    flex: 1.1;
    position: relative;
    background: linear-gradient(145deg, #0f172a 0%, #090e1a 55%, #030712 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    justifyContent: space-between;
    padding: 44px 52px;
    overflow: hidden;
  }

  .axx-hero-ambient-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
  }
  .glow-1 {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.17) 0%, transparent 70%);
    top: -60px;
    left: -60px;
  }
  .glow-2 {
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
  }

  .axx-hero-content {
    position: relative;
    z-index: 1;
    max-width: 530px;
    display: flex;
    flex-direction: column;
    gap: 28px;
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
    width: 46px;
    height: 46px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
  .axx-hero-brand-text {
    display: flex;
    flex-direction: column;
  }
  .axx-hero-brand-name {
    font-size: 20px;
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
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    width: fit-content;
  }
  .axx-hero-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 8px #34d399;
  }
  .axx-hero-title {
    font-size: 36px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.22;
    letter-spacing: -0.8px;
    margin: 0;
  }
  .highlight-text {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .axx-hero-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #94a3b8;
    margin: 0;
  }

  /* Feature cards */
  .axx-feature-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .axx-feature-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px 16px;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }
  .axx-feature-card:hover {
    transform: translateX(4px);
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }
  .axx-feature-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .axx-feature-text h4 {
    font-size: 13px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 2px 0;
  }
  .axx-feature-text p {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }

  /* Explorer proof card */
  .axx-explorer-proof-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 20px;
    border-radius: 14px;
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .proof-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .avatar-group {
    display: flex;
    align-items: center;
  }
  .mini-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #ffffff;
    border: 2px solid #0f172a;
    margin-left: -6px;
  }
  .mini-avatar:first-child { margin-left: 0; }
  .av1 { background: #3b82f6; }
  .av2 { background: #10b981; }
  .av3 { background: #f59e0b; }
  .mini-count {
    background: #475569;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    color: #ffffff;
    border: 2px solid #0f172a;
    margin-left: -6px;
  }
  .proof-stat .stat-num {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
  }
  .proof-stat .stat-sub {
    font-size: 11px;
    color: #94a3b8;
  }
  .proof-reassurance {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #a7f3d0;
    line-height: 1.4;
  }

  .axx-hero-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #64748b;
    padding-top: 10px;
  }

  /* ── RIGHT AUTH PANEL ── */
  .axx-auth-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: #080c14;
    overflow-y: auto;
  }

  .axx-auth-container {
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #fbbf24;
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
    background: #fbbf24;
    box-shadow: 0 0 6px #fbbf24;
  }

  .axx-auth-card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 32px 28px;
    backdrop-filter: blur(16px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  }

  .axx-auth-header {
    margin-bottom: 20px;
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
    font-size: 23px;
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

  /* Free notice banner */
  .axx-free-notice-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 2px;
  }
  .free-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  .free-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #cbd5e1;
    line-height: 1.35;
  }
  .free-text strong {
    color: #34d399;
    font-size: 12px;
  }

  /* Tab Pill Switcher */
  .axx-tab-pill-box {
    display: flex;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 18px;
  }
  .axx-tab-btn {
    flex: 1;
    padding: 10px 12px;
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
    margin-bottom: 14px;
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
    margin: 16px 0;
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
    gap: 15px;
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

  .axx-terms-micro {
    font-size: 11px;
    color: #64748b;
    text-align: center;
    margin: 2px 0 0 0;
    line-height: 1.4;
  }

  .axx-switch-tip {
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 2px;
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

  /* Provider bridge */
  .axx-provider-bridge {
    margin-top: 22px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }
  .provider-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 12px 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .provider-tag {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.6px;
    color: #fbbf24;
    text-transform: uppercase;
  }
  .provider-desc {
    font-size: 11px;
    color: #94a3b8;
    margin: 0;
  }
  .provider-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    margin-top: 2px;
  }
  .provider-link {
    color: #38bdf8;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.15s ease;
  }
  .provider-link:hover {
    color: #7dd3fc;
    text-decoration: underline;
  }
  .provider-sep {
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
      padding: 30px 20px;
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .axx-hero-title {
      font-size: 26px;
    }
    .axx-feature-cards,
    .axx-explorer-proof-card,
    .axx-hero-footer {
      display: none;
    }
    .axx-auth-panel {
      padding: 28px 16px;
    }
    .axx-auth-card {
      padding: 22px 18px;
    }
  }
`;