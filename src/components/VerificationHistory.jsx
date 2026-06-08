import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerificationHistory = ({ history = [] }) => {
  const { token } = useContext(AuthContext);
  const [expandedId, setExpandedId] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationHistory = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
        const response = await fetch(`${API_BASE}/kyc-verification/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setVerificationHistory(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch verification history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVerificationHistory();
    }
  }, [token]);

  const displayHistory = verificationHistory.length > 0 ? verificationHistory : history;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#fbbf24';
      case 'under_review':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'pending':
        return '○';
      case 'under_review':
        return '◐';
      default:
        return '○';
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1:
        return 'Basic';
      case 2:
        return 'Identity';
      case 3:
        return 'Address';
      case 4:
        return 'Business';
      default:
        return 'Unknown';
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Verification History</h3>

      {loading ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Loading history...</p>
        </div>
      ) : displayHistory.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <p style={styles.emptyText}>No verification history yet</p>
        </div>
      ) : (
        <div style={styles.historyList}>
          {displayHistory.map((item) => (
            <div
              key={item._id}
              style={styles.historyItem}
              onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
            >
              <div style={styles.historyHeader}>
                <div style={styles.historyInfo}>
                  <div style={styles.historyLevel}>
                    Level {item.verificationLevel}: {getLevelName(item.verificationLevel)}
                  </div>
                  <div style={styles.historyDate}>
                    Submitted: {formatDate(item.submittedAt)}
                  </div>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  borderColor: getStatusColor(item.status),
                  color: getStatusColor(item.status)
                }}>
                  {getStatusIcon(item.status)} {item.status.replace('_', ' ')}
                </div>
              </div>

              {expandedId === item._id && (
                <div style={styles.expandedContent}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Submitted At:</span>
                    <span style={styles.detailValue}>{formatDate(item.submittedAt)}</span>
                  </div>

                  {item.reviewedAt && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Reviewed At:</span>
                      <span style={styles.detailValue}>{formatDate(item.reviewedAt)}</span>
                    </div>
                  )}

                  {item.rejectionReason && (
                    <div style={styles.rejectionReason}>
                      <span style={styles.rejectionLabel}>Rejection Reason:</span>
                      <span style={styles.rejectionText}>{item.rejectionReason}</span>
                    </div>
                  )}

                  <div style={styles.documentsSection}>
                    <div style={styles.documentsTitle}>Documents</div>
                    {item.documents && item.documents.map((doc, index) => (
                      <div key={index} style={styles.documentItem}>
                        <span style={styles.documentName}>{doc.type}</span>
                        <div style={{
                          ...styles.documentStatus,
                          color: getStatusColor(doc.status)
                        }}>
                          {getStatusIcon(doc.status)} {doc.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  {item.status === 'rejected' && (
                    <button style={styles.resubmitButton} onClick={() => window.location.href = '/verification'}>
                      Resubmit Verification
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 41, 0.9) 100%)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 20px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyItem: {
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'rgba(15, 23, 41, 0.5)',
  },
  historyInfo: {
    flex: 1,
  },
  historyLevel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  historyDate: {
    fontSize: '12px',
    color: '#64748b',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  expandedContent: {
    padding: '16px',
    background: 'rgba(15, 23, 41, 0.3)',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  rejectionReason: {
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
  },
  rejectionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    display: 'block',
    marginBottom: '4px',
  },
  rejectionText: {
    fontSize: '13px',
    color: '#fca5a5',
  },
  documentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  documentsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(15, 23, 41, 0.5)',
    borderRadius: '8px',
  },
  documentName: {
    fontSize: '13px',
    color: '#cbd5e1',
  },
  documentStatus: {
    fontSize: '12px',
    fontWeight: '600',
  },
  resubmitButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#0f1729',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default VerificationHistory;
