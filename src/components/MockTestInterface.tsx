import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  
  X,
  Zap,
} from "lucide-react";

import "./MockTestInterface.css";

// ======================================================
// TYPES
// ======================================================

interface Question {
  _id?: string;
  id?: string;

  questionText?: string;
  question?: string;

  options: string[] | any[];

  /*
   * Backend may return:
   * A / B / C / D
   * OR
   * actual option text
   * OR
   * 1 / 2 / 3 / 4
   */
  correctAnswer: string;

  subject?: string;
  chapter?: string;
  chapterName?: string;

  /*
   * IMPORTANT:
   * Original PDF question number.
   */
  questionNumber?: number;
}

interface MockTestInterfaceProps {
  subject: string;
  className: string;
  chapterName: string;

  questions: Question[];

  studentId: string;
  studentName: string;

  themeColor?: string;

  onBack: () => void;

  apiBaseUrl: string;
}

type AnswerMap = Record<string, string>;
type ReviewMap = Record<string, boolean>;

interface ReviewItem {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

// ======================================================
// COMPONENT
// ======================================================

export default function MockTestInterface({
  subject,
  className,
  chapterName,
  questions,
  studentId,
  studentName,
  themeColor = "#d97706",
  onBack,
  apiBaseUrl,
}: MockTestInterfaceProps) {
  // ====================================================
  // STATE
  // ====================================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [markedForReview, setMarkedForReview] =
    useState<ReviewMap>({});

  const [timeLeft, setTimeLeft] = useState<number>(
    questions.length > 0
      ? questions.length * 60
      : 45 * 60
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [showPalette, setShowPalette] =
    useState(true);

  const [autoSubmitted, setAutoSubmitted] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [resultSummary, setResultSummary] =
    useState<any>(null);

  const hasSubmittedRef =
    useRef(false);

  const timerInitializedRef =
    useRef(false);

  // ====================================================
  // UNIQUE TEST KEY
  // ====================================================

  const testKey = useMemo(() => {
    return [
      "exam-master",
      "mock",
      subject,
      className,
      chapterName || "full-assessment",
      studentId,
    ]
      .join("_")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }, [
    subject,
    className,
    chapterName,
    studentId,
  ]);

  const answerStorageKey =
    `${testKey}_answers`;

  const reviewStorageKey =
    `${testKey}_review`;

  const timerStorageKey =
    `${testKey}_timer`;

  // ====================================================
  // QUESTION HELPERS
  // ====================================================

  const getQuestionId = useCallback(
    (
      question: Question,
      index: number
    ) => {
      return (
        question._id ||
        question.id ||
        `question-${index}`
      );
    },
    []
  );

  const getQuestionText = useCallback(
    (question?: Question) => {
      if (!question) return "";

      return (
        question.question ||
        question.questionText ||
        ""
      );
    },
    []
  );

  const getOptionText = useCallback(
    (option: any) => {
      if (typeof option === "string") {
        return option;
      }

      if (option?.text !== undefined) {
        return String(option.text);
      }

      if (option?.value !== undefined) {
        return String(option.value);
      }

      if (option?.label !== undefined) {
        return String(option.label);
      }

      return String(option ?? "");
    },
    []
  );

  // ====================================================
  // NORMALIZE ANSWER
  // ====================================================

  const normalizeAnswer = useCallback(
    (value: unknown) => {
      return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    },
    []
  );

  // ====================================================
  // CHECK CORRECT ANSWER
  // ====================================================

  const isAnswerCorrect = useCallback(
    (
      question: Question,
      selectedAnswer: string
    ) => {
      if (!selectedAnswer) {
        return false;
      }

      const selected =
        normalizeAnswer(selectedAnswer);

      const correct =
        normalizeAnswer(
          question.correctAnswer
        );

      if (!correct) {
        return false;
      }

      // -----------------------------------------------
      // DIRECT TEXT MATCH
      // -----------------------------------------------

      if (selected === correct) {
        return true;
      }

      // -----------------------------------------------
      // A / B / C / D
      // -----------------------------------------------

      const letters = [
        "a",
        "b",
        "c",
        "d",
      ];

      const correctLetterIndex =
        letters.indexOf(correct);

      if (correctLetterIndex >= 0) {
        const selectedOption =
          question.options?.[
            correctLetterIndex
          ];

        if (
          selectedOption !== undefined
        ) {
          const correctText =
            normalizeAnswer(
              getOptionText(
                selectedOption
              )
            );

          if (selected === correctText) {
            return true;
          }
        }
      }

      // -----------------------------------------------
      // 1 / 2 / 3 / 4
      // -----------------------------------------------

      const numericIndex =
        ["1", "2", "3", "4"].indexOf(
          correct
        );

      if (numericIndex >= 0) {
        const correctOption =
          question.options?.[
            numericIndex
          ];

        if (
          correctOption !== undefined
        ) {
          const correctText =
            normalizeAnswer(
              getOptionText(
                correctOption
              )
            );

          if (selected === correctText) {
            return true;
          }
        }
      }

      // -----------------------------------------------
      // "OPTION A", "OPTION B" etc.
      // -----------------------------------------------

      const optionMatch =
        correct.match(
          /(?:option\s*)?([abcd])/
        );

      if (optionMatch) {
        const index =
          letters.indexOf(
            optionMatch[1]
          );

        if (index >= 0) {
          const option =
            question.options?.[index];

          if (option !== undefined) {
            return (
              selected ===
              normalizeAnswer(
                getOptionText(option)
              )
            );
          }
        }
      }

      return false;
    },
    [
      getOptionText,
      normalizeAnswer,
    ]
  );

  // ====================================================
  // CURRENT QUESTION
  // ====================================================

  const currentQ =
    questions[currentQuestion];

  const currentQuestionId =
    currentQ
      ? getQuestionId(
          currentQ,
          currentQuestion
        )
      : "";

  // ====================================================
  // DISPLAY QUESTION NUMBER
  // ====================================================

  const currentDisplayQuestionNumber =
    currentQ?.questionNumber ??
    currentQuestion + 1;

  // ====================================================
  // COUNTS
  // ====================================================

  const answeredCount = useMemo(() => {
    return questions.reduce(
      (count, question, index) => {
        const id =
          getQuestionId(
            question,
            index
          );

        return answers[id]
          ? count + 1
          : count;
      },
      0
    );
  }, [
    questions,
    answers,
    getQuestionId,
  ]);

  const reviewCount = useMemo(() => {
    return questions.reduce(
      (count, question, index) => {
        const id =
          getQuestionId(
            question,
            index
          );

        return markedForReview[id]
          ? count + 1
          : count;
      },
      0
    );
  }, [
    questions,
    markedForReview,
    getQuestionId,
  ]);

  const unansweredCount =
    questions.length -
    answeredCount;

  // ====================================================
  // RESTORE ANSWERS / REVIEW / TIMER
  // ====================================================

  useEffect(() => {
    try {
      const savedAnswers =
        sessionStorage.getItem(
          answerStorageKey
        );

      const savedReview =
        sessionStorage.getItem(
          reviewStorageKey
        );

      const savedTimer =
        sessionStorage.getItem(
          timerStorageKey
        );

      if (savedAnswers) {
        try {
          const parsed =
            JSON.parse(savedAnswers);

          if (
            parsed &&
            typeof parsed === "object"
          ) {
            setAnswers(parsed);
          }
        } catch {
          console.warn(
            "Invalid saved answers."
          );
        }
      }

      if (savedReview) {
        try {
          const parsed =
            JSON.parse(savedReview);

          if (
            parsed &&
            typeof parsed === "object"
          ) {
            setMarkedForReview(
              parsed
            );
          }
        } catch {
          console.warn(
            "Invalid saved review state."
          );
        }
      }

      if (
        savedTimer &&
        !Number.isNaN(
          Number(savedTimer)
        )
      ) {
        const restoredTime =
          Number(savedTimer);

        if (restoredTime > 0) {
          setTimeLeft(
            restoredTime
          );
        }
      }
    } catch (error) {
      console.warn(
        "Unable to restore exam state:",
        error
      );
    } finally {
      timerInitializedRef.current =
        true;
    }
  }, [
    answerStorageKey,
    reviewStorageKey,
    timerStorageKey,
  ]);

  // ====================================================
  // SAVE ANSWERS
  // ====================================================

  useEffect(() => {
    try {
      sessionStorage.setItem(
        answerStorageKey,
        JSON.stringify(answers)
      );
    } catch (error) {
      console.warn(
        "Unable to save answers:",
        error
      );
    }
  }, [
    answers,
    answerStorageKey,
  ]);

  // ====================================================
  // SAVE REVIEW
  // ====================================================

  useEffect(() => {
    try {
      sessionStorage.setItem(
        reviewStorageKey,
        JSON.stringify(
          markedForReview
        )
      );
    } catch (error) {
      console.warn(
        "Unable to save review state:",
        error
      );
    }
  }, [
    markedForReview,
    reviewStorageKey,
  ]);

  // ====================================================
  // SAVE TIMER
  // ====================================================

  useEffect(() => {
    if (
      !timerInitializedRef.current ||
      submitted
    ) {
      return;
    }

    try {
      sessionStorage.setItem(
        timerStorageKey,
        String(timeLeft)
      );
    } catch (error) {
      console.warn(
        "Unable to save timer:",
        error
      );
    }
  }, [
    timeLeft,
    timerStorageKey,
    submitted,
  ]);

  // ====================================================
  // TIMER
  // ====================================================

  useEffect(() => {
    if (
      submitted ||
      isSubmitting ||
      questions.length === 0
    ) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setTimeLeft(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    submitted,
    isSubmitting,
    questions.length,
  ]);

  // ====================================================
  // FORMAT TIMER
  // ====================================================

  const formatTime = useCallback(
    (seconds: number) => {
      const safeSeconds =
        Math.max(
          0,
          seconds
        );

      const hours =
        Math.floor(
          safeSeconds / 3600
        );

      const minutes =
        Math.floor(
          (safeSeconds % 3600) /
            60
        );

      const secs =
        safeSeconds % 60;

      if (hours > 0) {
        return `${String(
          hours
        ).padStart(
          2,
          "0"
        )}:${String(
          minutes
        ).padStart(
          2,
          "0"
        )}:${String(
          secs
        ).padStart(
          2,
          "0"
        )}`;
      }

      return `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;
    },
    []
  );

  // ====================================================
  // TIMER STATUS
  // ====================================================

  const timerDanger =
    timeLeft <= 60;

  const timerWarning =
    timeLeft <= 300 &&
    timeLeft > 60;

  // ====================================================
  // SELECT OPTION
  // ====================================================

  const handleSelectOption =
    useCallback(
      (option: string) => {
        if (
          !currentQuestionId
        ) {
          return;
        }

        setAnswers(
          (previous) => ({
            ...previous,
            [currentQuestionId]:
              option,
          })
        );
      },
      [currentQuestionId]
    );

  // ====================================================
  // CLEAR ANSWER
  // ====================================================

  const handleClearAnswer =
    useCallback(() => {
      if (
        !currentQuestionId
      ) {
        return;
      }

      setAnswers(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            currentQuestionId
          ];

          return next;
        }
      );
    }, [currentQuestionId]);

  // ====================================================
  // TOGGLE REVIEW
  // ====================================================

  const handleToggleReview =
    useCallback(() => {
      if (
        !currentQuestionId
      ) {
        return;
      }

      setMarkedForReview(
        (previous) => ({
          ...previous,
          [currentQuestionId]:
            !previous[
              currentQuestionId
            ],
        })
      );
    }, [currentQuestionId]);

  // ====================================================
  // NEXT
  // ====================================================

  const goNext = useCallback(() => {
    setCurrentQuestion(
      (previous) =>
        Math.min(
          questions.length - 1,
          previous + 1
        )
    );
  }, [questions.length]);

  // ====================================================
  // PREVIOUS
  // ====================================================

  const goPrevious =
    useCallback(() => {
      setCurrentQuestion(
        (previous) =>
          Math.max(
            0,
            previous - 1
          )
      );
    }, []);

  // ====================================================
  // MARK + NEXT
  // ====================================================

  const handleReviewAndNext =
    useCallback(() => {
      if (
        !currentQuestionId
      ) {
        return;
      }

      setMarkedForReview(
        (previous) => ({
          ...previous,
          [currentQuestionId]:
            true,
        })
      );

      if (
        currentQuestion <
        questions.length - 1
      ) {
        setCurrentQuestion(
          (previous) =>
            previous + 1
        );
      }
    }, [
      currentQuestionId,
      currentQuestion,
      questions.length,
    ]);

  // ====================================================
  // CALCULATE RESULT
  // ====================================================

  const calculateResult =
    useCallback(() => {
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      const reviewList: ReviewItem[] =
        [];

      questions.forEach(
        (question, index) => {
          const id =
            getQuestionId(
              question,
              index
            );

          const userAnswer =
            answers[id] || "";

          const isCorrect =
            Boolean(
              userAnswer
            ) &&
            isAnswerCorrect(
              question,
              userAnswer
            );

          if (!userAnswer) {
            unattempted++;
          } else if (
            isCorrect
          ) {
            correct++;
          } else {
            wrong++;
          }

          reviewList.push({
            questionId: id,

            question:
              getQuestionText(
                question
              ),

            selectedAnswer:
              userAnswer ||
              "Not Attempted",

            correctAnswer:
              question.correctAnswer,

            isCorrect,
          });
        }
      );

      const totalQuestions =
        questions.length;

      const attempted =
        totalQuestions -
        unattempted;

      const percentage =
        totalQuestions > 0
          ? Math.round(
              (correct /
                totalQuestions) *
                100
            )
          : 0;

      const status =
        percentage >= 35
          ? "PASS"
          : "FAIL";

      const grade =
        percentage >= 85
          ? "A"
          : percentage >= 60
          ? "B"
          : percentage >= 35
          ? "C"
          : "F";

      return {
        correct,
        wrong,
        unattempted,
        attempted,
        totalQuestions,
        percentage,
        status,
        grade,
        reviewList,
      };
    }, [
      questions,
      answers,
      getQuestionId,
      getQuestionText,
      isAnswerCorrect,
    ]);

  // ====================================================
  // UNIQUE EXAM ID
  // ====================================================

  const examId = useMemo(() => {
    const base = [
      subject,
      className,
      chapterName ||
        "full-assessment",
    ]
      .filter(Boolean)
      .join("-");

    return `mock-${base}-${studentId}`
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .toLowerCase();
  }, [
    subject,
    className,
    chapterName,
    studentId,
  ]);

  // ====================================================
  // SUBMIT EXAM
  // ====================================================

  const submitExamData = useCallback(
    async (
      isAutoSubmit = false
    ) => {
      if (
        isSubmitting ||
        hasSubmittedRef.current
      ) {
        return;
      }

      hasSubmittedRef.current =
        true;

      setIsSubmitting(true);
      setSubmitError("");

      if (isAutoSubmit) {
        setAutoSubmitted(true);
        setShowSubmitModal(false);
      }

      const result =
        calculateResult();

      const testType =
        subject
          ?.toUpperCase() ===
        "NEET"
          ? "NEET"
          : subject
              ?.toUpperCase() ===
            "JEE"
          ? "JEE"
          : "MOCK";

      const resultPayload = {
        studentId,
        studentName,

        examId,

        examName:
          `${subject} Mock Test` +
          (chapterName
            ? ` - ${chapterName}`
            : " - Full Assessment"),

        testCategory: "mock",

        subject,

        chapter:
          chapterName || "",

        className:
          className || "",

        examType: testType,

        totalQuestions:
          result.totalQuestions,

        attemptedQuestions:
          result.attempted,

        unansweredQuestions:
          result.unattempted,

        correctAnswers:
          result.correct,

        wrongAnswers:
          result.wrong,

        marks:
          result.correct,

        percentage:
          result.percentage,

        grade:
          result.grade,

        status:
          result.status,

        timeTaken: Math.max(
          0,
          Math.round(
            (questions.length *
              60 -
              timeLeft) /
              60
          )
        ),

        autoSubmitted:
          isAutoSubmit,

        review:
          result.reviewList,

        submittedAt:
          new Date().toISOString(),
      };

      try {
        const token =
          localStorage.getItem(
            "studentToken"
          ) ||
          localStorage.getItem(
            "token"
          );

        const cleanApiBase =
          apiBaseUrl.replace(
            /\/+$/,
            ""
          );

        const response =
          await fetch(
            `${cleanApiBase}/api/results/submit`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify(
                resultPayload
              ),
            }
          );

        if (!response.ok) {
          let errorMessage =
            "Unable to submit exam.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData?.message ||
              errorData?.error ||
              errorMessage;
          } catch {
            // Ignore invalid JSON
          }

          throw new Error(
            errorMessage
          );
        }

        let serverResult =
          null;

        try {
          serverResult =
            await response.json();
        } catch {
          // Empty response is allowed
        }

        setResultSummary({
          ...resultPayload,
          ...result,
          serverResult,
        });

        // Clear saved exam state
        sessionStorage.removeItem(
          answerStorageKey
        );

        sessionStorage.removeItem(
          reviewStorageKey
        );

        sessionStorage.removeItem(
          timerStorageKey
        );

        setSubmitted(true);
        setAutoSubmitted(false);
      } catch (error: any) {
        console.error(
          "Exam submission error:",
          error
        );

        hasSubmittedRef.current =
          false;

        setAutoSubmitted(false);

        setSubmitError(
          error?.message ||
            "Exam submission failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
        setShowSubmitModal(false);
      }
    },
    [
      isSubmitting,
      calculateResult,
      subject,
      chapterName,
      className,
      studentId,
      studentName,
      examId,
      questions.length,
      timeLeft,
      apiBaseUrl,
      answerStorageKey,
      reviewStorageKey,
      timerStorageKey,
    ]
  );

  // ====================================================
  // AUTO SUBMIT
  // ====================================================

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !submitted &&
      !isSubmitting &&
      !hasSubmittedRef.current &&
      questions.length > 0
    ) {
      submitExamData(true);
    }
  }, [
    timeLeft,
    submitted,
    isSubmitting,
    questions.length,
    submitExamData,
  ]);

  // ====================================================
  // KEYBOARD SHORTCUTS
  // ====================================================

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      if (
        submitted ||
        isSubmitting
      ) {
        return;
      }

      const target =
        event.target as HTMLElement;

      if (
        target?.tagName ===
          "INPUT" ||
        target?.tagName ===
          "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        event.preventDefault();
        goNext();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        event.preventDefault();
        goPrevious();
      }

      if (
        event.key ===
        "Escape"
      ) {
        setShowSubmitModal(
          false
        );
      }

      const number =
        Number(event.key);

      if (
        number >= 1 &&
        number <= 4 &&
        currentQ?.options?.[
          number - 1
        ] !== undefined
      ) {
        handleSelectOption(
          getOptionText(
            currentQ.options[
              number - 1
            ]
          )
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    submitted,
    isSubmitting,
    goNext,
    goPrevious,
    currentQ,
    handleSelectOption,
    getOptionText,
  ]);

  // ====================================================
  // EXIT
  // ====================================================

  const handleExit =
    useCallback(() => {
      const hasProgress =
        answeredCount > 0 ||
        reviewCount > 0;

      if (hasProgress) {
        const confirmed =
          window.confirm(
            "You have unsaved exam progress. Are you sure you want to exit?"
          );

        if (!confirmed) {
          return;
        }
      }

      onBack();
    }, [
      answeredCount,
      reviewCount,
      onBack,
    ]);

  // ====================================================
  // EMPTY QUESTIONS
  // ====================================================

  if (!questions.length) {
    return (
      <div className="exam-page exam-empty">
        <div className="exam-empty-card">
          <div className="exam-empty-icon">
            <AlertTriangle />
          </div>

          <h2>
            No Questions Available
          </h2>

          <p>
            Questions are not available
            for this test yet.
          </p>

          <button
            onClick={onBack}
            className="premium-btn primary"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // SUBMITTED SCREEN
  // ====================================================

  if (submitted) {
    return (
      <div className="exam-page result-page">
        <div className="result-card">
          <div className="result-success-icon">
            <CheckCircle2 size={38} />
          </div>

          <div className="result-badge">
           
            TEST SUBMITTED
          </div>

          <h1>
            Test Submitted Successfully
          </h1>

          <p>
            Your {subject} mock test has
            been submitted successfully.
          </p>

          {resultSummary && (
            <div className="result-mini-grid">
              <div>
                <span>
                  Score
                </span>

                <strong>
                  {
                    resultSummary.correct
                  }
                  /
                  {
                    resultSummary.totalQuestions
                  }
                </strong>
              </div>

              <div>
                <span>
                  Percentage
                </span>

                <strong>
                  {
                    resultSummary.percentage
                  }%
                </strong>
              </div>

              <div>
                <span>
                  Grade
                </span>

                <strong>
                  {
                    resultSummary.grade
                  }
                </strong>
              </div>
            </div>
          )}

          <div className="result-info">
            <ShieldCheck size={18} />

            <span>
              Your result has been securely
              recorded.
            </span>
          </div>

          <button
            onClick={onBack}
            className="premium-btn primary result-back-btn"
          >
            Return to Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN EXAM UI
  // ====================================================

  return (
    <div
      className="exam-container"
      style={
        {
          "--exam-primary":
            themeColor,
          "--exam-primary-dark":
            themeColor,
        } as React.CSSProperties
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="exam-header">
        <div className="exam-header-left">
          <button
            className="header-back-btn"
            onClick={handleExit}
            title="Exit exam"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="exam-brand-mark">
            <Zap size={18} />
          </div>

          <div className="exam-heading">
            <div className="exam-title-row">
              <h3>
                {subject} Mock Test
              </h3>

              <span className="exam-type-badge">
                {subject
                  ?.toUpperCase() ===
                "NEET"
                  ? "NEET"
                  : subject
                      ?.toUpperCase() ===
                    "JEE"
                  ? "JEE"
                  : "MOCK"}
              </span>
            </div>

            <span>
              {chapterName ||
                "Full Assessment"}{" "}
              • {className}
            </span>
          </div>
        </div>

        <div className="exam-header-right">
          <div className="live-status">
            <span />
            LIVE
          </div>

          <div
            className={`timer-box ${
              timerDanger
                ? "timer-danger"
                : timerWarning
                ? "timer-warning"
                : ""
            }`}
          >
            <Clock3 size={17} />

            <div>
              <small>
                TIME LEFT
              </small>

              <strong>
                {formatTime(
                  timeLeft
                )}
              </strong>
            </div>
          </div>

          <button
            className="header-exit-btn"
            onClick={handleExit}
          >
            Exit
          </button>
        </div>
      </header>

      {/* ==================================================
          EXAM BODY
      ================================================== */}

      <div className="exam-body">
        {/* ==================================================
            QUESTION PANEL
        ================================================== */}

        <main className="question-panel">
          {/* TOP META */}

          <div className="question-topbar">
            <div>
              <div className="question-progress-label">
                QUESTION{" "}
                {currentDisplayQuestionNumber}{" "}
                OF{" "}
                {questions.length}
              </div>

              <div className="question-progress">
                <div
                  style={{
                    width: `${
                      ((currentQuestion +
                        1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="question-top-actions">
              <button
                className={`small-action ${
                  markedForReview[
                    currentQuestionId
                  ]
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleToggleReview
                }
              >
                <Flag size={15} />

                {markedForReview[
                  currentQuestionId
                ]
                  ? "Review Marked"
                  : "Mark Review"}
              </button>
            </div>
          </div>

          {/* QUESTION */}

          <section className="question-content">
            <div className="question-number">
              Q
              {
                currentDisplayQuestionNumber
              }
            </div>

            <div className="question-main">
              <h1>
                {getQuestionText(
                  currentQ
                )}
              </h1>

              <div className="question-hint">
                

                Select your option
              </div>
            </div>
          </section>

          {/* OPTIONS */}

          <div className="options-list">
            {currentQ?.options?.map(
              (
                option,
                index
              ) => {
                const optionText =
                  getOptionText(
                    option
                  );

                const isSelected =
                  answers[
                    currentQuestionId
                  ] ===
                  optionText;

                const optionLetter =
                  String.fromCharCode(
                    65 + index
                  );

                return (
                  <button
                    key={`${currentQuestionId}-${index}`}
                    type="button"
                    className={`answer-option ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectOption(
                        optionText
                      )
                    }
                  >
                    <span className="option-letter">
                      {isSelected ? (
                        <Check size={16} />
                      ) : (
                        optionLetter
                      )}
                    </span>

                    <span className="option-text">
                      {optionText}
                    </span>

                    {isSelected && (
                      <span className="selected-check">
                        <Check size={15} />
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* ACTION BAR */}

          <div className="question-actions">
            <button
              className="text-action danger-text"
              onClick={
                handleClearAnswer
              }
            >
              <RotateCcw size={15} />
              Clear Response
            </button>

            <button
              className="text-action review-action"
              onClick={
                handleReviewAndNext
              }
            >
              <Flag size={15} />

              {markedForReview[
                currentQuestionId
              ]
                ? "Marked • Next"
                : "Mark & Next"}
            </button>
          </div>

          {/* NAVIGATION */}

          <div className="question-navigation">
            <button
              className="nav-btn secondary"
              disabled={
                currentQuestion ===
                0
              }
              onClick={
                goPrevious
              }
            >
              <ChevronLeft size={19} />
              Previous
            </button>

            <div className="keyboard-hint">
              <span>
                ← →
              </span>
              Navigate

              <span>
                1–4
              </span>
              Answer
            </div>

            {currentQuestion <
            questions.length - 1 ? (
              <button
                className="nav-btn primary"
                onClick={goNext}
              >
                Next Question
                <ChevronRight
                  size={19}
                />
              </button>
            ) : (
              <button
                className="nav-btn submit"
                onClick={() =>
                  setShowSubmitModal(
                    true
                  )
                }
              >
                Submit Test
                <Send size={17} />
              </button>
            )}
          </div>
        </main>

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        {showPalette && (
          <aside className="exam-sidebar">
            {/* STUDENT */}

            <div className="student-card">
              <div className="student-avatar">
                {studentName
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "S"}
              </div>

              <div className="student-info">
                <strong>
                  {studentName}
                </strong>

                <span>
                  {studentId}
                </span>
              </div>

              <ShieldCheck
                size={17}
                className="verified-icon"
              />
            </div>

            {/* STATS */}

            <div className="exam-stats">
              <div className="stat-card answered">
                <strong>
                  {answeredCount}
                </strong>

                <span>
                  Answered
                </span>
              </div>

              <div className="stat-card review">
                <strong>
                  {reviewCount}
                </strong>

                <span>
                  Review
                </span>
              </div>

              <div className="stat-card unanswered">
                <strong>
                  {unansweredCount}
                </strong>

                <span>
                  Remaining
                </span>
              </div>
            </div>

            {/* PALETTE HEADER */}

            <div className="palette-header">
              <div>
                <h4>
                  Question Palette
                </h4>

                <span>
                  Jump to any question
                </span>
              </div>

              <LayoutGrid
                size={18}
              />
            </div>

            {/* PALETTE */}

            <div className="question-palette">
              {questions.map(
                (
                  question,
                  index
                ) => {
                  const id =
                    getQuestionId(
                      question,
                      index
                    );

                  const isAnswered =
                    Boolean(
                      answers[id]
                    );

                  const isMarked =
                    Boolean(
                      markedForReview[
                        id
                      ]
                    );

                  const isCurrent =
                    currentQuestion ===
                    index;

                  let state =
                    "unanswered";

                  if (
                    isAnswered
                  ) {
                    state =
                      "answered";
                  }

                  if (
                    isMarked
                  ) {
                    state =
                      "review";
                  }

                  if (
                    isMarked &&
                    isAnswered
                  ) {
                    state =
                      "answered-review";
                  }

                  return (
                    <button
                      key={id}
                      className={`palette-btn ${state} ${
                        isCurrent
                          ? "current"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentQuestion(
                          index
                        )
                      }
                      title={`Question ${
                        question.questionNumber ??
                        index + 1
                      }`}
                    >
                      {
                        question.questionNumber ??
                        index + 1
                      }
                    </button>
                  );
                }
              )}
            </div>

            {/* LEGEND */}

            <div className="palette-legend">
              <div>
                <span className="legend-dot answered-dot" />
                Answered
              </div>

              <div>
                <span className="legend-dot review-dot" />
                Review
              </div>

              <div>
                <span className="legend-dot unanswered-dot" />
                Not Answered
              </div>
            </div>

            {/* SUBMIT */}

            <button
              className="sidebar-submit"
              onClick={() =>
                setShowSubmitModal(
                  true
                )
              }
            >
              <div>
                <Send size={17} />
              </div>

              <span>
                <strong>
                  Submit Exam
                </strong>

                <small>
                  Review before submitting
                </small>
              </span>

              <ArrowRight size={17} />
            </button>
          </aside>
        )}
      </div>

      {/* ==================================================
          MOBILE PALETTE BUTTON
      ================================================== */}

      <button
        className="mobile-palette-toggle"
        onClick={() =>
          setShowPalette(
            (previous) =>
              !previous
          )
        }
      >
        <LayoutGrid size={18} />

        <span>
          {answeredCount}/
          {questions.length}
        </span>
      </button>

      {/* ==================================================
          SUBMIT MODAL
      ================================================== */}

      {showSubmitModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !isSubmitting &&
            setShowSubmitModal(
              false
            )
          }
        >
          <div
            className="submit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowSubmitModal(
                  false
                )
              }
              disabled={
                isSubmitting
              }
            >
              <X size={18} />
            </button>

            <div className="modal-icon">
              <Send size={25} />
            </div>

            <div className="modal-badge">
              FINAL SUBMISSION
            </div>

            <h2>
              Submit your test?
            </h2>

            <p>
              Once submitted, your
              responses will be recorded
              and evaluated.
            </p>

            {/* SUMMARY */}

            <div className="submit-summary">
              <div>
                <span>
                  Total
                </span>

                <strong>
                  {questions.length}
                </strong>
              </div>

              <div className="success">
                <span>
                  Answered
                </span>

                <strong>
                  {answeredCount}
                </strong>
              </div>

              <div className="warning">
                <span>
                  Review
                </span>

                <strong>
                  {reviewCount}
                </strong>
              </div>

              <div className="danger">
                <span>
                  Unanswered
                </span>

                <strong>
                  {unansweredCount}
                </strong>
              </div>
            </div>

            {unansweredCount >
              0 && (
              <div className="submit-warning">
                <AlertTriangle
                  size={17}
                />

                <span>
                  You still have{" "}
                  <strong>
                    {
                      unansweredCount
                    }
                  </strong>{" "}
                  unanswered question
                  {unansweredCount >
                  1
                    ? "s"
                    : ""}
                  .
                </span>
              </div>
            )}

            {submitError && (
              <div className="submit-error">
                <AlertTriangle
                  size={17}
                />

                {submitError}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-cancel"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  setShowSubmitModal(
                    false
                  )
                }
              >
                Continue Test
              </button>

              <button
                className="modal-submit"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  submitExamData(
                    false
                  )
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />

                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={18}
                    />

                    Confirm Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          AUTO SUBMIT OVERLAY
      ================================================== */}

      {autoSubmitted &&
        !submitted &&
        isSubmitting && (
          <div className="auto-submit-overlay">
            <div className="auto-submit-card">
              <div className="auto-submit-icon">
                <Clock3
                  size={30}
                />
              </div>

              <h2>
                Time's Up
              </h2>

              <p>
                Your test is being
                submitted automatically.
              </p>

              <Loader2
                className="spin"
                size={24}
              />
            </div>
          </div>
        )}
    </div>
  );
}