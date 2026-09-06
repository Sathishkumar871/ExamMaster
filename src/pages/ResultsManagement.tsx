import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Filter,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trophy,
  GraduationCap,
  ClipboardList,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  X,
  BarChart3,
} from "lucide-react";

import "./ResultsManagement.css";

// ============================================================
// TYPES
// ============================================================

interface StudentResult {
  _id?: string;

  studentId: string;
  studentName: string;

  className?: string;
  year?: string;
  section?: string;
  email?: string;
  classId?: string;
  examId?: string;
  examName: string;

  testCategory?: string;
  subject?: string;
  chapter?: string;

  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;

  marks: number;
  percentage: number;

  grade?: string;

  status: "PASS" | "FAIL";

  timeTaken?: number;
  warnings?: number;

  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// GROUPED STUDENT
// ============================================================

interface StudentSummary {
  studentId: string;
  studentName: string;

  className?: string;
  year?: string;
  section?: string;
  email?: string;

  results: StudentResult[];

  totalExams: number;

  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;

  passCount: number;
  failCount: number;

  overallStatus: "PASS" | "FAIL";

  latestSubmittedAt?: string;
}

// ============================================================
// QUICK FILTER
// ============================================================

type QuickFilter =
  | "ALL"
  | "PASS"
  | "FAIL"
  | "HIGHEST";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (
  value?: string
) => {
  if (!value) {
    return "N/A";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "N/A";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function ResultsManagement() {
  // ==========================================================
  // API DATA
  // ==========================================================

  const [
    results,
    setResults,
  ] = useState<StudentResult[]>([]);

  // IMPORTANT:
  // Only the data area uses this loading state.
  // The whole dashboard is rendered immediately.
  const [
    resultsLoading,
    setResultsLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    yearFilter,
    setYearFilter,
  ] = useState("All");

  const [
    examFilter,
    setExamFilter,
  ] = useState("All");

  const [
    sectionFilter,
    setSectionFilter,
  ] = useState("All");

  const [
    subjectFilter,
    setSubjectFilter,
  ] = useState("All");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");

  const [
    sortBy,
    setSortBy,
  ] = useState("latest");

  // ==========================================================
  // QUICK FILTER
  // ==========================================================

  const [
    quickFilter,
    setQuickFilter,
  ] = useState<QuickFilter>(
    "ALL"
  );

  // ==========================================================
  // MODAL
  // ==========================================================

  const [
    selectedStudent,
    setSelectedStudent,
  ] = useState<StudentSummary | null>(
    null
  );

  const [
    showStudentModal,
    setShowStudentModal,
  ] = useState(false);

  // ==========================================================
  // FETCH RESULTS
  // ==========================================================

  const fetchResults = async (
    refresh = false
  ) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setResultsLoading(true);
      }

      const token =
        localStorage.getItem(
          "staffToken"
        ) ||
        localStorage.getItem(
          "teacherToken"
        );

      if (!token) {
        setResults([]);

        return;
      }

      const endpoint =
        `${API_BASE_URL}/teacher/results`;

      const response =
        await fetch(
          endpoint,
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

      let data: any = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      // ======================================================
      // UNAUTHORIZED
      // ======================================================

      if (
        response.status === 401
      ) {
        setResults([]);

        return;
      }

      // ======================================================
      // NOT FOUND
      // ======================================================

      if (
        response.status === 404
      ) {
        setResults([]);

        return;
      }

      // ======================================================
      // OTHER ERROR
      // ======================================================

      if (!response.ok) {
        setResults([]);

        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      if (data?.success) {
        const incoming =
          Array.isArray(
            data.results
          )
            ? data.results
            : [];

        setResults(
          incoming
        );
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(
        "Results fetch error:",
        error
      );

      setResults([]);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setResultsLoading(false);
      }
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchResults();
  }, []);

  // ==========================================================
  // CLEANUP BODY SCROLL
  // ==========================================================

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ==========================================================
  // AVAILABLE YEARS
  // ==========================================================

  const availableYears =
    useMemo(() => {
      const values =
        results
          .map(
            (item) =>
              item.year ||
              item.className ||
              ""
          )
          .filter(Boolean);

      return Array.from(
        new Set(values)
      ).sort();
    }, [results]);

  // ==========================================================
  // AVAILABLE EXAMS
  // ==========================================================

  const availableExams =
    useMemo(() => {
      const examMap =
        new Map<
          string,
          string
        >();

      results.forEach(
        (item) => {
          const key =
            item.examId ||
            item.examName;

          if (
            !examMap.has(
              key
            )
          ) {
            examMap.set(
              key,
              item.examName
            );
          }
        }
      );

      return Array.from(
        examMap.entries()
      ).sort(
        (a, b) =>
          a[1].localeCompare(
            b[1]
          )
      );
    }, [results]);

  // ==========================================================
  // AVAILABLE SECTIONS
  // ==========================================================

  const availableSections =
    useMemo(() => {
      const values =
        results
          .map(
            (item) =>
              item.section ||
              "N/A"
          )
          .filter(Boolean);

      return Array.from(
        new Set(values)
      ).sort();
    }, [results]);

  // ==========================================================
  // AVAILABLE SUBJECTS
  // ==========================================================

  const availableSubjects =
    useMemo(() => {
      const values =
        results
          .map(
            (item) =>
              item.subject ||
              "General"
          )
          .filter(Boolean);

      return Array.from(
        new Set(values)
      ).sort();
    }, [results]);

  // ==========================================================
  // AVAILABLE CATEGORIES
  // ==========================================================

  const availableCategories =
    useMemo(() => {
      const values =
        results
          .map(
            (item) =>
              item.testCategory ||
              "General"
          )
          .filter(Boolean);

      return Array.from(
        new Set(values)
      ).sort();
    }, [results]);

  // ==========================================================
  // TOTAL STUDENTS
  // ==========================================================

  const totalStudents =
    useMemo(() => {
      return new Set(
        results.map(
          (item) =>
            item.studentId
        )
      ).size;
    }, [results]);

  // ==========================================================
  // TOTAL EXAMS
  // ==========================================================

  const totalExams =
    useMemo(() => {
      return new Set(
        results.map(
          (item) =>
            item.examId ||
            item.examName
        )
      ).size;
    }, [results]);

  // ==========================================================
  // PASS RESULT COUNT
  // ==========================================================

  const passResultCount =
    useMemo(() => {
      return results.filter(
        (item) =>
          item.status ===
          "PASS"
      ).length;
    }, [results]);

  // ==========================================================
  // FAIL RESULT COUNT
  // ==========================================================

  const failResultCount =
    useMemo(() => {
      return results.filter(
        (item) =>
          item.status ===
          "FAIL"
      ).length;
    }, [results]);

  // ==========================================================
  // PASS STUDENTS
  // ==========================================================

  const passStudentCount =
    useMemo(() => {
      const studentMap =
        new Map<
          string,
          boolean
        >();

      results.forEach(
        (item) => {
          if (
            !studentMap.has(
              item.studentId
            )
          ) {
            studentMap.set(
              item.studentId,
              false
            );
          }

          if (
            item.status ===
            "PASS"
          ) {
            studentMap.set(
              item.studentId,
              true
            );
          }
        }
      );

      let count = 0;

      studentMap.forEach(
        (hasPass) => {
          if (hasPass) {
            count++;
          }
        }
      );

      return count;
    }, [results]);

  // ==========================================================
  // FAIL STUDENTS
  // ==========================================================

  const failStudentCount =
    useMemo(() => {
      const studentStatus =
        new Map<
          string,
          boolean
        >();

      results.forEach(
        (item) => {
          if (
            !studentStatus.has(
              item.studentId
            )
          ) {
            studentStatus.set(
              item.studentId,
              false
            );
          }

          if (
            item.status ===
            "FAIL"
          ) {
            studentStatus.set(
              item.studentId,
              true
            );
          }
        }
      );

      let count = 0;

      studentStatus.forEach(
        (hasFail) => {
          if (hasFail) {
            count++;
          }
        }
      );

      return count;
    }, [results]);

  // ==========================================================
  // GLOBAL AVERAGE
  // ==========================================================

  const averagePercentage =
    useMemo(() => {
      if (
        results.length ===
        0
      ) {
        return 0;
      }

      return (
        results.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.percentage ||
                0
            ),
          0
        ) / results.length
      );
    }, [results]);

  // ==========================================================
  // GLOBAL HIGHEST SCORE
  // ==========================================================

  const highestPercentage =
    useMemo(() => {
      if (
        results.length ===
        0
      ) {
        return 0;
      }

      return Math.max(
        ...results.map(
          (item) =>
            Number(
              item.percentage ||
                0
            )
        )
      );
    }, [results]);

  // ==========================================================
  // PASS RATE
  // ==========================================================

  const passRate =
    useMemo(() => {
      if (
        totalStudents ===
        0
      ) {
        return 0;
      }

      return (
        passStudentCount /
        totalStudents
      ) * 100;
    }, [
      passStudentCount,
      totalStudents,
    ]);

  // ==========================================================
  // RAW FILTERING
  // ==========================================================

  const filteredRawResults =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return results.filter(
        (item) => {
          // SEARCH
          if (keyword) {
            const searchable =
              [
                item.studentName,
                item.studentId,
                item.className,
                item.year,
                item.section,
                item.examName,
                item.subject,
                item.chapter,
                item.grade,
                item.testCategory,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (
              !searchable.includes(
                keyword
              )
            ) {
              return false;
            }
          }

          // YEAR
          if (
            yearFilter !==
            "All"
          ) {
            const itemYear =
              item.year ||
              item.className ||
              "";

            if (
              itemYear !==
              yearFilter
            ) {
              return false;
            }
          }

          // EXAM
          if (
            examFilter !==
            "All"
          ) {
            const itemExam =
              item.examId ||
              item.examName;

            if (
              itemExam !==
              examFilter
            ) {
              return false;
            }
          }

          // SECTION
          if (
            sectionFilter !==
            "All"
          ) {
            const itemSection =
              item.section ||
              "N/A";

            if (
              itemSection !==
              sectionFilter
            ) {
              return false;
            }
          }

          // SUBJECT
          if (
            subjectFilter !==
            "All"
          ) {
            const itemSubject =
              item.subject ||
              "General";

            if (
              itemSubject !==
              subjectFilter
            ) {
              return false;
            }
          }

          // CATEGORY
          if (
            categoryFilter !==
            "All"
          ) {
            const itemCategory =
              item.testCategory ||
              "General";

            if (
              itemCategory !==
              categoryFilter
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      results,
      search,
      yearFilter,
      examFilter,
      sectionFilter,
      subjectFilter,
      categoryFilter,
    ]);

  // ==========================================================
  // GROUP STUDENTS
  // ==========================================================

  const groupedStudents =
    useMemo(() => {
      const map =
        new Map<
          string,
          StudentSummary
        >();

      filteredRawResults.forEach(
        (item) => {
          const studentId =
            item.studentId;

          const existing =
            map.get(
              studentId
            );

          if (!existing) {
            map.set(
              studentId,
              {
                studentId:
                  item.studentId,

                studentName:
                  item.studentName,

                className:
                  item.className,

                year:
                  item.year,

                section:
                  item.section,

                email:
                  item.email,

                results: [
                  item,
                ],

                totalExams:
                  1,

                averagePercentage:
                  Number(
                    item.percentage ||
                      0
                  ),

                highestPercentage:
                  Number(
                    item.percentage ||
                      0
                  ),

                lowestPercentage:
                  Number(
                    item.percentage ||
                      0
                  ),

                passCount:
                  item.status ===
                  "PASS"
                    ? 1
                    : 0,

                failCount:
                  item.status ===
                  "FAIL"
                    ? 1
                    : 0,

                overallStatus:
                  item.status ===
                  "FAIL"
                    ? "FAIL"
                    : "PASS",

                latestSubmittedAt:
                  item.submittedAt ||
                  item.createdAt,
              }
            );

            return;
          }

          existing.results.push(
            item
          );

          existing.totalExams +=
            1;

          existing.passCount +=
            item.status ===
            "PASS"
              ? 1
              : 0;

          existing.failCount +=
            item.status ===
            "FAIL"
              ? 1
              : 0;

          const percentage =
            Number(
              item.percentage ||
                0
            );

          existing.highestPercentage =
            Math.max(
              existing.highestPercentage,
              percentage
            );

          existing.lowestPercentage =
            Math.min(
              existing.lowestPercentage,
              percentage
            );

          existing.averagePercentage =
            existing.results.reduce(
              (
                sum,
                result
              ) =>
                sum +
                Number(
                  result.percentage ||
                    0
                ),
              0
            ) /
            existing.results.length;

          existing.overallStatus =
            existing.failCount >
            0
              ? "FAIL"
              : "PASS";

          const currentLatest =
            existing.latestSubmittedAt
              ? new Date(
                  existing.latestSubmittedAt
                ).getTime()
              : 0;

          const newDate =
            item.submittedAt ||
            item.createdAt;

          const newLatest =
            newDate
              ? new Date(
                  newDate
                ).getTime()
              : 0;

          if (
            newLatest >
            currentLatest
          ) {
            existing.latestSubmittedAt =
              newDate;
          }
        }
      );

      return Array.from(
        map.values()
      );
    }, [
      filteredRawResults,
    ]);

  // ==========================================================
  // QUICK FILTER
  // ==========================================================

  const quickFilteredStudents =
    useMemo(() => {
      if (
        quickFilter ===
        "ALL"
      ) {
        return groupedStudents;
      }

      if (
        quickFilter ===
        "FAIL"
      ) {
        return groupedStudents.filter(
          (student) =>
            student.overallStatus ===
            "FAIL"
        );
      }

      if (
        quickFilter ===
        "PASS"
      ) {
        return groupedStudents.filter(
          (student) =>
            student.overallStatus ===
            "PASS"
        );
      }

      if (
        quickFilter ===
        "HIGHEST"
      ) {
        return groupedStudents.filter(
          (student) =>
            student.highestPercentage ===
            highestPercentage
        );
      }

      return groupedStudents;
    }, [
      groupedStudents,
      quickFilter,
      highestPercentage,
    ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const displayedStudents =
    useMemo(() => {
      const students =
        [
          ...quickFilteredStudents,
        ];

      return students.sort(
        (
          a,
          b
        ) => {
          if (
            sortBy ===
            "highest"
          ) {
            return (
              b.highestPercentage -
              a.highestPercentage
            );
          }

          if (
            sortBy ===
            "lowest"
          ) {
            return (
              a.averagePercentage -
              b.averagePercentage
            );
          }

          if (
            sortBy ===
            "name"
          ) {
            return a.studentName
              .toLowerCase()
              .localeCompare(
                b.studentName.toLowerCase()
              );
          }

          return (
            new Date(
              b.latestSubmittedAt ||
                0
            ).getTime() -
            new Date(
              a.latestSubmittedAt ||
                0
            ).getTime()
          );
        }
      );
    }, [
      quickFilteredStudents,
      sortBy,
    ]);

  // ==========================================================
  // DISPLAY COUNTS
  // ==========================================================

  const displayedPassCount =
    displayedStudents.filter(
      (student) =>
        student.overallStatus ===
        "PASS"
    ).length;

  const displayedFailCount =
    displayedStudents.filter(
      (student) =>
        student.overallStatus ===
        "FAIL"
    ).length;

  const displayedAverage =
    displayedStudents.length > 0
      ? (
          displayedStudents.reduce(
            (
              sum,
              student
            ) =>
              sum +
              student.averagePercentage,
            0
          ) /
          displayedStudents.length
        ).toFixed(1)
      : "0.0";

  const displayedHighest =
    displayedStudents.length > 0
      ? Math.max(
          ...displayedStudents.map(
            (student) =>
              student.highestPercentage
          )
        )
      : 0;

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setYearFilter("All");
    setExamFilter("All");
    setSectionFilter("All");
    setSubjectFilter("All");
    setCategoryFilter("All");
    setSortBy("latest");
    setQuickFilter("ALL");
  };

  // ==========================================================
  // QUICK FILTER CLICK
  // ==========================================================

  const handleQuickFilter = (
    filter: QuickFilter
  ) => {
    setQuickFilter(
      (current) =>
        current === filter
          ? "ALL"
          : filter
    );
  };

  // ==========================================================
  // OPEN MODAL
  // ==========================================================

  const openStudentDetails = (
    student: StudentSummary
  ) => {
    setSelectedStudent(
      student
    );

    setShowStudentModal(true);

    document.body.style.overflow =
      "hidden";
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeStudentDetails = () => {
    setSelectedStudent(
      null
    );

    setShowStudentModal(false);

    document.body.style.overflow =
      "";
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="results-management-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="results-management-header">

        <div>

          <div className="results-management-label">

            <span
              aria-hidden="true"
            />

            STG COLLEGE

            <b aria-hidden="true">
              /
            </b>

            RESULTS MANAGEMENT

          </div>

          <h1>

            Results

            <strong>
              Management
            </strong>

          </h1>

          <p>
            Monitor students, pass rate,
            failures and top academic
            performance from one place.
          </p>

        </div>

        <button
          className="results-refresh"
          type="button"
          onClick={() =>
            fetchResults(true)
          }
          disabled={
            refreshing
          }
          aria-label={
            refreshing
              ? "Refreshing results"
              : "Refresh results"
          }
        >

          <RefreshCw
            size={15}
            className={
              refreshing
                ? "loading-spin"
                : ""
            }
            aria-hidden="true"
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <section
          className="results-summary-grid"
          aria-label="Results summary"
        >

          {/* TOTAL STUDENTS */}

          <button
            type="button"
            className={
              `result-summary-card clickable-summary-card ${
                quickFilter ===
                "ALL"
                  ? "active-summary"
                  : ""
              }`
            }
            onClick={() =>
              handleQuickFilter(
                "ALL"
              )
            }
            aria-pressed={
              quickFilter === "ALL"
            }
          >

            <div className="result-summary-icon">
              <Users
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>

              <span>
                TOTAL STUDENTS
              </span>

              <strong>
                {resultsLoading
                  ? "—"
                  : totalStudents}
              </strong>

              <small>
                View all students
              </small>

            </div>

          </button>

          {/* PASS RATE */}

          <button
            type="button"
            className={
              `result-summary-card clickable-summary-card ${
                quickFilter ===
                "PASS"
                  ? "active-summary"
                  : ""
              }`
            }
            onClick={() =>
              handleQuickFilter(
                "PASS"
              )
            }
            aria-pressed={
              quickFilter === "PASS"
            }
          >

            <div className="result-summary-icon">
              <CheckCircle2
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>

              <span>
                PASS RATE
              </span>

              <strong>
                {resultsLoading
                  ? "—"
                  : `${passRate.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                {resultsLoading
                  ? "Loading..."
                  : `${passStudentCount} students passed`}
              </small>

            </div>

          </button>

          {/* FAIL */}

          <button
            type="button"
            className={
              `result-summary-card clickable-summary-card ${
                quickFilter ===
                "FAIL"
                  ? "active-summary"
                  : ""
              }`
            }
            onClick={() =>
              handleQuickFilter(
                "FAIL"
              )
            }
            aria-pressed={
              quickFilter === "FAIL"
            }
          >

            <div className="result-summary-icon">
              <XCircle
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>

              <span>
                FAIL STUDENTS
              </span>

              <strong>
                {resultsLoading
                  ? "—"
                  : failStudentCount}
              </strong>

              <small>
                View failed students
              </small>

            </div>

          </button>

          {/* HIGHEST SCORE */}

          <button
            type="button"
            className={
              `result-summary-card clickable-summary-card gold-card ${
                quickFilter ===
                "HIGHEST"
                  ? "active-summary"
                  : ""
              }`
            }
            onClick={() =>
              handleQuickFilter(
                "HIGHEST"
              )
            }
            aria-pressed={
              quickFilter ===
              "HIGHEST"
            }
          >

            <div className="result-summary-icon">
              <Trophy
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>

              <span>
                HIGHEST SCORE
              </span>

              <strong>
                {resultsLoading
                  ? "—"
                  : `${highestPercentage.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                View top scorer
              </small>

            </div>

          </button>

        </section>

        {/* ====================================================
            FILTER PANEL
        ==================================================== */}

        <section className="results-filter-panel">

          <div className="results-filter-header">

            <div>

              <span className="results-section-label">

                <Filter
                  size={13}
                  aria-hidden="true"
                />

                FILTER & SEARCH

              </span>

              <h2>
                Find Students
              </h2>

            </div>

            <button
              className="reset-results-filter"
              onClick={
                resetFilters
              }
              type="button"
            >
              Reset
            </button>

          </div>

          <div className="results-filter-grid">

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="results-filter-field search-field">

              <label htmlFor="results-student-search">
                Search Student
              </label>

              <div className="results-input-icon">

                <Search
                  size={15}
                  aria-hidden="true"
                />

                <input
                  id="results-student-search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Student name or ID..."
                  autoComplete="off"
                />

              </div>

            </div>

            {/* =================================================
                YEAR
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-year-filter">
                Year
              </label>

              <div className="results-select-wrap">

                <GraduationCap
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-year-filter"
                  value={
                    yearFilter
                  }
                  onChange={(e) =>
                    setYearFilter(
                      e.target.value
                    )
                  }
                  aria-label="Filter results by year"
                >

                  <option value="All">
                    All Years
                  </option>

                  {availableYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* =================================================
                EXAM
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-exam-filter">
                Exam
              </label>

              <div className="results-select-wrap">

                <FileText
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-exam-filter"
                  value={
                    examFilter
                  }
                  onChange={(e) =>
                    setExamFilter(
                      e.target.value
                    )
                  }
                  aria-label="Filter results by exam"
                >

                  <option value="All">
                    All Exams
                  </option>

                  {availableExams.map(
                    ([id, name]) => (
                      <option
                        key={id}
                        value={id}
                      >
                        {name}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* =================================================
                SECTION
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-section-filter">
                Section
              </label>

              <div className="results-select-wrap">

                <Users
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-section-filter"
                  value={
                    sectionFilter
                  }
                  onChange={(e) =>
                    setSectionFilter(
                      e.target.value
                    )
                  }
                  aria-label="Filter results by section"
                >

                  <option value="All">
                    All Sections
                  </option>

                  {availableSections.map(
                    (section) => (
                      <option
                        key={section}
                        value={section}
                      >
                        Section{" "}
                        {section}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* =================================================
                SUBJECT
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-subject-filter">
                Subject
              </label>

              <div className="results-select-wrap">

                <FileText
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-subject-filter"
                  value={
                    subjectFilter
                  }
                  onChange={(e) =>
                    setSubjectFilter(
                      e.target.value
                    )
                  }
                  aria-label="Filter results by subject"
                >

                  <option value="All">
                    All Subjects
                  </option>

                  {availableSubjects.map(
                    (subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* =================================================
                TEST TYPE
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-test-type-filter">
                Test Type
              </label>

              <div className="results-select-wrap">

                <ClipboardList
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-test-type-filter"
                  value={
                    categoryFilter
                  }
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                  aria-label="Filter results by test type"
                >

                  <option value="All">
                    All Test Types
                  </option>

                  {availableCategories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* =================================================
                SORT
            ================================================= */}

            <div className="results-filter-field">

              <label htmlFor="results-sort-filter">
                Sort By
              </label>

              <div className="results-select-wrap">

                <TrendingUp
                  size={14}
                  aria-hidden="true"
                />

                <select
                  id="results-sort-filter"
                  value={
                    sortBy
                  }
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                  aria-label="Sort students"
                >

                  <option value="latest">
                    Latest Activity
                  </option>

                  <option value="highest">
                    Highest Score
                  </option>

                  <option value="lowest">
                    Lowest Average
                  </option>

                  <option value="name">
                    Student Name
                  </option>

                </select>

                <ChevronDown
                  size={13}
                  aria-hidden="true"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            LIST SUMMARY
        ==================================================== */}

        <section
          className="filtered-overview"
          aria-label="Filtered result overview"
        >

          <div>

            <span>
              STUDENTS
            </span>

            <strong>
              {resultsLoading
                ? "—"
                : displayedStudents.length}
            </strong>

          </div>

          <div>

            <span>
              PASS
            </span>

            <strong className="green-number">
              {resultsLoading
                ? "—"
                : displayedPassCount}
            </strong>

          </div>

          <div>

            <span>
              FAIL
            </span>

            <strong className="red-number">
              {resultsLoading
                ? "—"
                : displayedFailCount}
            </strong>

          </div>

          <div>

            <span>
              AVERAGE
            </span>

            <strong>
              {resultsLoading
                ? "—"
                : `${displayedAverage}%`}
            </strong>

          </div>

          <div>

            <span>
              HIGHEST
            </span>

            <strong>
              {resultsLoading
                ? "—"
                : `${displayedHighest}%`}
            </strong>

          </div>

        </section>

        {/* ====================================================
            STUDENT LIST
        ==================================================== */}

        <section
          className="results-table-section"
          aria-labelledby="student-performance-heading"
        >

          <div className="results-table-heading">

            <div>

              <span className="results-section-label">

                <Users
                  size={13}
                  aria-hidden="true"
                />

                STUDENT LIST

              </span>

              <h2 id="student-performance-heading">
                Student Performance
              </h2>

            </div>

            <span className="result-count-badge">

              {resultsLoading
                ? "Loading..."
                : `${displayedStudents.length} students`}

            </span>

          </div>

          {/* ==================================================
              DATA LOADING
          ================================================== */}

          {resultsLoading ? (

            <div
              className="results-empty"
              aria-live="polite"
              aria-busy="true"
            >

              <div className="results-empty-icon">

                <RefreshCw
                  size={24}
                  className="loading-spin"
                  aria-hidden="true"
                />

              </div>

              <h3>
                Loading Results
              </h3>

              <p>
                Preparing student performance data...
              </p>

            </div>

          ) : displayedStudents.length ===
            0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="results-empty">

              <div className="results-empty-icon">

                <Users
                  size={24}
                  aria-hidden="true"
                />

              </div>

              <h3>
                No Students Found
              </h3>

              <p>
                No students match the
                selected filters.
              </p>

            </div>

          ) : (

            /* ==================================================
               TABLE
            ================================================== */

            <div className="results-table-wrap">

              <div
                className="results-table student-management-table"
                role="table"
                aria-label="Student performance results"
              >

                {/* TABLE HEADER */}

                <div
                  className="results-row results-table-head"
                  role="row"
                >

                  <div role="columnheader">
                    STUDENT
                  </div>

                  <div role="columnheader">
                    EXAMS
                  </div>

                  <div role="columnheader">
                    AVERAGE
                  </div>

                  <div role="columnheader">
                    HIGHEST
                  </div>

                  <div role="columnheader">
                    PASS / FAIL
                  </div>

                  <div role="columnheader">
                    STATUS
                  </div>

                  <div role="columnheader">
                    MORE
                  </div>

                </div>

                {/* STUDENTS */}

                {displayedStudents.map(
                  (student) => (

                    <div
                      className="results-row student-result-row"
                      key={
                        student.studentId
                      }
                      role="row"
                    >

                      {/* STUDENT */}

                      <div
                        className="result-student-cell"
                        role="cell"
                      >

                        <div
                          className="result-student-avatar"
                          aria-hidden="true"
                        >

                          <Users
                            size={15}
                          />

                        </div>

                        <div>

                          <strong>
                            {
                              student.studentName
                            }
                          </strong>

                          <span>
                            {
                              student.studentId
                            }
                          </span>

                          <small className="student-class-meta">

                            {
                              student.className ||
                              student.year ||
                              "N/A"
                            }

                            {student.section
                              ? ` • ${student.section}`
                              : ""}

                          </small>

                        </div>

                      </div>

                      {/* EXAMS */}

                      <div role="cell">

                        <strong className="student-exam-count">

                          {
                            student.totalExams
                          }

                        </strong>

                        <span className="table-muted">

                          {
                            student.totalExams ===
                            1
                              ? "Exam"
                              : "Exams"
                          }

                        </span>

                      </div>

                      {/* AVERAGE */}

                      <div role="cell">

                        <div className="student-score-main">

                          <strong>

                            {
                              student.averagePercentage.toFixed(
                                1
                              )
                            }%

                          </strong>

                          <div
                            className="percentage-bar"
                            aria-label={`Average ${student.averagePercentage.toFixed(
                              1
                            )}%`}
                          >

                            <span
                              style={{
                                width:
                                  `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      student.averagePercentage
                                    )
                                  )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                      {/* HIGHEST */}

                      <div role="cell">

                        <div className="student-highest-cell">

                          <Trophy
                            size={14}
                            aria-hidden="true"
                          />

                          <strong>

                            {
                              student.highestPercentage.toFixed(
                                1
                              )
                            }%

                          </strong>

                        </div>

                      </div>

                      {/* PASS / FAIL */}

                      <div role="cell">

                        <div className="student-pass-fail-count">

                          <span className="student-pass-mini">

                            <CheckCircle2
                              size={12}
                              aria-hidden="true"
                            />

                            {
                              student.passCount
                            }

                          </span>

                          <span className="student-fail-mini">

                            <XCircle
                              size={12}
                              aria-hidden="true"
                            />

                            {
                              student.failCount
                            }

                          </span>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div role="cell">

                        <span
                          className={
                            student.overallStatus ===
                            "PASS"
                              ? "result-status pass"
                              : "result-status fail"
                          }
                        >

                          {student.overallStatus ===
                          "PASS" ? (

                            <CheckCircle2
                              size={12}
                              aria-hidden="true"
                            />

                          ) : (

                            <XCircle
                              size={12}
                              aria-hidden="true"
                            />

                          )}

                          {
                            student.overallStatus
                          }

                        </span>

                      </div>

                      {/* MORE */}

                      <div role="cell">

                        <button
                          type="button"
                          className="student-more-btn"
                          onClick={() =>
                            openStudentDetails(
                              student
                            )
                          }
                          aria-label={`View more details for ${student.studentName}`}
                        >

                          <span>
                            More
                          </span>

                          <MoreHorizontal
                            size={15}
                            aria-hidden="true"
                          />

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </section>

      </main>

      {/* ======================================================
          MORE MODAL
      ====================================================== */}

      {showStudentModal &&
      selectedStudent ? (

        <div
          className="student-details-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeStudentDetails();
            }

          }}
          role="presentation"
        >

          <div
            className="student-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-details-title"
          >

            {/* MODAL HEADER */}

            <div className="student-details-header">

              <div className="student-details-profile">

                <div
                  className="student-details-avatar"
                  aria-hidden="true"
                >

                  <Users
                    size={21}
                  />

                </div>

                <div>

                  <div className="student-details-label">
                    STUDENT PERFORMANCE
                  </div>

                  <h2 id="student-details-title">
                    {
                      selectedStudent.studentName
                    }
                  </h2>

                  <p>

                    {
                      selectedStudent.studentId
                    }

                    {selectedStudent.className ||
                    selectedStudent.year
                      ? ` • ${
                          selectedStudent.className ||
                          selectedStudent.year
                        }`
                      : ""}

                    {selectedStudent.section
                      ? ` • Section ${selectedStudent.section}`
                      : ""}

                  </p>

                </div>

              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={
                  closeStudentDetails
                }
                aria-label="Close student performance details"
              >

                <X
                  size={19}
                  aria-hidden="true"
                />

              </button>

            </div>

            {/* SUMMARY */}

            <div className="student-details-summary">

              {/* TOTAL EXAMS */}

              <div className="student-detail-summary-card">

                <div>

                  <ClipboardList
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    TOTAL EXAMS
                  </span>

                </div>

                <strong>
                  {
                    selectedStudent.totalExams
                  }
                </strong>

              </div>

              {/* AVERAGE */}

              <div className="student-detail-summary-card">

                <div>

                  <BarChart3
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    AVERAGE
                  </span>

                </div>

                <strong>
                  {
                    selectedStudent.averagePercentage.toFixed(
                      1
                    )
                  }%
                </strong>

              </div>

              {/* HIGHEST */}

              <div className="student-detail-summary-card">

                <div>

                  <Trophy
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    HIGHEST
                  </span>

                </div>

                <strong>
                  {
                    selectedStudent.highestPercentage.toFixed(
                      1
                    )
                  }%
                </strong>

              </div>

              {/* PASSED */}

              <div className="student-detail-summary-card">

                <div>

                  <CheckCircle2
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    PASSED EXAMS
                  </span>

                </div>

                <strong className="modal-pass-text">
                  {
                    selectedStudent.passCount
                  }
                </strong>

              </div>

              {/* FAILED */}

              <div className="student-detail-summary-card">

                <div>

                  <XCircle
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    FAILED EXAMS
                  </span>

                </div>

                <strong className="modal-fail-text">
                  {
                    selectedStudent.failCount
                  }
                </strong>

              </div>

            </div>

            {/* FOOTER */}

            <div className="student-details-footer">

              <div>

                <span>
                  Overall Status
                </span>

                <strong>
                  {
                    selectedStudent.overallStatus
                  }
                </strong>

              </div>

              <button
                type="button"
                className="student-modal-done"
                onClick={
                  closeStudentDetails
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      ) : null}

    </div>
  );
}