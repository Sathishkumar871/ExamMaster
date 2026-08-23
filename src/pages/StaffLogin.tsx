import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  LockKeyhole,
} from "lucide-react";
import "./StaffLogin.css";

const API_URL =
  "https://exammaster-backend-up1y.onrender.com/api/staff/login";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginStaff = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    if (!cleanEmail || !cleanMobile) {
      setError("Please enter your email and mobile number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "omit", // CORS సమస్యను నివారించడానికి 'include' బదులుగా 'omit' వాడాలి
        signal: controller.signal,
        body: JSON.stringify({
          email: cleanEmail,
          mobile: cleanMobile,
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
            "Staff authentication failed. Please verify your details."
        );
        return;
      }

      /* =========================================
         CLEAR OTHER SESSIONS
      ========================================= */

      localStorage.removeItem("teacher");
      localStorage.removeItem("teacherToken");

      localStorage.removeItem("student");
      localStorage.removeItem("studentToken");
      localStorage.removeItem("studentId");

      /* =========================================
         SAVE STAFF SESSION
      ========================================= */

      if (data.token) {
        localStorage.setItem("staffToken", data.token);
      }

      if (data.staff) {
        localStorage.setItem(
          "staff",
          JSON.stringify(data.staff)
        );
      }

      localStorage.setItem("role", "staff");

      /* =========================================
         STAFF DASHBOARD
      ========================================= */

      navigate("/mentor/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError(
          "Server is taking too long to respond. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <main className="staff-login-page">
      {/* BACKGROUND */}
      <div className="staff-grid" />
      <div className="staff-orb staff-orb-one" />
      <div className="staff-orb staff-orb-two" />

      <section className="staff-login-shell">
        {/* =========================================
            LEFT BRAND PANEL
        ========================================= */}

        <aside className="staff-brand-panel">
          <div className="staff-brand-glow" />

          <div className="staff-brand-top">
            <div className="staff-brand-logo">
              <GraduationCap
                size={28}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <span className="staff-brand-mini">
                STG COLLEGE
              </span>

              <h2>ACADEMIC STAFF</h2>
            </div>
          </div>

          <div className="staff-brand-content">
            <span className="staff-brand-pill">
              Faculty Access
            </span>

            <h1>
              Empower
              <span> Every </span>
              Student.
            </h1>

            <p>
              Access your academic workspace, mentor
              dashboard, student performance and
              institutional resources through one secure
              environment.
            </p>
          </div>

          {/* SECURITY */}
          <div className="staff-security">
            <div className="staff-security-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Protected Staff Access</strong>

              <span>
                Secure academic environment
              </span>
            </div>
          </div>

          <div className="staff-brand-footer">
            <span>ACADEMIC STAFF</span>

            <span className="staff-footer-dot" />

            <span>AUTHORIZED ACCESS</span>
          </div>
        </aside>

        {/* =========================================
            RIGHT LOGIN PANEL
        ========================================= */}

        <section className="staff-form-panel">
          {/* MOBILE BRAND */}
          <div className="staff-mobile-brand">
            <div className="staff-mobile-logo">
              <GraduationCap size={24} />
            </div>

            <div>
              <strong>STG COLLEGE </strong>
              <span>PRE UNIVERSITY</span>
            </div>
          </div>

          {/* HEADER */}
          <div className="staff-login-header">
            <span className="staff-welcome">
              WELCOME BACK
            </span>

            <h1>MENTOR LOGIN </h1>

            <p>
              Sign in to continue to your academic
              workspace.
            </p>
          </div>

          {/* STAFF BADGE */}
          <div className="staff-access-badge">
            <div className="staff-access-icon">
              <ShieldCheck size={16} />
            </div>

            <div>
              <strong>Academic Staff</strong>
              <span>Authorized personnel only</span>
            </div>
          </div>

          {/* FORM */}
          <form
            className="staff-login-form"
            onSubmit={loginStaff}
            autoComplete="on"
          >
            {/* EMAIL */}
            <div className="staff-field">
              <label htmlFor="staff-email">
                Email Address
              </label>

              <div className="staff-input">
                <Mail size={18} />

                <input
                  id="staff-email"
                  type="email"
                  placeholder="Enter your email address"
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

            {/* MOBILE */}
            <div className="staff-field">
              <label htmlFor="staff-mobile">
                Mobile Number
              </label>

              <div className="staff-input">
                <Phone size={18} />

                <input
                  id="staff-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setMobile(value);

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="staff-login-error"
                role="alert"
              >
                <span className="staff-error-mark">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* LOGIN */}
            <button
              type="submit"
              className="staff-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="staff-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  <span>Secure Staff Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}
          <div className="staff-register">
            <span>New staff member?</span>

            <button
              type="button"
              onClick={() =>
                navigate("/staff/register")
              }
              disabled={loading}
            >
              Register Here
              <ArrowRight size={14} />
            </button>
          </div>

          {/* SECURITY NOTE */}
          <div className="staff-security-note">
            <ShieldCheck size={15} />

            <span>
              Your staff credentials are protected with
              secure authentication.
            </span>
          </div>

          {/* BACK */}
          <button
            type="button"
            className="staff-back-button"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          {/* FOOTER */}
          <div className="staff-login-footer">
            <span>© 2026</span>

            <span>
              ACADEMIC STAFF • AUTHORIZED ACCESS
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}