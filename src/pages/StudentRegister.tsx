
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegister.css";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

const OTP_LENGTH = 6;

type RegisterStep = "email" | "form";

export default function StudentRegister() {
  const navigate = useNavigate();

  // ============================================================
  // CURRENT STEP
  // ============================================================

  const [step, setStep] = useState<RegisterStep>("email");

  // ============================================================
  // REGISTRATION FORM
  // ============================================================

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // ============================================================
  // OTP
  // ============================================================

  const [otpBoxes, setOtpBoxes] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // ============================================================
  // SUCCESS
  // ============================================================

  const [showSuccess, setShowSuccess] = useState(false);

  // ============================================================
  // LOADING
  // ============================================================

  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // MESSAGES
  // ============================================================

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ============================================================
  // OTP INPUT REFS
  // ============================================================

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otp = otpBoxes.join("");

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
  // OTP AUTO FOCUS
  // ============================================================

  useEffect(() => {
    if (step === "email" && otpSent && !emailVerified) {
      const timer = setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [step, otpSent, emailVerified]);

  // ============================================================
  // SEND OTP
  // ============================================================

  const sendOtp = async () => {
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your Gmail address.");
      return;
    }

    if (!cleanEmail.endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    try {
      setOtpLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/otp/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json();

      console.log("SEND OTP RESPONSE:", data);

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setEmail(cleanEmail);
      setOtpSent(true);
      setEmailVerified(false);
      setShowSuccess(false);

      setOtpBoxes(Array(OTP_LENGTH).fill(""));

      setMessage(
        `OTP sent successfully to ${cleanEmail}`
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 120);
    } catch (err) {
      console.error("SEND OTP ERROR:", err);

      setError(
        "Server error while sending OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================================
  // OTP INPUT
  // ============================================================

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    const cleanValue = value
      .replace(/\D/g, "")
      .slice(-1);

    const updated = [...otpBoxes];

    updated[index] = cleanValue;

    setOtpBoxes(updated);
    setError("");

    if (
      cleanValue &&
      index < OTP_LENGTH - 1
    ) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ============================================================
  // OTP KEYBOARD
  // ============================================================

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otpBoxes[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      otpRefs.current[index + 1]?.focus();
    }

    if (
      e.key === "Enter" &&
      otp.length === OTP_LENGTH &&
      !verifyLoading
    ) {
      verifyOtp();
    }
  };

  // ============================================================
  // PASTE OTP
  // ============================================================

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const updated = Array(OTP_LENGTH).fill("");

    pasted
      .split("")
      .forEach((digit, index) => {
        updated[index] = digit;
      });

    setOtpBoxes(updated);
    setError("");

    const focusIndex = Math.min(
      pasted.length,
      OTP_LENGTH - 1
    );

    otpRefs.current[focusIndex]?.focus();
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const verifyOtp = async () => {
    setError("");
    setMessage("");

    if (otp.length !== OTP_LENGTH) {
      setError(
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/otp/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "VERIFY OTP RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "OTP verification failed."
        );
        return;
      }

      // ========================================================
      // EMAIL VERIFIED
      // ========================================================

      setEmailVerified(true);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setStep("form");
        setMessage("");
        setError("");
      }, 1500);
    } catch (err) {
      console.error(
        "VERIFY OTP ERROR:",
        err
      );

      setError(
        "Server error while verifying OTP."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  // ============================================================
  // CHANGE GMAIL
  // ============================================================

  const changeEmail = () => {
    setOtpSent(false);
    setEmailVerified(false);
    setOtpBoxes(Array(OTP_LENGTH).fill(""));
    setMessage("");
    setError("");
  };

  // ============================================================
  // CLASS CHANGE
  // ============================================================

  const handleClassChange = (
    value: string
  ) => {
    setClassId(value);
    setSection("");

    if (value === "INTER-FIRST-YEAR") {
      setClassName("1st PUC");
      setAcademicYear("1");
    } else if (
      value === "INTER-SECOND-YEAR"
    ) {
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

    // ========================================================
    // REQUIRED
    // ========================================================

    if (
      !name.trim() ||
      !studentId.trim() ||
      !email.trim() ||
      !mobileNumber.trim() ||
      !password ||
      !classId ||
      !className ||
      !academicYear ||
      !section
    ) {
      setError(
        "Please fill all details including section."
      );
      return;
    }

    // ========================================================
    // EMAIL VERIFIED
    // ========================================================

    if (!emailVerified) {
      setError(
        "Please verify your Gmail first."
      );
      return;
    }

    // ========================================================
    // MOBILE
    // ========================================================

    const cleanMobile = mobileNumber
      .replace(/\D/g, "")
      .trim();

    if (cleanMobile.length !== 10) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // ========================================================
    // STUDENT ID
    // ========================================================

    const cleanStudentId = studentId
      .trim()
      .toUpperCase();

    if (cleanStudentId.length < 3) {
      setError(
        "Please enter a valid Student ID."
      );
      return;
    }

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

            email:
              email.trim().toLowerCase(),

            mobileNumber:
              cleanMobile,

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

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Registration failed."
        );
        return;
      }

      alert(
        `Registration Successful!\nStudent ID: ${data.student.studentId}`
      );

      // ========================================================
      // RESET
      // ========================================================

      setName("");
      setStudentId("");
      setEmail("");
      setMobileNumber("");
      setPassword("");

      setClassId("");
      setClassName("");
      setSection("");
      setAcademicYear("");

      setOtpBoxes(
        Array(OTP_LENGTH).fill("")
      );

      setOtpSent(false);
      setEmailVerified(false);
      setShowSuccess(false);
      setStep("email");

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

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="student-register-page">

      {/* BACKGROUND */}

      <div className="register-orb register-orb-one" />
      <div className="register-orb register-orb-two" />
      <div className="register-grid" />

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="student-register-card">

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="stg-register-logo">
          STG
        </div>

        <div className="register-secure-badge">
          <span />
          SECURE STUDENT REGISTRATION
        </div>

        {/* ====================================================
            STEP 1 — GMAIL + OTP
        ==================================================== */}

        {step === "email" &&
          !showSuccess && (
            <div className="register-step">

              <h1>
                Verify Your{" "}
                <strong>Gmail</strong>
              </h1>

              <p className="register-description">
                Verify your Gmail first.
                After successful verification,
                your student registration form
                will appear.
              </p>

              {/* GMAIL INPUT */}

              <div className="register-email-wrap">

                <span className="email-symbol">
                  @
                </span>

                <input
                  type="email"
                  placeholder="Enter your Gmail"
                  value={email}
                  onChange={(e) => {
                    setEmail(
                      e.target.value
                    );
                    setError("");
                    setMessage("");
                  }}
                  disabled={
                    otpLoading ||
                    verifyLoading
                  }
                />

              </div>

              {/* SEND OTP */}

              {!otpSent && (
                <button
                  type="button"
                  className="register-main-button"
                  onClick={sendOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <>
                      <span className="button-loader" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <span>→</span>
                    </>
                  )}
                </button>
              )}

              {/* =================================================
                  OTP AREA
              ================================================= */}

              {otpSent && (
                <div className="otp-area">

                  <div className="otp-top-line">
                    <span>
                      Verification Code
                    </span>

                    <small>
                      6 DIGITS
                    </small>
                  </div>

                  <p className="otp-sent-text">
                    OTP sent to{" "}
                    <strong>
                      {email}
                    </strong>
                  </p>

                  {/* SIX OTP BOXES */}

                  <div className="otp-box-container">

                    {otpBoxes.map(
                      (
                        digit,
                        index
                      ) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpRefs.current[
                              index
                            ] = element;
                          }}
                          className={
                            digit
                              ? "otp-box otp-filled"
                              : "otp-box"
                          }
                          type="text"
                          inputMode="numeric"
                          autoComplete={
                            index === 0
                              ? "one-time-code"
                              : "off"
                          }
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(
                              index,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(
                              index,
                              e
                            )
                          }
                          onPaste={
                            handleOtpPaste
                          }
                          disabled={
                            verifyLoading
                          }
                        />
                      )
                    )}

                  </div>

                  {/* PROGRESS */}

                  <div className="otp-progress">
                    <div
                      style={{
                        width: `${
                          (otp.length /
                            OTP_LENGTH) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* MESSAGE */}

                  {message && (
                    <div className="register-message register-info">
                      <span>✓</span>
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="register-message register-error">
                      <span>!</span>
                      {error}
                    </div>
                  )}

                  {/* VERIFY */}

                  <button
                    type="button"
                    className="register-main-button"
                    onClick={verifyOtp}
                    disabled={
                      verifyLoading ||
                      otp.length !==
                        OTP_LENGTH
                    }
                  >
                    {verifyLoading ? (
                      <>
                        <span className="button-loader" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Gmail
                        <span>✓</span>
                      </>
                    )}
                  </button>

                  {/* RESEND */}

                  <button
                    type="button"
                    className="text-action-button"
                    onClick={sendOtp}
                    disabled={
                      otpLoading ||
                      verifyLoading
                    }
                  >
                    {otpLoading
                      ? "Sending..."
                      : "Resend OTP"}
                  </button>

                  {/* CHANGE EMAIL */}

                  <button
                    type="button"
                    className="change-email-action"
                    onClick={changeEmail}
                    disabled={
                      otpLoading ||
                      verifyLoading
                    }
                  >
                    ← Change Gmail
                  </button>

                </div>
              )}

              {/* ERROR BEFORE OTP */}

              {!otpSent && error && (
                <div className="register-message register-error">
                  <span>!</span>
                  {error}
                </div>
              )}

            </div>
          )}

        {/* ======================================================
            SUCCESS ANIMATION
        ====================================================== */}

        {showSuccess && (
          <div className="email-success-screen">

            <div className="success-ring-outer">

              <div className="success-ring-middle">

                <div className="success-ring-inner">
                  ✓
                </div>

              </div>

            </div>

            <div className="success-dot success-dot-one" />
            <div className="success-dot success-dot-two" />
            <div className="success-dot success-dot-three" />

            <h1>
              Gmail{" "}
              <strong>
                Verified!
              </strong>
            </h1>

            <p>
              Email verification successful
            </p>

            <div className="success-email">
              ✓ {email}
            </div>

            <div className="continue-line">
              <span />
              Opening registration form...
            </div>

          </div>
        )}

        {/* ======================================================
            STEP 2 — REGISTRATION FORM
        ====================================================== */}

        {step === "form" && (
          <div className="register-form-step">

            {/* VERIFIED EMAIL HEADER */}

            <div className="verified-header">

              <div className="verified-mini-icon">
                ✓
              </div>

              <div className="verified-content">
                <div className="verified-title">
                  Gmail Verified
                </div>

                <div className="verified-email">
                  {email}
                </div>
              </div>

              <span className="verified-check">
                ✓
              </span>

            </div>

            <h1 className="registration-heading">
              Student{" "}
              <strong>
                Details
              </strong>
            </h1>

            <p className="register-description">
              Complete your student details
              to create your STG College account.
            </p>

            {error && (
              <div className="register-message register-error">
                <span>!</span>
                {error}
              </div>
            )}

            <form onSubmit={registerStudent}>

              {/* NAME */}

              <div className="register-field">
                <label>
                  Student Name
                </label>

                <input
                  type="text"
                  placeholder="Enter student name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />
              </div>

              {/* STUDENT ID */}

              <div className="register-field">
                <label>
                  Student ID
                </label>

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

                <small>
                  Enter the Student ID shown
                  on your Student ID Card.
                </small>
              </div>

              {/* MOBILE */}

              <div className="register-field">
                <label>
                  Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
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
                />
              </div>

              {/* PASSWORD */}

              <div className="register-field">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />
              </div>

              {/* CLASS */}

              <div className="register-field">
                <label>
                  Class
                </label>

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
                    Select Class
                  </option>

                  <option value="INTER-FIRST-YEAR">
                    1st PUC
                  </option>

                  <option value="INTER-SECOND-YEAR">
                    2nd PUC
                  </option>
                </select>
              </div>

              {/* SECTION */}

              {classId && (
                <div className="register-field">
                  <label>
                    Section
                  </label>

                  <select
                    value={section}
                    onChange={(e) =>
                      setSection(
                        e.target.value
                      )
                    }
                    disabled={loading}
                  >
                    <option value="">
                      Select Section
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
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="register-main-button register-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-loader" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Student Account
                    <span>✓</span>
                  </>
                )}
              </button>

            </form>

          </div>
        )}

        {/* FOOTER */}

        <div className="register-footer">
          <span>STG COLLEGE</span>
          <b>•</b>
          SECURE STUDENT PORTAL
        </div>

      </div>
    </div>
  );
}

