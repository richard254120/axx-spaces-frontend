import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import AccountTypeSelector from "./AccountTypeSelector";
import NotificationBell from "./NotificationSystem";
import { getDashboardPath, getAccountNav, getWorkspaceBrand, isWorkspaceUser } from "../utils/dashboardRoutes";
import logo from "../assets/image.png";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [accountSelectorMode, setAccountSelectorMode] = useState("login");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(null);
  const [rentalsDropdownOpen, setRentalsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);
  const rentalsDropdownRef = useRef(null);

  const getDashboardLink = () => getDashboardPath(user?.role);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

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
    logout("/");
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
      if (rentalsDropdownRef.current && !rentalsDropdownRef.current.contains(e.target)) {
        setRentalsDropdownOpen(false);
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
            <span style={styles.dropdownIcon}>Home</span>
          </Link>
          <Link to="/axxbiashara" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>AxxBiashara</span>
          </Link>
          <Link to="/materials" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>QuickSales</span>
          </Link>
          <Link to="/listings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Rentals</span>
          </Link>
          <Link to="/movers" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Movers</span>
          </Link>
          <Link to="/tourism" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Tourism</span>
          </Link>
          <Link to="/about" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>About</span>
          </Link>
          <Link to="/faq" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>FAQ</span>
          </Link>
          <Link to="/axxwallet" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>AxxWallet</span>
          </Link>
          <Link to="/users" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Users</span>
          </Link>

          <div style={styles.dropdownDivider} />
          <div style={styles.dropdownHeader}>Jobs & Careers</div>
          <button
            style={styles.dropdownItem}
            onClick={() => setJobDropdownOpen(jobDropdownOpen === 'web-development' ? null : 'web-development')}
          >
            <div style={styles.jobItem}>
              <span style={styles.dropdownIcon}>Web Development</span>
              <span style={styles.dropdownArrow}>{jobDropdownOpen === 'web-development' ? '▼' : '▶'}</span>
            </div>
          </button>
          {jobDropdownOpen === 'web-development' && (
            <div style={styles.jobDropdownContent}>
              <span style={styles.jobDesc}>Custom websites, web apps, e-commerce platforms, and full-stack solutions tailored to your business needs</span>
              <Link to="/jobs/web-development" style={styles.jobLink} onClick={() => { setDropdownOpen(false); setJobDropdownOpen(null); }}>
                View Jobs →
              </Link>
            </div>
          )}
          <button
            style={styles.dropdownItem}
            onClick={() => setJobDropdownOpen(jobDropdownOpen === 'marketing' ? null : 'marketing')}
          >
            <div style={styles.jobItem}>
              <span style={styles.dropdownIcon}>Marketing</span>
              <span style={styles.dropdownArrow}>{jobDropdownOpen === 'marketing' ? '▼' : '▶'}</span>
            </div>
          </button>
          {jobDropdownOpen === 'marketing' && (
            <div style={styles.jobDropdownContent}>
              <span style={styles.jobDesc}>Digital marketing, SEO, social media management, content creation, and brand strategy to grow your online presence</span>
              <Link to="/jobs/marketing" style={styles.jobLink} onClick={() => { setDropdownOpen(false); setJobDropdownOpen(null); }}>
                View Jobs →
              </Link>
            </div>
          )}
          <button
            style={styles.dropdownItem}
            onClick={() => setJobDropdownOpen(jobDropdownOpen === 'ui-ux-design' ? null : 'ui-ux-design')}
          >
            <div style={styles.jobItem}>
              <span style={styles.dropdownIcon}>UI/UX Design</span>
              <span style={styles.dropdownArrow}>{jobDropdownOpen === 'ui-ux-design' ? '▼' : '▶'}</span>
            </div>
          </button>
          {jobDropdownOpen === 'ui-ux-design' && (
            <div style={styles.jobDropdownContent}>
              <span style={styles.jobDesc}>User interface design, user experience research, wireframing, prototyping, and design systems for digital products</span>
              <Link to="/jobs/ui-ux-design" style={styles.jobLink} onClick={() => { setDropdownOpen(false); setJobDropdownOpen(null); }}>
                View Jobs →
              </Link>
            </div>
          )}

          <div style={styles.dropdownDivider} />
          <div style={styles.dropdownHeader}>Help & Legal</div>
          <Link to="/contact" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Contact & Support</span>
          </Link>
          <Link to="/terms" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <span style={styles.dropdownIcon}>Terms & Privacy</span>
          </Link>

          {token && user ? (
            <>
              <div style={styles.dropdownDivider} />
              {/* ACCOUNT SECTION */}
              <div style={styles.dropdownHeader}>Account</div>
              <Link to="/messages" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Messages</span>
                <span style={styles.notifDot} />
              </Link>
              <Link to="/notifications" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Notifications</span>
                <span style={styles.notifDot} />
              </Link>
              <Link to="/saved" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Saved Listings</span>
              </Link>
              <Link to="/axxwallet" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>AxxWallet</span>
              </Link>
              <Link to="/upload" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Upload Property</span>
              </Link>
              <Link to={getDashboardLink()} style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Dashboard</span>
              </Link>
              <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Profile</span>
              </Link>
              <Link to="/settings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span style={styles.dropdownIcon}>Settings</span>
              </Link>
              <div style={styles.dropdownDivider} />
              <button style={styles.dropdownItemDanger} onClick={handleLogout}>
                <span style={styles.dropdownIcon}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <div style={styles.dropdownDivider} />
              <div style={styles.dropdownHeader}>Account</div>
              <button style={styles.dropdownItem} onClick={handleLoginClick}>
                <span style={styles.dropdownIcon}>Login</span>
              </button>
              <button style={styles.dropdownItem} onClick={handleRegisterClick}>
                <span style={styles.dropdownIcon}>Register</span>
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

  // ─── WORKSPACE NAVBAR (landlord, seller, mover, business, admin) ─────────
  if (token && user && isWorkspaceUser(user.role)) {
    const navItems = getAccountNav(user.role);
    const dashboardPath = getDashboardPath(user.role);
    const brand = getWorkspaceBrand(user.role);

    return (
      <nav style={styles.navbar}>
        <style>{css}</style>

        <div style={styles.topSection}>
          <Link to={dashboardPath} style={styles.logoContainer}>
            <img src={logo} alt="Axxspace" style={styles.logo} />
            <div style={styles.titleSection}>
              <span style={styles.brandName}>{brand}</span>
            </div>
          </Link>

          <div style={styles.topRight}>
            <button
              style={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ ...styles.navLink, ...(isActive(item.path) && styles.navLinkActive) }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div style={styles.userSection}>
            <ProfileAvatar user={user} size={32} />
            <span style={styles.userName}>{user?.name}</span>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Log out" aria-label="Log out">
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ─── REGULAR NAVBAR (guests & renters browsing the site) ─────────────────
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
          {/* Account Indicator */}
          {token && user ? (
            <div style={styles.accountIndicator} ref={accountRef}>
              <button
                style={styles.accountBtn}
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <ProfileAvatar user={user} size={28} />
                <span style={styles.accountStatus}>In Account</span>
              </button>
              {accountOpen && (
                <div style={styles.accountDropdown}>
                  <div style={styles.accountHeader}>
                    <ProfileAvatar user={user} size={40} />
                    <div>
                      <div style={styles.accountName}>{user.name}</div>
                      <div style={styles.accountRole}>{user.role?.toUpperCase() || "USER"}</div>
                    </div>
                  </div>
                  <div style={styles.accountDivider} />
                  <Link
                    to="/profile"
                    style={styles.accountItem}
                    onClick={() => { setAccountOpen(false); setMenuOpen(false); }}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    style={styles.accountItem}
                    onClick={() => { setAccountOpen(false); setMenuOpen(false); }}
                  >
                    Settings
                  </Link>
                  <button
                    style={styles.accountLogout}
                    onClick={() => { handleLogout(); setAccountOpen(false); setMenuOpen(false); }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              style={styles.guestAccountBtn}
              onClick={() => setAccountSelectorOpen(true)}
            >
              Sign In
            </button>
          )}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div style={{ ...styles.navLinksContainer, ...(menuOpen && styles.navLinksContainerOpen) }}>
        <Link to="/" style={{ ...styles.navLink, ...(isActive("/") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/axxbiashara" style={{ ...styles.navLink, ...(isActive("/axxbiashara") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
          AxxBiashara
        </Link>
        <Link to="/materials" style={{ ...styles.navLink, ...(isActive("/materials") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
          QuickSales
        </Link>
        <Link to="/listings" style={{ ...styles.navLink, ...(isActive("/listings") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
          Rentals
        </Link>
        <Link to="/tourism" style={{ ...styles.navLink, ...(isActive("/tourism") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
          Tourism
        </Link>

        {token && user && (
          <Link to="/settings" style={{ ...styles.navLink, ...(isActive("/settings") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
            Settings
          </Link>
        )}

        {token && user && (
          <>
            <Link to="/upload" style={{ ...styles.navLink, ...(isActive("/upload") && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
              Upload
            </Link>
            <Link to={getDashboardLink()} style={{ ...styles.navLink, ...(isActive(getDashboardLink()) && styles.navLinkActive) }} onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
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
                      📋 Payment History
                    </Link>
                    <Link
                      to={getDashboardLink()}
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
    zIndex: 1000,
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
    gap: "10px",
    textDecoration: "none",
    cursor: "pointer",
    padding: "6px 12px",
    background: "linear-gradient(135deg, rgba(251, 36, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)",
    border: "1px solid rgba(251, 36, 36, 0.2)",
    borderRadius: "12px",
    transition: "all 0.3s ease",
  },

  logo: {
    height: "36px",
    width: "auto",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },

  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },

  brandName: {
    fontSize: "18px",
    fontWeight: 900,
    background: "linear-gradient(135deg, #FB2424 0%, #F59E0B 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
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
    gap: "4px",
    flexWrap: "nowrap",
    listStyle: "none",
    margin: 0,
    padding: 0,
    overflowX: "auto",
  },

  navLinksContainerOpen: {
    display: "flex",
  },

  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s",
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
    position: "relative",
  },

  navLinkActive: {
    color: "#fbbf24",
    paddingBottom: "4px",
    borderBottom: "2px solid #fbbf24",
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
    zIndex: 1000,
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
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    borderRadius: "16px",
    minWidth: "280px",
    zIndex: 9999,
    overflow: "visible",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 15px rgba(251, 191, 36, 0.08)",
    backdropFilter: "blur(16px)",
    padding: "6px 0",
  },

  dropdownHeader: {
    padding: "14px 20px 8px",
    fontSize: "10px",
    fontWeight: 800,
    color: "#fbbf24",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    borderBottom: "1px solid rgba(51, 65, 85, 0.25)",
    background: "rgba(251, 191, 36, 0.02)",
  },

  dropdownItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    borderBottom: "1px solid rgba(51, 65, 85, 0.1)",
    position: "relative",
    background: "transparent",
    borderLeft: "3px solid transparent",
  },

  dropdownItemDanger: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 20px",
    color: "#fca5a5",
    fontSize: "13px",
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: "1px solid rgba(239, 68, 68, 0.25)",
    borderLeft: "3px solid transparent",
  },

  dropdownIcon: {
    fontSize: "13px",
    fontWeight: 600,
    color: "inherit",
    flexShrink: 0,
  },

  jobItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  jobDesc: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 500,
    lineHeight: "1.4",
  },

  jobDropdownContent: {
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.45)",
    borderBottom: "1px solid rgba(51, 65, 85, 0.15)",
    borderLeft: "2px solid #fbbf24",
    marginLeft: "18px",
    marginRight: "18px",
    borderRadius: "8px",
    marginTop: "4px",
    marginBottom: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  jobLink: {
    display: "inline-block",
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: 700,
    textDecoration: "none",
    transition: "all 0.2s ease",
    alignSelf: "flex-start",
  },

  dropdownDivider: {
    height: "1px",
    background: "rgba(51, 65, 85, 0.25)",
    margin: "4px 0",
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

  // ─── ACCOUNT INDICATOR STYLES ───────────────────────────────────────────────

  accountIndicator: {
    position: "relative",
  },

  accountBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "20px",
    color: "#fbbf24",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  accountStatus: {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },

  accountDropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    background: "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,41,0.98) 100%)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "16px",
    minWidth: "240px",
    zIndex: 300,
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.15)",
    backdropFilter: "blur(12px)",
  },

  accountHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "linear-gradient(180deg, rgba(251,191,36,0.05) 0%, transparent 100%)",
  },

  accountName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "4px",
  },

  accountRole: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#fbbf24",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  accountDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, rgba(51,65,85,0.5) 20%, rgba(51,65,85,0.5) 80%, transparent 100%)",
    margin: "6px 0",
    border: "none",
  },

  accountItem: {
    display: "block",
    padding: "12px 20px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid rgba(51,65,85,0.2)",
  },

  accountLogout: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    color: "#fca5a5",
    fontSize: "14px",
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderTop: "1px solid rgba(239,68,68,0.3)",
  },

  guestAccountBtn: {
    padding: "8px 18px",
    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "20px",
    color: "#fbbf24",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // ─── ACCOUNT TAB DROPDOWN STYLES ─────────────────────────────────────────

  accountWrapper: {
    position: "relative",
  },

  // ─── RENTALS DROPDOWN STYLES ─────────────────────────────────────────────

  rentalsDropdownWrapper: {
    position: "relative",
  },

  rentalsDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    background: "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,41,0.98) 100%)",
    border: "1px solid rgba(251,191,36,0.3)",
    borderRadius: "12px",
    minWidth: "180px",
    zIndex: 1000,
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
  },

  rentalsDropdownItem: {
    display: "block",
    padding: "12px 16px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    borderBottom: "1px solid rgba(51,65,85,0.2)",
  },

  rentalsDropdownHeader: {
    padding: "8px 14px 4px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
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
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%) !important;
    color: #fbbf24 !important;
    border-left: 3px solid #fbbf24 !important;
    padding-left: 17px !important;
  }

  button[style*="color: #fca5a5"]:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    border-left: 3px solid #ef4444 !important;
    padding-left: 17px !important;
  }

  @media (max-width: 768px) {
    [style*="display: none"][style*="background: none"][style*="border: none"] {
      display: block !important;
    }

    [style*="display: flex"][style*="gap: 4px"][style*="flexWrap: nowrap"] {
      display: flex !important;
      gap: 2px !important;
    }

    [style*="display: flex"][style*="gap: 4px"][style*="flexWrap: nowrap"] a {
      padding: 6px 6px !important;
      font-size: 11px !important;
    }
  }

  @media (max-width: 480px) {
    [style*="display: flex"][style*="gap: 4px"][style*="flexWrap: nowrap"] {
      gap: 3px !important;
    }

    [style*="display: flex"][style*="gap: 4px"][style*="flexWrap: nowrap"] a {
      padding: 6px 5px !important;
      font-size: 11px !important;
      min-width: fit-content !important;
    }

    img[style*="height: 40px"] {
      height: 32px !important;
      width: auto !important;
    }

    [style*="background: linear-gradient(135deg, rgba(251, 36, 36, 0.1)"] {
      padding: 4px 8px !important;
    }

    [style*="background: linear-gradient(135deg, #FB2424"] {
      font-size: 15px !important;
    }
  }
`;