import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import "./AdminLayout.css";

// Navigation groups rendered in the sidebar, in display order
const NAV_GROUPS = [
  {
    section: "Command",
    items: [{ to: "/", label: "Command Center", icon: "🛰️", exact: true }],
  },
  {
    section: "Moderation Queues",
    items: [
      { to: "/dashboard?tab=properties", label: "Properties", icon: "🏠" },
      { to: "/dashboard?tab=materials", label: "QuickSales", icon: "📦" },
      { to: "/dashboard?tab=accommodations", label: "Accommodations", icon: "🏨" },
      { to: "/dashboard?tab=tourism", label: "Tourism", icon: "✈️" },
      { to: "/dashboard?tab=businesses", label: "Businesses", icon: "💼" },
      { to: "/dashboard?tab=announcements", label: "Announcements", icon: "📢" },
      { to: "/dashboard?tab=requests", label: "User Requests", icon: "📝" },
      { to: "/dashboard?tab=sold", label: "Sold Items", icon: "🤝" },
    ],
  },
  {
    section: "Users & Trust",
    items: [
      { to: "/users", label: "User Management", icon: "👥" },
      { to: "/reports", label: "Reports & Moderation", icon: "🛡️" },
    ],
  },
  {
    section: "Finance",
    items: [
      { to: "/dashboard?tab=payment", label: "Package Purchases", icon: "💳" },
      { to: "/dashboard?tab=boosts", label: "Payment Activity", icon: "⚡" },
    ],
  },
  {
    section: "Growth Tools",
    items: [
      { to: "/dashboard?tab=listings-badges", label: "Listing Badges", icon: "🏅" },
      { to: "/dashboard?tab=user-badges", label: "User Badges", icon: "🎖️" },
      { to: "/dashboard?tab=website-poster", label: "Website Poster", icon: "🎨" },
    ],
  },
  {
    section: "Platform",
    items: [{ to: "/settings", label: "Settings & Payments Config", icon: "⚙️" }],
  },
];

const PAGE_TITLES = [
  ["/users", "User Management"],
  ["/reports", "Reports & Moderation"],
  ["/settings", "Settings"],
  ["/dashboard", "Moderation Queue"],
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (item) => {
    const [path, query] = item.to.split("?");
    if (item.exact) return location.pathname === path;
    if (location.pathname !== path) return false;
    if (!query) return true;
    const params = new URLSearchParams(location.search);
    const wanted = new URLSearchParams(query);
    return [...wanted.entries()].every(([k, v]) => params.get(k) === v);
  };

  const pageLabel =
    PAGE_TITLES.find(([p]) => location.pathname.startsWith(p))?.[1] || "Command Center";

  // Poll the unified admin notifications for the header badge
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await API.get("/admin/notifications");
        if (alive) setUnreadCount(r.data?.summary?.total ?? r.data?.notifications?.length ?? 0);
      } catch (e) {
        console.error("layout notifications:", e);
      }
    };
    load();
    const interval = setInterval(load, 45000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const handleLogout = () => logout("/login");

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <div className="admin-shell-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-shell-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="shell-brand">
          <span className="shell-brand-logo">AXX</span>
          <div>
            <div className="shell-brand-title">AXXSPACE ADMIN</div>
            <div className="shell-brand-sub">Operations Console</div>
          </div>
          <button
            type="button"
            className="shell-drawer-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="shell-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.section} className="shell-nav-group">
              <div className="shell-nav-section">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`shell-nav-link ${isActive(item) ? "active" : ""}`}
                >
                  <span className="shell-nav-icon">{item.icon}</span>
                  <span className="shell-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="shell-sidebar-footer">
          <div className="shell-user-chip">
            <span className="shell-user-avatar">{(user?.name || "A")[0].toUpperCase()}</span>
            <div className="shell-user-info">
              <div className="shell-user-name">{user?.name || "Administrator"}</div>
              <div className="shell-user-role">{user?.email || "admin@axxspace"}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-shell-main">
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            <button
              type="button"
              className="shell-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              ☰
            </button>
            <div className="shell-page-heading">
              <h1 className="shell-page-title">{pageLabel}</h1>
              <span className="shell-live-dot" title="System operational" />
            </div>
          </div>

          <div className="shell-topbar-actions">
            <button
              type="button"
              className="shell-icon-btn"
              title={unreadCount > 0 ? `${unreadCount} item(s) awaiting action` : "No pending items"}
              onClick={() => navigate("/")}
            >
              <span aria-hidden="true">🔔</span>
              {unreadCount > 0 && <span className="shell-badge">{unreadCount}</span>}
            </button>
            <button type="button" className="shell-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
