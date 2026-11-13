import React from "react";
import { IconShield } from "./AxxGoIcons";

export default function AxxGoSafetyBanner({ compact = false }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(15, 23, 41, 0.7) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        borderRadius: "10px",
        padding: compact ? "10px 14px" : "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "12px 0",
      }}
      role="alert"
    >
      <div
        style={{
          width: compact ? "28px" : "36px",
          height: compact ? "28px" : "36px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.2)",
          border: "1px solid #ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#fca5a5",
        }}
      >
        <IconShield size={compact ? 16 : 20} color="#fca5a5" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: compact ? "13px" : "14px",
            color: "#fef2f2",
            fontWeight: "600",
            letterSpacing: "0.2px",
          }}
        >
          Safety Notice: Never send money before seeing the item or property.
        </p>
        {!compact && (
          <p
            style={{
              margin: "3px 0 0",
              fontSize: "12px",
              color: "#cbd5e1",
              lineHeight: 1.4,
            }}
          >
            Always meet in a public location and inspect physical goods, rentals, or credentials before transferring any funds or deposits.
          </p>
        )}
      </div>
    </div>
  );
}
