import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  TOURISM_FONT_CSS,
  tourismTheme,
  PROPERTY_CATEGORIES,
  KENYA_COUNTIES,
  AMENITIES_LIST,
} from "../../features/tourism";
import { fetchOwnerListing, updateOwnerListing } from "../../api/tourism";
import { getTourismToken } from "../../features/tourism";

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getTourismToken();

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
          category: data.category || "",
          description: data.description || "",
          county: data.county || "",
          town: data.town || "",
          address: data.address || "",
          mapLink: data.mapLink || "",
          basePrice: data.price ?? "",
          weekendPrice: data.weekendPrice ?? "",
          peakPrice: data.peakPrice ?? "",
          bookingUrl: data.bookingUrl || "",
          amenities: data.amenities || [],
          checkIn: data.policiesRaw?.checkIn || "14:00",
          checkOut: data.policiesRaw?.checkOut || "11:00",
          cancellation: data.policiesRaw?.cancellation || "48",
          managerName: data.manager?.name || "",
          phone: data.manager?.phone || "",
          email: data.manager?.email || "",
          whatsapp: data.manager?.whatsapp || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (a) => setForm((f) => ({
    ...f,
    amenities: f.amenities?.includes(a) ? f.amenities.filter((x) => x !== a) : [...(f.amenities || []), a],
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
      setSuccess(res.message || "Saved!");
      setProperty(res.data);
      setNewImages([]);
      setNewVideos([]);
      setRemoveImages([]);
      setRemoveVideos([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={page}>
        <style>{TOURISM_FONT_CSS}</style>
        <LoadingBlock message="Loading your property…" />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={page}>
        <ErrorAlert message={error || "Property not found"} />
        <button type="button" style={btnPrimary} onClick={() => navigate("/tourism/dashboard")}>← Dashboard</button>
      </div>
    );
  }

  const currentImages = (property.images || []).filter((u) => !removeImages.includes(u));
  const currentVideos = (property.videos || []).filter((u) => !removeVideos.includes(u));

  return (
    <div style={page}>
      <style>{TOURISM_FONT_CSS}</style>

      <div style={topBar}>
        <button type="button" style={btnGhost} onClick={() => navigate("/tourism/dashboard")}>← Dashboard</button>
        <h1 style={{ fontSize: "20px", fontWeight: 800 }}>Edit property</h1>
      </div>

      <div style={statusBox(property.status)}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <StatusBadge status={property.status} />
          <strong>{property.name}</strong>
        </div>
        <p style={{ fontSize: "13px", marginTop: "10px", lineHeight: 1.6 }}>{property.statusMessage}</p>
        {property.submittedAt && (
          <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.85 }}>
            Submitted: {new Date(property.submittedAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
            {property.lastUpdated && ` · Last updated: ${new Date(property.lastUpdated).toLocaleDateString("en-KE", { dateStyle: "medium" })}`}
          </p>
        )}
      </div>

      {error && <ErrorAlert message={error} />}
      {success && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave} style={formCard}>
        <h2 style={sectionTitle}>Photos & videos</h2>
        <p style={hint}>Upload photos and short videos of your property. Removing media saves when you click Save changes.</p>

        {currentImages.length > 0 && (
          <div style={mediaGrid}>
            {currentImages.map((url) => (
              <div key={url} style={mediaItem}>
                <img src={url} alt="" style={mediaImg} />
                <button type="button" style={removeBtn} onClick={() => setRemoveImages((r) => [...r, url])}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {currentVideos.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>Videos</div>
            <div style={mediaGrid}>
              {currentVideos.map((url) => (
                <div key={url} style={mediaItem}>
                  <video src={url} controls style={mediaImg} />
                  <button type="button" style={removeBtn} onClick={() => setRemoveVideos((r) => [...r, url])}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
          <label style={uploadLabel}>
            <span>📷 Add photos</span>
            <input type="file" accept="image/*" multiple hidden onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
          </label>
          <label style={uploadLabel}>
            <span>🎬 Add videos</span>
            <input type="file" accept="video/*" multiple hidden onChange={(e) => setNewVideos([...newVideos, ...Array.from(e.target.files)])} />
          </label>
        </div>
        {(newImages.length > 0 || newVideos.length > 0) && (
          <p style={{ fontSize: "12px", color: tourismTheme.muted, marginTop: "8px" }}>
            Ready to upload: {newImages.length} photo(s), {newVideos.length} video(s)
          </p>
        )}

        <h2 style={{ ...sectionTitle, marginTop: "28px" }}>Property details</h2>

        <Field label="Property name *">
          <input style={input} value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </Field>
        <Field label="Category *">
          <select style={input} value={form.category} onChange={(e) => update("category", e.target.value)} required>
            <option value="">Select…</option>
            {PROPERTY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description *">
          <textarea style={{ ...input, minHeight: "120px" }} value={form.description} onChange={(e) => update("description", e.target.value)} required />
        </Field>

        <div style={twoCol}>
          <Field label="County *">
            <select style={input} value={form.county} onChange={(e) => update("county", e.target.value)} required>
              <option value="">Select…</option>
              {KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Town / area *">
            <input style={input} value={form.town} onChange={(e) => update("town", e.target.value)} required />
          </Field>
        </div>
        <Field label="Address">
          <input style={input} value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
        <Field label="Google Maps link">
          <input style={input} value={form.mapLink} onChange={(e) => update("mapLink", e.target.value)} />
        </Field>

        <h2 style={{ ...sectionTitle, marginTop: "24px" }}>Pricing & booking</h2>
        <div style={twoCol}>
          <Field label="Price per night (KSh) *">
            <input style={input} type="number" value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} required />
          </Field>
          <Field label="Booking website URL">
            <input style={input} type="url" value={form.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} placeholder="https://…" />
          </Field>
        </div>

        <h2 style={{ ...sectionTitle, marginTop: "24px" }}>Amenities</h2>
        <div style={amenityGrid}>
          {AMENITIES_LIST.map((a) => (
            <button
              key={a}
              type="button"
              style={{
                ...amenityChip,
                ...(form.amenities?.includes(a) ? amenityChipOn : {}),
              }}
              onClick={() => toggleAmenity(a)}
            >
              {form.amenities?.includes(a) ? "✓ " : ""}{a}
            </button>
          ))}
        </div>

        <h2 style={{ ...sectionTitle, marginTop: "24px" }}>Contact (shown to guests)</h2>
        <div style={twoCol}>
          <Field label="Manager name">
            <input style={input} value={form.managerName} onChange={(e) => update("managerName", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input style={input} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
        </div>
        <Field label="Email">
          <input style={input} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Field>

        <div style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {property.status === "approved" && (
            <button type="button" style={btnGhost} onClick={() => navigate(`/tourism/${id}`)}>View live listing</button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

function statusBox(status) {
  const colors = {
    pending: { bg: "#fffbeb", border: "#fde68a", text: "#78350f" },
    approved: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    rejected: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  };
  const c = colors[status] || colors.pending;
  return { background: c.bg, border: `1px solid ${c.border}`, color: c.text, padding: "16px", borderRadius: "12px", marginBottom: "20px", maxWidth: "800px" };
}

const page = { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh", padding: "24px 20px", maxWidth: "840px", margin: "0 auto" };
const topBar = { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" };
const formCard = { background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" };
const sectionTitle = { fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" };
const hint = { fontSize: "13px", color: "#6b7280", marginBottom: "14px", lineHeight: 1.5 };
const input = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px", fontSize: "14px", fontFamily: "inherit" };
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
const btnPrimary = { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" };
const btnGhost = { background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const mediaGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" };
const mediaItem = { position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb" };
const mediaImg = { width: "100%", height: "120px", objectFit: "cover", display: "block" };
const removeBtn = { position: "absolute", bottom: "6px", right: "6px", background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" };
const uploadLabel = { display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #fbbf24", borderRadius: "12px", padding: "20px", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#92400e", background: "#fffbeb" };
const amenityGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" };
const amenityChip = { border: "1px solid #e5e7eb", background: "white", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
const amenityChipOn = { background: "#fef9c3", borderColor: "#fbbf24", fontWeight: 700 };
