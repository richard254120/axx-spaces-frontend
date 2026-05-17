import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapView({ properties }) {
  const withCoords = properties.filter((p) => p.lat && p.lng);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.heading}>🗺️ Property Locations</h3>
      {withCoords.length === 0 ? (
        <div style={styles.noMap}>
          📍 No properties have map coordinates yet.
        </div>
      ) : (
        <MapContainer
          center={[-1.2921, 36.8219]}
          zoom={6}
          style={styles.map}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {withCoords.map((p) => (
            <Marker key={p._id} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", minWidth: "160px" }}>
                  <strong style={{ display: "block", marginBottom: "4px" }}>{p.title}</strong>
                  <span style={{ color: "#555" }}>📍 {p.location}, {p.county}</span>
                  <br />
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>
                    KES {p.price?.toLocaleString()}/mo
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "0.85em" }}>
                    🛏 {p.bedrooms} Bed · 🚿 {p.bathrooms} Bath
                  </span>
                  {p.availableUnits > 0 && (
                    <>
                      <br />
                      <span style={{ color: "#10b981", fontSize: "0.85em", fontWeight: 600 }}>
                        ✅ {p.availableUnits} unit{p.availableUnits !== 1 ? "s" : ""} available
                      </span>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    margin: "24px 0",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #334155",
    background: "#1e293b",
  },
  heading: {
    margin: 0,
    padding: "14px 20px",
    color: "#fbbf24",
    fontSize: "1rem",
    fontWeight: 600,
    borderBottom: "1px solid #334155",
    background: "#0f1729",
  },
  map: {
    height: "400px",
    width: "100%",
  },
  noMap: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
};
