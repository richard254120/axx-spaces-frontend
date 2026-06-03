import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #fbbf24",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  cardLocation: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  cardPrice: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    marginRight: "8px",
  },
  buttonRemove: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "24px",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
};

export default function Saved() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadSavedItems();
  }, [token, navigate]);

  const loadSavedItems = async () => {
    setLoading(true);
    try {
      const res = await API.get("/favorites");
      setSavedItems(res.data.favorites || []);
    } catch (err) {
      console.error("Failed to load saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await API.delete(`/favorites/${itemId}`);
      setSavedItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      alert("Failed to remove from saved items");
    }
  };

  const handleViewDetails = (item) => {
    if (item.type === "property") {
      navigate(`/listings`);
    } else if (item.type === "business") {
      navigate(`/business/${item._id}`);
    } else if (item.type === "tourism") {
      navigate(`/tourism/${item._id}`);
    } else {
      navigate(`/listings`);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading saved items...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Saved Listings</h1>
          <p style={styles.subtitle}>Your favorite properties and businesses</p>
        </div>

        {savedItems.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>❤️</div>
            <div style={styles.emptyTitle}>No saved items yet</div>
            <p style={styles.emptyText}>
              Start exploring and save your favorite properties and businesses
            </p>
            <button style={styles.button} onClick={() => navigate("/listings")}>
              Explore Listings
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {savedItems.map((item) => (
              <div key={item._id} style={styles.card}>
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name || item.title}
                    style={styles.image}
                  />
                ) : (
                  <div style={{ ...styles.image, background: "rgba(30, 41, 59, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                    🏠
                  </div>
                )}
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>
                    {item.name || item.title || item.propertyName}
                  </h3>
                  <p style={styles.cardLocation}>
                    📍 {item.location?.town || item.location || "Location not specified"}
                  </p>
                  {item.price && (
                    <div style={styles.cardPrice}>
                      KES {item.price?.toLocaleString()}
                      {item.priceType && `/${item.priceType}`}
                    </div>
                  )}
                  <div style={styles.cardActions}>
                    <button
                      style={{ ...styles.button, ...styles.buttonSecondary }}
                      onClick={() => handleViewDetails(item)}
                    >
                      View Details
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.buttonRemove }}
                      onClick={() => handleRemoveFavorite(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
