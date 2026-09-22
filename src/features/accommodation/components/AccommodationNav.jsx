import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navStyles as s } from "../styles";
import { getAccommodationUser, getDisplayName, isAccommodationLoggedIn } from "../auth";

export default function AccommodationNav({
  showSearch = false,
  search = "",
  onSearchChange,
  onSearchSubmit,
  extraActions,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loggedIn = isAccommodationLoggedIn();
  const userName = getDisplayName(getAccommodationUser());

  return (
    <header style={s.nav}>
      <div style={s.navInner}>
        <button type="button" style={s.logoBtn} onClick={() => navigate("/accommodation")}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
          <span style={s.logoPipe}>|</span>
          <span style={s.logoLabel}>Accommodation</span>
        </button>

        {showSearch && (
          <input
            style={s.searchBar}
            placeholder="Search resorts, safaris, lodges…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
          />
        )}

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", flexWrap: "wrap" }}>
          <button type="button" style={s.navLink} onClick={() => navigate("/accommodation/listings")}>Explore</button>
          <button type="button" style={s.navLink} onClick={() => navigate("/accommodation/register-property")}>List property</button>
          {loggedIn ? (
            <>
              <button type="button" style={s.navLink} onClick={() => navigate("/accommodation/dashboard")}>Dashboard</button>
              <span style={s.userChip}> {userName}</span>
            </>
          ) : (
            <button type="button" style={s.navBtnPrimary} onClick={() => navigate("/accommodation/register-property")}>
              Get started
            </button>
          )}
          {extraActions}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: "none", marginLeft: "12px", background: "none", border: "none", cursor: "pointer", padding: "8px" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="mobile-nav" style={{ display: "none", padding: "16px", borderTop: "1px solid #e5e7eb", background: "#fff" }}>
          <button type="button" style={{ ...s.navLink, display: "block", width: "100%", textAlign: "left", padding: "12px 0" }} onClick={() => { navigate("/accommodation/listings"); setMobileMenuOpen(false); }}>Explore</button>
          <button type="button" style={{ ...s.navLink, display: "block", width: "100%", textAlign: "left", padding: "12px 0" }} onClick={() => { navigate("/accommodation/register-property"); setMobileMenuOpen(false); }}>List property</button>
          {loggedIn ? (
            <>
              <button type="button" style={{ ...s.navLink, display: "block", width: "100%", textAlign: "left", padding: "12px 0" }} onClick={() => { navigate("/accommodation/dashboard"); setMobileMenuOpen(false); }}>Dashboard</button>
              <span style={{ ...s.userChip, display: "block", padding: "12px 0" }}> {userName}</span>
            </>
          ) : (
            <button type="button" style={{ ...s.navBtnPrimary, display: "block", width: "100%", padding: "12px" }} onClick={() => { navigate("/accommodation/register-property"); setMobileMenuOpen(false); }}>
              Get started
            </button>
          )}
          {extraActions}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </header>
  );
}
