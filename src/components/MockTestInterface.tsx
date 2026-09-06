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

  /*
   * Backend display endpoint intentionally does not
   * return correctAnswer.
   */
  correctAnswer?: string;

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
  examId: string;
}

type AnswerMap = Record<string, string>;
type ReviewMap = Record<string, boolean>;

interface ReviewItem {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  marks?: number;
  result?: string;
}

interface ResultSummary {
  correct: number;
  wrong: number;
  unattempted: number;
  attempted: number;
  totalQuestions: number;

  marks: number;
  maxMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;

  percentage: number;
  status: string;
  grade: string;

  timeTaken: number;
  warnings: number;
  autoSubmitted: boolean;

  resultAvailableAt?: string;
  isResultPublished?: boolean;

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
  examId,
}: MockTestInterfaceProps) {
  // ====================================================
  // API BASE
  // ====================================================

  const cleanApiBase = useMemo(() => {
    const base = String(apiBaseUrl || "")
      .trim()
      .replace(/\/+$/, "");

    if (!base) {
      return "";
    }

    return /\/api$/i.test(base)
      ? base
      : `${base}/api`;
  }, [apiBaseUrl]);

  // ====================================================
  // TEST KEY
  // ====================================================

  const testKey = useMemo(() => {
    return [
      "exam-master",
      "mock",
      subject,
      className,
      chapterName || "full-assessment",
      studentId,
      examId,
    ]
      .join("_")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }, [
    subject,
    className,
    chapterName,
    studentId,
    examId,
  ]);

  // ====================================================
  // STORAGE KEYS
  // ====================================================

  const answerStorageKey =
    `${testKey}_answers`;

  const reviewStorageKey =
    `${testKey}_review`;

  const timerStorageKey =
    `${testKey}_timer`;

  const timerEndStorageKey =
    `${testKey}_timer_end`;

  const currentQuestionStorageKey =
    `${testKey}_current_question`;

  const statusStorageKey =
    `${testKey}_status`;

  const activeTabStorageKey =
    `${testKey}_active_tab`;

  const resultStorageKey =
    `${testKey}_result`;

  const warningStorageKey =
    `${testKey}_warnings`;

  const deviceSessionStorageKey =
    `${testKey}_device_session`;

  const deviceIdStorageKey =
    `exam-master-device-${studentId}`;

  // ====================================================
  // QUESTION STATE
  // ====================================================

  const [serverQuestions, setServerQuestions] =
    useState<Question[] | null>(null);

  /*
   * VERY IMPORTANT:
   * Once server returns ExamSession questions,
   * server order is authoritative.
   *
   * We don't resort those questions.
   */
  const displayQuestions = useMemo(() => {
    const source =
      Array.isArray(serverQuestions) &&
      serverQuestions.length > 0
        ? serverQuestions
        : Array.isArray(questions)
        ? questions
        : [];

    return source
      .filter(Boolean)
      .map((question) => ({
        ...question,
      }));
  }, [
    questions,
    serverQuestions,
  ]);

  // ====================================================
  // STATE
  // ====================================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [markedForReview, setMarkedForReview] =
    useState<ReviewMap>({});

  const [timeLeft, setTimeLeft] =
    useState(0);

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

  const [sessionNotice, setSessionNotice] =
    useState("");

  const [resultSummary, setResultSummary] =
    useState<ResultSummary | null>(null);

  const [warningCount, setWarningCount] =
    useState(0);

  const [tabBlocked, setTabBlocked] =
    useState(false);

  const [serverReady, setServerReady] =
    useState(false);

  const [serverSessionReady, setServerSessionReady] =
    useState(false);

  const [serverInitializing, setServerInitializing] =
    useState(true);

  // ====================================================
  // REFS
  // ====================================================

  const hasSubmittedRef =
    useRef(false);

  const timerInitializedRef =
    useRef(false);

  const examTabIdRef =
    useRef<string>(
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`
    );

  const backHandlingRef =
    useRef(false);

  const progressRequestRef =
    useRef<number | null>(null);

  const warningRef =
    useRef(0);

  const wasHiddenRef =
    useRef(false);

  const serverSessionIdRef =
    useRef("");

  const deviceSessionIdRef =
    useRef("");

  const deviceIdRef =
    useRef("");

  const backendInitializedRef =
    useRef(false);

  const autoSubmitStartedRef =
    useRef(false);

  // ====================================================
  // QUESTION ID
  // ====================================================

  const getQuestionId = useCallback(
    (question: Question) => {
      return String(
        question._id ||
          question.id ||
          ""
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
  // IMAGE URL
  // ====================================================

  const getImageUrl = useCallback(
    (value: any): string => {
      if (!value) {
        return "";
      }

      if (typeof value === "string") {
        return value;
      }

      if (
        typeof value === "object"
      ) {
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
        images.push(
          question.imageUrl
        );
      }

      if (question.questionImage) {
        const url =
          getImageUrl(
            question.questionImage
          );

        if (url) {
          images.push(url);
        }
      }

      if (question.image) {
        const url =
          getImageUrl(
            question.image
          );

        if (url) {
          images.push(url);
        }
      }

      if (
        Array.isArray(
          question.images
        )
      ) {
        question.images.forEach(
          (item) => {
            const url =
              getImageUrl(item);

            if (url) {
              images.push(url);
            }
          }
        );
      }

      return Array.from(
        new Set(
          images.filter(Boolean)
        )
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
  // CURRENT QUESTION
  // ====================================================

  const currentQ =
    displayQuestions[
      currentQuestion
    ];

  const currentQuestionId =
    currentQ
      ? getQuestionId(currentQ)
      : "";

  const currentDisplayQuestionNumber =
    currentQuestion + 1;

  // ====================================================
  // COUNTS
  // ====================================================

  const answeredCount = useMemo(() => {
    return displayQuestions.reduce(
      (count, question) => {
        const id =
          getQuestionId(
            question
          );

        if (
          id &&
          answers[id]
        ) {
          return count + 1;
        }

        return count;
      },
      0
    );
  }, [
    answers,
    displayQuestions,
    getQuestionId,
  ]);

  const reviewCount = useMemo(() => {
    return displayQuestions.reduce(
      (count, question) => {
        const id =
          getQuestionId(
            question
          );

        if (
          id &&
          markedForReview[id]
        ) {
          return count + 1;
        }

        return count;
      },
      0
    );
  }, [
    displayQuestions,
    getQuestionId,
    markedForReview,
  ]);

  const unansweredCount =
    Math.max(
      0,
      displayQuestions.length -
        answeredCount
    );

  // ====================================================
  // BACKEND HEADERS
  // ====================================================

  const getBackendHeaders =
    useCallback(
      (): HeadersInit => {
        let token = "";

        try {
          token =
            localStorage.getItem(
              "studentToken"
            ) ||
            localStorage.getItem(
              "token"
            ) ||
            "";
        } catch {
          token = "";
        }

        const headers: Record<
          string,
          string
        > = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        if (
          deviceIdRef.current
        ) {
          headers[
            "x-device-id"
          ] =
            deviceIdRef.current;
        }

        if (
          deviceSessionIdRef.current
        ) {
          headers[
            "x-exam-session-token"
          ] =
            deviceSessionIdRef.current;
        }

        return headers;
      },
      []
    );

  // ====================================================
  // WARNING COUNT
  // ====================================================

  const saveWarningCount =
    useCallback(
      (value: number) => {
        const safeValue =
          Math.max(
            0,
            Number(value) || 0
          );

        warningRef.current =
          safeValue;

        setWarningCount(
          safeValue
        );

        try {
          sessionStorage.setItem(
            warningStorageKey,
            String(safeValue)
          );
        } catch {
          // Ignore.
        }
      },
      [warningStorageKey]
    );

  // ====================================================
  // SESSION REPLACEMENT
  // ====================================================

  const handleSessionReplacement =
    useCallback(() => {
      hasSubmittedRef.current =
        true;

      backHandlingRef.current =
        false;

      setSubmitError(
        "This exam was opened on another device. This device is no longer authorized."
      );

      try {
        sessionStorage.removeItem(
          answerStorageKey
        );

        sessionStorage.removeItem(
          reviewStorageKey
        );

        sessionStorage.removeItem(
          timerStorageKey
        );

        sessionStorage.removeItem(
          timerEndStorageKey
        );

        sessionStorage.removeItem(
          currentQuestionStorageKey
        );

        sessionStorage.removeItem(
          deviceSessionStorageKey
        );
      } catch {
        // Ignore.
      }

      try {
        localStorage.removeItem(
          "studentToken"
        );

        localStorage.removeItem(
          "token"
        );
      } catch {
        // Ignore.
      }

      window.setTimeout(() => {
        onBack();
      }, 900);
    }, [
      answerStorageKey,
      currentQuestionStorageKey,
      deviceSessionStorageKey,
      onBack,
      reviewStorageKey,
      timerEndStorageKey,
      timerStorageKey,
    ]);

  // ====================================================
  // SERVER RESULT MAPPER
  // ====================================================

  const mapServerResult =
    useCallback(
      (
        serverResult: any,
        fallback?: ResultSummary
      ): ResultSummary => {
        const reviewList =
          Array.isArray(
            serverResult?.review
          )
            ? serverResult.review.map(
                (item: any) => ({
                  questionId:
                    String(
                      item?.questionId ??
                        ""
                    ),

                  question:
                    String(
                      item?.question ??
                        ""
                    ),

                  selectedAnswer:
                    String(
                      item?.selectedAnswer ??
                        ""
                    ),

                  correctAnswer:
                    item?.correctAnswer !==
                    undefined
                      ? String(
                          item.correctAnswer
                        )
                      : "",

                  isCorrect:
                    Boolean(
                      item?.isCorrect
                    ),

                  marks:
                    Number(
                      item?.marks ??
                        0
                    ),

                  result:
                    String(
                      item?.result ??
                        ""
                    ),
                })
              )
            : fallback?.reviewList ||
              [];

        return {
          correct:
            Number(
              serverResult?.correctAnswers ??
                fallback?.correct ??
                0
            ),

          wrong:
            Number(
              serverResult?.wrongAnswers ??
                fallback?.wrong ??
                0
            ),

          unattempted:
            Number(
              serverResult?.unansweredQuestions ??
                fallback?.unattempted ??
                0
            ),

          attempted:
            Number(
              serverResult?.attemptedQuestions ??
                fallback?.attempted ??
                0
            ),

          totalQuestions:
            Number(
              serverResult?.totalQuestions ??
                fallback?.totalQuestions ??
                displayQuestions.length
            ),

          marks:
            Number(
              serverResult?.marks ??
                fallback?.marks ??
                0
            ),

          maxMarks:
            Number(
              serverResult?.maxMarks ??
                fallback?.maxMarks ??
                0
            ),

          marksPerQuestion:
            Number(
              serverResult?.marksPerQuestion ??
                fallback?.marksPerQuestion ??
                0
            ),

          negativeMarks:
            Number(
              serverResult?.negativeMarks ??
                fallback?.negativeMarks ??
                0
            ),

          percentage:
            Number(
              serverResult?.percentage ??
                fallback?.percentage ??
                0
            ),

          status:
            String(
              serverResult?.status ??
                fallback?.status ??
                "PENDING"
            ),

          grade:
            String(
              serverResult?.grade ??
                fallback?.grade ??
                "-"
            ),

          timeTaken:
            Number(
              serverResult?.timeTaken ??
                fallback?.timeTaken ??
                0
            ),

          warnings:
            Number(
              serverResult?.warnings ??
                fallback?.warnings ??
                warningRef.current
            ),

          autoSubmitted:
            Boolean(
              serverResult?.autoSubmitted ??
                fallback?.autoSubmitted ??
                false
            ),

          resultAvailableAt:
            serverResult?.resultAvailableAt ??
            fallback?.resultAvailableAt,

          isResultPublished:
            Boolean(
              serverResult?.isResultPublished ??
                fallback?.isResultPublished ??
                false
            ),

          reviewList,
        };
      },
      [displayQuestions.length]
    );

  // ====================================================
  // RESULT TIME
  // ====================================================

  const isResultActuallyAvailable =
    Boolean(
      resultSummary?.isResultPublished
    );

  const formattedResultTime =
    useMemo(() => {
      if (
        !resultSummary?.resultAvailableAt
      ) {
        return "";
      }

      const date =
        new Date(
          resultSummary.resultAvailableAt
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return date.toLocaleString(
        undefined,
        {
          dateStyle:
            "medium",
          timeStyle:
            "short",
        }
      );
    }, [resultSummary]);

  // ====================================================
  // SAVE LOCAL RESULT
  // ====================================================

  const saveLocalResult =
    useCallback(
      (
        result: ResultSummary
      ) => {
        const published =
          result.isResultPublished ===
          true;

        const historyItem: Record<
          string,
          any
        > = {
          studentId,
          studentName,
          examId,

          examName:
            `${subject} Mock Test` +
            (chapterName
              ? ` - ${chapterName}`
              : " - Full Assessment"),

          testCategory:
            "mock",

          subject,

          chapter:
            chapterName || "",

          className:
            className || "",

          examType:
            subject
              ?.toUpperCase() ===
            "NEET"
              ? "NEET"
              : subject
                  ?.toUpperCase() ===
                "JEE"
              ? "JEE"
              : "MOCK",

          resultAvailableAt:
            result.resultAvailableAt ||
            null,

          isResultPublished:
            published,

          pendingResult:
            !published,

          warnings:
            result.warnings,

          autoSubmitted:
            result.autoSubmitted,

          submittedAt:
            new Date().toISOString(),
        };

        /*
         * Do not keep detailed answer review locally
         * until the result is published.
         */
        if (published) {
          historyItem.correct =
            result.correct;

          historyItem.wrong =
            result.wrong;

          historyItem.unattempted =
            result.unattempted;

          historyItem.attempted =
            result.attempted;

          historyItem.totalQuestions =
            result.totalQuestions;

          historyItem.marks =
            result.marks;

          historyItem.maxMarks =
            result.maxMarks;

          historyItem.marksPerQuestion =
            result.marksPerQuestion;

          historyItem.negativeMarks =
            result.negativeMarks;

          historyItem.percentage =
            result.percentage;

          historyItem.grade =
            result.grade;

          historyItem.status =
            result.status;

          historyItem.timeTaken =
            result.timeTaken;

          historyItem.review =
            result.reviewList;
        }

        try {
          sessionStorage.setItem(
            resultStorageKey,
            JSON.stringify(
              historyItem
            )
          );
        } catch {
          // Ignore.
        }

        try {
          const rawHistory =
            localStorage.getItem(
              "examHistory"
            );

          let history: any[] =
            [];

          if (rawHistory) {
            try {
              const parsed =
                JSON.parse(
                  rawHistory
                );

              if (
                Array.isArray(
                  parsed
                )
              ) {
                history =
                  parsed;
              }
            } catch {
              history = [];
            }
          }

          history =
            history.filter(
              (item) =>
                !(
                  item?.examId ===
                    examId &&
                  item?.studentId ===
                    studentId
                )
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
        } catch {
          // Ignore.
        }
      },
      [
        chapterName,
        className,
        examId,
        resultStorageKey,
        studentId,
        studentName,
        subject,
      ]
    );

  // ====================================================
  // CREATE / RESUME SERVER SESSION
  // ====================================================

  useEffect(() => {
    if (
      !examId ||
      !studentId ||
      !cleanApiBase
    ) {
      setServerInitializing(
        false
      );
      return;
    }

    let cancelled = false;

    const initializeServerSession =
      async () => {
        setServerInitializing(
          true
        );

        try {
          // ------------------------------------------
          // DEVICE ID
          // ------------------------------------------

          let storedDeviceId =
            "";

          try {
            storedDeviceId =
              localStorage.getItem(
                deviceIdStorageKey
              ) || "";
          } catch {
            storedDeviceId = "";
          }

          if (!storedDeviceId) {
            const randomPart =
              typeof globalThis
                .crypto
                ?.randomUUID ===
              "function"
                ? globalThis.crypto.randomUUID()
                : Math.random()
                    .toString(
                      36
                    )
                    .slice(
                      2,
                      14
                    );

            storedDeviceId =
              `${Date.now()}-${randomPart}`;

            try {
              localStorage.setItem(
                deviceIdStorageKey,
                storedDeviceId
              );
            } catch {
              // Ignore.
            }
          }

          deviceIdRef.current =
            storedDeviceId;

          // ------------------------------------------
          // DEVICE SESSION TOKEN
          // ------------------------------------------

          let storedDeviceSession =
            "";

          try {
            storedDeviceSession =
              sessionStorage.getItem(
                deviceSessionStorageKey
              ) || "";
          } catch {
            storedDeviceSession =
              "";
          }

          deviceSessionIdRef.current =
            storedDeviceSession;

          // ------------------------------------------
          // START / RESUME
          // ------------------------------------------

          const response =
            await fetch(
              `${cleanApiBase}/mock-test/start`,
              {
                method:
                  "POST",

                headers: {
                  ...getBackendHeaders(),

                  "x-device-id":
                    storedDeviceId,

                  ...(storedDeviceSession
                    ? {
                        "x-exam-session-token":
                          storedDeviceSession,
                      }
                    : {}),
                },

                body:
                  JSON.stringify({
                    studentId,

                    examId,

                    deviceId:
                      storedDeviceId,

                    deviceSessionId:
                      storedDeviceSession ||
                      undefined,
                  }),
              }
            );

          const data =
            await response
              .json()
              .catch(
                () => null
              );

          if (
            cancelled
          ) {
            return;
          }

          // ------------------------------------------
          // ALREADY SUBMITTED
          // ------------------------------------------

          if (
            response.status ===
              409 &&
            data?.code ===
              "EXAM_ALREADY_SUBMITTED"
          ) {
            hasSubmittedRef.current =
              true;

            setSubmitted(
              true
            );

            setServerInitializing(
              false
            );

            setSubmitError(
              "This exam has already been submitted and cannot be reopened."
            );

            return;
          }

          // ------------------------------------------
          // SESSION REPLACED
          // ------------------------------------------

          if (
            response.status ===
              409 &&
            data?.code ===
              "SESSION_REPLACED"
          ) {
            handleSessionReplacement();
            return;
          }

          // ------------------------------------------
          // TIME EXPIRED ON START/RESUME
          // ------------------------------------------

          if (
            response.status ===
              410 &&
            data?.code ===
              "EXAM_TIME_EXPIRED"
          ) {
            if (
              data?.sessionId
            ) {
              serverSessionIdRef.current =
                String(
                  data.sessionId
                );
            }

            /*
             * The backend expired session response may not
             * include deviceSessionId. Keep stored token if
             * we already have one.
             */

            setTimeLeft(
              0
            );

            setServerReady(
              true
            );

            setServerSessionReady(
              Boolean(
                serverSessionIdRef.current
              )
            );

            backendInitializedRef.current =
              true;

            setServerInitializing(
              false
            );

            return;
          }

          // ------------------------------------------
          // OTHER ERROR
          // ------------------------------------------

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                `Unable to start exam (${response.status})`
            );
          }

          // ------------------------------------------
          // SERVER QUESTIONS
          // ------------------------------------------

          if (
            Array.isArray(
              data?.questions
            ) &&
            data.questions.length >
              0
          ) {
            const normalizedQuestions:
              Question[] =
              data.questions.map(
                (item: any) => ({
                  _id:
                    item?.questionId ??
                    item?._id ??
                    item?.id ??
                    "",

                  id:
                    item?.questionId ??
                    item?._id ??
                    item?.id ??
                    "",

                  question:
                    String(
                      item?.question ??
                        ""
                    ),

                  questionText:
                    String(
                      item?.question ??
                        ""
                    ),

                  options:
                    Array.isArray(
                      item?.options
                    )
                      ? item.options
                      : [],

                  subject:
                    String(
                      item?.subject ??
                        ""
                    ),

                  chapter:
                    String(
                      item?.chapter ??
                        ""
                    ),

                  questionNumber:
                    typeof item?.questionNumber ===
                    "number"
                      ? item.questionNumber
                      : undefined,

                  imageUrl:
                    String(
                      item?.imageUrl ??
                        ""
                    ),

                  /*
                   * DO NOT set correctAnswer here.
                   */
                })
              );

            setServerQuestions(
              normalizedQuestions
            );
          }

          // ------------------------------------------
          // SESSION ID
          // ------------------------------------------

          const returnedSessionId =
            String(
              data?.sessionId ||
                ""
            ).trim();

          if (!returnedSessionId) {
            throw new Error(
              "Mock test server did not return a sessionId."
            );
          }

          serverSessionIdRef.current =
            returnedSessionId;

          setServerSessionReady(
            true
          );

          // ------------------------------------------
          // DEVICE SESSION ID
          // ------------------------------------------

          const returnedDeviceSessionId =
            String(
              data?.deviceSessionId ||
                storedDeviceSession ||
                ""
            ).trim();

          if (
            returnedDeviceSessionId
          ) {
            deviceSessionIdRef.current =
              returnedDeviceSessionId;

            try {
              sessionStorage.setItem(
                deviceSessionStorageKey,
                returnedDeviceSessionId
              );
            } catch {
              // Ignore.
            }
          }

          // ------------------------------------------
          // DEVICE ID
          // ------------------------------------------

          deviceIdRef.current =
            String(
              data?.deviceId ||
                storedDeviceId
            );

          // ------------------------------------------
          // SESSION NOTICE
          // ------------------------------------------

          if (
            data?.code ===
            "SESSION_TAKEN_OVER"
          ) {
            setSessionNotice(
              "This exam session was transferred to this device. The previous device is no longer authorized."
            );
          } else if (
            data?.code ===
            "EXAM_STARTED"
          ) {
            setSessionNotice(
              "Exam session started securely."
            );
          } else if (
            data?.code ===
            "EXAM_RESUMED"
          ) {
            setSessionNotice(
              "Your previous exam session has been restored."
            );
          } else {
            setSessionNotice("");
          }

          // ------------------------------------------
          // SERVER CURRENT QUESTION
          // ------------------------------------------

          if (
            typeof data?.currentQuestion ===
            "number"
          ) {
            const questionCount =
              Array.isArray(
                data?.questions
              )
                ? data.questions.length
                : Array.isArray(
                    questions
                  )
                ? questions.length
                : 0;

            const safeIndex =
              Math.max(
                0,
                Math.min(
                  Number(
                    data.currentQuestion
                  ),
                  Math.max(
                    0,
                    questionCount -
                      1
                  )
                )
              );

            setCurrentQuestion(
              safeIndex
            );
          }

          // ------------------------------------------
          // SERVER ANSWERS
          // ------------------------------------------

          if (
            Array.isArray(
              data?.answers
            )
          ) {
            const restoredAnswers:
              AnswerMap =
              {};

            data.answers.forEach(
              (item: any) => {
                if (
                  item?.questionId
                ) {
                  restoredAnswers[
                    String(
                      item.questionId
                    )
                  ] =
                    String(
                      item.answer ||
                        ""
                    );
                }
              }
            );

            setAnswers(
              restoredAnswers
            );
          }

          // ------------------------------------------
          // SERVER REVIEW
          // ------------------------------------------

          if (
            data?.markedForReview &&
            typeof data.markedForReview ===
              "object"
          ) {
            const restoredReview:
              ReviewMap =
              {};

            Object.entries(
              data.markedForReview
            ).forEach(
              ([
                id,
                marked,
              ]) => {
                restoredReview[
                  String(id)
                ] =
                  Boolean(marked);
              }
            );

            setMarkedForReview(
              restoredReview
            );
          }

          // ------------------------------------------
          // SERVER TIMER
          // ------------------------------------------

          if (
            typeof data?.remainingSeconds ===
            "number"
          ) {
            const remaining =
              Math.max(
                0,
                Math.floor(
                  data.remainingSeconds
                )
              );

            setTimeLeft(
              remaining
            );

            try {
              sessionStorage.setItem(
                timerEndStorageKey,
                String(
                  Date.now() +
                    remaining *
                      1000
                )
              );

              sessionStorage.setItem(
                timerStorageKey,
                String(
                  remaining
                )
              );
            } catch {
              // Ignore.
            }
          }

          // ------------------------------------------
          // WARNING RESTORE
          // ------------------------------------------

          try {
            const savedWarnings =
              Number(
                sessionStorage.getItem(
                  warningStorageKey
                ) || "0"
              );

            if (
              Number.isFinite(
                savedWarnings
              )
            ) {
              saveWarningCount(
                savedWarnings
              );
            }
          } catch {
            // Ignore.
          }

          backendInitializedRef.current =
            true;

          setServerReady(
            true
          );

          setServerSessionReady(
            true
          );
        } catch (
          error: any
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "MOCK TEST SERVER SESSION ERROR:",
            error
          );

          setServerSessionReady(
            false
          );

          setServerReady(
            false
          );

          setSubmitError(
            error?.message ||
              "Unable to connect to exam server. Please try again."
          );
        } finally {
          if (
            !cancelled
          ) {
            timerInitializedRef.current =
              true;

            setServerInitializing(
              false
            );
          }
        }
      };

    void initializeServerSession();

    return () => {
      cancelled =
        true;
    };
  }, [
    cleanApiBase,
    deviceIdStorageKey,
    deviceSessionStorageKey,
    examId,
    getBackendHeaders,
    handleSessionReplacement,
    questions,
    saveWarningCount,
    studentId,
    timerEndStorageKey,
    timerStorageKey,
    warningStorageKey,
  ]);

  // ====================================================
  // RESTORE LOCAL UI STATE
  // ====================================================

  useEffect(() => {
    try {
      const savedStatus =
        sessionStorage.getItem(
          statusStorageKey
        );

      if (
        savedStatus
      ) {
        try {
          const parsedStatus =
            JSON.parse(
              savedStatus
            );

          if (
            parsedStatus?.submitted ===
            true
          ) {
            hasSubmittedRef.current =
              true;

            setSubmitted(
              true
            );

            if (
              parsedStatus?.result
            ) {
              setResultSummary(
                mapServerResult(
                  parsedStatus.result
                )
              );
            }

            setAutoSubmitted(
              Boolean(
                parsedStatus.autoSubmitted
              )
            );

            return;
          }
        } catch {
          console.warn(
            "Invalid saved exam status."
          );
        }
      }

      const savedAnswers =
        sessionStorage.getItem(
          answerStorageKey
        );

      if (
        savedAnswers
      ) {
        try {
          const parsed =
            JSON.parse(
              savedAnswers
            );

          if (
            parsed &&
            typeof parsed ===
              "object"
          ) {
            setAnswers(
              parsed as AnswerMap
            );
          }
        } catch {
          console.warn(
            "Invalid saved answers."
          );
        }
      }

      const savedReview =
        sessionStorage.getItem(
          reviewStorageKey
        );

      if (
        savedReview
      ) {
        try {
          const parsed =
            JSON.parse(
              savedReview
            );

          if (
            parsed &&
            typeof parsed ===
              "object"
          ) {
            setMarkedForReview(
              parsed as ReviewMap
            );
          }
        } catch {
          console.warn(
            "Invalid saved review."
          );
        }
      }

      const savedCurrentQuestion =
        sessionStorage.getItem(
          currentQuestionStorageKey
        );

      if (
        savedCurrentQuestion !==
          null &&
        !Number.isNaN(
          Number(
            savedCurrentQuestion
          )
        )
      ) {
        setCurrentQuestion(
          Math.max(
            0,
            Math.min(
              Number(
                savedCurrentQuestion
              ),
              Math.max(
                0,
                displayQuestions.length -
                  1
              )
            )
          )
        );
      }

      const savedTimerEnd =
        sessionStorage.getItem(
          timerEndStorageKey
        );

      if (
        savedTimerEnd &&
        !Number.isNaN(
          Number(savedTimerEnd)
        )
      ) {
        setTimeLeft(
          Math.max(
            0,
            Math.ceil(
              (Number(
                savedTimerEnd
              ) -
                Date.now()) /
                1000
            )
          )
        );
      }

      const savedWarnings =
        sessionStorage.getItem(
          warningStorageKey
        );

      if (
        savedWarnings &&
        !Number.isNaN(
          Number(savedWarnings)
        )
      ) {
        saveWarningCount(
          Number(
            savedWarnings
          )
        );
      }
    } catch (
      error
    ) {
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
    currentQuestionStorageKey,
    displayQuestions.length,
    mapServerResult,
    reviewStorageKey,
    saveWarningCount,
    statusStorageKey,
    timerEndStorageKey,
    warningStorageKey,
  ]);

  // ====================================================
  // SAVE CURRENT QUESTION
  // ====================================================

  useEffect(() => {
    if (
      !timerInitializedRef.current ||
      submitted
    ) {
      return;
    }

    try {
      const safeIndex =
        Math.max(
          0,
          Math.min(
            currentQuestion,
            Math.max(
              0,
              displayQuestions.length -
                1
            )
          )
        );

      if (
        safeIndex !==
        currentQuestion
      ) {
        setCurrentQuestion(
          safeIndex
        );
        return;
      }

      sessionStorage.setItem(
        currentQuestionStorageKey,
        String(
          safeIndex
        )
      );
    } catch {
      // Ignore.
    }
  }, [
    currentQuestion,
    currentQuestionStorageKey,
    displayQuestions.length,
    submitted,
  ]);

  // ====================================================
  // FALLBACK TIMER BEFORE SERVER READY
  // ====================================================

  useEffect(() => {
    if (
      serverReady ||
      submitted ||
      displayQuestions.length ===
        0
    ) {
      return;
    }

    try {
      const existingDeadline =
        sessionStorage.getItem(
          timerEndStorageKey
        );

      if (
        existingDeadline &&
        !Number.isNaN(
          Number(
            existingDeadline
          )
        )
      ) {
        setTimeLeft(
          Math.max(
            0,
            Math.ceil(
              (Number(
                existingDeadline
              ) -
                Date.now()) /
                1000
            )
          )
        );

        return;
      }

      const fallbackSeconds =
        displayQuestions.length *
        60;

      sessionStorage.setItem(
        timerEndStorageKey,
        String(
          Date.now() +
            fallbackSeconds *
              1000
        )
      );

      setTimeLeft(
        fallbackSeconds
      );
    } catch {
      // Ignore.
    }
  }, [
    displayQuestions.length,
    serverReady,
    submitted,
    timerEndStorageKey,
  ]);

  // ====================================================
  // SAVE ANSWERS
  // ====================================================

  useEffect(() => {
    try {
      sessionStorage.setItem(
        answerStorageKey,
        JSON.stringify(
          answers
        )
      );
    } catch {
      // Ignore.
    }
  }, [
    answerStorageKey,
    answers,
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
    } catch {
      // Ignore.
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
        String(
          timeLeft
        )
      );
    } catch {
      // Ignore.
    }
  }, [
    submitted,
    timeLeft,
    timerStorageKey,
  ]);

  // ====================================================
  // SERVER PROGRESS SYNC
  // ====================================================

  useEffect(() => {
    if (
      !serverReady ||
      !serverSessionReady ||
      !serverSessionIdRef.current ||
      submitted ||
      isSubmitting ||
      !cleanApiBase
    ) {
      return;
    }

    if (
      progressRequestRef.current
    ) {
      window.clearTimeout(
        progressRequestRef.current
      );
    }

    progressRequestRef.current =
      window.setTimeout(
        async () => {
          try {
            const response =
              await fetch(
                `${cleanApiBase}/mock-test/progress`,
                {
                  method:
                    "POST",

                  headers:
                    getBackendHeaders(),

                  body:
                    JSON.stringify({
                      studentId,

                      sessionId:
                        serverSessionIdRef.current,

                      deviceId:
                        deviceIdRef.current,

                      deviceSessionId:
                        deviceSessionIdRef.current,

                      currentQuestion,

                      answers:
                        Object.entries(
                          answers
                        ).map(
                          ([
                            questionId,
                            answer,
                          ]) => ({
                            questionId,
                            answer,
                          })
                        ),

                      markedForReview,

                      warnings:
                        warningRef.current,
                    }),
                }
              );

            const data =
              await response
                .json()
                .catch(
                  () => null
                );

            if (
              response.status ===
                409 &&
              data?.code ===
                "SESSION_REPLACED"
            ) {
              handleSessionReplacement();
              return;
            }

            if (
              response.status ===
                409 &&
              data?.code ===
                "EXAM_ALREADY_SUBMITTED"
            ) {
              hasSubmittedRef.current =
                true;

              setSubmitted(
                true
              );

              return;
            }

            if (
              response.status ===
                410 &&
              data?.code ===
                "EXAM_TIME_EXPIRED"
            ) {
              setTimeLeft(
                0
              );

              return;
            }

            if (
              !response.ok
            ) {
              console.warn(
                "Exam progress save failed:",
                data?.message ||
                  response.status
              );

              return;
            }

            if (
              typeof data?.remainingSeconds ===
              "number"
            ) {
              setTimeLeft(
                Math.max(
                  0,
                  Math.floor(
                    data.remainingSeconds
                  )
                )
              );
            }
          } catch (
            error
          ) {
            console.warn(
              "Exam progress sync error:",
              error
            );
          }
        },
        400
      );

    return () => {
      if (
        progressRequestRef.current
      ) {
        window.clearTimeout(
          progressRequestRef.current
        );
      }
    };
  }, [
    answers,
    cleanApiBase,
    currentQuestion,
    getBackendHeaders,
    handleSessionReplacement,
    isSubmitting,
    markedForReview,
    serverReady,
    serverSessionReady,
    studentId,
    submitted,
  ]);

  // ====================================================
  // HEARTBEAT
  // ====================================================

  useEffect(() => {
    if (
      !serverReady ||
      !serverSessionReady ||
      !serverSessionIdRef.current ||
      submitted ||
      !cleanApiBase
    ) {
      return;
    }

    const heartbeat =
      window.setInterval(
        async () => {
          try {
            const response =
              await fetch(
                `${cleanApiBase}/mock-test/heartbeat`,
                {
                  method:
                    "POST",

                  headers:
                    getBackendHeaders(),

                  body:
                    JSON.stringify({
                      studentId,

                      sessionId:
                        serverSessionIdRef.current,

                      deviceId:
                        deviceIdRef.current,

                      deviceSessionId:
                        deviceSessionIdRef.current,
                    }),
                }
              );

            const data =
              await response
                .json()
                .catch(
                  () => null
                );

            if (
              response.status ===
                409 &&
              data?.code ===
                "SESSION_REPLACED"
            ) {
              handleSessionReplacement();
              return;
            }

            if (
              response.status ===
                409 &&
              data?.code ===
                "EXAM_ALREADY_SUBMITTED"
            ) {
              hasSubmittedRef.current =
                true;

              setSubmitted(
                true
              );

              return;
            }

            if (
              response.status ===
                410 &&
              data?.code ===
                "EXAM_TIME_EXPIRED"
            ) {
              setTimeLeft(
                0
              );

              return;
            }

            if (
              !response.ok
            ) {
              return;
            }

            if (
              typeof data?.remainingSeconds ===
              "number"
            ) {
              setTimeLeft(
                Math.max(
                  0,
                  Math.floor(
                    data.remainingSeconds
                  )
                )
              );
            }
          } catch (
            error
          ) {
            console.warn(
              "Exam heartbeat failed:",
              error
            );
          }
        },
        5000
      );

    return () => {
      window.clearInterval(
        heartbeat
      );
    };
  }, [
    cleanApiBase,
    getBackendHeaders,
    handleSessionReplacement,
    serverReady,
    serverSessionReady,
    studentId,
    submitted,
  ]);

  // ====================================================
  // TIMER COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (
      submitted ||
      isSubmitting ||
      !serverReady ||
      !serverSessionReady ||
      displayQuestions.length ===
        0
    ) {
      return;
    }

    if (
      timeLeft <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setTimeLeft(
            (previous) =>
              previous > 0
                ? previous - 1
                : 0
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    displayQuestions.length,
    isSubmitting,
    serverReady,
    serverSessionReady,
    submitted,
    timeLeft,
  ]);

  // ====================================================
  // FORMAT TIMER
  // ====================================================

  const formatTime =
    useCallback(
      (seconds: number) => {
        const safeSeconds =
          Math.max(
            0,
            seconds
          );

        const hours =
          Math.floor(
            safeSeconds /
              3600
          );

        const minutes =
          Math.floor(
            (safeSeconds %
              3600) /
              60
          );

        const secs =
          safeSeconds %
          60;

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
        if (
          !currentQuestionId ||
          tabBlocked ||
          submitted ||
          isSubmitting ||
          !serverSessionReady
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
      [
        currentQuestionId,
        isSubmitting,
        serverSessionReady,
        submitted,
        tabBlocked,
      ]
    );

  // ====================================================
  // CLEAR ANSWER
  // ====================================================

  const handleClearAnswer =
    useCallback(() => {
      if (
        !currentQuestionId ||
        tabBlocked ||
        submitted ||
        isSubmitting ||
        !serverSessionReady
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
    }, [
      currentQuestionId,
      isSubmitting,
      serverSessionReady,
      submitted,
      tabBlocked,
    ]);

  // ====================================================
  // TOGGLE REVIEW
  // ====================================================

  const handleToggleReview =
    useCallback(() => {
      if (
        !currentQuestionId ||
        tabBlocked ||
        submitted ||
        isSubmitting ||
        !serverSessionReady
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
    }, [
      currentQuestionId,
      isSubmitting,
      serverSessionReady,
      submitted,
      tabBlocked,
    ]);

  // ====================================================
  // NEXT
  // ====================================================

  const goNext =
    useCallback(() => {
      if (
        submitted ||
        isSubmitting ||
        tabBlocked
      ) {
        return;
      }

      setCurrentQuestion(
        (previous) =>
          Math.min(
            displayQuestions.length -
              1,
            previous + 1
          )
      );
    }, [
      displayQuestions.length,
      isSubmitting,
      submitted,
      tabBlocked,
    ]);

  // ====================================================
  // PREVIOUS
  // ====================================================

  const goPrevious =
    useCallback(() => {
      if (
        submitted ||
        isSubmitting ||
        tabBlocked
      ) {
        return;
      }

      setCurrentQuestion(
        (previous) =>
          Math.max(
            0,
            previous - 1
          )
      );
    }, [
      isSubmitting,
      submitted,
      tabBlocked,
    ]);

  // ====================================================
  // MARK + NEXT
  // ====================================================

  const handleReviewAndNext =
    useCallback(() => {
      if (
        !currentQuestionId ||
        tabBlocked ||
        submitted ||
        isSubmitting
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
        displayQuestions.length -
          1
      ) {
        setCurrentQuestion(
          (previous) =>
            previous + 1
        );
      }
    }, [
      currentQuestion,
      currentQuestionId,
      displayQuestions.length,
      isSubmitting,
      submitted,
      tabBlocked,
    ]);

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

        if (
          !cleanApiBase ||
          !serverSessionReady ||
          !serverSessionIdRef.current
        ) {
          setSubmitError(
            "Exam server session is still being prepared. Please wait a moment."
          );

          backHandlingRef.current =
            false;

          return;
        }

        hasSubmittedRef.current =
          true;

        setIsSubmitting(
          true
        );

        setSubmitError("");

        if (
          isAutoSubmit
        ) {
          setAutoSubmitted(
            true
          );

          setShowSubmitModal(
            false
          );
        }

        try {
          const response =
            await fetch(
              `${cleanApiBase}/mock-test/submit`,
              {
                method:
                  "POST",

                headers: {
                  ...getBackendHeaders(),

                  "x-device-id":
                    deviceIdRef.current,

                  "x-exam-session-token":
                    deviceSessionIdRef.current,
                },

                body:
                  JSON.stringify({
                    studentId,

                    studentName,

                    sessionId:
                      serverSessionIdRef.current,

                    deviceId:
                      deviceIdRef.current,

                    deviceSessionId:
                      deviceSessionIdRef.current,

                    answers:
                      Object.entries(
                        answers
                      ).map(
                        ([
                          questionId,
                          answer,
                        ]) => ({
                          questionId,
                          answer,
                        })
                      ),

                    warnings:
                      warningRef.current,

                    autoSubmitted:
                      isAutoSubmit,
                  }),
              }
            );

          const data =
            await response
              .json()
              .catch(
                () => null
              );

          // ------------------------------------------
          // SESSION REPLACED
          // ------------------------------------------

          if (
            response.status ===
              409 &&
            data?.code ===
              "SESSION_REPLACED"
          ) {
            handleSessionReplacement();
            return;
          }

          // ------------------------------------------
          // ALREADY SUBMITTED
          // ------------------------------------------

          if (
            response.status ===
              409 &&
            data?.code ===
              "EXAM_ALREADY_SUBMITTED"
          ) {
            hasSubmittedRef.current =
              true;

            setSubmitted(
              true
            );

            setIsSubmitting(
              false
            );

            return;
          }

          // ------------------------------------------
          // SERVER ERROR
          // ------------------------------------------

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                `Exam submission failed (${response.status}).`
            );
          }

          // ------------------------------------------
          // SERVER RESULT
          // ------------------------------------------

          if (
            !data?.result
          ) {
            throw new Error(
              "Exam was submitted but no result was returned by the server."
            );
          }

          const serverSummary =
            mapServerResult(
              data.result
            );

          /*
           * SERVER RESULT IS AUTHORITATIVE.
           */
          setResultSummary(
            serverSummary
          );

          const finalAutoSubmitted =
            Boolean(
              data.result?.autoSubmitted ??
                isAutoSubmit
            );

          setAutoSubmitted(
            finalAutoSubmitted
          );

          saveWarningCount(
            Number(
              data.result?.warnings ??
                warningRef.current
            )
          );

          // ------------------------------------------
          // LOCAL RESULT
          // ------------------------------------------

          saveLocalResult(
            serverSummary
          );

          // ------------------------------------------
          // SAFE SUBMITTED CACHE
          // ------------------------------------------

          const safeStoredResult:
            Partial<ResultSummary> =
            {
              totalQuestions:
                serverSummary.totalQuestions,

              attempted:
                serverSummary.attempted,

              unattempted:
                serverSummary.unattempted,

              warnings:
                serverSummary.warnings,

              autoSubmitted:
                finalAutoSubmitted,

              resultAvailableAt:
                serverSummary.resultAvailableAt,

              isResultPublished:
                Boolean(
                  serverSummary.isResultPublished
                ),
            };

          /*
           * Only store detailed scoring/review
           * when server says result is published.
           */
          if (
            serverSummary.isResultPublished
          ) {
            safeStoredResult.correct =
              serverSummary.correct;

            safeStoredResult.wrong =
              serverSummary.wrong;

            safeStoredResult.marks =
              serverSummary.marks;

            safeStoredResult.maxMarks =
              serverSummary.maxMarks;

            safeStoredResult.marksPerQuestion =
              serverSummary.marksPerQuestion;

            safeStoredResult.negativeMarks =
              serverSummary.negativeMarks;

            safeStoredResult.percentage =
              serverSummary.percentage;

            safeStoredResult.grade =
              serverSummary.grade;

            safeStoredResult.status =
              serverSummary.status;

            safeStoredResult.timeTaken =
              serverSummary.timeTaken;

            safeStoredResult.reviewList =
              serverSummary.reviewList;
          }

          try {
            sessionStorage.setItem(
              statusStorageKey,
              JSON.stringify({
                submitted:
                  true,

                autoSubmitted:
                  finalAutoSubmitted,

                result:
                  safeStoredResult,

                submittedAt:
                  new Date().toISOString(),
              })
            );
          } catch {
            // Ignore.
          }

          // ------------------------------------------
          // CLEAR LIVE EXAM STORAGE
          // ------------------------------------------

          try {
            sessionStorage.removeItem(
              answerStorageKey
            );

            sessionStorage.removeItem(
              reviewStorageKey
            );

            sessionStorage.removeItem(
              timerStorageKey
            );

            sessionStorage.removeItem(
              timerEndStorageKey
            );

            sessionStorage.removeItem(
              currentQuestionStorageKey
            );

            sessionStorage.removeItem(
              deviceSessionStorageKey
            );
          } catch {
            // Ignore.
          }

          // ------------------------------------------
          // FINAL STATE
          // ------------------------------------------

          setSubmitted(
            true
          );

          setShowSubmitModal(
            false
          );

          setIsSubmitting(
            false
          );

          /*
           * Keep this value because result screen
           * needs to know manual/automatic submission.
           */
          setAutoSubmitted(
            finalAutoSubmitted
          );

          autoSubmitStartedRef.current =
            false;

          backHandlingRef.current =
            false;
        } catch (
          error: any
        ) {
          console.error(
            "MOCK TEST BACKEND SUBMISSION ERROR:",
            error
          );

          hasSubmittedRef.current =
            false;

          backHandlingRef.current =
            false;

          setIsSubmitting(
            false
          );

          if (
            isAutoSubmit
          ) {
            setAutoSubmitted(
              false
            );

            autoSubmitStartedRef.current =
              false;
          }

          setSubmitError(
            error?.message ||
              "Exam submission failed. Your exam has not been marked as completed."
          );
        }
      },
      [
        answerStorageKey,
        answers,
        cleanApiBase,
        currentQuestionStorageKey,
        deviceSessionStorageKey,
        getBackendHeaders,
        handleSessionReplacement,
        isSubmitting,
        mapServerResult,
        reviewStorageKey,
        saveLocalResult,
        saveWarningCount,
        serverSessionReady,
        statusStorageKey,
        studentId,
        studentName,
        submitted,
        timerEndStorageKey,
        timerStorageKey,
      ]
    );

  // ====================================================
  // AUTO SUBMIT WHEN TIMER HITS ZERO
  // ====================================================

  useEffect(() => {
    if (
      submitted ||
      isSubmitting
    ) {
      return;
    }

    if (
      !serverReady ||
      !serverSessionReady ||
      !serverSessionIdRef.current
    ) {
      return;
    }

    if (
      timeLeft > 0
    ) {
      return;
    }

    if (
      autoSubmitStartedRef.current
    ) {
      return;
    }

    autoSubmitStartedRef.current =
      true;

    setAutoSubmitted(
      true
    );

    setSubmitError(
      "Time is over. Your exam is being submitted automatically."
    );

    void submitExamData(
      true
    );
  }, [
    isSubmitting,
    serverReady,
    serverSessionReady,
    submitExamData,
    submitted,
    timeLeft,
  ]);

  // ====================================================
  // SECURITY EXIT
  // ====================================================

  const handleSecurityExit =
    useCallback(() => {
      if (
        submitted ||
        isSubmitting ||
        hasSubmittedRef.current ||
        backHandlingRef.current
      ) {
        return;
      }

      /*
       * If server session is not available,
       * don't pretend the exam was submitted.
       */
      if (
        !serverSessionReady ||
        !serverSessionIdRef.current
      ) {
        setSubmitError(
          "The secure exam session is still connecting. Please remain on this page."
        );

        return;
      }

      backHandlingRef.current =
        true;

      setSubmitError(
        "Exit detected. Your exam is being submitted automatically."
      );

      void submitExamData(
        true
      );
    }, [
      isSubmitting,
      serverSessionReady,
      submitExamData,
      submitted,
    ]);

  // ====================================================
  // BROWSER BACK
  // ====================================================

  useEffect(() => {
    if (
      submitted
    ) {
      return;
    }

    const stateMarker = {
      examLock:
        testKey,
    };

    window.history.pushState(
      stateMarker,
      "",
      window.location.href
    );

    const handlePopState =
      () => {
        if (
          submitted ||
          isSubmitting ||
          hasSubmittedRef.current
        ) {
          return;
        }

        window.history.pushState(
          stateMarker,
          "",
          window.location.href
        );

        handleSecurityExit();
      };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [
    handleSecurityExit,
    isSubmitting,
    submitted,
    testKey,
  ]);

  // ====================================================
  // REFRESH / CLOSE WARNING
  // ====================================================

  useEffect(() => {
    if (
      submitted
    ) {
      return;
    }

    const handleBeforeUnload =
      (
        event: BeforeUnloadEvent
      ) => {
        event.preventDefault();

        event.returnValue =
          "Exam is in progress. Refresh will restore the saved exam session.";

        try {
          sessionStorage.setItem(
            answerStorageKey,
            JSON.stringify(
              answers
            )
          );

          sessionStorage.setItem(
            reviewStorageKey,
            JSON.stringify(
              markedForReview
            )
          );

          sessionStorage.setItem(
            currentQuestionStorageKey,
            String(
              currentQuestion
            )
          );

          sessionStorage.setItem(
            timerStorageKey,
            String(
              timeLeft
            )
          );

          sessionStorage.setItem(
            warningStorageKey,
            String(
              warningRef.current
            )
          );
        } catch {
          // Ignore.
        }
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    answerStorageKey,
    answers,
    currentQuestion,
    currentQuestionStorageKey,
    markedForReview,
    reviewStorageKey,
    submitted,
    timeLeft,
    timerStorageKey,
    warningStorageKey,
  ]);

  // ====================================================
  // VISIBILITY WARNING
  // ====================================================

  useEffect(() => {
    if (
      submitted
    ) {
      return;
    }

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          if (
            !wasHiddenRef.current
          ) {
            wasHiddenRef.current =
              true;

            const nextWarning =
              warningRef.current +
              1;

            saveWarningCount(
              nextWarning
            );

            setSubmitError(
              `Exam focus warning ${nextWarning}. Please keep the exam tab active.`
            );
          }

          return;
        }

        if (
          document.visibilityState ===
          "visible"
        ) {
          wasHiddenRef.current =
            false;
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    saveWarningCount,
    submitted,
  ]);

  // ====================================================
  // RE-SYNC AFTER RETURNING TO TAB
  // ====================================================

  useEffect(() => {
    const syncTimer =
      async () => {
        if (
          submitted ||
          isSubmitting ||
          !serverReady ||
          !serverSessionReady ||
          !serverSessionIdRef.current ||
          !cleanApiBase
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `${cleanApiBase}/mock-test/heartbeat`,
              {
                method:
                  "POST",

                headers:
                  getBackendHeaders(),

                body:
                  JSON.stringify({
                    studentId,

                    sessionId:
                      serverSessionIdRef.current,

                    deviceId:
                      deviceIdRef.current,

                    deviceSessionId:
                      deviceSessionIdRef.current,
                  }),
              }
            );

          const data =
            await response
              .json()
              .catch(
                () => null
              );

          if (
            response.status ===
              409 &&
            data?.code ===
              "SESSION_REPLACED"
          ) {
            handleSessionReplacement();
            return;
          }

          if (
            response.status ===
              410 &&
            data?.code ===
              "EXAM_TIME_EXPIRED"
          ) {
            setTimeLeft(
              0
            );

            return;
          }

          if (
            typeof data?.remainingSeconds ===
            "number"
          ) {
            setTimeLeft(
              Math.max(
                0,
                Math.floor(
                  data.remainingSeconds
                )
              )
            );
          }
        } catch {
          // Normal heartbeat will retry.
        }
      };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void syncTimer();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.addEventListener(
      "focus",
      syncTimer
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "focus",
        syncTimer
      );
    };
  }, [
    cleanApiBase,
    getBackendHeaders,
    handleSessionReplacement,
    isSubmitting,
    serverReady,
    serverSessionReady,
    studentId,
    submitted,
  ]);

  // ====================================================
  // ONE ACTIVE TAB
  // ====================================================

  useEffect(() => {
    if (
      submitted
    ) {
      return;
    }

    const tabId =
      examTabIdRef.current;

    const registerTab =
      () => {
        try {
          const existing =
            localStorage.getItem(
              activeTabStorageKey
            );

          if (
            existing
          ) {
            try {
              const parsed =
                JSON.parse(
                  existing
                );

              const fresh =
                parsed?.tabId &&
                Number(
                  parsed.timestamp
                ) >
                  Date.now() -
                    15000;

              if (
                fresh &&
                parsed.tabId !==
                  tabId
              ) {
                setTabBlocked(
                  true
                );

                setSubmitError(
                  "This exam is already open in another browser tab. Continue in the original tab."
                );

                return false;
              }
            } catch {
              // Replace invalid lock.
            }
          }

          localStorage.setItem(
            activeTabStorageKey,
            JSON.stringify({
              tabId,
              timestamp:
                Date.now(),
            })
          );

          setTabBlocked(
            false
          );

          return true;
        } catch {
          return true;
        }
      };

    registerTab();

    const heartbeat =
      window.setInterval(
        () => {
          try {
            const current =
              localStorage.getItem(
                activeTabStorageKey
              );

            if (
              !current
            ) {
              registerTab();
              return;
            }

            const parsed =
              JSON.parse(
                current
              );

            if (
              parsed?.tabId ===
              tabId
            ) {
              localStorage.setItem(
                activeTabStorageKey,
                JSON.stringify({
                  tabId,
                  timestamp:
                    Date.now(),
                })
              );

              setTabBlocked(
                false
              );
            } else {
              setTabBlocked(
                true
              );
            }
          } catch {
            // Ignore.
          }
        },
        5000
      );

    return () => {
      window.clearInterval(
        heartbeat
      );

      try {
        const current =
          localStorage.getItem(
            activeTabStorageKey
          );

        if (
          current
        ) {
          const parsed =
            JSON.parse(
              current
            );

          if (
            parsed?.tabId ===
            tabId
          ) {
            localStorage.removeItem(
              activeTabStorageKey
            );
          }
        }
      } catch {
        // Ignore.
      }
    };
  }, [
    activeTabStorageKey,
    submitted,
  ]);

  // ====================================================
  // KEYBOARD
  // ====================================================

  useEffect(() => {
    const handleKeyboard =
      (
        event: KeyboardEvent
      ) => {
        if (
          submitted ||
          isSubmitting ||
          tabBlocked
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
          Number(
            event.key
          );

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
    currentQ,
    getOptionText,
    goNext,
    goPrevious,
    handleSelectOption,
    isSubmitting,
    submitted,
    tabBlocked,
  ]);

  // ====================================================
  // EXIT
  // ====================================================

  const handleExit =
    useCallback(() => {
      if (
        submitted
      ) {
        onBack();
        return;
      }

      if (
        isSubmitting
      ) {
        return;
      }

      handleSecurityExit();
    }, [
      handleSecurityExit,
      isSubmitting,
      onBack,
      submitted,
    ]);

  // ====================================================
  // RESULT HISTORY
  // ====================================================

  const handleGoToHistory =
    useCallback(() => {
      window.location.assign(
        "/results"
      );
    }, []);

  // ====================================================
  // EMPTY
  // ====================================================

  if (
    !displayQuestions.length
  ) {
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
    const published =
      isResultActuallyAvailable;

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

          {resultSummary.autoSubmitted && (
            <div className="result-info">
              <Clock3 size={18} />

              <span>
                The exam was automatically
                submitted because the server
                timer reached 00:00.
              </span>
            </div>
          )}

          {!published ? (
            <>
              <div className="result-score-main">
                <span>
                  RESULT STATUS
                </span>

                <strong>
                  PENDING
                </strong>
              </div>

              <div className="result-info">
                <ShieldCheck size={18} />

                <span>
                  Your submission has been
                  recorded. The detailed result
                  is not published yet.
                </span>
              </div>

              {formattedResultTime && (
                <div className="result-info">
                  <Clock3 size={18} />

                  <span>
                    Result will be available
                    from{" "}
                    <strong>
                      {
                        formattedResultTime
                      }
                    </strong>
                  </span>
                </div>
              )}

              <div className="result-mini-grid">
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
                    Warnings
                  </span>

                  <strong>
                    {
                      resultSummary.warnings
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Submission
                  </span>

                  <strong>
                    {resultSummary.autoSubmitted
                      ? "AUTO"
                      : "MANUAL"}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="result-score-main">
                <span>
                  Your Score
                </span>

                <strong>
                  {
                    resultSummary.marks
                  }

                  <small>
                    /{
                      resultSummary.maxMarks
                    }
                  </small>
                </strong>
              </div>

              <div className="result-mini-grid">
                <div>
                  <span>
                    Correct
                  </span>

                  <strong>
                    {
                      resultSummary.correct
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Wrong
                  </span>

                  <strong>
                    {
                      resultSummary.wrong
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Unanswered
                  </span>

                  <strong>
                    {
                      resultSummary.unattempted
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
                    }
                    %
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
                    {
                      resultSummary.status
                    }
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
                    {resultSummary.attempted >
                    0
                      ? Math.round(
                          (resultSummary.correct /
                            resultSummary.attempted) *
                            100
                        )
                      : 0}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Time Taken
                  </span>

                  <strong>
                    {
                      resultSummary.timeTaken
                    }{" "}
                    min
                  </strong>
                </div>

                <div>
                  <span>
                    Negative Marks
                  </span>

                  <strong>
                    -
                    {
                      resultSummary.negativeMarks
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Warnings
                  </span>

                  <strong>
                    {
                      resultSummary.warnings
                    }
                  </strong>
                </div>
              </div>

              <div className="result-info">
                <ShieldCheck size={18} />

                <span>
                  Your final result has been
                  published successfully.
                </span>
              </div>
            </>
          )}

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
            disabled={
              isSubmitting
            }
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
            onClick={
              handleExit
            }
            disabled={
              isSubmitting
            }
          >
            Exit
          </button>
        </div>
      </header>

      {/* ==================================================
          SECURITY BANNER
      ================================================== */}

      <div
        className="exam-security-banner"
        role="alert"
      >
        <div className="exam-security-icon">
          <AlertTriangle size={18} />
        </div>

        <div className="exam-security-content">
          <strong>
            EXAM IN PROGRESS
          </strong>

          <span>
            Do not press Back or close this
            page. Back/Exit attempts will
            automatically submit the exam.
            Refresh restores your saved
            exam session and progress.
          </span>
        </div>
      </div>

      {/* ==================================================
          SERVER INITIALIZING
      ================================================== */}

      {serverInitializing && (
        <div
          className="exam-security-error"
          role="status"
        >
          <Loader2
            size={16}
            className="spin"
          />

          <span>
            Connecting to secure exam
            server...
          </span>
        </div>
      )}

      {/* ==================================================
          SERVER READY
      ================================================== */}

      {!serverInitializing &&
        serverSessionReady &&
        !sessionNotice && (
          <div
            className="exam-security-error"
            role="status"
          >
            <ShieldCheck size={16} />

            <span>
              Secure exam session is active.
            </span>
          </div>
        )}

      {/* ==================================================
          SESSION NOTICE
      ================================================== */}

      {sessionNotice && (
        <div
          className="exam-security-error"
          role="status"
        >
          <ShieldCheck size={16} />

          <span>
            {sessionNotice}
          </span>
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {submitError && (
        <div
          className="exam-security-error"
          role="status"
        >
          <AlertTriangle size={16} />

          <span>
            {submitError}
          </span>
        </div>
      )}

      {/* ==================================================
          TAB BLOCK
      ================================================== */}

      {tabBlocked && (
        <div
          className="exam-security-error"
          role="alert"
        >
          <AlertTriangle size={16} />

          <span>
            Another browser tab is
            controlling this exam. This tab
            is temporarily locked.
          </span>
        </div>
      )}

      {/* ==================================================
          AUTO SUBMIT NOTICE
      ================================================== */}

      {autoSubmitted &&
        !submitted &&
        isSubmitting && (
          <div
            className="exam-security-error"
            role="alert"
          >
            <Clock3 size={16} />

            <span>
              Time is over. Your exam is being
              submitted automatically.
            </span>
          </div>
        )}

      {/* ==================================================
          BODY
      ================================================== */}

      <div className="exam-body">
        {/* ==================================================
            QUESTION PANEL
        ================================================== */}

        <main className="question-panel">
          <div className="question-topbar">
            <div className="question-topbar-left">
              <div className="question-progress-label">
                QUESTION{" "}
                {
                  currentDisplayQuestionNumber
                }{" "}
                OF{" "}
                {
                  displayQuestions.length
                }
              </div>

              <div className="question-subject-badge">
                {currentQ?.subject ||
                  subject}
              </div>

              <div className="question-progress">
                <div
                  style={{
                    width: `${
                      ((currentQuestion +
                        1) /
                        displayQuestions.length) *
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
                disabled={
                  tabBlocked ||
                  submitted ||
                  isSubmitting ||
                  !serverSessionReady
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

              {getQuestionImages(
                currentQ
              ).map(
                (
                  imageUrl,
                  index
                ) => (
                  <div
                    className="question-image-wrapper"
                    key={`${currentQuestionId}-image-${index}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Question ${
                        currentDisplayQuestionNumber
                      } figure ${
                        index + 1
                      }`}
                      className="question-image"
                      loading="lazy"
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
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
                    disabled={
                      tabBlocked ||
                      submitted ||
                      isSubmitting ||
                      !serverSessionReady
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
              disabled={
                tabBlocked ||
                submitted ||
                isSubmitting ||
                !serverSessionReady
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
              disabled={
                tabBlocked ||
                submitted ||
                isSubmitting ||
                !serverSessionReady
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
                  0 ||
                tabBlocked ||
                isSubmitting ||
                !serverSessionReady
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
            displayQuestions.length -
              1 ? (
              <button
                className="nav-btn primary"
                onClick={
                  goNext
                }
                disabled={
                  tabBlocked ||
                  isSubmitting ||
                  !serverSessionReady
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
                disabled={
                  tabBlocked ||
                  isSubmitting ||
                  !serverSessionReady
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

            {/* MAIN STATS */}

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

            {/* SECURITY STATS */}

            <div className="exam-stats">
              <div className="stat-card review">
                <strong>
                  {warningCount}
                </strong>

                <span>
                  Warnings
                </span>
              </div>

              <div className="stat-card answered">
                <strong>
                  {serverSessionReady
                    ? "ON"
                    : "..."}
                </strong>

                <span>
                  Server
                </span>
              </div>

              <div className="stat-card unanswered">
                <strong>
                  {formatTime(
                    timeLeft
                  )}
                </strong>

                <span>
                  Server Time
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

            {/* PALETTE */}

            <div className="question-palette">
              {displayQuestions.map(
                (
                  question,
                  index
                ) => {
                  const id =
                    getQuestionId(
                      question
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
                      key={
                        id ||
                        `question-${index}`
                      }
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
                      disabled={
                        tabBlocked ||
                        isSubmitting ||
                        !serverSessionReady
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
              disabled={
                tabBlocked ||
                isSubmitting ||
                !serverSessionReady
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
          {
            displayQuestions.length
          }
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
              and evaluated by the server.
              You cannot reopen this exam.
            </p>

            <div className="submit-summary">
              <div>
                <span>
                  Total
                </span>

                <strong>
                  {
                    displayQuestions.length
                  }
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

              <div className="warning">
                <span>
                  Warnings
                </span>

                <strong>
                  {warningCount}
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
                    : ""}.
                </span>
              </div>
            )}

            {timeLeft <= 60 &&
              timeLeft > 0 && (
              <div className="submit-warning">
                <Clock3 size={17} />

                <span>
                  Only{" "}
                  <strong>
                    {formatTime(
                      timeLeft
                    )}
                  </strong>{" "}
                  remaining.
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
                  isSubmitting ||
                  !serverSessionReady
                }
                onClick={() =>
                  void submitExamData(
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
          SUBMITTING OVERLAY
      ================================================== */}

      {isSubmitting && (
        <div
          className="modal-overlay"
          style={{
            zIndex: 9999,
          }}
        >
          <div className="submit-modal">
            <div className="modal-icon">
              <Loader2
                size={25}
                className="spin"
              />
            </div>

            <div className="modal-badge">
              SECURE SUBMISSION
            </div>

            <h2>
              {autoSubmitted
                ? "Auto-submitting exam..."
                : "Submitting exam..."}
            </h2>

            <p>
              Your answers are being
              verified and evaluated by the
              server. Please do not refresh
              this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}