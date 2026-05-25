export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#b91c1c",
      padding: "12px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    }}>
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: "white",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "6px 12px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
