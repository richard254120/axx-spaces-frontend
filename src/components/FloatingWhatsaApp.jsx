// src/components/FloatingWhatsApp.jsx
// Drop this component in your App.jsx — it shows on every page

export default function FloatingWhatsApp() {
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
      <style>{css}</style>
      <div className="fab-wrap">
        <div className="fab-tooltip">Chat with us on WhatsApp</div>
        <button className="fab-btn" onClick={handleClick} aria-label="WhatsApp Support">
          {/* WhatsApp SVG icon */}
          <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.774L0 32l8.469-2.001A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.27 13.27 0 01-6.766-1.848l-.485-.287-5.027 1.187 1.234-4.899-.317-.504A13.226 13.226 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.719-1.294-.365-.133-.631-.199-.897.199-.266.398-1.03 1.294-1.263 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.619-3.203-1.977-1.184-1.057-1.983-2.362-2.216-2.76-.232-.398-.025-.613.175-.811.179-.178.398-.465.597-.698.2-.232.266-.398.398-.664.133-.266.067-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.324s1.427 3.854 1.626 4.12c.2.266 2.808 4.287 6.803 6.014.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.354-.962 2.686-1.891.332-.929.332-1.726.232-1.891-.099-.166-.365-.266-.763-.465z"/>
          </svg>
        </button>
      </div>
    </>
  );
}

const css = `
  .fab-wrap {
    position: fixed;
    bottom: 28px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .fab-tooltip {
    background: #1f2937;
    color: white;
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .fab-wrap:hover .fab-tooltip {
    opacity: 1;
    transform: translateX(0);
  }

  .fab-btn {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #25D366;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 24px rgba(37,211,102,0.45);
    transition: all 0.3s ease;
    animation: fab-pulse 2.5s infinite;
    flex-shrink: 0;
  }

  .fab-btn:hover {
    transform: scale(1.12);
    box-shadow: 0 8px 30px rgba(37,211,102,0.6);
  }

  @keyframes fab-pulse {
    0%, 100% { box-shadow: 0 6px 24px rgba(37,211,102,0.45); }
    50%       { box-shadow: 0 6px 36px rgba(37,211,102,0.75); }
  }

  @media (max-width: 480px) {
    .fab-wrap { bottom: 18px; right: 16px; }
    .fab-btn  { width: 52px; height: 52px; }
    .fab-tooltip { display: none; }
  }
`;