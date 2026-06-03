import { useState, useEffect } from "react";

export default function AnalyticsDashboard({ userType = "landlord", userId = null }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, userType, userId]);

  const loadAnalytics = () => {
    setLoading(true);
    // Simulate loading analytics data
    setTimeout(() => {
      const mockData = generateMockAnalytics(userType, timeRange);
      setAnalytics(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockAnalytics = (type, range) => {
    const multiplier = range === "7d" ? 1 : range === "30d" ? 4 : 12;
    
    const baseData = {
      views: Math.floor(Math.random() * 500 * multiplier) + 100,
      inquiries: Math.floor(Math.random() * 50 * multiplier) + 10,
      bookings: Math.floor(Math.random() * 20 * multiplier) + 2,
      revenue: Math.floor(Math.random() * 100000 * multiplier) + 10000,
      conversionRate: (Math.random() * 10 + 2).toFixed(1),
    };

    if (type === "landlord") {
      return {
        ...baseData,
        propertiesListed: Math.floor(Math.random() * 10) + 1,
        averageResponseTime: Math.floor(Math.random() * 60) + 15,
        topProperty: "Nairobi Apartment",
      };
    } else if (type === "mover") {
      return {
        ...baseData,
        jobsCompleted: Math.floor(Math.random() * 30 * multiplier) + 5,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        repeatCustomers: Math.floor(Math.random() * 20) + 5,
      };
    } else if (type === "seller") {
      return {
        ...baseData,
        itemsSold: Math.floor(Math.random() * 50 * multiplier) + 10,
        averageOrderValue: Math.floor(Math.random() * 5000) + 1000,
        totalListings: Math.floor(Math.random() * 20) + 5,
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
          <SimpleLineChart data={generateChartData(timeRange)} />
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
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div style={styles.chartContainer}>
      <div style={styles.chartBars}>
        {data.map((point, index) => (
          <div key={index} style={styles.chartBarWrapper}>
            <div
              style={{
                ...styles.chartBar,
                height: `${(point.value / maxValue) * 100}%`,
                background: `linear-gradient(180deg, #3b82f6, #2563eb)`,
              }}
            />
            <span style={styles.chartLabel}>{point.label}</span>
          </div>
        ))}
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

function generateChartData(range) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const data = [];
  const labels = range === "7d" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : range === "30d"
    ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    : Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`);

  for (let i = 0; i < days; i++) {
    data.push({
      label: labels[i] || `Day ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 20,
    });
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
  },
  chartBar: {
    width: "100%",
    borderRadius: "4px 4px 0 0",
    transition: "height 0.3s ease",
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
