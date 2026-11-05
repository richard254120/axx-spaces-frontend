import { useRef, useEffect } from "react";
import { Bell, X, ArrowRight, Check, Eye, House, ShoppingBag, Briefcase, Megaphone, ClipboardList, Zap, CreditCard, Package, ShieldCheck } from "lucide-react";
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
        property_booking: House,
        material_purchase: ShoppingBag,
        boost: Zap,
        subscription: ShieldCheck,
        package_pending: Package
      };
      return icons[type] || CreditCard;
    }
    const icons = {
      property: House,
      material: ShoppingBag,
      business: Briefcase,
      announcement: Megaphone,
      item_request: ClipboardList
    };
    return icons[type] || Bell;
  };

  const getNotifTitle = (n) => {
    if (n.isPayment) {
      if (n.type === "property_booking") return n.propertyId?.title || "Property Booking";
      if (n.type === "material_purchase") return n.materialId?.title || "Material Purchase";
      if (n.type === "boost") return "Listing Boost";
      if (n.type === "subscription") return "Subscription Payment";
      if (n.type === "package_pending") return `${n.agentPackageTier || "Package"} Upgrade Payment`;
      return "Payment";
    }
    const typeLabels = {
      property: "Property",
      material: "Material",
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
        <span className="bell-icon"><Bell size={17} /></span>
        {notifications.length > 0 && (
          <span className={`notification-badge ${notifications.length > 0 ? 'blink' : ''}`}>
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifPanel && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span className="notification-panel-title">
               All Notifications
            </span>
            <button className="btn-close-notification" onClick={() => setShowNotifPanel(false)}><X size={14} /></button>
          </div>

          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map(notif => {
                const NIcon = getNotifIcon(notif.type, notif.isPayment);
                return (
                <div key={notif._id} className={`notification-item ${notif.isPayment ? 'notification-item-pulse' : ''}`}>
                  <div className="notification-item-header">
                    {!notif.isPayment && <span className="notification-red-dot blink" />}
                    <span className="notification-item-title">
                      <NIcon size={13} style={{ flexShrink: 0 }} /> {getNotifTitle(notif)}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#cdd8e8", marginLeft: "auto" }}>
                      {notif.isPayment ? " Payment" : " Approval"}
                    </span>
                  </div>
                  <div className="notification-item-meta">
                    <span> {notif.ownerName || notif.userName || notif.userId?.name || "User"}</span>
                    <span> {notif.ownerPhone || notif.userPhone || notif.userId?.phone || "—"}</span>
                  </div>
                  {notif.isPayment && (
                    <div className="notification-item-meta">
                      <span style={{ color: "#fb7185", fontWeight: 700 }}>
                        KES {notif.amount?.toLocaleString() || "—"}
                      </span>
                      <span style={{ color: "#cdd8e8", fontSize: 12.5 }}>
                        {notif.mpesaRef || notif.transactionId || "Pending verification"}
                      </span>
                    </div>
                  )}
                  {!notif.isPayment && (
                    <div className="notification-item-meta">
                      <span style={{ color: "#b4c1d4", fontSize: 12.5 }}>
                        {notif.category || "—"}
                      </span>
                    </div>
                  )}
                  <div className="notification-item-meta">
                    <span style={{ color: "#b4c1d4", fontSize: 11.5 }}>
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
                           <Check size={12} /> Confirm
                        </button>
                        <button
                          className="btn-reject-notification"
                          onClick={() => onReject(notif._id)}
                        >
                          <X size={12} /> Dismiss
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
                         <Eye size={12} /> Review
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty">
              <p> No pending notifications</p>
            </div>
          )}

          <div className="notification-footer">
            <button
              className="btn-view-all-notifications"
              onClick={() => { onReview(null); setShowNotifPanel(false); }}
            >
              Review All Pending <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
