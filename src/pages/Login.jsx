import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN FUNCTION
  ========================= */
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/login", {
        email,
        password,
      });

      // ✅ Save user session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful ✔");

      // ✅ Redirect after login
      navigate("/");

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Login to Axx Spaces</h2>

      <form onSubmit={login} style={styles.form}>
        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter your password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* BUTTON */}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #0a1f44, #000)",
    color: "white",
  },

  title: {
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px",
  },

  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "none",
  },

  button: {
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    background: "#00c853",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};