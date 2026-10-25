import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  AMENITIES_LIST,
} from "../../features/accommodation";
import { fetchOwnerListing, updateOwnerListing, formatVideoUrl } from "../../api/accommodation";
import { getAccommodationToken } from "../../features/accommodation";

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getAccommodationToken() || localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [property, setProperty] = useState(null);

  const [form, setForm] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [removeVideos, setRemoveVideos] = useState([]);

  useEffect(() => {
    if (!token) {
      setError("Please sign in first.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await fetchOwnerListing(token, id);
        setProperty(data);
        setForm({
          name: data.name || "",
          type: data.type || "",
          description: data.description || "",
          address: data.address || "",
          lat: data.location?.lat || "",
          lng: data.location?.lng || "",
          basePrice: data.basePrice ?? "",
          currency: data.currency || "KES",
          amenities: data.amenities || [],
          checkInTime: data.checkInTime || "14:00",
          checkOutTime: data.checkOutTime || "11:00",
          houseRules: data.houseRules || "",
          maxGuests: data.maxGuests ?? "",
          totalRooms: data.totalRooms ?? "",
        });
      } catch (err) {
        setError(err.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities?.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...(f.amenities || []), a],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "amenities") fd.append("amenities", JSON.stringify(v));
        else if (Array.isArray(v)) return;
        else if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (removeImages.length) fd.append("removeImages", JSON.stringify(removeImages));
      if (removeVideos.length) fd.append("removeVideos", JSON.stringify(removeVideos));
      newImages.forEach((file) => fd.append("images", file));
      newVideos.forEach((file) => fd.append("videos", file));

      const res = await updateOwnerListing(token, id, fd);
      setSuccess(res.message || "Property updated successfully!");
      if (res.data) setProperty(res.data);
      setNewImages([]);
      setNewVideos([]);
      setRemoveImages([]);
      setRemoveVideos([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <LoadingBlock message="Loading your accommodation property…" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
          <ErrorAlert message={error || "Property not found or access denied"} />
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={() => navigate("/accommodation/dashboard")}
          >
            ← Return to Host Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentImages = (property.images || []).filter((u) => !removeImages.includes(u));
  const currentVideos = (property.videos || []).filter((u) => !removeVideos.includes(u));
  const isApproved = property.status === "active" || property.status === "approved";

  return (
    <div style={styles.page}>
      <style>{customCss}</style>

      {/* TOP NAVIGATION BAR */}
      <div style={styles.topBar}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/accommodation/dashboard")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Host Dashboard</span>
        </button>

        <div style={styles.topBarRight}>
          {isApproved && (
            <Link
              to={`/accommodation/${id}`}
              style={styles.viewLiveTopBtn}
              target="_blank"
              rel="noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>View Live Listing</span>
            </Link>
          )}
        </div>
      </div>

      {/* PROPERTY STATUS HEADER CARD */}
      <div style={styles.statusBox(property.status)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <StatusBadge status={property.status} />
            <h1 style={styles.propertyName}>{property.name}</h1>
          </div>
          <span style={styles.propertyIdTag}>ID: {id?.slice(-8)}</span>
        </div>

        {property.statusMessage && (
          <p style={styles.statusMsgText}>{property.statusMessage}</p>
        )}

        <div style={styles.statusMetaRow}>
          {property.submittedAt && (
            <span>
              Submitted: {new Date(property.submittedAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
            </span>
          )}
          {property.lastUpdated && (
            <span>
              · Last saved: {new Date(property.lastUpdated).toLocaleDateString("en-KE", { dateStyle: "medium" })}
            </span>
          )}
          <span>· {property.views || 0} total guest views</span>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {success && (
        <div style={styles.successAlert}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSave} style={styles.formCard}>
        {/* MEDIA SECTION */}
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Photos & Video Walkthroughs</h2>
            <p style={styles.sectionHint}>
              Upload high-resolution photos and video tours. Visuals with good lighting dramatically increase booking conversions.
            </p>
          </div>

          {currentImages.length > 0 && (
            <div style={styles.mediaGrid}>
              {currentImages.map((url) => (
                <div key={url} style={styles.mediaItem}>
                  <img src={url} alt="" style={styles.mediaImg} />
                  <button
                    type="button"
                    style={styles.removeBtn}
                    onClick={() => setRemoveImages((r) => [...r, url])}
                    title="Remove photo"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentVideos.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={styles.mediaSubhead}>Videos ({currentVideos.length})</div>
              <div style={styles.mediaGrid}>
                {currentVideos.map((url) => (
                  <div key={url} style={styles.mediaItem}>
                    <video
                      src={formatVideoUrl(url)}
                      controls
                      playsInline
                      preload="metadata"
                      style={styles.mediaImg}
                    />
                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={() => setRemoveVideos((r) => [...r, url])}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.uploadRow}>
            <label style={styles.uploadLabel}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>+ Add More Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])}
              />
            </label>

            <label style={styles.uploadLabel}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <span>+ Add Video Walkthrough</span>
              <input
                type="file"
                accept="video/*"
                multiple
                hidden
                onChange={(e) => setNewVideos([...newVideos, ...Array.from(e.target.files)])}
              />
            </label>
          </div>

          {(newImages.length > 0 || newVideos.length > 0) && (
            <div style={styles.pendingUploadPill}>
              <span>Pending upload: </span>
              <strong>{newImages.length} photo(s)</strong>, <strong>{newVideos.length} video(s)</strong> (will upload when you click Save changes)
            </div>
          )}
        </section>

        {/* PROPERTY DETAILS */}
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Property Identity & Description</h2>
            <p style={styles.sectionHint}>Core stay information displayed across the guest marketplace</p>
          </div>

          <Field label="Property Name *">
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              placeholder="e.g. Diani Ocean Villa & Cottages"
            />
          </Field>

          <Field label="Property Type *">
            <select
              style={styles.select}
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              required
            >
              <option value="">Select category…</option>
              <option value="hotel">Hotel</option>
              <option value="bnb">B&B</option>
              <option value="guesthouse">Guesthouse</option>
              <option value="apartment">Apartment</option>
              <option value="hostel">Hostel</option>
              <option value="villa">Villa</option>
              <option value="cottage">Cottage</option>
              <option value="treehouse">Treehouse</option>
              <option value="beach-resort">Beach Resort</option>
              <option value="city-hotel">City Hotel</option>
              <option value="mountain-lodge">Mountain Lodge</option>
              <option value="safari-camp">Safari Camp</option>
              <option value="camping-grounds">Camping Grounds</option>
              <option value="boutique-hotel">Boutique Hotel</option>
              <option value="eco-lodge">Eco Lodge</option>
              <option value="glamping-site">Glamping Site</option>
            </select>
          </Field>

          <Field label="Full Description *">
            <textarea
              style={{ ...styles.input, minHeight: "120px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              placeholder="Describe scenic surroundings, unique architecture, beach access, meals, and experience..."
            />
          </Field>

          <Field label="Physical Address / Location *">
            <input
              style={styles.input}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              required
              placeholder="e.g. Diani Beach Road, South Coast, Kwale County"
            />
          </Field>

          <div style={styles.twoCol}>
            <Field label="Latitude Coordinates *">
              <input
                style={styles.input}
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => update("lat", e.target.value)}
                required
                placeholder="-4.2798"
              />
            </Field>
            <Field label="Longitude Coordinates *">
              <input
                style={styles.input}
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => update("lng", e.target.value)}
                required
                placeholder="39.5936"
              />
            </Field>
          </div>
        </section>

        {/* PRICING & CAPACITY */}
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Pricing & Guest Capacity</h2>
            <p style={styles.sectionHint}>Set nightly rates and maximum occupancy limits</p>
          </div>

          <div style={styles.twoCol}>
            <Field label="Base Price Per Night *">
              <input
                style={styles.input}
                type="number"
                value={form.basePrice}
                onChange={(e) => update("basePrice", e.target.value)}
                required
                placeholder="15000"
              />
            </Field>
            <Field label="Currency">
              <select
                style={styles.select}
                value={form.currency || "KES"}
                onChange={(e) => update("currency", e.target.value)}
              >
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </Field>
          </div>

          <div style={styles.twoCol}>
            <Field label="Max Guests Allowed *">
              <input
                style={styles.input}
                type="number"
                min="1"
                value={form.maxGuests}
                onChange={(e) => update("maxGuests", e.target.value)}
                required
                placeholder="4"
              />
            </Field>
            <Field label="Total Bedrooms / Rooms *">
              <input
                style={styles.input}
                type="number"
                min="1"
                value={form.totalRooms}
                onChange={(e) => update("totalRooms", e.target.value)}
                required
                placeholder="2"
              />
            </Field>
          </div>
        </section>

        {/* POLICIES & AMENITIES */}
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Check-in Policies & House Rules</h2>
          </div>

          <div style={styles.twoCol}>
            <Field label="Check-in Time">
              <input
                style={styles.input}
                type="time"
                value={form.checkInTime}
                onChange={(e) => update("checkInTime", e.target.value)}
              />
            </Field>
            <Field label="Check-out Time">
              <input
                style={styles.input}
                type="time"
                value={form.checkOutTime}
                onChange={(e) => update("checkOutTime", e.target.value)}
              />
            </Field>
          </div>

          <Field label="House Rules & Guest Notes">
            <textarea
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              value={form.houseRules}
              onChange={(e) => update("houseRules", e.target.value)}
              placeholder="e.g. No smoking indoors, quiet hours after 10 PM, pets welcome upon advance request..."
            />
          </Field>

          <div style={{ marginTop: "24px" }}>
            <label style={styles.fieldLabel}>Amenities & Features</label>
            <div style={styles.amenityGrid}>
              {AMENITIES_LIST.map((a) => {
                const isSelected = form.amenities?.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    style={{
                      ...styles.amenityChip,
                      ...(isSelected ? styles.amenityChipActive : {}),
                    }}
                    onClick={() => toggleAmenity(a)}
                  >
                    <span style={{ color: isSelected ? "#fbbf24" : "#64748b" }}>
                      {isSelected ? "✓" : "+"}
                    </span>
                    <span>{a}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        <div style={styles.formFooter}>
          <button
            type="submit"
            style={styles.btnPrimary}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spin-icon" style={{ display: "inline-block" }}>⚙</span>
                <span>Saving Changes…</span>
              </>
            ) : (
              <span>✓ Save All Changes</span>
            )}
          </button>

          <button
            type="button"
            style={styles.btnCancel}
            onClick={() => navigate("/accommodation/dashboard")}
          >
            Cancel
          </button>

          {isApproved && (
            <Link
              to={`/accommodation/${id}`}
              style={styles.btnLiveListing}
              target="_blank"
              rel="noreferrer"
            >
              Preview Live Stay →
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "32px 20px 80px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#f8fafc",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  viewLiveTopBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    color: "#34d399",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
  },
  statusBox: (status) => {
    const isLive = status === "active" || status === "approved";
    const isPending = status === "pending" || status === "pending_review";
    return {
      background: isLive
        ? "linear-gradient(135deg, rgba(16, 185, 129, 0.10) 0%, rgba(15, 23, 42, 0.85) 100%)"
        : isPending
        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)"
        : "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
      border: `1px solid ${
        isLive
          ? "rgba(16, 185, 129, 0.3)"
          : isPending
          ? "rgba(245, 158, 11, 0.3)"
          : "rgba(239, 68, 68, 0.3)"
      }`,
      borderRadius: "20px",
      padding: "24px 28px",
      marginBottom: "28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    };
  },
  propertyName: {
    fontSize: "22px",
    fontWeight: 900,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.4px",
  },
  propertyIdTag: {
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#94a3b8",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  statusMsgText: {
    fontSize: "13.5px",
    color: "#cbd5e1",
    marginTop: "12px",
    lineHeight: 1.6,
  },
  statusMetaRow: {
    display: "flex",
    gap: "8px",
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  successAlert: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
    padding: "14px 20px",
    borderRadius: "14px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },
  formCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(16px)",
  },
  formSection: {
    paddingBottom: "32px",
    marginBottom: "32px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  sectionHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "19px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 6px 0",
    letterSpacing: "-0.3px",
  },
  sectionHint: {
    fontSize: "13.5px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.5,
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 800,
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    padding: "13px 16px",
    fontSize: "14px",
    color: "#f8fafc",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  select: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    padding: "13px 16px",
    fontSize: "14px",
    color: "#f8fafc",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "14px",
    marginTop: "14px",
  },
  mediaItem: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "#0b1222",
    height: "130px",
  },
  mediaImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  mediaSubhead: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "10px",
  },
  removeBtn: {
    position: "absolute",
    bottom: "6px",
    right: "6px",
    background: "rgba(239, 68, 68, 0.85)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
  },
  uploadRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "20px",
  },
  uploadLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "2px dashed rgba(251, 191, 36, 0.4)",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13.5px",
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.05)",
    transition: "all 0.2s ease",
  },
  pendingUploadPill: {
    marginTop: "14px",
    fontSize: "12.5px",
    color: "#fde68a",
    background: "rgba(245, 158, 11, 0.12)",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(245, 158, 11, 0.25)",
  },
  amenityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },
  amenityChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "#94a3b8",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.15s ease",
  },
  amenityChipActive: {
    background: "rgba(251, 191, 36, 0.12)",
    borderColor: "rgba(251, 191, 36, 0.35)",
    color: "#f8fafc",
    fontWeight: 700,
  },
  formFooter: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    paddingTop: "10px",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    padding: "13px 26px",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)",
    transition: "all 0.2s ease",
  },
  btnCancel: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    borderRadius: "12px",
    padding: "13px 20px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  btnLiveListing: {
    marginLeft: "auto",
    color: "#38bdf8",
    textDecoration: "none",
    fontSize: "13.5px",
    fontWeight: 700,
  },
};

const customCss = `
  input:focus, select:focus, textarea:focus {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15) !important;
  }

  .uploadLabel:hover {
    background: rgba(251, 191, 36, 0.10) !important;
    border-color: #fbbf24 !important;
  }

  @media (max-width: 640px) {
    .formCard {
      padding: 24px 18px !important;
    }
  }
`;
