import { createContext, useState, useEffect, useContext } from "react";
import { clearSellerSession } from "../utils/dashboardRoutes";

const defaultAuth = {
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isAuthenticated: false,
};

export const AuthContext = createContext(defaultAuth);

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
    if (!newToken || !userData) {
      console.error("Login called without token or user");
      return;
    }
    clearSellerSession();
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

  const logout = (redirectTo = "/axxbiashara") => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace(redirectTo);
  };

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
      loading: false,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
