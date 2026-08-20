import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flag,
  Send,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./Exam.css";

// ============================================================
// LOCAL BACKEND
// ============================================================

const API_BASE_URL = "http://localhost:5000";

// ============================================================
// TYPES
// ============================================================

interface Question {
  _id?: string;

  questionId?: string;

  questionNumber?: number;

  subjectQuestionNumber?: number;

  globalQuestionNumber?: number;

  question: string;

  options: string[];

  correctAnswer?: string;

  ansNumber?: string;

  explanation?: string;

  subject?: string;

  chapter?: string;

  testTitle?: string;

  testId?: string;

  examType?: string;

  academicYear?: string;

  testCategory?: string;

  imageUrl?: string;
}

interface SubjectExamData {
  title: string;

  subject: string;

  chapter: string;

  duration: number;

  totalQuestions: number;

  questions: Question[];
}

// ============================================================
// COMPONENT
// ============================================================

export default function SubjectsExam() {
  const navigate = useNavigate();

  const { id } = useParams();

  // ==========================================================
  // STUDENT
  // ==========================================================

  const student = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("student") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  // ==========================================================
  // STATES
  // ==========================================================

  const [test, setTest] =
    useState<SubjectExamData | null>(null);

  const [current, setCurrent] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [time, setTime] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // DEBUG TEST ID
  // ==========================================================

  useEffect(() => {
    console.log(
      "======================================"
    );

    console.log(
      "📘 SUBJECT EXAM PAGE"
    );

    console.log(
      "📌 URL PARAM ID:",
      id
    );

    console.log(
      "📌 API BASE URL:",
      API_BASE_URL
    );

    console.log(
      "======================================"
    );
  }, [id]);

  // ==========================================================
  // FETCH SUBJECT EXAM
  // ==========================================================

  useEffect(() => {
    if (!id) {
      setError("Invalid test ID.");
      setLoading(false);
      return;
    }

    const fetchSubjectExam = async () => {
      try {
        setLoading(true);
        setError("");

        // ====================================================
        // CORRECT GET URL
        // GET /api/subject-exams/:id
        // ====================================================

        const examUrl =
          `${API_BASE_URL}/api/subject-exams/${encodeURIComponent(
            id
          )}`;

        console.log(
          "📥 GET SUBJECT EXAM:",
          examUrl
        );

        const response =
          await fetch(examUrl);

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!response.ok) {
          const text =
            await response.text();

          console.error(
            "❌ SUBJECT EXAM API ERROR:",
            response.status,
            text
          );

          throw new Error(
            `Unable to load subject exam (${response.status})`
          );
        }

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "❌ EXPECTED JSON BUT RECEIVED:",
            text
          );

          throw new Error(
            "Server returned an invalid response."
          );
        }

        const data =
          await response.json();

        console.log(
          "📚 SUBJECT EXAM RESPONSE:",
          data
        );

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Subject exam not found."
          );
        }

        // ====================================================
        // EXAM DATA
        // ====================================================

        const exam =
          data.exam ||
          data.test;

        if (!exam) {
          throw new Error(
            "Subject exam data not found."
          );
        }

        // ====================================================
        // QUESTIONS
        // ====================================================

        const questions =
          Array.isArray(
            data.questions
          )
            ? data.questions
            : Array.isArray(
                exam.questions
              )
            ? exam.questions
            : [];

        if (
          questions.length === 0
        ) {
          throw new Error(
            "No questions found for this test."
          );
        }

        // ====================================================
        // NORMALIZE EXAM
        // ====================================================

        const normalizedExam: SubjectExamData =
          {
            title:
              exam.title ||
              exam.testTitle ||
              "Subject Exam",

            subject:
              exam.subject ||
              questions[0]?.subject ||
              "",

            chapter:
              exam.chapter ||
              questions[0]?.chapter ||
              "",

            duration:
              Number(
                exam.duration
              ) || 180,

            totalQuestions:
              questions.length,

            questions,
          };

        console.log(
          "✅ NORMALIZED EXAM:",
          normalizedExam
        );

        setTest(
          normalizedExam
        );

        setTime(
          normalizedExam.duration *
            60
        );

      } catch (err: any) {
        console.error(
          "❌ SUBJECT EXAM ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load subject exam."
        );

        setTest(null);

      } finally {
        setLoading(false);
      }
    };

    fetchSubjectExam();

  }, [id]);

  // ==========================================================
  // TIMER
  // ==========================================================

  useEffect(() => {
    if (
      loading ||
      !test ||
      time <= 0 ||
      submitting
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setTime((previous) => {
          if (previous <= 1) {
            window.clearInterval(
              timer
            );

            return 0;
          }

          return previous - 1;
        });
      }, 1000);

    return () =>
      window.clearInterval(
        timer
      );

  }, [
    loading,
    test,
    time,
    submitting,
  ]);

  // ==========================================================
  // TIME FORMAT
  // ==========================================================

  const formatTime = () => {
    const minutes =
      Math.floor(
        time / 60
      );

    const seconds =
      time % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const question =
    test?.questions[current];

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  const selectAnswer = (
    option: string
  ) => {
    setAnswers(
      (previous) => ({
        ...previous,

        [current]:
          option,
      })
    );
  };

  // ==========================================================
  // NEXT
  // ==========================================================

  const nextQuestion = () => {
    if (!test) {
      return;
    }

    if (
      current <
      test.questions.length - 1
    ) {
      setCurrent(
        (previous) =>
          previous + 1
      );
    }
  };

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  const previousQuestion = () => {
    if (
      current > 0
    ) {
      setCurrent(
        (previous) =>
          previous - 1
      );
    }
  };

  // ==========================================================
  // GO TO QUESTION
  // ==========================================================

  const goToQuestion = (
    index: number
  ) => {
    if (!test) {
      return;
    }

    if (
      index >= 0 &&
      index <
        test.questions.length
    ) {
      setCurrent(index);
    }
  };

  // ==========================================================
  // START SUBJECT SESSION
  // ==========================================================

  const startSubjectSession =
    async () => {
      if (!id) {
        throw new Error(
          "Invalid subject exam ID."
        );
      }

      const studentId =
        student?.studentId ||
        student?.id ||
        "";

      if (!studentId) {
        throw new Error(
          "Student information not found. Please login again."
        );
      }

      // ====================================================
      // CORRECT START URL
      //
      // POST /api/subject-exams/:id/start
      // ====================================================

      const startUrl =
        `${API_BASE_URL}/api/subject-exams/${encodeURIComponent(
          id
        )}/start`;

      console.log(
        "▶️ START SUBJECT EXAM URL:",
        startUrl
      );

      console.log(
        "▶️ STUDENT ID:",
        studentId
      );

      console.log(
        "▶️ EXAM ID:",
        id
      );

      const response =
        await fetch(
          startUrl,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                studentId:
                  String(
                    studentId
                  ),

                examId:
                  String(id),
              }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (!response.ok) {
        const text =
          await response.text();

        console.error(
          "❌ START SUBJECT EXAM ERROR:",
          response.status,
          text
        );

        throw new Error(
          `Unable to start subject exam (${response.status})`
        );
      }

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "❌ INVALID START RESPONSE:",
          text
        );

        throw new Error(
          "Invalid server response."
        );
      }

      const data =
        await response.json();

      console.log(
        "▶️ START SUBJECT EXAM RESPONSE:",
        data
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to start exam."
        );
      }

      if (
        !data?.sessionId
      ) {
        throw new Error(
          "Exam session was not created."
        );
      }

      console.log(
        "✅ SESSION ID:",
        data.sessionId
      );

      return String(
        data.sessionId
      );
    };

  // ==========================================================
  // SUBMIT EXAM
  // ==========================================================

  const submitExam =
    async () => {
      if (
        !test ||
        submitting
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to submit this exam?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setSubmitting(true);

        const studentId =
          student?.studentId ||
          student?.id ||
          "";

        if (!studentId) {
          throw new Error(
            "Student information not found. Please login again."
          );
        }

        // ====================================================
        // START SESSION
        // ====================================================

        const sessionId =
          await startSubjectSession();

        // ====================================================
        // FORMAT ANSWERS
        // ====================================================

        const formattedAnswers =
          test.questions.map(
            (
              question,
              index
            ) => ({
              questionId:
                String(
                  question._id ||
                    question.questionId ||
                    ""
                ),

              answer:
                String(
                  answers[index] ||
                    ""
                ),
            })
          );

        console.log(
          "📤 SUBMIT ANSWERS:",
          formattedAnswers
        );

        // ====================================================
        // CORRECT SUBMIT URL
        //
        // POST /api/subject-exams/:id/submit
        // ====================================================

        const submitUrl =
          `${API_BASE_URL}/api/subject-exams/${encodeURIComponent(
            id || ""
          )}/submit`;

        console.log(
          "📤 SUBMIT SUBJECT EXAM URL:",
          submitUrl
        );

        const response =
          await fetch(
            submitUrl,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  studentId:
                    String(
                      studentId
                    ),

                  studentName:
                    String(
                      student?.name ||
                        ""
                    ),

                  sessionId:
                    sessionId,

                  answers:
                    formattedAnswers,

                  warnings:
                    0,

                  timeTaken:
                    test.duration *
                      60 -
                    time,
                }),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!response.ok) {
          const text =
            await response.text();

          console.error(
            "❌ SUBJECT RESULT API ERROR:",
            response.status,
            text
          );

          throw new Error(
            `Unable to submit subject exam (${response.status})`
          );
        }

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "❌ INVALID SUBMIT RESPONSE:",
            text
          );

          throw new Error(
            "Invalid server response."
          );
        }

        const data =
          await response.json();

        console.log(
          "📊 SUBJECT RESULT RESPONSE:",
          data
        );

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Exam submission failed."
          );
        }

        // ====================================================
        // SUCCESS
        // ====================================================

        alert(
          "Exam Submitted Successfully"
        );

        // ====================================================
        // RESULT ID
        // ====================================================

        const resultId =
          data?.result?.id ||
          data?.result?._id;

        if (resultId) {
          navigate(
            `/result/${resultId}`
          );
        } else {
          navigate(
            "/result"
          );
        }

      } catch (err: any) {
        console.error(
          "❌ SUBMIT EXAM ERROR:",
          err
        );

        alert(
          err?.message ||
            "Submit Failed"
        );

        setSubmitting(false);
      }
    };

  // ==========================================================
  // AUTO SUBMIT MESSAGE WHEN TIME ENDS
  // ==========================================================

  useEffect(() => {
    if (
      test &&
      time === 0 &&
      !loading &&
      !submitting
    ) {
      alert(
        "Time is over. Please submit your exam."
      );
    }
  }, [
    test,
    time,
    loading,
    submitting,
  ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="exam-page">

        <div className="exam-loading">

          <div className="exam-loading-spinner" />

          <h2>
            Loading Subject Exam...
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error ||
    !test ||
    !question
  ) {
    return (
      <div className="exam-page">

        <div className="exam-error">

          <h2>
            Subject Exam Not Found
          </h2>

          <p>
            {error ||
              "Unable to load this exam."}
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
          >

            <ArrowLeft
              size={17}
            />

            Go Back

          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ANSWERED COUNT
  // ==========================================================

  const answeredCount =
    Object.keys(
      answers
    ).length;

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress =
    ((current + 1) /
      test.questions.length) *
    100;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="exam-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="exam-header">

        <div>

          <h2>
            {test.title}
          </h2>

          <p>
            {test.subject}

            {test.chapter
              ? ` • ${test.chapter}`
              : ""}
          </p>

          <p>
            Question{" "}
            {current + 1}{" "}
            of{" "}
            {test.questions.length}
          </p>

        </div>

        <div className="timer">

          <Clock3
            size={18}
          />

          {formatTime()}

        </div>

      </header>

      {/* ====================================================
          QUESTION NAVIGATION
      ==================================================== */}

      <div className="exam-question-navigation">

        <div className="exam-question-nav-header">

          <strong>
            Questions
          </strong>

          <span>
            {answeredCount}/
            {test.questions.length}
            {" "}
            answered
          </span>

        </div>

        <div className="exam-question-numbers">

          {test.questions.map(
            (
              _,
              index
            ) => (

              <button
                key={index}
                type="button"
                onClick={() =>
                  goToQuestion(
                    index
                  )
                }
                className={
                  index === current
                    ? "active"
                    : answers[index]
                    ? "answered"
                    : ""
                }
              >
                {index + 1}
              </button>

            )
          )}

        </div>

      </div>

      {/* ====================================================
          PROGRESS
      ==================================================== */}

      <div className="progress">

        <div
          className="progress-fill"
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

      {/* ====================================================
          QUESTION CARD
      ==================================================== */}

      <div className="question-card">

        <div className="question-card-top">

          <span>
            Question{" "}
            {current + 1}
          </span>

          {answers[current] && (
            <span className="answered-badge">

              <CheckCircle2
                size={15}
              />

              Answered

            </span>
          )}

        </div>

        <h3>
          {question.question}
        </h3>

        {/* ==================================================
            OPTIONS
        ================================================== */}

        <div className="options">

          {question.options.map(
            (
              option,
              index
            ) => (

              <label
                key={`${option}-${index}`}
                className={
                  answers[current] ===
                  option
                    ? "option active"
                    : "option"
                }
              >

                <input
                  type="radio"
                  name={`question-${current}`}
                  checked={
                    answers[current] ===
                    option
                  }
                  onChange={() =>
                    selectAnswer(
                      option
                    )
                  }
                />

                <span className="option-letter">

                  {String.fromCharCode(
                    65 + index
                  )}

                </span>

                <span>
                  {option}
                </span>

              </label>

            )
          )}

        </div>

      </div>

      {/* ====================================================
          BOTTOM CONTROLS
      ==================================================== */}

      <div className="bottom-buttons">

        <button
          className="previous-btn"
          onClick={
            previousQuestion
          }
          disabled={
            current === 0 ||
            submitting
          }
        >

          <ArrowLeft
            size={17}
          />

          Previous

        </button>

        {current <
        test.questions.length - 1 ? (

          <button
            className="next-btn"
            onClick={
              nextQuestion
            }
            disabled={
              submitting
            }
          >

            Next

            <ArrowRight
              size={17}
            />

          </button>

        ) : (

          <button
            className="submit-btn"
            onClick={
              submitExam
            }
            disabled={
              submitting
            }
          >

            <Send
              size={17}
            />

            {submitting
              ? "Submitting..."
              : "Submit Exam"}

          </button>

        )}

      </div>

      {/* ====================================================
          EXAM INFO
      ==================================================== */}

      <div className="exam-footer-info">

        <div>

          <Flag
            size={16}
          />

          <span>
            Answered:{" "}
            {answeredCount}
          </span>

        </div>

        <div>

          <BookOpen
            size={16}
          />

          <span>
            Total:{" "}
            {test.questions.length}
          </span>

        </div>

        <div>

          <Clock3
            size={16}
          />

          <span>
            Time:{" "}
            {formatTime()}
          </span>

        </div>

      </div>

    </div>
  );
}