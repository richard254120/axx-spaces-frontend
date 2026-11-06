import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ProfileAvatar } from "../../features/profile";
import {
  clearSellerSession,
  getDashboardPath,
  getWorkspaceBrand,
  isWorkspaceUser,
  resolveAuth,
} from "../../utils/dashboardRoutes";
import { DASH, withAlpha, getAccent } from "../../styles/dashboardTheme";
import logo from "../../assets/image.png";

// Shared workspace chrome for the four provider dashboards: a fixed sidebar
// (brand + section/route nav) and a slim sticky topbar (greeting + avatar +
// sign out). It intentionally mirrors AccountLayout's auth handling so logout
// and seller-session resolution behave identically.
export default function DashboardShell({
  role,
  brand,
  accent,
  nav = [],
  activeId,
  onSelect,
  preferSeller = false,
  logoutTo = "/",
  title,
  subtitle,
  topbarActions,
  sidebarHeader,
  sidebarFooter,
  children,
  maxWidth = "1320px",
}) {
  const authContext = useContext(AuthContext);
  const { user } = resolveAuth(authContext, { preferSeller });
  const logout = authContext?.logout;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const effRole = role || user?.role;
  const effAccent = accent || getAccent(effRole);
  const effBrand = brand || getWorkspaceBrand(effRole);
  const dashboardPath = getDashboardPath(effRole);
  const showLogout = isWorkspaceUser(effRole);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Welcome back";
  };

  const isRouteActive = (item) => {
    if (item.match) return item.match(location.pathname);
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    clearSellerSession();
    if (logout) logout(logoutTo);
    else window.location.href = logoutTo;
  };

  const closeMobile = () => setMenuOpen(false);

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside className={`dash-sidebar${menuOpen ? " open" : ""}`} style={S.sidebar}>
        <Link to={dashboardPath} style={S.brandLink} onClick={closeMobile}>
          <img src={logo} alt="AxxSpace" style={S.logo} />
          <span style={{ ...S.brandText, color: effAccent }}>{effBrand}</span>
        </Link>

        {sidebarHeader && <div style={S.sidebarSlot}>{sidebarHeader}</div>}

        <nav style={S.navList}>
          {nav.map((item) => {
            const sectionActive = item.id != null && item.id === activeId;
            const routeActive = item.path != null && isRouteActive(item);
            const active = sectionActive || routeActive;

            const content = (
              <>
                {item.icon && <span style={S.navIcon}>{item.icon}</span>}
                <span style={S.navLabel}>{item.label}</span>
                {item.badge && (
                  <span style={{ ...S.navBadge, background: withAlpha(effAccent, 0.16), color: effAccent }}>
                    {item.badge}
                  </span>
                )}
              </>
            );

            const itemStyle = { ...S.navItem, ...(active ? { ...S.navItemActive, background: withAlpha(effAccent, 0.12), color: effAccent, borderLeftColor: effAccent } : {}) };

            if (item.path != null) {
              return (
                <Link key={item.key || item.path} to={item.path} style={itemStyle} className="dash-nav-item" onClick={closeMobile}>
                  {content}
                </Link>
              );
            }
            return (
              <button
                key={item.key || item.id}
                type="button"
                style={itemStyle}
                className="dash-nav-item"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else onSelect?.(item.id);
                  closeMobile();
                }}
              >
                {content}
              </button>
            );
          })}
        </nav>

        {sidebarFooter && <div style={S.sidebarSlot}>{sidebarFooter}</div>}
      </aside>

      {menuOpen && <div className="dash-backdrop" style={S.backdrop} onClick={closeMobile} />}

      {/* Main column */}
      <div style={S.mainCol}>
        <header style={S.topbar}>
          <button type="button" className="dash-hamburger" style={S.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? "✕" : "☰"}
          </button>
          <div style={S.topbarTitle}>
            {title && <strong style={S.topTitleText}>{title}</strong>}
            {subtitle && <span style={S.topSubText}>{subtitle}</span>}
          </div>
          <div style={S.topbarRight}>
            {topbarActions}
            <div style={S.userChip}>
              <span style={S.greeting}>{getGreeting()},</span>
              <span style={{ ...S.userName, color: effAccent }}>{user?.name || "Account"}</span>
            </div>
            <ProfileAvatar user={user} size={34} />
            {showLogout && (
              <button type="button" style={S.logoutBtn} onClick={handleLogout}>
                Sign out
              </button>
            )}
          </div>
        </header>

        <main style={S.content}>
          <div style={{ width: "100%", maxWidth, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}

const S = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: DASH.bgGradient,
    fontFamily: DASH.font,
    color: DASH.text,
  },
  sidebar: {
    width: DASH.sidebarWidth,
    flexShrink: 0,
    background: DASH.sidebarBg,
    borderRight: `1px solid ${DASH.borderSoft}`,
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    zIndex: 40,
  },
  brandLink: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", padding: "6px 8px", marginBottom: "16px" },
  logo: { width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" },
  brandText: { fontWeight: 800, fontSize: "15px", letterSpacing: "0.01em" },
  navList: { display: "flex", flexDirection: "column", gap: "4px" },
  sidebarSlot: { padding: "4px 4px 10px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 12px",
    borderRadius: DASH.radius.md,
    borderLeft: "3px solid transparent",
    color: DASH.muted,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    fontFamily: DASH.font,
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s ease, color 0.15s ease",
  },
  navItemActive: { fontWeight: 700 },
  navIcon: { display: "flex", alignItems: "center", flexShrink: 0 },
  navLabel: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  navBadge: { fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: DASH.radius.full },

  mainCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 22px",
    background: DASH.topbarBg,
    borderBottom: `1px solid ${DASH.borderSoft}`,
    backdropFilter: "blur(6px)",
  },
  hamburger: {
    display: "none",
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${DASH.border}`,
    color: DASH.text,
    borderRadius: DASH.radius.md,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "16px",
  },
  topbarTitle: { display: "flex", flexDirection: "column", minWidth: 0 },
  topTitleText: { color: DASH.textStrong, fontSize: "16px", fontWeight: 800 },
  topSubText: { color: DASH.muted, fontSize: "12.5px", marginTop: "2px" },
  topbarRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "14px" },
  userChip: { display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 },
  greeting: { color: DASH.faint, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  userName: { fontSize: "14px", fontWeight: 800, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  logoutBtn: {
    background: "transparent",
    border: `1px solid #475569`,
    color: DASH.text,
    borderRadius: DASH.radius.md,
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  content: { padding: "24px 22px 48px", flex: 1 },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 35 },
};

const CSS = `
  .dash-nav-item:hover { background: rgba(255,255,255,0.06) !important; color: #f1f5f9 !important; }
  @media (max-width: 900px) {
    .dash-sidebar {
      position: fixed !important;
      left: 0; top: 0;
      transform: translateX(-100%);
      transition: transform 0.22s ease;
      box-shadow: 0 0 40px rgba(0,0,0,0.5);
    }
    .dash-sidebar.open { transform: translateX(0); }
    .dash-hamburger { display: inline-flex !important; }
  }
`;
