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

        <nav style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", flexWrap: "wrap" }}>
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
      </div>
    </header>
  );
}
