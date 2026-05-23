import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/image.png";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
    setDropdownOpen(false);
    setAccountOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── HAMBURGER DROPDOWN MENU (top-right icon) ────────────────────────────
  const HamburgerDropdown = () => (
    <div style={styles.dropdownWrapper} ref={dropdownRef}>
      <button
        style={styles.menuIconBtn}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Open menu"
      >
        {dropdownOpen ? "✕" : "☰"}
      </button>

      {dropdownOpen && (
        <div style={styles.dropdown}>
          {/* NAVIGATION SECTION */}
          <div style={styles.dropdownHeader}>Navigation</div>
          <Link to="/" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🏠</span> Home
          </Link>
          <Link to="/listings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🏢</span> Listings
          </Link>
          <Link to="/movers" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🚛</span> Movers
          </Link>
          <Link to="/materials" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🛍️</span> Merchants
          </Link>
          <Link to="/tourism" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🏨</span> Tourism
          </Link>
          <Link to="/about" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>ℹ️</span> About
          </Link>

          <div style={styles.dropdownDivider} />
          <div style={styles.dropdownHeader}>Help & Legal</div>
          <Link to="/faq" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>❓</span> FAQ
          </Link>
          <Link to="/contact" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>📞</span> Contact & Support
          </Link>
          <Link to="/terms" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>📄</span> Terms & Privacy
          </Link>

          {token && user ? (
            <>
              <div style={styles.dropdownDivider} />
              {/* ACCOUNT SECTION */}
              <div style={styles.dropdownHeader}>Account</div>
              <Link to="/messages" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>💬</span> Messages
                <span style={styles.notifDot} />
              </Link>
              <Link to="/notifications" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>🔔</span> Notifications
                <span style={styles.notifDot} />
              </Link>
              <Link to="/saved" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>❤️</span> Saved Listings
              </Link>
              <Link to="/upload" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>📤</span> Upload Property
              </Link>
              <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>📊</span> Dashboard
              </Link>
              <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>👤</span> Profile
              </Link>
              <Link to="/settings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>⚙️</span> Settings
              </Link>
              <div style={styles.dropdownDivider} />
              <button style={styles.dropdownItemDanger} onClick={handleLogout}>
                <span style={styles.dropdownIcon}>🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <div style={styles.dropdownDivider} />
              <div style={styles.dropdownHeader}>Account</div>
              <Link to="/login" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>🔑</span> Login
              </Link>
              <Link to="/register" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>📝</span> Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );

  // ─── MOVER NAVBAR ─────────────────────────────────────────────────────────
  if (user?.role === "mover") {
    return (
      <nav style={styles.navbar}>
        <style>{css}</style>

        <div style={styles.topSection}>
          <Link to="/mover-dashboard" style={styles.logoContainer}>
            <img src={logo} alt="Axx Spaces" style={styles.logo} />
            <div style={styles.titleSection}>
              <span style={styles.brandName}>Axx Movers</span>
            </div>
          </Link>

          <div style={styles.topRight}>
            <HamburgerDropdown />
            <button
              style={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
          <Link to="/mover-dashboard" style={styles.navLink} onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <div style={styles.userSection}>
            <span style={styles.userName}>{user?.name}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ─── REGULAR NAVBAR ───────────────────────────────────────────────────────
  return (
    <nav style={styles.navbar}>
      <style>{css}</style>

      <div style={styles.topSection}>
        <Link to="/" style={styles.logoContainer}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
          <div style={styles.titleSection}>
            <span style={styles.brandName}>Axx Spaces</span>
          </div>
        </Link>

        <div style={styles.topRight}>
          <HamburgerDropdown />
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
        <Link to="/" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/listings" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Listings
        </Link>
        <Link to="/movers" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Movers
        </Link>
        <Link to="/materials" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Merchants
        </Link>
        <Link to="/tourism" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Tourism
        </Link>

        {token && user ? (
          <>
            <Link to="/upload" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              Upload
            </Link>
            <Link to="/dashboard" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <div style={styles.userSection}>
              <span style={styles.userName}>{user.name}</span>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/about" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              About
            </Link>

            {/* ─── SINGLE ACCOUNT TAB ─── */}
            <div style={styles.accountWrapper} ref={accountRef}>
              <button
                style={{
                  ...styles.navLink,
                  background: accountOpen ? "rgba(251,191,36,0.12)" : "transparent",
                  color: accountOpen ? "#fbbf24" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onClick={() => setAccountOpen(!accountOpen)}
              >
                Account <span style={{ fontSize: "10px", opacity: 0.7 }}>{accountOpen ? "▲" : "▼"}</span>
              </button>

              {accountOpen && (
                <div style={styles.accountDropdown}>
                  <div style={styles.accountDropdownTitle}>Welcome back</div>
                  <p style={styles.accountDropdownSubtitle}>Sign in or create an account</p>

                  <Link
                    to="/login"
                    style={styles.accountBtn}
                    onClick={() => { setAccountOpen(false); setMenuOpen(false); }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    style={styles.accountBtnOutline}
                    onClick={() => { setAccountOpen(false); setMenuOpen(false); }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    color: "#f1f5f9",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    fontFamily: "'DM Sans', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "12px 16px",
  },

  topSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    cursor: "pointer",
  },

  logo: {
    height: "40px",
    width: "auto",
  },

  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  brandName: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#fbbf24",
    letterSpacing: "0.5px",
  },

  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fbbf24",
    fontSize: "26px",
    cursor: "pointer",
    padding: "6px",
  },

  navLinksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  navLinksContainerOpen: {
    display: "flex",
  },

  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
    transition: "all 0.2s",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderLeft: "1px solid #334155",
    paddingLeft: "8px",
    marginLeft: "8px",
  },

  userName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#fbbf24",
  },

  logoutBtn: {
    padding: "4px 8px",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s",
  },

  // ─── HAMBURGER DROPDOWN STYLES ────────────────────────────────────────────

  dropdownWrapper: {
    position: "relative",
  },

  menuIconBtn: {
    background: "none",
    border: "1px solid #334155",
    color: "#fbbf24",
    fontSize: "18px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "8px",
    transition: "all 0.2s",
    lineHeight: 1,
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    minWidth: "210px",
    zIndex: 200,
    overflow: "hidden",
    boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
  },

  dropdownHeader: {
    padding: "8px 14px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderBottom: "1px solid #1e3a5f22",
  },

  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.15s",
    borderBottom: "1px solid rgba(51,65,85,0.4)",
  },

  dropdownItemDanger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 16px",
    color: "#fca5a5",
    fontSize: "13px",
    fontWeight: 600,
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.15s",
  },

  dropdownIcon: {
    fontSize: "15px",
    width: "20px",
    textAlign: "center",
    flexShrink: 0,
  },

  dropdownDivider: {
    height: "1px",
    background: "#334155",
    margin: "4px 0",
    border: "none",
  },

  notifDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    background: "#ef4444",
    borderRadius: "50%",
    marginLeft: "auto",
    flexShrink: 0,
  },

  // ─── ACCOUNT TAB DROPDOWN STYLES ─────────────────────────────────────────

  accountWrapper: {
    position: "relative",
  },

  accountDropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "16px",
    minWidth: "220px",
    zIndex: 300,
    boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
  },

  accountDropdownTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "2px",
  },

  accountDropdownSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "14px",
  },

  accountBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "9px 14px",
    background: "#fbbf24",
    color: "#0f1729",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "8px",
    transition: "all 0.2s",
  },

  accountBtnOutline: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "9px 14px",
    background: "transparent",
    color: "#cbd5e1",
    border: "1px solid #334155",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
    transition: "all 0.2s",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  a[style*="color: #cbd5e1"]:hover {
    background: rgba(251, 191, 36, 0.1) !important;
    color: #fbbf24 !important;
  }

  button[style*="background: rgba(239"]:hover {
    background: rgba(239, 68, 68, 0.3) !important;
  }

  button[style*="border: 1px solid #334155"]:hover {
    background: rgba(251, 191, 36, 0.1) !important;
    border-color: #fbbf24 !important;
  }

  a[style*="color: #cbd5e1"][style*="display: flex"]:hover,
  button[style*="color: #cbd5e1"]:hover {
    background: rgba(251, 191, 36, 0.08) !important;
    color: #fbbf24 !important;
  }

  button[style*="color: #fca5a5"]:hover {
    background: rgba(239, 68, 68, 0.15) !important;
  }

  @media (max-width: 768px) {
    [style*="display: none"][style*="background: none"][style*="border: none"] {
      display: block !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] {
      position: fixed !important;
      top: 76px !important;
      left: 0 !important;
      right: 0 !important;
      flex-direction: column !important;
      background: linear-gradient(135deg, #1e293b 0%, #0f1729 100%) !important;
      padding: 12px 0 !important;
      gap: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.3s ease !important;
      align-items: stretch !important;
      z-index: 99 !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"][style*="display: flex"] {
      max-height: 600px !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] a {
      padding: 14px 16px !important;
      width: 100% !important;
      text-align: left !important;
      border-bottom: 1px solid #334155 !important;
      font-size: 14px !important;
      border-radius: 0 !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] [style*="borderLeft"] {
      border-left: none !important;
      border-top: 1px solid #334155 !important;
      padding-left: 16px !important;
      padding-top: 12px !important;
      margin-left: 0 !important;
      margin-top: 0 !important;
      flex-direction: column !important;
      gap: 10px !important;
      width: 100% !important;
      padding: 12px 16px !important;
      align-items: flex-start !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"] button[style*="background: rgba(239"] {
      width: 100% !important;
      padding: 10px 12px !important;
    }
  }

  @media (max-width: 480px) {
    img[style*="height: 40px"] {
      height: 32px !important;
      width: auto !important;
    }
  }
`;