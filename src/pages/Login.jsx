import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [isRegister, setIsRegister] = useState(false);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // REGISTER MODE
      if (isRegister) {
        await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password
        });

        alert("Account created successfully ✔");
        setIsRegister(false);
        return;
      }

      // LOGIN MODE
    const res = await API.post("/auth/login", {
  email,
  password
});

localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful ✔");

      // redirect to home or listings
      navigate("/");

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isRegister ? "Create Account" : "Login"}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* NAME ONLY FOR REGISTER */}
        {isRegister && (
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            style={styles.input}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {isRegister ? "Register" : "Login"}
        </button>

      </form>

      <p
        onClick={() => setIsRegister(!isRegister)}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {isRegister
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: "50px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "300px",
    margin: "auto"
  },
  input: {
    padding: "10px",
    borderRadius: "5px"
  },
  button: {
    padding: "10px",
    background: "#0a1f44",
    color: "white",
    border: "none",
    borderRadius: "5px"
  }
};