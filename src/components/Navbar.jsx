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

  // ✅ MOVER NAVBAR - Only shows mover-specific content
  if (user?.role === "mover") {
    return (
      <nav style={styles.moverNavbar}>
        <style>{css}</style>

        {/* TOP SECTION - LOGO + HAMBURGER */}
        <div style={styles.topSection}>
          <Link to="/mover-dashboard" style={styles.logoContainer}>
            <img src={logo} alt="Axx Spaces" style={styles.logo} />
            <span style={styles.brandName}>🚚 Axx Movers</span>
          </Link>

          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* BOTTOM SECTION - MOVER ONLY LINKS */}
        <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
          {/* MOVER DASHBOARD LINK */}
          <Link 
            to="/mover-dashboard" 
            style={styles.navLink} 
            onClick={() => setMenuOpen(false)}
          >
            📊 Dashboard
          </Link>

          {/* USER INFO & LOGOUT */}
          <div style={styles.userSection}>
            <span style={styles.userName}>👤 {user?.name}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ✅ REGULAR NAVBAR - For landlords and unauthenticated users
  return (
    <nav style={styles.navbar}>
      <style>{css}</style>

      {/* TOP SECTION - LOGO + HAMBURGER */}
      <div style={styles.topSection}>
        <Link to="/" style={styles.logoContainer}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
          <span style={styles.brandName}>Axx Spaces</span>
        </Link>

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
        
        {/* MOVERS LINK */}
        <Link to="/movers" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          🚚 Movers
        </Link>

        {/* AUTHENTICATED LANDLORD LINKS */}
        {token && user ? (
          <>
            <Link to="/upload" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              ➕ Upload
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
  // ✅ MOVER NAVBAR STYLES
  moverNavbar: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    color: "#f1f5f9",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    fontFamily: "'DM Sans', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "12px 16px",
  },

  // REGULAR NAVBAR STYLES
  navbar: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    color: "#f1f5f9",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    fontFamily: "'DM Sans', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "12px 16px",
  },

  topSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    cursor: "pointer",
  },

  logo: {
    height: "36px",
    width: "auto",
  },

  brandName: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#fbbf24",
    letterSpacing: "0.5px",
  },

  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontSize: "26px",
    cursor: "pointer",
    padding: "6px",
  },

  navLinksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  navLinksContainerOpen: {
    display: "flex",
  },

  // ✅ BOLD LINKS
  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,  // ✅ INCREASED from 600 to 700 (BOLDER)
    transition: "all 0.2s",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderLeft: "1px solid #334155",
    paddingLeft: "8px",
    marginLeft: "8px",
  },

  userName: {
    fontSize: "13px",
    fontWeight: 700,  // ✅ INCREASED from 600 to 700 (BOLDER)
    color: "#fbbf24",
  },

  logoutBtn: {
    padding: "4px 8px",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,  // ✅ INCREASED from 600 to 700 (BOLDER)
    transition: "all 0.2s",
  },

  loginLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,  // ✅ INCREASED from 600 to 700 (BOLDER)
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "all 0.2s",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  registerLink: {
    padding: "4px 8px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f1729",
    border: "none",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 700,  // ✅ ALREADY BOLD
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

  /* ✅ MOBILE RESPONSIVE - OPTIMIZED FOR PHONE */
  @media (max-width: 768px) {
    [style*="display: none"][style*="background: none"][style*="border: none"] {
      display: block !important;
    }

    /* Show mobile menu */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] {
      position: fixed !important;
      top: 64px !important;
      left: 0 !important;
      right: 0 !important;
      flex-direction: column !important;
      background: linear-gradient(135deg, #1e293b 0%, #0f1729 100%) !important;
      padding: 12px 0 !important;
      gap: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.3s ease !important;
      align-items: stretch !important;
      z-index: 99 !important;
    }

    /* Open menu */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"][style*="display: flex"] {
      max-height: 600px !important;
    }

    /* Mobile links - full width */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] a {
      padding: 14px 16px !important;
      width: 100% !important;
      text-align: left !important;
      border-bottom: 1px solid #334155 !important;
      font-size: 14px !important;
      border-radius: 0 !important;
    }

    /* User section mobile */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] [style*="borderLeft"] {
      border-left: none !important;
      border-top: 1px solid #334155 !important;
      padding-left: 16px !important;
      padding-top: 12px !important;
      margin-left: 0 !important;
      margin-top: 0 !important;
      flex-direction: column !important;
      gap: 10px !important;
      width: 100% !important;
      padding: 12px 16px !important;
      align-items: flex-start !important;
    }

    /* Mobile logout button */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] button[style*="background: rgba(239"] {
      width: 100% !important;
      padding: 10px 12px !important;
    }
  }

  @media (max-width: 480px) {
    /* Smaller logo on very small screens */
    [style*="fontSize: 16px"][style*="fontWeight: 800"] {
      font-size: 14px !important;
    }

    [style*="padding: 12px 16px"] {
      padding: 10px 12px !important;
    }

    /* Adjust navbar padding */
    nav[style*="padding: 12px 16px"] {
      padding: 10px 12px !important;
    }

    /* Mobile links smaller text */
    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] a {
      font-size: 13px !important;
      padding: 12px 14px !important;
    }

    /* Smaller logo */
    img[style*="height: 36px"] {
      height: 32px !important;
      width: auto !important;
    }
  }
`;