import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./TeacherLogin.css";

type LoginType = "management" | "director";

const API_BASE_URL =
  "https://exammaster-backend-up1y.onrender.com/api";

const REQUEST_TIMEOUT = 15000;

export default function TeacherLogin() {
  const navigate = useNavigate();

  const [loginType, setLoginType] =
    useState<LoginType>("management");

  const [teacherId, setTeacherId] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginTypeChange = (type: LoginType) => {
    if (loading) return;

    setLoginType(type);
    setError("");
  };

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanTeacherId = teacherId.trim();
    const cleanAccessCode = accessCode.trim();

    if (!cleanTeacherId || !cleanAccessCode) {
      setError("Please enter your ID and access code.");
      return;
    }

    if (cleanTeacherId.length < 3) {
      setError("Please enter a valid ID.");
      return;
    }

    if (cleanAccessCode.length < 4) {
      setError("Please enter a valid access code.");
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      setLoading(true);

      const endpoint =
        loginType === "management"
          ? `${API_BASE_URL}/teacher/login`
          : `${API_BASE_URL}/staff/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "omit", 
        signal: controller.signal,
        body: JSON.stringify({
          teacherId: cleanTeacherId,
          accessCode: cleanAccessCode,
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Authentication failed. Please verify your credentials."
        );
        return;
      }

      if (loginType === "management") {
        if (data.token) {
          localStorage.setItem("teacherToken", data.token);
        }

        if (data.teacher) {
          localStorage.setItem(
            "teacher",
            JSON.stringify(data.teacher)
          );
        }

        localStorage.setItem("role", "teacher");

        navigate("/teacher/dashboard", {
          replace: true,
        });
      } else {
        if (data.token) {
          localStorage.setItem("staffToken", data.token);
        }

        if (data.staff) {
          localStorage.setItem(
            "staff",
            JSON.stringify(data.staff)
          );
        }

        localStorage.setItem("role", "head");

        navigate("/head/dashboard", {
          replace: true,
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError(
          "Server is taking too long to respond. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the authentication server."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const isManagement = loginType === "management";

  return (
    <main className="teacher-login-page">
      {/* Background decoration */}
      <div className="login-bg-orb login-bg-orb-one" />
      <div className="login-bg-orb login-bg-orb-two" />
      <div className="login-grid" />

      <section className="teacher-login-shell">
        {/* Left branding panel */}
        <aside className="login-brand-panel">
          <div className="brand-glow" />

          <div className="brand-top">
            <div className="brand-logo">
              <GraduationCap size={28} strokeWidth={2.2} />
            </div>

            <div>
              <span className="brand-mini">
                STG COLLEGE
              </span>

              <h2>ACADEMIC MANAGEMENT</h2>
            </div>
          </div>

          <div className="brand-content">
            <span className="brand-pill">
              STG COLLEGE • ACADEMIC MANAGEMENT
            </span>

            <h1>
              Empowering
              <span> Smarter </span>
              Education.
            </h1>

            <p>
              A secure management workspace designed for
              academic leadership, faculty administration and
              institutional performance.
            </p>
          </div>

          <div className="security-badge">
            <div className="security-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Protected Access</strong>
              <span>
                Secure authentication environment
              </span>
            </div>
          </div>

          <div className="brand-footer">
            <span>EXAMMASTER </span>
            <span className="brand-dot" />
            <span>STG UNIVERSITY</span>
          </div>
        </aside>

        {/* Login panel */}
        <section className="login-form-panel">
          <div className="mobile-brand">
            <div className="mobile-logo">
              <GraduationCap size={24} />
            </div>

            <div>
              <strong>STG COLLEGE</strong>
              <span>PRE UNIVERSITY</span>
            </div>
          </div>

          <div className="login-header">
            <span className="welcome-label">
              WELCOME BACK
            </span>

            <h1>
              {isManagement
                ? "Management Login"
                : "Director Login"}
            </h1>

            <p>
              Sign in to access your secure administration
              dashboard.
            </p>
          </div>

          {/* Portal switcher */}
          <div className="portal-switcher">
            <button
              type="button"
              className={
                isManagement
                  ? "portal-option active management"
                  : "portal-option"
              }
              onClick={() =>
                handleLoginTypeChange("management")
              }
              disabled={loading}
            >
              <span className="portal-icon">
                <ShieldCheck size={18} />
              </span>

              <span className="portal-text">
                <strong>Management</strong>
                <small>Academic Management</small>
              </span>
            </button>

            <button
              type="button"
              className={
                !isManagement
                  ? "portal-option active director"
                  : "portal-option"
              }
              onClick={() =>
                handleLoginTypeChange("director")
              }
              disabled={loading}
            >
              <span className="portal-icon">
                <GraduationCap size={18} />
              </span>

              <span className="portal-text">
                <strong>Director</strong>
                <small>Academic Leadership</small>
              </span>
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={loginUser}
            autoComplete="on"
          >
            {/* Teacher ID */}
            <div className="field-group">
              <label htmlFor="teacher-id">
                {isManagement
                  ? "Teacher ID"
                  : "Director ID"}
              </label>

              <div className="input-wrapper">
                <UserRound size={18} />

                <input
                  id="teacher-id"
                  type="text"
                  value={teacherId}
                  onChange={(e) => {
                    setTeacherId(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={
                    isManagement
                      ? "Enter your teacher ID"
                      : "Enter your director ID"
                  }
                  autoComplete="username"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Access Code */}
            <div className="field-group">
              <label htmlFor="access-code">
                Access Code
              </label>

              <div className="input-wrapper">
                <KeyRound size={18} />

                <input
                  id="access-code"
                  type={showPassword ? "text" : "password"}
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your access code"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide access code"
                      : "Show access code"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="login-error"
                role="alert"
              >
                <span className="error-mark">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              className={`secure-login-button ${
                isManagement
                  ? "management-button"
                  : "director-button"
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  <span>Secure Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={15} />
            <span>
              Your credentials are protected with secure
              authentication.
            </span>
          </div>

          <div className="login-footer">
            <span>© 2026 ExamMaster</span>
            <span>Authorized Personnel Only</span>
          </div>
        </section>
      </section>
    </main>
  );
}