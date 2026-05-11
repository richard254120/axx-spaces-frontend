import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav style={styles.navbar}>
      <style>{css}</style>

      {/* TOP SECTION - LOGO + HAMBURGER */}
      <div style={styles.topSection}>
        {/* LOGO */}
        <Link to="/" style={styles.logoContainer}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
          <span style={styles.brandName}>Axx Spaces</span>
        </Link>

        {/* HAMBURGER MENU - MOBILE */}
        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* BOTTOM SECTION - NAVIGATION LINKS IN A ROW */}
      <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
        {/* PUBLIC LINKS */}
        <Link to="/" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          🏠 Home
        </Link>
        <Link to="/listings" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          📋 Listings
        </Link>
        
        {/* ✅ MOVERS LINK */}
        <Link to="/movers" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          🚚 Movers
        </Link>

        {/* AUTHENTICATED LANDLORD LINKS */}
        {token && user ? (
          <>
            <Link to="/upload" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              ➕ Upload Property
            </Link>
            <Link to="/dashboard" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              📊 Dashboard
            </Link>

            {/* USER INFO */}
            <div style={styles.userSection}>
              <span style={styles.userName}>👤 {user.name}</span>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </>
        ) : (
          /* UNAUTHENTICATED LINKS */
          <>
            <Link to="/login" style={styles.loginLink} onClick={() => setMenuOpen(false)}>
              🔐 Login
            </Link>
            <Link to="/register" style={styles.registerLink} onClick={() => setMenuOpen(false)}>
              📝 Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    color: "#f1f5f9",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    fontFamily: "'DM Sans', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "16px 24px",
  },

  topSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    cursor: "pointer",
  },

  logo: {
    height: "40px",
    width: "auto",
  },

  brandName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#fbbf24",
    letterSpacing: "0.5px",
  },

  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontSize: "28px",
    cursor: "pointer",
    padding: "8px",
  },

  navLinksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  navLinksContainerOpen: {
    display: "flex",
  },

  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderLeft: "1px solid #334155",
    paddingLeft: "12px",
    marginLeft: "12px",
  },

  userName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fbbf24",
  },

  logoutBtn: {
    padding: "6px 12px",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.2s",
  },

  loginLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "all 0.2s",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  registerLink: {
    padding: "6px 12px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f1729",
    border: "none",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  a[style*="color: #cbd5e1"]:hover {
    background: rgba(251, 191, 36, 0.1) !important;
    color: #fbbf24 !important;
  }

  a[style*="color: #0f1729"]:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3) !important;
  }

  button[style*="background: rgba(239"]:hover {
    background: rgba(239, 68, 68, 0.3) !important;
  }

  /* MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    [style*="display: none"][style*="background: none"][style*="border: none"] {
      display: block !important;
    }

    [style*="display: flex"][style*="gap: 12px"][style*="flexWrap"] {
      position: fixed !important;
      top: 76px !important;
      left: 0 !important;
      right: 0 !important;
      flex-direction: column !important;
      background: linear-gradient(135deg, #1e293b 0%, #0f1729 100%) !important;
      padding: 16px !important;
      gap: 8px !important;
      max-height: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.3s ease !important;
      align-items: flex-start !important;
    }

    [style*="display: flex"][style*="gap: 12px"][style*="flexWrap"][style*="display: flex"] {
      max-height: 500px !important;
    }

    [style*="display: flex"][style*="gap: 12px"][style*="flexWrap"] a {
      padding: 12px 16px !important;
      width: calc(100% - 32px) !important;
      text-align: left !important;
    }

    [style*="display: flex"][style*="gap: 12px"][style*="flexWrap"] [style*="borderLeft"] {
      border-left: none !important;
      border-top: 1px solid #334155 !important;
      padding-left: 0 !important;
      padding-top: 12px !important;
      margin-left: 0 !important;
      margin-top: 8px !important;
      flex-direction: column !important;
      gap: 8px !important;
      width: 100% !important;
    }
  }

  @media (max-width: 480px) {
    [style*="fontSize: 18px"][style*="fontWeight: 800"] {
      font-size: 14px !important;
    }

    [style*="padding: 16px 24px"] {
      padding: 12px 16px !important;
    }

    [style*="display: flex"][style*="gap: 12px"][style*="flexWrap"] a {
      font-size: 13px !important;
    }
  }
`;