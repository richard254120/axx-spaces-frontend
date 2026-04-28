import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <h2 style={styles.logo}>📍 Axx Spaces</h2>

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
  },
  logo: {
    margin: 0,
    color: "white",
    fontSize: "24px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    color: "#ff4d4d",
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px 12px",
  },
};