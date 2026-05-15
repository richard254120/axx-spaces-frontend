import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  const team = [
    {
      name: "Kenfred",
      role: "Co-Founder & CEO",
      emoji: "👨‍💼",
      bio: "Passionate about solving Kenya's housing challenges through technology. Kenfred leads product vision and strategy at Axx Spaces.",
    },
    {
      name: "Lucie",
      role: "Co-Founder & Operations",
      emoji: "👩‍💼",
      bio: "Lucie oversees landlord relations and ensures every listing on Axx Spaces meets our quality and verification standards.",
    },
    {
      name: "Richard",
      role: "Co-Founder & Technology",
      emoji: "👨‍💻",
      bio: "drives the technical infrastructure that powers Axx Spaces, ensuring a seamless experience for landlords and tenants alike.",
    },
  ];

  const milestones = [
    { year: "2023", text: "Axx Spaces was founded in Nairobi with a simple mission — make renting in Kenya fair, transparent, and stress-free." },
    { year: "2024", text: "Launched in all 47 counties, onboarded over 200 landlords and connected thousands of tenants to verified homes." },
    { year: "2025", text: "Introduced Axx Movers — Kenya's first integrated moving network — allowing tenants to move seamlessly after finding a home." },
    { year: "2026", text: "Serving 280+ active listings across Kenya with zero hidden fees and direct landlord communication." },
  ];

  const values = [
    { icon: "🔍", title: "Transparency", text: "No hidden fees, no middlemen. Every price you see is what you pay." },
    { icon: "✅", title: "Verification", text: "Every listing is manually reviewed before going live. We don't publish what we can't stand behind." },
    { icon: "🤝", title: "Community", text: "Built for Kenyans, by Kenyans. We understand the local market because we live it every day." },
    { icon: "🚀", title: "Innovation", text: "From GPS-mapped listings to integrated movers, we keep pushing to make your experience better." },
  ];

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🏠 Our Story</div>
          <h1 style={styles.heroTitle}>Built for Kenyans,<br />by Kenyans</h1>
          <p style={styles.heroSubtitle}>
            We started Axx Spaces because we experienced firsthand how frustrating it was to find a decent, 
            honest rental in Kenya. No more middlemen. No more hidden fees. No more wasted weekends.
          </p>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={styles.missionSection}>
        <div style={styles.missionInner}>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🎯</div>
            <h2 style={styles.missionTitle}>Our Mission</h2>
            <p style={styles.missionText}>
              To make finding and renting a home in Kenya as simple, transparent, and stress-free as possible — 
              connecting landlords directly with tenants across all 47 counties, with zero hidden fees and full trust.
            </p>
          </div>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>👁️</div>
            <h2 style={styles.missionTitle}>Our Vision</h2>
            <p style={styles.missionText}>
              A Kenya where every person — regardless of county or budget — can find a safe, verified, 
              affordable home with a single search. Where landlords and tenants communicate directly, 
              honestly, and efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={styles.storySection}>
        <div style={styles.storyInner}>
          <h2 style={styles.sectionTitle}>How It All Started</h2>
          <p style={styles.sectionSubtitle}>From a frustrating experience to Kenya's most trusted rental platform</p>

          <div style={styles.storyText}>
            <p>
              In 2023, our co-founders were searching for rental properties in Nairobi. What they encountered 
              was a maze of unverified listings, agents demanding commissions, properties that looked nothing 
              like their photos, and landlords who were impossible to reach directly.
            </p>
            <p>
              Frustrated but determined, they built Axx Spaces — a platform where landlords list directly, 
              tenants search freely, and every property is verified before it goes live. No agents. 
              No commissions. No surprises.
            </p>
            <p>
              What started as a solution to a personal problem quickly became a movement. Within months, 
              hundreds of landlords across Kenya joined the platform, and thousands of tenants found their 
              perfect home without paying a single shilling to an agent.
            </p>
            <p>
              Today, Axx Spaces operates in all 47 counties with 280+ active listings, an integrated moving 
              network through Axx Movers, and a growing community of Kenyans who believe renting should be fair.
            </p>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <section style={styles.milestonesSection}>
        <div style={styles.milestonesInner}>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Our Journey</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#94a3b8" }}>Key moments that shaped who we are</p>

          <div style={styles.timeline}>
            {milestones.map((m, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineYear}>{m.year}</div>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineText}>{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>What We Stand For</h2>
        <p style={styles.sectionSubtitle}>The principles that guide everything we do</p>

        <div style={styles.valuesGrid}>
          {values.map((v) => (
            <div key={v.title} style={styles.valueCard} className="value-card">
              <div style={styles.valueIcon}>{v.icon}</div>
              <h3 style={styles.valueTitle}>{v.title}</h3>
              <p style={styles.valueText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={styles.teamSection}>
        <div style={styles.teamInner}>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Meet the Team</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#94a3b8" }}>The people behind Axx Spaces</p>

          <div style={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} style={styles.teamCard} className="team-card">
                <div style={styles.teamEmoji}>{member.emoji}</div>
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamRole}>{member.role}</p>
                <p style={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {[
            { val: "280+", label: "Active Listings" },
            { val: "47", label: "Counties Covered" },
            { val: "5,000+", label: "Happy Tenants" },
            { val: "0", label: "Hidden Fees" },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <span style={styles.statVal}>{s.val}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to Find Your Home?</h2>
          <p style={styles.ctaText}>
            Join thousands of Kenyans who found their perfect home on Axx Spaces — for free.
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>
              🔍 Browse Listings
            </button>
            <button style={styles.ctaBtnSecondary} onClick={() => navigate("/register")}>
              📝 List Your Property
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <strong style={{ color: "#fbbf24", fontSize: "18px" }}>Axx Spaces</strong>
          <p style={styles.footerTagline}>Kenya's most trusted rental platform</p>
          <p style={styles.footerCopy}>© 2024 Axx Spaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", color: "#1f2937", minHeight: "100vh" },

  /* Hero */
  hero: {
    background: "linear-gradient(150deg, #ffffff 0%, #fef3e2 55%, #fff7ed 100%)",
    padding: "80px 20px 60px",
    textAlign: "center",
    borderBottom: "3px solid #fbbf24",
  },
  heroContent: { maxWidth: "720px", margin: "0 auto" },
  badge: {
    display: "inline-block",
    background: "#dcfce7", color: "#15803d",
    padding: "5px 16px", borderRadius: "20px",
    fontSize: "13px", fontWeight: 600,
    marginBottom: "20px", border: "1px solid #bbf7d0",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 54px)",
    fontWeight: 800, color: "#1f2937",
    margin: "0 0 16px", letterSpacing: "-1.5px", lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: "17px", color: "#6b7280",
    margin: "0 auto", maxWidth: "560px", lineHeight: 1.7,
  },

  /* Mission */
  missionSection: { padding: "72px 20px", background: "#f8f4f0" },
  missionInner: {
    maxWidth: "900px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
  },
  missionCard: {
    background: "white", padding: "32px", borderRadius: "16px",
    border: "1px solid #e5e7eb", textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  missionIcon: { fontSize: "40px", marginBottom: "16px" },
  missionTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", margin: "0 0 12px" },
  missionText: { fontSize: "15px", color: "#6b7280", lineHeight: 1.7, margin: 0 },

  /* Story */
  storySection: { padding: "72px 20px", background: "white" },
  storyInner: { maxWidth: "760px", margin: "0 auto" },
  sectionTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px", textAlign: "center" },
  sectionSubtitle: { fontSize: "15px", color: "#6b7280", textAlign: "center", margin: "0 0 44px" },
  storyText: { fontSize: "16px", color: "#4b5563", lineHeight: 1.85 },
  "storyText p": { marginBottom: "20px" },

  /* Milestones */
  milestonesSection: { padding: "72px 20px", background: "#1f2937" },
  milestonesInner: { maxWidth: "760px", margin: "0 auto" },
  timeline: { marginTop: "44px", display: "flex", flexDirection: "column", gap: "0" },
  timelineItem: {
    display: "grid",
    gridTemplateColumns: "80px 24px 1fr",
    gap: "16px",
    alignItems: "flex-start",
    paddingBottom: "36px",
    position: "relative",
  },
  timelineYear: {
    fontSize: "18px", fontWeight: 800, color: "#fbbf24",
    textAlign: "right", paddingTop: "2px",
  },
  timelineDot: {
    width: "14px", height: "14px",
    borderRadius: "50%", background: "#fbbf24",
    border: "3px solid #1f2937",
    boxShadow: "0 0 0 3px #fbbf24",
    marginTop: "4px", flexShrink: 0,
  },
  timelineText: { fontSize: "15px", color: "#cbd5e1", lineHeight: 1.7 },

  /* Values */
  valuesSection: { padding: "72px 20px", background: "#f8f4f0", maxWidth: "1100px", margin: "0 auto" },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "22px", marginTop: "8px",
  },
  valueCard: {
    background: "white", padding: "28px", borderRadius: "14px",
    textAlign: "center", border: "1px solid #e5e7eb",
    transition: "all 0.22s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  valueIcon: { fontSize: "36px", marginBottom: "14px" },
  valueTitle: { fontSize: "17px", fontWeight: 700, color: "#1f2937", margin: "0 0 10px" },
  valueText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* Team */
  teamSection: { padding: "72px 20px", background: "#1f2937" },
  teamInner: { maxWidth: "900px", margin: "0 auto" },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px", marginTop: "44px",
  },
  teamCard: {
    background: "#111827", padding: "32px 24px",
    borderRadius: "16px", textAlign: "center",
    border: "1px solid #334155", transition: "all 0.25s",
  },
  teamEmoji: { fontSize: "52px", marginBottom: "16px" },
  teamName: { fontSize: "18px", fontWeight: 800, color: "white", margin: "0 0 6px" },
  teamRole: { fontSize: "13px", color: "#fbbf24", fontWeight: 600, margin: "0 0 14px" },
  teamBio: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, margin: 0 },

  /* Stats */
  statsSection: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    padding: "52px 20px",
  },
  statsGrid: {
    display: "flex", justifyContent: "center",
    gap: "48px", flexWrap: "wrap",
    maxWidth: "900px", margin: "0 auto",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statVal: { fontSize: "36px", fontWeight: 800, color: "#1f2937" },
  statLabel: { fontSize: "13px", color: "#78350f", fontWeight: 600 },

  /* CTA */
  cta: {
    background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)",
    padding: "76px 20px", textAlign: "center",
  },
  ctaInner: { maxWidth: "600px", margin: "0 auto" },
  ctaTitle: { fontSize: "32px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 32px" },
  ctaButtons: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
  ctaBtnPrimary: {
    padding: "14px 32px", background: "#ef4444", color: "white",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: 700, cursor: "pointer",
  },
  ctaBtnSecondary: {
    padding: "14px 32px", background: "white", color: "#1f2937",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: 700, cursor: "pointer",
  },

  /* Footer */
  footer: { background: "#1f2937", color: "#d1d5db", padding: "36px 20px 20px", textAlign: "center" },
  footerInner: { maxWidth: "960px", margin: "0 auto" },
  footerTagline: { fontSize: "13px", color: "#6b7280", margin: "6px 0 4px" },
  footerCopy: { fontSize: "12px", color: "#4b5563", margin: 0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .value-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: #fbbf24 !important;
  }

  .team-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
    border-color: #fbbf24 !important;
  }

  @media (max-width: 640px) {
    [style*="gridTemplateColumns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;