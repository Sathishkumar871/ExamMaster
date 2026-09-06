import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  LoaderCircle,
  RefreshCw,
  Zap,
} from "lucide-react";

import TestInterface from "../../components/TestInterface";
import "./Physics.css";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// TYPES
// ============================================================

interface Question {
  _id: string;

  question?: string;
  questionText?: string;

  options: string[];

  correctAnswer: string;

  subject?: string;
  chapter?: string;
  className?: string;

  testCategory?: string;

  isPublished?: boolean;

  questionImage?: string;
  imageUrl?: string;

  tableHeaders?: string[];
  tableRows?: unknown[][];
}

interface StudentData {
  studentId?: string;
  name?: string;
  className?: string;
}

interface Chapter {
  name: string;
  count: number;
}

// ============================================================
// HELPERS
// ============================================================

function getStoredStudent(): StudentData {
  try {
    const userRaw = localStorage.getItem("user");
    const studentRaw = localStorage.getItem("student");

    const raw =
      userRaw ||
      studentRaw ||
      "{}";

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function getInitialStudentData() {
  const storedStudent = getStoredStudent();

  return {
    studentId:
      localStorage.getItem("studentId") ||
      storedStudent.studentId ||
      "STU1001",

    studentName:
      localStorage.getItem("studentName") ||
      storedStudent.name ||
      "Student",

    className:
      localStorage.getItem("className") ||
      storedStudent.className ||
      "2nd PUC",
  };
}

function getChapterName(question: Question): string {
  const chapter = String(
    question.chapter || ""
  ).trim();

  return chapter || "General Physics";
}

function extractResultsList(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

// ============================================================
// COMPONENT
// ============================================================

export default function Physics() {
  // ==========================================================
  // INITIAL STUDENT DATA
  // ==========================================================

  const initialStudent = useMemo(
    () => getInitialStudentData(),
    []
  );

  // ==========================================================
  // STATE
  // ==========================================================

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [questionsLoading, setQuestionsLoading] =
    useState(true);

  const [questionsError, setQuestionsError] =
    useState("");

  const [studentId] =
    useState<string>(initialStudent.studentId);

  const [studentName] =
    useState<string>(initialStudent.studentName);

  const [className] =
    useState<string>(initialStudent.className);

  const [selectedChapter, setSelectedChapter] =
    useState<string | null>(null);

  const [chapterUserAnswers, setChapterUserAnswers] =
    useState<
      Record<string, Record<string, string>>
    >({});

  const [submittedChapters, setSubmittedChapters] =
    useState<Record<string, boolean>>({});

  const [resultsLoading, setResultsLoading] =
    useState(true);

  // ==========================================================
  // LOAD RESULTS
  // ==========================================================

  const loadPreviousResults = useCallback(async () => {
    if (!studentId) {
      setResultsLoading(false);
      return;
    }

    try {
      setResultsLoading(true);

      const resultsResponse = await fetch(
        `${API_BASE_URL}/api/results/student/${encodeURIComponent(
          studentId
        )}`
      );

      if (!resultsResponse.ok) {
        setResultsLoading(false);
        return;
      }

      const resultsData =
        await resultsResponse.json();

      const resultsList =
        extractResultsList(resultsData);

      const loadedSubmittedChapters: Record<
        string,
        boolean
      > = {};

      const loadedChapterAnswers: Record<
        string,
        Record<string, string>
      > = {};

      for (const result of resultsList) {
        if (
          !result?.examName ||
          !result.examName.includes("Physics -")
        ) {
          continue;
        }

        const parts =
          result.examName.split("Physics -");

        const chapterName =
          parts[1]?.trim();

        if (
          !chapterName ||
          !Array.isArray(result.review)
        ) {
          continue;
        }

        loadedSubmittedChapters[chapterName] =
          true;

        const answerMap: Record<
          string,
          string
        > = {};

        for (const item of result.review) {
          if (
            item?.questionId &&
            item?.selectedAnswer
          ) {
            answerMap[item.questionId] =
              item.selectedAnswer;
          }
        }

        loadedChapterAnswers[chapterName] =
          answerMap;
      }

      setSubmittedChapters(
        loadedSubmittedChapters
      );

      setChapterUserAnswers(
        loadedChapterAnswers
      );
    } catch (error) {
      console.error(
        "PHYSICS RESULTS LOAD ERROR:",
        error
      );
    } finally {
      setResultsLoading(false);
    }
  }, [studentId]);

  // ==========================================================
  // LOAD PHYSICS QUESTIONS
  // ==========================================================

  const loadPhysicsQuestions =
    useCallback(async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");

        const queryParams =
          new URLSearchParams({
            className,
            subject: "Physics",
            testCategory: "subject",
          });

        const response = await fetch(
          `${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load Physics questions from database"
          );
        }

        const data =
          await response.json();

        const physicsQuestions =
          Array.isArray(data?.questions)
            ? data.questions
            : [];

        setQuestions(
          physicsQuestions
        );
      } catch (error) {
        console.error(
          "PHYSICS QUESTIONS LOAD ERROR:",
          error
        );

        setQuestionsError(
          error instanceof Error
            ? error.message
            : "Failed to load Physics data"
        );
      } finally {
        setQuestionsLoading(false);
      }
    }, [className]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    // Start both requests together.
    // Results are not required to render the main page.
    void loadPhysicsQuestions();
    void loadPreviousResults();
  }, [
    loadPhysicsQuestions,
    loadPreviousResults,
  ]);

  // ==========================================================
  // CHAPTER LIST
  // ==========================================================

  const chaptersList = useMemo<Chapter[]>(() => {
    const chapterMap =
      new Map<string, number>();

    for (const question of questions) {
      const chapter =
        getChapterName(question);

      chapterMap.set(
        chapter,
        (chapterMap.get(chapter) || 0) + 1
      );
    }

    return Array.from(
      chapterMap.entries()
    ).map(([name, count]) => ({
      name,
      count,
    }));
  }, [questions]);

  // ==========================================================
  // CURRENT CHAPTER QUESTIONS
  // ==========================================================

  const currentChapterQuestions =
    useMemo(() => {
      if (!selectedChapter) {
        return [];
      }

      return questions.filter(
        (question) =>
          getChapterName(question) ===
          selectedChapter
      );
    }, [
      questions,
      selectedChapter,
    ]);

  // ==========================================================
  // RETRY QUESTIONS
  // ==========================================================

  const handleRetry = useCallback(() => {
    void loadPhysicsQuestions();
  }, [loadPhysicsQuestions]);

  // ==========================================================
  // BACK TO CHAPTERS
  // ==========================================================

  const handleBack = useCallback(() => {
    setSelectedChapter(null);
  }, []);

  // ==========================================================
  // EXAM SCREEN
  // ==========================================================

  if (selectedChapter) {
    return (
      <TestInterface
        subject="Physics"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#2563eb"
        onBack={handleBack}
        isAlreadySubmitted={
          submittedChapters[
            selectedChapter
          ] || false
        }
        initialAnswers={
          chapterUserAnswers[
            selectedChapter
          ] || {}
        }
        testCategory="subject"
        examType=""
      />
    );
  }

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (
    <main className="physics-page">
      <div className="physics-container">
        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="physics-hero">
          <div className="physics-hero-content">
            <div className="physics-badge">
              <Zap
                size={15}
                aria-hidden="true"
              />

              <span>
                JEE / NEET •{" "}
                {className.toUpperCase()}{" "}
                PHYSICS
              </span>
            </div>

            <h1 className="physics-title">
              Physics

              <span>
                Master Concepts. Crack Exams.
              </span>
            </h1>

            <p className="physics-description">
              Welcome back,{" "}
              <strong>{studentName}</strong>!
              Practice {className} Physics
              chapter-wise with focused
              numerical problems, laws,
              and exam-oriented tests.
            </p>

            <div className="physics-stats">
              <div className="physics-stat">
                <span className="physics-stat-value">
                  {questionsLoading
                    ? "—"
                    : `${questions.length}+`}
                </span>

                <span className="physics-stat-label">
                  {className} Questions
                </span>
              </div>

              <div className="physics-stat">
                <span className="physics-stat-value">
                  {questionsLoading
                    ? "—"
                    : chaptersList.length}
                </span>

                <span className="physics-stat-label">
                  Chapters
                </span>
              </div>

              <div className="physics-stat">
                <span className="physics-stat-value">
                  JEE / NEET
                </span>

                <span className="physics-stat-label">
                  Exam Standard
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CHAPTER SECTION
        ==================================================== */}

        <section aria-labelledby="physics-chapters-title">
          <div className="physics-section-header">
            <div>
              <h2
                id="physics-chapters-title"
                className="physics-section-title"
              >
                {className} Physics Chapters
              </h2>

              <p className="physics-section-subtitle">
                Select a chapter and start
                your practice.
              </p>
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {questionsError ? (
            <div className="physics-state-card">
              <div
                className="physics-state-icon error"
                aria-hidden="true"
              >
                !
              </div>

              <h3>
                Unable to load Physics
              </h3>

              <p>{questionsError}</p>

              <button
                type="button"
                className="physics-retry-button"
                onClick={handleRetry}
              >
                <RefreshCw
                  size={15}
                  aria-hidden="true"
                />

                Retry
              </button>
            </div>
          ) : questionsLoading ? (
            <div
              className="physics-state-card"
              aria-live="polite"
            >
              <div
                className="physics-state-icon"
                aria-hidden="true"
              >
                <LoaderCircle
                  size={24}
                  className="physics-spinner"
                />
              </div>

              <h3>
                Loading Physics Chapters
              </h3>

              <p>
                Preparing your chapter-wise
                practice questions...
              </p>
            </div>
          ) : chaptersList.length === 0 ? (
            <div className="physics-state-card">
              <div
                className="physics-state-icon"
                aria-hidden="true"
              >
                📚
              </div>

              <h3>
                No Physics Chapters Found
              </h3>

              <p>
                No Physics chapters are
                currently available for{" "}
                {className}.
              </p>
            </div>
          ) : (
            <div className="physics-chapter-grid">
              {chaptersList.map(
                (chapter, index) => {
                  const isCompleted =
                    submittedChapters[
                      chapter.name
                    ];

                  return (
                    <article
                      className="physics-chapter-card"
                      key={chapter.name}
                    >
                      <div className="physics-card-top">
                        <div
                          className="physics-chapter-icon"
                          aria-hidden="true"
                        >
                          <Zap size={24} />
                        </div>

                        <span className="physics-chapter-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>

                      <div className="physics-card-content">
                        <h3>
                          {chapter.name}

                          {isCompleted && (
                            <span
                              className="physics-completed-mark"
                              aria-label="Completed"
                              title="Completed"
                            >
                              ✓
                            </span>
                          )}
                        </h3>

                        <p>
                          Practice important
                          multiple-choice
                          questions and
                          conceptual problems
                          from this chapter.
                        </p>

                        <div className="physics-question-count">
                          {chapter.count} Questions
                          Available

                          {isCompleted && (
                            <span>
                              {" "}
                              • Saved in DB
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="physics-test-button"
                          onClick={() =>
                            setSelectedChapter(
                              chapter.name
                            )
                          }
                        >
                          <BookOpen
                            size={16}
                            aria-hidden="true"
                          />

                          <span>
                            {isCompleted
                              ? "View DB History"
                              : "Start Practice"}
                          </span>

                          <ArrowRight
                            size={15}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

          {/* ==================================================
              RESULTS SYNC INDICATOR
          ================================================== */}

          {!questionsLoading &&
            !questionsError &&
            resultsLoading && (
              <div
                className="physics-history-sync"
                aria-live="polite"
              >
                <LoaderCircle
                  size={13}
                  className="physics-spinner"
                  aria-hidden="true"
                />

                <span>
                  Syncing your previous
                  chapter history...
                </span>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}