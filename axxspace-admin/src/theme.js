// Lightweight theme controller shared by the console shell and login page.
// Persists the choice in localStorage and reflects it on <html data-theme>.
const STORAGE_KEY = "axx-admin-theme";

export function getTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", next);
  }
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {
    /* ignore storage errors (private mode etc.) */
  }
  return next;
}

export function toggleTheme() {
  return setTheme(getTheme() === "dark" ? "light" : "dark");
}
