import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Replace this with your actual API call, e.g.:
    // await fetch("/api/contact", { method: "POST", body: JSON.stringify(form) });
    await new Promise((r) => setTimeout(r, 1000)); // simulate network
    setLoading(false);
    setSubmitted(true);
  };

  const channels = [
    { icon: "📧", label: "Email", value: "axxspaces@gmail.com", href: "mailto:axxspaces@gmail.com" },
    { icon: "💬", label: "Live Chat", value: "Available Mon–Sun, 8am–6pm", href: null },
    { icon: "📱", label: "WhatsApp", value: "+254 796740883", href: "https://wa.me/254796740883" },
  ];

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Support</p>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSub}>
          We're here to help. Send us a message and we'll get back to you within a few hours.
        </p>
      </div>

      <div style={styles.layout}>
        {/* LEFT — CONTACT CHANNELS */}
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Other ways to reach us</h2>
          {channels.map((c) => (
            <div key={c.label} style={styles.channelCard}>
              <span style={styles.channelIcon}>{c.icon}</span>
              <div>
                <p style={styles.channelLabel}>{c.label}</p>
                {c.href ? (
                  <a href={c.href} style={styles.channelValue}>{c.value}</a>
                ) : (
                  <p style={styles.channelValue}>{c.value}</p>
                )}
              </div>
            </div>
          ))}

          <div style={styles.faqNudge}>
            <p style={styles.faqNudgeText}>
              Looking for quick answers?
            </p>
            <a href="/faq" style={styles.faqNudgeLink}>Browse the FAQ →</a>
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div style={styles.formCard}>
          {submitted ? (
            <div style={styles.successBox}>
              <div style={styles.successIcon}>✓</div>
              <h3 style={styles.successTitle}>Message sent!</h3>
              <p style={styles.successText}>
                Thanks for reaching out, <strong>{form.name}</strong>. We'll reply to{" "}
                <strong>{form.email}</strong> within a few hours.
              </p>
              <button
                style={styles.resetBtn}
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <h2 style={styles.formTitle}>Send a message</h2>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Full name</label>
                  <input
                    style={styles.input}
                    name="name"
                    placeholder="John Kamau"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email address</label>
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <select
                  style={styles.input}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a topic…</option>
                  <option value="listing">Listing issue</option>
                  <option value="mover">Mover / booking problem</option>
                  <option value="account">Account or login help</option>
                  <option value="payment">Payment question</option>
                  <option value="merchant">Merchant enquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Message</label>
                <textarea
                  style={{ ...styles.input, height: "140px", resize: "vertical" }}
                  name="message"
                  placeholder="Describe your issue or question in detail…"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Sending…" : "Send message →"}
              </button>
            </form>
          )}
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
    margin: "0 0 16px",
  },
  heroSub: {
    fontSize: "15px",
    color: "#94a3b8",
    maxWidth: "440px",
    margin: "0 auto",
  },
  layout: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "48px 24px 80px",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "32px",
    alignItems: "start",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sidebarTitle: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: "4px",
  },
  channelCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    background: "rgba(30,41,59,0.7)",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "14px 16px",
  },
  channelIcon: { fontSize: "20px", marginTop: "2px" },
  channelLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: "4px",
  },
  channelValue: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#fbbf24",
    textDecoration: "none",
    margin: 0,
  },
  faqNudge: {
    marginTop: "8px",
    padding: "16px",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "10px",
    textAlign: "center",
  },
  faqNudgeText: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  faqNudgeLink: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#fbbf24",
    textDecoration: "none",
  },
  formCard: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "32px",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "24px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px" },
  input: {
    background: "rgba(15,23,41,0.8)",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "12px 28px",
    background: "#fbbf24",
    color: "#0f1729",
    border: "none",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
    alignSelf: "flex-start",
  },
  successBox: {
    textAlign: "center",
    padding: "24px 0",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    background: "rgba(251,191,36,0.15)",
    border: "2px solid #fbbf24",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#fbbf24",
    margin: "0 auto 20px",
  },
  successTitle: { fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "10px" },
  successText: { fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "24px" },
  resetBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  input:focus, textarea:focus, select:focus {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.12);
  }
  select option { background: #1e293b; color: #f1f5f9; }
  button[type="submit"]:hover { opacity: 0.85; }

  @media (max-width: 640px) {
    [style*="gridTemplateColumns: 1fr 2fr"] { grid-template-columns: 1fr !important; }
    [style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
`;