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
  Sparkles,
  UserRound,
} from "lucide-react";

import { loginStudent } from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginStudent({
        email: cleanEmail,
        password,
      });

      if (data?.success && data?.token) {
        // =========================================
        // CLEAR OLD MANAGEMENT / STAFF SESSION
        // =========================================

        localStorage.removeItem("teacher");
        localStorage.removeItem("teacherToken");

        localStorage.removeItem("staff");
        localStorage.removeItem("staffToken");

        // =========================================
        // SAVE STUDENT TOKEN
        // =========================================

        localStorage.setItem("token", data.token);
        localStorage.setItem("studentToken", data.token);

        // =========================================
        // SAVE ROLE
        // =========================================

        localStorage.setItem("role", "student");

        // =========================================
        // SAVE STUDENT DATA
        // =========================================

        if (data.student) {
          localStorage.setItem(
            "student",
            JSON.stringify(data.student)
          );

          if (data.student.studentId) {
            localStorage.setItem(
              "studentId",
              data.student.studentId
            );
          }
        }

        // =========================================
        // STUDENT DASHBOARD
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
      console.error("Student login error:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Background */}
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

              <h2>PRE-UNIVERSITY</h2>
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
              Access examinations, results, academic
              progress and your complete student
              learning experience from one secure
              platform.
            </p>
          </div>

          {/* Security */}
          <div className="student-security">
            <div className="student-security-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Secure Student Access</strong>

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
          {/* Mobile Branding */}
          <div className="student-mobile-brand">
            <div className="student-mobile-logo">
              <GraduationCap size={24} />
            </div>

            <div>
              <strong>STG COLLEGE</strong>
              <span>PRE UNIVERSITY</span>
            </div>
          </div>

          {/* Header */}
          <div className="student-login-header">
            <span className="student-welcome">
              WELCOME BACK
            </span>

            <h1>STUDENT LOGIN</h1>

            <p>
              Sign in to continue your academic journey.
            </p>
          </div>

          {/* Form */}
          <form
            className="student-login-form"
            onSubmit={submit}
            autoComplete="on"
          >
            {/* Email */}
            <div className="student-field">
              <label htmlFor="student-email">
                Email Address
              </label>

              <div className="student-input">
                <UserRound size={18} />

                <input
                  id="student-email"
                  type="email"
                  placeholder="Enter your Gmail address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
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
                    setPassword(e.target.value);

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
                    setShowPassword((prev) => !prev)
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

            {/* Error */}
            {error && (
              <div
                className="student-login-error"
                role="alert"
              >
                <span className="student-error-mark">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
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

          {/* Register */}
          <div className="student-register">
            <span>New student?</span>

            <button
              type="button"
              onClick={() =>
                navigate("/student/register")
              }
              disabled={loading}
            >
              Create your account
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Security */}
          <div className="student-security-note">
            <ShieldCheck size={15} />

            <span>
              Your academic credentials are protected
              with secure authentication.
            </span>
          </div>

          {/* Footer */}
          <div className="student-login-footer">
            <span>© 2026 STG NEXUS</span>

            <span>
              STG COLLEGE • STUDENT ACCESS
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}