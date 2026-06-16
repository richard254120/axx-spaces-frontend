import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:1000";

export default function BoostManagement() {
  const [boosts, setBoosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const planConfig = {
    "3weeks": { label: "3 Weeks", price: 100, duration: "21 days" },
    "4months": { label: "4 Months", price: 700, duration: "120 days" },
    "6months": { label: "6 Months", price: 1000, duration: "180 days" },
  };

  useEffect(() => {
    loadBoosts();
  }, [filter]);

  const loadBoosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const endpoint = filter === "all" ? "/all" : "/pending";
      const response = await axios.get(`${API_BASE}/api/boosts${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoosts(response.data);
    } catch (error) {
      console.error("Error loading boosts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (boostId) => {
    if (!confirm("Approve this boost payment? This will feature the listing.")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_BASE}/api/boosts/${boostId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Boost approved successfully! Listing is now featured.");
      loadBoosts();
    } catch (error) {
      console.error("Error approving boost:", error);
      alert(error.response?.data?.error || "Failed to approve boost");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (boostId) => {
    setSelectedBoost(boostId);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_BASE}/api/boosts/${selectedBoost}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Boost rejected successfully.");
      setSelectedBoost(null);
      setRejectionReason("");
      loadBoosts();
    } catch (error) {
      console.error("Error rejecting boost:", error);
      alert(error.response?.data?.error || "Failed to reject boost");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "approved":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      case "expired":
        return "#64748b";
      default:
        return "#64748b";
    }
  };

  const getListingTitle = (boost) => {
    return boost.listingTitle || boost.listing?.title || boost.listing?.name || "Unknown";
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <h2 style={styles.header}>Boost Payment Management</h2>

      {/* Filters */}
      <div style={styles.filters}>
        <button
          style={{ ...styles.filterButton, ...(filter === "pending" ? styles.activeFilter : {}) }}
          onClick={() => setFilter("pending")}
        >
          Pending ({boosts.filter(b => b.status === "pending").length})
        </button>
        <button
          style={{ ...styles.filterButton, ...(filter === "all" ? styles.activeFilter : {}) }}
          onClick={() => setFilter("all")}
        >
          All Boosts
        </button>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{boosts.filter(b => b.status === "pending").length}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{boosts.filter(b => b.status === "approved").length}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{boosts.filter(b => b.status === "rejected").length}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {boosts.filter(b => b.status === "approved").reduce((sum, b) => sum + b.amount, 0)}
          </div>
          <div style={styles.statLabel}>Total Revenue (KES)</div>
        </div>
      </div>

      {/* Boosts List */}
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : boosts.length === 0 ? (
        <div style={styles.empty}>No boosts found</div>
      ) : (
        <div style={styles.boostsList}>
          {boosts.map((boost) => {
            const config = planConfig[boost.plan];
            return (
              <div key={boost._id} style={styles.boostCard}>
                <div style={styles.boostHeader}>
                  <span style={styles.boostType}>{boost.listingModel}</span>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: `${getStatusColor(boost.status)}20`,
                      color: getStatusColor(boost.status),
                    }}
                  >
                    {boost.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.boostTitle}>{getListingTitle(boost)}</div>

                <div style={styles.boostDetails}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Plan:</span>
                    <span style={styles.detailValue}>{config?.label} ({config?.duration})</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Amount:</span>
                    <span style={styles.detailValue}>KES {boost.amount}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>M-Pesa Ref:</span>
                    <span style={styles.detailValue}>{boost.mpesaRef || "N/A"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>User:</span>
                    <span style={styles.detailValue}>
                      {boost.userName || boost.user?.name} ({boost.userPhone || boost.user?.phone})
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Submitted:</span>
                    <span style={styles.detailValue}>
                      {new Date(boost.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {boost.status === "pending" && (
                  <div style={styles.actions}>
                    <button
                      style={styles.approveButton}
                      onClick={() => handleApprove(boost._id)}
                      disabled={loading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      style={styles.rejectButton}
                      onClick={() => handleReject(boost._id)}
                      disabled={loading}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {boost.status === "rejected" && boost.rejectionReason && (
                  <div style={styles.rejectionReason}>
                    <strong>Rejection Reason:</strong> {boost.rejectionReason}
                  </div>
                )}

                {boost.status === "approved" && (
                  <div style={styles.approvedInfo}>
                    <span>✓ Approved on {new Date(boost.approvedAt).toLocaleString()}</span>
                    <span>Expires on {new Date(boost.expiresAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBoost && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Reject Boost Payment</h3>
            <textarea
              style={styles.textarea}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setSelectedBoost(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>
              <button style={styles.confirmRejectButton} onClick={confirmReject}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  filterButton: {
    padding: "10px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeFilter: {
    background: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  boostsList: {
    display: "grid",
    gap: "16px",
  },
  boostCard: {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  boostHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  boostType: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  boostTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  boostDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "2px",
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
  },
  actions: {
    display: "flex",
    gap: "12px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },
  approveButton: {
    flex: 1,
    padding: "10px 20px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  rejectButton: {
    flex: 1,
    padding: "10px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  rejectionReason: {
    marginTop: "12px",
    padding: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#991b1b",
  },
  approvedInfo: {
    marginTop: "12px",
    padding: "12px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#166534",
    display: "flex",
    justifyContent: "space-between",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "500px",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    marginBottom: "16px",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 20px",
    background: "white",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  confirmRejectButton: {
    padding: "10px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

const css = `
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
