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
  // Members/explorers manage their account inside the member hub; sign-out lives in Account Settings
  const isCommunityAccount = ["member", "user"].includes((user?.role || "").toLowerCase());
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

  // ─── PROFESSIONAL HAMBURGER MENU ─────────────────────────────────────────────
  const renderMenu = () => (
    <div className="ax-menu-wrap" ref={dropdownRef}>
      <button
        type="button"
        className={`ax-hamburger-btn ${dropdownOpen ? "is-open" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label={dropdownOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={dropdownOpen}
      >
        <span className="ax-hamburger-bars">
          <span className="ax-hamburger-bar bar-1" />
          <span className="ax-hamburger-bar bar-2" />
          <span className="ax-hamburger-bar bar-3" />
        </span>
        <span className="ax-hamburger-label">{dropdownOpen ? "Close" : "Menu"}</span>
      </button>

      {dropdownOpen && (
        <>
          <div className="ax-backdrop" onClick={() => setDropdownOpen(false)} />
          <div className="ax-nav-panel ax-menu-panel" role="dialog" aria-label="AxxSpace Navigation">
            {/* Header */}
            <div className="ax-menu-header">
              <div className="ax-menu-brand">
                <img src={logo} alt="AxxSpace Logo" className="ax-menu-logo" />
                <div className="ax-menu-brand-meta">
                  <span className="ax-menu-brand-name">AxxSpace</span>
                  <span className="ax-menu-brand-badge">KENYA ECOSYSTEM</span>
                </div>
              </div>
              <button
                type="button"
                className="ax-menu-close-btn"
                onClick={() => setDropdownOpen(false)}
                aria-label="Close navigation"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="ax-menu-scrollable">
              {/* Account / User Section */}
              {isLoggedIn ? (
                <div className="ax-menu-user-card">
                  <div className="ax-user-card-top">
                    <ProfileAvatar user={user} size={44} />
                    <div className="ax-user-card-info">
                      <div className="ax-user-card-name">{user?.name || "Member"}</div>
                      <div className="ax-user-card-email">{user?.email || "Account Active"}</div>
                      <div className="ax-user-card-role-badge">
                        <span className="ax-badge-pulse" />
                        {user?.role === "member" ? "COMMUNITY MEMBER" : (user?.role === "user" ? "EXPLORER" : (user?.role?.toUpperCase() || "MEMBER"))}
                      </div>
                    </div>
                  </div>
                  <div className="ax-user-card-actions">
                    {(user?.role === "member" || user?.role === "user") ? (
                      <Link to="/member" className="ax-quick-btn ax-quick-btn-primary" onClick={() => setDropdownOpen(false)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <span>My Hub &amp; Activities</span>
                      </Link>
                    ) : (
                      <Link to={getDashboardLink()} className="ax-quick-btn ax-quick-btn-primary" onClick={() => setDropdownOpen(false)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link to="/profile" className="ax-quick-btn ax-quick-btn-ghost" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="ax-menu-guest-card">
                  <div className="ax-guest-badge">AXXSPACE DIRECTORY</div>
                  <div className="ax-guest-title">Welcome to AxxSpace</div>
                  <div className="ax-guest-desc">Kenya&apos;s all-in-one platform for rentals, stays &amp; verified businesses.</div>
                  <div className="ax-guest-btn-group">
                    <button type="button" className="ax-guest-btn ax-guest-btn-signin" onClick={handleLoginClick}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>Sign In</span>
                    </button>
                    <button type="button" className="ax-guest-btn ax-guest-btn-register" onClick={handleRegisterClick}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Core Ecosystem Grid */}
              <div className="ax-menu-group-header">EXPLORE PORTALS</div>
              <div className="ax-portals-grid">
                <Link to="/listings" className="ax-portal-card card-rentals" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-portal-icon-box icon-amber">
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                      <line x1="9" y1="6" x2="9.01" y2="6"/><line x1="15" y1="6" x2="15.01" y2="6"/>
                      <line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/>
                      <line x1="9" y1="14" x2="9.01" y2="14"/><line x1="15" y1="14" x2="15.01" y2="14"/>
                    </svg>
                  </div>
                  <div className="ax-portal-text">
                    <span className="ax-portal-name">Rentals</span>
                    <span className="ax-portal-sub">Houses &amp; Flats</span>
                  </div>
                  <span className="ax-portal-arrow">→</span>
                </Link>

                <Link to="/accommodation" className="ax-portal-card card-stays" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-portal-icon-box icon-rose">
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><circle cx="6" cy="12" r="2"/>
                    </svg>
                  </div>
                  <div className="ax-portal-text">
                    <span className="ax-portal-name">Accommodations</span>
                    <span className="ax-portal-sub">Safari &amp; Stays</span>
                  </div>
                  <span className="ax-portal-arrow">→</span>
                </Link>

                <Link to="/axxbiashara" className="ax-portal-card card-biashara" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-portal-icon-box icon-blue">
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <div className="ax-portal-text">
                    <span className="ax-portal-name">AxxBiashara</span>
                    <span className="ax-portal-sub">Directory Hub</span>
                  </div>
                  <span className="ax-portal-arrow">→</span>
                </Link>

                <Link to="/quicksales" className="ax-portal-card card-quicksales" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-portal-icon-box icon-emerald">
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div className="ax-portal-text">
                    <span className="ax-portal-name">QuickSales</span>
                    <span className="ax-portal-sub">Deals &amp; Urgent</span>
                  </div>
                  <span className="ax-portal-arrow">→</span>
                </Link>
              </div>

              {/* Custom Request Action Callout */}
              <div className="ax-custom-request-box">
                <div className="ax-request-content">
                  <div className="ax-request-badge">SPECIAL SERVICE</div>
                  <div className="ax-request-title">Looking for a specific space?</div>
                  <div className="ax-request-desc">Post a custom space request and verified partners will find it for you.</div>
                </div>
                <button
                  type="button"
                  className="ax-request-btn-action"
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsRequestModalOpen(true);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span>Post Custom Request</span>
                </button>
              </div>

              {/* Partner & Host Services */}
              <div className="ax-menu-group-header">PARTNER &amp; HOST PORTALS</div>
              <div className="ax-menu-list">
                <Link to="/upload" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-row-icon icon-amber">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                    </svg>
                  </div>
                  <div className="ax-row-info">
                    <div className="ax-row-title">List Property / Space</div>
                    <div className="ax-row-sub">Landlords, hosts &amp; property managers</div>
                  </div>
                  <span className="ax-row-badge badge-gold">Earn</span>
                </Link>

                <Link to="/accommodation/login?tab=login" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-row-icon icon-rose">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div className="ax-row-info">
                    <div className="ax-row-title">Accommodation Host Portal</div>
                    <div className="ax-row-sub">Manage vacation rentals &amp; safari stays</div>
                  </div>
                  <span className="ax-row-arrow">→</span>
                </Link>

                <Link to="/agent/login" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                  <div className="ax-row-icon icon-blue">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="ax-row-info">
                    <div className="ax-row-title">Real Estate Agent Portal</div>
                    <div className="ax-row-sub">Agent login, verification &amp; leads</div>
                  </div>
                  <span className="ax-row-arrow">→</span>
                </Link>
              </div>

              {/* Personal Workspace (if logged in) */}
              {isLoggedIn && (
                <>
                  <div className="ax-menu-group-header">MY ACTIVITY &amp; ACCOUNT</div>
                  <div className="ax-menu-list">
                    <Link to="/notifications" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                      <div className="ax-row-icon icon-purple">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                      </div>
                      <div className="ax-row-info">
                        <div className="ax-row-title">Notifications</div>
                        <div className="ax-row-sub">Alerts, enquiries &amp; booking updates</div>
                      </div>
                      <span className="ax-dot" />
                    </Link>

                    <Link to="/saved" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                      <div className="ax-row-icon icon-rose">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <div className="ax-row-info">
                        <div className="ax-row-title">Saved Spaces</div>
                        <div className="ax-row-sub">Saved properties &amp; favorite stays</div>
                      </div>
                      <span className="ax-row-arrow">→</span>
                    </Link>

                    <Link to="/axxwallet" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                      <div className="ax-row-icon icon-emerald">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="16" cy="15" r="1.5"/>
                        </svg>
                      </div>
                      <div className="ax-row-info">
                        <div className="ax-row-title">AxxWallet</div>
                        <div className="ax-row-sub">Balances, transactions &amp; payouts</div>
                      </div>
                      <span className="ax-row-arrow">→</span>
                    </Link>

                    <Link to="/settings" className="ax-menu-row" onClick={() => setDropdownOpen(false)}>
                      <div className="ax-row-icon icon-slate">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                      </div>
                      <div className="ax-row-info">
                        <div className="ax-row-title">Settings &amp; Security</div>
                        <div className="ax-row-sub">Password, 2FA &amp; preferences</div>
                      </div>
                      <span className="ax-row-arrow">→</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Careers & Tech Services Accordion */}
              <div className="ax-menu-group-header">CAREERS &amp; TECH SERVICES</div>
              <div className="ax-jobs-list">
                {JOBS.map((job) => {
                  const open = jobDropdownOpen === job.key;
                  return (
                    <div key={job.key} className={`ax-job-card ${open ? "is-open" : ""}`}>
                      <button
                        type="button"
                        className="ax-job-header-btn"
                        onClick={() => setJobDropdownOpen(open ? null : job.key)}
                        aria-expanded={open}
                      >
                        <div className="ax-job-header-left">
                          <span className="ax-job-dot" />
                          <span className="ax-job-name">{job.label}</span>
                        </div>
                        <svg className={`ax-job-chevron ${open ? "is-expanded" : ""}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      {open && (
                        <div className="ax-job-body">
                          <p className="ax-job-desc-text">{job.desc}</p>
                          <Link
                            to={job.to}
                            className="ax-job-view-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              setJobDropdownOpen(null);
                            }}
                          >
                            <span>Explore {job.label}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* App & Quick Info Pills */}
              <div className="ax-menu-group-header">APP &amp; RESOURCES</div>
              <div className="ax-pills-row">
                <Link to="/mobile-app" className="ax-pill-link" onClick={() => setDropdownOpen(false)}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <span>Download App</span>
                </Link>
                <Link to="/about" className="ax-pill-link" onClick={() => setDropdownOpen(false)}>
                  About Us
                </Link>
                <Link to="/faq" className="ax-pill-link" onClick={() => setDropdownOpen(false)}>
                  FAQ
                </Link>
                <Link to="/contact" className="ax-pill-link" onClick={() => setDropdownOpen(false)}>
                  Contact Support
                </Link>
                <Link to="/terms" className="ax-pill-link" onClick={() => setDropdownOpen(false)}>
                  Terms &amp; Privacy
                </Link>
              </div>

              {/* Footer / Logout — workspace providers only; community accounts sign out from Settings */}
              {isLoggedIn && !isCommunityAccount && (
                <div className="ax-menu-footer-auth">
                  <button type="button" className="ax-menu-logout-btn" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Log Out of AxxSpace</span>
                  </button>
                </div>
              )}

              <div className="ax-menu-copyright">
                <span>© {new Date().getFullYear()} AxxSpace Inc. Kenya&apos;s Spaces Network</span>
              </div>
            </div>
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
                      {!isCommunityAccount && (
                        <button type="button" className="ax-item ax-item-danger" onClick={handleLogout}>
                          Logout
                        </button>
                      )}
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

  .ax-nav .ax-hamburger-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    height: 40px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 999px;
    color: var(--ink);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ax-nav .ax-hamburger-btn:hover {
    background: var(--mist);
    border-color: var(--gold);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.18);
    transform: translateY(-1px);
  }
  .ax-nav .ax-hamburger-btn.is-open {
    background: var(--ink);
    border-color: var(--ink);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
  }
  .ax-hamburger-bars {
    width: 17px;
    height: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .ax-hamburger-bar {
    width: 100%;
    height: 2px;
    background: currentColor;
    border-radius: 2px;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center;
  }
  .ax-nav .ax-hamburger-btn.is-open .bar-1 {
    transform: translateY(5px) rotate(45deg);
  }
  .ax-nav .ax-hamburger-btn.is-open .bar-2 {
    opacity: 0;
    transform: scaleX(0);
  }
  .ax-nav .ax-hamburger-btn.is-open .bar-3 {
    transform: translateY(-5px) rotate(-45deg);
  }
  .ax-hamburger-label {
    letter-spacing: 0.2px;
  }

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
  .ax-nav .ax-account-panel { min-width: 260px; max-height: 80vh; padding-bottom: 12px; }
  .ax-nav .ax-user-panel { min-width: 210px; top: calc(100% + 8px); }

  /* ── Professional Hamburger Flyout Menu ── */
  .ax-nav .ax-menu-panel {
    width: 440px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 84px);
    padding: 0;
    border-radius: 20px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-top: 3.5px solid var(--gold);
    box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.38);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: axMenuDrop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes axMenuDrop {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ax-nav .ax-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 99998;
    animation: axFade 0.2s ease;
  }
  @keyframes axFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Hamburger Menu Header */
  .ax-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: #ffffff;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .ax-menu-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ax-menu-logo {
    height: 34px;
    width: auto;
    border-radius: 7px;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
  }
  .ax-menu-brand-meta {
    display: flex;
    flex-direction: column;
  }
  .ax-menu-brand-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--ink);
    letter-spacing: -0.2px;
    line-height: 1.15;
  }
  .ax-menu-brand-badge {
    font-size: 9px;
    font-weight: 800;
    color: #d97706;
    letter-spacing: 0.6px;
  }
  .ax-menu-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--mist);
    border: 1px solid var(--line);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ax-menu-close-btn:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #ef4444;
    transform: rotate(90deg);
  }

  /* Scrollable Container */
  .ax-menu-scrollable {
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 16px 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .ax-menu-scrollable::-webkit-scrollbar {
    width: 5px;
  }
  .ax-menu-scrollable::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  /* User Card */
  .ax-menu-user-card {
    background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
    border-radius: 16px;
    padding: 16px;
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
  }
  .ax-user-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .ax-user-card-info {
    min-width: 0;
    flex: 1;
  }
  .ax-user-card-name {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ax-user-card-email {
    font-size: 11.5px;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }
  .ax-user-card-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    padding: 2px 8px;
    background: rgba(245, 158, 11, 0.16);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 999px;
    color: #fbbf24;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .ax-badge-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }
  .ax-user-card-actions {
    display: flex;
    gap: 8px;
  }
  .ax-quick-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.15s ease;
  }
  .ax-quick-btn-primary {
    flex: 2;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #0f172a;
  }
  .ax-quick-btn-primary:hover {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
  }
  .ax-quick-btn-ghost {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
  .ax-quick-btn-ghost:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Guest Welcome Card */
  .ax-menu-guest-card {
    background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 16px;
  }
  .ax-guest-badge {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    color: #b45309;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
  }
  .ax-guest-title {
    font-size: 15.5px;
    font-weight: 800;
    color: var(--ink);
    margin-bottom: 3px;
  }
  .ax-guest-desc {
    font-size: 11.5px;
    color: var(--muted);
    line-height: 1.45;
    margin-bottom: 12px;
  }
  .ax-guest-btn-group {
    display: flex;
    gap: 8px;
  }
  .ax-guest-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ax-guest-btn-signin {
    background: #ffffff;
    border: 1px solid var(--line);
    color: var(--ink);
  }
  .ax-guest-btn-signin:hover {
    border-color: var(--ink);
    background: #f8fafc;
  }
  .ax-guest-btn-register {
    background: var(--ink);
    border: 1px solid var(--ink);
    color: #ffffff;
  }
  .ax-guest-btn-register:hover {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--ink);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
  }

  /* Section Header */
  .ax-menu-group-header {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.7px;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 2px;
    margin-bottom: -6px;
  }

  /* Core Portals Grid */
  .ax-portals-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
  }
  .ax-portal-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 13px;
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .ax-portal-card:hover {
    border-color: var(--gold);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
    transform: translateY(-2px);
  }
  .ax-portal-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .icon-amber { background: #fffbeb; color: #d97706; }
  .icon-rose { background: #fff1f2; color: #e11d48; }
  .icon-blue { background: #eff6ff; color: #2563eb; }
  .icon-emerald { background: #ecfdf5; color: #059669; }
  .icon-purple { background: #faf5ff; color: #9333ea; }
  .icon-slate { background: #f1f5f9; color: #475569; }

  .ax-portal-text {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .ax-portal-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ax-portal-sub {
    font-size: 11px;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ax-portal-arrow {
    font-size: 12px;
    color: #cbd5e1;
    transition: transform 0.2s ease, color 0.2s ease;
  }
  .ax-portal-card:hover .ax-portal-arrow {
    transform: translateX(3px);
    color: var(--gold);
  }

  /* Custom Request Callout */
  .ax-custom-request-box {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1px solid #fde68a;
    border-radius: 14px;
    padding: 13px 15px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .ax-request-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.6px;
    color: #b45309;
  }
  .ax-request-title {
    font-size: 13px;
    font-weight: 800;
    color: #92400e;
    margin-top: 1px;
  }
  .ax-request-desc {
    font-size: 11.5px;
    color: #78350f;
    line-height: 1.4;
    margin-top: 2px;
  }
  .ax-request-btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    align-self: flex-start;
    padding: 7px 13px;
    background: #0f172a;
    color: #fbbf24;
    border: none;
    border-radius: 8px;
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ax-request-btn-action:hover {
    background: #1e293b;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.15);
  }

  /* Menu Lists & Rows */
  .ax-menu-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 5px;
  }
  .ax-menu-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 8px 10px;
    border-radius: 10px;
    text-decoration: none;
    color: var(--ink);
    transition: background 0.15s ease;
  }
  .ax-menu-row:hover {
    background: var(--mist);
  }
  .ax-row-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ax-row-info {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .ax-row-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--ink);
  }
  .ax-row-sub {
    font-size: 11px;
    color: var(--muted);
  }
  .ax-row-badge {
    font-size: 9.5px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .badge-gold {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
  }
  .ax-row-arrow {
    font-size: 12px;
    color: #94a3b8;
  }

  /* Jobs Accordion */
  .ax-jobs-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .ax-job-card {
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 11px;
    overflow: hidden;
    transition: border-color 0.15s ease;
  }
  .ax-job-card.is-open {
    border-color: var(--gold);
    box-shadow: 0 3px 10px rgba(245, 158, 11, 0.08);
  }
  .ax-job-header-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
  }
  .ax-job-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ax-job-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
  }
  .ax-job-name {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--ink);
  }
  .ax-job-chevron {
    color: var(--muted);
    transition: transform 0.2s ease;
  }
  .ax-job-chevron.is-expanded {
    transform: rotate(180deg);
    color: var(--gold);
  }
  .ax-job-body {
    padding: 0 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ax-job-desc-text {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.45;
    margin: 0;
  }
  .ax-job-view-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 700;
    color: #b45309;
    text-decoration: none;
  }
  .ax-job-view-btn:hover {
    text-decoration: underline;
  }

  /* Quick Resource Pills */
  .ax-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .ax-pill-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 11px;
    background: var(--mist);
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
    transition: all 0.15s ease;
  }
  .ax-pill-link:hover {
    background: #ffffff;
    border-color: var(--gold);
    color: #b45309;
  }

  /* Logout and Footer */
  .ax-menu-footer-auth {
    padding-top: 4px;
  }
  .ax-menu-logout-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    color: #dc2626;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ax-menu-logout-btn:hover {
    background: #fee2e2;
    border-color: #f87171;
  }
  .ax-menu-copyright {
    text-align: center;
    font-size: 10.5px;
    color: #94a3b8;
    padding-top: 2px;
  }

  /* Common dropdown items for Account panel */
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
    .ax-nav .ax-hamburger-label { display: none; }
    .ax-nav .ax-hamburger-btn { padding: 0 10px; width: 38px; height: 38px; justify-content: center; }
    .ax-nav .ax-tabs-inner { padding: 0 8px; }
    .ax-nav .ax-tab { padding: 13px 10px; font-size: 12px; }
    .ax-nav .ax-tab::after { left: 10px; right: 10px; }
    .ax-nav .ax-tabs-user .ax-user-name { display: none; }

    /* Account panel stays as popup */
    .ax-nav .ax-nav-panel.ax-account-panel {
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

    /* Hamburger Menu becomes full-height slide-in Drawer */
    .ax-nav .ax-nav-panel.ax-menu-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: auto;
      width: min(100vw, 380px);
      max-width: 100vw;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      border-radius: 0;
      border: none;
      border-left: 1px solid rgba(226, 232, 240, 0.85);
      animation: axDrawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes axDrawerSlideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  }

  @media (max-width: 480px) {
    .ax-nav .ax-nav-panel.ax-account-panel { top: 56px; left: 6px; right: 6px; }
    .ax-nav .ax-nav-panel.ax-menu-panel { width: 100vw; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ax-nav * { transition: none !important; }
  }
`;