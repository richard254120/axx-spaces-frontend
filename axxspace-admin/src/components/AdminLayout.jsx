import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, House, ShoppingBag, Bed, Briefcase, Megaphone,
  ClipboardList, Car, Users, Shield, CreditCard, Zap, Ticket, Medal, Globe,
  Settings, Bell, LogOut, X, Menu, Sun, Moon
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { getTheme, toggleTheme } from "../theme";
import "./AdminLayout.css";

// Navigation groups rendered in the sidebar, in display order
const NAV_GROUPS = [
  {
    section: "Command",
    items: [{ to: "/", label: "Command Center", icon: LayoutDashboard, exact: true }],
  },
  {
    section: "Moderation Queues",
    items: [
      { to: "/dashboard?tab=properties", label: "Properties", icon: House },
      { to: "/dashboard?tab=materials", label: "QuickSales", icon: ShoppingBag },
      { to: "/dashboard?tab=accommodations", label: "Accommodations", icon: Bed },
      { to: "/dashboard?tab=businesses", label: "Businesses", icon: Briefcase },
      { to: "/dashboard?tab=announcements", label: "Announcements", icon: Megaphone },
      { to: "/dashboard?tab=requests", label: "User Requests", icon: ClipboardList },
      { to: "/dashboard?tab=sold", label: "Sold Items", icon: Car },
    ],
  },
  {
    section: "Users & Trust",
    items: [
      { to: "/users", label: "User Management", icon: Users },
      { to: "/reports", label: "Reports & Moderation", icon: Shield },
    ],
  },
  {
    section: "Finance",
    items: [
      { to: "/dashboard?tab=payment", label: "Package Purchases", icon: CreditCard },
      { to: "/dashboard?tab=boosts", label: "Payment Activity", icon: Zap },
    ],
  },
  {
    section: "Growth Tools",
    items: [
      { to: "/dashboard?tab=listings-badges", label: "Listing Badges", icon: Ticket },
      { to: "/dashboard?tab=user-badges", label: "User Badges", icon: Medal },
      { to: "/dashboard?tab=website-poster", label: "Website Poster", icon: Globe },
    ],
  },
  {
    section: "Platform",
    items: [{ to: "/settings", label: "Settings & Payments Config", icon: Settings }],
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
  const [theme, setThemeState] = useState(() => getTheme());

  const handleToggleTheme = () => setThemeState(toggleTheme());

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
            <X size={18} />
          </button>
        </div>

        <nav className="shell-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.section} className="shell-nav-group">
              <div className="shell-nav-section">{group.section}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`shell-nav-link ${isActive(item) ? "active" : ""}`}
                  >
                    <Icon size={16} className="shell-nav-icon" />
                    <span className="shell-nav-label">{item.label}</span>
                  </NavLink>
                );
              })}
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
              <Menu size={18} />
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
              onClick={handleToggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              type="button"
              className="shell-icon-btn"
              title={unreadCount > 0 ? `${unreadCount} item(s) awaiting action` : "No pending items"}
              onClick={() => navigate("/")}
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="shell-badge">{unreadCount}</span>}
            </button>
            <button type="button" className="shell-logout-btn" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Logout</span>
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
