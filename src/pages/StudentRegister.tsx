import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  
  UserRound,
} from "lucide-react";
import "./StudentRegister.css";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

export default function StudentRegister() {
  const navigate = useNavigate();

  // ============================================================
  // PERSONAL DETAILS
  // ============================================================

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // ============================================================
  // PASSWORD
  // ============================================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // ACADEMIC DETAILS
  // ============================================================

  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // SECTIONS
  // ============================================================

  const getSections = () => {
    if (classId === "INTER-FIRST-YEAR") {
      return [
        "J1",
        "J2",
        "J3",
        "J4",
        "J5",
        "J6",
        "J7",
        "J8",
        "J9",
        "J10",
      ];
    }

    if (classId === "INTER-SECOND-YEAR") {
      return [
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
        "S6",
        "S7",
        "S8",
        "S9",
        "S10",
      ];
    }

    return [];
  };

  // ============================================================
  // CLASS CHANGE
  // ============================================================

  const handleClassChange = (value: string) => {
    setClassId(value);
    setSection("");

    if (value === "INTER-FIRST-YEAR") {
      setClassName("1st PUC");
      setAcademicYear("1");
    } else if (value === "INTER-SECOND-YEAR") {
      setClassName("2nd PUC");
      setAcademicYear("2");
    } else {
      setClassName("");
      setAcademicYear("");
    }
  };

  // ============================================================
  // REGISTER STUDENT
  // ============================================================

  const registerStudent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (
      !name.trim() ||
      !studentId.trim() ||
      !email.trim() ||
      !mobileNumber.trim() ||
      !password ||
      !confirmPassword ||
      !classId ||
      !className ||
      !academicYear ||
      !section
    ) {
      setError("Please complete all registration details.");
      return;
    }

    // ----------------------------------------------------------
    // PASSWORD MATCH
    // ----------------------------------------------------------

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    // ----------------------------------------------------------
    // MOBILE VALIDATION
    // ----------------------------------------------------------

    const cleanMobile = mobileNumber
      .replace(/\D/g, "")
      .trim();

    if (cleanMobile.length !== 10) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // ----------------------------------------------------------
    // STUDENT ID VALIDATION
    // ----------------------------------------------------------

    const cleanStudentId = studentId
      .trim()
      .toUpperCase();

    if (cleanStudentId.length < 3) {
      setError("Please enter a valid Student ID.");
      return;
    }

    // ----------------------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------------------

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // ----------------------------------------------------------
    // API
    // ----------------------------------------------------------

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/student/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            studentId: cleanStudentId,

            email: cleanEmail,

            mobileNumber: cleanMobile,

            password,

            classId,

            className,

            academicYear,

            section,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      // --------------------------------------------------------
      // API ERROR
      // --------------------------------------------------------

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Registration failed. Student ID, Email or Mobile might already exist."
        );

        return;
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      alert(
        `Registration Successful!\nStudent ID: ${data.student.studentId}`
      );

      // --------------------------------------------------------
      // RESET
      // --------------------------------------------------------

      setName("");
      setStudentId("");
      setEmail("");
      setMobileNumber("");

      setPassword("");
      setConfirmPassword("");

      setShowPassword(false);
      setShowConfirmPassword(false);

      setClassId("");
      setClassName("");
      setSection("");
      setAcademicYear("");

      // --------------------------------------------------------
      // LOGIN
      // --------------------------------------------------------

      navigate("/login");
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        "Server error during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-register-page">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="student-orb student-orb-one" />

      <div className="student-orb student-orb-two" />

      <div className="student-grid" />

      {/* =====================================================
          MAIN SHELL
      ===================================================== */}

      <div className="student-register-shell">

        {/* ===================================================
            LEFT — STUDENT WELCOME PANEL
        =================================================== */}

        <section className="student-welcome-panel">

          {/* BRAND */}

          <div className="student-brand">

            <div className="student-brand-mark">
              <GraduationCap
                size={25}
                strokeWidth={2.1}
              />
            </div>

            <div>
              <strong>ExamMaster</strong>

              <span>
                STG PU COLLEGE
              </span>
            </div>

          </div>

          {/* BACK */}

          <button
            type="button"
            className="student-back-button"
            onClick={() =>
              navigate("/login")
            }
          >
            <ArrowRight
              size={15}
              className="back-arrow"
            />

            Back to Login
          </button>

          {/* WELCOME */}

          <div className="student-welcome-copy">

            <div className="student-eyebrow">
             

              STUDENT PORTAL
            </div>

            <h1>
              Begin your

              <span>
                academic journey.
              </span>
            </h1>

            <p>
              Create your student account and
              unlock a smarter way to prepare,
              practice and perform with
              ExamMaster.
            </p>

          </div>

          {/* FEATURES */}

          <div className="student-feature-list">

            {/* FEATURE 1 */}

            <div className="student-feature">

              <span className="feature-icon">
                <BookOpen size={16} />
              </span>

              <div>
                <strong>
                  Smart Examination
                </strong>

                <span>
                  Practice and manage your
                  assessments in one place.
                </span>
              </div>

            </div>

            {/* FEATURE 2 */}

            <div className="student-feature">

              <span className="feature-icon">
                <ShieldCheck size={16} />
              </span>

              <div>
                <strong>
                  Secure Student Access
                </strong>

                <span>
                  Your academic account stays
                  protected and personalized.
                </span>
              </div>

            </div>

            {/* FEATURE 3 */}

            <div className="student-feature">

              <span className="feature-icon">
                <GraduationCap size={16} />
              </span>

              <div>
                <strong>
                  Built for STG Students
                </strong>

                <span>
                  Designed around your PUC
                  learning experience.
                </span>
              </div>

            </div>

          </div>

          {/* BOTTOM */}

          <div className="student-welcome-bottom">

            <span>
              STG PU COLLEGE
            </span>

            <div className="welcome-line" />

            <span>
              SMART EXAMINATION PLATFORM
            </span>

          </div>

        </section>

        {/* ===================================================
            RIGHT — REGISTRATION PANEL
        =================================================== */}

        <section className="student-form-panel">

          {/* HEADER */}

          <div className="student-form-header">

            <div className="student-form-label">
              ACCOUNT SETUP
            </div>

            <h2>
              Student

              <span>
                Registration
              </span>
            </h2>

            <p>
              Enter your personal and academic
              details to create your ExamMaster
              account.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="student-error">

              <span className="error-mark">
                !
              </span>

              <div>
                <strong>
                  Registration issue
                </strong>

                <span>
                  {error}
                </span>
              </div>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="student-register-form"
            onSubmit={registerStudent}
          >

            {/* =================================================
                01 PERSONAL DETAILS
            ================================================= */}

            <div className="student-form-section">

              <div className="section-label">
                <span>01</span>

                PERSONAL DETAILS
              </div>

              <div className="student-fields-grid">

                {/* NAME */}

                <div className="student-field">

                  <label>
                    Student Name
                  </label>

                  <div className="student-input">

                    <UserRound
                      size={16}
                    />

                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      disabled={loading}
                      autoComplete="name"
                    />

                  </div>

                </div>

                {/* STUDENT ID */}

                <div className="student-field">

                  <label>
                    Student ID
                  </label>

                  <div className="student-input">

                    <GraduationCap
                      size={16}
                    />

                    <input
                      type="text"
                      placeholder="Enter Student ID"
                      value={studentId}
                      onChange={(e) =>
                        setStudentId(
                          e.target.value.toUpperCase()
                        )
                      }
                      disabled={loading}
                    />

                  </div>

                  <small>
                    Student ID must be unique.
                  </small>

                </div>

                {/* EMAIL */}

                <div className="student-field">

                  <label>
                    Email Address
                  </label>

                  <div className="student-input">

                    <Mail size={16} />

                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      disabled={loading}
                      autoComplete="email"
                    />

                  </div>

                </div>

                {/* MOBILE */}

                <div className="student-field">

                  <label>
                    Mobile Number
                  </label>

                  <div className="student-input">

                    <Phone size={16} />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      disabled={loading}
                      autoComplete="tel"
                    />

                  </div>

                </div>

              </div>
            </div>

            {/* =================================================
                02 ACADEMIC DETAILS
            ================================================= */}

            <div className="student-form-section">

              <div className="section-label">
                <span>02</span>

                ACADEMIC DETAILS
              </div>

              <div className="student-fields-grid">

                {/* CLASS */}

                <div className="student-field">

                  <label>
                    Class
                  </label>

                  <div className="student-select">

                    <GraduationCap
                      size={16}
                    />

                    <select
                      value={classId}
                      onChange={(e) =>
                        handleClassChange(
                          e.target.value
                        )
                      }
                      disabled={loading}
                    >
                      <option value="">
                        Select class
                      </option>

                      <option value="INTER-FIRST-YEAR">
                        1st PUC
                      </option>

                      <option value="INTER-SECOND-YEAR">
                        2nd PUC
                      </option>
                    </select>

                  </div>

                </div>

                {/* SECTION */}

                <div className="student-field">

                  <label>
                    Section
                  </label>

                  <div className="student-select">

                    <BookOpen
                      size={16}
                    />

                    <select
                      value={section}
                      onChange={(e) =>
                        setSection(
                          e.target.value
                        )
                      }
                      disabled={
                        loading ||
                        !classId
                      }
                    >
                      <option value="">
                        {classId
                          ? "Select section"
                          : "Choose class first"}
                      </option>

                      {getSections().map(
                        (sec) => (
                          <option
                            key={sec}
                            value={sec}
                          >
                            {sec}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

              </div>
            </div>

            {/* =================================================
                03 ACCOUNT SECURITY
            ================================================= */}

            <div className="student-form-section">

              <div className="section-label">
                <span>03</span>

                ACCOUNT SECURITY
              </div>

              <div className="student-fields-grid">

                {/* PASSWORD */}

                <div className="student-field">

                  <label>
                    Password
                  </label>

                  <div className="student-input password-input-shell">

                    <LockKeyhole
                      size={16}
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      disabled={loading}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="student-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="student-field">

                  <label>
                    Confirm Password
                  </label>

                  <div className="student-input password-input-shell">

                    <LockKeyhole
                      size={16}
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      disabled={loading}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="student-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>

              </div>
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="student-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="student-loader" />

                  Creating Account...
                </>
              ) : (
                <>
                  Create Student Account

                  <span className="submit-icon">
                    <Check size={15} />
                  </span>
                </>
              )}
            </button>

            {/* LOGIN */}

            <div className="student-login-note">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
              >
                Sign in
              </button>

            </div>

          </form>
        </section>
      </div>
    </div>
  );
}