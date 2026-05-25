import { useState } from "react";

const faqs = [
  {
    category: "Listings",
    items: [
      {
        q: "How do I list my property on Axxspace?",
        a: "Create an account, go to your Dashboard and click 'Upload Property'. Fill in the details — title, description, photos, price, and location — then submit for review. Your listing goes live within 24 hours.",
      },
      {
        q: "Is listing my property free?",
        a: "Yes, basic listings are completely free. We offer optional promoted/featured listings that give your property higher visibility in search results.",
      },
      {
        q: "How do I edit or remove a listing?",
        a: "Go to your Dashboard, find the listing, and click 'Edit' or 'Delete'. Changes are reflected immediately.",
      },
      {
        q: "Can I mark my listing as 'taken' without deleting it?",
        a: "Yes. From your Dashboard you can change the status to 'Under Offer' or 'Taken'. This keeps the listing visible but signals to tenants it's no longer available.",
      },
    ],
  },
  {
    category: "Movers",
    items: [
      {
        q: "How do I book a mover?",
        a: "Browse the Movers page, select a mover that fits your needs, and send them a booking request with your date, pickup, and drop-off location. They'll confirm within a few hours.",
      },
      {
        q: "Are the movers on Axxspace verified?",
        a: "All movers go through a basic verification process before being listed. Verified movers display a badge on their profile. We recommend reading reviews before booking.",
      },
      {
        q: "What if I need to cancel a booking?",
        a: "Contact the mover directly through Messages as early as possible. Each mover sets their own cancellation policy, which is displayed on their profile.",
      },
    ],
  },
  {
    category: "Account & Payments",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Register' in the navbar and fill in your name, email, and password. You can register as a landlord, tenant, or mover.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Login', then 'Forgot password'. Enter your email and we'll send you a reset link within a few minutes.",
      },
      {
        q: "Does Axxspace handle payments between landlords and tenants?",
        a: "Not currently. Axxspace is a discovery and communication platform. Payment arrangements are made directly between the parties. We recommend using traceable payment methods.",
      },
    ],
  },
  {
    category: "Merchants",
    items: [
      {
        q: "What is the Merchants section?",
        a: "Merchants are suppliers of moving materials — boxes, tape, bubble wrap, and more. You can browse and contact them directly through the platform.",
      },
      {
        q: "How do I become a listed merchant?",
        a: "Register an account and contact our support team at support@axxspace.com. We'll get your shop set up on the platform.",
      },
    ],
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null);

  const toggle = (id) => setOpenItem(openItem === id ? null : id);

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <p style={styles.heroEyebrow}>Help Centre</p>
        <h1 style={styles.heroTitle}>Frequently Asked Questions</h1>
        <p style={styles.heroSub}>
          Can't find what you're looking for? Reach out via our{" "}
          <a href="/contact" style={styles.heroLink}>Contact page</a>.
        </p>
      </div>

      {/* FAQ SECTIONS */}
      <div style={styles.content}>
        {faqs.map((section) => (
          <div key={section.category} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.category}</h2>
            <div style={styles.itemsWrapper}>
              {section.items.map((item, i) => {
                const id = `${section.category}-${i}`;
                const isOpen = openItem === id;
                return (
                  <div key={id} style={{ ...styles.item, ...(isOpen && styles.itemOpen) }}>
                    <button
                      style={styles.question}
                      onClick={() => toggle(id)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span style={{ ...styles.chevron, ...(isOpen && styles.chevronOpen) }}>›</span>
                    </button>
                    {isOpen && (
                      <div style={styles.answer}>
                        <p style={styles.answerText}>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* STILL NEED HELP */}
        <div style={styles.helpBox}>
          <p style={styles.helpTitle}>Still need help?</p>
          <p style={styles.helpSub}>Our support team usually replies within a few hours.</p>
          <a href="/contact" style={styles.helpBtn}>Contact Support →</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(135deg, #0f1729 0%, #1e293b 100%)",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f1f5f9",
  },
  hero: {
    textAlign: "center",
    padding: "72px 24px 48px",
    borderBottom: "1px solid #1e3a5f55",
  },
  heroEyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#fbbf24",
    marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: 800,
    color: "#f1f5f9",
    margin: "0 0 16px",
    lineHeight: 1.15,
  },
  heroSub: {
    fontSize: "15px",
    color: "#94a3b8",
    maxWidth: "480px",
    margin: "0 auto",
  },
  heroLink: {
    color: "#fbbf24",
    textDecoration: "none",
    fontWeight: 700,
  },
  content: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "48px 24px 80px",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#fbbf24",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #334155",
  },
  itemsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  item: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid #334155",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  itemOpen: {
    borderColor: "#fbbf2466",
  },
  question: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 20px",
    background: "none",
    border: "none",
    color: "#e2e8f0",
    fontSize: "15px",
    fontWeight: 700,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  chevron: {
    fontSize: "20px",
    color: "#fbbf24",
    flexShrink: 0,
    transition: "transform 0.25s",
    transform: "rotate(0deg)",
  },
  chevronOpen: {
    transform: "rotate(90deg)",
  },
  answer: {
    padding: "0 20px 18px",
    borderTop: "1px solid #334155",
  },
  answerText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.75,
    margin: "14px 0 0",
  },
  helpBox: {
    marginTop: "56px",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "14px",
    padding: "36px",
    textAlign: "center",
  },
  helpTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  helpSub: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  helpBtn: {
    display: "inline-block",
    padding: "10px 24px",
    background: "#fbbf24",
    color: "#0f1729",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "14px",
    textDecoration: "none",
    transition: "opacity 0.2s",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  button:hover { opacity: 0.85; }
  a[style*="background: #fbbf24"]:hover { opacity: 0.85; }
`;