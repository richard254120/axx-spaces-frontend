import { useState, useEffect } from "react";
import API from "../api/api";

const SOURCE_LABELS = {
  generic: "General / Digital Link",
  gate: "Gate Poster",
  building_outside: "Building Exterior",
  noticeboard: "Noticeboard",
  shop_nearby: "Local Shop/Kiosk",
  office: "Landlord Office",
  vacancy_sign: "Vacancy Signboard"
};

const INQUIRY_LABELS = {
  whatsapp: "WhatsApp Chat",
  call: "Phone Call",
  booking: "Online Booking"
};

export default function QRStatsModal({ isOpen, onClose, property }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && property) {
      fetchStats();
    }
  }, [isOpen, property]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/properties/${property._id}/qr-stats`);
      if (res.data && res.data.success) {
        setStats(res.data.data);
      } else {
        throw new Error("Failed to fetch stats");
      }
    } catch (err) {
      console.error("Error fetching QR stats:", err);
      setError("Failed to load statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📊 QR scan & Inquiry Analytics</h2>
            <p style={styles.subtitle}>{property.title}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading analytics...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
              <button style={styles.retryBtn} onClick={fetchStats}>Retry</button>
            </div>
          ) : stats ? (
            <div style={styles.statsLayout}>
              {/* Metrics Grid */}
              <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                  <div style={styles.metricIcon}>👁️</div>
                  <div style={styles.metricValue}>{stats.totalScans}</div>
                  <div style={styles.metricLabel}>Total QR Scans</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricIcon}>💬</div>
                  <div style={styles.metricValue}>{stats.totalInquiries}</div>
                  <div style={styles.metricLabel}>QR Inquiries</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricIcon}>🎯</div>
                  <div style={styles.metricValue}>{stats.conversionRate}%</div>
                  <div style={styles.metricLabel}>Scan-to-Inquiry Rate</div>
                </div>
              </div>

              {/* Source Breakdown */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Breakdown by Poster Location</h3>
                <div style={styles.sourceList}>
                  {Object.keys(SOURCE_LABELS).map(key => {
                    const sourceStat = stats.sourceBreakdown.find(s => s.source === key);
                    const count = sourceStat ? sourceStat.count : 0;
                    const percentage = stats.totalScans > 0 ? (count / stats.totalScans) * 100 : 0;

                    return (
                      <div key={key} style={styles.sourceRow}>
                        <div style={styles.sourceLabelRow}>
                          <span style={styles.sourceName}>{SOURCE_LABELS[key]}</span>
                          <span style={styles.sourceCount}>
                            {count} {count === 1 ? "scan" : "scans"} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div style={styles.progressBar}>
                          <div 
                            style={{ 
                              ...styles.progressFill, 
                              width: `${percentage}%`,
                              backgroundColor: percentage > 0 ? "#fbbf24" : "transparent"
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inquiry Type Breakdown */}
              {stats.totalInquiries > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Inquiry Methods Chosen</h3>
                  <div style={styles.inquiryGrid}>
                    {Object.keys(INQUIRY_LABELS).map(key => {
                      const typeStat = stats.inquiryTypeBreakdown.find(t => t.type === key);
                      const count = typeStat ? typeStat.count : 0;
                      const percentage = stats.totalInquiries > 0 ? (count / stats.totalInquiries) * 100 : 0;

                      return (
                        <div key={key} style={styles.inquiryCard}>
                          <div style={styles.inquiryLabel}>{INQUIRY_LABELS[key]}</div>
                          <div style={styles.inquiryCount}>{count}</div>
                          <div style={styles.inquiryPercent}>{percentage.toFixed(1)}% of enquiries</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stats.totalScans === 0 && (
                <div style={styles.emptyContainer}>
                  <div style={styles.emptyIcon}>📢</div>
                  <h4 style={styles.emptyTitle}>No physical scans recorded yet</h4>
                  <p style={styles.emptyText}>
                    Print the vacancy poster and place it outside your building, on noticeboards, or gates. When passers-by scan it, their activity will appear here!
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div style={styles.footer}>
          <button style={styles.closeModalBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#fff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 0",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: "20px",
    "&:hover": { color: "#fff" }
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(59, 130, 246, 0.2)",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: "16px",
    fontSize: "14px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "20px 0",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "16px",
  },
  retryBtn: {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
  },
  statsLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "16px 12px",
    textAlign: "center",
  },
  metricIcon: {
    fontSize: "20px",
    marginBottom: "8px",
  },
  metricValue: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.01)",
    border: "1px solid rgba(255,255,255,0.03)",
    borderRadius: "16px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#f1f5f9",
    margin: "0 0 16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sourceList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  sourceRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sourceLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: 600,
  },
  sourceName: {
    color: "#f1f5f9",
  },
  sourceCount: {
    color: "#fbbf24",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#0f172a",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease-out",
  },
  inquiryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  inquiryCard: {
    backgroundColor: "#0f172a",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  inquiryLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "4px",
  },
  inquiryCount: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#10b981", // Emerald-500
    marginBottom: "2px",
  },
  inquiryPercent: {
    fontSize: "10px",
    color: "#64748b",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "30px 20px",
    backgroundColor: "#0f172a",
    borderRadius: "16px",
    border: "1px dashed rgba(255,255,255,0.1)",
  },
  emptyIcon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
    margin: "0 0 8px",
  },
  emptyText: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0,
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeModalBtn: {
    padding: "10px 20px",
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  }
};
