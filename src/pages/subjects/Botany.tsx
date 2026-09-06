import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Leaf,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import TestInterface from "../../components/TestInterface";
import "./Botany.css";

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

    return parsed &&
      typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function getInitialStudentData() {
  const storedStudent =
    getStoredStudent();

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

function getChapterName(
  question: Question
): string {
  const chapter = String(
    question.chapter || ""
  ).trim();

  return (
    chapter ||
    "General Botany"
  );
}

function extractResultsList(
  data: any
): any[] {
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

export default function Botany() {
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
    useState<string>(
      initialStudent.studentId
    );

  const [studentName] =
    useState<string>(
      initialStudent.studentName
    );

  const [className] =
    useState<string>(
      initialStudent.className
    );

  const [selectedChapter, setSelectedChapter] =
    useState<string | null>(null);

  const [
    chapterUserAnswers,
    setChapterUserAnswers,
  ] = useState<
    Record<
      string,
      Record<string, string>
    >
  >({});

  const [
    submittedChapters,
    setSubmittedChapters,
  ] = useState<
    Record<string, boolean>
  >({});

  const [resultsLoading, setResultsLoading] =
    useState(true);

  // ==========================================================
  // LOAD PREVIOUS RESULTS
  // ==========================================================

  const loadPreviousResults =
    useCallback(async () => {
      if (!studentId) {
        setResultsLoading(false);
        return;
      }

      try {
        setResultsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/results/student/${encodeURIComponent(
            studentId
          )}`
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const resultsList =
          extractResultsList(data);

        const loadedSubmittedChapters:
          Record<string, boolean> = {};

        const loadedChapterAnswers:
          Record<
            string,
            Record<string, string>
          > = {};

        for (const result of resultsList) {
          if (
            !result?.examName ||
            !result.examName.includes(
              "Botany -"
            )
          ) {
            continue;
          }

          const parts =
            result.examName.split(
              "Botany -"
            );

          const chapterName =
            parts[1]?.trim();

          if (
            !chapterName ||
            !Array.isArray(result.review)
          ) {
            continue;
          }

          loadedSubmittedChapters[
            chapterName
          ] = true;

          const answerMap:
            Record<string, string> = {};

          for (const item of result.review) {
            if (
              item?.questionId &&
              item?.selectedAnswer
            ) {
              answerMap[
                item.questionId
              ] = item.selectedAnswer;
            }
          }

          loadedChapterAnswers[
            chapterName
          ] = answerMap;
        }

        setSubmittedChapters(
          loadedSubmittedChapters
        );

        setChapterUserAnswers(
          loadedChapterAnswers
        );
      } catch (error) {
        console.error(
          "BOTANY RESULTS LOAD ERROR:",
          error
        );
      } finally {
        setResultsLoading(false);
      }
    }, [studentId]);

  // ==========================================================
  // LOAD BOTANY QUESTIONS
  // ==========================================================

  const loadBotanyQuestions =
    useCallback(async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");

        const queryParams =
          new URLSearchParams({
            className,
            subject: "Botany",
            testCategory: "subject",
          });

        const response = await fetch(
          `${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load Botany questions from database"
          );
        }

        const data =
          await response.json();

        const botanyQuestions =
          Array.isArray(data?.questions)
            ? data.questions
            : [];

        setQuestions(
          botanyQuestions
        );
      } catch (error) {
        console.error(
          "BOTANY QUESTIONS LOAD ERROR:",
          error
        );

        setQuestionsError(
          error instanceof Error
            ? error.message
            : "Failed to load Botany data"
        );
      } finally {
        setQuestionsLoading(false);
      }
    }, [className]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadBotanyQuestions();
    void loadPreviousResults();
  }, [
    loadBotanyQuestions,
    loadPreviousResults,
  ]);

  // ==========================================================
  // CHAPTER LIST
  // ==========================================================

  const chaptersList =
    useMemo<Chapter[]>(() => {
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
  // RETRY
  // ==========================================================

  const handleRetry = useCallback(() => {
    void loadBotanyQuestions();
  }, [loadBotanyQuestions]);

  // ==========================================================
  // BACK
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
        subject="Botany"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#16a34a"
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
    <main className="botany-page">
      <div className="botany-container">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="botany-hero">
          <div className="botany-hero-content">

            <div className="botany-badge">
              <Leaf
                size={15}
                aria-hidden="true"
              />

              <span>
                JEE / NEET •{" "}
                {className.toUpperCase()}{" "}
                BOTANY
              </span>
            </div>

            <h1 className="botany-title">
              Botany

              <span>
                Master Plant Sciences.
                Crack Exams.
              </span>
            </h1>

            <p className="botany-description">
              Welcome back,{" "}
              <strong>
                {studentName}
              </strong>
              ! Practice{" "}
              {className} Botany
              chapter-wise with focused
              plant anatomy, physiology,
              and exam-oriented tests.
            </p>

            <div className="botany-stats">

              <div className="botany-stat">
                <span className="botany-stat-value">
                  {questionsLoading
                    ? "—"
                    : `${questions.length}+`}
                </span>

                <span className="botany-stat-label">
                  {className} Questions
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  {questionsLoading
                    ? "—"
                    : chaptersList.length}
                </span>

                <span className="botany-stat-label">
                  Chapters
                </span>
              </div>

              <div className="botany-stat">
                <span className="botany-stat-value">
                  JEE / NEET
                </span>

                <span className="botany-stat-label">
                  Exam Standard
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            CHAPTER SECTION
        ================================================== */}

        <section
          aria-labelledby="botany-chapters-title"
        >
          <div className="botany-section-header">
            <div>

              <h2
                id="botany-chapters-title"
                className="botany-section-title"
              >
                {className} Botany Chapters
              </h2>

              <p className="botany-section-subtitle">
                Select a chapter and start
                your practice.
              </p>

            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {questionsError ? (
            <div className="botany-state-card">

              <div
                className="botany-state-icon error"
                aria-hidden="true"
              >
                !
              </div>

              <h3>
                Unable to load Botany
              </h3>

              <p>
                {questionsError}
              </p>

              <button
                type="button"
                className="botany-retry-button"
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
              className="botany-state-card"
              aria-live="polite"
            >
              <div
                className="botany-state-icon"
                aria-hidden="true"
              >
                <LoaderCircle
                  size={24}
                  className="botany-spinner"
                />
              </div>

              <h3>
                Loading Botany Chapters
              </h3>

              <p>
                Preparing your chapter-wise
                practice questions...
              </p>
            </div>
          ) : chaptersList.length === 0 ? (
            <div className="botany-state-card">

              <div
                className="botany-state-icon"
                aria-hidden="true"
              >
                📚
              </div>

              <h3>
                No Botany Chapters Found
              </h3>

              <p>
                No Botany chapters are
                currently available for{" "}
                {className}.
              </p>

            </div>
          ) : (
            <div className="botany-chapter-grid">

              {chaptersList.map(
                (chapter, index) => {
                  const isCompleted =
                    submittedChapters[
                      chapter.name
                    ];

                  return (
                    <article
                      className="botany-chapter-card"
                      key={chapter.name}
                    >

                      <div className="botany-card-top">

                        <div
                          className="botany-chapter-icon"
                          aria-hidden="true"
                        >
                          <Leaf size={24} />
                        </div>

                        <span className="botany-chapter-number">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                      </div>

                      <div className="botany-card-content">

                        <h3>
                          {chapter.name}

                          {isCompleted && (
                            <span
                              className="botany-completed-mark"
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

                        <div className="botany-question-count">
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
                          className="botany-test-button"
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
              RESULTS SYNC
          ================================================== */}

          {!questionsLoading &&
            !questionsError &&
            resultsLoading && (
              <div
                className="botany-history-sync"
                aria-live="polite"
              >
                <LoaderCircle
                  size={13}
                  className="botany-spinner"
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