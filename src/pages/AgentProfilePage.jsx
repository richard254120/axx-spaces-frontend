import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../utils/fileLinks";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

/* ══════════════════════════════════════════════
   Public Agent Profile Page
   Reached by scanning the agent's QR poster.
   URL: /agent/profile/:id
══════════════════════════════════════════════ */

export default function AgentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/agents/${id}/public`)
      .then(res => {
        if (!res.ok) throw new Error("Agent not found");
        return res.json();
      })
      .then(data => { setAgent(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div style={s.loadWrap}>
      <div style={s.spinner} />
      <p style={s.loadText}>Loading agent profile…</p>
    </div>
  );

  /* ── Error ── */
  if (error || !agent) return (
    <div style={s.loadWrap}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
      <h2 style={s.errTitle}>Agent Not Found</h2>
      <p style={s.errSub}>This agent profile doesn't exist or has been removed.</p>
      <button style={s.homeBtn} onClick={() => navigate("/")}>Go Home</button>
    </div>
  );

  const verified = agent.agentProfile?.verificationStatus === "verified";
  const initials  = agent.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AG";
  const phone     = agent.agentProfile?.phone;
  const county    = agent.agentProfile?.county;
  const bio       = agent.agentProfile?.bio;

  return (
    <div style={s.root}>
      {/* ── HEADER BAND ── */}
      <div style={s.headerBand}>
        <div style={s.brandRow}>
          <span style={s.brandRed}>AXX</span>
          <span style={s.brandNavy}>SPACE</span>
        </div>
        <p style={s.brandTag}>Space hunting bila stress</p>
      </div>

      <div style={s.page}>
        {/* ── PROFILE CARD ── */}
        <div style={s.card}>
          {/* Avatar */}
          <div style={s.avatarWrap}>
            {agent.profileImage ? (
              <img
                src={resolveMediaUrl(agent.profileImage)}
                alt={agent.name}
                style={s.avatar}
              />
            ) : (
              <div style={s.avatarFallback}>{initials}</div>
            )}
            {verified && (
              <div style={s.verifiedBadge} title="Verified Agent">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Name & status */}
          <h1 style={s.name}>{agent.name}</h1>
          <div style={s.statusRow}>
            <span style={{ ...s.badge, ...(verified ? s.badgeGreen : s.badgePending) }}>
              {verified ? "✓ Verified Agent" : "⏳ Pending Verification"}
            </span>
            {county && <span style={s.countyPill}>📍 {county}</span>}
          </div>

          {/* Bio */}
          {bio && <p style={s.bio}>{bio}</p>}

          {/* Contact buttons */}
          <div style={s.contactRow}>
            {phone && (
              <>
                <a
                  href={`tel:${phone}`}
                  style={{ ...s.contactBtn, ...s.callBtn }}
                >
                  📞 Call Agent
                </a>
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(agent.name)}%2C%20I%20scanned%20your%20Axxspace%20QR%20poster%20and%20I%27m%20interested%20in%20your%20listings.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...s.contactBtn, ...s.waBtn }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.475 1.33 4.988l-1.417 5.176 5.297-1.39a9.939 9.939 0 0 0 4.778 1.214h.004c5.506 0 9.988-4.482 9.988-9.988.001-2.66-1.034-5.161-2.92-7.052A9.92 9.92 0 0 0 12.012 2zm5.727 13.916c-.244.686-1.22 1.262-1.682 1.344-.462.081-.926.156-3.033-.674-2.529-.993-4.148-3.565-4.274-3.732-.127-.168-.946-1.258-.946-2.398 0-1.14.597-1.705.809-1.928.212-.224.462-.28.618-.28h.442c.112 0 .262-.042.411.319.15.362.511 1.25.555 1.34.043.089.073.193.013.31-.06.117-.089.192-.178.297-.09.104-.188.232-.269.31-.089.088-.182.183-.078.36.104.178.461.76.99 1.23.681.605 1.254.793 1.43.882.176.088.277.074.379-.044.103-.118.441-.518.56-.695.118-.178.238-.148.397-.089.159.059 1.011.477 1.184.566.173.089.288.134.332.208.044.074.044.431-.2.116z" />
                  </svg>
                  WhatsApp
                </a>
              </>
            )}
          </div>

          {/* Stats strip */}
          <div style={s.statsRow}>
            <div style={s.statItem}>
              <span style={s.statVal}>{agent.listingCount ?? 0}</span>
              <span style={s.statLabel}>Listings</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statItem}>
              <span style={s.statVal}>{county || "Kenya"}</span>
              <span style={s.statLabel}>Area</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statItem}>
              <span style={{ ...s.statVal, color: verified ? "#10b981" : "#f59e0b" }}>
                {verified ? "Verified" : "Pending"}
              </span>
              <span style={s.statLabel}>Status</span>
            </div>
          </div>
        </div>

        {/* ── LISTINGS ── */}
        {agent.listings && agent.listings.length > 0 ? (
          <div style={s.listingsSection}>
            <h2 style={s.sectionTitle}>
              🏠 Active Listings
              <span style={s.countChip}>{agent.listings.length}</span>
            </h2>
            <div style={s.grid}>
              {agent.listings.map(prop => {
                const img = (() => {
                  const f = prop.images?.[0];
                  if (!f) return null;
                  return typeof f === "object" ? (f.imageUrl || f.url || null) : f;
                })();
                const price = prop.price != null
                  ? `KES ${prop.price.toLocaleString()}/mo`
                  : "Contact for price";
                return (
                  <div
                    key={prop._id}
                    style={s.propCard}
                    onClick={() => navigate(`/listings?property=${prop._id}`)}
                  >
                    <div style={s.propImgWrap}>
                      {img ? (
                        <img
                          src={resolveMediaUrl(img)}
                          alt={prop.title}
                          style={s.propImg}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={s.propImgFallback}>🏠</div>
                      )}
                      <div style={s.propTypeTag}>{prop.propertyType || "Rental"}</div>
                    </div>
                    <div style={s.propBody}>
                      <h3 style={s.propTitle}>{prop.title}</h3>
                      <p style={s.propLoc}>
                        📍 {[prop.location, prop.county].filter(Boolean).join(", ")}
                      </p>
                      <div style={s.propFooter}>
                        <span style={s.propPrice}>{price}</span>
                        <span style={s.propArrow}>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={s.noListings}>
            <span style={{ fontSize: 40 }}>🏡</span>
            <p style={s.noListingsTxt}>No active listings at the moment.</p>
            <p style={s.noListingsSub}>Check back soon or contact the agent directly.</p>
          </div>
        )}

        {/* ── BROWSE ALL ── */}
        <div style={s.browseWrap}>
          <button style={s.browseBtn} onClick={() => navigate("/listings")}>
            Browse All Listings on Axxspace →
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div style={s.footer}>
          <span style={s.footerBrand}>
            <span style={{ color: "#d9383a" }}>AXX</span>
            <span style={{ color: "#081A34" }}>SPACE</span>
          </span>
          <span style={s.footerTag}>Kenya's Most Trusted Property Platform</span>
          <span style={s.footerUrl}>www.axxspace.com</span>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const s = {
  root: {
    minHeight: "100vh",
    background: "#f8f4f0",
    fontFamily: "'Inter', 'DM Sans', sans-serif",
  },
  loadWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f4f0",
    fontFamily: "'Inter', sans-serif",
    gap: 12,
  },
  spinner: {
    width: 44,
    height: 44,
    border: "4px solid rgba(8,26,52,0.12)",
    borderTop: "4px solid #d9383a",
    borderRadius: "50%",
    animation: "spin 0.85s linear infinite",
  },
  loadText: { color: "#64748b", fontSize: 14, margin: 0 },
  errTitle: { color: "#081A34", fontSize: 22, fontWeight: 700, margin: 0 },
  errSub: { color: "#64748b", fontSize: 14, margin: "6px 0 20px" },
  homeBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg,#d9383a,#b91c1c)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  /* Header band */
  headerBand: {
    background: "#081A34",
    padding: "18px 24px 14px",
    textAlign: "center",
  },
  brandRow: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: 1,
    lineHeight: 1,
  },
  brandRed: { color: "#d9383a" },
  brandNavy: { color: "#ffffff", marginLeft: 6 },
  brandTag: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    margin: "4px 0 0",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },

  page: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "24px 16px 48px",
  },

  /* Profile card */
  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "36px 28px 28px",
    boxShadow: "0 4px 24px rgba(8,26,52,0.10)",
    textAlign: "center",
    marginBottom: 28,
    border: "1px solid rgba(8,26,52,0.07)",
  },
  avatarWrap: {
    position: "relative",
    display: "inline-block",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #d9383a",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#081A34,#1e3a5f)",
    color: "#fff",
    fontSize: 34,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #d9383a",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#10b981",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: 900,
    color: "#081A34",
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  badge: {
    padding: "5px 14px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  badgeGreen: {
    background: "rgba(16,185,129,0.12)",
    color: "#059669",
    border: "1px solid rgba(16,185,129,0.3)",
  },
  badgePending: {
    background: "rgba(245,158,11,0.12)",
    color: "#d97706",
    border: "1px solid rgba(245,158,11,0.3)",
  },
  countyPill: {
    padding: "5px 14px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(8,26,52,0.07)",
    color: "#475569",
  },
  bio: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.7,
    margin: "0 0 20px",
    padding: "0 8px",
  },
  contactRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  contactBtn: {
    padding: "12px 22px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    transition: "all 0.2s",
  },
  callBtn: {
    background: "#f0f4ff",
    color: "#081A34",
    border: "1px solid rgba(8,26,52,0.15)",
  },
  waBtn: {
    background: "#25D366",
    color: "#ffffff",
    border: "none",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: "1px solid rgba(8,26,52,0.07)",
    paddingTop: 20,
    gap: 0,
  },
  statItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  },
  statVal: {
    fontSize: 18,
    fontWeight: 800,
    color: "#081A34",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 600,
  },
  statDivider: {
    width: 1,
    height: 36,
    background: "rgba(8,26,52,0.08)",
  },

  /* Listings */
  listingsSection: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#081A34",
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  countChip: {
    background: "#d9383a",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 9px",
    borderRadius: 9999,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  propCard: {
    background: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid rgba(8,26,52,0.07)",
    boxShadow: "0 2px 12px rgba(8,26,52,0.07)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  propImgWrap: {
    position: "relative",
    height: 170,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  propImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  propImgFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
  },
  propTypeTag: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#081A34",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 6,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  propBody: { padding: "14px 16px 16px" },
  propTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#081A34",
    margin: "0 0 6px",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  propLoc: {
    fontSize: 12,
    color: "#64748b",
    margin: "0 0 12px",
  },
  propFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(8,26,52,0.06)",
    paddingTop: 10,
  },
  propPrice: {
    fontSize: 16,
    fontWeight: 800,
    color: "#d9383a",
  },
  propArrow: {
    color: "#081A34",
    fontSize: 18,
    fontWeight: 700,
  },
  noListings: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#fff",
    borderRadius: 16,
    marginBottom: 28,
    border: "1px solid rgba(8,26,52,0.07)",
  },
  noListingsTxt: { color: "#081A34", fontWeight: 700, fontSize: 16, margin: "10px 0 4px" },
  noListingsSub: { color: "#94a3b8", fontSize: 13, margin: 0 },

  /* Browse CTA */
  browseWrap: { textAlign: "center", marginBottom: 32 },
  browseBtn: {
    padding: "13px 28px",
    background: "linear-gradient(135deg,#081A34,#1e3a5f)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    letterSpacing: "0.03em",
  },

  /* Footer */
  footer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingTop: 24,
    borderTop: "1px solid rgba(8,26,52,0.08)",
  },
  footerBrand: { fontSize: 22, fontWeight: 900, letterSpacing: 1 },
  footerTag: { fontSize: 11, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" },
  footerUrl: { fontSize: 12, color: "#d9383a", fontWeight: 700 },
};
