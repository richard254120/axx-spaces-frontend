import { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import AccountTypeSelector from "./AccountTypeSelector";
import NotificationBell from "./NotificationSystem";
import { getDashboardPath, getAccountNav, getWorkspaceBrand, isWorkspaceUser } from "../utils/dashboardRoutes";
import logo from "../assets/image.png";
import RequestItemModal from "./RequestItemModal";

const TAB_LINKS = [
  { to: "/", label: "Home" },
  { to: "/axxbiashara", label: "AxxBiashara" },
  { to: "/quicksales", label: "QuickSales" },
  { to: "/listings", label: "Rentals" },
  { to: "/accommodation", label: "Accommodation" },
  { to: "/mobile-app", label: "Download App" },
];

const MENU_PRIMARY = [
  { to: "/", label: "Home" },
  { to: "/axxbiashara", label: "AxxBiashara" },
  { to: "/quicksales", label: "QuickSales" },
  { to: "/listings", label: "Rentals" },
  { to: "/accommodation", label: "Accommodation" },
  { to: "/accommodation/login?tab=login", label: "Host Sign In" },
  { to: "/accommodation/register?tab=register", label: "Host Register" },
  { to: "/agent/login", label: "Agent login" },
];

const MENU_SECONDARY = [
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/mobile-app", label: "Mobile App" },
  { to: "/axxwallet", label: "AxxWallet" },
];

const JOBS = [
  {
    key: "web-development",
    label: "Web Development",
    desc: "Custom websites, web apps, e-commerce platforms, and full-stack solutions tailored to your business needs",
    to: "/jobs/web-development",
  },
  {
    key: "marketing",
    label: "Marketing",
    desc: "Digital marketing, SEO, social media management, content creation, and brand strategy to grow your online presence",
    to: "/jobs/marketing",
  },
  {
    key: "ui-ux-design",
    label: "UI/UX Design",
    desc: "User interface design, user experience research, wireframing, prototyping, and design systems for digital products",
    to: "/jobs/ui-ux-design",
  },
];

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const location = useLocation();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [accountSelectorMode, setAccountSelectorMode] = useState("login");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(null);

  const dropdownRef = useRef(null);
  const accountRef = useRef(null);
  const userMenuRef = useRef(null);

  const isLoggedIn = token && user && user.role !== "guest";
  const getDashboardLink = () => getDashboardPath(user?.role);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setUserMenuOpen(false);
    setAccountOpen(false);
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
    closeAll();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close everything on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  // Prevent background scroll when mobile dropdown is open
  useEffect(() => {
    document.body.style.overflow = dropdownOpen || accountOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [dropdownOpen, accountOpen]);

  const menuLink = (item) => (
    <Link key={item.to + item.label} to={item.to} className="ax-item" onClick={() => setDropdownOpen(false)}>
      {item.label}
    </Link>
  );

  // ─── HAMBURGER DROPDOWN MENU ─────────────────────────────────────────────
  const renderMenu = () => (
    <div className="ax-menu-wrap" ref={dropdownRef}>
      <button
        type="button"
        className="ax-icon-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label={dropdownOpen ? "Close menu" : "Open menu"}
        aria-expanded={dropdownOpen}
      >
        {dropdownOpen ? "✕" : "☰"}
      </button>

      {dropdownOpen && (
        <>
          <div className="ax-backdrop" onClick={() => setDropdownOpen(false)} />
          <div className="ax-nav-panel ax-menu-panel">
            <div className="ax-mobile-title">
              <span>AxxSpace Navigation</span>
              <button type="button" className="ax-close-btn" onClick={() => setDropdownOpen(false)}>
                ✕ Close
              </button>
            </div>

            <div className="ax-heading">Navigation</div>
            {MENU_PRIMARY.map(menuLink)}
            <button
              type="button"
              className="ax-item ax-item-highlight"
              onClick={() => {
                setDropdownOpen(false);
                setIsRequestModalOpen(true);
              }}
            >
              Custom Requests
            </button>
            {MENU_SECONDARY.map(menuLink)}

            <div className="ax-divider" />
            <div className="ax-heading">Jobs &amp; Careers</div>
            {JOBS.map((job) => {
              const open = jobDropdownOpen === job.key;
              return (
                <div key={job.key}>
                  <button
                    type="button"
                    className="ax-item"
                    aria-expanded={open}
                    onClick={() => setJobDropdownOpen(open ? null : job.key)}
                  >
                    <span>{job.label}</span>
                    <span className="ax-chevron">{open ? "▲" : "▼"}</span>
                  </button>
                  {open && (
                    <div className="ax-job-content">
                      <span className="ax-job-desc">{job.desc}</span>
                      <Link
                        to={job.to}
                        className="ax-job-link"
                        onClick={() => {
                          setDropdownOpen(false);
                          setJobDropdownOpen(null);
                        }}
                      >
                        View Jobs →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="ax-divider" />
            <div className="ax-heading">Help &amp; Legal</div>
            {menuLink({ to: "/contact", label: "Contact & Support" })}
            {menuLink({ to: "/terms", label: "Terms & Privacy" })}

            <div className="ax-divider" />
            <div className="ax-heading">Account</div>
            {isLoggedIn ? (
              <>
                <Link to="/messages" className="ax-item" onClick={() => setDropdownOpen(false)}>
                  <span>Messages</span>
                  <span className="ax-dot" />
                </Link>
                <Link to="/notifications" className="ax-item" onClick={() => setDropdownOpen(false)}>
                  <span>Notifications</span>
                  <span className="ax-dot" />
                </Link>
                {menuLink({ to: "/saved", label: "Saved Listings" })}
                {menuLink({ to: "/axxwallet", label: "AxxWallet" })}
                {["landlord", "agent", "host"].includes(user?.role?.toLowerCase()) && menuLink({ to: "/upload", label: "Upload Property" })}
                {(user?.role === "member" || user?.role === "user")
                  ? menuLink({ to: "/member", label: "My Hub & Activities" })
                  : menuLink({ to: getDashboardLink(), label: "Dashboard" })}
                {menuLink({ to: "/profile", label: "Profile" })}
                {menuLink({ to: "/settings", label: "Settings" })}
                <div className="ax-divider" />
                <button type="button" className="ax-item ax-item-danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className="ax-item" onClick={handleLoginClick}>
                  Login
                </button>
                <button type="button" className="ax-item" onClick={handleRegisterClick}>
                  Register
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderBrand = (to, name, alt) => (
    <Link to={to} className="ax-brand" onClick={closeAll}>
      <img src={logo} alt={alt} className="ax-logo" />
      <span className="ax-brand-name">{name}</span>
    </Link>
  );

  // ─── WORKSPACE NAVBAR (landlord, seller, mover, business, admin) ─────────
  if (token && user && isWorkspaceUser(user.role)) {
    const navItems = getAccountNav(user.role);
    const dashboardPath = getDashboardPath(user.role);
    const brand = getWorkspaceBrand(user.role);

    return (
      <header className="ax-nav">
        <style>{css}</style>

        <div className="ax-top">
          {renderBrand(dashboardPath, brand, "Axxspace")}
          <div className="ax-top-right">
            <ProfileAvatar user={user} size={32} />
            <span className="ax-username">{user?.name}</span>
            <button type="button" className="ax-logout" onClick={handleLogout} aria-label="Log out">
              Logout
            </button>
          </div>
        </div>

        <nav className="ax-tabs" aria-label="Workspace">
          <div className="ax-tabs-inner">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ax-tab${isActive(item.path) ? " is-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    );
  }

  // ─── REGULAR NAVBAR (guests & renters browsing the site) ─────────────────
  return (
    <>
      <header className="ax-nav">
        <style>{css}</style>

        <div className="ax-top">
          {renderBrand("/", "AxxSpace", "AxxSpace")}

          <div className="ax-top-right">
            {isLoggedIn ? (
              <div className="ax-account" ref={accountRef}>
                <button
                  type="button"
                  className="ax-account-btn"
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-expanded={accountOpen}
                  aria-label="User Account Menu"
                >
                  <ProfileAvatar user={user} size={28} />
                  <span className="ax-account-label">{user?.name ? user.name.split(" ")[0] : "Account"}</span>
                  <span style={{ fontSize: "10px", opacity: 0.6, marginLeft: "2px" }}>{accountOpen ? "▲" : "▼"}</span>
                </button>
                {accountOpen && (
                  <>
                    <div className="ax-backdrop" onClick={() => setAccountOpen(false)} />
                    <div className="ax-nav-panel ax-account-panel">
                      <div className="ax-account-head">
                        <ProfileAvatar user={user} size={42} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="ax-account-name">{user?.name || "Member"}</div>
                          <div className="ax-account-role">
                            {user?.role === "member" ? "COMMUNITY MEMBER" : (user?.role === "user" ? "COMMUNITY EXPLORER" : (user?.role?.toUpperCase() || "MEMBER"))}
                          </div>
                        </div>
                      </div>
                      <div className="ax-divider" />
                      <Link to="/profile" className="ax-item" onClick={() => setAccountOpen(false)}>
                        My Profile
                      </Link>
                      {(user?.role === "member" || user?.role === "user") ? (
                        <Link to="/member" className="ax-item" style={{ color: "#fbbf24", fontWeight: 700 }} onClick={() => setAccountOpen(false)}>
                          My Hub & Activities
                        </Link>
                      ) : (
                        <Link to={getDashboardLink()} className="ax-item" style={{ color: "#fbbf24", fontWeight: 700 }} onClick={() => setAccountOpen(false)}>
                          Dashboard
                        </Link>
                      )}
                      <Link to="/saved" className="ax-item" onClick={() => setAccountOpen(false)}>
                        Saved Spaces
                      </Link>
                      <Link to="/my-bookings" className="ax-item" onClick={() => setAccountOpen(false)}>
                        My Bookings
                      </Link>
                      <Link to="/messages" className="ax-item" onClick={() => setAccountOpen(false)}>
                        Messages
                      </Link>
                      <Link to="/notifications" className="ax-item" onClick={() => setAccountOpen(false)}>
                        Notifications
                      </Link>
                      <Link to="/wallet" className="ax-item" onClick={() => setAccountOpen(false)}>
                        AxxWallet
                      </Link>
                      <Link to="/payment-history" className="ax-item" onClick={() => setAccountOpen(false)}>
                        Payment History
                      </Link>
                      {["landlord", "agent", "host"].includes((user?.role || "").toLowerCase()) && (
                        <Link to="/upload" className="ax-item" onClick={() => setAccountOpen(false)}>
                          Upload Property
                        </Link>
                      )}
                      <Link to="/settings" className="ax-item" onClick={() => setAccountOpen(false)}>
                        Settings & Security
                      </Link>
                      <div className="ax-divider" />
                      <button type="button" className="ax-item ax-item-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button type="button" className="ax-signin" onClick={() => setAccountSelectorOpen(true)}>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Sign In</span>
              </button>
            )}
            {renderMenu()}
          </div>
        </div>

        <nav className="ax-tabs" aria-label="Primary">
          <div className="ax-tabs-inner">
            {TAB_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`ax-tab${isActive(item.to) ? " is-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="ax-request-btn"
              onClick={() => {
                setMenuOpen(false);
                setIsRequestModalOpen(true);
              }}
            >
              Requests
            </button>
          </div>
        </nav>
      </header>

      <AccountTypeSelector
        isOpen={accountSelectorOpen}
        onClose={() => setAccountSelectorOpen(false)}
        mode={accountSelectorMode}
      />
      <RequestItemModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .ax-nav {
    --ink: #0f172a;
    --ink-2: #1e293b;
    --paper: #ffffff;
    --mist: #f1f5f9;
    --line: #e2e8f0;
    --muted: #64748b;
    --gold: #f59e0b;
    --gold-soft: #fbbf24;
    --red: #fb2424;
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.12);
  }
  .ax-nav *, .ax-nav *::before, .ax-nav *::after { box-sizing: border-box; }
  .ax-nav button { font-family: inherit; }
  .ax-nav a:focus-visible, .ax-nav button:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  /* ── Top bar (light, so the blue logo reads clearly) ── */
  .ax-nav .ax-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 20px;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }
  .ax-nav .ax-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    min-width: 0;
  }
  .ax-nav .ax-logo {
    height: 42px;
    width: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
    flex-shrink: 0;
  }
  .ax-nav .ax-brand-name {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #fb2424;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ax-nav .ax-top-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Buttons in the top bar ── */
  .ax-nav .ax-icon-btn {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 10px;
    color: var(--ink);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .ax-nav .ax-icon-btn:hover { background: var(--mist); border-color: var(--gold); }

  .ax-nav .ax-signin {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--ink);
    color: #fff;
    border: 1px solid var(--ink);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s, color .2s, border-color .2s;
  }
  .ax-nav .ax-signin:hover { background: var(--gold); border-color: var(--gold); color: var(--ink); }

  .ax-nav .ax-account-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px 6px 6px;
    background: var(--mist);
    border: 1px solid var(--line);
    border-radius: 999px;
    color: var(--ink);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: border-color .2s;
  }
  .ax-nav .ax-account-btn:hover { border-color: var(--gold); }

  .ax-nav .ax-username { font-size: 13px; font-weight: 700; color: var(--ink); }
  .ax-nav .ax-logout {
    padding: 8px 14px;
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s;
  }
  .ax-nav .ax-logout:hover { background: #fee2e2; }

  /* ── Tabs band (dark, gold active indicator) ── */
  .ax-nav .ax-tabs {
    background: linear-gradient(90deg, var(--ink) 0%, var(--ink-2) 100%);
    border-top: 2px solid var(--gold);
  }
  .ax-nav .ax-tabs-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 16px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .ax-nav .ax-tabs-inner::-webkit-scrollbar { display: none; }

  .ax-nav .ax-tab {
    position: relative;
    padding: 14px 14px;
    color: #cbd5e1 !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    transition: color .2s, background .2s;
  }
  .ax-nav .ax-tab::after {
    content: "";
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 0;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--gold-soft);
    transform: scaleX(0);
    transition: transform .2s ease;
  }
  .ax-nav .ax-tab:hover {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: transparent !important;
  }
  .ax-nav .ax-tab.is-active {
    color: #ffffff !important;
  }
  .ax-nav .ax-tab.is-active::after, .ax-nav .ax-tab:hover::after {
    transform: scaleX(1);
  }

  .ax-nav .ax-request-btn {
    margin: 0 6px;
    padding: 7px 16px;
    background: var(--gold-soft);
    color: var(--ink);
    border: none;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: background .2s;
  }
  .ax-nav .ax-request-btn:hover { background: #fff; }

  .ax-nav .ax-tabs-user {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    padding-left: 12px;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
  }
  .ax-nav .ax-user-wrap { position: relative; }
  .ax-nav .ax-user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background .2s;
  }
  .ax-nav .ax-user-btn:hover { background: rgba(255, 255, 255, 0.08); }
  .ax-nav .ax-user-name { font-size: 13px; font-weight: 700; color: var(--gold-soft); }
  .ax-nav .ax-chevron { font-size: 10px; color: var(--muted); }

  /* ── Dropdown panels ── */
  .ax-nav .ax-menu-wrap, .ax-nav .ax-account { position: relative; }
  .ax-nav .ax-nav-panel {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: var(--paper);
    border: 1px solid var(--line);
    border-top: 3px solid var(--gold);
    border-radius: 14px;
    box-shadow: 0 24px 50px -12px rgba(15, 23, 42, 0.35);
    z-index: 99999;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .ax-nav .ax-menu-panel { min-width: 290px; max-height: 80vh; padding-bottom: 12px; }
  .ax-nav .ax-account-panel { min-width: 250px; }
  .ax-nav .ax-user-panel { min-width: 210px; top: calc(100% + 8px); }
  .ax-nav .ax-backdrop { display: none; }
  .ax-nav .ax-mobile-title { display: none; }

  .ax-nav .ax-heading {
    padding: 14px 20px 6px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
  }
  .ax-nav .ax-divider { height: 1px; background: var(--line); margin: 6px 0; }

  .ax-nav .ax-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 11px 20px;
    background: transparent;
    border: none;
    border-left: 3px solid transparent;
    color: var(--ink-2);
    font-size: 13.5px;
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background .15s, border-color .15s, color .15s;
  }
  .ax-nav .ax-item:hover { background: var(--mist); border-left-color: var(--gold); color: var(--ink); }
  .ax-nav .ax-item-highlight { background: #fffbeb; border-left-color: var(--gold); color: #92400e; font-weight: 700; }
  .ax-nav .ax-item-highlight:hover { background: #fef3c7; }
  .ax-nav .ax-item-danger { color: #b91c1c; font-weight: 700; }
  .ax-nav .ax-item-danger:hover { background: #fef2f2; border-left-color: #ef4444; color: #b91c1c; }

  .ax-nav .ax-dot { width: 8px; height: 8px; border-radius: 50%; background: #a244ef; flex-shrink: 0; }

  .ax-nav .ax-job-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 2px 18px 8px;
    padding: 12px 14px;
    background: var(--mist);
    border-left: 3px solid var(--gold);
    border-radius: 8px;
  }
  .ax-nav .ax-job-desc { font-size: 12px; line-height: 1.5; color: var(--muted); }
  .ax-nav .ax-job-link { align-self: flex-start; font-size: 12px; font-weight: 700; color: #b45309; text-decoration: none; }
  .ax-nav .ax-job-link:hover { text-decoration: underline; }

  .ax-nav .ax-account-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px 10px; }
  .ax-nav .ax-account-name { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
  .ax-nav .ax-account-role { font-size: 11px; font-weight: 700; color: #b45309; letter-spacing: 0.4px; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .ax-nav .ax-top { padding: 8px 12px; }
    .ax-nav .ax-logo { height: 36px; }
    .ax-nav .ax-brand-name { font-size: 16px; }
    .ax-nav .ax-account-label, .ax-nav .ax-username { display: none; }
    .ax-nav .ax-signin { padding: 9px 14px; }
    .ax-nav .ax-icon-btn { width: 40px; height: 40px; }
    .ax-nav .ax-tabs-inner { padding: 0 8px; }
    .ax-nav .ax-tab { padding: 13px 10px; font-size: 12px; }
    .ax-nav .ax-tab::after { left: 10px; right: 10px; }
    .ax-nav .ax-tabs-user .ax-user-name { display: none; }

    .ax-nav .ax-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: 99998;
    }
    .ax-nav .ax-nav-panel.ax-menu-panel, .ax-nav .ax-nav-panel.ax-account-panel {
      position: fixed;
      top: 62px;
      left: 10px;
      right: 10px;
      min-width: 0;
      max-width: none;
      max-height: calc(100vh - 76px);
      max-height: calc(100dvh - 76px);
      padding-bottom: 32px;
    }
    .ax-nav .ax-mobile-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 2;
      padding: 12px 18px;
      background: var(--ink);
      color: var(--gold-soft);
      font-size: 14px;
      font-weight: 800;
    }
    .ax-nav .ax-close-btn {
      padding: 5px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
  }

  @media (max-width: 480px) {
    .ax-nav .ax-nav-panel.ax-menu-panel, .ax-nav .ax-nav-panel.ax-account-panel { top: 56px; left: 6px; right: 6px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ax-nav * { transition: none !important; }
  }
`;