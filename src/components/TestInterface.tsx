
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
  Trophy,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./TestInterface.css";

// ======================================================
// TYPES
// ======================================================

interface Question {
  _id: string;

  question?: string;
  questionText?: string;

  options: string[] | any[];

  correctAnswer: string;

  subject?: string;
  chapter?: string;
  chapterName?: string;

  questionNumber?: number;
  subjectQuestionNumber?: number;
  globalQuestionNumber?: number;

  questionImage?: string;
  imageUrl?: string;

  tableHeaders?: string[];
  tableRows?: any[][];
}

type TestCategory =
  | "daily"
  | "subject";

type ExamType =
  | "JEE"
  | "NEET"
  | "";

interface TestInterfaceProps {
  subject: string;

  className: string;

  chapterName: string;

  questions: Question[];

  studentId: string;

  studentName: string;

  themeColor?: string;

  onBack: () => void;

  isAlreadySubmitted: boolean;

  initialAnswers?: Record<string, string>;

  apiBaseUrl?: string;

  durationMinutes?: number;

  // Daily / Subject only
  testCategory?: TestCategory;

  // Daily only; Subject = ""
  examType?: ExamType;
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
// TEST TYPE HELPERS
// ======================================================

const getTestTypeLabel = (
  category: TestCategory
) => {
  if (category === "subject") {
    return "Subject Test";
  }

  return "Daily Test";
};

const getTestTypeShortLabel = (
  category: TestCategory
) => {
  if (category === "subject") {
    return "SUBJECT";
  }

  return "DAILY";
};

// ======================================================
// COMPONENT
// ======================================================

export default function TestInterface({
  subject,
  className,
  chapterName,
  questions,
  studentId,
  studentName,
  themeColor = "#2563eb",
  onBack,
  isAlreadySubmitted: initialSubmitted,
  initialAnswers = {},
  apiBaseUrl = "http://localhost:5000",
  durationMinutes,

  // Daily remains default
  testCategory = "daily",

  // Daily uses JEE/NEET
  // Subject uses ""
  examType = "",
}: TestInterfaceProps) {
  const navigate = useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState<AnswerMap>(initialAnswers);

  const [markedForReview, setMarkedForReview] =
    useState<ReviewMap>({});

  const fallbackDuration =
    questions.length > 0
      ? questions.length * 60
      : 45 * 60;

  const initialDuration =
    durationMinutes &&
    durationMinutes > 0
      ? durationMinutes * 60
      : fallbackDuration;

  const [timeLeft, setTimeLeft] =
    useState<number>(initialDuration);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState<boolean>(initialSubmitted);

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

  const [score, setScore] = useState(0);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [wrongCount, setWrongCount] =
    useState(0);

  const [unattemptedCount, setUnattemptedCount] =
    useState(0);

  const [attemptedCount, setAttemptedCount] =
    useState(0);

  const hasSubmittedRef =
    useRef(false);

  const timerInitializedRef =
    useRef(false);

  // ====================================================
  // LABELS
  // ====================================================

  const testTypeLabel = useMemo(
    () =>
      getTestTypeLabel(testCategory),
    [testCategory]
  );

  const testTypeShortLabel = useMemo(
    () =>
      getTestTypeShortLabel(
        testCategory
      ),
    [testCategory]
  );

  // ====================================================
  // TEST KEY
  // ====================================================

  const testKey = useMemo(() => {
    return [
      "exam-master",
      testCategory,
      subject,
      className,
      chapterName ||
        `${testCategory}-test`,
      studentId,
    ]
      .join("_")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }, [
    testCategory,
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
        `${testCategory}-question-${index}`
      );
    },
    [testCategory]
  );

  const getQuestionText = useCallback(
    (question?: Question) => {
      if (!question) {
        return "";
      }

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
      if (
        typeof option === "string"
      ) {
        return option;
      }

      if (
        option?.text !== undefined
      ) {
        return String(option.text);
      }

      if (
        option?.value !== undefined
      ) {
        return String(option.value);
      }

      if (
        option?.label !== undefined
      ) {
        return String(option.label);
      }

      return String(option ?? "");
    },
    []
  );

  // ====================================================
  // NORMALIZE ANSWER
  // ====================================================

  const normalizeAnswer =
    useCallback(
      (value: unknown) => {
        return String(value ?? "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
      },
      []
    );

  // ====================================================
  // ANSWER CHECK
  // ====================================================

  const isAnswerCorrect =
    useCallback(
      (
        question: Question,
        selectedAnswer: string
      ) => {
        if (!selectedAnswer) {
          return false;
        }

        const selected =
          normalizeAnswer(
            selectedAnswer
          );

        const correct =
          normalizeAnswer(
            question.correctAnswer
          );

        if (!correct) {
          return false;
        }

        // Direct answer match
        if (
          selected === correct
        ) {
          return true;
        }

        // A / B / C / D
        const letters = [
          "a",
          "b",
          "c",
          "d",
        ];

        const correctLetterIndex =
          letters.indexOf(correct);

        if (
          correctLetterIndex >= 0
        ) {
          const correctOption =
            question.options?.[
              correctLetterIndex
            ];

          if (
            correctOption !==
              undefined &&
            selected ===
              normalizeAnswer(
                getOptionText(
                  correctOption
                )
              )
          ) {
            return true;
          }
        }

        // 1 / 2 / 3 / 4
        const numericIndex =
          [
            "1",
            "2",
            "3",
            "4",
          ].indexOf(correct);

        if (
          numericIndex >= 0
        ) {
          const correctOption =
            question.options?.[
              numericIndex
            ];

          if (
            correctOption !==
              undefined &&
            selected ===
              normalizeAnswer(
                getOptionText(
                  correctOption
                )
              )
          ) {
            return true;
          }
        }

        // Option A / Option B...
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

            if (
              option !== undefined &&
              selected ===
                normalizeAnswer(
                  getOptionText(option)
                )
            ) {
              return true;
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

  const currentDisplayQuestionNumber =
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
  // RESTORE SESSION
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
            "Invalid saved answers"
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
            setMarkedForReview(parsed);
          }
        } catch {
          console.warn(
            "Invalid review data"
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
        `Unable to restore ${testTypeLabel}:`,
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
    testTypeLabel,
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
        "Unable to save review:",
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
          previous =>
            previous > 0
              ? previous - 1
              : 0
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    submitted,
    isSubmitting,
    questions.length,
    timeLeft,
  ]);

  // ====================================================
  // TIMER FORMAT
  // ====================================================

  const formatTime = useCallback(
    (seconds: number) => {
      const safeSeconds =
        Math.max(0, seconds);

      const hours =
        Math.floor(
          safeSeconds / 3600
        );

      const minutes =
        Math.floor(
          (safeSeconds % 3600) / 60
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

  const timerDanger =
    timeLeft <= 60;

  const timerWarning =
    timeLeft <= 300 &&
    timeLeft > 60;

  // ====================================================
  // SELECT ANSWER
  // ====================================================

  const handleSelectOption =
    useCallback(
      (option: string) => {
        if (
          !currentQuestionId ||
          submitted
        ) {
          return;
        }

        setAnswers(previous => ({
          ...previous,
          [currentQuestionId]:
            option,
        }));
      },
      [
        currentQuestionId,
        submitted,
      ]
    );

  // ====================================================
  // CLEAR
  // ====================================================

  const handleClearAnswer =
    useCallback(() => {
      if (
        !currentQuestionId ||
        submitted
      ) {
        return;
      }

      setAnswers(previous => {
        const next = {
          ...previous,
        };

        delete next[
          currentQuestionId
        ];

        return next;
      });
    }, [
      currentQuestionId,
      submitted,
    ]);

  // ====================================================
  // REVIEW
  // ====================================================

  const handleToggleReview =
    useCallback(() => {
      if (
        !currentQuestionId ||
        submitted
      ) {
        return;
      }

      setMarkedForReview(
        previous => ({
          ...previous,
          [currentQuestionId]:
            !previous[
              currentQuestionId
            ],
        })
      );
    }, [
      currentQuestionId,
      submitted,
    ]);

  // ====================================================
  // NEXT
  // ====================================================

  const goNext = useCallback(() => {
    setCurrentQuestion(
      previous =>
        Math.min(
          questions.length - 1,
          previous + 1
        )
    );
  }, [
    questions.length,
  ]);

  // ====================================================
  // PREVIOUS
  // ====================================================

  const goPrevious =
    useCallback(() => {
      setCurrentQuestion(
        previous =>
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
      if (!currentQuestionId) {
        return;
      }

      setMarkedForReview(
        previous => ({
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
          previous =>
            previous + 1
        );
      }
    }, [
      currentQuestionId,
      currentQuestion,
      questions.length,
    ]);

  // ====================================================
  // RESULT CALCULATION
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
            Boolean(userAnswer) &&
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

      const marksPerQuestion = 4;

      const negativePerQuestion = 1;

      const marks =
        correct *
          marksPerQuestion -
        wrong *
          negativePerQuestion;

      const totalPossibleMarks =
        totalQuestions *
        marksPerQuestion;

      const percentage =
        totalPossibleMarks > 0
          ? Math.max(
              0,
              Math.round(
                (marks /
                  totalPossibleMarks) *
                  100
              )
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
        marks,
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
  // TEST / EXAM ID
  // ====================================================

  const examId = useMemo(() => {
    return [
      testCategory,
      subject,
      className,
      chapterName ||
        `${testCategory}-test`,
    ]
      .filter(Boolean)
      .join("-")
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
    testCategory,
    subject,
    className,
    chapterName,
  ]);

  // ====================================================
  // SUBMIT
  // ====================================================

  const submitTest = useCallback(
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

      // ==================================================
      // TEST NAME
      // ==================================================

      const examName =
        `${className} ${subject} ${testTypeLabel}` +
        (chapterName
          ? ` - ${chapterName}`
          : "");

      // ==================================================
      // PAYLOAD
      // ==================================================

      const payload = {
        studentId,

        studentName,

        examId,

        examName,

        testCategory,

        subject,

        chapter:
          chapterName || "",

        className:
          className || "",

        // Subject Test = ""
        // Daily Test = JEE / NEET
        examType:
          testCategory === "subject"
            ? ""
            : examType,

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
          result.marks,

        percentage:
          result.percentage,

        grade:
          result.grade,

        status:
          result.status,

        timeTaken:
          Math.max(
            0,
            Math.round(
              (
                initialDuration -
                timeLeft
              ) / 60
            )
          ),

        autoSubmitted:
          isAutoSubmit,

        warnings: 0,

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

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        if (!response.ok) {
          let errorMessage =
            `Unable to submit ${testTypeLabel}.`;

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData?.message ||
              errorData?.error ||
              errorMessage;
          } catch {}

          throw new Error(
            errorMessage
          );
        }

        let serverResult = null;

        try {
          serverResult =
            await response.json();
        } catch {}

        // ==================================================
        // RESULT STATE
        // ==================================================

        setScore(
          result.marks
        );

        setCorrectCount(
          result.correct
        );

        setWrongCount(
          result.wrong
        );

        setUnattemptedCount(
          result.unattempted
        );

        setAttemptedCount(
          result.attempted
        );

        const finalResult = {
          ...result,
          ...payload,
          serverResult,
        };

        setResultSummary(
          finalResult
        );

        // ==================================================
        // SAVE RESULT LOCALLY
        // ==================================================

        sessionStorage.setItem(
          `${testKey}_result`,
          JSON.stringify(
            finalResult
          )
        );

        sessionStorage.setItem(
          `${testKey}_questions`,
          JSON.stringify(
            questions
          )
        );

        sessionStorage.setItem(
          `${testKey}_final_answers`,
          JSON.stringify(
            answers
          )
        );

        // ==================================================
        // CLEAR ACTIVE SESSION
        // ==================================================

        sessionStorage.removeItem(
          answerStorageKey
        );

        sessionStorage.removeItem(
          reviewStorageKey
        );

        sessionStorage.removeItem(
          timerStorageKey
        );

        // ==================================================
        // FINISH
        // ==================================================

        setSubmitted(true);

        setAutoSubmitted(false);
      } catch (error: any) {
        console.error(
          `${testTypeLabel} submission error:`,
          error
        );

        hasSubmittedRef.current =
          false;

        setAutoSubmitted(false);

        setSubmitError(
          error?.message ||
            `${testTypeLabel} submission failed.`
        );
      } finally {
        setIsSubmitting(false);
        setShowSubmitModal(false);
      }
    },
    [
      isSubmitting,
      calculateResult,
      studentId,
      studentName,
      examId,
      
      testCategory,
      subject,
      chapterName,
      className,
      examType,
      apiBaseUrl,
      initialDuration,
      timeLeft,
      answerStorageKey,
      reviewStorageKey,
      timerStorageKey,
      testKey,
      questions,
      answers,
      testTypeLabel,
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
      submitTest(true);
    }
  }, [
    timeLeft,
    submitted,
    isSubmitting,
    questions.length,
    submitTest,
  ]);

  // ====================================================
  // KEYBOARD
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
            `You have unsaved ${testTypeLabel} progress. Are you sure you want to exit?`
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
      testTypeLabel,
    ]);

  // ====================================================
  // PERFORMANCE
  // ====================================================

  const getPerformanceDetails =
    (pct: number) => {
      if (pct >= 85) {
        return {
          title:
            `Outstanding Performance, ${studentName}! 🚀`,

          subtitle:
            "Exceptional performance. Keep maintaining this level!",
        };
      }

      if (pct >= 60) {
        return {
          title:
            `Great Job, ${studentName}! 🌟`,

          subtitle:
            "Strong performance. Keep improving consistently!",
        };
      }

      if (pct >= 35) {
        return {
          title:
            `Good Effort, ${studentName}! 👍`,

          subtitle:
            "You passed. Review the incorrect answers and improve further.",
        };
      }

      return {
        title:
          `Keep Practicing, ${studentName}! 💪`,

        subtitle:
          "Review your mistakes and try again with better preparation.",
      };
    };

  // ====================================================
  // EMPTY
  // ====================================================

  if (!questions.length) {
    return (
      <div className="exam-page exam-empty">
        <div className="exam-empty-card">

          <div className="exam-empty-icon">
            <AlertTriangle />
          </div>

          <h2>
            No {subject} Questions Available
          </h2>

          <p>
            Questions are not available
            for this {testTypeLabel.toLowerCase()} yet.
          </p>

          <button
            onClick={onBack}
            className="premium-btn primary"
          >
            <ArrowLeft size={18} />
            Back
          </button>

        </div>
      </div>
    );
  }

  // ====================================================
  // RESULT SCREEN
  // ====================================================

  if (submitted) {
    const totalPossible =
      questions.length * 4;

    const percentage =
      totalPossible > 0
        ? Math.max(
            0,
            Math.round(
              (score /
                totalPossible) *
                100
            )
          )
        : 0;

    const performance =
      getPerformanceDetails(
        percentage
      );

    return (
      <div
        className="test-result-wrapper"
        style={
          {
            "--exam-primary":
              themeColor,
          } as React.CSSProperties
        }
      >
        <div className="test-result-card">

          <div
            className="test-trophy-icon"
            style={{
              background:
                `${themeColor}15`,
              color:
                themeColor,
            }}
          >
            <Trophy size={40} />
          </div>

          <div className="daily-result-badge">
            {testTypeShortLabel} TEST •{" "}
            {subject.toUpperCase()} •{" "}
            {percentage}%
          </div>

          <h1 className="test-title">
            {performance.title}
          </h1>

          <p className="test-subtitle">
            {performance.subtitle}
          </p>

          <div
            className="test-score-circle"
            style={{
              border:
                `6px solid ${themeColor}`,
            }}
          >
            <strong>
              {score}
            </strong>

            <span>
              TOTAL MARKS
            </span>
          </div>

          <div className="daily-result-grid">

            <div>
              <span>
                Total
              </span>

              <strong>
                {questions.length}
              </strong>
            </div>

            <div>
              <span>
                Attempted
              </span>

              <strong>
                {attemptedCount}
              </strong>
            </div>

            <div className="correct-box">
              <span>
                Correct (+4)
              </span>

              <strong>
                {correctCount}
              </strong>
            </div>

            <div className="wrong-box">
              <span>
                Wrong (-1)
              </span>

              <strong>
                {wrongCount}
              </strong>
            </div>

            <div className="skip-box">
              <span>
                Unattempted
              </span>

              <strong>
                {unattemptedCount}
              </strong>
            </div>

            <div>
              <span>
                Grade
              </span>

              <strong>
                {resultSummary?.grade ||
                  "F"}
              </strong>
            </div>

          </div>

          <div className="daily-result-actions">

            <button
              onClick={() => {
                navigate(
                  "/student/daily-test-result",
                  {
                    state: {
                      subject,
                      className,
                      chapterName,
                      studentId,
                      studentName,
                      questions,
                      answers,
                      markedForReview,
                      resultSummary,
                      score,
                      correctCount,
                      wrongCount,
                      unattemptedCount,
                      attemptedCount,
                      themeColor,
                      testCategory,
                      examType,
                    },
                  }
                );
              }}
              className="daily-review-btn"
            >
              <CheckCircle2 size={17} />
              View Result
            </button>

            <button
              onClick={onBack}
              className="daily-back-btn"
              style={{
                background:
                  themeColor,
              }}
            >
              Back to Dashboard
              <ArrowRight size={17} />
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
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
            title={`Exit ${testTypeLabel}`}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            className="exam-brand-mark daily-brand"
            style={{
              background:
                themeColor,
            }}
          >
            <Trophy size={18} />
          </div>

          <div className="exam-heading">

            <div className="exam-title-row">

              <h3>
                {subject}{" "}
                {testTypeLabel}
              </h3>

              <span
                className="exam-type-badge"
                style={{
                  color:
                    themeColor,
                }}
              >
                {testTypeShortLabel}
              </span>

            </div>

            <span>
              {chapterName ||
                "Practice"}{" "}
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
          BODY
      ================================================== */}

      <div className="exam-body">

        {/* ==================================================
            QUESTION PANEL
        ================================================== */}

        <main className="question-panel">

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
                    width:
                      `${
                        (
                          (
                            currentQuestion +
                            1
                          ) /
                          questions.length
                        ) *
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


          {/* ==================================================
              QUESTION
          ================================================== */}

          <section className="question-content">

            <div
              className="question-number"
              style={{
                background:
                  `${themeColor}12`,
                color:
                  themeColor,
              }}
            >
              Q
              {currentDisplayQuestionNumber}
            </div>

            <div className="question-main">

              <h1>
                {getQuestionText(
                  currentQ
                )}
              </h1>

              <div className="question-hint">
                Select your answer
              </div>

            </div>

          </section>


          {/* ==================================================
              IMAGE
          ================================================== */}

          {(currentQ?.questionImage ||
            currentQ?.imageUrl) && (
            <div className="question-image-container">

              <img
                src={
                  currentQ.questionImage ||
                  currentQ.imageUrl
                }
                alt={`Question ${currentDisplayQuestionNumber}`}
                className="question-image"
              />

            </div>
          )}


          {/* ==================================================
              TABLE
          ================================================== */}

          {currentQ?.tableHeaders &&
            currentQ.tableHeaders
              .length > 0 && (

              <div className="question-table-wrapper">

                <table className="question-table">

                  <thead>

                    <tr>

                      {currentQ.tableHeaders.map(
                        (
                          header,
                          index
                        ) => (
                          <th
                            key={index}
                          >
                            {header}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {(
                      currentQ.tableRows ||
                      []
                    ).map(
                      (
                        row,
                        rowIndex
                      ) => (

                        <tr
                          key={
                            rowIndex
                          }
                        >

                          {(
                            Array.isArray(
                              row
                            )
                              ? row
                              : Object.values(
                                  row || {}
                                )
                          ).map(
                            (
                              cell,
                              cellIndex
                            ) => (
                              <td
                                key={
                                  cellIndex
                                }
                              >
                                {String(
                                  cell ??
                                    ""
                                )}
                              </td>
                            )
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}


          {/* ==================================================
              OPTIONS
          ================================================== */}

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
                    key={
                      `${currentQuestionId}-${index}`
                    }
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

                  </button>

                );
              }
            )}

          </div>


          {/* ==================================================
              QUESTION ACTIONS
          ================================================== */}

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


          {/* ==================================================
              NAVIGATION
          ================================================== */}

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
                onClick={
                  goNext
                }
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

            <div className="student-card">

              <div
                className="student-avatar"
                style={{
                  background:
                    themeColor,
                }}
              >
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
                        index + 1
                      }`}
                    >
                      {index + 1}
                    </button>

                  );
                }
              )}

            </div>


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
                  Submit{" "}
                  {testTypeLabel}
                </strong>

                <small>
                  Review before submitting
                </small>

              </span>

              <ArrowRight
                size={17}
              />

            </button>

          </aside>

        )}

      </div>


      {/* ==================================================
          MOBILE PALETTE
      ================================================== */}

      <button
        className="mobile-palette-toggle"
        onClick={() =>
          setShowPalette(
            previous =>
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
            onClick={event =>
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


            <div
              className="modal-icon"
              style={{
                background:
                  `${themeColor}15`,
                color:
                  themeColor,
              }}
            >
              <Send size={25} />
            </div>


            <div className="modal-badge">
              {testTypeShortLabel} TEST SUBMISSION
            </div>


            <h2>
              Submit your test?
            </h2>


            <p>
              Once submitted, your
              responses will be
              recorded and evaluated.
            </p>


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
                  unanswered
                  question
                  {unansweredCount >
                  1
                    ? "s"
                    : ""}.
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
                  submitTest(false)
                }
                style={{
                  background:
                    themeColor,
                }}
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
          AUTO SUBMIT
      ================================================== */}

      {autoSubmitted &&
        !submitted &&
        isSubmitting && (

          <div className="auto-submit-overlay">

            <div className="auto-submit-card">

              <div className="auto-submit-icon">
                <Clock3 size={30} />
              </div>

              <h2>
                Time's Up
              </h2>

              <p>
                Your{" "}
                {testTypeLabel.toLowerCase()}{" "}
                is being submitted
                automatically.
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


