import { useRef, useEffect } from "react";
import "./NotificationPanel.css";

export default function NotificationPanel({
  showNotifPanel,
  setShowNotifPanel,
  notifications,
  onApprove,
  onReject,
  onReview
}) {
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setShowNotifPanel]);

  const getNotifIcon = (type, isPayment) => {
    if (isPayment) {
      const icons = {
        property_booking: "🏠",
        material_purchase: "🛍️",
        tourism_booking: "🏨",
        boost: "🚀",
        subscription: "📋"
      };
      return icons[type] || "💳";
    }
    const icons = {
      property: "🏠",
      material: "🛍️",
      tourism: "🏨",
      mover: "🚛",
      seller: "📋",
      business: "🏪",
      announcement: "📢",
      item_request: "🔍"
    };
    return icons[type] || "📄";
  };

  const getNotifTitle = (n) => {
    if (n.isPayment) {
      if (n.type === "property_booking") return n.propertyId?.title || "Property Booking";
      if (n.type === "material_purchase") return n.materialId?.title || "Material Purchase";
      if (n.type === "tourism_booking") return n.tourismId?.title || "Tourism Booking";
      if (n.type === "boost") return "Listing Boost";
      if (n.type === "subscription") return "Subscription Payment";
      return "Payment";
    }
    const typeLabels = {
      property: "Property",
      material: "Material",
      tourism: "Tourism",
      mover: "Mover",
      seller: "Seller Verification",
      business: "Business",
      announcement: "Announcement",
      item_request: "Custom Request"
    };
    return n.title || typeLabels[n.type] || "Upload";
  };

  return (
    <div ref={notifRef} style={{ position: "relative" }}>
      <button
        className={`btn-notification ${notifications.length > 0 ? 'active' : ''}`}
        onClick={() => setShowNotifPanel(!showNotifPanel)}
        title={notifications.length > 0 ? `${notifications.length} notification(s) awaiting approval` : "No pending notifications"}
      >
        🔔
        {notifications.length > 0 && (
          <span className={`notification-badge ${notifications.length > 0 ? 'blink' : ''}`}>
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifPanel && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span className="notification-panel-title">🔔 All Notifications</span>
            <button className="btn-close-notification" onClick={() => setShowNotifPanel(false)}>✕</button>
          </div>

          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map(notif => (
                <div key={notif._id} className={`notification-item ${notif.isPayment ? 'notification-item-pulse' : ''}`}>
                  <div className="notification-item-header">
                    {!notif.isPayment && <span className="notification-red-dot blink" />}
                    <span className="notification-item-title">
                      {getNotifIcon(notif.type, notif.isPayment)} {getNotifTitle(notif)}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>
                      {notif.isPayment ? "💳 Payment" : "📝 Approval"}
                    </span>
                  </div>
                  <div className="notification-item-meta">
                    <span>👤 {notif.ownerName || notif.userName || notif.userId?.name || "User"}</span>
                    <span>📞 {notif.ownerPhone || notif.userPhone || notif.userId?.phone || "—"}</span>
                  </div>
                  {notif.isPayment && (
                    <div className="notification-item-meta">
                      <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                        KES {notif.amount?.toLocaleString() || "—"}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>
                        {notif.mpesaRef || notif.transactionId || "Pending verification"}
                      </span>
                    </div>
                  )}
                  {!notif.isPayment && (
                    <div className="notification-item-meta">
                      <span style={{ color: "#64748b", fontSize: 11 }}>
                        {notif.category || "—"}
                      </span>
                    </div>
                  )}
                  {notif.type === "tourism_booking" && notif.checkIn && (
                    <div style={{ ...styles.notifItemMeta, fontSize: 11 }}>
                      <span>📅 Check-in: {new Date(notif.checkIn).toLocaleDateString()}</span>
                      <span>Check-out: {new Date(notif.checkOut).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="notification-item-meta">
                    <span style={{ color: "#64748b", fontSize: 10 }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="notification-item-buttons">
                    {notif.isPayment ? (
                      <>
                        <button
                          className="btn-approve-notification"
                          onClick={() => { onApprove(notif._id); setShowNotifPanel(false); }}
                        >
                          ✅ Confirm
                        </button>
                        <button
                          className="btn-reject-notification"
                          onClick={() => onReject(notif._id)}
                        >
                          ✕ Dismiss
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-approve-notification"
                        onClick={() => {
                          onReview(notif);
                          setShowNotifPanel(false);
                        }}
                      >
                        👁️ Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notification-empty">
              <p>✅ No pending notifications</p>
            </div>
          )}

          <div className="notification-footer">
            <button
              className="btn-view-all-notifications"
              onClick={() => { onReview(null); setShowNotifPanel(false); }}
            >
              Review All Pending →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  notifItemMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
    fontSize: 12,
    color: "#94a3b8"
  }
};
