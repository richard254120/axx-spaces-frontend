// src/components/DownloadNotification.jsx
import React, { useState, useEffect } from "react";

/**
 * DownloadNotification
 * A dismissable top banner that prompts users to download the Axxspace app.
 * Dismissal is remembered in localStorage so it only shows once per browser.
 */
const DownloadNotification = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Inject slide-down animation only once
    const styleId = "download-notif-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    const dismissed = localStorage.getItem("axx_download_notification_dismissed_v2");
    if (dismissed !== "true") {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("axx_download_notification_dismissed_v2", "true");
  };

  if (!visible) return null;

  return (
    <div
      id="download-notification-banner"
      role="alert"
      aria-live="polite"
      style={{
        background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        fontFamily: "'Inter', 'DM Sans', sans-serif",
        fontSize: "0.92rem",
        boxShadow: "0 2px 12px rgba(79,70,229,0.35)",
        position: "relative",
        zIndex: 1100,
        animation: "slideDown 0.4s ease-out",
      }}
    >
      {/* 📱 Icon + Text */}
      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "1.3rem" }}>📱</span>
        <span>
          <strong>Get more from Axxspace!</strong> Download our mobile app for a
          faster, smoother experience.
        </span>
      </span>

      {/* Action buttons */}
      <span style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <a
          id="download-notification-cta"
          href="/mobile-app"
          style={{
            background: "white",
            color: "#4f46e5",
            border: "none",
            borderRadius: "6px",
            padding: "7px 16px",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            fontSize: "0.85rem",
            letterSpacing: "0.02em",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Download App
        </a>
        <a
          id="download-notification-manager-cta"
          href="/downloads/axx-spaces-manager-v1.0.0.apk"
          download
          style={{
            background: "white",
            color: "#4f46e5",
            border: "none",
            borderRadius: "6px",
            padding: "7px 16px",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            fontSize: "0.85rem",
            letterSpacing: "0.02em",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Manager App
        </a>
        <button
          id="download-notification-close"
          onClick={handleClose}
          aria-label="Dismiss notification"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.8)",
            fontSize: "1.4rem",
            lineHeight: 1,
            cursor: "pointer",
            padding: "0 4px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
        >
          ×
        </button>
      </span>
    </div>
  );
};

export default DownloadNotification;
