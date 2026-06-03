import { useState, useEffect } from "react";

export default function VerificationBadges({ userId, userType = "landlord" }) {
  const [verifications, setVerifications] = useState({
    email: false,
    phone: false,
    id: false,
    business: false,
  });

  useEffect(() => {
    loadVerifications();
  }, [userId]);

  const loadVerifications = () => {
    const verificationKey = `verifications_${userId}`;
    const saved = localStorage.getItem(verificationKey);
    if (saved) {
      setVerifications(JSON.parse(saved));
    } else {
      // Default to email verified for demo
      setVerifications({ email: true, phone: false, id: false, business: false });
    }
  };

  const badges = [
    {
      key: "email",
      icon: "✉️",
      label: "Email Verified",
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.15)",
      description: "Email address has been verified",
    },
    {
      key: "phone",
      icon: "📱",
      label: "Phone Verified",
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.15)",
      description: "Phone number has been verified",
    },
    {
      key: "id",
      icon: "🪪",
      label: "ID Verified",
      color: "#fbbf24",
      bgColor: "rgba(251, 191, 36, 0.15)",
      description: "National ID has been verified",
    },
    {
      key: "business",
      icon: "🏢",
      label: "Business Verified",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.15)",
      description: "Business registration verified",
    },
  ];

  const verifiedCount = Object.values(verifications).filter(Boolean).length;

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Compact Badge Display */}
      <div style={styles.compactView}>
        {verifiedCount > 0 && (
          <div style={styles.badgeRow}>
            {badges
              .filter(badge => verifications[badge.key])
              .map(badge => (
                <span
                  key={badge.key}
                  style={{
                    ...styles.compactBadge,
                    background: badge.bgColor,
                    color: badge.color,
                  }}
                  title={badge.description}
                >
                  {badge.icon}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Detailed Badge Display */}
      <div style={styles.detailedView}>
        <h4 style={styles.title}>Verification Status</h4>
        <div style={styles.badgeGrid}>
          {badges.map(badge => (
            <div
              key={badge.key}
              style={{
                ...styles.badgeCard,
                ...(verifications[badge.key] ? styles.badgeVerified : styles.badgeUnverified),
              }}
            >
              <div
                style={{
                  ...styles.badgeIcon,
                  background: verifications[badge.key] ? badge.bgColor : "rgba(148, 163, 184, 0.15)",
                  color: verifications[badge.key] ? badge.color : "#64748b",
                }}
              >
                {verifications[badge.key] ? badge.icon : "○"}
              </div>
              <div style={styles.badgeInfo}>
                <span style={styles.badgeLabel}>{badge.label}</span>
                <span style={styles.badgeStatus}>
                  {verifications[badge.key] ? "Verified" : "Not Verified"}
                </span>
              </div>
              {verifications[badge.key] && (
                <span style={styles.verifiedCheck}>✓</span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Profile Completion</span>
            <span style={styles.progressValue}>{verifiedCount}/4 Verified</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(verifiedCount / 4) * 100}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.tips}>
          <p style={styles.tipsTitle}>💡 Why get verified?</p>
          <ul style={styles.tipsList}>
            <li style={styles.tip}>Build trust with potential clients</li>
            <li style={styles.tip}>Get priority in search results</li>
            <li style={styles.tip}>Access premium features</li>
            <li style={styles.tip}>Receive more inquiries</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function VerificationBadge({ type, size = "medium" }) {
  const badgeConfig = {
    email: { icon: "✉️", color: "#22c55e", label: "Email Verified" },
    phone: { icon: "📱", color: "#3b82f6", label: "Phone Verified" },
    id: { icon: "🪪", color: "#fbbf24", label: "ID Verified" },
    business: { icon: "🏢", color: "#8b5cf6", label: "Business Verified" },
  };

  const config = badgeConfig[type] || badgeConfig.email;

  const sizes = {
    small: { padding: "4px 8px", fontSize: "0.75rem", iconSize: "0.9rem" },
    medium: { padding: "6px 12px", fontSize: "0.85rem", iconSize: "1rem" },
    large: { padding: "8px 16px", fontSize: "0.95rem", iconSize: "1.1rem" },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const rgbColor = hexToRgb(config.color);
  return (
    <span
      style={{
        ...styles.singleBadge,
        background: `rgba(${rgbColor}, 0.15)`,
        color: config.color,
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
      }}
      title={config.label}
    >
      <span style={{ fontSize: sizeConfig.iconSize }}>{config.icon}</span>
      <span style={{ marginLeft: "4px" }}>{config.label}</span>
    </span>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "34, 197, 94";
}

const styles = {
  container: {
    width: "100%",
  },
  compactView: {
    marginBottom: "12px",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  compactBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    fontSize: "0.9rem",
    cursor: "default",
  },
  detailedView: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
  },
  title: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  badgeCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid transparent",
    transition: "all 0.2s",
  },
  badgeVerified: {
    background: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  badgeUnverified: {
    background: "rgba(148, 163, 184, 0.1)",
    borderColor: "rgba(148, 163, 184, 0.2)",
    opacity: 0.6,
  },
  badgeIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLabel: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontWeight: 600,
    display: "block",
  },
  badgeStatus: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    display: "block",
    marginTop: "2px",
  },
  verifiedCheck: {
    color: "#22c55e",
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  progressSection: {
    marginBottom: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  progressLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  progressValue: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  progressBar: {
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  tips: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "8px",
    padding: "16px",
  },
  tipsTitle: {
    color: "#3b82f6",
    fontSize: "0.95rem",
    fontWeight: 600,
    margin: "0 0 12px",
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#94a3b8",
    fontSize: "0.85rem",
    lineHeight: "1.6",
  },
  tip: {
    marginBottom: "4px",
  },
  singleBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "20px",
    fontWeight: "600",
    cursor: "default",
  },
};

const css = `
  .badge-card:hover {
    transform: translateY(-2px);
  }
`;
