import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";

export default function AccommodationDashboardLayout({ children }) {
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Welcome";
  };

  const navItems = [
    {
      path: "/accommodation/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/accommodation/register-property",
      label: "Add Property",
      badge: "New",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      path: "/accommodation",
      label: "Browse Stays",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
      ),
    },
    {
      path: "/member",
      label: "Member Hub",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];

  const isActive = (path) => {
    if (path === "/accommodation/dashboard") {
      return location.pathname === "/accommodation/dashboard" || location.pathname.startsWith("/accommodation/dashboard/property");
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (logout) {
      logout("/accommodation");
    } else {
      window.location.href = "/accommodation";
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* AMBIENT BACKGROUND GLOWS */}
      <div style={styles.ambientTopLeft} />
      <div style={styles.ambientTopRight} />
      <div style={styles.ambientCenter} />

      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* BRAND */}
          <Link to="/accommodation/dashboard" style={styles.brand} onClick={() => setMenuOpen(false)}>
            <div style={styles.brandIconWrap}>
              <span style={styles.brandLogoAccent}>AXX</span>
              <span style={styles.brandLogoWord}>SPACE</span>
            </div>
            <div style={styles.brandBadge}>
              <span style={styles.brandBadgeDot} />
              <span>HOST PORTAL</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="host-nav-desktop" style={styles.nav}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.navLink,
                    ...(active ? styles.navLinkActive : {}),
                  }}
                  className={`host-nav-item ${active ? "active" : ""}`}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span style={styles.newBadge}>{item.badge}</span>}
                </Link>
              );
            })}
          </nav>

          {/* USER & ACTIONS */}
          <div style={styles.userSection}>
            <Link
              to="/accommodation/register-property"
              style={styles.addPropertyBtn}
              className="host-add-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>List Property</span>
            </Link>

            <div style={styles.userInfoWrap} className="host-user-info">
              <div style={styles.userInfoText}>
                <span style={styles.greetingText}>{getGreeting()}</span>
                <span style={styles.userName}>{user?.name?.split(" ")[0] || "Host"}</span>
              </div>
              <div style={styles.avatarWrap}>
                <ProfileAvatar user={user} size={36} />
                <span style={styles.avatarOnlinePulse} />
              </div>
            </div>

            <button
              type="button"
              style={styles.logoutBtn}
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="host-logout-text">Logout</span>
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button
              type="button"
              className="host-menu-toggle"
              style={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {menuOpen && (
          <div style={styles.mobileDrawer} className="host-mobile-drawer">
            <div style={styles.mobileUserInfo}>
              <ProfileAvatar user={user} size={42} />
              <div>
                <div style={styles.mobileUserName}>{user?.name || "Accommodation Host"}</div>
                <div style={styles.mobileUserEmail}>{user?.email || "host@axxspace.com"}</div>
                <div style={styles.mobileUserRole}>Verified Host Partner</div>
              </div>
            </div>

            <nav style={styles.mobileNav}>
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.mobileNavLink,
                      ...(active ? styles.mobileNavLinkActive : {}),
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span style={styles.mobileNavIcon}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span style={styles.newBadge}>{item.badge}</span>}
                  </Link>
                );
              })}
            </nav>

            <div style={styles.mobileFooterActions}>
              <Link
                to="/accommodation/register-property"
                style={styles.mobileAddBtn}
                onClick={() => setMenuOpen(false)}
              >
                + List New Property
              </Link>
              <button
                type="button"
                style={styles.mobileLogoutBtn}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080c18",
    color: "#f8fafc",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  ambientTopLeft: {
    position: "fixed",
    top: 0,
    left: "5%",
    width: "600px",
    height: "450px",
    background: "radial-gradient(ellipse at top left, rgba(5, 150, 105, 0.14) 0%, rgba(5, 150, 105, 0) 70%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(40px)",
  },
  ambientTopRight: {
    position: "fixed",
    top: 0,
    right: "5%",
    width: "550px",
    height: "400px",
    background: "radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.10) 0%, rgba(245, 158, 11, 0) 70%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(40px)",
  },
  ambientCenter: {
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "900px",
    height: "600px",
    background: "radial-gradient(ellipse at center, rgba(30, 41, 59, 0.25) 0%, rgba(15, 23, 42, 0) 75%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(60px)",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(10, 15, 28, 0.88)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  },
  headerInner: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    flexShrink: 0,
  },
  brandIconWrap: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  brandLogoAccent: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#fbbf24",
    letterSpacing: "-0.5px",
  },
  brandLogoWord: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  brandBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10.5px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "3px 9px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.25)",
  },
  brandBadgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  navLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  navLinkActive: {
    color: "#f8fafc",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  newBadge: {
    fontSize: "9px",
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  addPropertyBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    textDecoration: "none",
    padding: "8px 15px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 800,
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s ease",
  },
  userInfoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 8px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  userInfoText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  },
  greetingText: {
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  userName: {
    color: "#f8fafc",
    fontSize: "13.5px",
    fontWeight: 700,
    maxWidth: "130px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  avatarWrap: {
    position: "relative",
  },
  avatarOnlinePulse: {
    position: "absolute",
    bottom: "0px",
    right: "0px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#10b981",
    border: "2px solid #080c18",
  },
  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    color: "#94a3b8",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  menuToggle: {
    display: "none",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileDrawer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    background: "#0b1222",
    padding: "20px 24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  mobileUserName: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#ffffff",
  },
  mobileUserEmail: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  mobileUserRole: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#fbbf24",
    marginTop: "2px",
  },
  mobileNav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#94a3b8",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    background: "rgba(255, 255, 255, 0.03)",
  },
  mobileNavLinkActive: {
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid rgba(251, 191, 36, 0.25)",
  },
  mobileNavIcon: {
    display: "flex",
    alignItems: "center",
  },
  mobileFooterActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingTop: "10px",
  },
  mobileAddBtn: {
    display: "block",
    textAlign: "center",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    textDecoration: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "14px",
  },
  mobileLogoutBtn: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#f87171",
    padding: "11px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13.5px",
    cursor: "pointer",
  },
  main: {
    position: "relative",
    zIndex: 1,
    minHeight: "calc(100vh - 75px)",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..900;1,9..40,400..900&display=swap');

  .host-nav-item:hover {
    color: #f8fafc !important;
    background: rgba(255, 255, 255, 0.06) !important;
    transform: translateY(-1px);
  }

  .host-add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(251, 191, 36, 0.35) !important;
  }

  .host-logout-text {
    display: inline;
  }

  @media (max-width: 900px) {
    .host-nav-desktop {
      display: none !important;
    }
    .host-user-info {
      display: none !important;
    }
    .host-menu-toggle {
      display: flex !important;
    }
  }

  @media (max-width: 520px) {
    .host-logout-text {
      display: none;
    }
    .host-add-btn span {
      display: none;
    }
    .host-add-btn {
      padding: 8px 10px !important;
    }
  }
`;
