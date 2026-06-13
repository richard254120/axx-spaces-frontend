/** Dashboard home path for each account role */
export const DASHBOARD_BY_ROLE = {
  landlord: "/dashboard",
  seller: "/seller-dashboard",
  mover: "/mover-dashboard",
  user: "/business-dashboard",
  admin: "/admin/verification",
  team: "/admin/verification",
};

/** Login page when that dashboard requires auth */
export const LOGIN_BY_ROLE = {
  landlord: "/login",
  seller: "/seller-login",
  mover: "/login",
  user: "/business-login",
  admin: "/login",
  team: "/login",
};

export function normalizeRole(role) {
  return (role || "").toLowerCase().trim();
}

export function getDashboardPath(role) {
  const key = normalizeRole(role);
  return DASHBOARD_BY_ROLE[key] || "/";
}

export function getLoginPath(role) {
  const key = normalizeRole(role);
  return LOGIN_BY_ROLE[key] || "/login";
}

/** Seller marketplace uses a separate token in localStorage */
export function getSellerSession() {
  try {
    const token = localStorage.getItem("sellerToken");
    const raw = localStorage.getItem("sellerUser");
    if (!token || !raw) return null;
    const user = JSON.parse(raw);
    if (normalizeRole(user?.role) !== "seller") return null;
    return { token, user };
  } catch {
    return null;
  }
}

/** Resolve active session — seller token takes precedence on seller routes */
export function resolveAuth(authContext, { preferSeller = false } = {}) {
  const seller = getSellerSession();

  if (preferSeller && seller) {
    return { token: seller.token, user: seller.user, source: "seller" };
  }

  if (authContext?.token && authContext?.user) {
    return {
      token: authContext.token,
      user: authContext.user,
      source: "main",
    };
  }

  if (seller) {
    return { token: seller.token, user: seller.user, source: "seller" };
  }

  return { token: null, user: null, source: null };
}

export function roleIsAllowed(userRole, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  const role = normalizeRole(userRole);
  return allowedRoles.map(normalizeRole).includes(role);
}
