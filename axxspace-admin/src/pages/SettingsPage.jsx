import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Zap, Ticket, Medal, Globe, Settings, Compass, RefreshCw } from "lucide-react";
import API from "../api/api";
import "./AdminPages.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    mpesa_shortcode: "",
    mpesa_passkey: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const r = await API.get("/config");
      setConfig({
        mpesa_shortcode: r.data.mpesa_shortcode || "",
        mpesa_passkey: r.data.mpesa_passkey || "",
        mpesa_consumer_key: r.data.mpesa_consumer_key || "",
        mpesa_consumer_secret: r.data.mpesa_consumer_secret || "",
      });
    } catch (e) {
      console.error("Config load:", e);
      showToast("err", "Failed to load payment configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await Promise.all([
        API.post("/config", { key: "mpesa_shortcode", value: config.mpesa_shortcode, description: "M-Pesa Paybill/Shortcode" }),
        API.post("/config", { key: "mpesa_passkey", value: config.mpesa_passkey, description: "M-Pesa Passkey" }),
        API.post("/config", { key: "mpesa_consumer_key", value: config.mpesa_consumer_key, description: "M-Pesa Consumer Key" }),
        API.post("/config", { key: "mpesa_consumer_secret", value: config.mpesa_consumer_secret, description: "M-Pesa Consumer Secret" }),
      ]);
      showToast("ok", "M-Pesa configuration saved successfully");
    } catch (e) {
      console.error("Config save:", e);
      showToast("err", "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["mpesa_shortcode", "text", "Paybill / Shortcode", "e.g. 174379", "Your M-Pesa Paybill or Buy Goods Till Number"],
    ["mpesa_passkey", "password", "Passkey", "Enter passkey", "The passkey from your M-Pesa dashboard"],
    ["mpesa_consumer_key", "text", "Consumer Key", "Enter Consumer Key", "From Safaricom Developer Portal"],
    ["mpesa_consumer_secret", "password", "Consumer Secret", "Enter Consumer Secret", "From Safaricom Developer Portal"],
  ];

  const shortcuts = [
    { label: "Package Purchase Approvals", icon: CreditCard, to: "/dashboard?tab=payment" },
    { label: "Payment Activity & Boosts", icon: Zap, to: "/dashboard?tab=boosts" },
    { label: "Listing Badges", icon: Ticket, to: "/dashboard?tab=listings-badges" },
    { label: "User Badges", icon: Medal, to: "/dashboard?tab=user-badges" },
    { label: "Website Poster & QR", icon: Globe, to: "/dashboard?tab=website-poster" },
  ];

  return (
    <div className="ap-page">
      <section className="ap-panel">
        <h2 className="ap-panel-title"><Settings size={17} /> M-Pesa Payment Configuration</h2>
        {loading ? (
          <div className="ap-loading"><div className="spinner" /><p>Loading configuration…</p></div>
        ) : (
          <>
            <div className="ap-form-grid">
              {fields.map(([key, type, label, placeholder, hint]) => (
                <div key={key} className="ap-field">
                  <span className="ap-field-label">{label}</span>
                  <input
                    type={type}
                    className="ap-field-input"
                    placeholder={placeholder}
                    value={config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  />
                  <span className="ap-hint">{hint}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="ap-btn ap-btn-primary" onClick={saveConfig} disabled={saving}>
                {saving ? "Saving…" : "Save Configuration"}
              </button>
              <button type="button" className="ap-btn ap-btn-ghost" onClick={loadConfig} disabled={saving}>
                <RefreshCw size={13} /> Reload
              </button>
            </div>
            <p className="ap-hint" style={{ marginTop: 14 }}>
              These credentials are used for Lipa na M-Pesa STK pushes across listings, boosts and
              subscriptions. Changes take effect immediately — verify before saving in production.
            </p>
          </>
        )}
      </section>

      <section className="ap-panel">
        <h2 className="ap-panel-title"><Compass size={17} /> Admin Shortcuts</h2>
        <div className="ap-filter-tabs">
          {shortcuts.map((s) => (
            <button key={s.to} type="button" className="ap-btn ap-btn-ghost" onClick={() => navigate(s.to)}>
              <s.icon size={13} /> {s.label}
            </button>
          ))}
        </div>
      </section>

      {toast && <div className={`ap-toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  );
}
