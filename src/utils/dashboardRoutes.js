/** Dashboard home path for each account role */
export const DASHBOARD_BY_ROLE = {
  member: "/member",
  user: "/member",
  landlord: "/dashboard",
  provider: "/dashboard",
  agent: "/agent/dashboard",
  host: "/accommodation/dashboard",
  seller: "/quicksales-dashboard",
  mover: "/mover-dashboard",
  business: "/business-dashboard",
  admin: "/admin/dashboard",
  team: "/admin/verification",
};

/** Login page when that dashboard requires auth */
export const LOGIN_BY_ROLE = {
  member: "/user-login",
  agent: "/agent/login",
  host: "/accommodation/login",
  landlord: "/login",
  provider: "/login",
  seller: "/quicksales-login",
  mover: "/login",
  business: "/business-login",
  user: "/user-login",
  admin: "/login",
  team: "/login",
};

export function normalizeRole(role) {
  return (role || "").toLowerCase().trim();
}

export function getDashboardPath(role) {
  const key = normalizeRole(role);
  if (key === "member" || key === "user") {
    return "/member";
  }
  if (key === "guest") {
    return "/";
  }
  return DASHBOARD_BY_ROLE[key] || "/";
}

export function getLoginPath(role) {
  const key = normalizeRole(role);
  return LOGIN_BY_ROLE[key] || "/login";
}

export function clearSellerSession() {
  localStorage.removeItem("sellerToken");
  localStorage.removeItem("sellerUser");
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
  const logout = authContext?.logout;

  if (preferSeller && seller) {
    return { token: seller.token, user: seller.user, source: "seller", logout };
  }

  if (authContext?.token && authContext?.user) {
    return {
      token: authContext.token,
      user: authContext.user,
      source: "main",
      logout,
    };
  }

  if (seller) {
    return { token: seller.token, user: seller.user, source: "seller", logout };
  }

  return { token: null, user: null, source: null, logout };
}

export function roleIsAllowed(userRole, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  const role = normalizeRole(userRole);
  return allowedRoles.map(normalizeRole).includes(role);
}

/** Roles that use a dedicated workspace (not the public marketing site) */
export function isWorkspaceUser(role) {
  const key = normalizeRole(role);
  // 'member', 'user', and 'guest' are community members exploring spaces, NOT workspace providers!
  if (key === "member" || key === "user" || key === "guest" || !key) return false;
  return Boolean(DASHBOARD_BY_ROLE[key]);
}

export const ACCOUNT_NAV_BY_ROLE = {
  landlord: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Upload", path: "/upload" },
    { label: "Payments", path: "/payment-history" },
    { label: "Settings", path: "/settings" },
  ],
  agent: [
    { label: "Dashboard", path: "/agent/dashboard" },
    { label: "Upload House", path: "/upload" },
    { label: "Settings", path: "/settings" },
  ],
  host: [
    { label: "Dashboard", path: "/accommodation/dashboard" },
    { label: "Settings", path: "/settings" },
  ],
  seller: [
    { label: "Dashboard", path: "/quicksales-dashboard" },
    { label: "Settings", path: "/settings" },
  ],
  mover: [
    { label: "Dashboard", path: "/mover-dashboard" },
    { label: "Settings", path: "/settings" },
  ],
  business: [
    { label: "Dashboard", path: "/business-dashboard" },
    { label: "Add Business", path: "/business/create" },
    { label: "Settings", path: "/settings" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Verification", path: "/admin/verification" },
    { label: "Settings", path: "/settings" },
  ],
  team: [
    { label: "Verification", path: "/admin/verification" },
    { label: "Settings", path: "/settings" },
  ],
};

export function getAccountNav(role) {
  return ACCOUNT_NAV_BY_ROLE[normalizeRole(role)] || ACCOUNT_NAV_BY_ROLE.landlord;
}

export function getWorkspaceBrand(role) {
  const brands = {
    agent: "Agent Portal",
    landlord: "Landlord Portal",
    seller: "QuickSales Portal",
    mover: "Axx Movers",
    business: "Business Workspace",
    admin: "Admin Panel",
    team: "Admin Panel",
    host: "Accommodation Host Portal",
  };
  return brands[normalizeRole(role)] || "My Account";
}
