import { useState } from "react";
import Reviews from "../components/Reviews";
import ReviewForm from "../components/ReviewForm";

const styles = {
  page: {
    background: "linear-gradient(135deg, #0f1729 0%, #1e293b 100%)",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f1f5f9",
  },
  hero: {
    textAlign: "center",
    padding: "72px 24px 48px",
    borderBottom: "1px solid #1e3a5f55",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#fbbf24",
    marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 56px)",
    fontWeight: 800,
    color: "#f1f5f9",
    margin: "0 0 16px",
  },
  heroSub: {
    fontSize: "16px",
    color: "#94a3b8",
    maxWidth: "600px",
    margin: "0 auto",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "32px",
  },
  reviewsSection: {
    marginBottom: "48px",
  },
  formSection: {
    marginBottom: "48px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "24px",
  },
};

export default function ReviewsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewSubmit = () => {
    // Refresh the reviews list when a new review is submitted
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Reviews</p>
        <h1 style={styles.heroTitle}>What Our Users Say</h1>
        <p style={styles.heroSub}>
          Read honest reviews from our community and share your own experience with Axx Space
        </p>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        <div style={styles.grid}>
          {/* REVIEWS LIST */}
          <div style={styles.reviewsSection}>
            <h2 style={styles.sectionTitle}>Recent Reviews</h2>
            <Reviews key={refreshKey} category="general" limit={10} />
          </div>

          {/* REVIEW FORM */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Write a Review</h2>
            <ReviewForm category="general" onSubmitSuccess={handleReviewSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
`;
