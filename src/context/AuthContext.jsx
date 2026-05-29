import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error("Auth restore error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = (redirectTo = "/") => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = redirectTo;
  };

  // Optional: Make it harder for console attackers
  useEffect(() => {
    if (token) {
      // You can add more protection logic here later
    }
  }, [token]);

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
      }}>
        ✨ Loading Axxspace...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      updateUser,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
import { useContext } from "react";
export const useAuth = () => useContext(AuthContext);
