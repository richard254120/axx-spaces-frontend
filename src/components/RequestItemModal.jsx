import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

// Professional SVG Icons
const Icons = {
  rental: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  quicksale: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  accommodation: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  ),
  business: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  other: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  pin: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  zap: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.228-.567-1.959-.811-3.21-2.809-3.308-2.938-.096-.13-1.015-1.349-1.015-2.574 0-1.226.643-1.828.871-2.074.228-.246.498-.308.664-.308.166 0 .332.002.477.01.155.008.363-.058.568.435.213.513.727 1.77.79 1.899.063.13.104.283.018.455-.087.172-.131.28-.26.433-.129.153-.271.34-.388.457-.13.13-.265.27-.114.529.15.26 0.669 1.103 1.436 1.785.986.877 1.817 1.149 2.077 1.278.26.13.411.11.564-.066.155-.176.662-.771.84-1.036.177-.265.353-.221.593-.132.24.088 1.527.72 1.79.851.263.131.438.196.503.306.066.11.066.64-.078 1.045zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.179L2 22l4.953-1.401A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
  ),
  phone: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  check: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  sparkle: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
};

const SERVICE_CATEGORIES = [
  { id: "rental", label: "Rentals & Properties", icon: Icons.rental, hint: "Apartments, villas, bedsitters, hostels & commercial spaces" },
  { id: "quicksale", label: "QuickSales", icon: Icons.quicksale, hint: "Electronics, vehicles, household items, furniture & fast deals" },
  { id: "accommodation", label: "Accommodation", icon: Icons.accommodation, hint: "Hotels, holiday stays, BNBs, guest houses & executive suites" },
  { id: "business", label: "Biashara Services", icon: Icons.business, hint: "Retail spaces, stalls, office supplies & commercial equipment" },
  { id: "other", label: "Others", icon: Icons.other, hint: "Any general item, specialized tool, or bespoke service" },
];

const CATEGORY_QUICK_TAGS = {
  rental: ["1 Bedroom", "2 Bedrooms", "3+ Bedrooms", "Bedsitter", "Furnished Apartment", "Commercial Office", "Hostel Room"],
  quicksale: ["Smartphones & Laptops", "Home Furniture", "Vehicles & Motorbikes", "Electronics & TVs", "Household Appliances", "Land & Plots"],
  accommodation: ["BNB / Short Stay", "Executive Hotel Suite", "Holiday Villa", "Guest House", "Weekend Getaway", "Furnished Studio"],
  business: ["Retail Stall / Shop", "Office Furniture", "Point of Sale (POS)", "Commercial Kitchen Equipment", "Display Racks"],
  other: ["Specialized Equipment", "Event Supplies", "Hardware Tools", "Custom Procurement"]
};

const POPULAR_LOCATIONS = ["Nairobi", "Kilimani", "Westlands", "Ruaka", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Kiambu"];

export default function RequestItemModal({ isOpen, onClose, initialQuery = "", defaultService = "rental" }) {
  const { user, token } = useContext(AuthContext);

  // Check if current user is an authenticated human account (not an invisible guest)
  const isRealUser = Boolean(
    user &&
    user.role !== "guest" &&
    !user.name?.toLowerCase().startsWith("guest_") &&
    !user.email?.toLowerCase().includes("@guest.axxspace")
  );

  const [serviceType, setServiceType] = useState(defaultService);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [details, setDetails] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("KES");
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [urgency, setUrgency] = useState("this_week");
  const [preferredContact, setPreferredContact] = useState("whatsapp");

  // Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customizingContact, setCustomizingContact] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Map previous defaults if legacy value passed
      let initCat = defaultService;
      if (initCat === "mover") initCat = "quicksale";
      if (initCat === "material") initCat = "accommodation";
      if (initCat === "tourism") initCat = "accommodation";

      setServiceType(initCat || "rental");
      setSearchQuery(initialQuery || "");
      setDetails("");
      setTargetLocation("");
      setBudgetMin("");
      setBudgetMax("");
      setBudgetCurrency("KES");
      setBudgetPeriod(initCat === "rental" ? "monthly" : "total");
      setUrgency("this_week");
      setPreferredContact("whatsapp");
      setErrorMsg("");
      setSubmittedData(null);

      if (isRealUser) {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setCustomizingContact(false);
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setCustomizingContact(true);
      }
    }
  }, [isOpen, user, isRealUser, initialQuery, defaultService]);

  // Adjust budget period default when serviceType changes
  useEffect(() => {
    if (serviceType === "rental") {
      setBudgetPeriod("monthly");
    } else if (serviceType === "accommodation") {
      setBudgetPeriod("daily");
    } else {
      setBudgetPeriod("total");
    }
  }, [serviceType]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddTag = (tag) => {
    if (!searchQuery) {
      setSearchQuery(tag);
    } else if (!searchQuery.toLowerCase().includes(tag.toLowerCase())) {
      setSearchQuery(`${searchQuery.trim()}, ${tag}`);
    }
  };

  const handleAddLocation = (loc) => {
    setTargetLocation(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Name validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.toLowerCase().startsWith("guest")) {
      setErrorMsg("Please enter your actual full name.");
      return;
    }

    // Email validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.includes("@guest.axxspace")) {
      setErrorMsg("Please enter a valid personal or business email address.");
      return;
    }

    // Phone validation
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrorMsg("Please enter your phone or WhatsApp number so providers can reach you.");
      return;
    }

    if (!searchQuery.trim()) {
      setErrorMsg("Please describe what item, property, or service you are looking for.");
      return;
    }

    if (!details.trim()) {
      setErrorMsg("Please provide more details/specifications for your request.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        serviceType,
        searchQuery: searchQuery.trim(),
        details: details.trim(),
        targetLocation: targetLocation.trim(),
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        budgetCurrency,
        budgetPeriod,
        urgency,
        preferredContact,
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await API.post("/item-requests", payload, { headers });

      if (res.data.success) {
        setSubmittedData({
          referenceId: res.data.request?._id || `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
          name: trimmedName,
          searchQuery: searchQuery.trim(),
          serviceType,
          preferredContact,
          phone: trimmedPhone
        });
      } else {
        setErrorMsg(res.data.error || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg(err.response?.data?.error || "Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ax-req-overlay" onClick={onClose}>
      <div className="ax-req-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="ax-req-header">
          <div className="ax-req-header-left">
            <span className="ax-req-badge">
              <span className="ax-req-badge-icon">{Icons.sparkle}</span>
              AxxSpace Concierge Sourcing
            </span>
            <h2 className="ax-req-title">Can't Find What You Need?</h2>
            <p className="ax-req-subtitle">
              Submit a custom request. Our administrators and verified providers across Kenya will locate and match it directly for you.
            </p>
          </div>
          <button type="button" className="ax-req-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {submittedData ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="ax-req-success-view">
            <div className="ax-req-success-icon-wrap">
              {Icons.check}
            </div>
            <h3 className="ax-req-success-title">Request Successfully Broadcast</h3>
            <p className="ax-req-success-desc">
              Thank you, <strong style={{ color: "#fbbf24" }}>{submittedData.name}</strong>. Your custom request for{" "}
              <strong style={{ color: "#ffffff" }}>"{submittedData.searchQuery}"</strong> has been submitted to our concierge desk and verified providers.
            </p>

            <div className="ax-req-success-meta-box">
              <div className="ax-req-meta-row">
                <span className="ax-req-meta-label">Reference ID:</span>
                <span className="ax-req-meta-val code-font">{submittedData.referenceId}</span>
              </div>
              <div className="ax-req-meta-row">
                <span className="ax-req-meta-label">Category:</span>
                <span className="ax-req-meta-val" style={{ textTransform: "capitalize" }}>{submittedData.serviceType}</span>
              </div>
              <div className="ax-req-meta-row">
                <span className="ax-req-meta-label">Preferred Channel:</span>
                <span className="ax-req-meta-val" style={{ color: "#34d399", textTransform: "uppercase", fontWeight: 700 }}>
                  {submittedData.preferredContact} ({submittedData.phone})
                </span>
              </div>
            </div>

            <p className="ax-req-success-note">
              We are currently checking availability. Our verified partner or admin will reach out to you shortly via your preferred channel.
            </p>

            <button type="button" className="ax-req-submit-btn" onClick={onClose} style={{ marginTop: "12px" }}>
              Done & Return to Listings
            </button>
          </div>
        ) : (
          /* MAIN SMART REQUEST FORM */
          <form onSubmit={handleSubmit} className="ax-req-form">
            {errorMsg && (
              <div className="ax-req-alert-error">
                <span className="ax-req-alert-icon">{Icons.alert}</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION 1: Service Category Picker */}
            <div className="ax-req-section">
              <label className="ax-req-section-label">
                <span className="ax-req-step-num">1</span> Select Category
              </label>
              <div className="ax-req-cat-grid">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = serviceType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`ax-req-cat-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setServiceType(cat.id)}
                    >
                      <span className="ax-req-cat-icon">{cat.icon}</span>
                      <div className="ax-req-cat-text">
                        <span className="ax-req-cat-name">{cat.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Request Query & Smart Tags */}
            <div className="ax-req-section">
              <label className="ax-req-section-label" htmlFor="req-search-query">
                <span className="ax-req-step-num">2</span> What are you looking for? *
              </label>
              <input
                id="req-search-query"
                type="text"
                className="ax-req-input"
                placeholder={
                  serviceType === "rental"
                    ? "e.g., 2 Bedroom Apartment in Kilimani with Balcony"
                    : serviceType === "quicksale"
                    ? "e.g., iPhone 14 Pro Max 256GB, 55-inch Smart TV, 5-seater Sofa"
                    : serviceType === "accommodation"
                    ? "e.g., 2-Night Stay Executive Suite in Westlands with Pool"
                    : serviceType === "business"
                    ? "e.g., Prime Retail Stall near Tom Mboya St or Commercial POS System"
                    : "e.g., Specify item, equipment or bespoke service required"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
              />

              {/* Quick Tags for current category */}
              {CATEGORY_QUICK_TAGS[serviceType] && (
                <div className="ax-req-tags-wrap">
                  <span className="ax-req-tags-label">Quick suggestions:</span>
                  <div className="ax-req-tags-list">
                    {CATEGORY_QUICK_TAGS[serviceType].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="ax-req-tag-btn"
                        onClick={() => handleAddTag(tag)}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Location Details */}
            <div className="ax-req-section">
              <label className="ax-req-section-label">
                <span className="ax-req-step-num">3</span> Target Location & Area
              </label>
              <div className="ax-req-field">
                <input
                  type="text"
                  className="ax-req-input"
                  placeholder="e.g., Kilimani, Nairobi or Mombasa Road, Machakos"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                />
                <div className="ax-req-tags-wrap" style={{ marginTop: "6px" }}>
                  <span className="ax-req-tags-label">Popular areas:</span>
                  <div className="ax-req-tags-list">
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        className="ax-req-tag-btn"
                        onClick={() => handleAddLocation(loc)}
                      >
                        <span className="ax-req-tag-icon">{Icons.pin}</span>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Budget & Urgency */}
            <div className="ax-req-section">
              <label className="ax-req-section-label">
                <span className="ax-req-step-num">4</span> Budget & Timeline
              </label>

              <div className="ax-req-grid-3">
                <div className="ax-req-field">
                  <span className="ax-req-input-sublabel">Currency & Frequency</span>
                  <div className="ax-req-input-group">
                    <select
                      className="ax-req-select"
                      value={budgetCurrency}
                      onChange={(e) => setBudgetCurrency(e.target.value)}
                      style={{ width: "90px" }}
                    >
                      <option value="KES">KES</option>
                      <option value="USD">USD</option>
                    </select>
                    <select
                      className="ax-req-select"
                      value={budgetPeriod}
                      onChange={(e) => setBudgetPeriod(e.target.value)}
                    >
                      <option value="monthly">Per Month</option>
                      <option value="total">Total Budget</option>
                      <option value="daily">Per Day / Night</option>
                      <option value="unit">Per Unit</option>
                    </select>
                  </div>
                </div>

                <div className="ax-req-field">
                  <span className="ax-req-input-sublabel">Min Budget ({budgetCurrency})</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    className="ax-req-input"
                    placeholder="e.g. 25,000"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>

                <div className="ax-req-field">
                  <span className="ax-req-input-sublabel">Max Budget ({budgetCurrency})</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    className="ax-req-input"
                    placeholder="e.g. 50,000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Urgency Selector */}
              <div className="ax-req-field" style={{ marginTop: "12px" }}>
                <span className="ax-req-input-sublabel">Required Timeline</span>
                <div className="ax-req-urgency-grid">
                  {[
                    { id: "immediate", label: "Immediate", sub: "Within 24-48 hrs", icon: Icons.zap },
                    { id: "this_week", label: "This Week", sub: "Next 3-7 days", icon: Icons.calendar },
                    { id: "this_month", label: "This Month", sub: "Planning ahead", icon: Icons.calendar },
                    { id: "flexible", label: "Flexible", sub: "Just exploring", icon: Icons.clock },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={`ax-req-urgency-btn ${urgency === u.id ? "active" : ""}`}
                      onClick={() => setUrgency(u.id)}
                    >
                      <span className="ax-req-urgency-title">
                        <span className="ax-req-urgency-icon">{u.icon}</span>
                        {u.label}
                      </span>
                      <span className="ax-req-urgency-sub">{u.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 5: Detailed Specifications */}
            <div className="ax-req-section">
              <label className="ax-req-section-label" htmlFor="req-details">
                <span className="ax-req-step-num">5</span> Specifications & Requirements *
              </label>
              <textarea
                id="req-details"
                className="ax-req-textarea"
                rows={4}
                placeholder={
                  serviceType === "rental"
                    ? "Specify preferred floor level, amenities (backup generator, borehole, balcony, lift), parking slots, pet policy, or move-in date..."
                    : serviceType === "quicksale"
                    ? "Specify model, condition (brand new or lightly used), storage capacity, warranty requirement, or accessories needed..."
                    : serviceType === "accommodation"
                    ? "Specify check-in date, number of guests, meal plans (bed & breakfast), pool, parking, or special arrangements..."
                    : "Provide detailed specifications, dimensions, brand, or any unique requirements..."
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
              <div className="ax-req-char-hint">
                <span>{details.length} characters</span>
                <span>The more specific you are, the faster verified providers can match you.</span>
              </div>
            </div>

            {/* SECTION 6: Requester Contact Details (No anonymous guest names) */}
            <div className="ax-req-section ax-req-contact-section">
              <div className="ax-req-contact-header">
                <label className="ax-req-section-label" style={{ marginBottom: 0 }}>
                  <span className="ax-req-step-num">6</span> Your Contact Details *
                </label>
                {isRealUser && !customizingContact && (
                  <button
                    type="button"
                    className="ax-req-text-btn"
                    onClick={() => setCustomizingContact(true)}
                  >
                    Change details
                  </button>
                )}
              </div>

              {isRealUser && !customizingContact ? (
                <div className="ax-req-logged-badge">
                  <div className="ax-req-logged-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ax-req-logged-info">
                    <span className="ax-req-logged-name">{user?.name} (Verified Account)</span>
                    <span className="ax-req-logged-email">
                      {user?.email} {user?.phone ? `• ${user.phone}` : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="ax-req-contact-fields">
                  <p className="ax-req-contact-hint">
                    Provide your genuine name and contact number so verified providers and admins can present matching offers.
                  </p>

                  <div className="ax-req-grid-2">
                    <div className="ax-req-field">
                      <span className="ax-req-input-sublabel">Full Name *</span>
                      <input
                        type="text"
                        className="ax-req-input"
                        placeholder="e.g. David Mwangi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="ax-req-field">
                      <span className="ax-req-input-sublabel">Email Address *</span>
                      <input
                        type="email"
                        className="ax-req-input"
                        placeholder="e.g. david.mwangi@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="ax-req-field" style={{ marginTop: "10px" }}>
                    <span className="ax-req-input-sublabel">Phone / WhatsApp Number *</span>
                    <div className="ax-req-phone-wrap">
                      <span className="ax-req-phone-prefix">+254</span>
                      <input
                        type="tel"
                        className="ax-req-input ax-req-phone-input"
                        placeholder="0712 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferred Contact Mode */}
              <div className="ax-req-field" style={{ marginTop: "14px" }}>
                <span className="ax-req-input-sublabel">Preferred Contact Channel</span>
                <div className="ax-req-pref-grid">
                  {[
                    { id: "whatsapp", label: "WhatsApp", desc: "Fastest response", icon: Icons.whatsapp },
                    { id: "phone", label: "Direct Call", desc: "Voice conversation", icon: Icons.phone },
                    { id: "email", label: "Email", desc: "Written offers", icon: Icons.mail },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`ax-req-pref-btn ${preferredContact === p.id ? "active" : ""}`}
                      onClick={() => setPreferredContact(p.id)}
                    >
                      <span className="ax-req-pref-title">
                        <span className="ax-req-pref-icon">{p.icon}</span>
                        {p.label}
                      </span>
                      <span className="ax-req-pref-sub">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="ax-req-actions">
              <button
                type="submit"
                className="ax-req-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="ax-req-btn-loading">
                    <span className="ax-req-spinner" /> Submitting Request...
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    {Icons.send} Broadcast Custom Request
                  </span>
                )}
              </button>

              <button
                type="button"
                className="ax-req-cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .ax-req-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(5, 11, 20, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 16px;
          animation: axReqFadeIn 0.25s ease-out;
        }

        .ax-req-card {
          background: linear-gradient(165deg, #0e1726 0%, #121e33 60%, #0a111c 100%);
          border: 1px solid rgba(201, 168, 76, 0.35);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 168, 76, 0.12);
          border-radius: 20px;
          max-width: 680px;
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          color: #f1f5f9;
          position: relative;
          display: flex;
          flex-direction: column;
          animation: axReqSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ax-req-card::-webkit-scrollbar {
          width: 6px;
        }
        .ax-req-card::-webkit-scrollbar-track {
          background: #0b1320;
        }
        .ax-req-card::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.3);
          border-radius: 3px;
        }

        .ax-req-header {
          padding: 24px 28px 18px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          background: rgba(14, 23, 38, 0.7);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(8px);
        }

        .ax-req-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.3);
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .ax-req-badge-icon {
          display: inline-flex;
          color: #fbbf24;
        }

        .ax-req-title {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
          letter-spacing: -0.3px;
        }

        .ax-req-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.45;
        }

        .ax-req-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .ax-req-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .ax-req-form {
          padding: 24px 28px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ax-req-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ax-req-section-label {
          font-size: 13px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ax-req-step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: #fbbf24;
          color: #0d1726;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 800;
        }

        /* Category Grid */
        .ax-req-cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 600px) {
          .ax-req-cat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .ax-req-cat-card {
          background: rgba(26, 38, 57, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #cbd5e1;
        }
        .ax-req-cat-card:hover {
          background: rgba(35, 52, 78, 0.8);
          border-color: rgba(201, 168, 76, 0.4);
          transform: translateY(-2px);
        }
        .ax-req-cat-card.selected {
          background: linear-gradient(145deg, rgba(201, 168, 76, 0.18) 0%, rgba(30, 48, 74, 0.9) 100%);
          border: 1.5px solid #fbbf24;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.15);
        }

        .ax-req-cat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
        }
        .ax-req-cat-card.selected .ax-req-cat-icon {
          color: #fbbf24;
        }
        .ax-req-cat-name {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.3;
        }

        /* Inputs & Fields */
        .ax-req-input, .ax-req-select, .ax-req-textarea {
          width: 100%;
          box-sizing: border-box;
          background: #152236;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: #ffffff;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ax-req-input:focus, .ax-req-select:focus, .ax-req-textarea:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
          background: #182840;
        }
        .ax-req-input::placeholder, .ax-req-textarea::placeholder {
          color: #64748b;
        }

        .ax-req-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .ax-req-input-sublabel {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: block;
        }

        .ax-req-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ax-req-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 550px) {
          .ax-req-grid-2, .ax-req-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .ax-req-input-group {
          display: flex;
          gap: 6px;
        }

        /* Quick Tags */
        .ax-req-tags-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
        }
        .ax-req-tags-label {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
        }
        .ax-req-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ax-req-tag-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .ax-req-tag-icon {
          display: inline-flex;
          color: #fbbf24;
        }
        .ax-req-tag-btn:hover {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.35);
        }

        /* Urgency Grid */
        .ax-req-urgency-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 550px) {
          .ax-req-urgency-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .ax-req-urgency-btn {
          background: #152236;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ax-req-urgency-btn:hover {
          border-color: rgba(251, 191, 36, 0.3);
          background: #1b2c45;
        }
        .ax-req-urgency-btn.active {
          background: rgba(251, 191, 36, 0.15);
          border: 1.5px solid #fbbf24;
        }
        .ax-req-urgency-title {
          font-size: 12px;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ax-req-urgency-icon {
          display: inline-flex;
          color: #fbbf24;
        }
        .ax-req-urgency-sub {
          font-size: 10px;
          color: #94a3b8;
        }

        .ax-req-char-hint {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }

        /* Contact Section */
        .ax-req-contact-section {
          background: rgba(14, 23, 38, 0.6);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 14px;
          padding: 16px;
        }
        .ax-req-contact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .ax-req-contact-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .ax-req-text-btn {
          background: none;
          border: none;
          color: #fbbf24;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .ax-req-logged-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #152236;
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 12px 14px;
          border-radius: 10px;
        }
        .ax-req-logged-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }
        .ax-req-logged-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ax-req-logged-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
        }
        .ax-req-logged-email {
          font-size: 12px;
          color: #94a3b8;
        }

        .ax-req-phone-wrap {
          display: flex;
          align-items: center;
          background: #152236;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          overflow: hidden;
        }
        .ax-req-phone-prefix {
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.05);
          font-size: 13px;
          font-weight: 700;
          color: #cbd5e1;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        }
        .ax-req-phone-input {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }

        /* Preferred Channel */
        .ax-req-pref-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 500px) {
          .ax-req-pref-grid {
            grid-template-columns: 1fr;
          }
        }
        .ax-req-pref-btn {
          background: #152236;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ax-req-pref-btn:hover {
          border-color: rgba(251, 191, 36, 0.3);
          background: #1b2c45;
        }
        .ax-req-pref-btn.active {
          background: rgba(34, 197, 94, 0.15);
          border: 1.5px solid #22c55e;
        }
        .ax-req-pref-title {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ax-req-pref-icon {
          display: inline-flex;
        }
        .ax-req-pref-sub {
          font-size: 10px;
          color: #94a3b8;
        }

        /* Actions */
        .ax-req-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .ax-req-submit-btn {
          flex: 2;
          padding: 14px 20px;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          border: none;
          border-radius: 12px;
          color: #0d1726;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
        }
        .ax-req-submit-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.35);
        }
        .ax-req-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ax-req-cancel-btn {
          flex: 1;
          padding: 14px 20px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ax-req-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .ax-req-btn-loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ax-req-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(13, 23, 38, 0.25);
          border-top-color: #0d1726;
          border-radius: 50%;
          animation: axReqSpin 0.7s linear infinite;
        }

        .ax-req-alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ax-req-alert-icon {
          display: inline-flex;
          color: #ef4444;
        }

        /* Success View */
        .ax-req-success-view {
          padding: 40px 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ax-req-success-icon-wrap {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.15);
          border: 2px solid #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
          margin-bottom: 20px;
          animation: axReqPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ax-req-success-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px 0;
        }
        .ax-req-success-desc {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 0 24px 0;
        }
        .ax-req-success-meta-box {
          background: rgba(14, 23, 38, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          width: 100%;
          max-width: 480px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
          text-align: left;
        }
        .ax-req-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .ax-req-meta-label {
          color: #94a3b8;
        }
        .ax-req-meta-val {
          color: #ffffff;
          font-weight: 600;
        }
        .code-font {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #fbbf24;
        }
        .ax-req-success-note {
          font-size: 13px;
          color: #94a3b8;
          max-width: 480px;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        @keyframes axReqFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes axReqSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes axReqSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes axReqPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
