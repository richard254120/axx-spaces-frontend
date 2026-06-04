import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [roleFilter, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (search) params.search = search;

      const res = await API.get("/admin/public/users", { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "landlord": return { bg: "rgba(34, 197, 94, 0.2)", color: "#22c55e" };
      case "mover": return { bg: "rgba(14, 165, 233, 0.2)", color: "#0ea5e9" };
      case "seller": return { bg: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" };
      default: return { bg: "rgba(148, 163, 184, 0.2)", color: "#94a3b8" };
    }
  };

  const handleWhatsApp = (phone) => {
    if (!phone) {
      alert("This user has not provided a phone number.");
      return;
    }
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleViewProperties = (userId, role) => {
    switch (role) {
      case "seller":
        navigate(`/seller-dashboard?userId=${userId}`);
        break;
      case "landlord":
        navigate(`/listings?owner=${userId}`);
        break;
      case "mover":
        navigate(`/movers?userId=${userId}`);
        break;
      case "user":
        navigate(`/profile?userId=${userId}`);
        break;
      default:
        navigate(`/profile?userId=${userId}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Our Community</h1>
        <p style={styles.subtitle}>Meet the amazing people who make Axxspace thrive</p>
      </div>

      {/* Search and Filter */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search users by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="landlord">Landlords</option>
          <option value="mover">Movers</option>
          <option value="seller">Sellers</option>
        </select>
      </div>

      {loading ? (
        <div style={styles.loader}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No users found matching your criteria.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {users.map((user) => {
            const badgeStyle = getRoleBadgeColor(user.role);
            return (
              <div key={user._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div style={styles.userInfo}>
                    <h3 style={styles.userName}>{user.name || "Anonymous"}</h3>
                    <span
                      style={{
                        ...styles.roleBadge,
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                      }}
                    >
                      {user.role?.toUpperCase() || "USER"}
                    </span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Location</span>
                    <span style={styles.infoValue}>{user.county || "Kenya"}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Joined</span>
                    <span style={styles.infoValue}>
                      {new Date(user.createdAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => handleWhatsApp(user.phone)}
                    style={styles.whatsappBtn}
                    title="Contact on WhatsApp"
                  >
                    <span style={styles.arrowIcon}>→</span>
                  </button>
                  <button
                    onClick={() => handleViewProperties(user._id, user.role)}
                    style={styles.propertiesBtn}
                    title="View Details"
                  >
                    <span style={styles.arrowIcon}>→</span>
                  </button>
                </div>
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
    background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)",
    padding: "40px 20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "12px",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  controls: {
    display: "flex",
    gap: "16px",
    maxWidth: "800px",
    margin: "0 auto 40px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "250px",
    padding: "14px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(30, 41, 59, 0.6)",
    color: "#f1f5f9",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s",
  },
  filterSelect: {
    padding: "14px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(30, 41, 59, 0.6)",
    color: "#f1f5f9",
    fontSize: "15px",
    outline: "none",
    cursor: "pointer",
    minWidth: "150px",
  },
  loader: {
    textAlign: "center",
    fontSize: "20px",
    color: "#fbbf24",
    marginTop: "60px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "18px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    transition: "all 0.3s",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(251, 191, 36, 0.3)",
  },
  avatarPlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f1729",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "6px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardBody: {
    marginBottom: "20px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  infoLabel: {
    fontSize: "16px",
  },
  infoValue: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  whatsappBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #25d366, #128c7e)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  propertiesBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#0f1729",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    fontSize: "20px",
    fontWeight: 800,
  },
};
