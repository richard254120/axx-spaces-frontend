import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PhoneInput from "../components/PhoneInput";
import { API_BASE } from "../utils/constants";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const propertyId = searchParams.get("propertyId");
  const plan = searchParams.get("plan");
  const amount = parseInt(searchParams.get("amount")) || 5000;

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ── ADDED: bank transfer state ──
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [bankMessage, setBankMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  // ── END ADDED ──

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

  // ── ADDED: bank transfer handler ──
  const handleBankTransfer = async (e) => {
    e.preventDefault();
    const trimmed = bankMessage.trim();
    if (!trimmed || trimmed.length < 10) {
      setMessage("❌ Please paste the full M-Pesa confirmation message");
      return;
    }
    const codeMatch = trimmed.match(/([A-Z0-9]{10,12})\s+confirmed/i);
    const transactionRef = codeMatch ? codeMatch[1] : trimmed.slice(0, 30);
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/payment/bank-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount,
          propertyId,
          plan,
          transactionRef,
          bankMessage: trimmed,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setMessage("❌ " + (data.error || "Submission failed. Please try again."));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // ── END ADDED ──

  // ── ADDED: success screen after bank submission ──
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", fontSize: "3rem", marginBottom: "16px" }}>✅</div>
          <h2 style={{ textAlign: "center", fontSize: "1.5rem", color: "#22c55e", marginBottom: "12px" }}>Submitted for Review</h2>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "28px" }}>
            Your payment has been received and is pending admin verification.
            Your listing will be promoted once confirmed — usually within a few hours.
          </p>
          <button onClick={() => navigate("/dashboard")} style={styles.payBtn}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  // ── END ADDED ──

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💳 Complete Payment</h1>

        <div style={styles.planInfo}>
          <p><strong>Plan:</strong> {plan ? plan.toUpperCase() : "Boost"} Plan</p>
          <p><strong>Amount:</strong> KSh {amount.toLocaleString()}</p>
          <p><strong>Duration:</strong> 30 Days</p>
        </div>

        {/* ADDED: payment method toggle */}
        <div style={styles.toggle}>
          <button
            onClick={() => { setPaymentMethod("mpesa"); setMessage(""); }}
            style={{ ...styles.toggleBtn, ...(paymentMethod === "mpesa" ? styles.toggleActive : {}) }}
          >
            📱 M-Pesa STK Push
          </button>
          <button
            onClick={() => { setPaymentMethod("bank"); setMessage(""); }}
            style={{ ...styles.toggleBtn, ...(paymentMethod === "bank" ? styles.toggleActive : {}) }}
          >
            🏦 Pay via Paybill
          </button>
        </div>
        {/* END ADDED */}

        {/* ADDED: show original form only when mpesa selected */}
        {paymentMethod === "mpesa" && (
          <form onSubmit={handlePayment}>
            <label style={styles.label}>M-Pesa Phone Number</label>
            <PhoneInput
              value={phone}
              onChange={(value) => setPhone(value)}
              style={styles.input}
              required
            />

            <button type="submit" disabled={loading} style={styles.payBtn}>
              {loading ? "Processing Payment..." : `Pay KSh ${amount.toLocaleString()}`}
            </button>
          </form>
        )}
        {/* END ADDED */}

        {/* ADDED: bank transfer section */}
        {paymentMethod === "bank" && (
          <div>
            <div style={styles.bankBox}>
              <p style={styles.bankStep}>Step 1 — Send payment via M-Pesa Paybill</p>
              <div style={styles.bankDetails}>
                <div style={styles.bankRow}>
                  <span style={styles.bankLabel}>Paybill Number</span>
                  <span style={styles.bankValue}>542542</span>
                </div>
                <div style={styles.bankDivider} />
                <div style={styles.bankRow}>
                  <span style={styles.bankLabel}>Account Number</span>
                  <span style={styles.bankValue}>03507214611250</span>
                </div>
                <div style={styles.bankDivider} />
                <div style={styles.bankRow}>
                  <span style={styles.bankLabel}>Amount</span>
                  <span style={styles.bankValue}>KSh {amount.toLocaleString()}</span>
                </div>
                <div style={styles.bankDivider} />
                <div style={styles.bankRow}>
                  <span style={styles.bankLabel}>Bank</span>
                  <span style={styles.bankValue}>I&amp;M Bank</span>
                </div>
              </div>
              <div style={styles.howTo}>
                <p style={styles.howToTitle}>How to pay:</p>
                <ol style={styles.howToList}>
                  <li>Go to M-Pesa → <strong>Lipa na M-Pesa → Pay Bill</strong></li>
                  <li>Business no: <strong>542542</strong></li>
                  <li>Account no: <strong>03507214611250</strong></li>
                  <li>Amount: <strong>KSh {amount.toLocaleString()}</strong></li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                </ol>
              </div>
            </div>
            <form onSubmit={handleBankTransfer}>
              <label style={styles.label}>Step 2 — Paste your M-Pesa confirmation SMS below</label>
              <textarea
                placeholder={`e.g. RBA12345XY confirmed. Ksh${amount.toLocaleString()} sent to I&M BANK 542542...`}
                value={bankMessage}
                onChange={(e) => setBankMessage(e.target.value)}
                style={styles.textarea}
                rows={5}
                required
              />
              <p style={styles.hint}>💡 Copy and paste the full SMS exactly as received from M-Pesa</p>
              <button type="submit" disabled={loading} style={styles.payBtn}>
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>
            </form>
          </div>
        )}
        {/* END ADDED */}

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
  },
  // ADDED styles
  toggle: { display: "flex", gap: "10px", marginBottom: "28px" },
  toggleBtn: {
    flex: 1,
    padding: "12px 8px",
    background: "#0f1729",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  toggleActive: {
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid #fbbf24",
    color: "#fbbf24",
  },
  bankBox: {
    background: "#0f1729",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #1e3a5f",
  },
  bankStep: { fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" },
  bankDetails: { borderRadius: "8px", overflow: "hidden", border: "1px solid #1e3a5f", marginBottom: "16px" },
  bankRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#111d2e" },
  bankDivider: { height: "1px", background: "#1e3a5f" },
  bankLabel: { fontSize: "13px", color: "#64748b" },
  bankValue: { fontSize: "15px", fontWeight: "700", color: "#fbbf24", letterSpacing: "0.5px" },
  howTo: { background: "rgba(59, 130, 246, 0.06)", borderRadius: "8px", padding: "14px 16px", border: "1px solid rgba(59, 130, 246, 0.15)" },
  howToTitle: { fontSize: "12px", fontWeight: "700", color: "#3b82f6", marginBottom: "8px" },
  howToList: { margin: 0, paddingLeft: "18px", color: "#94a3b8", fontSize: "13px", lineHeight: "2" },
  textarea: {
    width: "100%",
    padding: "14px",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white",
    fontSize: "13px",
    resize: "vertical",
    marginBottom: "8px",
    boxSizing: "border-box",
    lineHeight: "1.6",
    fontFamily: "inherit",
  },
  hint: { fontSize: "12px", color: "#475569", marginBottom: "20px" },
};