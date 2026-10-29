import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { canPublishQuickSales } from "../utils/quicksalesPermissions";
import "./QuickSalePostModal.css";

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
  "Furniture", "Electronics", "Appliances", "Tools", "Clothing", "Books",
  "Sports & Outdoors", "Home & Garden", "Beauty & Personal Care", "Toys & Games",
  "Construction Materials", "Vehicles & Parts", "Other",
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "For Parts"];

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const STEPS = [
  {
    label: "Photos",
    title: "Add photos of the item",
    hint: "Buyers decide in seconds. The first photo becomes your cover.",
  },
  {
    label: "Details",
    title: "Describe what you're selling",
    hint: "An honest title, condition and price sell the fastest.",
  },
  {
    label: "Contact",
    title: "Where it is and how to reach you",
    hint: "Interested buyers call or WhatsApp you directly.",
  },
];

const EMPTY_FORM = {
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
};

const formatKES = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return amount.toLocaleString("en-KE");
};

/* ── Icons ───────────────────────────────────────────────────────── */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const IconBolt = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconShield = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconPin = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconChat = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.2 9.2 0 0 1-3.8-.9L3 21l1.9-4.4A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
  </svg>
);

const IconCamera = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconImage = ({ size = 26 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconCheck = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} strokeWidth="2.6">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClose = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} strokeWidth="2.4">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconInfo = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconAlert = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── Component ───────────────────────────────────────────────────── */

// The composer only mounts while the modal is open, so every open starts
// from a clean draft without resetting state from an effect.
export default function QuickSalePostModal({ isOpen, onClose, onItemCreated }) {
  if (!isOpen) return null;
  return <QuickSalesComposer onClose={onClose} onItemCreated={onItemCreated} />;
}

function QuickSalesComposer({ onClose, onItemCreated }) {
  const { token, user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const [photos, setPhotos] = useState([]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    county: user?.county || EMPTY_FORM.county,
    location: user?.location || "",
  }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const canPublish = canPublishQuickSales(user);
  // "guest" = not signed in, "role" = signed in but the account type cannot sell.
  const gateKind = !token ? "guest" : !canPublish ? "role" : null;

  // Escape to dismiss + keep the page behind the modal still.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Release preview URLs when the composer closes.
  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const problems = [];
    const accepted = [];

    incoming.forEach((file) => {
      if (!PHOTO_TYPES.includes(file.type)) {
        problems.push(`"${file.name}" is not a JPG, PNG, WEBP or GIF.`);
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        problems.push(`"${file.name}" is larger than 10 MB.`);
        return;
      }
      accepted.push(file);
    });

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`You have reached the ${MAX_PHOTOS}-photo limit. Remove one to add another.`);
      return;
    }
    if (accepted.length > room) {
      problems.push(`Only ${MAX_PHOTOS} photos per listing — ${accepted.length - room} skipped.`);
    }

    const nextPhotos = accepted.slice(0, room).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return { file, url };
    });

    if (nextPhotos.length) setPhotos((prev) => [...prev, ...nextPhotos]);
    setError(problems.join(" "));
  };

  const removePhoto = (url) => {
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
    setPhotos((prev) => prev.filter((photo) => photo.url !== url));
  };

  const makeCover = (url) => {
    setPhotos((prev) => {
      const cover = prev.find((photo) => photo.url === url);
      if (!cover) return prev;
      return [cover, ...prev.filter((photo) => photo.url !== url)];
    });
  };

  const validateStep = (target) => {
    if (target >= 1 && photos.length === 0) {
      return "Add at least one photo so buyers can see the item.";
    }
    if (target >= 2) {
      if (form.title.trim().length < 4) {
        return "Give your item a clear title (at least 4 characters).";
      }
      if (!(parseFloat(form.price) > 0)) {
        return "Enter the asking price in KES.";
      }
    }
    return "";
  };

  const goToStep = (target) => {
    if (target > step) {
      const message = validateStep(target);
      if (message) {
        setError(message);
        return;
      }
    }
    setError("");
    setStep(target);
  };

  const publish = async () => {
    const message =
      validateStep(2) ||
      (!form.location.trim() ? "Tell buyers the area, estate or town." : "") ||
      (!form.sellerPhone.trim() ? "Add a phone or WhatsApp number buyers can reach." : "");
    if (message) {
      setError(message);
      return;
    }
    if (!token) {
      setError("Please log in to post an item for sale.");
      return;
    }
    if (!canPublishQuickSales(user)) {
      setError("Only AXXSpace members and registered sellers can publish items.");
      return;
    }

    try {
      setError("");
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
      photos.forEach((photo) => formData.append("images", photo.file));

      const res = await fetch(`${API_BASE}/quicksales/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We could not publish your item. Please try again.");

      setSuccess(true);
      if (onItemCreated && data.material) onItemCreated(data.material);
    } catch (err) {
      console.error("Post item error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
      return;
    }
    publish();
  };

  const redirectTarget = typeof window !== "undefined" ? window.location.pathname : "/quicksales";
  const sellerSignupHref = "/quicksales-login?mode=register";
  const loginHref = `/user-login?redirect=${encodeURIComponent(redirectTarget)}`;

  const gate = gateKind === "guest"
    ? {
        eyebrow: "Seller access",
        title: "Start selling in under a minute",
        sub: "QuickSales publishing is reserved for AXXSpace members and registered sellers. Registration is free.",
        points: [
          "Free to join — no listing fees and no commission on sales.",
          "Go live instantly: your listing publishes the moment you post it.",
          "Buyers contact you directly on call or WhatsApp — no middleman.",
        ],
        primary: { label: "Create free seller account", href: sellerSignupHref, variant: "primary" },
        secondary: { label: "I already have an account", href: loginHref, variant: "ghost" },
        fine: (
          <>
            New to AXXSpace?{" "}
            <a href="/register">Create a member account</a> and sell from the same profile.
          </>
        ),
      }
    : gateKind === "role"
      ? {
          eyebrow: "Membership",
          title: "This account can't publish yet",
          sub: "Selling on QuickSales needs a member or seller account. Switching takes about a minute and keeps your AXXSpace history.",
          points: [
            "Upgrade your account to unlock QuickSales publishing.",
            "Keep your favourites, saved searches and alerts.",
            "Free seller accounts publish instantly, with no commission.",
          ],
          primary: { label: "Become an AXXSpace member", href: "/register", variant: "primary" },
          secondary: { label: "Register a seller account instead", href: sellerSignupHref, variant: "ghost" },
          fine: (
            <>
              Need help choosing? <a href="/contact">Talk to AXXSpace support</a>.
            </>
          ),
        }
      : null;

  const previewPhoto = photos[0]?.url;
  const currentStep = STEPS[step];
  const quantity = parseInt(form.quantity, 10) || 1;

  return (
    <div
      className="qsp-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="qsp-shell" role="dialog" aria-modal="true" aria-labelledby="qsp-title">
        <button type="button" className="qsp-close" onClick={onClose} aria-label="Close">
          <IconClose size={16} />
        </button>

        {/* ── Brand rail ── */}
        <aside className="qsp-rail">
          <div className="qsp-brand">
            <span className="qsp-brand-mark">A</span>
            <span className="qsp-brand-text">
              <strong>AxxSpace</strong>
              <em>QuickSales</em>
            </span>
          </div>

          {gate ? (
            <>
              <h2 className="qsp-rail-title">Turn unused items into cash.</h2>
              <p className="qsp-rail-copy">
                Sell directly to buyers across Kenya — no commission, no listing fees, no waiting for approval.
              </p>
              <ul className="qsp-rail-benefits">
                <li>
                  <span className="qsp-benefit-icon"><IconBolt /></span>
                  <span className="qsp-benefit-text">
                    <strong>Live in seconds</strong>
                    <span>Post it and it is visible to buyers immediately.</span>
                  </span>
                </li>
                <li>
                  <span className="qsp-benefit-icon"><IconShield /></span>
                  <span className="qsp-benefit-text">
                    <strong>Verified marketplace</strong>
                    <span>Thousands of AXXSpace members browse QuickSales weekly.</span>
                  </span>
                </li>
                <li>
                  <span className="qsp-benefit-icon"><IconPin /></span>
                  <span className="qsp-benefit-text">
                    <strong>All 47 counties</strong>
                    <span>One free listing reaches buyers nationwide.</span>
                  </span>
                </li>
                <li>
                  <span className="qsp-benefit-icon"><IconChat /></span>
                  <span className="qsp-benefit-text">
                    <strong>Direct WhatsApp</strong>
                    <span>Buyers call or message your phone — not an inbox.</span>
                  </span>
                </li>
              </ul>
              <div className="qsp-rail-foot">
                <span className="qsp-rail-pill">Free to post</span>
                <span className="qsp-rail-pill">No commission</span>
                <span className="qsp-rail-pill">8 photos</span>
              </div>
            </>
          ) : (
            <>
              <p className="qsp-rail-eyebrow">Live preview</p>
              <article className="qsp-preview">
                <div className="qsp-preview-media">
                  {previewPhoto ? (
                    <img src={previewPhoto} alt="Cover preview" />
                  ) : (
                    <IconImage size={30} />
                  )}
                  <span className="qsp-preview-tag">{form.condition}</span>
                </div>
                <div className="qsp-preview-body">
                  <h3>{form.title.trim() || "Your item title"}</h3>
                  <p className="qsp-preview-price">
                    {form.price ? `KES ${formatKES(form.price)}` : "KES —"}
                  </p>
                  <p className="qsp-preview-meta">
                    {form.location.trim() ? `${form.location.trim()}, ` : ""}
                    {form.county}
                  </p>
                  <p className="qsp-preview-seller">
                    Sold by {form.sellerName.trim() || user?.name || "you"}
                  </p>
                </div>
              </article>

              <ol className="qsp-steps">
                {STEPS.map((item, index) => (
                  <li
                    key={item.label}
                    className={`qsp-step ${index === step ? "is-active" : ""} ${index < step ? "is-done" : ""}`}
                  >
                    <span className="qsp-step-dot">
                      {index < step ? <IconCheck size={12} /> : index + 1}
                    </span>
                    <span className="qsp-step-label">{item.label}</span>
                  </li>
                ))}
              </ol>
              <p className="qsp-rail-note">
                Your listing goes live the moment you publish. You can edit or mark it sold from your seller dashboard.
              </p>
            </>
          )}
        </aside>

        {/* ── Panel ── */}
        <section className="qsp-panel">
          <header className="qsp-panel-head">
            <p className="qsp-eyebrow">
              {gate ? gate.eyebrow : `Step ${step + 1} of ${STEPS.length}`}
            </p>
            <h2 className="qsp-panel-title" id="qsp-title">
              {success ? "Your item is live" : gate ? gate.title : currentStep.title}
            </h2>
            <p className="qsp-panel-sub">
              {success
                ? "Buyers can now find, call and message you about it."
                : gate
                  ? gate.sub
                  : currentStep.hint}
            </p>
          </header>

          {!gate && !success && (
            <div className="qsp-progress" aria-hidden="true">
              <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          )}

          {gate ? (
            <div className="qsp-panel-body">
              <div className="qsp-gate">
                {gateKind === "role" && (
                  <div className="qsp-account-chip">
                    Signed in as <strong>{user?.name || user?.email || "your account"}</strong>
                    <span className="qsp-role-tag">{user?.role || "guest"}</span>
                  </div>
                )}

                <ul className="qsp-gate-points">
                  {gate.points.map((point) => (
                    <li key={point}>
                      <IconCheck size={15} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="qsp-gate-actions">
                  <a
                    className={`qsp-btn qsp-btn-${gate.primary.variant} qsp-btn-block`}
                    href={gate.primary.href}
                  >
                    {gate.primary.label}
                  </a>
                  <a
                    className={`qsp-btn qsp-btn-${gate.secondary.variant} qsp-btn-block`}
                    href={gate.secondary.href}
                  >
                    {gate.secondary.label}
                  </a>
                </div>

                <p className="qsp-gate-fine">{gate.fine}</p>
              </div>
            </div>
          ) : success ? (
            <div className="qsp-panel-body">
              <div className="qsp-success">
                <div className="qsp-success-ring"><IconCheck size={28} /></div>
                <h3>Published successfully</h3>
                <p>
                  {form.title.trim()} is now visible on QuickSales. Buyers can reach you on{" "}
                  {form.sellerPhone.trim() || "your phone number"}.
                </p>
                <button type="button" className="qsp-btn qsp-btn-primary" onClick={onClose}>
                  Back to QuickSales
                </button>
              </div>
            </div>
          ) : (
            <form className="qsp-panel-body" onSubmit={handleSubmit}>
              {step === 0 && (
                <>
                  <div className="qsp-group">
                    <div className="qsp-group-label">
                      <span>
                        Item photos <span className="qsp-req">*</span>
                      </span>
                      <span className="qsp-group-hint">
                        {photos.length} of {MAX_PHOTOS}
                      </span>
                    </div>

                    <div
                      className={`qsp-dropzone ${dragging ? "is-drag" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        addFiles(event.dataTransfer.files);
                      }}
                    >
                      <span className="qsp-dropzone-icon"><IconCamera size={22} /></span>
                      <span className="qsp-dropzone-title">
                        Drag &amp; drop photos, or click to browse
                      </span>
                      <span className="qsp-dropzone-sub">JPG, PNG, WEBP or GIF · up to 10 MB each</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={PHOTO_TYPES.join(",")}
                        onChange={(event) => {
                          addFiles(event.target.files);
                          event.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </div>

                    {photos.length > 0 && (
                      <div className="qsp-thumbs">
                        {photos.map((photo, index) => (
                          <div
                            key={photo.url}
                            className={`qsp-thumb ${index === 0 ? "is-cover" : ""}`}
                          >
                            <img src={photo.url} alt={`Item photo ${index + 1}`} />
                            <button
                              type="button"
                              className="qsp-thumb-remove"
                              onClick={() => removePhoto(photo.url)}
                              aria-label={`Remove photo ${index + 1}`}
                            >
                              <IconClose size={11} />
                            </button>
                            {index === 0 ? (
                              <span className="qsp-thumb-cover">Cover</span>
                            ) : (
                              <button
                                type="button"
                                className="qsp-thumb-cover"
                                onClick={() => makeCover(photo.url)}
                              >
                                Set cover
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="qsp-photo-tips">
                      <span>Natural light</span>
                      <span>Real photos only</span>
                      <span>Show any defects</span>
                      <span>Include the whole item</span>
                    </div>
                  </div>

                  <div className="qsp-note">
                    <IconInfo size={14} />
                    <span>
                      Listings with 3 or more clear photos attract noticeably more buyer messages.
                    </span>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="qsp-group">
                    <div className="qsp-group-label">
                      <span>
                        Item title <span className="qsp-req">*</span>
                      </span>
                      <span className="qsp-group-hint">{form.title.length}/80</span>
                    </div>
                    <input
                      className="qsp-input"
                      type="text"
                      maxLength={80}
                      placeholder="e.g. 3-Seater Recliner Sofa, HP Core i5 Laptop"
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                    />
                  </div>

                  <div className="qsp-row">
                    <div className="qsp-group">
                      <label className="qsp-group-label" htmlFor="qsp-category">
                        <span>
                          Category <span className="qsp-req">*</span>
                        </span>
                      </label>
                      <select
                        id="qsp-category"
                        className="qsp-select"
                        value={form.category}
                        onChange={(event) => updateField("category", event.target.value)}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="qsp-group">
                      <div className="qsp-group-label">
                        <span>
                          Price (KES) <span className="qsp-req">*</span>
                        </span>
                      </div>
                      <div className="qsp-input-wrap">
                        <span className="qsp-input-prefix">KES</span>
                        <input
                          className="qsp-input"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="15000"
                          value={form.price}
                          onChange={(event) => updateField("price", event.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="qsp-group">
                    <div className="qsp-group-label"><span>Condition</span></div>
                    <div className="qsp-chips">
                      {CONDITIONS.map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          className={`qsp-chip ${form.condition === condition ? "is-active" : ""}`}
                          onClick={() => updateField("condition", condition)}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="qsp-row">
                    <div className="qsp-group">
                      <div className="qsp-group-label"><span>Quantity available</span></div>
                      <div className="qsp-qty">
                        <button
                          type="button"
                          onClick={() => updateField("quantity", String(Math.max(1, quantity - 1)))}
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={form.quantity}
                          onChange={(event) => updateField("quantity", event.target.value)}
                          aria-label="Quantity"
                        />
                        <button
                          type="button"
                          onClick={() => updateField("quantity", String(quantity + 1))}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="qsp-group">
                      <div className="qsp-group-label">
                        <span>Description</span>
                        <span className="qsp-group-hint">{form.description.length}/600</span>
                      </div>
                      <textarea
                        className="qsp-textarea"
                        maxLength={600}
                        rows={3}
                        placeholder="Features, age, warranty, reason for selling, pick-up details…"
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="qsp-row">
                    <div className="qsp-group">
                      <label className="qsp-group-label" htmlFor="qsp-county">
                        <span>
                          County <span className="qsp-req">*</span>
                        </span>
                      </label>
                      <select
                        id="qsp-county"
                        className="qsp-select"
                        value={form.county}
                        onChange={(event) => updateField("county", event.target.value)}
                      >
                        {COUNTIES.map((county) => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>

                    <div className="qsp-group">
                      <div className="qsp-group-label">
                        <span>
                          Area, estate or town <span className="qsp-req">*</span>
                        </span>
                      </div>
                      <input
                        className="qsp-input"
                        type="text"
                        maxLength={70}
                        placeholder="e.g. Westlands, near Sarit"
                        value={form.location}
                        onChange={(event) => updateField("location", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="qsp-row">
                    <div className="qsp-group">
                      <div className="qsp-group-label">
                        <span>
                          WhatsApp / phone <span className="qsp-req">*</span>
                        </span>
                      </div>
                      <input
                        className="qsp-input"
                        type="tel"
                        placeholder="e.g. 0712 345 678"
                        value={form.sellerPhone}
                        onChange={(event) => updateField("sellerPhone", event.target.value)}
                      />
                    </div>

                    <div className="qsp-group">
                      <div className="qsp-group-label"><span>Display name</span></div>
                      <input
                        className="qsp-input"
                        type="text"
                        maxLength={50}
                        placeholder={user?.name || "Your name or business name"}
                        value={form.sellerName}
                        onChange={(event) => updateField("sellerName", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="qsp-note">
                    <IconInfo size={14} />
                    <span>
                      Your number is shown only on this listing. It is never displayed on your AXXSpace profile.
                    </span>
                  </div>

                  <div className="qsp-group">
                    <div className="qsp-group-label"><span>Review before publishing</span></div>
                    <div className="qsp-review">
                      <div className="qsp-review-media">
                        {previewPhoto && <img src={previewPhoto} alt="Listing cover" />}
                      </div>
                      <div className="qsp-review-body">
                        <strong>{form.title.trim() || "Untitled item"}</strong>
                        <span>
                          KES {formatKES(form.price) || "—"} · {form.condition} · Qty {quantity}
                        </span>
                        <span>
                          {form.location.trim() ? `${form.location.trim()}, ` : ""}{form.county}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </form>
          )}

          {!gate && !success && (
            <footer className="qsp-panel-foot">
              {error && (
                <div className="qsp-alert" role="alert">
                  <IconAlert size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="qsp-actions">
                {step === 0 ? (
                  <button type="button" className="qsp-btn qsp-btn-quiet" onClick={onClose}>
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="qsp-btn qsp-btn-quiet"
                    onClick={() => goToStep(step - 1)}
                  >
                    Back
                  </button>
                )}

                <div className="qsp-actions-right">
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      className="qsp-btn qsp-btn-primary"
                      onClick={() => goToStep(step + 1)}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="qsp-btn qsp-btn-primary"
                      onClick={publish}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="qsp-spinner" /> Publishing…
                        </>
                      ) : (
                        "Publish live"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </footer>
          )}
        </section>
      </div>
    </div>
  );
}
