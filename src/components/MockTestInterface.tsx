import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

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

interface QuestionImage {
  url?: string;
  imageUrl?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

interface Option {
  text?: string;
  value?: string;
  label?: string;
  imageUrl?: string;
  image?: string;
}

interface Question {
  _id?: string;
  id?: string;

  questionText?: string;
  question?: string;

  options: string[] | Option[] | any[];

  correctAnswer: string;

  subject?: string;
  chapter?: string;
  chapterName?: string;

  questionNumber?: number;

  imageUrl?: string;
  questionImage?: string | QuestionImage;
  image?: string | QuestionImage;
  images?: QuestionImage[] | string[];

  questionType?: string;
  type?: string;

  // Optional ordering fields
  order?: number;
  index?: number;
  sequence?: number;
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

interface ResultSummary {
  correct: number;
  wrong: number;
  unattempted: number;
  attempted: number;
  totalQuestions: number;
  percentage: number;
  status: string;
  grade: string;
  reviewList: ReviewItem[];
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
  const navigate = useNavigate();

  // ====================================================
  // IMPORTANT:
  // NORMALIZE QUESTIONS FOR DISPLAY
  //
  // MongoDB order is NOT trusted.
  // We create our own display order.
  //
  // Display:
  // 1, 2, 3, 4, 5...
  //
  // Original MongoDB questionNumber is NOT used
  // for visible numbering.
  // ====================================================

  const displayQuestions = useMemo(() => {
    const copiedQuestions = [...(questions || [])];

    /**
     * We only use an explicit ordering field when available.
     * Otherwise preserve the array order received from backend.
     *
     * IMPORTANT:
     * questionNumber is deliberately NOT used here.
     *
     * This prevents:
     * MongoDB: 89, 1, 45, 3
     *
     * from displaying:
     * 89, 1, 45, 3
     *
     * Instead UI will display:
     * 1, 2, 3, 4
     */

    const hasExplicitOrder = copiedQuestions.some(
      (question) =>
        typeof question.order === "number" ||
        typeof question.sequence === "number" ||
        typeof question.index === "number"
    );

    if (hasExplicitOrder) {
      copiedQuestions.sort((a, b) => {
        const getOrder = (question: Question) => {
          if (typeof question.order === "number") {
            return question.order;
          }

          if (typeof question.sequence === "number") {
            return question.sequence;
          }

          if (typeof question.index === "number") {
            return question.index;
          }

          return Number.MAX_SAFE_INTEGER;
        };

        return getOrder(a) - getOrder(b);
      });
    }

    return copiedQuestions;
  }, [questions]);

  // ====================================================
  // STATE
  // ====================================================

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [markedForReview, setMarkedForReview] =
    useState<ReviewMap>({});

  const [timeLeft, setTimeLeft] =
    useState<number>(
      displayQuestions.length > 0
        ? displayQuestions.length * 60
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
    useState<ResultSummary | null>(null);

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

  const resultStorageKey =
    `${testKey}_result`;

  // ====================================================
  // QUESTION ID
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

  // ====================================================
  // QUESTION TEXT
  // ====================================================

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

  // ====================================================
  // OPTION TEXT
  // ====================================================

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
  // IMAGE URL HELPER
  // ====================================================

  const getImageUrl = useCallback(
    (value: any): string => {
      if (!value) {
        return "";
      }

      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "object") {
        return (
          value.url ||
          value.imageUrl ||
          value.src ||
          ""
        );
      }

      return "";
    },
    []
  );

  // ====================================================
  // QUESTION IMAGES
  // ====================================================

  const getQuestionImages = useCallback(
    (question?: Question): string[] => {
      if (!question) {
        return [];
      }

      const images: string[] = [];

      if (question.imageUrl) {
        images.push(question.imageUrl);
      }

      if (question.questionImage) {
        const url = getImageUrl(
          question.questionImage
        );

        if (url) {
          images.push(url);
        }
      }

      if (question.image) {
        const url = getImageUrl(
          question.image
        );

        if (url) {
          images.push(url);
        }
      }

      if (Array.isArray(question.images)) {
        question.images.forEach((item) => {
          const url = getImageUrl(item);

          if (url) {
            images.push(url);
          }
        });
      }

      return Array.from(
        new Set(images.filter(Boolean))
      );
    },
    [getImageUrl]
  );

  // ====================================================
  // OPTION IMAGE
  // ====================================================

  const getOptionImage = useCallback(
    (option: any): string => {
      if (
        !option ||
        typeof option !== "object"
      ) {
        return "";
      }

      return (
        option.imageUrl ||
        option.image ||
        ""
      );
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
  // CHECK ANSWER
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

      // Direct match
      if (selected === correct) {
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

      if (correctLetterIndex >= 0) {
        const correctOption =
          question.options?.[
            correctLetterIndex
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

          if (
            selected === correctText
          ) {
            return true;
          }
        }
      }

      // 1 / 2 / 3 / 4
      const numbers = [
        "1",
        "2",
        "3",
        "4",
      ];

      const numericIndex =
        numbers.indexOf(correct);

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

          if (
            selected === correctText
          ) {
            return true;
          }
        }
      }

      // Option A / Option B / ...
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
            option !== undefined
          ) {
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
    displayQuestions[currentQuestion];

  const currentQuestionId =
    currentQ
      ? getQuestionId(
          currentQ,
          currentQuestion
        )
      : "";

  /**
   * IMPORTANT:
   * Visible number is ALWAYS index + 1.
   *
   * MongoDB questionNumber is ignored.
   */
  const currentDisplayQuestionNumber =
    currentQuestion + 1;

  // ====================================================
  // COUNTS
  // ====================================================

  const answeredCount = useMemo(() => {
    return displayQuestions.reduce(
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
    displayQuestions,
    answers,
    getQuestionId,
  ]);

  const reviewCount = useMemo(() => {
    return displayQuestions.reduce(
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
    displayQuestions,
    markedForReview,
    getQuestionId,
  ]);

  const unansweredCount =
    displayQuestions.length -
    answeredCount;

  // ====================================================
  // RESTORE STATE
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
            setMarkedForReview(parsed);
          }
        } catch {
          console.warn(
            "Invalid saved review."
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
      displayQuestions.length === 0
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
      window.clearInterval(timer);
    };
  }, [
    submitted,
    isSubmitting,
    displayQuestions.length,
    timeLeft,
  ]);

  // ====================================================
  // FORMAT TIMER
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
        if (!currentQuestionId) {
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
      if (!currentQuestionId) {
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
      if (!currentQuestionId) {
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
          displayQuestions.length - 1,
          previous + 1
        )
    );
  }, [displayQuestions.length]);

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
      if (!currentQuestionId) {
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
        displayQuestions.length - 1
      ) {
        setCurrentQuestion(
          (previous) =>
            previous + 1
        );
      }
    }, [
      currentQuestionId,
      currentQuestion,
      displayQuestions.length,
    ]);

  // ====================================================
  // CALCULATE RESULT
  // ====================================================

  const calculateResult =
    useCallback((): ResultSummary => {
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      const reviewList: ReviewItem[] =
        [];

      displayQuestions.forEach(
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
          } else if (isCorrect) {
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
        displayQuestions.length;

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
      displayQuestions,
      answers,
      getQuestionId,
      getQuestionText,
      isAnswerCorrect,
    ]);

  // ====================================================
  // EXAM ID
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
  // SAVE LOCAL RESULT
  // ====================================================

  const saveLocalResult =
    useCallback(
      (
        result: ResultSummary,
        isAutoSubmit: boolean
      ) => {
        const historyItem = {
          ...result,

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

          examType:
            subject?.toUpperCase() ===
            "NEET"
              ? "NEET"
              : subject?.toUpperCase() ===
                "JEE"
              ? "JEE"
              : "MOCK",

          marks: result.correct,

          timeTaken: Math.max(
            0,
            Math.round(
              (
                displayQuestions.length *
                  60 -
                timeLeft
              ) / 60
            )
          ),

          autoSubmitted:
            isAutoSubmit,

          submittedAt:
            new Date().toISOString(),
        };

        // Current result
        sessionStorage.setItem(
          resultStorageKey,
          JSON.stringify(
            historyItem
          )
        );

        // History
        try {
          const oldHistory =
            localStorage.getItem(
              "examHistory"
            );

          let history: any[] = [];

          if (oldHistory) {
            try {
              const parsed =
                JSON.parse(
                  oldHistory
                );

              if (
                Array.isArray(parsed)
              ) {
                history = parsed;
              }
            } catch {
              history = [];
            }
          }

          history =
            history.filter(
              (item) =>
                item?.examId !==
                examId
            );

          history.unshift(
            historyItem
          );

          localStorage.setItem(
            "examHistory",
            JSON.stringify(
              history
            )
          );
        } catch (error) {
          console.warn(
            "Unable to save exam history:",
            error
          );
        }
      },
      [
        studentId,
        studentName,
        examId,
        subject,
        chapterName,
        className,
        displayQuestions.length,
        timeLeft,
        resultStorageKey,
      ]
    );

  // ====================================================
  // SUBMIT EXAM
  // ====================================================

  const submitExamData =
    useCallback(
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

        // ==============================================
        // CALCULATE RESULT
        // ==============================================

        const result =
          calculateResult();

        const testType =
          subject?.toUpperCase() ===
          "NEET"
            ? "NEET"
            : subject?.toUpperCase() ===
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
              (
                displayQuestions.length *
                  60 -
                timeLeft
              ) / 60
            )
          ),

          autoSubmitted:
            isAutoSubmit,

          review:
            result.reviewList,

          submittedAt:
            new Date().toISOString(),
        };

        // ==============================================
        // LOCAL SAVE
        // ==============================================

        saveLocalResult(
          result,
          isAutoSubmit
        );

        setResultSummary(result);

        // ==============================================
        // BACKEND SAVE
        // ==============================================

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

          const submitUrl =
            `${cleanApiBase}/results/submit`;

          console.log(
            "Submitting result:",
            submitUrl
          );

          const response =
            await fetch(
              submitUrl,
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
                    resultPayload
                  ),
              }
            );

          if (!response.ok) {
            let errorMessage =
              "Unable to save result.";

            try {
              const errorData =
                await response.json();

              errorMessage =
                errorData?.message ||
                errorData?.error ||
                errorMessage;
            } catch {
              // ignore
            }

            console.warn(
              "Backend result save failed:",
              errorMessage
            );
          } else {
            console.log(
              "Result saved successfully."
            );
          }
        } catch (error) {
          console.warn(
            "Backend submit route unavailable. Using local result:",
            error
          );
        }

        // ==============================================
        // CLEAR EXAM STATE
        // ==============================================

        sessionStorage.removeItem(
          answerStorageKey
        );

        sessionStorage.removeItem(
          reviewStorageKey
        );

        sessionStorage.removeItem(
          timerStorageKey
        );

        // ==============================================
        // SHOW RESULT
        // ==============================================

        setSubmitted(true);
        setAutoSubmitted(false);
        setIsSubmitting(false);
        setShowSubmitModal(false);
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
        displayQuestions.length,
        timeLeft,
        apiBaseUrl,
        saveLocalResult,
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
      displayQuestions.length > 0
    ) {
      submitExamData(true);
    }
  }, [
    timeLeft,
    submitted,
    isSubmitting,
    displayQuestions.length,
    submitExamData,
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
  // HISTORY
  // ====================================================

  const handleGoToHistory =
    useCallback(() => {
      navigate(
        "/results"
      );
    }, [navigate]);

  // ====================================================
  // EMPTY
  // ====================================================

  if (!displayQuestions.length) {
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
  // RESULT SCREEN
  // ====================================================

  if (
    submitted &&
    resultSummary
  ) {
    return (
      <div className="exam-page result-page">
        <div className="result-card">

          <div className="result-success-icon">
            <CheckCircle2 size={42} />
          </div>

          <div className="result-badge">
            TEST SUBMITTED
          </div>

          <h1>
            Test Submitted Successfully
          </h1>

          <p>
            Your {subject} mock test
            has been submitted
            successfully.
          </p>

          <div className="result-score-main">
            <span>
              Your Score
            </span>

            <strong>
              {resultSummary.correct}

              <small>
                /{resultSummary.totalQuestions}
              </small>
            </strong>
          </div>

          <div className="result-mini-grid">

            <div>
              <span>
                Correct
              </span>

              <strong>
                {resultSummary.correct}
              </strong>
            </div>

            <div>
              <span>
                Wrong
              </span>

              <strong>
                {resultSummary.wrong}
              </strong>
            </div>

            <div>
              <span>
                Unanswered
              </span>

              <strong>
                {resultSummary.unattempted}
              </strong>
            </div>

            <div>
              <span>
                Percentage
              </span>

              <strong>
                {resultSummary.percentage}%
              </strong>
            </div>

            <div>
              <span>
                Grade
              </span>

              <strong>
                {resultSummary.grade}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong
                className={
                  resultSummary.status ===
                  "PASS"
                    ? "result-pass"
                    : "result-fail"
                }
              >
                {resultSummary.status}
              </strong>
            </div>

          </div>

          <div className="result-detail-summary">

            <div>
              <span>
                Total Questions
              </span>

              <strong>
                {
                  resultSummary.totalQuestions
                }
              </strong>
            </div>

            <div>
              <span>
                Attempted
              </span>

              <strong>
                {
                  resultSummary.attempted
                }
              </strong>
            </div>

            <div>
              <span>
                Accuracy
              </span>

              <strong>
                {resultSummary.attempted > 0
                  ? Math.round(
                      (resultSummary.correct /
                        resultSummary.attempted) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

          </div>

          <div className="result-info">
            <ShieldCheck size={18} />

            <span>
              Your result has been
              recorded successfully.
            </span>
          </div>

          <button
            onClick={
              handleGoToHistory
            }
            className="premium-btn primary result-back-btn"
          >
            Go to Result History
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
          BODY
      ================================================== */}

      <div className="exam-body">

  {/* ==================================================
    QUESTION PANEL
================================================== */}

<main className="question-panel">

  {/* TOP BAR */}

  <div className="question-topbar">

    {/* LEFT SIDE */}

    <div className="question-topbar-left">

      <div className="question-progress-label">
        QUESTION{" "}
        {currentDisplayQuestionNumber}{" "}
        OF{" "}
        {displayQuestions.length}
      </div>

      <div className="question-subject-badge">
        {currentQ?.subject || subject}
      </div>

      <div className="question-progress">
        <div
          style={{
            width: `${
              ((currentQuestion + 1) /
                displayQuestions.length) *
              100
            }%`,
          }}
        />
      </div>

    </div>

    {/* RIGHT SIDE */}

    <div className="question-top-actions">

      <button
        className={`small-action ${
          markedForReview[currentQuestionId]
            ? "active"
            : ""
        }`}
        onClick={handleToggleReview}
      >
        <Flag size={15} />

        {markedForReview[currentQuestionId]
          ? "Review Marked"
          : "Mark Review"}
      </button>

    </div>

  </div>

  {/* ==================================================
      QUESTION
  ================================================== */}

  <section className="question-content">

    <div className="question-number">
      Q{currentDisplayQuestionNumber}
    </div>

    <div className="question-main">

      <h1>
        {getQuestionText(currentQ)}
      </h1>

      {getQuestionImages(currentQ).map(
        (imageUrl, index) => (
          <div
            className="question-image-wrapper"
            key={`${currentQuestionId}-image-${index}`}
          >
            <img
              src={imageUrl}
              alt={`Question ${
                currentDisplayQuestionNumber
              } figure ${index + 1}`}
              className="question-image"
              loading="lazy"
              onError={(event) => {
                const img =
                  event.currentTarget;

                img.style.display = "none";
              }}
            />
          </div>
        )
      )}

      <div className="question-hint">
        Select your option
      </div>

    </div>

  </section>              


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

                const optionImage =
                  getOptionImage(
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

                      {optionImage && (
                        <img
                          src={
                            optionImage
                          }
                          alt={`Option ${optionLetter}`}
                          className="option-image"
                          loading="lazy"
                        />
                      )}

                    </span>

                    {isSelected && (
                      <span className="selected-check">
                        <Check
                          size={15}
                        />
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* ==================================================
              ACTION BAR
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
            displayQuestions.length - 1 ? (
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

              <LayoutGrid size={18} />

            </div>

            {/* ==================================================
                QUESTION PALETTE
                ALWAYS 1 2 3 4 5...
            ================================================== */}

            <div className="question-palette">

              {displayQuestions.map(
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
                      markedForReview[id]
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
            (previous) =>
              !previous
          )
        }
      >
        <LayoutGrid size={18} />

        <span>
          {answeredCount}/
          {displayQuestions.length}
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
              responses will be
              recorded and evaluated.
            </p>

            <div className="submit-summary">

              <div>
                <span>
                  Total
                </span>

                <strong>
                  {displayQuestions.length}
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