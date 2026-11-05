// Shared portal role-gating helpers for the frontend login pages.
// The backend /auth/login is the authority; these mirror it on the client so a
// wrong-portal attempt shows a clear message + a link to the correct portal.

export const PORTAL_ALLOWED_ROLES = {
  landlord: ["landlord", "caretaker"],
  mover: ["mover"],
  host: ["host"],
  seller: ["seller"],
  business: ["business"],
};

// Turn a backend ROLE_MISMATCH error body into a normalized descriptor.
export function readMismatch(data) {
  if (data && data.code === "ROLE_MISMATCH") {
    return {
      message: data.error || "These credentials belong to a different portal.",
      actualRole: data.actualRole || null,
      portalPath: data.portalPath || null,
    };
  }
  return null;
}

// Client-side defense: if a login unexpectedly succeeds with a role that does
// not belong to this portal, produce a mismatch descriptor instead of a session.
export function clientGuardMismatch(portal, user) {
  const allowed = PORTAL_ALLOWED_ROLES[portal] || [portal];
  const role = user && user.role;
  if (!role || allowed.includes(role)) return null;
  return {
    message: `These login details belong to a ${role} account, not a ${portal} account. Please sign in from the correct portal.`,
    actualRole: role,
    portalPath: null,
  };
}
