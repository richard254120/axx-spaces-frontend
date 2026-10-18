import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "24px",
    textAlign: "center",
  },
  accountGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  accountCard: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  accountIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "transparent",
  },

  accountIconImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    mixBlendMode: "screen",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  accountDesc: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  closeButton: {
    marginTop: "24px",
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

const accountTypes = [
  {
    id: "user",
    name: "User Account",
    icon: "/assets/user-icon.png",
    description: "Browse properties and services as a regular user",
    loginPath: "/user-login",
    registerPath: "/user-register",
  },
  {
    id: "landlord",
    name: "Landlord Account",
    icon: "/assets/landlord-icon.png",
    description: "List and manage rental properties",
    loginPath: "/login",
    registerPath: "/register",
  },
  {
    id: "axxbiashara",
    name: "AxxBiashara Account",
    icon: "/assets/axxbiashara-icon.png",
    description: "Manage your business on AxxBiashara",
    loginPath: "/business-login",
    registerPath: "/business-register",
  },
  {
    id: "marketplace",
    name: "QuickSales Account",
    icon: "/assets/marketplace-icon.png",
    description: "Buy and sell goods in the marketplace",
    loginPath: "/quicksales-login",
    registerPath: "/quicksales-login",
  },
  {
    id: "accommodation",
    name: "Accommodation Account",
    icon: "/assets/tourism-icon.png",
    description: "List and manage accommodation properties",
    loginPath: "/accommodation/login",
    registerPath: "/accommodation/register",
  },
];

const renderAccountIcon = (id) => {
  if (id === "user") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    );
  }
  if (id === "landlord") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    );
  }
  if (id === "axxbiashara") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    );
  }
  if (id === "marketplace") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a3 3 0 0 0-3 3v14H3v2h18v-2h-3V5a3 3 0 0 0-3-3z"></path>
      <path d="M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"></path>
    </svg>
  );
};

export default function AccountTypeSelector({ isOpen, onClose, mode = "login" }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAccountSelect = (account) => {
    let path = mode === "login" ? account.loginPath : account.registerPath;

    // For movers, add query parameter to indicate which tab to show
    if (account.id === "mover") {
      path = `${path}?tab=${mode}`;
    }

    navigate(path);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          {mode === "login" ? "Choose Account to Login" : "Choose Account Type to Register"}
        </h2>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "Select the type of account you want to log into"
            : "Select the type of account you want to create"}
        </p>

        <div style={styles.accountGrid}>
          {accountTypes.map((account) => (
            <div
              key={account.id}
              style={styles.accountCard}
              onClick={() => handleAccountSelect(account)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)";
                e.currentTarget.style.borderColor = "#fbbf24";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)";
                e.currentTarget.style.borderColor = "#334155";
              }}
            >
              <div style={styles.accountIcon}>
                {renderAccountIcon(account.id)}
              </div>
              <div style={styles.accountInfo}>
                <div style={styles.accountName}>{account.name}</div>
                <div style={styles.accountDesc}>{account.description}</div>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
