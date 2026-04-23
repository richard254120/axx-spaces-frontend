import { Link } from "react-router-dom";

export default function Navbar() {
  // 👉 Toggle admin visibility here
  const showAdmin = false;

  return (
    <div style={styles.nav}>
      <h2 style={styles.logo}>📍 Axx Spaces</h2>

      <div>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/listings">Listings</Link>
          <Link style={styles.link} to="/upload">Upload</Link>
        <Link style={styles.link} to="/login">Login</Link>

        {/* 👇 Admin is hidden but not deleted */}
        {showAdmin && (
          <Link style={styles.link} to="/admin">Admin</Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#0a1f44",
  },
  logo: { margin: 0 },
  link: {
    color: "white",
    marginLeft: "15px",
    textDecoration: "none",
  },
};