import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import "./PhonePromptModal.css";

const COUNTRIES = [
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+", flag: "🌐", name: "Other" },
];

const KENYA_COUNTIES = [
  "Nairobi", "Kiambu", "Mombasa", "Nakuru", "Uasin Gishu (Eldoret)",
  "Kisumu", "Machakos", "Kajiado", "Meru", "Kilifi", "Nyeri", "Other"
];

const PhonePromptModal = () => {
  const { user, token, updateUser, showPhonePrompt, closePhonePrompt } = useAuth();
  const [countryCode, setCountryCode] = useState("+254");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isWhatsApp, setIsWhatsApp] = useState(true);
  const [county, setCounty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Determine if phone prompt is needed
  const isPlaceholder = user && (!user.phone || user.phone.startsWith("google-"));
  const isOpen = showPhonePrompt || (isPlaceholder && !sessionStorage.getItem("axx_phone_prompt_skipped"));

  const handleClose = useCallback(() => {
    sessionStorage.setItem("axx_phone_prompt_skipped", "true");
    closePhonePrompt();
  }, [closePhonePrompt]);

  // Escape key dismisses
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Clean up input: remove spaces, dashes, leading 0
    let clean = phoneNumber.replace(/[\s\-()]/g, "");
    if (!clean) {
      setError("Please enter your mobile phone number.");
      return;
    }

    if (countryCode !== "+") {
      if (clean.startsWith("0")) {
        clean = clean.slice(1);
      }
      if (!clean.startsWith("+")) {
        clean = `${countryCode}${clean}`;
      }
    } else if (!clean.startsWith("+")) {
      clean = `+${clean}`;
    }

    if (clean.length < 10) {
      setError("Please enter a complete phone number with at least 9 digits.");
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const res = await fetch(`${API_BASE}/auth/update-phone`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: clean,
          isWhatsAppNumber: isWhatsApp,
          county: county || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update phone number");
      }

      setSuccess(true);
      if (data.user) {
        updateUser(data.user);
      } else {
        updateUser({ phone: clean, isWhatsAppNumber: isWhatsApp });
      }

      setTimeout(() => {
        closePhonePrompt();
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to save phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-prompt-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="phone-prompt-card" role="dialog" aria-modal="true" aria-labelledby="phone-prompt-title">
        <button
          className="phone-prompt-close-btn"
          onClick={handleClose}
          aria-label="Close"
          disabled={loading}
        >
          ✕
        </button>

        <div className="phone-prompt-header">
          <div className="phone-prompt-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <h2 id="phone-prompt-title" className="phone-prompt-title">
            One Quick Step, {user?.name?.split(" ")[0] || "Explorer"}!
          </h2>
          <p className="phone-prompt-subtitle">
            Add your contact number so landlords, hosts, and clients can reach you directly via call or WhatsApp.
          </p>
        </div>

        {error && <div className="phone-prompt-alert error">{error}</div>}
        {success && <div className="phone-prompt-alert success">✓ Phone number saved successfully!</div>}

        <form onSubmit={handleSubmit} className="phone-prompt-form">
          <div className="phone-prompt-field">
            <label className="phone-prompt-label">Mobile Phone Number *</label>
            <div className="phone-input-group">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="phone-country-select"
                disabled={loading || success}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.name})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder={countryCode === "+254" ? "712 345 678" : "Phone number"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="phone-number-input"
                autoFocus
                disabled={loading || success}
                required
              />
            </div>
            <span className="phone-prompt-hint">
              Example: 0712 345 678 or 712 345 678
            </span>
          </div>

          <div className="phone-prompt-field">
            <label className="phone-prompt-label">Your Location / County (Optional)</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="phone-county-select"
              disabled={loading || success}
            >
              <option value="">Select County / City...</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <label className="phone-prompt-checkbox-row">
            <input
              type="checkbox"
              checked={isWhatsApp}
              onChange={(e) => setIsWhatsApp(e.target.checked)}
              disabled={loading || success}
            />
            <span className="checkbox-text">
              <strong>This number is on WhatsApp</strong>
              <small>Allows instant inquiries &amp; chat updates directly to your WhatsApp</small>
            </span>
          </label>

          <button
            type="submit"
            className="phone-prompt-submit-btn"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="phone-prompt-spinner"></span>
                Saving Details...
              </>
            ) : success ? (
              "Saved!"
            ) : (
              "Save & Continue →"
            )}
          </button>

          <div className="phone-prompt-footer">
            <button
              type="button"
              className="phone-prompt-skip-btn"
              onClick={handleClose}
              disabled={loading}
            >
              I'll do this later (Just browsing)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhonePromptModal;
