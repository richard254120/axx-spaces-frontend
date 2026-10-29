import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../../hooks/useGoogleSignIn";
import {
  setAccommodationSession,
  isAccommodationLoggedIn,
  getAccommodationUser,
} from "../../features/accommodation";
import logo from "../../assets/image.png";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function AccommodationLogin({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  // Tab: 'login' | 'register'
  const paramTab = searchParams.get("tab");
  const [tab, setTab] = useState(
    paramTab === "register" || defaultTab === "register" ? "register" : "login"
  );

  useEffect(() => {
    if (paramTab === "register") {
      setTab("register");
    } else if (paramTab === "login") {
      setTab("login");
    }
  }, [paramTab]);

  const alreadyLoggedIn = isAccommodationLoggedIn();
  const currentUser = alreadyLoggedIn ? getAccommodationUser() : null;

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // Email verification resend state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError("");
    setSuccess("");
    setShowForgot(false);
    setShowResend(false);
    setResendMsg("");
    setSearchParams({ tab: newTab });
  };

  // Google credential callback
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
        throw new Error("Invalid response received from authentication server");
      }

      setAccommodationSession(data.token, data.user);
      login(data.token, data.user);

      setSuccess("Google sign-in successful! Redirecting to Host Dashboard...");
      setTimeout(() => {
        navigate("/accommodation/dashboard");
      }, 600);
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please use your email and password.");
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const handleGoogleError = useCallback((message) => {
    setError(message || "Google sign-in is unavailable on this device. Please sign in with email.");
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  // Resend the verification link when the original one expired or never arrived
  const handleResendVerification = async () => {
    const cleanEmail = resendEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setResendMsg("Please enter your email address.");
      return;
    }

    setResendLoading(true);
    setResendMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, role: "host" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setResendMsg("✓ " + (data.message || "Verification email sent! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setResendMsg("✕ " + (err.message || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !loginPassword) {
      setError("Please provide both email address and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setShowResend(false);
    setResendMsg("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginPassword,
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
        if (data.requiresVerification) {
          setShowResend(true);
          setResendEmail(data.email || cleanEmail);
        }
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      const userRole = data.user?.role;
      if (userRole !== "host" && userRole !== "admin" && userRole !== "landlord") {
        throw new Error(
          `Your account is registered as a ${userRole}. Please register as an Accommodation Host or sign in through your respective portal.`
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

      setSuccess("Welcome back! Entering your host dashboard...");
      setTimeout(() => {
        navigate("/accommodation/dashboard");
      }, 500);
    } catch (err) {
      setError(err.message || "Login failed. Please verify your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = registerData.name.trim();
    const cleanEmail = registerData.email.trim().toLowerCase();
    const cleanPhone = registerData.phone.trim();
    const cleanPassword = registerData.password;

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(cleanPassword);
    const hasNumber = /[0-9]/.test(cleanPassword);
    if (!hasLetter || !hasNumber) {
      setError("Password must contain a combination of letters and numbers.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPassword,
          role: "host",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Please check your information.");
      }

      if (data.requiresVerification) {
        setSuccess("Host account created! A verification link has been sent to " + cleanEmail + ". Please check your inbox and verify your email before logging in.");
        setTimeout(() => {
          handleTabChange("login");
          setLoginEmail(cleanEmail);
        }, 3000);
        return;
      }

      if (data.token && data.user) {
        setAccommodationSession(data.token, data.user);
        login(data.token, {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
        });

        setSuccess("Host account created successfully! Opening your dashboard...");
        setTimeout(() => {
          navigate("/accommodation/dashboard");
        }, 700);
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          handleTabChange("login");
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
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
      setForgotMsg(data.message || "Password reset link sent! Please check your email inbox.");
    } catch {
      setForgotMsg("Failed to send reset email. Please verify your connection and try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="acc-auth-container">
      <style>{css}</style>

      {/* Top Navbar Header */}
      <header className="acc-auth-nav">
        <Link to="/accommodation" className="acc-auth-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back to Accommodations</span>
        </Link>
        <Link to="/" className="acc-auth-brand">
          <img src={logo} alt="Axxspace" className="acc-brand-logo" />
          <span className="acc-brand-text">AXXSPACE</span>
        </Link>
      </header>

      <main className="acc-auth-main">
        <div className="acc-auth-card">
          {/* Badge & Portal Title */}
          <div className="acc-header-badge">
            <span className="acc-pulse-dot"></span>
            <span>HOST PORTAL</span>
          </div>

          {alreadyLoggedIn && (
            <div className="acc-logged-in-banner">
              <span>Signed in as <strong>{currentUser?.name || currentUser?.email || "Host"}</strong></span>
              <button
                type="button"
                className="acc-logged-in-btn"
                onClick={() => navigate("/accommodation/dashboard")}
              >
                Go to Host Dashboard →
              </button>
            </div>
          )}

          <h1 className="acc-card-title">
            {showForgot
              ? "Reset Host Password"
              : tab === "login"
              ? "Host Sign In"
              : "Become an Accommodation Host"}
          </h1>
          <p className="acc-card-subtitle">
            {showForgot
              ? "Enter your registered host email to receive password recovery instructions."
              : tab === "login"
              ? "Access your dashboard to manage bookings, room rates, and property listings."
              : "List your hotel, resort, cottage, lodge, or vacation home with 0% commission."}
          </p>

          {/* Segmented Tab Switcher (Visible when not in Forgot Password view) */}
          {!showForgot && (
            <div className="acc-tabs-wrap" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                className={`acc-tab-btn ${tab === "login" ? "active" : ""}`}
                onClick={() => handleTabChange("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "register"}
                className={`acc-tab-btn ${tab === "register" ? "active" : ""}`}
                onClick={() => handleTabChange("register")}
              >
                Register Host Account
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div className="acc-alert acc-alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="acc-alert acc-alert-success" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>{success}</span>
            </div>
          )}

          {/* Email verification resend */}
          {showResend && (
            <div className="acc-resend-box">
              <p className="acc-resend-title">Email not verified yet?</p>
              <p className="acc-resend-text">
                The verification link may have expired. Enter your host email below and we will send a fresh link.
              </p>
              <div className="acc-resend-row">
                <input
                  type="email"
                  className="acc-input acc-resend-input"
                  placeholder="e.g. serengeti.lodge@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  autoComplete="email"
                />
                <button
                  type="button"
                  className="acc-resend-btn"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending..." : "Resend Link"}
                </button>
              </div>
              {resendMsg && (
                <p className={`acc-resend-msg ${resendMsg.startsWith("✓") ? "is-success" : "is-error"}`}>
                  {resendMsg}
                </p>
              )}
            </div>
          )}

          {/* Forgot Password View */}
          {showForgot ? (
            <div className="acc-forgot-section">
              {forgotMsg && (
                <div
                  className={`acc-alert ${
                    forgotMsg.toLowerCase().includes("sent") || forgotMsg.toLowerCase().includes("check")
                      ? "acc-alert-success"
                      : "acc-alert-error"
                  }`}
                >
                  <span>{forgotMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="acc-form">
                <div className="acc-field">
                  <label className="acc-label">Registered Host Email</label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </span>
                    <input
                      type="email"
                      className="acc-input"
                      placeholder="e.g. host@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="acc-submit-btn"
                >
                  {forgotLoading ? "Sending Instructions..." : "Send Password Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotMsg("");
                  }}
                  className="acc-back-btn"
                >
                  ← Return to Host Sign In
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Google Sign In option */}
              {GOOGLE_CLIENT_ID && (
                <div className="acc-google-wrap">
                  <div ref={googleButtonRef} className="acc-google-slot"></div>
                  <div className="acc-divider">
                    <span className="acc-divider-line"></span>
                    <span className="acc-divider-text">OR CONTINUE WITH EMAIL</span>
                    <span className="acc-divider-line"></span>
                  </div>
                </div>
              )}

              {/* ─── TAB 1: SIGN IN ─── */}
              {tab === "login" && (
                <form onSubmit={handleLoginSubmit} className="acc-form">
                  <div className="acc-field">
                    <label className="acc-label">Host Email Address</label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        type="email"
                        className="acc-input"
                        placeholder="e.g. serengeti.lodge@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <div className="acc-label-row">
                      <label className="acc-label">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(true);
                          setError("");
                        }}
                        className="acc-forgot-trigger"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        className="acc-input"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="acc-eye-toggle"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="acc-submit-btn"
                  >
                    {loading ? (
                      <span className="acc-btn-loading">
                        <span className="acc-spinner"></span>
                        <span>Signing In...</span>
                      </span>
                    ) : (
                      "Sign In to Host Dashboard"
                    )}
                  </button>

                  <div className="acc-switch-banner">
                    <span>New accommodation provider?</span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="acc-switch-action"
                    >
                      Register your property →
                    </button>
                  </div>
                </form>
              )}

              {/* ─── TAB 2: REGISTER ─── */}
              {tab === "register" && (
                <form onSubmit={handleRegisterSubmit} className="acc-form">
                  <div className="acc-field">
                    <label className="acc-label">Full Name / Property Business Name</label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </span>
                      <input
                        type="text"
                        className="acc-input"
                        placeholder="e.g. Jane Doe or Diani Palm Resort"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-label">Host Email Address</label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        type="email"
                        className="acc-input"
                        placeholder="e.g. host@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-label">Host Phone Number (WhatsApp / Calls)</label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </span>
                      <input
                        type="tel"
                        className="acc-input"
                        placeholder="e.g. 0712 345 678 or +254 712 345 678"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-label">Create Password</label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        className="acc-input"
                        placeholder="At least 6 characters (letters & numbers)"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="acc-eye-toggle"
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                    <span className="acc-field-hint">Must contain at least 6 characters with both letters and numbers.</span>
                  </div>

                  {/* Value propositions */}
                  <div className="acc-perks-box">
                    <div className="acc-perk-item">
                      <span className="acc-perk-check">✓</span>
                      <span>Zero booking commission (Keep 100% of guest revenue)</span>
                    </div>
                    <div className="acc-perk-item">
                      <span className="acc-perk-check">✓</span>
                      <span>Direct inquiries straight to your phone &amp; WhatsApp</span>
                    </div>
                    <div className="acc-perk-item">
                      <span className="acc-perk-check">✓</span>
                      <span>Verified Kenyan host badge and direct client bookings</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="acc-submit-btn"
                  >
                    {loading ? (
                      <span className="acc-btn-loading">
                        <span className="acc-spinner"></span>
                        <span>Registering Host...</span>
                      </span>
                    ) : (
                      "Create Host Account"
                    )}
                  </button>

                  <div className="acc-switch-banner">
                    <span>Already registered as an accommodation host?</span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("login")}
                      className="acc-switch-action"
                    >
                      Sign in here →
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

  .acc-auth-container {
    min-height: 100vh;
    background: radial-gradient(circle at 10% 20%, #fdfbf7 0%, #f4eee5 100%);
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    color: #1e293b;
    box-sizing: border-box;
  }
  .acc-auth-container * {
    box-sizing: border-box;
  }

  /* ── Header ── */
  .acc-auth-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e7dfd5;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .acc-auth-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #475569;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    transition: color 0.15s ease, transform 0.15s ease;
    padding: 6px 10px;
    border-radius: 8px;
  }
  .acc-auth-back-link:hover {
    color: #0f172a;
    background: rgba(0, 0, 0, 0.04);
    transform: translateX(-2px);
  }
  .acc-auth-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .acc-brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
  }
  .acc-brand-text {
    font-weight: 900;
    font-size: 16px;
    letter-spacing: -0.3px;
    color: #0f172a;
  }

  /* ── Main & Card ── */
  .acc-auth-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px 56px;
  }
  .acc-auth-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e5ded3;
    box-shadow: 0 20px 48px -12px rgba(15, 23, 42, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 480px;
    padding: 36px 32px;
    position: relative;
    overflow: hidden;
  }

  /* ── Badge & Titles ── */
  .acc-header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fef3c7;
    color: #92400e;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 5px 12px;
    border-radius: 9999px;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .acc-pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d97706;
  }
  .acc-logged-in-banner {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .acc-logged-in-btn {
    align-self: flex-start;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;
  }
  .acc-logged-in-btn:hover {
    background: #047857;
  }
  .acc-card-title {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    line-height: 1.25;
  }
  .acc-card-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  /* ── Tab Switcher ── */
  .acc-tabs-wrap {
    display: flex;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 24px;
    gap: 4px;
    border: 1px solid #e2e8f0;
  }
  .acc-tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px 14px;
    font-size: 13.5px;
    font-weight: 700;
    color: #64748b;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    text-align: center;
  }
  .acc-tab-btn.active {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  }

  /* ── Alerts ── */
  .acc-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 13.5px;
    line-height: 1.45;
    margin-bottom: 18px;
    font-weight: 500;
  }
  .acc-alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  .acc-alert-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
  }

  /* ── Verification Resend ── */
  .acc-resend-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 18px;
  }
  .acc-resend-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 700;
    color: #92400e;
  }
  .acc-resend-text {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.45;
    color: #78350f;
  }
  .acc-resend-row {
    display: flex;
    gap: 8px;
  }
  .acc-resend-input {
    flex: 1;
    min-width: 0;
    padding: 12px 14px;
  }
  .acc-resend-btn {
    background: #0B2140;
    color: #fbbf24;
    border: none;
    border-radius: 10px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    white-space: nowrap;
    cursor: pointer;
  }
  .acc-resend-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .acc-resend-msg {
    margin: 10px 0 0;
    font-size: 13px;
    font-weight: 600;
  }
  .acc-resend-msg.is-success {
    color: #16a34a;
  }
  .acc-resend-msg.is-error {
    color: #dc2626;
  }

  /* ── Google Sign In ── */
  .acc-google-wrap {
    margin-bottom: 20px;
  }
  .acc-google-slot {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 44px;
  }
  .acc-divider {
    display: flex;
    align-items: center;
    margin: 20px 0 10px;
  }
  .acc-divider-line {
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  .acc-divider-text {
    padding: 0 12px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.5px;
  }

  /* ── Form Fields ── */
  .acc-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .acc-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .acc-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .acc-label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
  }
  .acc-forgot-trigger {
    background: none;
    border: none;
    color: #d97706;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    transition: color 0.15s ease;
  }
  .acc-forgot-trigger:hover {
    color: #b45309;
    text-decoration: underline;
  }

  .acc-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .acc-input-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .acc-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    font-size: 14px;
    font-family: inherit;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    color: #0f172a;
    transition: all 0.2s ease;
    outline: none;
  }
  .acc-input:focus {
    background: #ffffff;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
  }
  .acc-eye-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .acc-eye-toggle:hover {
    color: #475569;
  }
  .acc-field-hint {
    font-size: 11.5px;
    color: #64748b;
    margin-top: 2px;
  }

  /* ── Perks Box for Host Registration ── */
  .acc-perks-box {
    background: #fefce8;
    border: 1px solid #fef08a;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .acc-perk-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #854d0e;
    font-weight: 600;
  }
  .acc-perk-check {
    color: #16a34a;
    font-weight: 800;
    font-size: 13px;
  }

  /* ── Submit Button ── */
  .acc-submit-btn {
    margin-top: 4px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1e1b4b;
    border: none;
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 800;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
    min-height: 48px;
  }
  .acc-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    filter: brightness(1.02);
  }
  .acc-submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
  .acc-btn-loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .acc-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(30, 27, 75, 0.3);
    border-top-color: #1e1b4b;
    border-radius: 50%;
    animation: accSpin 0.7s linear infinite;
  }
  @keyframes accSpin {
    to { transform: rotate(360deg); }
  }

  /* ── Switch Banner ── */
  .acc-switch-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    color: #64748b;
    text-align: center;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .acc-switch-action {
    background: none;
    border: none;
    color: #d97706;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }
  .acc-switch-action:hover {
    color: #b45309;
    text-decoration: underline;
  }

  .acc-back-btn {
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #64748b;
    font-weight: 700;
    font-size: 13px;
    padding: 10px;
    cursor: pointer;
    font-family: inherit;
    margin-top: 6px;
    transition: all 0.15s ease;
  }
  .acc-back-btn:hover {
    background: #f8fafc;
    color: #0f172a;
  }

  /* ── Responsive Mobile Rules ── */
  @media (max-width: 640px) {
    .acc-auth-nav {
      padding: 12px 16px;
    }
    .acc-auth-main {
      padding: 16px 12px 40px;
      align-items: flex-start;
    }
    .acc-auth-card {
      padding: 24px 18px;
      border-radius: 18px;
      box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.08);
    }
    .acc-card-title {
      font-size: 22px;
    }
    .acc-card-subtitle {
      font-size: 13px;
      margin-bottom: 20px;
    }
    .acc-tab-btn {
      font-size: 12.5px;
      padding: 9px 8px;
    }
    .acc-input {
      font-size: 15px; /* Prevent iOS zoom */
      padding: 12px 12px 12px 38px;
    }
    .acc-input-icon {
      left: 11px;
    }
  }
`;
