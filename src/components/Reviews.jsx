import { useState, useEffect } from "react";
import { getAllReviews, markHelpful, addReply } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

const styles = {
  container: {
    background: "#0f1729",
    color: "#f1f5f9",
    padding: "40px 20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  reviewCard: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f1729",
  },
  userName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f5f9",
  },
  reviewDate: {
    fontSize: "12px",
    color: "#64748b",
  },
  rating: {
    display: "flex",
    gap: "4px",
    fontSize: "20px",
  },
  star: {
    color: "#fbbf24",
  },
  starEmpty: {
    color: "#475569",
  },
  reviewTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "8px",
  },
  reviewComment: {
    fontSize: "15px",
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "16px",
  },
  reviewActions: {
    display: "flex",
    gap: "16px",
    borderTop: "1px solid #334155",
    paddingTop: "16px",
  },
  actionButton: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "color 0.2s",
  },
  helpfulActive: {
    color: "#fbbf24",
  },
  repliesSection: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #334155",
  },
  replyCard: {
    background: "rgba(15, 23, 41, 0.5)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  replyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  replyUser: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#fbbf24",
  },
  replyDate: {
    fontSize: "12px",
    color: "#64748b",
  },
  replyComment: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  replyForm: {
    marginTop: "12px",
  },
  replyInput: {
    width: "100%",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    resize: "none",
    minHeight: "60px",
  },
  replyButton: {
    background: "#fbbf24",
    color: "#0f1729",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
    transition: "background 0.2s",
  },
  loadMoreButton: {
    background: "transparent",
    border: "2px solid #fbbf24",
    color: "#fbbf24",
    borderRadius: "8px",
    padding: "12px 32px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
    transition: "all 0.2s",
  },
  noReviews: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  noReviewsText: {
    fontSize: "18px",
    marginBottom: "16px",
  },
  noReviewsIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
};

export default function Reviews({ category = "general", relatedId = null, limit = 10 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const { user, token } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [category, relatedId]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { category, limit };
      if (relatedId) params.relatedId = relatedId;
      params.page = pageNum;

      const data = await getAllReviews(params);
      
      if (data.success) {
        if (pageNum === 1) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (err) {
      setError("Failed to load reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert("Please login to mark reviews as helpful");
      return;
    }

    try {
      const data = await markHelpful(reviewId, token);
      if (data.success) {
        setReviews(prev =>
          prev.map(review =>
            review._id === reviewId
              ? { ...review, helpfulCount: data.helpfulCount, isHelpful: data.isHelpful }
              : review
          )
        );
      }
    } catch (err) {
      console.error("Error marking helpful:", err);
      setError("Failed to mark review as helpful.");
    }
  };

  const handleReply = async (reviewId) => {
    if (!user) {
      alert("Please login to reply to reviews");
      return;
    }

    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      const data = await addReply(reviewId, replyText, token);
      if (data.success) {
        setReviews(prev =>
          prev.map(review =>
            review._id === reviewId
              ? { ...review, replies: data.review.replies }
              : review
          )
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to add reply");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={i <= rating ? styles.star : styles.starEmpty}>
          ★
        </span>
      );
    }
    return <div style={styles.rating}>{stars}</div>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading && reviews.length === 0) {
    return <div style={styles.container}>Loading reviews...</div>;
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <h2 style={styles.title}>What Our Users Say</h2>
        <p style={styles.subtitle}>Real reviews from real users</p>
      </div>

      {error && (
        <div style={{ color: "#ef4444", textAlign: "center", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={styles.noReviews}>
          <div style={styles.noReviewsIcon}>💬</div>
          <p style={styles.noReviewsText}>No reviews yet</p>
          <p style={{ color: "#64748b" }}>Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.userName}>{review.userName}</div>
                    <div style={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <h3 style={styles.reviewTitle}>{review.title}</h3>
              <p style={styles.reviewComment}>{review.comment}</p>

              <div style={styles.reviewActions}>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(review.isHelpful ? styles.helpfulActive : {}),
                  }}
                  onClick={() => handleMarkHelpful(review._id)}
                >
                  👍 Helpful ({review.helpfulCount})
                </button>
                <button
                  style={styles.actionButton}
                  onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                >
                  💬 Reply
                </button>
              </div>

              {review.replies && review.replies.length > 0 && (
                <div style={styles.repliesSection}>
                  {review.replies.map((reply, idx) => (
                    <div key={idx} style={styles.replyCard}>
                      <div style={styles.replyHeader}>
                        <span style={styles.replyUser}>{reply.userName}</span>
                        <span style={styles.replyDate}>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p style={styles.replyComment}>{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === review._id && (
                <div style={styles.replyForm}>
                  <textarea
                    style={styles.replyInput}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    style={styles.replyButton}
                    onClick={() => handleReply(review._id)}
                  >
                    Submit Reply
                  </button>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <button
              style={styles.loadMoreButton}
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Reviews"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  button:hover:not(:disabled) {
    opacity: 0.8;
  }
  textarea:focus {
    outline: none;
    border-color: #fbbf24 !important;
  }
`;
