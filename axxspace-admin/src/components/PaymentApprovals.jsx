import { useEffect, useState } from "react";
import API from "../api/api";
import "./PaymentApprovals.css";

export default function PaymentApprovals({ onRefresh }) {
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAgentId, setRejectingAgentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadPendingPurchases();
  }, []);

  const loadPendingPurchases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/agents/pending-purchases");
      setPendingPurchases(res.data || []);
    } catch (err) {
      console.error("Failed to load pending purchases:", err);
      setMessage("Failed to load pending purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agentId) => {
    try {
      setActionLoading(agentId);
      console.log("📤 [Admin] Approving payment for agent:", agentId);
      const response = await API.put(`/agents/approve-purchase/${agentId}`);
      console.log("✅ [Admin] Approval response:", response);
      setMessage("Package approved successfully!");
      setPendingPurchases(prev => prev.filter(p => p._id !== agentId));
      if (onRefresh) onRefresh();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Failed to approve package";
      console.error("❌ [Admin] Approval error:", err.response?.data || err);
      setMessage("Error: " + errMsg);
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const openRejectModal = (agentId) => {
    setRejectingAgentId(agentId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingAgentId) return;
    try {
      setActionLoading(rejectingAgentId);
      await API.put(`/agents/reject-purchase/${rejectingAgentId}`, {
        reason: rejectionReason || undefined
      });
      setMessage("Package rejected successfully!");
      setPendingPurchases(prev => prev.filter(p => p._id !== rejectingAgentId));
      setShowRejectModal(false);
      setRejectingAgentId(null);
      setRejectionReason("");
      if (onRefresh) onRefresh();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to reject package";
      setMessage("Error: " + errMsg);
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) {
    return <div className="payment-approvals-container"><div className="loading">Loading pending purchases...</div></div>;
  }

  if (pendingPurchases.length === 0) {
    return (
      <div className="payment-approvals-container">
        <div className="empty-state">
          <p>No pending package purchases at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-approvals-container">
      {message && (
        <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div className="payment-approvals-header">
        <h2>Package Purchase Approvals</h2>
        <p>{pendingPurchases.length} pending</p>
      </div>

      <div className="payment-approvals-table-wrapper">
        <table className="payment-approvals-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Package Tier</th>
              <th>Amount (KSh)</th>
              <th>Payment Reference</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPurchases.map(purchase => {
              const pp = purchase.pendingPurchase;
              const submittedDate = pp?.submittedAt ? new Date(pp.submittedAt).toLocaleDateString() : "—";
              const paymentRef = pp?.paymentMessage ? pp.paymentMessage.substring(0, 20) + "..." : "—";
              
              return (
                <tr key={purchase._id}>
                  <td className="agent-name">{purchase.name}</td>
                  <td>{purchase.email}</td>
                  <td>{purchase.phone || "—"}</td>
                  <td className="tier-badge">{pp?.tier || "—"}</td>
                  <td className="amount">{pp?.amount ? pp.amount.toLocaleString() : "—"}</td>
                  <td className="payment-ref" title={pp?.paymentMessage}>{paymentRef}</td>
                  <td>{submittedDate}</td>
                  <td className="actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(purchase._id)}
                      disabled={actionLoading === purchase._id}
                    >
                      {actionLoading === purchase._id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => openRejectModal(purchase._id)}
                      disabled={actionLoading === purchase._id}
                    >
                      {actionLoading === purchase._id ? "Processing..." : "Reject"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reject Package Purchase</h3>
            <p>Provide a rejection reason (optional):</p>
            <textarea
              className="rejection-reason"
              placeholder="e.g., Invalid payment reference, Duplicate submission, etc."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading === rejectingAgentId}
              >
                Cancel
              </button>
              <button
                className="btn btn-confirm-reject"
                onClick={handleReject}
                disabled={actionLoading === rejectingAgentId}
              >
                {actionLoading === rejectingAgentId ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
