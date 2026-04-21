import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const location = useLocation();

  // FETCH DATA (WITH SEARCH FILTERS FROM URL)
  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const fetchProperties = async () => {
    try {
      const res = await API.get(`/properties/approved${location.search}`);
      setProperties(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>🏠 Available Listings</h2>

      {/* 🌍 MAP VIEW */}
      <MapView properties={properties} />

      {/* LIST VIEW */}
      {properties.length === 0 ? (
        <p>No properties found</p>
      ) : (
        <div style={styles.grid}>
          {properties.map((p) => {

            // ✅ FIXED IMAGE HANDLING (PRODUCTION SAFE)
            const imageSrc = p.image
              ? `https://axx-spaces-backend.onrender.com/uploads/${p.image}`
              : null;

            return (
              <div key={p._id} style={styles.card}>

                {/* IMAGE */}
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={p.title}
                    style={styles.image}
                  />
                )}

                <h3>{p.title}</h3>
                <p>{p.county} - {p.area}</p>
                <p><b>Ksh {p.price}</b></p>
                <p>{p.type}</p>
                <p>{p.bedrooms} Bedrooms</p>

                {/* AMENITIES */}
                {p.amenities && p.amenities.length > 0 && (
                  <p style={{ fontSize: "12px", color: "#aaa" }}>
                    🏡 {p.amenities.join(", ")}
                  </p>
                )}

                <p style={{ fontSize: "12px", opacity: 0.8 }}>
                  {p.description}
                </p>

                <strong>📞 {p.phone}</strong>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  card: {
    background: "#111",
    padding: "15px",
    borderRadius: "10px",
    color: "white",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};