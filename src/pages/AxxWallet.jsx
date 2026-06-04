import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function AxxWallet() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPhone, setTransferPhone] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (token) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/payment/wallet");
      setWalletData(response.data);
      setTransactions(response.data.paymentHistory || []);
    } catch (err) {
      console.error("Wallet data error:", err);
      showNotification("Failed to load wallet data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    showNotification("AxxWallet is coming soon! Deposit feature will be available soon.", "error");
    setShowDepositModal(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    showNotification("AxxWallet is coming soon! Withdraw feature will be available soon.", "error");
    setShowWithdrawModal(false);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    showNotification("AxxWallet is coming soon! Transfer feature will be available soon.", "error");
    setShowTransferModal(false);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "success": case "completed": return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Success" };
      case "pending": return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Pending" };
      case "failed": return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Failed" };
      case "cancelled": return { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "Cancelled" };
      default: return { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: status || "Unknown" };
    }
  };

  const totalSpent = transactions
    .filter((t) => t.status === "success" || t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalReceived = transactions
    .filter((t) => (t.status === "success" || t.status === "completed") && t.type === "transfer_received")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading AxxWallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Coming Soon Banner */}
      <div style={styles.comingSoonBanner}>
        <div style={styles.comingSoonIcon}>🚧</div>
        <div style={styles.comingSoonText}>
          <div style={styles.comingSoonTitle}>AxxWallet Coming Soon</div>
          <div style={styles.comingSoonSubtitle}>We're working hard to bring you the best wallet experience. Stay tuned!</div>
        </div>
      </div>

      {notification && (
        <div style={{ ...styles.notification, background: notification.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(34,197,94,0.9)" }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>AxxWallet</h1>
          <p style={styles.subtitle}>Your digital wallet for seamless transactions</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsContainer}>
        {["overview", "transactions", "analytics", "cards"].map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={styles.tabContent}>
          {/* Balance Cards */}
          <div style={styles.balanceGrid}>
            <div style={styles.mainBalanceCard}>
              <div style={styles.balanceIcon}>💳</div>
              <div style={styles.balanceLabel}>Main Balance</div>
              <div style={styles.balanceAmount}>KES {(walletData?.balance || 0).toLocaleString()}</div>
              <div style={styles.balanceHint}>Available for transactions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Spent</div>
              <div style={styles.statValue}>KES {totalSpent.toLocaleString()}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Received</div>
              <div style={styles.statValue}>KES {totalReceived.toLocaleString()}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.actionsSection}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <div style={styles.actionsGrid}>
              <button style={styles.actionBtn} onClick={() => setShowDepositModal(true)}>
                <div style={styles.actionIcon}>📥</div>
                <div style={styles.actionLabel}>Deposit</div>
                <div style={styles.comingSoonBadge}>Coming Soon</div>
              </button>
              <button style={styles.actionBtn} onClick={() => setShowWithdrawModal(true)}>
                <div style={styles.actionIcon}>📤</div>
                <div style={styles.actionLabel}>Withdraw</div>
                <div style={styles.comingSoonBadge}>Coming Soon</div>
              </button>
              <button style={styles.actionBtn} onClick={() => setShowTransferModal(true)}>
                <div style={styles.actionIcon}>💸</div>
                <div style={styles.actionLabel}>Transfer</div>
                <div style={styles.comingSoonBadge}>Coming Soon</div>
              </button>
              <button style={styles.actionBtn} onClick={() => setActiveTab("transactions")}>
                <div style={styles.actionIcon}>📋</div>
                <div style={styles.actionLabel}>History</div>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={styles.recentSection}>
            <h3 style={styles.sectionTitle}>Recent Transactions</h3>
            {transactions.slice(0, 5).length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💰</div>
                <p style={styles.emptyText}>No transactions yet</p>
              </div>
            ) : (
              <div style={styles.transactionList}>
                {transactions.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date)).map((tx, idx) => {
                  const statusStyle = getStatusStyle(tx.status);
                  return (
                    <div key={tx.transactionId || idx} style={styles.txCard}>
                      <div style={styles.txLeft}>
                        <div style={styles.txIcon}>{tx.type === "transfer_received" ? "💰" : "💳"}</div>
                        <div>
                          <div style={styles.txPlan}>{tx.plan || tx.type || "Payment"}</div>
                          <div style={styles.txDate}>
                            {tx.date ? new Date(tx.date).toLocaleDateString("en-KE", {
                              year: "numeric", month: "short", day: "numeric",
                            }) : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div style={styles.txRight}>
                        <div style={styles.txAmount}>
                          {tx.type === "transfer_received" ? "+" : "-"}KES {(tx.amount || 0).toLocaleString()}
                        </div>
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
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div style={styles.tabContent}>
          <div style={styles.transactionsHeader}>
            <h3 style={styles.sectionTitle}>Transaction History</h3>
            <div style={styles.filterRow}>
              {["all", "success", "pending", "failed"].map((f) => (
                <button
                  key={f}
                  style={{ ...styles.filterBtn, ...(f === "all" ? styles.filterBtnActive : {}) }}
                  onClick={() => { }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💰</div>
              <h2 style={styles.emptyTitle}>No Transactions</h2>
              <p style={styles.emptyText}>You haven't made any transactions yet.</p>
              <Link to="/listings" style={styles.browseBtn}>Browse Properties</Link>
            </div>
          ) : (
            <div style={styles.transactionList}>
              {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((tx, idx) => {
                const statusStyle = getStatusStyle(tx.status);
                return (
                  <div key={tx.transactionId || idx} style={styles.txCard}>
                    <div style={styles.txLeft}>
                      <div style={styles.txIcon}>{tx.type === "transfer_received" ? "💰" : "💳"}</div>
                      <div>
                        <div style={styles.txPlan}>{tx.plan || tx.type || "Payment"}</div>
                        <div style={styles.txDate}>
                          {tx.date ? new Date(tx.date).toLocaleDateString("en-KE", {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          }) : "N/A"}
                        </div>
                        {tx.transactionId && <div style={styles.txId}>ID: {tx.transactionId}</div>}
                      </div>
                    </div>
                    <div style={styles.txRight}>
                      <div style={styles.txAmount}>
                        {tx.type === "transfer_received" ? "+" : "-"}KES {(tx.amount || 0).toLocaleString()}
                      </div>
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
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div style={styles.tabContent}>
          <h3 style={styles.sectionTitle}>Wallet Analytics</h3>
          <div style={styles.analyticsGrid}>
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsLabel}>Total Transactions</div>
              <div style={styles.analyticsValue}>{transactions.length}</div>
            </div>
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsLabel}>Success Rate</div>
              <div style={styles.analyticsValue}>
                {transactions.length > 0
                  ? Math.round((transactions.filter(t => t.status === "success").length / transactions.length) * 100)
                  : 0}%
              </div>
            </div>
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsLabel}>Average Transaction</div>
              <div style={styles.analyticsValue}>
                KES {transactions.length > 0
                  ? Math.round(totalSpent / transactions.filter(t => t.status === "success").length)
                  : 0}
              </div>
            </div>
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsLabel}>This Month</div>
              <div style={styles.analyticsValue}>
                KES {transactions
                  .filter(t => {
                    const txDate = new Date(t.date);
                    const now = new Date();
                    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                  })
                  .reduce((sum, t) => sum + (t.amount || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === "cards" && (
        <div style={styles.tabContent}>
          <h3 style={styles.sectionTitle}>Virtual Cards</h3>
          <div style={styles.virtualCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardChip}>📱</div>
              <div style={styles.cardBrand}>AxxWallet</div>
            </div>
            <div style={styles.cardNumber}>•••• •••• •••• 1234</div>
            <div style={styles.cardFooter}>
              <div>
                <div style={styles.cardLabel}>Card Holder</div>
                <div style={styles.cardValue}>{user?.name || "User"}</div>
              </div>
              <div>
                <div style={styles.cardLabel}>Expires</div>
                <div style={styles.cardValue}>12/28</div>
              </div>
            </div>
          </div>
          <div style={styles.cardInfo}>
            <p style={styles.cardInfoText}>
              Virtual cards allow you to make online payments securely.
              Your card details are protected with bank-level encryption.
            </p>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDepositModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Deposit Funds</h3>
            <form onSubmit={handleDeposit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (KES)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={styles.formInput}
                  placeholder="Enter amount"
                  min="10"
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowDepositModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Deposit via M-Pesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Withdraw Funds</h3>
            <form onSubmit={handleWithdraw}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (KES)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={styles.formInput}
                  placeholder="Enter amount"
                  min="100"
                  max={walletData?.balance || 0}
                />
              </div>
              <div style={styles.formHint}>Available: KES {(walletData?.balance || 0).toLocaleString()}</div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowWithdrawModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTransferModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Transfer Funds</h3>
            <form onSubmit={handleTransfer}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Recipient Phone</label>
                <input
                  type="tel"
                  value={transferPhone}
                  onChange={(e) => setTransferPhone(e.target.value)}
                  style={styles.formInput}
                  placeholder="07XXXXXXXX"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (KES)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  style={styles.formInput}
                  placeholder="Enter amount"
                  min="10"
                  max={walletData?.balance || 0}
                />
              </div>
              <div style={styles.formHint}>Available: KES {(walletData?.balance || 0).toLocaleString()}</div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Transfer
                </button>
              </div>
            </form>
          </div>
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
  notification: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 24px",
    borderRadius: "12px",
    color: "white",
    fontWeight: 600,
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  comingSoonBanner: {
    background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.15) 100%)",
    border: "2px solid rgba(251,191,36,0.5)",
    borderRadius: 16,
    padding: "24px 32px",
    maxWidth: 1200,
    margin: "0 auto 30px",
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  comingSoonIcon: { fontSize: "3rem" },
  comingSoonText: { flex: 1 },
  comingSoonTitle: {
    color: "#fbbf24",
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    maxWidth: 1200,
    margin: "0 auto 30px",
  },
  backBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid rgba(251,191,36,0.2)",
    borderTop: "4px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },

  tabsContainer: {
    display: "flex",
    gap: 8,
    maxWidth: 1200,
    margin: "0 auto 30px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "12px 24px",
    background: "rgba(30,41,59,0.8)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    borderColor: "#3b82f6",
  },
  tabContent: { maxWidth: 1200, margin: "0 auto" },

  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  mainBalanceCard: {
    background: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.1) 100%)",
    border: "1px solid rgba(251,191,36,0.3)",
    borderRadius: 16,
    padding: 28,
    textAlign: "center",
  },
  balanceIcon: { fontSize: "2.5rem", marginBottom: 12 },
  balanceLabel: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: 8 },
  balanceAmount: { color: "#fbbf24", fontSize: "2.5rem", fontWeight: 700, marginBottom: 4 },
  balanceHint: { color: "#64748b", fontSize: "0.8rem" },
  statCard: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 28,
    textAlign: "center",
  },
  statLabel: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: 8 },
  statValue: { color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 700 },

  actionsSection: { marginBottom: 30 },
  sectionTitle: { color: "#f1f5f9", fontSize: "1.25rem", margin: "0 0 16px", fontWeight: 600 },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16,
  },
  actionBtn: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 24,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: { fontSize: "2rem" },
  actionLabel: { color: "#f1f5f9", fontSize: "0.9rem", fontWeight: 600 },
  comingSoonBadge: {
    background: "rgba(251,191,36,0.2)",
    color: "#fbbf24",
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 4,
    marginTop: 4,
  },

  recentSection: { marginBottom: 30 },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    background: "rgba(30,41,59,0.5)",
    borderRadius: 16,
    border: "2px dashed #475569",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: 16 },
  emptyTitle: { color: "#f1f5f9", fontSize: "1.25rem", margin: "0 0 8px", fontWeight: 600 },
  emptyText: { color: "#94a3b8", fontSize: "0.95rem", marginBottom: 16 },
  browseBtn: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },

  transactionList: { display: "flex", flexDirection: "column", gap: 12 },
  txCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "18px 24px",
    flexWrap: "wrap",
    gap: 12,
  },
  txLeft: { display: "flex", alignItems: "center", gap: 14 },
  txIcon: { fontSize: "1.5rem", background: "rgba(251,191,36,0.1)", borderRadius: 10, padding: 10 },
  txPlan: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem", marginBottom: 2 },
  txDate: { color: "#94a3b8", fontSize: "0.8rem" },
  txId: { color: "#64748b", fontSize: "0.75rem", marginTop: 2 },
  txRight: { textAlign: "right" },
  txAmount: { color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 },
  txStatus: { display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 },

  transactionsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: {
    padding: "8px 16px",
    background: "rgba(30,41,59,0.8)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  filterBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  analyticsCard: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
  },
  analyticsLabel: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: 8 },
  analyticsValue: { color: "#fbbf24", fontSize: "2rem", fontWeight: 700 },

  virtualCard: {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    margin: "0 auto 20px",
    boxShadow: "0 8px 32px rgba(59,130,246,0.3)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  cardChip: { fontSize: "2rem" },
  cardBrand: { color: "white", fontSize: "1.25rem", fontWeight: 700 },
  cardNumber: { color: "white", fontSize: "1.5rem", letterSpacing: "4px", marginBottom: 24, fontFamily: "monospace" },
  cardFooter: { display: "flex", justifyContent: "space-between" },
  cardLabel: { color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", marginBottom: 4 },
  cardValue: { color: "white", fontSize: "1rem", fontWeight: 600 },
  cardInfo: { background: "rgba(30,41,59,0.8)", borderRadius: 12, padding: 20, textAlign: "center" },
  cardInfoText: { color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1e293b",
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: "90%",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  modalTitle: { color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 24px", fontWeight: 600 },
  formGroup: { marginBottom: 20 },
  formLabel: { display: "block", color: "#94a3b8", fontSize: "0.9rem", marginBottom: 8 },
  formInput: {
    width: "100%",
    padding: "12px",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#f1f5f9",
    fontSize: "1rem",
  },
  formHint: { color: "#64748b", fontSize: "0.8rem", marginBottom: 20 },
  modalActions: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: {
    padding: "10px 20px",
    background: "rgba(148,163,184,0.2)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  submitBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
