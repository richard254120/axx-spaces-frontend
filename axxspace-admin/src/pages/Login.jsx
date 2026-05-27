import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      if (user.role !== "admin") {
        setError("❌ Access denied. Admins only.");
        return;
      }
      login(token, user);
      navigate("/");
    } catch (err) {
      setError("❌ Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛡️ Axxspace Admin</h1>
        <p style={styles.subtitle}>Sign in to access the admin panel</p>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@axxspace.com" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading} style={styles.btn}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  title: { color: "#fbbf24", fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0", textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: "14px", textAlign: "center", marginBottom: "32px" },
  error: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", padding: "12px", fontSize: "13px", marginBottom: "20px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#f1f5f9", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(30, 41, 59, 0.6)", color: "#f1f5f9", fontSize: "14px", outline: "none" },
  btn: { padding: "14px", background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "15px", cursor: "pointer", marginTop: "8px" },
};
