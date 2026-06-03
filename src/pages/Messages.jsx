import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #fbbf24",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
  },
  icon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "12px",
  },
  cardText: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  button: {
    padding: "14px 28px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    marginRight: "12px",
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "32px",
  },
  featureCard: {
    background: "rgba(15, 23, 42, 0.5)",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  featureIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  featureTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  featureText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
};

export default function Messages() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Messages</h1>
          <p style={styles.subtitle}>Communicate with property owners and service providers</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>💬</div>
          <h2 style={styles.cardTitle}>Messaging Coming Soon</h2>
          <p style={styles.cardText}>
            We're building a secure messaging system that will allow you to:
          </p>
          
          <div style={styles.features}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🏠</div>
              <h3 style={styles.featureTitle}>Contact Property Owners</h3>
              <p style={styles.featureText}>
                Send messages directly to landlords and property managers
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🚛</div>
              <h3 style={styles.featureTitle}>Chat with Movers</h3>
              <p style={styles.featureText}>
                Discuss moving details with verified moving companies
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🏪</div>
              <h3 style={styles.featureTitle}>Business Inquiries</h3>
              <p style={styles.featureText}>
                Ask questions about businesses and services
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3 style={styles.featureTitle}>Secure & Private</h3>
              <p style={styles.featureText}>
                End-to-end encrypted messaging for your privacy
              </p>
            </div>
          </div>

          <div style={{ marginTop: "32px" }}>
            <button style={styles.button} onClick={() => navigate("/listings")}>
              Browse Listings
            </button>
            <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate("/profile")}>
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
