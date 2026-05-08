import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const propertyId = searchParams.get("propertyId");
  const plan = searchParams.get("plan");
  const amount = parseInt(searchParams.get("amount"));

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return setMessage("Please enter M-Pesa number");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payment/boost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ propertyId, plan }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Payment successful! Your listing is now boosted.");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage("❌ " + (data.error || "Payment failed"));
      }
    } catch (err) {
      setMessage("❌ Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Checkout - Boost Listing</h1>
        <p><strong>Plan:</strong> {plan?.toUpperCase()}</p>
        <p><strong>Amount:</strong> KSh {amount?.toLocaleString()}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" disabled={loading} style={styles.payBtn}>
            {loading ? "Processing..." : `Pay KSh ${amount?.toLocaleString()}`}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0a1421", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "#1e293b", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "450px" },
  input: { width: "100%", padding: "14px", margin: "15px 0", background: "#0f1729", border: "1px solid #475569", borderRadius: "8px", color: "white" },
  payBtn: { width: "100%", padding: "16px", background: "#22c55e", color: "black", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem" },
  message: { marginTop: "20px", textAlign: "center", fontWeight: "600" }
};