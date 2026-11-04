import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/api";
import "./AdminPages.css";

const ROLES = [
  "member", "provider", "pending_provider", "user", "mover", "admin",
  "landlord", "seller", "team", "caretaker", "host", "agent",
  "agency_admin", "guest", "business",
];

const STATUS_COLORS = {
  approved: "ok",
  active: "ok",
  verified: "ok",
  pending: "warn",
  pending_provider: "warn",
  rejected: "bad",
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const r = await API.get("/admin/users", { params });
      setUsers(r.data?.users || []);
    } catch (e) {
      console.error("Users load:", e);
      setError(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Keep ?role= in the URL in sync so sidebar/command-center deep links work
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (roleFilter === "all") next.delete("role");
    else next.set("role", roleFilter);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.county]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, search]);

  const chips = useMemo(() => {
    const now = Date.now();
    return [
      { label: "Total users", value: users.length, tone: "" },
      { label: "Pending movers", value: users.filter((u) => u.role === "mover" && u.status === "pending").length, tone: "warn" },
      { label: "Agents", value: users.filter((u) => u.role === "agent").length, tone: "" },
      { label: "Admins", value: users.filter((u) => u.role === "admin").length, tone: "" },
      { label: "Joined this week", value: users.filter((u) => now - new Date(u.createdAt).getTime() <= WEEK_MS).length, tone: "ok" },
    ];
  }, [users]);

  const exportCsv = () => {
    if (!filtered.length) return;
    const rows = filtered.map((u) => ({
      name: u.name || "", email: u.email || "", phone: u.phone || "",
      role: u.role || "", status: u.status || "", approved: u.isApproved ? "yes" : "no",
      county: u.county || "", joined: u.createdAt || "",
    }));
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(",")),
    ].join("\n");
    const url = window.URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/users/${deleteTarget._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast("ok", `User "${deleteTarget.name || deleteTarget.email}" deleted`);
      setDeleteTarget(null);
    } catch (e) {
      showToast("err", e.response?.data?.error || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ap-page">
      <div className="ap-chips">
        {chips.map((c) => (
          <div key={c.label} className={`ap-chip-card ${c.tone}`}>
            <span className="ap-chip-value">{c.value}</span>
            <span className="ap-chip-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="ap-panel">
        <div className="ap-toolbar">
          <div className="ap-search-wrap">
            <span className="ap-search-icon">🔎</span>
            <input
              className="ap-search"
              placeholder="Search name, email, phone, county…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button type="button" className="ap-clear" onClick={() => setSearch("")}>✕</button>}
          </div>

          <select className="ap-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="ap-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>

          <button type="button" className="ap-btn ap-btn-ghost" onClick={exportCsv}>⬇ Export CSV</button>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={loadUsers}>⟳ Refresh</button>
        </div>

        <div className="ap-count">
          Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users
        </div>

        {error && <div className="ap-error">{error}</div>}

        {loading ? (
          <div className="ap-loading"><div className="spinner" /><p>Loading users…</p></div>
        ) : filtered.length === 0 ? (
          <div className="ap-empty">🗒 No users match the current filters.</div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th>County</th>
                  <th>Joined</th>
                  <th className="ap-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="ap-user-cell">
                        <span className="ap-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</span>
                        <div className="ap-user-text">
                          <span className="ap-user-name">{u.name || "—"}</span>
                          {u.email && <span className="ap-user-email">{u.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || "—"}</td>
                    <td><span className="ap-pill ap-pill-role">{u.role}</span></td>
                    <td>
                      <span className={`ap-pill ap-pill-${STATUS_COLORS[u.status] || "muted"}`}>
                        {u.status || "—"}
                      </span>
                    </td>
                    <td>{u.isApproved ? "✅" : "—"}</td>
                    <td>{u.county || "—"}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="ap-th-actions">
                      <button
                        type="button"
                        className="ap-btn ap-btn-danger"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.role === "admin"}
                        title={u.role === "admin" ? "Cannot delete admin accounts" : "Delete this user"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="ap-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete user account?</h3>
            <p>
              <strong>{deleteTarget.name || deleteTarget.email}</strong> ({deleteTarget.role})
              will be permanently removed along with their properties, QuickSales and tourism
              listings. This cannot be undone.
            </p>
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="ap-btn ap-btn-danger" onClick={executeDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ap-toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  );
}
