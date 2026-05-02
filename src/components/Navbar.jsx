import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/image.png"; // ✅ IMPORT LOGO

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
            <img src={logo} alt="Axx Spaces Logo" style={styles.logoImg} />
            <span>Axx Spaces</span>
          </Link>

          {/* Desktop Navigation (Always Visible) */}
          <div style={styles.desktopNav}>
            <Link to="/listings" style={styles.link}>
              🔍 Listings
            </Link>
            {!token ? (
              <Link to="/login" style={styles.link}>
                Login   
              </Link>
            ) : null}
          </div>

          {/* Hamburger Button */}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Mobile Menu */}
          {menuOpen && (
            <div style={styles.mobileMenu}>
              {token ? (
                <>
                  <Link 
                    to="/upload" 
                    style={styles.mobileLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    Upload Property
                  </Link>
                  <Link 
                    to="/dashboard" 
                    style={styles.mobileLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    📊 My Properties
                  </Link>
                  <button
                    style={styles.logoutBtn}
                    onClick={handleLogout}
                  >
                     Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    style={styles.mobileLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
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
    position: "relative",
  },
  logo: {
    display: "flex",               // ✅ align image + text
    alignItems: "center",
    gap: "10px",
    fontSize: "22px",
    fontWeight: 800,
    color: "#3b82f6",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  logoImg: {
    height: "40px",               // ✅ control logo size
    width: "auto",
  },
  desktopNav: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#cbd5e1",
    fontSize: "28px",
    cursor: "pointer",
    padding: "8px",
    transition: "color 0.2s",
  },
  mobileMenu: {
    position: "absolute",
    top: "70px",
    right: "0",
    background: "#06101f",
    border: "1px solid rgba(59,130,246,0.15)",
    borderRadius: "0 0 12px 12px",
    padding: "12px 0",
    minWidth: "250px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  mobileLink: {
    display: "block",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.2s",
  },
  logoutBtn: {
    width: "100%",
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "none",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.2s",
    textAlign: "left",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @media (min-width: 768px) {
    .hamburger {
      display: none !important;
    }
  }

  @media (max-width: 767px) {
    .hamburger {
      display: block !important;
    }
  }

  a {
    transition: all 0.2s;
  }

  a:hover {
    color: #3b82f6;
  }

  button:hover {
    background: rgba(239,68,68,0.25) !important;
  }

  .hamburger:hover {
    color: #3b82f6;
  }
`;