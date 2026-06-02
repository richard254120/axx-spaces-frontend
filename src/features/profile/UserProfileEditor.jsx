import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { fetchUserProfile, updateUserProfile, buildProfileFormData } from "../../api/profile";
import ProfileAvatar from "./ProfileAvatar";
import PhoneInput from "../../components/PhoneInput";

const MOVER_SERVICES = [
  "Household Moving", "Office Relocation", "Furniture Moving",
  "Appliance Moving", "Piano Moving", "Storage Services",
];
const VEHICLE_TYPES = ["Pickup", "Van", "Lorry", "Motorbike", "Truck"];

/**
 * Reusable profile card with photo upload — works for all dashboard roles.
 */
export default function UserProfileEditor({
  token: tokenProp,
  user: userProp,
  onUpdated,
  accentColor = "#fbbf24",
  showMoverFields = false,
  compact = false,
}) {
  const { token: ctxToken, user: ctxUser, login } = useContext(AuthContext);
  const token = tokenProp || ctxToken || localStorage.getItem("token") || localStorage.getItem("sellerToken");
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(userProp || ctxUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(!userProp);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", county: "", vehicleType: "", experienceYears: "",
    services: [], description: "",
  });

  const isMover = showMoverFields || profile?.role === "mover";

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile(token);
        if (!cancelled && data) {
          setProfile(data);
          syncForm(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (userProp) {
      setProfile(userProp);
      syncForm(userProp);
    }
  }, [userProp]);

  const syncForm = (u) => {
    setForm({
      name: u?.name || "",
      phone: u?.phone || "",
      county: u?.county || "",
      vehicleType: u?.vehicleType || "",
      experienceYears: u?.experienceYears ?? "",
      services: u?.services || [],
      description: u?.description || "",
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    setRemovePhoto(false);
  };

  const openEdit = () => {
    syncForm(profile);
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    setAvatarFile(file);
    setRemovePhoto(false);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = buildProfileFormData({
        name: form.name.trim(),
        phone: form.phone.trim(),
        county: form.county,
        vehicleType: form.vehicleType,
        experienceYears: form.experienceYears,
        services: form.services,
        description: form.description,
        avatarFile,
        removeProfileImage: removePhoto,
      });
      const res = await updateUserProfile(token, fd);
      const updated = res.data?.user;
      if (updated) {
        setProfile(updated);
        if (login && ctxToken) login(token, updated);
        localStorage.setItem("user", JSON.stringify(updated));
        const tourismUser = localStorage.getItem("tourismUser");
        if (tourismUser) {
          localStorage.setItem("tourismUser", JSON.stringify({
            id: updated._id,
            name: updated.name,
            email: updated.email,
          }));
        }
        const sellerUser = localStorage.getItem("sellerUser");
        if (sellerUser) localStorage.setItem("sellerUser", JSON.stringify(updated));
      }
      setSuccess(res.message || "Profile updated");
      setEditing(false);
      onUpdated?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return <p style={{ color: "#6b7280", padding: "20px 0" }}>Loading profile…</p>;
  }

  if (!profile) return null;

  const displayUser = avatarPreview
    ? { ...profile, profileImage: avatarPreview }
    : removePhoto
      ? { ...profile, profileImage: "" }
      : profile;

  const cardStyle = {
    background: "white",
    padding: compact ? "18px" : "22px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  };

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: editing ? "16px" : "0" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#1f2937" }}>Your profile</h2>
        {!editing && (
          <button
            type="button"
            onClick={openEdit}
            style={{
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}`,
              color: "#1f2937",
              borderRadius: "10px",
              padding: "8px 14px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✏️ Update profile
          </button>
        )}
      </div>

      {success && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginTop: "12px" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginTop: "12px" }}>
          {error}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
            <ProfileAvatar user={displayUser} size={100} />
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button type="button" onClick={() => fileRef.current?.click()} style={photoBtn(accentColor)}>
                📷 Upload photo
              </button>
              {(profile.profileImage || avatarPreview) && !removePhoto && (
                <button type="button" onClick={() => { setRemovePhoto(true); setAvatarFile(null); setAvatarPreview(null); }} style={ghostBtn}>
                  Remove photo
                </button>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>JPG or PNG, max 5MB</p>
          </div>

          <div style={fieldGrid}>
            <Field label="Full name *">
              <input style={input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </Field>
            <Field label="Phone *">
              <input style={input} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
            </Field>
            <Field label="Email">
              <input style={{ ...input, background: "#f9fafb", color: "#6b7280" }} value={profile.email} disabled />
            </Field>
            <Field label="Role">
              <input style={{ ...input, background: "#f9fafb", color: "#6b7280" }} value={profile.role} disabled />
            </Field>
            {(isMover || profile.role === "seller" || profile.role === "landlord") && (
              <Field label="County">
                <input style={input} value={form.county} onChange={(e) => setForm((f) => ({ ...f, county: e.target.value }))} />
              </Field>
            )}
          </div>

          {isMover && (
            <>
              <Field label="Vehicle type">
                <select style={input} value={form.vehicleType} onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}>
                  <option value="">Select…</option>
                  {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Years of experience">
                <input style={input} type="number" min={0} value={form.experienceYears} onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))} />
              </Field>
              <Field label="Services">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {MOVER_SERVICES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
                      }))}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: `1px solid ${form.services.includes(s) ? "#3b82f6" : "#e5e7eb"}`,
                        background: form.services.includes(s) ? "#dbeafe" : "white",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Bio / description">
                <textarea style={{ ...input, minHeight: "80px" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            <button type="submit" disabled={saving} style={primaryBtn(accentColor)}>
              {saving ? "Saving…" : "Save profile"}
            </button>
            <button type="button" onClick={() => { setEditing(false); syncForm(profile); }} style={ghostBtn}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginTop: "16px", flexWrap: "wrap" }}>
          <ProfileAvatar user={profile} size={compact ? 72 : 88} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", flex: 1 }}>
            <Info label="Name" value={profile.name} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone || "—"} />
            <Info label="Role" value={profile.role} />
            {profile.county && <Info label="County" value={profile.county} />}
            {profile.memberSince && (
              <Info label="Member since" value={new Date(profile.memberSince).toLocaleDateString("en-KE", { month: "short", year: "numeric" })} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <span style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: "5px" }}>{label}</span>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1f2937", marginTop: "4px" }}>{value}</div>
    </div>
  );
}

const fieldGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "4px 14px" };
const input = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "11px 12px", fontSize: "14px", fontFamily: "inherit" };
const photoBtn = (c) => ({ background: c, border: "none", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#1f2937" });
const primaryBtn = (c) => ({ ...photoBtn(c), padding: "11px 22px" });
const ghostBtn = { background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" };
