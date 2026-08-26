import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Info,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import MockTestInterface from "../components/MockTestInterface";
import "./MockTests.css";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

/* =========================================================
   TYPES
========================================================= */

interface Question {
  _id: string;

  questionText?: string;
  question?: string;

  options: string[];

  correctAnswer: string;

  isPublished?: boolean;
  status?: string;

  examType?: string;
  exam?: string;

  testCategory?: string;
  category?: string;

  className?: string;
  class?: string;

  subject?: string;

  chapter?: string;
  chapterName?: string;

  questionNumber?: number;

  [key: string]: any;
}

interface ExamResult {
  _id?: string;

  score?: number;
  marks?: number;

  totalQuestions?: number;
  attemptedQuestions?: number;

  correctAnswers?: number;
  wrongAnswers?: number;
  unansweredQuestions?: number;

  percentage?: number;

  grade?: string;
  status?: string;

  examName?: string;
  subject?: string;
  chapter?: string;
  className?: string;
  examType?: string;

  createdAt?: string;
  submittedAt?: string;

  timeTaken?: number;

  [key: string]: any;
}

type Step =
  | "dashboard"
  | "instructions"
  | "greeting"
  | "exam";

/* =========================================================
   HELPERS
========================================================= */

const safeParse = <T,>(
  value: string | null
): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalize = (value?: string) =>
  String(value || "")
    .trim()
    .toLowerCase();

const clampPercentage = (value: number) =>
  Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(value) ? value : 0
    )
  );

/* =========================================================
   COMPONENT
========================================================= */

export default function MockTests() {
  const navigate = useNavigate();

  /* =======================================================
     FLOW
  ======================================================= */

  const [step, setStep] =
    useState<Step>("dashboard");

  /* =======================================================
     PREVIOUS RESULT
  ======================================================= */

  const [alreadySubmitted, setAlreadySubmitted] =
    useState(false);

  const [examResult, setExamResult] =
    useState<ExamResult | null>(null);

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const [questions, setQuestions] =
    useState<Question[]>([]);

  /* =======================================================
     STATES
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [checkingSubmission, setCheckingSubmission] =
    useState(true);

  const [error, setError] =
    useState("");

  const [studentName, setStudentName] =
    useState("Student");

  const [studentId, setStudentId] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [examType, setExamType] =
    useState("NEET");

  const [showInstructions, setShowInstructions] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  const [isOnline, setIsOnline] =
    useState(navigator.onLine);

  /* =========================================================
     NETWORK STATUS
  ========================================================= */

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  /* =========================================================
     LOAD STUDENT
  ========================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const user =
      safeParse<any>(
        localStorage.getItem("user")
      ) ||
      safeParse<any>(
        localStorage.getItem("student")
      ) ||
      {};

    const storedName =
      localStorage.getItem("studentName") ||
      localStorage.getItem("name") ||
      user?.name ||
      "Student";

    const storedId =
      localStorage.getItem("studentId") ||
      localStorage.getItem("id") ||
      user?.studentId ||
      user?.id ||
      user?._id ||
      "";

    const storedClass =
      localStorage.getItem("className") ||
      localStorage.getItem("class") ||
      localStorage.getItem("puc") ||
      user?.className ||
      user?.class ||
      user?.puc ||
      "";

    const storedExam =
      localStorage.getItem("examType") ||
      localStorage.getItem("exam") ||
      user?.examType ||
      user?.exam ||
      "NEET";

    setStudentName(storedName);
    setStudentId(storedId);
    setClassName(storedClass);
    setExamType(storedExam);

    if (!storedId) {
      setCheckingSubmission(false);

      setError(
        "Student identification could not be found. Please log in again."
      );

      return;
    }

    /* =====================================================
       CACHE PREVIOUS RESULT
    ===================================================== */

    const cachedResult =
      localStorage.getItem(
        `exam_result_${storedId}_${storedExam}`
      );

    const cachedSubmitted =
      localStorage.getItem(
        `exam_submitted_${storedId}_${storedExam}`
      );

    if (
      cachedSubmitted === "true" &&
      cachedResult
    ) {
      const parsedResult =
        safeParse<ExamResult>(
          cachedResult
        );

      if (parsedResult) {
        setExamResult(parsedResult);
        setAlreadySubmitted(true);
      }
    }

    checkBackendSubmission(
      storedId,
      token,
      storedExam
    );
  }, [navigate]);

  /* =========================================================
     BACKEND PREVIOUS RESULT CHECK
  ========================================================= */

  const checkBackendSubmission = async (
    id: string,
    token: string,
    currentExamType: string
  ) => {
    setCheckingSubmission(true);

    try {
      /*
       * IMPORTANT:
       *
       * API_BASE_URL already contains /api.
       *
       * Therefore DO NOT add /api again.
       */

      const response =
        await fetch(
          `${API_BASE_URL}/results/student/${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      /*
       * Previous-result API failure
       * must NOT block new exam.
       */

      if (!response.ok) {
        console.warn(
          "Previous result check failed."
        );

        return;
      }

      const data =
        await response.json();

      const resultsList: ExamResult[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
          ? data.data
          : [];

      const target =
        normalize(currentExamType);

      const matchingResults =
        resultsList.filter(
          (result) => {
            const subject =
              normalize(result.subject);

            const examName =
              normalize(result.examName);

            const resultExamType =
              normalize(result.examType);

            return (
              subject === target ||
              resultExamType === target ||
              examName.includes(target)
            );
          }
        );

      if (
        matchingResults.length > 0
      ) {
        const sortedResults =
          [...matchingResults].sort(
            (a, b) => {
              const first =
                new Date(
                  a.submittedAt ||
                    a.createdAt ||
                    0
                ).getTime();

              const second =
                new Date(
                  b.submittedAt ||
                    b.createdAt ||
                    0
                ).getTime();

              return second - first;
            }
          );

        const latestResult =
          sortedResults[0];

        setExamResult(latestResult);
        setAlreadySubmitted(true);

        localStorage.setItem(
          `exam_submitted_${id}_${currentExamType}`,
          "true"
        );

        localStorage.setItem(
          `exam_result_${id}_${currentExamType}`,
          JSON.stringify(latestResult)
        );
      }
    } catch (err) {
      console.error(
        "Backend submission verification failed:",
        err
      );
    } finally {
      setCheckingSubmission(false);
    }
  };

  /* =========================================================
     FETCH MOCK QUESTIONS
  ========================================================= */

  const fetchQuestionsForClass =
    async (
      selectedClass: string,
      selectedExamType: string
    ) => {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "studentToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      if (!token) {
        navigate("/login");
        setLoading(false);
        return false;
      }

      try {
        const queryParams =
          new URLSearchParams();

        if (selectedClass) {
          queryParams.append(
            "className",
            selectedClass
          );
        }

        if (selectedExamType) {
          queryParams.append(
            "examType",
            selectedExamType
          );
        }

        /*
         * IMPORTANT:
         *
         * API_BASE_URL already has /api.
         * So here we use /questions, NOT /api/questions.
         */

        const response =
          await fetch(
            `${API_BASE_URL}/questions/mock-tests?${queryParams.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load mock test questions."
          );
        }

        const loadedQuestions =
          data?.questions ||
          data?.data ||
          data;

        if (
          !Array.isArray(
            loadedQuestions
          )
        ) {
          throw new Error(
            "The server returned an invalid question format."
          );
        }

        if (
          loadedQuestions.length === 0
        ) {
          throw new Error(
            "No questions are currently available for this mock test."
          );
        }

        /* =================================================
           NORMALIZE QUESTIONS
        ================================================= */

        const normalizedQuestions =
          loadedQuestions.map(
            (
              question: any,
              index: number
            ) => ({
              ...question,

              _id:
                question?._id ||
                question?.id ||
                `mock-question-${index}`,

              questionText:
                question?.questionText ||
                question?.question ||
                "",

              question:
                question?.question ||
                question?.questionText ||
                "",

              options:
                Array.isArray(
                  question?.options
                )
                  ? question.options
                  : [],

              correctAnswer:
                question?.correctAnswer ||
                "",
            })
          );

        /* =================================================
           REMOVE INVALID QUESTIONS
        ================================================= */

        const validQuestions =
          normalizedQuestions.filter(
            (question: any) =>
              question.question &&
              Array.isArray(
                question.options
              ) &&
              question.options.length >= 2
          );

        if (
          validQuestions.length === 0
        ) {
          throw new Error(
            "No valid questions were found for this mock test."
          );
        }

        /* =================================================
           QUESTION NUMBER
        ================================================= */

        const finalQuestions =
          validQuestions.map(
            (
              question: any,
              index: number
            ) => ({
              ...question,

              questionNumber:
                question.questionNumber ||
                index + 1,
            })
          );

        /* =================================================
           SAVE
        ================================================= */

        setQuestions(
          finalQuestions
        );

        return true;
      } catch (err: any) {
        console.error(
          "Mock test question loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the mock test."
        );

        return false;
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     START BUTTON
  ========================================================= */

  const handleStartExam = () => {
    if (checkingSubmission) {
      return;
    }

    if (!isOnline) {
      setError(
        "You are currently offline. Please reconnect to the internet before starting the exam."
      );

      return;
    }

    setError("");
    setShowInstructions(true);
  };

  /* =========================================================
     MODAL → READY SCREEN
  ========================================================= */

  const handleContinueToInstructions =
    () => {
      setShowInstructions(false);
      setStep("instructions");
      setError("");
    };

  /* =========================================================
     READY → LOAD QUESTIONS
     → GREETING
     → EXAM
  ========================================================= */

  const handleReady = async () => {
    if (!isOnline) {
      setError(
        "A stable internet connection is required to start the exam."
      );

      return;
    }

    if (loading) {
      return;
    }

    setError("");

    const success =
      await fetchQuestionsForClass(
        className,
        examType
      );

    if (!success) {
      setIsReady(false);
      return;
    }

    setStep("greeting");

    window.setTimeout(() => {
      setStep("exam");
    }, 2200);
  };

  /* =========================================================
     RESULT PERCENTAGE
  ========================================================= */

  const percentage =
    useMemo(() => {
      return clampPercentage(
        Number(
          examResult?.percentage || 0
        )
      );
    }, [examResult]);

  /* =========================================================
     PERFORMANCE
  ========================================================= */

  const performance =
    useMemo(() => {
      if (percentage >= 85) {
        return {
          title:
            "Excellent Performance",

          description:
            "Outstanding work. Your preparation is producing strong results.",

          icon: (
            <Trophy size={28} />
          ),

          className:
            "excellent",
        };
      }

      if (percentage >= 70) {
        return {
          title:
            "Strong Performance",

          description:
            "Good work. A little more refinement can push your score even higher.",

          icon: (
            <Award size={28} />
          ),

          className:
            "strong",
        };
      }

      if (percentage >= 50) {
        return {
          title:
            "Good Progress",

          description:
            "You are on the right track. Focus on your weaker areas for improvement.",

          icon: (
            <Target size={28} />
          ),

          className:
            "progress",
        };
      }

      return {
        title:
          "Needs More Practice",

        description:
          "Use this result as a guide and strengthen your fundamentals before the next attempt.",

        icon: (
          <BookOpen size={28} />
        ),

        className:
          "focus",
      };
    }, [percentage]);

  /* =========================================================
     DASHBOARD
  ========================================================= */

  if (step === "dashboard") {
    return (
      <>
        <div className="mock-page">
          <div className="mock-container">

            {/* HEADER */}

            <header className="mock-header">

              <button
                className="mock-back-btn"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                <ArrowLeft size={17} />

                Dashboard
              </button>

              <div className="mock-online-status">

                {isOnline ? (
                  <>
                    <Wifi size={14} />

                    Online
                  </>
                ) : (
                  <>
                    <WifiOff
                      size={14}
                    />

                    Offline
                  </>
                )}

              </div>

            </header>

            {/* HERO */}

            <section className="mock-hero">

              <div className="mock-hero-content">

                <div className="mock-eyebrow">
                  EXAM SIMULATION
                </div>

                <h1>
                  Ready for your
                  next
                  <span>
                    {" "}
                    challenge?
                  </span>
                </h1>

                <p>
                  Test your knowledge,
                  improve your accuracy,
                  and measure your
                  preparation with a
                  focused mock
                  assessment.
                </p>

                <div className="mock-hero-tags">

                  <span>
                    <ShieldCheck
                      size={14}
                    />

                    Secure Assessment
                  </span>

                  <span>
                    <Target
                      size={14}
                    />

                    Performance Tracking
                  </span>

                  <span>
                    <Zap size={14} />

                    Instant Evaluation
                  </span>

                </div>

              </div>

              <div className="mock-hero-visual">

                <div className="mock-orbit mock-orbit-one" />

                <div className="mock-orbit mock-orbit-two" />

                <div className="mock-hero-icon">

                  <GraduationCap
                    size={48}
                  />

                </div>

              </div>

            </section>

            {/* START GRID */}

            <section className="mock-start-grid">

              {/* MAIN CARD */}

              <div className="mock-start-card">

                <div className="mock-card-top">

                  <div className="mock-test-icon">

                    <BookOpen
                      size={23}
                    />

                  </div>

                  <div className="mock-test-status">

                    {checkingSubmission ? (
                      <>
                        <RefreshCw
                          size={13}
                          className="mock-spin"
                        />

                        Checking
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={13}
                        />

                        Available
                      </>
                    )}

                  </div>

                </div>

                <div className="mock-test-category">
                  {examType.toUpperCase()}
                </div>

                <h2>
                  Full Mock Assessment
                </h2>

                <p>
                  A comprehensive
                  assessment designed
                  for your current
                  academic level.
                </p>

                <div className="mock-info-grid">

                  <div>

                    <FileQuestion
                      size={17}
                    />

                    <span>
                      Questions

                      <strong>
                        180
                      </strong>
                    </span>

                  </div>

                  <div>

                    <Clock3
                      size={17}
                    />

                    <span>
                      Estimated Time

                      <strong>
                        3 Hours
                      </strong>
                    </span>

                  </div>

                  <div>

                    <GraduationCap
                      size={17}
                    />

                    <span>
                      PATTERN

                      <strong>
                        NEET
                      </strong>
                    </span>

                  </div>

                  <div>

                    <ShieldCheck
                      size={17}
                    />

                    <span>
                      Marks

                      <strong>
                        720
                      </strong>
                    </span>

                  </div>

                </div>

                {!isOnline && (
                  <div className="mock-warning">

                    <WifiOff size={15} />

                    Internet connection
                    required before
                    starting.

                  </div>
                )}

                {error && (
                  <div className="mock-inline-error">

                    <Info size={15} />

                    {error}

                  </div>
                )}

                <button
                  className="mock-start-btn"
                  onClick={
                    handleStartExam
                  }
                  disabled={
                    checkingSubmission ||
                    loading ||
                    !isOnline
                  }
                >

                  {checkingSubmission ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="mock-spin"
                      />

                      Checking...
                    </>
                  ) : (
                    <>
                      {alreadySubmitted
                        ? "Start New Mock Test"
                        : "Start Mock Test"}

                      <ArrowRight
                        size={18}
                      />
                    </>
                  )}

                </button>

              </div>

              {/* SIDE CARD */}

              <aside className="mock-side-card">

                <div className="mock-side-icon">

                  <LockKeyhole
                    size={21}
                  />

                </div>

                <h3>
                  Before You Begin
                </h3>

                <ul>

                  <li>
                    <CheckCircle2
                      size={15}
                    />

                    Ensure a stable
                    internet connection.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                    />

                    Keep your device
                    charged.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                    />

                    Choose a quiet
                    environment.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                    />

                    Do not refresh during
                    the assessment.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                    />

                    Submit only after
                    reviewing your answers.
                  </li>

                </ul>

              </aside>

            </section>

            {/* SECURITY */}

            <section className="mock-security-strip">

              <ShieldCheck size={19} />

              <div>

                <strong>
                  Secure Examination
                  Environment
                </strong>

                <span>
                  Your attempt is
                  verified with the
                  server before the
                  assessment begins.
                </span>

              </div>

            </section>

          </div>
        </div>

        {/* INSTRUCTIONS MODAL */}

        {showInstructions && (
          <div className="mock-modal-overlay">

            <div className="mock-instructions-modal">

              <button
                className="mock-modal-close"
                onClick={() =>
                  setShowInstructions(
                    false
                  )
                }
                aria-label="Close instructions"
              >
                <X size={19} />
              </button>

              <div className="mock-modal-icon">

                <ShieldCheck
                  size={25}
                />

              </div>

              <span className="mock-modal-label">
                EXAM INSTRUCTIONS
              </span>

              <h2>
                Please review before
                starting
              </h2>

              <p className="mock-modal-description">
                Once the assessment
                begins, your attempt
                will be treated as an
                active examination
                session.
              </p>

              <div className="mock-instruction-list">

                <div>
                  <span>01</span>

                  <p>
                    Read every question
                    carefully before
                    selecting an answer.
                  </p>
                </div>

                <div>
                  <span>02</span>

                  <p>
                    Manage your time
                    carefully throughout
                    the assessment.
                  </p>
                </div>

                <div>
                  <span>03</span>

                  <p>
                    Avoid refreshing or
                    closing the browser
                    during the test.
                  </p>
                </div>

                <div>
                  <span>04</span>

                  <p>
                    Your answers will be
                    evaluated after
                    submission.
                  </p>
                </div>

              </div>

              <button
                className="mock-modal-primary"
                onClick={
                  handleContinueToInstructions
                }
              >
                Continue

                <ArrowRight
                  size={17}
                />
              </button>

            </div>

          </div>
        )}

      </>
    );
  }

  /* =========================================================
     FINAL READINESS SCREEN
  ========================================================= */

  if (step === "instructions") {
    return (
      <div className="mock-page">

        <div className="mock-ready-container">

          <button
            className="mock-back-btn"
            onClick={() =>
              setStep("dashboard")
            }
          >
            <ArrowLeft size={17} />

            Back
          </button>

          <div className="mock-ready-card">

            <div className="mock-ready-header">

              <div className="mock-ready-icon">

                <LockKeyhole
                  size={28}
                />

              </div>

              <div>

                <span>
                  SECURE ASSESSMENT
                </span>

                <h1>
                  Final readiness
                  check
                </h1>

              </div>

            </div>

            <div className="mock-ready-exam">

              <div>
                <span>
                  Exam
                </span>

                <strong>
                  {examType} Full Mock
                </strong>
              </div>

              <div>
                <span>
                  Candidate
                </span>

                <strong>
                  {studentName}
                </strong>
              </div>

              <div>
                <span>
                  Class
                </span>

                <strong>
                  {className ||
                    "General"}
                </strong>
              </div>

              <div>
                <span>
                  Questions
                </span>

                <strong>
                  Will load securely
                </strong>
              </div>

            </div>

            <div className="mock-checklist">

              <label>

                <input
                  type="checkbox"
                  checked={isReady}
                  onChange={(event) =>
                    setIsReady(
                      event.target
                        .checked
                    )
                  }
                />

                <span className="mock-checkbox">

                  {isReady && (
                    <CheckCircle2
                      size={17}
                    />
                  )}

                </span>

                <span>
                  I am ready to begin
                  the assessment and
                  understand the
                  examination
                  instructions.
                </span>

              </label>

            </div>

            {error && (
              <div className="mock-inline-error">

                <Info size={15} />

                {error}

              </div>
            )}

            <button
              className="mock-begin-btn"
              disabled={
                !isReady ||
                loading
              }
              onClick={
                handleReady
              }
            >

              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="mock-spin"
                  />

                  Preparing Exam...
                </>
              ) : (
                <>
                  Enter Examination

                  <ArrowRight
                    size={18}
                  />
                </>
              )}

            </button>

            <p className="mock-secure-note">

              <ShieldCheck
                size={14}
              />

              Your attempt will be
              securely processed by
              the examination system.

            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     ALL THE BEST
  ========================================================= */

  if (step === "greeting") {
    return (
      <div className="mock-greeting">

        <div className="mock-greeting-glow" />

        <div className="mock-greeting-content">

          <div className="mock-greeting-icon">

            <Trophy size={42} />

          </div>

          <div className="mock-greeting-label">
            EXAM READY
          </div>

          <h1>
            All the best,
            <span>
              {studentName}
            </span>
          </h1>

          <p>
            Stay calm, stay focused,
            and give your best.
          </p>

          <div className="mock-greeting-loader">
            <span />
          </div>

          <small>
            Starting your examination...
          </small>

        </div>

      </div>
    );
  }

  /* =========================================================
     EXAM / QUESTIONS INTERFACE
  ========================================================= */

  if (step === "exam") {
    return (
      <div className="mock-exam-page">

        <MockTestInterface
          subject={
            examType || "NEET"
          }

          className={
            className || "General"
          }

          chapterName={
            `${examType || "NEET"} Full Mock Assessment`
          }

          questions={
            questions
          }

          studentId={
            studentId
          }

          studentName={
            studentName
          }

          themeColor="#4F46E5"

          onBack={() =>
            setStep("dashboard")
          }

          apiBaseUrl={
            API_BASE_URL
          }
        />

      </div>
    );
  }

  return null;
}