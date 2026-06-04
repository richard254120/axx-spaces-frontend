import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

function getNotifTitle(n) {
  switch (n.type) {
    case "property_booking": return "Property Booking";
    case "material_purchase": return "Material Purchase";
    case "tourism_booking": return "Tourism Booking";
    case "boost": return "Listing Boosted";
    case "subscription": return "Subscription Update";
    default: return n.title || "Notification";
  }
}

function getNotifMessage(n) {
  if (n.amount) return `Payment of KES ${n.amount.toLocaleString()} - ${n.status || "pending"}`;
  return n.message || "You have a new notification";
}

function mergeNotifications(local, server) {
  const ids = new Set(local.map((n) => n.id || n._id));
  const newFromServer = server
    .filter((n) => !ids.has(n._id))
    .map((n) => ({
      id: n._id,
      type: n.type || "general",
      title: getNotifTitle(n),
      message: getNotifMessage(n),
      read: n.read || false,
      timestamp: n.createdAt || new Date().toISOString(),
    }));
  return [...newFromServer, ...local].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default function NotificationsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const localNotifs = localStorage.getItem("axxspace_notifications");
        if (localNotifs) {
          setNotifications(JSON.parse(localNotifs));
        }
        try {
          const res = await fetch(`${API_BASE}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.notifications?.length) {
              const combined = mergeNotifications(
                JSON.parse(localNotifs || "[]"),
                data.notifications
              );
              setNotifications(combined);
              localStorage.setItem("axxspace_notifications", JSON.stringify(combined));
            }
          }
        } catch {
          // Backend notifications endpoint may not exist yet
        }
      } catch (err) {
        console.error("Notifications error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "property_booking": case "booking": return "📅";
      case "material_purchase": case "payment": return "💳";
      case "tourism_booking": return "🏨";
      case "boost": return "🚀";
      case "subscription": return "⭐";
      case "message": return "💬";
      case "review": return "⭐";
      default: return "🔔";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "property_booking": case "booking": return "#22c55e";
      case "material_purchase": case "payment": return "#fbbf24";
      case "tourism_booking": return "#3b82f6";
      case "boost": return "#f97316";
      case "subscription": return "#8b5cf6";
      case "message": return "#3b82f6";
      default: return "#64748b";
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
    localStorage.removeItem("axxspace_notifications");
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifs = filter === "all" ? notifications : filter === "unread" ? notifications.filter((n) => !n.read) : notifications.filter((n) => n.type === filter);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>
            Notifications
            {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
          </h1>
          <p style={styles.subtitle}>{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={styles.headerActions}>
          {unreadCount > 0 && (
            <button style={styles.actionBtn} onClick={markAllAsRead}>Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button style={{ ...styles.actionBtn, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {["all", "unread", "property_booking", "payment", "message"].map((f) => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === "property_booking" ? "Bookings" : f === "payment" ? "Payments" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredNotifs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔔</div>
          <h2 style={styles.emptyTitle}>No Notifications</h2>
          <p style={styles.emptyText}>
            {filter === "all" ? "You're all caught up! No notifications at the moment." : `No ${filter} notifications.`}
          </p>
        </div>
      ) : (
        <div style={styles.notifList}>
          {filteredNotifs.map((notif) => {
            const typeColor = getTypeColor(notif.type);
            return (
              <div
                key={notif.id}
                style={{ ...styles.notifCard, ...(notif.read ? {} : styles.notifUnread) }}
                onClick={() => markAsRead(notif.id)}
              >
                <div style={{ ...styles.notifIcon, background: `${typeColor}22`, color: typeColor }}>
                  {getTypeIcon(notif.type)}
                </div>
                <div style={styles.notifContent}>
                  <div style={styles.notifTitle}>{notif.title || getNotifTitle(notif)}</div>
                  <div style={styles.notifMessage}>{notif.message}</div>
                  <div style={styles.notifTime}>{formatTime(notif.timestamp)}</div>
                </div>
                <button
                  style={styles.notifDeleteBtn}
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    maxWidth: 900, margin: "0 auto 20px",
  },
  backBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  unreadBadge: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 24, height: 24, borderRadius: 12, background: "#ef4444", color: "white",
    fontSize: "0.75rem", fontWeight: 700, padding: "0 6px",
  },
  headerActions: { display: "flex", gap: 8 },
  actionBtn: {
    padding: "8px 16px", background: "rgba(255,255,255,0.05)", color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.8rem", fontWeight: 600,
  },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(251,191,36,0.2)", borderTop: "4px solid #fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },

  filterRow: { display: "flex", gap: 8, maxWidth: 900, margin: "0 auto 20px", flexWrap: "wrap" },
  filterBtn: {
    padding: "8px 18px", background: "rgba(30,41,59,0.8)", color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, cursor: "pointer",
    fontSize: "0.85rem", fontWeight: 600,
  },
  filterBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" },

  emptyState: {
    maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "60px 40px",
    background: "rgba(30,41,59,0.5)", borderRadius: 16, border: "2px dashed #475569",
  },
  emptyIcon: { fontSize: "4rem", marginBottom: 20 },
  emptyTitle: { color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 700 },
  emptyText: { color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6 },

  notifList: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 },
  notifCard: {
    display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
    background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
  },
  notifUnread: {
    background: "rgba(30,41,59,0.9)", borderLeft: "3px solid #fbbf24",
  },
  notifIcon: {
    width: 42, height: 42, borderRadius: 10, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0,
  },
  notifContent: { flex: 1, minWidth: 0 },
  notifTitle: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 },
  notifMessage: { color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.4, marginBottom: 4 },
  notifTime: { color: "#64748b", fontSize: "0.75rem" },
  notifDeleteBtn: {
    background: "none", border: "none", color: "#64748b", cursor: "pointer",
    fontSize: "1.2rem", padding: "4px", lineHeight: 1, flexShrink: 0,
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
