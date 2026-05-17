// src/components/FloatingWhatsApp.jsx
// Uses ReactDOM.createPortal to render directly into document.body
// This escapes ANY parent overflow:hidden or position:relative traps

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function WhatsAppButton() {
  const phone = "254796740883";
  const message = "Hello Axx Spaces! 👋 I need help finding a property.";

  const handleClick = () => {
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <>
      <style>{`
        @keyframes wa-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
          70%  { box-shadow: 0 0 0 14px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        #wa-float-btn {
          animation: wa-pulse 2s infinite;
        }
        #wa-float-btn:hover {
          transform: scale(1.12);
          animation: none;
          box-shadow: 0 8px 30px rgba(37, 211, 102, 0.8) !important;
        }
      `}</style>

      {/* Tooltip */}
      <div
        style={{
          position: "fixed",
          bottom: "92px",
          right: "20px",
          zIndex: 2147483647,
          background: "#1f2937",
          color: "white",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "DM Sans, sans-serif",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          letterSpacing: "0.02em",
        }}
      >
        💬 Chat with us
      </div>

      {/* Green button */}
      <button
        id="wa-float-btn"
        onClick={handleClick}
        title="Chat with Axx Spaces on WhatsApp"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "20px",
          zIndex: 2147483647,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#25D366",
          border: "3px solid white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.6)",
          outline: "none",
          padding: 0,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.774L0 32l8.469-2.001A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.27 13.27 0 01-6.766-1.848l-.485-.287-5.027 1.187 1.234-4.899-.317-.504A13.226 13.226 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.719-1.294-.365-.133-.631-.199-.897.199-.266.398-1.03 1.294-1.263 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.619-3.203-1.977-1.184-1.057-1.983-2.362-2.216-2.76-.232-.398-.025-.613.175-.811.179-.178.398-.465.597-.698.2-.232.266-.398.398-.664.133-.266.067-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.324s1.427 3.854 1.626 4.12c.2.266 2.808 4.287 6.803 6.014.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.354-.962 2.686-1.891.332-.929.332-1.726.232-1.891-.099-.166-.365-.266-.763-.465z" />
        </svg>
      </button>
    </>
  );
}

export default function FloatingWhatsApp() {
  // Mount a div directly on document.body so nothing can clip it
  const portalRoot = useRef(null);

  if (!portalRoot.current) {
    const div = document.createElement("div");
    div.id = "wa-portal-root";
    document.body.appendChild(div);
    portalRoot.current = div;
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (portalRoot.current && document.body.contains(portalRoot.current)) {
        document.body.removeChild(portalRoot.current);
      }
    };
  }, []);

  return createPortal(<WhatsAppButton />, portalRoot.current);
}