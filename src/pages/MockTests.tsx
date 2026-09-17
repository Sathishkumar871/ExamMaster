
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

const normalize = (
  value?: string
) =>
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

  // ========================================================
  // EXACT MISSED EXAM ID FROM URL
  // /mock-test/:examId
  // ========================================================

  const {
    examId: routeExamId,
  } = useParams<{
    examId?: string;
  }>();

  const cleanRouteExamId =
    String(routeExamId || "").trim();

  const isMissedExamFlow =
    Boolean(cleanRouteExamId);

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
    nextStep: Step,
    nextExamId?: string,
    nextQuestions?: Question[]
  ) => {
    try {
      sessionStorage.setItem(
        MOCK_FLOW_STEP_KEY,
        nextStep
      );

      sessionStorage.setItem(
        MOCK_FLOW_EXAM_ID_KEY,
        nextExamId ??
          examId ??
          cleanRouteExamId ??
          ""
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
          nextQuestions ??
            questions ??
            []
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
     BACKEND PREVIOUS RESULT CHECK
  ========================================================= */

  const checkBackendSubmission =
    async (
      id: string,
      token: string,
      currentExamType: string
    ) => {
      setCheckingSubmission(true);

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
         * Result check failure must not block
         * normal exam access.
         */

        if (!response.ok) {
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

        // ====================================================
        // MISSED TEST
        // EXACT EXAM ID
        // ====================================================

        if (cleanRouteExamId) {
          const exactResult =
            resultsList.find(
              (result) =>
                String(
                  result.examId || ""
                ) ===
                cleanRouteExamId
            );

          if (exactResult) {
            setExamResult(
              exactResult
            );

            setAlreadySubmitted(
              true
            );

            localStorage.setItem(
              `exam_submitted_${id}_${cleanRouteExamId}`,
              "true"
            );

            localStorage.setItem(
              `exam_result_${id}_${cleanRouteExamId}`,
              JSON.stringify(
                exactResult
              )
            );
          }

          return;
        }

        // ====================================================
        // NORMAL MOCK TEST
        // EXISTING EXAM TYPE CHECK
        // ====================================================

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

    // ======================================================
    // ROUTE EXAM HAS PRIORITY
    // ======================================================

    if (cleanRouteExamId) {
      setExamId(
        cleanRouteExamId
      );
    }

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
       * Route exam ID must always win over an older
       * sessionStorage exam ID.
       */

      const restoreExamId =
        cleanRouteExamId ||
        savedExamId;

      // ====================================================
      // RESTORE EXAM
      // ====================================================

      if (
        savedStep === "exam" &&
        restoreExamId &&
        savedQuestions.length > 0 &&
        savedStudentId === storedId
      ) {
        setExamId(
          restoreExamId
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

        setStep(
          "exam"
        );
      }

      // ====================================================
      // RESTORE PREPARATION
      // ====================================================

      else if (
        savedStep ===
          "instructions" ||
        savedStep ===
          "greeting"
      ) {
        /*
         * For a new missed-test route,
         * don't restore an unrelated old flow.
         */

        if (
          cleanRouteExamId &&
          savedExamId &&
          savedExamId !==
            cleanRouteExamId
        ) {
          setStep(
            "dashboard"
          );

          setIsReady(
            false
          );
        } else {
          setStep(
            savedStep
          );

          setIsReady(
            savedStep ===
              "greeting"
          );

          if (
            restoreExamId
          ) {
            setExamId(
              restoreExamId
            );
          }
        }
      } else {
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

    const resultCacheKey =
      cleanRouteExamId ||
      storedExam;

    const cachedResult =
      localStorage.getItem(
        `exam_result_${storedId}_${resultCacheKey}`
      );

    const cachedSubmitted =
      localStorage.getItem(
        `exam_submitted_${storedId}_${resultCacheKey}`
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
  }, [
    navigate,
    cleanRouteExamId,
  ]);

  /* =========================================================
     NORMALIZE QUESTION TEXT
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
     REMOVE DUPLICATE QUESTIONS
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

        if (
          id &&
          seenIds.has(id)
        ) {
          continue;
        }

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
      let filtered =
        removeDuplicateQuestions(
          source
        );

      const target =
        normalize(
          selectedSubject
        );

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
            indexA - indexB
          );
        }
      );
    };

  /* =========================================================
     FETCH NORMAL MOCK QUESTIONS
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

        const requestUrl =
          `${API_BASE_URL}/mock-test/questions?${queryParams.toString()}`;

        console.log(
          "NORMAL MOCK TEST REQUEST:",
          requestUrl
        );

        const response =
          await fetch(
            requestUrl,
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

        let data: any =
          null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        console.log(
          "NORMAL MOCK SERVER RESPONSE:",
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

        if (!finalExamId) {
          throw new Error(
            "Mock test examId was not returned by the server."
          );
        }

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

              correctAnswer:
                question?.correctAnswer ||
                "",

              questionNumber:
                question?.questionNumber ||
                index + 1,
            })
          );

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

        const uniqueQuestions =
          removeDuplicateQuestions(
            validQuestions
          );

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
          "NORMAL MOCK EXAM ID:",
          finalExamId
        );

        console.log(
          "NORMAL QUESTIONS:",
          finalQuestions.length
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
     START EXACT MISSED EXAM
  ========================================================= */

  const startExactMissedExam =
    async (
      selectedExamId: string
    ) => {
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

        return false;
      }

      try {
        setLoading(
          true
        );

        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/mock-test/start`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                studentId,
                examId:
                  selectedExamId,
              }),
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
          "EXACT MISSED EXAM START RESPONSE:",
          data
        );

        // ====================================================
        // ALREADY SUBMITTED
        // ====================================================

        if (
          response.status ===
            409 &&
          data?.code ===
            "EXAM_ALREADY_SUBMITTED"
        ) {
          setAlreadySubmitted(
            true
          );

          setExamId(
            selectedExamId
          );

          if (
            data?.result
          ) {
            setExamResult(
              data.result
            );
          }

          try {
            sessionStorage.removeItem(
              MOCK_FLOW_STEP_KEY
            );

            sessionStorage.removeItem(
              MOCK_FLOW_QUESTIONS_KEY
            );
          } catch {
            // Ignore.
          }

          setStep(
            "dashboard"
          );

          setError(
            "This exam has already been submitted and cannot be reopened."
          );

          return false;
        }

        // ====================================================
        // EXAM NOT AVAILABLE
        // ====================================================

        if (
          response.status ===
          404
        ) {
          throw new Error(
            data?.message ||
              "This mock exam could not be found."
          );
        }

        // ====================================================
        // EXAM EXPIRED
        // ====================================================

        if (
          response.status ===
            410 ||
          data?.code ===
            "EXAM_TIME_EXPIRED"
        ) {
          throw new Error(
            data?.message ||
              "This exam is no longer available."
          );
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Unable to start this missed exam."
          );
        }

        // ====================================================
        // QUESTIONS
        // ====================================================

        const loadedQuestions =
          Array.isArray(
            data?.questions
          )
            ? data.questions
            : [];

        if (
          loadedQuestions.length ===
          0
        ) {
          throw new Error(
            "No questions were found for this exam."
          );
        }

        // ====================================================
        // EXACT EXAM ID
        // ====================================================

        const exactExamId =
          String(
            data?.exam?._id ||
              data?.exam?.id ||
              selectedExamId
          ).trim();

        // ====================================================
        // EXAM DETAILS
        // ====================================================

        const returnedClass =
          String(
            data?.exam?.className ||
              ""
          ).trim();

        const returnedExamType =
          String(
            data?.exam?.examType ||
              ""
          ).trim();

        if (
          returnedClass
        ) {
          setClassName(
            returnedClass
          );
        }

        if (
          returnedExamType
        ) {
          setExamType(
            returnedExamType
          );
        }

        // ====================================================
        // NORMALIZE QUESTIONS
        // ====================================================

        const normalizedQuestions =
          loadedQuestions.map(
            (
              question: any,
              index: number
            ) => ({
              ...question,

              _id:
                question?._id ||
                question?.questionId ||
                question?.id ||
                `missed-question-${index}`,

              id:
                question?.id ||
                question?._id ||
                question?.questionId ||
                `missed-question-${index}`,

              examId:
                exactExamId,

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

              correctAnswer:
                question?.correctAnswer ||
                "",

              questionNumber:
                question?.questionNumber ||
                index + 1,
            })
          );

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
            "No valid questions were found for this exam."
          );
        }

        const finalQuestions =
          removeDuplicateQuestions(
            validQuestions
          ).map(
            (
              question: Question,
              index: number
            ) => ({
              ...question,

              examId:
                exactExamId,

              questionNumber:
                index + 1,
            })
          );

        // ====================================================
        // SAVE STATE
        // ====================================================

        setExamId(
          exactExamId
        );

        setQuestions(
          finalQuestions
        );

        setIsReady(
          true
        );

        try {
          sessionStorage.setItem(
            MOCK_FLOW_EXAM_ID_KEY,
            exactExamId
          );

          sessionStorage.setItem(
            MOCK_FLOW_QUESTIONS_KEY,
            JSON.stringify(
              finalQuestions
            )
          );

          sessionStorage.setItem(
            MOCK_FLOW_CLASS_KEY,
            returnedClass ||
              className ||
              ""
          );

          sessionStorage.setItem(
            MOCK_FLOW_EXAM_TYPE_KEY,
            returnedExamType ||
              examType ||
              ""
          );

          sessionStorage.setItem(
            MOCK_FLOW_STUDENT_ID_KEY,
            studentId
          );

          sessionStorage.setItem(
            MOCK_FLOW_STUDENT_NAME_KEY,
            studentName
          );

          sessionStorage.setItem(
            MOCK_FLOW_STEP_KEY,
            "greeting"
          );
        } catch {
          // Ignore storage errors.
        }

        console.log(
          "EXACT MISSED EXAM ID:",
          exactExamId
        );

        console.log(
          "EXACT MISSED EXAM QUESTIONS:",
          finalQuestions.length
        );

        return true;
      } catch (
        err: any
      ) {
        console.error(
          "START EXACT MISSED EXAM ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to start this missed exam."
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

      // ======================================================
      // NEVER REOPEN SUBMITTED EXAM
      // ======================================================

      if (
        alreadySubmitted
      ) {
        setError(
          "This exam has already been submitted and cannot be reopened."
        );

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
     MODAL → INSTRUCTIONS
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
     READY → START
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

      if (!studentId) {
        setError(
          "Student information could not be identified. Please log in again."
        );

        return;
      }

      setError("");

      // ======================================================
      // MISSED TEST
      // ======================================================

      if (
        cleanRouteExamId
      ) {
        if (
          alreadySubmitted
        ) {
          setError(
            "This exam has already been submitted and cannot be reopened."
          );

          return;
        }

        const success =
          await startExactMissedExam(
            cleanRouteExamId
          );

        if (!success) {
          setIsReady(
            false
          );

          return;
        }

        /*
         * Exact missed test questions are now loaded.
         * Backend has also created/resumed the exam session.
         */

        setStep(
          "greeting"
        );

        saveMockFlowState(
          "greeting",
          cleanRouteExamId,
          questions
        );

        /*
         * Greeting screen is shown briefly.
         * Questions remain available in state/sessionStorage.
         */

        window.setTimeout(
          () => {
            setStep(
              "exam"
            );

            try {
              sessionStorage.setItem(
                MOCK_FLOW_STEP_KEY,
                "exam"
              );
            } catch {
              // Ignore.
            }
          },
          2200
        );

        return;
      }

      // ======================================================
      // NORMAL MOCK TEST
      // ======================================================

      if (!className) {
        setError(
          "Student class could not be identified. Please log in again."
        );

        return;
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
       * React state updates asynchronously.
       * Use sessionStorage after values are available.
       */

      try {
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
          MOCK_FLOW_STEP_KEY,
          "greeting"
        );
      } catch {
        // Ignore.
      }

      setStep(
        "greeting"
      );

      window.setTimeout(
        () => {
          setStep(
            "exam"
          );

          try {
            sessionStorage.setItem(
              MOCK_FLOW_STEP_KEY,
              "exam"
            );
          } catch {
            // Ignore.
          }
        },
        2200
      );
    };

  /* =========================================================
     AUTO PERSIST
  ========================================================= */

  useEffect(() => {
    if (!studentId) {
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

            {/* ==============================================
                HEADER
            ============================================== */}

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

            {/* ==============================================
                HERO
            ============================================== */}

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

            {/* ==============================================
                START GRID
            ============================================== */}

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
                    ) : alreadySubmitted ? (
                      <>
                        <CheckCircle2
                          size={13}
                          aria-hidden="true"
                        />

                        Already Submitted
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
                        {examType.toUpperCase()}
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
                    !isOnline ||
                    alreadySubmitted
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
                  ) : alreadySubmitted ? (
                    <>
                      Already Submitted

                      <CheckCircle2
                        size={18}
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      Start Mock Test

                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

              </div>

              {/* ==========================================
                  SIDE CARD
              ========================================== */}

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

            {/* ==============================================
                SECURITY STRIP
            ============================================== */}

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
                  {isMissedExamFlow
                    ? `${examType} Missed Mock`
                    : `${examType} Full Mock`}
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
                  {questions.length > 0
                    ? questions.length
                    : "Will load securely"}
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
                loading ||
                alreadySubmitted
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
              ) : alreadySubmitted ? (
                <>
                  Already Submitted

                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                  />
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
    return (
      <div className="mock-exam-page">

        <MockTestInterface
          subject={
            examType ||
            "NEET"
          }

          className={
            className ||
            "General"
          }

          chapterName={
            isMissedExamFlow
              ? `${examType || "NEET"} Missed Mock Assessment`
              : `${examType || "NEET"} Full Mock Assessment`
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
             * Leave exam screen.
             * Do not reopen same exam through
             * the active component.
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
            examId ||
            cleanRouteExamId
          }
        />

      </div>
    );
  }

  return null;
}

