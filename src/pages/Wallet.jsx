import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #fbbf24",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  walletCard: {
    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)",
    border: "2px solid rgba(251, 191, 36, 0.4)",
    borderRadius: "20px",
    padding: "40px",
    marginBottom: "32px",
    textAlign: "center",
  },
  balanceLabel: {
    fontSize: "18px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  balance: {
    fontSize: "64px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "8px",
  },
  currency: {
    fontSize: "32px",
    fontWeight: 600,
    color: "#fbbf24",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(251, 191, 36, 0.2)",
  },
  button: {
    padding: "14px 28px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    marginRight: "12px",
    marginBottom: "12px",
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  transactionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  transactionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  transactionLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  transactionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  transactionDate: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  transactionAmount: {
    fontSize: "18px",
    fontWeight: 700,
  },
  amountPositive: {
    color: "#22c55e",
  },
  amountNegative: {
    color: "#fca5a5",
  },
  amountPending: {
    color: "#fbbf24",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  statusSuccess: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
  },
  statusPending: {
    background: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
  },
  statusFailed: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "16px",
    color: "#94a3b8",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.5)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
  },
};

export default function Wallet() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalSpent: 0,
    totalAdded: 0,
    pendingTransactions: 0,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadWalletData();
  }, [token, navigate]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Get user profile with wallet data
      const res = await API.get("/auth/me");
      const userData = res.data.user;
      
      setTransactions(userData.paymentHistory || []);
      
      // Calculate stats
      const paymentHistory = userData.paymentHistory || [];
      const totalSpent = paymentHistory
        .filter(t => t.status === "success")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalAdded = paymentHistory
        .filter(t => t.status === "success" && t.type === "credit")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const pending = paymentHistory.filter(t => t.status === "pending").length;
      
      setStats({
        totalTransactions: paymentHistory.length,
        totalSpent,
        totalAdded,
        pendingTransactions: pending,
      });
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "success":
        return styles.statusSuccess;
      case "pending":
        return styles.statusPending;
      case "failed":
      case "cancelled":
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  const getAmountStyle = (status) => {
    switch (status) {
      case "success":
        return styles.amountPositive;
      case "pending":
        return styles.amountPending;
      case "failed":
      case "cancelled":
        return styles.amountNegative;
      default:
        return styles.amountPending;
    }
  };

  const getTransactionIcon = (plan) => {
    if (plan?.toLowerCase().includes("premium") || plan?.toLowerCase().includes("boost")) {
      return "⭐";
    }
    if (plan?.toLowerCase().includes("booking") || plan?.toLowerCase().includes("rental")) {
      return "🏠";
    }
    if (plan?.toLowerCase().includes("material")) {
      return "🛍️";
    }
    return "💳";
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading wallet...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>AxxWallet</h1>
          <p style={styles.subtitle}>Manage your funds and transaction history</p>
        </div>

        {/* Wallet Balance Card */}
        <div style={styles.walletCard}>
          <div style={styles.balanceLabel}>Available Balance</div>
          <div style={styles.balance}>
            <span style={styles.currency}>KES </span>
            {user?.walletBalance?.toLocaleString() || "0"}
          </div>
          <div style={{ marginTop: "24px" }}>
            <button style={styles.button} onClick={() => navigate("/premium-plans")}>
              💰 Add Funds
            </button>
            <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate("/payment-history")}>
              📊 View All Transactions
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalTransactions}</div>
            <div style={styles.statLabel}>Total Transactions</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>KES {stats.totalSpent.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>KES {stats.totalAdded.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Added</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.pendingTransactions}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div style={styles.empty}>
              <p>No transactions yet</p>
              <button style={styles.button} onClick={() => navigate("/premium-plans")}>
                Add Funds to Get Started
              </button>
            </div>
          ) : (
            <div style={styles.transactionList}>
              {transactions.slice(0, 10).map((tx, index) => (
                <div key={index} style={styles.transactionItem}>
                  <div style={styles.transactionLeft}>
                    <div style={{
                      ...styles.transactionIcon,
                      background: "rgba(251, 191, 36, 0.15)",
                    }}>
                      {getTransactionIcon(tx.plan)}
                    </div>
                    <div style={styles.transactionDetails}>
                      <div style={styles.transactionTitle}>
                        {tx.plan || "Transaction"}
                      </div>
                      <div style={styles.transactionDate}>
                        {new Date(tx.date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...styles.transactionAmount, ...getAmountStyle(tx.status) }}>
                      KES {tx.amount?.toLocaleString() || "0"}
                    </div>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(tx.status) }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: "24px" }}>
          <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate("/profile")}>
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
