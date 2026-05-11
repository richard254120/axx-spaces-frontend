import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <style>{css}</style>
      <div style={styles.navContainer}>
        
        {/* --- LOGO --- */}
        <Link to="/" style={styles.logoContainer} onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Axx Spaces" style={styles.logoImg} />
          <span style={styles.logoText}>AXX SPACES</span>
        </Link>

        {/* --- MOBILE HAMBURGER --- */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        {/* --- NAVIGATION LINKS --- */}
        <div className={`nav-links ${isOpen ? "open" : ""}`} style={styles.navLinks}>
          
          {/* ALWAYS VISIBLE LINKS */}
          <Link to="/properties" style={styles.link} onClick={() => setIsOpen(false)}>Listings</Link>
          <Link to="/movers" style={styles.link} onClick={() => setIsOpen(false)}>🚚 Movers</Link>

          {/* 1. GUEST LINKS (Shown when not logged in) */}
          {!user && (
            <>
              <Link to="/login" style={styles.link} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" style={styles.registerBtn} onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}

          {/* 2. LANDLORD ONLY LINKS (Shown when logged in as landlord) */}
          {user && user.role === "landlord" && (
            <>
              <Link to="/dashboard" style={styles.link} onClick={() => setIsOpen(false)}>My Dashboard</Link>
              <Link to="/upload" style={styles.link} onClick={() => setIsOpen(false)}>➕ Upload Property</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}

          {/* 3. MOVER ONLY LINKS (Shown when logged in as mover) */}
          {user && user.role === "mover" && (
            <>
              <Link to="/mover-dashboard" style={styles.link} onClick={() => setIsOpen(false)}>Mover Dashboard</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { 
    background: "#ffffff", 
    borderBottom: "1px solid #e5e7eb", 
    padding: "12px 0", 
    position: "sticky", 
    top: 0, 
    zIndex: 1000 
  },
  navContainer: { 
    maxWidth: "1200px", 
    margin: "0 auto", 
    padding: "0 200px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  logoContainer: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    textDecoration: "none" 
  },
  logoImg: { 
    height: "45px", 
    width: "auto", 
    borderRadius: "4px" 
  },
  logoText: { 
    fontWeight: "800", 
    color: "#111827", 
    fontSize: "20px",
    letterSpacing: "-0.5px"
  },
  menuBtn: { 
    display: "none", 
    fontSize: "28px", 
    background: "none", 
    border: "none", 
    cursor: "pointer",
    color: "#111827"
  },
  navLinks: { 
    display: "flex", 
    alignItems: "center", 
    gap: "24px" 
  },
  link: { 
    textDecoration: "none", 
    color: "#4b5563", 
    fontWeight: "600", 
    fontSize: "15px",
    transition: "color 0.2s"
  },
  registerBtn: { 
    background: "#ef4444", 
    color: "white", 
    padding: "10px 20px", 
    borderRadius: "8px", 
    textDecoration: "none", 
    fontWeight: "700",
    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)"
  },
  logoutBtn: { 
    background: "#fee2e2", 
    color: "#ef4444", 
    border: "none", 
    padding: "8px 16px", 
    borderRadius: "8px", 
    fontWeight: "700", 
    cursor: "pointer" 
  },
};

const css = `
  .link:hover { color: #ef4444 !important; }
  
  @media (max-width: 992px) {
    button[style*="menuBtn"] { display: block !important; }
    .nav-links {
      display: none !important;
      flex-direction: column;
      position: absolute;
      top: 70px;
      left: 0;
      width: 100%;
      background: white;
      padding: 30px 20px;
      border-bottom: 2px solid #f3f4f6;
      gap: 20px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .nav-links.open { display: flex !important; }
  }
`;