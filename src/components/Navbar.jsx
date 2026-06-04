import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import AccountTypeSelector from "./AccountTypeSelector";
import NotificationBell from "./NotificationSystem";
import logo from "../assets/image.png";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [accountSelectorMode, setAccountSelectorMode] = useState("login");
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);

  const handleLoginClick = () => {
    setAccountSelectorMode("login");
    setAccountSelectorOpen(true);
    setDropdownOpen(false);
  };

  const handleRegisterClick = () => {
    setAccountSelectorMode("register");
    setAccountSelectorOpen(true);
    setDropdownOpen(false);
  };

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
          <Link to="/axxbiashara" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>�</span> AxxBiashara
          </Link>
          <Link to="/materials" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🛍️</span> MarketPlace
          </Link>
          <Link to="/listings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🏢</span> Rentals
          </Link>
          <Link to="/movers" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🚛</span> Movers
          </Link>
          <Link to="/tourism" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>🏨</span> Tourism
          </Link>
          <Link to="/users" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>👥</span> Users
          </Link>
          <Link to="/about" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>ℹ️</span> About
          </Link>
          <Link to="/faq" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>❓</span> FAQ
          </Link>

          <div style={styles.dropdownDivider} />
          <div style={styles.dropdownHeader}>Help & Legal</div>
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
              <Link to="/business-dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>🏪</span> Business Dashboard
              </Link>
              {user?.role === "landlord" && (
                <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  <span style={styles.dropdownIcon}>📊</span> Dashboard
                </Link>
              )}
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
              <button style={styles.dropdownItem} onClick={handleLoginClick}>
                <span style={styles.dropdownIcon}>🔑</span> Login
              </button>
              <button style={styles.dropdownItem} onClick={handleRegisterClick}>
                <span style={styles.dropdownIcon}>📝</span> Register
              </button>
            </>
          )}
        </div>
      )}

      <AccountTypeSelector
        isOpen={accountSelectorOpen}
        onClose={() => setAccountSelectorOpen(false)}
        mode={accountSelectorMode}
      />
    </div>
  );

  // ─── MOVER NAVBAR ─────────────────────────────────────────────────────────
  if (user?.role === "mover") {
    return (
      <nav style={styles.navbar}>
        <style>{css}</style>

        <div style={styles.topSection}>
          <Link to="/mover-dashboard" style={styles.logoContainer}>
            <img src={logo} alt="Axxspace" style={styles.logo} />
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
            <ProfileAvatar user={user} size={32} />
            <span style={styles.userName}>{user?.name}</span>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Log out" aria-label="Log out">
              🚪
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
          <img src={logo} alt="AxxSpace" style={styles.logo} />
          <div style={styles.titleSection}>
            <span style={styles.brandName}>AxxSpace</span>
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
        <Link to="/axxbiashara" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          AxxBiashara
        </Link>
        <Link to="/materials" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          MarketPlace
        </Link>
        <Link to="/listings" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Rentals
        </Link>
        <Link to="/movers" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Movers
        </Link>
        <Link to="/tourism" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          Tourism
        </Link>
        <Link to="/about" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          About
        </Link>
        <Link to="/faq" style={styles.navLink} onClick={() => setMenuOpen(false)}>
          FAQ
        </Link>

        {token && user && (
          <>
            <Link to="/upload" style={styles.navLink} onClick={() => setMenuOpen(false)}>
              Upload
            </Link>
            {user?.role === "landlord" && (
              <Link to="/dashboard" style={styles.navLink} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <div style={styles.userSection}>
              <NotificationBell />
              <div style={styles.userDropdownWrapper} ref={dropdownRef}>
                <button
                  style={styles.userDropdownBtn}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <ProfileAvatar user={user} size={32} />
                  <span style={styles.userName}>{user.name}</span>
                  <span style={styles.dropdownArrow}>{dropdownOpen ? "▲" : "▼"}</span>
                </button>
                {dropdownOpen && (
                  <div style={styles.userDropdown}>
                    <Link
                      to="/payment-history"
                      style={styles.dropdownItem}
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    >
                      💳 Payment History
                    </Link>
                    <Link
                      to="/dashboard"
                      style={styles.dropdownItem}
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      style={styles.dropdownItem}
                      onClick={() => { handleLogout(); setDropdownOpen(false); setMenuOpen(false); }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
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
    borderRadius: "50%",
  },

  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  brandName: {
    fontSize: "16px",
    fontWeight: 800,
    color: "rgb(251, 36, 36)",
    letterSpacing: "0.5px",
  },

  hamburger: {
    display: "none",
    background: "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "10px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(251,191,36,0.1)",
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

  userDropdownWrapper: {
    position: "relative",
  },

  userDropdownBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },

  dropdownArrow: {
    fontSize: "10px",
    color: "#94a3b8",
  },

  userDropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    background: "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,41,0.98) 100%)",
    border: "1px solid #334155",
    borderRadius: "12px",
    minWidth: "200px",
    zIndex: 1000,
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    overflow: "hidden",
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
    background: "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
    fontSize: "18px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "10px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    lineHeight: 1,
    boxShadow: "0 2px 8px rgba(251,191,36,0.1)",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 12px)",
    background: "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,41,0.98) 100%)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "16px",
    minWidth: "240px",
    zIndex: 200,
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.1)",
    backdropFilter: "blur(12px)",
    animation: "dropdownFadeIn 0.25s ease-out",
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
    gap: "12px",
    padding: "12px 18px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid rgba(51,65,85,0.3)",
    position: "relative",
  },

  dropdownItemDanger: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 18px",
    color: "#fca5a5",
    fontSize: "14px",
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderTop: "1px solid rgba(239,68,68,0.2)",
  },

  dropdownIcon: {
    fontSize: "16px",
    width: "22px",
    textAlign: "center",
    flexShrink: 0,
    filter: "drop-shadow(0 0 4px rgba(251,191,36,0.3))",
  },

  dropdownDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, rgba(51,65,85,0.5) 20%, rgba(51,65,85,0.5) 80%, transparent 100%)",
    margin: "6px 0",
    border: "none",
  },

  notifDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    background: "#a244ef",
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

  // ─── RENTALS DROPDOWN STYLES ─────────────────────────────────────────────

  rentalsDropdownHeader: {
    padding: "8px 14px 4px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  rentalsDropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: "8px",
    transition: "background 0.15s",
  },

  rentalsDropdownDivider: {
    height: "1px",
    background: "#334155",
    margin: "8px 0 4px",
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
      display: none !important;
    }

    [style*="display: flex"][style*="gap: 8px"][style*="flexWrap"][style*="display: flex"] {
      display: flex !important;
      position: fixed !important;
      top: 76px !important;
      left: 0 !important;
      right: 0 !important;
      flex-direction: column !important;
      background: linear-gradient(135deg, #1e293b 0%, #0f1729 100%) !important;
      padding: 12px 0 !important;
      gap: 0 !important;
      max-height: 600px !important;
      overflow-y: auto !important;
      align-items: stretch !important;
      z-index: 99 !important;
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