import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Movers() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Used purely for mover registration logins

  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("all"); 
  const [movers, setMovers] = useState([]);

  // Anonymous Booking Modal State
  const [bookingMover, setBookingMover] = useState(null); 
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    phone: "",
    serviceType: "",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledDate: "",
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  const counties = [
    "Baringo","Bomet","Bungoma","Busia","Elgeyo Marakwet","Embu","Garissa",
    "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
    "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu",
    "Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa",
    "Murang'a","Nairobi City","Nakuru","Nandi","Narok","Nyamira",
    "Nyandarua","Nyeri","Samburu","Siaya","Taita Taveta","Tana River",
    "Tharaka Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga",
    "Wajir","West Pokot"
  ];

  const availableServices = [
    "Household Moving","Office Relocation","Packing & Unpacking",
    "Furniture Assembly","Storage Solutions","Inter-County Moving",
    "Fragile Item Handling","Piano/Heavy Lift"
  ];

  const [registerData, setRegisterData] = useState({
    name: "", email: "", password: "", phone: "", county: "",
    experience: "", vehicleType: "Pickup", services: []
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    if (activeTab !== "search") return;
    
    const fetchMovers = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch { 
        setMovers([]); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchMovers();
  }, [selectedCounty, activeTab]);

  const handleServiceToggle = (service) => {
    setRegisterData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", { ...registerData, role: "mover" });
      alert("✅ Application Submitted! Once Admin approves your business, you can log in.");
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
      if (res.data.user.role !== "mover") {
        setLoginError("❌ This portal is for Mover accounts only."); return;
      }
      login(res.data.token, res.data.user);
      setLoginSuccess("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/mover-dashboard"), 1000);
    } catch { setLoginError("❌ Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotMsg("❌ Please enter your email."); return; }
    setForgotLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg(res.data?.message || "✅ Reset link sent!");
    } catch { setForgotMsg("❌ Failed to send reset email.");
    } finally { setForgotLoading(false); }
  };

  // ── OPEN BOOKING MODAL FOR EVERYONE (NO LOGIN REQUIRED) ─────────────────
  const openBooking = (mover) => {
    setBookingMover(mover);
    setBookingForm({
      customerName: "",
      phone: "",
      serviceType: mover.services?.[0] || "",
      pickupLocation: "", 
      dropoffLocation: "",
      scheduledDate: "", 
      notes: "", 
    });
    setBookingSuccess(""); 
    setBookingError("");
  };

  const closeBooking = () => {
    setBookingMover(null);
    setBookingSuccess(""); 
    setBookingError("");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.customerName || !bookingForm.phone || !bookingForm.serviceType || 
        !bookingForm.pickupLocation || !bookingForm.dropoffLocation || !bookingForm.scheduledDate) {
      setBookingError("Please fill in all required fields.");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      // Sent completely open over the pipeline without bearer headers
      await API.post("/jobs", {
        moverId: bookingMover._id,
        moverName: bookingMover.name,
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.phone,
        serviceType: bookingForm.serviceType,
        pickupLocation: bookingForm.pickupLocation,
        dropoffLocation: bookingForm.dropoffLocation,
        scheduledDate: bookingForm.scheduledDate,
        notes: bookingForm.notes,
        county: bookingMover.county,
      });
      setBookingSuccess(`✅ Request sent to ${bookingMover.name}! They will view your details on their dashboard.`);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to submit booking. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* ── OPEN BOOKING MODAL ── */}
      {bookingMover && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeBooking()}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>📦 Book {bookingMover.name}</h3>
                <p style={styles.modalSub}>📍 Operating in {bookingMover.county}</p>
              </div>
              <button onClick={closeBooking} style={styles.closeBtn}>✕</button>
            </div>

            {bookingSuccess ? (
              <div style={styles.bookingSuccessBox}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 8px" }}>Booking Submitted!</p>
                <p style={{ color: "#a3b8cc", fontSize: "13px", margin: "0 0 20px" }}>{bookingSuccess}</p>
                <button style={styles.doneBtn} onClick={closeBooking}>Close Panel</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                {bookingError && <div style={styles.errorBox}>{bookingError}</div>}

                <label style={styles.fieldLabel}>Your Full Name *</label>
                <input style={styles.fieldInput} placeholder="Enter your name"
                  value={bookingForm.customerName}
                  onChange={e => setBookingForm(p => ({ ...p, customerName: e.target.value }))} />

                <label style={styles.fieldLabel}>Your Phone Number *</label>
                <input style={styles.fieldInput} placeholder="e.g. 0712345678"
                  value={bookingForm.phone}
                  onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))} />

                <label style={styles.fieldLabel}>Service Requirement *</label>
                <select style={styles.fieldInput}
                  value={bookingForm.serviceType}
                  onChange={e => setBookingForm(p => ({ ...p, serviceType: e.target.value }))}>
                  <option value="">Select service</option>
                  {(bookingMover.services || availableServices).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label style={styles.fieldLabel}>Pickup Location Address *</label>
                <input style={styles.fieldInput} placeholder="e.g. Kilimani, Wood Avenue, Block B, Room 4"
                  value={bookingForm.pickupLocation}
                  onChange={e => setBookingForm(p => ({ ...p, pickupLocation: e.target.value }))} />

                <label style={styles.fieldLabel}>Drop-off Location Address *</label>
                <input style={styles.fieldInput} placeholder="e.g. Syokimau, Community Rd, House 12"
                  value={bookingForm.dropoffLocation}
                  onChange={e => setBookingForm(p => ({ ...p, dropoffLocation: e.target.value }))} />

                <label style={styles.fieldLabel}>Moving Date *</label>
                <input style={styles.fieldInput} type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingForm.scheduledDate}
                  onChange={e => setBookingForm(p => ({ ...p, scheduledDate: e.target.value }))} />

                <label style={styles.fieldLabel}>Move Instructions / Special Details</label>
                <textarea style={{ ...styles.fieldInput, minHeight: "80px", resize: "vertical" }}
                  placeholder="List heavy items, fragile boxes, or specific guidelines here..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm(p => ({ ...p, notes: e.target.value }))} />

                <div style={styles.modalNote}>
                  <span>ℹ️</span>
                  <span>Your details will be written directly to the mover's pipeline log dashboard.</span>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button type="button" onClick={closeBooking} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" disabled={bookingLoading} style={styles.sendBtn}>
                    {bookingLoading ? "⏳ Sending Request..." : "📤 Submit Booking Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Axx Movers</h1>
        <p style={styles.subtitle}>Kenya's Verified Relocation Network</p>
      </div>

      <div style={styles.tabBar}>
        <button style={activeTab === "search" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("search")}>🔍 Find Mover</button>
        <button style={activeTab === "register" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("register")}>📝 Join Us</button>
        <button style={activeTab === "login" ? styles.activeTab : styles.tab} onClick={() => { setActiveTab("login"); setShowForgot(false); setForgotMsg(""); }}>🔑 Mover Login</button>
      </div>

      {/* ── SEARCH TAB ── */}
      {activeTab === "search" && (
        <div style={styles.viewContainer}>
          <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} style={styles.select}>
            <option value="all">🌍 All Counties</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {loading ? (
            <p style={styles.centerText}>Searching database...</p>
          ) : (
            <div style={styles.grid}>
              {movers.length > 0 ? movers.map(m => (
                <div key={m._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.moverName}>{m.name}</h3>
                    <span style={styles.verifiedBadge}>✅ Verified</span>
                  </div>
                  <p style={styles.detail}>📍 {m.county} • ⭐ {m.experience || m.experienceYears} yrs exp</p>
                  {m.bio && <p style={{ ...styles.detail, fontStyle: "italic", marginTop: "8px" }}>"{m.bio}"</p>}
                  <div style={styles.tagContainer}>
                    {m.services?.map(s => <span key={s} style={styles.miniTag}>{s}</span>)}
                  </div>

                  <div style={styles.actionCluster}>
                    <button onClick={() => openBooking(m)} style={styles.bookBtn}>
                      📋 Book Mover
                    </button>
                    <button onClick={() => window.open(`tel:${m.phone}`)} style={styles.callBtn}>
                      📞 Call
                    </button>
                    <button onClick={() => window.open(`https://wa.me/${m.phone}`, "_blank")} style={styles.whatsappBtn}>
                      💬 WA
                    </button>
                  </div>
                </div>
              )) : (
                <p style={styles.centerText}>
                  {selectedCounty === "all" ? "No approved movers found anywhere yet." : `No approved movers in ${selectedCounty} yet.`}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── REGISTER TAB ── */}
      {activeTab === "register" && (
        <div style={styles.formCard}>
          <form onSubmit={onRegister}>
            <h2 style={styles.formTitle}>🚚 Mover Registration</h2>
            <p style={styles.formSubtitle}>Join our network of verified movers</p>
            <div style={styles.formGrid}>
              <input required placeholder="Business/Full Name" style={styles.input} value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" style={styles.input} value={registerData.email} onChange={e => setRegisterData({...registerData, email: e.target.value})} />
            </div>
            <div style={styles.formGrid}>
              <input required type="password" placeholder="Create Password" style={styles.input} value={registerData.password} onChange={e => setRegisterData({...registerData, password: e.target.value})} />
              <input required placeholder="WhatsApp Phone (254712345678)" style={styles.input} value={registerData.phone} onChange={e => setRegisterData({...registerData, phone: e.target.value})} />
            </div>
            <div style={styles.formGrid}>
              <select required style={styles.input} value={registerData.county} onChange={e => setRegisterData({...registerData, county: e.target.value})}>
                <option value="">Select County</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Experience (Years)" style={styles.input} value={registerData.experience} onChange={e => setRegisterData({...registerData, experience: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>🚚 Services Provided:</label>
              <div style={styles.checkGrid}>
                {availableServices.map(s => (
                  <label key={s} style={styles.checkItem}>
                    <input type="checkbox" checked={registerData.services.includes(s)} onChange={() => handleServiceToggle(s)} /> {s}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "⏳ Processing..." : "📤 Submit Application"}</button>
            <p style={styles.switchText} onClick={() => setActiveTab("login")}>Already registered? Login here</p>
          </form>
        </div>
      )}

      {/* ── LOGIN TAB ── */}
      {activeTab === "login" && (
        <div style={styles.loginSmallCard}>
          {showForgot ? (
            <form onSubmit={handleForgotPassword}>
              <h2 style={styles.formTitle}>🔐 Reset Password</h2>
              <p style={styles.formSubtitle}>Enter your email to receive a reset link</p>
              {forgotMsg && <div style={forgotMsg.includes("❌") ? styles.errorBox : styles.successBox}>{forgotMsg}</div>}
              <input required type="email" placeholder="Enter your registered email" style={styles.input} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              <button type="submit" disabled={forgotLoading} style={{ ...styles.submitBtn, opacity: forgotLoading ? 0.7 : 1 }}>
                {forgotLoading ? "⏳ Sending..." : "📧 Send Reset Link"}
              </button>
              <p style={styles.switchText} onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotEmail(""); }}>← Back to Login</p>
            </form>
          ) : (
            <form onSubmit={onLogin}>
              <h2 style={styles.formTitle}>🔐 Mover Login</h2>
              <p style={styles.formSubtitle}>Access your dashboard</p>
              {loginError && <div style={styles.errorBox}>{loginError}</div>}
              {loginSuccess && <div style={styles.successBox}>{loginSuccess}</div>}
              <input required type="email" placeholder="Email" style={styles.input} value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
              <div style={{ position: "relative" }}>
                <input required type="password" placeholder="Password" style={{ ...styles.input, marginBottom: "6px" }} value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                <span style={styles.forgotLink} onClick={() => { setShowForgot(true); setLoginError(""); }}>Forgot password?</span>
              </div>
              <button type="submit" disabled={loading} style={{ ...styles.submitBtn, marginTop: "20px", opacity: loading ? 0.7 : 1 }}>
                {loading ? "⏳ Verifying..." : "🚀 Access Dashboard"}
              </button>
              <p style={styles.switchText} onClick={() => setActiveTab("register")}>New here? Register your business</p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#06101f", minHeight: "100vh", padding: "120px 20px 60px", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "2.5rem", color: "#fbbf24", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "10px" },
  tabBar: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px", flexWrap: "wrap" },
  tab: { padding: "10px 20px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "20px", cursor: "pointer" },
  activeTab: { padding: "10px 20px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "20px", fontWeight: "bold" },
  viewContainer: { maxWidth: "1200px", margin: "0 auto" },
  select: { display: "block", width: "100%", maxWidth: "400px", margin: "0 auto 40px", padding: "15px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "12px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" },
  card: { background: "#111827", padding: "25px", borderRadius: "20px", border: "1px solid #1f2937", display: "flex", flexDirection: "column" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  moverName: { color: "#fbbf24", margin: 0, fontSize: "1.3rem" },
  verifiedBadge: { background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 },
  detail: { color: "#94a3b8", margin: "5px 0", fontSize: "0.9rem" },
  tagContainer: { display: "flex", flexWrap: "wrap", gap: "6px", margin: "12px 0 16px" },
  miniTag: { background: "#1e293b", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "#cbd5e1" },
  actionCluster: { display: "flex", gap: "8px", marginTop: "auto", paddingTop: "10px" },
  bookBtn: { flex: 2, padding: "11px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  callBtn: { flex: 1, padding: "11px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", textAlign: "center" },
  whatsappBtn: { flex: 1, padding: "11px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "#111827", borderRadius: "24px", border: "1px solid #334155", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "32px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  modalTitle: { color: "#fbbf24", margin: "0 0 4px", fontSize: "1.4rem" },
  modalSub: { color: "#94a3b8", margin: 0, fontSize: "13px" },
  closeBtn: { background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer", padding: "0 0 0 12px" },
  fieldLabel: { display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  fieldInput: { width: "100%", padding: "12px 14px", background: "#06101f", border: "1px solid #334155", borderRadius: "10px", color: "#fff", boxSizing: "border-box", marginBottom: "18px", fontFamily: "inherit", fontSize: "14px" },
  modalNote: { display: "flex", gap: "8px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#fde047" },
  bookingSuccessBox: { textAlign: "center", padding: "30px 10px" },
  doneBtn: { padding: "12px 32px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px" },
  cancelBtn: { flex: 1, padding: "12px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "10px", fontWeight: 600, cursor: "pointer" },
  sendBtn: { flex: 2, padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px" },
  formCard: { maxWidth: "700px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "25px", border: "1px solid #334155" },
  loginSmallCard: { maxWidth: "400px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "25px", border: "1px solid #334155" },
  formTitle: { color: "#fbbf24", textAlign: "center", marginBottom: "10px", fontSize: "1.5rem" },
  formSubtitle: { color: "#94a3b8", textAlign: "center", marginBottom: "30px", fontSize: "0.9rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
  input: { width: "100%", padding: "12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", boxSizing: "border-box", marginBottom: "15px", fontFamily: "inherit" },
  label: { fontSize: "0.9rem", color: "#94a3b8", marginBottom: "10px", display: "block" },
  inputGroup: { marginBottom: "20px" },
  checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#0f172a", padding: "15px", borderRadius: "10px" },
  checkItem: { fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  submitBtn: { width: "100%", padding: "14px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  switchText: { textAlign: "center", color: "#3b82f6", marginTop: "20px", cursor: "pointer", fontSize: "0.9rem" },
  centerText: { textAlign: "center", color: "#94a3b8", marginTop: "40px" },
  forgotLink: { display: "block", textAlign: "right", fontSize: "12px", color: "#fbbf24", cursor: "pointer", fontWeight: 600, marginBottom: "5px" },
  errorBox: { background: "#3b0a0a", color: "#fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
  successBox: { background: "#052e16", color: "#86efac", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
};