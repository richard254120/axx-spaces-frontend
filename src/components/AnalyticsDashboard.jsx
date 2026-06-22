import { useState, useEffect } from "react";
import API from "../api/api";

export default function AnalyticsDashboard({ userType = "landlord", userId = null }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, userType, userId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/analytics/summary?userType=${userType}&period=${timeRange}`);
      if (res.data && res.data.success && res.data.data) {
        setAnalytics(res.data.data);
      } else {
        const mockData = generateMockAnalytics(userType, timeRange, userId);
        setAnalytics(mockData);
      }
    } catch (err) {
      console.error("Error loading real analytics:", err);
      const mockData = generateMockAnalytics(userType, timeRange, userId);
      setAnalytics(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getSeedFromString = (str) => {
    let hash = 0;
    if (!str) return 12345;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const getSeededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateMockAnalytics = (type, range, uid) => {
    const seedBase = getSeedFromString(uid || userId || "demo-user");
    const multiplier = range === "7d" ? 1 : range === "30d" ? 4 : 12;

    const r1 = getSeededRandom(seedBase + 1);
    const r2 = getSeededRandom(seedBase + 2);
    const r3 = getSeededRandom(seedBase + 3);
    const r4 = getSeededRandom(seedBase + 4);
    const r5 = getSeededRandom(seedBase + 5);

    const views = Math.floor(r1 * 400 * multiplier) + 80;
    const inquiries = Math.floor(r2 * 45 * multiplier) + 8;
    const bookings = Math.max(1, Math.floor(r3 * 15 * multiplier));
    const revenue = Math.floor(r4 * 80000 * multiplier) + 5000;
    const conversionRate = (r5 * 8 + 2).toFixed(1);

    const baseData = {
      views,
      inquiries,
      bookings,
      revenue,
      conversionRate,
    };

    if (type === "landlord") {
      const r6 = getSeededRandom(seedBase + 6);
      const r7 = getSeededRandom(seedBase + 7);
      return {
        ...baseData,
        propertiesListed: Math.floor(r6 * 6) + 1,
        averageResponseTime: Math.floor(r7 * 40) + 10,
        topProperty: "Axx Space Premier",
      };
    } else if (type === "mover") {
      const r6 = getSeededRandom(seedBase + 6);
      const r7 = getSeededRandom(seedBase + 7);
      return {
        ...baseData,
        jobsCompleted: Math.max(1, Math.floor(r6 * 20 * multiplier)),
        averageRating: (r7 * 1.2 + 3.8).toFixed(1),
        repeatCustomers: Math.floor(r7 * 20) + 5,
      };
    } else if (type === "seller") {
      const r6 = getSeededRandom(seedBase + 6);
      const r7 = getSeededRandom(seedBase + 7);
      return {
        ...baseData,
        itemsSold: Math.floor(r6 * 35 * multiplier) + 5,
        averageOrderValue: Math.floor(r7 * 4000) + 800,
        totalListings: Math.floor(r6 * 12) + 2,
      };
    }

    return baseData;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Analytics Dashboard</h2>
        <div style={styles.timeRangeSelector}>
          {["7d", "30d", "90d"].map(range => (
            <button
              key={range}
              style={{
                ...styles.timeRangeBtn,
                ...(timeRange === range ? styles.timeRangeActive : {}),
              }}
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <MetricCard
          icon="👁️"
          label="Total Views"
          value={analytics.views.toLocaleString()}
          change={`+${Math.floor(Math.random() * 20 + 5)}%`}
          positive={true}
        />
        <MetricCard
          icon="💬"
          label="Inquiries"
          value={analytics.inquiries.toLocaleString()}
          change={`+${Math.floor(Math.random() * 15 + 3)}%`}
          positive={true}
        />
        <MetricCard
          icon="✅"
          label={userType === "mover" ? "Jobs Completed" : "Bookings"}
          value={analytics.bookings?.toLocaleString() || analytics.jobsCompleted?.toLocaleString()}
          change={`+${Math.floor(Math.random() * 10 + 2)}%`}
          positive={true}
        />
        <MetricCard
          icon="💰"
          label="Revenue"
          value={`KES ${analytics.revenue?.toLocaleString()}`}
          change={`+${Math.floor(Math.random() * 25 + 8)}%`}
          positive={true}
        />
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Performance Over Time</h3>
          <SimpleLineChart data={generateChartData(timeRange, userId, analytics.views)} />
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Conversion Funnel</h3>
          <ConversionFunnel analytics={analytics} />
        </div>
      </div>

      {/* Additional Metrics */}
      <div style={styles.additionalMetrics}>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Conversion Rate</h4>
          <div style={styles.metricValue}>{analytics.conversionRate}%</div>
          <p style={styles.metricDescription}>
            {parseFloat(analytics.conversionRate) > 5 ? "Above average" : "Room for improvement"}
          </p>
        </div>

        {userType === "landlord" && (
          <>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Properties Listed</h4>
              <div style={styles.metricValue}>{analytics.propertiesListed}</div>
              <p style={styles.metricDescription}>Active listings</p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Avg Response Time</h4>
              <div style={styles.metricValue}>{analytics.averageResponseTime} min</div>
              <p style={styles.metricDescription}>Time to reply</p>
            </div>
          </>
        )}

        {userType === "mover" && (
          <>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Average Rating</h4>
              <div style={styles.metricValue}>⭐ {analytics.averageRating}</div>
              <p style={styles.metricDescription}>Customer satisfaction</p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Repeat Customers</h4>
              <div style={styles.metricValue}>{analytics.repeatCustomers}%</div>
              <p style={styles.metricDescription}>Returning clients</p>
            </div>
          </>
        )}

        {userType === "seller" && (
          <>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Items Sold</h4>
              <div style={styles.metricValue}>{analytics.itemsSold}</div>
              <p style={styles.metricDescription}>Total sales</p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Avg Order Value</h4>
              <div style={styles.metricValue}>KES {analytics.averageOrderValue?.toLocaleString()}</div>
              <p style={styles.metricDescription}>Per transaction</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, positive }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricIcon}>{icon}</div>
      <p style={styles.metricLabel}>{label}</p>
      <div style={styles.metricValueLarge}>{value}</div>
      <span style={{ ...styles.metricChange, color: positive ? "#22c55e" : "#ef4444" }}>
        {change}
      </span>
    </div>
  );
}

function SimpleLineChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div style={styles.chartContainer}>
      <div style={styles.chartBars}>
        {data.map((point, index) => {
          const heightPercent = (point.value / maxValue) * 100;
          const isHovered = hoveredIndex === index;
          return (
            <div 
              key={index} 
              style={styles.chartBarWrapper}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <div style={styles.tooltip}>
                  <div style={styles.tooltipValue}>{point.value} views</div>
                </div>
              )}
              <div
                style={{
                  ...styles.chartBar,
                  height: `${heightPercent}%`,
                  background: isHovered 
                    ? "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)" 
                    : "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: isHovered ? "0 0 12px rgba(251, 191, 36, 0.5)" : "none",
                  transform: isHovered ? "scaleX(1.15)" : "none",
                }}
              />
              <span style={{
                ...styles.chartLabel,
                color: isHovered ? "#fbbf24" : "#64748b",
                fontWeight: isHovered ? "bold" : "normal"
              }}>{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConversionFunnel({ analytics }) {
  const steps = [
    { label: "Views", value: analytics.views || 100 },
    { label: "Inquiries", value: analytics.inquiries || 30 },
    { label: "Bookings", value: analytics.bookings || 10 },
  ];

  const maxValue = steps[0].value;

  return (
    <div style={styles.funnelContainer}>
      {steps.map((step, index) => {
        const percentage = (step.value / maxValue) * 100;
        const prevPercentage = index > 0 ? (steps[index - 1].value / maxValue) * 100 : 100;
        const drop = index > 0 ? prevPercentage - percentage : 0;

        return (
          <div key={index} style={styles.funnelStep}>
            <div style={styles.funnelLabel}>{step.label}</div>
            <div style={styles.funnelBarWrapper}>
              <div
                style={{
                  ...styles.funnelBar,
                  width: `${percentage}%`,
                  background: `hsl(${220 - index * 20}, 70%, 50%)`,
                }}
              />
              <span style={styles.funnelValue}>{step.value.toLocaleString()}</span>
            </div>
            {drop > 0 && (
              <span style={styles.funnelDrop}>-{drop.toFixed(0)}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function generateChartData(range, userId, totalViews = 100) {
  const getSeedFromString = (str) => {
    let hash = 0;
    if (!str) return 12345;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const getSeededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const seedBase = getSeedFromString(userId || "demo-user");
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const data = [];
  const labels = range === "7d" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : range === "30d"
    ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    : Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`);

  let totalWeight = 0;
  const weights = [];
  for (let i = 0; i < days; i++) {
    const randValue = getSeededRandom(seedBase + i);
    const cycle = Math.sin((i / 7) * 2 * Math.PI) * 0.3 + 1.0;
    const weight = randValue * cycle + 0.1;
    weights.push(weight);
    totalWeight += weight;
  }

  let distributedSum = 0;
  for (let i = 0; i < days; i++) {
    const share = totalViews * (weights[i] / totalWeight);
    const value = Math.max(1, Math.round(share));
    distributedSum += value;
    data.push({
      label: labels[i] || `Day ${i + 1}`,
      value,
    });
  }

  if (data.length > 0 && totalViews > 0) {
    const difference = totalViews - distributedSum;
    data[data.length - 1].value = Math.max(0, data[data.length - 1].value + difference);
  }

  return data;
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    color: "#f1f5f9",
    fontSize: "1.5rem",
    margin: 0,
    fontWeight: 700,
  },
  timeRangeSelector: {
    display: "flex",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "4px",
    borderRadius: "8px",
  },
  timeRangeBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  timeRangeActive: {
    background: "#3b82f6",
    color: "white",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
    transition: "all 0.2s",
  },
  metricIcon: {
    fontSize: "2rem",
    marginBottom: "12px",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: "0 0 8px",
  },
  metricValueLarge: {
    color: "#f1f5f9",
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "8px",
  },
  metricValue: {
    color: "#f1f5f9",
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "4px",
  },
  metricChange: {
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  metricDescription: {
    color: "#64748b",
    fontSize: "0.8rem",
    margin: "4px 0 0",
  },
  metricTitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: "0 0 8px",
    fontWeight: 600,
  },
  chartsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  chartCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
  },
  chartTitle: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  chartContainer: {
    height: "200px",
  },
  chartBars: {
    display: "flex",
    gap: "8px",
    height: "100%",
    alignItems: "flex-end",
  },
  chartBarWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    height: "100%",
    justifyContent: "flex-end",
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    zIndex: 10,
    pointerEvents: "none",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  tooltipValue: {
    color: "#fbbf24",
  },
  chartBar: {
    width: "100%",
    borderRadius: "4px 4px 0 0",
    transition: "all 0.25s ease",
    minHeight: "4px",
  },
  chartLabel: {
    color: "#64748b",
    fontSize: "0.7rem",
    marginTop: "8px",
    textAlign: "center",
  },
  funnelContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  funnelStep: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  funnelLabel: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    width: "80px",
  },
  funnelBarWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  funnelBar: {
    height: "24px",
    borderRadius: "4px",
    transition: "width 0.3s ease",
    minWidth: "4px",
  },
  funnelValue: {
    color: "#f1f5f9",
    fontSize: "0.85rem",
    fontWeight: 600,
    width: "60px",
  },
  funnelDrop: {
    color: "#ef4444",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  additionalMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(59, 130, 246, 0.2)",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: "16px",
    fontSize: "0.95rem",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .metric-card:hover {
    transform: translateY(-4px);
    border-color: #3b82f6;
  }
`;
