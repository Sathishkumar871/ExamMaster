
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  UserCheck,
  Check,
  CalendarDays,
  Clock3,
  CircleHelp,
  ChevronUp,
  ListChecks,
  Play,
  Bookmark,
  RotateCcw,
  Timer,
  History,
  CheckCircle2,
} from "lucide-react";
import "./DailyTest.css";

interface Question {
  _id: string;
  question: string;
  options: string[];
  subject: string;
  chapter: string;
  testTitle?: string;
  testType?: string;
  imageUrl?: string;
}

interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
}

const API_URL =
  "https://exammaster-backend-up1y.onrender.com";

const DailyTest: React.FC = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});

  const [markedForReview, setMarkedForReview] = useState<{
    [key: string]: boolean;
  }>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [testResult, setTestResult] =
    useState<TestResult | null>(null);

  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("Student");

  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showQuestionList, setShowQuestionList] =
    useState(false);

  // =========================================================
  // FETCH DAILY TEST
  // =========================================================

  useEffect(() => {
    const student = JSON.parse(
      localStorage.getItem("student") || "{}"
    );

    if (student?.name) {
      setStudentName(student.name);
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        // Use the SAME token key everywhere
        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Student session expired. Please login again."
          );
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/daily-tests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const fetchedTests: Question[] =
            response.data.tests || [];

          console.log(
            "DAILY TEST QUESTIONS:",
            fetchedTests
          );

          fetchedTests.forEach((question, index) => {
            console.log(
              `Question ${index + 1}:`,
              question
            );

            console.log(
              `Question ${index + 1} imageUrl:`,
              question.imageUrl
            );
          });

          setQuestions(fetchedTests);

          // 1 minute per question
          // Minimum 5 minutes
          setTimeLeft(
            Math.max(fetchedTests.length * 60, 300)
          );
        } else {
          setQuestions([]);
          setError(
            response.data.message ||
              "No daily test available."
          );
        }
      } catch (err: any) {
        console.error(
          "Error fetching daily tests:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load today's daily test."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      !testStarted ||
      testResult ||
      questions.length === 0
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmitExam(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [
    testStarted,
    timeLeft,
    testResult,
    questions.length,
  ]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================================================
  // TEST DATA
  // =========================================================

  const testTitle =
    questions[0]?.testTitle ||
    "Daily Practice Assessment";

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  const answeredCount =
    Object.keys(selectedAnswers).length;

  const markedCount = Object.values(
    markedForReview
  ).filter(Boolean).length;

  const remainingCount = Math.max(
    questions.length - answeredCount,
    0
  );

  const progressPercentage =
    questions.length > 0
      ? Math.round(
          (answeredCount / questions.length) * 100
        )
      : 0;

  const currentQuestion =
    questions[activeQuestion];

  const isCurrentAnswered =
    currentQuestion &&
    selectedAnswers[currentQuestion._id] !==
      undefined;

  const isCurrentMarked =
    currentQuestion &&
    markedForReview[currentQuestion._id];

  // =========================================================
  // SELECT OPTION
  // =========================================================

  const handleSelectOption = (
    questionId: string,
    option: string
  ) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // =========================================================
  // CLEAR ANSWER
  // =========================================================

  const handleClearAnswer = (
    questionId: string
  ) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev };

      delete updated[questionId];

      return updated;
    });
  };

  // =========================================================
  // BOOKMARK
  // =========================================================

  const handleToggleBookmark = (
    questionId: string
  ) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // =========================================================
  // GO TO QUESTION
  // =========================================================

  const handleGoToQuestion = (
    index: number
  ) => {
    setActiveQuestion(index);
    setShowQuestionList(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const handleNextQuestion = () => {
    if (
      activeQuestion <
      questions.length - 1
    ) {
      setActiveQuestion(
        (prev) => prev + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // PREVIOUS QUESTION
  // =========================================================

  const handlePreviousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(
        (prev) => prev - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // SUBMIT EXAM
  // =========================================================

  const handleSubmitExam = async (
    isAutoSubmit = false
  ) => {
    if (questions.length === 0) {
      return;
    }

    if (
      !isAutoSubmit &&
      answeredCount < questions.length
    ) {
      const confirmSubmit =
        window.confirm(
          `You have answered ${answeredCount} of ${questions.length} questions.\n\nDo you still want to submit the test?`
        );

      if (!confirmSubmit) {
        return;
      }
    }

    try {
      setSubmitting(true);

      // IMPORTANT:
      // Same token key used for GET and POST
      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Student session expired. Please login again."
        );

        return;
      }

      const submittedAnswers =
        Object.entries(
          selectedAnswers
        ).map(
          ([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })
        );

      const payload = {
        testType: "daily",
        testTitle,
        submittedAnswers,
      };

      console.log(
        "SUBMIT PAYLOAD:",
        payload
      );

      console.log(
        "SUBMIT URL:",
        `${API_URL}/api/daily-tests/submit`
      );

      const response =
        await axios.post(
          `${API_URL}/api/daily-tests/submit`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "SUBMIT RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setTestResult(
          response.data.result
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        alert(
          response.data.message ||
            "Failed to submit exam"
        );
      }
    } catch (err: any) {
      console.error(
        "Error submitting exam:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Backend error response:",
        err.response?.data
      );

      if (
        err.response?.status === 401
      ) {
        alert(
          "Your student session has expired. Please login again."
        );
      } else if (
        err.response?.status === 404
      ) {
        alert(
          "Submit API was not found on the backend. Please check the daily test submit route."
        );
      } else {
        alert(
          err.response?.data?.message ||
            "Failed to submit exam"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // QUESTION STATS
  // =========================================================

  const questionStats = useMemo(() => {
    return questions.map((q) => ({
      id: q._id,
      answered:
        selectedAnswers[q._id] !==
        undefined,
      marked:
        markedForReview[q._id] ||
        false,
    }));
  }, [
    questions,
    selectedAnswers,
    markedForReview,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="dt-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            className="dt-icon-box"
            style={{
              width: "96px",
              height: "96px",
              margin: "0 auto",
              borderRadius: "28px",
            }}
          />

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="dt-spinner"
              style={{
                width: "32px",
                height: "32px",
                borderWidth: "3px",
              }}
            />
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "20px",
            }}
          >
            Preparing Assessment
          </h2>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            Fetching latest daily
            questions...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div
        className="dt-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="dt-card"
          style={{
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
            border:
              "1px solid rgba(244, 63, 94, 0.2)",
          }}
        >
          <div className="dt-card-body">
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto",
                borderRadius: "16px",
                background:
                  "rgba(244, 63, 94, 0.1)",
                border:
                  "1px solid rgba(244, 63, 94, 0.2)",
                color: "#f43f5e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "20px",
              }}
            >
              Unable to Load Test
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginTop: "8px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="dt-btn-primary"
              style={{
                width: "100%",
                marginTop: "24px",
                justifyContent: "center",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RESULT VIEW
  // =========================================================

  if (testResult) {
    return (
      <div
        className="dt-wrapper"
        style={{
          padding: "32px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="dt-container"
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <div
            className="dt-card"
            style={{
              overflow: "hidden",
            }}
          >
            <div
              className="dt-card-body"
              style={{
                textAlign: "center",
              }}
            >
              <div
                className="dt-icon-box"
                style={{
                  width: "96px",
                  height: "96px",
                  margin: "0 auto",
                  borderRadius: "30px",
                  background:
                    "rgba(16, 185, 129, 0.1)",
                  border:
                    "1px solid rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                }}
              >
                <CheckCircle2 size={42} />
              </div>

              <p
                style={{
                  color: "#34d399",
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform:
                    "uppercase",
                  letterSpacing: "0.2em",
                  marginTop: "24px",
                }}
              >
                Test Completed
              </p>

              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  marginTop: "8px",
                }}
              >
                Great Work, {studentName}! 🎉
              </h1>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginTop: "12px",
                }}
              >
                Your Daily Assessment
                has been evaluated
                successfully.
              </p>

              <div
                style={{
                  marginTop: "36px",
                  borderRadius: "24px",
                  background:
                    "rgba(2, 6, 23, 0.7)",
                  border:
                    "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    textTransform:
                      "uppercase",
                    fontWeight: "bold",
                    letterSpacing:
                      "0.1em",
                  }}
                >
                  Final Score
                </p>

                <div
                  style={{
                    fontSize: "56px",
                    fontWeight: "900",
                    color: "#818cf8",
                    marginTop: "8px",
                  }}
                >
                  {Number(
                    testResult.score || 0
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <div className="dt-stat-card">
                  <p className="dt-stat-label">
                    Total
                  </p>

                  <p className="dt-stat-value">
                    {
                      testResult.totalQuestions
                    }
                  </p>
                </div>

                <div className="dt-stat-card emerald">
                  <p
                    className="dt-stat-label"
                    style={{
                      color: "#34d399",
                    }}
                  >
                    Correct
                  </p>

                  <p
                    className="dt-stat-value"
                    style={{
                      color: "#34d399",
                    }}
                  >
                    {
                      testResult.correctAnswers
                    }
                  </p>
                </div>

                <div
                  className="dt-stat-card"
                  style={{
                    background:
                      "rgba(244, 63, 94, 0.05)",
                    borderColor:
                      "rgba(244, 63, 94, 0.1)",
                  }}
                >
                  <p
                    className="dt-stat-label"
                    style={{
                      color: "#f43f5e",
                    }}
                  >
                    Wrong
                  </p>

                  <p
                    className="dt-stat-value"
                    style={{
                      color: "#f43f5e",
                    }}
                  >
                    {
                      testResult.wrongAnswers
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/student/dashboard"
                  )
                }
                className="dt-btn-primary"
                style={{
                  width: "100%",
                  marginTop: "28px",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <span>
                  Back to Dashboard
                </span>

                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PRE-TEST LANDING VIEW
  // =========================================================

  if (!testStarted) {
    return (
      <div
        className="dt-wrapper"
        style={{
          padding: "24px 16px",
        }}
      >
        <div
          className="dt-container"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div className="dt-card">
            <div className="dt-card-gradient-bar" />

            <div className="dt-card-body">
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "8px",
                      marginBottom:
                        "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="dt-badge">
                      Daily Assessment Hub
                    </span>

                    <span
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        color:
                          "#64748b",
                        fontSize:
                          "12px",
                      }}
                    >
                      <CalendarDays
                        size={13}
                      />

                      {today}
                    </span>
                  </div>

                  <h1 className="dt-title">
                    Today's Scheduled
                    Daily Test
                  </h1>

                  <p className="dt-subtitle">
                    Take your daily timed
                    challenge to sharpen
                    your concepts and
                    boost rank.
                  </p>
                </div>

                <div className="dt-candidate-box">
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(99, 102, 241, 0.1)",
                      color:
                        "#818cf8",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <UserCheck size={19} />
                  </div>

                  <div>
                    <p
                      style={{
                        fontSize:
                          "10px",
                        color:
                          "#64748b",
                        textTransform:
                          "uppercase",
                        fontWeight:
                          "bold",
                      }}
                    >
                      Candidate
                    </p>

                    <p
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          "bold",
                        color:
                          "#ffffff",
                        marginTop:
                          "2px",
                      }}
                    >
                      {studentName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "32px",
              marginBottom: "16px",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "10px",
              }}
            >
              <History
                size={20}
                color="#818cf8"
              />

              <h2
                style={{
                  fontSize:
                    "18px",
                  fontWeight:
                    "800",
                  color:
                    "#ffffff",
                }}
              >
                Recent & Active Daily
                Tests
              </h2>
            </div>
          </div>

          <div
            className="dt-card dt-active-test-card"
            style={{
              border:
                "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <div className="dt-card-body">
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  flexWrap:
                    "wrap",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth:
                      "220px",
                  }}
                >
                  <span
                    style={{
                      padding:
                        "5px 10px",
                      borderRadius:
                        "7px",
                      background:
                        "rgba(99, 102, 241, 0.15)",
                      color:
                        "#818cf8",
                      fontSize:
                        "11px",
                      fontWeight:
                        "800",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Daily Challenge #1
                  </span>

                  <h3
                    style={{
                      fontSize:
                        "20px",
                      fontWeight:
                        "800",
                      color:
                        "#ffffff",
                      marginTop:
                        "8px",
                    }}
                  >
                    {testTitle}
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "16px",
                      marginTop:
                        "10px",
                      fontSize:
                        "13px",
                      color:
                        "#94a3b8",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "5px",
                      }}
                    >
                      <CircleHelp
                        size={14}
                        color="#818cf8"
                      />

                      {questions.length}{" "}
                      Questions
                    </span>

                    <span
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "5px",
                      }}
                    >
                      <Clock3
                        size={14}
                        color="#fbbf24"
                      />

                      {Math.round(
                        timeLeft / 60
                      )}{" "}
                      Mins Timer
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setTestStarted(
                      true
                    )
                  }
                  className="dt-btn-primary"
                  style={{
                    padding:
                      "14px 24px",
                    fontSize:
                      "15px",
                    fontWeight:
                      "800",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <span>
                    Start Exam Now
                  </span>

                  <Play
                    size={18}
                    fill="currentColor"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACTIVE EXAM VIEW
  // =========================================================

  return (
    <div
      className="dt-wrapper"
      style={{
        padding: "24px 16px",
      }}
    >
      <div
        className="dt-container"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* HEADER + TIMER */}

        <div
          className="dt-card"
          style={{
            marginBottom: "20px",
          }}
        >
          <div className="dt-card-gradient-bar" />

          <div
            className="dt-card-body"
            style={{
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "12px",
                }}
              >
                <div
                  className="dt-icon-box"
                  style={{
                    width:
                      "42px",
                    height:
                      "42px",
                    borderRadius:
                      "12px",
                  }}
                >
                  <Timer size={20} />
                </div>

                <div>
                  <p
                    style={{
                      fontSize:
                        "10px",
                      color:
                        "#64748b",
                      textTransform:
                        "uppercase",
                      fontWeight:
                        "bold",
                    }}
                  >
                    Time Remaining
                  </p>

                  <p
                    style={{
                      fontSize:
                        "18px",
                      fontWeight:
                        "900",
                      color:
                        timeLeft <
                        300
                          ? "#f43f5e"
                          : "#34d399",
                      fontFamily:
                        "monospace",
                    }}
                  >
                    {formatTime(
                      timeLeft
                    )}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "12px",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                  className="dt-desktop-test-info"
                >
                  <p
                    style={{
                      fontSize:
                        "12px",
                      fontWeight:
                        "bold",
                      color:
                        "#ffffff",
                    }}
                  >
                    {testTitle}
                  </p>

                  <p
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "#64748b",
                    }}
                  >
                    {studentName}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleSubmitExam(
                      false
                    )
                  }
                  disabled={
                    submitting
                  }
                  className="dt-btn-success"
                  style={{
                    padding:
                      "10px 20px",
                    fontSize:
                      "13px",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Test"}
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "16px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "12px",
                  fontWeight:
                    "bold",
                  marginBottom:
                    "6px",
                }}
              >
                <span
                  style={{
                    color:
                      "#94a3b8",
                  }}
                >
                  Progress ({answeredCount} /{" "}
                  {questions.length}{" "}
                  Answered)
                </span>

                <span
                  style={{
                    color:
                      "#818cf8",
                  }}
                >
                  {progressPercentage}%
                </span>
              </div>

              <div className="dt-progress-bar-bg">
                <div
                  className="dt-progress-bar-fill"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION NAVIGATOR */}

        {questions.length > 0 && (
          <div
            className="dt-navigator-card"
            style={{
              marginBottom:
                "20px",
            }}
          >
            <button
              onClick={() =>
                setShowQuestionList(
                  (prev) => !prev
                )
              }
              className="dt-navigator-toggle"
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "12px",
                }}
              >
                <div
                  style={{
                    width:
                      "36px",
                    height:
                      "36px",
                    borderRadius:
                      "10px",
                    background:
                      "rgba(99, 102, 241, 0.1)",
                    color:
                      "#818cf8",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <ListChecks
                    size={18}
                  />
                </div>

                <div
                  style={{
                    textAlign:
                      "left",
                  }}
                >
                  <p
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        "bold",
                    }}
                  >
                    Question Palette
                  </p>

                  <p
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "#64748b",
                    }}
                  >
                    {answeredCount} answered
                    {" • "}
                    {markedCount} marked
                    for review
                  </p>
                </div>
              </div>

              <ChevronUp
                size={18}
                style={{
                  transform:
                    showQuestionList
                      ? "rotate(0deg)"
                      : "rotate(180deg)",
                  transition:
                    "transform 0.2s",
                }}
              />
            </button>

            {showQuestionList && (
              <div
                style={{
                  padding:
                    "0 20px 20px",
                  borderTop:
                    "1px solid rgba(255,255,255,0.05)",
                  paddingTop:
                    "16px",
                }}
              >
                <div className="dt-navigator-grid">
                  {questionStats.map(
                    (
                      item,
                      index
                    ) => {
                      const isActive =
                        activeQuestion ===
                        index;

                      let btnClass =
                        "dt-nav-btn";

                      if (
                        isActive
                      ) {
                        btnClass +=
                          " active";
                      } else if (
                        item.marked
                      ) {
                        btnClass +=
                          " marked";
                      } else if (
                        item.answered
                      ) {
                        btnClass +=
                          " answered";
                      }

                      return (
                        <button
                          key={
                            item.id
                          }
                          onClick={() =>
                            handleGoToQuestion(
                              index
                            )
                          }
                          className={
                            btnClass
                          }
                        >
                          {index + 1}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CURRENT QUESTION */}

        {currentQuestion && (
          <div
            className={`dt-question-card ${
              isCurrentAnswered
                ? "answered"
                : ""
            }`}
          >
            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap:
                  "12px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "8px",
                  flexWrap:
                    "wrap",
                }}
              >
                <span className="dt-subject-badge">
                  {currentQuestion.subject}
                </span>

                {currentQuestion.chapter && (
                  <span className="dt-chapter-badge">
                    {currentQuestion.chapter}
                  </span>
                )}
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "8px",
                  alignItems:
                    "center",
                  flexWrap:
                    "wrap",
                  justifyContent:
                    "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    handleToggleBookmark(
                      currentQuestion._id
                    )
                  }
                  className={`dt-review-btn ${
                    isCurrentMarked
                      ? "marked"
                      : ""
                  }`}
                >
                  <Bookmark
                    size={13}
                    fill={
                      isCurrentMarked
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {isCurrentMarked
                    ? "Marked"
                    : "Mark for Review"}
                </button>

                {isCurrentAnswered && (
                  <button
                    type="button"
                    onClick={() =>
                      handleClearAnswer(
                        currentQuestion._id
                      )
                    }
                    className="dt-clear-btn"
                  >
                    <RotateCcw
                      size={12}
                    />

                    Clear
                  </button>
                )}

                <span className="dt-question-count">
                  {activeQuestion + 1} /{" "}
                  {questions.length}
                </span>
              </div>
            </div>

            {/* QUESTION CONTENT */}

            <div
              style={{
                marginTop:
                  "28px",
              }}
            >
              <p
                style={{
                  fontSize:
                    "11px",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.2em",
                  color:
                    "#818cf8",
                  fontWeight:
                    "900",
                  marginBottom:
                    "14px",
                }}
              >
                Question{" "}
                {activeQuestion + 1}
              </p>

              {currentQuestion.imageUrl &&
                currentQuestion.imageUrl.trim() !==
                  "" && (
                  <div className="dt-question-image-wrap">
                    <img
                      src={
                        currentQuestion.imageUrl
                      }
                      alt={`Question ${
                        activeQuestion + 1
                      }`}
                      className="dt-question-image"
                      draggable={
                        false
                      }
                      onContextMenu={(
                        e
                      ) =>
                        e.preventDefault()
                      }
                      onError={(
                        e
                      ) => {
                        console.error(
                          "Question image failed:",
                          currentQuestion.imageUrl
                        );

                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

              <h2 className="dt-question-text">
                {currentQuestion.question}
              </h2>
            </div>

            {/* OPTIONS */}

            <div
              style={{
                marginTop:
                  "28px",
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "12px",
              }}
            >
              {currentQuestion.options?.map(
                (
                  option,
                  optIdx
                ) => {
                  const isSelected =
                    selectedAnswers[
                      currentQuestion._id
                    ] === option;

                  return (
                    <button
                      key={
                        optIdx
                      }
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          currentQuestion._id,
                          option
                        )
                      }
                      className={`dt-option-btn ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                    >
                      <span className="dt-opt-index">
                        {String.fromCharCode(
                          65 +
                            optIdx
                        )}
                      </span>

                      <span
                        style={{
                          flex: 1,
                          fontSize:
                            "15px",
                          lineHeight:
                            "1.5",
                          fontWeight:
                            isSelected
                              ? "600"
                              : "normal",
                          color:
                            isSelected
                              ? "#ffffff"
                              : "#cbd5e1",
                          textAlign:
                            "left",
                        }}
                      >
                        {option}
                      </span>

                      {isSelected && (
                        <span className="dt-selected-check">
                          <Check
                            size={
                              15
                            }
                            strokeWidth={
                              3
                            }
                          />
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* NAVIGATION */}

            <div
              style={{
                marginTop:
                  "32px",
                paddingTop:
                  "24px",
                borderTop:
                  "1px solid rgba(255,255,255,0.05)",
                display:
                  "flex",
                gap:
                  "12px",
                justifyContent:
                  "space-between",
              }}
            >
              <button
                type="button"
                disabled={
                  activeQuestion ===
                  0
                }
                onClick={
                  handlePreviousQuestion
                }
                className="dt-btn-secondary"
              >
                ← Previous
              </button>

              {activeQuestion <
              questions.length -
                1 ? (
                <button
                  type="button"
                  onClick={
                    handleNextQuestion
                  }
                  className="dt-btn-primary"
                >
                  <span>
                    Next Question
                  </span>

                  <ArrowRight
                    size={
                      17
                    }
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleSubmitExam(
                      false
                    )
                  }
                  disabled={
                    submitting
                  }
                  className="dt-btn-success"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Test"}

                  <CheckCircle2
                    size={
                      18
                    }
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTest;

