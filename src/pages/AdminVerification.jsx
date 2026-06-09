import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminVerification = () => {
  const { token } = useContext(AuthContext);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, [token]);

  const fetchPendingVerifications = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const response = await fetch(`${API_BASE}/kyc-verification/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(data.data);
      } else {
        setError(data.message || 'Failed to fetch verifications');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId) => {
    setActionLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const response = await fetch(`${API_BASE}/kyc-verification/admin/${verificationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes: 'Verification approved' }),
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(verifications.filter(v => v._id !== verificationId));
        setSelectedVerification(null);
      } else {
        setError(data.message || 'Failed to approve verification');
      }
    } catch (err) {
      setError(err.message || 'Failed to approve verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (verificationId, reason) => {
    if (!reason) {
      setError('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const response = await fetch(`${API_BASE}/kyc-verification/admin/${verificationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason: reason, adminNotes: 'Verification rejected' }),
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(verifications.filter(v => v._id !== verificationId));
        setSelectedVerification(null);
      } else {
        setError(data.message || 'Failed to reject verification');
      }
    } catch (err) {
      setError(err.message || 'Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Basic';
      case 2: return 'Identity';
      case 3: return 'Address';
      case 4: return 'Business';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading verifications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Verification Management</h1>
      <p style={styles.subtitle}>Review and manage user verification requests</p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.content}>
        <div style={styles.listSection}>
          <h2 style={styles.sectionTitle}>Pending Verifications ({verifications.length})</h2>
          
          {verifications.length === 0 ? (
            <div style={styles.empty}>No pending verifications</div>
          ) : (
            <div style={styles.verificationList}>
              {verifications.map((verification) => (
                <div
                  key={verification._id}
                  style={styles.verificationCard}
                  onClick={() => setSelectedVerification(verification)}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{verification.user?.name || 'Unknown'}</div>
                      <div style={styles.userEmail}>{verification.user?.email || 'No email'}</div>
                    </div>
                    <div style={styles.levelBadge}>
                      Level {verification.verificationLevel}: {getLevelName(verification.verificationLevel)}
                    </div>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Submitted:</span>
                      <span style={styles.infoValue}>
                        {new Date(verification.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Status:</span>
                      <span style={styles.status}>{verification.status}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Documents:</span>
                      <span style={styles.infoValue}>{verification.documents?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedVerification && (
          <div style={styles.detailSection}>
            <div style={styles.detailHeader}>
              <h2 style={styles.sectionTitle}>Verification Details</h2>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedVerification(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.detailContent}>
              <div style={styles.detailGroup}>
                <h3 style={styles.detailGroupTitle}>User Information</h3>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Name:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.name || 'N/A'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Email:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.email || 'N/A'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Phone:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <h3 style={styles.detailGroupTitle}>Verification Information</h3>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Level:</span>
                  <span style={styles.detailValue}>
                    Level {selectedVerification.verificationLevel}: {getLevelName(selectedVerification.verificationLevel)}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status:</span>
                  <span style={styles.status}>{selectedVerification.status}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Submitted:</span>
                  <span style={styles.detailValue}>
                    {new Date(selectedVerification.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedVerification.idType && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>ID Type</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailValue}>{selectedVerification.idType}</span>
                  </div>
                </div>
              )}

              {selectedVerification.businessName && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>Business Information</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Business Name:</span>
                    <span style={styles.detailValue}>{selectedVerification.businessName}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Tax ID:</span>
                    <span style={styles.detailValue}>{selectedVerification.taxId || 'N/A'}</span>
                  </div>
                </div>
              )}

              <div style={styles.detailGroup}>
                <h3 style={styles.detailGroupTitle}>Documents</h3>
                {selectedVerification.documents?.map((doc, index) => (
                  <div key={index} style={styles.documentItem}>
                    <div style={styles.documentInfo}>
                      <span style={styles.documentType}>{doc.type}</span>
                      <span style={styles.documentStatus}>{doc.status}</span>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.documentLink}
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {selectedVerification.selfie && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>Selfie</h3>
                  {selectedVerification.selfie.url && (
                    <img
                      src={selectedVerification.selfie.url}
                      alt="Selfie"
                      style={styles.selfieImage}
                    />
                  )}
                  {selectedVerification.selfie.faceMatchScore && (
                    <div style={styles.faceMatchScore}>
                      Face Match Score: {selectedVerification.selfie.faceMatchScore}%
                    </div>
                  )}
                </div>
              )}

              <div style={styles.actionSection}>
                <div style={styles.rejectionInput}>
                  <textarea
                    style={styles.rejectionTextarea}
                    placeholder="Rejection reason (required for rejection)"
                    id="rejectionReason"
                    rows={3}
                  />
                </div>
                <div style={styles.actionButtons}>
                  <button
                    style={styles.approveButton}
                    onClick={() => handleApprove(selectedVerification._id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    style={styles.rejectButton}
                    onClick={() => {
                      const reason = document.getElementById('rejectionReason').value;
                      handleReject(selectedVerification._id, reason);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '40px 20px',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '32px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
  },
  error: {
    padding: '12px 20px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    marginBottom: '20px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  listSection: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    height: 'fit-content',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b',
  },
  verificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  verificationCard: {
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  levelBadge: {
    padding: '4px 12px',
    background: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fbbf24',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  infoLabel: {
    color: '#64748b',
  },
  infoValue: {
    color: '#cbd5e1',
    fontWeight: '500',
  },
  status: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailSection: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    height: 'fit-content',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '24px',
    cursor: 'pointer',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  detailGroup: {
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px',
  },
  detailGroupTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '12px',
  },
  detailItem: {
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
    color: '#cbd5e1',
    fontWeight: '500',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(15, 23, 41, 0.3)',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  documentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  documentType: {
    fontSize: '13px',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  documentStatus: {
    fontSize: '11px',
    color: '#64748b',
  },
  documentLink: {
    fontSize: '12px',
    color: '#3b82f6',
    textDecoration: 'none',
  },
  selfieImage: {
    maxWidth: '200px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  faceMatchScore: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#64748b',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rejectionInput: {
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
  },
  rejectionTextarea: {
    width: '100%',
    background: 'rgba(15, 23, 41, 0.8)',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
    resize: 'vertical',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  approveButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default AdminVerification;
