import { useNavigate } from "react-router-dom";

// Consistent wrong-portal notice for the four provider login pages.
// Shows the message and, when a portal path is known, a button to go there.
export default function PortalMismatchNotice({ mismatch }) {
  const navigate = useNavigate();
  if (!mismatch) return null;

  return (
    <div
      role="alert"
      style={{
        background: "rgba(245, 158, 11, 0.12)",
        border: "1px solid rgba(245, 158, 11, 0.5)",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <span style={{ color: "#fbbf24", fontSize: 14, lineHeight: 1.5 }}>
        {mismatch.message}
      </span>
      {mismatch.portalPath && (
        <button
          type="button"
          onClick={() => navigate(mismatch.portalPath)}
          style={{
            alignSelf: "flex-start",
            background: "rgba(245, 158, 11, 0.9)",
            color: "#1a1206",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go to the correct portal →
        </button>
      )}
    </div>
  );
}
