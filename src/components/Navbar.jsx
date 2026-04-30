import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import iconImage from "../assets/image.png";

export default function Navbar() {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if current link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.nav}>
      <div style={styles.logoContainer}>
        <img src={iconImage} alt="Axx Spaces Icon" style={styles.icon} />
        <h2 style={styles.logo}>Axx Spaces</h2>
      </div>

      <div style={styles.links}>
        <Link 
          style={{ ...styles.link, ...(isActive('/') && styles.activeLink) }} 
          to="/"
        >
          Home
        </Link>
        
        <Link 
          style={{ ...styles.link, ...(isActive('/listings') && styles.activeLink) }} 
          to="/listings"
        >
          Listings
        </Link>

        {token ? (
          <>
            <Link 
              style={{ ...styles.link, ...(isActive('/upload') && styles.activeLink) }} 
              to="/upload"
            >
              + Upload Property
            </Link>
            
            <Link 
              style={{ ...styles.link, ...(isActive('/dashboard') && styles.activeLink) }} 
              to="/dashboard"
            >
              📊 My Properties
            </Link>

            {user?.name && (
              <span style={styles.userInfo}>
                Hi, {user.name.split(" ")[0]}
              </span>
            )}

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              style={{ ...styles.link, ...(isActive('/login') && styles.activeLink) }} 
              to="/login"
            >
              Login
            </Link>
            <Link 
              style={{ ...styles.link, ...(isActive('/register') && styles.activeLink) }} 
              to="/register"
            >
              Register
            </Link>
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
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  icon: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
    borderRadius: "8px",
  },

  logo: {
    margin: 0,
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "26px",
  },

  link: {
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "16.5px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    position: "relative",
    padding: "6px 0",
  },

  activeLink: {
    color: "#60a5fa",
    position: "relative",
  },

  userInfo: {
    color: "#94a3b8",
    fontSize: "15px",
    fontWeight: "600",
    padding: "6px 14px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "20px",
  },

  logoutBtn: {
    background: "transparent",
    border: "2px solid #ff4d4d",
    color: "#ff4d4d",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "9px 22px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
};

// Optional enhanced hover effect using injected CSS
const css = `
  .nav-link:hover {
    color: #60a5fa !important;
    transform: translateY(-2px);
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 3px;
    bottom: -2px;
    left: 0;
    background: linear-gradient(to right, #60a5fa, #3b82f6);
    transition: width 0.3s ease;
  }
  
  .nav-link:hover::after,
  .activeLink::after {
    width: 100%;
  }
  
  .logoutBtn:hover {
    background: #ff4d4d;
    color: white;
    transform: translateY(-2px);
  }
`;