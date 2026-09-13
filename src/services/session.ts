export type AppRole =
  | "student"
  | "teacher"
  | "staff"
  | "mentor"
  | "head";

/** Authentication-owned keys only. Exam recovery/device keys are preserved. */
const AUTH_STORAGE_KEYS = [
  "token",
  "studentToken",
  "teacherToken",
  "staffToken",
  "mentorToken",
  "headToken",
  "userToken",
  "student",
  "teacher",
  "staff",
  "user",
  "studentId",
  "studentLoggedIn",
  "role",
] as const;

const ROLE_TOKEN_KEYS: Record<AppRole, string> = {
  student: "studentToken",
  teacher: "teacherToken",
  staff: "staffToken",
  mentor: "staffToken",
  head: "staffToken",
};

const ROLE_PROFILE_KEYS: Partial<Record<AppRole, string>> = {
  student: "student",
  teacher: "teacher",
  staff: "staff",
  mentor: "staff",
  head: "staff",
};

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  window.dispatchEvent(new Event("authChanged"));
};

export const getSessionToken = (role: AppRole): string | null => {
  return localStorage.getItem(ROLE_TOKEN_KEYS[role]);
};

export const getStoredRole = (): AppRole | null => {
  const role = localStorage.getItem("role");
  return isAppRole(role) ? role : null;
};

/** Store exactly one backend-issued session for the active role. */
export const saveAuthSession = ({
  role,
  token,
  profile,
}: {
  role: AppRole;
  token: string;
  profile?: unknown;
}) => {
  if (!token.trim()) {
    throw new Error("A backend-issued session token is required.");
  }

  clearAuthSession();
  localStorage.setItem(ROLE_TOKEN_KEYS[role], token);
  localStorage.setItem("role", role);

  const profileKey = ROLE_PROFILE_KEYS[role];
  if (profileKey && profile !== undefined) {
    localStorage.setItem(profileKey, JSON.stringify(profile));
  }

  if (role === "student") {
    localStorage.setItem("studentLoggedIn", "true");
  }

  window.dispatchEvent(new Event("authChanged"));
};

/** Read role claims supplied by the backend response; never use login mode. */
export const getBackendRole = (response: unknown): AppRole | null => {
  if (!response || typeof response !== "object") return null;

  const data = response as Record<string, unknown>;
  const candidates = [
    data.role,
    (data.user as Record<string, unknown> | undefined)?.role,
    (data.student as Record<string, unknown> | undefined)?.role,
    (data.teacher as Record<string, unknown> | undefined)?.role,
    (data.staff as Record<string, unknown> | undefined)?.role,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim().toLowerCase();
    if (isAppRole(normalized)) return normalized;
    if (normalized === "director") return "head";
    if (normalized === "management") return "teacher";
  }

  return null;
};

export const isAppRole = (value: string | null): value is AppRole => {
  return (
    value === "student" ||
    value === "teacher" ||
    value === "staff" ||
    value === "mentor" ||
    value === "head"
  );
};

export const getLoginRouteForRole = (role: AppRole | null): string => {
  if (role === "teacher" || role === "head") return "/teacher/login";
  if (role === "staff" || role === "mentor") return "/staff/login";
  return "/login";
};

export const getDefaultRouteForRole = (role: AppRole): string => {
  switch (role) {
    case "student":
      return "/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "head":
      return "/head/dashboard";
    case "staff":
    case "mentor":
      return "/mentor/dashboard";
  }
};
