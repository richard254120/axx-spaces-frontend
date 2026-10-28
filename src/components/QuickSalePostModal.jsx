import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const COUNTIES = [
  "Nairobi City", "Kiambu", "Mombasa", "Nakuru", "Machakos", "Kisumu", "Uasin Gishu",
  "Kajiado", "Kilifi", "Nyeri", "Murang'a", "Meru", "Kakamega", "Bungoma", "Embu",
  "Kirinyaga", "Laikipia", "Kericho", "Bomet", "Kitui", "Makueni", "Nyandarua",
  "Trans Nzoia", "Nandi", "Homa Bay", "Migori", "Kisii", "Siaya", "Busia", "Vihiga",
  "Kwale", "Taita Taveta", "Lamu", "Tana River", "Garissa", "Wajir", "Mandera",
  "Marsabit", "Isiolo", "Tharaka Nithi", "Turkana", "West Pokot", "Samburu",
  "Elgeyo Marakwet", "Baringo", "Narok", "Nyamira"
];

const CATEGORIES = [
  { name: "Furniture", icon: "🪑" },
  { name: "Electronics", icon: "💻" },
  { name: "Appliances", icon: "🔌" },
  { name: "Tools", icon: "🔧" },
  { name: "Clothing", icon: "👕" },
  { name: "Books", icon: "📚" },
  { name: "Sports & Outdoors", icon: "⚽" },
  { name: "Home & Garden", icon: "🪴" },
  { name: "Beauty & Personal Care", icon: "✨" },
  { name: "Toys & Games", icon: "🎮" },
  { name: "Construction Materials", icon: "🏗️" },
  { name: "Vehicles & Parts", icon: "🚗" },
  { name: "Other", icon: "📦" },
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "For Parts"];

export default function QuickSalePostModal({ isOpen, onClose, onItemCreated }) {
  const { token, user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Furniture",
    subcategory: "",
    condition: "Good",
    price: "",
    quantity: "1",
    county: "Nairobi City",
    location: "",
    description: "",
    sellerPhone: "",
    sellerName: "",
  });

  // Prefill phone and name from logged in user if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        sellerPhone: prev.sellerPhone || user.phone || "",
        sellerName: prev.sellerName || user.name || user.username || "",
        county: prev.county || user.county || "Nairobi City",
        location: prev.location || user.location || "",
      }));
    }
  }, [user]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 8) {
      setError("You can upload a maximum of 8 photos.");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError("");
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Please log in to post an item for sale.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter an item title.");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Please enter a valid price (KES).");
      return;
    }
    if (!form.location.trim()) {
      setError("Please specify your town, estate, or neighborhood.");
      return;
    }
    if (!form.sellerPhone.trim()) {
      setError("Please provide a phone / WhatsApp number so buyers can reach you.");
      return;
    }
    if (images.length === 0) {
      setError("Please add at least 1 photo of your item.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim() || form.title.trim());
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory.trim());
      formData.append("condition", form.condition);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity || "1");
      formData.append("county", form.county);
      formData.append("location", form.location.trim());
      formData.append("sellerPhone", form.sellerPhone.trim());
      formData.append("sellerName", form.sellerName.trim() || user?.name || "Seller");

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(`${API_BASE}/quicksales/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to post item.");
      }

      setSuccess(true);
      if (onItemCreated && data.material) {
        onItemCreated(data.material);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Post item error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badgeRow}>
              <span style={styles.instantBadge}>⚡ INSTANT LIVE</span>
              <span style={styles.freeBadge}>FREE POSTING</span>
            </div>
            <h2 style={styles.title}>Post an Item on QuickSales</h2>
            <p style={styles.subtitle}>Sell to thousands of verified buyers across Kenya. Goes live immediately!</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Not logged in gate */}
        {!token ? (
          <div style={styles.authNotice}>
            <div style={styles.authIcon}>🔒</div>
            <h3 style={styles.authTitle}>Login Required to Post</h3>
            <p style={styles.authText}>
              Any user, student, member, or landlord can post items for free. Please log in or create an account to start selling.
            </p>
            <div style={styles.authBtns}>
              <a
                href={`/user-login?redirect=${encodeURIComponent(window.location.pathname)}`}
                style={styles.authLoginBtn}
              >
                Log In
              </a>
              <a
                href={`/user-login?signup=true&redirect=${encodeURIComponent(window.location.pathname)}`}
                style={styles.authRegisterBtn}
              >
                Create Free Account
              </a>
            </div>
          </div>
        ) : success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.successTitle}>Item Posted Successfully!</h3>
            <p style={styles.successText}>Your listing is now LIVE on QuickSales. Buyers can call and message you directly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorBanner}>{error}</div>}

            {/* Photos upload area */}
            <div style={styles.section}>
              <label style={styles.label}>
                Item Photos <span style={styles.required}>* (1 to 8 photos)</span>
              </label>
              <div
                style={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={styles.uploadIcon}>📸</div>
                <div style={styles.uploadTitle}>Click to upload photos</div>
                <div style={styles.uploadSub}>Clear, well-lit photos sell 4× faster</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Thumbnails preview */}
              {previews.length > 0 && (
                <div style={styles.previewGrid}>
                  {previews.map((src, idx) => (
                    <div key={idx} style={styles.thumbWrapper}>
                      <img src={src} alt={`Upload ${idx + 1}`} style={styles.thumb} />
                      <button
                        type="button"
                        style={styles.removeThumbBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                      >
                        ✕
                      </button>
                      {idx === 0 && <span style={styles.coverBadge}>Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 2 }}>
                <label style={styles.label}>
                  Item Title <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3-Seater Recliner Sofa, HP Core i5 Laptop..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>
                  Category <span style={styles.required}>*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={styles.select}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition, Price, Quantity */}
            <div style={styles.rowThree}>
              <div style={styles.field}>
                <label style={styles.label}>Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  style={styles.select}
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Price (KES) <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  style={styles.input}
                  min="1"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  style={styles.input}
                  min="1"
                />
              </div>
            </div>

            {/* Location & County */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>
                  County <span style={styles.required}>*</span>
                </label>
                <select
                  value={form.county}
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                  style={styles.select}
                  required
                >
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.field, flex: 1.5 }}>
                <label style={styles.label}>
                  Area / Estate / Town <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Westlands, near Sarit / Kahawa Sukari"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Mention features, warranty, age of the item, reason for sale, pick-up details..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={styles.textarea}
              />
            </div>

            {/* Contact details */}
            <div style={styles.contactCard}>
              <div style={styles.contactHeader}>
                <span style={{ fontSize: "18px" }}>📞</span>
                <div>
                  <h4 style={styles.contactTitle}>Direct Buyer Contact</h4>
                  <p style={styles.contactSub}>Buyers will call or chat with you on WhatsApp regarding this item.</p>
                </div>
              </div>
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1, marginBottom: 0 }}>
                  <label style={styles.label}>
                    WhatsApp / Phone Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0712345678 or +254 712..."
                    value={form.sellerPhone}
                    onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={{ ...styles.field, flex: 1, marginBottom: 0 }}>
                  <label style={styles.label}>Seller Display Name</label>
                  <input
                    type="text"
                    placeholder="Your Name / Business"
                    value={form.sellerName}
                    onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div style={styles.actions}>
              <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={loading}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Publishing Item..." : "Publish Item Now (Live)"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(4, 36, 77, 0.65)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "16px",
    overflowY: "auto",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "680px",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(4, 36, 77, 0.35)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    animation: "fadeInModal 0.2s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "16px",
    marginBottom: "18px",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "6px",
  },
  instantBadge: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "6px",
    letterSpacing: "0.5px",
  },
  freeBadge: {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "6px",
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#04244D",
    margin: "0 0 4px 0",
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    color: "#64748b",
    transition: "all 0.15s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
    display: "block",
    marginBottom: "5px",
  },
  required: {
    color: "#E51A24",
    fontWeight: "600",
  },
  dropzone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
  },
  uploadIcon: {
    fontSize: "28px",
    marginBottom: "4px",
  },
  uploadTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#04244D",
  },
  uploadSub: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },
  thumbWrapper: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removeThumbBtn: {
    position: "absolute",
    top: "3px",
    right: "3px",
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  coverBadge: {
    position: "absolute",
    bottom: "2px",
    left: "2px",
    backgroundColor: "#E51A24",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "800",
    padding: "1px 5px",
    borderRadius: "4px",
  },
  row: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },
  rowThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  contactCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  contactHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  contactTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#04244D",
    margin: 0,
  },
  contactSub: {
    fontSize: "11px",
    color: "#64748b",
    margin: 0,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "14px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#64748b",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#E51A24",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(229, 26, 36, 0.3)",
    transition: "all 0.2s ease",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
  },
  authNotice: {
    textAlign: "center",
    padding: "36px 20px",
  },
  authIcon: {
    fontSize: "44px",
    marginBottom: "12px",
  },
  authTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#04244D",
    margin: "0 0 8px 0",
  },
  authText: {
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "420px",
    margin: "0 auto 20px auto",
    lineHeight: "1.5",
  },
  authBtns: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  authLoginBtn: {
    padding: "10px 24px",
    backgroundColor: "#04244D",
    color: "#ffffff",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
  },
  authRegisterBtn: {
    padding: "10px 24px",
    backgroundColor: "#E51A24",
    color: "#ffffff",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
  },
  successBox: {
    textAlign: "center",
    padding: "40px 20px",
  },
  successIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  successTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#15803d",
    margin: "0 0 8px 0",
  },
  successText: {
    fontSize: "14px",
    color: "#64748b",
  },
};
