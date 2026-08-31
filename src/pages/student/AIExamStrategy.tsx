import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Lightbulb,
  Loader2,
  RefreshCw,
  RotateCcw,
 Orbit,
  Target,
  Trophy,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./AIExamStrategy.css";

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

type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

interface StudentData {
  name: string;
  email: string;
  studentId: string;
  classId: string;
  className: string;
  academicYear: string;
  section: string;
}

interface StudyGuide {
  title: string;
  subject: string;
  chapter: string;
  lesson: string;
  points: string[];
  formulas: string[];
  examTips: string[];
}

interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ResultData {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  percentage: number;
}

// ============================================================
// TOKEN
// ============================================================

const getToken = () =>
  localStorage.getItem("studentToken") ||
  localStorage.getItem("token") ||
  "";

// ============================================================
// JWT PAYLOAD
// ============================================================

const getStudentIdFromToken = (
  token: string
): string => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return "";
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return payload?.studentId || "";
  } catch {
    return "";
  }
};

// ============================================================
// COMPONENT
// ============================================================

export default function AIExamStrategy() {
  const navigate = useNavigate();

  // ==========================================================
  // STUDENT
  // ==========================================================

  const [student, setStudent] =
    useState<StudentData | null>(null);

  const [loadingStudent, setLoadingStudent] =
    useState(true);

  // ==========================================================
  // SESSION
  // ==========================================================

  const [subject, setSubject] =
    useState("");

  const [chapter, setChapter] =
    useState("");

  const [lesson, setLesson] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [questionCount, setQuestionCount] =
    useState(10);

  // ==========================================================
  // FLOW
  // ==========================================================

  const [step, setStep] =
    useState<
      "setup" | "guide" | "exam" | "result"
    >("setup");

  const [loadingGuide, setLoadingGuide] =
    useState(false);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [studyGuide, setStudyGuide] =
    useState<StudyGuide | null>(null);

  const [questions, setQuestions] =
    useState<AIQuestion[]>([]);

  const [answers, setAnswers] =
    useState<Record<string, number>>({});

  const [marked, setMarked] =
    useState<Record<string, boolean>>({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [result, setResult] =
    useState<ResultData | null>(null);

  const [error, setError] =
    useState("");

  // ==========================================================
  // FETCH STUDENT PROFILE
  // ==========================================================

  useEffect(() => {
    const fetchStudentProfile =
      async () => {
        try {
          setLoadingStudent(true);

          const token = getToken();

          if (!token) {
            setError(
              "Student login required."
            );

            return;
          }

          const studentId =
            getStudentIdFromToken(token);

          if (!studentId) {
            setError(
              "Student information not found."
            );

            return;
          }

          const response =
            await fetch(
              `${API_BASE_URL}/api/student/profile/${studentId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to load student profile."
            );
          }

          if (!data?.student) {
            throw new Error(
              "Student profile not found."
            );
          }

          setStudent(data.student);
        } catch (error: any) {
          console.error(
            "Student profile error:",
            error
          );

          setError(
            error?.message ||
              "Unable to load student profile."
          );
        } finally {
          setLoadingStudent(false);
        }
      };

    fetchStudentProfile();
  }, []);

  // ==========================================================
  // ANSWERED COUNT
  // ==========================================================

  const answeredCount = useMemo(
    () =>
      Object.keys(answers).length,
    [answers]
  );

  // ==========================================================
  // EXAM PROGRESS
  // ==========================================================

  const examProgress = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    return Math.round(
      ((currentQuestion + 1) /
        questions.length) *
        100
    );
  }, [
    currentQuestion,
    questions,
  ]);

  const current =
    questions[currentQuestion];

  // ==========================================================
  // TIMER
  // ==========================================================

  useEffect(() => {
    if (step !== "exam") {
      return;
    }

    if (secondsLeft <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setSecondsLeft(
          (previous) =>
            Math.max(0, previous - 1)
        );
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [
    step,
    secondsLeft,
  ]);

  // ==========================================================
  // AUTO SUBMIT WHEN TIMER ENDS
  // ==========================================================

  useEffect(() => {
    if (
      step === "exam" &&
      questions.length > 0 &&
      secondsLeft === 0
    ) {
      submitExam();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    secondsLeft,
    step,
    questions.length,
  ]);

  // ==========================================================
  // FORMAT TIMER
  // ==========================================================

  const formatTimer = (
    seconds: number
  ) => {
    const mins =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ==========================================================
  // GENERATE STUDY GUIDE
  // ==========================================================

  const generateStudyGuide =
    async () => {
      if (
        !subject.trim() ||
        !chapter.trim()
      ) {
        setError(
          "Please enter your subject and chapter."
        );

        return;
      }

      if (!student) {
        setError(
          "Student profile is still loading."
        );

        return;
      }

      setError("");
      setLoadingGuide(true);

      try {
        const token = getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/ai-strategy/study-guide`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                subject:
                  subject.trim(),

                chapter:
                  chapter.trim(),

                lesson:
                  lesson.trim(),

                studentContext: {
                  academicYear:
                    student.academicYear,

                  className:
                    student.className,

                  section:
                    student.section,

                  studentId:
                    student.studentId,
                },
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "AI study session could not be created."
          );
        }

        if (!data?.studyGuide) {
          throw new Error(
            "AI did not return a valid study guide."
          );
        }

        setStudyGuide(
          data.studyGuide
        );

        setStep("guide");
      } catch (error: any) {
        console.error(
          "Study guide error:",
          error
        );

        setError(
          error?.message ||
            "Unable to generate AI study session."
        );
      } finally {
        setLoadingGuide(false);
      }
    };

  // ==========================================================
  // GENERATE QUESTIONS
  // ==========================================================

  const generateQuestions =
    async () => {
      if (!studyGuide) {
        return;
      }

      if (!student) {
        setError(
          "Student profile not available."
        );

        return;
      }

      setLoadingQuestions(true);
      setError("");

      try {
        const token = getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/ai-strategy/generate-questions`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                subject,
                chapter,
                lesson,
                difficulty,
                count: questionCount,
                studyGuide,

                studentContext: {
                  academicYear:
                    student.academicYear,

                  className:
                    student.className,

                  section:
                    student.section,

                  studentId:
                    student.studentId,
                },
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to generate AI questions."
          );
        }

        if (
          !Array.isArray(
            data?.questions
          ) ||
          !data.questions.length
        ) {
          throw new Error(
            "AI did not return valid questions."
          );
        }

        setQuestions(
          data.questions
        );

        setAnswers({});
        setMarked({});
        setCurrentQuestion(0);

        setSecondsLeft(
          data.questions.length * 60
        );

        setResult(null);
        setStep("exam");
      } catch (error: any) {
        console.error(
          "Question generation error:",
          error
        );

        setError(
          error?.message ||
            "Unable to generate AI questions."
        );
      } finally {
        setLoadingQuestions(false);
      }
    };

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  const selectAnswer = (
    answerIndex: number
  ) => {
    if (!current) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [current.id]:
          answerIndex,
      })
    );
  };

  // ==========================================================
  // MARK
  // ==========================================================

  const toggleMark = () => {
    if (!current) {
      return;
    }

    setMarked(
      (previous) => ({
        ...previous,
        [current.id]:
          !previous[current.id],
      })
    );
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const submitExam = () => {
    if (!questions.length) {
      return;
    }

    let correct = 0;

    questions.forEach(
      (question) => {
        if (
          answers[question.id] ===
          question.correctAnswer
        ) {
          correct++;
        }
      }
    );

    const unanswered =
      questions.length -
      Object.keys(answers).length;

    const wrong =
      questions.length -
      correct -
      unanswered;

    const percentage =
      Math.round(
        (correct /
          questions.length) *
          100
      );

    // IMPORTANT:
    // Result is NOT saved to MongoDB.
    // It is only shown in frontend.

    setResult({
      correct,
      wrong,
      unanswered,
      total: questions.length,
      percentage,
    });

    setStep("result");
  };

  // ==========================================================
  // GENERATE AGAIN
  // ==========================================================

  const generateAgain = () => {
    setResult(null);
    setAnswers({});
    setMarked({});
    setCurrentQuestion(0);

    generateQuestions();
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetSession = () => {
    setStep("setup");

    setStudyGuide(null);

    setQuestions([]);

    setAnswers({});

    setMarked({});

    setResult(null);

    setCurrentQuestion(0);

    setSecondsLeft(0);

    setError("");
  };

  // ==========================================================
  // LOADING STUDENT
  // ==========================================================

  if (
    loadingStudent &&
    !student
  ) {
    return (
      <div className="ai-strategy-page">
        <main className="ai-strategy-content">
          <section className="ai-generator-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: "10px",
                padding: "40px",
              }}
            >
              <Loader2
                size={22}
                className="ai-strategy-spinner"
              />

              <span>
                Preparing your personalized
                learning session...
              </span>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // SETUP
  // ==========================================================

  if (step === "setup") {
    return (
      <div className="ai-strategy-page">

        <div className="ai-strategy-orb ai-strategy-orb-one" />
        <div className="ai-strategy-orb ai-strategy-orb-two" />

        <header className="ai-strategy-header">
          <div className="ai-strategy-header-inner">

            <button
              className="ai-strategy-back"
              onClick={() =>
                navigate(
                  "/academic-help"
                )
              }
            >
              <ArrowLeft size={18} />

              <span>
                Academic Help
              </span>
            </button>

          </div>
        </header>

        <section className="ai-strategy-hero">

          <div className="ai-strategy-hero-inner">

            <div className="ai-strategy-eyebrow">
              <Brain size={15} />

              EXAMMASTER AI •
              PERSONALIZED LEARNING
            </div>

            <h1>
              Learn smarter.
              <br />

              <span>
                Test your understanding.
              </span>
            </h1>

            <p>
              Build a personalized
              academic learning session
              based on your subject,
              chapter and study level.
            </p>

            {/* STUDENT ACADEMIC CONTEXT */}

            {student && (
              <div
                className="ai-student-context"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >

                <span>
                  {student.academicYear}
                </span>

                <span>
                  {student.className}
                </span>

                <span>
                  Section{" "}
                  {student.section}
                </span>

              </div>
            )}

          </div>

        </section>

        <main className="ai-strategy-content">

          <section className="ai-generator-card">

            <div className="ai-generator-heading">

              <div className="ai-generator-icon">
                <Orbit size={22} />
              </div>

              <div>

                <span>
                  PERSONALIZED AI LEARNING
                </span>

                <h2>
                  Build Your Learning Session
                </h2>

              </div>

            </div>

            {error && (
              <div className="ai-strategy-inline-error">

                <X size={17} />

                {error}

              </div>
            )}

            <div className="ai-generator-form">

              <div className="ai-generator-field">

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Physics"
                />

              </div>

              <div className="ai-generator-field">

                <label>
                  Chapter
                </label>

                <input
                  type="text"
                  value={chapter}
                  onChange={(e) =>
                    setChapter(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Laws of Motion"
                />

              </div>

              <div className="ai-generator-field">

                <label>
                  Lesson / Topic
                </label>

                <input
                  type="text"
                  value={lesson}
                  onChange={(e) =>
                    setLesson(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Newton's Laws"
                />

              </div>

              <div className="ai-generator-field">

                <label>
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value as Difficulty
                    )
                  }
                >
                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>
                </select>

              </div>

              <div className="ai-generator-field">

                <label>
                  Questions
                </label>

                <select
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  <option value={5}>
                    5 Questions
                  </option>

                  <option value={10}>
                    10 Questions
                  </option>

                  <option value={15}>
                    15 Questions
                  </option>

                  <option value={20}>
                    20 Questions
                  </option>
                </select>

              </div>

              <button
                className="generate-ai-button"
                onClick={
                  generateStudyGuide
                }
                disabled={
                  loadingGuide ||
                  !student
                }
              >

                {loadingGuide ? (
                  <>
                    <Loader2
                      size={18}
                      className="ai-strategy-spinner"
                    />

                    Preparing AI Session...
                  </>
                ) : (
                  <>
                    <Orbit size={18} />

                    Start AI Learning Session
                  </>
                )}

              </button>

            </div>

          </section>

          <section className="ai-feature-strip">

            <div>
              <Brain size={19} />

              <span>
                AI Concepts
              </span>
            </div>

            <div>
              <BookOpen size={19} />

              <span>
                Important Points
              </span>
            </div>

            <div>
              <Target size={19} />

              <span>
                Smart Questions
              </span>
            </div>

            <div>
              <BarChart3 size={19} />

              <span>
                Instant Result
              </span>
            </div>

          </section>

        </main>
      </div>
    );
  }

  // ==========================================================
  // STUDY GUIDE
  // ==========================================================

  if (
    step === "guide" &&
    studyGuide
  ) {
    return (
      <div className="ai-strategy-page">

        <header className="ai-strategy-header">

          <div className="ai-strategy-header-inner">

            <button
              className="ai-strategy-back"
              onClick={resetSession}
            >
              <ChevronLeft size={18} />

              New Session
            </button>

          </div>

        </header>

        <main className="ai-strategy-content">

          <section className="guide-hero-card">

            <div className="guide-ai-icon">
              <Brain size={28} />
            </div>

            <div>

              <span>
                PERSONALIZED AI STUDY SESSION
              </span>

              <h1>
                {studyGuide.title}
              </h1>

              <p>
                {studyGuide.subject}
                {" • "}
                {studyGuide.chapter}

                {studyGuide.lesson
                  ? ` • ${studyGuide.lesson}`
                  : ""}
              </p>

              {student && (
                <p>
                  {student.academicYear}
                  {" • "}
                  {student.className}
                  {" • Section "}
                  {student.section}
                </p>
              )}

            </div>

          </section>

          <div className="guide-layout">

            <section className="guide-main-card">

              <div className="guide-section-heading">

                <div className="guide-section-icon">
                  <Lightbulb size={20} />
                </div>

                <div>

                  <span>
                    MASTER THE BASICS
                  </span>

                  <h2>
                    20 Important Points
                  </h2>

                </div>

              </div>

              <div className="concept-list">

                {studyGuide.points.map(
                  (
                    point,
                    index
                  ) => (
                    <div
                      className="concept-item"
                      key={index}
                    >

                      <div className="concept-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <p>
                        {point}
                      </p>

                      <CheckCircle2
                        size={18}
                      />

                    </div>
                  )
                )}

              </div>

              <div className="guide-complete-box">

                <div>

                  <CheckCircle2 size={22} />

                  <div>

                    <strong>
                      Ready to test your understanding?
                    </strong>

                    <p>
                      Generate AI questions
                      from the concepts you
                      just studied.
                    </p>

                  </div>

                </div>

                <button
                  onClick={
                    generateQuestions
                  }
                  disabled={
                    loadingQuestions
                  }
                >

                  {loadingQuestions ? (
                    <>
                      <Loader2
                        size={17}
                        className="ai-strategy-spinner"
                      />

                      Generating...
                    </>
                  ) : (
                    <>
                      Generate AI Questions

                      <ArrowRight
                        size={17}
                      />
                    </>
                  )}

                </button>

              </div>

            </section>

            <aside className="guide-sidebar">

              <div className="guide-side-card">

                <div className="guide-side-title">

                  <Target size={18} />

                  KEY FORMULAS & FACTS

                </div>

                {studyGuide.formulas.map(
                  (
                    formula,
                    index
                  ) => (
                    <div
                      className="formula-item"
                      key={index}
                    >
                      {formula}
                    </div>
                  )
                )}

              </div>

              <div className="guide-side-card tips">

                <div className="guide-side-title">

                  <Target size={18} />

                  EXAM TIPS

                </div>

                {studyGuide.examTips.map(
                  (
                    tip,
                    index
                  ) => (
                    <div
                      className="tip-item"
                      key={index}
                    >

                      <Check
                        size={15}
                      />

                      <span>
                        {tip}
                      </span>

                    </div>
                  )
                )}

              </div>

            </aside>

          </div>

        </main>

      </div>
    );
  }

  // ==========================================================
  // EXAM
  // ==========================================================

  if (
    step === "exam" &&
    current
  ) {
    return (
      <div className="ai-strategy-page exam-mode">

        <header className="ai-exam-header">

          <button
            onClick={() =>
              setStep("guide")
            }
            className="ai-strategy-back"
          >
            <ArrowLeft size={18} />

            Study Guide
          </button>

          <div className="exam-header-center">

            <Brain size={19} />

            AI PRACTICE TEST

          </div>

          <div className="exam-timer">

            <Clock3 size={17} />

            {formatTimer(
              secondsLeft
            )}

          </div>

        </header>

        <main className="exam-content">

          <div className="exam-meta">

            <div>

              <span>
                {subject}
              </span>

              <strong>
                {chapter}
              </strong>

            </div>

            <div className="exam-score-meta">

              <strong>
                {answeredCount}
              </strong>

              <span>
                {" "}
                / {questions.length}
                {" "}
                answered
              </span>

            </div>

          </div>

          <div className="exam-progress-track">

            <span
              style={{
                width:
                  `${examProgress}%`,
              }}
            />

          </div>

          <section className="question-card">

            <div className="question-card-top">

              <span className="question-number">

                QUESTION{" "}

                {String(
                  currentQuestion + 1
                ).padStart(
                  2,
                  "0"
                )}

              </span>

              <button
                className={`mark-button ${
                  marked[
                    current.id
                  ]
                    ? "marked"
                    : ""
                }`}
                onClick={
                  toggleMark
                }
              >

                <Target size={16} />

                {marked[
                  current.id
                ]
                  ? "Marked"
                  : "Mark for review"}

              </button>

            </div>

            <h1>
              {current.question}
            </h1>

            <div className="exam-options">

              {current.options.map(
                (
                  option,
                  index
                ) => {

                  const selected =
                    answers[
                      current.id
                    ] === index;

                  return (
                    <button
                      key={index}
                      className={`exam-option ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectAnswer(
                          index
                        )
                      }
                    >

                      <span className="option-letter">

                        {String.fromCharCode(
                          65 + index
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                      {selected && (
                        <Check
                          size={18}
                        />
                      )}

                    </button>
                  );
                }
              )}

            </div>

            <div className="question-navigation">

              <button
                className="exam-secondary-button"
                disabled={
                  currentQuestion ===
                  0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (value) =>
                      Math.max(
                        0,
                        value - 1
                      )
                  )
                }
              >

                <ChevronLeft
                  size={17}
                />

                Previous

              </button>

              {currentQuestion <
              questions.length - 1 ? (
                <button
                  className="exam-primary-button"
                  onClick={() =>
                    setCurrentQuestion(
                      (value) =>
                        Math.min(
                          questions.length -
                            1,
                          value + 1
                        )
                    )
                  }
                >

                  Next Question

                  <ArrowRight
                    size={17}
                  />

                </button>
              ) : (
                <button
                  className="exam-submit-button"
                  onClick={
                    submitExam
                  }
                >

                  Submit Test

                  <CheckCircle2
                    size={18}
                  />

                </button>
              )}

            </div>

          </section>

          <div className="question-dots">

            {questions.map(
              (
                question,
                index
              ) => (
                <button
                  key={
                    question.id
                  }
                  className={`
                    ${
                      index ===
                      currentQuestion
                        ? "active"
                        : ""
                    }

                    ${
                      answers[
                        question.id
                      ] !== undefined
                        ? "answered"
                        : ""
                    }

                    ${
                      marked[
                        question.id
                      ]
                        ? "review"
                        : ""
                    }
                  `}
                  onClick={() =>
                    setCurrentQuestion(
                      index
                    )
                  }
                >
                  {index + 1}
                </button>
              )
            )}

          </div>

        </main>

      </div>
    );
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  if (
    step === "result" &&
    result
  ) {
    return (
      <div className="ai-strategy-page">

        <main className="ai-strategy-content">

          <section className="result-hero">

            <div className="result-trophy">

              <Trophy size={32} />

            </div>

            <span>
              AI PRACTICE SESSION COMPLETED
            </span>

            <h1>
              {result.percentage}%
            </h1>

            <p>
              {result.correct}
              {" "}
              correct out of{" "}
              {result.total}
              {" "}
              questions
            </p>

          </section>

          <section className="result-stats">

            <div className="result-stat correct">

              <CheckCircle2 size={22} />

              <span>
                Correct
              </span>

              <strong>
                {result.correct}
              </strong>

            </div>

            <div className="result-stat wrong">

              <X size={22} />

              <span>
                Wrong
              </span>

              <strong>
                {result.wrong}
              </strong>

            </div>

            <div className="result-stat unanswered">

              <Clock3 size={22} />

              <span>
                Unanswered
              </span>

              <strong>
                {result.unanswered}
              </strong>

            </div>

            <div className="result-stat total">

              <BarChart3 size={22} />

              <span>
                Total
              </span>

              <strong>
                {result.total}
              </strong>

            </div>

          </section>

          <section className="result-analysis">

            <div className="result-analysis-icon">

              <Brain size={23} />

            </div>

            <div>

              <span>
                AI PERFORMANCE REVIEW
              </span>

              <h2>

                {result.percentage >=
                80
                  ? "Excellent understanding!"
                  : result.percentage >=
                    60
                  ? "Good progress. Keep practicing."
                  : "Let's strengthen the fundamentals."}

              </h2>

              <p>
                Your score is based on
                the concepts covered in
                this personalized AI
                learning session.
              </p>

            </div>

          </section>

          <div className="result-actions">

            <button
              className="result-primary-button"
              onClick={
                generateAgain
              }
              disabled={
                loadingQuestions
              }
            >

              {loadingQuestions ? (
                <Loader2
                  size={18}
                  className="ai-strategy-spinner"
                />
              ) : (
                <RefreshCw
                  size={18}
                />
              )}

              Generate Fresh Test

            </button>

            <button
              className="result-secondary-button"
              onClick={() =>
                setStep("guide")
              }
            >

              <BookOpen
                size={18}
              />

              Review Study Guide

            </button>

            <button
              className="result-secondary-button"
              onClick={
                resetSession
              }
            >

              <RotateCcw
                size={18}
              />

              New Topic

            </button>

          </div>

        </main>

      </div>
    );
  }

  return null;
}