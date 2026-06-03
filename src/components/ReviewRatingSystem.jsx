import { useState, useEffect } from "react";

export default function ReviewRatingSystem({ 
  entityId, 
  entityType = "property", 
  currentUser = null,
  existingReviews = [],
  onReviewSubmit = null 
}) {
  const [reviews, setReviews] = useState(existingReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [entityId]);

  const loadReviews = () => {
    const reviewKey = `reviews_${entityType}_${entityId}`;
    const savedReviews = localStorage.getItem(reviewKey);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else if (existingReviews.length > 0) {
      setReviews(existingReviews);
    }
  };

  const saveReview = (review) => {
    const reviewKey = `reviews_${entityType}_${entityId}`;
    const updatedReviews = [...reviews, review];
    localStorage.setItem(reviewKey, JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!currentUser || userRating === 0 || !userReview.trim()) {
      alert("Please provide a rating and review");
      return;
    }

    const newReview = {
      id: Date.now(),
      entityId,
      entityType,
      userId: currentUser._id || currentUser.id,
      userName: currentUser.name || "Anonymous",
      rating: userRating,
      comment: userReview.trim(),
      timestamp: new Date().toISOString(),
    };

    saveReview(newReview);
    setUserRating(0);
    setUserReview("");
    setShowReviewForm(false);

    if (onReviewSubmit) {
      onReviewSubmit(newReview);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const averageRating = calculateAverageRating();
  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Rating Summary */}
      <div style={styles.summarySection}>
        <div style={styles.averageRating}>
          <span style={styles.bigRating}>{averageRating}</span>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} style={styles.star}>
                {star <= Math.round(averageRating) ? "★" : "☆"}
              </span>
            ))}
          </div>
          <span style={styles.totalReviews}>{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
        </div>

        <div style={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={rating} style={styles.ratingBarRow}>
                <span style={styles.ratingLabel}>{rating} ★</span>
                <div style={styles.ratingBarTrack}>
                  <div style={{ ...styles.ratingBarFill, width: `${percentage}%` }}></div>
                </div>
                <span style={styles.ratingCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      {currentUser && (
        <button
          style={styles.writeReviewBtn}
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? "Cancel" : "✍️ Write a Review"}
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && currentUser && (
        <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
          <h4 style={styles.formTitle}>Rate your experience</h4>
          
          <div style={styles.starInput}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                style={{
                  ...styles.starButton,
                  color: star <= (hoverRating || userRating) ? "#fbbf24" : "#475569",
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(star)}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            placeholder="Share your experience with this property..."
            style={styles.reviewInput}
            rows={4}
            required
          />

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn}>
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setUserRating(0);
                setUserReview("");
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div style={styles.reviewsList}>
        <h3 style={styles.reviewsTitle}>Recent Reviews</h3>
        
        {reviews.length === 0 ? (
          <div style={styles.emptyReviews}>
            <p style={styles.emptyText}>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.slice().reverse().map(review => (
            <div key={review.id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.reviewerInfo}>
                  <div style={styles.reviewerAvatar}>
                    {review.userName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <span style={styles.reviewerName}>{review.userName}</span>
                    <span style={styles.reviewDate}>
                      {new Date(review.timestamp).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={styles.star}>
                      {star <= review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
              <p style={styles.reviewText}>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "600px",
  },
  summarySection: {
    display: "flex",
    gap: "32px",
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #334155",
  },
  averageRating: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  bigRating: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#fbbf24",
  },
  stars: {
    fontSize: "1.5rem",
    color: "#fbbf24",
    letterSpacing: "2px",
  },
  star: {
    color: "#fbbf24",
  },
  totalReviews: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  ratingBars: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ratingBarRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  ratingLabel: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    width: "30px",
  },
  ratingBarTrack: {
    flex: 1,
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  ratingCount: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    width: "30px",
    textAlign: "right",
  },
  writeReviewBtn: {
    width: "100%",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "24px",
    transition: "all 0.2s",
  },
  reviewForm: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
  },
  formTitle: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  starInput: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  starButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    padding: "4px",
    transition: "transform 0.2s",
  },
  reviewInput: {
    width: "100%",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    resize: "vertical",
    outline: "none",
    marginBottom: "16px",
  },
  formActions: {
    display: "flex",
    gap: "12px",
  },
  submitBtn: {
    flex: 1,
    padding: "10px 20px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  reviewsTitle: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  emptyReviews: {
    textAlign: "center",
    padding: "40px 20px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "8px",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    margin: 0,
  },
  reviewCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  reviewerInfo: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: 700,
  },
  reviewerName: {
    color: "#f1f5f9",
    fontSize: "0.95rem",
    fontWeight: 600,
    display: "block",
  },
  reviewDate: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    display: "block",
    marginTop: "2px",
  },
  reviewStars: {
    fontSize: "1rem",
    color: "#fbbf24",
  },
  reviewText: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    margin: 0,
  },
};

const css = `
  .star-button:hover {
    transform: scale(1.2);
  }
`;
