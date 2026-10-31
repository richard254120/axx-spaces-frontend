import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

/**
 * Provider subscription plans modal (landlord / host).
 * Fetches packages from /payment/provider-packages and upgrades via M-Pesa STK.
 *
 * Props:
 *  - role: "landlord" | "host" (label context only; backend derives from token)
 *  - onClose: () => void
 */
export default function SubscriptionPlansModal({ role = "landlord", onClose }) {
  const auth = useContext(AuthContext);
  const token = auth?.token || localStorage.getItem("token");
  const user = auth?.user;

  const [data, setData] = useState(null); // { packages, current }
  const [loadError, setLoadError] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [submittingTier, setSubmittingTier] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/payment/provider-packages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        if (payload?.packages) setData(payload);
        else setLoadError(payload?.error || "Could not load plans.");
      })
      .catch(() => !cancelled && setLoadError("Network error loading plans."));
    return () => { cancelled = true; };
  }, [token]);

  const handleSubscribe = async (tierKey) => {
    setSubmittingTier(tierKey);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/payment/subscribe-provider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: tierKey, phone: phone.replace(/\s+/g, "") }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.success) {
        setResult({ type: "success", message: payload.message });
      } else {
        setResult({ type: "error", message: payload.error || "Payment initiation failed." });
      }
    } catch {
      setResult({ type: "error", message: "Network error connecting to payment gateway." });
    } finally {
      setSubmittingTier(null);
    }
  };

  const listingsWord = role === "host" ? "accommodation" : "rental";

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h3 style={s.title}>Upgrade your {role} plan</h3>
            <p style={s.subtitle}>More active {listingsWord} listings and priority placement in search</p>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loadError && <div style={s.errorBox}>{loadError}</div>}
        {!data && !loadError && <div style={s.loadingBox}>Loading plans…</div>}

        {data && (
          <>
            {data.current?.tier !== "free" && (
              <div style={s.currentBanner}>
                Current plan: <strong>{data.current.tier.toUpperCase()}</strong>
                {data.current.expiresAt && ` · renews/expiry ${new Date(data.current.expiresAt).toLocaleDateString()}`}
              </div>
            )}

            <div style={s.planColumn}>
              {Object.entries(data.packages || {})
                .filter(([, pkg]) => pkg.price > 0)
                .map(([key, pkg]) => {
                  const isCurrent = data.current?.tier === key;
                  return (
                    <div key={key} style={{ ...s.planCard, ...(isCurrent ? s.planCardCurrent : {}) }}>
                      <div style={s.planHeadRow}>
                        <span style={s.planName}>{pkg.name}</span>
                        <span style={s.planPrice}>
                          KSh {pkg.price.toLocaleString()}
                          <span style={s.planPer}>/month</span>
                        </span>
                      </div>
                      <p style={s.planDesc}>{pkg.description}</p>
                      <ul style={s.featureList}>
                        {(pkg.features || []).map((f) => (
                          <li key={f} style={s.featureItem}>✓ {f}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        style={{ ...s.subscribeBtn, opacity: isCurrent || submittingTier ? 0.55 : 1 }}
                        disabled={isCurrent || !!submittingTier}
                        onClick={() => handleSubscribe(key)}
                      >
                        {isCurrent ? "Active plan" : submittingTier === key ? "Sending prompt…" : `Upgrade — KSh ${pkg.price.toLocaleString()}`}
                      </button>
                    </div>
                  );
                })}
            </div>

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

            {result && <div style={result.type === "success" ? s.successBox : s.errorBox}>{result.message}</div>}

            <p style={s.footNote}>
              Free plan: limited active {listingsWord} listings. Subscriptions last 30 days and can be re-upgraded any time.
            </p>
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
    maxWidth: "480px",
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "24px",
    boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" },
  title: { margin: 0, fontSize: "19px", fontWeight: 800, color: "#fbbf24" },
  subtitle: { margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" },
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
  currentBanner: {
    background: "rgba(52,211,153,0.10)",
    border: "1px solid rgba(52,211,153,0.35)",
    color: "#34d399",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "14px",
  },
  planColumn: { display: "flex", flexDirection: "column", gap: "12px" },
  planCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "16px",
    padding: "16px",
  },
  planCardCurrent: { borderColor: "rgba(52,211,153,0.5)" },
  planHeadRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" },
  planName: { fontSize: "14px", fontWeight: 900, letterSpacing: "0.06em", color: "#f1f5f9" },
  planPrice: { fontSize: "16px", fontWeight: 900, color: "#fbbf24" },
  planPer: { fontSize: "11px", fontWeight: 600, color: "#94a3b8" },
  planDesc: { fontSize: "12.5px", color: "#94a3b8", margin: "6px 0 10px", lineHeight: 1.4 },
  featureList: { listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: "4px" },
  featureItem: { fontSize: "12.5px", color: "#cbd5e1", fontWeight: 500 },
  subscribeBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "11px",
    padding: "11px 16px",
    fontSize: "13.5px",
    fontWeight: 900,
    cursor: "pointer",
  },
  phoneRow: { marginTop: "16px" },
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
  footNote: { fontSize: "11.5px", color: "#64748b", margin: "14px 0 0", lineHeight: 1.5 },
};
