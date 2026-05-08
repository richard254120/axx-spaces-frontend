import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const propertyId = searchParams.get("propertyId");
  const plan = searchParams.get("plan");
  const amount = parseInt(searchParams.get("amount")) || 5000;

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 9) {
      setMessage("❌ Please enter a valid M-Pesa phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/payment/initiate-mpesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          phone,
          amount,
          propertyId,
          plan
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Payment initiated successfully! Check your M-Pesa for prompt.");
        // In real M-Pesa you would wait for callback, but for now we simulate success
        setTimeout(() => {
          navigate("/dashboard");
        }, 2500);
      } else {
        setMessage("❌ " + (data.error || "Payment failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💳 Complete Payment</h1>

        <div style={styles.planInfo}>
          <p><strong>Plan:</strong> {plan ? plan.toUpperCase() : "Boost"} Plan</p>
          <p><strong>Amount:</strong> KSh {amount.toLocaleString()}</p>
          <p><strong>Duration:</strong> 30 Days</p>
        </div>

        <form onSubmit={handlePayment}>
          <label style={styles.label}>M-Pesa Phone Number (07xxxxxxxx)</label>
          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" disabled={loading} style={styles.payBtn}>
            {loading ? "Processing Payment..." : `Pay KSh ${amount.toLocaleString()}`}
          </button>
        </form>

        {message && (
          <p style={{
            ...styles.message,
            color: message.includes("✅") ? "#22c55e" : "#ef4444"
          }}>
            {message}
          </p>
        )}

        <button 
          onClick={() => navigate("/premium-plans?propertyId=" + propertyId)}
          style={styles.backBtn}
        >
          ← Change Plan
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    color: "#f1f5f9"
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    border: "1px solid #334155"
  },
  title: { textAlign: "center", fontSize: "2rem", marginBottom: "30px", color: "#fbbf24" },
  planInfo: {
    background: "#0f1729",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    lineHeight: "1.8"
  },
  label: { display: "block", marginBottom: "8px", color: "#94a3b8", fontWeight: "500" },
  input: {
    width: "100%",
    padding: "14px",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white",
    fontSize: "1.1rem",
    marginBottom: "25px"
  },
  payBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "15px"
  },
  backBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #64748b",
    color: "#94a3b8",
    borderRadius: "8px",
    cursor: "pointer"
  },
  message: {
    textAlign: "center",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600"
  }
};