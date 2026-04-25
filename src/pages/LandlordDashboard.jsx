import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import PropertyCard from "../components/PropertyCard";

export default function LandlordDashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProperties = async () => {
      try {
        const res = await API.get("/properties/my-properties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(res.data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      await API.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
      alert("Property deleted successfully");
    } catch (err) {
      alert("Failed to delete property");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading your properties...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: "#fff", textAlign: "center", marginBottom: "30px" }}>
        My Properties
      </h1>

      {properties.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", fontSize: "18px" }}>
          You haven't uploaded any properties yet.
        </p>
      ) : (
        properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            isOwner={true}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}