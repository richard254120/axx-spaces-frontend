import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerTourismProperty } from "../../api/tourism";

const categories = ["Hotel", "Beach Resort", "Mountain Lodge", "Safari Camp", "Camping Grounds", "Boutique Hotel", "Restaurant", "Eco Lodge", "Spa & Wellness Centre", "Adventure Tours", "Water Sports Operator", "Theme Park"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Laikipia", "Kajiado", "Narok", "Kwale", "Kilifi", "Taita-Taveta", "Lamu", "Nyeri", "Samburu", "Isiolo", "Machakos", "Makueni", "Kitui", "Embu", "Tana River", "Malindi", "Marsabit"];
const amenitiesList = ["Swimming Pool", "WiFi", "Restaurant", "Spa", "Gym", "Parking", "Bar", "Conference Room", "Game Drives", "Beach Access", "Kids Club", "Airport Transfer", "Room Service", "Laundry", "Water Sports", "Horse Riding", "Helicopter Pad", "Tennis Court", "Stargazing Deck", "Nature Trails"];

const steps = ["Account", "Property", "Location", "Amenities", "Pricing & Booking", "Review"];
const stepIcons = ["👤", "🏷️", "📍", "✨", "💰", "✅"];

const packages = [
  { name: "Starter", duration: "1 Month", price: 2500, color: "#6b7280", desc: "1 listing, basic analytics, email support" },
  { name: "Growth", duration: "3 Months", price: 6000, color: "#0ea5e9", desc: "Up to 3 listings, full analytics, priority support, featured placement", popular: true },
  { name: "Premium", duration: "6 Months", price: 10000, color: "#fbbf24", desc: "Unlimited listings, homepage slot, dedicated account manager, social media campaign" },
];

export default function RegisterPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    // Account
    ownerName: "", ownerEmail: "", ownerPhone: "", password: "", selectedPackage: "",
    // Property
    name: "", category: "", description: "",
    // Location
    county: "", town: "", address: "", mapLink: "",
    // Amenities
    amenities: [],
    // Pricing & Booking
    basePrice: "", weekendPrice: "", peakPrice: "",
    roomTypes: [{ name: "", price: "", guests: "" }],
    checkIn: "14:00", checkOut: "11:00", cancellation: "48",
    bookingUrl: "", // Owner's own booking site (the key new field)
    // Contact
    managerName: "", phone: "", email: "", whatsapp: "",
    agreeTerms: false,
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (a) => setForm((f) => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
  }));
  const addRoomType = () => setForm((f) => ({ ...f, roomTypes: [...f.roomTypes, { name: "", price: "", guests: "" }] }));
  const updateRoom = (i, field, val) => setForm((f) => {
    const rt = [...f.roomTypes]; rt[i] = { ...rt[i], [field]: val }; return { ...f, roomTypes: rt };
  });
  const removeRoom = (i) => setForm((f) => ({ ...f, roomTypes: f.roomTypes.filter((_, idx) => idx !== i) }));

  const canNext = () => {
    if (step === 0) return form.ownerName && form.ownerEmail && form.ownerPhone && form.password && form.selectedPackage;
    if (step === 1) return form.name && form.category && form.description;
    if (step === 2) return form.county && form.town;
    if (step === 3) return form.amenities.length > 0;
    if (step === 4) return form.basePrice;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.agreeTerms || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await registerTourismProperty(form);
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("tourismUser", JSON.stringify(result.user));
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const pkg = packages.find((p) => p.name === form.selectedPackage) || packages[0];
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "36px 24px", textAlign: "center", maxWidth: "520px", width: "100%", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" }}>Property Submitted!</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "20px", fontSize: "14px" }}>
            <strong>{form.name}</strong> has been submitted for review under the <strong style={{ color: pkg.color }}>{pkg.name}</strong> plan. Our team will verify within 24 hours and contact you at <strong>{form.ownerEmail}</strong>.
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" }}>📊 Your Plan: {pkg.name} — KSh {pkg.price.toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: "#78350f" }}>Duration: {pkg.duration} · Payment link will be sent to your email.</div>
          </div>
          {form.bookingUrl && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "20px", textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>🔗 Booking Site Registered</div>
              <div style={{ fontSize: "12px", color: "#15803d" }}>Guests will be redirected to: {form.bookingUrl}</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button style={{ background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/tourism/dashboard")}>
              Go to Dashboard →
            </button>
            <button style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563" }} onClick={() => navigate("/tourism")}>
              Browse Tourism
            </button>
          </div>
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
          <div style={s.logo}><span style={s.logoAccent}>AXX</span><span style={s.logoWord}>SPACE</span></div>
          <p style={s.headerSub}>List Your Property — Step {step + 1} of {steps.length}</p>
        </div>
        <div style={s.stepCount}>Step {step + 1}/{steps.length}</div>
      </div>

      {/* PROGRESS */}
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="reg-layout">
        {/* STEP NAV */}
        <aside className="step-nav-desktop">
          {steps.map((st, i) => (
            <div
              key={st}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", marginBottom: "4px", background: i === step ? "#fef9c3" : "transparent", cursor: i < step ? "pointer" : "default", opacity: i > step ? 0.5 : 1 }}
              onClick={() => { if (i < step) setStep(i); }}
            >
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i < step ? "#22c55e" : i === step ? "#fbbf24" : "#e5e7eb", color: i < step || i === step ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: i === step ? "#92400e" : "#4b5563" }}>{st}</span>
            </div>
          ))}
        </aside>

        <main>
          <div style={s.formCard}>

            {/* STEP 0 — ACCOUNT & PACKAGE */}
            {step === 0 && (
              <div>
                <h2 style={s.formTitle}>👤 Your Account Details</h2>
                <p style={s.formSub}>Create your AXXSpace owner account and choose an advertising plan</p>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>Full Name *</label>
                    <input style={s.input} placeholder="Your full name" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Phone / WhatsApp *</label>
                    <input style={s.input} placeholder="+254 7XX XXX XXX" value={form.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address *</label>
                  <input style={s.input} type="email" placeholder="you@yourbusiness.co.ke" value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Create Password *</label>
                  <input style={s.input} type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} />
                </div>

                {/* PACKAGE SELECTION */}
                <div style={s.pkgSection}>
                  <div style={s.pkgTitle}>📦 Choose Your Advertising Package</div>
                  <div className="pkg-grid">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.name}
                        style={{ ...s.pkgCard, ...(form.selectedPackage === pkg.name ? { borderColor: pkg.color, background: pkg.color + "08" } : {}) }}
                        onClick={() => update("selectedPackage", pkg.name)}
                      >
                        {pkg.popular && <div style={{ ...s.pkgBadge, background: pkg.color }}>⭐ Popular</div>}
                        <div style={{ fontSize: "16px", fontWeight: 800, color: pkg.color, marginBottom: "2px" }}>{pkg.name}</div>
                        <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>{pkg.duration}</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#1f2937", marginBottom: "8px" }}>KSh {pkg.price.toLocaleString()}</div>
                        <div style={{ fontSize: "12px", color: "#4b5563", lineHeight: 1.5 }}>{pkg.desc}</div>
                        {form.selectedPackage === pkg.name && <div style={{ marginTop: "10px", color: pkg.color, fontSize: "12px", fontWeight: 800 }}>✓ Selected</div>}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "10px" }}>💳 Payment link will be emailed after submission. 7-day free trial included.</p>
                </div>
              </div>
            )}

            {/* STEP 1 — PROPERTY INFO */}
            {step === 1 && (
              <div>
                <h2 style={s.formTitle}>🏷️ Property Information</h2>
                <p style={s.formSub}>Tell guests what makes your property special</p>
                <div style={s.field}>
                  <label style={s.label}>Property Name *</label>
                  <input style={s.input} placeholder="e.g. Sunrise Beach Resort" value={form.name} onChange={(e) => update("name", e.target.value)} />
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
                  <textarea style={{ ...s.input, height: "140px", resize: "vertical" }} placeholder="Describe your property, unique features, nearby attractions, experiences offered..." value={form.description} onChange={(e) => update("description", e.target.value)} />
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>{form.description.length}/500 characters recommended</div>
                </div>
              </div>
            )}

            {/* STEP 2 — LOCATION */}
            {step === 2 && (
              <div>
                <h2 style={s.formTitle}>📍 Location Details</h2>
                <p style={s.formSub}>Help guests find you</p>
                <div className="two-col-form">
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
                  <label style={s.label}>Physical Address / Landmark</label>
                  <input style={s.input} placeholder="e.g. Off Mombasa-Malindi Road, next to Kenya Wildlife Service gate" value={form.address} onChange={(e) => update("address", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Google Maps Link (optional)</label>
                  <input style={s.input} placeholder="https://maps.google.com/..." value={form.mapLink} onChange={(e) => update("mapLink", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 3 — AMENITIES */}
            {step === 3 && (
              <div>
                <h2 style={s.formTitle}>✨ Amenities & Features</h2>
                <p style={s.formSub}>Select everything your property offers — this helps guests discover you</p>
                <div className="amenities-grid">
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
                <div style={s.field}>
                  <label style={s.label}>Other Amenities (comma-separated)</label>
                  <input style={s.input} placeholder="e.g. Helicopter pad, Private beach, Rooftop terrace, Nightclub" />
                </div>
                {form.amenities.length === 0 && <div style={s.validationHint}>⚠️ Please select at least one amenity to continue</div>}
              </div>
            )}

            {/* STEP 4 — PRICING & BOOKING URL */}
            {step === 4 && (
              <div>
                <h2 style={s.formTitle}>💰 Pricing, Rooms & Booking</h2>
                <p style={s.formSub}>Set your rates and add your existing booking site link</p>

                {/* BOOKING URL — KEY FEATURE */}
                <div style={s.bookingUrlBox}>
                  <div style={s.bookingUrlTitle}>🔗 Your Booking Website (Optional but Recommended)</div>
                  <p style={s.bookingUrlSub}>
                    Already have your own booking site? Add the link here. When guests click "Book Now" on AXXSpace, they'll be redirected directly to your booking site. No commission on bookings — we just advertise for you.
                  </p>
                  <div style={s.field}>
                    <label style={s.label}>Your Booking Site URL</label>
                    <input style={s.input} type="url" placeholder="https://www.yourproperty.com/book or https://booking.com/your-property" value={form.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} />
                  </div>
                  {form.bookingUrl && (
                    <div style={{ fontSize: "12px", color: "#15803d", background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                      ✓ Guests will be redirected to: <strong>{form.bookingUrl}</strong>
                    </div>
                  )}
                  {!form.bookingUrl && (
                    <div style={{ fontSize: "12px", color: "#92400e", background: "#fffbeb", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                      ℹ️ No booking URL? Guests will use your contact details (phone, email, WhatsApp) to enquire.
                    </div>
                  )}
                </div>

                <div style={s.sectionBreak}>Base Pricing</div>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>Base Price / Night (KSh) *</label>
                    <input style={s.input} type="number" placeholder="e.g. 8500" value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Weekend Price (KSh)</label>
                    <input style={s.input} type="number" placeholder="e.g. 12000" value={form.weekendPrice} onChange={(e) => update("weekendPrice", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Peak Season Price (KSh)</label>
                  <input style={s.input} type="number" placeholder="e.g. 18000 (Dec, Jul-Aug)" value={form.peakPrice} onChange={(e) => update("peakPrice", e.target.value)} />
                </div>

                <div style={s.sectionBreak}>Room Types (optional)</div>
                {form.roomTypes.map((r, i) => (
                  <div key={i} className="room-row">
                    <input style={{ ...s.input, flex: 2 }} placeholder="Room type name (e.g. Deluxe Suite)" value={r.name} onChange={(e) => updateRoom(i, "name", e.target.value)} />
                    <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Price KSh" value={r.price} onChange={(e) => updateRoom(i, "price", e.target.value)} />
                    <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Max guests" value={r.guests} onChange={(e) => updateRoom(i, "guests", e.target.value)} />
                    {form.roomTypes.length > 1 && <button style={s.removeRoomBtn} onClick={() => removeRoom(i)}>✕</button>}
                  </div>
                ))}
                <button style={s.addRoomBtn} onClick={addRoomType}>+ Add Room Type</button>

                <div style={s.sectionBreak}>Check-in / Check-out</div>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>Check-in Time</label>
                    <input style={s.input} type="time" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Check-out Time</label>
                    <input style={s.input} type="time" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Free Cancellation Window</label>
                  <select style={s.input} value={form.cancellation} onChange={(e) => update("cancellation", e.target.value)}>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="7days">7 days</option>
                    <option value="0">Non-refundable</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 5 — REVIEW */}
            {step === 5 && (
              <div>
                <h2 style={s.formTitle}>✅ Review & Submit</h2>
                <p style={s.formSub}>Confirm your details before going live</p>
                <div className="review-grid">
                  {[
                    ["Property Name", form.name || "—"],
                    ["Category", form.category || "—"],
                    ["Location", form.town ? `${form.town}, ${form.county}` : "—"],
                    ["Base Price", form.basePrice ? `KSh ${Number(form.basePrice).toLocaleString()}/night` : "—"],
                    ["Amenities", form.amenities.length > 0 ? `${form.amenities.length} selected` : "—"],
                    ["Booking URL", form.bookingUrl || "Guests will contact you directly"],
                    ["Plan", form.selectedPackage ? `${form.selectedPackage} (${packages.find((p) => p.name === form.selectedPackage)?.duration})` : "—"],
                    ["Account Email", form.ownerEmail || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={s.reviewItem}>
                      <div style={s.reviewKey}>{k}</div>
                      <div style={s.reviewVal}>{v}</div>
                    </div>
                  ))}
                </div>

                {form.bookingUrl && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>🔗 Booking Redirect Confirmed</div>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>Guests clicking "Book Now" on AXXSpace will be redirected to:<br /><strong>{form.bookingUrl}</strong></div>
                  </div>
                )}

                <div style={s.commissionBox}>
                  <div style={s.commissionTitle}>📋 What Happens After Submission?</div>
                  <div style={{ fontSize: "13px", color: "#78350f", lineHeight: 1.7 }}>
                    1. Our team reviews your listing within 24 hours.<br />
                    2. Payment link for your <strong>{form.selectedPackage}</strong> plan is sent to your email.<br />
                    3. Once paid, your listing goes live on AXXSpace.<br />
                    4. Guests discover you, and bookings go to your site — <strong>no commission charged</strong>.
                  </div>
                </div>

                <label style={s.checkboxRow}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} style={{ marginRight: "10px", flexShrink: 0, accentColor: "#fbbf24" }} />
                  <span style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6 }}>
                    I agree to the AXXSpace <span style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 700 }}>Terms & Conditions</span> and confirm all information is accurate.
                  </span>
                </label>
              </div>
            )}

            {/* NAV */}
            <div style={s.navBtns}>
              {step > 0 && <button style={s.prevBtn} onClick={() => setStep((s) => s - 1)}>← Previous</button>}
              {step < steps.length - 1 ? (
                <button style={{ ...s.nextBtn, opacity: canNext() ? 1 : 0.5 }} onClick={() => { if (canNext()) setStep((s) => s + 1); }}>
                  Next →
                </button>
              ) : (
                <>
                  {submitError && (
                    <div style={{ fontSize: "13px", color: "#dc2626", background: "#fee2e2", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", flex: "1 1 100%" }}>
                      {submitError}
                    </div>
                  )}
                  <button style={{ ...s.nextBtn, opacity: form.agreeTerms && !submitting ? 1 : 0.5 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit Property 🚀"}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh", overflowX: "hidden" },
  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  backBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", whiteSpace: "nowrap" },
  headerCenter: { textAlign: "center", flex: 1 },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" },
  logoAccent: { fontSize: "18px", fontWeight: 900, color: "#fbbf24" },
  logoWord: { fontSize: "18px", fontWeight: 900, color: "#1f2937" },
  headerSub: { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  stepCount: { fontSize: "13px", color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" },

  progressBar: { height: "4px", background: "#e5e7eb" },
  progressFill: { height: "100%", background: "#fbbf24", transition: "width 0.4s ease" },

  formCard: { background: "white", borderRadius: "14px", padding: "24px 20px", border: "1px solid #e5e7eb" },
  formTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "6px" },
  formSub: { fontSize: "13px", color: "#6b7280", marginBottom: "24px" },

  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", color: "#1f2937", outline: "none" },

  // Package cards
  pkgSection: { marginTop: "24px" },
  pkgTitle: { fontSize: "13px", fontWeight: 800, color: "#1f2937", marginBottom: "14px" },
  pkgCard: { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s", position: "relative" },
  pkgBadge: { position: "absolute", top: "-10px", right: "12px", color: "white", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "20px" },

  amenityBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", transition: "all 0.15s", textAlign: "left" },
  amenityActive: { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 },
  validationHint: { fontSize: "12px", color: "#dc2626", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fecaca", marginTop: "8px" },

  bookingUrlBox: { background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "14px", padding: "18px", marginBottom: "20px" },
  bookingUrlTitle: { fontSize: "14px", fontWeight: 800, color: "#166534", marginBottom: "8px" },
  bookingUrlSub: { fontSize: "13px", color: "#15803d", lineHeight: 1.65, marginBottom: "14px" },

  sectionBreak: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px", marginBottom: "14px", marginTop: "8px" },
  addRoomBtn: { background: "transparent", border: "1px dashed #fbbf24", color: "#fbbf24", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: "20px", width: "100%" },
  removeRoomBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 },

  reviewItem: { background: "#f9fafb", borderRadius: "10px", padding: "12px" },
  reviewKey: { fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" },
  reviewVal: { fontSize: "13px", color: "#1f2937", fontWeight: 600, wordBreak: "break-word" },

  commissionBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", marginBottom: "18px" },
  commissionTitle: { fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" },
  checkboxRow: { display: "flex", alignItems: "flex-start", cursor: "pointer" },

  navBtns: { display: "flex", justifyContent: "space-between", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" },
  prevBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#4b5563" },
  nextBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1); }

  .reg-layout {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 16px;
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 24px;
    align-items: start;
  }

  .step-nav-desktop {
    background: white;
    border-radius: 14px;
    padding: 16px 12px;
    border: 1px solid #e5e7eb;
    position: sticky;
    top: 20px;
  }

  .two-col-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

  .amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    margin-bottom: 20px;
  }

  .room-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: stretch; flex-wrap: wrap; }
  .room-row input { min-width: 80px; }

  .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }

  @media (max-width: 720px) {
    .step-nav-desktop { display: none; }
    .reg-layout { grid-template-columns: 1fr; }
    .two-col-form { grid-template-columns: 1fr; }
    .pkg-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .amenities-grid { grid-template-columns: repeat(2, 1fr); }
    .review-grid { grid-template-columns: 1fr; }
    .room-row { flex-direction: column; }
  }
`;