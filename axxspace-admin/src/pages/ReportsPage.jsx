import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, ShieldCheck, CircleCheckBig, UserRound, Phone, House, CalendarDays } from "lucide-react";
import API from "../api/api";
import "./AdminPages.css";

const STATUS_TABS = [
  ["all", "All"],
  ["open", "Open"],
  ["reviewed", "Reviewed"],
  ["actioned", "Actioned"],
];

const STATUS_PILL = { open: "bad", reviewed: "warn", actioned: "ok" };

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState(null); // { report, status }
  const [actionNote, setActionNote] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await API.get("/reports");
      setReports(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("Reports load:", e);
      setError(e.response?.data?.error || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const counts = useMemo(() => {
    const base = { all: reports.length, open: 0, reviewed: 0, actioned: 0 };
    reports.forEach((r) => { base[r.status] = (base[r.status] || 0) + 1; });
    return base;
  }, [reports]);

  const filtered = useMemo(() => {
    let list = tab === "all" ? reports : reports.filter((r) => r.status === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.agent?.name, r.agent?.email, r.rental?.title, r.reason, r.reporterContact]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [reports, tab, search]);

  const openActionModal = (report, status) => {
    setActionModal({ report, status });
    setActionNote("");
  };

  const submitAction = async () => {
    if (!actionModal) return;
    const { report, status } = actionModal;
    setBusyId(report._id);
    try {
      await API.put(`/reports/${report._id}/status`, {
        status,
        ...(actionNote.trim() ? { actionTaken: actionNote.trim() } : {}),
      });
      setReports((prev) =>
        prev.map((r) =>
          r._id === report._id
            ? { ...r, status, actionTaken: actionNote.trim() || r.actionTaken }
            : r
        )
      );
      showToast("ok", `Report marked as ${status}`);
      setActionModal(null);
    } catch (e) {
      showToast("err", e.response?.data?.error || "Failed to update report");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="ap-page">
      <div className="ap-chips">
        {STATUS_TABS.slice(1).map(([key, label]) => (
          <div key={key} className={`ap-chip-card ${key === "open" ? "warn" : key === "actioned" ? "ok" : ""}`}>
            <span className="ap-chip-value">{counts[key] || 0}</span>
            <span className="ap-chip-label">{label} reports</span>
          </div>
        ))}
      </div>

      <div className="ap-panel">
        <div className="ap-toolbar">
          <div className="ap-filter-tabs">
            {STATUS_TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`ap-filter-btn ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
              >
                {label} ({counts[key] || 0})
              </button>
            ))}
          </div>
          <div className="ap-search-wrap">
            <Search size={14} className="ap-search-icon" />
            <input
              className="ap-search"
              placeholder="Search agent, reason, rental…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={loadReports}><RefreshCw size={13} /> Refresh</button>
        </div>

        <p className="ap-hint" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={15} style={{ color: "var(--gold)", flexShrink: 0 }} /> Agents with 3+ open reports are automatically flagged and their verification
          is revoked by the system.
        </p>

        {error && <div className="ap-error">{error}</div>}

        {loading ? (
          <div className="ap-loading"><div className="spinner" /><p>Loading reports…</p></div>
        ) : filtered.length === 0 ? (
          <div className="ap-empty"><CircleCheckBig size={22} className="ap-empty-ic" /><div>No reports in this view.</div></div>
        ) : (
          <div className="ap-card-list">
            {filtered.map((r) => (
              <div key={r._id} className={`ap-report-card status-${r.status}`}>
                <div className="ap-report-main">
                  <div className="ap-report-title">
                    {r.reason || "Report"} · {r.agent?.name || "Unknown agent"}
                  </div>
                  <div className="ap-report-meta">
                    <span><UserRound size={12} className="ap-meta-ic" /> {r.agent?.email || "—"}</span>
                    <span><Phone size={12} className="ap-meta-ic" /> {r.reporterContact || "—"}</span>
                    {r.rental?.title && <span><House size={12} className="ap-meta-ic" /> {r.rental.title}</span>}
                    <span><CalendarDays size={12} className="ap-meta-ic" /> {new Date(r.createdAt).toLocaleString()}</span>
                    <span className={`ap-pill ap-pill-${STATUS_PILL[r.status] || "muted"}`}>{r.status}</span>
                  </div>
                  {r.details && <div className="ap-report-details">{r.details}</div>}
                  {r.actionTaken && (
                    <div className="ap-report-details" style={{ borderTop: "2px solid rgba(16,185,129,0.35)" }}>
                      <CircleCheckBig size={13} style={{ color: "var(--emerald)", verticalAlign: "-2px" }} /> Action taken: {r.actionTaken}
                    </div>
                  )}
                </div>
                <div className="ap-report-actions">
                  {r.status === "open" && (
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      disabled={busyId === r._id}
                      onClick={() => openActionModal(r, "reviewed")}
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {r.status !== "actioned" && (
                    <button
                      type="button"
                      className="ap-btn ap-btn-ok"
                      disabled={busyId === r._id}
                      onClick={() => openActionModal(r, "actioned")}
                    >
                      Take Action
                    </button>
                  )}
                  {r.status === "actioned" && (
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      disabled={busyId === r._id}
                      onClick={() => openActionModal(r, "open")}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionModal && (
        <div className="ap-modal-backdrop" onClick={() => !busyId && setActionModal(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Mark report as “{actionModal.status}”</h3>
            <p>
              {actionModal.report.agent?.name || "Agent"} — {actionModal.report.reason || "Report"}
            </p>
            <div className="ap-modal-field">
              <label htmlFor="actionNote">Action taken / review note (optional)</label>
              <textarea
                id="actionNote"
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g. Contacted agent, issued warning, evidence reviewed…"
              />
            </div>
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setActionModal(null)} disabled={busyId}>
                Cancel
              </button>
              <button type="button" className="ap-btn ap-btn-primary" onClick={submitAction} disabled={busyId}>
                {busyId ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ap-toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  );
}
