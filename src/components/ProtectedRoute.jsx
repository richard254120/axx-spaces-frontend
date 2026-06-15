import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getDashboardPath,
  getLoginPath,
  resolveAuth,
  roleIsAllowed,
} from "../utils/dashboardRoutes";

/**
 * Route guard — users may only access routes allowed for their role.
 * Wrong role → redirected to their own dashboard.
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  loginPath,
  preferSeller = false,
}) {
  const auth = useContext(AuthContext);
  const loading = auth?.loading ?? false;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  const session = resolveAuth(auth, { preferSeller });
  const { token, user } = session;

  if (!token || !user) {
    const fallbackLogin =
      loginPath ||
      (allowedRoles.length === 1 ? getLoginPath(allowedRoles[0]) : "/login");
    return <Navigate to={fallbackLogin} replace />;
  }

  if (allowedRoles.length > 0 && !roleIsAllowed(user.role, allowedRoles)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}
