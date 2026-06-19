import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerificationStatus = () => {
  const { token } = useContext(AuthContext);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');

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

  useEffect(() => {
    if (token) {
      fetchVerificationStatus();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>⏳ Loading verification status...</div>
      </div>
    );
  }

  const badges = verificationData?.verificationBadges || [];
  const levels = [
    {
      level: 1,
      name: 'Student ID Verification',
      statusField: 'studentVerificationStatus',
      badgeName: 'student_verified',
      badgeText: '🎓 Student Badge',
      description: 'Verifies you are an active student',
      color: '#3b82f6',
      details: verificationData?.levels?.student,
    },
    {
      level: 2,
      name: 'Standard ID & Address Verification',
      statusField: 'standardVerificationStatus',
      badgeName: 'standard_verified',
      badgeText: '✓ Standard Verified Badge',
      description: 'Verifies National ID, Selfie & Utility Bill',
      color: '#10b981',
      details: verificationData?.levels?.standard,
    },
    {
      level: 3,
      name: 'Premium Physical Verification',
      statusField: 'premiumVerificationStatus',
      badgeName: 'premium_verified',
      badgeText: '👑 Premium Verified Gold Badge',
      description: 'Physical inspection completed in-person',
      color: '#f59e0b',
      details: verificationData?.levels?.premium,
    },
  ];

  const getStatusLabel = (status) => {
    if (!status || status === 'none') return 'Not Submitted';
    if (status === 'pending') return 'Pending Approval';
    if (status === 'under_review') return 'Under Review';
    if (status === 'approved') return 'Approved & Active';
    if (status === 'rejected') return 'Rejected / Needs Action';
    return status;
  };

  const getStatusStyles = (status, color) => {
    if (!status || status === 'none') {
      return { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)' };
    }
    if (status === 'pending' || status === 'under_review') {
      return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)' };
    }
    if (status === 'approved') {
      return { background: `${color}15`, color: color, borderColor: `${color}30` };
    }
    if (status === 'rejected') {
      return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' };
    }
    return {};
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Trust & Verification Workflow</h3>
          <p style={styles.subtitle}>Complete verification milestones to unlock spaces and premium badges</p>
        </div>
        <Link to="/verification" style={styles.actionBtn}>
          Submit Verification →
        </Link>
      </div>

      {/* active badges section */}
      {badges.length > 0 && (
        <div style={styles.badgesRow}>
          <span style={styles.badgesLabel}>Your Badges:</span>
          <div style={styles.badgePillsContainer}>
            {levels.map((lvl) => {
              if (badges.includes(lvl.badgeName)) {
                return (
                  <span key={lvl.level} style={{ ...styles.badgePill, border: `1px solid ${lvl.color}`, color: lvl.color, background: `${lvl.color}10` }}>
                    {lvl.badgeText}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* steps details */}
      <div style={styles.levelsList}>
        {levels.map((lvl) => {
          const status = verificationData?.[lvl.statusField] || 'none';
          const details = lvl.details;
          const statusStyle = getStatusStyles(status, lvl.color);

          return (
            <div key={lvl.level} style={styles.levelCard}>
              <div style={styles.levelCardHeader}>
                <div style={styles.levelLeft}>
                  <div style={{ ...styles.levelNumberIndicator, backgroundColor: lvl.color }}>
                    {lvl.level}
                  </div>
                  <div>
                    <h4 style={styles.levelName}>{lvl.name}</h4>
                    <p style={styles.levelDesc}>{lvl.description}</p>
                  </div>
                </div>
                <span style={{ ...styles.statusTag, ...statusStyle }}>
                  {getStatusLabel(status)}
                </span>
              </div>

              {status === 'rejected' && details?.rejectionReason && (
                <div style={styles.rejectionBox}>
                  <span style={styles.rejectionTitle}>❌ Rejection Reason:</span>
                  <p style={styles.rejectionText}>{details.rejectionReason}</p>
                  <Link to="/verification" style={styles.resubmitLink}>
                    Modify & Resubmit Level {lvl.level}
                  </Link>
                </div>
              )}

              {status === 'pending' && (
                <div style={styles.pendingBox}>
                  <span style={styles.pendingIcon}>⏳</span>
                  <span style={styles.pendingText}>
                    Submitted on {new Date(details?.submittedAt || Date.now()).toLocaleDateString()}. Admin will review it shortly.
                  </span>
                </div>
              )}

              {status === 'approved' && (
                <div style={styles.approvedBox}>
                  <span style={styles.approvedIcon}>✅</span>
                  <span style={styles.approvedText}>
                    Approved! You have been awarded the <strong>{lvl.badgeText}</strong>.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verification Badge Pricing Plans */}
      <div style={styles.badgePricingSection}>
        <div style={styles.badgePricingHeader}>
          <div>
            <h3 style={styles.pricingTitle}>🎖️ Trust Badges & Verification Plans</h3>
            <p style={styles.pricingSubtitle}>Boost your profile visibility and credibility. Select a badge subscription below.</p>
          </div>
          <div style={styles.cycleToggleContainer}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                ...styles.cycleToggleBtn,
                ...(billingCycle === 'monthly' ? styles.cycleToggleBtnActive : {})
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('semiannual')}
              style={{
                ...styles.cycleToggleBtn,
                ...(billingCycle === 'semiannual' ? styles.cycleToggleBtnActive : {})
              }}
            >
              Semi-Annual
            </button>
          </div>
        </div>

        <div style={styles.pricingGrid}>
          {Object.entries({
            student_verified: {
              name: "Student Verified",
              emoji: "🎓",
              color: "#3b82f6",
              monthly: 20,
              monthlyExact: 19.80,
              semiannual: 99,
              desc: "Perfect for active students. Unlocks student discounts & standard features."
            },
            online_verified: {
              name: "Online Verified",
              emoji: "🌐",
              color: "#10b981",
              monthly: 60,
              monthlyExact: 59.80,
              semiannual: 299,
              desc: "For general users. Verifies email, phone & social profiles."
            },
            identity_verified: {
              name: "Identity Verified",
              emoji: "🆔",
              color: "#6366f1",
              monthly: 60,
              monthlyExact: 59.80,
              semiannual: 299,
              desc: "Government ID validation. Greatly improves Trust Score."
            },
            location_verified: {
              name: "Location Verified",
              emoji: "📍",
              color: "#a855f7",
              monthly: 160,
              monthlyExact: 159.80,
              semiannual: 799,
              desc: "Verifies address & residency. Essential for serious landlords/renters."
            },
            business_verified: {
              name: "Business Verified",
              emoji: "🏢",
              color: "#06b6d4",
              monthly: 400,
              monthlyExact: 399.80,
              semiannual: 1999,
              desc: "Verified merchant/business license. Crucial for Biashara listings."
            },
            premium_verified: {
              name: "Premium Verified",
              emoji: "👑",
              color: "#f59e0b",
              monthly: 1400,
              monthlyExact: 1400,
              semiannual: 7000,
              desc: "Ultimate trust tier. VIP support, in-person check & maximum visibility."
            }
          }).map(([key, plan]) => {
            const isOwned = badges.includes(key);
            const amount = billingCycle === 'monthly' ? plan.monthly : plan.semiannual;
            const billingPeriod = billingCycle === 'monthly' ? '/month' : '/6mo';
            const exactText = billingCycle === 'monthly' && plan.monthlyExact !== plan.monthly
              ? `(KSh ${plan.monthlyExact.toFixed(2)})`
              : '';

            return (
              <div key={key} style={{ ...styles.planCard, borderTop: `4px solid ${plan.color}` }}>
                <div style={styles.planCardTop}>
                  <div style={{ background: `${plan.color}15`, borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {plan.emoji}
                  </div>
                  <div>
                    <h4 style={styles.planName}>{plan.name}</h4>
                    <span style={{ ...styles.planStatusTag, color: isOwned ? '#10b981' : '#64748b', background: isOwned ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)' }}>
                      {isOwned ? '✓ Active' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>

                <p style={styles.planDesc}>{plan.desc}</p>

                <div style={styles.priceContainer}>
                  <span style={styles.priceSymbol}>KSh</span>
                  <span style={styles.priceAmount}>{amount.toLocaleString()}</span>
                  <span style={styles.pricePeriod}>{billingPeriod}</span>
                  {exactText && <span style={styles.exactText}>{exactText}</span>}
                </div>

                {isOwned ? (
                  <button disabled style={{ ...styles.subscribeBtn, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', cursor: 'not-allowed' }}>
                    ✓ Badge Awarded
                  </button>
                ) : (
                  <Link
                    to={`/checkout?plan=verification-${key}-${billingCycle}&amount=${amount}&subscriptionType=${key}`}
                    style={{ ...styles.subscribeBtn, background: `linear-gradient(135deg, ${plan.color}d0 0%, ${plan.color} 100%)`, color: '#fff' }}
                  >
                    Get Verified
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.7) 0%, rgba(10, 15, 28, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#f1f5f9',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  actionBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #c9a84c 0%, #a88832 100%)',
    color: '#090e1a',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  badgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  badgesLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
  },
  badgePillsContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badgePill: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  levelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  levelCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  levelCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  levelLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  levelNumberIndicator: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#090e1a',
    fontSize: '14px',
    fontWeight: '800',
  },
  levelName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 4px 0',
  },
  levelDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  statusTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  rejectionBox: {
    background: 'rgba(239,68,68,0.05)',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '6px',
  },
  rejectionTitle: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#f87171',
    marginBottom: '4px',
  },
  rejectionText: {
    fontSize: '13px',
    color: '#cbd5e1',
    margin: '0 0 10px 0',
    lineHeight: '1.4',
  },
  resubmitLink: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    textDecoration: 'underline',
  },
  pendingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#f59e0b',
    background: 'rgba(245,158,11,0.05)',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  pendingIcon: {
    fontSize: '14px',
  },
  pendingText: {
    lineHeight: '1.4',
  },
  approvedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.05)',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  approvedIcon: {
    fontSize: '14px',
  },
  approvedText: {
    lineHeight: '1.4',
  },
  badgePricingSection: {
    marginTop: '40px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '32px',
  },
  badgePricingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '28px',
  },
  pricingTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#fbbf24',
    margin: '0 0 6px 0',
  },
  pricingSubtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  cycleToggleContainer: {
    display: 'flex',
    background: '#090e1a',
    borderRadius: '10px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  cycleToggleBtn: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cycleToggleBtnActive: {
    background: 'rgba(251, 191, 36, 0.12)',
    color: '#fbbf24',
    border: '1px solid rgba(251, 191, 36, 0.2)',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  planCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '260px',
    transition: 'all 0.3s ease',
  },
  planCardTop: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  planName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 4px 0',
  },
  planStatusTag: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  planDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
    flexGrow: 1,
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  priceSymbol: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#94a3b8',
  },
  priceAmount: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
  },
  pricePeriod: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
  },
  exactText: {
    fontSize: '11px',
    color: '#64748b',
    marginLeft: '6px',
    fontStyle: 'italic',
  },
  subscribeBtn: {
    display: 'block',
    width: '100%',
    padding: '12px',
    textAlign: 'center',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    border: 'none',
    boxSizing: 'border-box',
    transition: 'transform 0.2s, opacity 0.2s',
    cursor: 'pointer',
  },
};

export default VerificationStatus;
