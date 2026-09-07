
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "./StudentForgotPassword.css";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

const OTP_LENGTH = 6;

type ForgotStep =
  | "studentId"
  | "otp"
  | "password"
  | "success";

export default function StudentForgotPassword() {
  const navigate = useNavigate();

  // ============================================================
  // STEP
  // ============================================================

  const [step, setStep] =
    useState<ForgotStep>("studentId");

  // ============================================================
  // STUDENT ID
  // ============================================================

  const [studentId, setStudentId] =
    useState("");

  // ============================================================
  // REGISTERED EMAIL
  // FULL EMAIL DISPLAY
  // ============================================================

  const [registeredEmail, setRegisteredEmail] =
    useState("");

  // ============================================================
  // EMAIL HINT
  // ============================================================

  const [emailHint, setEmailHint] =
    useState("");

  // ============================================================
  // OTP
  // ============================================================

  const [otpBoxes, setOtpBoxes] =
    useState<string[]>(
      Array(OTP_LENGTH).fill("")
    );

  const otpRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  // ============================================================
  // PASSWORD
  // ============================================================

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // ERROR
  // ============================================================

  const [error, setError] =
    useState("");

  // ============================================================
  // SUCCESS MESSAGE
  // ============================================================

  const [successMessage, setSuccessMessage] =
    useState("");

  const otp = otpBoxes.join("");

  // ============================================================
  // FOCUS FIRST OTP BOX
  // ============================================================

  useEffect(() => {
    if (step === "otp") {
      const timer = setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // ============================================================
  // SEND RESET OTP
  // ============================================================

  const sendResetOtp = async () => {
    setError("");
    setSuccessMessage("");

    const cleanStudentId =
      studentId
        .trim()
        .toUpperCase();

    if (!cleanStudentId) {
      setError(
        "Please enter your Student ID."
      );
      return;
    }

    if (cleanStudentId.length < 3) {
      setError(
        "Please enter a valid Student ID."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/student/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            studentId:
              cleanStudentId,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "FORGOT PASSWORD RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Unable to send OTP."
        );
        return;
      }

      // ========================================================
      // STORE STUDENT ID
      // ========================================================

      setStudentId(
        cleanStudentId
      );

      // ========================================================
      // STORE FULL REGISTERED EMAIL
      // ========================================================

      setRegisteredEmail(
        data.email || ""
      );

      // ========================================================
      // RESET OTP
      // ========================================================

      setOtpBoxes(
        Array(OTP_LENGTH).fill("")
      );

      // ========================================================
      // MESSAGE
      // ========================================================

      setEmailHint(
        "A 6-digit verification code has been sent to your registered Gmail."
      );

      // ========================================================
      // GO OTP STEP
      // ========================================================

      setStep("otp");

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 120);
    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OTP CHANGE
  // ============================================================

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    const digit = value
      .replace(/\D/g, "")
      .slice(-1);

    const updated = [...otpBoxes];

    updated[index] = digit;

    setOtpBoxes(updated);

    setError("");

    if (
      digit &&
      index < OTP_LENGTH - 1
    ) {
      otpRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // ============================================================
  // OTP KEYBOARD
  // ============================================================

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Backspace" &&
      !otpBoxes[index] &&
      index > 0
    ) {
      otpRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      otpRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      otpRefs.current[
        index + 1
      ]?.focus();
    }

    if (
      event.key === "Enter" &&
      otp.length === OTP_LENGTH &&
      !loading
    ) {
      verifyResetOtp();
    }
  };

  // ============================================================
  // OTP PASTE
  // ============================================================

  const handleOtpPaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const updated =
      Array(OTP_LENGTH).fill("");

    pasted
      .split("")
      .forEach(
        (digit, index) => {
          updated[index] = digit;
        }
      );

    setOtpBoxes(updated);
    setError("");

    const focusIndex =
      Math.min(
        pasted.length,
        OTP_LENGTH - 1
      );

    otpRefs.current[
      focusIndex
    ]?.focus();
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const verifyResetOtp =
    async () => {
      setError("");
      setSuccessMessage("");

      if (
        otp.length !==
        OTP_LENGTH
      ) {
        setError(
          "Please enter the complete 6-digit OTP."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/api/student/verify-reset-otp`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                studentId:
                  studentId
                    .trim()
                    .toUpperCase(),

                otp:
                  otp.trim(),
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "VERIFY RESET OTP RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data.success ||
          !data.otpVerified
        ) {
          setError(
            data.message ||
              "OTP verification failed."
          );
          return;
        }

        setSuccessMessage(
          "OTP verified successfully."
        );

        setStep("password");
      } catch (err) {
        console.error(
          "VERIFY RESET OTP ERROR:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const resetPassword =
    async () => {
      setError("");
      setSuccessMessage("");

      if (!newPassword) {
        setError(
          "Please enter a new password."
        );
        return;
      }

      if (
        newPassword.length < 6
      ) {
        setError(
          "Password must be at least 6 characters."
        );
        return;
      }

      if (!confirmPassword) {
        setError(
          "Please confirm your password."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/api/student/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                studentId:
                  studentId
                    .trim()
                    .toUpperCase(),

                newPassword,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "RESET PASSWORD RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          setError(
            data.message ||
              "Password reset failed."
          );
          return;
        }

        setSuccessMessage(
          "Your password has been updated successfully."
        );

        setNewPassword("");
        setConfirmPassword("");
        setOtpBoxes(
          Array(OTP_LENGTH).fill("")
        );

        setStep("success");
      } catch (err) {
        console.error(
          "RESET PASSWORD ERROR:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // BACK
  // ============================================================

  const goBack = () => {
    if (step === "studentId") {
      navigate("/login");
      return;
    }

    if (step === "otp") {
      setStep("studentId");

      setOtpBoxes(
        Array(OTP_LENGTH).fill("")
      );

      setError("");
      setSuccessMessage("");

      return;
    }

    if (step === "password") {
      setStep("otp");

      setError("");
      setSuccessMessage("");

      return;
    }

    navigate("/login");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="forgot-page">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="forgot-grid" />

      <div className="forgot-orb forgot-orb-one" />

      <div className="forgot-orb forgot-orb-two" />

      <section className="forgot-shell">

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="forgot-brand">

          <div className="forgot-logo">
            STG
          </div>

          <div>
            <span>
              STG COLLEGE
            </span>

            <small>
              STUDENT PORTAL
            </small>
          </div>

        </div>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        {step !== "success" && (
          <div className="forgot-progress">

            <div
              className={
                step === "studentId"
                  ? "active"
                  : "done"
              }
            >
              1
            </div>

            <span />

            <div
              className={
                step === "otp"
                  ? "active"
                  : step === "password"
                  ? "done"
                  : ""
              }
            >
              2
            </div>

            <span />

            <div
              className={
                step === "password"
                  ? "active"
                  : ""
              }
            >
              3
            </div>

          </div>
        )}

        {/* ====================================================
            STEP 1 — STUDENT ID
        ==================================================== */}

        {step === "studentId" && (
          <div className="forgot-step">

            <div className="forgot-step-icon">
              <UserRound size={25} />
            </div>

            <span className="forgot-eyebrow">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Forgot Your
              <strong>
                {" "}Password?
              </strong>
            </h1>

            <p>
              Enter your Student ID.
              We will send a secure OTP
              to your registered Gmail.
            </p>

            <div className="forgot-field">

              <label>
                Student ID
              </label>

              <div className="forgot-input">

                <UserRound size={18} />

                <input
                  type="text"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(
                      e.target.value.toUpperCase()
                    );

                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      sendResetOtp();
                    }
                  }}
                  disabled={loading}
                />

              </div>

            </div>

            {error && (
              <div className="forgot-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="button"
              className="forgot-primary-button"
              onClick={sendResetOtp}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="forgot-spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="forgot-back-button"
              onClick={goBack}
              disabled={loading}
            >
              <ArrowLeft size={15} />
              Back to Login
            </button>

          </div>
        )}

        {/* ====================================================
            STEP 2 — OTP
        ==================================================== */}

        {step === "otp" && (
          <div className="forgot-step">

            <div className="forgot-step-icon">
              <MailCheck size={25} />
            </div>

            <span className="forgot-eyebrow">
              EMAIL VERIFICATION
            </span>

            <h1>
              Verify Your
              <strong>
                {" "}Gmail
              </strong>
            </h1>

            <p>
              {emailHint}

              {/* FULL REGISTERED EMAIL */}

              {registeredEmail && (
                <strong className="forgot-registered-email">
                  {registeredEmail}
                </strong>
              )}
            </p>

            <div className="forgot-otp-label">

              <span>
                ENTER 6-DIGIT OTP
              </span>

              <small>
                SECURE CODE
              </small>

            </div>

            {/* OTP BOXES */}

            <div className="forgot-otp-boxes">

              {otpBoxes.map(
                (
                  digit,
                  index
                ) => (
                  <input
                    key={index}

                    ref={(el) => {
                      otpRefs.current[
                        index
                      ] = el;
                    }}

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

                    disabled={loading}

                    className={
                      digit
                        ? "forgot-otp-box filled"
                        : "forgot-otp-box"
                    }
                  />
                )
              )}

            </div>

            {/* OTP PROGRESS */}

            <div className="forgot-otp-progress">

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

            {error && (
              <div className="forgot-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="button"
              className="forgot-primary-button"
              onClick={
                verifyResetOtp
              }
              disabled={
                loading ||
                otp.length !==
                  OTP_LENGTH
              }
            >
              {loading ? (
                <>
                  <span className="forgot-spinner" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="forgot-secondary-button"
              onClick={
                sendResetOtp
              }
              disabled={loading}
            >
              Resend OTP
            </button>

            <button
              type="button"
              className="forgot-back-button"
              onClick={goBack}
              disabled={loading}
            >
              <ArrowLeft size={15} />
              Change Student ID
            </button>

          </div>
        )}

        {/* ====================================================
            STEP 3 — NEW PASSWORD
        ==================================================== */}

        {step === "password" && (
          <div className="forgot-step">

            <div className="forgot-step-icon verified">
              <ShieldCheck size={25} />
            </div>

            <span className="forgot-eyebrow">
              IDENTITY VERIFIED
            </span>

            <h1>
              Create New
              <strong>
                {" "}Password
              </strong>
            </h1>

            <p>
              Your OTP has been verified.
              Create a new secure password
              for your student account.
            </p>

            {/* NEW PASSWORD */}

            <div className="forgot-field">

              <label>
                New Password
              </label>

              <div className="forgot-input">

                <LockKeyhole size={18} />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="forgot-eye-button"
                  onClick={() =>
                    setShowNewPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="forgot-field">

              <label>
                Confirm Password
              </label>

              <div className="forgot-input">

                <KeyRound size={18} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="forgot-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            <div className="forgot-password-hint">
              <span />
              Password must contain at least
              6 characters.
            </div>

            {successMessage && (
              <div className="forgot-success-message">
                <CheckCircle2 size={15} />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="forgot-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="button"
              className="forgot-primary-button"
              onClick={
                resetPassword
              }
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="forgot-spinner" />
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="forgot-back-button"
              onClick={goBack}
              disabled={loading}
            >
              <ArrowLeft size={15} />
              Back to OTP
            </button>

          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {step === "success" && (
          <div className="forgot-success-screen">

            <div className="forgot-success-ring">

              <div>
                ✓
              </div>

            </div>

            <span className="forgot-eyebrow">
              PASSWORD UPDATED
            </span>

            <h1>
              Password
              <strong>
                {" "}Updated!
              </strong>
            </h1>

            <p>
              Your student account password
              has been successfully changed.
            </p>

            <div className="forgot-success-card">

              <CheckCircle2 size={18} />

              <div>

                <strong>
                  Account Secured
                </strong>

                <span>
                  You can now login with
                  your new password.
                </span>

              </div>

            </div>

            <button
              type="button"
              className="forgot-primary-button"
              onClick={() =>
                navigate("/login")
              }
            >
              Go to Login
              <ArrowRight size={18} />
            </button>

          </div>
        )}

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="forgot-footer">

          <span>
            <ShieldCheck size={13} />
            SECURE ACCOUNT RECOVERY
          </span>

          <b>•</b>

          <span>
            STG COLLEGE
          </span>

        </div>

      </section>
    </main>
  );
}

