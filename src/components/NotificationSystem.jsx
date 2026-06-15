import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const defaultNotifications = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAll: () => {},
};

const NotificationContext = createContext(defaultNotifications);

export const NotificationProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    // Prefer server notifications when logged in
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/notifications?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load notifications");
        setNotifications(
          (data.notifications || []).map((n) => ({
            ...n,
            id: n._id || n.id,
            timestamp: n.createdAt || n.timestamp,
          }))
        );
        setUnreadCount(data.unreadCount || 0);
        return;
      } catch (err) {
        // fallback to local if API fails
        console.error("Notifications API error:", err);
      }
    }

    const saved = localStorage.getItem("axxspace_notifications");
    if (saved) {
      const loaded = JSON.parse(saved);
      setNotifications(loaded);
      setUnreadCount(loaded.filter((n) => !n.read).length);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification,
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const markAsRead = async (notificationId) => {
    // server path
    if (token && typeof notificationId === "string" && notificationId.length > 8) {
      try {
        await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      loadNotifications();
      return;
    }

    // local path
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const markAllAsRead = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/notifications/read-all`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      loadNotifications();
      return;
    }
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const deleteNotification = async (notificationId) => {
    if (token && typeof notificationId === "string" && notificationId.length > 8) {
      try {
        await fetch(`${API_BASE}/notifications/${notificationId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      loadNotifications();
      return;
    }
    const updated = notifications.filter((n) => n.id !== notificationId);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
    localStorage.setItem("axxspace_notifications", JSON.stringify(updated));
  };

  const clearAll = async () => {
    if (token) {
      // no "clear all" endpoint; mark all read and delete one-by-one is expensive.
      await markAllAsRead();
      return;
    }
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("axxspace_notifications");
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext) ?? defaultNotifications;

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message": return "💬";
      case "booking": return "📅";
      case "payment": return "💳";
      case "review": return "⭐";
      case "property": return "🏠";
      default: return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "message": return "#3b82f6";
      case "booking": return "#22c55e";
      case "payment": return "#fbbf24";
      case "review": return "#8b5cf6";
      case "property": return "#ef4444";
      default: return "#64748b";
    }
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Bell Button */}
      <button
        style={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <h3 style={styles.dropdownTitle}>Notifications</h3>
            <div style={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  style={styles.markAllBtn}
                  onClick={() => markAllAsRead()}
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  style={styles.clearBtn}
                  onClick={() => clearAll()}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔔</span>
              <p style={styles.emptyText}>No notifications yet</p>
            </div>
          ) : (
            <div style={styles.notificationList}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    ...(notification.read ? styles.notificationRead : styles.notificationUnread),
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div
                    style={{
                      ...styles.notificationIcon,
                      background: getNotificationColor(notification.type),
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={styles.notificationContent}>
                    <p style={styles.notificationTitle}>{notification.title}</p>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                    <span style={styles.notificationTime}>
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
  },
  bellBtn: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  bellIcon: {
    fontSize: "1.3rem",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "0.75rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #0f1729",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    width: "380px",
    maxHeight: "500px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #334155",
    background: "rgba(0, 0, 0, 0.2)",
  },
  dropdownTitle: {
    color: "#f1f5f9",
    fontSize: "1rem",
    margin: 0,
    fontWeight: 600,
  },
  headerActions: {
    display: "flex",
    gap: "8px",
  },
  markAllBtn: {
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "12px",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    margin: 0,
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto",
    padding: "8px",
  },
  notificationItem: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  },
  notificationUnread: {
    background: "rgba(59, 130, 246, 0.1)",
    borderLeft: "3px solid #3b82f6",
  },
  notificationRead: {
    background: "transparent",
    opacity: 0.7,
  },
  notificationIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontWeight: 600,
    margin: "0 0 4px",
  },
  notificationMessage: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    margin: "0 0 4px",
    lineHeight: 1.4,
  },
  notificationTime: {
    color: "#64748b",
    fontSize: "0.75rem",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "4px",
    opacity: 0,
    transition: "opacity 0.2s",
  },
};

const css = `
  .notification-item:hover .delete-btn {
    opacity: 1;
  }
  .notification-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  .notification-list::-webkit-scrollbar {
    width: 6px;
  }
  .notification-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  .notification-list::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
`;
