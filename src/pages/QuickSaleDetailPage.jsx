import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

const getCategoryEmoji = (category) => {
  const emojiMap = {
    "Furniture": "🪑",
    "Electronics": "💻",
    "Appliances": "🔌",
    "Tools": "🔧",
    "Clothing": "👕",
    "Books": "📚",
    "Sports & Outdoors": "⚽",
    "Home & Garden": "🪴",
    "Beauty & Personal Care": "✨",
    "Toys & Games": "🎮",
    "Construction Materials": "🏗️",
    "Vehicles & Parts": "🚗",
    "Other": "📦",
  };
  return emojiMap[category] || "🏷️";
};

export default function QuickSaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("fav_quicksales");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`${API_BASE}/materials/${id}`);
        if (!response.ok) throw new Error("Item not found");
        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleToggleFavorite = () => {
    if (!item) return;
    setFavorites((prev) => {
      const exists = prev.includes(item._id);
      const next = exists ? prev.filter((favId) => favId !== item._id) : [...prev, item._id];
      localStorage.setItem("fav_quicksales", JSON.stringify(next));
      showToast(exists ? "Removed from Favorites" : "Saved to Favorites ❤️");
      return next;
    });
  };

  const handleShare = () => {
    if (!item) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Listing link copied to clipboard!");
    }
  };

  const handleWhatsApp = () => {
    if (!item) return;
    const phone = formatKenyaPhone(item.sellerPhone);
    const msg = `Hi ${item.sellerName || "Seller"}, I'm interested in your listing "${item.title}" on Axxspace for KES ${Number(item.price || 0).toLocaleString()}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    if (!item || !item.sellerPhone) return;
    window.open(`tel:${item.sellerPhone}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTop: "3px solid #E31B1B", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 600 }}>Loading QuickSale details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px" }}>⚠️</div>
        <h2 style={{ color: "#0F172A", margin: "0 0 8px", fontFamily: "'Outfit', sans-serif", fontSize: "24px" }}>Item Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px", textAlign: "center", maxWidth: "400px" }}>{error || "This item doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate("/quicksales")}
          style={{
            padding: "12px 28px",
            background: "#E31B1B",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(227, 27, 27, 0.3)",
          }}
        >
          ← Return to QuickSales
        </button>
      </div>
    );
  }

  const rawImages = Array.isArray(item.images)
    ? item.images
    : item.images
    ? [item.images]
    : item.imageUrl
    ? [item.imageUrl]
    : [];

  const images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url || img?.secure_url : img))
    .filter(Boolean);

  const isFavorite = favorites.includes(item._id);

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "80px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {/* Breadcrumb / Top Bar */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate("/quicksales")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back to QuickSales
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleShare}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              Share
            </button>
            <button
              onClick={handleToggleFavorite}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: isFavorite ? "#fee2e2" : "white",
                border: `1px solid ${isFavorite ? "#fca5a5" : "#cbd5e1"}`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: isFavorite ? "#dc2626" : "#334155",
                cursor: "pointer",
              }}
            >
              {isFavorite ? "Saved ❤️" : "Save ♡"}
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
            {/* Left Column: Gallery & Details */}
            <div>
              {/* Photo Gallery Box */}
              <div style={{ background: "#0F172A", borderRadius: "16px", overflow: "hidden", position: "relative", marginBottom: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                <div style={{ position: "relative", height: "460px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                            style={{
                              position: "absolute",
                              left: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(15, 23, 42, 0.75)",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "50%",
                              width: "42px",
                              height: "42px",
                              cursor: "pointer",
                              fontSize: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ❮
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                            style={{
                              position: "absolute",
                              right: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(15, 23, 42, 0.75)",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "50%",
                              width: "42px",
                              height: "42px",
                              cursor: "pointer",
                              fontSize: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ❯
                          </button>
                          <div
                            style={{
                              position: "absolute",
                              bottom: "16px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: "rgba(0,0,0,0.7)",
                              color: "white",
                              padding: "5px 14px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 600 }}>No Photos Uploaded</div>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div style={{ display: "flex", gap: "10px", padding: "12px 16px", background: "#0D1B2A", overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="thumbnail"
                        onClick={() => setCurrentImageIndex(idx)}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                          opacity: idx === currentImageIndex ? 1 : 0.5,
                          border: `2px solid ${idx === currentImageIndex ? "#E31B1B" : "transparent"}`,
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Metadata Card */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 800 }}>
                    {getCategoryEmoji(item.category)} {item.category || "Item"}
                  </span>
                  {item.condition && (
                    <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                      Condition: {item.condition}
                    </span>
                  )}
                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                    ✓ Verified Deal
                  </span>
                </div>

                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "28px", fontWeight: 800, color: "#0F172A", margin: "0 0 10px 0", lineHeight: 1.25 }}>
                  {item.title}
                </h1>

                <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "14px", margin: "0 0 20px 0", fontWeight: 600 }}>
                  <span style={{ color: "#E31B1B" }}>📍</span> {item.location ? `${item.location}, ` : ""}{item.county || "Kenya"}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginBottom: "10px" }}>About this listing</h3>
                  <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                    {item.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Contact Sidebar */}
            <div>
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", position: "sticky", top: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: "20px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "12px", padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>Asking Price</span>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "32px", fontWeight: 900, color: "#E31B1B", margin: "4px 0" }}>
                    KES {Number(item.price || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                    ● {item.quantity || 1} units currently available
                  </div>
                </div>

                {/* Seller Card */}
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#0F172A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" }}>
                      {(item.sellerName || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "14px" }}>{item.sellerName || "Verified Seller"}</div>
                      <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>✓ Verified Seller</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Location: {item.county || "Kenya"}</div>
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <button
                    onClick={handleWhatsApp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "14px",
                      background: "#25D366",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)",
                    }}
                  >
                    Chat on WhatsApp
                  </button>

                  <button
                    onClick={handleCall}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "14px",
                      background: "#0F172A",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Call Seller
                  </button>
                </div>

                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#92400e", lineHeight: 1.5, fontWeight: 600 }}>
                  🛡️ <strong>Safety Tips:</strong> Inspect the item thoroughly before making any payment. Always meet in safe, public areas.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              background: "#0F172A",
              color: "white",
              padding: "12px 20px",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              fontSize: "13px",
              fontWeight: 700,
              zIndex: 2000,
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
      <FloatingWhatsApp />
    </>
  );
}
