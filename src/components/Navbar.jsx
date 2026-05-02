import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ✅ Mobile menu state

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{css}</style>
      
      <nav style={styles.navbar}>
        <div style={styles.container}>
          
          {/* Logo */}
          <Link to="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
            🏠 Axx Spaces
          </Link>

          {/* ✅ Mobile Menu Button */}
          <button
            style={styles.menuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* ✅ Navigation Menu (Desktop + Mobile) */}
          <div
            style={{
              ...styles.navLinks,
              ...(mobileMenuOpen ? styles.navLinksOpen : {})
            }}
            className="nav-links"
          >
            {/* Always visible */}
            <Link to="/" style={styles.link} onClick={() => setMobileMenuOpen(false)}>
              🏠 Home
            </Link>
            <Link to="/listings" style={styles.link} onClick={() => setMobileMenuOpen(false)}>
              🔍 Listings
            </Link>

            {/* Only when logged in */}
            {token ? (
              <>
                <Link to="/upload" style={styles.link} onClick={() => setMobileMenuOpen(false)}>
                  ➕ Upload
                </Link>
                <Link to="/dashboard" style={styles.link} onClick={() => setMobileMenuOpen(false)}>
                  📊 My Properties
                </Link>
                <button
                  style={styles.logoutBtn}
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Not logged in */}
                <Link to="/login" style={styles.link} onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" style={styles.linkPrimary} onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

const styles = {
  navbar: {
    background: "#06101f",
    borderBottom: "1px solid rgba(59,130,246,0.15)",
    padding: "0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
  },
  logo: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#3b82f6",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  navLinksOpen: {
    // ✅ Mobile styles (shown when menu is open)
    position: "absolute",
    top: "70px",
    left: 0,
    right: 0,
    background: "#06101f",
    border: "1px solid rgba(59,130,246,0.15)",
    flexDirection: "column",
    gap: "0",
    alignItems: "stretch",
    padding: "12px 0",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 20px",
    transition: "all 0.2s",
    display: "block",
  },
  linkPrimary: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 700,
    padding: "10px 20px",
    background: "rgba(59,130,246,0.15)",
    borderRadius: "8px",
    transition: "all 0.2s",
    border: "1px solid rgba(59,130,246,0.3)",
    display: "block",
    textAlign: "center",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.3)",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  menuButton: {
    display: "none", // ✅ Hidden by default (desktop)
    background: "none",
    border: "none",
    color: "#cbd5e1",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  * {
    font-family: 'DM Sans', sans-serif;
  }

  /* Desktop - navbar links always visible */
  @media (min-width: 768px) {
    .nav-links {
      display: flex !important;
      gap: 20px;
      position: static !important;
      background: none !important;
      border: none !important;
      padding: 0 !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      flex-direction: row !important;
      align-items: center !important;
    }

    .mobile-menu-btn {
      display: none !important;
    }
  }

  /* Mobile - hamburger menu visible */
  @media (max-width: 767px) {
    .mobile-menu-btn {
      display: block !important;
    }

    .nav-links {
      display: none;
      position: absolute;
      top: 70px;
      left: 0;
      right: 0;
      background: #06101f;
      border: 1px solid rgba(59,130,246,0.15);
      flex-direction: column;
      gap: 0;
      padding: 12px 0;
      min-width: 100%;
    }

    .nav-links.open {
      display: flex;
    }

    a {
      padding: 14px 20px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    a:last-child {
      border-bottom: none;
    }
  }

  a {
    transition: all 0.2s;
  }

  a:hover {
    color: #3b82f6;
  }

  .logout-btn:hover {
    background: rgba(239,68,68,0.25) !important;
  }

  .mobile-menu-btn:hover {
    color: #3b82f6;
  }
`;