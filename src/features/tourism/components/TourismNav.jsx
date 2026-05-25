import { useNavigate } from "react-router-dom";
import { navStyles as s } from "../styles";
import { getTourismUser, getDisplayName, isTourismLoggedIn } from "../auth";

export default function TourismNav({
  showSearch = false,
  search = "",
  onSearchChange,
  onSearchSubmit,
  extraActions,
}) {
  const navigate = useNavigate();
  const loggedIn = isTourismLoggedIn();
  const userName = getDisplayName(getTourismUser());

  return (
    <header style={s.nav}>
      <div style={s.navInner}>
        <button type="button" style={s.logoBtn} onClick={() => navigate("/tourism")}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
          <span style={s.logoPipe}>|</span>
          <span style={s.logoLabel}>Tourism</span>
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

        <nav style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", flexWrap: "wrap" }}>
          <button type="button" style={s.navLink} onClick={() => navigate("/tourism/listings")}>Explore</button>
          <button type="button" style={s.navLink} onClick={() => navigate("/tourism/register-property")}>List property</button>
          {loggedIn ? (
            <>
              <button type="button" style={s.navLink} onClick={() => navigate("/tourism/dashboard")}>Dashboard</button>
              <span style={s.userChip}>👤 {userName}</span>
            </>
          ) : (
            <button type="button" style={s.navBtnPrimary} onClick={() => navigate("/tourism/register-property")}>
              Get started
            </button>
          )}
          {extraActions}
        </nav>
      </div>
    </header>
  );
}
