import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function BoostNotification({ user, userType = "landlord" }) {
  const [showNotification, setShowNotification] = useState(false);
  const [hasBoostedItems, setHasBoostedItems] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkBoostStatus();
  }, [user, userType]);

  const checkBoostStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let endpoint;
      if (userType === "landlord") {
        endpoint = "/properties/my-listings";
      } else if (userType === "seller") {
        endpoint = "/materials/my-materials";
      } else if (userType === "mover") {
        endpoint = "/movers/profile";
      }

      const response = await API.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data;

      // Check if any items are boosted
      let boosted = false;
      if (Array.isArray(data)) {
        boosted = data.some(item => item.isFeatured);
      } else if (data.isFeatured) {
        boosted = true;
      }

      setHasBoostedItems(boosted);

      // Show notification if user has items but none are boosted
      if (!boosted && data.length > 0) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error checking boost status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !showNotification || hasBoostedItems) {
    return null;
  }

  return (
    <div style={styles.notification}>
      <div style={styles.notificationContent}>
        <div style={styles.icon}>🚀</div>
        <div style={styles.text}>
          <div style={styles.title}>Boost Your {userType === "landlord" ? "Property" : userType === "seller" ? "Items" : "Profile"}</div>
          <div style={styles.message}>
            Get more visibility! Boost starting from KES 100 for 3 weeks
          </div>
        </div>
        <button
          style={styles.boostButton}
          onClick={() => {
            if (userType === "landlord") {
              navigate("/listings");
            } else if (userType === "seller") {
              navigate("/materials");
            } else if (userType === "mover") {
              navigate("/movers/dashboard");
            }
          }}
        >
          Boost Now
        </button>
        <button
          style={styles.dismissButton}
          onClick={() => setShowNotification(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const styles = {
  notification: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    maxWidth: "400px",
  },
  notificationContent: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "32px",
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  message: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  boostButton: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dismissButton: {
    padding: "4px 8px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};
