import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import {
  COUNTIES,
  CATEGORIES,
  PROPERTY_TYPES,
  ACCOMMODATION_TYPES,
  ACCOMMODATION_AMENITIES,
  BUSINESS_TYPES,
  ITEM_CONDITIONS,
} from "../../data/axxgoData";

export default function AxxGoPost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [category, setCategory] = useState("Rentals");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed"); // fixed, negotiable, contact_for_price
  const [pricePeriod, setPricePeriod] = useState("per-month"); // one-off, per-month, per-night
  const [county, setCounty] = useState("Nairobi City");
  const [area, setArea] = useState("");

  // Category specific fields
  // Rentals
  const [propertyType, setPropertyType] = useState("Apartment");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [deposit, setDeposit] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");

  // Accommodation
  const [accommodationType, setAccommodationType] = useState("Student Hostel");
  const [amenities, setAmenities] = useState(["WiFi", "Clean Water", "24/7 Security"]);
  const [capacity, setCapacity] = useState("");

  // AxxBiashara
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Services & Artisans");
  const [openingHours, setOpeningHours] = useState("8:00 AM - 6:00 PM");
  const [websiteLink, setWebsiteLink] = useState("");
  const [socialLink, setSocialLink] = useState("");

  // Quick Sales
  const [itemCondition, setItemCondition] = useState("Used - Like New");
  const [brand, setBrand] = useState("");
  const [reasonForSelling, setReasonForSelling] = useState("");

  // Poster Details
  const [posterName, setPosterName] = useState("");
  const [posterPhone, setPosterPhone] = useState("");
  const [posterWhatsapp, setPosterWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [posterEmail, setPosterEmail] = useState("");

  // Honeypot field (invisible to real users)
  const [website_hp, setWebsite_hp] = useState("");

  // Lightweight math challenge (bot safeguard)
  const [mathA] = useState(() => Math.floor(Math.random() * 6) + 2);
  const [mathB] = useState(() => Math.floor(Math.random() * 5) + 1);
  const [mathAnswer, setMathAnswer] = useState("");

  // Photos
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [postResult, setPostResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle category change: adjust default pricePeriod
  const handleCategorySelect = (newCat) => {
    setCategory(newCat);
    if (newCat === "Rentals") setPricePeriod("per-month");
    else if (newCat === "Accommodation") setPricePeriod("per-night");
    else setPricePeriod("one-off");
  };

  // Toggle accommodation amenity
  const toggleAmenity = (item) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  // Handle photo additions
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError("");
    const validFiles = [];
    const newPreviews = [];

    // Max 8 photos total
    const remainingSlots = 8 - selectedFiles.length;
    if (remainingSlots <= 0) {
      setError("Maximum 8 photos allowed.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      // Validate file type
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type.toLowerCase())) {
        setError("Only JPG, PNG, or WebP images are allowed.");
        continue;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset file input value so same file could be re-picked if deleted
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove photo
  const removePhoto = (index) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client validation
    if (!title.trim() || title.trim().length < 3) {
      setError("Please provide a title with at least 3 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Please write a description with at least 10 characters.");
      return;
    }
    if (!county || !area.trim()) {
      setError("Please specify both County and Area.");
      return;
    }
    if (selectedFiles.length === 0) {
      setError("Please add at least 1 photo for your listing.");
      return;
    }
    if (!posterName.trim()) {
      setError("Please provide your name.");
      return;
    }
    if (!posterPhone.trim() || posterPhone.trim().length < 8) {
      setError("Please provide a valid phone number.");
      return;
    }

    // Bot check verification
    if (parseInt(mathAnswer, 10) !== mathA + mathB) {
      setError(`Anti-bot security question incorrect: What is ${mathA} + ${mathB}?`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Core fields
      formData.append("category", category);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", priceType === "contact_for_price" ? "0" : price || "0");
      formData.append("priceType", priceType);
      formData.append("pricePeriod", pricePeriod);
      formData.append("county", county);
      formData.append("area", area.trim());

      // Poster details
      formData.append("posterName", posterName.trim());
      formData.append("posterPhone", posterPhone.trim());
      formData.append("posterWhatsapp", sameAsPhone ? posterPhone.trim() : posterWhatsapp.trim());
      if (posterEmail.trim()) formData.append("posterEmail", posterEmail.trim());

      // Honeypot field (must stay empty)
      formData.append("website_hp", website_hp);

      // Build category-specific fields
      const categoryFields = {};
      if (category === "Rentals") {
        categoryFields.propertyType = propertyType;
        if (bedrooms) categoryFields.bedrooms = Number(bedrooms);
        if (bathrooms) categoryFields.bathrooms = Number(bathrooms);
        if (deposit) categoryFields.deposit = Number(deposit);
        if (availabilityDate) categoryFields.availabilityDate = availabilityDate;
      } else if (category === "Accommodation") {
        categoryFields.accommodationType = accommodationType;
        categoryFields.amenities = amenities;
        if (capacity) categoryFields.capacity = capacity;
      } else if (category === "AxxBiashara") {
        categoryFields.businessName = businessName.trim();
        categoryFields.businessType = businessType;
        if (openingHours) categoryFields.openingHours = openingHours.trim();
        if (websiteLink) categoryFields.websiteLink = websiteLink.trim();
        if (socialLink) categoryFields.socialLink = socialLink.trim();
      } else if (category === "Quick Sales") {
        categoryFields.itemCondition = itemCondition;
        if (brand) categoryFields.brand = brand.trim();
        if (reasonForSelling) categoryFields.reasonForSelling = reasonForSelling.trim();
      }

      formData.append("categoryFields", JSON.stringify(categoryFields));

      // Append all photos
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      // Submit
      const res = await API.post("/axxgo/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setPostResult(res.data);
      }
    } catch (err) {
      console.error("Listing submission error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to publish listing. Please verify your details, photos, and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyManageLink = () => {
    if (postResult?.manageUrl) {
      navigator.clipboard.writeText(postResult.manageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Success State / Modal ──
  if (postResult) {
    return (
      <div style={{ background: "#0f1729", minHeight: "100vh", padding: "40px 16px", color: "#f8fafc" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#1e293b",
            border: "1px solid #10b981",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎉</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "24px", color: "#10b981", fontWeight: "800" }}>
            Your Listing is Live!
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "15px", color: "#cbd5e1", lineHeight: 1.5 }}>
            <strong>"{postResult.listing.title}"</strong> has been published instantly on AxxGo and is now searchable by
            buyers, tenants, and clients across Kenya.
          </p>

          {/* Secret Manage Token Box */}
          <div
            style={{
              background: "#0f1729",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🔑</span>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#f59e0b" }}>
                Secret Management Link (Save This!)
              </h4>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>
              Because AxxGo requires no accounts, this secret link is your key to <strong>edit details</strong>, mark as
              <strong> "Sold"</strong> or <strong>"Rented"</strong>, or <strong>delete</strong> this listing anytime.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#1e293b",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #475569",
              }}
            >
              <input
                type="text"
                readOnly
                value={postResult.manageUrl}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  flex: 1,
                  margin: 0,
                  padding: 0,
                }}
              />
              <button
                type="button"
                onClick={copyManageLink}
                style={{
                  background: copied ? "#10b981" : "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.2s ease",
                }}
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            {posterEmail && (
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#10b981" }}>
                ✉️ We also sent a copy of this management link to <strong>{posterEmail}</strong>.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              to={`/axxgo/listing/${postResult.listing._id}`}
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "15px",
                padding: "12px 24px",
                borderRadius: "8px",
                display: "block",
              }}
            >
              View Your Live Listing →
            </Link>

            <Link
              to="/axxgo"
              style={{
                background: "transparent",
                border: "1px solid #475569",
                color: "#cbd5e1",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                padding: "10px 20px",
                borderRadius: "8px",
                display: "block",
              }}
            >
              Back to AxxGo Classifieds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f8fafc", padding: "28px 16px 80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/axxgo"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            ← Back to AxxGo
          </Link>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: "800" }}>
            Post a Listing on AxxGo
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            No registration or account required. Fill in your details below and your post goes live immediately!
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Honeypot field (hidden from screen readers & users) */}
          <div style={{ display: "none" }} aria-hidden="true">
            <input
              type="text"
              name="website_hp"
              value={website_hp}
              onChange={(e) => setWebsite_hp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* ── SECTION 1: CATEGORY SELECTION ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
              1. Select Category <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "10px",
              }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      background: isSelected ? "rgba(220, 38, 38, 0.15)" : "#0f1729",
                      border: `2px solid ${isSelected ? "#dc2626" : "#334155"}`,
                      borderRadius: "10px",
                      padding: "14px 10px",
                      textAlign: "center",
                      cursor: "pointer",
                      color: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>{cat.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "700" }}>{cat.label}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.2 }}>{cat.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 2: BASIC LISTING DETAILS ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>2. Listing Information</h3>

            {/* Title */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Listing Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                maxLength={140}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === "Rentals"
                    ? "e.g. Spacious 2 Bedroom Master Ensuite in Kilimani"
                    : category === "Accommodation"
                    ? "e.g. Executive Men's Hostel near Strathmore University"
                    : category === "AxxBiashara"
                    ? "e.g. Fast Plumbing & Electrical Repair Services Nairobi"
                    : "e.g. HP Pavilion Gaming Laptop 16GB RAM 512GB SSD"
                }
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Full Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                required
                rows={5}
                maxLength={3000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property, accommodation, business services, or item in detail. Include key features, terms, or conditions..."
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Pricing Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Price (KES) {priceType !== "contact_for_price" && <span style={{ color: "#ef4444" }}>*</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={priceType === "contact_for_price"}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={priceType === "contact_for_price" ? "Contact for price" : "e.g. 25000"}
                  style={{
                    background: priceType === "contact_for_price" ? "#1e293b" : "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Price Type
                </label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="negotiable">Negotiable</option>
                  <option value="contact_for_price">Contact for Price</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Billing Period
                </label>
                <select
                  value={pricePeriod}
                  onChange={(e) => setPricePeriod(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="one-off">One-off / Total</option>
                  <option value="per-month">Per Month</option>
                  <option value="per-night">Per Night</option>
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  County <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Specific Area / Town / Landmark <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Roysambu Lumumba Drive, Westlands, Nyali"
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: CATEGORY-SPECIFIC FIELDS ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700", color: "#38bdf8" }}>
              3. {category} Specifics
            </h3>

            {/* RENTALS FIELDS */}
            {category === "Rentals" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="e.g. 2"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="e.g. 1"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Deposit Required (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="e.g. 25000"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Availability Date
                  </label>
                  <input
                    type="text"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    placeholder="e.g. Immediately / 1st of next month"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}

            {/* ACCOMMODATION FIELDS */}
            {category === "Accommodation" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                      Accommodation Type
                    </label>
                    <select
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      style={{
                        background: "#0f1729",
                        border: "1px solid #334155",
                        color: "white",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {ACCOMMODATION_TYPES.map((at) => (
                        <option key={at} value={at}>
                          {at}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                      Capacity / Guest Count
                    </label>
                    <input
                      type="text"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="e.g. 2 Guests / 1 Student"
                      style={{
                        background: "#0f1729",
                        border: "1px solid #334155",
                        color: "white",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                    Select Amenities
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ACCOMMODATION_AMENITIES.map((am) => {
                      const checked = amenities.includes(am);
                      return (
                        <button
                          key={am}
                          type="button"
                          onClick={() => toggleAmenity(am)}
                          style={{
                            background: checked ? "#10b981" : "#0f1729",
                            color: "white",
                            border: `1px solid ${checked ? "#10b981" : "#334155"}`,
                            borderRadius: "20px",
                            padding: "6px 14px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {checked ? "✓ " : "+ "}
                          {am}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AXXBIASHARA FIELDS */}
            {category === "AxxBiashara" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Premier Auto Spares Nairobi"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Type of Business / Service
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="e.g. Mon-Sat: 8am - 7pm"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Website or Social Page Link
                  </label>
                  <input
                    type="url"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="e.g. https://instagram.com/mybusiness"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}

            {/* QUICK SALES FIELDS */}
            {category === "Quick Sales" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Item Condition
                  </label>
                  <select
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {ITEM_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Samsung, Apple, Sony, Nike"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Reason for Selling (Optional)
                  </label>
                  <input
                    type="text"
                    value={reasonForSelling}
                    onChange={(e) => setReasonForSelling(e.target.value)}
                    placeholder="e.g. Relocating, upgraded"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 4: PHOTOS (1 TO 8) ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ fontSize: "14px", fontWeight: "700" }}>
                4. Upload Photos (1 to 8 images) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <span style={{ fontSize: "12px", color: selectedFiles.length >= 1 ? "#10b981" : "#94a3b8" }}>
                {selectedFiles.length} of 8 uploaded
              </span>
            </div>

            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#94a3b8" }}>
              Accepted: JPG, PNG, WebP (max 5MB each). We automatically compress, optimize, and strip private EXIF/location metadata for your safety.
            </p>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handlePhotoSelect}
              style={{ display: "none" }}
            />

            {/* Thumbnail Previews Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              {previews.map((url, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    paddingTop: "100%",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: idx === 0 ? "2px solid #ef4444" : "1px solid #334155",
                    background: "#0f1729",
                  }}
                >
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {idx === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "#dc2626",
                        color: "white",
                        fontSize: "9px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        textAlign: "center",
                        padding: "2px 0",
                      }}
                    >
                      Cover Photo
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(0, 0, 0, 0.75)",
                      color: "#f87171",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add Photo Button Slot */}
              {selectedFiles.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: "relative",
                    paddingTop: "100%",
                    borderRadius: "8px",
                    border: "2px dashed #475569",
                    background: "#0f1729",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#475569")}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>📸</span>
                    <span style={{ fontSize: "11px", fontWeight: "600" }}>+ Add Photo</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── SECTION 5: POSTER CONTACT DETAILS ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>5. Your Contact Information</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Your Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={posterName}
                  onChange={(e) => setPosterName(e.target.value)}
                  placeholder="e.g. Samuel Mwangi"
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Phone Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={posterPhone}
                  onChange={(e) => setPosterPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>WhatsApp Number (Optional)</label>
                  <label style={{ fontSize: "11px", color: "#10b981", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setPosterWhatsapp(posterPhone);
                      }}
                      style={{ width: "auto", margin: 0 }}
                    />
                    Same as phone
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={sameAsPhone}
                  value={sameAsPhone ? posterPhone : posterWhatsapp}
                  onChange={(e) => setPosterWhatsapp(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  style={{
                    background: sameAsPhone ? "#1e293b" : "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={posterEmail}
                  onChange={(e) => setPosterEmail(e.target.value)}
                  placeholder="We'll email your secret edit/delete link"
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 6: BOT SAFEGUARD CHALLENGE ── */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
            }}
          >
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
                🤖 Anti-Spam Security Question:
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                What is <strong style={{ color: "#38bdf8" }}>{mathA} + {mathB}</strong>?
              </p>
            </div>
            <div style={{ width: "120px" }}>
              <input
                type="number"
                required
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Answer"
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  margin: 0,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                border: "none",
                fontWeight: "800",
                fontSize: "16px",
                padding: "14px 40px",
                borderRadius: "10px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px -2px rgba(220, 38, 38, 0.5)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span>Publishing Instantly...</span>
                </>
              ) : (
                <span>🚀 Publish Listing Now</span>
              )}
            </button>
            <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#64748b" }}>
              By posting, you agree to AxxSpace Terms of Service. Posts go live immediately.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

