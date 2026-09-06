import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Search,
  UserRound,
  X,
} from "lucide-react";

import "./StudentManagement.css";

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://exammaster-backend-up1y.onrender.com/api";

// ============================================================
// TYPES
// ============================================================

type FeedbackStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "ESCALATED";

type Department =
  | "management"
  | "hostel"
  | "physical-education";

interface MentorEvaluation {
  attendance: number;
  subjectUnderstanding: number;
  examPerformance: number;
  homeworkCompletion: number;
  learningInterest: number;
  averageRating: number;
}

interface DepartmentFeedback {
  _id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  section: string;

  mentorEvaluation?: MentorEvaluation;

  mentorActionPlan?: string;

  originalDepartment?: Department;
  assignedDepartment?: Department;

  status: FeedbackStatus;

  assignedAt?: string;
  resolvedAt?: string | null;
  escalatedAt?: string | null;

  escalationReason?: string;

  managementActionPlan?: string;
  hostelActionPlan?: string;
  physicalEducationActionPlan?: string;

  updatedBy?: string;
  updatedByRole?: string;

  resolvedBy?: string;
  resolvedByRole?: string;

  createdAt: string;
  updatedAt: string;
}

interface ManagementStudent {
  _id: string;

  studentId: string;
  studentName: string;

  classId: string;
  className: string;
  section: string;

  status: FeedbackStatus;

  assignedDepartment?: Department;
  originalDepartment?: Department;

  mentorActionPlan?: string;

  averageRating: number;

  assignedAt?: string;
  escalatedAt?: string | null;
  resolvedAt?: string | null;

  escalationReason?: string;

  managementActionPlan?: string;

  updatedBy?: string;
  updatedByRole?: string;

  resolvedBy?: string;
  resolvedByRole?: string;
}

// ============================================================
// HELPERS
// ============================================================

const formatDepartment = (
  department?: Department
) => {
  if (!department) {
    return "Management";
  }

  if (department === "hostel") {
    return "Hostel Warden";
  }

  if (
    department ===
    "physical-education"
  ) {
    return "Physical Education";
  }

  return "Management";
};

// ============================================================

const formatDate = (
  date?: string | null
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================

const formatDateTime = (
  date?: string | null
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ============================================================

const getStatusLabel = (
  status: FeedbackStatus
) => {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "IN_PROGRESS":
      return "In Progress";

    case "ESCALATED":
      return "Escalated";

    case "RESOLVED":
      return "Resolved";

    default:
      return status;
  }
};

// ============================================================
// COMPONENT
// ============================================================

export default function StudentManagement() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    students,
    setStudents,
  ] = useState<ManagementStudent[]>(
    []
  );

  // IMPORTANT:
  // This loading state only controls the student data area.
  // It does NOT block the whole page.
  const [
    studentsLoading,
    setStudentsLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "ALL" | FeedbackStatus
  >("ALL");

  const [
    selectedStudent,
    setSelectedStudent,
  ] =
    useState<ManagementStudent | null>(
      null
    );

  // ==========================================================
  // RESOLVE MODAL STATE
  // ==========================================================

  const [
    showResolveModal,
    setShowResolveModal,
  ] = useState(false);

  const [
    resolutionNote,
    setResolutionNote,
  ] = useState("");

  const [
    resolving,
    setResolving,
  ] = useState(false);

  const [
    resolveError,
    setResolveError,
  ] = useState("");

  // ==========================================================
  // FETCH ON LOAD
  // ==========================================================

  useEffect(() => {
    fetchManagementStudents();
  }, []);

  // ==========================================================
  // FETCH MANAGEMENT CASES
  // ==========================================================

  const fetchManagementStudents =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "teacherToken"
          ) ||
          localStorage.getItem(
            "staffToken"
          );

        if (!token) {
          navigate("/teacher/login", {
            replace: true,
          });

          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/department-feedback/department/management`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
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

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "teacherToken"
          );

          localStorage.removeItem(
            "staffToken"
          );

          navigate(
            "/teacher/login?session=expired",
            {
              replace: true,
            }
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch management cases."
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load management cases."
          );
        }

        const feedbackList =
          Array.isArray(
            data.feedback
          )
            ? data.feedback
            : [];

        const mappedStudents:
          ManagementStudent[] =
          feedbackList.map(
            (
              feedback: DepartmentFeedback
            ) => ({
              _id:
                feedback._id,

              studentId:
                feedback.studentId,

              studentName:
                feedback.studentName,

              classId:
                feedback.classId,

              className:
                feedback.className,

              section:
                feedback.section,

              status:
                feedback.status,

              assignedDepartment:
                feedback.assignedDepartment,

              originalDepartment:
                feedback.originalDepartment,

              mentorActionPlan:
                feedback.mentorActionPlan,

              averageRating:
                Number(
                  feedback
                    .mentorEvaluation
                    ?.averageRating ??
                    0
                ),

              assignedAt:
                feedback.assignedAt,

              escalatedAt:
                feedback.escalatedAt,

              resolvedAt:
                feedback.resolvedAt,

              escalationReason:
                feedback.escalationReason,

              managementActionPlan:
                feedback.managementActionPlan,

              updatedBy:
                feedback.updatedBy,

              updatedByRole:
                feedback.updatedByRole,

              resolvedBy:
                feedback.resolvedBy,

              resolvedByRole:
                feedback.resolvedByRole,
            })
          );

        setStudents(
          mappedStudents
        );
      } catch (error) {
        console.error(
          "Management student fetch error:",
          error
        );

        setStudents([]);
      } finally {
        setStudentsLoading(
          false
        );
      }
    };

  // ==========================================================
  // OPEN RESOLVE MODAL
  // ==========================================================

  const openResolveModal = () => {
    if (!selectedStudent) {
      return;
    }

    if (
      selectedStudent.status ===
      "RESOLVED"
    ) {
      return;
    }

    setResolutionNote(
      selectedStudent.managementActionPlan ||
        ""
    );

    setResolveError("");

    setShowResolveModal(true);
  };

  // ==========================================================
  // CLOSE RESOLVE MODAL
  // ==========================================================

  const closeResolveModal = () => {
    if (resolving) {
      return;
    }

    setShowResolveModal(false);
    setResolutionNote("");
    setResolveError("");
  };

  // ==========================================================
  // RESOLVE MANAGEMENT CASE
  // ==========================================================

  const handleResolveCase =
    async () => {
      if (!selectedStudent) {
        setResolveError(
          "No student case is selected."
        );

        return;
      }

      const trimmedNote =
        resolutionNote.trim();

      if (!trimmedNote) {
        setResolveError(
          "Please enter how this case was resolved."
        );

        return;
      }

      if (
        trimmedNote.length < 5
      ) {
        setResolveError(
          "Please provide a little more detail about the resolution."
        );

        return;
      }

      try {
        setResolving(true);
        setResolveError("");

        const token =
          localStorage.getItem(
            "teacherToken"
          ) ||
          localStorage.getItem(
            "staffToken"
          );

        if (!token) {
          setResolveError(
            "Staff login session expired. Please login again."
          );

          navigate(
            "/teacher/login",
            {
              replace: true,
            }
          );

          return;
        }

        const resolveUrl =
          `${API_BASE_URL}/department-feedback/student/${selectedStudent.studentId}/resolve`;

        const response =
          await fetch(
            resolveUrl,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                managementActionPlan:
                  trimmedNote,

                actionPlan:
                  trimmedNote,
              }),
            }
          );

        let data: any = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "teacherToken"
          );

          localStorage.removeItem(
            "staffToken"
          );

          navigate(
            "/teacher/login?session=expired",
            {
              replace: true,
            }
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Resolve failed with status ${response.status}.`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to resolve management case."
          );
        }

        const returnedFeedback =
          data?.feedback || {};

        const updatedStudent:
          ManagementStudent = {
            ...selectedStudent,

            status:
              "RESOLVED",

            managementActionPlan:
              returnedFeedback
                ?.managementActionPlan ||
              trimmedNote,

            resolvedAt:
              returnedFeedback
                ?.resolvedAt ||
              new Date().toISOString(),

            resolvedBy:
              returnedFeedback
                ?.resolvedBy,

            resolvedByRole:
              returnedFeedback
                ?.resolvedByRole,

            updatedBy:
              returnedFeedback
                ?.updatedBy,

            updatedByRole:
              returnedFeedback
                ?.updatedByRole,
          };

        setStudents(
          (
            previousStudents
          ) =>
            previousStudents.map(
              (student) =>
                student.studentId ===
                selectedStudent.studentId
                  ? updatedStudent
                  : student
            )
        );

        setSelectedStudent(
          updatedStudent
        );

        setShowResolveModal(
          false
        );

        setResolutionNote("");
        setResolveError("");
      } catch (error) {
        console.error(
          "Management resolve error:",
          error
        );

        setResolveError(
          error instanceof Error
            ? error.message
            : "Failed to resolve management case."
        );
      } finally {
        setResolving(false);
      }
    };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return students.filter(
        (student) => {
          const matchesSearch =
            !normalizedSearch ||
            student.studentName
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            student.studentId
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            student.className
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            student.section
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            student.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      students,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const pendingCount =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.status ===
            "PENDING"
        ).length,
      [students]
    );

  const inProgressCount =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.status ===
            "IN_PROGRESS"
        ).length,
      [students]
    );

  const escalatedCount =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.status ===
            "ESCALATED"
        ).length,
      [students]
    );

  const resolvedCount =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.status ===
            "RESOLVED"
        ).length,
      [students]
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="student-management-container">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="sm-header-box">

        <div className="sm-header-left">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/teacher/dashboard"
              )
            }
            className="sm-back-btn"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="sm-heading-row">

            <div
              className="sm-heading-icon"
              aria-hidden="true"
            >
              <Building2 size={25} />
            </div>

            <div>

              <div className="sm-eyebrow">
                MANAGEMENT DASHBOARD
              </div>

              <h1 className="sm-title">
                Student Management
              </h1>

              <p className="sm-subtitle">
                Mentor-submitted student
                cases assigned to Management.
              </p>

            </div>

          </div>

        </div>

        <div
          className="sm-live-indicator"
          aria-label="Live management cases"
        >

          <span
            className="sm-live-dot"
            aria-hidden="true"
          />

          Live Cases

        </div>

      </header>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <section className="sm-summary-grid">

          {/* TOTAL */}

          <button
            type="button"
            className={`sm-summary-card ${
              statusFilter ===
              "ALL"
                ? "sm-summary-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                "ALL"
              )
            }
            aria-pressed={
              statusFilter === "ALL"
            }
          >

            <div className="sm-summary-icon sm-summary-icon-total">
              <UserRound size={19} />
            </div>

            <div className="sm-summary-content">

              <span>
                Total Cases
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : students.length}
              </strong>

              <small>
                Mentor submissions
              </small>

            </div>

          </button>

          {/* PENDING */}

          <button
            type="button"
            className={`sm-summary-card ${
              statusFilter ===
              "PENDING"
                ? "sm-summary-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                "PENDING"
              )
            }
            aria-pressed={
              statusFilter ===
              "PENDING"
            }
          >

            <div className="sm-summary-icon sm-summary-icon-pending">
              <Clock3 size={19} />
            </div>

            <div className="sm-summary-content">

              <span>
                Pending
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : pendingCount}
              </strong>

              <small>
                Waiting for action
              </small>

            </div>

          </button>

          {/* IN PROGRESS */}

          <button
            type="button"
            className={`sm-summary-card ${
              statusFilter ===
              "IN_PROGRESS"
                ? "sm-summary-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                "IN_PROGRESS"
              )
            }
            aria-pressed={
              statusFilter ===
              "IN_PROGRESS"
            }
          >

            <div className="sm-summary-icon sm-summary-icon-progress">
              <Clock3 size={19} />
            </div>

            <div className="sm-summary-content">

              <span>
                In Progress
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : inProgressCount}
              </strong>

              <small>
                Currently processing
              </small>

            </div>

          </button>

          {/* ESCALATED */}

          <button
            type="button"
            className={`sm-summary-card ${
              statusFilter ===
              "ESCALATED"
                ? "sm-summary-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                "ESCALATED"
              )
            }
            aria-pressed={
              statusFilter ===
              "ESCALATED"
            }
          >

            <div className="sm-summary-icon sm-summary-icon-escalated">
              <AlertCircle size={19} />
            </div>

            <div className="sm-summary-content">

              <span>
                Escalated
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : escalatedCount}
              </strong>

              <small>
                Requires management
              </small>

            </div>

          </button>

          {/* RESOLVED */}

          <button
            type="button"
            className={`sm-summary-card ${
              statusFilter ===
              "RESOLVED"
                ? "sm-summary-card-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                "RESOLVED"
              )
            }
            aria-pressed={
              statusFilter ===
              "RESOLVED"
            }
          >

            <div className="sm-summary-icon sm-summary-icon-resolved">
              <CheckCircle2 size={19} />
            </div>

            <div className="sm-summary-content">

              <span>
                Resolved
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : resolvedCount}
              </strong>

              <small>
                Completed cases
              </small>

            </div>

          </button>

        </section>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <section
          className="sm-toolbar"
          aria-label="Student case search"
        >

          <div className="sm-search-box">

            <Search
              size={18}
              className="sm-search-icon"
              aria-hidden="true"
            />

            <input
              type="text"
              placeholder="Search by student name, ID, class or section..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="sm-search-input"
              aria-label="Search by student name, ID, class or section"
              disabled={
                studentsLoading
              }
            />

            {search && (
              <button
                type="button"
                className="sm-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear student search"
              >
                <X
                  size={15}
                />
              </button>
            )}

          </div>

          <div
            className="sm-result-count"
            aria-live="polite"
          >

            Showing{" "}

            <strong>
              {studentsLoading
                ? "—"
                : filteredStudents.length}
            </strong>

            {" "}of{" "}

            <strong>
              {studentsLoading
                ? "—"
                : students.length}
            </strong>

            {" "}cases

          </div>

        </section>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <section
          className="sm-table-card"
          aria-labelledby="management-cases-heading"
        >

          <div className="sm-table-header">

            <div>

              <div className="sm-table-eyebrow">
                MANAGEMENT CASES
              </div>

              <h2 id="management-cases-heading">
                Mentor Submitted Students
              </h2>

            </div>

            <div className="sm-table-status">

              <span
                className="sm-table-status-dot"
                aria-hidden="true"
              />

              Auto-updated

            </div>

          </div>

          {/* ==================================================
              INITIAL LOADING
          ================================================== */}

          {studentsLoading ? (

            <div
              className="sm-empty-state"
              aria-live="polite"
              aria-busy="true"
            >

              <div className="sm-empty-icon">
                <Clock3 size={27} />
              </div>

              <h3>
                Loading Management Cases
              </h3>

              <p>
                Fetching mentor-submitted
                student records...
              </p>

            </div>

          ) : filteredStudents.length ===
            0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="sm-empty-state">

              <div className="sm-empty-icon">
                <CheckCircle2 size={27} />
              </div>

              <h3>
                No Management Cases
              </h3>

              <p>

                {search
                  ? "No mentor-submitted student matches your search."
                  : statusFilter !==
                    "ALL"
                  ? `No ${getStatusLabel(
                      statusFilter
                    ).toLowerCase()} cases available.`
                  : "No mentor-submitted cases have been assigned to Management yet."}

              </p>

              {(search ||
                statusFilter !==
                  "ALL") && (

                <button
                  type="button"
                  className="sm-reset-btn"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "ALL"
                    );
                  }}
                >
                  Clear Filters
                </button>

              )}

            </div>

          ) : (

            /* ==================================================
               DATA
            ================================================== */

            <>

              {/* ================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="sm-table-wrapper">

                <table className="sm-table">

                  <thead>

                    <tr>

                      <th scope="col">
                        Student
                      </th>

                      <th scope="col">
                        Class
                      </th>

                      <th scope="col">
                        Mentor Rating
                      </th>

                      <th scope="col">
                        Original Department
                      </th>

                      <th scope="col">
                        Status
                      </th>

                      <th scope="col">
                        Assigned
                      </th>

                      <th scope="col">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (student) => (

                        <tr
                          key={
                            student._id
                          }
                        >

                          {/* STUDENT */}

                          <td>

                            <div className="sm-student-cell">

                              <div
                                className="sm-avatar"
                                aria-hidden="true"
                              >
                                {student.studentName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
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

                              </div>

                            </div>

                          </td>

                          {/* CLASS */}

                          <td>

                            <div className="sm-class-cell">

                              <strong>
                                {
                                  student.className
                                }
                              </strong>

                              <span>
                                Section{" "}
                                {
                                  student.section
                                }
                              </span>

                            </div>

                          </td>

                          {/* RATING */}

                          <td>

                            <div
                              className="sm-rating"
                              aria-label={`Mentor rating ${student.averageRating.toFixed(
                                1
                              )} out of 5`}
                            >

                              <strong>
                                {
                                  student.averageRating.toFixed(
                                    1
                                  )
                                }
                              </strong>

                              <span>
                                / 5
                              </span>

                            </div>

                          </td>

                          {/* ORIGINAL DEPARTMENT */}

                          <td>

                            {student.originalDepartment ? (

                              <div className="sm-origin-badge">

                                {
                                  formatDepartment(
                                    student.originalDepartment
                                  )
                                }

                              </div>

                            ) : (

                              <span className="sm-muted">
                                Direct Management
                              </span>

                            )}

                          </td>

                          {/* STATUS */}

                          <td>

                            <div
                              className={`sm-status-badge sm-status-${student.status.toLowerCase()}`}
                            >

                              {student.status ===
                                "PENDING" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {student.status ===
                                "IN_PROGRESS" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {student.status ===
                                "ESCALATED" && (
                                <AlertCircle
                                  size={13}
                                />
                              )}

                              {student.status ===
                                "RESOLVED" && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                              {
                                getStatusLabel(
                                  student.status
                                )
                              }

                            </div>

                          </td>

                          {/* DATE */}

                          <td>

                            <span className="sm-date">

                              {formatDate(
                                student.assignedAt
                              )}

                            </span>

                            {student.status ===
                              "ESCALATED" &&
                              student.escalatedAt && (

                              <small className="sm-escalated-date">

                                Escalated{" "}

                                {formatDate(
                                  student.escalatedAt
                                )}

                              </small>

                            )}

                            {student.status ===
                              "RESOLVED" &&
                              student.resolvedAt && (

                              <small className="sm-resolved-date">

                                Resolved{" "}

                                {formatDate(
                                  student.resolvedAt
                                )}

                              </small>

                            )}

                          </td>

                          {/* ACTION */}

                          <td>

                            <button
                              type="button"
                              className="sm-action-btn"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              aria-label={`View case for ${student.studentName}`}
                            >
                              View Case
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* ================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="sm-mobile-list">

                {filteredStudents.map(
                  (student) => (

                    <article
                      key={
                        `mobile-${student._id}`
                      }
                      className="sm-mobile-card"
                    >

                      <div className="sm-mobile-top">

                        <div className="sm-student-cell">

                          <div
                            className="sm-avatar"
                            aria-hidden="true"
                          >
                            {student.studentName
                              .charAt(
                                0
                              )
                              .toUpperCase()}
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

                          </div>

                        </div>

                        <div
                          className={`sm-status-badge sm-status-${student.status.toLowerCase()}`}
                        >
                          {
                            getStatusLabel(
                              student.status
                            )
                          }
                        </div>

                      </div>

                      <div className="sm-mobile-details">

                        <div>

                          <span>
                            Class
                          </span>

                          <strong>
                            {
                              student.className
                            }{" "}
                            -{" "}
                            {
                              student.section
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Mentor Rating
                          </span>

                          <strong>
                            {
                              student.averageRating.toFixed(
                                1
                              )
                            }
                            /5
                          </strong>

                        </div>

                        <div>

                          <span>
                            Assigned
                          </span>

                          <strong>
                            {formatDate(
                              student.assignedAt
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Source
                          </span>

                          <strong>
                            {
                              student.originalDepartment
                                ? formatDepartment(
                                    student.originalDepartment
                                  )
                                : "Management"
                            }
                          </strong>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="sm-action-btn sm-mobile-action"
                        onClick={() =>
                          setSelectedStudent(
                            student
                          )
                        }
                        aria-label={`View case for ${student.studentName}`}
                      >
                        View Case
                      </button>

                    </article>

                  )
                )}

              </div>

            </>

          )}

        </section>

      </main>

      {/* ======================================================
          CASE MODAL
          ====================================================== */}

      {selectedStudent && (
        <div
          className="sm-modal-overlay"
          onMouseDown={() => {
            if (!showResolveModal) {
              setSelectedStudent(
                null
              );
            }
          }}
          role="presentation"
        >

          <div
            className="sm-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-case-title"
          >

            {/* HEADER */}

            <div className="sm-modal-header">

              <div className="sm-modal-heading">

                <div
                  className="sm-modal-avatar"
                  aria-hidden="true"
                >
                  {selectedStudent.studentName
                    .charAt(
                      0
                    )
                    .toUpperCase()}
                </div>

                <div>

                  <div className="sm-eyebrow">
                    STUDENT CASE
                  </div>

                  <h2 id="student-case-title">
                    {
                      selectedStudent.studentName
                    }
                  </h2>

                  <span>
                    {
                      selectedStudent.studentId
                    }
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="sm-modal-close"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
                aria-label="Close student case"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="sm-modal-body">

              {/* BASIC */}

              <div className="sm-modal-grid">

                <div className="sm-modal-stat">

                  <span>
                    Class
                  </span>

                  <strong>
                    {
                      selectedStudent.className
                    }
                  </strong>

                </div>

                <div className="sm-modal-stat">

                  <span>
                    Section
                  </span>

                  <strong>
                    {
                      selectedStudent.section
                    }
                  </strong>

                </div>

                <div className="sm-modal-stat">

                  <span>
                    Mentor Rating
                  </span>

                  <strong>
                    {
                      selectedStudent.averageRating.toFixed(
                        1
                      )
                    }
                    /5
                  </strong>

                </div>

                <div className="sm-modal-stat">

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      getStatusLabel(
                        selectedStudent.status
                      )
                    }
                  </strong>

                </div>

              </div>

              {/* ROUTING */}

              <div className="sm-case-routing">

                <div>

                  <span>
                    Original Department
                  </span>

                  <strong>
                    {
                      selectedStudent.originalDepartment
                        ? formatDepartment(
                            selectedStudent.originalDepartment
                          )
                        : "Management"
                    }
                  </strong>

                </div>

                <div
                  className="sm-route-arrow"
                  aria-hidden="true"
                >
                  →
                </div>

                <div>

                  <span>
                    Current Department
                  </span>

                  <strong>
                    {
                      formatDepartment(
                        selectedStudent.assignedDepartment
                      )
                    }
                  </strong>

                </div>

              </div>

              {/* ESCALATION */}

              {selectedStudent.status ===
                "ESCALATED" && (

                <div
                  className="sm-escalation-box"
                  role="alert"
                >

                  <AlertCircle
                    size={18}
                  />

                  <div>

                    <strong>
                      Escalated to Management
                    </strong>

                    <p>
                      {
                        selectedStudent
                          .escalationReason ||
                        "This case was escalated because it was not resolved within the allowed period."
                      }
                    </p>

                  </div>

                </div>

              )}

              {/* MENTOR ACTION PLAN */}

              <div className="sm-case-section">

                <div className="sm-case-section-heading">

                  <div className="sm-case-section-icon">
                    <Building2
                      size={17}
                    />
                  </div>

                  <div>

                    <span>
                      MENTOR SUBMISSION
                    </span>

                    <h3>
                      Mentor Action Plan
                    </h3>

                  </div>

                </div>

                <div className="sm-action-plan-box">

                  {selectedStudent
                    .mentorActionPlan ? (

                    selectedStudent.mentorActionPlan

                  ) : (

                    <span className="sm-muted">
                      No mentor action plan
                      available.
                    </span>

                  )}

                </div>

              </div>

              {/* MANAGEMENT RESOLUTION */}

              {selectedStudent.status ===
                "RESOLVED" && (

                <div className="sm-case-section">

                  <div className="sm-case-section-heading">

                    <div className="sm-case-section-icon">

                      <CheckCircle2
                        size={17}
                      />

                    </div>

                    <div>

                      <span>
                        MANAGEMENT RESOLUTION
                      </span>

                      <h3>
                        How This Case Was Resolved
                      </h3>

                    </div>

                  </div>

                  <div className="sm-resolution-display">

                    <p>

                      {
                        selectedStudent
                          .managementActionPlan ||
                        "No resolution details available."
                      }

                    </p>

                    <div className="sm-resolution-meta">

                      <span>
                        Resolved on
                      </span>

                      <strong>
                        {
                          formatDateTime(
                            selectedStudent.resolvedAt
                          )
                        }
                      </strong>

                    </div>

                    {selectedStudent.resolvedBy && (

                      <div className="sm-resolution-meta">

                        <span>
                          Resolved by
                        </span>

                        <strong>
                          {
                            selectedStudent.resolvedBy
                          }
                        </strong>

                      </div>

                    )}

                    {selectedStudent.resolvedByRole && (

                      <div className="sm-resolution-meta">

                        <span>
                          Role
                        </span>

                        <strong>
                          {
                            selectedStudent.resolvedByRole
                          }
                        </strong>

                      </div>

                    )}

                  </div>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="sm-modal-footer">

              <button
                type="button"
                className="sm-secondary-btn"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >
                Close
              </button>

              {selectedStudent.status !==
                "RESOLVED" && (

                <button
                  type="button"
                  className="sm-resolve-btn"
                  onClick={
                    openResolveModal
                  }
                  disabled={
                    resolving
                  }
                  aria-label="Resolve this student case"
                >

                  <CheckCircle2
                    size={16}
                  />

                  {resolving
                    ? "Resolving..."
                    : "Resolve Case"}

                </button>

              )}

              <button
                type="button"
                className="sm-action-btn"
                onClick={() => {
                  navigate(
                    `/mentor/student/${selectedStudent.studentId}`
                  );
                }}
              >
                Open Progress Card
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          RESOLVE MODAL
          ====================================================== */}

      {showResolveModal &&
        selectedStudent && (

        <div
          className="sm-resolve-overlay"
          onMouseDown={closeResolveModal}
          role="presentation"
        >

          <div
            className="sm-resolve-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-case-title"
          >

            {/* HEADER */}

            <div className="sm-resolve-header">

              <div>

                <div className="sm-resolve-eyebrow">
                  CASE RESOLUTION
                </div>

                <h2 id="resolve-case-title">
                  Resolve Student Case
                </h2>

                <p>
                  Record exactly how Management
                  handled and resolved this case.
                </p>

              </div>

              <button
                type="button"
                className="sm-resolve-close"
                onClick={
                  closeResolveModal
                }
                disabled={
                  resolving
                }
                aria-label="Close resolution dialog"
              >
                <X size={20} />
              </button>

            </div>

            {/* STUDENT */}

            <div className="sm-resolve-student">

              <div
                className="sm-resolve-student-avatar"
                aria-hidden="true"
              >
                {selectedStudent.studentName
                  .charAt(
                    0
                  )
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {
                    selectedStudent.studentName
                  }
                </strong>

                <span>

                  {
                    selectedStudent.studentId
                  }

                  {" • "}

                  {
                    selectedStudent.className
                  }

                  {" • Section "}

                  {
                    selectedStudent.section
                  }

                </span>

              </div>

            </div>

            {/* FORM */}

            <div className="sm-resolve-form">

              <label
                htmlFor="management-resolution"
              >

                Resolution Details

                <span>
                  *
                </span>

              </label>

              <textarea
                id="management-resolution"
                value={
                  resolutionNote
                }
                onChange={(event) => {

                  setResolutionNote(
                    event.target.value
                  );

                  if (resolveError) {
                    setResolveError("");
                  }

                }}
                placeholder="Example: Student issue was discussed with the management team. The required support was provided, the concern was addressed, and the student confirmed that the issue was resolved."
                rows={7}
                maxLength={2000}
                disabled={
                  resolving
                }
                autoFocus
                aria-describedby="resolution-help resolution-error"
              />

              <div
                className="sm-resolve-text-info"
                id="resolution-help"
              >

                <span>
                  Explain the action taken and
                  the final outcome.
                </span>

                <strong>
                  {
                    resolutionNote.length
                  }
                  /2000
                </strong>

              </div>

              {resolveError && (

                <div
                  className="sm-resolve-error"
                  id="resolution-error"
                  role="alert"
                >

                  <AlertCircle
                    size={16}
                  />

                  <span>
                    {
                      resolveError
                    }
                  </span>

                </div>

              )}

            </div>

            {/* WARNING */}

            <div className="sm-resolve-warning">

              <CheckCircle2
                size={18}
              />

              <div>

                <strong>
                  Confirm Resolution
                </strong>

                <p>
                  Once submitted, this case will
                  be marked as{" "}
                  <b>Resolved</b>.
                  The resolution details will be
                  stored and can be displayed in
                  the Staff Dashboard.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="sm-resolve-footer">

              <button
                type="button"
                className="sm-secondary-btn"
                onClick={
                  closeResolveModal
                }
                disabled={
                  resolving
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="sm-resolve-confirm-btn"
                onClick={
                  handleResolveCase
                }
                disabled={
                  resolving
                }
              >

                {resolving ? (

                  <>

                    <span className="sm-button-spinner" />

                    Resolving...

                  </>

                ) : (

                  <>

                    <CheckCircle2
                      size={17}
                    />

                    Confirm & Resolve

                  </>

                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}