import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = ["Hotel", "Beach Resort", "Mountain Lodge", "Theme Park", "Camping Grounds", "Restaurant", "Entertainment Venue", "Spa & Wellness Center", "Adventure Tours", "Water Sports Operator"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Nyeri", "Laikipia", "Kajiado", "Narok", "Kwale", "Kilifi", "Taita-Taveta", "Lamu", "Tana River"];
const amenitiesList = ["Swimming Pool", "WiFi", "Restaurant", "Spa", "Gym", "Parking", "Bar", "Conference Room", "Game Drives", "Beach Access", "Kids Club", "Airport Transfer", "Room Service", "Laundry", "Water Sports"];

const steps = ["Basic Info", "Location", "Amenities", "Pricing", "Contact", "Review"];

export default function RegisterPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "", category: "", description: "",
    county: "", town: "", address: "", mapLink: "",
    amenities: [],
    basePrice: "", weekendPrice: "", seasonalPrice: "",
    roomTypes: [{ name: "", price: "", guests: "" }],
    checkIn: "14:00", checkOut: "11:00", cancellation: "48",
    managerName: "", phone: "", email: "", whatsapp: "",
    agreeTerms: false,
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };
  const addRoomType = () => setForm((f) => ({ ...f, roomTypes: [...f.roomTypes, { name: "", price: "", guests: "" }] }));
  const updateRoom = (i, field, val) => setForm((f) => {
    const rt = [...f.roomTypes]; rt[i] = { ...rt[i], [field]: val }; return { ...f, roomTypes: rt };
  });

  const canNext = () => {
    if (step === 0) return form.name && form.category && form.description;
    if (step === 1) return form.county && form.town;
    if (step === 2) return form.amenities.length > 0;
    if (step === 3) return form.basePrice;
    if (step === 4) return form.managerName && form.phone && form.email;
    return true;
  };

  const handleSubmit = () => { if (form.agreeTerms) setSubmitted(true); };

  if (submitted) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "520px", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>Property Submitted!</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "24px" }}>
            <strong>{form.name}</strong> has been submitted for review. Our team will verify your listing within 24 hours and contact you at <strong>{form.email}</strong>.
          </p>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "28px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700, marginBottom: "8px" }}>What Happens Next?</div>
            {["Our team reviews your submission (24hrs)", "We verify property details & contact you", "Your listing goes live on Axx Spaces", "Start receiving booking requests"].map((s, i) => (
              <div key={s} style={{ fontSize: "13px", color: "#15803d", padding: "4px 0" }}>{i + 1}. {s}</div>
            ))}
          </div>
          <button style={{ background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px 32px", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/tourism")}>
            Browse Tourism →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate("/tourism")}>← Back</button>
        <div style={s.headerCenter}>
          <h1 style={s.headerTitle}>List Your Property</h1>
          <p style={s.headerSub}>Join Kenya's #1 tourism marketplace — free to list</p>
        </div>
        <div style={s.stepCount}>Step {step + 1} of {steps.length}</div>
      </div>

      {/* PROGRESS */}
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div style={s.layout}>
        {/* STEP NAV */}
        <aside style={s.stepNav}>
          {steps.map((st, i) => (
            <div key={st} style={{ ...s.stepItem, ...(i === step ? s.stepActive : {}), ...(i < step ? s.stepDone : {}) }}>
              <div style={{ ...s.stepDot, ...(i === step ? { background: "#fbbf24", color: "#1f2937" } : i < step ? { background: "#22c55e", color: "white" } : {}) }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={s.stepLabel}>{st}</span>
            </div>
          ))}
        </aside>

        {/* FORM BODY */}
        <main style={s.formBody}>
          <div style={s.formCard}>

            {/* STEP 0 — BASIC INFO */}
            {step === 0 && (
              <div>
                <h2 style={s.formTitle}>Basic Information</h2>
                <p style={s.formSub}>Tell us about your property</p>
                <div style={s.field}>
                  <label style={s.label}>Property Name *</label>
                  <input style={s.input} placeholder="e.g. Sunrise Beach Hotel" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Category *</label>
                  <select style={s.input} value={form.category} onChange={(e) => update("category", e.target.value)}>
                    <option value="">Select category...</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description *</label>
                  <textarea style={{ ...s.input, height: "140px", resize: "vertical" }} placeholder="Describe your property..." value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 1 — LOCATION */}
            {step === 1 && (
              <div>
                <h2 style={s.formTitle}>Location Details</h2>
                <p style={s.formSub}>Help guests find you</p>
                <div style={s.twoCol}>
                  <div style={s.field}>
                    <label style={s.label}>County *</label>
                    <select style={s.input} value={form.county} onChange={(e) => update("county", e.target.value)}>
                      <option value="">Select county...</option>
                      {counties.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Town / Area *</label>
                    <input style={s.input} placeholder="e.g. Diani, Westlands, Nyali" value={form.town} onChange={(e) => update("town", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Physical Address</label>
                  <input style={s.input} placeholder="Street address or landmark" value={form.address} onChange={(e) => update("address", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Google Maps Link (optional)</label>
                  <input style={s.input} placeholder="https://maps.google.com/..." value={form.mapLink} onChange={(e) => update("mapLink", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 2 — AMENITIES */}
            {step === 2 && (
              <div>
                <h2 style={s.formTitle}>Amenities & Features</h2>
                <p style={s.formSub}>Select everything your property offers</p>
                <div style={s.amenitiesGrid}>
                  {amenitiesList.map((a) => (
                    <button
                      key={a}
                      style={{ ...s.amenityBtn, ...(form.amenities.includes(a) ? s.amenityActive : {}) }}
                      onClick={() => toggleAmenity(a)}
                    >
                      {form.amenities.includes(a) ? "✓ " : ""}{a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3 — PRICING */}
            {step === 3 && (
              <div>
                <h2 style={s.formTitle}>Pricing & Room Types</h2>
                <p style={s.formSub}>Set your rates (KSh per night)</p>
                <div style={s.twoCol}>
                  <div style={s.field}>
                    <label style={s.label}>Base Price per Night (KSh) *</label>
                    <input style={s.input} type="number" placeholder="e.g. 8500" value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Weekend Price (KSh)</label>
                    <input style={s.input} type="number" placeholder="e.g. 12000" value={form.weekendPrice} onChange={(e) => update("weekendPrice", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Peak Season Price (KSh)</label>
                  <input style={s.input} type="number" placeholder="e.g. 18000" value={form.seasonalPrice} onChange={(e) => update("seasonalPrice", e.target.value)} />
                </div>

                <div style={s.sectionBreak}>Room Types</div>
                {form.roomTypes.map((r, i) => (
                  <div key={i} style={s.roomRow}>
                    <input style={{ ...s.input, flex: 2 }} placeholder="Room type name" value={r.name} onChange={(e) => updateRoom(i, "name", e.target.value)} />
                    <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Price (KSh)" value={r.price} onChange={(e) => updateRoom(i, "price", e.target.value)} />
                    <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Max guests" value={r.guests} onChange={(e) => updateRoom(i, "guests", e.target.value)} />
                  </div>
                ))}
                <button style={s.addRoomBtn} onClick={addRoomType}>+ Add Room Type</button>
              </div>
            )}

            {/* STEP 4 — CONTACT */}
            {step === 4 && (
              <div>
                <h2 style={s.formTitle}>Contact Information</h2>
                <p style={s.formSub}>How guests and our team will reach you</p>
                <div style={s.field}>
                  <label style={s.label}>Manager / Contact Name *</label>
                  <input style={s.input} placeholder="Full name" value={form.managerName} onChange={(e) => update("managerName", e.target.value)} />
                </div>
                <div style={s.twoCol}>
                  <div style={s.field}>
                    <label style={s.label}>Phone Number *</label>
                    <input style={s.input} placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>WhatsApp Number</label>
                    <input style={s.input} placeholder="+254 7XX XXX XXX" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address *</label>
                  <input style={s.input} type="email" placeholder="reservations@yourproperty.co.ke" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 5 — REVIEW */}
            {step === 5 && (
              <div>
                <h2 style={s.formTitle}>Review & Submit</h2>
                <p style={s.formSub}>Check your details before submitting</p>
                <div style={s.reviewGrid}>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Property Name</div><div style={s.reviewVal}>{form.name || "—"}</div></div>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Category</div><div style={s.reviewVal}>{form.category || "—"}</div></div>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Location</div><div style={s.reviewVal}>{form.town ? `${form.town}, ${form.county}` : "—"}</div></div>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Base Price</div><div style={s.reviewVal}>{form.basePrice ? `KSh ${Number(form.basePrice).toLocaleString()}/night` : "—"}</div></div>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Amenities</div><div style={s.reviewVal}>{form.amenities.length > 0 ? form.amenities.join(", ") : "—"}</div></div>
                  <div style={s.reviewItem}><div style={s.reviewKey}>Contact</div><div style={s.reviewVal}>{form.managerName} · {form.phone}</div></div>
                </div>
                <div style={s.commissionBox}>
                  <div style={s.commissionTitle}>📊 Commission Structure</div>
                  <p style={s.commissionText}>
                    Axx Spaces charges a <strong>10–15% commission</strong> per confirmed booking.
                  </p>
                </div>
                <label style={s.checkboxRow}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} style={{ marginRight: "10px" }} />
                  I agree to the Axx Spaces Terms & Conditions
                </label>
              </div>
            )}

            {/* NAV BUTTONS */}
            <div style={s.navBtns}>
              {step > 0 && (
                <button style={s.prevBtn} onClick={() => setStep((s) => s - 1)}>← Previous</button>
              )}
              {step < steps.length - 1 ? (
                <button style={{ ...s.nextBtn, opacity: canNext() ? 1 : 0.5 }} onClick={() => canNext() && setStep((s) => s + 1)}>
                  Next Step →
                </button>
              ) : (
                <button style={{ ...s.nextBtn, opacity: form.agreeTerms ? 1 : 0.5 }} onClick={handleSubmit}>
                  Submit Property 🚀
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh" },
  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" },
  backBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" },
  headerCenter: { textAlign: "center" },
  headerTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937" },
  headerSub: { fontSize: "13px", color: "#6b7280" },
  stepCount: { fontSize: "13px", color: "#9ca3af", fontWeight: 600, textAlign: "center" },

  progressBar: { height: "4px", background: "#e5e7eb" },
  progressFill: { height: "100%", background: "#fbbf24", transition: "width 0.4s ease" },

  layout: { padding: "20px", display: "flex", flexDirection: "column", gap: "24px" },
  stepNav: { display: "flex", overflowX: "auto", gap: "12px", padding: "8px 0" },
  stepItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", minWidth: "150px", flexShrink: 0 },
  stepDot: { width: "28px", height: "28px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 },
  stepLabel: { fontSize: "13px", fontWeight: 600, color: "#4b5563" },

  formBody: {},
  formCard: { background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb" },
  formTitle: { fontSize: "22px", fontWeight: 800, color: "#1f2937", marginBottom: "6px" },
  formSub: { fontSize: "14px", color: "#6b7280", marginBottom: "28px" },

  field: { marginBottom: "18px" },
  label: { display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", outline: "none" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr", gap: "16px" },

  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", marginBottom: "24px" },
  amenityBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", cursor: "pointer" },
  amenityActive: { background: "#fef9c3", borderColor: "#fbbf24", fontWeight: 700 },

  sectionBreak: { fontSize: "13px", fontWeight: 700, color: "#6b7280", margin: "20px 0 10px" },
  roomRow: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" },
  addRoomBtn: { background: "transparent", border: "1px dashed #fbbf24", color: "#fbbf24", borderRadius: "8px", padding: "12px", fontWeight: 700, width: "100%" },

  reviewGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "24px" },
  reviewItem: { background: "#f9fafb", borderRadius: "10px", padding: "14px" },
  reviewKey: { fontSize: "11px", fontWeight: 700, color: "#9ca3af" },
  reviewVal: { fontSize: "14px", color: "#1f2937", fontWeight: 600 },

  commissionBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", marginBottom: "20px" },
  commissionTitle: { fontSize: "14px", fontWeight: 800, color: "#92400e" },
  commissionText: { fontSize: "13px", color: "#78350f" },
  checkboxRow: { display: "flex", alignItems: "flex-start", cursor: "pointer", fontSize: "14px" },

  navBtns: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px" },
  prevBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", fontWeight: 700 },
  nextBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px", fontWeight: 800 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @media (min-width: 769px) {
    [style*="flexDirection: column"] { flex-direction: row !important; }
    [style*="gridTemplateColumns: 1fr"] { grid-template-columns: 1fr 1fr !important; }
  }
`;