import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await API.post(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message);
        setUserRole(res.data.role || "");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed. The link may be invalid or expired.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0B2140 0%, #1e3a5f 100%)",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📧</div>
            <h2 style={{ color: "#0B2140", margin: "0 0 16px", fontSize: "24px", fontWeight: 800 }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: "#6b7280", margin: 0 }}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "#22c55e", margin: "0 0 16px", fontSize: "24px", fontWeight: 800 }}>
              Email Verified!
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>{message}</p>
            <button
              onClick={() => {
                if (userRole === "user") {
                  navigate("/business-login");
                } else if (userRole === "seller") {
                  navigate("/seller-login");
                } else if (userRole === "mover") {
                  navigate("/movers?tab=login");
                } else {
                  navigate("/login");
                }
              }}
              style={{
                background: "#fbbf24",
                color: "#0B2140",
                border: "none",
                borderRadius: "10px",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>❌</div>
            <h2 style={{ color: "#ef4444", margin: "0 0 16px", fontSize: "24px", fontWeight: 800 }}>
              Verification Failed
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>{message}</p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "#fbbf24",
                  color: "#0B2140",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 32px",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Register Again
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "14px 32px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
