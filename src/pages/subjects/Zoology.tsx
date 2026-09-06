import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Dna,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import TestInterface from "../../components/TestInterface";
import "./Zoology.css";

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
// LOCAL STORAGE HELPERS
// ============================================================

function getStoredStudent(): StudentData {
  try {
    const possibleKeys = [
      "user",
      "student",
    ];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        return parsed as StudentData;
      }
    }
  } catch (error) {
    console.error(
      "Error reading student data from localStorage:",
      error
    );
  }

  return {};
}


function getInitialStudentData() {
  const storedStudent = getStoredStudent();

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

  return chapter || "General Zoology";
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

export default function Zoology() {
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

          if (
            !String(result.examName).includes(
              "Zoology -"
            )
          ) {
            continue;
          }

          const parts =
            String(result.examName).split(
              "Zoology -"
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
                String(item.selectedAnswer);
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
          "ZOOLOGY RESULTS LOAD ERROR:",
          error
        );
      } finally {
        setResultsLoading(false);
      }
    },
    [studentId]
  );


  // ==========================================================
  // LOAD ZOOLOGY QUESTIONS
  // ==========================================================

  const loadZoologyQuestions = useCallback(
    async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");

        const queryParams =
          new URLSearchParams({
            className,
            subject: "Zoology",
            testCategory: "subject",
          });

        const response = await fetch(
          `${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load Zoology questions from database"
          );
        }

        const data = await response.json();

        const zoologyQuestions =
          Array.isArray(data?.questions)
            ? data.questions
            : [];

        setQuestions(
          zoologyQuestions
        );
      } catch (error) {
        console.error(
          "ZOOLOGY QUESTIONS LOAD ERROR:",
          error
        );

        setQuestionsError(
          error instanceof Error
            ? error.message
            : "Failed to load Zoology data"
        );
      } finally {
        setQuestionsLoading(false);
      }
    },
    [className]
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadZoologyQuestions();
    void loadPreviousResults();
  }, [
    loadZoologyQuestions,
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
    void loadZoologyQuestions();
  }, [loadZoologyQuestions]);


  const handleBack = useCallback(() => {
    setSelectedChapter(null);
  }, []);


  // ==========================================================
  // EXAM SCREEN
  // ==========================================================

  if (selectedChapter) {
    return (
      <TestInterface
        subject="Zoology"
        className={className}
        chapterName={selectedChapter}
        questions={currentChapterQuestions}
        studentId={studentId}
        studentName={studentName}
        themeColor="#0d9488"
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
    <main className="zoology-page">
      <div className="zoology-container">

        {/* ==================================================
            HERO
        ================================================== */}

        <section
          className="zoology-hero"
          aria-labelledby="zoology-page-title"
        >
          <div className="zoology-hero-content">

            <div className="zoology-badge">
              <Dna
                size={15}
                aria-hidden="true"
              />

              <span>
                JEE / NEET •{" "}
                {className.toUpperCase()}{" "}
                ZOOLOGY
              </span>
            </div>


            <h1
              id="zoology-page-title"
              className="zoology-title"
            >
              Zoology

              <span>
                Master Animal Sciences.
                Crack Exams.
              </span>
            </h1>


            <p className="zoology-description">
              Welcome back,{" "}
              <strong>
                {studentName}
              </strong>
              ! Practice{" "}
              {className} Zoology
              chapter-wise with focused
              human physiology, genetics,
              and exam-oriented tests.
            </p>


            <div
              className="zoology-stats"
              aria-label="Zoology statistics"
            >

              <div className="zoology-stat">
                <span className="zoology-stat-value">
                  {questions.length}+
                </span>

                <span className="zoology-stat-label">
                  {className} Questions
                </span>
              </div>


              <div className="zoology-stat">
                <span className="zoology-stat-value">
                  {chaptersList.length}
                </span>

                <span className="zoology-stat-label">
                  Chapters
                </span>
              </div>


              <div className="zoology-stat">
                <span className="zoology-stat-value">
                  JEE / NEET
                </span>

                <span className="zoology-stat-label">
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
          className="zoology-section"
          aria-labelledby="zoology-chapters-title"
        >

          <div className="zoology-section-header">
            <div>

              <h2
                id="zoology-chapters-title"
                className="zoology-section-title"
              >
                {className} Zoology
                Chapters
              </h2>

              <p className="zoology-section-subtitle">
                Select a chapter and
                start your practice.
              </p>

            </div>
          </div>


          {/* ==================================================
              ERROR STATE
          ================================================== */}

          {questionsError ? (
            <div
              className="zoology-state-card"
              role="alert"
            >

              <div
                className="zoology-state-icon"
                aria-hidden="true"
              >
                <Dna size={24} />
              </div>

              <h3>
                Unable to Load Zoology
              </h3>

              <p>
                {questionsError}
              </p>

              <button
                type="button"
                className="zoology-retry-button"
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
               LOADING STATE
            ================================================== */

            <div
              className="zoology-state-card"
              role="status"
              aria-live="polite"
            >

              <div
                className="zoology-state-icon"
                aria-hidden="true"
              >
                <LoaderCircle
                  size={24}
                  className="zoology-loading-icon"
                />
              </div>

              <h3>
                Loading Zoology
              </h3>

              <p>
                Fetching chapter questions
                from the database...
              </p>

            </div>
          ) : chaptersList.length === 0 ? (
            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div
              className="zoology-state-card"
              role="status"
            >

              <div
                className="zoology-state-icon"
                aria-hidden="true"
              >
                <BookOpen size={24} />
              </div>

              <h3>
                No Chapters Found
              </h3>

              <p>
                No Zoology chapters are
                available for{" "}
                {className} yet.
              </p>

            </div>
          ) : (
            /* ==================================================
               CHAPTER GRID
            ================================================== */

            <div className="zoology-chapter-grid">

              {chaptersList.map(
                (chapter, index) => {
                  const isCompleted =
                    submittedChapters[
                      chapter.name
                    ];

                  return (
                    <article
                      className="zoology-chapter-card"
                      key={chapter.name}
                    >

                      <div className="zoology-card-top">

                        <div
                          className="zoology-chapter-icon"
                          aria-hidden="true"
                        >
                          <Dna size={24} />
                        </div>

                        <span className="zoology-chapter-number">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                      </div>


                      <div className="zoology-card-content">

                        <h3>
                          {chapter.name}

                          {isCompleted && (
                            <span
                              className="zoology-completed-mark"
                              aria-label="Completed"
                            >
                              ✓ Completed
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


                        <div className="zoology-question-meta">

                          <span className="zoology-question-count">
                            {chapter.count}{" "}
                            Questions Available
                          </span>

                          {isCompleted && (
                            <span className="zoology-db-history">
                              Saved in DB
                            </span>
                          )}

                        </div>


                        <button
                          type="button"
                          className="zoology-test-button"
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
                className="zoology-history-sync"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle
                  size={13}
                  className="zoology-loading-icon"
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