import React from "react";

const badgeConfig = {
  premium_verified: {
    icon: "⭐",
    label: "Premium Verified",
    color: "#fbbf24",
    bgColor: "rgba(251, 191, 36, 0.15)",
  },
  student_verified: {
    icon: "🎓",
    label: "Student Verified",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.15)",
  },
  business_verified: {
    icon: "🏢",
    label: "Business Verified",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.15)",
  },
  identity_verified: {
    icon: "🪪",
    label: "Identity Verified",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.15)",
  },
  location_verified: {
    icon: "📍",
    label: "Location Verified",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
  },
  online_verified: {
    icon: "🌐",
    label: "Online Verified",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.15)",
  },
};

export function ListingBadges({ badges, size = "medium", layout = "horizontal" }) {
  if (!badges || badges.length === 0) return null;

  const sizes = {
    small: { padding: "4px 8px", fontSize: "0.7rem", iconSize: "0.8rem", gap: "4px" },
    medium: { padding: "6px 12px", fontSize: "0.85rem", iconSize: "1rem", gap: "6px" },
    large: { padding: "8px 16px", fontSize: "0.95rem", iconSize: "1.1rem", gap: "8px" },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const containerStyle = {
    display: "flex",
    gap: sizeConfig.gap,
    flexWrap: "wrap",
  };

  if (layout === "vertical") {
    containerStyle.flexDirection = "column";
  }

  return (
    <div style={containerStyle}>
      {badges.map((badge, index) => {
        const config = badgeConfig[badge.type];
        if (!config) return null;

        return (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: sizeConfig.padding,
              background: config.bgColor,
              color: config.color,
              borderRadius: "20px",
              fontSize: sizeConfig.fontSize,
              fontWeight: "600",
              border: `1px solid ${config.color}30`,
            }}
            title={config.label}
          >
            <span style={{ fontSize: sizeConfig.iconSize }}>{config.icon}</span>
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CompactListingBadges({ badges, maxVisible = 3 }) {
  if (!badges || badges.length === 0) return null;

  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div style={styles.compactContainer}>
      {visibleBadges.map((badge, index) => {
        const config = badgeConfig[badge.type];
        if (!config) return null;

        return (
          <span
            key={index}
            style={{
              ...styles.compactBadge,
              background: config.bgColor,
              color: config.color,
            }}
            title={config.label}
          >
            {config.icon}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span style={styles.moreBadge}>+{remainingCount}</span>
      )}
    </div>
  );
}

export function BadgeTooltip({ badge }) {
  const config = badgeConfig[badge.type];
  if (!config) return null;

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipHeader}>
        <span style={{ fontSize: "1.2rem" }}>{config.icon}</span>
        <span style={styles.tooltipTitle}>{config.label}</span>
      </div>
      <div style={styles.tooltipMeta}>
        <span style={styles.tooltipLabel}>Verified on:</span>
        <span style={styles.tooltipValue}>
          {new Date(badge.verifiedAt).toLocaleDateString()}
        </span>
      </div>
      {badge.verifiedBy && (
        <div style={styles.tooltipMeta}>
          <span style={styles.tooltipLabel}>Verified by:</span>
          <span style={styles.tooltipValue}>Admin</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  compactContainer: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  compactBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    fontSize: "0.85rem",
    cursor: "help",
  },
  moreBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(100, 116, 139, 0.15)",
    color: "#64748b",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  tooltip: {
    background: "white",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    minWidth: "200px",
  },
  tooltipHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  tooltipTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  tooltipMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    marginBottom: "4px",
  },
  tooltipLabel: {
    color: "#64748b",
  },
  tooltipValue: {
    color: "#1e293b",
    fontWeight: "500",
  },
};
