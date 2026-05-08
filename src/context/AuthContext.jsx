import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Load token from localStorage on mount
    return localStorage.getItem("token") || null;
  });

  const [user, setUser] = useState(null);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Add this useEffect after the first one
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && (!user || !user.name)) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          // You may need to update context here if possible
          setUser(data); 
          console.log("User data:", data);
        } catch (err) {
          console.error("Failed to fetch user profile");
        }
      }
    };
    fetchUserProfile();
  }, [token, user]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}