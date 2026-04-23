import { useState } from "react";
import API from "../api/api";

export default function Upload() {
  const [form, setForm] = useState({
    title: "",
    county: "",
    area: "",
    price: "",
    deposit: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    description: "",
    phone: "",
    image: null,
    lat: "",
    lng: "",
  });

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit",
    "Isiolo","Meru","Tharaka Nithi","Embu","Kitui",
    "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang’a","Kiambu","Turkana","West Pokot","Samburu",
    "Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo",
    "Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia",
    "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom",
    "3 Bedroom","4+ Bedroom","Maisonette","Bungalow",
    "Townhouse","Apartment Block","Single Room","Shared Room",
    "Hostel Room","Commercial Office","Shop / Retail Space",
    "Warehouse","Plot / Land","Furnished Apartment",
    "Unfurnished Apartment"
  ];

  const amenitiesList = [
    "Water","Electricity","Parking","Security",
    "WiFi","Borehole","Furnished"
  ];

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));

        alert("Location detected ✔");
      },
      (error) => {
        console.log("GEO ERROR:", error);
        alert("Location permission denied ❌");
      }
    );
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAmenity = (item) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(item);

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  const handleImage = (e) => {
    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("county", form.county);
    formData.append("area", form.area);
    formData.append("price", form.price);
    formData.append("deposit", form.deposit);
    formData.append("type", form.type);
    formData.append("bedrooms", form.bedrooms);
    formData.append("bathrooms", form.bathrooms);
    formData.append("description", form.description);
    formData.append("phone", form.phone);

    formData.append("lat", form.lat || "");
    formData.append("lng", form.lng || "");
    formData.append("amenities", JSON.stringify(form.amenities || []));

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      // ✅ FIXED REQUEST
      const res = await API.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("SUCCESS:", res.data);
      alert("Property submitted ✔");

      setForm({
        title: "",
        county: "",
        area: "",
        price: "",
        deposit: "",
        type: "",
        bedrooms: "",
        bathrooms: "",
        amenities: [],
        description: "",
        phone: "",
        image: null,
        lat: "",
        lng: "",
      });

    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND RESPONSE:", err?.response?.data);
      alert(err?.response?.data?.error || "Submit failed ❌ Check backend or network");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Property</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        <input name="title" placeholder="Property Title" onChange={handleChange} required />

        <select name="county" onChange={handleChange} required>
          <option value="">Select County</option>
          {counties.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <input name="area" placeholder="Area / Estate" onChange={handleChange} required />

        <select name="type" onChange={handleChange} required>
          <option value="">Property Type</option>
          {propertyTypes.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>

        <input name="price" placeholder="Rent per Month" onChange={handleChange} required />
        <input name="deposit" placeholder="Deposit" onChange={handleChange} />
        <input name="bedrooms" placeholder="Bedrooms" onChange={handleChange} />
        <input name="bathrooms" placeholder="Bathrooms" onChange={handleChange} />

        <div style={styles.amenitiesBox}>
          <p>Select Amenities:</p>
          <div style={styles.amenitiesGrid}>
            {amenitiesList.map((item, i) => (
              <label key={i}>
                <input type="checkbox" onChange={() => handleAmenity(item)} />
                {item}
              </label>
            ))}
          </div>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          rows="4"
        />

        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />

        <button type="button" onClick={getMyLocation} style={styles.geoBtn}>
          📍 Get My Location
        </button>

        <input name="lat" placeholder="Latitude" value={form.lat} onChange={handleChange} />
        <input name="lng" placeholder="Longitude" value={form.lng} onChange={handleChange} />

        <input type="file" accept="image/*" onChange={handleImage} />

        <button className="btn" type="submit">
          Submit for Approval
        </button>

      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  amenitiesBox: {
    background: "#111",
    padding: "10px",
    borderRadius: "8px",
  },
  amenitiesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  geoBtn: {
    padding: "10px",
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "5px",
    cursor: "pointer",
  },
};