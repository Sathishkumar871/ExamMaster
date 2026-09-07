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

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

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
    // CLEAN STUDENT ID
    // =========================================
    const cleanStudentId =
      studentId.trim().toUpperCase();

    // =========================================
    // VALIDATION
    // =========================================
    if (!cleanStudentId || !password) {
      setError(
        "Please enter your Student ID and password."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================================
      // LOGIN API
      // =========================================
      const data = await loginStudent({
        studentId: cleanStudentId,
        password,
      });

      console.log(
        "STUDENT LOGIN RESPONSE:",
        data
      );

      // =========================================
      // LOGIN SUCCESS
      // =========================================
      if (
        data?.success &&
        data?.token
      ) {
        // =========================================
        // CLEAR OLD MANAGEMENT / STAFF SESSION
        // =========================================
        localStorage.removeItem(
          "teacher"
        );

        localStorage.removeItem(
          "teacherToken"
        );

        localStorage.removeItem(
          "staff"
        );

        localStorage.removeItem(
          "staffToken"
        );

        // =========================================
        // SAVE STUDENT TOKEN
        // =========================================
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "studentToken",
          data.token
        );

        // =========================================
        // SAVE ROLE
        // =========================================
        localStorage.setItem(
          "role",
          "student"
        );

        // =========================================
        // SAVE STUDENT DATA
        // =========================================
        if (data.student) {
          localStorage.setItem(
            "student",
            JSON.stringify(
              data.student
            )
          );

          // =========================================
          // SAVE STUDENT ID
          // =========================================
          if (
            data.student.studentId
          ) {
            localStorage.setItem(
              "studentId",
              data.student.studentId
            );
          }
        }

        // =========================================
        // GO TO DASHBOARD
        // =========================================
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        setError(
          data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error(
        "Student login error:",
        err
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* =========================================
          BACKGROUND
      ========================================= */}
      <div className="auth-grid" />

      <div className="auth-orb auth-orb-one" />

      <div className="auth-orb auth-orb-two" />

      <section className="student-login-shell">

        {/* =========================================
            LEFT BRAND PANEL
        ========================================= */}
        <aside className="student-brand-panel">

          <div className="brand-glow" />

          <div className="student-brand-top">

            <div className="student-brand-logo">
              <GraduationCap
                size={29}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <span className="student-brand-mini">
                STG COLLEGE
              </span>

              <h2>
                PRE-UNIVERSITY
              </h2>
            </div>

          </div>

          <div className="student-brand-content">

            <span className="student-brand-pill">
              Student Learning Platform
            </span>

            <h1>
              Your
              <span> Academic </span>
              Journey Starts Here.
            </h1>

            <p>
              Access examinations, results,
              academic progress and your
              complete student learning
              experience from one secure
              platform.
            </p>

          </div>

          {/* SECURITY */}
          <div className="student-security">

            <div className="student-security-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>
                Secure Student Access
              </strong>

              <span>
                Protected academic environment
              </span>
            </div>

          </div>

          <div className="student-brand-footer">
            <span>STG COLLEGE</span>

            <span className="student-footer-dot" />

            <span>EDU DESK</span>
          </div>

        </aside>

        {/* =========================================
            RIGHT LOGIN PANEL
        ========================================= */}
        <section className="student-login-panel">

          {/* MOBILE BRANDING */}
          <div className="student-mobile-brand">

            <div className="student-mobile-logo">
              <GraduationCap size={24} />
            </div>

            <div>
              <strong>
                STG COLLEGE
              </strong>

              <span>
                PRE UNIVERSITY
              </span>
            </div>

          </div>

          {/* HEADER */}
          <div className="student-login-header">

            <span className="student-welcome">
              WELCOME BACK
            </span>

            <h1>
              STUDENT LOGIN
            </h1>

            <p>
              Sign in using your Student ID
              to continue your academic journey.
            </p>

          </div>

          {/* FORM */}
          <form
            className="student-login-form"
            onSubmit={submit}
            autoComplete="on"
          >

            {/* =========================================
                STUDENT ID
            ========================================= */}
            <div className="student-field">

              <label htmlFor="student-id">
                Student ID
              </label>

              <div className="student-input">

                <UserRound size={18} />

                <input
                  id="student-id"
                  type="text"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(
                      e.target.value.toUpperCase()
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="username"
                  disabled={loading}
                />

              </div>

            </div>

            {/* =========================================
                PASSWORD
            ========================================= */}
            <div className="student-field">

              <label htmlFor="student-password">
                Password
              </label>

              <div className="student-input">

                <KeyRound size={18} />

                <input
                  id="student-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="student-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* =========================================
                FORGOT PASSWORD
            ========================================= */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "-4px",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/forgot-password"
                  )
                }
                disabled={loading}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  padding: 0,
                  fontSize: "13px",
                  color: "#2563eb",
                  fontWeight: 600,
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* =========================================
                ERROR
            ========================================= */}
            {error && (
              <div
                className="student-login-error"
                role="alert"
              >
                <span className="student-error-mark">
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* =========================================
                LOGIN BUTTON
            ========================================= */}
            <button
              type="submit"
              className="student-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="student-spinner" />

                  <span>
                    Authenticating...
                  </span>
                </>
              ) : (
                <>
                  <LockKeyhole
                    size={18}
                  />

                  <span>
                    Secure Login
                  </span>

                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </button>

          </form>

          {/* =========================================
              REGISTER
          ========================================= */}
          <div className="student-register">

            <span>
              New student?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/register"
                )
              }
              disabled={loading}
            >
              Create your account

              <ArrowRight size={14} />
            </button>

          </div>

          {/* =========================================
              SECURITY
          ========================================= */}
          <div className="student-security-note">

            <ShieldCheck size={15} />

            <span>
              Your academic credentials are
              protected with secure authentication.
            </span>

          </div>

          {/* =========================================
              FOOTER
          ========================================= */}
          <div className="student-login-footer">

            <span>
              © 2026 STG NEXUS
            </span>

            <span>
              STG COLLEGE • STUDENT ACCESS
            </span>

          </div>

        </section>

      </section>
    </main>
  );
}