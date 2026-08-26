
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import "./DailyTest.css";
import TestInterface from "../components/TestInterface";

// ======================================================
// API BASE URL
// ======================================================
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

// ======================================================
// QUESTION TYPE
// ======================================================

interface Question {
  _id: string;

  questionText?: string;
  question?: string;

  options: string[];

  correctAnswer: string;

  isPublished?: boolean;
  status?: string;

  examType?: string;
  testCategory?: string;

  className?: string;
  class?: string;

  subject?: string;
  chapter?: string;
}

// ======================================================
// PAGE STATES
// ======================================================

type PageStep =
  | "dashboard"
  | "loading"
  | "exam";

// ======================================================
// COMPONENT
// ======================================================

export default function DailyTests() {
  const navigate = useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [step, setStep] =
    useState<PageStep>("dashboard");

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // STUDENT DETAILS
  // ====================================================

  const [studentName, setStudentName] =
    useState("Student");

  const [studentId, setStudentId] =
    useState("");

  const [className, setClassName] =
    useState("2nd PUC");

  // ====================================================
  // INITIAL ANSWERS
  // ====================================================

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  // ====================================================
  // LOAD STUDENT DETAILS
  // ====================================================

  useEffect(() => {
    const storedName =
      localStorage.getItem("studentName") ||
      localStorage.getItem("name") ||
      "Student";

    const storedId =
      localStorage.getItem("studentId") ||
      localStorage.getItem("id") ||
      "SEC-2026-X";

    const storedClass =
      localStorage.getItem("className") ||
      localStorage.getItem("class") ||
      "2nd PUC";

    setStudentName(storedName);
    setStudentId(storedId);
    setClassName(storedClass);
  }, []);

  // ====================================================
  // FETCH DAILY TEST QUESTIONS
  // ====================================================

  const fetchDailyTestQuestions = async (
    selectedClass: string
  ): Promise<Question[]> => {
    setLoading(true);
    setError("");

    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams({
        className: selectedClass || "2nd PUC",
      });

      // ==================================================
      // IMPORTANT:
      // API_BASE_URL already contains /api
      // So DO NOT add /api again here.
      // ==================================================

      const response = await fetch(
        `${API_BASE_URL}/questions/daily-tests?${queryParams.toString()}`,
        {
          method: "GET",

          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),

            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load Daily Test questions."
        );
      }

      const loadedQuestions: Question[] =
        data?.questions ??
        data?.data ??
        (Array.isArray(data) ? data : []);

      if (!Array.isArray(loadedQuestions)) {
        throw new Error(
          "Invalid question data received from server."
        );
      }

      // ----------------------------------------------
      // SAVE QUESTIONS
      // ----------------------------------------------

      setQuestions(loadedQuestions);

      localStorage.setItem(
        "dailytest_questions",
        JSON.stringify(loadedQuestions)
      );

      // ----------------------------------------------
      // RESET PREVIOUS ANSWERS
      // ----------------------------------------------

      setAnswers({});

      localStorage.removeItem(
        "dailytest_answers"
      );

      localStorage.removeItem(
        "dailytest_marked"
      );

      // ----------------------------------------------
      // RETURN QUESTIONS
      // ----------------------------------------------

      return loadedQuestions;
    } catch (err: unknown) {
      console.error(
        "Daily Test loading error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Unable to load Daily Test questions.";

      setError(message);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // START DAILY TEST
  // ====================================================

  const handleStartExam = async () => {
    if (loading) return;

    setError("");

    setStep("loading");

    const loadedQuestions =
      await fetchDailyTestQuestions(className);

    if (loadedQuestions.length === 0) {
      setStep("dashboard");
      return;
    }

    // Small transition after successful loading
    setTimeout(() => {
      setStep("exam");
    }, 250);
  };

  // ====================================================
  // BACK FROM TEST INTERFACE
  // ====================================================

  const handleBack = () => {
    setStep("dashboard");

    setQuestions([]);

    setAnswers({});

    setError("");

    localStorage.removeItem(
      "dailytest_questions"
    );

    localStorage.removeItem(
      "dailytest_answers"
    );

    localStorage.removeItem(
      "dailytest_marked"
    );
  };

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry = () => {
    setError("");

    handleStartExam();
  };

  // ====================================================
  // DASHBOARD
  // ====================================================

  if (step === "dashboard") {
    return (
      <div className="exam-page daily-test-page">

        <div className="start-wrapper">

          <div className="start-card">

            {/* ==========================================
                BADGE
            ========================================== */}

            <div className="test-badge">

              <Lock size={14} />

              <span>
                DAILY PRACTICE TEST
              </span>

            </div>

            {/* ==========================================
                TITLE
            ========================================== */}

            <h1>
              Welcome, {studentName}!
            </h1>

            <p className="daily-description">
              Strengthen your preparation with
              today's curated practice assessment.
            </p>

            {/* ==========================================
                STUDENT INFORMATION
            ========================================== */}

            <div className="student-info-card">

              <div className="student-info-row">

                <span>
                  Student ID
                </span>

                <strong>
                  {studentId}
                </strong>

              </div>

              <div className="student-info-row">

                <span>
                  Class
                </span>

                <strong className="class-value">
                  {className || "Not Specified"}
                </strong>

              </div>

              <div className="student-info-row">

                <span>
                  Assessment
                </span>

                <strong>
                  Daily Mixed Question Pool
                </strong>

              </div>

            </div>

            {/* ==========================================
                SECURITY INFORMATION
            ========================================== */}

            <div className="security-info">

              <div className="security-icon">

                <ShieldCheck size={18} />

              </div>

              <div>

                <strong>
                  Secure Academic Assessment
                </strong>

                <span>
                  Your assessment is conducted using
                  STG College academic examination records.
                </span>

              </div>

            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
              <div className="daily-error">

                <strong>
                  Unable to prepare assessment
                </strong>

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={handleRetry}
                >
                  Try Again
                </button>

              </div>
            )}

            {/* ==========================================
                START BUTTON
            ========================================== */}

            <button
              type="button"
              className="start-button"
              onClick={handleStartExam}
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-loader" />

                  Preparing Test...
                </>
              ) : (
                <>
                  Start Daily Test

                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

            {/* ==========================================
                BACK
            ========================================== */}

            <button
              type="button"
              className="dashboard-back-btn"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={15} />

              Back to Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (step === "loading") {
    return (
      <div className="exam-loading daily-loading">

        <div className="loading-content">

          <div className="premium-loader">

            <div className="loader-ring" />

            <ShieldCheck size={25} />

          </div>

          <h2>
            Preparing Your Assessment
          </h2>

          <p>
            Fetching today's curated question set...
          </p>

          <div className="loading-status">

            <span className="status-dot" />

            Securely loading STG College
            academic assessment

          </div>

          {error && (
            <div className="loading-error">

              <strong>
                Unable to prepare assessment
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setStep("dashboard")
                }
              >
                <ArrowLeft size={14} />

                Go Back
              </button>

            </div>
          )}

        </div>

      </div>
    );
  }

  // ====================================================
  // SAFETY CHECK
  // ====================================================

  if (
    step === "exam" &&
    questions.length === 0
  ) {
    return (
      <div className="exam-page">

        <div className="empty-question-wrapper">

          <div className="empty-question-card">

            <div className="empty-icon">

              <RefreshCw size={28} />

            </div>

            <h2>
              No Questions Available
            </h2>

            <p>
              There are currently no Daily Practice
              questions available for{" "}
              <strong>{className}</strong>.
            </p>

            <button
              type="button"
              onClick={() =>
                setStep("dashboard")
              }
            >
              Back to Daily Test
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ====================================================
  // MAIN TEST INTERFACE
  // ====================================================

  return (
    <TestInterface

      subject="Daily Assessment"

      className={className}

      chapterName="Daily Practice Test"

      questions={questions}

      studentId={studentId}

      studentName={studentName}

      themeColor="#db962e"

      onBack={handleBack}

      isAlreadySubmitted={false}

      initialAnswers={answers}
    />
  );
}
