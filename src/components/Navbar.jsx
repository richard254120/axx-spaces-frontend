import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to check if someone is truly logged in
  const isLoggedIn = user && user._id; 

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <style>{css}</style>
      <div style={styles.navContainer}>
        
        {/* LOGO */}
        <Link to="/" style={styles.logoContainer} onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Axx Spaces" style={styles.logoImg} />
          <span style={styles.logoText}>AXX SPACES</span>
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${isOpen ? "open" : ""}`} style={styles.navLinks}>
          
          {/* --- ALWAYS SHOW THESE --- */}
          <Link to="/properties" style={styles.link} onClick={() => setIsOpen(false)}>Listings</Link>
          <Link to="/movers" style={styles.link} onClick={() => setIsOpen(false)}>🚚 Movers</Link>

          {/* --- GUEST LINKS (Only if not logged in) --- */}
          {!isLoggedIn && (
            <>
              <Link to="/login" style={styles.link} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" style={styles.registerBtn} onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}

          {/* --- LANDLORD LINKS --- */}
          {isLoggedIn && user.role === "landlord" && (
            <>
              <Link to="/dashboard" style={styles.link} onClick={() => setIsOpen(false)}>My Dashboard</Link>
              <Link to="/upload" style={styles.link} onClick={() => setIsOpen(false)}>➕ Upload Property</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}

          {/* --- MOVER LINKS --- */}
          {isLoggedIn && user.role === "mover" && (
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
  logoImg: { height: "45px", width: "auto" },
  logoText: { fontWeight: "800", color: "#111827", fontSize: "20px" },
  menuBtn: { display: "none", fontSize: "28px", background: "none", border: "none", cursor: "pointer" },
  navLinks: { display: "flex", alignItems: "center", gap: "24px" },
  link: { textDecoration: "none", color: "#4b5563", fontWeight: "600", fontSize: "15px" },
  registerBtn: { background: "#ef4444", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "700" },
  logoutBtn: { background: "#fee2e2", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
};

const css = `
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
      padding: 20px;
      gap: 15px !important;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .nav-links.open { display: flex !important; }
  }
`;