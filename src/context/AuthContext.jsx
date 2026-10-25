import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { clearSellerSession } from "../utils/dashboardRoutes";
import SplashScreen from "../components/SplashScreen";

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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          if (isMounted) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        } else {
          // Invisible Guest Auto-Login
          const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
          const res = await fetch(`${API_BASE}/auth/guest-signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              setToken(data.token);
              setUser(data.user);
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.error("Auth init/restore error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((newToken, userData) => {
    if (!newToken || !userData) {
      console.error("Login called without token or user");
      return;
    }
    clearSellerSession();
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const updateUser = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;
    setUser((prev) => {
      // Check if shallow equal to avoid unnecessary state updates
      let changed = false;
      for (const key of Object.keys(partial)) {
        if (prev?.[key] !== partial[key]) {
          changed = true;
          break;
        }
      }
      if (!changed && prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback((redirectTo = "/axxbiashara") => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace(redirectTo);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading: !isAuthReady,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
    }}>
      {isAuthReady && children}
      {showSplash && (
        <SplashScreen
          isReady={isAuthReady}
          onComplete={() => setShowSplash(false)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
