import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

/**
 * Shared monetization modal — buys a boost or homepage feature for a listing
 * via M-Pesa STK Push. Works for both rentals (Property) and Accommodation.
 *
 * Props:
 *  - listing: { _id/id, name/title, isFeatured, promotionTier, promotionEndDate }
 *  - listingType: "Property" | "Accommodation"
 *  - onClose: () => void
 *  - onSuccess: () => void  (called after the STK prompt is sent)
 */
export default function BoostListingModal({ listing, listingType, onClose, onSuccess }) {
  const auth = useContext(AuthContext);
  const token = auth?.token || localStorage.getItem("token");
  const user = auth?.user;
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [phone, setPhone] = useState(user?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: "success" | "error", message }

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/payment/promotion-catalog`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.catalog) {
          setCatalog(data.catalog);
          // Preselect the best-value monthly boost
          const monthly = data.catalog.boosts?.find((b) => b.id === "boost-30days");
          if (monthly) setSelected(monthly.id);
        } else {
          setLoadError("Could not load promotion plans.");
        }
      })
      .catch(() => !cancelled && setLoadError("Network error loading promotion plans."));
    return () => { cancelled = true; };
  }, []);

  const plan =
    selected && catalog
      ? [...catalog.boosts, ...catalog.homepageFeatures].find((p) => p.id === selected)
      : null;

  const isActiveBoost =
    listing?.isFeatured &&
    listing?.promotionTier &&
    listing?.promotionTier !== "none" &&
    (!plan || !plan.id.startsWith("home-"));

  const handleSubmit = async () => {
    if (!plan || !token) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/payment/initiate-listing-promotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingType,
          listingId: listing._id || listing.id,
          planId: plan.id,
          phone: phone.replace(/\s+/g, ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setResult({ type: "success", message: data.message });
        setTimeout(() => onSuccess?.(), 2500);
      } else {
        setResult({ type: "error", message: data.error || "Payment initiation failed. Please try again." });
      }
    } catch {
      setResult({ type: "error", message: "Network error connecting to payment gateway." });
    } finally {
      setSubmitting(false);
    }
  };

  const renderPlanCard = (p, groupLabel) => {
    const active = selected === p.id;
    return (
      <button
        type="button"
        key={p.id}
        onClick={() => setSelected(p.id)}
        style={{
          ...s.planCard,
          ...(active ? s.planCardActive : {}),
        }}
      >
        <div style={s.planTopRow}>
          <span style={s.planGroup}>{groupLabel}</span>
          {active && <span style={s.planCheck}>✓</span>}
        </div>
        <div style={s.planName}>{p.name}</div>
        <div style={s.planPrice}>
          KSh {p.price.toLocaleString()}
          <span style={s.planPer}> / {p.durationDays} day{p.durationDays > 1 ? "s" : ""}</span>
        </div>
        <div style={s.planTagline}>{p.tagline}</div>
      </button>
    );
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h3 style={s.title}>Promote this listing</h3>
            <p style={s.subtitle}>
              {(listing.name || listing.title || "Listing").slice(0, 48)}
              {listing.isFeatured && listing.promotionEndDate && (
                <span style={s.activeTag}>
                  {" "}· Active until {new Date(listing.promotionEndDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loadError && <div style={s.errorBox}>{loadError}</div>}

        {!catalog && !loadError ? (
          <div style={s.loadingBox}>Loading plans…</div>
        ) : catalog && (
          <>
            <div style={s.sectionLabel}>Boost placement</div>
            <div style={s.planGrid}>{catalog.boosts.map((p) => renderPlanCard(p, "Boost"))}</div>

            <div style={s.sectionLabel}>Homepage feature</div>
            <div style={s.planGrid}>{catalog.homepageFeatures.map((p) => renderPlanCard(p, "Featured"))}</div>

            <div style={s.phoneRow}>
              <label style={s.phoneLabel}>M-Pesa phone number</label>
              <input
                style={s.phoneInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                inputMode="tel"
              />
            </div>

            {result && (
              <div style={result.type === "success" ? s.successBox : s.errorBox}>{result.message}</div>
            )}

            <div style={s.footerRow}>
              {plan && (
                <span style={s.summaryText}>
                  {plan.name} · KSh {plan.price.toLocaleString()} · {plan.durationDays} days
                </span>
              )}
              <button
                type="button"
                style={{ ...s.payBtn, opacity: !plan || submitting ? 0.55 : 1 }}
                disabled={!plan || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Sending prompt…" : "Pay with M-Pesa"}
              </button>
            </div>
            {isActiveBoost && (
              <p style={s.renewNote}>This listing already has an active boost — paying again extends the promotion from today.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 10000,
  },
  modal: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "24px",
    boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" },
  title: { margin: 0, fontSize: "19px", fontWeight: 800, color: "#fbbf24" },
  subtitle: { margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" },
  activeTag: { color: "#34d399", fontWeight: 700 },
  closeBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e2e8f0",
    borderRadius: "10px",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontSize: "14px",
  },
  sectionLabel: { fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", margin: "14px 0 8px" },
  planGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" },
  planCard: {
    textAlign: "left",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    color: "#e2e8f0",
  },
  planCardActive: { borderColor: "#fbbf24", background: "rgba(251,191,36,0.10)", boxShadow: "0 0 0 1px #fbbf24" },
  planTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  planGroup: { fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" },
  planCheck: { color: "#fbbf24", fontWeight: 900, fontSize: "14px" },
  planName: { fontSize: "14px", fontWeight: 800, margin: "6px 0 2px", color: "#f1f5f9" },
  planPrice: { fontSize: "15px", fontWeight: 900, color: "#fbbf24" },
  planPer: { fontSize: "11px", fontWeight: 600, color: "#94a3b8" },
  planTagline: { fontSize: "11.5px", color: "#94a3b8", marginTop: "4px", lineHeight: 1.4 },
  phoneRow: { marginTop: "18px" },
  phoneLabel: { display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" },
  phoneInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    color: "#f1f5f9",
    padding: "12px 14px",
    fontSize: "15px",
    fontWeight: 600,
    outline: "none",
  },
  successBox: {
    marginTop: "14px",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(52,211,153,0.4)",
    color: "#34d399",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: 600,
  },
  errorBox: {
    marginTop: "14px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#f87171",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: 600,
  },
  loadingBox: { padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: "14px" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "18px", flexWrap: "wrap" },
  summaryText: { fontSize: "12.5px", color: "#94a3b8", fontWeight: 600 },
  payBtn: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#052e16",
    border: "none",
    borderRadius: "12px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
  },
  renewNote: { fontSize: "11.5px", color: "#64748b", margin: "10px 0 0" },
};
