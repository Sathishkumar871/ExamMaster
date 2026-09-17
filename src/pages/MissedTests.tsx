
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CalendarX2,
  Clock3,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
} from "lucide-react";

import "./MissedTests.css";

// ============================================================
// EXAM TYPE
// ============================================================

interface Exam {
  _id: string;
  id?: string;

  title: string;
  examName?: string;

  subject?: string;
  chapter?: string;
  className?: string;

  examType?: string;

  duration?: number;

  startDate: string;
  endDate: string;
}

// ============================================================
// API RESPONSE
// ============================================================

interface MissedTestsResponse {
  success: boolean;
  total: number;
  exams: Exam[];
  message?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function MissedTests() {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    missedTests,
    setMissedTests,
  ] = useState<Exam[]>([]);

  // Keep page visible while loading
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // STUDENT
  // ==========================================================

  const student = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "student"
        ) || "{}"
      );
    } catch {
      return {};
    }
  })();

  const studentId =
    student?._id ||
    student?.id ||
    student?.studentId;

  // ==========================================================
  // API URL
  //
  // LOCAL:
  // http://localhost:5000
  //
  // PRODUCTION:
  // https://exammaster-backend-up1y.onrender.com
  // ==========================================================

  const API_URL =
    window.location.hostname ===
      "localhost" ||
    window.location.hostname ===
      "127.0.0.1"
      ? "http://localhost:5000"
      : "https://exammaster-backend-up1y.onrender.com";

  // ==========================================================
  // OPEN MISSED EXAM
  //
  // Existing /mock-tests route is used.
  // Exact examId is sent through React Router state.
  // ==========================================================

  const openMissedExam = (
    examId: string
  ) => {
    const cleanExamId =
      String(
        examId || ""
      ).trim();

    // ========================================================
    // CHECK EXAM ID
    // ========================================================

    if (!cleanExamId) {
      console.error(
        "Missed exam ID not found."
      );

      setError(
        "Unable to open this exam because the exam ID is missing."
      );

      return;
    }

    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
      "Opening missed exam:",
      cleanExamId
    );

    // ========================================================
    // NAVIGATE TO EXISTING MOCK TEST PAGE
    // ========================================================

    navigate(
      "/mock-tests",
      {
        state: {
          missedExamId:
            cleanExamId,

          fromMissedTests:
            true,
        },
      }
    );
  };

  // ==========================================================
  // LOAD MISSED TESTS
  // ==========================================================

  const loadMissedTests =
    useCallback(
      async (
        manualRefresh = false
      ) => {
        // ====================================================
        // STUDENT CHECK
        // ====================================================

        if (!studentId) {
          setMissedTests([]);

          setLoading(false);

          setRefreshing(false);

          setError(
            "Student information not found."
          );

          return;
        }

        try {
          // ==================================================
          // FIRST LOAD
          // ==================================================

          if (
            missedTests.length ===
            0
          ) {
            setLoading(true);
          }

          // ==================================================
          // MANUAL REFRESH
          // ==================================================

          if (manualRefresh) {
            setRefreshing(true);
          }

          setError("");

          // ==================================================
          // API URL
          // ==================================================

          const url =
            `${API_URL}/api/mock-test/missed-tests` +
            `?studentId=${encodeURIComponent(
              String(studentId)
            )}`;

          console.log(
            "MISSED TESTS API:",
            url
          );

          // ==================================================
          // FETCH
          // ==================================================

          const response =
            await fetch(
              url,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          // ==================================================
          // CONTENT TYPE
          // ==================================================

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          // ==================================================
          // NON JSON RESPONSE
          // ==================================================

          if (
            !contentType.includes(
              "application/json"
            )
          ) {
            const text =
              await response.text();

            console.error(
              "MISSED TESTS NON-JSON RESPONSE:",
              text
            );

            throw new Error(
              `API route not found: ${url}`
            );
          }

          // ==================================================
          // JSON
          // ==================================================

          const data: MissedTestsResponse =
            await response.json();

          // ==================================================
          // HTTP ERROR
          // ==================================================

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to load missed tests."
            );
          }

          // ==================================================
          // API ERROR
          // ==================================================

          if (
            !data?.success
          ) {
            throw new Error(
              data?.message ||
                "Unable to load missed tests."
            );
          }

          // ==================================================
          // EXAMS
          // ==================================================

          const exams =
            Array.isArray(
              data.exams
            )
              ? data.exams
              : [];

          console.log(
            "MISSED TESTS:",
            exams
          );

          setMissedTests(
            exams
          );
        } catch (
          err: any
        ) {
          console.error(
            "LOAD MISSED TESTS ERROR:",
            err
          );

          setError(
            err?.message ||
              "Unable to load missed tests."
          );
        } finally {
          setLoading(false);

          setRefreshing(false);
        }
      },
      [
        API_URL,
        studentId,
        missedTests.length,
      ]
    );

  // ==========================================================
  // FIRST LOAD
  // ==========================================================

  useEffect(() => {
    loadMissedTests(false);
  }, [studentId]);

  // ==========================================================
  // AUTO REFRESH
  //
  // Every 30 seconds
  // ==========================================================

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          loadMissedTests(false);
        },
        30 * 1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    studentId,
    loadMissedTests,
  ]);

  // ==========================================================
  // REFRESH WHEN USER RETURNS TO TAB
  // ==========================================================

  useEffect(() => {
    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadMissedTests(false);
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    loadMissedTests,
  ]);

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="missed-tests-page">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <section className="missed-tests-header">

        <div className="missed-header-icon">
          <CalendarX2 size={30} />
        </div>

        <div>
          <span className="missed-eyebrow">
            EXAM CENTRE
          </span>

          <h1>
            Missed Tests
          </h1>

          <p>
            Exams you missed and are available
            for re-attempt are shown here.
          </p>
        </div>

        {/* ==================================================
            REFRESH
            ================================================== */}

        <button
          type="button"
          className="missed-refresh-btn"
          onClick={() =>
            loadMissedTests(true)
          }
          disabled={
            refreshing
          }
          title="Refresh missed tests"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "loading-icon"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </section>

      {/* ====================================================
          LOADING
          ==================================================== */}

      {loading ? (
        <div
          className="missed-refresh-message"
          role="status"
        >
          <RefreshCw
            size={16}
            className="loading-icon"
          />

          Checking missed tests...
        </div>
      ) : null}

      {/* ====================================================
          ERROR
          ==================================================== */}

      {error ? (
        <div
          className="missed-refresh-message"
          role="alert"
        >
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadMissedTests(true)
            }
          >
            Try Again
          </button>
        </div>
      ) : null}

      {/* ====================================================
          NO MISSED TESTS
          ==================================================== */}

      {!loading &&
      !error &&
      missedTests.length ===
        0 ? (
        <div className="no-missed-tests">

          <div className="empty-icon">
            <BookOpen size={30} />
          </div>

          <h2>
            No Missed Tests
          </h2>

          <p>
            Great! You don't have any
            missed exams at the moment.
          </p>

          <Link
            to="/dashboard"
            className="back-dashboard-btn"
          >
            Back to Dashboard

            <ArrowUpRight
              size={17}
            />
          </Link>

        </div>
      ) : null}

      {/* ====================================================
          MISSED TESTS GRID
          ==================================================== */}

      {missedTests.length >
      0 ? (
        <div className="missed-tests-grid">

          {missedTests.map(
            (exam) => {

              // ==================================================
              // EXACT EXAM ID
              // ==================================================

              const examId =
                exam._id ||
                exam.id ||
                "";

              // ==================================================
              // END DATE
              // ==================================================

              const endDate =
                new Date(
                  exam.endDate
                );

              // ==================================================
              // EXAM TITLE
              // ==================================================

              const examTitle =
                exam.title ||
                exam.examName ||
                "Mock Test";

              return (
                <div
                  key={examId}
                  className="missed-test-card"
                >

                  {/* ========================================
                      CARD TOP
                      ======================================== */}

                  <div className="missed-card-top">

                    <div className="missed-card-icon">
                      <BookOpen size={22} />
                    </div>

                    <span className="missed-badge">
                      MISSED
                    </span>

                  </div>

                  {/* ========================================
                      CARD BODY
                      ======================================== */}

                  <div className="missed-card-body">

                    <span className="missed-subject">
                      {exam.subject ||
                        exam.examType ||
                        "EXAM"}
                    </span>

                    <h2>
                      {examTitle}
                    </h2>

                    <div className="missed-info">

                      {/* ==================================
                          CLOSED DATE
                          ================================== */}

                      <div>
                        <Clock3
                          size={15}
                        />

                        <span>
                          Closed{" "}
                          {endDate.toLocaleDateString(
                            "en-IN",
                            {
                              day:
                                "2-digit",

                              month:
                                "short",

                              year:
                                "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* ==================================
                          DURATION
                          ================================== */}

                      {exam.duration ? (
                        <div>
                          <Clock3
                            size={15}
                          />

                          <span>
                            {
                              exam.duration
                            }{" "}
                            mins
                          </span>
                        </div>
                      ) : null}

                    </div>

                  </div>

                  {/* ========================================
                      CARD FOOTER
                      ======================================== */}

                  <div className="missed-card-footer">

                    <span>
                      Re-attempt available
                    </span>

                    {/* ==================================
                        START EXAM
                        ================================== */}

                    <button
                      type="button"
                      className="reattempt-btn"
                      disabled={
                        !examId
                      }
                      onClick={() =>
                        openMissedExam(
                          examId
                        )
                      }
                      title={
                        examId
                          ? "Start this missed exam"
                          : "Exam ID unavailable"
                      }
                    >
                      Start Exam

                      <ArrowUpRight
                        size={17}
                      />
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      ) : null}

    </div>
  );
}

