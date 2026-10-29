// QuickSales publishing permissions
// Publishing items is open to AXXSpace Explorers (community members, role "user"),
// the legacy "member" role, and registered sellers.
export const PUBLISHING_ROLES = ["user", "member", "seller", "admin"];

// Accounts that must be signed in but cannot publish yet (e.g. landlords).
export function canPublishQuickSales(user) {
  // Unknown/legacy sessions fall through to the server-side check
  if (!user?.role) return true;
  return PUBLISHING_ROLES.includes(user.role);
}
