export default function TabNavigation({ tabs, activeTab, setActiveTab, pendingCounts, hasPendingBoosts, pendingBoosts }) {
  const TAB_LABELS = {
    overview: "📊 Overview",
    properties: "🏠 Properties",
    materials: "🛍️ Materials",
    tourism: "🏨 Tourism",
    movers: "🚛 Movers",
    sellers: "📋 Sellers",
    sold: "💰 Sold",
    payment: "💳 Payment",
    boosts: "🚀 Payments",
    businesses: "🏪 Businesses",
    announcements: "📢 Announcements",
    verification: "✓ KYC Verification"
  };

  const getPendingCount = (tab) => {
    if (tab === "businesses") {
      return pendingCounts?.businesses?.pending > 0 ? ` (${pendingCounts.businesses.pending})` : "";
    }
    if (tab === "announcements") {
      return pendingCounts?.announcements > 0 ? ` (${pendingCounts.announcements})` : "";
    }
    if (tab === "verification") {
      return pendingCounts?.verification > 0 ? ` (${pendingCounts.verification})` : "";
    }
    if (!pendingCounts?.allPending) return "";
    const map = { properties: "properties", materials: "materials", tourism: "tourism", movers: "movers", sellers: "sellers" };
    const key = map[tab];
    return key && pendingCounts.allPending[key]?.length ? ` (${pendingCounts.allPending[key].length})` : "";
  };

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''} ${tab === "boosts" && hasPendingBoosts ? 'alert' : ''}`}
          onClick={() => {
            setActiveTab(tab);
            if (tab !== "sold" && tab !== "payment" && tab !== "boosts") {
              // setStatusView("pending"); - this will be handled by parent
            }
          }}
        >
          {TAB_LABELS[tab]}{getPendingCount(tab)}
          {tab === "boosts" && hasPendingBoosts && (
            <span className={`tab-badge ${pendingBoosts.length > 0 ? 'blink' : ''}`}>
              {pendingBoosts.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
