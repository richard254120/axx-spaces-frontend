import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("LOGIN DATA:", form);
    alert("Login sent (connect backend next)");
  };

  return (
    <div style={styles.container}>
      <h2>Landlord Login / Register</h2>

      <form onSubmit={handleLogin} style={styles.form}>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone Number (for SMS alerts)"
          onChange={handleChange}
          required
        />

        <button className="btn">Continue</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "400px",
    margin: "auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};