import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <>
      <style>{css}</style>
      
      <nav style={styles.navbar}>
        <div style={styles.container}>
          
          {/* Logo */}
          <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
            🏠 Axx Spaces
          </Link>

          {/* Hamburger Button (Mobile Only) */}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Navigation Links */}
          <div
            style={{
              ...styles.navLinks,
              ...(menuOpen && styles.navLinksActive)
            }}
            className={menuOpen ? "nav-active" : ""}
          >
            <Link to="/" style={styles.link} onClick={() => setMenuOpen(false)}>
              🏠 Home
            </Link>
            <Link to="/listings" style={styles.link} onClick={() => setMenuOpen(false)}>
              🔍 Listings
            </Link>

            {token ? (
              <>
                <Link to="/upload" style={styles.link} onClick={() => setMenuOpen(false)}>
                  ➕ Upload
                </Link>
                <Link to="/dashboard" style={styles.link} onClick={() => setMenuOpen(false)}>
                  📊 My Properties
                </Link>
                <button
                  style={styles.logoutBtn}
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.link} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={styles.registerBtn}
                  onClick={() => setMenuOpen(false)}
                >
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
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#cbd5e1",
    fontSize: "28px",
    cursor: "pointer",
    padding: "8px",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  navLinksActive: {
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
    display: "block",
    transition: "all 0.2s",
  },
  registerBtn: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 700,
    padding: "10px 20px",
    background: "rgba(59,130,246,0.15)",
    borderRadius: "8px",
    border: "1px solid rgba(59,130,246,0.3)",
    display: "block",
    textAlign: "center",
    transition: "all 0.2s",
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
    margin: "8px 20px 0",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  /* DESKTOP - All links visible */
  @media (min-width: 768px) {
    .hamburger {
      display: none !important;
    }

    .nav-links {
      display: flex !important;
      position: static !important;
      background: none !important;
      border: none !important;
      padding: 0 !important;
      gap: 20px;
      flex-direction: row !important;
    }

    a {
      padding: 12px 0 !important;
      border: none !important;
    }
  }

  /* MOBILE - Hamburger menu */
  @media (max-width: 767px) {
    .hamburger {
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
      width: 100vw;
      margin-left: -20px;
    }

    .nav-active {
      display: flex !important;
    }

    a {
      padding: 14px 20px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      margin: 0 !important;
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

  .hamburger:hover {
    color: #3b82f6;
  }
`;