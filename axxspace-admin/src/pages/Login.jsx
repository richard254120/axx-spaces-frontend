import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password, role: "admin" });
      const { token, user } = res.data;
      if (user.role !== "admin") {
        setError(" Access denied. Admins only.");
        return;
      }
      login(token, user);
      navigate("/");
    } catch (err) {
      setError(" Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg(" Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail, role: "admin" });
      setForgotMsg(res.data.message || " Reset link sent! Check your inbox.");
    } catch (err) {
      setForgotMsg(" Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {showForgot ? (
          <>
            <h1 className="login-title">🔄 Reset Password</h1>
            <p className="login-subtitle">Enter your email to receive a reset link</p>
            {forgotMsg && (
              <div className={`login-error ${forgotMsg.includes("Reset link sent") || forgotMsg.includes("reset") ? "success" : ""}`}>
                {forgotMsg}
              </div>
            )}
            <div className="login-form">
              <div className="login-field">
                <label className="login-label">Email</label>
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  placeholder="Enter your registered email" 
                  className="login-input"
                />
              </div>
              <button 
                onClick={handleForgotPassword} 
                disabled={forgotLoading} 
                className="login-button"
              >
                {forgotLoading ? "Sending..." : "✉️ Send Reset Link"}
              </button>
            </div>
            <div className="login-back-link">
              <span onClick={() => { setShowForgot(false); setForgotMsg(""); }}>
                ← Back to Login
              </span>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-title">🔐 Axxspace Admin</h1>
            <p className="login-subtitle">Sign in to access the admin panel</p>
            {error && <div className="login-error">{error}</div>}
            <div className="login-form">
              <div className="login-field">
                <label className="login-label">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@axxspace.com" 
                  className="login-input"
                />
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="login-input"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <div className="login-forgot-link">
                  <span onClick={() => { setShowForgot(true); setError(""); }}>
                    Forgot password?
                  </span>
                </div>
              </div>
              <button 
                onClick={handleLogin} 
                disabled={loading} 
                className="login-button"
              >
                {loading ? "Signing in..." : "🚀 Sign In"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
