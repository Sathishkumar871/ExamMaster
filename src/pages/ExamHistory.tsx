import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  BarChart3,
  Printer,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./ExamHistory.css";

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// TYPES
// ============================================================

interface ReviewItem {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ExamResult {
  _id: string;

  examName: string;
  subject: string;

  totalQuestions: number;
  attemptedQuestions: number;
  unansweredQuestions: number;

  correctAnswers: number;
  wrongAnswers: number;

  marks: number;
  percentage: number;

  grade: string;
  status: string;

  timeTaken: number;

  createdAt: string;

  review?: ReviewItem[];
}

// ============================================================
// COMPONENT
// ============================================================

export default function ExamHistory() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    results,
    setResults,
  ] = useState<ExamResult[]>([]);

  const [
    selectedExam,
    setSelectedExam,
  ] = useState<ExamResult | null>(
    null
  );

  // IMPORTANT:
  // This loading state is only for the data area.
  // The entire page does NOT wait for API anymore.
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    filterType,
    setFilterType,
  ] = useState<
    "all" | "correct" | "wrong" | "skipped"
  >("all");

  // ==========================================================
  // FETCH STUDENT RESULTS
  // ==========================================================

  const fetchStudentResults =
    async () => {
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
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        // ======================================================
        // STUDENT DATA
        // ======================================================

        const studentStr =
          localStorage.getItem("user") ||
          localStorage.getItem(
            "student"
          );

        let studentId = "";

        if (studentStr) {
          try {
            const obj =
              JSON.parse(
                studentStr
              );

            studentId =
              obj?.studentId ||
              obj?.id ||
              obj?._id ||
              "";
          } catch {
            studentId = "";
          }
        }

        if (!studentId) {
          throw new Error(
            "Student ID not found in local storage."
          );
        }

        // ======================================================
        // REQUEST
        // ======================================================

        const response =
          await fetch(
            `${API_BASE_URL}/api/results/student/${studentId}`,
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

        // ======================================================
        // RESPONSE
        // ======================================================

        let data: any = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        // ======================================================
        // SESSION EXPIRED
        // ======================================================

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "studentToken"
          );

          localStorage.removeItem(
            "token"
          );

          navigate(
            "/login?session=expired",
            {
              replace: true,
            }
          );

          return;
        }

        // ======================================================
        // ERROR
        // ======================================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch exam history."
          );
        }

        // ======================================================
        // DATA
        // ======================================================

        const resultsList =
          data?.results ??
          data?.data ??
          data;

        const formattedList =
          Array.isArray(
            resultsList
          )
            ? resultsList
            : resultsList
              ? [resultsList]
              : [];

        setResults(
          formattedList
        );

        // Select first result only if available
        if (
          formattedList.length >
          0
        ) {
          setSelectedExam(
            formattedList[0]
          );
        } else {
          setSelectedExam(
            null
          );
        }
      } catch (err: unknown) {
        console.error(
          "Exam history fetch error:",
          err
        );

        setResults([]);

        setSelectedExam(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load exam history."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchStudentResults();
  }, []);

  // ==========================================================
  // RECENT RESULT
  // ==========================================================

  const isRecentResult = (
    exam: ExamResult
  ) => {
    if (
      !exam.createdAt ||
      !exam.examName
    ) {
      return false;
    }

    const nameLower =
      exam.examName.toLowerCase();

    const isTargetTest =
      nameLower.includes(
        "mock"
      ) ||
      nameLower.includes(
        "jee"
      );

    if (!isTargetTest) {
      return false;
    }

    const createdTime =
      new Date(
        exam.createdAt
      ).getTime();

    const currentTime =
      Date.now();

    const hoursDifference =
      (currentTime -
        createdTime) /
      (1000 * 60 * 60);

    return (
      hoursDifference >= 0 &&
      hoursDifference <= 24
    );
  };

  // ==========================================================
  // FILTERED EXAMS
  // ==========================================================

  const filteredExams =
    useMemo(() => {
      const keyword =
        searchQuery
          .trim()
          .toLowerCase();

      if (!keyword) {
        return results;
      }

      return results.filter(
        (exam) =>
          exam.examName
            .toLowerCase()
            .includes(
              keyword
            ) ||
          (
            exam.subject || ""
          )
            .toLowerCase()
            .includes(
              keyword
            )
      );
    }, [
      results,
      searchQuery,
    ]);

  // ==========================================================
  // FILTERED QUESTIONS
  // ==========================================================

  const filteredQuestions =
    useMemo(() => {
      if (
        !selectedExam?.review
      ) {
        return [];
      }

      const reviewItems =
        selectedExam.review;

      if (
        filterType ===
        "correct"
      ) {
        return reviewItems.filter(
          (question) =>
            question.isCorrect
        );
      }

      if (
        filterType ===
        "wrong"
      ) {
        return reviewItems.filter(
          (question) =>
            !question.isCorrect &&
            question.selectedAnswer !==
              "Not Attempted"
        );
      }

      if (
        filterType ===
        "skipped"
      ) {
        return reviewItems.filter(
          (question) =>
            question.selectedAnswer ===
            "Not Attempted"
        );
      }

      return reviewItems;
    }, [
      selectedExam,
      filterType,
    ]);

  // ==========================================================
  // SELECT EXAM
  // ==========================================================

  const handleSelectExam = (
    exam: ExamResult
  ) => {
    setSelectedExam(
      exam
    );

    setFilterType("all");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="eh-page">

      <div className="eh-container">

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <header className="eh-top-bar">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            className="eh-back-btn"
            aria-label="Back to dashboard"
          >

            <ArrowLeft
              size={16}
              aria-hidden="true"
            />

            <span>
              Back to Dashboard
            </span>

          </button>

          <h1>
            Exam History & Analytics
          </h1>

        </header>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <main>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <section
              className="eh-error-screen"
              aria-live="assertive"
            >

              <div className="eh-error-card">

                <h2>
                  Error Loading History
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchStudentResults()
                  }
                >
                  Try Again
                </button>

              </div>

            </section>

          )}

          {/* ==================================================
              NO RESULTS
          ================================================== */}

          {!error &&
            !loading &&
            results.length ===
              0 && (

              <section className="eh-empty-box">

                <BarChart3
                  size={48}
                  aria-hidden="true"
                />

                <h2>
                  No Exam Records Found
                </h2>

                <p>
                  You haven't taken any mock
                  tests yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/mock-tests"
                    )
                  }
                  className="eh-action-btn"
                >
                  Take a Test
                </button>

              </section>

            )}

          {/* ==================================================
              DATA LOADING + CONTENT
          ================================================== */}

          {!error &&
            (
              loading ||
              results.length >
                0
            ) && (

            <div className="eh-layout">

              {/* ==============================================
                  SIDEBAR
              ============================================== */}

              <aside className="eh-sidebar">

                <div className="eh-search-wrapper">

                  <Search
                    size={16}
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    placeholder="Search exams..."
                    value={
                      searchQuery
                    }
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    aria-label="Search exam history"
                    autoComplete="off"
                  />

                </div>

                {/* Loading placeholder */}

                {loading ? (

                  <div
                    className="eh-no-match"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    Loading exams...
                  </div>

                ) : (

                  <div className="eh-exam-list">

                    {filteredExams.length ===
                    0 ? (

                      <p className="eh-no-match">
                        No exams match your
                        search.
                      </p>

                    ) : (

                      filteredExams.map(
                        (exam) => {

                          const recent =
                            isRecentResult(
                              exam
                            );

                          const active =
                            selectedExam?._id ===
                            exam._id;

                          return (
                            <button
                              type="button"
                              key={
                                exam._id
                              }
                              className={`eh-card ${
                                active
                                  ? "active"
                                  : ""
                              } ${
                                recent
                                  ? "recent-highlight-card"
                                  : ""
                              }`}
                              onClick={() =>
                                handleSelectExam(
                                  exam
                                )
                              }
                              aria-pressed={
                                active
                              }
                              aria-label={`Open ${exam.examName}`}
                            >

                              <span className="eh-card-info">

                                <span className="eh-card-title-row">

                                  <strong className="eh-card-title">
                                    {
                                      exam.examName
                                    }
                                  </strong>

                                  {recent && (
                                    <span className="eh-new-badge">
                                      NEW ✨
                                    </span>
                                  )}

                                </span>

                                <span>
                                  {new Date(
                                    exam.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>

                              </span>

                              <ChevronRight
                                size={16}
                                aria-hidden="true"
                              />

                            </button>
                          );
                        }
                      )

                    )}

                  </div>

                )}

              </aside>

              {/* ==============================================
                  MAIN EXAM AREA
              ============================================== */}

              <section
                className="eh-main-content"
                aria-label="Exam details"
              >

                {/* =================================================
                    PAGE LOADING
                ================================================= */}

                {loading ? (

                  <div
                    className="eh-select-prompt"
                    aria-live="polite"
                    aria-busy="true"
                  >

                    <div
                      className="loading-spinner"
                      aria-hidden="true"
                    />

                    <p>
                      Loading Exam History...
                    </p>

                  </div>

                ) : selectedExam ? (

                  <div>

                    {/* ============================================
                        SUMMARY HEADER
                    ============================================ */}

                    <section
                      className="eh-summary-box"
                      aria-labelledby="selected-exam-title"
                    >

                      <div className="eh-summary-info">

                        <span className="eh-badge-subject">
                          {
                            selectedExam.subject ||
                            "General"
                          }
                        </span>

                        <h2 id="selected-exam-title">
                          {
                            selectedExam.examName
                          }
                        </h2>

                        <p>
                          Submitted:{" "}
                          {new Date(
                            selectedExam.createdAt
                          ).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                      </div>

                      <div className="eh-summary-score">

                        <div
                          className="eh-score-circle"
                          aria-label={`Score ${selectedExam.marks} out of ${selectedExam.totalQuestions}`}
                        >

                          <strong>
                            {
                              selectedExam.marks
                            }
                          </strong>

                          /
                          {
                            selectedExam.totalQuestions
                          }

                        </div>

                        <span
                          className={`eh-status-pill ${
                            selectedExam.percentage >=
                            35
                              ? "pass"
                              : "fail"
                          }`}
                        >

                          {
                            selectedExam.percentage
                          }%
                          {" "}
                          (
                          {
                            selectedExam.status
                          }
                          )

                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            window.print()
                          }
                          className="eh-print-btn"
                          aria-label="Print exam report"
                        >

                          <Printer
                            size={13}
                            aria-hidden="true"
                          />

                          <span>
                            Print Report
                          </span>

                        </button>

                      </div>

                    </section>

                    {/* ============================================
                        QUICK STATS
                    ============================================ */}

                    <section
                      className="eh-stats-row"
                      aria-label="Exam statistics"
                    >

                      <div className="eh-stat-item">

                        <span>
                          Total
                        </span>

                        <strong>
                          {
                            selectedExam.totalQuestions
                          }
                        </strong>

                      </div>

                      <div className="eh-stat-item green">

                        <span>
                          Correct
                        </span>

                        <strong>
                          {
                            selectedExam.correctAnswers
                          }
                        </strong>

                      </div>

                      <div className="eh-stat-item red">

                        <span>
                          Wrong
                        </span>

                        <strong>
                          {
                            selectedExam.wrongAnswers
                          }
                        </strong>

                      </div>

                      <div className="eh-stat-item grey">

                        <span>
                          Skipped
                        </span>

                        <strong>
                          {
                            selectedExam.unansweredQuestions
                          }
                        </strong>

                      </div>

                    </section>

                    {/* ============================================
                        QUESTION REVIEW
                    ============================================ */}

                    <section
                      aria-labelledby="question-review-title"
                    >

                      <div className="eh-review-header">

                        <h3 id="question-review-title">
                          Question Review
                        </h3>

                        <div
                          className="eh-tabs"
                          role="tablist"
                          aria-label="Filter question review"
                        >

                          {/* ALL */}

                          <button
                            type="button"
                            role="tab"
                            aria-selected={
                              filterType ===
                              "all"
                            }
                            className={
                              filterType ===
                              "all"
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              setFilterType(
                                "all"
                              )
                            }
                          >
                            All (
                            {
                              selectedExam.review
                                ?.length ||
                              0
                            }
                            )
                          </button>

                          {/* CORRECT */}

                          <button
                            type="button"
                            role="tab"
                            aria-selected={
                              filterType ===
                              "correct"
                            }
                            className={
                              filterType ===
                              "correct"
                                ? "active correct"
                                : ""
                            }
                            onClick={() =>
                              setFilterType(
                                "correct"
                              )
                            }
                          >
                            Correct (
                            {
                              selectedExam.correctAnswers
                            }
                            )
                          </button>

                          {/* WRONG */}

                          <button
                            type="button"
                            role="tab"
                            aria-selected={
                              filterType ===
                              "wrong"
                            }
                            className={
                              filterType ===
                              "wrong"
                                ? "active wrong"
                                : ""
                            }
                            onClick={() =>
                              setFilterType(
                                "wrong"
                              )
                            }
                          >
                            Wrong (
                            {
                              selectedExam.wrongAnswers
                            }
                            )
                          </button>

                          {/* SKIPPED */}

                          <button
                            type="button"
                            role="tab"
                            aria-selected={
                              filterType ===
                              "skipped"
                            }
                            className={
                              filterType ===
                              "skipped"
                                ? "active skipped"
                                : ""
                            }
                            onClick={() =>
                              setFilterType(
                                "skipped"
                              )
                            }
                          >
                            Skipped (
                            {
                              selectedExam.unansweredQuestions
                            }
                            )
                          </button>

                        </div>

                      </div>

                      {/* ==========================================
                          QUESTIONS
                      ========================================== */}

                      <div className="eh-questions-container">

                        {filteredQuestions.length ===
                        0 ? (

                          <p className="eh-no-questions">
                            No questions available
                            for this filter.
                          </p>

                        ) : (

                          filteredQuestions.map(
                            (
                              question,
                              index
                            ) => {

                              const isSkipped =
                                question.selectedAnswer ===
                                "Not Attempted";

                              const questionState =
                                question.isCorrect
                                  ? "correct"
                                  : isSkipped
                                    ? "skipped"
                                    : "wrong";

                              return (
                                <article
                                  key={
                                    question.questionId ||
                                    `question-${index}`
                                  }
                                  className={`eh-q-card ${questionState}`}
                                >

                                  {/* QUESTION HEADER */}

                                  <div className="eh-q-top-row">

                                    <span className="eh-q-num">
                                      Question{" "}
                                      {
                                        index + 1
                                      }
                                    </span>

                                    <span
                                      className={`eh-q-badge ${
                                        question.isCorrect
                                          ? "green"
                                          : isSkipped
                                            ? "grey"
                                            : "red"
                                      }`}
                                    >

                                      {question.isCorrect ? (

                                        <CheckCircle2
                                          size={14}
                                          aria-hidden="true"
                                        />

                                      ) : isSkipped ? (

                                        <HelpCircle
                                          size={14}
                                          aria-hidden="true"
                                        />

                                      ) : (

                                        <XCircle
                                          size={14}
                                          aria-hidden="true"
                                        />

                                      )}

                                      <span>
                                        {question.isCorrect
                                          ? "Correct"
                                          : isSkipped
                                            ? "Skipped"
                                            : "Wrong"}
                                      </span>

                                    </span>

                                  </div>

                                  {/* QUESTION */}

                                  <p className="eh-q-text">
                                    {
                                      question.question
                                    }
                                  </p>

                                  {/* ANSWERS */}

                                  <div className="eh-q-ans-box">

                                    <div>

                                      <span>
                                        Your Answer:
                                      </span>

                                      <strong
                                        className={
                                          question.isCorrect
                                            ? "text-green"
                                            : "text-red"
                                        }
                                      >
                                        {
                                          question.selectedAnswer
                                        }
                                      </strong>

                                    </div>

                                    <div>

                                      <span>
                                        Correct Answer:
                                      </span>

                                      <strong className="text-green">
                                        {
                                          question.correctAnswer
                                        }
                                      </strong>

                                    </div>

                                  </div>

                                </article>
                              );
                            }
                          )

                        )}

                      </div>

                    </section>

                  </div>

                ) : (

                  <div className="eh-select-prompt">

                    <p>
                      Select an exam from the
                      left sidebar to inspect your
                      performance.
                    </p>

                  </div>

                )}

              </section>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}