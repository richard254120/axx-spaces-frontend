import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
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
    "Electronics": "📱",
    "Appliances": "🍳",
    "Tools": "🔧",
    "Clothing": "👕",
    "Books": "📚",
    "Sports & Outdoors": "⚽",
    "Home & Garden": "🏡",
    "Beauty & Personal Care": "💄",
    "Toys & Games": "🎮",
    "Construction Materials": "🧱",
    "Vehicles & Parts": "🚗",
    "Other": "📦",
  };
  return emojiMap[category] || "📦";
};

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!item) return;
    setFavorites(prev =>
      prev.includes(item._id) ? prev.filter(favId => favId !== item._id) : [...prev, item._id]
    );
  };

  const handleWhatsApp = () => {
    if (!item) return;
    const phone = formatKenyaPhone(item.sellerPhone);
    const msg = `Hi ${item.sellerName}, I'm interested in your listing "${item.title}" on Axxspace for KES ${item.price?.toLocaleString()}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    if (!item) return;
    window.open(`tel:${item.sellerPhone}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Navbar />
        <div style={{ fontSize: "18px", color: "#64748b" }}>Loading item details...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Navbar />
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
        <h2 style={{ color: "#ef4444", margin: "0 0 8px" }}>Item Not Found</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>{error || "This item doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate("/materials")}
          style={{
            padding: "12px 28px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Browse Materials
        </button>
      </div>
    );
  }

  const isFavorite = favorites.includes(item._id);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "60px" }}>
        {/* Image Gallery */}
        <div style={{ position: "relative", height: "500px", background: "#e2e8f0" }}>
          {item.images?.length > 0 ? (
            <>
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + item.images.length) % item.images.length)}
                    style={{
                      position: "absolute",
                      left: "20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      cursor: "pointer",
                      fontSize: "24px",
                    }}
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % item.images.length)}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      cursor: "pointer",
                      fontSize: "24px",
                    }}
                  >
                    ❯
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {currentImageIndex + 1} / {item.images.length}
                  </div>
                </>
              )}
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(255,255,255,0.9)",
                  color: isFavorite ? "#ef4444" : "#9ca3af",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  cursor: "pointer",
                  fontSize: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                {isFavorite ? "❤️" : "♡"}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "24px" }}>
              No Photos
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px" }}>
            {/* Main Content */}
            <div>
              <div style={{ marginBottom: "20px" }}>
                <span style={{ background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                  {item.category || "General"}
                </span>
                <span style={{ background: "#22c55e", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, marginLeft: "8px" }}>
                  {item.condition || "Good"}
                </span>
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>{item.title}</h1>
              <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px" }}>
                📍 {item.location}, {item.county}
              </p>

              <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>{getCategoryEmoji(item.category)}</span>
                  <span style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b" }}>{item.category}</span>
                </div>
                {item.quantity && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "24px" }}>📦</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b" }}>{item.quantity} available</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>Description</h2>
                <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.8" }}>{item.description || "No description provided."}</p>
              </div>

              {item.specifications && (
                <div style={{ marginBottom: "32px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>Specifications</h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.8" }}>{item.specifications}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "sticky", top: "100px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#1e293b" }}>KES {Number(item.price).toLocaleString()}</div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>Fixed price</div>
                </div>

                <div style={{ marginBottom: "20px", padding: "16px", background: "#f1f5f9", borderRadius: "8px" }}>
                  <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>Seller</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b" }}>{item.sellerName}</div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>📍 {item.county}</div>
                </div>

                <button
                  onClick={handleWhatsApp}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#25d366",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    marginBottom: "12px",
                  }}
                >
                  WhatsApp Seller
                </button>
                <button
                  onClick={handleCall}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#f1f5f9",
                    color: "#1e293b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Call Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingWhatsApp />
    </>
  );
}
