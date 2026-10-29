import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [countdown, setCountdown] = useState(3);

  // Resend state for error screen
  const [expired, setExpired] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [showResendInput, setShowResendInput] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const countdownRef = useRef(null);
  const resendCooldownRef = useRef(null);

  const startResendCooldown = (seconds) => {
    if (!seconds || seconds <= 0) return;
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
    setResendCooldown(seconds);
    resendCooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendCooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getLoginRoute = (role) => {
    const r = (role || "").toLowerCase().trim();
    if (r === "user" || r === "member") return "/user-login?verified=true";
    if (r === "seller") return "/quicksales-login?verified=true";
    if (r === "mover") return "/movers?tab=login&verified=true";
    if (r === "host") return "/accommodation/login?verified=true";
    if (r === "agent") return "/agent/login?verified=true";
    if (r === "business") return "/business-login?verified=true";
    return "/login?verified=true";
  };

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const res = await API.post(`/auth/verify-email/${token}`);
        if (!isMounted) return;
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully! You can now log in.");
        const role = res.data.role || "";
        setUserRole(role);
      } catch (err) {
        if (!isMounted) return;
        const payload = err.response?.data || {};
        setStatus("error");
        setExpired(Boolean(payload.expired));
        setMessage(payload.error || "Verification failed. The link may be invalid or expired.");
        // An expired link should surface the resend form straight away, with the
        // address the link was sent to already filled in.
        if (payload.expired) {
          setShowResendInput(true);
          if (payload.email) setResendEmail(payload.email);
        }
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Verification token is missing.");
    }

    return () => {
      isMounted = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
    };
  }, [token]);

  // Handle automatic countdown and redirect on success
  useEffect(() => {
    if (status !== "success") return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(getLoginRoute(userRole), { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, userRole, navigate]);

  const handleManualRedirect = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(getLoginRoute(userRole), { replace: true });
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail || resendCooldown > 0) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      const res = await API.post("/auth/resend-verification", { email: resendEmail.trim() });
      setResendMsg("✓ " + (res.data?.message || "Verification email sent! Check your inbox."));
      startResendCooldown(res.data?.retryAfter || 60);
    } catch (err) {
      const payload = err.response?.data;
      if (err.response?.status === 429) {
        setResendMsg("⏳ " + (payload?.error || "Please wait a moment before requesting another link."));
        if (payload?.retryAfter) startResendCooldown(payload.retryAfter);
      } else {
        setResendMsg("✕ " + (payload?.error || "Failed to resend verification link."));
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #071326 0%, #0B2140 50%, #172e4d 100%)",
      padding: "24px",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "44px 36px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top Accent Ribbon */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: status === "success" 
            ? "linear-gradient(90deg, #22c55e, #10b981)" 
            : status === "error" 
            ? "linear-gradient(90deg, #ef4444, #dc2626)" 
            : "linear-gradient(90deg, #fbbf24, #f59e0b)",
        }} />

        {/* Brand Header */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{
            fontSize: "13px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 800,
            color: "#0B2140",
            background: "#fef3c7",
            padding: "4px 12px",
            borderRadius: "20px",
          }}>
            AxxSpace Account Verification
          </span>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div>
            <div style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <h2 style={{ color: "#0B2140", margin: "0 0 12px", fontSize: "24px", fontWeight: 800 }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px", lineHeight: "1.5" }}>
              Please wait a moment while we confirm your email address.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div>
            <div style={{
              width: "84px",
              height: "84px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              border: "3px solid #a7f3d0",
            }}>
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h2 style={{ color: "#0B2140", margin: "0 0 10px", fontSize: "26px", fontWeight: 800 }}>
              Email Verified!
            </h2>
            
            <p style={{ color: "#475569", margin: "0 0 20px", fontSize: "15px", lineHeight: "1.5" }}>
              {message}
            </p>

            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}>
              <span style={{ fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                Redirecting you to log in in
              </span>
              <span style={{
                background: "#16a34a",
                color: "white",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "14px",
              }}>
                {countdown}
              </span>
            </div>

            <button
              onClick={handleManualRedirect}
              style={{
                background: "#fbbf24",
                color: "#0B2140",
                border: "none",
                borderRadius: "12px",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(251, 191, 36, 0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span>Go to Login Now</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div>
            <div style={{
              width: "84px",
              height: "84px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              border: "3px solid #fecaca",
            }}>
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <h2 style={{ color: "#0B2140", margin: "0 0 10px", fontSize: "24px", fontWeight: 800 }}>
              {expired ? "Verification Link Expired" : "Verification Failed"}
            </h2>

            <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px", lineHeight: "1.5" }}>
              {message}
            </p>

            {/* Quick Resend Trigger */}
            {!showResendInput ? (
              <div style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowResendInput(true)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#0B2140",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>{expired ? "Request a New Verification Link" : "Resend Verification Link"}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleResend} style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Enter your email address:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={resendLoading || resendCooldown > 0}
                    style={{
                      background: "#0B2140",
                      color: "#fbbf24",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontWeight: 700,
                      cursor: resendLoading || resendCooldown > 0 ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      opacity: resendLoading || resendCooldown > 0 ? 0.6 : 1,
                    }}
                  >
                    {resendLoading
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Wait ${resendCooldown}s`
                      : "Send Link"}
                  </button>
                </div>
                {resendMsg && (
                  <p style={{
                    fontSize: "13px",
                    margin: "8px 0 0",
                    color: resendMsg.startsWith("✓")
                      ? "#16a34a"
                      : resendMsg.startsWith("⏳")
                      ? "#b45309"
                      : "#dc2626",
                    fontWeight: 600,
                  }}>
                    {resendMsg}
                  </p>
                )}
              </form>
            )}

            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "#fbbf24",
                  color: "#0B2140",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 20px",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Go to Login Page
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Create a New Account
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
