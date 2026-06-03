import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchUserProfile } from "../api/profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function WalletPage() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile(token);
        if (data) {
          setProfile(data);
          setTransactions(data.paymentHistory || []);
        }
      } catch (err) {
        console.error("Wallet data error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "success": case "completed": return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Success" };
      case "pending": return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Pending" };
      case "failed": return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Failed" };
      case "cancelled": return { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "Cancelled" };
      default: return { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: status || "Unknown" };
    }
  };

  const filteredTransactions = filter === "all"
    ? transactions
    : transactions.filter((t) => t.status?.toLowerCase() === filter);

  const totalSpent = transactions
    .filter((t) => t.status === "success" || t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading wallet...</p>
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
          <h1 style={styles.title}>Wallet</h1>
          <p style={styles.subtitle}>Your balance and transaction history</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div style={styles.balanceGrid}>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>Wallet Balance</div>
          <div style={styles.balanceAmount}>KES {(profile?.walletBalance || 0).toLocaleString()}</div>
          <div style={styles.balanceHint}>Available balance</div>
        </div>
        <div style={styles.balanceCardSecondary}>
          <div style={styles.balanceLabel}>Total Spent</div>
          <div style={{ ...styles.balanceAmount, color: "#3b82f6" }}>KES {totalSpent.toLocaleString()}</div>
          <div style={styles.balanceHint}>{transactions.length} total transactions</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {["all", "success", "pending", "failed"].map((f) => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💰</div>
          <h2 style={styles.emptyTitle}>No Transactions</h2>
          <p style={styles.emptyText}>
            {filter === "all" ? "You haven't made any transactions yet." : `No ${filter} transactions found.`}
          </p>
          <Link to="/listings" style={styles.browseBtn}>Browse Properties</Link>
        </div>
      ) : (
        <div style={styles.transactionList}>
          {filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((tx, idx) => {
            const statusStyle = getStatusStyle(tx.status);
            return (
              <div key={tx.transactionId || idx} style={styles.txCard}>
                <div style={styles.txLeft}>
                  <div style={styles.txIcon}>💳</div>
                  <div>
                    <div style={styles.txPlan}>{tx.plan || "Payment"}</div>
                    <div style={styles.txDate}>
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-KE", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      }) : "N/A"}
                    </div>
                    {tx.transactionId && <div style={styles.txId}>ID: {tx.transactionId}</div>}
                  </div>
                </div>
                <div style={styles.txRight}>
                  <div style={styles.txAmount}>KES {(tx.amount || 0).toLocaleString()}</div>
                  <span style={{ ...styles.txStatus, background: statusStyle.bg, color: statusStyle.color }}>
                    {statusStyle.label}
                  </span>
                </div>
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
    display: "flex", alignItems: "center", gap: 20,
    maxWidth: 900, margin: "0 auto 30px",
  },
  backBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(251,191,36,0.2)", borderTop: "4px solid #fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },

  balanceGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20, maxWidth: 900, margin: "0 auto 30px",
  },
  balanceCard: {
    background: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.1) 100%)",
    border: "1px solid rgba(251,191,36,0.3)", borderRadius: 16, padding: 28, textAlign: "center",
  },
  balanceCardSecondary: {
    background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, padding: 28, textAlign: "center",
  },
  balanceLabel: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: 8 },
  balanceAmount: { color: "#fbbf24", fontSize: "2rem", fontWeight: 700, marginBottom: 4 },
  balanceHint: { color: "#64748b", fontSize: "0.8rem" },

  filterRow: {
    display: "flex", gap: 8, maxWidth: 900, margin: "0 auto 20px", flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 18px", background: "rgba(30,41,59,0.8)", color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, cursor: "pointer",
    fontSize: "0.85rem", fontWeight: 600,
  },
  filterBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" },

  emptyState: {
    maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "60px 40px",
    background: "rgba(30,41,59,0.5)", borderRadius: 16, border: "2px dashed #475569",
  },
  emptyIcon: { fontSize: "4rem", marginBottom: 20 },
  emptyTitle: { color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 700 },
  emptyText: { color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginBottom: 24 },
  browseBtn: {
    display: "inline-block", padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "1rem",
    textDecoration: "none", cursor: "pointer",
  },

  transactionList: {
    maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12,
  },
  txCard: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, padding: "18px 24px", flexWrap: "wrap", gap: 12,
  },
  txLeft: { display: "flex", alignItems: "center", gap: 14 },
  txIcon: { fontSize: "1.5rem", background: "rgba(251,191,36,0.1)", borderRadius: 10, padding: 10 },
  txPlan: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem", marginBottom: 2 },
  txDate: { color: "#94a3b8", fontSize: "0.8rem" },
  txId: { color: "#64748b", fontSize: "0.75rem", marginTop: 2 },
  txRight: { textAlign: "right" },
  txAmount: { color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 },
  txStatus: { display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
