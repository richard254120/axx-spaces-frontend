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
    name: "Marketplace Account",
    icon: "/assets/marketplace-icon.png",
    description: "Buy and sell goods in the marketplace",
    loginPath: "/seller-login",
    registerPath: "/seller-login",
  },
  {
    id: "mover",
    name: "Movers Account",
    icon: "/assets/mover-icon.png",
    description: "Offer moving and logistics services",
    loginPath: "/movers",
    registerPath: "/movers",
  },
  {
    id: "tourism",
    name: "Tourism Account",
    icon: "/assets/tourism-icon.png",
    description: "List and manage tourism properties",
    loginPath: "/tourism/login",
    registerPath: "/tourism/register-property",
  },
];

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
                <img src={account.icon} alt={account.name} style={styles.accountIconImg} />
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
