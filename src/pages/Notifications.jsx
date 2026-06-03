import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #fbbf24",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  button: {
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  notificationItem: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    transition: "all 0.2s",
  },
  notificationItemUnread: {
    background: "rgba(251, 191, 36, 0.08)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  notificationIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "6px",
  },
  notificationMessage: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  notificationTime: {
    fontSize: "12px",
    color: "#64748b",
  },
  notificationActions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  actionButton: {
    padding: "6px 14px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 700",
    color: "#f1f5f9",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "24px",
  },
  iconInfo: {
    background: "rgba(59, 130, 246, 0.15)",
  },
  iconSuccess: {
    background: "rgba(34, 197, 94, 0.15)",
  },
  iconWarning: {
    background: "rgba(251, 191, 36, 0.15)",
  },
  iconError: {
    background: "rgba(239, 68, 68, 0.15)",
  },
};

export default function Notifications() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadNotifications();
  }, [token, navigate]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock notifications for now - replace with actual API call when backend is ready
      const mockNotifications = [
        {
          id: 1,
          title: "Welcome to AxxSpace!",
          message: "Thank you for joining AxxSpace. Start exploring properties and services today.",
          type: "success",
          icon: "🎉",
          time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
        },
        {
          id: 2,
          title: "Profile Complete",
          message: "Your profile has been set up successfully. You can now book properties and connect with service providers.",
          type: "info",
          icon: "✅",
          time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
        },
        {
          id: 3,
          title: "New Listings Available",
          message: "Check out the latest properties added in your area. New rentals are waiting for you!",
          type: "info",
          icon: "🏠",
          time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "success":
        return styles.iconSuccess;
      case "warning":
        return styles.iconWarning;
      case "error":
        return styles.iconError;
      default:
        return styles.iconInfo;
    }
  };

  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button style={styles.button} onClick={markAllAsRead}>
              Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🔔</div>
            <div style={styles.emptyTitle}>No Notifications</div>
            <p style={styles.emptyText}>
              You're all caught up! We'll notify you when there's something new.
            </p>
            <button style={styles.button} onClick={() => navigate("/listings")}>
              Explore Listings
            </button>
          </div>
        ) : (
          <div style={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationItem,
                  ...(notification.read ? {} : styles.notificationItemUnread),
                }}
              >
                <div style={{ ...styles.notificationIcon, ...getIconStyle(notification.type) }}>
                  {notification.icon}
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationTitle}>{notification.title}</div>
                  <div style={styles.notificationMessage}>{notification.message}</div>
                  <div style={styles.notificationTime}>{formatTime(notification.time)}</div>
                  {!notification.read && (
                    <div style={styles.notificationActions}>
                      <button
                        style={styles.actionButton}
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
