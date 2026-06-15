import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong" };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
            background: "#0f1729",
            color: "#f1f5f9",
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#fbbf24", margin: "0 0 12px" }}>Page failed to load</h2>
          <p style={{ color: "#94a3b8", maxWidth: "480px", margin: "0 0 24px", lineHeight: 1.6 }}>
            {this.state.message || "An unexpected error occurred. Please refresh or go back home."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                background: "#fbbf24",
                color: "#0f1729",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "#fbbf24",
                border: "1px solid #fbbf24",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
