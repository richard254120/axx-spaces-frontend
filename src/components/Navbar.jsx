import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import iconImage from "../assets/image.png";   // ← Your custom image

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
            <Link style={styles.link} to="/dashboard">📊 My Properties</Link>
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
    padding: "15px 30px",
    background: "#0a1f44",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  icon: {
    width: "32px",
    height: "32px",
    objectFit: "contain",
    borderRadius: "6px",
  },
  logo: {
    margin: 0,
    color: "white",
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #ff4d4d",
    color: "#ff4d4d",
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: 500,
  },
};