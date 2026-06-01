// src/components/FloatingWhatsApp.jsx

import { useEffect } from "react";

export default function FloatingWhatsApp() {
  useEffect(() => {
    const phone = "254745689773";
    const message = "Hello Axxspace! 👋 I need help finding a property.";
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    const existing = document.getElementById("wa-float-root");
    const existingStyle = document.getElementById("wa-float-style");
    if (existing) existing.remove();
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = "wa-float-style";
    style.innerHTML = `
      #wa-float-root {
        position: fixed !important;
        bottom: 16px !important;
        right: 14px !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
      }
      #wa-float-label {
        background: #111827;
        color: #ffffff;
        padding: 2px 7px;
        border-radius: 10px;
        font-size: 9px;
        font-weight: 700;
        font-family: sans-serif;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        pointer-events: none;
      }
      #wa-float-btn {
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
        min-height: 32px !important;
        border-radius: 50% !important;
        background-color: #25D366 !important;
        border: 2px solid #ffffff !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-decoration: none !important;
        box-shadow: 0 2px 8px rgba(37,211,102,0.6) !important;
        animation: wa-ring 2s ease-in-out infinite !important;
      }
      #wa-float-btn:hover {
        transform: scale(1.1) !important;
        animation: none !important;
      }
      #wa-float-btn svg {
        display: block !important;
        width: 15px !important;
        height: 15px !important;
      }
      @keyframes wa-ring {
        0%   { box-shadow: 0 0 0 0px rgba(37,211,102,0.6), 0 2px 8px rgba(37,211,102,0.5); }
        70%  { box-shadow: 0 0 0 7px rgba(37,211,102,0), 0 2px 8px rgba(37,211,102,0.5); }
        100% { box-shadow: 0 0 0 0px rgba(37,211,102,0), 0 2px 8px rgba(37,211,102,0.5); }
      }
    `;

    const root = document.createElement("div");
    root.id = "wa-float-root";

    const label = document.createElement("div");
    label.id = "wa-float-label";
    label.textContent = "Chat with us";

    const btn = document.createElement("a");
    btn.id = "wa-float-btn";
    btn.href = waUrl;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.setAttribute("aria-label", "Chat on WhatsApp");
    btn.innerHTML = `<svg viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.774L0 32l8.469-2.001A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.27 13.27 0 01-6.766-1.848l-.485-.287-5.027 1.187 1.234-4.899-.317-.504A13.226 13.226 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.719-1.294-.365-.133-.631-.199-.897.199-.266.398-1.03 1.294-1.263 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.619-3.203-1.977-1.184-1.057-1.983-2.362-2.216-2.76-.232-.398-.025-.613.175-.811.179-.178.398-.465.597-.698.2-.232.266-.398.398-.664.133-.266.067-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.324s1.427 3.854 1.626 4.12c.2.266 2.808 4.287 6.803 6.014.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.354-.962 2.686-1.891.332-.929.332-1.726.232-1.891-.099-.166-.365-.266-.763-.465z"/></svg>`;

    root.appendChild(label);
    root.appendChild(btn);

    document.head.appendChild(style);
    document.body.appendChild(root);

    return () => {
      const el = document.getElementById("wa-float-root");
      const st = document.getElementById("wa-float-style");
      if (el) el.remove();
      if (st) st.remove();
    };
  }, []);

  return null;
}