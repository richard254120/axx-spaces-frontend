import { useState } from "react";

const TABS = ["Terms of Service", "Privacy Policy"];

const terms = `
## 1. Acceptance of Terms
By accessing or using Axx Spaces ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.

## 2. Description of Service
Axx Spaces is an online marketplace that connects landlords, tenants, movers, and merchants. We provide tools to list properties, discover rental accommodation, book moving services, and source packing materials. Axx Spaces does not own any properties and is not a party to any rental or service agreement between users.

## 3. User Accounts
You must register an account to access certain features. You are responsible for keeping your credentials secure and for all activity that occurs under your account. You must provide accurate information and keep it up to date.

## 4. Listings & Content
Landlords are solely responsible for the accuracy of their listings. Axx Spaces reserves the right to remove listings that are fraudulent, misleading, or in violation of these terms. By uploading content (photos, descriptions) you grant Axx Spaces a non-exclusive licence to display it on the Platform.

## 5. Prohibited Conduct
You may not:
- Post false, misleading, or fraudulent listings.
- Harass, threaten, or abuse other users.
- Use the Platform for any unlawful purpose.
- Attempt to scrape, reverse-engineer, or disrupt the Platform.

## 6. Payments & Transactions
Axx Spaces does not process payments between users. All financial arrangements are made directly between landlords, tenants, movers, and merchants. Axx Spaces is not responsible for any payment disputes.

## 7. Limitation of Liability
To the maximum extent permitted by law, Axx Spaces shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to disputes between users, property damage, or loss of data.

## 8. Termination
We reserve the right to suspend or terminate your account at our discretion if you violate these terms.

## 9. Changes to Terms
We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. The date of last update is shown below.

## 10. Governing Law
These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.

**Last updated: May 2026**
`;

const privacy = `
## 1. Information We Collect
We collect information you provide directly (name, email, phone number, property details) and information collected automatically (IP address, browser type, pages visited, device information).

## 2. How We Use Your Information
We use your information to:
- Create and manage your account.
- Display your listings and profile to other users.
- Send you notifications about enquiries and bookings.
- Improve the Platform and debug issues.
- Send occasional service updates (you can opt out at any time).

## 3. Information Sharing
We do not sell your personal data. We may share your information with:
- **Other users**: Your name and listing details are visible to platform users as intended.
- **Service providers**: Third-party services we use to operate the Platform (hosting, analytics, email delivery). These providers are bound by data processing agreements.
- **Legal requirements**: When required by law or to protect the rights and safety of Axx Spaces and its users.

## 4. Data Storage & Security
Your data is stored on secure servers. We use industry-standard measures (encryption in transit via HTTPS, access controls) to protect your information. No system is 100% secure; please use a strong, unique password.

## 5. Cookies
We use cookies to keep you logged in and to understand how users interact with the Platform. You can disable cookies in your browser settings, but some features may not work correctly.

## 6. Your Rights
You have the right to:
- Access the personal data we hold about you.
- Correct inaccurate data.
- Request deletion of your account and associated data.
- Withdraw consent for marketing emails.

To exercise any of these rights, contact us at privacy@axxspaces.com.

## 7. Data Retention
We retain your data for as long as your account is active, or as long as necessary to provide services and comply with legal obligations. Deleted accounts are purged within 90 days.

## 8. Children's Privacy
Axx Spaces is not intended for users under the age of 18. We do not knowingly collect personal data from minors.

## 9. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you by email or an in-app notice if the changes are material.

## 10. Contact
For privacy-related questions: **privacy@axxspaces.com**

**Last updated: May 2026**
`;

function renderMarkdown(text) {
  return text
    .trim()
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} style={styles.heading2}>{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} style={styles.listItem}>{parseBold(line.replace("- ", ""))}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} style={styles.para}>{parseBold(line)}</p>;
    });
}

function parseBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: "#fbbf24", fontWeight: 700 }}>{part}</strong> : part
  );
}

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.heroTitle}>Terms & Privacy</h1>
        <p style={styles.heroSub}>
          Please read these documents carefully. They govern your use of Axx Spaces.
        </p>
      </div>

      {/* TABS */}
      <div style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === i && styles.tabActive) }}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        <div style={styles.card}>
          <ul style={styles.tocList}>
            {(activeTab === 0 ? terms : privacy)
              .split("\n")
              .filter((l) => l.startsWith("## "))
              .map((l, i) => (
                <li key={i} style={styles.tocItem}>{l.replace("## ", "")}</li>
              ))}
          </ul>
          <div style={styles.divider} />
          <div style={styles.body}>
            {renderMarkdown(activeTab === 0 ? terms : privacy)}
          </div>
        </div>

        {/* QUESTIONS */}
        <div style={styles.questionBox}>
          <p style={styles.questionText}>Have questions about our legal documents?</p>
          <a href="/contact" style={styles.questionLink}>Contact our support team →</a>
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
    padding: "72px 24px 40px",
    borderBottom: "1px solid #1e3a5f55",
  },
  eyebrow: {
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
    margin: "0 0 14px",
  },
  heroSub: {
    fontSize: "15px",
    color: "#94a3b8",
    maxWidth: "440px",
    margin: "0 auto",
  },
  tabRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    padding: "24px 24px 0",
  },
  tab: {
    padding: "10px 24px",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#fbbf24",
    borderColor: "#fbbf24",
    color: "#0f1729",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 24px 80px",
  },
  card: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "32px",
  },
  tocList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "24px",
  },
  tocItem: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    background: "rgba(100,116,139,0.1)",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "4px 10px",
  },
  divider: {
    height: "1px",
    background: "#334155",
    marginBottom: "28px",
  },
  body: {},
  heading2: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "28px 0 10px",
    paddingBottom: "6px",
    borderBottom: "1px solid #334155",
  },
  para: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.8,
    margin: "8px 0",
  },
  listItem: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.8,
    marginLeft: "20px",
    marginBottom: "4px",
  },
  questionBox: {
    marginTop: "32px",
    textAlign: "center",
    padding: "24px",
    background: "rgba(251,191,36,0.05)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "12px",
  },
  questionText: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  questionLink: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#fbbf24",
    textDecoration: "none",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  button:not([type="submit"]):hover { border-color: #fbbf24 !important; color: #fbbf24 !important; }
`;