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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-logo-section">
        <h1 className="admin-logo">🛡️ Axxspace Admin</h1>
        <p className="admin-logo-sub">Welcome back, {user?.name?.split(" ")[0]}</p>
      </div>

      <div className="admin-header-actions">
        {children}

        <button 
          className="btn-logout" 
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
}
