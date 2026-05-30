import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function PremiumPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "basic",
      name: "Basic Boost",
      price: 5000,
      duration: "14 Days",
      features: ["Featured Badge", "Priority in County", "Basic Visibility"],
      color: "#3b82f6"
    },
    {
      id: "standard",
      name: "Standard Boost",
      price: 12000,
      duration: "30 Days",
      features: ["All Basic Features", "Homepage Carousel", "Higher Views"],
      color: "#8b5cf6",
      popular: true
    },
    {
      id: "premium",
      name: "Premium Boost",
      price: 25000,
      duration: "30 Days",
      features: ["All Standard Features", "Top of All Listings", "WhatsApp Highlight", "Analytics"],
      color: "#eab308"
    }
  ];

  const handleSelectPlan = (plan) => {
    if (!propertyId) {
      alert("❌ Property ID is missing. Go back to dashboard.");
      return;
    }
    setSelectedPlan(plan);
    navigate(`/checkout?propertyId=${propertyId}&plan=${plan.id}&amount=${plan.price}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⭐ Boost Your Listing</h1>
        <p style={styles.subtitle}>Get more visibility and faster bookings</p>
      </div>

      <div style={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id} style={{
            ...styles.planCard,
            borderColor: plan.popular ? "#eab308" : "#334155",
            transform: plan.popular ? "scale(1.05)" : "scale(1)"
          }}>
            {plan.popular && <div style={styles.popularBadge}>MOST POPULAR</div>}

            <h3 style={styles.planName}>{plan.name}</h3>
            <div style={styles.price}>
              KSh {plan.price.toLocaleString()}
              <span style={styles.duration}>/{plan.duration}</span>
            </div>

            <ul style={styles.features}>
              {plan.features.map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              style={{ ...styles.selectBtn, backgroundColor: plan.color }}
            >
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "20px",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    minHeight: "100vh",
    color: "#f1f5f9"
  },
  header: { textAlign: "center", marginBottom: "50px" },
  title: { fontSize: "2.8rem", margin: "0 0 10px 0", color: "#fbbf24" },
  subtitle: { fontSize: "1.1rem", color: "#94a3b8" },

  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
    padding: "20px"
  },
  planCard: {
    background: "linear-gradient(135deg, #1e293b, #0f1729)",
    border: "2px solid #334155",
    borderRadius: "16px",
    padding: "32px 24px",
    position: "relative",
    transition: "all 0.3s"
  },
  popularBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#eab308",
    color: "#000",
    padding: "6px 20px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "0.9rem"
  },
  planName: { fontSize: "1.5rem", margin: "0 0 16px 0", textAlign: "center" },
  price: { fontSize: "2.2rem", fontWeight: "700", textAlign: "center", color: "#fbbf24", marginBottom: "8px" },
  duration: { fontSize: "1rem", color: "#94a3b8" },
  features: { listStyle: "none", padding: 0, margin: "24px 0", lineHeight: "1.8" },
  selectBtn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "700",
    fontSize: "1.1rem",
    cursor: "pointer",
    marginTop: "10px"
  },
  backBtn: {
    display: "block",
    margin: "40px auto 0",
    padding: "12px 32px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};