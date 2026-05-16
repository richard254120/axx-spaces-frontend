// src/components/ShareProperty.jsx
// Usage inside your modal: <ShareProperty property={selectedProperty} />

import { useState } from "react";

export default function ShareProperty({ property }) {
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  // Build the share URL — links to listings page with property highlighted
  const shareUrl = `${window.location.origin}/listings?highlight=${property._id}`;

  const shareText =
    `🏠 Check out this property on Axx Spaces!\n\n` +
    `*${property.title}*\n` +
    `📍 ${property.county} - ${property.location}\n` +
    `💰 KES ${property.price?.toLocaleString()}/month\n` +
    `🛏 ${property.bedrooms} Bed | 🚿 ${property.bathrooms} Bath\n` +
    `✅ ${property.availableUnits} unit(s) available\n\n` +
    `View it here: ${shareUrl}`;

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property on Axx Spaces — ${property.title} in ${property.county}`,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div style={s.wrap}>
      <p style={s.label}>📤 Share this property</p>
      <div style={s.row}>
        {/* WhatsApp share */}
        <button style={{ ...s.btn, ...s.waBtn }} onClick={handleWhatsApp}>
          <svg width="16" height="16" viewBox="0 0 32 32" fill="white" style={{ flexShrink: 0 }}>
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.774L0 32l8.469-2.001A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm7.27 19.471c-.398-.199-2.354-1.162-2.719-1.294-.365-.133-.631-.199-.897.199-.266.398-1.03 1.294-1.263 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.619-3.203-1.977-1.184-1.057-1.983-2.362-2.216-2.76-.232-.398-.025-.613.175-.811.179-.178.398-.465.597-.698.2-.232.266-.398.398-.664.133-.266.067-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.324s1.427 3.854 1.626 4.12c.2.266 2.808 4.287 6.803 6.014.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.354-.962 2.686-1.891.332-.929.332-1.726.232-1.891-.099-.166-.365-.266-.763-.465z"/>
          </svg>
          Share on WhatsApp
        </button>

        {/* Copy link */}
        <button style={{ ...s.btn, ...s.copyBtn }} onClick={handleCopyLink}>
          {copied ? "✅ Copied!" : "🔗 Copy Link"}
        </button>

        {/* Native share (mobile) */}
        {navigator.share && (
          <button style={{ ...s.btn, ...s.nativeBtn }} onClick={handleNativeShare}>
            ↗ Share
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    margin: "20px 0",
    padding: "16px",
    background: "rgba(59,130,246,0.08)",
    borderRadius: "10px",
    border: "1px solid rgba(59,130,246,0.2)",
  },
  label: {
    margin: "0 0 12px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 600,
  },
  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  waBtn: {
    background: "#25D366",
    color: "white",
    flex: "1",
    justifyContent: "center",
    minWidth: "160px",
  },
  copyBtn: {
    background: "#1e293b",
    color: "#f1f5f9",
    border: "1px solid #334155",
    minWidth: "110px",
    justifyContent: "center",
  },
  nativeBtn: {
    background: "#3b82f6",
    color: "white",
    justifyContent: "center",
  },
};