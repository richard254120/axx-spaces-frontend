import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import iconImage from "../assets/image.png";   // Your custom icon

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <div style={styles.logoContainer}>
        <img src={iconImage} alt="Axx Spaces Icon" style={styles.icon} />
        <h2 style={styles.logo}>Axx Spaces</h2>
      </div>

      <div style={styles.links}>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/listings">Listings</Link>

        {token ? (
          <>
            <Link style={styles.link} to="/upload">Upload Property</Link>
            <Link style={styles.link} to="/dashboard">My Properties</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link style={styles.link} to="/login">Login</Link>
            <Link style={styles.link} to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 40px",
    background: "#0a1f44",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  icon: {
    width: "34px",
    height: "34px",
    objectFit: "contain",
    borderRadius: "8px",
  },

  logo: {
    margin: 0,
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.8px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  link: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "16.5px",
    fontWeight: "700",           // Made bold as requested
    transition: "all 0.3s ease",
    position: "relative",
  },

  // Hover effect with underline animation
  linkHover: {
    color: "#60a5fa",
  },

  logoutBtn: {
    background: "transparent",
    border: "2px solid #ff4d4d",
    color: "#ff4d4d",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "9px 20px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
};

// Optional: Add this <style> block if you want even better hover effects
const css = `
  .nav-link:hover {
    color: #60a5fa !important;
    transform: translateY(-2px);
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background: #60a5fa;
    transition: width 0.3s ease;
  }
  
  .nav-link:hover::after {
    width: 100%;
  }
  
  .logoutBtn:hover {
    background: #ff4d4d;
    color: white;
    transform: translateY(-2px);
  }
`;