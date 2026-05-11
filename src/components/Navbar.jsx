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
        
        {/* Logo and Branding */}
        <Link to="/" style={styles.logoContainer} onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Axx Spaces" style={styles.logoImg} />
          <span style={styles.logoText}>AXX SPACES</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Links Navigation */}
        <div className={`nav-links ${isOpen ? "open" : ""}`} style={styles.navLinks}>
          
          {/* 1. ALWAYS VISIBLE PUBLIC LINKS */}
          <Link to="/properties" style={styles.link} onClick={() => setIsOpen(false)}>Listings</Link>
          <Link to="/movers" style={styles.link} onClick={() => setIsOpen(false)}>🚚 Movers</Link>

          {/* 2. LOGGED OUT ONLY: Show Login/Register */}
          {!user && (
            <>
              <Link to="/login" style={styles.link} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" style={styles.registerBtn} onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}

          {/* 3. LANDLORD LOGGED IN: Show Upload & Dashboard */}
          {user && user.role === "landlord" && (
            <>
              <Link to="/dashboard" style={styles.link} onClick={() => setIsOpen(false)}>My Dashboard</Link>
              <Link to="/upload" style={styles.link} onClick={() => setIsOpen(false)}>➕ Upload</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}

          {/* 4. MOVER LOGGED IN: Show Mover Dashboard */}
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
  nav: { background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "12px 0", position: "sticky", top: 0, zIndex: 1000 },
  navContainer: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
  logoImg: { height: "40px", width: "auto", borderRadius: "4px" },
  logoText: { fontWeight: "800", color: "#111827", fontSize: "18px" },
  menuBtn: { display: "none", fontSize: "24px", background: "none", border: "none", cursor: "pointer" },
  navLinks: { display: "flex", alignItems: "center", gap: "20px" },
  link: { textDecoration: "none", color: "#4b5563", fontWeight: "600", fontSize: "15px" },
  registerBtn: { background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "700" },
  logoutBtn: { background: "#f3f4f6", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" },
};

const css = `
  @media (max-width: 768px) {
    button[style*="menuBtn"] { display: block !important; }
    .nav-links {
      display: none !important;
      flex-direction: column;
      position: absolute;
      top: 64px;
      left: 0;
      width: 100%;
      background: white;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      gap: 15px !important;
    }
    .nav-links.open { display: flex !important; }
  }
`;