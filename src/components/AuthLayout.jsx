import { Link } from "react-router-dom";

export default function AuthLayout({
  portalBadge = "AxxSpace Portal",
  portalTitle = "Welcome to AxxSpace",
  portalSubtitle = "Access your dashboard, manage your properties, and connect with thousands of users across Kenya.",
  accentColor = "#fbbf24",
  accentGlow = "rgba(251, 191, 36, 0.15)",
  features = [],
  stats = [],
  backLink = "/",
  backText = "Back to AxxSpace",
  children,
}) {
  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Ambient background glow orbs */}
      <div style={{ ...styles.glowOrb1, background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)` }} />
      <div style={styles.glowOrb2} />
      <div style={styles.gridOverlay} />

      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandAxx}>AXX</span>
          <span style={{ ...styles.brandSpace, color: accentColor }}>SPACE</span>
        </Link>
        <Link to={backLink} style={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{backText}</span>
        </Link>
      </header>

      {/* Main Split Grid */}
      <main style={styles.mainGrid}>
        {/* Left Side: Brand Showcase (Desktop) */}
        <section style={styles.showcaseSection}>
          <div style={styles.badgeWrapper}>
            <span style={{ ...styles.badgeDot, background: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
            <span style={styles.badgeText}>{portalBadge}</span>
          </div>

          <h1 style={styles.headline}>
            {portalTitle}
          </h1>

          <p style={styles.subtitle}>
            {portalSubtitle}
          </p>

          {/* Features Highlights */}
          {features && features.length > 0 && (
            <div style={styles.featuresList}>
              {features.map((feat, index) => (
                <div key={index} style={styles.featureCard}>
                  <div style={{ ...styles.featureIconBox, color: accentColor, borderColor: `rgba(255,255,255,0.1)` }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h3 style={styles.featureTitle}>{feat.title}</h3>
                    <p style={styles.featureDesc}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Stats Pills */}
          {stats && stats.length > 0 && (
            <div style={styles.statsRow}>
              {stats.map((st, idx) => (
                <div key={idx} style={styles.statPill}>
                  <div style={{ ...styles.statValue, color: accentColor }}>{st.value}</div>
                  <div style={styles.statLabel}>{st.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Trust & Security Badge */}
          <div style={styles.trustFooter}>
            <div style={styles.shieldIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <span style={styles.trustText}>
              256-Bit SSL Encrypted &bull; Direct M-Pesa &amp; Bank Integrated &bull; Verified in Kenya
            </span>
          </div>
        </section>

        {/* Right Side: Form Container */}
        <section style={styles.formSection}>
          <div style={{ ...styles.formCard, borderColor: `rgba(255, 255, 255, 0.12)` }}>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#071326",
    color: "#f1f5f9",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  glowOrb1: {
    position: "absolute",
    top: "-150px",
    left: "-100px",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    filter: "blur(90px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  glowOrb2: {
    position: "absolute",
    bottom: "-150px",
    right: "-100px",
    width: "550px",
    height: "550px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
    filter: "blur(90px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
    backgroundSize: "32px 32px",
    pointerEvents: "none",
    zIndex: 1,
    opacity: 0.8,
  },
  header: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    maxWidth: "1340px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  brand: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    fontSize: "24px",
    fontWeight: 900,
    letterSpacing: "0.5px",
  },
  brandAxx: {
    color: "#ffffff",
  },
  brandSpace: {
    color: "#fbbf24",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "all 0.2s ease",
  },
  mainGrid: {
    position: "relative",
    zIndex: 10,
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "48px",
    alignItems: "center",
    maxWidth: "1340px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 32px 60px",
    boxSizing: "border-box",
  },
  showcaseSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    paddingRight: "20px",
  },
  badgeWrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    alignSelf: "flex-start",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "6px 14px",
    borderRadius: "30px",
    backdropFilter: "blur(10px)",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  badgeText: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "#f1f5f9",
  },
  headline: {
    fontSize: "42px",
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
    letterSpacing: "-0.5px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "560px",
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "8px",
  },
  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "14px 18px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "14px",
    backdropFilter: "blur(12px)",
  },
  featureIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "18px",
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: "0 0 3px",
  },
  featureDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.45,
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  statPill: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "10px 16px",
    minWidth: "120px",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  trustFooter: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
    color: "#64748b",
    fontSize: "12px",
  },
  shieldIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trustText: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 500,
  },
  formSection: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  formCard: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.3)",
    padding: "38px 32px",
    boxSizing: "border-box",
    position: "relative",
  },
};

const css = `
  @media (max-width: 980px) {
    main {
      grid-template-columns: 1fr !important;
      gap: 32px !important;
      padding: 10px 16px 40px !important;
    }
    section:first-child {
      display: none !important;
    }
  }

  input:focus, select:focus {
    outline: none !important;
    border-color: #fbbf24 !important;
    background: rgba(15, 23, 42, 0.95) !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18) !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
