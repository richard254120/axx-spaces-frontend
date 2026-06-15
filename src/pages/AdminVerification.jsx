import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { openProtectedFile, resolveMediaUrl } from '../utils/fileLinks';

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
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const response = await fetch(`${API_BASE}/kyc-verification/admin/${verificationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes: 'Verification approved by Admin' }),
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(verifications.filter(v => v._id !== verificationId));
        setSelectedVerification(null);
        alert('✅ Verification approved successfully');
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
    if (!reason?.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const response = await fetch(`${API_BASE}/kyc-verification/admin/${verificationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason: reason, adminNotes: 'Verification rejected by Admin' }),
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(verifications.filter(v => v._id !== verificationId));
        setSelectedVerification(null);
        alert('❌ Verification rejected successfully');
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
      case 1: return 'Student Verification';
      case 2: return 'Standard Verification';
      case 3: return 'Premium Physical Verification';
      default: return 'Unknown Level';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return '#3b82f6';
      case 2: return '#10b981';
      case 3: return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading verification requests...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛡️ KYC Verification Workflows</h1>
      <p style={styles.subtitle}>Review user submissions for Student, Standard, and Premium tiers</p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.content}>
        <div style={styles.listSection}>
          <h2 style={styles.sectionTitle}>Pending Verification Requests ({verifications.length})</h2>
          
          {verifications.length === 0 ? (
            <div style={styles.empty}>🎉 No pending verifications to review.</div>
          ) : (
            <div style={styles.verificationList}>
              {verifications.map((verification) => (
                <div
                  key={verification._id}
                  style={{
                    ...styles.verificationCard,
                    ...(selectedVerification?._id === verification._id && styles.verificationCardSelected)
                  }}
                  onClick={() => setSelectedVerification(verification)}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{verification.user?.name || 'Unknown User'}</div>
                      <div style={styles.userEmail}>{verification.user?.email || 'No email provided'}</div>
                    </div>
                    <div style={{ ...styles.levelBadge, background: `${getLevelColor(verification.verificationLevel)}18`, color: getLevelColor(verification.verificationLevel), borderColor: `${getLevelColor(verification.verificationLevel)}35` }}>
                      Lvl {verification.verificationLevel}
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
                      <span style={styles.infoLabel}>Type:</span>
                      <span style={{ ...styles.infoValue, fontWeight: '700' }}>{getLevelName(verification.verificationLevel)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedVerification ? (
          <div style={styles.detailSection}>
            <div style={styles.detailHeader}>
              <h2 style={styles.sectionTitle}>Review Submission</h2>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedVerification(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.detailContent}>
              <div style={styles.detailGroup}>
                <h3 style={styles.detailGroupTitle}>👤 User Information</h3>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Full Name:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.name || 'N/A'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Email Address:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.email || 'N/A'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Phone Number:</span>
                  <span style={styles.detailValue}>{selectedVerification.user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <h3 style={styles.detailGroupTitle}>📋 Verification Status</h3>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Requested Level:</span>
                  <span style={{ ...styles.detailValue, color: getLevelColor(selectedVerification.verificationLevel), fontWeight: '700' }}>
                    Level {selectedVerification.verificationLevel}: {getLevelName(selectedVerification.verificationLevel)}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Current Status:</span>
                  <span style={styles.statusBadge}>{selectedVerification.status.toUpperCase()}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Submitted At:</span>
                  <span style={styles.detailValue}>
                    {new Date(selectedVerification.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedVerification.idType && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>📄 Government Document Details</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Document Type:</span>
                    <span style={styles.detailValue}>{selectedVerification.idType.toUpperCase().replace(/_/g, ' ')}</span>
                  </div>
                </div>
              )}

              {/* Physical Details (Level 3) */}
              {selectedVerification.physicalDetails && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>📍 Physical Location & Scheduling Notes</h3>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {selectedVerification.physicalDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {selectedVerification.documents && selectedVerification.documents.length > 0 && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>📁 Uploaded Documents</h3>
                  {selectedVerification.documents.map((doc, index) => (
                    <div key={index} style={styles.documentItem}>
                      <div style={styles.documentInfo}>
                        <span style={styles.documentType}>{doc.type?.toUpperCase().replace(/_/g, ' ')}</span>
                        <span style={styles.documentStatus}>Size: {(doc.size / 1024).toFixed(1)} KB</span>
                      </div>
                      {doc.url && (
                        <button
                          type="button"
                          onClick={() => openProtectedFile(doc.url).catch((err) => alert(err.message))}
                          style={{ ...styles.documentLink, background: "none", border: "none", cursor: "pointer" }}
                        >
                          👁️ View / Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Selfie & Face Match */}
              {selectedVerification.selfie && selectedVerification.selfie.url && (
                <div style={styles.detailGroup}>
                  <h3 style={styles.detailGroupTitle}>📸 Biometric Verification Selfie</h3>
                  <img
                    src={resolveMediaUrl(selectedVerification.selfie.url)}
                    alt="Biometric Selfie"
                    style={styles.selfieImage}
                  />
                  <button
                    type="button"
                    onClick={() => openProtectedFile(selectedVerification.selfie.url).catch((err) => alert(err.message))}
                    style={{ ...styles.documentLink, marginTop: "8px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    📥 Download selfie
                  </button>
                  {selectedVerification.selfie.faceMatchScore !== undefined && (
                    <div style={styles.faceMatchScore}>
                      🤖 AI Face Match Similarity Score:{' '}
                      <strong style={{ color: selectedVerification.selfie.faceMatchScore >= 80 ? '#10b981' : '#f59e0b', fontSize: '14px' }}>
                        {selectedVerification.selfie.faceMatchScore}%
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <div style={styles.actionSection}>
                <div style={styles.rejectionInput}>
                  <label style={styles.textareaLabel}>Rejection Reason (Required if rejecting):</label>
                  <textarea
                    style={styles.rejectionTextarea}
                    placeholder="Enter reason for rejection (e.g. Expired ID, blurry selfie, utility bill mismatch)"
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
                    {actionLoading ? 'Processing...' : '✓ Approve Request'}
                  </button>
                  <button
                    style={styles.rejectButton}
                    onClick={() => {
                      const reason = document.getElementById('rejectionReason').value;
                      handleReject(selectedVerification._id, reason);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : '✕ Reject Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.noSelectionCard}>
            <div style={styles.noSelectionIcon}>🛡️</div>
            <h3>No Submission Selected</h3>
            <p>Choose a pending request from the left sidebar to review details and take actions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #090e1a 0%, #151c2c 100%)',
    padding: '40px 20px',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '32px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  error: {
    padding: '14px 20px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '14px',
    marginBottom: '20px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: '28px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  listSection: {
    background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.8) 0%, rgba(10, 15, 28, 0.95) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '24px',
    height: 'fit-content',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 16px 0',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b',
    fontSize: '13px',
  },
  verificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  verificationCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  verificationCardSelected: {
    borderColor: '#c9a84c',
    background: 'rgba(201, 168, 76, 0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  levelBadge: {
    padding: '4px 10px',
    border: '1px solid',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
  detailSection: {
    background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.8) 0%, rgba(10, 15, 28, 0.95) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '28px',
    height: 'fit-content',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '16px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '20px',
    cursor: 'pointer',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailGroup: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '16px',
  },
  detailGroupTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#cbd5e1',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#fbbf24',
    background: 'rgba(251,191,36,0.12)',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(251,191,36,0.25)',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  documentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  documentType: {
    fontSize: '13px',
    color: '#cbd5e1',
    fontWeight: '600',
  },
  documentStatus: {
    fontSize: '11px',
    color: '#64748b',
  },
  documentLink: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
    textDecoration: 'none',
  },
  selfieImage: {
    maxWidth: '220px',
    maxHeight: '220px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'block',
    marginTop: '6px',
  },
  faceMatchScore: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '10px',
  },
  rejectionInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  textareaLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  rejectionTextarea: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  },
  actionButtons: {
    display: 'flex',
    gap: '14px',
  },
  approveButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#090e1a',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  noSelectionCard: {
    background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.5) 0%, rgba(10, 15, 28, 0.7) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '18px',
    padding: '60px 40px',
    textAlign: 'center',
    color: '#94a3b8',
    height: 'fit-content',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  noSelectionIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7,
  },
};

export default AdminVerification;
