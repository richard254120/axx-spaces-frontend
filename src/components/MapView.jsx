import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// FIX ICON ISSUE (IMPORTANT for Leaflet in React)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapView({ properties }) {
  return (
    <MapContainer
      center={[-1.2921, 36.8219]} // Nairobi default
      zoom={6}
      style={{ height: "400px", width: "100%", marginTop: "20px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties
        .filter((p) => p.lat && p.lng)
        .map((p) => (
          <Marker key={p._id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.title}</strong>
              <br />
              {p.area}, {p.county}
              <br />
              Ksh {p.price}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}