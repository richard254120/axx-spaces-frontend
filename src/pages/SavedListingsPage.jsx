import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function SavedListingsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 404) { setFavorites([]); return; }
          throw new Error("Failed to load favorites");
        }
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error("Favorites error:", err);
        setError("Unable to load saved listings");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const handleRemove = async (favoriteId) => {
    setRemoving(favoriteId);
    try {
      const res = await fetch(`${API_BASE}/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== favoriteId));
      }
    } catch (err) {
      console.error("Remove favorite error:", err);
    } finally {
      setRemoving(null);
    }
  };

  const categories = ["all", ...new Set(favorites.map((f) => f.category || "general"))];
  const filteredFavorites = filter === "all" ? favorites : favorites.filter((f) => (f.category || "general") === filter);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading saved listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>Saved Listings</h1>
          <p style={styles.subtitle}>{favorites.length} saved item{favorites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Category Filter */}
      {categories.length > 1 && (
        <div style={styles.filterRow}>
          {categories.map((cat) => (
            <button
              key={cat}
              style={{ ...styles.filterBtn, ...(filter === cat ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {filteredFavorites.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>❤️</div>
          <h2 style={styles.emptyTitle}>No Saved Listings</h2>
          <p style={styles.emptyText}>
            {filter === "all"
              ? "You haven't saved any businesses yet. Browse and save your favorites!"
              : `No saved listings in "${filter}" category.`}
          </p>
          <Link to="/axxbiashara" style={styles.browseBtn}>Browse Businesses</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredFavorites.map((fav) => {
            const biz = fav.business;
            return (
              <div key={fav._id} style={styles.card}>
                {biz?.images?.[0] && (
                  <div style={styles.cardImage}>
                    <img src={biz.images[0]} alt={biz.businessName} style={styles.cardImg} />
                  </div>
                )}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{biz?.businessName || "Business"}</h3>
                  {biz?.category && <span style={styles.cardCategory}>{biz.category}</span>}
                  {biz?.county && <p style={styles.cardLocation}>{biz.county}</p>}
                  {fav.notes && <p style={styles.cardNotes}>{fav.notes}</p>}
                  <div style={styles.cardDate}>
                    Saved {new Date(fav.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={styles.cardActions}>
                    {biz?._id && (
                      <Link to={`/business/${biz._id}`} style={styles.viewBtn}>View</Link>
                    )}
                    <button
                      style={styles.removeBtn}
                      onClick={() => handleRemove(fav._id)}
                      disabled={removing === fav._id}
                    >
                      {removing === fav._id ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    display: "flex", alignItems: "center", gap: 20,
    maxWidth: 1000, margin: "0 auto 30px",
  },
  backBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(251,191,36,0.2)", borderTop: "4px solid #fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },
  errorBanner: { maxWidth: 1000, margin: "0 auto 20px", padding: "12px 20px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: "0.95rem" },

  filterRow: { display: "flex", gap: 8, maxWidth: 1000, margin: "0 auto 20px", flexWrap: "wrap" },
  filterBtn: {
    padding: "8px 18px", background: "rgba(30,41,59,0.8)", color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, cursor: "pointer",
    fontSize: "0.85rem", fontWeight: 600,
  },
  filterBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" },

  emptyState: {
    maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "60px 40px",
    background: "rgba(30,41,59,0.5)", borderRadius: 16, border: "2px dashed #475569",
  },
  emptyIcon: { fontSize: "4rem", marginBottom: 20 },
  emptyTitle: { color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 700 },
  emptyText: { color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginBottom: 24 },
  browseBtn: {
    display: "inline-block", padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "1rem",
    textDecoration: "none",
  },

  grid: {
    maxWidth: 1000, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20,
  },
  card: {
    background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14, overflow: "hidden", transition: "all 0.2s",
  },
  cardImage: { width: "100%", height: 180, overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardBody: { padding: 20 },
  cardTitle: { color: "#f1f5f9", fontSize: "1.1rem", margin: "0 0 8px", fontWeight: 700 },
  cardCategory: {
    display: "inline-block", padding: "3px 10px", background: "rgba(251,191,36,0.15)",
    color: "#fbbf24", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, marginBottom: 8,
  },
  cardLocation: { color: "#94a3b8", margin: "0 0 8px", fontSize: "0.85rem" },
  cardNotes: { color: "#64748b", margin: "0 0 8px", fontSize: "0.85rem", fontStyle: "italic" },
  cardDate: { color: "#64748b", fontSize: "0.75rem", marginBottom: 12 },
  cardActions: { display: "flex", gap: 8 },
  viewBtn: {
    flex: 1, textAlign: "center", padding: "10px 16px",
    background: "rgba(59,130,246,0.15)", color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8,
    textDecoration: "none", fontWeight: 600, fontSize: "0.85rem",
  },
  removeBtn: {
    padding: "10px 16px", background: "rgba(239,68,68,0.1)", color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: "0.85rem",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
