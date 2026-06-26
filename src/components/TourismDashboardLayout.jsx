import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";

export default function TourismDashboardLayout({ children }) {
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️ Good morning";
    if (hour < 17) return "🌤️ Good afternoon";
    if (hour < 22) return "🌙 Good evening";
    return "✨ Hello";
  };

  const navItems = [
    { path: "/tourism/dashboard", label: "Dashboard" },
    { path: "/tourism/register-property", label: "Add Property" },
    { path: "/tourism/listings", label: "Browse Listings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (logout) {
      logout("/tourism");
    } else {
      window.location.href = "/tourism";
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <header style={styles.header}>
        <Link to="/tourism" style={styles.brand} onClick={() => setMenuOpen(false)}>
          <span style={styles.brandText}>🏨 AXX Tourism</span>
        </Link>

        <button
          type="button"
          className="tourism-menu-toggle"
          style={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`tourism-nav ${menuOpen ? "tourism-nav-open" : ""}`} style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(isActive(item.path) && styles.navLinkActive),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="tourism-user" style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.greetingText}>{getGreeting()}</span>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <ProfileAvatar user={user} size={32} />
          <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#f8f4f0",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    flexShrink: 0,
  },
  brandText: {
    color: "#fbbf24",
    fontWeight: 800,
    fontSize: "16px",
  },
  menuToggle: {
    display: "none",
    marginLeft: "auto",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#f1f5f9",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  navLink: {
    color: "#d1fae5",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  navLinkActive: {
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.2)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "auto",
  },
  userName: {
    color: "#fbbf24",
    fontSize: "14px",
    fontWeight: 700,
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  },
  greetingText: {
    color: "#d1fae5",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#f1f5f9",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  main: {
    minHeight: "calc(100vh - 65px)",
  },
};

const css = `
  @media (max-width: 768px) {
    .tourism-menu-toggle {
      display: block !important;
    }
    .tourism-nav {
      display: none !important;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      order: 4;
    }
    .tourism-nav-open {
      display: flex !important;
    }
    .tourism-user {
      width: 100%;
      justify-content: space-between;
      order: 5;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.2);
      margin-left: 0 !important;
    }
  }
`;
