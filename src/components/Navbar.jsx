import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/image.png";

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
          
          {/* Logo & Title */}
          <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="Axx Spaces Logo" style={styles.logoImg} />
            <span>Axx Spaces</span>
          </Link>

          {/* Navigation Links - Now BELOW the heading/logo */}
          <div style={styles.desktopNav}>
            <Link to="/listings" style={styles.link}>Listings</Link>
            <Link to="/movers" style={styles.link}>🚚 Movers</Link>
            
            {token && (
              <Link to="/upload" style={styles.link}>Upload Property</Link>
            )}

            {!token ? (
              <>
                <Link to="/login" style={styles.link}>Login</Link>
                <Link to="/register" style={styles.link}>Register</Link>
              </>
            ) : (
              <Link to="/dashboard" style={styles.link}>📊 Dashboard</Link>
            )}
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
              <Link to="/listings" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                Listings
              </Link>
              <Link to="/movers" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                🚚 Movers
              </Link>
              
              {token ? (
                <>
                  <Link to="/upload" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                    Upload Property
                  </Link>
                  <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                    📊 My Dashboard
                  </Link>
                  <button style={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
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
    padding: "15px 0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "24px",
    fontWeight: 800,
    color: "#3b82f6",
    textDecoration: "none",
  },
  logoImg: {
    height: "45px",
    width: "auto",
  },
  // Links now below logo
  desktopNav: {
    display: "flex",
    gap: "22px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "15.5px",
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
  },
  mobileMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#06101f",
    borderTop: "1px solid rgba(59,130,246,0.15)",
    padding: "15px 0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  mobileLink: {
    display: "block",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    padding: "14px 25px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  logoutBtn: {
    width: "100%",
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "none",
    padding: "14px 25px",
    textAlign: "left",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @media (min-width: 768px) {
    .hamburger { display: none !important; }
  }

  @media (max-width: 767px) {
    .hamburger { display: block !important; }
    .desktopNav { display: none !important; }
  }

  a:hover, .link:hover {
    color: #60a5fa !important;
  }
`;