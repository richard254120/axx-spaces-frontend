import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../utils/constants";

export default function PaymentHistory() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPaymentHistory();
  }, [token, navigate]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/payment/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, show empty state
        if (response.status === 404) {
          setPayments([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch payment history");
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Payment history error:", err);
      setError("Unable to load payment history");
      // Don't show error to user, just show empty state
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "✅ Completed" };
      case "pending":
        return { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", label: "⏳ Pending" };
      case "failed":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", label: "❌ Failed" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", label: status };
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>💳 Payment History</h1>
          <p style={styles.subtitle}>View all your transactions</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h2 style={styles.emptyTitle}>No Payment History</h2>
          <p style={styles.emptyText}>
            You haven't made any payments yet. When you do, they'll appear here.
          </p>
          <button style={styles.browseBtn} onClick={() => navigate("/listings")}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div style={styles.paymentsList}>
          {payments.map((payment) => {
            const statusStyle = getStatusColor(payment.status);
            return (
              <div key={payment._id} style={styles.paymentCard}>
                <div style={styles.paymentHeader}>
                  <div style={styles.paymentInfo}>
                    <h3 style={styles.paymentTitle}>{payment.description || "Property Payment"}</h3>
                    <p style={styles.paymentDate}>
                      {new Date(payment.createdAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div style={{ ...styles.statusBadge, ...statusStyle }}>
                    {statusStyle.label}
                  </div>
                </div>

                <div style={styles.paymentDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Amount:</span>
                    <span style={styles.detailValue}>KES {payment.amount?.toLocaleString()}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Transaction ID:</span>
                    <span style={styles.detailValue}>{payment.transactionRef || payment._id}</span>
                  </div>
                  {payment.propertyId && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Property:</span>
                      <span style={styles.detailValue}>{payment.propertyTitle || "Property"}</span>
                    </div>
                  )}
                  {payment.paymentMethod && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Payment Method:</span>
                      <span style={styles.detailValue}>{payment.paymentMethod}</span>
                    </div>
                  )}
                </div>

                {payment.receiptUrl && (
                  <button style={styles.receiptBtn} onClick={() => window.open(payment.receiptUrl, "_blank")}>
                    📄 View Receipt
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
    maxWidth: "1000px",
    margin: "0 auto 40px",
  },
  backBtn: {
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  title: {
    fontSize: "2rem",
    color: "#f1f5f9",
    margin: 0,
    fontWeight: 700,
  },
  subtitle: {
    color: "#94a3b8",
    margin: "4px 0 0 0",
    fontSize: "1rem",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(251, 191, 36, 0.2)",
    borderTop: "4px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: "20px",
    fontSize: "1rem",
  },
  emptyState: {
    maxWidth: "500px",
    margin: "80px auto",
    textAlign: "center",
    padding: "60px 40px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "16px",
    border: "2px dashed #475569",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  emptyTitle: {
    color: "#f1f5f9",
    fontSize: "1.5rem",
    margin: "0 0 12px",
    fontWeight: 700,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  browseBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.2s",
  },
  paymentsList: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  paymentCard: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "24px",
    transition: "all 0.2s",
  },
  paymentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    margin: "0 0 8px",
    fontWeight: 600,
  },
  paymentDate: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: 0,
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  paymentDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  receiptBtn: {
    padding: "10px 20px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "all 0.2s",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
