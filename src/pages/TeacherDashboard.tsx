import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LogOut,
  MessageSquareWarning,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./TeacherDashboard.css";

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  "https://exammaster-backend-up1y.onrender.com";

// ============================================================
// TYPES
// ============================================================

interface Student {
  studentId: string;
  name: string;
  className: string;
  totalExams: number;
  average: number;
  highestMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  pass: number;
  fail: number;
}

interface Staff {
  _id: string;
  name: string;
  mobile: string;
  role: string;
  department?: string;
  section?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [students, setStudents] =
    useState<Student[]>([]);

  const [pendingStaff, setPendingStaff] =
    useState<Staff[]>([]);

  // IMPORTANT:
  // Dashboard should NOT wait for API before rendering.
  const [studentsLoading, setStudentsLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [approvingId, setApprovingId] =
    useState<string | null>(null);

  const [rejectingId, setRejectingId] =
    useState<string | null>(null);

  // ==========================================================
  // SESSION DATA
  // ==========================================================

  const teacher = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("teacher") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const staff = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("staff") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const staffToken =
    localStorage.getItem("staffToken") ||
    localStorage.getItem("teacherToken");

  // ==========================================================
  // DISPLAY DATA
  // ==========================================================

  const displayName =
    teacher?.name ||
    staff?.name ||
    "Management";

  const displayRole =
    staff?.role ||
    teacher?.role ||
    "Management";

  // ==========================================================
  // CHECK SESSION
  // ==========================================================

  const handleUnauthorized = (
    data: any
  ) => {
    if (
      data?.code === "SESSION_REVOKED" ||
      data?.code === "UNAUTHORIZED" ||
      data?.code === "TOKEN_EXPIRED"
    ) {
      localStorage.removeItem(
        "staffToken"
      );

      localStorage.removeItem(
        "teacherToken"
      );

      localStorage.removeItem(
        "staff"
      );

      localStorage.removeItem(
        "teacher"
      );

      navigate(
        "/management/login?session=expired",
        {
          replace: true,
        }
      );

      return true;
    }

    return false;
  };

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {
    if (!staffToken) {
      navigate("/management/login", {
        replace: true,
      });

      return;
    }

    // Student API starts immediately,
    // but does NOT block dashboard rendering.
    fetchStudents();

    // Pending staff is required only for HEAD.
    if (staff.role === "head") {
      loadPendingStaff();
    }
  }, []);

  // ==========================================================
  // STUDENTS
  // ==========================================================

  const fetchStudents = async () => {
    try {
      if (!staffToken) {
        navigate("/management/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/teacher/students`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${staffToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      // ======================================================
      // SESSION EXPIRED
      // ======================================================

      if (response.status === 401) {
        handleUnauthorized(data);
        return;
      }

      // ======================================================
      // FORBIDDEN
      // ======================================================

      if (response.status === 403) {
        console.error(
          "You do not have permission to access students."
        );

        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response.ok && data?.success) {
        setStudents(
          Array.isArray(data.students)
            ? data.students
            : []
        );
      }
    } catch (error) {
      console.error(
        "Fetch students error:",
        error
      );
    } finally {
      // IMPORTANT:
      // Only student section loading ends here.
      // Whole dashboard is NOT blocked.
      setStudentsLoading(false);
    }
  };

  // ==========================================================
  // PENDING STAFF
  // ==========================================================

  const loadPendingStaff = async () => {
    try {
      if (
        !staffToken ||
        staff.role !== "head"
      ) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/head/pending-staff`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${staffToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      // ======================================================
      // SESSION EXPIRED
      // ======================================================

      if (response.status === 401) {
        handleUnauthorized(data);
        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response.ok && data?.success) {
        setPendingStaff(
          Array.isArray(data.staff)
            ? data.staff
            : []
        );
      }
    } catch (error) {
      console.error(
        "Load pending staff error:",
        error
      );
    }
  };

  // ==========================================================
  // APPROVE STAFF
  // ==========================================================

  const approveStaff = async (
    id: string
  ) => {
    try {
      if (!staffToken) {
        navigate("/management/login", {
          replace: true,
        });

        return;
      }

      setApprovingId(id);

      const response = await fetch(
        `${API_BASE_URL}/api/head/approve/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${staffToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      // ======================================================
      // SESSION EXPIRED
      // ======================================================

      if (response.status === 401) {
        handleUnauthorized(data);
        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response.ok && data?.success) {
        await loadPendingStaff();
      } else {
        alert(
          data?.message ||
            "Unable to approve staff"
        );
      }
    } catch (error) {
      console.error(
        "Approve staff error:",
        error
      );

      alert(
        "Something went wrong while approving staff."
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ==========================================================
  // REJECT STAFF
  // ==========================================================

  const rejectStaff = async (
    id: string
  ) => {
    try {
      if (!staffToken) {
        navigate("/management/login", {
          replace: true,
        });

        return;
      }

      setRejectingId(id);

      const response = await fetch(
        `${API_BASE_URL}/api/head/reject/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${staffToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      // ======================================================
      // SESSION EXPIRED
      // ======================================================

      if (response.status === 401) {
        handleUnauthorized(data);
        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response.ok && data?.success) {
        await loadPendingStaff();
      } else {
        alert(
          data?.message ||
            "Unable to reject staff"
        );
      }
    } catch (error) {
      console.error(
        "Reject staff error:",
        error
      );

      alert(
        "Something went wrong while rejecting staff."
      );
    } finally {
      setRejectingId(null);
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return students;
      }

      return students.filter(
        (student) => {
          const searchable = [
            student.name,
            student.studentId,
            student.className,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            keyword
          );
        }
      );
    }, [students, search]);

  // ==========================================================
  // DASHBOARD STATS
  // ==========================================================

  const totalStudents =
    students.length;

  const totalExams =
    useMemo(() => {
      return students.reduce(
        (sum, student) =>
          sum +
          Number(
            student.totalExams || 0
          ),
        0
      );
    }, [students]);

  const averagePerformance =
    useMemo(() => {
      if (!students.length) {
        return 0;
      }

      const total =
        students.reduce(
          (sum, student) =>
            sum +
            Number(
              student.average || 0
            ),
          0
        );

      return total / students.length;
    }, [students]);

  const topScore =
    useMemo(() => {
      if (!students.length) {
        return 0;
      }

      return Math.max(
        ...students.map(
          (student) =>
            Number(
              student.highestMarks ||
                0
            )
        )
      );
    }, [students]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem(
      "staffToken"
    );

    localStorage.removeItem(
      "teacherToken"
    );

    localStorage.removeItem(
      "staff"
    );

    localStorage.removeItem(
      "teacher"
    );

    navigate(
      "/management/login",
      {
        replace: true,
      }
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="teacher-container">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <header className="teacher-header">

        <div className="teacher-header-left">

          <div className="teacher-profile-icon">
            <ShieldCheck
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <div className="teacher-header-content">

            <div className="teacher-overline">
              <span className="teacher-overline-dot" />

              STG COLLEGE

              <span className="teacher-overline-divider">
                /
              </span>

              MENTOR ACTION HUB
            </div>

            <h1>
              Welcome{" "}
              <span>
                {displayName}
              </span>
            </h1>

            <div className="teacher-role">

              <UserRound
                size={12}
              />

              <span>
                Role
              </span>

              <strong>
                {displayRole}
              </strong>

            </div>

          </div>

        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={logout}
          aria-label="Logout from management dashboard"
        >
          <LogOut size={15} />

          <span>
            Logout
          </span>
        </button>

      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main>

        {/* ===================================================
            DASHBOARD STATS
        =================================================== */}

        <section className="teacher-stat-grid">

          {/* TOTAL STUDENTS */}

          <div className="teacher-stat-card">

            <div className="teacher-stat-icon">
              <Users size={18} />
            </div>

            <div>

              <span>
                TOTAL STUDENTS
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : totalStudents}
              </strong>

              <small>
                Students under management
              </small>

            </div>

          </div>

          {/* TOTAL EXAMS */}

          <div className="teacher-stat-card">

            <div className="teacher-stat-icon">
              <ClipboardCheck size={18} />
            </div>

            <div>

              <span>
                TOTAL EXAMS
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : totalExams}
              </strong>

              <small>
                Completed examination attempts
              </small>

            </div>

          </div>

          {/* AVERAGE PERFORMANCE */}

          <div className="teacher-stat-card">

            <div className="teacher-stat-icon">
              <BarChart3 size={18} />
            </div>

            <div>

              <span>
                AVERAGE PERFORMANCE
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : `${averagePerformance.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                Overall academic average
              </small>

            </div>

          </div>

          {/* TOP PERFORMANCE */}

          <div className="teacher-stat-card gold-stat-card">

            <div className="teacher-stat-icon">
              <GraduationCap size={18} />
            </div>

            <div>

              <span>
                TOP PERFORMANCE
              </span>

              <strong>
                {studentsLoading
                  ? "—"
                  : topScore}
              </strong>

              <small>
                Highest student score
              </small>

            </div>

          </div>

        </section>

        {/* ===================================================
            ACTION CENTER
        =================================================== */}

        <section className="teacher-action-section">

          <div className="teacher-section-heading">

            <div>

              <span className="teacher-section-kicker">
                MANAGEMENT TOOLS
              </span>

              <h2>
                Action Center
              </h2>

              <p>
                Access the tools you use most from one place.
              </p>

            </div>

          </div>

          <div className="teacher-actions">

            {/* STUDENTS / MENTOR ACTION PLAN */}

            <button
              type="button"
              className="teacher-action-card student-action"
              onClick={() =>
                navigate(
                  "/teacher/students"
                )
              }
            >

              <span className="teacher-action-icon">
                <Users size={22} />
              </span>

              <span className="teacher-action-copy">

                <strong>
                  Mentor Action Plan
                </strong>

                <small>
                  Monitor guidance, follow-ups and student improvement
                </small>

              </span>

              <span className="teacher-action-arrow">
                →
              </span>

            </button>

            {/* COMPLAINTS */}

            <button
              type="button"
              className="teacher-action-card complaint-action"
              onClick={() =>
                navigate(
                  "/teacher/complaints"
                )
              }
            >

              <span className="teacher-action-icon">
                <MessageSquareWarning
                  size={22}
                />
              </span>

              <span className="teacher-action-copy">

                <strong>
                  Student Complaints & Needs
                </strong>

                <small>
                  Review concerns, requests and support needs
                </small>

              </span>

              <span className="teacher-action-arrow">
                →
              </span>

            </button>

            {/* RESULTS */}

            <button
              type="button"
              className="teacher-action-card result-action"
              onClick={() =>
                navigate(
                  "/teacher/results"
                )
              }
            >

              <span className="teacher-action-icon">
                <BarChart3 size={22} />
              </span>

              <span className="teacher-action-copy">

                <strong>
                  Results
                </strong>

                <small>
                  Analyze student performance and examination results
                </small>

              </span>

              <span className="teacher-action-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* ===================================================
            STAFF APPROVAL — HEAD ONLY
        =================================================== */}

        {staff.role === "head" && (
          <section className="head-card">

            <div className="head-card-header">

              <div>

                <span className="teacher-section-kicker">
                  ADMINISTRATION
                </span>

                <h2>
                  Staff Approval
                </h2>

                <p>
                  Review new staff registration requests.
                </p>

              </div>

              <div className="pending-count">
                {pendingStaff.length}
              </div>

            </div>

            {/* =================================================
                NO PENDING STAFF
            ================================================= */}

            {pendingStaff.length === 0 ? (

              <div className="staff-empty-state">

                <div className="staff-empty-icon">
                  <CheckCircle2
                    size={22}
                  />
                </div>

                <div>

                  <strong>
                    All caught up
                  </strong>

                  <span>
                    No pending staff requests.
                  </span>

                </div>

              </div>

            ) : (

              <div className="staff-request-grid">

                {pendingStaff.map(
                  (item) => (

                    <div
                      key={item._id}
                      className="staff-request"
                    >

                      <div className="staff-request-top">

                        <div className="staff-request-avatar">
                          <UserRound
                            size={18}
                          />
                        </div>

                        <div>

                          <h3>
                            {item.name}
                          </h3>

                          <span>
                            {item.role}
                          </span>

                        </div>

                      </div>

                      <div className="staff-request-details">

                        <p>
                          <span>
                            Mobile
                          </span>

                          <strong>
                            {item.mobile}
                          </strong>
                        </p>

                        <p>
                          <span>
                            Department
                          </span>

                          <strong>
                            {item.department ||
                              "N/A"}
                          </strong>
                        </p>

                        <p>
                          <span>
                            Section
                          </span>

                          <strong>
                            {item.section ||
                              "N/A"}
                          </strong>
                        </p>

                      </div>

                      <div className="staff-request-actions">

                        {/* ACCEPT */}

                        <button
                          type="button"
                          className="staff-approve-btn"
                          disabled={
                            approvingId ===
                              item._id ||
                            rejectingId ===
                              item._id
                          }
                          onClick={() =>
                            approveStaff(
                              item._id
                            )
                          }
                        >

                          {approvingId ===
                          item._id ? (

                            <RefreshCw
                              size={13}
                              className="teacher-loading-spin"
                            />

                          ) : (

                            <Check
                              size={14}
                            />

                          )}

                          <span>
                            Accept
                          </span>

                        </button>

                        {/* REJECT */}

                        <button
                          type="button"
                          className="staff-reject-btn"
                          disabled={
                            approvingId ===
                              item._id ||
                            rejectingId ===
                              item._id
                          }
                          onClick={() =>
                            rejectStaff(
                              item._id
                            )
                          }
                        >

                          {rejectingId ===
                          item._id ? (

                            <RefreshCw
                              size={13}
                              className="teacher-loading-spin"
                            />

                          ) : (

                            <X
                              size={14}
                            />

                          )}

                          <span>
                            Reject
                          </span>

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>
        )}

        {/* ===================================================
            STUDENT SEARCH
        =================================================== */}

        <section className="student-section">

          <div className="student-section-heading">

            <div>

              <span className="teacher-section-kicker">
                STUDENT DIRECTORY
              </span>

              <h2>
                Student Performance
              </h2>

              <p>
                Search and review students assigned to your management view.
              </p>

            </div>

            <span className="student-count-badge">

              {studentsLoading
                ? "Loading..."
                : `${filteredStudents.length} students`}

            </span>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="search-box">

            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Search student name, ID or class..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              aria-label="Search students by name, ID or class"
            />

            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

          </div>

          {/* =================================================
              STUDENTS CONTENT
          ================================================= */}

          {studentsLoading ? (

            <div className="student-empty">

              <div className="student-empty-icon">
                <RefreshCw
                  size={22}
                  className="teacher-loading-spin"
                />
              </div>

              <h3>
                Loading Students
              </h3>

              <p>
                Student performance data is being loaded...
              </p>

            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="student-empty">

              <div className="student-empty-icon">
                <Users size={22} />
              </div>

              <h3>
                No Students Found
              </h3>

              <p>
                No students match your current search.
              </p>

            </div>

          ) : (

            <div className="student-grid">

              {filteredStudents.map(
                (student) => (

                  <article
                    className="student-card"
                    key={
                      student.studentId
                    }
                  >

                    {/* =======================================
                        CARD HEADER
                    ======================================= */}

                    <div className="student-card-header">

                      <div className="student-avatar">

                        <UserRound
                          size={18}
                        />

                      </div>

                      <div className="student-card-identity">

                        <h3>
                          {student.name}
                        </h3>

                        <span>
                          {student.studentId}
                        </span>

                      </div>

                    </div>

                    {/* =======================================
                        CLASS
                    ======================================= */}

                    <div className="student-class-pill">

                      <GraduationCap
                        size={13}
                      />

                      <span>
                        {student.className}
                      </span>

                    </div>

                    {/* =======================================
                        PERFORMANCE
                    ======================================= */}

                    <div className="performance">

                      {/* EXAMS */}

                      <div className="performance-item">

                        <span>
                          Exams
                        </span>

                        <strong>
                          {
                            student.totalExams
                          }
                        </strong>

                      </div>

                      {/* AVERAGE */}

                      <div className="performance-item">

                        <span>
                          Average
                        </span>

                        <strong>
                          {
                            student.average
                          }%
                        </strong>

                      </div>

                      {/* HIGHEST */}

                      <div className="performance-item">

                        <span>
                          Highest
                        </span>

                        <strong>
                          {
                            student.highestMarks
                          }
                        </strong>

                      </div>

                      {/* PASS */}

                      <div className="performance-item">

                        <span>
                          Pass
                        </span>

                        <strong className="performance-pass">
                          {
                            student.pass
                          }
                        </strong>

                      </div>

                      {/* FAIL */}

                      <div className="performance-item">

                        <span>
                          Fail
                        </span>

                        <strong className="performance-fail">
                          {
                            student.fail
                          }
                        </strong>

                      </div>

                      {/* CORRECT */}

                      <div className="performance-item">

                        <span>
                          Correct
                        </span>

                        <strong className="performance-correct">
                          {
                            student.correctAnswers
                          }
                        </strong>

                      </div>

                      {/* WRONG */}

                      <div className="performance-item">

                        <span>
                          Wrong
                        </span>

                        <strong className="performance-wrong">
                          {
                            student.wrongAnswers
                          }
                        </strong>

                      </div>

                    </div>

                    {/* =======================================
                        FOOTER
                    ======================================= */}

                    <div className="student-card-footer">

                      <span>
                        Academic Performance
                      </span>

                      <div className="student-progress">

                        <span
                          style={{
                            width:
                              `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    student.average ||
                                      0
                                  )
                                )
                              )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}