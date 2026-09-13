import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  getDefaultRouteForRole,
  getLoginRouteForRole,
  getStoredRole,
  getSessionToken,
  type AppRole,
} from "./services/session";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const userRole = getStoredRole();
  const hasSessionToken = userRole
    ? Boolean(getSessionToken(userRole))
    : false;

  // This is a navigation/UI guard only. Token validity, expiry, revocation,
  // role claims, and resource ownership must be checked by the backend.
  if (!userRole || !hasSessionToken) {
    return (
      <Navigate
        to={getLoginRouteForRole(userRole)}
        state={{ from: location }}
        replace
      />
    );
  }

  // ==============================
  // ROLE CHECK
  // ==============================
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to={getDefaultRouteForRole(userRole)}
        replace
      />
    );
  }

  return <>{children}</>;
}
