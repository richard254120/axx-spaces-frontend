import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ─── Mixed Colour Palette ──────────────────────────────────────────────────────
const C = {
  // Navy (navbar / brand)
  navy: "#0C447C",
  navyLight: "#185FA5",
  navyDim: "#E6F1FB",
  navyBorder: "#B5D4F4",
  navyText: "#85B7EB",

  // Teal (success / WhatsApp / verified)
  teal: "#1D9E75",
  tealDark: "#085041",
  tealMid: "#0F6E56",
  tealLight: "#E1F5EE",
  tealBorder: "#9FE1CB",

  // Amber (stars / featured ribbon / featured book btn)
  amber: "#FAC775",
  amberDark: "#412402",
  amberMid: "#BA7517",

  // Page / surfaces
  page: "#F1EFE8",
  surface: "#FFFFFF",
  surfaceSub: "#F1EFE8",

  // Text
  textPrimary: "#2C2C2A",
  textMuted: "#5F5E5A",
  textHint: "#888780",

  // Borders
  border: "#D3D1C7",
  borderLight: "#E8E6E0",

  // Danger
  red: "#A32D2D",
  redLight: "#FCEBEB",
  redBorder: "#F7C1C1",
};

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Avatar palettes ───────────────────────────────────────────────────────────
// Regular cards: light bg + dark navy/teal text
const avReg = [
  ["#E6F1FB", "#0C447C"], ["#E1F5EE", "#085041"],
  ["#FAEEDA", "#633806"], ["#FBEAF0", "#72243E"], ["#EEEDFE", "#3C3489"],
];
// Featured cards: vivid bg + light text (sits on navy card)
const avFeat = [
  ["#1D9E75", "#E1F5EE"], ["#EF9F27", "#412402"],
  ["#7F77DD", "#EEEDFE"], ["#D4537E", "#FBEAF0"], ["#378ADD", "#E6F1FB"],
];
function palIdx(name) { return (name?.charCodeAt(0) || 0) % 5; }

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 42, featured = false }) {
  const init = (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const [bg, color] = (featured ? avFeat : avReg)[palIdx(name)];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>{init}</div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function StarRating({ value = 4.5, featured = false }) {
  return (
    <span>
      <span style={{ color: featured ? C.amber : C.amberMid, fontSize: 12, letterSpacing: 1 }}>
        {"★".repeat(Math.floor(value))}{"☆".repeat(5 - Math.floor(value))}
      </span>
      <span style={{ color: featured ? C.navyText : C.textHint, fontSize: 11, marginLeft: 4 }}>
        {(+value).toFixed(1)}
      </span>
    </span>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ children, featured = false }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
      background: featured ? "rgba(255,255,255,0.10)" : C.page,
      color: featured ? C.navyText : C.textMuted,
      border: `1px solid ${featured ? "rgba(133,183,235,0.3)" : C.border}`,
    }}>{children}</span>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function VerifiedBadge({ featured = false }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: featured ? C.tealMid : C.tealLight,
      color: featured ? C.tealBorder : C.tealDark,
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, marginLeft: 5,
    }}>✓ Verified</span>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 12px" }}>
      <div style={{ flex: 1, height: "0.5px", background: C.border }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: C.textHint, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: "0.5px", background: C.border }} />
    </div>
  );
}

// ─── Field Input ─────────────────────────────────────────────────────────────
function FieldInput({ label, ...props }) {
  const base = {
    width: "100%", padding: "9px 12px",
    background: C.page, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.textPrimary, fontFamily: font,
    fontSize: 13, boxSizing: "border-box", outline: "none", transition: ".15s",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <input style={base}
        onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.boxShadow = `0 0 0 3px ${C.navyDim}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
        {...props} />
    </div>
  );
}

// ─── Field Select ─────────────────────────────────────────────────────────────
function FieldSelect({ label, children, ...props }) {
  const base = {
    width: "100%", padding: "9px 12px",
    background: C.page, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.textPrimary, fontFamily: font,
    fontSize: 13, boxSizing: "border-box", cursor: "pointer", outline: "none",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <select style={base}
        onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.boxShadow = `0 0 0 3px ${C.navyDim}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
        {...props}>{children}</select>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ type, children }) {
  const s = type === "error"
    ? { bg: C.redLight, color: "#791F1F", border: C.redBorder }
    : { bg: C.tealLight, color: C.tealDark, border: C.tealBorder };
  return (
    <div style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: "10px 13px", fontSize: 13, marginBottom: 14, lineHeight: 1.5,
    }}>{children}</div>
  );
}

// ─── Mover Card ───────────────────────────────────────────────────────────────
function MoverCard({ m, onBook, featured }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, padding: 18,
        display: "flex", flexDirection: "column",
        transition: "transform .15s, box-shadow .15s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov && !featured ? "0 6px 20px rgba(0,0,0,0.08)" : "none",
        position: "relative", overflow: "hidden",
        background: featured ? C.navy : C.surface,
        border: featured
          ? `2px solid ${C.navyLight}`
          : `1px solid ${hov ? "#B4B2A9" : C.border}`,
      }}
    >
      {featured && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: C.amber, color: C.amberDark,
          fontSize: 10, fontWeight: 800,
          padding: "3px 12px",
          borderBottomLeftRadius: 8,
          letterSpacing: 0.5,
        }}>FEATURED</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <Avatar name={m.name} size={56} featured={featured} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: featured ? "#fff" : C.textPrimary }}>{m.name}</span>
            <VerifiedBadge featured={featured} />
          </div>
          {m.company && (
            <div style={{ fontSize: 11, color: featured ? C.navyText : C.textHint, marginBottom: 2 }}>
              🏢 {m.company}
            </div>
          )}
          <div style={{ fontSize: 12, color: featured ? C.navyText : C.textHint, marginBottom: 4 }}>
            📍 {m.county}
          </div>
          <StarRating value={m.rating || 4.5} featured={featured} />
        </div>
      </div>

      {/* Verification Badges */}
      {m.verificationBadges && m.verificationBadges.length > 0 && (
        <div style={{
          marginTop: "10px",
          padding: "8px",
          background: featured ? "rgba(14, 165, 233, 0.15)" : "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%)",
          borderRadius: "8px",
          border: featured ? "1px solid rgba(14, 165, 233, 0.4)" : "1px solid rgba(14, 165, 233, 0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ fontSize: 11 }}>✅</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: featured ? C.navyText : "#0ea5e9" }}>Verified Mover</span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {m.verificationBadges.map((badgeId) => (
              <div key={badgeId} style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={`/${badgeId.replace(/_/g, ' ')}.png`}
                  alt={badgeId}
                  style={{
                    width: "28px",
                    height: "28px",
                    objectFit: "contain",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                  }}
                  title={badgeId.replace(/_/g, ' ').toUpperCase()}
                />
                <div style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: featured ? "#1e293b" : "#0f1729",
                  color: "#f1f5f9",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  opacity: 0,
                  visibility: "hidden",
                  transition: "all 0.2s",
                  marginBottom: "4px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  zIndex: 10,
                  pointerEvents: "none"
                }}>
                  {badgeId.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        <Pill featured={featured}>🚗 {m.vehicleType || "Pickup"}</Pill>
        <Pill featured={featured}>⏱ {m.experienceYears || m.experience || 0} yrs</Pill>
        {m.teamInfo?.teamSize && <Pill featured={featured}>👥 {m.teamInfo.teamSize} team</Pill>}
        {m.responseTime && <Pill featured={featured}>⚡ {m.responseTime}</Pill>}
      </div>

      {/* Availability & Languages */}
      {(m.languages && m.languages.length > 0) && (
        <div style={{ marginBottom: 10 }}>
          {m.languages && m.languages.length > 0 && (
            <div style={{ fontSize: 10, color: featured ? C.navyText : C.textHint }}>
              🌐 {m.languages.slice(0, 2).join(', ')}{m.languages.length > 2 ? '...' : ''}
            </div>
          )}
        </div>
      )}

      {/* Certifications */}
      {m.certifications && m.certifications.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: featured ? C.navyText : C.textHint, marginBottom: 4 }}>
            📜 Certifications
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {m.certifications.slice(0, 2).map((cert, idx) => (
              <span key={idx} style={{
                fontSize: 10,
                padding: "2px 8px",
                background: featured ? "rgba(29, 158, 117, 0.15)" : "rgba(29, 158, 117, 0.08)",
                color: featured ? C.tealBorder : C.tealDark,
                borderRadius: "4px",
                fontWeight: 500
              }}>
                {typeof cert === 'string' ? cert : cert.name}
              </span>
            ))}
            {m.certifications.length > 2 && (
              <span style={{ fontSize: 10, color: featured ? C.navyText : C.textHint }}>
                +{m.certifications.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Work Photos with Details */}
      {m.workPhotos && m.workPhotos.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: featured ? C.navyText : C.textHint, marginBottom: 4 }}>
            📷 Work Photos ({m.workPhotos.length})
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {m.workPhotos.slice(0, 3).map((photo, idx) => {
              const photoDetail = m.portfolioDetails?.[idx] || {};
              return (
                <div key={idx} style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={typeof photo === 'string' ? photo : photo.url}
                    alt={`Work ${idx + 1}`}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: `1px solid ${featured ? "rgba(133,183,235,0.3)" : C.border}`,
                    }}
                  />
                  {photoDetail.category && (
                    <div style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      background: featured ? C.amber : C.amberMid,
                      color: featured ? C.amberDark : "#fff",
                      fontSize: 8,
                      fontWeight: 700,
                      padding: "2px 4px",
                      borderRadius: 3,
                      textTransform: "uppercase"
                    }}>
                      {photoDetail.category.replace('_', ' ')}
                    </div>
                  )}
                </div>
              );
            })}
            {m.workPhotos.length > 3 && (
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 6,
                background: featured ? "rgba(133,183,235,0.15)" : C.page,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: featured ? C.navyText : C.textHint,
                flexShrink: 0,
                border: `1px solid ${featured ? "rgba(133,183,235,0.3)" : C.border}`
              }}>
                +{m.workPhotos.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Information */}
      {m.pricing?.baseRate && (
        <div style={{
          marginBottom: 10,
          padding: "8px 12px",
          background: featured ? "rgba(250, 199, 117, 0.15)" : "rgba(250, 199, 117, 0.08)",
          borderRadius: "8px",
          border: featured ? "1px solid rgba(250, 199, 117, 0.4)" : "1px solid rgba(250, 199, 117, 0.2)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: featured ? C.amberDark : C.amberMid, marginBottom: 4 }}>
            💰 Pricing
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: featured ? "#fff" : C.textPrimary }}>
            KES {m.pricing.baseRate.toLocaleString()}
            <span style={{ fontSize: 11, fontWeight: 400, color: featured ? C.navyText : C.textHint, marginLeft: 4 }}>
              /{m.pricing.rateType?.replace('_', ' ') || 'job'}
            </span>
          </div>
          {m.pricing.minCharge > 0 && (
            <div style={{ fontSize: 11, color: featured ? C.navyText : C.textHint, marginTop: 2 }}>
              Min: KES {m.pricing.minCharge.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Insurance Badge */}
      {m.insurance?.hasInsurance && (
        <div style={{
          marginBottom: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: featured ? "rgba(29, 158, 117, 0.15)" : "rgba(29, 158, 117, 0.08)",
          borderRadius: "6px",
          border: featured ? "1px solid rgba(29, 158, 117, 0.4)" : "1px solid rgba(29, 158, 117, 0.2)"
        }}>
          <span style={{ fontSize: 12 }}>🛡️</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: featured ? C.tealBorder : C.tealDark }}>
            Insured
          </span>
          {m.insurance.provider && (
            <span style={{ fontSize: 10, color: featured ? C.navyText : C.textHint }}>
              ({m.insurance.provider})
            </span>
          )}
        </div>
      )}

      {/* Equipment & Safety Badges */}
      {(m.uniform || m.safetyGear || m.equipment) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {m.uniform && (
              <span style={{
                fontSize: 10,
                padding: "3px 8px",
                background: featured ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)",
                color: featured ? C.navyText : "#3b82f6",
                borderRadius: "4px",
                fontWeight: 600
              }}>
                👔 Uniform
              </span>
            )}
            {m.safetyGear && (
              <span style={{
                fontSize: 10,
                padding: "3px 8px",
                background: featured ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.08)",
                color: featured ? C.tealBorder : C.tealDark,
                borderRadius: "4px",
                fontWeight: 600
              }}>
                ⛑️ Safety Gear
              </span>
            )}
            {m.equipment && (
              <span style={{
                fontSize: 10,
                padding: "3px 8px",
                background: featured ? "rgba(251, 191, 36, 0.15)" : "rgba(251, 191, 36, 0.08)",
                color: featured ? C.amberDark : C.amberMid,
                borderRadius: "4px",
                fontWeight: 600
              }}>
                🔧 Equipment
              </span>
            )}
          </div>
        </div>
      )}

      {/* Work Hours */}
      {m.workHours && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: featured ? C.navyText : C.textHint }}>
            ⏰ {m.workHours}
          </div>
        </div>
      )}

      {/* Specialties */}
      {m.specialties && m.specialties.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: featured ? C.navyText : C.textHint, marginBottom: 4 }}>
            ⭐ Specialties
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {m.specialties.slice(0, 3).map(s => (
              <span key={s} style={{
                fontSize: 10,
                padding: "2px 8px",
                background: featured ? "rgba(251, 191, 36, 0.15)" : "rgba(251, 191, 36, 0.08)",
                color: featured ? C.amberDark : C.amberMid,
                borderRadius: "4px",
                fontWeight: 500
              }}>
                {s}
              </span>
            ))}
            {m.specialties.length > 3 && (
              <span style={{ fontSize: 10, color: featured ? C.navyText : C.textHint }}>
                +{m.specialties.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {m.bio && (
        <p style={{ fontSize: 12, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 10px", color: featured ? C.navyText : C.textHint }}>
          "{m.bio}"
        </p>
      )}

      {m.services?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {m.services.slice(0, 3).map(s => <Pill key={s} featured={featured}>{s}</Pill>)}
          {m.services.length > 3 && <Pill featured={featured}>+{m.services.length - 3} more</Pill>}
        </div>
      )}

      {/* Portfolio Preview */}
      {m.portfolioImages && m.portfolioImages.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: featured ? C.navyText : C.textHint, marginBottom: 6 }}>
            📸 Portfolio
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {m.portfolioImages.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Portfolio ${idx + 1}`}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "6px",
                  objectFit: "cover",
                  flexShrink: 0,
                  border: featured ? "1px solid rgba(255,255,255,0.2)" : "1px solid #E8E6E0"
                }}
              />
            ))}
            {m.portfolioImages.length > 3 && (
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "6px",
                background: featured ? "rgba(255,255,255,0.1)" : "#F1EFE8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: featured ? C.navyText : C.textHint,
                flexShrink: 0
              }}>
                +{m.portfolioImages.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={() => onBook(m)} style={{
          flex: 2, padding: "9px 12px",
          background: featured ? C.amber : C.navyLight,
          color: featured ? C.amberDark : "#fff",
          border: "none", borderRadius: 8,
          fontWeight: 700, cursor: "pointer",
          fontSize: 13, fontFamily: font, transition: ".15s",
        }}>📋 Book Now</button>

        <button onClick={() => window.open(`tel:${m.phone}`)} style={{
          flex: 1, padding: 9, borderRadius: 8, cursor: "pointer",
          fontFamily: font, fontSize: 13, fontWeight: 500,
          background: featured ? "rgba(255,255,255,0.10)" : C.navyDim,
          color: featured ? C.navyText : C.navyLight,
          border: `1px solid ${featured ? "rgba(133,183,235,0.3)" : C.navyBorder}`,
        }}>📞</button>

        <button onClick={() => window.open(`https://wa.me/${m.phone}`, "_blank")} style={{
          flex: 1, padding: 9, borderRadius: 8, cursor: "pointer",
          fontFamily: font, fontSize: 13, fontWeight: 500,
          background: featured ? C.tealMid : C.tealLight,
          color: featured ? C.tealBorder : C.tealDark,
          border: `1px solid ${featured ? C.tealDark : C.tealBorder}`,
        }}>💬</button>
      </div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ mover, onClose, availableServices }) {
  const [form, setForm] = useState({
    customerName: "", customerPhone: "",
    serviceType: mover.services?.[0] || "",
    pickupLocation: "", dropoffLocation: "",
    scheduledDate: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerName, customerPhone, serviceType, pickupLocation, dropoffLocation, scheduledDate } = form;
    if (!customerName || !customerPhone || !serviceType || !pickupLocation || !dropoffLocation || !scheduledDate) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      await API.post("/jobs", { moverId: mover._id, moverName: mover.name, ...form, county: mover.county });
      setSuccess(`Booking request sent to ${mover.name}! They'll contact you once they accept.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "9px 12px",
    background: C.page, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.textPrimary, fontFamily: font,
    fontSize: 13, boxSizing: "border-box", outline: "none",
  };
  const focusIn = e => { e.target.style.borderColor = C.navyLight; e.target.style.boxShadow = `0 0 0 3px ${C.navyDim}`; };
  const focusOut = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(12,68,124,0.7)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: C.surface, borderRadius: 16,
        border: `1px solid ${C.border}`,
        width: "100%", maxWidth: 520,
        maxHeight: "92vh", overflowY: "auto",
        padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar name={mover.name} size={38} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Book {mover.name}</div>
              <div style={{ fontSize: 12, color: C.textHint }}>📍 {mover.county}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.page,
            color: C.textHint, fontSize: 15, cursor: "pointer",
          }}>✕</button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
            <h3 style={{ color: C.textPrimary, margin: "0 0 10px", fontSize: 18 }}>Booking Sent!</h3>
            <p style={{ color: C.textHint, fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>{success}</p>
            <button onClick={onClose} style={{
              padding: "10px 28px", background: C.navyLight, color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700,
              cursor: "pointer", fontSize: 14, fontFamily: font,
            }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}

            <Divider label="Your Details" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldInput label="Full Name *" placeholder="e.g. John Kamau" value={form.customerName} onChange={e => set("customerName", e.target.value)} />
              <FieldInput label="Phone Number *" placeholder="e.g. 0712 345 678" value={form.customerPhone} onChange={e => set("customerPhone", e.target.value)} />
            </div>

            <Divider label="Move Details" />
            <FieldSelect label="Service Type *" value={form.serviceType} onChange={e => set("serviceType", e.target.value)}>
              <option value="">Select a service</option>
              {(mover.services?.length ? mover.services : availableServices).map(s => <option key={s} value={s}>{s}</option>)}
            </FieldSelect>
            <FieldInput label="Pickup Location *" placeholder="e.g. Kilimani, Wood Avenue" value={form.pickupLocation} onChange={e => set("pickupLocation", e.target.value)} />
            <FieldInput label="Destination *" placeholder="e.g. Syokimau, Community Road" value={form.dropoffLocation} onChange={e => set("dropoffLocation", e.target.value)} />
            <FieldInput label="Preferred Moving Date *" type="date" min={new Date().toISOString().split("T")[0]} value={form.scheduledDate} onChange={e => set("scheduledDate", e.target.value)} />

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Additional Notes
              </label>
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }}
                placeholder="Special items, fragile goods, access notes..."
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            <div style={{
              background: C.navyDim, border: `1px solid ${C.navyBorder}`,
              borderRadius: 8, padding: "10px 13px",
              fontSize: 12, color: C.navy, lineHeight: 1.6, marginBottom: 18,
            }}>
              ℹ️ Your request goes directly to <strong>{mover.name}'s</strong> dashboard. They'll call you once they accept. No account needed.
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: "10px", background: C.page,
                color: C.textMuted, border: `1px solid ${C.border}`,
                borderRadius: 8, fontWeight: 500, cursor: "pointer", fontFamily: font, fontSize: 13,
              }}>Cancel</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, padding: "10px",
                background: loading ? C.tealBorder : C.teal,
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14, fontFamily: font,
              }}>
                {loading ? "Sending..." : "📤 Send Booking Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Movers() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { search } = useLocation();

  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [movers, setMovers] = useState([]);
  const [featuredMovers, setFeaturedMovers] = useState([]);
  const [bookingMover, setBookingMover] = useState(null);

  const [registerData, setRegisterData] = useState({
    name: "", email: "", password: "", phone: "", county: "",
    experience: "", vehicleType: "Pickup", services: [],
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab === "login" || tab === "register") setActiveTab(tab);
  }, [search]);

  const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
    "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang'a", "Nairobi City", "Nakuru", "Nandi", "Narok", "Nyamira",
    "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River",
    "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
  ];

  const availableServices = [
    "Household Moving", "Office Relocation", "Packing & Unpacking",
    "Furniture Assembly", "Storage Solutions", "Inter-County Moving",
    "Fragile Item Handling", "Piano/Heavy Lift",
  ];

  useEffect(() => {
    if (activeTab !== "search") return;
    (async () => {
      setLoading(true);
      try { const r = await API.get(`/movers?county=${selectedCounty}`); setMovers(r.data || []); }
      catch { setMovers([]); } finally { setLoading(false); }
    })();
    (async () => {
      try { const r = await API.get("/payment/featured-movers"); setFeaturedMovers(r.data || []); }
      catch { setFeaturedMovers([]); }
    })();
  }, [selectedCounty, activeTab]);

  const handleServiceToggle = s =>
    setRegisterData(p => ({
      ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s],
    }));

  const onRegister = async (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) {
      alert("❌ Password must be at least 6 characters.");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(registerData.password);
    const hasNumber = /[0-9]/.test(registerData.password);
    if (!hasLetter || !hasNumber) {
      alert("❌ Password must contain a mixture of both letters and numbers.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { ...registerData, role: "mover" });
      alert("✅ Application submitted! Once admin approves, you can log in.");
      setActiveTab("login");
    } catch (err) { alert(`❌ ${err.response?.data?.message || err.response?.data?.error || "Registration failed."}`); }
    finally { setLoading(false); }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setLoginError("");
    setLoginSuccess("");

    try {
      const res = await API.post("/auth/resend-verification", { email: resendEmail, role: "mover" });
      setLoginSuccess("✅ " + (res.data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setLoginError("❌ " + (err.response?.data?.error || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault(); setLoginError(""); setLoginSuccess(""); setLoading(true); setShowResend(false);
    try {
      const res = await API.post("/auth/login", { ...loginData, role: "mover" });
      if (res.data.user.role !== "mover") { setLoginError("❌ This portal is for mover accounts only."); return; }
      login(res.data.token, res.data.user);
      setLoginSuccess("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/mover-dashboard"), 1000);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.requiresVerification) {
        setShowResend(true);
        setResendEmail(errData.email || loginData.email);
      }
      setLoginError(errData?.error || "❌ Invalid credentials. Please try again.");
    }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotMsg("❌ Please enter your email."); return; }
    setForgotLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail, role: "mover" });
      setForgotMsg(res.data?.message || "✅ Reset link sent!");
    } catch { setForgotMsg("❌ Failed to send reset email."); }
    finally { setForgotLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setGoogleError(""); setLoginError("");
    try {
      if (!window.google) {
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
        s.onload = () => initGoogleSignIn();
        s.onerror = () => { setGoogleError("Failed to load Google Sign-In."); setGoogleLoading(false); };
        document.head.appendChild(s);
      } else { initGoogleSignIn(); }
    } catch { setGoogleError("Google Sign-In is not configured."); setGoogleLoading(false); }
  };

  const initGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential, auto_select: false });
      window.google.accounts.id.prompt(n => {
        if (n.isNotDisplayed()) { setGoogleError("Popup blocked. Allow popups or use email/password."); setGoogleLoading(false); }
      });
    } catch { setGoogleError("Google Sign-In initialization failed."); setGoogleLoading(false); }
  };

  const handleGoogleCredential = async (response) => {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(response.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId: payload.sub, email: payload.email, name: payload.name, picture: payload.picture, role: "mover" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");
      if (data.user.role !== "mover") throw new Error("This login is for mover accounts only");
      login(data.token, data.user);
      setLoginSuccess("✅ Google login successful! Redirecting...");
      setTimeout(() => navigate("/mover-dashboard"), 1000);
    } catch (err) { setGoogleError(err.message || "Google authentication failed."); }
    finally { setGoogleLoading(false); }
  };

  const rChange = k => e => setRegisterData(p => ({ ...p, [k]: e.target.value }));
  const lChange = k => e => setLoginData(p => ({ ...p, [k]: e.target.value }));

  const inputBase = {
    width: "100%", padding: "9px 12px",
    background: C.page, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.textPrimary, fontFamily: font,
    fontSize: 13, boxSizing: "border-box", outline: "none",
  };
  const labelBase = { display: "block", fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };
  const fIn = e => { e.target.style.borderColor = C.navyLight; e.target.style.boxShadow = `0 0 0 3px ${C.navyDim}`; };
  const fOut = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

  const tabs = [
    { id: "search", label: "🔍  Find a Mover" },
    { id: "register", label: "📝  Join as Mover" },
    { id: "login", label: "🔑  Mover Login" },
  ];

  return (
    <div style={{ fontFamily: font, color: C.textPrimary, minHeight: "100vh", background: C.page }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #D3D1C7; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp .3s ease both; }
        @media (max-width: 600px) {
          .two-col { grid-template-columns: 1fr !important; }
          .chk-grid { grid-template-columns: 1fr !important; }
          .card-actions { flex-wrap: wrap; }
        }
        .movers-grid { gap: 14px; }
        @media (max-width: 768px) { .movers-grid { gap: 12px; } }
        @media (max-width: 480px) { .movers-grid { gap: 8px; } }
        @media (max-width: 380px) { .movers-grid { gap: 6px; } }
      `}</style>

      {bookingMover && (
        <BookingModal mover={bookingMover} onClose={() => setBookingMover(null)} availableServices={availableServices} />
      )}

      {/* ── Navy Navbar ── */}
      <div style={{ background: C.navy, padding: "0 28px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 0" }}>
          {/* Logo mark */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: C.teal, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: C.tealLight, flexShrink: 0,
          }}>
            <img src="/movers.png" alt="Axx Movers"
              style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Axx Movers</div>
            <div style={{ fontSize: 12, color: C.navyText }}>Kenya's Verified Relocation Network</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              background: C.teal, color: C.tealLight,
              fontSize: 10, fontWeight: 700,
              padding: "4px 12px", borderRadius: 20, letterSpacing: 0.3,
            }}>🇰🇪 47 Counties</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 14 }}>
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => { setActiveTab(t.id); setShowForgot(false); setForgotMsg(""); }}
              style={{
                padding: "10px 20px", fontWeight: 500, cursor: "pointer",
                fontFamily: font, fontSize: 13, background: "none", border: "none",
                color: activeTab === t.id ? C.amber : C.navyText,
                borderBottom: activeTab === t.id ? `2px solid ${C.amber}` : "2px solid transparent",
                transition: ".15s",
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* ══════════ SEARCH ══════════ */}
      {activeTab === "search" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>

          {/* Featured */}
          {featuredMovers.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 18, background: C.amberMid, borderRadius: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>⭐ Featured Movers</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="movers-grid">
                {featuredMovers.map((m, i) => (
                  <div key={m._id} className="fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                    <MoverCard m={m} onBook={setBookingMover} featured />
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#D3D1C7,transparent)", margin: "28px 0 24px" }} />
            </div>
          )}

          {/* Filter row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>Filter by county:</span>
            <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)}
              style={{
                padding: "7px 13px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 20,
                color: C.textPrimary, fontFamily: font, fontSize: 13, cursor: "pointer", outline: "none",
                minWidth: 180,
              }}>
              <option value="all">All Counties</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {selectedCounty !== "all" && (
              <button onClick={() => setSelectedCounty("all")} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: "6px 13px",
                color: C.textMuted, cursor: "pointer", fontSize: 12, fontFamily: font,
              }}>✕ Clear</button>
            )}
            {!loading && movers.length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 12, color: C.textHint, background: C.surface, padding: "4px 12px", borderRadius: 20, border: `1px solid ${C.border}` }}>
                {movers.length} mover{movers.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
              <p style={{ color: C.textHint, fontSize: 14 }}>Searching for movers...</p>
            </div>
          ) : movers.length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 18, background: C.navyLight, borderRadius: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
                  {selectedCounty === "all" ? "All Movers" : `Movers in ${selectedCounty}`}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="movers-grid">
                {movers.map((m, i) => (
                  <div key={m._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <MoverCard m={m} onBook={setBookingMover} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
              <h3 style={{ color: C.textMuted, margin: "0 0 8px", fontSize: 17 }}>No movers found</h3>
              <p style={{ color: C.textHint, fontSize: 13 }}>
                {selectedCounty === "all" ? "No approved movers yet." : `No approved movers in ${selectedCounty} yet.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════ REGISTER ══════════ */}
      {activeTab === "register" && (
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 80px" }} className="fade-up">
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 28px" }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.navyDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22 }}>🚛</div>
              <h2 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Join as a Mover</h2>
              <p style={{ color: C.textHint, margin: 0, fontSize: 13 }}>Register your moving business and reach customers across Kenya</p>
            </div>

            <form onSubmit={onRegister}>
              <Divider label="Business Info" />
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelBase}>Business / Full Name *</label><input style={inputBase} required placeholder="e.g. Kamau Movers" value={registerData.name} onChange={rChange("name")} onFocus={fIn} onBlur={fOut} /></div>
                <div><label style={labelBase}>Email Address *</label><input style={inputBase} required type="email" placeholder="you@example.com" value={registerData.email} onChange={rChange("email")} onFocus={fIn} onBlur={fOut} /></div>
              </div>
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div>
                  <label style={labelBase}>Password *</label>
                  <input style={inputBase} required type="password" placeholder="Min 6 chars, letters & numbers" value={registerData.password} onChange={rChange("password")} onFocus={fIn} onBlur={fOut} />
                  {registerData.password && (registerData.password.length < 6 || !/[a-zA-Z]/.test(registerData.password) || !/[0-9]/.test(registerData.password)) && (
                    <div style={{ color: "#dc2626", fontSize: "11px", marginTop: "4px" }}>
                      ⚠️ Password must contain both letters and numbers.
                    </div>
                  )}
                </div>
                <div><label style={labelBase}>WhatsApp Number *</label><input style={inputBase} required placeholder="254712345678" value={registerData.phone} onChange={rChange("phone")} onFocus={fIn} onBlur={fOut} /></div>
              </div>

              <Divider label="Service Area" />
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelBase}>County *</label>
                  <select style={inputBase} required value={registerData.county} onChange={rChange("county")} onFocus={fIn} onBlur={fOut}>
                    <option value="">Select County</option>
                    {counties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelBase}>Years of Experience</label><input style={inputBase} type="number" placeholder="e.g. 5" value={registerData.experience} onChange={rChange("experience")} onFocus={fIn} onBlur={fOut} /></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelBase}>Primary Vehicle</label>
                <select style={inputBase} value={registerData.vehicleType} onChange={rChange("vehicleType")} onFocus={fIn} onBlur={fOut}>
                  {["Pickup", "Van", "Lorry", "Motorbike", "Truck"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <Divider label="Services Offered" />
              <div className="chk-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                background: C.page, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: 13, marginBottom: 20,
              }}>
                {availableServices.map(s => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: registerData.services.includes(s) ? C.textPrimary : C.textMuted }}>
                    <input type="checkbox" checked={registerData.services.includes(s)} onChange={() => handleServiceToggle(s)} style={{ accentColor: C.navyLight, width: 14, height: 14 }} />
                    {s}
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "11px",
                background: loading ? C.navyBorder : C.navyLight,
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14, fontFamily: font,
              }}>{loading ? "Submitting..." : "📤 Submit Application"}</button>
              <div onClick={() => setActiveTab("login")} style={{ textAlign: "center", color: C.navyLight, marginTop: 16, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Already registered? Login here →
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ LOGIN ══════════ */}
      {activeTab === "login" && (
        <div style={{ maxWidth: 400, margin: "0 auto", padding: "32px 20px 80px" }} className="fade-up">
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 28px" }}>

            {showForgot ? (
              <form onSubmit={handleForgotPassword}>
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔏</div>
                  <h2 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Reset Password</h2>
                  <p style={{ color: C.textHint, margin: 0, fontSize: 13 }}>Enter your email to receive a reset link</p>
                </div>
                {forgotMsg && <Alert type={forgotMsg.includes("❌") ? "error" : "success"}>{forgotMsg}</Alert>}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelBase}>Registered Email *</label>
                  <input style={inputBase} required type="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onFocus={fIn} onBlur={fOut} />
                </div>
                <button type="submit" disabled={forgotLoading} style={{
                  width: "100%", padding: "11px", background: C.navyLight,
                  color: "#fff", border: "none", borderRadius: 8,
                  fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: font,
                  opacity: forgotLoading ? 0.6 : 1,
                }}>{forgotLoading ? "Sending..." : "📧 Send Reset Link"}</button>
                <div onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotEmail(""); }}
                  style={{ textAlign: "center", color: C.navyLight, marginTop: 16, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  ← Back to Login
                </div>
              </form>
            ) : (
              <form onSubmit={onLogin}>
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: C.navy, display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px", fontSize: 20, color: C.navyText,
                  }}>🔐</div>
                  <h2 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Mover Login</h2>
                  <p style={{ color: C.textHint, margin: 0, fontSize: 13 }}>Access your mover dashboard</p>
                </div>

                {loginError && <Alert type="error">{loginError}</Alert>}
                {loginSuccess && <Alert type="success">{loginSuccess}</Alert>}
                {googleError && <Alert type="error">{googleError}</Alert>}

                {showResend && (
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      style={{
                        background: "rgba(12, 68, 124, 0.15)",
                        color: "#0c447c",
                        border: "1px solid rgba(12, 68, 124, 0.3)",
                        borderRadius: "8px",
                        padding: "10px 18px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                        transition: "all 0.2s"
                      }}
                    >
                      {resendLoading ? "⏳ Sending..." : "📧 Resend Verification Email"}
                    </button>
                  </div>
                )}

                {GOOGLE_CLIENT_ID && (
                  <>
                    <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} style={{
                      width: "100%", padding: "10px",
                      background: C.surface, color: C.textPrimary,
                      border: `1px solid ${C.border}`, borderRadius: 8,
                      fontWeight: 500, cursor: "pointer", fontSize: 13, fontFamily: font,
                      marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: googleLoading ? 0.6 : 1,
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#E24B4A" }}>G</span>
                      {googleLoading ? "Connecting..." : "Sign in with Google"}
                    </button>
                    <Divider label="or" />
                  </>
                )}

                <div style={{ marginBottom: 12 }}>
                  <label style={labelBase}>Email *</label>
                  <input style={inputBase} required type="email" placeholder="you@example.com" value={loginData.email} onChange={lChange("email")} onFocus={fIn} onBlur={fOut} />
                </div>
                <div>
                  <label style={labelBase}>Password *</label>
                  <input style={inputBase} required type="password" placeholder="••••••••" value={loginData.password} onChange={lChange("password")} onFocus={fIn} onBlur={fOut} />
                  <div style={{ textAlign: "right", marginTop: 6, marginBottom: 18 }}>
                    <span onClick={() => { setShowForgot(true); setLoginError(""); }}
                      style={{ fontSize: 12, color: C.navyLight, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "11px",
                  background: loading ? C.navyBorder : C.navy,
                  color: "#fff", border: "none", borderRadius: 8,
                  fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14, fontFamily: font,
                }}>{loading ? "Verifying..." : "🚀 Access Dashboard"}</button>

                <div onClick={() => setActiveTab("register")}
                  style={{ textAlign: "center", color: C.navyLight, marginTop: 16, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  New here? Register your business →
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}