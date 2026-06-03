import { useState, useEffect } from "react";

export default function BookingCalendar({ propertyId, availableUnits = 1, onDateSelect = null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    loadBookedDates();
  }, [propertyId, currentMonth]);

  const loadBookedDates = () => {
    // Load booked dates from localStorage (simulated backend)
    const bookedKey = `booked_dates_${propertyId}`;
    const savedBooked = localStorage.getItem(bookedKey);
    if (savedBooked) {
      setBookedDates(JSON.parse(savedBooked));
    } else {
      // Generate some sample booked dates for demo
      const sampleBooked = generateSampleBookedDates();
      setBookedDates(sampleBooked);
      localStorage.setItem(bookedKey, JSON.stringify(sampleBooked));
    }
  };

  const generateSampleBookedDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const randomDate = new Date(today);
      randomDate.setDate(today.getDate() + Math.floor(Math.random() * 60));
      if (Math.random() > 0.7) {
        dates.push(randomDate.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateBooked = (dateStr) => {
    return bookedDates.includes(dateStr);
  };

  const isDateSelected = (dateStr) => {
    return selectedDates.includes(dateStr);
  };

  const isDatePast = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const handleDateClick = (dateStr) => {
    if (isDateBooked(dateStr) || isDatePast(dateStr)) return;

    const newSelected = selectedDates.includes(dateStr)
      ? selectedDates.filter(d => d !== dateStr)
      : [...selectedDates, dateStr];
    
    setSelectedDates(newSelected);
    
    if (onDateSelect) {
      onDateSelect(newSelected);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={styles.container}>
      <style>{css}</style>
      
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={() => navigateMonth(-1)}>←</button>
        <h3 style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button style={styles.navBtn} onClick={() => navigateMonth(1)}>→</button>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: "#22c55e" }}></div>
          <span style={styles.legendText}>Available</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: "#ef4444" }}></div>
          <span style={styles.legendText}>Booked</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: "#3b82f6" }}></div>
          <span style={styles.legendText}>Selected</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarGrid}>
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} style={styles.dayHeader}>{day}</div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={styles.emptyCell}></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          const dateStr = date.toISOString().split('T')[0];
          const booked = isDateBooked(dateStr);
          const selected = isDateSelected(dateStr);
          const past = isDatePast(dateStr);

          return (
            <div
              key={i}
              onClick={() => handleDateClick(dateStr)}
              style={{
                ...styles.dayCell,
                ...(booked ? styles.dayBooked : {}),
                ...(selected ? styles.daySelected : {}),
                ...(past ? styles.dayPast : {}),
                ...(booked || past ? styles.dayDisabled : {}),
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div style={styles.summary}>
          <p style={styles.summaryTitle}>
            {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'} selected
          </p>
          <div style={styles.selectedDatesList}>
            {selectedDates.sort().map(date => (
              <span key={date} style={styles.selectedDateChip}>
                {formatDate(date)}
              </span>
            ))}
          </div>
          <button
            style={styles.clearBtn}
            onClick={() => {
              setSelectedDates([]);
              if (onDateSelect) onDateSelect([]);
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Availability Info */}
      <div style={styles.availabilityInfo}>
        <span style={styles.availabilityLabel}>Available Units:</span>
        <span style={styles.availabilityValue}>{availableUnits}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
    maxWidth: "400px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  monthTitle: {
    color: "#f1f5f9",
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: 0,
  },
  navBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid #334155",
    color: "#f1f5f9",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  legend: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  legendText: {
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    marginBottom: "16px",
  },
  dayHeader: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: 600,
    textAlign: "center",
    padding: "8px 0",
  },
  emptyCell: {
    padding: "8px",
  },
  dayCell: {
    padding: "10px",
    textAlign: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#f1f5f9",
    transition: "all 0.2s",
    background: "rgba(255, 255, 255, 0.05)",
  },
  dayBooked: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
  },
  daySelected: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    fontWeight: 600,
  },
  dayPast: {
    opacity: 0.3,
  },
  dayDisabled: {
    cursor: "not-allowed",
  },
  summary: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px",
  },
  summaryTitle: {
    color: "#3b82f6",
    fontSize: "0.9rem",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  selectedDatesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "8px",
  },
  selectedDateChip: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#3b82f6",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  availabilityInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.2)",
    borderRadius: "8px",
  },
  availabilityLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  availabilityValue: {
    color: "#22c55e",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
};

const css = `
  .day-cell:hover:not(.day-disabled) {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;
