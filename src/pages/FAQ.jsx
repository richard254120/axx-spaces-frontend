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
      {
        q: "What are Premium Boost plans?",
        a: "Premium Boost plans increase your listing's visibility. We offer Basic (KSh 5,000, 14 days), Standard (KSh 12,000, 30 days), and Premium (KSh 25,000, 30 days) tiers with features like homepage carousel placement, WhatsApp highlights, and analytics.",
      },
    ],
  },
  {
    category: "AxxBiashara (Business Directory)",
    items: [
      {
        q: "What is AxxBiashara?",
        a: "AxxBiashara is Kenya's premier business directory connecting users with trusted businesses across all sectors. Features reviews, ratings, advanced search, business comparison, and premium listings.",
      },
      {
        q: "How do I list my business on AxxBiashara?",
        a: "Register a business account, complete your business profile with details, photos, and services. Your business will be visible to thousands of users searching for services.",
      },
      {
        q: "Can users leave reviews for businesses?",
        a: "Yes, verified users can leave reviews and ratings for businesses. This helps build trust and helps other users make informed decisions.",
      },
      {
        q: "What are business subscriptions?",
        a: "Businesses can subscribe to premium plans that offer enhanced visibility, analytics, promotional features, and priority placement in search results.",
      },
    ],
  },
  {
    category: "Tourism & Hospitality",
    items: [
      {
        q: "What tourism services does Axxspace offer?",
        a: "We offer hotels, lodges, safari packages, and unique Kenyan experiences available for direct booking across all 47 counties. Property owners can advertise with flexible subscription packages.",
      },
      {
        q: "How do I book tourism experiences?",
        a: "Browse our Tourism section, select hotels, lodges, or experiences, and contact providers directly through our platform to make bookings.",
      },
      {
        q: "Can I list my tourism property on Axxspace?",
        a: "Yes! Register as a tourism provider, complete verification, and list your hotel, lodge, or tourism experience. You'll get access to a dedicated dashboard to manage bookings and inquiries.",
      },
    ],
  },
  {
    category: "University Hostels",
    items: [
      {
        q: "What is the University Hostels feature?",
        a: "A specialized section helping university students find accommodation near Kenyan universities. Search by university, location, and budget to find hostels that fit your needs.",
      },
      {
        q: "Which universities are covered?",
        a: "We cover universities across all 47 counties of Kenya, including major institutions like University of Nairobi, Kenyatta University, Jomo Kenyatta University, and many more.",
      },
      {
        q: "Can landlords list hostels for students?",
        a: "Yes, landlords near universities can list their properties specifically as student accommodation, making it easier for students to find suitable housing.",
      },
    ],
  },
  {
    category: "Marketplace & Sellers",
    items: [
      {
        q: "What is the Marketplace?",
        a: "A buy-and-sell platform for new and used goods — electronics, furniture, fashion, vehicles, and more nationwide. Connect directly with sellers.",
      },
      {
        q: "How do I become a seller?",
        a: "Register a seller account through our Seller Login, complete verification, and start listing your products. You'll have access to a dedicated seller dashboard.",
      },
      {
        q: "Are there fees for selling on the Marketplace?",
        a: "Basic listings are free. We offer premium listing options for increased visibility. Transaction fees may apply for certain features.",
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
    category: "Materials Marketplace",
    items: [
      {
        q: "What is the Materials Marketplace?",
        a: "A dedicated section for moving materials — boxes, tape, bubble wrap, packing supplies, and more. Connect with suppliers directly.",
      },
      {
        q: "How do I buy moving materials?",
        a: "Browse the Materials section, select the items you need, and contact suppliers directly through our platform to arrange purchase and delivery.",
      },
    ],
  },
  {
    category: "AxxWallet",
    items: [
      {
        q: "What is AxxWallet?",
        a: "AxxWallet is your digital wallet on the platform, allowing you to deposit funds, make payments for premium services, withdraw money, and transfer funds to other users.",
      },
      {
        q: "How do I deposit money into my AxxWallet?",
        a: "Go to your AxxWallet dashboard, select 'Deposit', choose your payment method (M-Pesa, bank transfer, etc.), and follow the instructions to add funds.",
      },
      {
        q: "Can I withdraw money from my AxxWallet?",
        a: "Yes, you can withdraw funds from your AxxWallet to your registered bank account or mobile money account. Withdrawals are processed within 1-3 business days.",
      },
    ],
  },
  {
    category: "Verification & Trust",
    items: [
      {
        q: "What verification levels are available?",
        a: "We offer three verification levels: Student Verification (upload Student ID), Standard Verification (ID document, proof of address, selfie), and Premium Verification (includes physical verification).",
      },
      {
        q: "Why should I get verified?",
        a: "Verification builds trust with other users, gives you a verified badge, unlocks premium features, and increases your chances of successful transactions.",
      },
      {
        q: "How long does verification take?",
        a: "Student verification typically takes 1-2 business days. Standard verification takes 2-3 business days. Premium verification may take 3-5 business days depending on physical verification scheduling.",
      },
      {
        q: "What documents do I need for verification?",
        a: "For Standard verification, you'll need a valid ID (national ID, passport, or driving license), a recent utility bill or bank statement for address proof, and a clear selfie.",
      },
    ],
  },
  {
    category: "Account & Payments",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Register' in the navbar and fill in your name, email, and password. You can register as a landlord, tenant, mover, business owner, seller, or tourism provider.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Login', then 'Forgot password'. Enter your email and we'll send you a reset link within a few minutes.",
      },
      {
        q: "Does Axxspace handle payments between users?",
        a: "Axxspace is primarily a discovery and communication platform. While we offer AxxWallet for platform services, direct payments between users (rent, purchases, services) are arranged between parties. We recommend using traceable payment methods.",
      },
      {
        q: "How can I view my payment history?",
        a: "Go to your dashboard and access 'Payment History' to view all your transactions, including deposits, withdrawals, and payments for premium services.",
      },
    ],
  },
  {
    category: "Messaging & Communication",
    items: [
      {
        q: "How does the messaging system work?",
        a: "Our in-platform messaging allows you to communicate directly with landlords, sellers, movers, and service providers. Messages are stored securely and can be accessed anytime.",
      },
      {
        q: "Can I message multiple people?",
        a: "Yes, you can have separate conversations with multiple users. Each conversation is organized by recipient for easy management.",
      },
      {
        q: "Are messages monitored?",
        a: "Axxspace does not monitor the content of your messages for privacy reasons. However, we may review messages if there's a report of abuse or fraud.",
      },
    ],
  },
  {
    category: "Saved Items & Notifications",
    items: [
      {
        q: "How do I save properties or businesses?",
        a: "Click the heart icon on any listing, business, or tourism property to save it to your favorites. Access all saved items from your dashboard.",
      },
      {
        q: "How do notifications work?",
        a: "You'll receive notifications for new messages, booking inquiries, profile updates, and important platform announcements. You can manage notification preferences in your settings.",
      },
      {
        q: "Can I turn off notifications?",
        a: "Yes, you can customize which notifications you receive in your account settings. You can choose to receive notifications via email, in-app, or both.",
      },
    ],
  },
  {
    category: "Reviews & Ratings",
    items: [
      {
        q: "How do I leave a review?",
        a: "After completing a transaction or using a service, you can leave a review on the property, business, or service provider's profile. Reviews help other users make informed decisions.",
      },
      {
        q: "Can I edit or delete my review?",
        a: "Yes, you can edit or delete your review within 7 days of posting. After that period, reviews become permanent to maintain authenticity.",
      },
      {
        q: "What if I receive a fake review?",
        a: "Report fake reviews through our support team. We investigate all reports and remove fraudulent reviews to maintain platform integrity.",
      },
    ],
  },
  {
    category: "Support & Help",
    items: [
      {
        q: "How do I contact customer support?",
        a: "You can reach us via email at support@axxspace.com, through our Contact page, or via WhatsApp. Our team typically responds within 24 hours.",
      },
      {
        q: "What should I do if I encounter a scam?",
        a: "Report suspicious activity immediately through our platform or email support@axxspace.com. We take fraud seriously and will investigate and take appropriate action.",
      },
      {
        q: "Is my personal information secure?",
        a: "Yes, we use industry-standard encryption and security measures to protect your data. Your information is never shared with third parties without your consent, except as required by law.",
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