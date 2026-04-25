import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const location = useLocation();

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

  /* =========================
     WHATSAPP FUNCTION
  ========================= */
  const openWhatsApp = (phone, title) => {
    if (!phone) {
      alert("No phone number available");
      return;
    }

    // Remove spaces and ensure format
    const cleanPhone = phone.replace(/\s+/g, "");

    const message = `Hello, I am interested in your property: ${title}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏠 Available Listings</h2>

      {/* MAP */}
      <MapView properties={properties} />

      {/* LIST */}
      {properties.length === 0 ? (
        <p>No properties found</p>
      ) : (
        <div style={styles.grid}>
          {properties.map((p) => {
            const imageSrc = p.image;

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
                <p><b>Deposit:</b> Ksh {p.deposit}</p>

                <p>{p.type}</p>
                <p>{p.bedrooms} Bedrooms</p>

                {/* AMENITIES */}
                {p.amenities?.length > 0 && (
                  <p style={{ fontSize: "12px", color: "#aaa" }}>
                    🏡 {p.amenities.join(", ")}
                  </p>
                )}

                <p style={{ fontSize: "12px", opacity: 0.8 }}>
                  {p.description}
                </p>

                <strong>📞 {p.phone}</strong>

                {/* =========================
                    WHATSAPP BUTTON
                ========================= */}
                <button
                  onClick={() => openWhatsApp(p.phone, p.title)}
                  style={styles.whatsappBtn}
                >
                  💬 Chat on WhatsApp
                </button>

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

  /* NEW STYLE */
  whatsappBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#25D366",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};