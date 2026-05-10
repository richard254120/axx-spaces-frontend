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
        {/* Logo */}
        <Link to="/" style={styles.logoContainer}>
          <img src={logo} alt="Axx Spaces" style={styles.logoImg} />
          <span style={styles.logoText}>AXX SPACES</span>
        </Link>

        {/* Mobile Toggle */}
        <button style={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Links Section */}
        <div style={{ ...styles.navLinks, display: isOpen ? "flex" : "" }} className={isOpen ? "open" : ""}>
          
          {/* 1. PUBLIC LINKS */}
          {!user && (
            <>
              <Link to="/properties" style={styles.link}>Properties</Link>
              <Link to="/movers" style={styles.link}>Join as Mover</Link>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
            </>
          )}

          {/* 2. LANDLORD ONLY LINKS */}
          {user && user.role === "landlord" && (
            <>
              <Link to="/dashboard" style={styles.link}>My Listings</Link>
              <Link to="/add-property" style={styles.link}>➕ Upload Property</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}

          {/* 3. MOVER ONLY LINKS */}
          {user && user.role === "mover" && (
            <>
              <Link to="/mover-dashboard" style={styles.link}>My Dashboard</Link>
              <Link to="/mover-dashboard" style={styles.link}>Available Jobs</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: "#ffffff", borderBottom: "2px solid #f3f4f6", padding: "10px 0", position: "sticky", top: 0, zIndex: 1000 },
  navContainer: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
  logoImg: { height: "40px", borderRadius: "5px" },
  logoText: { fontWeight: "900", color: "#1f2937", fontSize: "18px", letterSpacing: "1px" },
  menuBtn: { display: "none", fontSize: "24px", background: "none", border: "none", cursor: "pointer", color: "#1f2937" },
  navLinks: { display: "flex", alignItems: "center", gap: "25px" },
  link: { textDecoration: "none", color: "#4b5563", fontWeight: "600", fontSize: "14px", transition: "0.2s" },
  loginBtn: { background: "#ef4444", color: "white", padding: "8px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: "700" },
  logoutBtn: { background: "#f3f4f6", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#ef4444" },
};

const css = `
  @media (max-width: 768px) {
    button[style*="menuBtn"] { display: block !important; }
    div[style*="navLinks"] {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 60px;
      left: 0;
      width: 100%;
      background: white;
      padding: 20px;
      border-bottom: 2px solid #f3f4f6;
      gap: 15px;
    }
    div[style*="navLinks"].open { display: flex !important; }
  }
`;