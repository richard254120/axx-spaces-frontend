import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

// ─── Glassmorphism + Kenyan-inspired palette ──────────────────────────────────
const C = {
  gold: "#E6A817",
  goldLt: "#FCC84A",
  goldDim: "rgba(230,168,23,0.15)",
  green: "#1DAF6F",
  greenDim: "rgba(29,175,111,0.15)",
  blue: "#2D7DD2",
  blueDim: "rgba(45,125,210,0.15)",
  red: "#E04545",
  bg: "#070E1C",
  bg1: "#0D1626",
  bg2: "#111E30",
  bg3: "#172438",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text: "#F0F4FF",
  muted: "#7B8FAD",
  subtle: "#A3B4CC",
};

const font = "'Outfit', sans-serif";

// ─── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 44 }) {
  const initials = name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  const hue = (name?.charCodeAt(0) || 0) * 17 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,28%)`,
      border: `2px solid hsl(${hue},55%,45%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: `hsl(${hue},80%,80%)`,
      flexShrink: 0, letterSpacing: 1,
    }}>{initials}</div>
  );
}

function StarRating({ value = 4.5 }) {
  return (
    <span style={{ color: C.gold, fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(Math.floor(value))}{"☆".repeat(5 - Math.floor(value))}
      <span style={{ color: C.muted, fontSize: 12, marginLeft: 5 }}>{value.toFixed(1)}</span>
    </span>
  );
}

function Badge({ children, color = C.gold, bg }) {
  return (
    <span style={{
      background: bg || `${color}22`,
      color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: "2px 9px",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Pill({ children }) {
  return (
    <span style={{
      background: C.bg3, color: C.subtle,
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 500,
    }}>{children}</span>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function FieldInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <input style={{
        width: "100%", padding: "11px 14px",
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 10, color: C.text,
        fontFamily: font, fontSize: 14, boxSizing: "border-box",
        transition: "border-color .2s",
      }}
        onFocus={e => e.target.style.borderColor = C.gold}
        onBlur={e => e.target.style.borderColor = C.border.toString()}
        {...props} />
    </div>
  );
}

function FieldSelect({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <select style={{
        width: "100%", padding: "11px 14px",
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 10, color: C.text,
        fontFamily: font, fontSize: 14, boxSizing: "border-box",
        cursor: "pointer",
      }}
        onFocus={e => e.target.style.borderColor = C.gold}
        onBlur={e => e.target.style.borderColor = C.border.toString()}
        {...props}>{children}</select>
    </div>
  );
}

function Alert({ type, children }) {
  const map = { error: [C.red, "#3b0a0a"], success: [C.green, "#052e16"] };
  const [color, bg] = map[type] || [C.muted, C.bg2];
  return (
    <div style={{
      background: bg, color, border: `1px solid ${color}44`,
      borderRadius: 10, padding: "11px 14px",
      fontSize: 13, marginBottom: 16, lineHeight: 1.5,
    }}>{children}</div>
  );
}

function PrimaryBtn({ children, loading, loadingText, style: s, ...props }) {
  return (
    <button disabled={loading} style={{
      width: "100%", padding: "13px", background: C.gold,
      color: "#000", border: "none", borderRadius: 12,
      fontWeight: 800, cursor: "pointer", fontSize: 14,
      fontFamily: font, letterSpacing: 0.3, transition: "opacity .15s",
      opacity: loading ? 0.6 : 1, ...s,
    }} {...props}>{loading ? loadingText : children}</button>
  );
}

// ─── Mover Card ────────────────────────────────────────────────────────────────
function MoverCard({ m, onBook, featured }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: featured ? "linear-gradient(135deg,#111E30,#172438)" : C.bg1,
        borderRadius: 20, padding: "24px",
        border: featured
          ? `1.5px solid ${C.gold}55`
          : `1px solid ${hov ? C.borderHover : C.border}`,
        display: "flex", flexDirection: "column", gap: 0,
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 16px 40px rgba(0,0,0,0.5)" : featured ? `0 4px 20px ${C.gold}22` : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {featured && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: C.gold, color: "#000",
          fontSize: 10, fontWeight: 800, letterSpacing: 1,
          padding: "4px 14px",
          borderBottomLeftRadius: 10, textTransform: "uppercase",
        }}>⭐ Featured</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
        <Avatar name={m.name} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 700 }}>{m.name}</h3>
            <Badge color={C.green}>✓ Verified</Badge>
          </div>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>📍 {m.county}</p>
          <StarRating value={m.rating || (4 + Math.random()).toFixed(1) * 1} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Pill>🚗 {m.vehicleType || "Pickup"}</Pill>
        <Pill>⏱ {m.experienceYears || m.experience || 0} yrs exp</Pill>
      </div>

      {m.bio && (
        <p style={{ color: C.subtle, fontSize: 13, margin: "0 0 14px", lineHeight: 1.6, fontStyle: "italic" }}>
          "{m.bio}"
        </p>
      )}

      {/* Services */}
      {m.services?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {m.services.slice(0, 4).map(s => <Pill key={s}>{s}</Pill>)}
          {m.services.length > 4 && <Pill>+{m.services.length - 4} more</Pill>}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onBook(m)} style={{
          flex: 2, padding: "11px", background: C.blue,
          color: "#fff", border: "none", borderRadius: 10,
          fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: font,
          transition: "opacity .15s",
        }}>📋 Book Now</button>
        <button onClick={() => window.open(`tel:${m.phone}`)} style={{
          flex: 1, padding: "11px", background: C.goldDim,
          color: C.gold, border: `1px solid ${C.gold}44`,
          borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: font,
        }}>📞 Call</button>
        <button onClick={() => window.open(`https://wa.me/${m.phone}`, "_blank")} style={{
          flex: 1, padding: "11px", background: C.greenDim,
          color: C.green, border: `1px solid ${C.green}44`,
          borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: font,
        }}>💬 WA</button>
      </div>
    </div>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ mover, onClose, availableServices }) {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceType: mover.services?.[0] || "",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerName, customerPhone, serviceType, pickupLocation, dropoffLocation, scheduledDate } = form;
    if (!customerName || !customerPhone || !serviceType || !pickupLocation || !dropoffLocation || !scheduledDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true); setError("");
    try {
      await API.post("/jobs", {
        moverId: mover._id, moverName: mover.name,
        ...form, county: mover.county,
      });
      setSuccess(`Booking request sent to ${mover.name}! They'll contact you once they accept.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(7,14,28,0.92)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.bg1, borderRadius: 24,
        border: `1px solid ${C.border}`,
        width: "100%", maxWidth: 540,
        maxHeight: "90vh", overflowY: "auto",
        padding: 32,
        boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={mover.name} size={44} />
            <div>
              <h3 style={{ margin: 0, color: C.text, fontSize: 18, fontWeight: 700 }}>Book {mover.name}</h3>
              <p style={{ margin: "3px 0 0", color: C.muted, fontSize: 13 }}>📍 {mover.county}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: C.bg3, border: `1px solid ${C.border}`,
            borderRadius: 8, width: 32, height: 32,
            color: C.muted, fontSize: 16, cursor: "pointer", flexShrink: 0,
          }}>✕</button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ color: C.text, margin: "0 0 10px" }}>Booking Sent!</h3>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>{success}</p>
            <PrimaryBtn onClick={onClose}>Close</PrimaryBtn>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}
            <Divider label="Your Details" />
            <FieldInput label="Full Name *" placeholder="e.g. John Kamau" value={form.customerName} onChange={e => set("customerName", e.target.value)} />
            <FieldInput label="Phone Number *" placeholder="e.g. 0712 345 678" value={form.customerPhone} onChange={e => set("customerPhone", e.target.value)} />
            <Divider label="Move Details" />
            <FieldSelect label="Service Type *" value={form.serviceType} onChange={e => set("serviceType", e.target.value)}>
              <option value="">Select a service</option>
              {(mover.services?.length ? mover.services : availableServices).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FieldSelect>
            <FieldInput label="Pickup Location *" placeholder="e.g. Kilimani, Wood Avenue, Block B, 4th Floor" value={form.pickupLocation} onChange={e => set("pickupLocation", e.target.value)} />
            <FieldInput label="Destination *" placeholder="e.g. Syokimau, Community Road, House 4" value={form.dropoffLocation} onChange={e => set("dropoffLocation", e.target.value)} />
            <FieldInput label="Preferred Moving Date *" type="date" min={new Date().toISOString().split("T")[0]} value={form.scheduledDate} onChange={e => set("scheduledDate", e.target.value)} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Additional Notes</label>
              <textarea
                style={{ width: "100%", padding: "11px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: font, fontSize: 14, boxSizing: "border-box", minHeight: 90, resize: "vertical" }}
                placeholder="Special items, fragile goods, access notes..."
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
              />
            </div>

            <div style={{ background: C.goldDim, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "11px 14px", fontSize: 12, color: C.gold, lineHeight: 1.7, marginBottom: 20 }}>
              ℹ️ Your request goes directly to <strong>{mover.name}'s</strong> dashboard. They'll call you once they accept. No account needed.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: 12, background: C.green, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: font, opacity: loading ? 0.6 : 1 }}>
                {loading ? "⏳ Sending..." : "📤 Send Booking Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Movers() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { search } = useLocation();

  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [movers, setMovers] = useState([]);
  const [featuredMovers, setFeaturedMovers] = useState([]);
  const [bookingMover, setBookingMover] = useState(null);

  // Check for tab query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tabParam = params.get("tab");
    if (tabParam === "login" || tabParam === "register") {
      setActiveTab(tabParam);
    }
  }, [search]);

  const [registerData, setRegisterData] = useState({
    name: "", email: "", password: "", phone: "", county: "",
    experience: "", vehicleType: "Pickup", services: [],
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
    "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang'a", "Nairobi City", "Nakuru", "Nandi", "Narok", "Nyamira",
    "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River",
    "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
  ];

  const availableServices = [
    "Household Moving", "Office Relocation", "Packing & Unpacking",
    "Furniture Assembly", "Storage Solutions", "Inter-County Moving",
    "Fragile Item Handling", "Piano/Heavy Lift",
  ];

  useEffect(() => {
    if (activeTab !== "search") return;
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch { setMovers([]); } finally { setLoading(false); }
    })();
    (async () => {
      try {
        const res = await API.get("/payment/featured-movers");
        setFeaturedMovers(res.data || []);
      } catch { setFeaturedMovers([]); }
    })();
  }, [selectedCounty, activeTab]);

  const handleServiceToggle = (s) => {
    setRegisterData(p => ({
      ...p,
      services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s],
    }));
  };

  const onRegister = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await API.post("/auth/register", { ...registerData, role: "mover" });
      alert("✅ Application submitted! Once admin approves, you can log in.");
      setActiveTab("login");
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || "Registration failed."}`);
    } finally { setLoading(false); }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoginError(""); setLoginSuccess(""); setLoading(true);
    try {
      const res = await API.post("/auth/login", loginData);
      if (res.data.user.role !== "mover") { setLoginError("❌ This portal is for mover accounts only."); return; }
      login(res.data.token, res.data.user);
      setLoginSuccess("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/mover-dashboard"), 1000);
    } catch { setLoginError("❌ Invalid credentials. Please try again."); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotMsg("❌ Please enter your email."); return; }
    setForgotLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg(res.data?.message || "✅ Reset link sent!");
    } catch { setForgotMsg("❌ Failed to send reset email."); }
    finally { setForgotLoading(false); }
  };

  // ── Shared input handler for nested objects
  const rChange = (key) => (e) => setRegisterData(p => ({ ...p, [key]: e.target.value }));
  const lChange = (key) => (e) => setLoginData(p => ({ ...p, [key]: e.target.value }));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, color: C.text, padding: "120px 20px 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.bg3}; border-radius: 3px; }
        input, select, textarea { outline: none; transition: border-color .2s, box-shadow .2s; }
        input:focus, select:focus, textarea:focus { border-color: ${C.gold} !important; box-shadow: 0 0 0 3px ${C.goldDim} !important; }
        button:disabled { opacity: 0.55 !important; cursor: not-allowed !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:none;} }
        .card-anim { animation: fadeUp .4s ease both; }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .check-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {bookingMover && (
        <BookingModal mover={bookingMover} onClose={() => setBookingMover(null)} availableServices={availableServices} />
      )}

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp .5s ease" }}>
        <div style={{ display: "inline-block", background: C.goldDim, border: `1px solid ${C.gold}44`, borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 18 }}>
          🇰🇪 Kenya's Verified Relocation Network
        </div>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3.4rem)", fontWeight: 900, margin: "0 0 14px", letterSpacing: -1, background: `linear-gradient(135deg,${C.text} 0%,${C.gold} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
          <img src="/movers.png" alt="Axx Movers" style={{ width: "clamp(2.5rem,6vw,3.5rem)", height: "clamp(2.5rem,6vw,3.5rem)", objectFit: "cover", filter: "drop-shadow(0 4px 12px rgba(230,168,23,0.3))", borderRadius: "50%", border: "3px solid rgba(230,168,23,0.3)" }} />
          <span>Axx Movers</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 17, margin: 0 }}>Find trusted movers across all 47 counties — fast, safe, and affordable.</p>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 44, flexWrap: "wrap" }}>
        {[
          { id: "search", label: "🔍 Find a Mover" },
          { id: "register", label: "📝 Join as Mover" },
          { id: "login", label: "🔑 Mover Login" },
        ].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setShowForgot(false); setForgotMsg(""); }}
            style={{
              padding: "10px 22px", borderRadius: 30, fontWeight: 700, cursor: "pointer",
              fontFamily: font, fontSize: 14, transition: "all .2s",
              background: activeTab === t.id ? C.gold : C.bg2,
              color: activeTab === t.id ? "#000" : C.muted,
              border: activeTab === t.id ? "none" : `1px solid ${C.border}`,
              boxShadow: activeTab === t.id ? `0 4px 20px ${C.gold}44` : "none",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ══════════════ SEARCH TAB ══════════════ */}
      {activeTab === "search" && (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Featured */}
          {featuredMovers.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 28, background: C.gold, borderRadius: 2 }} />
                <h2 style={{ margin: 0, color: C.text, fontSize: 22, fontWeight: 800 }}>⭐ Featured Movers</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 22 }}>
                {featuredMovers.map((m, i) => (
                  <div key={m._id} className="card-anim" style={{ animationDelay: `${i * 0.07}s` }}>
                    <MoverCard m={m} onBook={setBookingMover} featured />
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border},transparent)`, margin: "44px 0" }} />
            </div>
          )}

          {/* County filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
            <span style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>Filter by County:</span>
            <select
              value={selectedCounty}
              onChange={e => setSelectedCounty(e.target.value)}
              style={{
                padding: "10px 16px", background: C.bg2,
                border: `1px solid ${C.border}`, borderRadius: 30,
                color: C.text, fontFamily: font, fontSize: 14, cursor: "pointer",
                minWidth: 200,
              }}
            >
              <option value="all">🌍 All Counties</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {selectedCounty !== "all" && (
              <button onClick={() => setSelectedCounty("all")} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: font }}>
                ✕ Clear
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔄</div>
              <p style={{ color: C.muted }}>Searching for movers...</p>
            </div>
          ) : movers.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 22 }}>
              {movers.map((m, i) => (
                <div key={m._id} className="card-anim" style={{ animationDelay: `${i * 0.06}s` }}>
                  <MoverCard m={m} onBook={setBookingMover} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: C.subtle, margin: "0 0 8px" }}>No movers found</h3>
              <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>
                {selectedCounty === "all" ? "No approved movers yet." : `No approved movers in ${selectedCounty} yet.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ REGISTER TAB ══════════════ */}
      {activeTab === "register" && (
        <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp .4s ease" }}>
          <div style={{ background: C.bg1, borderRadius: 28, border: `1px solid ${C.border}`, padding: "40px 36px" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🚛</div>
              <h2 style={{ color: C.text, margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Join as a Mover</h2>
              <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>Register your moving business and reach customers across Kenya</p>
            </div>

            <form onSubmit={onRegister}>
              <Divider label="Business Info" />
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldInput label="Business / Full Name *" required placeholder="e.g. Kamau Movers" value={registerData.name} onChange={rChange("name")} />
                <FieldInput label="Email Address *" required type="email" placeholder="you@example.com" value={registerData.email} onChange={rChange("email")} />
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldInput label="Create Password *" required type="password" placeholder="Min. 8 characters" value={registerData.password} onChange={rChange("password")} />
                <FieldInput label="WhatsApp Number *" required placeholder="254712345678" value={registerData.phone} onChange={rChange("phone")} />
              </div>

              <Divider label="Service Area" />
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldSelect label="County *" required value={registerData.county} onChange={rChange("county")}>
                  <option value="">Select County</option>
                  {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </FieldSelect>
                <FieldInput label="Years of Experience" type="number" placeholder="e.g. 5" value={registerData.experience} onChange={rChange("experience")} />
              </div>
              <FieldSelect label="Primary Vehicle" value={registerData.vehicleType} onChange={rChange("vehicleType")}>
                {["Pickup", "Van", "Lorry", "Motorbike", "Truck"].map(v => <option key={v} value={v}>{v}</option>)}
              </FieldSelect>

              <Divider label="Services Offered" />
              <div className="check-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: C.bg, padding: 16, borderRadius: 12, marginBottom: 24 }}>
                {availableServices.map(s => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: registerData.services.includes(s) ? C.text : C.muted, transition: "color .15s" }}>
                    <input type="checkbox" checked={registerData.services.includes(s)} onChange={() => handleServiceToggle(s)}
                      style={{ accentColor: C.gold, width: 15, height: 15 }} />
                    {s}
                  </label>
                ))}
              </div>

              <PrimaryBtn loading={loading} loadingText="⏳ Submitting...">📤 Submit Application</PrimaryBtn>
              <p onClick={() => setActiveTab("login")} style={{ textAlign: "center", color: C.blue, marginTop: 18, cursor: "pointer", fontSize: 14 }}>
                Already registered? Login here →
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ LOGIN TAB ══════════════ */}
      {activeTab === "login" && (
        <div style={{ maxWidth: 420, margin: "0 auto", animation: "fadeUp .4s ease" }}>
          <div style={{ background: C.bg1, borderRadius: 28, border: `1px solid ${C.border}`, padding: "40px 36px" }}>

            {showForgot ? (
              <form onSubmit={handleForgotPassword}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔏</div>
                  <h2 style={{ color: C.text, margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Reset Password</h2>
                  <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>Enter your email to receive a reset link</p>
                </div>
                {forgotMsg && <Alert type={forgotMsg.includes("❌") ? "error" : "success"}>{forgotMsg}</Alert>}
                <FieldInput label="Registered Email *" required type="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                <PrimaryBtn loading={forgotLoading} loadingText="⏳ Sending...">📧 Send Reset Link</PrimaryBtn>
                <p onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotEmail(""); }}
                  style={{ textAlign: "center", color: C.blue, marginTop: 18, cursor: "pointer", fontSize: 14 }}>← Back to Login</p>
              </form>
            ) : (
              <form onSubmit={onLogin}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
                  <h2 style={{ color: C.text, margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Mover Login</h2>
                  <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>Access your mover dashboard</p>
                </div>
                {loginError && <Alert type="error">{loginError}</Alert>}
                {loginSuccess && <Alert type="success">{loginSuccess}</Alert>}
                <FieldInput label="Email *" required type="email" placeholder="you@example.com" value={loginData.email} onChange={lChange("email")} />
                <div>
                  <FieldInput label="Password *" required type="password" placeholder="••••••••" value={loginData.password} onChange={lChange("password")} />
                  <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}>
                    <span onClick={() => { setShowForgot(true); setLoginError(""); }}
                      style={{ fontSize: 12, color: C.gold, cursor: "pointer", fontWeight: 700 }}>Forgot password?</span>
                  </div>
                </div>
                <PrimaryBtn loading={loading} loadingText="⏳ Verifying..." style={{ marginTop: 8 }}>🚀 Access Dashboard</PrimaryBtn>
                <p onClick={() => setActiveTab("register")}
                  style={{ textAlign: "center", color: C.blue, marginTop: 18, cursor: "pointer", fontSize: 14 }}>New here? Register your business →</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}