import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

export default function AdminHeader({
  showNotifPanel,
  setShowNotifPanel,
  notificationCount,
  notifRef,
  children
}) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-logo-section">
        <h1 className="admin-logo"> Axxspace Admin</h1>
        <p className="admin-logo-sub">Welcome back, {user?.name?.split(" ")[0]}</p>
      </div>

      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-btn"
        onClick={() => {
          const sidebar = document.querySelector('.admin-sidebar');
          if (sidebar) {
            sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
          }
        }}
        style={{ display: 'none' }}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="admin-header-actions">
        <button
          className="btn-logout"
          onClick={handleLogout}
        >
           Logout
        </button>
        {children}
      </div>
    </header>
  );
}
