import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  House, ShoppingBag, Bed, Briefcase, Megaphone, BadgeCheck,
  ClipboardList, Zap, CreditCard, Package, TrendingUp, Flame, ChartColumn,
  ListChecks, RefreshCw, Clock, Check, X, ArrowRight, CircleCheckBig, Inbox
} from "lucide-react";
import API from "../api/api";
import { DonutChart, ColumnChart } from "../components/AdminCharts";
import "../pages/AdminDashboard.css";
import "./CommandCenter.css";

// Adapter: resolves approve/reject endpoints per notification type
const APPROVE_ADAPTER = {
  property: (id) => `/admin/properties/${id}/approve`,
  material: (id) => `/admin/materials/${id}/approve`,
  seller: (id) => `/admin/sellers/${id}/approve`,
  business: (id) => `/admin/businesses/${id}/approve`,
  accommodation: (id) => `/accommodations/${id}/status`,
  announcement: (id, item) => `/business/admin/${item.businessId}/announcements/${id}/status`,
};

const REJECT_ADAPTER = {
  property: (id) => `/admin/properties/${id}/reject`,
  material: (id) => `/admin/materials/${id}/reject`,
  seller: (id) => `/admin/sellers/${id}/reject`,
  business: (id) => `/admin/businesses/${id}/reject`,
  accommodation: (id) => `/accommodations/${id}/status`,
  announcement: (id, item) => `/business/admin/${item.businessId}/announcements/${id}/status`,
};

const TYPE_META = {
  property: { label: "Property", icon: House, queue: "/dashboard?tab=properties" },
  material: { label: "QuickSale", icon: ShoppingBag, queue: "/dashboard?tab=materials" },
  accommodation: { label: "Stay", icon: Bed, queue: "/dashboard?tab=accommodations" },
  business: { label: "Business", icon: Briefcase, queue: "/dashboard?tab=businesses" },
  announcement: { label: "Notice", icon: Megaphone, queue: "/dashboard?tab=announcements" },
  seller: { label: "Seller KYC", icon: BadgeCheck, queue: "/dashboard?tab=materials" },
  item_request: { label: "Request", icon: ClipboardList, queue: "/dashboard?tab=requests" },
  boost: { label: "Boost", icon: Zap, queue: "/dashboard?tab=boosts" },
  subscription: { label: "Subscription", icon: CreditCard, queue: "/dashboard?tab=boosts" },
  property_booking: { label: "Booking", icon: CreditCard, queue: "/dashboard?tab=boosts" },
  material_purchase: { label: "Purchase", icon: ShoppingBag, queue: "/dashboard?tab=boosts" },
  package_pending: { label: "Package", icon: Package, queue: "/dashboard?tab=payment" },
};

const timeAgo = (dateLike) => {
  if (!dateLike) return "";
  const diff = Date.now() - new Date(dateLike).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateLike).toLocaleDateString();
};

export default function CommandCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [feed, setFeed] = useState([]);
  const [viewStats, setViewStats] = useState(null);
  const [topViewed, setTopViewed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [feedFilter, setFeedFilter] = useState("all"); // all | payments | approvals
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null); // { kind: 'ok'|'err', text }

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [statsR, notifR, viewR, topR] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/notifications"),
        API.get("/admin/view-stats"),
        API.get("/admin/top-viewed", { params: { limit: 10 } }),
      ]);
      setStats(statsR.data);
      setFeed(notifR.data?.notifications || []);
      setSummary(notifR.data?.summary || null);
      // view-stats & top-viewed respond with { success, data }— unwrap defensively
      setViewStats(viewR.data?.data ?? viewR.data);
      setTopViewed(topR.data?.data ?? topR.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Command center load:", e);
      showToast("err", "Failed to load command center data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(true), 60000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // ── actions ────────────────────────────────────────────────
  const resolveItem = async (item, action) => {
    const id = item._id;
    setBusyId(id);
    try {
      if (item.isPayment) {
        await API.put(`/payment/notifications/${id}/read`, { approve: action === "approve" });
      } else if (item.type === "announcement") {
        await API.patch(APPROVE_ADAPTER.announcement(id, item), {
          status: action === "approve" ? "approved" : "rejected",
        });
      } else if (item.type === "accommodation") {
        await API.patch(REJECT_ADAPTER.accommodation(id), {
          status: action === "approve" ? "active" : "inactive",
        });
      } else {
        const url = (action === "approve" ? APPROVE_ADAPTER : REJECT_ADAPTER)[item.type]?.(id, item);
        if (!url) throw new Error("No handler for this item type");
        await API.patch(url);
      }
      showToast("ok", `${item.title || TYPE_META[item.type]?.label || "Item"} ${action === "approve" ? "approved" : "rejected"}`);
      await loadAll(true);
    } catch (e) {
      showToast("err", e.response?.data?.error || e.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  // ── derived data ───────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!stats) return [];
    return [
      { key: "properties", label: "Properties", total: stats.properties?.total || 0, pending: stats.properties?.pending || 0, color: "#3b82f6", icon: House, queue: "/dashboard?tab=properties" },
      { key: "materials", label: "QuickSales", total: stats.materials?.total || 0, pending: stats.materials?.pending || 0, color: "#22c55e", icon: ShoppingBag, queue: "/dashboard?tab=materials" },
      { key: "accommodations", label: "Accommodations", total: stats.accommodations?.total || 0, pending: stats.accommodations?.pending || 0, color: "#14b8a6", icon: Bed, queue: "/dashboard?tab=accommodations" },
      { key: "businesses", label: "Businesses", total: stats.businesses?.total || 0, pending: stats.businesses?.pending || 0, color: "#fbbf24", icon: Briefcase, queue: "/dashboard?tab=businesses" },
      { key: "sellers", label: "Seller Verifications", total: stats.sellers?.total || 0, pending: stats.sellers?.pending || 0, color: "#fb923c", icon: BadgeCheck, queue: "/dashboard?tab=materials" },
    ];
  }, [stats]);

  const totalPending = useMemo(
    () => kpis.reduce((acc, k) => acc + k.pending, 0),
    [kpis]
  );

  const filteredFeed = useMemo(() => {
    if (feedFilter === "payments") return feed.filter((n) => n.isPayment);
    if (feedFilter === "approvals") return feed.filter((n) => !n.isPayment);
    return feed;
  }, [feed, feedFilter]);

  const topViewedList = useMemo(() => {
    if (!topViewed) return [];
    const props = (topViewed.properties || []).map((p) => ({ ...p, _kind: "Property" }));
    const mats = (topViewed.materials || []).map((m) => ({ ...m, _kind: "QuickSale" }));
    return [...props, ...mats].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  }, [topViewed]);

  // Chart series: listing totals for the donut, category traffic for the columns
  const donutData = useMemo(
    () => kpis.filter((k) => k.total > 0).map((k) => ({ label: k.label, value: k.total, color: k.color })),
    [kpis]
  );
  const totalListings = useMemo(() => donutData.reduce((acc, d) => acc + d.value, 0), [donutData]);

  const trafficSeries = useMemo(() => {
    if (!viewStats) return [];
    const rows = [
      ...(viewStats.properties || []).map((s) => ({ label: s._id, value: s.totalViews || 0, color: "#3b82f6" })),
      ...(viewStats.materials || []).map((s) => ({ label: s._id, value: s.totalViews || 0, color: "#22c55e" })),
    ];
    return rows.sort((a, b) => b.value - a.value).slice(0, 9);
  }, [viewStats]);

  if (loading) {
    return (
      <div className="cc-loading">
        <div className="spinner" />
        <p>Booting Command Center…</p>
      </div>
    );
  }

  return (
    <div className="cc-page">
      {/* ── Hero strip ─────────────────────────────────────── */}
      <section className="cc-hero">
        <div className="cc-hero-left">
          <h2 className="cc-hero-title">Platform Command Center</h2>
          <p className="cc-hero-sub">
            Live health of listings, payments, verification and trust — all in one place.
          </p>
          <div className="cc-hero-meta">
            <span className="cc-chip cc-chip-gold">
              <Clock size={13} /> Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
            </span>
            <button type="button" className="cc-chip cc-chip-action" onClick={() => loadAll(true)} disabled={refreshing}>
              <RefreshCw size={13} /> {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
        <div className="cc-hero-right">
          <div className="cc-big-number">
            <span className="cc-big-value">{totalPending}</span>
            <span className="cc-big-label">items awaiting action</span>
          </div>
        </div>
      </section>

      {/* ── KPI cards ──────────────────────────────────────── */}
      <section className="cc-kpi-grid">
        {kpis.map((k) => (
          <button key={k.key} type="button" className="cc-kpi-card" onClick={() => navigate(k.queue)}>
            <div className="cc-kpi-top">
              <span className="cc-kpi-icon" style={{ background: `${k.color}1f`, color: k.color }}><k.icon size={18} /></span>
              {k.pending > 0 && <span className="cc-kpi-pending" style={{ color: k.color, background: `${k.color}1f` }}>{k.pending} pending</span>}
            </div>
            <div className="cc-kpi-total">{k.total.toLocaleString()}</div>
            <div className="cc-kpi-label">{k.label}</div>
            <div className="cc-kpi-bar">
              <span
                className="cc-kpi-bar-fill"
                style={{
                  width: k.total > 0 ? `${Math.min(100, ((k.total - k.pending) / k.total) * 100)}%` : "0%",
                  background: k.color,
                }}
              />
            </div>
            <div className="cc-kpi-foot">
              {(k.total - k.pending).toLocaleString()} live · {k.pending} in queue <ArrowRight size={12} style={{ verticalAlign: "middle" }} />
            </div>
          </button>
        ))}
      </section>

      {/* ── Distribution + Top viewed ──────────────────────── */}
      <section className="cc-two-col">
        <div className="cc-panel">
          <h3 className="cc-panel-title"><TrendingUp size={16} className="cc-title-ic" /> Listing Distribution</h3>
          <div className="cc-donut-wrap">
            <DonutChart data={donutData} centerValue={totalListings.toLocaleString()} centerLabel="total listings" />
          </div>
          <div className="cc-dist-list">
            {kpis.map((k) => {
              const max = Math.max(...kpis.map((x) => x.total), 1);
              return (
                <div key={k.key} className="cc-dist-row">
                  <span className="cc-dist-label"><k.icon size={13} className="cc-inline-ic" /> {k.label}</span>
                  <div className="cc-dist-track">
                    <span className="cc-dist-fill" style={{ width: `${(k.total / max) * 100}%`, background: k.color }} />
                  </div>
                  <span className="cc-dist-value">{k.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cc-panel">
          <h3 className="cc-panel-title"><Flame size={16} className="cc-title-ic" /> Most Viewed Listings</h3>
          {topViewedList.length === 0 ? (
            <p className="cc-empty-inline">No view data recorded yet.</p>
          ) : (
            <ol className="cc-top-list">
              {topViewedList.map((item, i) => (
                <li key={item._id} className="cc-top-item">
                  <span className="cc-top-rank">#{i + 1}</span>
                  <div className="cc-top-info">
                    <span className="cc-top-title">{item.title}</span>
                    <span className="cc-top-meta">{item._kind} · {item.location || item.category || item.county || "—"}</span>
                  </div>
                  <span className="cc-top-views">{(item.views || 0).toLocaleString()} views</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── Traffic by category ────────────────────────────── */}
      {viewStats && (viewStats.properties?.length || viewStats.materials?.length) && (
        <section className="cc-panel cc-traffic-panel">
          <h3 className="cc-panel-title"><ChartColumn size={16} className="cc-title-ic" /> Traffic by Category</h3>
          {trafficSeries.length > 0 && (
            <div className="cc-chart-block">
              <ColumnChart data={trafficSeries} />
            </div>
          )}
          <div className="cc-traffic-grid">
            {(viewStats.properties || []).slice(0, 8).map((s) => (
              <div key={`p-${s._id}`} className="cc-traffic-card">
                <div className="cc-traffic-name"><House size={13} className="cc-inline-ic" /> {s._id}</div>
                <div className="cc-traffic-views">{s.totalViews.toLocaleString()}</div>
                <div className="cc-traffic-sub">{s.totalItems} listings · avg {Math.round(s.avgViews)} views</div>
              </div>
            ))}
            {(viewStats.materials || []).slice(0, 8).map((s) => (
              <div key={`m-${s._id}`} className="cc-traffic-card">
                <div className="cc-traffic-name"><ShoppingBag size={13} className="cc-inline-ic" /> {s._id}</div>
                <div className="cc-traffic-views">{s.totalViews.toLocaleString()}</div>
                <div className="cc-traffic-sub">{s.totalItems} listings · avg {Math.round(s.avgViews)} views</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Action feed ────────────────────────────────────── */}
      <section className="cc-panel cc-feed-panel">
        <div className="cc-feed-head">
          <h3 className="cc-panel-title"><ListChecks size={16} className="cc-title-ic" /> Unified Action Queue</h3>
          <div className="cc-feed-filters">
            {[
              ["all", `All (${feed.length})`],
              ["payments", `Payments (${summary?.payments ?? 0})`],
              ["approvals", `Approvals (${feed.length - (summary?.payments ?? 0)})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`cc-filter-btn ${feedFilter === key ? "active" : ""}`}
                onClick={() => setFeedFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredFeed.length === 0 ? (
          <div className="cc-empty">
            <CircleCheckBig size={34} className="cc-empty-icon" />
            <p>Inbox zero — nothing is waiting for your action.</p>
          </div>
        ) : (
          <div className="cc-feed-list">
            {filteredFeed.slice(0, 40).map((item) => {
              const meta = TYPE_META[item.type] || { label: item.type || "Item", icon: Inbox, queue: "/" };
              const actionable = !["item_request"].includes(item.type);
              return (
                <div key={`${item.type}-${item._id}`} className={`cc-feed-item ${item.isPayment ? "is-payment" : ""}`}>
                  <span className="cc-feed-type" title={meta.label}><meta.icon size={16} /></span>
                  <div className="cc-feed-body">
                    <div className="cc-feed-title-row">
                      <span className="cc-feed-title">{item.title || meta.label}</span>
                      {item.isPayment && item.amount != null && (
                        <span className="cc-feed-amount">KES {item.amount.toLocaleString()}</span>
                      )}
                      <span className="cc-feed-time">{timeAgo(item.createdAt)}</span>
                    </div>
                    <div className="cc-feed-meta">
                      <span>{item.ownerName || item.userName || "—"}</span>
                      <span>·</span>
                      <span>{item.category || meta.label}</span>
                      {item.mpesaRef && <><span>·</span><span>{item.mpesaRef}</span></>}
                    </div>
                  </div>
                  <div className="cc-feed-actions">
                    {actionable ? (
                      <>
                        <button
                          type="button"
                          className="cc-btn cc-btn-approve"
                          disabled={busyId === item._id}
                          onClick={() => resolveItem(item, "approve")}
                        >
                          {busyId === item._id ? <RefreshCw size={13} className="cc-spin" /> : <Check size={13} />}
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          className="cc-btn cc-btn-reject"
                          disabled={busyId === item._id}
                          onClick={() => resolveItem(item, "reject")}
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <button type="button" className="cc-btn cc-btn-open" onClick={() => navigate(meta.queue)}>
                        <span>Open queue</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {toast && <div className={`cc-toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  );
}
