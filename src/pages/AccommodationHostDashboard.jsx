import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationHostDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "hotel",
    description: "",
    address: "",
    lat: "",
    lng: "",
    amenities: [],
    houseRules: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    maxGuests: 1,
    totalRooms: 1,
  });

  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    capacity: 1,
    pricePerNight: 0,
    quantity: 1,
    amenities: [],
    description: "",
    size: "",
    bedType: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/user-login");
      return;
    }
    if (user.role !== "host") {
      navigate("/login");
      return;
    }
    fetchAccommodations();
  }, [user, navigate]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/accommodations/my-accommodations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccommodations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accommodations:", err);
      setError("Failed to load your accommodations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccommodation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Create FormData for multipart upload
      const formDataWithImages = new FormData();

      // Add all form fields
      formDataWithImages.append("name", formData.name);
      formDataWithImages.append("type", formData.type);
      formDataWithImages.append("description", formData.description);
      formDataWithImages.append("address", formData.address);
      formDataWithImages.append("lat", formData.lat);
      formDataWithImages.append("lng", formData.lng);
      formDataWithImages.append("amenities", JSON.stringify(formData.amenities));
      formDataWithImages.append("houseRules", formData.houseRules);
      formDataWithImages.append("checkInTime", formData.checkInTime);
      formDataWithImages.append("checkOutTime", formData.checkOutTime);
      formDataWithImages.append("maxGuests", formData.maxGuests);
      formDataWithImages.append("totalRooms", formData.totalRooms);

      // Add images if any
      uploadedImages.forEach((image) => {
        formDataWithImages.append("images", image);
      });

      const response = await axios.post(
        `${API_URL}/api/accommodations`,
        formDataWithImages,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setShowCreateForm(false);
        setUploadedImages([]);
        setFormData({
          name: "",
          type: "hotel",
          description: "",
          address: "",
          lat: "",
          lng: "",
          amenities: [],
          houseRules: "",
          checkInTime: "14:00",
          checkOutTime: "11:00",
          maxGuests: 1,
          totalRooms: 1,
          basePrice: "",
          currency: "KES",
        });
        fetchAccommodations();
      }
    } catch (err) {
      console.error("Error creating accommodation:", err);
      setError(err.response?.data?.error || "Failed to create accommodation. Please try again.");
    }
  };

  const handleCreateRoomType = async (e) => {
    e.preventDefault();
    if (!selectedAccommodation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/accommodations/${selectedAccommodation._id}/room-types`,
        {
          ...roomTypeForm,
          amenities: JSON.stringify(roomTypeForm.amenities),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShowRoomTypeForm(false);
        setRoomTypeForm({
          name: "",
          capacity: 1,
          pricePerNight: 0,
          quantity: 1,
          amenities: [],
          description: "",
          size: "",
          bedType: "",
        });
        fetchAccommodations();
      }
    } catch (err) {
      console.error("Error creating room type:", err);
      setError(err.response?.data?.error || "Failed to create room type. Please try again.");
    }
  };

  const handleDeleteAccommodation = async (id) => {
    if (!confirm("Are you sure you want to delete this accommodation? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccommodations();
    } catch (err) {
      console.error("Error deleting accommodation:", err);
      setError(err.response?.data?.error || "Failed to delete accommodation. Please try again.");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.files) {
        setUploadedImages([...uploadedImages, ...response.data.files]);
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      setError(err.response?.data?.error || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "#10b981",
      inactive: "#6b7280",
      pending_review: "#f59e0b",
    };
    return colors[status] || "#6b7280";
  };

  const getTypeLabel = (type) => {
    const labels = {
      hotel: "Hotel",
      bnb: "B&B",
      guesthouse: "Guesthouse",
      apartment: "Apartment",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "white", marginBottom: "8px" }}>
            Host Dashboard
          </h1>
          <p style={{ fontSize: "16px", color: "#d1fae5" }}>
            Manage your accommodations, room types, and bookings
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 20px" }}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "24px", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #e5e7eb", paddingBottom: "12px" }}>
          {["listings", "bookings", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid #059669" : "3px solid transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab ? 700 : 600,
                color: activeTab === tab ? "#059669" : "#6b7280",
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "listings" && (
          <>
            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#065f46" }}>
                My Accommodations ({accommodations.length})
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Add New Accommodation
              </button>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "white", borderRadius: "16px", padding: "32px", maxWidth: "600px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#065f46" }}>Create New Accommodation</h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      style={{ background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleCreateAccommodation}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        Property Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        Property Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      >
                        <option value="hotel">Hotel</option>
                        <option value="bnb">B&B</option>
                        <option value="guesthouse">Guesthouse</option>
                        <option value="apartment">Apartment</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.lat}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.lng}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Max Guests *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.maxGuests}
                          onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Total Rooms *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.totalRooms}
                          onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Base Price per Night (KES) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={formData.basePrice}
                          onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Currency
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        >
                          <option value="KES">KES</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Check-in Time
                        </label>
                        <input
                          type="time"
                          value={formData.checkInTime}
                          onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                          Check-out Time
                        </label>
                        <input
                          type="time"
                          value={formData.checkOutTime}
                          onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        House Rules
                      </label>
                      <textarea
                        value={formData.houseRules}
                        onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                        rows={3}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
                      />
                    </div>

                    {/* Image Upload */}
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                        Property Images (Max 10)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                      {uploading && (
                        <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
                          Uploading images...
                        </div>
                      )}
                      {uploadedImages.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px", marginTop: "12px" }}>
                          {uploadedImages.map((image, index) => (
                            <div key={index} style={{ position: "relative" }}>
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Upload ${index + 1}`}
                                style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  background: "rgba(239, 68, 68, 0.9)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        style={{ padding: "12px 24px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: "12px 24px", background: "#059669", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Create Accommodation
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Accommodations List */}
            {accommodations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>No accommodations yet</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>Start by adding your first property</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Add Your First Accommodation
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {accommodations.map((accommodation) => (
                  <div
                    key={accommodation._id}
                    style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", margin: 0 }}>
                            {accommodation.name}
                          </h3>
                          <span style={{
                            fontSize: "12px", background: "#f3f4f6", color: "#6b7280", padding: "4px 12px", borderRadius: "20px", fontWeight: 600" }}>
                            { getTypeLabel(accommodation.type)}
                        </span>
                        <span style={{ fontSize: "12px", color: getStatusColor(accommodation.status), fontWeight: 700, textTransform: "capitalize" }}>
                          {accommodation.status.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                        {accommodation.address}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {accommodation.maxGuests} guests max • {accommodation.totalRooms} rooms
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setSelectedAccommodation(accommodation)}
                        style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDeleteAccommodation(accommodation._id)}
                        style={{ padding: "8px 16px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                    {/* Room Types */ }
                    { selectedAccommodation?._id === accommodation._id && (
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#065f46", margin: 0 }}>
                          Room Types
                        </h4>
                        <button
                          onClick={() => setShowRoomTypeForm(true)}
                          style={{ padding: "8px 16px", background: "#059669", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          + Add Room Type
                        </button>
                      </div>

                      {showRoomTypeForm && (
                        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
                          <form onSubmit={handleCreateRoomType}>
                            <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px", display: "block" }}>
                                  Room Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={roomTypeForm.name}
                                  onChange={(e) => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })}
                                  style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit" }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px", display: "block" }}>
                                  Capacity *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={roomTypeForm.capacity}
                                  onChange={(e) => setRoomTypeForm({ ...roomTypeForm, capacity: parseInt(e.target.value) })}
                                  style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit" }}
                                />
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px", display: "block" }}>
                                  Price/Night *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={roomTypeForm.pricePerNight}
                                  onChange={(e) => setRoomTypeForm({ ...roomTypeForm, pricePerNight: parseFloat(e.target.value) })}
                                  style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit" }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px", display: "block" }}>
                                  Quantity *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={roomTypeForm.quantity}
                                  onChange={(e) => setRoomTypeForm({ ...roomTypeForm, quantity: parseInt(e.target.value) })}
                                  style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit" }}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                              <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px", display: "block" }}>
                                Description
                              </label>
                              <textarea
                                value={roomTypeForm.description}
                                onChange={(e) => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })}
                                rows={2}
                                style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
                              />
                            </div>

                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => setShowRoomTypeForm(false)}
                                style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                style={{ padding: "8px 16px", background: "#059669", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Add Room Type
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {accommodation.roomTypes && accommodation.roomTypes.length > 0 ? (
                        <div style={{ display: "grid", gap: "12px" }}>
                          {accommodation.roomTypes.map((roomType) => (
                            <div key={roomType._id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>
                                    {roomType.name}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                                    {roomType.capacity} guests • {roomType.quantity} available
                                  </div>
                                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#059669" }}>
                                    KSh {roomType.pricePerNight.toLocaleString()}/night
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280", fontSize: "14px" }}>
                          No room types added yet
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
            )}
      </>
        )}

      {activeTab === "bookings" && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>Bookings Management</h3>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>View and manage incoming booking requests</p>
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>Analytics Dashboard</h3>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>View performance metrics and insights</p>
        </div>
      )}
    </div>
    </div >
  );
}
