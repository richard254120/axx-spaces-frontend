import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import {
  clearSellerSession,
  getAccountNav,
  getDashboardPath,
  getLoginPath,
  getWorkspaceBrand,
  resolveAuth,
} from "../utils/dashboardRoutes";
import logo from "../assets/image.png";

export default function AccountLayout({ children, preferSeller = false }) {
  const authContext = useContext(AuthContext);
  const { user, logout } = resolveAuth(authContext, { preferSeller });
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath = getDashboardPath(user?.role);
  const navItems = getAccountNav(user?.role);
  const brand = getWorkspaceBrand(user?.role);

  if (!user) {
    return <div style={styles.root}>{children}</div>;
  }

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    clearSellerSession();
    const redirect = getLoginPath(user?.role);
    if (logout) logout(redirect);
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <header style={styles.header}>
        <Link to={dashboardPath} style={styles.brand} onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="AxxSpace" style={styles.logo} />
          <span style={styles.brandText}>{brand}</span>
        </Link>

        <button
          type="button"
          className="account-menu-toggle"
          style={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`account-nav ${menuOpen ? "account-nav-open" : ""}`} style={styles.nav}>
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

        <div className="account-user" style={styles.userSection}>
          <ProfileAvatar user={user} size={32} />
          <span style={styles.userName}>{user?.name}</span>
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
    background: "#0f1729",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    borderBottom: "1px solid #334155",
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
  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  brandText: {
    color: "#fbbf24",
    fontWeight: 800,
    fontSize: "15px",
  },
  menuToggle: {
    display: "none",
    marginLeft: "auto",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid #334155",
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
    color: "#94a3b8",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  navLinkActive: {
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.12)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "auto",
  },
  userName: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: 600,
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #475569",
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
    .account-menu-toggle {
      display: block !important;
    }
    .account-nav {
      display: none !important;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      order: 4;
    }
    .account-nav-open {
      display: flex !important;
    }
    .account-user {
      width: 100%;
      justify-content: space-between;
      order: 5;
      padding-top: 8px;
      border-top: 1px solid #334155;
      margin-left: 0 !important;
    }
  }
`;
