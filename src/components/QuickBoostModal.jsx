import { useState, useEffect } from "react";
import PhoneInput from "./PhoneInput";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function QuickBoostModal({ isOpen, onClose, itemType, itemId, itemName, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState("boost-3days"); // boost-3days or boost-7days
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // mpesa or bank
  const [phone, setPhone] = useState("");
  const [bankMessage, setBankMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  const plans = {
    "boost-3days": { name: "Quick Boost (Category Search Priority)", price: 100, duration: "3 Days" },
    "boost-7days": { name: "Super Boost (Homepage Spotlight)", price: 250, duration: "7 Days" }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setCompleted(false);
      setBankMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMpesaPayment = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setMessage(" Please enter a valid M-Pesa phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const body = {
        phone,
        amount: plans[selectedPlan].price,
        plan: selectedPlan,
      };

      if (itemType === "property") body.propertyId = itemId;
      else if (itemType === "material") body.materialId = itemId;
      else if (itemType === "business") body.businessId = itemId;
      else if (itemType === "mover") body.moverId = itemId;

      const response = await fetch(`${API_BASE}/payment/initiate-mpesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setCompleted(true);
        setMessage(" Payment initiated! Please check your phone for the M-Pesa PIN prompt.");
        if (onSuccess) onSuccess();
      } else {
        setMessage(" " + (data.error || "Payment initiation failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage(" Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async (e) => {
    e.preventDefault();
    const trimmed = bankMessage.trim();
    if (!trimmed || trimmed.length < 10) {
      setMessage(" Please paste the full M-Pesa confirmation message");
      return;
    }

    const codeMatch = trimmed.match(/([A-Z0-9]{10,12})\s+confirmed/i);
    const transactionRef = codeMatch ? codeMatch[1] : trimmed.slice(0, 30);

    setLoading(true);
    setMessage("");

    try {
      const body = {
        amount: plans[selectedPlan].price,
        plan: selectedPlan,
        transactionRef,
        bankMessage: trimmed,
      };

      if (itemType === "property") body.propertyId = itemId;
      else if (itemType === "material") body.materialId = itemId;
      else if (itemType === "business") body.businessId = itemId;
      else if (itemType === "mover") body.moverId = itemId;

      const response = await fetch(`${API_BASE}/payment/bank-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setCompleted(true);
        setMessage(" Transaction submitted for manual review! Admin will verify and activate your boost within a few hours.");
        if (onSuccess) onSuccess();
      } else {
        setMessage(" " + (data.error || "Verification submission failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage(" Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}> Boost Your Listing</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Item Info */}
        <div style={styles.itemInfo}>
          <div style={styles.itemTypeTag}>{itemType.toUpperCase()}</div>
          <div style={styles.itemNameText}>{itemName}</div>
        </div>

        {completed ? (
          <div style={styles.completedContent}>
            <div style={styles.successIcon}></div>
            <p style={styles.successText}>{message}</p>
            <button style={styles.doneBtn} onClick={onClose}>Close</button>
          </div>
        ) : (
          <div>
            {/* Plan Picker */}
            <div style={styles.sectionLabel}>Select Boost Package</div>
            <div style={styles.plansContainer}>
              {Object.entries(plans).map(([key, plan]) => {
                const isSelected = selectedPlan === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    style={{
                      ...styles.planCard,
                      ...(isSelected ? styles.planCardActive : {})
                    }}
                  >
                    <div style={styles.planRadio}>
                      <div style={{
                        ...styles.planRadioInner,
                        backgroundColor: isSelected ? "#fbbf24" : "transparent"
                      }} />
                    </div>
                    <div style={styles.planDetails}>
                      <div style={styles.planName}>{plan.name}</div>
                      <div style={styles.planDuration}>Duration: {plan.duration}</div>
                    </div>
                    <div style={styles.planPrice}>KES {plan.price}</div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Toggle */}
            <div style={styles.toggleContainer}>
              <button
                onClick={() => { setPaymentMethod("mpesa"); setMessage(""); }}
                style={{ ...styles.toggleBtn, ...(paymentMethod === "mpesa" ? styles.toggleActive : {}) }}
              >
                 M-Pesa STK Push
              </button>
              <button
                onClick={() => { setPaymentMethod("bank"); setMessage(""); }}
                style={{ ...styles.toggleBtn, ...(paymentMethod === "bank" ? styles.toggleActive : {}) }}
              >
                 Paybill Bank Transfer
              </button>
            </div>

            {/* M-Pesa Method */}
            {paymentMethod === "mpesa" && (
              <form onSubmit={handleMpesaPayment}>
                <div style={styles.inputLabel}>M-Pesa Phone Number</div>
                <div style={{ marginBottom: "20px" }}>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    required
                  />
                </div>

                {message && <div style={{ ...styles.msg, color: "#ef4444" }}>{message}</div>}

                <button type="submit" disabled={loading} style={styles.payBtn}>
                  {loading ? "Initiating STK Push..." : `Pay KSh ${plans[selectedPlan].price}`}
                </button>
              </form>
            )}

            {/* Paybill Method */}
            {paymentMethod === "bank" && (
              <div>
                <div style={styles.bankBox}>
                  <div style={styles.bankHeader}>Step 1: Send payment to Paybill</div>
                  <div style={styles.bankRow}>
                    <span style={styles.bankLabel}>Paybill Number</span>
                    <span style={styles.bankValue}>542542</span>
                  </div>
                  <div style={styles.bankRow}>
                    <span style={styles.bankLabel}>Account Number</span>
                    <span style={styles.bankValue}>03507214611250</span>
                  </div>
                  <div style={styles.bankRow}>
                    <span style={styles.bankLabel}>Amount</span>
                    <span style={styles.bankValue}>KES {plans[selectedPlan].price}</span>
                  </div>
                </div>

                <form onSubmit={handleBankTransfer}>
                  <div style={styles.inputLabel}>Step 2: Paste your M-Pesa confirmation SMS</div>
                  <textarea
                    placeholder="e.g. RBA12345XY confirmed. Ksh100 sent to I&M BANK 542542..."
                    value={bankMessage}
                    onChange={(e) => setBankMessage(e.target.value)}
                    style={styles.textarea}
                    rows={4}
                    required
                  />
                  <div style={styles.hint}> Copy and paste the full M-Pesa message exactly as received.</div>

                  {message && <div style={{ ...styles.msg, color: message.includes("") ? "#22c55e" : "#ef4444" }}>{message}</div>}

                  <button type="submit" disabled={loading} style={styles.payBtn}>
                    {loading ? "Submitting for review..." : "Submit for Verification"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    maxHeight: "90vh",
    overflowY: "auto",
    fontFamily: "'Inter', sans-serif",
    color: "#f1f5f9",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  itemInfo: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  itemTypeTag: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#0f172a",
    backgroundColor: "#fbbf24",
    padding: "3px 6px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  itemNameText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#e2e8f0",
  },
  sectionLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: "10px",
    letterSpacing: "0.5px",
  },
  plansContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "24px",
  },
  planCard: {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  planCardActive: {
    background: "rgba(251, 191, 36, 0.06)",
    borderColor: "#fbbf24",
  },
  planRadio: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid #475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
  },
  planRadioInner: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#f1f5f9",
  },
  planDuration: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  planPrice: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  toggleContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  toggleBtn: {
    flex: 1,
    padding: "10px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "rgba(251, 191, 36, 0.1)",
    border: "1px solid #fbbf24",
    color: "#fbbf24",
  },
  inputLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "8px",
    fontWeight: "500",
  },
  payBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s",
  },
  msg: {
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "16px",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(0, 0, 0, 0.2)",
  },
  bankBox: {
    background: "rgba(59, 130, 246, 0.04)",
    border: "1px solid rgba(59, 130, 246, 0.15)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "20px",
  },
  bankHeader: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#3b82f6",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  bankRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
  },
  bankLabel: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  bankValue: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#fbbf24",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "white",
    fontSize: "13px",
    resize: "vertical",
    marginBottom: "6px",
    boxSizing: "border-box",
    lineHeight: "1.5",
    fontFamily: "inherit",
  },
  hint: {
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "16px",
  },
  completedContent: {
    textAlign: "center",
    padding: "20px 10px",
  },
  successIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  successText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#cbd5e1",
    marginBottom: "24px",
  },
  doneBtn: {
    padding: "10px 24px",
    background: "#334155",
    border: "none",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  }
};
