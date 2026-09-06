import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Calculator,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import TestInterface from "../../components/TestInterface";
import "./Mathematics.css";

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
// LOCAL STORAGE
// ============================================================

function getStoredStudent(): StudentData {
  try {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("student");

    if (!storedUser) {
      return {};
    }

    const parsedUser = JSON.parse(
      storedUser
    );

    if (
      parsedUser &&
      typeof parsedUser === "object"
    ) {
      return parsedUser as StudentData;
    }
  } catch (error) {
    console.error(
      "MATHEMATICS LOCAL STORAGE ERROR:",
      error
    );
  }

  return {};
}


function getInitialStudentData() {
  const storedStudent =
    getStoredStudent();

  const studentId =
    localStorage.getItem("studentId") ||
    storedStudent.studentId ||
    "STU1001";

  const studentName =
    localStorage.getItem("studentName") ||
    storedStudent.name ||
    "Student";

  const className =
    localStorage.getItem("className") ||
    storedStudent.className ||
    "2nd PUC";

  return {
    studentId,
    studentName,
    className,
  };
}


// ============================================================
// HELPERS
// ============================================================

function getChapterName(question: Question) {
  const chapter = String(
    question.chapter || ""
  ).trim();

  return chapter || "General Mathematics";
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

export default function Mathematics() {
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

  const [studentId] = useState<string>(
    initialStudent.studentId
  );

  const [studentName] = useState<string>(
    initialStudent.studentName
  );

  const [className] = useState<string>(
    initialStudent.className
  );

  const [selectedChapter, setSelectedChapter] =
    useState<string | null>(null);

  const [chapterUserAnswers, setChapterUserAnswers] =
    useState<
      Record<
        string,
        Record<string, string>
      >
    >({});

  const [submittedChapters, setSubmittedChapters] =
    useState<Record<string, boolean>>({});

  const [resultsLoading, setResultsLoading] =
    useState(true);


  // ==========================================================
  // LOAD PREVIOUS RESULTS
  // ==========================================================

  const loadPreviousResults = useCallback(
    async () => {
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

        const data = await response.json();

        const resultsList =
          extractResultsList(data);

        const loadedSubmittedChapters: Record<
          string,
          boolean
        > = {};

        const loadedChapterAnswers: Record<
          string,
          Record<string, string>
        > = {};

        for (const result of resultsList) {
          if (!result?.examName) {
            continue;
          }

          const examName = String(
            result.examName
          );

          if (
            !examName.includes(
              "Mathematics -"
            )
          ) {
            continue;
          }

          const parts =
            examName.split(
              "Mathematics -"
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

          const answerMap: Record<
            string,
            string
          > = {};

          for (const item of result.review) {
            if (
              item?.questionId &&
              item?.selectedAnswer
            ) {
              answerMap[
                String(item.questionId)
              ] =
                String(
                  item.selectedAnswer
                );
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
          "MATHEMATICS RESULTS LOAD ERROR:",
          error
        );
      } finally {
        setResultsLoading(false);
      }
    },
    [studentId]
  );


  // ==========================================================
  // LOAD MATHEMATICS QUESTIONS
  // ==========================================================

  const loadMathematicsQuestions =
    useCallback(async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");

        const queryParams =
          new URLSearchParams({
            className,
            subject: "Mathematics",
            testCategory: "subject",
          });

        const response = await fetch(
          `${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load Mathematics questions from database"
          );
        }

        const data = await response.json();

        const mathQuestions =
          Array.isArray(data?.questions)
            ? data.questions
            : [];

        setQuestions(
          mathQuestions
        );
      } catch (error) {
        console.error(
          "MATHEMATICS QUESTIONS LOAD ERROR:",
          error
        );

        setQuestionsError(
          error instanceof Error
            ? error.message
            : "Failed to load Mathematics data"
        );
      } finally {
        setQuestionsLoading(false);
      }
    }, [className]);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadMathematicsQuestions();
    void loadPreviousResults();
  }, [
    loadMathematicsQuestions,
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
      ).map(
        ([name, count]) => ({
          name,
          count,
        })
      );
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
  // HANDLERS
  // ==========================================================

  const handleRetry = useCallback(() => {
    void loadMathematicsQuestions();
  }, [loadMathematicsQuestions]);


  const handleBack = useCallback(() => {
    setSelectedChapter(null);
  }, []);


  // ==========================================================
  // TEST INTERFACE
  // ==========================================================

  if (selectedChapter) {
    return (
      <TestInterface
        subject="Mathematics"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#6366f1"
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
  // MAIN DASHBOARD
  // ==========================================================

  return (
    <main className="mathematics-page">
      <div className="mathematics-container">

        {/* ==================================================
            HERO
        ================================================== */}

        <section
          className="mathematics-hero"
          aria-labelledby="mathematics-page-title"
        >
          <div className="mathematics-hero-content">

            <div className="mathematics-badge">
              <Calculator
                size={15}
                aria-hidden="true"
              />

              <span>
                JEE / KCET •{" "}
                {className.toUpperCase()}{" "}
                MATHEMATICS
              </span>
            </div>


            <h1
              id="mathematics-page-title"
              className="mathematics-title"
            >
              Mathematics

              <span>
                Solve Equations.
                Crack JEE.
              </span>
            </h1>


            <p className="mathematics-description">
              Welcome back,{" "}
              <strong>
                {studentName}
              </strong>
              ! Practice{" "}
              {className} Mathematics
              chapter-wise with focused
              problems, formulas, and
              exam-oriented tests.
            </p>


            <div
              className="mathematics-stats"
              aria-label="Mathematics statistics"
            >

              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  {questions.length}+
                </span>

                <span className="mathematics-stat-label">
                  {className} Questions
                </span>
              </div>


              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  {chaptersList.length}
                </span>

                <span className="mathematics-stat-label">
                  Chapters
                </span>
              </div>


              <div className="mathematics-stat">
                <span className="mathematics-stat-value">
                  JEE Pattern
                </span>

                <span className="mathematics-stat-label">
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
          className="mathematics-section"
          aria-labelledby="mathematics-chapters-title"
        >

          <div className="mathematics-section-header">
            <div>

              <h2
                id="mathematics-chapters-title"
                className="mathematics-section-title"
              >
                {className} Mathematics
                Chapters
              </h2>

              <p className="mathematics-section-subtitle">
                Select a chapter and
                start your practice.
              </p>

            </div>
          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {questionsError ? (
            <div
              className="mathematics-state-card"
              role="alert"
            >

              <div
                className="mathematics-state-icon"
                aria-hidden="true"
              >
                <Calculator size={24} />
              </div>

              <h3>
                Unable to Load Mathematics
              </h3>

              <p>
                {questionsError}
              </p>

              <button
                type="button"
                className="mathematics-retry-button"
                onClick={handleRetry}
              >
                <RefreshCw
                  size={15}
                  aria-hidden="true"
                />

                Try Again
              </button>

            </div>
          ) : questionsLoading ? (
            /* ==================================================
               LOADING
            ================================================== */

            <div
              className="mathematics-state-card"
              role="status"
              aria-live="polite"
            >

              <div
                className="mathematics-state-icon"
                aria-hidden="true"
              >
                <LoaderCircle
                  size={24}
                  className="mathematics-loading-icon"
                />
              </div>

              <h3>
                Loading Mathematics
              </h3>

              <p>
                Fetching chapter questions
                from the database...
              </p>

            </div>
          ) : chaptersList.length === 0 ? (
            /* ==================================================
               EMPTY
            ================================================== */

            <div
              className="mathematics-state-card"
              role="status"
            >

              <div
                className="mathematics-state-icon"
                aria-hidden="true"
              >
                <BookOpen size={24} />
              </div>

              <h3>
                No Chapters Found
              </h3>

              <p>
                No Mathematics chapters
                are available for{" "}
                {className} yet.
              </p>

            </div>
          ) : (
            /* ==================================================
               CHAPTER GRID
            ================================================== */

            <div className="mathematics-chapter-grid">

              {chaptersList.map(
                (chapter, index) => {
                  const isCompleted =
                    submittedChapters[
                      chapter.name
                    ] || false;

                  return (
                    <article
                      className="mathematics-chapter-card"
                      key={chapter.name}
                    >

                      <div className="mathematics-card-top">

                        <div
                          className="mathematics-chapter-icon"
                          aria-hidden="true"
                        >
                          <Calculator
                            size={24}
                          />
                        </div>

                        <span className="mathematics-chapter-number">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                      </div>


                      <div className="mathematics-card-content">

                        <h3>
                          {chapter.name}

                          {isCompleted && (
                            <span
                              className="mathematics-completed-mark"
                              aria-label="Completed"
                            >
                              ✓
                            </span>
                          )}
                        </h3>


                        <p>
                          Practice important
                          multiple-choice
                          questions and
                          problems from this
                          chapter.
                        </p>


                        <div className="mathematics-question-meta">

                          <span className="mathematics-question-count">
                            {chapter.count}{" "}
                            Questions Available
                          </span>

                          {isCompleted && (
                            <span className="mathematics-db-history">
                              Saved in DB
                            </span>
                          )}

                        </div>


                        <button
                          type="button"
                          className="mathematics-test-button"
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
              HISTORY SYNC
          ================================================== */}

          {!questionsLoading &&
            !questionsError &&
            resultsLoading && (
              <div
                className="mathematics-history-sync"
                role="status"
                aria-live="polite"
              >

                <LoaderCircle
                  size={13}
                  className="mathematics-loading-icon"
                  aria-hidden="true"
                />

                <span>
                  Syncing your previous
                  practice history...
                </span>

              </div>
            )}

        </section>
      </div>
    </main>
  );
}