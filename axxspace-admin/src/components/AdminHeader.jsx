import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AdminHeader.css";

export default function AdminHeader({
  onToggleSidebar,
  showNotifPanel,
  setShowNotifPanel,
  notificationCount,
  notifRef,
  children
}) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Open sidebar menu"
          >
            <span className="hamburger-icon">☰</span>
            <span className="hamburger-text">Menu</span>
          </button>
        )}
        <div className="admin-logo-section">
          <div className="admin-logo-wrapper">
            <span className="live-status-dot" title="System Operational" />
            <h1 className="admin-logo">AXXSPACE ADMIN</h1>
          </div>
          <p className="admin-logo-sub">
            Logged in as <strong className="user-highlight">{user?.name || "Administrator"}</strong>
          </p>
        </div>
      </div>

      <div className="admin-header-actions">
        {children}
        <button
          type="button"
          className="btn-logout"
          onClick={handleLogout}
          title="Sign out of Admin Portal"
        >
          <span className="logout-text">Logout</span>
          <span className="logout-icon" aria-hidden="true">🚪</span>
        </button>
      </div>
    </header>
  );
}
