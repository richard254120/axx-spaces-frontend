export default function PropertyCard({ property }) {
  return (
    <div style={styles.card}>
      <h3>{property.title}</h3>
      <p>{property.location}</p>
      <h4 style={{ color: "#ff4d4d" }}>Ksh {property.price}</h4>
    </div>
  );
}

const styles = {
  card: {
    background: "#111",
    padding: "15px",
    borderRadius: "10px",
  },
};