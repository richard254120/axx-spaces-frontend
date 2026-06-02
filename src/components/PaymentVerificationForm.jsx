import { useState } from "react";
import API from "../api/api";

const styles = {
  container: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "100px",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    backgroundColor: "white",
  },
  button: {
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  hint: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
};

const css = `
  input:focus, textarea:focus, select:focus {
    border-color: #fbbf24 !important;
    outline: none;
  }
  button:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

export default function PaymentVerificationForm({ propertyId, tourismPropertyId, onSuccess, amount, plan }) {
  const [type, setType] = useState("listing_boost");
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [mpesaTransactionId, setMpesaTransactionId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mpesaMessage || !phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Submitting payment verification:", {
        propertyId,
        tourismPropertyId,
        type,
        amount: amount || 0,
        mpesaMessage,
        mpesaTransactionId,
        phoneNumber,
        plan,
      });

      const response = await API.post("/payment-verification/submit", {
        propertyId,
        tourismPropertyId,
        type,
        amount: amount || 0,
        mpesaMessage,
        mpesaTransactionId,
        phoneNumber,
        plan,
      });

      console.log("Payment verification response:", response.data);

      setSuccess("Payment verification submitted successfully! Admin will review it shortly.");
      setMpesaMessage("");
      setMpesaTransactionId("");
      setPhoneNumber("");

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error("Failed to submit payment verification:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.error || "Failed to submit payment verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <h3 style={styles.title}>💳 Manual Payment Verification</h3>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={styles.label}>Payment Type</label>
          <select
            style={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="listing_boost">Listing Boost</option>
            <option value="premium_plan">Premium Plan</option>
            <option value="tourism_package">Tourism Package</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={styles.label}>M-Pesa Message</label>
          <textarea
            style={styles.textarea}
            placeholder="Paste the M-Pesa confirmation message here..."
            value={mpesaMessage}
            onChange={(e) => setMpesaMessage(e.target.value)}
            required
          />
          <p style={styles.hint}>
            Copy the full M-Pesa confirmation message from your SMS and paste it here
          </p>
        </div>

        <div>
          <label style={styles.label}>M-Pesa Transaction ID (Optional)</label>
          <input
            type="text"
            style={styles.input}
            placeholder="e.g., QWE123ABC456"
            value={mpesaTransactionId}
            onChange={(e) => setMpesaTransactionId(e.target.value)}
          />
          <p style={styles.hint}>
            The transaction code from your M-Pesa message (e.g., QWE123ABC456)
          </p>
        </div>

        <div>
          <label style={styles.label}>Phone Number Used for Payment</label>
          <PhoneInput
            style={styles.input}
            value={phoneNumber}
            onChange={(value) => setPhoneNumber(value)}
            required
          />
          <p style={styles.hint}>
            The phone number you used to make the M-Pesa payment
          </p>
        </div>

        {amount && (
          <div>
            <label style={styles.label}>Amount (KSh)</label>
            <input
              type="number"
              style={styles.input}
              value={amount}
              disabled
            />
          </div>
        )}

        {plan && (
          <div>
            <label style={styles.label}>Plan</label>
            <input
              type="text"
              style={styles.input}
              value={plan}
              disabled
            />
          </div>
        )}

        <button
          type="submit"
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
