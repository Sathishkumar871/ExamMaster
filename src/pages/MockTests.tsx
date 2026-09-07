
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Info,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import MockTestInterface from "../components/MockTestInterface";
import "./MockTests.css";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

/* =========================================================
   STORAGE KEYS
========================================================= */

const MOCK_FLOW_STEP_KEY =
  "stg_mock_test_flow_step";

const MOCK_FLOW_EXAM_ID_KEY =
  "stg_mock_test_exam_id";

const MOCK_FLOW_QUESTIONS_KEY =
  "stg_mock_test_questions";

const MOCK_FLOW_CLASS_KEY =
  "stg_mock_test_class";

const MOCK_FLOW_EXAM_TYPE_KEY =
  "stg_mock_test_exam_type";

const MOCK_FLOW_STUDENT_ID_KEY =
  "stg_mock_test_student_id";

const MOCK_FLOW_STUDENT_NAME_KEY =
  "stg_mock_test_student_name";

/* =========================================================
   TYPES
========================================================= */

interface Question {
  _id: string;

  questionText?: string;
  question?: string;

  options: string[];

  /*
   * Kept for compatibility with existing frontend data.
   * MockTestInterface will not display it.
   */
  correctAnswer: string;

  isPublished?: boolean;
  status?: string;

  examType?: string;
  exam?: string;

  testCategory?: string;
  category?: string;

  className?: string;
  class?: string;

  subject?: string;

  chapter?: string;
  chapterName?: string;

  questionNumber?: number;

  examId?: string;

  [key: string]: any;
}

interface ExamResult {
  _id?: string;

  score?: number;
  marks?: number;

  totalQuestions?: number;
  attemptedQuestions?: number;

  correctAnswers?: number;
  wrongAnswers?: number;
  unansweredQuestions?: number;

  percentage?: number;

  grade?: string;
  status?: string;

  examName?: string;
  subject?: string;
  chapter?: string;
  className?: string;
  examType?: string;

  createdAt?: string;
  submittedAt?: string;

  timeTaken?: number;

  [key: string]: any;
}

type Step =
  | "dashboard"
  | "instructions"
  | "greeting"
  | "exam";

/* =========================================================
   HELPERS
========================================================= */

const safeParse = <T,>(
  value: string | null
): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalize = (value?: string) =>
  String(value || "")
    .trim()
    .toLowerCase();

const clampPercentage = (
  value: number
) =>
  Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(value)
        ? value
        : 0
    )
  );

/* =========================================================
   COMPONENT
========================================================= */

export default function MockTests() {
  const navigate = useNavigate();

  /* =======================================================
     FLOW
  ======================================================= */

  const [step, setStep] =
    useState<Step>("dashboard");

  /* =======================================================
     PREVIOUS RESULT
  ======================================================= */

  const [
    alreadySubmitted,
    setAlreadySubmitted,
  ] = useState(false);

  const [
    examResult,
    setExamResult,
  ] = useState<ExamResult | null>(
    null
  );

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const [
    questions,
    setQuestions,
  ] = useState<Question[]>([]);

  /* =======================================================
     EXAM ID
  ======================================================= */

  const [examId, setExamId] =
    useState("");

  /* =======================================================
     STATES
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [
    checkingSubmission,
    setCheckingSubmission,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [
    studentName,
    setStudentName,
  ] = useState("Student");

  const [studentId, setStudentId] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [examType, setExamType] =
    useState("NEET");

  const [
    showInstructions,
    setShowInstructions,
  ] = useState(false);

  const [isReady, setIsReady] =
    useState(false);

  const [isOnline, setIsOnline] =
    useState(
      typeof navigator !==
        "undefined"
        ? navigator.onLine
        : true
    );

  /* =========================================================
     SAVE FLOW STATE
  ========================================================= */

  const saveMockFlowState = (
    nextStep: Step
  ) => {
    try {
      sessionStorage.setItem(
        MOCK_FLOW_STEP_KEY,
        nextStep
      );

      sessionStorage.setItem(
        MOCK_FLOW_EXAM_ID_KEY,
        examId || ""
      );

      sessionStorage.setItem(
        MOCK_FLOW_CLASS_KEY,
        className || ""
      );

      sessionStorage.setItem(
        MOCK_FLOW_EXAM_TYPE_KEY,
        examType || ""
      );

      sessionStorage.setItem(
        MOCK_FLOW_STUDENT_ID_KEY,
        studentId || ""
      );

      sessionStorage.setItem(
        MOCK_FLOW_STUDENT_NAME_KEY,
        studentName || ""
      );

      sessionStorage.setItem(
        MOCK_FLOW_QUESTIONS_KEY,
        JSON.stringify(
          questions || []
        )
      );
    } catch {
      // Ignore storage errors.
    }
  };

  /* =========================================================
     CLEAR FLOW STATE
  ========================================================= */

  const clearMockFlowState = () => {
    try {
      sessionStorage.removeItem(
        MOCK_FLOW_STEP_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_EXAM_ID_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_QUESTIONS_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_CLASS_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_EXAM_TYPE_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_STUDENT_ID_KEY
      );

      sessionStorage.removeItem(
        MOCK_FLOW_STUDENT_NAME_KEY
      );
    } catch {
      // Ignore storage errors.
    }
  };

  /* =========================================================
     NETWORK STATUS
  ========================================================= */

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  /* =========================================================
     LOAD STUDENT + RESTORE FLOW
  ========================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "studentToken"
      ) ||
      localStorage.getItem(
        "token"
      );

    if (!token) {
      clearMockFlowState();
      navigate("/login");
      return;
    }

    const user =
      safeParse<any>(
        localStorage.getItem(
          "user"
        )
      ) ||
      safeParse<any>(
        localStorage.getItem(
          "student"
        )
      ) ||
      {};

    const storedName =
      localStorage.getItem(
        "studentName"
      ) ||
      localStorage.getItem("name") ||
      user?.name ||
      "Student";

    const storedId =
      localStorage.getItem(
        "studentId"
      ) ||
      localStorage.getItem("id") ||
      user?.studentId ||
      user?.id ||
      user?._id ||
      "";

    const storedClass =
      localStorage.getItem(
        "className"
      ) ||
      localStorage.getItem(
        "class"
      ) ||
      localStorage.getItem("puc") ||
      user?.className ||
      user?.class ||
      user?.puc ||
      "";

    const storedExam =
      localStorage.getItem(
        "examType"
      ) ||
      localStorage.getItem(
        "exam"
      ) ||
      user?.examType ||
      user?.exam ||
      "NEET";

    setStudentName(
      storedName
    );

    setStudentId(
      storedId
    );

    setClassName(
      storedClass
    );

    setExamType(
      storedExam
    );

    /* =====================================================
       RESTORE MOCK FLOW
    ===================================================== */

    try {
      const savedStep =
        sessionStorage.getItem(
          MOCK_FLOW_STEP_KEY
        ) as Step | null;

      const savedExamId =
        sessionStorage.getItem(
          MOCK_FLOW_EXAM_ID_KEY
        ) || "";

      const savedQuestions =
        safeParse<Question[]>(
          sessionStorage.getItem(
            MOCK_FLOW_QUESTIONS_KEY
          )
        ) || [];

      const savedClass =
        sessionStorage.getItem(
          MOCK_FLOW_CLASS_KEY
        ) || "";

      const savedExamType =
        sessionStorage.getItem(
          MOCK_FLOW_EXAM_TYPE_KEY
        ) || "";

      const savedStudentId =
        sessionStorage.getItem(
          MOCK_FLOW_STUDENT_ID_KEY
        ) || "";

      const savedStudentName =
        sessionStorage.getItem(
          MOCK_FLOW_STUDENT_NAME_KEY
        ) || "";

      /*
       * Only restore exam state when enough information
       * exists to reopen MockTestInterface.
       */
      if (
        savedStep === "exam" &&
        savedExamId &&
        savedQuestions.length > 0 &&
        savedStudentId ===
          storedId
      ) {
        setExamId(
          savedExamId
        );

        setQuestions(
          savedQuestions
        );

        if (savedClass) {
          setClassName(
            savedClass
          );
        }

        if (savedExamType) {
          setExamType(
            savedExamType
          );
        }

        if (savedStudentName) {
          setStudentName(
            savedStudentName
          );
        }

        setIsReady(
          true
        );

        /*
         * IMPORTANT:
         * Refresh during MockTestInterface
         * stays on exam page.
         */
        setStep("exam");
      } else if (
        savedStep ===
          "instructions" ||
        savedStep ===
          "greeting"
      ) {
        /*
         * A refresh during the preparation stage should
         * restore the preparation stage rather than jump
         * back to dashboard.
         */
        setStep(
          savedStep
        );

        setIsReady(
          savedStep ===
            "greeting"
        );
      } else {
        /*
         * Normal fresh entry.
         */
        setStep(
          "dashboard"
        );
      }
    } catch {
      setStep(
        "dashboard"
      );
    }

    if (!storedId) {
      setCheckingSubmission(
        false
      );

      setError(
        "Student identification could not be found. Please log in again."
      );

      return;
    }

    /* =====================================================
       CACHE PREVIOUS RESULT
    ===================================================== */

    const cachedResult =
      localStorage.getItem(
        `exam_result_${storedId}_${storedExam}`
      );

    const cachedSubmitted =
      localStorage.getItem(
        `exam_submitted_${storedId}_${storedExam}`
      );

    if (
      cachedSubmitted ===
        "true" &&
      cachedResult
    ) {
      const parsedResult =
        safeParse<ExamResult>(
          cachedResult
        );

      if (parsedResult) {
        setExamResult(
          parsedResult
        );

        setAlreadySubmitted(
          true
        );
      }
    }

    void checkBackendSubmission(
      storedId,
      token,
      storedExam
    );
  }, [navigate]);

  /* =========================================================
     BACKEND PREVIOUS RESULT CHECK
  ========================================================= */

  const checkBackendSubmission =
    async (
      id: string,
      token: string,
      currentExamType: string
    ) => {
      setCheckingSubmission(
        true
      );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/results/student/${encodeURIComponent(
              id
            )}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /*
         * Previous result failure must not
         * block a new exam.
         */

        if (
          !response.ok
        ) {
          console.warn(
            "Previous result check failed."
          );

          return;
        }

        const data =
          await response.json();

        const resultsList: ExamResult[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.results
              )
            ? data.results
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        const target =
          normalize(
            currentExamType
          );

        const matchingResults =
          resultsList.filter(
            (result) => {
              const resultSubject =
                normalize(
                  result.subject
                );

              const examName =
                normalize(
                  result.examName
                );

              const resultExamType =
                normalize(
                  result.examType
                );

              return (
                resultSubject ===
                  target ||
                resultExamType ===
                  target ||
                examName.includes(
                  target
                )
              );
            }
          );

        if (
          matchingResults.length >
          0
        ) {
          const sortedResults =
            [
              ...matchingResults,
            ].sort(
              (a, b) => {
                const first =
                  new Date(
                    a.submittedAt ||
                      a.createdAt ||
                      0
                  ).getTime();

                const second =
                  new Date(
                    b.submittedAt ||
                      b.createdAt ||
                      0
                  ).getTime();

                return (
                  second -
                  first
                );
              }
            );

          const latestResult =
            sortedResults[0];

          setExamResult(
            latestResult
          );

          setAlreadySubmitted(
            true
          );

          localStorage.setItem(
            `exam_submitted_${id}_${currentExamType}`,
            "true"
          );

          localStorage.setItem(
            `exam_result_${id}_${currentExamType}`,
            JSON.stringify(
              latestResult
            )
          );
        }
      } catch (err) {
        console.error(
          "Backend submission verification failed:",
          err
        );
      } finally {
        setCheckingSubmission(
          false
        );
      }
    };

  /* =========================================================
     FRONTEND QUESTION NORMALIZATION
  ========================================================= */

  const normalizeQuestionText =
    (value: unknown): string => {
      return String(
        value ?? ""
      )
        .replace(
          /<[^>]*>/g,
          " "
        )
        .replace(
          /&nbsp;/gi,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .toLowerCase();
    };

  /* =========================================================
     FRONTEND DUPLICATE REMOVAL
  ========================================================= */

  const removeDuplicateQuestions =
    (
      source: Question[]
    ): Question[] => {
      const seenIds =
        new Set<string>();

      const seenTexts =
        new Set<string>();

      const unique: Question[] =
        [];

      for (
        const question of source
      ) {
        if (!question) {
          continue;
        }

        const id =
          String(
            question._id ||
              ""
          ).trim();

        const text =
          normalizeQuestionText(
            question.question ||
              question.questionText ||
              ""
          );

        const subjectKey =
          normalize(
            question.subject
          );

        /*
         * -----------------------------------------------
         * Duplicate by ID
         * -----------------------------------------------
         */

        if (
          id &&
          seenIds.has(id)
        ) {
          continue;
        }

        /*
         * -----------------------------------------------
         * Duplicate by question text + subject
         * -----------------------------------------------
         */

        const textKey =
          text
            ? `${subjectKey}|${text}`
            : "";

        if (
          textKey &&
          seenTexts.has(
            textKey
          )
        ) {
          continue;
        }

        if (id) {
          seenIds.add(id);
        }

        if (textKey) {
          seenTexts.add(
            textKey
          );
        }

        unique.push(
          question
        );
      }

      return unique;
    };

  /* =========================================================
     SUBJECT ORDER
  ========================================================= */

  const SUBJECT_ORDER = [
    "physics",
    "chemistry",
    "botany",
    "zoology",
  ];

  /* =========================================================
     FRONTEND SUBJECT FILTER + SORT
  ========================================================= */

  const filterAndSortQuestions =
    (
      source: Question[],
      selectedSubject?: string
    ): Question[] => {
      /*
       * First remove duplicates.
       */
      let filtered =
        removeDuplicateQuestions(
          source
        );

      const target =
        normalize(
          selectedSubject
        );

      /*
       * If a specific subject is selected,
       * show only that subject.
       *
       * All / blank => show all 4 subjects.
       */
      if (
        target &&
        target !== "all"
      ) {
        filtered =
          filtered.filter(
            (question) =>
              normalize(
                question.subject
              ) === target
          );
      } else {
        filtered =
          filtered.filter(
            (question) =>
              SUBJECT_ORDER.includes(
                normalize(
                  question.subject
                )
              )
          );
      }

      /*
       * Physics
       * Chemistry
       * Botany
       * Zoology
       */
      return [
        ...filtered,
      ].sort(
        (a, b) => {
          const subjectA =
            SUBJECT_ORDER.indexOf(
              normalize(
                a.subject
              )
            );

          const subjectB =
            SUBJECT_ORDER.indexOf(
              normalize(
                b.subject
              )
            );

          if (
            subjectA !==
            subjectB
          ) {
            return (
              subjectA -
              subjectB
            );
          }

          const qA =
            Number(
              a.questionNumber ??
                999999
            );

          const qB =
            Number(
              b.questionNumber ??
                999999
            );

          if (
            qA !== qB
          ) {
            return (
              qA - qB
            );
          }

          const indexA =
            Number(
              a.index ??
                999999
            );

          const indexB =
            Number(
              b.index ??
                999999
            );

          return (
            indexA -
            indexB
          );
        }
      );
    };

  /* =========================================================
     FETCH MOCK QUESTIONS
  ========================================================= */

  const fetchQuestionsForClass =
    async (
      selectedClass: string,
      selectedExamType: string
    ) => {
      setLoading(
        true
      );

      setError("");

      setExamId("");

      setQuestions([]);

      const token =
        localStorage.getItem(
          "studentToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      if (!token) {
        clearMockFlowState();
        navigate(
          "/login"
        );

        setLoading(
          false
        );

        return false;
      }

      try {
        const queryParams =
          new URLSearchParams();

        if (
          selectedClass
        ) {
          queryParams.append(
            "className",
            selectedClass
          );
        }

        if (
          selectedExamType
        ) {
          queryParams.append(
            "examType",
            selectedExamType
          );
        }

        /*
         * IMPORTANT
         *
         * Backend route:
         * GET /api/mock-test/questions
         *
         * API_BASE_URL already contains /api.
         *
         * NO subject filter is sent here.
         *
         * Filtering/order is done in frontend.
         */

        const requestUrl =
          `${API_BASE_URL}/mock-test/questions?${queryParams.toString()}`;

        console.log(
          "MOCK TEST REQUEST:",
          requestUrl
        );

        const response =
          await fetch(
            requestUrl,
            {
              method:
                "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        let data: any =
          null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        console.log(
          "MOCK TEST SERVER RESPONSE:",
          data
        );

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load mock test questions (${response.status}).`
          );
        }

        /* =====================================================
           FIND QUESTIONS
        ===================================================== */

        const loadedQuestions =
          Array.isArray(
            data?.questions
          )
            ? data.questions
            : Array.isArray(
                data?.data
              )
            ? data.data
            : Array.isArray(data)
            ? data
            : [];

        if (
          loadedQuestions.length ===
          0
        ) {
          throw new Error(
            "No questions are currently available for this mock test."
          );
        }

        /* =====================================================
           FIND EXAM ID
        ===================================================== */

        const serverExamId =
          String(
            data?.examId ||
              data?.exam?.examId ||
              data?.exam?._id ||
              data?.exam?.id ||
              data?.test?.examId ||
              data?.test?._id ||
              data?.test?.id ||
              ""
          ).trim();

        const questionExamId =
          String(
            loadedQuestions?.[0]
              ?.examId ||
              loadedQuestions?.[0]
                ?.exam?._id ||
              loadedQuestions?.[0]
                ?.exam?.id ||
              loadedQuestions?.[0]
                ?.testId ||
              ""
          ).trim();

        const finalExamId =
          serverExamId ||
          questionExamId;

        /*
         * Exam session requires examId.
         */

        if (!finalExamId) {
          throw new Error(
            "Mock test examId was not returned by the server."
          );
        }

        /* =====================================================
           NORMALIZE QUESTIONS
        ===================================================== */

        const normalizedQuestions =
          loadedQuestions.map(
            (
              question: any,
              index: number
            ) => ({
              ...question,

              _id:
                question?._id ||
                question?.id ||
                `mock-question-${index}`,

              id:
                question?.id ||
                question?._id ||
                `mock-question-${index}`,

              examId:
                question?.examId ||
                finalExamId,

              questionText:
                question?.questionText ||
                question?.question ||
                "",

              question:
                question?.question ||
                question?.questionText ||
                "",

              options:
                Array.isArray(
                  question?.options
                )
                  ? question.options
                  : [],

              /*
               * Backend display endpoint normally does not
               * return correctAnswer.
               *
               * Keep blank only for compatibility.
               */
              correctAnswer:
                question?.correctAnswer ||
                "",

              questionNumber:
                question?.questionNumber ||
                index + 1,
            })
          );

        /* =====================================================
           VALID QUESTIONS
        ===================================================== */

        const validQuestions =
          normalizedQuestions.filter(
            (question: any) =>
              question.question &&
              Array.isArray(
                question.options
              ) &&
              question.options.length >=
                2
          );

        if (
          validQuestions.length ===
          0
        ) {
          throw new Error(
            "No valid questions were found for this mock test."
          );
        }

        /* =====================================================
           FRONTEND DUPLICATE REMOVE
        ===================================================== */

        const uniqueQuestions =
          removeDuplicateQuestions(
            validQuestions
          );

        /* =====================================================
           FRONTEND SUBJECT ORDER
        ===================================================== */

        const finalQuestions =
          filterAndSortQuestions(
            uniqueQuestions,
            ""
          ).map(
            (
              question: Question,
              index: number
            ) => ({
              ...question,

              /*
               * Display number is always the final frontend
               * order.
               */
              questionNumber:
                index + 1,
            })
          );

        if (
          finalQuestions.length ===
          0
        ) {
          throw new Error(
            "No unique questions are available after filtering."
          );
        }

        setExamId(
          finalExamId
        );

        setQuestions(
          finalQuestions
        );

        console.log(
          "=================================================="
        );

        console.log(
          "MOCK TEST QUESTIONS RECEIVED:",
          loadedQuestions.length
        );

        console.log(
          "UNIQUE QUESTIONS:",
          finalQuestions.length
        );

        console.log(
          "SUBJECT ORDER:",
          "Physics → Chemistry → Botany → Zoology"
        );

        console.log(
          "SUBJECT COUNTS:",
          {
            Physics:
              finalQuestions.filter(
                (q) =>
                  normalize(
                    q.subject
                  ) === "physics"
              ).length,

            Chemistry:
              finalQuestions.filter(
                (q) =>
                  normalize(
                    q.subject
                  ) === "chemistry"
              ).length,

            Botany:
              finalQuestions.filter(
                (q) =>
                  normalize(
                    q.subject
                  ) === "botany"
              ).length,

            Zoology:
              finalQuestions.filter(
                (q) =>
                  normalize(
                    q.subject
                  ) === "zoology"
              ).length,
          }
        );

        console.log(
          "MOCK TEST EXAM ID:",
          finalExamId
        );

        console.log(
          "=================================================="
        );

        return true;
      } catch (
        err: any
      ) {
        console.error(
          "Mock test question loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the mock test."
        );

        return false;
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =========================================================
     START BUTTON
  ========================================================= */

  const handleStartExam =
    () => {
      if (
        checkingSubmission
      ) {
        return;
      }

      if (!isOnline) {
        setError(
          "You are currently offline. Please reconnect to the internet before starting the exam."
        );

        return;
      }

      setError("");

      setShowInstructions(
        true
      );
    };

  /* =========================================================
     MODAL → READY SCREEN
  ========================================================= */

  const handleContinueToInstructions =
    () => {
      setShowInstructions(
        false
      );

      setStep(
        "instructions"
      );

      saveMockFlowState(
        "instructions"
      );

      setError("");
    };

  /* =========================================================
     READY → LOAD QUESTIONS
  ========================================================= */

  const handleReady =
    async () => {
      if (!isOnline) {
        setError(
          "A stable internet connection is required to start the exam."
        );

        return;
      }

      if (loading) {
        return;
      }

      if (!className) {
        setError(
          "Student class could not be identified. Please log in again."
        );

        return;
      }

      setError("");

      setExamId("");

      /*
       * Keep instructions state in storage while loading.
       */
      try {
        sessionStorage.setItem(
          MOCK_FLOW_STEP_KEY,
          "instructions"
        );
      } catch {
        // Ignore.
      }

      const success =
        await fetchQuestionsForClass(
          className,
          examType
        );

      if (!success) {
        setIsReady(
          false
        );

        return;
      }

      /*
       * At this point questions + examId are ready.
       *
       * Save them BEFORE moving to greeting/exam so that
       * refresh can recover the exam.
       */

      try {
        sessionStorage.setItem(
          MOCK_FLOW_EXAM_ID_KEY,
          examId || ""
        );

        sessionStorage.setItem(
          MOCK_FLOW_CLASS_KEY,
          className || ""
        );

        sessionStorage.setItem(
          MOCK_FLOW_EXAM_TYPE_KEY,
          examType || ""
        );

        sessionStorage.setItem(
          MOCK_FLOW_STUDENT_ID_KEY,
          studentId || ""
        );

        sessionStorage.setItem(
          MOCK_FLOW_STUDENT_NAME_KEY,
          studentName || ""
        );
      } catch {
        // Ignore.
      }

      /*
       * IMPORTANT:
       *
       * fetchQuestionsForClass updates React state.
       * State updates are async.
       *
       * So the values must also be saved directly from the
       * fetched result. To avoid relying on stale `questions`
       * and `examId`, read them from session immediately after
       * the fetch using a microtask is not enough.
       *
       * We therefore keep a safe delayed persistence below.
       */

      setStep(
        "greeting"
      );

      /*
       * Save greeting state.
       */

      try {
        sessionStorage.setItem(
          MOCK_FLOW_STEP_KEY,
          "greeting"
        );
      } catch {
        // Ignore.
      }

      /*
       * Short greeting before exam.
       */

      window.setTimeout(
        () => {
          /*
           * Only move forward when the component is still mounted
           * enough for the event.
           */

          setStep(
            "exam"
          );

          /*
           * Save exam state AFTER questions have been committed
           * to React state.
           */
          window.setTimeout(
            () => {
              try {
                sessionStorage.setItem(
                  MOCK_FLOW_STEP_KEY,
                  "exam"
                );

                sessionStorage.setItem(
                  MOCK_FLOW_EXAM_ID_KEY,
                  finalExamIdFromState()
                );

                sessionStorage.setItem(
                  MOCK_FLOW_QUESTIONS_KEY,
                  JSON.stringify(
                    questionsFromState()
                  )
                );

                sessionStorage.setItem(
                  MOCK_FLOW_CLASS_KEY,
                  className || ""
                );

                sessionStorage.setItem(
                  MOCK_FLOW_EXAM_TYPE_KEY,
                  examType || ""
                );

                sessionStorage.setItem(
                  MOCK_FLOW_STUDENT_ID_KEY,
                  studentId || ""
                );

                sessionStorage.setItem(
                  MOCK_FLOW_STUDENT_NAME_KEY,
                  studentName || ""
                );
              } catch {
                // Ignore.
              }
            },
            50
          );
        },
        2200
      );
    };

  /* =========================================================
     STATE SNAPSHOT HELPERS
  ========================================================= */

  const finalExamIdFromState =
    () => {
      /*
       * Try React state first.
       * If not yet updated, read session storage.
       */
      return (
        examId ||
        sessionStorage.getItem(
          MOCK_FLOW_EXAM_ID_KEY
        ) ||
        ""
      );
    };

  const questionsFromState =
    () => {
      /*
       * Try React state first.
       * If not yet available, restore cached questions.
       */
      if (
        questions.length > 0
      ) {
        return questions;
      }

      return (
        safeParse<Question[]>(
          sessionStorage.getItem(
            MOCK_FLOW_QUESTIONS_KEY
          )
        ) || []
      );
    };

  /* =========================================================
     AUTO PERSIST EXAM STATE
     *
     * This is the important part.
     *
     * Whenever step/examId/questions change, persist them.
  ========================================================= */

  useEffect(() => {
    if (
      !studentId
    ) {
      return;
    }

    try {
      sessionStorage.setItem(
        MOCK_FLOW_STUDENT_ID_KEY,
        studentId
      );

      sessionStorage.setItem(
        MOCK_FLOW_STUDENT_NAME_KEY,
        studentName
      );

      sessionStorage.setItem(
        MOCK_FLOW_CLASS_KEY,
        className
      );

      sessionStorage.setItem(
        MOCK_FLOW_EXAM_TYPE_KEY,
        examType
      );

      /*
       * Do NOT overwrite saved exam step with dashboard
       * during initial mount.
       */
      if (
        step ===
        "instructions"
      ) {
        sessionStorage.setItem(
          MOCK_FLOW_STEP_KEY,
          "instructions"
        );
      }

      if (
        step ===
        "greeting"
      ) {
        sessionStorage.setItem(
          MOCK_FLOW_STEP_KEY,
          "greeting"
        );
      }

      if (
        step ===
        "exam" &&
        examId &&
        questions.length >
          0
      ) {
        sessionStorage.setItem(
          MOCK_FLOW_STEP_KEY,
          "exam"
        );

        sessionStorage.setItem(
          MOCK_FLOW_EXAM_ID_KEY,
          examId
        );

        sessionStorage.setItem(
          MOCK_FLOW_QUESTIONS_KEY,
          JSON.stringify(
            questions
          )
        );
      }
    } catch {
      // Ignore.
    }
  }, [
    step,
    examId,
    questions,
    studentId,
    studentName,
    className,
    examType,
  ]);

  /* =========================================================
     RESULT PERCENTAGE
  ========================================================= */

  const percentage =
    useMemo(() => {
      return clampPercentage(
        Number(
          examResult?.percentage ||
            0
        )
      );
    }, [
      examResult,
    ]);

  /*
   * Keep percentage available for the component.
   * Existing UI/result flow can use it later.
   */
  void percentage;

  /* =========================================================
     DASHBOARD
  ========================================================= */

  if (
    step ===
    "dashboard"
  ) {
    return (
      <>
        <div className="mock-page">
          <div className="mock-container">
            <header className="mock-header">
              <button
                type="button"
                className="mock-back-btn"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                <ArrowLeft
                  size={17}
                  aria-hidden="true"
                />

                Dashboard
              </button>

              <div
                className="mock-online-status"
                aria-live="polite"
              >
                {isOnline ? (
                  <>
                    <Wifi
                      size={14}
                      aria-hidden="true"
                    />

                    Online
                  </>
                ) : (
                  <>
                    <WifiOff
                      size={14}
                      aria-hidden="true"
                    />

                    Offline
                  </>
                )}
              </div>
            </header>

            <section
              className="mock-hero"
              aria-labelledby="mock-hero-title"
            >
              <div className="mock-hero-content">
                <div className="mock-eyebrow">
                  EXAM SIMULATION
                </div>

                <h1 id="mock-hero-title">
                  Ready for your
                  next
                  <span>
                    {" "}
                    challenge?
                  </span>
                </h1>

                <p>
                  Test your knowledge,
                  improve your accuracy,
                  and measure your
                  preparation with a
                  focused mock
                  assessment.
                </p>

                <div className="mock-hero-tags">
                  <span>
                    <ShieldCheck
                      size={14}
                      aria-hidden="true"
                    />

                    Secure Assessment
                  </span>

                  <span>
                    <Target
                      size={14}
                      aria-hidden="true"
                    />

                    Performance Tracking
                  </span>

                  <span>
                    <Zap
                      size={14}
                      aria-hidden="true"
                    />

                    Instant Evaluation
                  </span>
                </div>
              </div>

              <div
                className="mock-hero-visual"
                aria-hidden="true"
              >
                <div className="mock-orbit mock-orbit-one" />

                <div className="mock-orbit mock-orbit-two" />

                <div className="mock-hero-icon">
                  <GraduationCap
                    size={48}
                  />
                </div>
              </div>
            </section>

            <section
              className="mock-start-grid"
              aria-label="Mock test start"
            >
              <div className="mock-start-card">
                <div className="mock-card-top">
                  <div className="mock-test-icon">
                    <BookOpen
                      size={23}
                      aria-hidden="true"
                    />
                  </div>

                  <div
                    className="mock-test-status"
                    aria-live="polite"
                  >
                    {checkingSubmission ? (
                      <>
                        <RefreshCw
                          size={13}
                          className="mock-spin"
                          aria-hidden="true"
                        />

                        Checking
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={13}
                          aria-hidden="true"
                        />

                        Available
                      </>
                    )}
                  </div>
                </div>

                <div className="mock-test-category">
                  {examType.toUpperCase()}
                </div>

                <h2>
                  Full Mock Assessment
                </h2>

                <p>
                  A comprehensive
                  assessment designed
                  for your current
                  academic level.
                </p>

                <div className="mock-info-grid">
                  <div>
                    <FileQuestion
                      size={17}
                      aria-hidden="true"
                    />

                    <span>
                      Questions

                      <strong>
                        180
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Clock3
                      size={17}
                      aria-hidden="true"
                    />

                    <span>
                      Estimated Time

                      <strong>
                        3 Hours
                      </strong>
                    </span>
                  </div>

                  <div>
                    <GraduationCap
                      size={17}
                      aria-hidden="true"
                    />

                    <span>
                      PATTERN

                      <strong>
                        NEET
                      </strong>
                    </span>
                  </div>

                  <div>
                    <ShieldCheck
                      size={17}
                      aria-hidden="true"
                    />

                    <span>
                      Marks

                      <strong>
                        720
                      </strong>
                    </span>
                  </div>
                </div>

                {!isOnline && (
                  <div className="mock-warning">
                    <WifiOff
                      size={15}
                      aria-hidden="true"
                    />

                    Internet connection
                    required before
                    starting.
                  </div>
                )}

                {error && (
                  <div
                    className="mock-inline-error"
                    role="alert"
                  >
                    <Info
                      size={15}
                      aria-hidden="true"
                    />

                    {error}
                  </div>
                )}

                <button
                  type="button"
                  className="mock-start-btn"
                  onClick={
                    handleStartExam
                  }
                  disabled={
                    checkingSubmission ||
                    loading ||
                    !isOnline
                  }
                >
                  {checkingSubmission ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="mock-spin"
                        aria-hidden="true"
                      />

                      Checking...
                    </>
                  ) : (
                    <>
                      {alreadySubmitted
                        ? "Start New Mock Test"
                        : "Start Mock Test"}

                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </div>

              <aside className="mock-side-card">
                <div className="mock-side-icon">
                  <LockKeyhole
                    size={21}
                    aria-hidden="true"
                  />
                </div>

                <h3>
                  Before You Begin
                </h3>

                <ul>
                  <li>
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                    />

                    Ensure a stable
                    internet connection.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                    />

                    Keep your device
                    charged.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                    />

                    Choose a quiet
                    environment.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                    />

                    Do not refresh during
                    the assessment.
                  </li>

                  <li>
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                    />

                    Submit only after
                    reviewing your answers.
                  </li>
                </ul>
              </aside>
            </section>

            <section className="mock-security-strip">
              <ShieldCheck
                size={19}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Secure Examination
                  Environment
                </strong>

                <span>
                  Your attempt is
                  verified with the
                  server before the
                  assessment begins.
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* =================================================
            INSTRUCTIONS MODAL
        ================================================= */}

        {showInstructions && (
          <div className="mock-modal-overlay">
            <div
              className="mock-instructions-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mock-instructions-title"
            >
              <button
                type="button"
                className="mock-modal-close"
                onClick={() =>
                  setShowInstructions(
                    false
                  )
                }
                aria-label="Close instructions"
              >
                <X size={19} />
              </button>

              <div className="mock-modal-icon">
                <ShieldCheck
                  size={25}
                  aria-hidden="true"
                />
              </div>

              <span className="mock-modal-label">
                EXAM INSTRUCTIONS
              </span>

              <h2 id="mock-instructions-title">
                Please review before
                starting
              </h2>

              <p className="mock-modal-description">
                Once the assessment
                begins, your attempt
                will be treated as an
                active examination
                session.
              </p>

              <div className="mock-instruction-list">
                <div>
                  <span>
                    01
                  </span>

                  <p>
                    Read every question
                    carefully before
                    selecting an answer.
                  </p>
                </div>

                <div>
                  <span>
                    02
                  </span>

                  <p>
                    Manage your time
                    carefully throughout
                    the assessment.
                  </p>
                </div>

                <div>
                  <span>
                    03
                  </span>

                  <p>
                    Avoid refreshing or
                    closing the browser
                    during the test.
                  </p>
                </div>

                <div>
                  <span>
                    04
                  </span>

                  <p>
                    Your answers will be
                    evaluated after
                    submission.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mock-modal-primary"
                onClick={
                  handleContinueToInstructions
                }
              >
                Continue

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  /* =========================================================
     FINAL READINESS SCREEN
  ========================================================= */

  if (
    step ===
    "instructions"
  ) {
    return (
      <div className="mock-page">
        <div className="mock-ready-container">
          <button
            type="button"
            className="mock-back-btn"
            onClick={() => {
              setStep(
                "dashboard"
              );

              try {
                sessionStorage.setItem(
                  MOCK_FLOW_STEP_KEY,
                  "dashboard"
                );
              } catch {
                // Ignore.
              }
            }}
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />

            Back
          </button>

          <div className="mock-ready-card">
            <div className="mock-ready-header">
              <div className="mock-ready-icon">
                <LockKeyhole
                  size={28}
                  aria-hidden="true"
                />
              </div>

              <div>
                <span>
                  SECURE ASSESSMENT
                </span>

                <h1>
                  Final readiness
                  check
                </h1>
              </div>
            </div>

            <div className="mock-ready-exam">
              <div>
                <span>
                  Exam
                </span>

                <strong>
                  {examType} Full Mock
                </strong>
              </div>

              <div>
                <span>
                  Candidate
                </span>

                <strong>
                  {studentName}
                </strong>
              </div>

              <div>
                <span>
                  Class
                </span>

                <strong>
                  {className ||
                    "General"}
                </strong>
              </div>

              <div>
                <span>
                  Questions
                </span>

                <strong>
                  Will load securely
                </strong>
              </div>
            </div>

            <div className="mock-checklist">
              <label>
                <input
                  type="checkbox"
                  checked={
                    isReady
                  }
                  onChange={(
                    event
                  ) =>
                    setIsReady(
                      event.target
                        .checked
                    )
                  }
                />

                <span className="mock-checkbox">
                  {isReady && (
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span>
                  I am ready to begin
                  the assessment and
                  understand the
                  examination
                  instructions.
                </span>
              </label>
            </div>

            {error && (
              <div
                className="mock-inline-error"
                role="alert"
              >
                <Info
                  size={15}
                  aria-hidden="true"
                />

                {error}
              </div>
            )}

            <button
              type="button"
              className="mock-begin-btn"
              disabled={
                !isReady ||
                loading
              }
              onClick={
                handleReady
              }
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="mock-spin"
                    aria-hidden="true"
                  />

                  Preparing Exam...
                </>
              ) : (
                <>
                  Enter Examination

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            <p className="mock-secure-note">
              <ShieldCheck
                size={14}
                aria-hidden="true"
              />

              Your attempt will be
              securely processed by
              the examination system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ALL THE BEST
  ========================================================= */

  if (
    step ===
    "greeting"
  ) {
    return (
      <div className="mock-greeting">
        <div
          className="mock-greeting-glow"
          aria-hidden="true"
        />

        <div className="mock-greeting-content">
          <div className="mock-greeting-icon">
            <Trophy
              size={42}
              aria-hidden="true"
            />
          </div>

          <div className="mock-greeting-label">
            EXAM READY
          </div>

          <h1>
            All the best,
            <span>
              {studentName}
            </span>
          </h1>

          <p>
            Stay calm, stay focused,
            and give your best.
          </p>

          <div
            className="mock-greeting-loader"
            aria-hidden="true"
          >
            <span />
          </div>

          <small>
            Starting your examination...
          </small>
        </div>
      </div>
    );
  }

  /* =========================================================
     EXAM
  ========================================================= */

  if (
    step ===
    "exam"
  ) {
    /*
     * IMPORTANT:
     *
     * Refresh ayina sessionStorage nundi ee values
     * restore avuthayi.
     */

    return (
      <div className="mock-exam-page">
        <MockTestInterface
          subject={
            examType || "NEET"
          }

          className={
            className ||
            "General"
          }

          chapterName={
            `${examType || "NEET"} Full Mock Assessment`
          }

          questions={
            questions
          }

          studentId={
            studentId
          }

          studentName={
            studentName
          }

          themeColor="#4F46E5"

          onBack={() => {
            /*
             * Exam complete ayyaka / intentional exit ayyaka
             * flow state clear chestham.
             */
            clearMockFlowState();

            setStep(
              "dashboard"
            );
          }}

          apiBaseUrl={
            API_BASE_URL
          }

          examId={
            examId
          }
        />
      </div>
    );
  }

  return null;
}

