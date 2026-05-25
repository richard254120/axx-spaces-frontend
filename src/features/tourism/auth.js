const TOKEN_KEY = "token";
const USER_KEY = "tourismUser";

export function getTourismToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTourismUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setTourismSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify({
      _id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "landlord",
    }));
  }
}

export function clearTourismSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
}

export function isTourismLoggedIn() {
  return Boolean(getTourismToken());
}

export function getDisplayName(user) {
  if (!user) return "";
  return user.name?.split(" ")[0] || user.email?.split("@")[0] || "Guest";
}
