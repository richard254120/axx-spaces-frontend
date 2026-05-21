import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Import team images from src/assets
import kenfredImg from "../assets/kenfred.jpg";
import lucieImg from "../assets/lucie.jpg";
import richardImg from "../assets/richard.jpg";
import ianImg from "../assets/ian.jpg";
import brianImg from "../assets/brian.jpg";

export default function About() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const team = [
    {
      name: "Kenfred",
      role: "Co-Founder & CEO",
      image: kenfredImg,
      color: "#fbbf24",
      bio: "Passionate about solving Kenya's housing challenges through technology. Kenfred leads product vision and strategy at Axx Spaces.",
    },
    {
      name: "Lucie",
      role: "Co-Founder & Operations",
      image: lucieImg,
      color: "#22c55e",
      bio: "Lucie oversees landlord relations and ensures every listing on Axx Spaces meets our quality and verification standards.",
    },
    {
      name: "Richard",
      role: "Technical Lead",
      image: richardImg,
      color: "#3b82f6",
      bio: "Drives the technical infrastructure that powers Axx Spaces, ensuring a seamless experience for landlords and tenants alike.",
    },
    {
      name: "Ian",
      role: "Chief Financial Officer",
      image: ianImg,
      color: "#8b5cf6",
      bio: "Stewards the financial health and strategic direction of Axx Spaces.",
    },
    {
      name: "Brian",
      role: "UI/UX Designer",
      image: brianImg,
      color: "#ec4899",
      bio: "Creates intuitive and engaging user experiences for Axx Spaces.",
    },
  ];

  const whatWeDo = [
    {
      icon: "🏠",
      title: "Rental Space",
      color: "#fbbf24",
      desc: "We help users discover available rental houses and business spaces — compare pricing and locations, connect directly with landlords and caretakers, and access property information more conveniently.",
      items: null,
    },
    {
      icon: "🏢",
      title: "Business Space",
      color: "#22c55e",
      desc: "We help entrepreneurs and businesses find spaces that match their operational needs and budgets.",
      items: ["Shops", "Offices", "Commercial spaces", "Small business locations"],
    },
    {
      icon: "🚚",
      title: "Movers & Relocation",
      color: "#3b82f6",
      desc: "Moving can be stressful and expensive. Axxspace connects users with movers and relocation service providers to make transitions easier and more organized.",
      items: null,
    },
    {
      icon: "🛍️",
      title: "Second-Hand Marketplace",
      color: "#a855f7",
      desc: "A platform where second-hand merchants showcase products to buyers looking for affordable and accessible options.",
      items: ["Sustainability", "Affordable living", "Small-scale traders and local businesses"],
    },
  ];

  const values = [
    { icon: "💡", title: "Innovation", text: "Building modern solutions for everyday problems." },
    { icon: "🌍", title: "Accessibility", text: "Making services and opportunities easier to reach for everyone." },
    { icon: "🔍", title: "Transparency", text: "Encouraging accurate listings, honest reviews, and responsible engagement." },
    { icon: "🤝", title: "Community Growth", text: "Supporting landlords, tenants, merchants, movers, and entrepreneurs together." },
  ];

  const trustElements = [
    { icon: "✅", title: "Verified Listings", desc: "Every property is manually reviewed & verified before publication." },
    { icon: "⭐", title: "Reviews & Ratings", desc: "Tenants rate landlords. Landlords track feedback. Transparency builds trust." },
    { icon: "👁️", title: "Physical Verification", desc: "We encourage in-person visits before any payments are made." },
    { icon: "📞", title: "24/7 Support", desc: "Got an issue? Contact us via WhatsApp, email, or phone. We're here to help." },
    { icon: "🔐", title: "Data Privacy", desc: "Your personal data is encrypted and never shared without consent." },
    { icon: "🚨", title: "Report Fake Listings", desc: "Spot a scam? Report it immediately. We remove fake listings within 24 hours." },
  ];

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🌍 About Axxspace</div>
          <h1 style={styles.heroTitle}>Spaces. Services.<br />Solutions. All in One.</h1>
          <p style={styles.heroSubtitle}>
            A digital ecosystem connecting tenants, landlords, business owners, movers, and
            second-hand merchants through technology — built by young innovators in Kenya.
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section style={styles.whoSection}>
        <div style={styles.whoInner}>
          <div style={styles.whoLabel}>Who We Are</div>
          <h2 style={styles.whoTitle}>More Than a Platform</h2>
          <p style={styles.whoText}>
            Axxspace is a digital platform designed to simplify how people find spaces, services, and essential
            moving solutions in one place. What started as a house-hunting solution has expanded into a broader
            ecosystem connecting tenants, landlords, business owners, movers, and second-hand merchants through technology.
          </p>
          <p style={styles.whoText}>
            Founded by young innovators and university students in Kenya, Axxspace was created to solve everyday
            challenges people face when relocating, starting businesses, or searching for affordable products and spaces.
          </p>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section style={styles.missionSection}>
        <div style={styles.missionInner}>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🎯</div>
            <h2 style={styles.missionTitle}>Our Mission</h2>
            <p style={styles.missionText}>
              To simplify access to spaces, relocation services, and affordable marketplaces through technology.
            </p>
          </div>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🌍</div>
            <h2 style={styles.missionTitle}>Our Vision</h2>
            <p style={styles.missionText}>
              To become Africa's leading digital platform for spaces, moving services, and community-driven commerce.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section style={styles.whatSection}>
        <div style={styles.whatInner}>
          <div style={styles.sectionLabelDark}>What We Do</div>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Our Services</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#94a3b8" }}>
            Everything you need — spaces, movers, and a marketplace — in one connected platform
          </p>

          <div style={styles.whatGrid}>
            {whatWeDo.map((item) => (
              <div key={item.title} style={styles.whatCard} className="what-card">
                <div style={{ ...styles.whatIconWrap, background: item.color + "18", border: `1.5px solid ${item.color}40` }}>
                  <span style={styles.whatIcon}>{item.icon}</span>
                </div>
                <h3 style={{ ...styles.whatTitle, color: item.color }}>{item.title}</h3>
                <p style={styles.whatDesc}>{item.desc}</p>
                {item.items && (
                  <ul style={styles.whatList}>
                    {item.items.map((i) => (
                      <li key={i} style={styles.whatListItem}>
                        <span style={{ color: item.color, marginRight: "8px" }}>→</span>{i}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={styles.valuesSection}>
        <div style={styles.valuesInner}>
          <div style={styles.sectionLabel}>Our Core Values</div>
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
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsInner}>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>By The Numbers</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#94a3b8" }}>Our impact across Kenya</p>

          <div style={styles.statsGrid}>
            {[
              { val: "280+", label: "Active Listings", icon: "🏠" },
              { val: "47", label: "Counties Covered", icon: "🗺️" },
              { val: "500+", label: "Happy Tenants", icon: "😊" },
              { val: "150+", label: "Landlords Onboarded", icon: "👨‍💼" },
            ].map((s) => (
              <div key={s.label} style={styles.statCard} className="stat-card">
                <div style={styles.statIcon}>{s.icon}</div>
                <div style={styles.statNumber}>{s.val}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY ── */}
      <section style={styles.trustSection}>
        <div style={styles.trustInner}>
          <div style={styles.sectionLabel}>Safety First</div>
          <h2 style={styles.sectionTitle}>Trust & Safety</h2>
          <p style={styles.sectionSubtitle}>We take your safety seriously. Here's how we protect you.</p>

          <div style={styles.trustGrid}>
            {trustElements.map((trust) => (
              <div key={trust.title} style={styles.trustCard} className="trust-card">
                <div style={styles.trustIcon}>{trust.icon}</div>
                <h3 style={styles.trustTitle}>{trust.title}</h3>
                <p style={styles.trustDesc}>{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── (Improved Images) */}
      <section style={styles.teamSection}>
        <div style={styles.teamInner}>
          <div style={styles.sectionLabelDark}>The People</div>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Meet the Team</h2>
          <p style={{ ...styles.sectionSubtitle, color: "#94a3b8" }}>The young innovators behind Axx Spaces</p>

          <div style={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} style={styles.teamCard} className="team-card">
                <img
                  src={member.image}
                  alt={member.name}
                  style={styles.teamImage}
                />
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={{ ...styles.teamRole, color: member.color }}>{member.role}</p>
                <p style={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPORTANT NOTICE ── */}
      <section style={styles.noticeSection}>
        <div style={styles.noticeInner}>
          <div style={styles.noticeCard}>
            <div style={styles.noticeIcon}>⚠️</div>
            <div>
              <h3 style={styles.noticeTitle}>Important Notice</h3>
              <p style={styles.noticeText}>
                Axxspace acts as a digital connection platform between users, landlords, businesses, movers, and merchants.
                Information displayed on the platform is provided by the respective owners or service providers.
                Users are encouraged to verify products, services, pricing, and property details independently before
                making payments or final decisions. Availability of spaces or products may change without prior notice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILDING THE FUTURE ── */}
      <section style={styles.futureSection}>
        <div style={styles.futureInner}>
          <div style={styles.futureLabel}>What's Next</div>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Building the Future</h2>
          <p style={styles.futureText}>
            Axxspace is more than a platform. It is a growing ecosystem built around convenience, opportunity, and innovation.
            From finding a home, relocating, starting a business, or purchasing affordable second-hand products — we aim to
            make the process smarter, faster, and more connected for everyone.
          </p>
          <div style={styles.futurePillars}>
            {["Convenience", "Opportunity", "Innovation"].map((p) => (
              <div key={p} style={styles.futurePillar}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to Find Your Space?</h2>
          <p style={styles.ctaText}>
            Join thousands of Kenyans who found their perfect home on Axx Spaces — for free, with zero hidden fees.
          </p>

          <div style={styles.ctaButtons}>
            <button style={styles.ctaBtnPrimary} onClick={() => navigate("/listings")}>
              🔍 Browse Listings
            </button>
            <button
              style={{
                ...styles.ctaBtnSecondary,
                background: token ? "#22c55e" : "white",
                color: token ? "white" : "#1f2937",
              }}
              onClick={() => token ? navigate("/upload") : navigate("/login")}
            >
              📝 List Your Property
            </button>
            <button
              style={{ ...styles.ctaBtnSecondary, background: "#3b82f6", color: "white" }}
              onClick={() => navigate("/materials")}
            >
              🛒 Buy Materials
            </button>
            <button
              style={{ ...styles.ctaBtnSecondary, background: "#6366f1", color: "white" }}
              onClick={() => window.open("mailto:partners@axxspaces.com")}
            >
              🤝 Become a Partner
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerSection}>
            <strong style={{ color: "#fbbf24", fontSize: "18px" }}>Axx Spaces</strong>
            <p style={styles.footerTagline}>Kenya's most trusted rental platform</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <p style={styles.footerLink} onClick={() => navigate("/listings")}>Browse Listings</p>
            <p style={styles.footerLink} onClick={() => navigate("/")}>Home</p>
            <p style={styles.footerLink} onClick={() => navigate("/materials")}>Materials Marketplace</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Support</h4>
            <p style={styles.footerLink}>📧 support@axxspaces.com</p>
            <p style={styles.footerLink}>📱 +254 700 000 000</p>
            <p style={styles.footerLink}>💬 WhatsApp Support</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2026 Axx Spaces. All rights reserved. Built for Kenya, by Kenyans.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    color: "#1f2937",
    minHeight: "100vh",
  },

  /* HERO */
  hero: {
    background: "linear-gradient(150deg, #ffffff 0%, #fef3e2 55%, #fff7ed 100%)",
    padding: "80px 20px 60px",
    textAlign: "center",
    borderBottom: "3px solid #fbbf24",
  },
  heroContent: { maxWidth: "720px", margin: "0 auto" },
  badge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#15803d",
    padding: "5px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
    border: "1px solid #bbf7d0",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 54px)",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 16px",
    letterSpacing: "-1.5px",
    lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: "17px",
    color: "#6b7280",
    margin: "0 auto",
    maxWidth: "560px",
    lineHeight: 1.7,
  },

  whoSection: { padding: "72px 20px", background: "white" },
  whoInner: { maxWidth: "760px", margin: "0 auto" },
  whoLabel: {
    display: "inline-block",
    background: "#fef9c3",
    color: "#854d0e",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    border: "1px solid #fde68a",
  },
  whoTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 20px" },
  whoText: { fontSize: "16px", color: "#4b5563", lineHeight: 1.85, marginBottom: "16px" },

  missionSection: { padding: "60px 20px", background: "#f8f4f0" },
  missionInner: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  missionCard: { background: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
  missionIcon: { fontSize: "40px", marginBottom: "16px" },
  missionTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", margin: "0 0 12px" },
  missionText: { fontSize: "15px", color: "#6b7280", lineHeight: 1.7, margin: 0 },

  whatSection: { padding: "72px 20px", background: "#1f2937" },
  whatInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionLabelDark: { display: "inline-block", background: "#fbbf2420", color: "#fbbf24", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid #fbbf2440" },
  whatGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "22px", marginTop: "8px" },
  whatCard: { background: "#111827", padding: "28px", borderRadius: "16px", border: "1px solid #334155", transition: "all 0.25s" },
  whatIconWrap: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "12px", marginBottom: "16px" },
  whatIcon: { fontSize: "26px" },
  whatTitle: { fontSize: "17px", fontWeight: 800, margin: "0 0 10px" },
  whatDesc: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, margin: "0 0 12px" },
  whatList: { paddingLeft: "0", listStyle: "none", margin: 0 },
  whatListItem: { fontSize: "13px", color: "#cbd5e1", padding: "4px 0", display: "flex", alignItems: "center" },

  valuesSection: { padding: "72px 20px", background: "#f8f4f0" },
  valuesInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionLabel: { display: "inline-block", background: "#fef9c3", color: "#854d0e", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid #fde68a" },
  sectionTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 10px", textAlign: "center" },
  sectionSubtitle: { fontSize: "15px", color: "#6b7280", textAlign: "center", margin: "0 0 44px" },
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "22px" },
  valueCard: { background: "white", padding: "28px", borderRadius: "14px", textAlign: "center", border: "1px solid #e5e7eb", transition: "all 0.22s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  valueIcon: { fontSize: "36px", marginBottom: "14px" },
  valueTitle: { fontSize: "17px", fontWeight: 700, color: "#1f2937", margin: "0 0 10px" },
  valueText: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  statsSection: { background: "#1f2937", color: "white", padding: "60px 20px" },
  statsInner: { maxWidth: "1200px", margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginTop: "40px" },
  statCard: { background: "#111827", padding: "30px 20px", borderRadius: "12px", textAlign: "center", border: "1px solid #334155", transition: "all 0.3s" },
  statIcon: { fontSize: "40px", marginBottom: "12px" },
  statNumber: { fontSize: "32px", fontWeight: 800, color: "#fbbf24", margin: "8px 0" },
  statLabel: { fontSize: "14px", color: "#9ca3af", fontWeight: 600 },

  trustSection: { background: "#f3f4f6", padding: "60px 20px" },
  trustInner: { maxWidth: "1200px", margin: "0 auto" },
  trustGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "40px" },
  trustCard: { background: "white", padding: "28px 24px", borderRadius: "12px", border: "2px solid #e5e7eb", transition: "all 0.3s" },
  trustIcon: { fontSize: "32px", marginBottom: "12px" },
  trustTitle: { fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: "0 0 8px" },
  trustDesc: { fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 },

  /* TEAM - Optimized for visibility */
  teamSection: { padding: "72px 20px", background: "#1f2937" },
  teamInner: { maxWidth: "900px", margin: "0 auto" },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginTop: "44px",
  },
  teamCard: {
    background: "#111827",
    padding: "32px 24px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid #334155",
    transition: "all 0.25s",
  },
  teamImage: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 18px",
    border: "4px solid #fbbf24",
    boxShadow: "0 6px 16px rgba(251, 191, 36, 0.4)",
  },
  teamName: { fontSize: "18px", fontWeight: 800, color: "white", margin: "0 0 6px" },
  teamRole: { fontSize: "13px", fontWeight: 600, margin: "0 0 14px" },
  teamBio: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, margin: 0 },

  noticeSection: {
    background: "#fffbeb",
    padding: "40px 20px",
    borderTop: "1px solid #fde68a",
    borderBottom: "1px solid #fde68a",
  },
  noticeInner: { maxWidth: "900px", margin: "0 auto" },
  noticeCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    background: "white",
    border: "1.5px solid #fbbf24",
    borderRadius: "14px",
    padding: "28px 24px",
    boxShadow: "0 2px 12px rgba(251,191,36,0.08)",
  },
  noticeIcon: { fontSize: "28px", flexShrink: 0, marginTop: "2px" },
  noticeTitle: { fontSize: "16px", fontWeight: 800, color: "#92400e", margin: "0 0 10px" },
  noticeText: { fontSize: "14px", color: "#78350f", lineHeight: 1.75, margin: 0 },

  futureSection: { background: "#1f2937", padding: "72px 20px", textAlign: "center" },
  futureInner: { maxWidth: "700px", margin: "0 auto" },
  futureLabel: {
    display: "inline-block",
    background: "#fbbf2420",
    color: "#fbbf24",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    border: "1px solid #fbbf2440",
  },
  futureText: { fontSize: "16px", color: "#94a3b8", lineHeight: 1.85, margin: "0 0 32px" },
  futurePillars: { display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" },
  futurePillar: {
    background: "#111827",
    border: "1.5px solid #fbbf24",
    color: "#fbbf24",
    padding: "10px 24px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },

  cta: {
    background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)",
    padding: "76px 20px",
    textAlign: "center",
  },
  ctaInner: { maxWidth: "900px", margin: "0 auto" },
  ctaTitle: { fontSize: "32px", fontWeight: 800, color: "white", margin: "0 0 12px" },
  ctaText: { fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 32px" },
  ctaButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaBtnPrimary: {
    padding: "14px 24px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  ctaBtnSecondary: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s",
  },

  footer: { background: "#1f2937", color: "#d1d5db", padding: "40px 20px 20px" },
  footerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    marginBottom: "30px",
  },
  footerSection: { fontSize: "13px" },
  footerTitle: { color: "#fbbf24", fontSize: "14px", fontWeight: 700, margin: "0 0 12px" },
  footerTagline: { fontSize: "13px", color: "#6b7280", margin: "6px 0 4px" },
  footerLink: { margin: "6px 0", cursor: "pointer", transition: "color 0.2s", color: "#9ca3af" },
  footerBottom: { textAlign: "center", paddingTop: "20px", borderTop: "1px solid #374151" },
  footerCopy: { fontSize: "12px", color: "#6b7280", margin: 0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  p { margin-bottom: 16px; }
  p:last-child { margin-bottom: 0; }

  .what-card:hover {
    transform: translateY(-4px);
    border-color: #fbbf24 !important;
    box-shadow: 0 12px 32px rgba(0,0,0,0.25) !important;
  }

  .value-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
    border-color: #fbbf24 !important;
  }

  .team-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3) !important;
    border-color: #fbbf24 !important;
  }

  button:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  [style*="cursor: pointer"]:hover {
    color: #fbbf24 !important;
  }

  @media (max-width: 768px) {
    [style*="gridTemplateColumns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
    [style*="gridTemplateColumns: repeat"] {
      grid-template-columns: 1fr !important;
    }
  }
`;