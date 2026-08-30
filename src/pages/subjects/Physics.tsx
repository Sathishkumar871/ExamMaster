import { useEffect, useMemo, useState } from "react";
import { Zap, BookOpen, ArrowRight } from "lucide-react";
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
// QUESTION TYPE
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
  tableRows?: any[][];
}

// ============================================================
// COMPONENT
// ============================================================

export default function Physics() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [studentId, setStudentId] =
    useState<string>("STU1001");

  const [studentName, setStudentName] =
    useState<string>("Student");

  const [className, setClassName] =
    useState<string>("2nd PUC");

  const [selectedChapter, setSelectedChapter] =
    useState<string | null>(null);

  const [chapterUserAnswers, setChapterUserAnswers] =
    useState<
      Record<string, Record<string, string>>
    >({});

  const [submittedChapters, setSubmittedChapters] =
    useState<Record<string, boolean>>({});

  // ==========================================================
  // LOAD STUDENT DATA
  // ==========================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("student") ||
        "{}";

      const parsedUser =
        JSON.parse(storedUser);

      if (parsedUser.className) {
        setClassName(
          parsedUser.className
        );
      }

      if (parsedUser.name) {
        setStudentName(
          parsedUser.name
        );
      }

      if (parsedUser.studentId) {
        setStudentId(
          parsedUser.studentId
        );
      }

      const storedClassName =
        localStorage.getItem("className");

      const storedStudentName =
        localStorage.getItem("studentName");

      const storedStudentId =
        localStorage.getItem("studentId");

      if (storedClassName) {
        setClassName(
          storedClassName
        );
      }

      if (storedStudentName) {
        setStudentName(
          storedStudentName
        );
      }

      if (storedStudentId) {
        setStudentId(
          storedStudentId
        );
      }
    } catch (error) {
      console.error(
        "Error reading student data from localStorage:",
        error
      );
    }
  }, []);

  // ==========================================================
  // FETCH PHYSICS SUBJECT TEST QUESTIONS
  // ==========================================================

  useEffect(() => {
    const loadDataFromDB =
      async () => {
        try {
          setLoading(true);
          setError("");

          // --------------------------------------------------
          // FETCH QUESTIONS
          // --------------------------------------------------

          const queryParams =
            new URLSearchParams({
              className: className,
              subject: "Physics",
              testCategory: "subject",
            });

          const qResponse =
            await fetch(
              `${API_BASE_URL}/api/subjects/questions?${queryParams.toString()}`
            );

          if (!qResponse.ok) {
            throw new Error(
              "Failed to load Physics questions from database"
            );
          }

          const qData =
            await qResponse.json();

          const physicsQuestions =
            Array.isArray(
              qData?.questions
            )
              ? qData.questions
              : [];

          console.log(
            "===================================="
          );
          console.log(
            "PHYSICS SUBJECT TEST"
          );
          console.log(
            "CLASS:",
            className
          );
          console.log(
            "SUBJECT:",
            "Physics"
          );
          console.log(
            "TEST CATEGORY:",
            "subject"
          );
          console.log(
            "QUESTION COUNT:",
            physicsQuestions.length
          );
          console.log(
            "QUESTIONS:",
            physicsQuestions
          );
          console.log(
            "===================================="
          );

          setQuestions(
            physicsQuestions
          );

          // --------------------------------------------------
          // FETCH PREVIOUS RESULTS
          // --------------------------------------------------

          const currentStudentId =
            localStorage.getItem(
              "studentId"
            ) ||
            studentId;

          const resultsResponse =
            await fetch(
              `${API_BASE_URL}/api/results/student/${currentStudentId}`
            );

          if (
            resultsResponse.ok
          ) {
            const resultsData =
              await resultsResponse.json();

            const resultsList =
              Array.isArray(
                resultsData
              )
                ? resultsData
                : (
                    resultsData?.results ||
                    resultsData?.data ||
                    []
                  );

            const loadedSubmittedChapters:
              Record<string, boolean> =
              {};

            const loadedChapterAnswers:
              Record<
                string,
                Record<string, string>
              > = {};

            resultsList.forEach(
              (result: any) => {
                if (
                  result?.examName &&
                  result.examName.includes(
                    "Physics -"
                  )
                ) {
                  const parts =
                    result.examName.split(
                      "Physics -"
                    );

                  const chapName =
                    parts[1]?.trim();

                  if (
                    chapName &&
                    Array.isArray(
                      result.review
                    )
                  ) {
                    loadedSubmittedChapters[
                      chapName
                    ] = true;

                    const answerMap:
                      Record<
                        string,
                        string
                      > = {};

                    result.review.forEach(
                      (item: any) => {
                        if (
                          item?.questionId &&
                          item?.selectedAnswer
                        ) {
                          answerMap[
                            item.questionId
                          ] =
                            item.selectedAnswer;
                        }
                      }
                    );

                    loadedChapterAnswers[
                      chapName
                    ] = answerMap;
                  }
                }
              }
            );

            setSubmittedChapters(
              loadedSubmittedChapters
            );

            setChapterUserAnswers(
              loadedChapterAnswers
            );
          }
        } catch (
          err: any
        ) {
          console.error(
            "PHYSICS DATA LOAD ERROR:",
            err
          );

          setError(
            err?.message ||
              "Failed to load Physics data"
          );
        } finally {
          setLoading(false);
        }
      };

    loadDataFromDB();
  }, [className]);

  // ==========================================================
  // NORMALIZE CHAPTER NAME
  // ==========================================================

  const getChapterName = (
    question: Question
  ) => {
    const chapter =
      String(
        question.chapter || ""
      ).trim();

    return (
      chapter ||
      "General Physics"
    );
  };

  // ==========================================================
  // BUILD CHAPTER LIST
  // ==========================================================

  const chaptersList =
    useMemo(() => {
      const map =
        new Map<string, number>();

      questions.forEach(
        (question) => {
          const chapter =
            getChapterName(
              question
            );

          map.set(
            chapter,
            (map.get(
              chapter
            ) || 0) + 1
          );
        }
      );

      return Array.from(
        map.entries()
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
        (question) => {
          const chapter =
            getChapterName(
              question
            );

          return (
            chapter ===
            selectedChapter
          );
        }
      );
    }, [
      questions,
      selectedChapter,
    ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "#64748b",
          fontSize: "16px",
        }}
      >
        Loading Physics data from database...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "red",
          fontSize: "16px",
        }}
      >
        {error}
      </div>
    );
  }

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

        onBack={() =>
          setSelectedChapter(null)
        }

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

        // IMPORTANT:
        // Physics page is Subject Test
        testCategory="subject"

        // Subject Test has no JEE / NEET
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

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="physics-hero">

          <div className="physics-hero-content">

            <div className="physics-badge">
              <Zap size={15} />

              JEE / NEET •{" "}
              {className.toUpperCase()}{" "}
              PHYSICS
            </div>

            <h1 className="physics-title">
              Physics

              <span>
                Master Concepts. Crack Exams.
              </span>
            </h1>

            <p className="physics-description">
              Welcome back,{" "}
              <strong>
                {studentName}
              </strong>
              ! Practice{" "}
              {className} Physics
              chapter-wise with focused
              numerical problems, laws,
              and exam-oriented tests.
            </p>

            <div className="physics-stats">

              <div className="physics-stat">

                <span className="physics-stat-value">
                  {questions.length}+
                </span>

                <span className="physics-stat-label">
                  {className} Questions
                </span>

              </div>

              <div className="physics-stat">

                <span className="physics-stat-value">
                  {chaptersList.length}
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


        {/* ==================================================
            CHAPTER SECTION
        ================================================== */}

        <section>

          <div className="physics-section-header">

            <div>

              <h2 className="physics-section-title">
                {className} Physics Chapters
              </h2>

              <p className="physics-section-subtitle">
                Select a chapter and start
                your practice. (Student ID:{" "}
                {studentId})
              </p>

            </div>

          </div>


          {/* ==================================================
              NO CHAPTERS
          ================================================== */}

          {chaptersList.length === 0 ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
                background: "#fff",
                borderRadius: "12px",
                border:
                  "1px solid #e2e8f0",
              }}
            >
              No Physics chapters found
              for {className}.
            </div>

          ) : (

            <div className="physics-chapter-grid">

              {chaptersList.map(
                (
                  chapter,
                  index
                ) => {

                  const isCompleted =
                    submittedChapters[
                      chapter.name
                    ];

                  return (
                    <div
                      className="physics-chapter-card"
                      key={chapter.name}
                    >

                      <div className="physics-card-top">

                        <div className="physics-chapter-icon">
                          <Zap size={24} />
                        </div>

                        <span className="physics-chapter-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                      </div>


                      <div className="physics-card-content">

                        <h3>
                          {chapter.name}{" "}
                          {isCompleted &&
                            "✅"}
                        </h3>

                        <p>
                          Practice important
                          multiple-choice
                          questions and
                          conceptual problems
                          from this chapter.
                        </p>

                        <div
                          style={{
                            fontSize:
                              "13px",
                            fontWeight:
                              "600",
                            color:
                              "#2563eb",
                            marginBottom:
                              "12px",
                          }}
                        >
                          {chapter.count}{" "}
                          Questions Available{" "}
                          {isCompleted &&
                            "• Saved in DB"}
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
                          <BookOpen size={16} />

                          {isCompleted
                            ? "View DB History"
                            : "Start Practice"}

                          <ArrowRight
                            size={15}
                          />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}