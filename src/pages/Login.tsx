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

import { loginStudent } from "../services/api";
import {
  getBackendRole,
  saveAuthSession,
} from "../services/session";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // LOGIN SUBMIT
  // =========================================

  const submit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;
    setError("");

    // =========================================
    // CLEAN INPUT
    // =========================================

    const cleanStudentId = studentId.trim().toUpperCase();
    const cleanPassword = password.trim();

    // =========================================
    // VALIDATION
    // =========================================

    if (!cleanStudentId) {
      setError("Please enter your Student ID.");
      return;
    }

    if (!cleanPassword) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // =========================================
      // DEVICE ID (Single-Device Security)
      // =========================================

      let deviceId = localStorage.getItem("studentDeviceId");

      if (!deviceId) {
        deviceId = `${crypto.randomUUID()}-${Date.now()}`;
        localStorage.setItem("studentDeviceId", deviceId);
      }

      // =========================================
      // LOGIN API
      // =========================================

      const data = await loginStudent({
        studentId: cleanStudentId,
        password: cleanPassword,
        deviceId,
      });

      // =========================================
      // LOGIN SUCCESS & SECURE SESSION SAVE
      // =========================================

      const backendRole = getBackendRole(data) || "student";

      if (data?.success && data?.token) {
        saveAuthSession({
          role: backendRole,
          token: data.token,
          profile: data.student,
        });

        if (data.student?.studentId) {
          localStorage.setItem("studentId", data.student.studentId);
        }

        // ---------------------------------------
        // DASHBOARD REDIRECTION
        // ---------------------------------------

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      // =========================================
      // BACKEND ERROR HANDLING
      // =========================================

      setError(
        data?.message ||
          "Login failed. The server did not return a valid session."
      );
    } catch (err: any) {
      console.error("STUDENT LOGIN ERROR:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "";

      setError(
        backendMessage ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="auth-page">
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

      <section className="student-login-shell">
        {/* =====================================
            LEFT BRAND PANEL
        ===================================== */}

        <aside className="student-brand-panel">
          <div className="brand-glow" />

          <div className="student-brand-top">
            <div className="student-brand-logo">
              <GraduationCap size={29} strokeWidth={2.2} />
            </div>
            <div>
              <span className="student-brand-mini">
                STG COLLEGE
              </span>
              <h2>PRE-UNIVERSITY</h2>
            </div>
          </div>

          <div className="student-brand-content">
            <span className="student-brand-pill">
              Student Learning Platform
            </span>
            <h1>
              Your <span> Academic </span> Journey Starts Here.
            </h1>
            <p>
              Access examinations, results, academic progress and your
              complete student learning experience from one secure
              platform.
            </p>
          </div>

          <div className="student-security">
            <div className="student-security-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Secure Student Access</strong>
              <span>Protected academic environment</span>
            </div>
          </div>

          <div className="student-brand-footer">
            <span>STG COLLEGE</span>
            <span className="student-footer-dot" />
            <span>EDU DESK</span>
          </div>
        </aside>

        {/* =====================================
            RIGHT LOGIN PANEL
        ===================================== */}

        <section className="student-login-panel">
          {/* MOBILE BRAND */}
          <div className="student-mobile-brand">
            <div className="student-mobile-logo">
              <GraduationCap size={24} />
            </div>
            <div>
              <strong>STG COLLEGE</strong>
              <span>PRE UNIVERSITY</span>
            </div>
          </div>

          {/* HEADER */}
          <div className="student-login-header">
            <span className="student-welcome">WELCOME BACK</span>
            <h1>STUDENT LOGIN</h1>
            <p>
              Sign in using your Student ID and password to continue your
              academic journey.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form
            className="student-login-form"
            onSubmit={submit}
            autoComplete="on"
          >
            {/* STUDENT ID */}
            <div className="student-field">
              <label htmlFor="student-id">Student ID</label>
              <div className="student-input">
                <UserRound size={18} />
                <input
                  id="student-id"
                  type="text"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value.toUpperCase());
                    if (error) setError("");
                  }}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="student-field">
              <label htmlFor="student-password">Password</label>
              <div className="student-input">
                <KeyRound size={18} />
                <input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="student-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="student-login-error" role="alert">
                <span className="student-error-mark">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="student-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="student-spinner" />
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

          {/* REGISTER */}
          <div className="student-register">
            <span>New student?</span>
            <button
              type="button"
              onClick={() => navigate("/student/register")}
              disabled={loading}
            >
              Create your account <ArrowRight size={14} />
            </button>
          </div>

          {/* SECURITY */}
          <div className="student-security-note">
            <ShieldCheck size={15} />
            <span>
              Your academic credentials are protected with secure authentication.
            </span>
          </div>

          {/* FOOTER */}
          <div className="student-login-footer">
            <span>© 2026 STG NEXUS</span>
            <span>STG COLLEGE • STUDENT ACCESS</span>
          </div>
        </section>
      </section>
    </main>
  );
}