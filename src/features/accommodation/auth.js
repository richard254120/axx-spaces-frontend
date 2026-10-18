const TOKEN_KEY = "token";
const USER_KEY = "accommodationUser";

export function getAccommodationToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAccommodationUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
    const mainUser = localStorage.getItem("user");
    return mainUser ? JSON.parse(mainUser) : null;
  } catch {
    return null;
  }
}

export function setAccommodationSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    const sessionUser = {
      _id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "host",
      profileImage: user.profileImage || "",
    };
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    localStorage.setItem("user", JSON.stringify(sessionUser));
  }
}

export function clearAccommodationSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
}

export function isAccommodationLoggedIn() {
  const token = getAccommodationToken();
  if (!token) return false;
  const user = getAccommodationUser();
  if (!user || user.role === "guest") return false;
  return user.role === "host" || user.role === "admin";
}

export function getDisplayName(user) {
  if (!user) return "";
  return user.name?.split(" ")[0] || user.email?.split("@")[0] || "Guest";
}
