import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Guard against blank flash

  useEffect(() => {
    // Read localStorage only after mount — safe in all browsers + Vercel
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error("Auth restore error:", err);
    } finally {
      setLoading(false); // ✅ Now safe to render the app
    }
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ Hold rendering until localStorage is read
  // Prevents blank screen / dark flash on Vercel
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f1729",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fbbf24",
        fontSize: "18px",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.02em",
      }}>
        ✨ Loading Axx Spaces...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};