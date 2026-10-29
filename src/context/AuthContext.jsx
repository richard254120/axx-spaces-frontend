import { createContext, useState, useEffect, useContext, useCallback } from "react";
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

const readStoredSession = () => {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (token && rawUser) {
      return { token, user: JSON.parse(rawUser) };
    }
  } catch {
    // Corrupted session data — drop it and start fresh.
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // ignore
    }
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  // Restore the saved session on the very first render so the site paints
  // immediately — no splash animation and no blocking network round-trip.
  const [initialSession] = useState(readStoredSession);
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);

  // Guests get a session in the background; the UI never waits for it.
  useEffect(() => {
    if (initialSession.token) return undefined;
    let isMounted = true;

    const createGuestSession = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
        const res = await fetch(`${API_BASE}/auth/guest-signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data?.token || !data?.user) return;
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.error("Guest sign-in error:", err);
      }
    };

    createGuestSession();

    return () => {
      isMounted = false;
    };
  }, [initialSession.token]);

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
