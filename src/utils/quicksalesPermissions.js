// QuickSales publishing permissions
// Publishing items is restricted to AXXSpace members and registered sellers.
export const PUBLISHING_ROLES = ["member", "seller", "admin"];

export function canPublishQuickSales(user) {
  // Unknown/legacy sessions fall through to the server-side check
  if (!user?.role) return true;
  return PUBLISHING_ROLES.includes(user.role);
}
