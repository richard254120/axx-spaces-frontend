import { useNavigate } from "react-router-dom";
import {
  useProviderListings,
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  TOURISM_FONT_CSS,
  tourismTheme,
} from "../../features/tourism";
import { getTourismToken } from "../../features/tourism";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { listings, loading, error, stats, reload } = useProviderListings();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: tourismTheme.bg }}>
      <style>{TOURISM_FONT_CSS}</style>

      <aside style={sidebar}>
        <button type="button" style={logoBtn} onClick={() => navigate("/tourism")}>🏨 AXX Tourism</button>
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { label: "← Back to site", path: "/tourism" },
            { label: "+ Add property", path: "/tourism/register-property" },
            { label: "Browse listings", path: "/tourism/listings" },
          ].map((item) => (
            <button key={item.path} type="button" style={navItem} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "960px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: tourismTheme.text, marginBottom: "8px" }}>
          Your properties
        </h1>
        <p style={{ color: tourismTheme.muted, marginBottom: "24px", fontSize: "14px" }}>
          Manage listings, track review status, and add new properties.
        </p>

        {!getTourismToken() && (
          <ErrorAlert
            message="You are not signed in. Register a property or log in from the tourism homepage."
            onRetry={() => navigate("/tourism/register-property")}
          />
        )}

        {error && <ErrorAlert message={error} onRetry={reload} />}

        <div style={statsGrid}>
          {[
            { label: "Total listings", value: stats.total },
            { label: "Live on site", value: stats.live, color: "#16a34a" },
            { label: "Awaiting review", value: stats.pending, color: "#d97706" },
            { label: "Total views", value: stats.views, color: "#0ea5e9" },
          ].map((s) => (
            <div key={s.label} style={statCard}>
              <div style={{ fontSize: "13px", color: tourismTheme.muted }}>{s.label}</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: s.color || tourismTheme.text }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingBlock message="Loading your listings…" />
        ) : listings.length === 0 ? (
          <div style={{ ...statCard, marginTop: "24px", textAlign: "center", padding: "40px" }}>
            <p style={{ color: tourismTheme.muted, marginBottom: "16px" }}>No properties yet.</p>
            <button type="button" style={primaryBtn} onClick={() => navigate("/tourism/register-property")}>
              List your first property →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
            {listings.map((l) => (
              <div key={l.id || l._id} style={listRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "24px" }}>{l.emoji}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: 800 }}>{l.name}</h3>
                    <StatusBadge status={l.status} />
                  </div>
                  <div style={{ fontSize: "13px", color: tourismTheme.muted, marginTop: "4px" }}>
                    {l.category} · 📍 {l.location} · KSh {l.price?.toLocaleString()}/night
                  </div>
                  {l.status === "pending" && (
                    <p style={{ fontSize: "12px", color: "#92400e", marginTop: "8px" }}>
                      Our team will review within 24 hours. You will receive a payment link by email once approved.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  style={secondaryBtn}
                  onClick={() => navigate(`/tourism/${l.id || l._id}`)}
                  disabled={l.status !== "approved"}
                >
                  {l.status === "approved" ? "View live" : "Preview when live"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const sidebar = { width: "240px", background: "#1f2937", color: "white", padding: "28px 18px", flexShrink: 0 };
const logoBtn = { background: "none", border: "none", color: "white", fontSize: "18px", fontWeight: 800, cursor: "pointer", marginBottom: "32px", fontFamily: "inherit", textAlign: "left" };
const navItem = { padding: "12px 14px", borderRadius: "10px", background: "transparent", border: "none", color: "#9ca3af", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" };
const statCard = { background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #e5e7eb" };
const listRow = { background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e5e7eb", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" };
const primaryBtn = { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" };
const secondaryBtn = { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 };
