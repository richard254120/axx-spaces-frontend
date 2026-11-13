import React, { useState } from "react";
import API from "../../api/api";
import { IconFlag, IconCheckCircle, IconAlertTriangle } from "./AxxGoIcons";

const REASONS = [
  { value: "scam", label: "Scam / Fraudulent (asking for money upfront, fake listing)" },
  { value: "wrong_category", label: "Wrong Category (posted in inappropriate section)" },
  { value: "offensive", label: "Offensive / Inappropriate Content or Images" },
  { value: "sold", label: "Already Sold / Rented / No Longer Available" },
  { value: "other", label: "Other Policy Violation" },
];

export default function AxxGoReportModal({ listingId, listingTitle, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState("scam");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await API.post(`/axxgo/listings/${listingId}/report`, {
        reason,
        details,
        reporterContact: contact,
      });

      if (res.data.success) {
        setSuccess(true);
        if (onReportSuccess) onReportSuccess(res.data.autoHidden);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setDetails("");
          setContact("");
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #475569",
          borderRadius: "14px",
          maxWidth: "520px",
          width: "100%",
          padding: "24px",
          color: "#f8fafc",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <IconFlag size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
                Report this Listing
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
              Listing: <strong style={{ color: "#cbd5e1" }}>{listingTitle}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              <IconCheckCircle size={36} color="#10b981" />
            </div>
            <h4 style={{ margin: "0 0 6px", color: "#10b981", fontSize: "16px" }}>Report Submitted</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>
              Thank you for keeping AxxGo safe! Our automated moderation and review team will evaluate this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  color: "#fca5a5",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <IconAlertTriangle size={15} color="#ef4444" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason Radio Group */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                Select Reason <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: reason === r.value ? "rgba(220, 38, 38, 0.15)" : "#0f1729",
                      border: `1px solid ${reason === r.value ? "#ef4444" : "#334155"}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ accentColor: "#ef4444", width: "auto", margin: 0 }}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what is fraudulent, inaccurate, or offensive about this listing..."
                rows={3}
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  width: "100%",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Reporter Contact */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                Your Phone or Email (Optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="In case our moderation team needs follow-up"
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  width: "100%",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#dc2626",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
