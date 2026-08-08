import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const studentToken = localStorage.getItem("token");
  const teacherToken = localStorage.getItem("teacherToken");
  const staffToken = localStorage.getItem("staffToken");

  const userRole = localStorage.getItem("role");

  // ==============================
  // NO LOGIN
  // ==============================
  if (!studentToken && !teacherToken && !staffToken) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ==============================
  // ROLE CHECK
  // ==============================
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  // ==============================
  // STUDENT ROUTE
  // ==============================
  if (
    userRole === "student" &&
    !studentToken
  ) {
    return <Navigate to="/login" replace />;
  }

  // ==============================
  // TEACHER ROUTE
  // ==============================
  if (
    userRole === "teacher" &&
    !teacherToken
  ) {
    return <Navigate to="/teacher/login" replace />;
  }

  // ==============================
  // MENTOR ROUTE
  // ==============================
  if (
    userRole === "mentor" &&
    !staffToken
  ) {
    return <Navigate to="/teacher/login" replace />;
  }

  // ==============================
  // HEAD ROUTE
  // ==============================
  if (
    userRole === "head" &&
    !staffToken
  ) {
    return <Navigate to="/teacher/login" replace />;
  }

  return <>{children}</>;
}