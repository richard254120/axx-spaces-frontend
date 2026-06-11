import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerificationStatus = ({ verificationLevel = 1, status = 'pending' }) => {
  const { token } = useContext(AuthContext);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectionReason, setShowRejectionReason] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
        const response = await fetch(`${API_BASE}/kyc-verification/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setVerificationData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVerificationStatus();
    }
  }, [token]);

  if (loading) {
    return <div style={styles.container}>Loading verification status...</div>;
  }

  const currentLevel = verificationData?.verificationLevel || verificationLevel;
  const currentStatus = verificationData?.status || status;
  const levels = [
    { level: 1, name: 'Basic', description: 'Email & Phone Verified' },
    { level: 2, name: 'Identity', description: 'ID & Selfie Verified' },
    { level: 3, name: 'Address', description: 'Address Verified' },
    { level: 4, name: 'Business', description: 'Business Verified' },
  ];

  const getStatusColor = (level) => {
    if (level < currentLevel) return '#22c55e'; // Completed
    if (level === currentLevel) return currentStatus === 'approved' ? '#22c55e' : '#fbbf24'; // Current
    return '#334155'; // Pending
  };

  const getStatusIcon = (level) => {
    if (level < currentLevel) return '✓';
    if (level === currentLevel) return currentStatus === 'approved' ? '✓' : '○';
    return '○';
  };

  const getBenefits = () => {
    switch (currentLevel) {
      case 1:
        return ['Basic platform access', 'Browse listings', 'Contact sellers'];
      case 2:
        return ['All Level 1 benefits', 'List properties', 'Receive payments', 'Verified badge'];
      case 3:
        return ['All Level 2 benefits', 'Priority listings', 'Higher trust score', 'Lower fees'];
      case 4:
        return ['All Level 3 benefits', 'Business dashboard', 'Bulk uploads', 'API access', 'Premium support'];
      default:
        return [];
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Verification Status</h3>
          <div style={styles.currentLevel}>
            Level {currentLevel}: {levels[currentLevel - 1]?.name}
          </div>
        </div>
        <div style={{
          ...styles.statusBadge,
          ...(currentStatus === 'approved' && styles.statusBadgeApproved),
          ...(currentStatus === 'pending' && styles.statusBadgePending),
          ...(currentStatus === 'rejected' && styles.statusBadgeRejected),
          ...(currentStatus === 'under_review' && styles.statusBadgePending),
        }}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace('_', ' ')}
        </div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          {levels.map((level) => (
            <div
              key={level.level}
              style={{
                ...styles.progressStep,
                ...(level.level < currentLevel && styles.progressStepCompleted),
                ...(level.level === currentLevel && styles.progressStepCurrent),
              }}
            >
              <div style={{
                ...styles.stepIcon,
                backgroundColor: getStatusColor(level.level),
              }}>
                {getStatusIcon(level.level)}
              </div>
              <div style={styles.stepLabel}>{level.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.benefitsSection}>
        <h4 style={styles.benefitsTitle}>Current Benefits</h4>
        <ul style={styles.benefitsList}>
          {getBenefits().map((benefit, index) => (
            <li key={index} style={styles.benefitItem}>
              <span style={styles.benefitIcon}>✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {currentStatus === 'rejected' && verificationData?.rejectionReason && (
        <div style={styles.rejectionSection}>
          <button
            style={styles.rejectionToggle}
            onClick={() => setShowRejectionReason(!showRejectionReason)}
          >
            {showRejectionReason ? '▼' : '▶'} View Rejection Reason
          </button>
          {showRejectionReason && (
            <div style={styles.rejectionReason}>
              <strong>Reason:</strong> {verificationData.rejectionReason}
            </div>
          )}
          <Link to="/verification" style={styles.resubmitButton}>
            Resubmit Verification
          </Link>
        </div>
      )}

      {currentLevel < 4 && currentStatus !== 'rejected' && (
        <Link to="/verification" style={styles.upgradeButton}>
          Upgrade Verification →
        </Link>
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
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 8px 0',
  },
  currentLevel: {
    fontSize: '14px',
    color: '#fbbf24',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statusBadgeApproved: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  statusBadgePending: {
    background: 'rgba(251, 191, 36, 0.2)',
    color: '#fbbf24',
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
  statusBadgeRejected: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  progressSection: {
    marginBottom: '20px',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  progressStepCompleted: {
    opacity: 1,
  },
  progressStepCurrent: {
    opacity: 1,
  },
  stepIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f1729',
    transition: 'all 0.3s',
  },
  stepLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  benefitsSection: {
    marginBottom: '20px',
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    margin: '0 0 12px 0',
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  benefitIcon: {
    color: '#22c55e',
    fontWeight: '700',
  },
  upgradeButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#0f1729',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  rejectionSection: {
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
  },
  rejectionToggle: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '8px',
  },
  rejectionReason: {
    fontSize: '13px',
    color: '#fca5a5',
    lineHeight: '1.5',
    marginBottom: '12px',
    padding: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '4px',
  },
  resubmitButton: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
};

export default VerificationStatus;
