import { useState } from "react";

export default function CompactReviews({ reviews = [], rating = 0, totalReviews = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = expanded ? reviews.length : Math.min(3, reviews.length);

  if (!reviews || reviews.length === 0) {
    return (
      <div style={s.emptyState}>
        <span style={s.emptyIcon}></span>
        <span style={s.emptyText}>No reviews yet</span>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* Rating Summary */}
      <div style={s.summary}>
        <div style={s.ratingBig}>{rating.toFixed(1)}</div>
        <div style={s.ratingDetails}>
          <div style={s.stars}>{"".repeat(Math.round(rating))}</div>
          <div style={s.totalCount}>{totalReviews} reviews</div>
        </div>
      </div>

      {/* Compact Review List */}
      <div style={s.reviewList}>
        {reviews.slice(0, displayCount).map((review, idx) => (
          <div key={idx} style={s.reviewItem}>
            <div style={s.reviewHeader}>
              <span style={s.reviewerName}>{review.name?.split(' ')[0] || 'Anonymous'}</span>
              <span style={s.reviewDate}>{review.date || ''}</span>
            </div>
            <div style={s.reviewRating}>{"".repeat(review.rating || 5)}</div>
            <p style={s.reviewText}>
              {expanded || review.comment?.length <= 100
                ? review.comment
                : `${review.comment?.substring(0, 100)}...`}
            </p>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {reviews.length > 3 && (
        <button
          type="button"
          style={s.expandBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}

const s = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e5e7eb',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  ratingBig: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#fbbf24',
    lineHeight: 1,
  },
  ratingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stars: {
    fontSize: '14px',
    color: '#fbbf24',
    letterSpacing: '1px',
  },
  totalCount: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewItem: {
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  reviewerName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1f2937',
  },
  reviewDate: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  reviewRating: {
    fontSize: '11px',
    color: '#fbbf24',
    marginBottom: '6px',
  },
  reviewText: {
    fontSize: '12px',
    color: '#4b5563',
    lineHeight: '1.5',
    margin: '0',
    display: '-webkit-box',
    WebkitLineClamp: expanded ? 'unset' : 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  expandBtn: {
    width: '100%',
    background: 'transparent',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    cursor: 'pointer',
    marginTop: '12px',
    fontFamily: 'inherit',
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#9ca3af',
  },
  emptyIcon: {
    fontSize: '24px',
    marginBottom: '8px',
    display: 'block',
  },
  emptyText: {
    fontSize: '13px',
    fontWeight: '600',
  },
};
